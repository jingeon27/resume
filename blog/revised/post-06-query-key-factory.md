# TanStack Query v4의 query key를 Query Key Factory로 정리한 이유

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>후보자 메모를 고친 뒤 어떤 쿼리를 무효화해야 하는지 문자열 검색으로 찾던 상황에서 시작해요. query key와 `queryFn`을 한곳에서 정의하고, 상세 아래 쿼리를 `contextQueries`로 묶고, mutation에는 API 함수를 그대로 넘긴 과정을 적어요. 옮긴 뒤 달라진 건 무효화 범위가 코드에 드러났다는 점이고, 무효화 누락이 얼마나 줄었는지는 재지 않았어요.</p>
</div>

> 2024년 4월에 한 작업이고, 코드는 TanStack Query v4와 `@lukemorales/query-key-factory` 1.3.x 기준이에요. 본문 코드는 실제 코드에서 이름을 바꾸고 줄인 예제예요. v5는 `useMutation`만이 아니라 `useQuery`·`invalidateQueries`를 포함한 대부분의 API에서 key나 함수를 위치 인자로 받던 overload를 없애고 객체 형식만 받아요. 그래서 본문의 `invalidateQueries(queryKey)` 호출은 v4 문법이고, v5에서는 `{ queryKey }`로 감싸야 해요. v5 예시는 mutation 절에 v4 코드와 나란히 적었어요.

후보자 메모를 수정한 뒤 어떤 쿼리를 무효화(invalidate)해야 하는지 찾으려고 저장소 전체에서 문자열을 검색한 적이 있어요. query key의 첫 값만 enum이었고, 뒤쪽 계층은 호출부마다 직접 붙이고 있었거든요.

```ts
enum CandidateQueryKey {
  Detail = 'CandidateDetail',
}

useQuery([CandidateQueryKey.Detail, 'detail', candidateId, 'memos'], fetchMemos);
```

불편한 점은 넷이었어요.

- 문자열 순서가 호출부마다 달라질 수 있었어요.
- 어떤 mutation이 어느 범위까지 무효화해야 하는지 코드를 검색해야 알 수 있었어요.
- API 파라미터가 바뀌면 query key와 `queryFn`을 따로 고쳐야 했어요.
- mutation은 API 함수를 lambda로 한 번 더 감싸면서 인자 타입을 다시 적고 있어서, 같은 함수 시그니처가 두 곳에 있었어요.

## query key와 `queryFn`을 한곳에서 정의했어요

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

`list`는 인자 하나에서 query key와 `queryFn`이 함께 만들어져요. 파라미터가 바뀌어도 고칠 곳은 이 정의 하나예요.

`candidateApi.getConfig`처럼 메서드 참조를 그대로 넘기려면 전제가 있어요. 그 함수가 `this` 바인딩 없이 동작해야 하고, 첫 인자를 쓰지 않아야 해요. `queryFn`은 첫 인자로 `QueryFunctionContext`를 받아서, 선택 인자가 있는 함수를 그대로 넘기면 그 자리에 context 객체가 들어가요.

factory가 만드는 `_def`를 펼쳐 보면 무효화 범위가 보여요.

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

고정 쿼리(`config`)와 파라미터를 받는 쿼리(`list`)는 위처럼 정의 형태부터 구분돼요.

## 상세 아래의 쿼리는 `contextQueries`로 묶었어요

후보자 상세 아래에는 메모, 이력, 메시지처럼 같은 `candidateId`를 공유하는 쿼리가 많았어요.

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

쓸 때는 `useQuery`에 넘길 옵션과 무효화할 query key를 같은 정의에서 꺼내요.

```ts
const detail = candidateDetailKeys.detail(candidateId);

useQuery(detail);
useQuery(detail._ctx.memos);

queryClient.invalidateQueries(detail.queryKey); // 상세·메모·이력 전부
queryClient.invalidateQueries(detail._ctx.memos.queryKey); // 메모만
```

두 호출의 범위는 겹쳐요. `detail.queryKey`는 `['CandidateDetail', 'detail', candidateId]`이고, `_ctx.memos.queryKey`는 그 뒤에 `'memos'`를 붙인 `['CandidateDetail', 'detail', candidateId, 'memos']`예요. `invalidateQueries`는 기본적으로 앞부분이 일치하는 쿼리를 모두 무효화하기 때문에, 상세를 무효화하면 메모와 이력도 함께 무효화돼요. 메모만 무효화하려면 `_ctx.memos.queryKey`를 넘겨요.

같은 원리로 `_def`를 쓰면 특정 ID 하나가 아니라 `list` 아래의 쿼리 전체를 무효화할 수 있어요.

```ts
queryClient.invalidateQueries(candidateCollectionKeys.list._def);
```

## mutation에는 API 함수를 그대로 넘겼어요

전에는 `(body: CreateReviewBody) => candidateReviewApi.create(body)`처럼 API 인자 타입을 lambda에 한 번 더 적고 있었어요. mutation 함수의 인자와 API 함수의 인자가 같다면 이 중간 lambda는 필요 없었어요.

