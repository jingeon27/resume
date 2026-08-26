# 정산 서비스를 별도 호스트로 분리하며 토큰 전달 방식을 바꾼 과정

정산 화면을 별도 호스트로 분리한 뒤 로그인 상태를 넘겨야 했다. 메인 서비스와 정산 서비스는 등록 가능 도메인이 달라 쿠키를 공유할 수 없었다. 첫 구현은 토큰을 URL에 넣어 보낸 뒤 정산 호스트의 미들웨어가 쿠키로 옮기는 방식이었다.

브라우저에서는 잘 동작했다. 최종 주소에서도 토큰이 바로 사라졌다. 하지만 중간 URL은 프록시와 서버의 access log를 지나고, Referer로 전달될 가능성도 있었다. 화면에서 보이지 않는다는 이유로 안전한 구조는 아니었다.

아래 도메인과 경로는 공개를 위해 바꿨다.

- 메인 서비스: `app.example.com`
- 정산 서비스: `finance.example.net`

## URL 대신 POST 본문으로 전달했다

두 화면은 같은 Next.js 코드베이스를 사용하고 미들웨어가 경로에 맞는 호스트로 보낸다. 서로 다른 호스트 사이에서는 GET 리다이렉트로 HttpOnly 쿠키를 옮길 수 없다. 그렇다고 토큰을 쿼리 문자열에 계속 둘 수도 없었다.

프론트엔드가 소유한 BFF 사이에 자동 제출 form을 두었다.

```text
[메인 호스트]
정산 메뉴 클릭
  → GET /api/finance/bridge
  → HttpOnly 쿠키에서 토큰을 읽어 자동 제출 폼 반환

[정산 호스트]
POST /api/finance
  → formData의 토큰을 HttpOnly 쿠키에 저장
  → 허용된 정산 경로로 303 redirect
```

GET redirect에는 body를 넣을 수 없어 숨김 input을 가진 HTML form을 반환했다. 토큰은 URL이 아니라 POST body를 통해 이동한다.

```ts
export async function POST(req: NextRequest) {
  const secondaryOrigin = process.env.SECONDARY_ORIGIN;
  if (!secondaryOrigin) {
    return NextResponse.json(
      { error: 'Secondary origin is not configured' },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const sessionToken = String(form.get('sessionToken') ?? '');
  const renewalToken = String(form.get('renewalToken') ?? '');
  const destination = resolveDestination(
    String(form.get('destination') ?? ''),
  );

  const response = NextResponse.redirect(
    new URL(destination, secondaryOrigin),
    303,
  );
  response.cookies.set('sessionToken', sessionToken, AUTH_COOKIE_SETTINGS);
  response.cookies.set('renewalToken', renewalToken, AUTH_COOKIE_SETTINGS);
  return response;
}
```

POST 처리 뒤에는 `303 See Other`로 이동시켰다. 브라우저가 다음 요청을 GET으로 바꾸기 때문에 새로고침할 때 form이 다시 제출되지 않는다.

이 변경으로 쿼리 문자열과 Referer, 일반적인 URL 접근 로그에 토큰이 남을 가능성은 줄었다. POST 본문도 무조건 안전하지는 않다. WAF나 APM이 요청 본문을 기록한다면 토큰은 다시 로그에 남는다. 핸드오프 경로의 본문 수집 여부와 보존 정책까지 함께 확인해야 한다.

이 글을 쓴 뒤로 하나가 달라졌다. 두 쿠키의 보호 수준이 이제 같지 않다. 다른 이유로 `sessionToken`을 클라이언트가 직접 읽어야 해서 httpOnly 없이 심게 됐다. 핸드오프가 옮기는 값은 그대로지만, 옮겨간 뒤로는 두 호스트 모두에서 스크립트가 읽을 수 있다. 왜 그렇게 했는지는 이 글에서 다루지 않는다.

## 미들웨어에서 토큰 처리 책임을 뺐다

처음에는 미들웨어가 호스트 라우팅, 토큰 읽기, HTML 생성까지 모두 담당했다. 모든 요청이 통과하는 코드에 인증 핸드오프까지 넣으니 변경 영향 범위가 너무 넓었다.

역할을 다음처럼 나눴다.

- 미들웨어는 경로에 맞는 호스트로 보내는 일만 한다.
- `/api/finance/bridge`는 메인 호스트의 쿠키를 읽고 form을 만든다.
- `/api/finance`는 정산 호스트에서 토큰을 쿠키로 저장한다.
- 정산 메뉴는 bridge 경로를 새 창으로 연다.

핸드오프 시작점이 하나가 되면서 이후 전달 방식을 바꾸더라도 메뉴와 라우팅 코드를 함께 수정할 필요가 없어졌다.

## 목적지는 경로만 허용했다

form이 전달받은 `destination`을 그대로 redirect에 사용하면 외부 주소로 보낼 수 있다. URL을 파싱한 뒤 host와 query를 버리고 정산 경로만 허용했다.

```ts
export function resolveDestination(destination: string | null) {
  try {
    const { pathname } = new URL(destination ?? '', 'http://internal');
    const isFinancePath =
      pathname === '/finance' || pathname.startsWith('/finance/');

    return isFinancePath ? pathname : '/finance/overview';
  } catch {
    return '/finance/overview';
  }
}
```

문자열에 `/finance`가 포함되는지만 검사하면 `/finance-evil`도 통과한다. 허용된 prefix의 경계를 `/finance`와 `/finance/`로 나눠 확인했다. bridge와 수신 BFF가 같은 함수를 사용하게 해 두 단계의 판단도 맞췄다.

## 자동 제출 폼의 이동 범위도 제한했다

