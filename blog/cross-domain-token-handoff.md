# 정산 도메인을 별도 호스트로 분리하면서 크로스 도메인 토큰 위임을 설계한 과정

Next.js 코드베이스 하나를 그대로 둔 채 정산만 다른 호스트(메인 호스트 → 정산 호스트)로 떼어냈다. 이 글은 그때 토큰을 어떻게 넘기고, 넘어간 토큰을 어떻게 "구독"하게 할지 고민한 기록이다. URL 쿼리스트링으로 시작해 form POST BFF, BFF 보안 가드, handoff 라우트 분리, CSP 강화까지 5단계를 거쳤다.

---

## 배경: 왜 정산만 다른 호스트인가

세이프닥 병원 관리자(`safedoc-hospital-admin`)는 병원정보, 프로그램, 예약, 정산을 한 앱에서 다룬다. 그런데 정산은 권한 체계와 감사(audit) 요구가 나머지 기능과 달라서 운영상 별도 호스트로 떼어내야 했다.

- 메인 앱: `app.example.com` (이하 *메인 호스트*)
- 정산 앱: `settle.example.io` (이하 *정산 호스트*)

실제 운영 도메인은 가렸다. 두 호스트의 **registrable domain이 서로 다르다**는 점만 기억하면 된다. 이 글에 나오는 문제는 전부 여기서 시작한다.

다만 호스트만 나누고 코드베이스는 레포 하나로 유지하고 싶었다. 앱을 둘로 쪼개면 공통 entities, UI, 유틸을 두 벌 관리해야 한다. 게다가 정산은 외부업체에서 인수한 코드라 갈라지면 비용이 더 커진다.

그래서 Next.js Route Group과 Middleware로 구조를 잡았다.

```text
app/
├── (beforeLogin)/sign/*        # 로그인
├── (afterLogin)/               # 메인 기능
├── (altLayout)/settlement/*    # 정산 — 별도 레이아웃, 같은 코드베이스
└── api/                        # API Routes (BFF)
```

`(altLayout)` 라우트 그룹으로 정산에만 별도 레이아웃을 입히고, 호스트는 `middleware.ts`가 경로를 보고 강제한다. `/settlement/*` 요청이 메인 호스트로 들어오면 정산 호스트로 보내고, 정산 호스트로 들어온 정산 외 경로는 메인 호스트로 redirect 한다.

```ts
// middleware.ts (현재)
function enforceDomain(request: NextRequest, domain: string | undefined) {
  if (!domain) return NextResponse.next();
  const host = domain.replace(/^https?:\/\//, '');
  if (request.headers.get('host') === host) return NextResponse.next();
  return NextResponse.redirect(new URL(request.nextUrl.pathname, domain));
}

export function middleware(request: NextRequest) {
  if (PUBLIC_MODE === 'local') return NextResponse.next();
  const target = request.nextUrl.pathname.startsWith('/settlement')
    ? process.env.NEXT_PUBLIC_SETTLEMENT_DOMAIN
    : process.env.NEXT_PUBLIC_DOMAIN;
  return enforceDomain(request, target);
}
```

여기까지는 라우팅 문제다. 어려운 건 그다음이었다.

---

## 두 호스트는 쿠키를 공유하지 못한다

세이프닥은 토큰을 HttpOnly 쿠키로 들고 있다. `accessToken`과 `refreshToken`을 서버 쿠키로 심고, axios interceptor가 요청마다 `Authorization` 헤더에 실어 보낸다.

```ts
// packages/shared/utils/cookie/cookie.ts
export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
};
```

그런데 메인 호스트와 정산 호스트는 registrable domain이 다르다. 같은 회사 서비스라도 브라우저가 보기에는 남남이라 쿠키가 공유되지 않는다. 메인 호스트에서 로그인해 토큰을 갖고 있어도, 정산 호스트로 넘어가는 순간 그 호스트에는 토큰이 없다.

정산 메뉴를 누른 사용자를 로그인된 상태 그대로 정산 호스트에 보내려면, 토큰을 한 번은 직접 건네줘야(handoff) 한다. 이 글은 결국 그걸 어떻게 건네줄지에 관한 이야기이고, 그 방식을 네 번 리팩토링했다.

