# 정산 도메인을 별도 호스트로 분리하면서 크로스 도메인 토큰 위임을 설계한 과정

> 단일 Next.js 코드베이스를 유지한 채 정산만 다른 호스트(메인 호스트 → 정산 호스트)로 분리하면서,
> 토큰을 어떻게 넘기고 어떻게 "구독"하게 만들지 고민한 기록. URL 쿼리스트링에서 시작해 form POST BFF, BFF 보안 가드,
> handoff 라우트 분리, CSP 강화까지 5단계로 다듬은 과정을 정리한다.

---

## 배경: 왜 정산만 다른 호스트인가

세이프닥 병원 관리자(`safedoc-hospital-admin`)는 병원정보·프로그램·예약·정산을 한 앱에서 다룬다.
이 중 **정산 도메인**은 권한 체계와 감사(audit) 요구가 나머지 기능과 달라서, 운영상 **별도 호스트**로 떼어내야 했다.

- 메인 앱: `app.example.com` (이하 *메인 호스트*)
- 정산 앱: `settle.example.io` (이하 *정산 호스트*)

> 실제 운영 도메인은 가렸다. 두 호스트의 **registrable domain이 서로 다르다**는 점만 기억하면 된다 — 이게 이 글의 모든 문제의 출발점이다.

문제는, 호스트만 분리하고 **코드베이스는 단일 레포로 유지**하고 싶었다는 점이다.
서로 다른 두 앱으로 쪼개면 공통 entities/UI/유틸을 두 벌 관리해야 하고, 정산 자체가 외부업체에서 인수한 코드라 분기 비용이 더 커진다.

그래서 택한 구조가 **Next.js Route Group + Middleware**다.

```text
app/
├── (beforeLogin)/sign/*        # 로그인
├── (afterLogin)/               # 메인 기능
├── (altLayout)/settlement/*    # 정산 — 별도 레이아웃, 같은 코드베이스
└── api/                        # API Routes (BFF)
```

`(altLayout)` 라우트 그룹으로 정산만 별도 레이아웃을 입히고, `middleware.ts`가 **경로 기준으로 호스트를 강제**한다.
`/settlement/*` 요청이 메인 호스트로 들어오면 정산 호스트로, 반대로 정산 호스트로 들어온 비-정산 경로는 메인 호스트로 redirect 한다.

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

여기까지는 라우팅 문제다. 진짜 어려운 부분은 그다음이다.

---

## 진짜 문제: 두 호스트는 쿠키를 공유하지 못한다

세이프닥은 토큰을 **HttpOnly 쿠키**로 들고 있다. `accessToken` / `refreshToken`을 서버 쿠키로 심고, axios interceptor가 매 요청에 `Authorization` 헤더로 실어 보낸다.

```ts
// packages/shared/utils/cookie/cookie.ts
export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
};
```

문제는 메인 호스트와 정산 호스트의 **registrable domain이 다르다**는 것. 같은 회사 서비스지만 브라우저 입장에서는 완전히 남남이라 쿠키가 공유되지 않는다.
즉, 메인 호스트에서 로그인해 토큰을 들고 있어도, 정산 호스트로 넘어가는 순간 그 호스트에는 토큰이 **없다**.

> 정산 메뉴를 클릭한 사용자를, 이미 로그인된 상태 그대로 정산 호스트에 "다시 로그인된 것처럼" 보내려면
> 토큰을 한 번은 **명시적으로 건네줘야(handoff)** 한다.

이 "어떻게 건네줄 것인가"가 이 글의 전부다. 결론부터 말하면 4번의 리팩토링을 거쳤다.

---

## 1단계: URL 쿼리스트링 토큰 전달 (처음 제안받은 방식)

처음 **제안받은 방식**은 토큰을 **URL `searchParams`에 주입**해 넘기는 것이었다.
구조는 **미들웨어 2-hop redirect + URL 쿼리스트링**이다.

1. 메인 호스트에서 `/settlement/*` 진입 → 미들웨어가 토큰을 쿠키에서 읽어 **쿼리스트링에 실어** 정산 호스트로 redirect
2. 정산 호스트의 미들웨어가 쿼리스트링에서 토큰을 꺼내 **쿠키로 set** 한 뒤, 토큰을 뗀 깨끗한 URL로 다시 redirect

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

**동작은 한다.** 한 가지 짚고 넘어갈 건, 흔히 걱정하는 **브라우저 history는 실제 문제가 아니었다**는 점이다.
토큰이 실린 URL은 사용자가 주소창에 직접 친 주소가 아니라 **미들웨어가 서버 단에서 만든 redirect hop**이다.
브라우저는 redirect를 따라갈 때 그 중간 URL을 뒤로가기로 돌아갈 수 있는 history 엔트리로 쌓지 않는다.
게다가 정산 호스트 미들웨어가 토큰을 쿠키로 옮긴 뒤 곧바로 **토큰을 뗀 깨끗한 URL로 다시 redirect**하므로, 주소창에 토큰이 남지도 않는다.

그럼에도 URL 전달을 버린 이유는 **history가 아니라 서버 쪽 로그**다.

