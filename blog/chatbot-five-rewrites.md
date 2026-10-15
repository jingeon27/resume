# 못 건드리는 두 외부 백엔드 위에 챗봇 얹기: 메시지 레이어를 다섯 번 갈아엎은 기록

우리 서비스(쇼핑몰)에 AI 상담 챗봇을 붙이는 일을 했다. 그런데 챗봇이 쓰는 백엔드는 우리 프론트 팀이 만들지도 고치지도 못하는 영역이었다. 우리는 그 위에 화면만 얹는 역할이었다.

게다가 그 백엔드가 둘이었다.

- AI 챗 서비스: 질문을 보내면 AI 답을 토큰 단위로 스트리밍(SSE)해 주는 백엔드.
- 세션 백엔드: 상담사 연결, 세션 관리, 대화 히스토리를 맡는 또 다른 백엔드. 상담사 메시지와 상태 변화를 SSE로 내려 준다.

둘은 서로 다른 서비스였고, 둘 다 우리가 고칠 수 없었다. 보통은 백엔드에 "두 채널을 합쳐서 한 번에 내려 달라"고 부탁하면 된다. 그런데 합쳐 줄 주체가 없었다. 둘 다 우리 영역이 아니었고, 별개 서비스라 어느 한쪽에 상대 응답까지 병합해 달라고 맡길 수도 없었다.

그러니 "쇼핑몰에 AI 상담 챗봇 붙이기"는 서로 다른 두 외부 백엔드의 스트리밍을 클라이언트에서 하나의 대화 타임라인으로 봉합하는 문제였다. 이 글은 그 봉합을 다섯 번 갈아엎은 기록이다.

> 순수 AI 토큰 스트리밍 → 상담사 버튼 패널 분리 → 키워드 통합 → useReducer 상태머신 → useSyncExternalStore 자체 store → @tanstack/ai 어댑터

---

## 시작은 평범한 AI 챗봇이었다

```text
src/modules/entities/chat/chatbot/
├─ api/chatbot.api.ts        # AI 챗 서비스 /chat/stream 호출 + SSE 파싱
├─ model/use-chat-stream.hook.ts
├─ model/use-chat-session.hook.ts
└─ ui/ (MessageBubble, TypingIndicator, MarkdownContent ...)
```

처음 요구사항은 단순했다. AI 챗 서비스에 질문을 던지고 응답을 받아 보여 주면 됐다. 이 API도 우리가 설계하거나 고칠 수 있는 게 아니었다. `POST /chat/stream`이 답을 SSE로 흘려 줬고, 우리는 그걸 직접 파싱해 토큰을 화면에 실시간으로 이어 붙였다.

```ts
// 초기 — AI 응답 스트림을 직접 파싱해 화면에 흘림
async function* parseSSEStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith('data: ')) yield JSON.parse(t.slice(6)) as StreamData;
    }
  }
}

// 토큰이 올 때마다 메시지 text 에 이어붙임 (= 진짜 스트리밍 UI)
onData: (data) =>
  setMessages((prev) => updateMessage(prev, botMessageId, { text: current.text + data.content })),
```

이 시절 코드는 정직했다. 스트리밍 라이브러리 없이 `useState<Message[]>`와 `useMutation`이면 충분했고, 받은 토큰을 그대로 보여 줬다. 나중에 이 부분이 뒤집힌다.

서버 히스토리가 내려 주던 안내 문구에는 이미 이런 줄이 있었다.

> "무엇을 도와드릴까요? 상담사와 연결하려면 '상담원 연결'을 입력해 주세요."

문제의 씨앗은 저 "상담원 연결"이었다.

---

## 두 번째 채널의 등장: 상담사는 '버튼'으로 연결됐다

AI가 못 풀면 사람 상담사에게 넘겨야 했다. 그런데 상담사 응답은 AI 챗 서비스와 전혀 다른 세션 백엔드의 세션 SSE에서 왔다. `start` / `subscribe` / `message` / `end`로 세션을 열고 상담사 메시지와 상태 변화를 구독하는 방식이다.

앞에서 말했듯 둘을 합쳐 주는 엔드포인트는 없었다. 클라이언트가 두 외부 백엔드를 각각 직접 호출해야 했다.

첫 구현은 두 백엔드를 그대로 UI로 옮긴 모양이었다. `AiChatPanel`(AI 스트림)과 `CounselingPanel`(세션 SSE)을 나누고 "상담사 연결" 버튼으로 모드를 바꿨다.

