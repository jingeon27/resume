# Puppeteer에서 요청과 응답을 함께 기다릴 때 놓쳤던 것

<div class="note note-summary">
  <strong>요약</strong>
  <p>파일을 받는 데 필요한 요청 헤더와 응답 값을 함께 기다렸어요. 값을 모으는 방법에 더해 리스너 등록 순서, 시간 초과, 작업이 끝났을 때의 정리까지 다룬 이야기예요.</p>
</div>

Electron 수집 앱에서 파일을 받으려면 요청과 응답을 모두 확인해야 했어요. 요청 헤더에는 다음 API 호출에 필요한 값이, 응답에는 파일 비밀번호가 있었거든요. 두 값이 모두 있어야 다음 단계로 갈 수 있었어요.

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

처음에는 클로저 안에 값을 모으면 해결될 거라고 봤어요. 코드를 살펴보니 작업이 끝난 뒤에도 남는 리스너와 끝없이 기다리는 경로부터 정리해야 했어요.

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

<div class="note note-decision">
  <strong>리스너를 정리하는 기준</strong>
  <p>리스너는 새로고침 전에 등록하고, 성공과 실패, 시간 초과가 모두 같은 정리 함수를 거치게 했어요. 두 값은 한 수집 작업의 클로저 안에서만 유지해요.</p>
</div>

## 참고

- [Node.js: EventEmitter](https://nodejs.org/api/events.html#class-eventemitter)
- [Puppeteer: Page](https://pptr.dev/api/puppeteer.page)
