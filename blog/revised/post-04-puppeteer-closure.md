# Puppeteer에서 요청과 응답을 함께 기다릴 때 놓쳤던 것

Electron 크롤러에서 파일 하나를 받으려면 두 군데를 엿봐야 했어요. request에서는 다음 API 호출에 쓸 header가, response에서는 파일 비밀번호가 나왔거든요. 둘 중 하나라도 없으면 다음 단계로 갈 수 없었어요.

처음에는 외부 변수에 값을 넣고 1초마다 확인했어요.

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

외부 변수와 polling으로 만든 첫 버전은 당장은 동작했어요. 그런데 다시 실행할수록 이상해졌어요.

- 함수를 다시 호출할 때마다 listener가 쌓였어요.
- 원하는 이벤트가 오지 않으면 영원히 기다렸어요.
- `if (result)`로 검사하니 `0`, `false`, 빈 문자열처럼 유효한 값이 와도 끝나지 않았어요.
- request와 response callback이 같은 변수를 덮어쓸 수 있었어요.
- listener를 등록하기 전에 reload하면 빠른 이벤트를 놓칠 수 있었어요.

저는 이 문제를 closure 사용 사례로 봤어요. 그런데 실제로 고쳐야 했던 건 값을 어디에 저장하느냐보다 listener가 언제 사라지느냐였어요.

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

이 함수는 처음으로 유효한 결과를 돌려준 callback에서 끝나요. 완료든 실패든 timeout이든, 어느 경로로 끝나도 listener를 지워요.

## 클로저 안에서 두 결과 합치기

request와 response가 정보를 절반씩만 줄 때는 작은 collector를 만들었어요.

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

closure는 `headers`와 `filePassword`를 한 번의 수집 작업 안에 가둬요. 바깥에서 두 값을 직접 고칠 수 없고, 두 값이 모두 모였을 때만 완성된 객체를 내보내요.

그래도 이 코드를 다시 설명한다면 클로저보다 이벤트 수명부터 이야기할 것 같아요. 리스너는 새로고침 전에 등록하고, 성공, 실패, 시간 초과 중 어느 경로로 끝나도 같은 정리 함수를 거치게 해야 했어요. 값을 어디에 두느냐보다 작업이 끝난 뒤에도 리스너가 남는 쪽이 더 위험했거든요.