자동 제출 HTML에는 토큰이 들어 있으므로 캐시되거나 다른 페이지에 삽입되지 않아야 한다. input 값은 HTML attribute에 맞게 escape하고, 응답 헤더로 제출 대상과 문서의 사용 범위를 제한했다.

```ts
return new NextResponse(html, {
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    'x-frame-options': 'DENY',
    'content-security-policy': `default-src 'none'; script-src 'unsafe-inline'; form-action ${submissionOrigin}`,
  },
});
```

`form-action`은 토큰을 정산 호스트가 아닌 곳으로 제출하는 것을 막고, `X-Frame-Options`는 문서가 iframe에 들어가는 것을 막는다. `no-store`는 토큰이 담긴 HTML의 캐시를 금지한다.

이 헤더들이 막아주는 건 토큰이 실린 이 문서가 다른 곳으로 새는 경로까지다. 자동 제출 스크립트를 인라인으로 두는 이상 `script-src`는 nonce를 쓸 때보다 넓게 열려 있다. 대신 문서를 오래 살려두지 않는 쪽으로 갔다. 한 번 쓰고 버려지고, 캐시되지 않고, 프레임에도 들어가지 않는다.

## 인가 코드 교환을 쓰지 못한 이유

가장 안전한 방향은 브라우저에 일회용 code만 보내고 정산 서버가 토큰으로 교환하는 방식이다. 토큰이 브라우저를 통과하지 않고, code에 짧은 만료 시간과 일회 소비 조건을 둘 수 있다.

당시에는 제품 백엔드나 공유 저장소를 추가하지 않는다는 제약이 있었다. Next.js Route Handler만으로 교환 API의 모양은 만들 수 있지만, 여러 인스턴스에서 일회 소비를 보장하려면 TTL과 원자적 소비를 지원하는 공유 상태가 필요하다. 그래서 프론트엔드 배포 범위에서 가능한 POST BFF를 선택했다.

이 선택은 최종형이 아니다. 남은 것들은 구현이 덜 됐다기보다 이 방식이면 따라오는 성질에 가깝다.

- 액세스 토큰과 리프레시 토큰이 브라우저를 한 번 지난다. URL에 실리던 때보다 노출 범위는 좁아졌지만 0이 되지는 않는다.
- 두 호스트에 리프레시 토큰이 복제되므로 rotation과 로그아웃 동기화를 두 곳에서 맞춰야 한다.
- 일회용 code가 아니어서 재사용 방지와 세션 결합이 code 교환 방식만큼 강하지 않다.
- 옮겨진 뒤 두 쿠키의 보호 수준이 다르다. 핸드오프가 정한 것은 아니지만 결과는 이 경로로도 이어진다.

이것들은 code 교환으로 바꾸기 전에는 줄일 수는 있어도 없어지지 않는다. 그래서 이 방식을 쓰는 동안의 안전은 헤더 설정보다 토큰 수명과 rotation 정책에 더 달려 있다.

다만 핸드오프가 `/api/finance/bridge` 한 곳에서 시작하므로, 공유 저장소를 운영할 수 있게 되면 메뉴나 화면을 건드리지 않고 인가 코드 교환 방식으로 바꿀 수 있다.

## 석 달 뒤, 같은 미들웨어에서 다른 문제가 드러났다

Next.js 14.2에서 16.3으로 올린 뒤 정산 화면의 JavaScript 청크가 로드되지 않았다. 원인은 토큰 전달 코드가 아니라 호스트를 강제하던 matcher였다.

```ts
// 문제가 있던 범위
export const config = {
  matcher: ['/((?!api).*)'],
};
```

이 패턴은 `/_next/**`도 잡았다. 정산 호스트에서 요청한 청크가 정산 경로가 아니라는 이유로 메인 호스트로 307 redirect됐다.

```text
GET https://finance.example.net/_next/static/chunks/main.js
  → 307 https://app.example.com/_next/static/chunks/main.js
```

기존 버전에서는 우연히 드러나지 않았지만, 16.3이 일부 script에 `crossorigin=""`을 붙이면서 redirect된 청크 요청이 CORS 검사를 받았고 화면 전체가 깨졌다. 업그레이드가 matcher 버그를 만든 것이 아니라 숨어 있던 범위 오류를 드러낸 셈이었다.

장애 대응에서는 버전을 `~16.2.12`로 고정하고 정적 자산을 matcher에서 제외했다. `^16.2.12`로 지정하면 16.3도 다시 설치될 수 있어 회피책이 되지 않았다.

```ts
export const config = {
  matcher: ['/((?!api/|_next/|favicon\\.ico|assets/).*)'],
};
```

redirect URL도 base에 pathname을 바로 결합하지 않고 목적지 origin을 먼저 고정한 뒤 `pathname`과 `search`를 대입했다. 쿼리 유실과 `//`로 시작하는 경로의 protocol-relative 해석을 함께 막기 위해서였다.

```ts
const destinationUrl = new URL(domain);
destinationUrl.pathname = request.nextUrl.pathname;
destinationUrl.search = request.nextUrl.search;
return NextResponse.redirect(destinationUrl);
```

이 사건 뒤에는 middleware가 페이지 요청만 받는다는 가정을 버렸다. 페이지·API·정적 청크·public asset이 matcher에 포함되는지를 각각 검증하고, 두 호스트에서 청크가 redirect 없이 200으로 응답하는지 통합 테스트 대상으로 삼았다.

URL에서 POST 본문으로 옮긴 것은 노출 경로 하나를 줄인 결정이지 인증 문제 전체의 해결은 아니다. 당시 제약을 숨기지 않고 전달 방식의 교체 지점을 한곳에 모았다. 석 달 뒤의 장애를 겪고 나서는 호스트 라우팅처럼 짧은 조건도 실제 브라우저 요청 범위로 검증하게 됐다.
