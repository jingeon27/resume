# 리뷰 좋아요를 낙관적으로 갱신하며 여러 캐시를 함께 복구한 과정

> 이 글은 프로젝트에서 사용한 TanStack Query v5 기준으로 작성했어요.

목록에서 누른 좋아요가 상세에서는 반영되지 않았어요. 둘 다 같은 리뷰를 보여 주는데 왜 값이 달랐을까요? 각 `ReviewItem`이 `isLiked`와 `likeCount`를 자기 로컬 상태로 복사해 갖고 있었기 때문이에요.

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>컴포넌트마다 복사하던 좋아요 값을 TanStack Query 캐시에서 읽도록 바꾼 과정이에요. 캐시를 낙관적으로 바꿔도 TanStack Query가 이전 값을 자동으로 되돌려 주지는 않아서, `onMutate`에서 목록과 상세 캐시의 스냅샷을 남기고 요청이 실패하면 `onError`에서 직접 복구했어요. 스냅샷으로 풀리지 않는 연속 클릭은 요청 중 같은 버튼을 다시 누르지 못하게 해 따로 다뤘어요.</p>
</div>

## 좋아요 값을 컴포넌트마다 따로 들고 있었어요

처음 구조는 이랬어요.

```tsx
function ReviewItem({ review }: { review: Review }) {
  const [isLiked, setIsLiked] = useState(review.like);
  const [likeCount, setLikeCount] = useState(review.likeCnt);

  const handleChange = async (checked: boolean) => {
    const previous = { isLiked, likeCount };

    setIsLiked(checked);
    setLikeCount((count) => count + (checked ? 1 : -1));

    try {
      await fetchReviewLike({
        reviewId: review.reviewId,
        feedbackType: checked ? 'LIKE' : 'UNLIKE',
      });
    } catch {
      setIsLiked(previous.isLiked);
      setLikeCount(previous.likeCount);
    }
  };

  return <LikeSwitch like={isLiked} likeCnt={likeCount} onChange={handleChange} />;
}
```

버튼은 바로 반응했지만, 이 방식에는 두 가지 문제가 있었어요.

- 같은 리뷰를 보여 주는 목록과 상세 화면이 서로 다른 로컬 상태를 가졌어요.
- 요청이 실패하면 각 컴포넌트가 자기 상태만 복구하므로 다른 화면과 값이 어긋날 수 있었어요.

서버에서 받은 리뷰는 이미 TanStack Query 캐시에 저장하고 있었어요. 컴포넌트에 같은 값을 다시 복사하기보다 캐시를 화면이 구독하는 값으로 삼는 편이 자연스러웠어요.

## 캐시로 옮겨도 롤백은 직접 써야 했어요

캐시로 옮기면서 먼저 바로잡을 오해가 있었어요. `onMutate`에서 `setQueryData`를 호출했다고 해서 TanStack Query가 이전 캐시를 자동으로 저장하고 복구해 주지는 않아요.

캐시를 직접 낙관적으로 바꾼다면 다음 과정도 직접 작성해야 해요.

1. 진행 중인 refetch를 취소해요.
2. 변경 전 캐시의 스냅샷을 저장해요.
3. 캐시를 낙관적으로 변경해요.
4. `onMutate`에서 스냅샷을 반환해요.
5. 요청이 실패하면 `onError`에서 스냅샷을 다시 넣어요.
6. 성공과 실패 모두 `invalidateQueries`로 서버 값과 재동기화해요.

공식 문서도 `onMutate`가 반환한 값을 `onError`에서 사용해 직접 복구하는 흐름을 안내해요. 그렇다면 스냅샷은 어느 캐시까지 남겨야 할까요?

## 바꿀 캐시의 범위를 query key 계층으로 묶었어요

리뷰 목록은 병원과 페이지 크기에 따라 여러 캐시가 생기고, 상세 리뷰는 별도의 캐시를 사용해요.

```ts
const reviewKeys = {
  all: ['review'] as const,
  infinite: ['review', 'infinite'] as const,
  detail: (reviewId: number) =>
    ['review', 'detail', reviewId] as const,
};
```

예를 들어 다음 쿼리는 파라미터가 달라도 모두 `reviewKeys.infinite`에 포함돼요.