- 리버스 프록시 / CDN / 웹서버 **access log**에 풀 URL(`?accessToken=...&refreshToken=...`)이 **평문으로 그대로 적재**된다 — 이게 가장 큰 문제였다
- redirect 체인 중간에 **Referer 헤더**로 토큰이 새어 나갈 여지도 있다

브라우저 단에서는 미들웨어 처리로 막혔지만, **네트워크 경로의 로그**까지는 URL 방식으로 막을 수 없었다.
그래서 전달 채널 자체를 URL에서 떼어내야 했다.

---

## 2단계: form POST BFF로 전환 (토큰을 body로)

핵심 아이디어는 **토큰을 URL 쿼리가 아니라 POST body로 옮기는 것**이다.
GET redirect로는 body를 못 실으니, **auto-submit HTML form**을 끼워 넣는다.

- 미들웨어가 redirect 대신 **`<form method="POST">` HTML을 직접 반환**한다. 토큰은 hidden input에.
- 이 form은 로드 즉시 `script`로 자동 submit → 정산 호스트의 **BFF 라우트(`/api/settlement`)** 로 POST.
- BFF가 `formData`에서 토큰을 꺼내 **쿠키로 set** 한 뒤 목적지로 redirect.

토큰이 이동하는 채널이 GET URL → **POST body**로 바뀌면서, URL 방식으로는 막지 못했던 **서버 access log·Referer**에도 토큰이 남지 않게 됐다.

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

> POST 후 redirect라 status는 **303 See Other**를 쓴다. POST 결과를 GET으로 따라가게 만들어, 새로고침 시 form이 재제출되는 걸 막는다.

---

## 3단계: BFF 보안 가드 (login-CSRF 방어)

남의 사이트에 토큰을 받는 POST 엔드포인트를 열어두는 건 그 자체로 위험하다.
공격자가 임의의 토큰을 우리 BFF에 POST 하면, 사용자를 **공격자 계정으로 로그인시키는 login-CSRF**가 가능하다.

그래서 BFF에 가드를 추가했다.

- **Origin / Referer 검증** — 우리 핸드오프 출처에서 온 POST만 허용
- 토큰이 담긴 form HTML 응답에 **`Cache-Control: no-store`** — 중간 캐시에 토큰이 남지 않도록
- `settlementDomain` 미설정 시 **early return guard** (미들웨어/라우트 양쪽)

이 단계에서 "동작하는 핸드오프"가 "어느 정도 방어되는 핸드오프"로 올라왔다.

---

## 4단계: handoff 라우트로 책임 분리

2~3단계에서 미들웨어는 **도메인 라우팅 + form HTML 생성 + 토큰 읽기**를 다 떠안고 있었다.
미들웨어는 모든 요청을 거치는 edge 레이어라, 여기에 토큰 핸들링·HTML 생성 로직이 섞이는 건 책임 과부하다.

그래서 핸드오프를 **`/api/settlement/handoff` 전용 라우트로 분리**했다.

- **미들웨어**: 경로 기반 도메인 라우팅(`enforceDomain`)만 담당. 토큰·HTML 로직 전부 제거 → 위 0번의 단순한 형태로 정리
- **handoff 라우트**: form_post HTML의 **단일 출처**. HttpOnly 쿠키를 서버에서 읽어 form에 emit
- **정산 메뉴**: 클릭 시 미들웨어 redirect에 의존하지 않고 명시적으로 handoff 엔드포인트를 새 창으로 연다

```ts
// modules/app/providers/model/menu.hook.tsx
const openSettlement = (args: { key: string }) => {
  window.open(`/api/settlement/handoff?next=${encodeURIComponent(args.key)}`, '_blank');
};
```

핸드오프가 "정산 메뉴 클릭"이라는 **명시적 사용자 액션**에 묶이고, 미들웨어는 순수 라우팅으로 돌아갔다.
관심사가 깔끔하게 갈렸다.

---

## 5단계: handoff 보안 강화 (open redirect + clickjacking 방어)

마지막으로 handoff 라우트 자체를 조였다.

**(1) `next` 파라미터를 URL 파싱으로 정규화** — `next`는 핸드오프 후 이동할 경로다. 그대로 쓰면 open redirect나 제어문자 혼입에 취약하다.
`new URL`로 파싱해 **pathname만 추출**하고, `/settlement`로 시작하지 않으면 기본값으로 떨군다. handoff·BFF 양쪽에서 동일하게 적용.

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

**(2) 응답 보안 헤더** — 토큰이 담긴 form HTML이 iframe에 끼워지거나(clickjacking), Referer로 새거나, 외부로 submit 되지 않도록 헤더로 봉쇄.

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

- `escapeHtmlAttr`로 토큰/next 값의 HTML 속성 인젝션 차단
- `X-Frame-Options: DENY` — 토큰 form을 iframe에 못 넣게
- `Referrer-Policy: no-referrer` — 다음 요청에 출처 노출 안 함
- **CSP `form-action`을 정산 도메인 origin으로 고정** — 자동 submit이 우리 BFF 외 다른 곳으로 못 가게

