# TanStack Query v4에서 Query Key Factory로 조회 키를 정리한 이유

> 이 글의 실무 코드는 TanStack Query v4와 `@lukemorales/query-key-factory` 1.3.x를 기준으로 한다. TanStack Query v5의 `useMutation`은 object syntax만 지원하므로 마지막에 별도로 적었다.

후보자 메모를 수정한 뒤 어떤 query를 invalidate해야 하는지 찾으려고 저장소 전체에서 문자열을 검색한 적이 있다. key의 첫 값만 enum이었고, 뒤쪽 계층은 호출부마다 직접 붙이고 있었다.

```ts
enum CandidateQueryKey {
  Detail = 'CandidateDetail',
}

useQuery([CandidateQueryKey.Detail, 'detail', candidateId, 'memos'], fetchMemos);
```

문자열 순서가 호출부마다 달라질 수 있고, 어떤 mutation이 어느 범위까지 무효화해야 하는지도 코드를 검색해야 알 수 있었다. API 파라미터가 바뀌면 query key와 query function을 따로 고쳐야 하는 점도 불편했다.

## 키와 `queryFn`을 함께 정의하기

```ts
import { createQueryKeys } from '@lukemorales/query-key-factory';

export const candidateCollectionKeys = createQueryKeys('CandidateCollection', {
  list: (params?: CandidateListParams) => ({
    queryKey: [params],
    queryFn: () => candidateApi.getList(params),
  }),
  config: {
    queryKey: null,
    queryFn: candidateApi.getConfig,
  },
});
```

`candidateApi.getConfig`처럼 메서드 참조를 그대로 넘기려면 전제가 있다. 해당 함수가 `this` 바인딩 없이 동작해야 하고, `queryFn`은 `QueryFunctionContext`를 첫 인자로 받으므로 선택 인자가 있는 함수는 그대로 넘기면 안 된다.

factory가 만드는 `_def`를 펼쳐 보면 무효화 범위가 보인다.

```ts
candidateCollectionKeys._def;
// ['CandidateCollection']

candidateCollectionKeys.list._def;
// ['CandidateCollection', 'list']

candidateCollectionKeys.list({ page: 1 }).queryKey;
// ['CandidateCollection', 'list', { page: 1 }]

candidateCollectionKeys.config.queryKey;
// ['CandidateCollection', 'config']
```

고정 query(`config`)와 파라미터 query(`list`)는 위처럼 정의 형태가 구분된다.

## 상세 화면의 하위 쿼리를 `contextQueries`로 묶기

후보자 상세 아래에는 메모, 이력, 메시지처럼 같은 `candidateId`를 공유하는 쿼리가 많았다.

```ts
export const candidateDetailKeys = createQueryKeys('CandidateDetail', {
  detail: (candidateId: number) => ({
    queryKey: [candidateId],
    queryFn: () => candidateApi.getDetail(candidateId),
    contextQueries: {
      memos: {
        queryKey: null,
        queryFn: () => candidateApi.getMemos(candidateId),
      },
      histories: {
        queryKey: null,
        queryFn: () => candidateApi.getHistories(candidateId),
      },
    },
  }),
});
```

사용할 때는 query option과 key 범위를 같은 정의에서 가져온다.

```ts
const detail = candidateDetailKeys.detail(candidateId);

useQuery(detail);
useQuery(detail._ctx.memos);

queryClient.invalidateQueries(detail.queryKey);
queryClient.invalidateQueries(detail._ctx.memos.queryKey);
```

`_def`를 사용하면 특정 ID 하나가 아니라 해당 query family 전체를 무효화할 수 있다.

```ts
queryClient.invalidateQueries(candidateCollectionKeys.list._def);
```

## API 함수의 시그니처를 다시 선언하지 않기

mutation 함수의 인자와 API 함수의 인자가 같다면 중간 lambda는 필요하지 않았다.

```ts
// TanStack Query v4
const createReview = useMutation(candidateReviewApi.create, {
  onSuccess: (candidate) => {
    queryClient.invalidateQueries(
      candidateDetailKeys.detail(candidate.id).queryKey,
    );
  },
});
```

TanStack Query v5에서는 같은 코드를 object syntax로 쓴다.

```ts
const createReview = useMutation({
  mutationFn: candidateReviewApi.create,
  onSuccess: (candidate) => {
    queryClient.invalidateQueries({
      queryKey: candidateDetailKeys.detail(candidate.id).queryKey,
    });
  },
});
```

API 함수를 감싼 코드 몇 줄을 줄이려던 작업은 아니었다. API 파라미터가 바뀌면 mutation 정의도 함께 깨지도록 중복된 함수 시그니처를 없애려 했다. 다만 `candidateReviewApi.create`가 `this` 바인딩 없이 동작한다는 전제는 필요하다.

## 적용 범위

- 키만 필요한 경우에도 query factory의 `queryKey` 또는 `_def`를 사용한다.
- 파라미터 객체는 직렬화 가능한 값으로 만들고 key에 포함한다.
- mutation까지 factory에 억지로 넣지 않는다. mutation은 어떤 query를 무효화하는지 가까운 곳에서 명시한다.
- 파일 수나 변경 줄 수를 성과로 보지 않는다. 같은 리소스의 key 모양이 한곳에서 결정되는지를 본다.

적용 뒤에는 메모 하나를 수정했을 때 상세 전체를 갱신할지, 메모 목록만 갱신할지가 코드에 드러났다. key가 짧아진 것은 별로 중요하지 않았다. 문자열을 검색하지 않고도 조회 함수와 무효화 범위를 같은 계층에서 찾을 수 있게 된 점이 실제 이득이었다.

참고: [Query Key Factory](https://github.com/lukemorales/query-key-factory), [TanStack Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
