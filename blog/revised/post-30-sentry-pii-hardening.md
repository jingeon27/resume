# Sentry로 에러 수집부터 Web Vitals·MCP·릴리스까지 연결한 과정

<figure class="figure-wide">
  <img src="../assets/covers/sentry-observability.jpg" alt="클라이언트, 서버, Edge의 trace에서 반복 호출을 발견하고 개인정보를 거른 뒤 이슈로 정리하는 관측 구조" />
  <figcaption>오류를 많이 모으는 대신 사용자에게 영향을 주는 신호를 남기는 관측 체계</figcaption>
</figure>

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>Next.js 세 런타임의 오류와 Web Vitals를 수집하고, 개인정보·중복·잡음을 줄이며, 릴리스·소스맵·MCP까지 연결해 실제로 진단 가능한 상태로 만든 과정을 다룹니다.</p>
</div>

프론트엔드 에러와 Web Vitals를 확인하려고 Sentry를 도입했습니다. `@sentry/nextjs`를 설치하고 이벤트를 올리는 것 자체는 하루면 됐는데요. 실제로 운영 가능한 상태가 되기까지는 훨씬 많은 일이 필요했습니다.

- client·server·edge 세 런타임 초기화
- 사용자 영향에 따른 에러 레벨과 그룹핑 정책
- 오류 이벤트·breadcrumb·transaction·span의 개인정보 제거
- Web Vitals 수집과 실제 전송을 검증하는 E2E
- 사내 Sentry를 조회하기 위한 MCP 연결
- 릴리스와 소스맵 artifact 업로드
- 의미 없는 수집 트래픽을 줄이는 전송 게이트와 잡음 표본 추출

