# 동적 사이트맵에서 공개 API와 인증 API의 경계를 나눈 과정

사이트맵에 병원, 프로그램, 공지, 콘텐츠 URL을 넣다 보니 API를 다섯 개 호출하게 됐어요. 배포할 때만 만들면 새 콘텐츠가 다음 배포 전까지 사이트맵에 들어가지 않고, 요청마다 전부 조회하면 같은 데이터를 계속 가져와요. 그래서 하루 단위로 재검증하는 캐시를 붙이기로 했어요.

그런데 사이트맵 함수에 `'use cache'`를 붙이자 공개 API 호출이 캐시 경계 안에서 동작하지 않았어요. 원인을 따라가 보니 공용 Axios interceptor였어요. 인증이 필요 없는 요청에서도 서버에서는 무조건 `cookies()`를 읽고 있었거든요.

## 캐시보다 인증 경계부터 나눴어요

기존 interceptor는 서버와 브라우저를 구분해 토큰을 찾았지만, 요청이 공개 데이터인지 회원별 데이터인지는 구분하지 않았어요. 공개 사이트맵도 요청별 쿠키에 기대고 있던 셈이에요.

그래서 호출 규칙을 이렇게 바꿨어요.

- 서버의 공개 조회는 기본적으로 쿠키를 읽지 않아요.
- 회원별 가격이나 혜택처럼 인증이 필요한 SSR 요청만 인증을 쓴다고 명시해요.
- 인증 요청은 공개 캐시 경계 안에서 호출하지 않아요.

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

기본값은 `false`로 뒀어요. 사이트맵은 공개 클라이언트를 쓰고, 회원별 SSR 조회만 `includeServerAuth: true`를 넘겨요. 다만 불리언은 잘못 넘길 수 있어서, 길게 보면 공개 클라이언트와 인증 클라이언트를 모듈 수준에서 나누는 편이 나아요.

쿠키를 안 읽는다고 모든 응답을 같이 캐시해도 되는 건 아니에요. `Host`, 테넌트, 로케일에 따라 응답이 달라진다면 그 값도 캐시 키에 넣어야 해요. 이번 사이트맵 API는 사용자별 데이터가 없는 공개 응답인 걸 확인하고 경계에 넣었어요.

## 다섯 API의 결과는 하루 단위로 재검증해요

데이터 소스끼리는 서로 의존하지 않아서 동시에 조회했어요.

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

`cacheLife('days')`는 하루가 지난 뒤 들어온 요청을 계기로 서버가 값을 다시 검증하는 정책이에요. 매일 정해진 시각에 다시 만드는 크론과는 달라요. 자체 호스팅이나 인스턴스가 여러 대인 환경이라면 캐시 저장소가 실제로 공유되는지도 따로 확인해야 해요.

처음에는 `cacheTag`도 붙였는데, 정작 `revalidateTag`를 부르는 곳이 없었어요. 무효화할 길이 없는 태그는 의도만 흐려서 지웠어요. 나중에 콘텐츠 변경 이벤트와 연결할 때 태그와 무효화 지점을 같이 넣으려고 해요.

## 캐시를 붙이고 나니 사이트맵 정확성 문제가 남았어요

캐시는 붙였지만 생성 로직에는 한계가 두 가지 남았어요.

첫째, 지금 일부 조회는 전체 개수를 먼저 받은 뒤 그 수를 `pageSize`로 보내 한 번에 가져와요. 데이터가 커지면 API 최대 크기를 넘을 수 있어서 페이지 단위 조회와 안정 정렬이 필요해요.

둘째, 개별 API 오류를 빈 배열로 바꾸면 일부 URL이 빠진 결과도 정상 사이트맵처럼 캐시돼요. 어느 데이터 소스의 실패까지 허용할지 정하고, 핵심 소스가 실패하면 이전 결과를 유지하거나 생성 자체를 실패시키는 정책이 필요해요.

모든 항목에 생성 시각을 `lastModified`로 넣는 방식도 걷어낼 생각이에요. 사이트맵을 만든 시각과 콘텐츠를 수정한 시각은 다르니까요. API가 믿을 만한 수정 시각을 주는 항목에만 값을 넣고 나머지는 빼야 해요.

이번에 고친 건 공개 API가 모르는 사이에 사용자 쿠키를 읽던 구조와, 요청마다 같은 데이터를 다시 모으던 문제까지예요. 대량 조회와 부분 실패는 캐시 경계를 만들고 나서야 따로 보였어요.

참고: [Next.js `use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache), [Next.js `cacheLife`](https://nextjs.org/docs/app/api-reference/functions/cacheLife), [Google 사이트맵 가이드](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
