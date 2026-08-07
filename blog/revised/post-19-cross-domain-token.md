# 정산 도메인을 별도 호스트로 분리하면서 크로스 도메인 토큰 위임을 설계한 과정

> 단일 Next.js 코드베이스를 유지한 채 정산만 다른 호스트(메인 호스트 → 정산 호스트)로 분리하면서,
> 토큰을 어떻게 넘기고 어떻게 "구독"하게 만들지 고민한 기록. URL 쿼리스트링에서 시작해 form POST BFF, BFF 보안 가드,
> handoff 라우트 분리, CSP 강화까지 5단계로 다듬은 과정을 정리한다.
> 마지막 9장에는 두 달 뒤 Next 14 → 16 업그레이드에서 터진 후일담 — 프록시 matcher 범위 때문에 정적 자산이 크로스 오리진으로 새어나가 CORS로 막힌 사고와,
> 같은 리다이렉트에 숨어 있던 오픈 리다이렉트(Next.js 자체 CVE와 같은 클래스) — 을 덧붙였다.

---

## 0. 배경 — 왜 정산만 다른 호스트인가

내가 작업한 병원 어드민 SaaS(이하 `hospital-admin`, 가칭)는 병원정보·프로그램·예약·정산을 한 앱에서 다룬다.
이 중 **정산 도메인**은 권한 체계와 감사(audit) 요구가 나머지 기능과 달라서, 운영상 **별도 호스트**로 떼어내야 했다.

- 메인 앱: `app.example.com` (이하 *메인 호스트*)
- 정산 앱: `settle.example.io` (이하 *정산 호스트*)

> 서비스가 특정되지 않도록 이 글의 도메인·경로·토큰 수명 등 구체 값은 모두 예시다. 두 호스트의 **registrable domain이 서로 다르다**는 점만 기억하면 된다 — 이게 이 글의 모든 문제의 출발점이다.

문제는, 호스트만 분리하고 **코드베이스는 단일 레포로 유지**하고 싶었다는 점이다.
서로 다른 두 앱으로 쪼개면 공통 entities/UI/유틸을 두 벌 관리해야 하고, 정산 자체가 외부업체에서 인수한 코드라 분기 비용이 더 커진다.

채택한 구조가 **Next.js Route Group + Middleware**다.

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
// middleware.ts (분리 초기 버전 — 지금은 proxy.ts 고, 9장에서 다시 손본다)
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