---

## 1단계: URL 쿼리스트링 토큰 전달 (처음 제안받은 방식)

처음 제안받은 방식은 토큰을 URL `searchParams`에 넣어 넘기는 것이었다. 미들웨어가 redirect를 두 번(2-hop) 하면서 토큰을 쿼리스트링에 싣는 구조다.

1. 메인 호스트에서 `/settlement/*`로 들어오면, 미들웨어가 쿠키에서 토큰을 읽어 쿼리스트링에 싣고 정산 호스트로 redirect 한다.
2. 정산 호스트의 미들웨어는 쿼리스트링에서 토큰을 꺼내 쿠키로 set 한 뒤, 토큰을 뗀 깨끗한 URL로 다시 redirect 한다.

```ts
// middleware.ts (1단계 — 지금은 제거된 버전)
if (request.nextUrl.pathname.startsWith('/settlement')) {
  const settlementHost = settlementDomain?.replace(/^https?:\/\//, '');

  // hop 1: 메인 호스트 → 정산 호스트, 토큰을 쿼리에 실어 보냄
  if (!settlementHost || request.headers.get('host') !== settlementHost) {
    const accessToken = request.cookies.get(getCookieName('accessToken'))?.value;
    const refreshToken = request.cookies.get(getCookieName('refreshToken'))?.value;
    const url = new URL(request.nextUrl.pathname, settlementDomain);
    if (accessToken && refreshToken) {
      url.searchParams.set('accessToken', accessToken);
      url.searchParams.set('refreshToken', refreshToken);
    }
    return NextResponse.redirect(url);
  }

  // hop 2: 정산 호스트, 쿼리의 토큰을 쿠키로 옮기고 깨끗한 URL로 redirect
  const accessToken = request.nextUrl.searchParams.get('accessToken');
  const refreshToken = request.nextUrl.searchParams.get('refreshToken');
  if (accessToken && refreshToken) {
    const cleanUrl = new URL(request.nextUrl.pathname, settlementDomain);
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(getCookieName('accessToken'), accessToken, COOKIE_OPTIONS);
    response.cookies.set(getCookieName('refreshToken'), refreshToken, COOKIE_OPTIONS);
    return response;
  }
  return NextResponse.next();
}
```

동작은 한다. 흔히 걱정하는 브라우저 history는 실제로 문제가 되지 않았다. 토큰이 실린 URL은 미들웨어가 서버에서 만든 redirect 중간 주소이고, 사용자가 주소창에 친 주소가 아니다. 브라우저는 redirect를 따라가면서 거쳐 간 URL을 뒤로가기용 history 엔트리로 쌓지 않는다. 게다가 정산 호스트 미들웨어가 토큰을 쿠키로 옮기자마자 토큰을 뗀 URL로 다시 redirect 하니 주소창에도 토큰이 남지 않는다.

그런데도 URL 전달을 버린 건 서버 쪽 로그 때문이다. 리버스 프록시, CDN, 웹서버의 access log에는 풀 URL(`?accessToken=...&refreshToken=...`)이 평문 그대로 쌓인다. 이게 가장 큰 문제였다. redirect 체인 중간에 Referer 헤더로 토큰이 샐 여지도 있었다.

브라우저 쪽은 미들웨어 처리로 막았지만, 네트워크 경로에 남는 로그는 URL 방식으로는 막을 수 없었다. 전달 채널 자체를 URL에서 떼어내야 했다.

---

## 2단계: form POST BFF로 전환 (토큰을 body로)

토큰을 URL 쿼리 대신 POST body에 싣기로 했다. GET redirect로는 body를 실을 수 없어서, 자동으로 submit 되는 HTML form을 중간에 끼워 넣었다.

- 미들웨어가 redirect 대신 `<form method="POST">` HTML을 직접 반환한다. 토큰은 hidden input에 넣는다.
- 이 form은 로드되자마자 `script`로 자동 submit 되어 정산 호스트의 BFF 라우트(`/api/settlement`)로 POST 한다.
- BFF는 `formData`에서 토큰을 꺼내 쿠키로 set 하고 목적지로 redirect 한다.

