# 동적 sitemap을 만들며 공개 API와 인증 API의 경계를 나눈 과정

복지몰의 sitemap에는 정적 URL만 들어가지 않았다. 병원 상세, 병원별 프로그램, 진료과 검색, 공지와 혜택 상세 URL을 만들기 위해 여러 공개 API를 조회해야 했다.

선택지는 세 가지였다.

- 요청마다 전체 URL을 생성한다.
- build할 때만 생성한다.
- 결과를 cache하고 일정 시간이 지난 뒤 다시 만든다.

새 프로그램이 다음 배포 전에도 반영돼야 했고, crawler 요청마다 여러 API를 호출할 이유도 없었다. 그래서 Next.js의 Cache Components와 `'use cache'`를 사용했다.

## sitemap을 cache 경계로 만들기

```ts
import type { MetadataRoute } from 'next';
import { cacheLife } from 'next/cache';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  'use cache';
  cacheLife('days');

  const [hospitals, programs, notices, searchPaths] = await Promise.all([
    getAllHospitals(),
    getAllPrograms(),
    getAllNotices(),
    getSearchPaths(),
  ]);

  return [
    ...toHospitalEntries(hospitals),
    ...toProgramEntries(programs),
    ...toNoticeEntries(notices),
    ...toSearchEntries(searchPaths),
  ];
}
```

데이터 소스는 서로 의존하지 않으므로 병렬로 조회한다.

`cacheLife('days')`는 매일 정해진 시각에 실행되는 cron이 아니다. cache profile의 stale, revalidate, expire 시간에 따라 동작하고, stale 이후 다음 요청이 갱신을 유발할 수 있다. 따라서 "하루마다 자동 생성"보다 **하루 단위 revalidation 정책을 가진 요청 기반 cache**라고 표현하는 것이 정확하다.

`cacheTag('sitemap')`은 실제 `revalidateTag` 호출 지점이 생겼을 때 추가해도 된다. 무효화 기능을 쓰지 않는 동안에는 미래 요구를 위해 미리 달아둘 필요가 없었다.

## cache를 막던 암묵적인 쿠키 읽기

기존 Axios interceptor는 서버와 클라이언트를 구분하지 않고 access token을 찾았다. sitemap이 호출하는 API는 모두 공개인데도 interceptor가 `cookies()`를 읽으면 요청별 동적 API에 의존하게 되고 cache 경계 안에서 사용할 수 없다.

처음에는 "서버에서는 토큰을 읽지 않는다"를 규칙으로 잡았지만, 이후 회원별 쿠폰 가격처럼 인증이 필요한 SSR 조회가 생겼다. 현재 규칙은 다음처럼 바뀌었다.

- 서버의 공개 조회는 기본적으로 cookie를 읽지 않는다.
- 회원별 SSR 조회만 호출부에서 인증 필요 여부를 명시한다.
- 인증 응답은 공개 cache와 섞지 않고 `no-store` 또는 사용자별 query 경계에서 처리한다.

```ts
declare module 'axios' {
  interface AxiosRequestConfig {
    useServerCookie?: boolean;
  }
}

async function readAccessToken(useServerCookie: boolean) {
  if (typeof window === 'undefined') {
    if (!useServerCookie) return null;

    const { cookies } = await import('next/headers');
    return (await cookies()).get('accessToken')?.value ?? null;
  }

  return readClientAccessToken();
}
```

호출부의 기본값은 `false`다.

```ts
// 공개 데이터: cookie를 읽지 않으므로 cache 가능한 경로에 둘 수 있다.
httpClient.get('/hospitals');

// 회원별 데이터: cookie를 읽는 요청별 호출임을 호출부에서 드러낸다.
httpClient.get('/member/coupons', {
  useServerCookie: true,
});
```

