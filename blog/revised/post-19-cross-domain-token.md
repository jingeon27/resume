# 정산 서비스를 별도 호스트로 분리하며 토큰 전달 방식을 바꾼 과정

정산 화면을 별도 호스트로 분리하고 나니 로그인 상태를 넘겨야 했어요. 메인 서비스와 정산 서비스는 등록 가능 도메인이 달라서 쿠키를 같이 쓸 수 없었거든요. 첫 구현은 토큰을 URL에 실어 보내고, 정산 호스트의 미들웨어가 그걸 쿠키로 옮기는 방식이었어요.

브라우저에서는 잘 동작했어요. 최종 주소에서도 토큰이 바로 사라졌고요. 하지만 중간 URL은 프록시와 서버의 access log를 지나가고, Referer로 전달될 수도 있었어요. 화면에 안 보인다고 안전한 건 아니었죠.

아래 도메인과 경로는 공개용으로 바꿨어요.

- 메인 서비스: `app.example.com`
- 정산 서비스: `finance.example.net`

## URL 대신 POST 본문으로 전달했어요

두 화면은 같은 Next.js 코드베이스에 있고, 미들웨어가 경로에 맞는 호스트로 보내 줘요. 서로 다른 호스트 사이에서는 GET 리다이렉트로 HttpOnly 쿠키를 옮길 수 없어요. 그렇다고 토큰을 계속 쿼리 문자열에 둘 수도 없었어요.

그래서 프론트엔드가 가진 BFF 사이에 자동 제출 form을 끼워 넣었어요.

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

GET redirect에는 body를 넣을 수 없어서, 숨김 input이 든 HTML form을 돌려줬어요. 이제 토큰은 URL 대신 POST body에 실려 이동해요.

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

POST를 처리한 뒤에는 `303 See Other`로 보냈어요. 브라우저가 다음 요청을 GET으로 바꾸니 새로고침해도 form이 다시 제출되지 않아요.

이렇게 바꾸고 나니 쿼리 문자열과 Referer, 일반적인 URL 접근 로그에 토큰이 남을 가능성은 줄었어요. 그렇다고 POST 본문이 무조건 안전한 것도 아니에요. WAF나 APM이 요청 본문을 기록하면 토큰은 다시 로그에 남아요. 핸드오프 경로의 본문을 수집하는지, 얼마나 보존하는지까지 같이 확인해야 해요.

이 글을 쓴 뒤로 달라진 게 하나 있어요. 이제 두 쿠키의 보호 수준이 같지 않아요. 다른 이유로 클라이언트가 `sessionToken`을 직접 읽어야 해서 httpOnly 없이 심게 됐거든요. 핸드오프가 옮기는 값은 그대로지만, 옮겨진 뒤에는 두 호스트 모두에서 스크립트가 읽을 수 있어요. 왜 그렇게 했는지는 이 글에서 다루지 않을게요.

## 미들웨어에서 토큰 처리 책임을 뺐어요

처음에는 미들웨어가 호스트 라우팅부터 토큰 읽기, HTML 생성까지 다 맡았어요. 모든 요청이 지나가는 코드에 인증 핸드오프까지 들어가니, 조금만 고쳐도 영향 범위가 너무 넓었어요.

그래서 역할을 이렇게 나눴어요.

- 미들웨어는 경로에 맞는 호스트로 보내는 일만 해요.
- `/api/finance/bridge`는 메인 호스트의 쿠키를 읽고 form을 만들어요.
- `/api/finance`는 정산 호스트에서 토큰을 쿠키로 저장해요.
- 정산 메뉴는 bridge 경로를 새 창으로 열어요.

핸드오프가 시작되는 곳이 하나로 모이니, 나중에 전달 방식을 바꿔도 메뉴와 라우팅 코드까지 고칠 필요가 없어졌어요.

## 목적지는 경로만 허용했어요

form으로 받은 `destination`을 그대로 redirect에 쓰면 외부 주소로도 보낼 수 있어요. 그래서 URL을 파싱한 뒤 host와 query는 버리고 정산 경로만 허용했어요.

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

문자열에 `/finance`가 들어 있는지만 보면 `/finance-evil`도 통과해요. 그래서 허용할 prefix의 경계를 `/finance`와 `/finance/`로 나눠 확인했어요. bridge와 받는 쪽 BFF가 같은 함수를 쓰게 해서 두 단계의 판단도 맞췄고요.

## 자동 제출 폼이 쓰일 수 있는 범위도 좁혔어요

자동 제출 HTML에는 토큰이 들어 있으니 캐시되거나 다른 페이지에 끼워 넣어지면 안 돼요. input 값은 HTML attribute에 맞게 escape하고, 응답 헤더로 어디에 제출할 수 있는지와 문서를 어디서 쓸 수 있는지를 제한했어요.

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

`form-action`은 정산 호스트 말고 다른 곳으로 토큰을 제출하지 못하게 막고, `X-Frame-Options`는 문서가 iframe에 들어가지 못하게 막아요. `no-store`는 토큰이 담긴 HTML을 캐시하지 못하게 하고요.