export const config = {
  matcher: ['/((?!api).*)'],
};
```

여기까지는 라우팅 문제다. 진짜 어려운 부분은 그다음이다.
(다만 이 스니펫에는 **두 달 뒤에 터질 버그가 두 개** 들어 있다. 9장에서 다시 본다.)

---

## 1. 진짜 문제 — 두 호스트는 쿠키를 공유하지 못한다

이 서비스는 토큰을 **HttpOnly 쿠키**로 들고 있다. `accessToken` / `refreshToken`을 서버 쿠키로 심고, axios interceptor가 매 요청에 `Authorization` 헤더로 실어 보낸다.

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

## 2. 1단계 — URL 쿼리스트링 토큰 전달 (처음 제안받은 방식)

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

**동작은 한다.** 흔히 걱정하는 브라우저 history부터 짚으면, 토큰이 실린 URL은 사용자가 주소창에 직접 친 주소가 아니라 **미들웨어가 서버 단에서 만든 redirect hop**이다.
서버 리다이렉트라 브라우저의 최종 히스토리 엔트리에는 토큰이 남지 않고, 정산 호스트 미들웨어가 토큰을 쿠키로 옮긴 뒤 곧바로 **토큰을 뗀 깨끗한 URL로 다시 redirect**하므로 주소창에도 남지 않는다.
다만 "안전하다"고 말할 수 있는 범위는 정확히 거기까지다. 중간 URL 자체는 네트워크를 타기 때문에, 브라우저 밖에는 그대로 남는다.

- 리버스 프록시 / CDN / 웹서버 **access log**에 풀 URL(`?accessToken=...&refreshToken=...`)이 **평문으로 그대로 적재**된다 — 이게 가장 큰 문제였다
- redirect 체인 중간에 **Referer 헤더**로 토큰이 새어 나갈 여지도 있다

브라우저 히스토리 관점에서는 미들웨어 처리로 막혔지만, **네트워크 경로의 로그**까지는 URL 방식으로 막을 수 없었다.
그래서 전달 채널 자체를 URL에서 떼어내야 했다.

---

## 3. 2단계 — form POST BFF로 전환 (토큰을 body로)

핵심 아이디어는 **토큰을 URL 쿼리가 아니라 POST body로 옮기는 것**이다.
GET redirect로는 body를 못 실으니, **auto-submit HTML form**을 끼워 넣는다. 받는 쪽은 BFF(Backend for Frontend, 프론트 앱이 소유한 서버 계층)다.

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

여기서 **refresh token까지 함께 넘길지**는 별도의 논점이다. 정산 호스트에서도 access token 만료 시 재발급이 필요하다고 보고 둘 다 넘겼지만, refresh token은 수명이 길어 탈취 시 영향이 access와는 비교가 안 되게 크다.
access만 위임하고 만료 시 handoff를 다시 타게 하면 위임 표면이 절반으로 줄고, 정산 화면의 평균 체류 시간이 access 수명보다 짧다면 재발급이 실제로 일어나는 일 자체가 드물다.
"access만 위임 + 만료 시 재-handoff"로 좁히는 방안은 체류 시간 데이터를 확인한 뒤 적용할 후속 과제로 남긴다.

---

## 4. 3단계 — BFF 보안 가드 (login-CSRF 방어)

남의 사이트에 토큰을 받는 POST 엔드포인트를 열어두는 건 그 자체로 위험하다.
공격자가 임의의 토큰을 우리 BFF에 POST 하면, 사용자를 **공격자 계정으로 로그인시키는 login-CSRF**(피해자를 공격자 세션에 앉히는 CSRF 변종)가 가능하다.

그래서 BFF에 가드를 추가했다. 말로만 두지 않고 코드로 보면 이렇다.

```ts
// app/api/settlement/route.ts — Origin 화이트리스트 검증
const ALLOWED_HANDOFF_ORIGINS = [
  process.env.NEXT_PUBLIC_DOMAIN, // 메인 호스트 — handoff form이 여기서 제출된다
  process.env.NEXT_PUBLIC_SETTLEMENT_DOMAIN,
].filter((v): v is string => Boolean(v));

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin || !ALLOWED_HANDOFF_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }
  // ... 이하 토큰 처리 (2단계 코드와 동일)
}
```

- **Origin 화이트리스트 검증** — 우리 핸드오프 출처(메인 호스트)에서 온 POST만 허용. Origin이 아예 없는 요청도 거부한다
- 토큰이 담긴 form HTML 응답에 **`Cache-Control: no-store`** — 중간 캐시에 토큰이 남지 않도록
- `settlementDomain` 미설정 시 **early return guard** (미들웨어/라우트 양쪽)

한 가지 함정이 있었다. cross-origin POST에서 문서의 referrer policy가 `no-referrer`면 브라우저가 **Origin 헤더까지 `null`로 직렬화**한다. 그래서 handoff 응답의 Referrer-Policy는 `no-referrer`가 아니라 `origin`(경로·쿼리를 뺀 출처만 노출)으로 지정했다 — handoff URL에는 토큰이 없으므로 출처가 노출되는 건 문제가 아니고, 이렇게 해야 수신 BFF의 Origin 검증이 성립한다.

이 단계에서 "동작하는 핸드오프"가 "어느 정도 방어되는 핸드오프"로 올라갔다.

---

## 5. 4단계 — handoff 라우트로 책임 분리

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

## 6. 5단계 — handoff 보안 강화 (open redirect + clickjacking 방어)

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
const nonce = crypto.randomUUID().replace(/-/g, '');
const html = `<!doctype html><html><body>
  <form id="handoff" method="POST" action="${escapeHtmlAttr(action)}">
    <input type="hidden" name="accessToken"  value="${escapeHtmlAttr(accessToken)}" />
    <input type="hidden" name="refreshToken" value="${escapeHtmlAttr(refreshToken)}" />
    <input type="hidden" name="next"         value="${escapeHtmlAttr(next)}" />
  </form>
  <script nonce="${nonce}">document.getElementById('handoff').submit();</script>
</body></html>`;

return new NextResponse(html, {
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'referrer-policy': 'origin',
    'x-frame-options': 'DENY',
    'content-security-policy': `default-src 'none'; script-src 'nonce-${nonce}'; form-action ${actionOrigin}`,
  },
});
```