토큰이 오가는 채널이 GET URL에서 POST body로 바뀌면서, URL 방식으로 막지 못했던 서버 access log와 Referer에도 토큰이 남지 않게 됐다.

```ts
// app/api/settlement/route.ts — 토큰을 받아 쿠키로 심는 BFF
export async function POST(req: NextRequest) {
  const settlementDomain = process.env.NEXT_PUBLIC_SETTLEMENT_DOMAIN;
  if (!settlementDomain) {
    return NextResponse.json({ error: 'Settlement domain is not configured' }, { status: 500 });
  }
  const form = await req.formData();
  const accessToken = String(form.get('accessToken') ?? '');
  const refreshToken = String(form.get('refreshToken') ?? '');
  const next = resolveNext(String(form.get('next') ?? ''));

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL(next, settlementDomain), 303);
  }

  const response = NextResponse.redirect(new URL(next, settlementDomain), 303);
  response.cookies.set(getCookieName('accessToken'), accessToken, COOKIE_OPTIONS);
  response.cookies.set(getCookieName('refreshToken'), refreshToken, COOKIE_OPTIONS);
  return response;
}
```

POST 뒤에 redirect 하므로 status는 303 See Other를 쓴다. POST 결과를 GET으로 따라가게 해서 새로고침할 때 form이 다시 제출되지 않게 한다.

---

## 3단계: BFF 보안 가드 (login-CSRF 방어)

토큰을 받는 POST 엔드포인트를 다른 사이트에 열어 두는 것부터가 위험하다. 공격자가 아무 토큰이나 우리 BFF에 POST 하면 사용자를 공격자 계정으로 로그인시킬 수 있다. login-CSRF다.

그래서 BFF에 가드를 붙였다. Origin과 Referer를 검증해 우리 핸드오프 출처에서 온 POST만 받는다. 토큰이 담긴 form HTML 응답에는 `Cache-Control: no-store`를 붙여 중간 캐시에 토큰이 남지 않게 했다. `settlementDomain`이 설정되지 않았을 때는 미들웨어와 라우트 양쪽에서 early return 한다.

이 단계에서 "동작하는 핸드오프"가 "어느 정도 방어되는 핸드오프"가 됐다.

---

## 4단계: handoff 라우트로 책임 분리

2~3단계의 미들웨어는 도메인 라우팅, form HTML 생성, 토큰 읽기를 모두 떠안고 있었다. 미들웨어는 모든 요청이 거치는 edge 레이어인데, 여기에 토큰 처리와 HTML 생성까지 섞이니 책임이 너무 많았다.

그래서 핸드오프를 `/api/settlement/handoff` 전용 라우트로 분리했다.

- 미들웨어는 경로 기반 도메인 라우팅(`enforceDomain`)만 맡는다. 토큰과 HTML 로직을 전부 걷어내 글 앞에서 본 '현재' 버전의 단순한 형태로 정리했다.
- form_post HTML의 단일 출처는 handoff 라우트다. HttpOnly 쿠키를 서버에서 읽어 form에 emit 한다.
- 정산 메뉴는 미들웨어 redirect에 기대지 않는다. 클릭하면 handoff 엔드포인트를 새 창으로 직접 연다.

```ts
// modules/app/providers/model/menu.hook.tsx
const openSettlement = (args: { key: string }) => {
  window.open(`/api/settlement/handoff?next=${encodeURIComponent(args.key)}`, '_blank');
};
```

이제 핸드오프는 "정산 메뉴 클릭"이라는 사용자 행동에 묶이고, 미들웨어는 라우팅만 한다. 관심사가 깔끔하게 갈렸다.

---

## 5단계: handoff 보안 강화 (open redirect, clickjacking 방어)

마지막으로 handoff 라우트 자체를 조였다.

먼저 `next` 파라미터를 URL 파싱으로 정규화했다. `next`는 핸드오프 뒤에 이동할 경로인데, 그대로 쓰면 open redirect나 제어문자 혼입에 취약하다. `new URL`로 파싱해 pathname만 꺼내고, `/settlement`로 시작하지 않으면 기본값으로 보낸다. handoff와 BFF 양쪽에 똑같이 적용했다.