```ts
// TanStack Query v4
const createReview = useMutation(candidateReviewApi.create, {
  onSuccess: (_review, { candidateId }) => {
    queryClient.invalidateQueries(
      candidateDetailKeys.detail(candidateId).queryKey,
    );
  },
});
```

TanStack Query v5에서는 같은 코드를 객체 형식으로 써요. `invalidateQueries`도 `{ queryKey }`로 감싸요.

```ts
// TanStack Query v5
const createReview = useMutation({
  mutationFn: candidateReviewApi.create,
  onSuccess: (_review, { candidateId }) => {
    queryClient.invalidateQueries({
      queryKey: candidateDetailKeys.detail(candidateId).queryKey,
    });
  },
});
```

API 함수를 감싼 코드 몇 줄을 줄이려던 건 아니었어요. 두 곳에 있던 함수 시그니처를 하나로 줄이려는 거였어요. lambda가 있으면 mutation의 변수 타입은 API 함수가 아니라 lambda에 적은 타입에서 정해져요. API 함수를 그대로 넘기면 변수 타입이 API 함수에서 추론되고, `onSuccess`에서 꺼낸 `candidateId`도 같은 타입에서 나와요. 그래서 API 파라미터가 바뀌면 맞지 않는 `mutate()` 호출부에 바로 타입 오류가 나요. 여기서도 `candidateReviewApi.create`가 `this` 바인딩 없이 동작한다는 전제는 필요해요.

<div class="note note-decision">
  <strong>핵심 결정</strong>
  <p>조회는 factory 한곳에서 query key와 `queryFn`을 함께 정의하고, mutation은 factory에 넣지 않았어요. 어떤 쿼리를 무효화하는지는 mutation 가까이에 factory의 query key로 적었어요. 조회 정의는 한곳에 모으고, 무효화 범위는 mutation을 읽을 때 바로 보이게 하려는 선택이었어요.</p>
</div>

## 옮기면서 정한 기준

- query key만 필요한 곳에서도 factory의 `queryKey`나 `_def`를 쓰고, 호출부에서 배열을 직접 만들지 않기로 했어요.
- 파라미터 객체는 직렬화할 수 있는 값으로 만들어 query key에 넣기로 했어요.
- 옮긴 정도는 파일 수나 변경 줄 수가 아니라, 같은 리소스의 query key 모양이 한곳에서 정해지는지로 봤어요.

## 달라진 건 무효화 범위가 보이는 자리였어요

처음에 적은 네 가지 불편은 이렇게 바뀌었어요.

| 처음의 불편 | 바꾼 것 | 옮긴 뒤 |
| --- | --- | --- |
| 호출부마다 문자열 순서가 달라질 수 있음 | factory가 query key 배열을 만듦 | 순서가 정의 한곳에서 정해짐 |
| 무효화 범위를 검색해야 알 수 있음 | `_def`·`_ctx`로 계층을 드러냄 | 메모 하나를 고쳤을 때 상세 전체를 갱신할지 메모만 갱신할지가 코드에 드러남 |
| API 파라미터가 바뀌면 query key와 `queryFn`을 따로 고침 | 한 정의에서 query key와 `queryFn`을 함께 만듦 | 고칠 곳이 정의 하나로 줄어듦 |
| mutation lambda가 API 인자 타입을 다시 선언함 | API 함수를 그대로 넘김 | API 파라미터가 바뀌면 `mutate()` 호출부에 타입 오류가 남 |

호출부 코드가 짧아진 건 별로 중요하지 않았어요. 위 예제에서 메모의 query key 배열은 옮기기 전과 원소 하나까지 같아요. 달라진 건 그 배열을 호출부가 아니라 factory가 만든다는 점이었어요. 문자열을 검색하지 않고도 조회 함수와 무효화 범위를 같은 계층에서 찾을 수 있게 된 게 실제 이득이었어요.

<div class="note note-limit">
  <strong>아직 확인하지 못한 것</strong>
  <p>무효화 누락이나 불필요한 재조회가 줄었는지는 재지 않았어요. 위 표는 코드 구조에서 읽은 변화예요. 지금은 당시 저장소를 볼 수 없어서, 모든 호출부가 이 기준을 지켰는지도 다시 확인하지 못했어요. mutation 예제에서 `candidateId`를 변수에서 꺼낸 모양은 설명을 위해 정한 것이고, v5 예시는 당시 코드가 아니라 같은 내용을 v5 문법으로 옮겨 쓴 거예요.</p>
</div>

## 참고

- [Query Key Factory](https://github.com/lukemorales/query-key-factory) — `createQueryKeys`, `contextQueries`, `_def`·`_ctx`
- [TanStack Query: Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query: Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation) — 앞부분이 일치하는 쿼리를 함께 무효화하는 기본 동작
- [TanStack Query: Migrating to TanStack Query v5](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5) — 위치 인자 overload 제거, 객체 형식으로 통일
- 관련 글: [같은 회사에서 Electron 수집 앱의 구조를 나눈 과정](https://jingeon27.tistory.com/5)
- 관련 글: [Next.js App Router에서 서버와 브라우저의 QueryClient를 나눈 이유](https://jingeon27.tistory.com/8) — 다음 회사에서 v5 `queryOptions`로 query key와 `queryFn`을 묶어 쓴 절이 있어요