```ts
// 상담사 연결이 '버튼'이던 시절 — EventSource 로 세션 SSE 구독
const subscribeSse = useCallback((sid: string) => {
  const es = fetchCounselingSubscribe(sid);
  es.addEventListener('status', (e) => {
    const { status } = safeParse(e.data);
    if (status === 'counseling') append(createSystemMessage(GUIDE.accepted));
    if (status === 'ended') append(createSystemMessage(GUIDE.ended));
  });
  es.addEventListener('message', (e) => {
    const { message } = safeParse(e.data);
    if (message?.trim()) append(createCounselorMessage(message));
  });
}, []);
```

여기서부터 금이 가기 시작했다. AI와 대화하다 상담사로 넘어가는 건 같은 타임라인이 이어지는 일이다. 그런데 패널을 둘로 쪼개 놓으니 전환 시점에 메시지 목록, 스크롤, 세션이 두 컴포넌트로 갈라졌다. 메시지 생성 함수도 채널마다 따로 놀았다(`createUserMessage`, `createCounselorMessage`, `createSystemMessage`). 같은 메시지인데 출처마다 타입이 달랐다.

---

## 버튼 대신 키워드, 패널은 하나로

두 가지를 함께 정리했다. 먼저 연결 버튼을 없애고 "상담원 연결" 키워드로 바꿨다. UI에서 '모드 버튼'이라는 상태가 사라졌다. 그리고 패널을 합쳤다. 최상위 ai/counseling 분기를 지우고 패널 하나, 훅 하나로 정리했다. 전송은 상태(status)를 보고 길만 정한다. 상담 연결 중이거나 진행 중이면 세션 백엔드로, 그 밖에는 AI 챗 서비스로 보낸다.

UI는 하나가 됐다. 대신 표시 채널 문제와 상태 문제라는 두 가지 골칫거리가 따라왔다.

### 여기서 drain-only가 태어난다

통합하면서 가장 큰 결정을 내렸다. **화면에 표시하는 채널을 세션 백엔드의 SSE 하나로 모으기로 했다.** AI 답과 상담사 답이 한 타임라인에 섞여야 하는데, 두 출처를 다 실어 나르는 곳이 세션 SSE뿐이었다. AI 챗 서비스 스트림은 AI 답만 주고, 세션 SSE는 AI와 상담사 답을 모두 내려 줬다.

합칠 방법이 문제였다. 두 백엔드 어느 쪽에도 병합을 맡길 수 없으니 합칠 곳은 클라이언트밖에 없었다.

그 결과 AI 챗 서비스 스트림은 표시 역할을 잃었다. 한때 토큰을 화면에 흘리던 스트림이, 이제는 생성을 끝까지 진행시키려고 연결만 유지하고 내용은 버리는 펌프(drain-only)가 됐다.

```ts
// 한때 화면에 흘리던 AI 스트림이 → drain-only(읽고 버림) 로 강등됨
const response = await chatClient.post('/chat/stream', body, {
  adapter: 'fetch',
  responseType: 'stream',
  timeout: 30_000, // 30s 상한 — 생성이 오래 걸릴 수 있어 넉넉히
});
const reader = (response.data as ReadableStream<Uint8Array>).getReader();
try {
  while (!(await reader.read()).done) {
    // 읽기만 하고 버린다. 표시는 세션 SSE 가 담당.
  }
} finally {
  reader.releaseLock();
}
```

처음 보는 사람은 버그라고 생각할 것이다. 스트리밍 응답을 받아 놓고 쓰지 않고 버리니까. 두 백엔드 모두 우리가 건드릴 수 없다는 현실에서 나온 선택이다. 두 백엔드 내부를 볼 수 없어 확증하지는 못했지만, 정황상 클라이언트가 AI 스트림을 (최대 30초) 잡고 있어야 서버 쪽 생성이 끝까지 진행되고, 그 결과가 세션 백엔드에 쌓여 세션 SSE로 다시 흘러나오는 구조로 보였다. 우리가 바꿀 수 있는 건 클라이언트뿐이었고, 그 제약 아래서는 "연결은 유지하되 표시는 안 한다"가 가장 덜 나쁜 봉합이었다.

이 펌프에는 약점이 있다. 생성 수명이 브라우저 연결과 30초 타임아웃에 묶인다. 백엔드를 볼 수 있게 되거나 부하 시나리오를 돌려 봐야 확인할 수 있는 부분이다.

---

## EventSource를 버린 이유: 인증 헤더

표시를 세션 SSE로 모으자 인증 문제가 터졌다. 세션 SSE 엔드포인트는 `Authorization: Bearer`를 요구하는데, 브라우저 표준 `EventSource`는 커스텀 헤더를 보내지 못한다. 그래서 `@microsoft/fetch-event-source`로 갈아탔다. fetch 기반이라 Bearer를 붙일 수 있고, 재연결 정책과 백그라운드 탭 유지(`openWhenHidden`)도 들어 있다.

