# Puppeteer에서 요청과 응답을 함께 기다릴 때 놓쳤던 것

Electron 크롤러에서 파일 하나를 받으려면 두 군데를 엿봐야 했다. request에서는 다음 API 호출에 쓸 header가, response에서는 파일 비밀번호가 나왔다. 둘 중 하나라도 없으면 다음 단계로 갈 수 없었다.

처음에는 외부 변수에 값을 넣고 1초마다 확인했다.

```ts
let result: PreInfo | undefined;

await page.reload();

page.on('request', (request) => {
  result = readRequest(request);
});

while (true) {
  if (result) break;
  await delay(1_000);
}
```

첫 버전은 외부 변수와 polling이었다. 당장은 동작했지만 다시 실행할수록 이상해졌다.

- 함수를 다시 호출할 때마다 listener가 누적됐다.
- 원하는 이벤트가 오지 않으면 영원히 기다렸다.
- `if (result)`로 검사하면 `0`, `false`, 빈 문자열처럼 유효한 값도 완료로 처리하지 못했다.
- request와 response callback이 같은 변수를 덮어쓸 수 있었다.
- listener를 등록하기 전에 reload하면 빠른 이벤트를 놓칠 수 있었다.

처음에는 이 문제를 closure 사용 사례라고 생각했다. 실제로 고쳐야 했던 것은 값의 저장 방식보다 listener의 수명이었다.

## 두 이벤트를 같은 방식으로 기다리기

```ts
import type { HTTPRequest, HTTPResponse, Page } from 'puppeteer';

type MaybePromise<T> = T | Promise<T>;

interface WaitForPreInfoOptions<T> {
  page: Page;
  timeoutMs?: number;
  onRequest?: (request: HTTPRequest) => MaybePromise<T | undefined>;
  onResponse?: (response: HTTPResponse) => MaybePromise<T | undefined>;
}

export function waitForPreInfo<T>({
  page,
  timeoutMs = 10_000,
  onRequest,
  onResponse,
}: WaitForPreInfoOptions<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      page.off('request', handleRequest);
      page.off('response', handleResponse);
    };

    const finish = (value: T) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const consume = async (produce: () => MaybePromise<T | undefined>) => {
      try {
        const value = await produce();
        if (value !== undefined) finish(value);
      } catch (error) {
        fail(error);
      }
    };

    const handleRequest = (request: HTTPRequest) => {
      if (onRequest) void consume(() => onRequest(request));
    };

    const handleResponse = (response: HTTPResponse) => {
      if (onResponse) void consume(() => onResponse(response));
    };

    page.on('request', handleRequest);
    page.on('response', handleResponse);

    timer = setTimeout(() => {
      fail(new Error(`필요한 네트워크 정보를 ${timeoutMs}ms 안에 찾지 못했습니다.`));
    }, timeoutMs);

    void page.reload({ waitUntil: 'networkidle2' }).catch(fail);
  });
}
```

이 함수는 처음으로 유효한 결과를 반환한 callback에서 완료된다. 완료, 실패, timeout 어느 경로에서도 listener를 제거한다.

## 클로저 안에서 두 결과 합치기

request와 response가 각각 절반의 정보만 주는 경우에는 작은 collector를 만든다.

```ts
interface SitePreInfo {
  headers: Record<string, string>;
  filePassword: string;
}

function createSitePreInfoCollector() {
  let headers: Record<string, string> | undefined;
  let filePassword: string | undefined;

  const getResult = (): SitePreInfo | undefined => {
    if (headers === undefined || filePassword === undefined) return undefined;
    return { headers, filePassword };
  };

  return {
    onRequest(request: HTTPRequest) {
      if (!request.url().includes('/target-api')) return undefined;
      headers = request.headers();
      return getResult();
    },

    async onResponse(response: HTTPResponse) {
      if (!response.url().includes('/file-info')) return undefined;
      const body = (await response.json()) as { password?: string };
      filePassword = body.password;
      return getResult();
    },
  };
}

const collector = createSitePreInfoCollector();
const preInfo = await waitForPreInfo({
  page,
  onRequest: collector.onRequest,
  onResponse: collector.onResponse,
});
```

closure는 `headers`와 `filePassword`를 외부에서 직접 수정하지 못하게 가두고, 두 값이 모두 모였을 때만 완성된 객체를 내보낸다.

클로저는 `headers`와 `filePassword`를 한 번의 수집 작업 안에 가두는 데 유용했다. 그래도 이 코드를 다시 설명한다면 클로저보다 이벤트 수명부터 이야기할 것 같다. 리스너를 새로고침 전에 등록하고, 성공·실패·시간 초과 중 어느 경로로 끝나도 같은 정리 함수를 거치게 해야 했다. 실제로 더 위험했던 것은 값의 저장 위치보다 작업이 끝난 뒤에도 리스너가 남는 경우였다.