- `escapeHtmlAttr`로 토큰/next 값의 HTML 속성 인젝션 차단
- `X-Frame-Options: DENY` — 토큰 form을 iframe에 못 넣게
- `Referrer-Policy: origin` — 경로·쿼리를 뺀 출처만 노출. `no-referrer`로 하면 cross-origin POST의 Origin 헤더가 `null`이 되어 3단계의 Origin 검증이 깨진다 (handoff URL에는 토큰이 없어 출처 노출 자체는 무해하다)
- **CSP `script-src`를 `'unsafe-inline'`이 아니라 요청마다 새로 만든 nonce로 제한** — 이 페이지의 외부 입력은 `escapeHtmlAttr`로 이미 좁혀뒀지만, 인라인 스크립트 전체를 여는 것보다 실행 가능한 스크립트를 auto-submit 한 줄로 못박는 편이 낫다
- **CSP `form-action`을 정산 도메인 origin으로 고정** — 자동 submit이 우리 BFF 외 다른 곳으로 못 가게

---

## 7. 현재 아키텍처 — 전체 흐름과 토큰 "구독" 방식

지금의 핸드오프 전체 흐름은 이렇다.

```text
[메인 호스트]
  정산관리 메뉴 클릭
        │  window.open('/api/settlement/handoff?next=/settlement/summary')
        ▼
  GET /api/settlement/handoff           ← 메인 호스트의 BFF
   - HttpOnly 쿠키에서 access/refresh 토큰 읽기
   - 토큰을 hidden input에 담은 auto-submit form HTML 반환
   - no-store / referrer=origin / DENY / CSP(nonce, form-action=정산도메인)
        │  document.forms[0].submit()  (POST, 토큰은 body)
        ▼
[정산 호스트]
  POST /api/settlement                  ← 정산 호스트의 BFF
   - Origin 화이트리스트 검증 (login-CSRF 방어)
   - formData에서 토큰 꺼내 HttpOnly 쿠키로 set
   - resolveNext(next)로 안전한 경로 계산
        │  303 redirect → next
        ▼
  /settlement/summary  (정산 호스트에 토큰 쿠키 보유 → 로그인된 상태)
```

여기서 **"토큰을 구독하는 방식"이 바뀐 지점**이 핵심이다.
예전엔 토큰이 URL을 타고 흘러서, 토큰을 "받는" 코드가 미들웨어의 쿼리 파싱에 박혀 있었다.
지금은 정산 호스트에 **HttpOnly 쿠키로 안착된 토큰을, 런타임에서 axios interceptor가 매 요청마다 구독해 헤더로 주입**한다.

한 가지 짚어둘 점: 여기서 `getCookie`는 브라우저가 `document.cookie`를 읽는 helper가 아니다. HttpOnly 쿠키는 스크립트에서 직접 읽을 수 없으므로, `getCookie`는 Server Function을 경유해 서버에서 쿠키를 읽어 돌려준다. HttpOnly가 막는 것은 스크립트의 직접 접근이고, 이 우회는 그만큼의 왕복 비용과 "값이 JS로 돌아온 순간 HttpOnly 보호 밖"이라는 트레이드오프를 진다.

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

## 8. 제약 조건 — 왜 "정석"으로 안 갔나

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
- **refresh token까지 위임하는 현재 구조는 위임 표면이 넓다.** access만 위임하고 만료 시 재-handoff하는 방안(3장)이 후속 과제다.
- 백엔드 리소스를 쓸 수 있게 되거나 감사 요구가 더 커지면 인가 코드 교환으로 교체해야 한다. 그때를 위해 핸드오프를 `/api/settlement/handoff` **단일 출처**로 모아둔 게 미래의 교체 비용을 줄여준다 — 토큰을 읽어 emit 하는 지점이 한 곳뿐이라, 백채널 교환으로 바꿔도 갈아끼울 면적이 작다.

---

## 9. 후일담 — 두 달 뒤, 프레임워크 버전을 올리자 정산 화면이 통째로 깨졌다

호스트를 분리하고 두 달쯤 지나 프레임워크를 **Next 14 → 16**으로 올렸다(빌드도 Turbopack으로 전환). 올린 다음 날 정산 호스트에서 화면이 통째로 깨졌다.

Next 16부터 `middleware.ts` 파일 컨벤션이 deprecated 되고 `proxy.ts`로 바뀐다. export 이름도 `middleware` → `proxy`, 기본 런타임도 Edge → Node.js다. 이 코드는 host 헤더를 보고 redirect 하는 게 전부라 **이관 자체는 이름만 바꾸면 끝**이었다 — 그래서 matcher는 손대지 않고 그대로 옮겼다.