```ts
export async function openSessionStream(sessionId, init) {
  const accessToken = await getCookie('accessToken');
  return fetchEventSource(`${SESSION_API_URL}/chat/sessions/${sessionId}/stream`, {
    signal: init.signal,
    openWhenHidden: true, // 백그라운드 탭에서도 상담 메시지 유지
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    onmessage: (e) => init.onMessage(e.event, e.data),
    onerror: init.onError, // 지연(ms) 반환 시 재연결, throw 시 중단
  });
}
```

작은 변경 같지만, 남이 설계한 API를 가져다 쓰다 보면 브라우저 표준 API가 그 API의 인증 방식과 맞지 않는 일을 자주 만난다.

---

## 상태가 흩어진다: useReducer 상태머신

통합 패널의 status는 단순한 플래그가 아니었다. 세션 백엔드의 흐름이 그대로 상태 전이로 박혀 있었다.

```text
ai ──"상담원 연결"→ connecting ──(SSE: live)→ live ──(SSE: done)→ done
                                       └─(SSE: hold)→ hold
```

- `ai` : AI가 응답하는 상태 (클라 기본값)
- `connecting` : AI 종료 호출 후 상담사 수락을 기다리는, 클라이언트만 아는 상태
- `live`/`hold`/`done` : 세션 SSE가 권위를 갖는 서버 상태

클라이언트가 만든 상태와 서버가 내려 주는 상태가 한 변수에 섞여 있었던 셈이다. `useState` 몇 개로는 "connecting인데 SSE가 갑자기 done을 보냈을 때" 같은 경계에서 정합성이 깨졌다. 그래서 전이를 useReducer 상태머신 한곳에 모았다. 한 변수에 두 출처의 상태가 섞이는 문제 자체는 마지막에 @tanstack/ai로 옮기면서 타입으로 풀었다.

전이는 정리됐는데 SSE 연결 자체는 여전히 명령형이었다. effect 여기저기서 열고 닫다 보니 "상태는 live인데 연결은 닫힘" 같은 불일치가 생길 수 있었다.

---

## SSE 연결을 상태에서 파생시키기: useSyncExternalStore

그래서 SSE 연결을 명령형으로 열고 닫는 대신 상태에서 파생되는 값으로 다루기로 했다. 식으로 쓰면 이렇다.

> 연결 = (구독자 있음) ∧ (세션 있음) ∧ (종료 아님)

입력이 바뀌면 `syncConnection()`이 연결을 거기에 맞춘다. 이렇게 하면 불일치가 구조적으로 생길 수 없고, 리마운트해도 저절로 복구된다. 이 모델에는 `useSyncExternalStore`가 잘 맞았다. store가 SSE 수명을 갖고, React는 스냅샷만 구독한다.

```ts
export class ChatStore {
  private snapshot = ChatStore.initialSnapshot();
  private readonly listeners = new Set<Listener>();
  private readonly seen = new Set<number>(); // 메시지 id 로 history+SSE 이중표시 제거

  readonly subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    this.syncConnection(); // 구독 시작 → 필요하면 연결
    return () => {
      this.listeners.delete(listener);
      this.syncConnection(); // 구독 종료 → 필요하면 해제
    };
  };
  readonly getSnapshot = () => this.snapshot;
}
```

역할도 나눴다. 네트워크 호출(AI 종료, 메시지 전송, AI 스트림)은 훅의 React Query가 맡고, SSE 구독과 상태 전이는 store가 맡는다.

외부 API의 현실도 하나 더 여기서 처리했다. 두 백엔드의 메시지 항목은 API 문서에 정의조차 없는 제각각 페이로드였고, 스키마를 우리가 정할 수도 없었다. 그래서 단일 항목, 배열, `{messages:[]}` 래퍼를 모두 zod `.catch()`로 방어적으로 파싱해서, 항목 하나가 깨져도 전체가 버려지지 않게 했다.

이 버전은 잘 돌았다. 그런데도 갈아엎었다.

---

## 멀쩡한 자체 store를 버리고 @tanstack/ai로: 미래를 위한 베팅

ChatStore가 하는 일을 들여다보면 메시지 누적, ID 기반 중복 제거(seen), 구독 생명주기, 스냅샷 불변 갱신이다. 전부 "구독되는 메시지 리스트 스토어"가 흔히 하는 일이고, AI 메시지 프레임워크가 이미 풀어 둔 문제다.

