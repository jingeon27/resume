# Next.js App Router에서 prefetch를 기다려야 하는 경우

브라우저에서는 예약 상세가 정상으로 보였는데 HTML 원문에는 병원 정보가 없었다. 클라이언트가 다시 조회해 화면을 채웠기 때문에 개발 중에는 놓치기 쉬웠다. 서버 코드에는 `prefetchQuery`도 있었지만 앞에 `void`가 붙어 있었다.

```tsx
void queryClient.prefetchQuery(hospitalOptions(hospitalId));

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <ReservationPageView />
  </HydrationBoundary>
);
```

이 코드에서 `dehydrate`는 prefetch가 끝나기 전에 실행될 수 있다. 기본 dehydration 설정은 성공한 query를 대상으로 하므로, 아직 pending인 query가 state에 포함되지 않는다. 브라우저에서는 다시 조회해 화면이 보일 수 있지만 서버가 만든 초기 HTML에는 데이터가 빠질 수 있다.

## 초기 HTML에 데이터가 필요하면 기다린다

Next.js 15에서 page의 `searchParams`는 Promise다.

```tsx
interface Props {
  searchParams: Promise<{
    hospitalId?: string;
  }>;
}

export default async function ReservationPage({ searchParams }: Props) {
  const { hospitalId } = await searchParams;

  if (!hospitalId) notFound();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    hospitalOptions(Number(hospitalId)),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ReservationPageView />
    </HydrationBoundary>
  );
}
```

`await` 뒤에 `dehydrate`하므로 성공한 query가 hydration state에 포함된다. 초기 화면의 핵심 콘텐츠, metadata 생성에 필요한 데이터, 서버에서 오류를 처리해야 하는 조회에는 이 방식이 단순하다. 다만 `generateMetadata`는 page와 별도로 실행되므로 page에서 prefetch한 데이터가 자동으로 공유되지는 않으며, 같은 요청을 중복 없이 쓰려면 React의 `cache()`나 fetch 캐시로 조회 함수를 묶어야 한다.

## `void prefetchQuery`가 항상 틀린 것은 아니다

TanStack Query는 pending query도 dehydrate하도록 설정해 streaming할 수 있다.

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    dehydrate: {
      shouldDehydrateQuery: (query) =>
        defaultShouldDehydrateQuery(query) ||
        query.state.status === 'pending',
    },
  },
});
```

이 설정을 사용하고 화면 컴포넌트가 `useSuspenseQuery`로 같은 query를 구독한다면, prefetch를 기다리지 않는 방식도 의도적인 선택이 될 수 있다.

```tsx
void queryClient.prefetchQuery(hospitalOptions(hospitalId));

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<ReservationSkeleton />}>
      <ReservationPageView />
    </Suspense>
  </HydrationBoundary>
);
```

따라서 판단 기준은 `void` 자체가 아니다.

| 상황 | 선택 |
| --- | --- |
| 초기 HTML에 반드시 필요한 핵심 데이터 | `await prefetchQuery` |
| 서버에서 not-found나 오류를 결정해야 하는 데이터 | `await prefetchQuery` |
| 화면 일부를 Suspense로 늦게 보여줘도 되는 데이터 | pending dehydration + streaming |
| 사용자 조작 뒤에 필요한 데이터 | 클라이언트 query |

## SEO와 sitemap은 구분한다

sitemap이 페이지 내부 데이터를 읽는 것은 아니다. sitemap은 검색엔진에 URL을 알려주고, 검색엔진 crawler가 그 URL을 다시 요청해 HTML을 읽는다. 따라서 문제를 설명할 때는 "sitemap에서 읽히지 않았다"보다 **crawler가 받은 초기 HTML에 핵심 콘텐츠가 없었다**가 정확하다.

`HydrationBoundary`가 여러 번 보인다고 무조건 중복도 아니다. 서로 다른 Server Component가 각자 prefetch한 cache를 가까운 client subtree에 전달한다면 경계가 여러 개일 수 있다. 같은 query와 같은 state를 반복해서 전달하는 경우에만 상위 경계로 합칠지 검토하면 된다.

그래서 `void prefetchQuery`를 일괄적으로 `await`로 바꾸지는 않았다. 병원 정보처럼 초기 HTML과 서버 분기에 필요한 데이터만 기다렸다. 화면의 나머지 부분은 pending query를 dehydration하고 Suspense로 넘길 수 있다. 기준은 API의 중요도가 아니라 서버가 첫 응답에서 어디까지 보장해야 하는가였다.

참고: [TanStack Query Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr), [Next.js `searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)