```ts
// proxy.ts — 이름만 바뀌고 로직·matcher 는 그대로
export function proxy(request: NextRequest) { ... }

export const config = {
  matcher: ['/((?!api).*)'], // ← 문제는 처음부터 여기 있었다
};
```

### 9-1. 무슨 일이 벌어졌나 — 정적 자산이 크로스 오리진으로 새어나갔다

matcher가 `api`만 빼고 **나머지 전부**를 잡는다. `/_next/**`도 당연히 포함이다.
그래서 정산 호스트로 들어온 청크·스타일·이미지 요청이 "경로가 `/settlement`로 시작하지 않는다"는 이유로 **전부 메인 호스트로 307** 됐다.

```text
GET https://settle.example.io/_next/static/chunks/main.js
  → 307 Location: https://app.example.com/_next/static/chunks/main.js   ← 오리진이 바뀐다
  ✖ blocked by CORS: No 'Access-Control-Allow-Origin' header is present
```

리다이렉트를 따라가는 순간 **응답을 주는 오리진이 바뀐다.** CORS 모드로 나가는 요청은 목적지가 `Access-Control-Allow-Origin`을 주지 않으면 그 자리에서 차단되고, 메인 호스트는 정산 호스트를 위한 CORS 헤더를 줄 이유가 없다. 결과적으로 정산 화면이 **자기 오리진의 자산을 한 개도 못 받는** 상태가 됐다.

호스트 강제는 원래 **페이지 라우트에만** 필요한 규칙이었다. 정적 자산은 어느 호스트로 들어오든 그 호스트가 그대로 서빙하면 되는 것이었는데, "정산이 아니면 메인으로"라는 규칙을 경로 전체에 무차별로 건 게 화근이었다.

### 9-2. 왜 하필 버전을 올린 뒤였나 — 두 배포를 나란히 놓고 확인했다

matcher는 분리 첫날부터 `/((?!api).*)`였다. **설정은 처음부터 틀려 있었고, 두 달 동안 증상만 없었다.**
그런데 "버전 올려서 터졌다"는 말은 원인 규명이 아니라 알리바이가 되기 쉽다. 그래서 아직 구버전이 떠 있는 환경과 새 버전 환경의 **SSR HTML을 직접 받아 비교**했다.

```html
<!-- 구버전(14, webpack) 로그인 화면 — script 태그 20개 중 crossorigin 붙은 것 0개 -->
<script src="/_next/static/chunks/main-app-b501dcbc.js" async=""></script>

<!-- 신버전(16, Turbopack) 같은 화면 — script 태그 18개 중 11개에 crossorigin="" -->
<script src="/_next/static/chunks/2vahfoug1t-u8.js" async="" crossorigin=""></script>
```

`crossorigin=""`은 **빈 값이라 무시되는 게 아니라 `anonymous`와 동치**다. 값이 비었거나 알 수 없는 값이면 브라우저는 `anonymous`로 해석하고, 그 순간 그 요청은 **CORS 모드**로 나간다.
즉 14에서 no-cors로 나가던 청크 요청이, 16에서는 **같은 URL에 대한 CORS 요청**이 됐다.

나머지 한 칸은 목적지 쪽이다. 메인 호스트의 `/_next/static/**` 응답에는 `Access-Control-Allow-Origin`이 없다 — 정산 호스트 Origin을 붙여 직접 요청해 확인했고, 돌아온 건 `Vary: Accept-Encoding`뿐이다. CORS 헤더를 붙여둔 곳은 `/api/*`뿐이고, 정적 자산에 그걸 붙일 이유는 원래 없다.

정리하면 **세 조건이 동시에 만족될 때만** 터진다.

1. 정산 호스트로 들어온 `/_next/**`가 메인 호스트로 **307** — 틀린 matcher, **처음부터 있었음**
2. 그 청크 요청이 **CORS 모드** — `crossorigin=""`, **16 + Turbopack에서 새로 생김**
3. 목적지에 **ACAO 없음** — 정적 자산이니 당연

(2)가 없던 두 달 동안 (1)은 조용히 성공했다. 브라우저가 크로스 오리진 307을 그냥 따라가 스크립트를 실행해줬기 때문이다.
가장 확실한 증거는 지금도 돌아가고 있다 — **아직 구버전이 떠 있는 환경은 이 순간에도 정산 호스트의 `/_next/**`를 메인 호스트로 307 시키고 있고, 멀쩡하다.** 미스라우팅은 그대로인 채 증상만 없는 상태다.