결정적으로 이 챗봇은 계속 기능이 늘어날 예정이었다. 토큰 실시간 스트리밍(처음에 했다가 잃은 그것), tool call, 멀티파트/리치 메시지(카드와 첨부)가 들어올 차례였다. 그러면 자체 store는 결국 표준 AI 메시지 모델로 다시 짜야 한다. 마이그레이션 비용은 한 번만 치르면 되니, useSyncExternalStore에서 넘어오는 지금이 그 타이밍이었다.

마지막 현실이 남아 있었다. 세션 SSE는 라이브러리가 기대하는 표준 포맷이 아니었다. 외부에서 설계한 응답 포맷이 @tanstack/ai `useChat`이 기대하는 표준 connection 모양과 달랐고, 우리는 그 포맷을 바꿀 수 없었다. 그래서 세션 SSE를 표준 인터페이스 뒤에 감추는 어댑터, `SubscribeConnectionAdapter`를 만들었다.

```ts
export function makeSessionConnection({ sessionId, onStatus }): SubscribeConnectionAdapter {
  return {
    async *subscribe() {
      const queue: StreamChunk[] = [];
      let notify = () => {};
      const controller = new AbortController();

      const accessToken = await getCookie('accessToken');
      fetchEventSource(`${SESSION_API_URL}/chat/sessions/${sessionId}/stream`, {
        signal: controller.signal,
        openWhenHidden: true,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        onmessage: ({ event, data }) => {
          if (event === SseEvent.StatusChange) {
            const status = parseStatusEvent(safeParse(data));
            if (status) onStatus(status); // 서버 상태 → 비즈니스 레이어 (ServerStatus 타입)
          } else {
            queue.push(...itemsToChunks(safeParse(data))); // 메시지 → 표준 StreamChunk
          }
          notify();
        },
        onerror: () => 3000, // 3s 후 재연결
      }).catch(() => {});

      try {
        while (true) {
          if (queue.length === 0) await new Promise<void>((r) => (notify = r));
          yield* queue.splice(0); // 콜백(push) → async generator(pull) 브리지
        }
      } finally {
        controller.abort(); // 소비 종료 시 SSE 닫기
      }
    },
    send: asyncNoop, // ← 전송은 이 채널이 아니다
  };
}
```

`send`가 빈 함수라는 점이 이 구조를 잘 보여 준다. 보통 Connection은 보내면 응답 stream을 돌려주는 모델이다. 우리는 두 백엔드 구조 때문에 송신 채널과 수신 채널이 나뉘어 있다. 전송은 출처에 따라 세션 백엔드나 AI 스트림으로 가고, 표시는 세션 SSE 한 곳에서 한다. 그러니 "send가 stream을 반환한다"는 추상화에 끼워 넣으면 send 쪽 절반은 자연히 비게 된다.

### 라이브러리의 생명주기 가정에 mount를 맞추는 게 진짜 일이었다

어댑터만 만들면 끝날 줄 알았는데, 정작 시간을 많이 쓴 건 `useChat`의 가정이었다.

`useChat`은 `initialMessages`를 mount 때 딱 한 번만 읽는다. 그런데 히스토리는 React Query로 비동기로 온다. 첫 렌더에는 비어 있어서 히스토리가 뜨지 않았다. `useSuspenseQuery`로 히스토리가 준비된 뒤에 대화 컴포넌트를 mount 하게(Suspense 게이팅) 바꿨더니, 생성 시점의 `initialMessages`가 곧 히스토리가 됐다.

`live: true`를 넘기지 않으면 구독이 아예 일어나지 않는다. 이걸 빠뜨려서 한동안 실시간 메시지가 들어오지 않았고, `useChat({ connection, initialMessages, live: true })`로 해결했다.

패널을 닫으면 컴포넌트가 unmount 되면서 구독이 해제되고, 어댑터의 `finally`에서 `controller.abort()`로 SSE가 닫힌다.

### 한 변수에 섞인 상태는 타입으로 나눴다

useReducer 단계의 골칫거리, 클라이언트의 connecting과 서버 상태가 한 변수에 섞이던 문제는 여기서 끝났다. 처음에는 `serverStatus`와 `isConnecting` 두 상태로 쪼갰다가, 과설계라 다시 걷어냈다. 최종 형태는 state 하나에 타입을 나누는 것이다.