이 설계는 이전 회사에서 Sentry를 운영했던 경험과 우아한형제들의 [「선제적 장애 대응을 위한 Sentry 최적화 적용기」](https://techblog.woowahan.com/21604/)를 출발점으로 삼았습니다. 이전 회사에서는 브라우저 확장 프로그램·Service Worker·네트워크 환경에서 반복되는 오류와 이미 비즈니스 흐름에서 처리한 API 오류를 `ignoreErrors`·`denyUrls`·`beforeSend`로 선별하고, 개발·테스트 실행의 이벤트가 전송되지 않도록 관리했습니다. 모든 오류를 모으는 것보다 사용자에게 영향을 주는 오류를 놓치지 않는 것이 중요하다는 걸 이때 배웠습니다.

우아한형제들의 글에서도 과도한 오류가 수집 한도를 소진해 정작 중요한 장애 로그가 누락된 경험을 바탕으로, 서비스 영향도에 따른 레벨·불필요한 오류 필터링·알림과 담당 절차를 함께 설계했습니다. 구현을 그대로 가져온 것은 아닙니다. 이전 회사의 운영 경험과 글의 문제의식을 현재 서비스의 Next.js 런타임·개인정보·배포 환경에 맞게 다시 해석해, 애플리케이션의 Sentry 수집·진단 체계를 구축했습니다.

초기 도입 과정에서는 스테이지 이벤트와 실제 전송 payload를 확인하며 수집 정책을 여러 차례 보완했습니다. 설정 이름만 믿지 않고 오류 이벤트·breadcrumb·transaction·span마다 어떤 정보가 포함되는지 검증하고, 필요한 진단 정보는 남기되 민감 정보와 중복 이벤트는 제외했습니다. 가장 크게 배운 것은 Sentry가 단순히 “에러를 보내는 SDK”가 아니라는 점이었는데요. 무엇을 보내고, 무엇을 버리고, 어떤 기준으로 우선순위를 정할지까지 설계해야 비로소 쓸 수 있는 도구가 됐습니다.

이 글은 Next.js 16과 `@sentry/nextjs` 10.70을 기준으로 작성했습니다.

## 세 런타임의 오류를 한곳으로 모았습니다

Next.js에서는 브라우저·Node·Edge가 서로 다른 SDK 구현을 사용합니다. 초기화 파일도 런타임별로 나눴는데요.

```ts
// sentry.client.ts
Sentry.init({
  dsn: SENTRY_DSN,
  enabled: IS_SENTRY_ENABLED,
  environment: SENTRY_ENVIRONMENT,
  integrations: [
    Sentry.browserTracingIntegration({
      idleTimeout: SENTRY_IDLE_TIMEOUT,
    }),
  ],
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,
});

// sentry.server.ts
Sentry.init({
  dsn: SENTRY_DSN,
  enabled: IS_SENTRY_ENABLED,
  environment: SENTRY_ENVIRONMENT,
  integrations: [
    Sentry.httpIntegration({
      disableIncomingRequestSpans: true,
      maxIncomingRequestBodySize: 'none',
    }),
  ],
});
```

브라우저는 `instrumentation-client.ts`에서 초기화하고, Node와 Edge는 `instrumentation.ts`의 `register()`에서 현재 런타임에 맞는 초기화 함수를 불렀습니다. 라우터 이동이 시작된 시점부터 navigation transaction을 잡도록 `captureRouterTransitionStart`도 연결했습니다.

서버 컴포넌트 렌더링, 라우트 핸들러, 서버 액션, proxy에서 발생한 오류는 Next.js의 `onRequestError`로 넘겼는데요. API 인터셉터에서 이미 수집한 오류라면 다시 보내지 않았습니다.

같은 오류가 인터셉터 → 에러 바운더리 → `onRequestError`를 지나며 서로 다른 이슈 세 개로 생길 수 있었기 때문입니다. `captureError`가 처리한 객체에는 열거되지 않는 심볼을 남기고, 상위 수집 지점에서는 그 표식을 확인해 건너뛰도록 했습니다.

## 에러 레벨은 상태 코드가 아니라 사용자 영향으로 정했습니다

처음에는 4xx와 5xx만으로 심각도를 나누려 했습니다. 하지만 같은 500이라도 사용자가 겪는 결과는 요청의 역할에 따라 달랐는데요.

| 요청                                      | 5xx     | 4xx       |
| ----------------------------------------- | ------- | --------- |
| GET — 화면을 채우는 호출                  | `fatal` | `error`   |
| 그 외 — 사용자가 다시 시도할 수 있는 호출 | `error` | `warning` |

GET이 실패하면 목록이나 상세 내용이 표시되지 않습니다. 반면 POST·PATCH 같은 쓰기 요청은 화면이 남아 있고 사용자가 다시 시도할 수 있습니다. 그래서 다음과 같이 정의했습니다.

- `fatal` — 화면이 뜨지 않거나 핵심 조회 결과를 사용할 수 없는 경우
- `error` — 화면은 남아 있지만 사용자가 하려던 작업이 막힌 경우
- `warning` — 예상 가능한 실패이며 다시 시도하거나 대체 흐름으로 넘어갈 수 있는 경우

401도 전부 같은 방식으로 다루지 않았습니다. 액세스 토큰 갱신으로 복구된 401은 보내지 않았고, 토큰 갱신 요청 자체가 실패한 경우는 별도 fingerprint로 남겼는데요. refresh token이 정상적으로 만료된 401은 `warning`, 그 밖의 갱신 실패는 `error`로 구분했습니다.

에러 레벨은 개발자가 느끼는 심각도가 아니라 사용자가 잃은 기능과 복구 가능성을 나타내도록 했습니다.

## 전송 payload에서 민감 정보를 명시적으로 제외했습니다

첫 스테이지 이벤트를 열어 보니 `event.request`에 요청 헤더와 파싱된 쿠키가 들어 있었습니다. `accessToken`과 `refreshToken`도 포함돼 있었는데요.

요청 정보는 오류 원인을 찾는 데 도움이 되지만, 의료 서비스에서 인증 정보나 사용자가 입력한 내용을 함께 보낼 이유는 없었습니다. 기본 설정에 기대지 않고 실제 payload를 기준으로 필요한 진단 정보와 제외할 정보를 나눴습니다. 요청 헤더·쿠키·본문·쿼리와 사용자 입력은 수집하지 않도록 `dataCollection`에 명시했습니다.

```ts
export const SENTRY_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: false, response: false },
  httpBodies: [],
  urlQueryParams: false,
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  graphQL: { document: false, variables: false },
  stackFrameVariables: false,
  frameContextLines: 5,
};
```

AI 입력과 출력도 닫았습니다. 상담 기능의 프롬프트와 응답에는 사용자가 작성한 내용이 들어갈 수 있기 때문입니다. GraphQL과 데이터베이스 계측은 현재 사용하지 않지만, 나중에 통합이 추가되더라도 닫힌 상태에서 시작하도록 명시했고요.

`stackFrameVariables`도 중요했습니다. Node의 `localVariablesIntegration`은 예외 프레임의 지역 변수를 이슈에 붙일 수 있습니다. 오류가 발생한 함수의 지역 변수에 회원 정보나 토큰이 있다면 그대로 수집될 수 있었습니다.

`frameContextLines`는 반대로 5줄을 유지했습니다. 개인정보가 아니라 소스 노출의 문제였고, 소스맵을 함께 올리는 환경에서는 원인 분석에 주는 가치가 더 크다고 판단했습니다.

## 새 수집 키가 생기면 타입 검사가 깨지게 했습니다

`dataCollection` 객체를 전달하면 적지 않은 필드가 생략 시 안전하게 닫히는 것이 아니라 수집 가능한 상태로 남습니다. 처음에는 `stackFrameVariables`와 `graphQL` 같은 키가 빠졌는데요.

SDK의 타입을 그대로 붙이는 것만으로는 막을 수 없었습니다. 원본 타입의 모든 필드가 optional이기 때문입니다.

```ts
type TSentryDataCollection = NonNullable<NonNullable<Parameters<typeof init>[0]>['dataCollection']>;

type TClosedDataCollection = Required<Omit<TSentryDataCollection, 'queryParams'>> & {
  httpHeaders: Required<NonNullable<TSentryDataCollection['httpHeaders']>>;
  graphQL: Required<NonNullable<TSentryDataCollection['graphQL']>>;
  genAI: Required<NonNullable<TSentryDataCollection['genAI']>>;
};
```

optional을 걷어내면 SDK가 새 수집 항목을 추가하는 순간 타입 검사가 실패합니다. 그때 새 항목을 수집할지 닫을지 결정해야 다시 빌드할 수 있는데요.

타입만으로는 값을 `true`로 잘못 적은 경우까지 잡지 못합니다. 테스트에서는 전체 객체를 `toEqual`로 비교해 키가 빠지거나 값이 열리는 경우를 함께 막았습니다.

타입은 **새 키를 놓치는 경우**를, 테스트는 **열린 값을 넣는 경우**를 잡습니다.

## breadcrumb은 `dataCollection`이 걸러주지 않았습니다

헤더와 쿠키를 막은 뒤에도 토큰이 다시 보였습니다. 이번에는 오류 이벤트가 아니라 breadcrumb이었는데요.

`dataCollection`은 SDK가 자동으로 수집하는 request data에 적용됩니다. breadcrumb은 그 바깥입니다. console breadcrumb에는 인자로 넘긴 값이 그대로 들어가는데, 코드베이스에는 axios 오류 객체를 `console.error`로 넘기는 곳이 있었습니다. 그 객체의 `config.headers`에 인증 정보가 들어 있었고요.

console breadcrumb은 통째로 버렸습니다. 같은 오류는 이벤트로 별도 수집하므로 console 인자를 다시 보낼 필요가 없었습니다.

fetch·xhr·history breadcrumb은 URL의 쿼리와 해시를 제거했습니다. Node의 http breadcrumb는 쿼리를 `http.query`라는 별도 키에도 넣기 때문에 그 값도 삭제했는데요.

```ts
export function sanitizeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category === 'console') return null;
  if (!breadcrumb.data) return breadcrumb;

  const data = { ...breadcrumb.data };

  ['url', 'from', 'to'].forEach((key) => {
    const value = data[key];

    if (typeof value === 'string') {
      data[key] = stripUrlParams(value);
    }
  });

  delete data['http.query'];
  delete data['url.query'];
  delete data['http.fragment'];

  return { ...breadcrumb, data };
}
```

여기서 한 가지가 더 드러났습니다. **애플리케이션이 직접 context에 넣는 값은 자동 수집 차단 대상이 아닙니다.**

- 화면 위치는 `location.href`가 아니라 pathname만 사용했습니다.
- API URL은 쿼리와 해시를 제거했습니다.
- 숫자·UUID 경로는 `:id`로 접어 개인정보와 이슈 그룹 폭증을 함께 막았습니다.
- OAuth callback의 `code`·`state`, 검색 조건, 회원 식별자가 URL에 남지 않게 했습니다.

## URL과 본문은 이벤트·transaction·span에서 각각 지웠습니다

수집 항목을 제한한 뒤 실제 브라우저 payload를 다시 확인해 보니 URL 본체와 `Referer`에는 여전히 쿼리가 남을 수 있었습니다. 요청 본문도 다른 코드가 오류 context에 직접 추가하면 최종 payload에 포함될 수 있었고요. 그래서 자동 수집 설정과 별개로 전송 직전의 이벤트·transaction·span을 한 번 더 정리했습니다.

Node에서는 먼저 본문을 읽지 않도록 했습니다.

```ts
Sentry.httpIntegration({
  disableIncomingRequestSpans: true,
  maxIncomingRequestBodySize: 'none',
});
```

`disableIncomingRequestSpans`도 함께 넘겨야 했습니다. 직접 전달한 `httpIntegration`이 이름이 같은 Next.js 기본 통합을 대체하기 때문인데요. 이 값을 빠뜨리면 Next.js와 Sentry가 같은 incoming request span을 중복으로 만듭니다.

읽는 단계에서 막은 뒤에도 전송 직전에 한 번 더 지웠습니다.

```ts
Sentry.init({
  beforeBreadcrumb: sanitizeBreadcrumb,
  beforeSend: sanitizeEvent,
  beforeSendTransaction: sanitizeEvent,
  beforeSendSpan: sanitizeSpan,
  dataCollection: SENTRY_DATA_COLLECTION,
});
```

`sanitizeEvent`는 다음을 처리합니다.

- `event.request.url`의 쿼리·해시 제거
- `query_string`, `cookies`, `data` 삭제
- 대소문자와 관계없이 `Referer`의 쿼리 제거
- trace와 child span 속성 정리

URL은 한 가지 키로만 오지 않았습니다.

```ts
const URL_ATTRIBUTE_KEYS = ['url', 'url.full', 'http.url', 'http.target', 'http.request.header.referer'];

const QUERY_DATA_KEYS = ['http.query', 'url.query', 'http.fragment'];
```

특히 plain `url`이 마지막까지 남았습니다. fetch·xhr 계측은 정리한 URL을 `http.url`이나 `url.full`에 넣으면서, 별도 `url` 속성에는 정리하지 않은 원본을 넣는데요. axios가 xhr를 사용하는 서비스라 모든 API span의 쿼리가 이 키에 남을 수 있었습니다.

처음 두세 개의 키만 지우고 끝냈다면 정화된 URL과 원본 URL이 같은 span에 나란히 실렸을 겁니다.

INP처럼 transaction에 속하지 않고 독립적으로 전송되는 span은 `beforeSendTransaction`을 거치지 않습니다. 그래서 같은 속성 정화를 `beforeSendSpan`에도 연결했습니다.

## Web Vitals는 실제 Sentry envelope까지 확인했습니다

브라우저에서는 `browserTracingIntegration`이 LCP·CLS·TTFB·FCP를 pageload transaction의 measurement로 전송합니다. 프로덕션 trace는 20%를 수집하고, 트래픽이 적은 스테이지는 전부 수집하도록 했습니다.

처음에는 기본 `idleTimeout` 1초를 사용했는데요. 실제 수집분을 보니 LCP가 없는 pageload transaction의 지속시간 p50은 728ms였고, LCP가 실린 쪽은 2.3초였습니다. transaction이 지표보다 먼저 닫히는 경우가 있다고 판단해 대기 창을 3초로 늘렸습니다.

```ts
export const SENTRY_IDLE_TIMEOUT = 3_000;
```

이 값을 늘려도 기록되는 transaction duration이 3초 늘어나지는 않습니다. SDK가 idle span의 종료 시각을 마지막 child span의 끝으로 다시 자르기 때문에, Web Vitals를 기다리는 시간과 전송 시점만 달라집니다.

단위 테스트로는 `browserTracingIntegration`, 활성화 게이트, 샘플링을 모두 지난 payload가 실제로 전송되는지 알 수 없었습니다. 그래서 별도의 Playwright 실행 경로를 만들었습니다.

```bash
npm run test:e2e:sentry
```

테스트에서는 Sentry의 envelope 요청을 `page.route`로 가로채고, 실제 서버에는 보내지 않은 채 transaction payload를 읽습니다. pageload transaction에 `fcp`, `lcp`, `ttfb` measurement가 포함됐는지 확인했는데요.

MSW 서비스워커가 요청을 넘겨받으면 `page.route`가 envelope를 잡지 못하므로 해당 E2E 컨텍스트에서는 service worker도 차단했습니다. 응답을 주지 않으면 SDK가 재시도하므로 가짜 성공 응답까지 돌려줬습니다.

즉, 이 테스트는 단순히 옵션 객체를 검사하지 않습니다.

```text
브라우저 진입
  → browserTracingIntegration
  → pageload transaction 종료
  → Sentry envelope 생성
  → measurement 포함 여부 확인
```

Web Vitals의 실제 전송 경로 전체를 검증합니다.

## INP는 애플리케이션 코드로 해결할 수 없는 상태였습니다

여기에는 중요한 한계가 있었습니다. 현재 SDK에서 INP는 pageload transaction의 measurement가 아니라 standalone span으로 전송됩니다.

현재 사내 Sentry 환경에서는 span ingestion이 꺼져 있어 `dataset=spans`가 비어 있었습니다. 그래서 INP가 저장되지 않았고, Insights의 Web Vitals 화면도 비어 보였는데요. 지금은 Discover에서 transaction dataset과 `transaction.op:pageload`를 기준으로 LCP·CLS·TTFB·FCP를 확인합니다.

이 문제는 `beforeSendSpan`을 추가하거나 SDK 옵션을 바꾼다고 해결되지 않습니다. 애플리케이션은 span을 보내고 있지만 현재 서버 설정에서 저장하지 않는 상태라, 서버의 span ingestion 설정을 별도로 확인해야 합니다.

따라서 현재 구성을 두고 “Core Web Vitals 전체를 운영하고 있다”고 표현하지 않습니다.

Sentry 워터폴을 보다가 메인 배너 링크가 뷰포트에 들어오는 것만으로 여러 라우트를 prefetch하는 것도 발견했습니다. 해당 링크의 prefetch를 끄고 요청이 사라진 것은 확인했지만, Web Vitals가 얼마나 개선됐는지는 측정하지 않았는데요. 성능 개선 수치가 아니라 측정 환경이 불필요한 네트워크 작업을 발견하게 한 사례로만 남겼습니다.

## 사내 Sentry를 에이전트가 조회하도록 MCP를 붙였습니다

대시보드를 사람이 직접 열어 보는 것만으로는 코드 작업과 이슈 조사가 분리됐습니다. 에이전트가 실제 이슈·transaction·프로젝트 설정을 읽고 코드와 대조할 수 있도록 Sentry MCP를 저장소에 연결했는데요.

`@sentry/mcp-server`를 stdio로 실행하고 사내 Sentry 주소를 `--host`로 전달했습니다.

```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server@latest", "--host=sentry.example.com", "--disable-skills=seer"],
      "env": {
        "SENTRY_ACCESS_TOKEN": "${SENTRY_ACCESS_TOKEN}"
      }
    }
  }
}
```

사내 환경에서 사용할 수 없는 Seer 관련 도구는 비활성화했습니다. 토큰 값은 저장소에 넣지 않고 환경 변수 이름만 참조했습니다.

여기서도 설정 파일만 맞다고 끝나지 않았습니다. Claude Code는 `${SENTRY_ACCESS_TOKEN}`을 자신의 프로세스 환경에서 치환합니다. Bash 도구에만 적용되는 로컬 설정이나 `.env.local`에 값을 넣으면 터미널의 `curl`은 성공해도 MCP 프로세스에는 토큰이 전달되지 않았는데요. 셸 시작 환경에 토큰을 두고 Claude Code를 다시 시작해야 반영됐습니다.

MCP용 토큰과 소스맵 업로드용 토큰도 분리했습니다.

- **MCP 토큰** — 이슈·이벤트·프로젝트를 조회하는 user auth token
- **빌드 토큰** — 릴리스와 소스맵 artifact를 올리는 org token

MCP 토큰에는 `project:releases` 권한이 없어 빌드 업로드에 재사용할 수 없었습니다. 같은 Sentry 토큰처럼 보여도 목적과 권한이 달랐습니다.

MCP를 붙인 뒤에는 코드만 보고 “수집될 것”이라고 추정하지 않고, 실제 transaction dataset과 이슈 payload를 확인하며 설정을 보완할 수 있었습니다. INP가 애플리케이션에서 빠진 것이 아니라 서버의 span 저장 단계에서 사라진다는 판단도 이 과정에서 분리했습니다.

## 릴리스와 소스맵은 빌드 결과로 확인했습니다

minify된 스택을 원본 코드로 연결하려면 소스맵 artifact가 실제 Sentry 프로젝트에 올라가야 합니다. `withSentryConfig`에 사내 Sentry 주소와 조직·프로젝트, 빌드 토큰을 연결했습니다.

```ts
withSentryConfig(nextConfig, {
  sentryUrl: 'https://sentry.example.com/',
  org: 'example',
  project: 'web',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    deleteSourcemapsAfterUpload: true,
  },
  errorHandler: (error) => {
    console.warn('[sentry] 소스맵 업로드 실패:', error.message);
  },
});
```

한동안 이 설정은 있었지만 빌드 환경에 토큰이 전달되지 않아 릴리스·artifact가 올라가지 않았습니다. 코드에 설정이 있다는 것과 배포 빌드에서 실행됐다는 것은 다른 문제였는데요.

Turbopack 빌드라서 처음에는 업로드가 동작하지 않는다고 생각했습니다. 하지만 `@sentry/nextjs` 10.70은 Turbopack에서 production compile 이후 실행되는 훅으로 소스맵을 올립니다. Next.js 16이 debug ID를 생성하고, Sentry는 그 ID를 기준으로 artifact bundle과 배포 파일을 연결합니다.

토큰이 **존재하는지**만 확인해서는 충분하지 않았습니다.

- 만료되거나 권한이 없는 토큰도 문자열은 존재하므로 업로드 단계에 진입합니다.
- 업로드가 401로 실패해도 `errorHandler`가 경고만 남기면 빌드는 성공할 수 있습니다.
- `deleteSourcemapsAfterUpload: true`는 실패한 경우에도 로컬 산출물의 소스맵을 지울 수 있습니다.

그러면 “Sentry에도 없고 배포 산출물에도 없는” 상태가 조용히 만들어질 수 있는데요. 그래서 빌드 성공 여부가 아니라 `sentry-cli`로 릴리스 접근 권한을 확인하고, Sentry API에서 artifact bundle이 실제로 생성됐는지를 따로 확인했습니다.

릴리스 연결의 완료 조건은 `next build`가 성공한 것이 아니라, 배포된 오류의 debug ID와 Sentry artifact가 실제로 매칭되는 것이었습니다.

## 고칠 수 없는 잡음은 발생 지점에서 표본만 남겼습니다

개인정보 경로를 막고 나니 위치 조회 실패가 이슈 목록 상단을 채웠습니다. 권한 거부는 사용자의 선택이라 보내지 않고, 위치 소스 없음과 시간 초과는 기기·주변 환경의 영향을 많이 받아 10%만 남겼는데요.

오류 코드가 없는 실패는 전부 남겼습니다. 앱 브리지 reject나 `navigator.geolocation` 부재처럼 우리 코드가 깨졌다는 신호일 수 있기 때문입니다.

처음에는 위치 조회 실패 문구를 `ignoreErrors`에 넣으려 했습니다. 하지만 `GeolocationPositionError`는 `Error`도 `Event`도 아니어서 SDK가 다음과 같은 공통 문구로 변환합니다.

```text
Object captured as exception with keys: code, message
```

이 문구를 무시하면 위치 오류뿐 아니라 `Error`가 아닌 모든 예외가 함께 사라집니다. 원본의 `code`를 볼 수 있는 위치 조회 코드에서 표본 여부를 결정하고, fingerprint에는 오류 코드를 포함했습니다.

## 전송 게이트로 의미 없는 트래픽을 줄였습니다

이전 회사에서는 `NODE_ENV`를 기준으로 개발·테스트 이벤트를 제외했습니다. 단순하고 효과적이었지만, 로컬에서 실제 전송을 검증하거나 프로덕션 빌드를 이용한 E2E를 실행하는 것처럼 환경 이름과 수집 목적이 일치하지 않는 경우를 세밀하게 표현하기는 어려웠습니다.

이번에는 개발 과정에서 이미 콘솔로 확인할 수 있는 오류까지 모두 전송하면 의미 없는 수집 트래픽과 이슈 잡음이 늘어 실제 사용자 문제를 찾기 어렵다는 원칙은 유지하되, 실행 목적에 따라 전송 여부를 명시적으로 선택하는 게이트를 만들었습니다.

DSN이 존재하더라도 `NEXT_PUBLIC_SENTRY_ENABLED`가 `false`면 SDK 전체가 비활성화됩니다.

```ts
export const IS_SENTRY_ENABLED = Boolean(SENTRY_DSN) && SENTRY_ENABLED !== 'false';
```

- 실제 사용자·검증 트래픽을 확인해야 하는 production·staging 배포에서는 활성화합니다.
- 상시 수집할 가치가 적은 development 배포와 일반 로컬 실행은 기본적으로 비활성화합니다.
- `dev`, `dev:mock`, `build:e2e`는 기본값을 `false`로 두어 테스트·개발 트래픽이 저장소를 소비하지 않게 합니다.
- Sentry 전송 자체를 확인하는 E2E나 로컬 연동 점검에서는 명시적으로 `true`를 주어 다시 켤 수 있습니다.

이 구조의 목적은 로컬을 무조건 막는 것이 아닙니다. 지금 실행하는 작업에 Sentry 수집이 필요한지를 호출자가 선택하게 해 의미 없는 트래픽과 이슈 잡음을 줄이는 것입니다. 새 클론이나 worktree에서도 기본값이 안전하게 꺼지고, 필요할 때만 의도적으로 켤 수 있게 했습니다.

## 회원 id 하나만 붙였습니다

영향받은 사용자 수를 알아야 한 명의 특이 사례와 다수에게 발생한 장애를 나눠 우선순위를 정할 수 있습니다. 사용자 정보는 브라우저 이슈에 회원 id 하나만 붙였는데요. 이름·이메일·전화번호는 넣지 않았습니다.

서버 렌더에는 사용자를 붙이지 않았습니다. 요청 스코프와 캐시된 렌더의 수명이 어긋나면 다른 요청의 이슈에 이전 사용자의 id가 남을 수 있기 때문입니다.

컴포넌트가 SDK의 `setUser`를 직접 호출하지도 않습니다. 공용 `setSentryUser`가 전송 게이트와 허용할 사용자 필드를 함께 관리하도록 했습니다.

## 정책 자체도 테스트했습니다

개인정보 정화 함수만 테스트해서는 충분하지 않았습니다. 함수가 올바르더라도 `Sentry.init`에 연결하지 않으면 원본이 그대로 전송되는데요. 테스트를 세 층으로 나눴습니다.

1. **정책 객체** — `dataCollection`의 모든 키와 값이 닫혀 있는지 전체 비교
2. **정화 함수** — URL·본문·쿠키·Referer·breadcrumb·span 속성 처리
3. **초기화 배선** — client·server·edge 모두에 정책과 훅이 실제 전달되는지 확인

여기에 Web Vitals E2E가 실제 브라우저에서 생성된 envelope까지 확인합니다.

새 SDK 버전에서 수집 키나 span 속성이 추가될 때 타입·단위 테스트·E2E 중 한 곳에서 변경을 발견하는 구조를 목표로 했습니다.

## 남은 한계

- 현재 서버 설정에서는 standalone span이 저장되지 않아 INP가 남지 않습니다.
- Web Vitals를 수집하지만 제품별 임계값·세그먼트·알림과 대응 책임은 아직 정하지 못했습니다.
- 사용자 정의 context에 민감 정보가 들어가는 것은 공용 helper와 리뷰 규칙에 의존합니다.
- SDK를 올릴 때 새 `dataCollection` 키뿐 아니라 새로운 URL·span 속성도 다시 확인해야 합니다.
- 단위 테스트와 envelope E2E는 전송 payload를 검증하지만, Sentry 서버가 저장·색인한 최종 결과 전체를 대신하지는 못합니다.
- 릴리스·artifact 업로드는 토큰 존재 여부가 아니라 실제 Sentry 결과로 계속 확인해야 합니다.

## 정리

처음에는 Sentry 도입을 “에러를 올리고 대시보드에서 보는 일”이라고 생각했습니다. 실제로는 다음 질문에 답하는 일이었습니다.

- 어떤 실패를 `fatal`, `error`, `warning`으로 볼 것인가?
- 하나의 장애가 여러 수집 지점을 지나도 한 이슈로 남는가?
- 오류 이벤트뿐 아니라 breadcrumb·transaction·span에서도 개인정보가 제거되는가?
- Web Vitals가 설정 객체가 아니라 실제 envelope에 실려 나가는가?
- Sentry 서버가 앱이 보낸 데이터를 실제로 저장하는가?
- 에이전트가 MCP로 운영 데이터를 조회하고 코드와 함께 판단할 수 있는가?
- 릴리스와 소스맵 artifact가 실제 배포 파일과 연결됐는가?

가장 크게 배운 것은 네 가지였습니다.

**설정이 끝났다는 판단은 실제 payload로 해야 합니다.** 오류 이벤트뿐 아니라 breadcrumb·transaction·span에 어떤 정보가 들어가는지 각각 확인했습니다.

**민감 정보는 두 겹으로 닫아야 합니다.** 읽는 단계에서 막고 전송 직전에 다시 지웠습니다.

**설정 파일과 실제 동작은 다릅니다.** Web Vitals는 envelope로, MCP는 실제 API 호출로, 릴리스는 artifact bundle로 확인했습니다.

**관측과 운영은 다릅니다.** 지표를 모으는 것에서 끝나지 않고, 사용자 영향에 따라 레벨을 정하고 잡음을 줄여 실제로 행동할 수 있는 목록을 만들어야 했습니다.

Sentry를 붙인 일보다, 무엇을 보내지 않을지와 어떤 신호에 움직일지를 코드·테스트·도구로 남긴 일이 더 오래 걸렸습니다.