그래서 결론은 이렇게 정리된다. **버전 업이 버그를 만든 게 아니라, 원래 틀려 있던 matcher 범위를 드러냈다.**
프레임워크가 자산을 어떤 모드로 요청하느냐는 언제든 바뀔 수 있는 구현 세부사항인데, 나는 두 달 동안 그 세부사항에 기대어 "동작하니까 맞는 설정"이라고 믿고 있었다.

### 9-3. 고친 것

```ts
export const config = {
  // 정산 도메인에서도 정적 리소스는 그대로 서빙돼야 한다.
  // `_next`·`favicon.ico`·`images`(public) 를 빼지 않으면 청크·폰트·이미지가 전부
  // 메인 도메인으로 307 리다이렉트돼 크로스 오리진으로 새어나간다.
  // 구분자까지 포함해 세그먼트에 앵커한다. `api` 로만 쓰면 `/apidocs` 같은 페이지 경로도 빠진다.
  matcher: ['/((?!api/|_next/|favicon\\.ico|images/).*)'],
};
```

- **정적 경로를 matcher에서 제외** — `_next/`, `favicon.ico`, `images/`(public). 호스트 강제는 페이지 라우트에만 건다.
- **구분자까지 포함해 세그먼트에 앵커** — 제외 목록은 넓어도 좁아도 버그다. `api`로만 쓰면 `/apidocs` 같은 **페이지** 경로까지 프록시에서 빠져 호스트 강제가 안 걸린다.
- **서버액션은 별도 처리** — `serverActions.allowedOrigins`에 두 호스트를 모두 등록했다. 서버액션 CSRF 검사는 Origin과 Host(`X-Forwarded-Host`)를 비교하는데, 두 호스트가 같은 배포를 가리키므로 한쪽만 등록하면 다른 쪽 화면의 서버액션이 통째로 403이 된다.
- **리다이렉트가 쿼리를 버리던 것도 같이 고쳤다** — `pathname`만 넘기면 필터·페이지 쿼리는 물론 RSC의 `_rsc`까지 날아간다.

그리고 이 수정은 **한 번 되돌아갔다.** 다른 PR에 matcher가 `/((?!api).*)`인 옛 버전이 섞여 들어가면서 수정이 기본 브랜치에서 조용히 사라졌고, 하루 만에 같은 증상으로 다시 깨졌다.
설정 한 줄짜리 수정은 리뷰에서 눈에 띄지 않고, 테스트로 고정하기도 어렵다. 위 주석이 그렇게 긴 건 그래서다 — **"왜 여기서 빠져야 하는가"를 코드 옆에 적어두는 것**이 이런 종류의 코드에 걸 수 있는 유일한 가드였다.

### 9-4. 같은 리다이렉트에 숨어 있던 오픈 리다이렉트, 그리고 CVE-2026-64645

matcher를 손보다가 `enforceDomain`의 redirect 자체에 오픈 리다이렉트가 있는 걸 발견했다.

```ts
// 취약 — 2장부터 계속 이 상태였다
return NextResponse.redirect(new URL(request.nextUrl.pathname, domain));
```

`new URL(pathname, base)`는 pathname이 `//`로 시작하면 그걸 **protocol-relative URL**로 해석해 base의 host를 통째로 무시한다. 즉 `//evil.com`으로 들어온 요청이 `https://evil.com`으로 307 나간다. 프록시는 서버의 중복 슬래시 정규화보다 **먼저** 돌기 때문에 정규화에 기댈 수도 없다.

```ts
// 고침 — setter 는 host 를 바꾸지 못한다
const redirectUrl = new URL(domain); // 목적지 host 는 env 에서만 온다
redirectUrl.pathname = request.nextUrl.pathname;
redirectUrl.search = request.nextUrl.search;
return NextResponse.redirect(redirectUrl);
```

핵심은 **목적지 호스트가 요청에서 온 값에 닿지 않게 하는 것**이다. host는 env에서만 오고, 요청에서 오는 건 pathname·search뿐이며, 그마저도 host를 바꿀 수 없는 setter로만 꽂는다.

