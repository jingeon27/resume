# Next.js App Router에서 prefetch를 기다려야 하는 경우

브라우저에서는 예약 상세가 멀쩡히 보였는데, HTML 원문에는 병원 정보가 없었어요. 클라이언트가 다시 조회해서 화면을 채우니 개발하는 동안에는 놓치기 쉬웠어요. 서버 코드에 `prefetchQuery`가 있긴 했는데, 앞에 `void`가 붙어 있었어요.

```tsx
void queryClient.prefetchQuery(hospitalOptions(hospitalId));

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <ReservationPageView />
  </HydrationBoundary>
);
```

이 코드에서는 prefetch가 끝나기 전에 `dehydrate`가 실행될 수 있어요. 기본 dehydration 설정은 성공한 query만 담아서, 아직 pending인 query는 state에 들어가지 않아요. 브라우저가 다시 조회하면 화면은 보이지만, 서버가 만든 초기 HTML에서는 데이터가 빠질 수 있어요.

## 초기 HTML에 데이터가 필요하면 기다려요

Next.js 15에서는 page의 `searchParams`가 Promise예요.

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

`await`한 다음에 `dehydrate`하니 성공한 query가 hydration state에 들어가요. 초기 화면의 핵심 콘텐츠나 metadata를 만드는 데 필요한 데이터, 서버에서 오류를 처리해야 하는 조회라면 이 방식이 단순해요. 다만 `generateMetadata`는 page와 따로 실행돼서, page에서 prefetch한 데이터를 저절로 같이 쓰지는 못해요. 같은 요청을 중복 없이 쓰려면 React의 `cache()`나 fetch 캐시로 조회 함수를 묶어야 해요.

## `void prefetchQuery`가 늘 틀린 건 아니에요

TanStack Query는 pending query도 dehydrate하도록 설정하면 streaming할 수 있어요.

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

이 설정을 쓰고 화면 컴포넌트가 `useSuspenseQuery`로 같은 query를 구독한다면, prefetch를 기다리지 않는 것도 의도한 선택일 수 있어요.

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

결국 `void`가 붙었는지만 보고 맞다 틀리다 할 수는 없어요.

| 상황 | 선택 |
| --- | --- |
| 초기 HTML에 반드시 필요한 핵심 데이터 | `await prefetchQuery` |
| 서버에서 not-found나 오류를 결정해야 하는 데이터 | `await prefetchQuery` |
| 화면 일부를 Suspense로 늦게 보여줘도 되는 데이터 | pending dehydration + streaming |
| 사용자 조작 뒤에 필요한 데이터 | 클라이언트 query |

## SEO와 sitemap은 따로 봐야 해요

sitemap은 페이지 안의 데이터를 읽지 않아요. 검색엔진에 URL을 알려 줄 뿐이고, HTML은 검색엔진 crawler가 그 URL을 다시 요청해서 읽어요. 이 문제도 "sitemap에서 읽히지 않았다"보다 "crawler가 받은 초기 HTML에 핵심 콘텐츠가 없었다"고 설명하는 게 정확해요.

`HydrationBoundary`가 여러 번 보인다고 무조건 중복인 것도 아니에요. 서로 다른 Server Component가 각자 prefetch한 cache를 가까운 client subtree에 넘긴다면 경계가 여러 개일 수 있어요. 같은 query와 같은 state를 되풀이해 넘길 때만 상위 경계로 합칠지 따져 보면 돼요.

그래서 `void prefetchQuery`를 전부 `await`로 바꾸지는 않았어요. 병원 정보처럼 초기 HTML과 서버 분기에 필요한 데이터만 기다렸어요. 화면의 나머지 부분은 pending query를 dehydration하고 Suspense로 넘길 수 있어요. API가 얼마나 중요한지보다는, 서버가 첫 응답에서 어디까지 보장해야 하는지를 기준으로 삼았어요.

참고: [TanStack Query Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr), [Next.js `searchParams`](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)