두 번째 호출은 `cookies()`에 의존하므로 공개 `'use cache'` 경계 안에서 사용하지 않는다. 인증 응답을 반드시 `no-store`로 제어해야 하는 곳은 별도 `fetch` wrapper에서 `cache: 'no-store'`를 명시한다. 중요한 것은 인증이 필요한 서버 호출에 일부러 마찰을 남겨, 공개 cache에 사용자 응답이 섞이지 않도록 하는 것이다.

클라이언트에서 Server Function을 통해 token을 읽고 `delay(0)`으로 action queue를 피하는 현재 방식은 sitemap cache와 별개의 기술 부채다. 이 글의 핵심 흐름에 섞어 해결된 것처럼 설명하지 않고, BFF나 token 전달 정책을 다시 설계할 후속 과제로 남긴다.

## 정확하지 않은 sitemap 정보는 넣지 않기

초기 구현은 모든 entry에 sitemap 생성 시각을 `lastModified`로 넣었다. 하지만 그 시각은 콘텐츠가 바뀐 시각이 아니다. API가 실제 수정 시각을 주지 않는 URL은 `lastModified`를 생략하는 편이 정확하다.

```ts
function toProgramEntry(program: Program): MetadataRoute.Sitemap[number] {
  return {
    url: `${DOMAIN}/hospital/${program.hospitalId}/${program.id}`,
    ...(program.updatedAt && {
      lastModified: new Date(program.updatedAt),
    }),
  };
}
```

Google은 `priority`와 `changefreq`를 사용하지 않으므로 근거 없는 등급도 제거한다. sitemap의 역할은 검색 순위를 지정하는 것이 아니라 canonical URL과 정확한 변경 정보를 제공하는 것이다.

## 전체 조회는 한 번에 크게 요청하지 않기

`size=totalCount`로 전체 목록을 한 번에 가져오면 API의 최대 page size를 넘거나 응답이 계속 커질 수 있다. page 단위로 읽는 helper를 둔다.

```ts
async function getAllPages<T>(fetchPage: (page: number) => Promise<Page<T>>) {
  const result: T[] = [];
  let page = 1;

  while (true) {
    const response = await fetchPage(page);
    if (response.items.length === 0 && result.length < response.totalCount) {
      throw new Error(`전체 목록을 읽기 전에 ${page}페이지가 비었습니다.`);
    }

    result.push(...response.items);

    if (result.length >= response.totalCount) return result;
    page += 1;
  }
}
```

URL이 50,000개 또는 비압축 50MB에 가까워지면 sitemap index와 여러 sitemap으로 나눠야 한다.

## 부분 실패를 성공으로 cache하지 않기

각 API 오류를 전부 `[]`로 바꾸면 sitemap 함수는 성공한 것으로 끝나고, 일부 URL이 빠진 결과가 cache될 수 있다. 핵심 데이터 소스가 실패하면 생성 자체를 실패시키고 기존 정상 cache를 유지하도록 하는 편이 낫다.

함께 남겨야 할 관측값도 있다.

- 전체 entry 수와 유형별 entry 수
- 직전 생성 대비 증감률
- 데이터 소스별 요청 시간과 실패
- 생성 결과가 50,000 URL 제한에 얼마나 가까운지

query string의 XML escaping은 Next.js 버전에 따라 출력 동작이 달라질 수 있으므로 "Next.js는 escape하지 않는다"고 일반화하지 않는다. 생성된 XML을 integration test에서 parsing해 유효성을 확인하고, framework가 이미 escape한 값을 다시 escape하지 않는 것이 안전하다.

## 정리

sitemap 함수보다 더 큰 변화는 데이터 layer의 기본값이었다. 공개 API는 cookie를 읽지 않아 cache 가능하게 두고, 인증이 필요한 서버 조회만 명시적으로 dynamic 경계를 선택하게 했다. sitemap도 정확한 URL만 넣고, 틀린 `lastModified`나 근거 없는 priority는 넣지 않는 쪽으로 단순해졌다.

참고: [Next.js `use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache), [Next.js `cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife), [Google sitemap 가이드](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
