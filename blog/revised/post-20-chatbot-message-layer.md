# 서로 다른 두 SSE를 하나의 상담 화면에 연결한 과정

<div class="note note-summary">
  <strong>요약</strong>
  <p>AI 답변과 상담사 메시지가 서로 다른 서버에서 왔어요. 두 연결의 역할과 수명을 나누고, 사용자는 같은 대화 화면에서 상담을 이어가도록 구성했어요.</p>
</div>

복지몰에 AI 상담을 붙일 때 메시지는 두 서버에서 왔어요. AI 답변은 AI 서비스가 토큰 단위 SSE로 보내고, 상담사 메시지와 세션 상태는 별도 상담 서비스가 SSE로 보냈어요. 프론트엔드에서 두 서버를 고칠 수 없었고 합쳐 주는 API도 없었어요.

사용자는 상담을 이어가는데 화면과 연결은 갈라져 있었어요. 어떤 스트림을 화면에 표시하고, 어느 시점에 연결을 열고 닫을지부터 정했어요.

## 두 패널을 하나로 합쳤어요

첫 구현은 AI 대화와 상담사 대화를 다른 패널로 보여 줬어요. 사용자가 버튼을 누르면 상담 패널로 넘어가는 구조였죠. 그런데 상담사 연결은 사용자가 하던 대화의 연장이었어요. 패널을 나누니 메시지 목록과 스크롤 위치, 세션 상태까지 같이 갈라졌어요.

연결 버튼을 없애고, 사용자가 `상담원 연결`을 입력하면 같은 화면에서 상담 상태로 넘어가게 바꿨어요. 현재 상태에 따라 달라지는 건 메시지를 보낼 곳뿐이에요.

```text
AI 대화
  └─ "상담원 연결" 입력
       └─ 연결 중
            ├─ 상담 중
            ├─ 대기
            └─ 종료
```

메시지 목록은 상담 서비스의 SSE 하나만 썼어요. 이 스트림에 AI 답변과 상담사 메시지가 모두 들어왔거든요. AI 서비스의 스트림은 생성을 끝까지 진행시키려고 연결만 유지하고, 화면에는 그리지 않았어요.

```ts
const response = await chatClient.post('/chat/stream', body, {
  adapter: 'fetch',
  responseType: 'stream',
  timeout: 30_000,
});

const reader = (response.data as ReadableStream<Uint8Array>).getReader();

try {
  while (!(await reader.read()).done) {
    // 화면 표시는 상담 서비스의 SSE가 담당한다.
  }
} finally {
  reader.releaseLock();
}
```

응답을 읽기만 하고 쓰지 않는 코드라 처음 보면 필요 없어 보여요. 네트워크에서 두 스트림을 같이 확인해 보니, AI 스트림을 붙잡고 있어야 생성이 끝났고 그 결과는 상담 서비스에 저장된 뒤 다른 SSE로 전달됐어요. 서버 내부는 확인할 수 없어서, 관찰한 동작을 기준으로 연결만 유지했어요.

대신 AI 생성 시간이 브라우저 연결과 30초 제한에 묶여요. 서버를 고칠 수 있었다면 생성 작업과 화면 연결의 수명을 떼어 놓는 편이 나아요.

## 인증 헤더 때문에 EventSource를 바꿨어요

상담 SSE는 `Authorization` 헤더를 요구했어요. 브라우저의 `EventSource`로는 임의 헤더를 보낼 수 없어서 `@microsoft/fetch-event-source`를 썼어요.

```ts
export async function openSessionStream(sessionId: string, init: StreamInit) {
  const accessToken = await getCookie('accessToken');

  return fetchEventSource(
    `${SESSION_API_URL}/chat/sessions/${sessionId}/stream`,
    {
      signal: init.signal,
      openWhenHidden: true,
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
      onmessage: ({ event, data }) => init.onMessage(event, data),
      onerror: init.onError,
    },
  );
}
```

백그라운드 탭에서도 상담 메시지를 받아야 해서 `openWhenHidden`을 켰고, 컴포넌트가 사라질 때는 같은 `AbortSignal`로 연결을 닫았어요.

## 상태 전이와 연결 수명을 나눴어요

상담 상태에는 클라이언트만 아는 `connecting`과 서버가 보내는 상태가 섞여 있었어요. 여러 `useState`와 effect가 제각각 연결을 열고 닫다 보니, 상태는 상담 중인데 SSE는 닫혀 있는 경우가 생길 수 있었고요.