```ts
type ServerStatus = 'ai' | 'live' | 'hold' | 'done';   // SSE/히스토리가 주는 권위 상태
type ChatStatus = ServerStatus | 'connecting';          // + 클라 전용 전이 상태

const [status, setStatus] = useState<ChatStatus>(/* 히스토리 마지막 status ?? 'ai' */);
// onStatus 가 ServerStatus 타입이라, SSE 는 connecting 을 타입상 절대 못 덮는다
const connection = useMemo(() => makeSessionConnection({ sessionId, onStatus: setStatus }), [sessionId]);
```

`connecting`은 키워드 핸들러에서 클라이언트가 직접 세팅한다. 서버 경로(`onStatus`)는 `ServerStatus`만 받으므로 SSE가 낙관적으로 세팅한 connecting을 덮어쓸 수 없다. 불변식을 런타임 코드 대신 타입으로 강제한 것이다.

### dedup은 라이브러리에 맡겼다

ChatStore의 `seen`(메시지 id 중복 제거)은 어댑터로 옮기지 않았다. 메시지 누적, dedup, 생명주기를 `useChat`에 넘겼다. 솔직히 말하면 라이브러리가 dedup을 해 준다는 걸 검증한 건 아니다. 명시적인 dedup을 지우고 라이브러리의 messageId 기반 누적에 맡겼을 뿐이다. 히스토리(initialMessages)와 SSE가 같은 id를 쓸 때 라이브러리가 합쳐 주는지는 백엔드 재전송 시나리오로 더 검증해야 할 빚으로 남았다.

---

## 리뷰에서 다듬은 것과 남은 빚

리뷰를 거치며 마무리를 다듬었다.

- 전송 실패 피드백은 처음에 에러 메시지 버블을 직접 그렸다. 그랬더니 실패 표시가 관계없는 응답 밑에 붙고 세션 내내 사라지지 않아서, 공용 토스트(`toast.warning`)로 바꿨다.
- status 초기값을 `.at(-1)`(마지막 항목)에서 뽑았더니, 마지막 항목에 status가 없을 때 어긋났다. `.findLast(i => i.status)`로 고쳤다.
- connecting(AI 종료 진행 중) 동안 입력이 막히지 않아 전송과 레이스가 났다. `isPending`에 그 호출을 합쳐 막았다.
- 대화 맨 위에 클라이언트 인사말을 추가했다. 다만 처음부터 서버 히스토리에 있던 인사말과 겹칠 수 있다. 히스토리가 비었을 때만 보여 주는 편이 더 안전해서 검증 대상으로 남겼다.

@tanstack/ai로 옮겨서 얻은 것도 아직 다 꺼내 쓰지 못했다. 지금은 라이브러리의 `UIMessage`를 자체 `Message`(텍스트 한 줄)로 되돌려 렌더하는데, 앞으로 들어올 기능(parts, tool, 첨부)은 전부 `UIMessage.parts`에 실려 온다. 베팅해서 얻은 걸 렌더 직전에 버리고 있는 셈이다. 다음 작업은 렌더러가 parts를 직접 분기하게 바꾸는 것이다. 추상화는 들여온 값을 실제로 꺼내 쓸 때 완성된다.

AI 챗 서비스가 토큰을 세션 SSE로도 흘려 주는 날이 오면, 처음에 했다가 잃은 스트리밍이 이번에는 라이브러리 위에서 돌아온다.

---

## 돌아보며

다섯 번을 거치며 내가 판단한 건 이렇다. 채널별 패널을 하나의 타임라인으로 합쳤고, 연결 버튼을 키워드로 바꿔 UI 상태를 없앴다. SSE 연결은 상태에서 파생되게 해서 불일치를 구조적으로 막았고, 클라이언트와 서버 상태가 섞이는 문제는 타입(ServerStatus/ChatStatus)으로 나눴다. 멀쩡히 돌던 자체 store를 표준 프레임워크로 옮긴 것도 앞으로 올 스트리밍, tool, parts를 위해 추상화 비용을 미리 낸 판단이었다.

나머지는 못 건드리는 외부 백엔드 두 개가 강제했다. 클라이언트에서의 봉합, 송신과 수신의 분리(`send: asyncNoop`), drain-only 펌프, fetch-event-source, zod 방어 파싱, 비표준 SSE를 감춘 어댑터가 모두 그 경계에서 나왔다.

내가 바꿀 수 없는 경계, 그것도 둘로 나뉜 외부 백엔드 위에 기능을 얹다 보니 코드 모양의 8할은 내 손보다 그 경계에서 나왔다. 그 경계를 정확히 읽고 그 안에서 가장 덜 나쁜 봉합을 찾는 것, 그리고 다음 사람이 "이게 왜 이렇게 돼 있지?" 하고 헤매지 않게 이유를 글로 남기는 것까지가 내 몫이었다.
