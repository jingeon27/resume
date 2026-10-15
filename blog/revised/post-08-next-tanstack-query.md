# Next.js App Router에서 서버와 브라우저의 QueryClient를 나눈 이유

> Next.js 15 App Router와 TanStack Query v5 기준이에요.

App Router에 TanStack Query를 처음 붙였을 때는 서버와 브라우저에서 같은 `getQueryClient()`를 부르면 된다고 생각했어요. 그런데 같은 함수라도 두 환경에서 바라는 수명이 정반대였어요.

- 서버에서는 요청끼리 캐시를 공유하면 안 돼요.
- 브라우저에서는 렌더마다 QueryClient를 다시 만들면 안 돼요.

## QueryClient 만들기

```ts
// query-client.ts
import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
```

흔히 하는 실수인 `typeof window !== undefined`는 항상 참이에요. `typeof`의 결과는 문자열이라서, 직접 검사하려면 `typeof window === 'undefined'`로 써야 해요. 여기서는 TanStack Query가 제공하는 `isServer`를 써서 의도를 드러냈어요.

서버에서는 호출할 때마다 새 QueryClient를 만들고, 브라우저에서는 모듈 범위의 인스턴스를 다시 써요. 한 요청 안에서 여러 컴포넌트가 같은 인스턴스를 공유해야 한다면 `getQueryClient`를 React의 `cache()`로 감싸 요청 단위로 메모이즈해야 해요.

## Provider 연결하기

```tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';

import { getQueryClient } from './query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Provider가 Client Component여도 `children`으로 넘긴 Server Component까지 Client Component로 바뀌지는 않아요. 그래서 layout에서 Provider로 감싸도 서버 컴포넌트 경계는 그대로예요.

## queryOptions를 조회 계약으로 사용하기

```ts
import { queryOptions } from '@tanstack/react-query';

export const categoryOptions = queryOptions({
  queryKey: ['categories'],
  queryFn: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
    if (!response.ok) throw new Error('카테고리를 불러오지 못했습니다.');
    return (await response.json()) as Category[];
  },
});

export const integrationOptions = queryOptions({
  queryKey: ['integrations'],
  queryFn: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`);
    if (!response.ok) throw new Error('연동 목록을 불러오지 못했습니다.');
    return (await response.json()) as Integration[];
  },
});
```

같은 option을 서버 prefetch와 클라이언트 구독에 함께 쓰면 query key와 queryFn이 어긋날 일이 줄어요.

## 서버에서 병렬로 prefetch하기

```tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function HomePage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(categoryOptions),
    queryClient.prefetchQuery(integrationOptions),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageView />
    </HydrationBoundary>
  );
}
```

두 조회는 서로 의존하지 않아서 하나씩 `await`하지 않고 `Promise.all`로 묶었어요. 완료된 query만 넘긴다면 기본 dehydration 정책으로도 충분해요. 위 QueryClient에서 pending query까지 넘기게 한 건, 일부 화면에서 prefetch를 기다리지 않고 Suspense로 streaming하는 선택지도 열어 두려는 거였어요.

## 클라이언트에서 같은 query를 구독하기

```tsx
'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

export function HomePageView() {
  const { data } = useSuspenseQuery(integrationOptions);
  return <IntegrationList items={data} />;
}
```

서버가 넘긴 dehydrated cache와 클라이언트의 query key가 같으니, 첫 렌더에서 같은 데이터를 써요. 그 뒤의 invalidate와 refetch도 TanStack Query의 캐시 흐름 안에서 돌아가요.

## 어떤 조회를 서버에서 기다릴지 정하는 기준

- 초기 HTML에 데이터가 꼭 있어야 하거나 오류를 서버에서 처리해야 하면 `await prefetchQuery`를 써요.
- pending query를 streaming하려면 pending dehydration을 켜고, 데이터를 쓰는 컴포넌트를 Suspense 경계 안에서 `useSuspenseQuery`로 구독해요.
- 어느 방식이든 서버 QueryClient는 요청마다, 브라우저 QueryClient는 한 번만 만들어요.

이 구성을 통째로 복사하기 전에, 데이터가 초기 HTML에 꼭 있어야 하는지부터 정해야 해요. 저는 SEO나 서버 분기에 필요한 조회는 기다리고, 일부 UI가 늦게 보여도 되는 조회는 Suspense로 넘겨요. dehydration 설정은 그걸 정하고 나서야 고를 수 있어요.

참고: [TanStack Query Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