```ts
// entities/settlement/common/lib/settlement.helper.ts
export function resolveNext(next: string | null) {
  try {
    const { pathname } = new URL(next ?? '', 'http://x');
    return pathname.startsWith('/settlement') ? pathname : '/settlement/summary';
  } catch {
    return '/settlement/summary';
  }
}
```

다음은 응답 보안 헤더다. 토큰이 담긴 form HTML이 iframe에 들어가거나(clickjacking), Referer로 새거나, 외부로 submit 되지 않게 헤더로 막았다.

```ts
// app/api/settlement/handoff/route.ts
const action = new URL('/api/settlement', settlementDomain).toString();
const actionOrigin = new URL(action).origin;
const html = `<!doctype html><html><body>
  <form id="handoff" method="POST" action="${escapeHtmlAttr(action)}">
    <input type="hidden" name="accessToken"  value="${escapeHtmlAttr(accessToken)}" />
    <input type="hidden" name="refreshToken" value="${escapeHtmlAttr(refreshToken)}" />
    <input type="hidden" name="next"         value="${escapeHtmlAttr(next)}" />
  </form>
  <script>document.getElementById('handoff').submit();</script>
</body></html>`;

return new NextResponse(html, {
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    'x-frame-options': 'DENY',
    'content-security-policy': `default-src 'none'; script-src 'unsafe-inline'; form-action ${actionOrigin}`,
  },
});
```

`escapeHtmlAttr`는 토큰과 next 값이 HTML 속성에 끼어드는 인젝션을 막는다. `X-Frame-Options: DENY`로 토큰 form을 iframe에 넣지 못하게 하고, `Referrer-Policy: no-referrer`로 다음 요청에 출처를 드러내지 않는다. CSP `form-action`은 정산 도메인 origin으로 고정해서 자동 submit이 우리 BFF 말고 다른 곳으로 가지 못하게 했다.

---

## 현재 아키텍처: 전체 흐름과 토큰 "구독" 방식

지금의 핸드오프 흐름은 이렇다.

```text
[메인 호스트]
  정산관리 메뉴 클릭
        │  window.open('/api/settlement/handoff?next=/settlement/summary')
        ▼
  GET /api/settlement/handoff           ← 메인 호스트의 BFF
   - HttpOnly 쿠키에서 access/refresh 토큰 읽기
   - 토큰을 hidden input에 담은 auto-submit form HTML 반환
   - no-store / no-referrer / DENY / CSP(form-action=정산도메인)
        │  document.forms[0].submit()  (POST, 토큰은 body)
        ▼
[정산 호스트]
  POST /api/settlement                  ← 정산 호스트의 BFF
   - Origin/Referer 검증 (login-CSRF 방어)
   - formData에서 토큰 꺼내 HttpOnly 쿠키로 set
   - resolveNext(next)로 안전한 경로 계산
        │  303 redirect → next
        ▼
  /settlement/summary  (정산 호스트에 토큰 쿠키 보유 → 로그인된 상태)
```

달라진 건 토큰을 "구독"하는 방식이다. 예전에는 토큰이 URL을 타고 흘렀고, 토큰을 받는 코드가 미들웨어의 쿼리 파싱에 박혀 있었다. 지금은 토큰이 정산 호스트의 HttpOnly 쿠키에 자리 잡고, axios interceptor가 런타임에 요청마다 그 토큰을 구독해 헤더에 넣는다.

```ts
// packages/shared/utils/http/axiosInstance.ts
instance.interceptors.request.use(async (config) => {
  if (isAuth) {
    const accessToken = await getCookie(getCookieName('accessToken'));
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }
  return config;
});
```

401이 떨어지면 refresh subscriber 패턴으로 동시에 나간 요청을 토큰 갱신 한 번에 묶는다. 갱신이 진행 중이면 뒤따르는 요청은 새 토큰을 구독(subscribe)하며 기다리고, 갱신이 끝나면 한꺼번에 새 토큰으로 재시도한다.