---

## 현재 아키텍처: 전체 흐름과 토큰 "구독" 방식

지금의 핸드오프 전체 흐름은 이렇다.

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

여기서 **"토큰을 구독하는 방식"이 바뀐 지점**이 핵심이다.
예전엔 토큰이 URL을 타고 흘러서, 토큰을 "받는" 코드가 미들웨어의 쿼리 파싱에 박혀 있었다.
지금은 정산 호스트에 **HttpOnly 쿠키로 안착된 토큰을, 런타임에서 axios interceptor가 매 요청마다 구독해 헤더로 주입**한다.

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

그리고 401이 떨어지면 **refresh subscriber 패턴**으로 동시 요청을 한 번의 토큰 갱신에 묶는다.
갱신이 진행 중이면 후속 요청들은 새 토큰을 **구독(subscribe)** 하며 대기하고, 갱신이 끝나면 한꺼번에 새 토큰으로 재시도한다.

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

즉 토큰은 이제 **(1) 호스트 간엔 form POST로 한 번 위임되고 → (2) 정산 호스트 안에선 HttpOnly 쿠키에 앉아 → (3) 매 요청마다 interceptor가 구독해 주입되고 → (4) 만료 시 subscriber 큐로 갱신을 한 번에 묶는** 구조가 됐다.
"토큰을 URL로 떠넘기던" 모델에서 "토큰을 쿠키에 안착시키고 런타임이 구독하는" 모델로 바뀐 것이다.

---

## 제약 조건: 왜 "정석"으로 안 갔나

크로스 도메인 토큰 위임의 교과서적 정답은 **OAuth-style 인가 코드 교환**이다.
일회용 `code`만 프론트로 넘기고, 정산 호스트가 그 `code`를 **백채널(서버-서버)로 토큰과 교환**한다. 토큰 자체는 절대 브라우저를 타지 않는다.

하지만 이 방식은 **백엔드에 토큰 교환 엔드포인트가 새로 있어야** 성립한다. 그리고 이 작업의 전제 조건이 바로 거기였다 —

> **"백엔드 리소스를 쓰지 말 것."**

정산 호스트 분리는 백엔드 변경 없이 프론트에서 끝내야 하는 작업이었다. 인가 코드 교환은 시작부터 선택지에 없었다.

그래서 **BFF를 Next.js Route Handler 안에 두는 설계**가 의미를 가진다.
`/api/settlement/handoff`와 `/api/settlement`는 별도 백엔드 서버가 아니라 **프론트 앱이 소유한 서버 경계**다.
백엔드 리소스를 한 줄도 추가하지 않으면서, "토큰을 어디서 읽고 어디에 심을지"를 프론트 서버 레이어에서 통제할 수 있다.
즉 이 핸드오프 구조는 *더 좋아서* 고른 게 아니라, **백엔드를 못 건드린다는 제약 안에서 프론트만으로 끌어낼 수 있는 최선**이었다.

그 제약을 받아들인 뒤 남는 트레이드오프는 명확하다.

- 토큰이 **여전히 평문으로 한 번은 브라우저를 탄다.** body로 옮겨 서버 로그/Referer 노출은 막았지만, 백채널 교환만큼 근본적이진 않다.
- 그래서 **단명(short-lived) 토큰 + HTTPS 전제**로 위험을 절충했다.
- 백엔드 리소스를 쓸 수 있게 되거나 감사 요구가 더 커지면 인가 코드 교환으로 교체해야 한다. 그때를 위해 핸드오프를 `/api/settlement/handoff` **단일 출처**로 모아둔 게 미래의 교체 비용을 줄여준다 — 토큰을 읽어 emit 하는 지점이 한 곳뿐이라, 백채널 교환으로 바꿔도 갈아끼울 면적이 작다.

---

## 정리

| 단계 | 토큰 전달 채널 | 핵심 변화 |
| --- | --- | --- |
| 1 | URL 쿼리스트링 (middleware 2-hop) | 동작은 함. history는 redirect라 안전, 단 서버 access log/Referer 노출 |
| 2 | form POST body (BFF) | 전달 채널을 URL → body로, 노출 제거 |
| 3 | + Origin/Referer 검증 | login-CSRF 방어, no-store |
| 4 | handoff 라우트 분리 | 미들웨어는 라우팅만, 핸드오프 단일 출처 |
| 5 | + CSP/X-Frame/resolveNext | open redirect·clickjacking 방어 |

토큰을 "어떻게 넘기느냐"는 결국 **어느 채널에 평문이 남는가**의 문제였고,
URL → body → 쿠키 안착 → 런타임 구독으로 한 칸씩 옮기는 과정이 이 리팩토링의 전부였다.
**백엔드 리소스를 쓰지 않는다**는 제약 때문에 인가 코드 교환(정석)까지는 못 갔지만,
그 제약 안에서 프론트 서버 경계(BFF)만으로 노출 채널을 최대한 좁히고 **교체 비용을 한곳에 모아두는 것**까지가 지금 단계에서 내릴 수 있는 합리적인 결정이라고 봤다.