먼저 전이를 `useReducer` 한곳에 모았고, 그다음에는 SSE 연결을 상태에서 파생되는 값으로 바꿨어요.

```text
연결 필요 = 구독자가 있음 && 세션이 있음 && 종료 상태가 아님
```

구독자 수와 SSE 수명은 자체 store가 관리하고, React는 `useSyncExternalStore`로 스냅샷만 읽게 했어요.

```ts
class ChatStore {
  private snapshot = createInitialSnapshot();
  private readonly listeners = new Set<Listener>();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    this.syncConnection();

    return () => {
      this.listeners.delete(listener);
      this.syncConnection();
    };
  };

  getSnapshot = () => this.snapshot;
}
```

네트워크 요청은 React Query가, SSE 구독과 상태 전이는 store가 맡았어요. 여러 effect가 연결을 직접 건드리지 않으니, 다시 마운트돼도 현재 구독 상태에 맞춰 연결을 되살릴 수 있었어요.

## 메시지 모델은 `@tanstack/ai`로 옮겼어요

자체 store로도 당장의 요구사항은 충분했어요. 다만 앞으로 tool call, 카드와 첨부 파일 같은 여러 형태의 메시지를 지원할 예정이었어요. 그래서 자체 `Message` 타입을 계속 늘리기보다 `@tanstack/ai`의 `UIMessage`와 연결 생명주기를 쓰기로 했어요.

상담 서비스의 SSE 형식이 라이브러리가 기대하는 연결 형식과 달라서 어댑터를 만들었어요. 콜백으로 들어오는 SSE 메시지를 큐에 넣고, 비동기 제너레이터가 꺼내 가는 구조예요.

```ts
export function createSessionConnection({
  sessionId,
  onStatus,
}: ConnectionOptions): SubscribeConnectionAdapter {
  return {
    async *subscribe() {
      const queue: StreamChunk[] = [];
      let notify = () => {};
      const controller = new AbortController();

      openSessionStream(sessionId, {
        signal: controller.signal,
        onMessage(event, data) {
          if (event === 'status') {
            const status = parseServerStatus(data);
            if (status) onStatus(status);
          } else {
            queue.push(...toStreamChunks(data));
          }
          notify();
        },
      });

      try {
        while (true) {
          if (queue.length === 0) {
            await new Promise<void>((resolve) => {
              notify = resolve;
            });
          }
          yield* queue.splice(0);
        }
      } finally {
        controller.abort();
      }
    },
    send: async () => {},
  };
}
```

`send`가 빈 함수인 것도 두 서버 구조 때문이에요. 메시지는 현재 상담 상태에 따라 AI 서버나 상담 서버로 보내지만, 화면에 그릴 메시지는 상담 SSE에서 받아요. 라이브러리가 생각하는 일반적인 송수신 모델과는 딱 맞지 않는 구조예요.

비동기로 가져오는 대화 기록은 `useChat`이 마운트될 때 한 번만 읽어요. 빈 상태로 먼저 마운트하면 기록이 반영되지 않아서, 기록 조회가 끝난 뒤에 대화 컴포넌트가 마운트되도록 Suspense 경계를 뒀어요. 실시간 구독을 시작하려면 `live: true`도 적어 줘야 했고요.

서버 상태와 클라이언트 상태는 타입으로 구분했어요.

```ts
type ServerStatus = 'ai' | 'live' | 'hold' | 'done';
type ChatStatus = ServerStatus | 'connecting';
```

SSE의 `onStatus`는 `ServerStatus`만 받아요. 서버 이벤트가 클라이언트 전용 상태인 `connecting`을 만들 수 없게 막은 거예요.

## 메시지 형식을 늘릴 때 확인할 부분

지금 렌더러는 `UIMessage.parts`를 다시 텍스트 한 줄로 바꿔 써요. 카드나 도구 호출을 지원하려면 렌더러가 parts를 직접 나눠 그려야 해요. 대화 기록과 SSE가 같은 메시지 ID를 보낼 때 중복이 걸러지는지도 재전송 시나리오로 확인해야 하고요.

비동기 제너레이터가 메시지를 기다리는 사이에 구독이 해제되면 `finally` 실행이 늦어질 수도 있어요. 대기 중인 Promise와 abort 신호를 같이 처리하도록 보강하는 일도 남아 있어요.

화면은 같은 메시지 모델을 읽고, 서버마다 다른 송수신 방식은 어댑터에서 다뤄요. 서버 계약이 바뀌면 연결 코드와 어댑터부터 확인할 수 있도록 나눴어요.
