# TanStack Query v4의 query key를 Query Key Factory로 정리한 이유

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>여러 앱에 흩어진 query key와 조회 함수를 함께 정의하고, 수정 후 갱신할 범위를 코드에서 찾을 수 있게 했어요. 상세 아래의 쿼리를 한 계층으로 묶을 때 생기는 재조회 비용도 함께 정리했어요.</p>
</div>

후보자 메모를 수정한 뒤 어떤 쿼리를 무효화(invalidate)해야 하는지 찾으려고 저장소 전체에서 문자열을 검색한 적이 있어요. query key의 첫 값만 enum이었고, 뒤쪽 계층은 호출부마다 직접 붙이고 있었거든요.

```ts
enum CandidateQueryKey {
  Detail = 'CandidateDetail',
}

useQuery([CandidateQueryKey.Detail, 'detail', candidateId, 'memos'], fetchMemos);
```

호출부를 찾아보니 같은 기준을 여러 곳에서 맞추고 있었어요.

- 문자열 순서가 호출부마다 달라질 수 있었어요.
- 어떤 mutation이 어느 범위까지 무효화해야 하는지 코드를 검색해야 알 수 있었어요.
- API 파라미터가 바뀌면 query key와 `queryFn`을 따로 고쳐야 했어요.
- mutation은 API 함수를 lambda로 한 번 더 감싸면서 인자 타입을 다시 적고 있어서, 같은 함수 시그니처가 두 곳에 있었어요.

> 코드는 TanStack Query v4와 `@lukemorales/query-key-factory` 1.3.x 기준이에요. 본문 코드는 실제 코드에서 이름을 바꾸고 줄인 예제예요. v5는 `useMutation`, `useQuery`, `invalidateQueries`를 비롯한 대부분의 API에서 key나 함수를 위치 인자로 받던 overload를 없애고 객체 형식만 받아요. 그래서 본문의 `invalidateQueries(queryKey)` 호출은 v4 문법이고, v5에서는 `{ queryKey }`로 감싸야 해요. v5 예시는 mutation 절에 v4 코드와 나란히 적었어요.

## enum 뒤의 계층을 호출부마다 정하고 있었어요

enum을 쓴 건 괜찮았어요. 그 뒤에 붙는 계층과 파라미터가 호출부마다 정해지니, query key를 만드는 자리를 한곳에 모아야 했어요. 여기에 라이브러리가 꼭 필요한 건 아니에요. 직접 만든 함수가 배열과 `queryFn`을 함께 반환하게 해도 호출부에서 문자열을 조합하는 일은 줄일 수 있어요.

채택한 구조를 다른 방법과 나란히 놓으면 이래요.

| 방법 | 얻는 것 | 남는 비용 |
| --- | --- | --- |
| enum과 호출부의 배열 조합 | 추가 의존성이 없고 배열을 바로 읽을 수 있음 | 계층, 인자 순서와 무효화 범위를 여러 호출부에서 맞춰야 함 |
| 직접 만드는 key, 조회 옵션 함수 | 정의를 모으면서 제품에 필요한 형태를 직접 정할 수 있음 | 공통 prefix와 하위 계층의 생성과 타입을 직접 유지해야 함 |
| Query Key Factory | `_def`, `_ctx`로 prefix와 하위 쿼리를 같은 규칙으로 꺼낼 수 있음 | 라이브러리의 정의 문법을 익히고, 의존성과 호출부의 API 사용을 유지해야 함 |

## Query Key Factory로 key와 `queryFn`을 한곳에서 정의했어요

이 작업에서는 Query Key Factory의 계층 생성 방식을 사용했어요. query key와 조회 함수를 공용 패키지에서 함께 정의하고 여러 앱이 가져다 쓰도록 옮겼어요. 호출부마다 조합하던 기준은 줄었지만, 이제 그 호출부가 factory의 반환 구조를 알아야 해요. 쿼리가 적고 무효화 범위도 단순한 제품이라면 직접 만든 함수로도 충분해요.

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

같은 원리로 `_def`를 쓰면 특정 ID 하나 대신 `list` 아래 쿼리를 통째로 무효화할 수 있어요.

```ts
queryClient.invalidateQueries(candidateCollectionKeys.list._def);
```

## 함께 묶으면 무효화 범위도 넓어져요