```ts
['review', 'infinite', { hospitalId: 1, size: 3 }]
['review', 'infinite', { hospitalId: 1, size: 20 }]
['review', 'infinite', { hospitalId: 2, size: 10 }]
```

이 계층이 있어야 특정 `size`를 하드코딩하지 않고 현재 캐시에 있는 리뷰 목록을 함께 찾을 수 있어요.

## 목록과 상세가 같은 계산을 쓰도록 순수 함수로 뺐어요

목록과 상세에서 같은 계산을 쓰도록 리뷰 한 건의 변경 규칙을 먼저 분리했어요.

```ts
import type { InfiniteData, QueryKey } from '@tanstack/react-query';

type Review = TReviewDTO;
type ReviewInfiniteData = InfiniteData<
  TGlobalListResponse<TReviewDTO[]>
>;
type ReviewDetailResponse = TGlobalResponse<TReviewDetailDTO>;

type ReviewLikeVariables = {
  reviewId: number;
  feedbackType: 'LIKE' | 'UNLIKE';
};

function updateReviewLike<T extends Review>(
  review: T,
  { reviewId, feedbackType }: ReviewLikeVariables,
): T {
  if (review.reviewId !== reviewId) return review;

  const nextLike = feedbackType === 'LIKE';

  // 같은 상태를 다시 반영할 때 숫자가 중복으로 변하지 않게 한다.
  if (review.like === nextLike) return review;

  return {
    ...review,
    like: nextLike,
    likeCnt: Math.max(0, review.likeCnt + (nextLike ? 1 : -1)),
  };
}
```

목록 응답의 각 페이지에는 이 함수를 적용해요.

```ts
function updateReviewList(
  oldData: ReviewInfiniteData | undefined,
  variables: ReviewLikeVariables,
) {
  if (!oldData) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        list: page.data.list.map((review) =>
          updateReviewLike(review, variables),
        ),
      },
    })),
  };
}
```

## 바꾸기 전에 목록과 상세의 스냅샷을 함께 남겼어요

좋아요 요청이 실패했을 때 목록만 되돌리거나 상세만 되돌리면 화면마다 값이 달라져요.

<div class="note note-decision">
  <strong>핵심 결정</strong>
  <p>컴포넌트마다 자기 상태만 되돌리던 방식 대신, `onMutate`에서 목록과 상세 두 종류의 캐시 스냅샷을 모두 저장해 반환하고 요청이 실패하면 `onError`에서 각각 다시 넣기로 했어요. 성공과 실패 모두 마지막에는 `invalidateQueries`로 서버 값과 재동기화해요.</p>
</div>

```ts
type ReviewLikeContext = {
  listSnapshots: Array<[
    QueryKey,
    ReviewInfiniteData | undefined,
  ]>;
  detailKey: QueryKey;
  detailSnapshot: ReviewDetailResponse | undefined;
};

export function useReviewLike() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    void,
    Error,
    ReviewLikeVariables,
    ReviewLikeContext
  >({
    mutationKey: ['review-like'],
    mutationFn: fetchReviewLike,

    onMutate: async (variables) => {
      const detailKey = reviewKeys.detail(variables.reviewId);

      // 이미 진행 중인 refetch가 낙관적 값을 덮지 않게 한다.
      await Promise.all([
        queryClient.cancelQueries({ queryKey: reviewKeys.infinite }),
        queryClient.cancelQueries({ queryKey: detailKey }),
      ]);

      const listSnapshots =
        queryClient.getQueriesData<ReviewInfiniteData>({
          queryKey: reviewKeys.infinite,
        });

      const detailSnapshot =
        queryClient.getQueryData<ReviewDetailResponse>(detailKey);

      queryClient.setQueriesData<ReviewInfiniteData>(
        { queryKey: reviewKeys.infinite },
        (oldData) => updateReviewList(oldData, variables),
      );

      queryClient.setQueryData<ReviewDetailResponse>(
        detailKey,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: updateReviewLike(oldData.data, variables),
          };
        },
      );

      return {
        listSnapshots,
        detailKey,
        detailSnapshot,
      };
    },

    onError: (error, _variables, context) => {
      context?.listSnapshots.forEach(([queryKey, oldData]) => {
        queryClient.setQueryData(queryKey, oldData);
      });

      if (context) {
        queryClient.setQueryData(
          context.detailKey,
          context.detailSnapshot,
        );
      }

      toast.warning(getErrorMessage(error));
    },

    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: reviewKeys.all }),
  });

  return {
    handleLike: mutation.mutate,
    isLikePending: mutation.isPending,
  };
}
```