이 헤더들이 막는 건 토큰이 실린 이 문서가 다른 곳으로 새는 경로까지예요. 자동 제출 스크립트를 인라인으로 두는 한 `script-src`는 nonce를 쓸 때보다 넓게 열려 있어요. 그래서 문서를 오래 살려 두지 않는 쪽을 택했어요. 한 번 쓰고 버리고, 캐시하지 않고, 프레임에도 넣지 못하게요.

## 인가 코드 교환을 쓰지 못한 이유

가장 안전한 건 브라우저에는 일회용 code만 보내고, 정산 서버가 그걸 토큰으로 바꾸는 방식이에요. 토큰이 브라우저를 거치지 않고, code에는 짧은 만료 시간과 한 번만 쓸 수 있다는 조건을 걸 수 있어요.

그런데 당시에는 제품 백엔드나 공유 저장소를 새로 두지 않는다는 제약이 있었어요. Next.js Route Handler만으로도 교환 API의 모양은 만들 수 있어요. 하지만 여러 인스턴스에서 code가 한 번만 쓰이게 하려면 TTL과 원자적 소비를 지원하는 공유 상태가 있어야 해요. 그래서 프론트엔드 배포만으로 할 수 있는 POST BFF를 골랐어요.

이 방식이 최종형은 아니에요. 아래 문제들은 이 방식을 쓰는 동안 계속 따라와요.

- 액세스 토큰과 리프레시 토큰이 브라우저를 한 번은 지나가요. URL에 실리던 때보다 노출 범위는 좁아졌지만 0은 아니에요.
- 리프레시 토큰이 두 호스트에 복제되니 rotation과 로그아웃 동기화를 두 곳에서 맞춰야 해요.
- 일회용 code가 아니라서 재사용 방지와 세션 결합이 code 교환 방식만큼 강하지 않아요.
- 옮겨진 뒤 두 쿠키의 보호 수준이 달라요. 핸드오프가 정한 건 아니지만, 그 결과가 이 경로에도 이어져요.

code 교환으로 바꾸기 전까지는 줄일 수는 있어도 없앨 수는 없어요. 그래서 이 방식을 쓰는 동안은 헤더 설정보다 토큰 수명과 rotation 정책이 안전을 더 많이 좌우해요.

다만 핸드오프가 `/api/finance/bridge` 한 곳에서 시작하니, 공유 저장소를 운영할 수 있게 되면 메뉴나 화면은 건드리지 않고 인가 코드 교환 방식으로 바꿀 수 있어요.

## 석 달 뒤, 같은 미들웨어에서 다른 문제가 드러났어요

Next.js 14.2에서 16.3으로 올린 뒤 정산 화면의 JavaScript 청크가 로드되지 않았어요. 원인은 호스트를 강제하던 matcher였고, 토큰 전달 코드와는 관계가 없었어요.

```ts
// 문제가 있던 범위
export const config = {
  matcher: ['/((?!api).*)'],
};
```

이 패턴은 `/_next/**`까지 잡았어요. 정산 호스트에서 요청한 청크가 정산 경로가 아니라는 이유로 메인 호스트로 307 redirect됐죠.

```text
GET https://finance.example.net/_next/static/chunks/main.js
  → 307 https://app.example.com/_next/static/chunks/main.js
```

기존 버전에서는 우연히 드러나지 않았어요. 16.3이 일부 script에 `crossorigin=""`을 붙이면서 redirect된 청크 요청이 CORS 검사를 받았고, 화면 전체가 깨졌어요. matcher의 범위 오류는 원래 있었고, 업그레이드가 그걸 드러낸 셈이에요.

장애 대응으로 버전을 `~16.2.12`로 고정하고 정적 자산을 matcher에서 뺐어요. `^16.2.12`로 두면 16.3이 다시 설치될 수 있어서 회피책이 안 됐거든요.

```ts
export const config = {
  matcher: ['/((?!api/|_next/|favicon\\.ico|assets/).*)'],
};
```

redirect URL도 바꿨어요. base에 pathname을 바로 이어 붙이지 않고, 목적지 origin을 먼저 고정한 다음 `pathname`과 `search`를 넣었어요. 쿼리가 사라지는 것과, `//`로 시작하는 경로가 protocol-relative로 해석되는 것을 함께 막으려고요.

```ts
const destinationUrl = new URL(domain);
destinationUrl.pathname = request.nextUrl.pathname;
destinationUrl.search = request.nextUrl.search;
return NextResponse.redirect(destinationUrl);
```

이 일을 겪고 나서 middleware가 페이지 요청만 받는다는 가정을 버렸어요. 페이지, API, 정적 청크, public asset이 matcher에 걸리는지 각각 확인하고, 두 호스트에서 청크가 redirect 없이 200으로 오는지를 통합 테스트 대상으로 삼았어요.

URL에서 POST 본문으로 옮긴 건 노출 경로 하나를 줄인 결정이에요. 인증 문제가 다 풀린 건 아니라서, 나중에 전달 방식을 바꿀 자리를 한곳에 모아 뒀어요. 석 달 뒤 장애를 겪고 나서는 호스트 라우팅처럼 짧은 조건도 실제 브라우저 요청 범위로 확인하게 됐고요.