```ts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};
const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// 401 처리: 갱신 중이면 새 토큰을 구독하며 대기
if (isRefreshing) {
  return new Promise((resolve) => {
    addRefreshSubscriber((token) => {
      originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
      resolve(instance(originalRequest));
    });
  });
}
```

정리하면 토큰은 호스트 사이에서 form POST로 한 번 위임되고, 정산 호스트 안에서는 HttpOnly 쿠키에 머문다. 요청마다 interceptor가 구독해 헤더에 넣고, 만료되면 subscriber 큐가 갱신을 한 번으로 묶는다. 토큰을 URL로 떠넘기던 구조에서, 쿠키에 자리 잡은 토큰을 런타임이 구독하는 구조로 바뀌었다.

---

## 제약 조건: 왜 "정석"으로 안 갔나

크로스 도메인 토큰 위임의 교과서적인 답은 OAuth-style 인가 코드 교환이다. 프론트에는 일회용 `code`만 넘기고, 정산 호스트가 그 `code`를 백채널(서버-서버)에서 토큰으로 바꾼다. 토큰 자체는 브라우저를 타지 않는다.

하지만 이 방식은 백엔드에 토큰 교환 엔드포인트가 새로 있어야 성립한다. 이 작업의 전제 조건이 바로 그걸 막고 있었다.

> **"백엔드 리소스를 쓰지 말 것."**

정산 호스트 분리는 백엔드 변경 없이 프론트에서 끝내야 하는 작업이었고, 인가 코드 교환은 처음부터 선택지에 없었다.

그래서 BFF를 Next.js Route Handler 안에 둔 설계가 의미를 가진다. `/api/settlement/handoff`와 `/api/settlement`는 프론트 앱이 가진 서버 경계라서 별도 백엔드 서버가 필요 없다. 백엔드 리소스를 한 줄도 늘리지 않고도 토큰을 어디서 읽고 어디에 심을지를 프론트 서버 레이어에서 정할 수 있다. 백엔드를 건드릴 수 없다는 제약 안에서 프론트만으로 할 수 있는 최선이 이 구조였다.

그 제약을 받아들이고 나면 트레이드오프는 분명하다. 토큰은 여전히 한 번은 평문으로 브라우저를 탄다. body로 옮겨 서버 로그와 Referer 노출은 막았지만 백채널 교환만큼 근본적이지는 않다. 그래서 단명(short-lived) 토큰과 HTTPS를 전제로 위험을 절충했다.

백엔드 리소스를 쓸 수 있게 되거나 감사 요구가 더 커지면 인가 코드 교환으로 바꿔야 한다. 핸드오프를 `/api/settlement/handoff` 한 곳에 모아 둔 게 그때의 교체 비용을 줄여 준다. 토큰을 읽어 emit 하는 지점이 하나뿐이라 백채널 교환으로 바꿔도 갈아 끼울 범위가 작다.

---

## 정리

| 단계 | 토큰 전달 채널 | 핵심 변화 |
| --- | --- | --- |
| 1 | URL 쿼리스트링 (middleware 2-hop) | 동작은 함. history는 redirect라 안전, 단 서버 access log/Referer 노출 |
| 2 | form POST body (BFF) | 전달 채널을 URL → body로, 노출 제거 |
| 3 | + Origin/Referer 검증 | login-CSRF 방어, no-store |
| 4 | handoff 라우트 분리 | 미들웨어는 라우팅만, 핸드오프 단일 출처 |
| 5 | + CSP/X-Frame/resolveNext | open redirect, clickjacking 방어 |

토큰을 어떻게 넘기느냐는 결국 어느 채널에 평문이 남느냐의 문제였고, URL에서 body로, 다시 쿠키와 런타임 구독으로 한 칸씩 옮긴 게 이 리팩토링의 전부였다. 백엔드 리소스를 쓰지 않는다는 제약 때문에 인가 코드 교환까지는 가지 못했다. 그 안에서는 BFF만으로 노출 채널을 최대한 좁히고 교체할 지점을 한곳에 모아 두는 게 합리적인 결정이라고 봤다.