`onSettled`에서 `invalidateQueries`의 Promise를 반환하면 재검증이 끝날 때까지 mutation의 pending 상태도 유지할 수 있어요.

## `getQueriesData`는 지금 있는 캐시만 찾아요

`getQueriesData({ queryKey: reviewKeys.infinite })`는 해당 prefix로 **현재 캐시에 존재하는 쿼리**를 반환해요. 같은 query key 규칙을 쓰는 목록 캐시를 한꺼번에 찾을 수 있다는 점이 유용했어요. 하지만 새로운 목록 캐시를 만들거나 앞으로 생길 화면까지 자동으로 동기화하는 기능은 아니에요.

그래서 다음 조건이 필요해요.

- 목록의 query key가 같은 계층 규칙을 따라야 해요.
- 상세처럼 다른 key를 쓰는 캐시는 별도로 갱신해야 해요.
- 마지막에는 서버 값을 다시 조회해 클라이언트 계산을 검증해야 해요.

## 연속 클릭은 스냅샷으로 풀리지 않아 버튼을 막았어요

Optimistic Update가 한 번의 요청을 빠르게 보이게 해 준다고 해서 동시성까지 자동으로 해결되지는 않아요. 사용자가 좋아요와 취소를 연속으로 누르면 요청이 보낸 순서와 다른 순서로 끝날 수 있거든요.

이 화면에서는 요청 중 같은 버튼을 다시 누르지 못하게 하는 방법이 가장 단순했어요.

```tsx
const { handleLike, isLikePending } = useReviewLike();

<LikeSwitch
  {...review}
  disabled={isLikePending}
  onChange={(checked) =>
    handleLike({
      reviewId: review.reviewId,
      feedbackType: checked ? 'LIKE' : 'UNLIKE',
    })
  }
/>
```

## 실패와 여러 캐시가 겹치는 경우를 확인해야 해요

지금 흐름은 이래요.

```text
사용자 입력
  -> 관련 refetch 취소
  -> 목록과 상세 캐시의 스냅샷 저장
  -> 목록과 상세 캐시 즉시 변경
  -> 요청 실패 시 스냅샷으로 직접 복구
  -> 성공/실패 후 서버 데이터 재검증
```

이 로직은 성공 경로보다 실패와 여러 캐시가 겹치는 경우가 중요해요. 확인해야 할 테스트는 이래요.

1. 좋아요 직후 목록의 아이콘과 숫자가 API 응답 전에 바뀌어요.
2. `size`가 다른 여러 목록 캐시에 같은 리뷰가 있으면 모두 바뀌어요.
3. 상세 캐시가 있으면 목록과 상세가 함께 바뀌어요.
4. API가 실패하면 모든 목록과 상세가 각각의 스냅샷으로 돌아가요.
5. 진행 중이던 refetch가 optimistic value를 중간에 덮지 않아요.
6. 같은 상태를 중복 반영해도 좋아요 수가 두 번 증가하거나 음수가 되지 않아요.
7. 재검증 후 화면이 서버의 최종 값과 일치해요.

좋아요 버튼을 빠르게 보이게 하는 것보다 어려웠던 것은 목록과 상세를 함께 되돌리는 일이었어요. 어떤 캐시를 바꿨는지 직접 기록해야 실패했을 때 같은 범위를 되돌릴 수 있어요.

<div class="note note-limit">
  <strong>남은 한계</strong>
  <p>`getQueriesData`는 지금 캐시에 있는 쿼리만 찾아요. 좋아요 정보를 보여 주는 새로운 캐시가 생기면 optimistic update 대상인지 따로 검토해야 해요. 이 화면은 연속 조작을 요청 중 버튼을 막는 방식으로 다뤄요. 연속 조작을 허용해야 한다면 리뷰 ID별 요청 직렬화, 마지막 의도만 반영하는 방식, 서버의 멱등성까지 함께 설계해야 하고, 캐시 스냅샷만으로 해결할 수 있는 문제는 아니에요.</p>
</div>

## 참고

- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