상세와 메모를 한 계층에 두면 같은 후보자 아래의 데이터를 찾고 함께 무효화하기 쉬워요. 대신 `detail.queryKey`를 넘겼을 때는 바뀌지 않은 이력까지 무효화 대상에 들어가요. 현재 화면에서 사용 중인 쿼리는 기본적으로 백그라운드 재조회되고, 사용 중이지 않은 쿼리는 stale 상태로 표시돼요. 모든 쿼리가 즉시 네트워크 요청을 보내는 것은 아니에요. [TanStack Query의 무효화 동작](https://tanstack.com/query/v4/docs/framework/react/guides/query-invalidation)

상세 요약도 함께 바뀌는 수정이라면 상세 범위를 선택할 수 있어요. 메모 데이터만 바뀌었다면 `_ctx.memos.queryKey`로 범위를 좁힐 수 있고요. 상세 자체만 무효화하고 하위 쿼리는 유지하려면 다음처럼 써요.

```ts
// TanStack Query v4에서도 객체 형식을 쓸 수 있어요.
queryClient.invalidateQueries({
  queryKey: detail.queryKey,
  exact: true,
});
```

넓게 무효화하면 연관 데이터 갱신을 빠뜨릴 여지는 줄지만 재조회 범위가 커져요. 좁히면 재조회 범위를 줄일 수 있지만, 수정 결과에 영향을 받는 데이터를 직접 판단해야 해요. `contextQueries`는 key를 만드는 계층을 제공할 뿐, 메모 수정이 상세 요약이나 목록까지 바꾸는지 알아서 결정하지 않아요. 그래서 무효화 범위는 mutation 가까이에 남겼어요.

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

목적은 두 곳에 있던 함수 시그니처를 하나로 줄이는 거였어요. lambda가 있으면 mutation의 변수 타입은 lambda에 적은 타입을 따라가요. API 함수를 그대로 넘기면 변수 타입이 API 함수에서 추론되고, `onSuccess`에서 꺼낸 `candidateId`도 같은 타입에서 나와요. 그래서 API 파라미터가 바뀌면 맞지 않는 `mutate()` 호출부에 바로 타입 오류가 나요. 여기서도 `candidateReviewApi.create`가 `this` 바인딩 없이 동작한다는 전제는 필요해요.

<div class="note note-decision">
  <strong>핵심 결정</strong>
  <p>조회의 key 계층과 함수는 라이브러리로 한곳에 모았어요. 대신 호출부가 `_def`, `_ctx`를 알아야 해요. mutation은 factory에 넣지 않았어요. 어느 데이터가 함께 바뀌는지는 mutation이 판단하도록 무효화 범위를 그 곁에 적었어요.</p>
</div>

## 옮기면서 정한 기준과 factory가 보장하지 않는 것

- query key만 필요한 곳에서도 factory의 `queryKey`나 `_def`를 쓰고, 호출부에서 배열을 직접 만들지 않기로 했어요.
- 파라미터 객체는 직렬화할 수 있는 값으로 만들어 query key에 넣기로 했어요.
- 얼마나 옮겼는지는 같은 리소스의 query key 모양이 한곳에서 정해지는지로 봤어요. 파일 수나 변경 줄 수는 기준으로 삼지 않았어요.

factory가 반환 타입을 만들어 줘도 요청 결과를 바꾸는 변수가 key에서 빠졌는지까지 보장하지는 않아요. 예를 들어 `queryFn`이 새 정렬 조건을 쓰는데 key에는 그 조건이 없다면 다른 결과가 같은 캐시를 사용하게 돼요. 조회에 영향을 주는 변수와 key가 함께 바뀌는지는 정의를 수정할 때 확인해야 해요. [TanStack Query의 query key 기준](https://tanstack.com/query/v4/docs/framework/react/guides/query-keys)

옮길 때 생성된 배열이 이전 배열과 같은지도 봐야 해요. 문자열이나 순서를 바꾸면 기존 호출부와 다른 캐시를 가리킬 수 있고, prefix를 바꾸면 무효화 대상도 달라져요. 이 글의 예제는 기존 배열을 유지하면서 만드는 위치를 옮긴 경우예요.

옮길 때 기존 query key 배열은 유지했어요. 캐시의 의미를 바꾸는 작업과 정의 위치를 바꾸는 작업을 분리하고 싶었거든요. 이후에는 문자열을 검색하는 대신 같은 정의에서 조회 함수와 무효화 범위를 찾게 됐어요.

## v5에서는 기본 헬퍼도 비교할 수 있어요

v5에서 같은 구조를 새로 만든다면 `queryOptions`도 대안이에요. query key와 `queryFn`을 함께 정의해 여러 호출부에서 재사용하고 타입을 추론할 수 있어요. 별도 key factory 의존성은 줄지만, key 배열과 무효화용 prefix는 직접 설계해야 해요. `queryOptions`가 `_def`, `_ctx` 같은 계층을 자동으로 만들어 주지는 않거든요. [TanStack Query의 Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options)

함께 정의하고 재사용하는 게 목적이라면 기본 헬퍼로 충분할 수 있어요. 여러 앱에서 같은 key 계층을 만들어야 한다면 factory의 규칙도 견줘 볼 만해요.

## 참고

- [Query Key Factory](https://github.com/lukemorales/query-key-factory): `createQueryKeys`, `contextQueries`, `_def`, `_ctx`
- [TanStack Query: Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query: Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation): 앞부분이 일치하는 쿼리를 함께 무효화하는 기본 동작
- [TanStack Query: Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options): v5에서 query key, 조회 함수, 옵션을 함께 정의하는 대안
- [TanStack Query: Migrating to TanStack Query v5](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5): 위치 인자 overload 제거, 객체 형식으로 통일
- 관련 글: [같은 회사에서 Electron 수집 앱의 구조를 나눈 과정](https://jingeon27.tistory.com/5)
- 관련 글: [Next.js App Router에서 서버와 브라우저의 QueryClient를 나눈 이유](https://jingeon27.tistory.com/8) (다음 회사에서 v5 `queryOptions`로 query key와 `queryFn`을 묶어 쓴 절이 있어요)
