# 동적 사이트맵에서 공개 API와 인증 API의 경계를 나눈 과정

사이트맵에 병원·프로그램·공지·콘텐츠 URL을 넣으면서 다섯 개 API를 호출하게 됐다. 배포할 때만 생성하면 새 콘텐츠가 다음 배포까지 반영되지 않고, 요청마다 전부 조회하면 같은 데이터를 계속 가져온다. 하루 단위로 재검증하는 캐시를 적용하기로 했다.

그런데 사이트맵 함수에 `'use cache'`를 붙이자 공개 API 호출이 캐시 경계 안에서 동작하지 않았다. 원인은 사이트맵이 아니라 공용 Axios interceptor였다. 인증이 필요 없는 요청도 서버에서 무조건 `cookies()`를 읽고 있었다.

## 캐시보다 먼저 인증 경계를 나눴다

기존 interceptor는 서버와 브라우저를 구분해 토큰을 찾았지만, 요청이 공개 데이터인지 회원별 데이터인지는 구분하지 않았다. 공개 사이트맵도 요청별 쿠키에 의존하는 셈이었다.

호출 규칙을 다음처럼 바꿨다.

- 서버의 공개 조회는 기본적으로 쿠키를 읽지 않는다.
- 회원별 가격이나 혜택처럼 인증이 필요한 SSR 요청만 인증 사용을 명시한다.
- 인증 요청은 공개 캐시 경계 안에서 호출하지 않는다.

```ts
declare module 'axios' {
  interface AxiosRequestConfig {
    includeServerAuth?: boolean;
  }
}

async function readAuthToken(includeServerAuth: boolean) {
  if (typeof window === 'undefined') {
    if (!includeServerAuth) return null;

    const { cookies } = await import('next/headers');
    return (await cookies()).get('auth_token')?.value ?? null;
  }

  return readCookieValue('auth_token');
}
```

기본값은 `false`로 두었다. 사이트맵은 공개 클라이언트를 쓰고, 회원별 SSR 조회만 `includeServerAuth: true`를 지정한다. 불리언을 잘못 지정할 가능성은 남아 있어 장기적으로는 공개·인증 클라이언트를 모듈 수준에서 나누는 편이 낫다.

쿠키만 읽지 않는다고 모든 응답을 함께 캐시해도 되는 것은 아니다. `Host`, 테넌트, 로케일에 따라 응답이 달라진다면 그 값도 캐시 키에 포함해야 한다. 이번 사이트맵 API는 사용자별 데이터가 없는 공개 응답임을 확인한 뒤 경계에 넣었다.

## 다섯 API의 결과를 하루 단위로 재검증한다

각 데이터 소스는 서로 의존하지 않아 동시에 조회했다.

```ts
import type { MetadataRoute } from 'next';
import { cacheLife } from 'next/cache';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  'use cache';
  cacheLife('days');

  const [locationIds, items, announcementIds, categoryPaths, filterPaths] =
    await Promise.all([
      getAllLocationIds(),
      getAllItems(),
      getAllAnnouncementIds(),
      getAllCategoryPaths(),
      loadFilterPaths(),
    ]);

  return [
    ...toLocationEntries(locationIds),
    ...toItemEntries(items),
    ...toAnnouncementEntries(announcementIds),
    ...toCategoryEntries(categoryPaths),
    ...toFilterEntries(filterPaths),
  ];
}
```

`cacheLife('days')`는 매일 정해진 시각에 다시 만드는 크론이 아니다. 하루가 지난 뒤 들어온 요청을 계기로 서버가 값을 재검증하는 정책이다. 자체 호스팅이나 여러 인스턴스 환경에서는 캐시 저장소가 실제로 공유되는지도 별도로 확인해야 한다.

처음에는 `cacheTag`도 붙였지만 호출하는 `revalidateTag`가 없었다. 무효화 경로가 없는 태그는 의도를 흐리기만 해서 제거했다. 콘텐츠 변경 이벤트와 연결하게 되면 그때 태그와 무효화 지점을 함께 추가하는 편이 낫다.

## 캐시 적용과 사이트맵 정확성은 별개의 문제였다

캐시는 적용했지만 생성 로직에는 두 가지 한계가 남았다.

첫째, 현재 일부 조회는 전체 개수를 먼저 받은 뒤 그 수를 `pageSize`로 보내 한 번에 가져온다. 데이터가 커지면 API 최대 크기를 넘을 수 있으므로 페이지 단위 조회와 안정 정렬이 필요하다.

둘째, 개별 API 오류를 빈 배열로 바꾸면 일부 URL이 빠진 결과도 정상 사이트맵처럼 캐시된다. 어떤 데이터 소스의 실패까지 허용할지 정하고, 핵심 소스가 실패하면 이전 결과를 유지하거나 생성 자체를 실패시키는 정책이 필요하다.

모든 항목에 생성 시각을 `lastModified`로 넣는 방식도 제거 대상이다. 사이트맵을 만든 시각은 콘텐츠 수정 시각이 아니다. API가 신뢰할 수 있는 수정 시각을 주는 항목에만 값을 넣고 나머지는 생략해야 한다.

이번 작업에서 해결한 것은 공개 API가 암묵적으로 사용자 쿠키를 읽던 구조와 매 요청마다 같은 데이터를 수집하던 문제다. 사이트맵의 정확성까지 해결했다고 넓혀 말하지 않는다. 캐시 경계를 만든 뒤에야 대량 조회와 부분 실패가 별도의 문제로 선명하게 보였다.

참고: [Next.js `use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache), [Next.js `cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife), [Google 사이트맵 가이드](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