이게 나만의 실수가 아니라는 건 비슷한 시기에 공개된 Next.js 취약점이 보여준다 — [CVE-2026-64645](https://www.cve.org/CVERecord?id=CVE-2026-64645) (GHSA-p9j2-gv94-2wf4, CVSS 4.0 기준 8.3 High).

> `rewrites()` / `redirects()` 규칙이 **요청에서 온 입력으로 목적지 호스트를 조립하면**, 규칙에 적어둔 호스트 suffix와 무관하게 임의 호스트를 가리키게 만들 수 있다.
> rewrite면 Next가 그 호스트로 요청을 대신 보내고 응답을 앱 오리진으로 내보내므로 **SSRF**, redirect면 **오픈 리다이렉트**다.
> 영향 범위는 `>= 12.0.0 < 15.5.21`, `>= 16.0.0 < 16.2.11`. **15.5.21 / 16.2.11**에서 수정됐다.

구조가 내 버그와 정확히 같다. 나는 `new URL(pathname, base)`의 protocol-relative 해석으로, 프레임워크는 rewrite/redirect 목적지 조립으로 **같은 자리**에 도달했다. 호스트 강제를 직접 짜든 `next.config`의 `rewrites`/`redirects`에 맡기든, 확인할 건 하나다 —

> **목적지 host가 어디서 오는가. 요청이 준 값이 거기에 한 글자라도 섞이면 그 리다이렉트는 공격자 것이다.**

(버전 얘기를 덧붙이면, 현재는 16.2.12를 쓰고 있어 이 패치는 들어와 있다. 프레임워크 업그레이드가 이 장의 사고를 불러왔지만, 동시에 이 CVE의 패치도 같이 실어 왔다.)

### 9-5. 이 후일담이 남긴 것

| 증상 | 원인 | 고친 방식 |
| --- | --- | --- |
| 정산 호스트에서 정적 자산이 전부 CORS 차단 | matcher가 `_next/**`까지 잡아 크로스 오리진 307 | 정적 경로를 matcher에서 제외 |
| `/apidocs` 같은 페이지에 호스트 강제가 안 걸림 | `api`가 세그먼트에 앵커되지 않음 | 구분자까지 포함(`api/`) |
| 정산 화면의 서버액션 403 | Origin과 Host 불일치 | `serverActions.allowedOrigins`에 두 호스트 |
| 필터·페이지·`_rsc` 쿼리 유실 | redirect가 pathname만 전달 | `search`까지 전달 |
| `//evil.com` 오픈 리다이렉트 | `new URL(pathname, base)`의 protocol-relative 해석 | host는 env, 나머지는 setter로만 |

호스트를 강제하는 코드는 결국 **"무엇을 리다이렉트할까"가 아니라 "무엇은 절대 리다이렉트하면 안 되는가"를 먼저 적는 코드**였다.
정적 자산과 API는 절대 아니고, 목적지 host는 절대 요청에서 오면 안 된다. 이 두 줄을 0장에서 적어뒀다면 9장은 없었을 것이다.

---

## 정리

| 단계 | 토큰 전달 채널 | 핵심 변화 |
| --- | --- | --- |
| 1 | URL 쿼리스트링 (middleware 2-hop) | 동작은 함. 서버 리다이렉트라 최종 히스토리엔 안 남지만, 중간 URL이 access log·Referer·프록시에 남음 |
| 2 | form POST body (BFF) | 전달 채널을 URL → body로, 노출 제거 |
| 3 | + Origin 화이트리스트 검증 | login-CSRF 방어, no-store |
| 4 | handoff 라우트 분리 | 미들웨어는 라우팅만, 핸드오프 단일 출처 |
| 5 | + CSP(nonce)/X-Frame/resolveNext | open redirect·clickjacking 방어 |

토큰을 "어떻게 넘기느냐"는 결국 **어느 채널에 평문이 남는가**의 문제였고,
URL → body → 쿠키 안착 → 런타임 구독으로 한 칸씩 옮기는 과정이 이 리팩토링의 전부였다.
**백엔드 리소스를 쓰지 않는다**는 제약 때문에 인가 코드 교환(정석)까지는 못 갔지만,
그 제약 안에서 프론트 서버 경계(BFF)만으로 노출 채널을 최대한 좁히고 **교체 비용을 한곳에 모아두는 것**까지가 지금 단계에서 내릴 수 있는 합리적인 결정이라고 봤다.

9장이 덧붙인 교훈은 층위가 조금 다르다. 토큰 위임 채널을 아무리 좁혀놔도, 그 앞단에서 **호스트를 강제하는 규칙의 범위가 틀려 있으면** 화면 자체가 안 뜬다.
그리고 그 틀림은 프레임워크 버전을 올리기 전까지 두 달 동안 아무 증상도 내지 않았다. 크로스 도메인 구성에서 진짜 위험한 건 "지금 동작한다"는 사실 자체였다.
