# 내 선언적 코드 작성법

저는 코드를 읽는 것도 검증 과정이라고 생각해요. 테스트와 화면 확인으로 동작을 검증하는 한편, 코드를 보면서 잘못 연결된 상태나 빠진 조건을 찾기도 하거든요. 그래서 사람이 읽고 의도를 파악하기 쉬운 구조를 중요하게 보고 있어요.

선언적으로 작성할 때도 같은 기준으로 봐요. 화면을 이루는 구획이 무엇인지, 각 구획이 어떤 데이터를 쓰는지, 어떤 조건에서 동작하는지가 코드에 드러났으면 해요. 세부 구현은 해당 구획 안에 두고, 사용하는 쪽에서는 무엇을 하려는지 읽을 수 있게 만드는 거예요.

작업하면서 정한 기준은 skills에 남기고 계속 보강하고 있어요. 이 글은 `code-style`, `page-composition`, `search-filter`, `react-query` 등에 정리해 둔 제 작성법을 실제 코드와 함께 풀어본 것이에요. 예제는 필요한 부분만 줄였고, 내부 식별자 일부는 공개용으로 바꿨어요.

## 화면 구획의 추상화 수준을 맞춰요

상세 화면을 나눌 때는 JSX가 길다는 이유만으로 중간 몇 줄을 컴포넌트로 빼지 않아요. 화면을 어떤 단위로 읽을지 먼저 정해요.

리뷰 상세를 예로 들면 리뷰 정보, 결제 정보, 방문 인증 자료, 변경 이력이 각각의 구획이에요. 앞의 두 구획만 컴포넌트로 빼고 나머지를 그대로 두면 이런 모습이 돼요. 차이를 설명하려고 줄인 비교 예제예요.

```tsx
<>
  <ReviewInfoDescriptions review={review} />
  <ReviewPaymentDescriptions review={review} />

  <Divider>방문 인증 자료</Divider>
  <Image.PreviewGroup>
    {review.receipts.map((receipt) => (
      <Image key={receipt.fileId} src={receipt.url} />
    ))}
  </Image.PreviewGroup>

  <Divider>히스토리</Divider>
  <Timeline items={historyItems} />
</>
```

앞의 두 줄은 이름만 읽으면 되는데, 아래에서는 개별 이미지와 타임라인의 구현을 읽어야 해요. 한 화면을 읽다가 갑자기 더 작은 단위로 내려가는 거죠.

지금 리뷰 상세에서는 같은 크기의 구획을 나란히 놓고 있어요. 아래는 실제 상세 화면에서 해당 부분만 가져온 코드예요.

```tsx
<>
  <ReviewInfoDescriptions review={detailInfo.review} />
  <ReviewPaymentDescriptions review={detailInfo.review} />
  <ReviewReceiptImages receipts={detailInfo.review.receipts} />
  <ReviewHistoryTimeline histories={detailInfo.reviewHistoryList} />
</>
```

부모에서는 화면의 구성을 읽고, 방문 인증 자료의 세부 동작이 궁금할 때는 `ReviewReceiptImages`를 열면 돼요. 제목도 그 구획 안에 둬요. 구획을 나눴는데 제목이나 그 구획에서만 쓰는 핸들러가 부모에 남아 있다면, 관련 코드가 아직 흩어져 있는 것으로 봐요.

한 화면에서만 쓰더라도 이렇게 읽는 단위를 맞추기 위한 컴포넌트는 만들어요. 여러 화면에서 쓸 범용 컴포넌트를 미리 만드는 것과는 목적이 달라요.

## 독립적인 구획은 데이터와 동작도 함께 가져가요

마크업만 옮기고 모든 조회와 조건을 부모에 남기면 부모는 여전히 자식의 세부 동작을 알고 있어야 해요. 구획을 하나 추가할 때마다 부모의 조회와 props도 늘어나고요.

Back-Office의 정산 요약에서는 통계, 입금 내역, 지점별 내역을 나눴어요. 페이지는 식별자를 넘기고 각 구획을 배치해요.

```tsx
<>
  <QueryErrorBoundary variant="section">
    <SettlementSummaryStatsDescription partnerId={partnerId} />
  </QueryErrorBoundary>
  <QueryErrorBoundary variant="section">
    <SettlementSummaryDepositTable partnerId={partnerId} />
  </QueryErrorBoundary>
  <QueryErrorBoundary variant="section">
    <SettlementSummaryBranchTable partnerId={partnerId} />
  </QueryErrorBoundary>
</>
```

통계는 필요한 병원 정보와 정산 요약을 직접 조회해요. 지점별 표는 요약을 읽어 지점 내역을 보여줄 대상인지 판단하고, 필요한 경우에만 지점 목록을 조회해요. 부모가 `isMainPartner` 같은 조회 결과를 계산해서 내려주지 않아요.

세 구획이 함께 읽는 정산 요약은 `useSettlementSummary`에서 URL과 조회 파라미터를 조합해요. 구획마다 파라미터를 조금씩 다르게 적지 않고 같은 queryKey의 캐시를 구독하게 한 거예요. 이 훅은 조회를 감싸기만 하는 게 아니라, 이 화면의 조회 조건을 연결하는 역할이 있어요.

각 조회가 바운더리 안에 있으니 한 구획의 오류를 다른 구획과 나눠 처리할 자리도 생겨요. 이 부분은 [에러 처리 개편 글](https://jingeon27.tistory.com/28)에서 더 자세히 설명했어요.

반대로 부모가 선택한 행이나 임시 입력값처럼 부모가 소유한 값은 props로 전달해요. 데이터를 전부 자식에게 넘기지 않겠다는 게 아니라, 독립적으로 조회할 수 있는 구획의 맥락까지 부모가 떠안지 않게 하려는 기준이에요.

## 고정된 UI는 컴포넌트의 조합으로 표현해요

복지몰의 검색 Chip에는 지역, 진료과, 쿠폰, 이벤트 같은 항목이 있어요. 지역과 진료과는 Bottom Sheet을 열고, 혜택은 선택 여부를 토글해요. 탭과 검색 방식에 따라 노출되는 조합도 다르고요.

이전에는 각 항목의 라벨, 클릭 동작, 선택 상태, 노출 조건을 설정 배열에 넣었어요. 공통 렌더러가 이 설정을 해석했죠.

```tsx
return FILTER_CHIPS_CONFIG
  .filter((config) => !config.visible || config.visible(currentTab, isFilterSearch))
  .map((config) => (
    <Chip
      key={config.key}
      hasArrow={config.hasArrow}
      pressed={config.pressed(filterState)}
      onClick={() => config.onClick(handleOpenFilter, handleBenefitToggle)}
    >
      {typeof config.label === 'function'
        ? config.label(filterState)
        : config.label}
    </Chip>
  ));
```

이 방식에서는 프로그램 탭에 무엇이 나오는지 알려면 항목별 노출 조건을 따라가야 해요. 쿠폰에만 아이콘이나 선택 스타일을 넣으려 해도, 설정의 속성과 공통 렌더러를 함께 살펴봐야 하고요.

지금은 각 Chip이 자기 동작을 가진 컴포넌트이고, 화면 구성에는 그 조합만 남겨요.

```tsx
const FILTER_CONFIG: Record<SearchFilterCase, ComponentType<IFilterChipProps>[]> = {
  partner_filter: [
    RegionChip, DepartmentChip, CouponChip, HasEventChip,
    NewPartnerChip, PartnerInfoChip, TreatmentTimeChip,
  ],
  partner_integrated: [
    RegionChip, DepartmentIdsChip, CouponChip, HasEventChip,
    NewPartnerChip, PartnerInfoChip, TreatmentTimeChip,
  ],
  program_filter: [
    RegionChip, DepartmentChip, CouponChip, TodayDiscountChip, HasEventChip,
  ],
  program_integrated: [
    RegionChip, DepartmentIdsChip, CouponChip,
  ],
};
```

프로그램 탭의 통합 검색에 어떤 Chip이 나오는지는 `program_integrated`에서 바로 읽혀요. 쿠폰을 다른 탭에 노출하려면 그 조합에 `CouponChip`을 추가하면 되고요.

쿠폰의 선택 스타일은 쿠폰 컴포넌트가 정해요. 혜택을 토글하는 공통 동작은 `BenefitChip`을 같이 써요.

```tsx
function CouponChip(_: IFilterChipProps) {
  return (
    <BenefitChip
      benefit="couponDiscount"
      className="data-[state=on]:text-body-md-semibold"
    />
  );
}
```

skills에서는 고정된 탭이나 메뉴도 같은 기준으로 직접 나열하게 했어요. 개수와 동작이 정해진 UI를 데이터 배열로 옮긴 뒤 다시 해석하는 단계를 만들지 않으려는 거예요. 검색 Chip처럼 조합이 여러 개면 컴포넌트 배열로 구성을 남길 수도 있어요. 이때 배열은 라벨과 동작을 해석하기 위한 설정이 아니라, 이미 동작을 가진 컴포넌트의 조합이에요.

서버에서 받아오는 목록이나 같은 규칙을 반복하는 항목에는 `map`을 써요. 제가 구분하는 건 배열을 썼는지가 아니라, 반복되는 데이터를 그리는지 고정된 화면의 서로 다른 동작을 조립하는지예요.

## 공통 동작은 모으고 화면의 구성은 사용처에 남겨요

관리자 서비스의 검색 필터도 같은 기준으로 바꿨어요. 예전에는 공통 날짜 입력이 `consultationDate` 같은 key를 보고 상담일과 예약일의 필드명을 골랐어요.

```tsx
const isConsultationDate = filter.key === 'consultationDate';
const startKey = isConsultationDate ? 'consultationStartDt' : 'reservationStartDt';
const endKey = isConsultationDate ? 'consultationEndDt' : 'reservationEndDt';
```

날짜 범위를 입력받는 공통 컴포넌트가 예약 관리 화면의 필드명을 알고 있는 구조였어요. 지금은 날짜 입력 방법만 공통으로 두고, 무엇을 입력하는지는 사용처에 적어요.

```tsx
const SearchFilter = createSearchFilter(
  reservationSearchParamsSchema,
  RESERVATION_SEARCH_PARAMS_FALLBACK,
);

<SearchFilter
  onSubmit={handleSearch}
  defaultValues={{
    keywordType: 'UNIFIED',
    reservationDateSearchType: RESERVATION_DATE_SEARCH_TYPE.RegDtm,
  }}
>
  <SearchFilter.Keyword
    name="keyword"
    typeName="keywordType"
    options={SEARCH_KEYWORD_TYPES}
  />
  <SearchFilter.Fields>
    <SearchFilter.DateRange
      label="상담일"
      startName="consultationStartDt"
      endName="consultationEndDt"
    />
    <SearchFilter.DateRange
      label="예약일"
      startName="reservationStartDt"
      endName="reservationEndDt"
      typeName="reservationDateSearchType"
      typeOptions={RESERVATION_DATE_SEARCH_TYPES}
    />
  </SearchFilter.Fields>
</SearchFilter>
```

폼 인스턴스, URL과 입력값의 동기화, 초기화 같은 공통 동작은 `SearchFilter`가 맡아요. 화면에 어떤 필터를 놓을지와 검색 제출 후 무엇을 할지는 해당 화면의 검색 필터 컴포넌트에 남겨요. 라우트에는 그 조립 컴포넌트 하나를 배치하고요.

필드명을 직접 적더라도 자유 문자열로 두지는 않아요. `createSearchFilter`가 받은 Zod 스키마에서 폼 타입을 추론하고, 내부의 `createTypedForm`이 필드 경로를 검사해요. URL의 입력값도 같은 스키마로 검증해요.

이런 공통화는 여러 화면에서 같은 폼 동작을 쓸 때 만들어요. 한 화면의 예외 때문에 공용 컴포넌트에 옵션을 계속 더하기보다, 그 화면의 조합으로 해결할 수 있는지 먼저 봐요. 필드 경로와 폼 타입 구현은 [프로그램 폼을 정리한 글](https://jingeon27.tistory.com/18)에 따로 적었어요.

## 값은 계산하고, 상태는 필요한 만큼만 둬요

값을 만든 뒤 조건마다 다시 할당하는 코드보다, 무엇을 고르는지 한 식에서 읽히는 코드를 선호해요. skills에 정리한 기준을 예제로 보면 이런 차이예요.

```ts
let result = programs;

if (keyword) result = result.filter((program) => program.name.includes(keyword));
if (partnerId !== undefined) result = result.filter((program) => program.partnerId === partnerId);
```

```ts
const result = programs
  .filter((program) => !keyword || program.name.includes(keyword))
  .filter((program) => partnerId === undefined || program.partnerId === partnerId);
```

읽는 사람이 변수의 중간 상태를 따라가지 않아도, 어떤 조건을 만족한 목록인지 볼 수 있어요. `let`을 없애는 게 목적은 아니에요. 객체를 하나 만들고 그 속성을 계속 바꾸면 추적할 일은 그대로 남으니까요.

같은 이유로 반복 탐색이나 그룹핑을 직접 구현하기 전에 `es-toolkit`을 확인해요. 정산 지점별 표에서도 각 행의 병원 목록을 ID별로 찾을 수 있게 만들 때 `keyBy`를 쓰고 있어요.

```ts
const branchTableData = branchList.map((item) => ({
  yearMonth: item.yearMonth,
  ...keyBy(item.partnerData, (partner) => partner.partnerId),
}));
```

직접 누적 객체를 만들고 값을 채우는 순서를 쓰는 대신, 어떤 키로 묶으려는지 보여줘요. 복잡한 union 상태 분기에는 `ts-pattern`을 쓰고, 두 값 중 하나를 고를 때는 삼항식, 키와 값이 일대일로 대응할 때는 `Record`를 써요. 분기의 형태에 맞춰 선택하는 거예요.

화면 상태도 원본에서 계산할 수 있으면 다시 저장하지 않아요. 복지몰의 검색 선택 상태는 URL에서 계산해요.

```tsx
const currentParams = useTypedQueryParams({
  schema: keywordSearchParamsSchema,
});

const filterState = useMemo(
  () => urlParamsToFilterState(currentParams),
  [currentParams],
);
```

Chip을 누르면 URL을 바꾸고, 화면은 그 URL에서 선택 상태를 읽어요. 별도 state와 effect로 같은 값을 맞추지 않아요. [React의 상태 설계 문서](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)도 원본에서 계산할 수 있는 값을 중복 상태로 두지 않는 쪽을 설명해요.

반면 Bottom Sheet에서 고르는 중인 값은 임시 폼 상태로 둬요. ‘적용하기’를 누르기 전까지는 목록의 검색 조건이 바뀌면 안 되거든요. 적용된 조건과 편집 중인 조건은 역할이 다르니 각각 두는 게 맞아요.

## 조회 조건도 호출 순서보다 의존성으로 표현해요

조회할 때는 `queryOptions`에 queryKey와 조회 함수를 모으고, 사용하는 컴포넌트에서 `useQuery`로 구독해요. 입력값이 없으면 조회를 보류하는 조건도 options 안에 둬요. 아래는 skills에 정리한 클라이언트 조회 패턴이에요.

```ts
export const programDetailOptions = (programId?: number) =>
  queryOptions({
    queryKey: compact(['fetchProgramDetail', programId]),
    queryFn: programId ? () => fetchProgramDetail({ programId }) : skipToken,
  });
```

```tsx
const { data, isLoading } = useQuery(programDetailOptions(programId));
```

컴포넌트마다 ‘ID가 생기면 요청하고 결과를 state에 넣는다’는 흐름을 새로 작성하지 않아요. 어떤 ID의 조회를 구독하는지만 적어요. `skipToken`으로 조회 함수를 나누면, 호출하는 쪽에서 ID가 있다고 단언할 필요도 없고요.

`useQuery`를 감싸기만 하는 훅도 만들지 않아요. URL에서 조건을 가져오거나 여러 조회를 연결하는 역할이 있을 때만 훅을 둬요. 단순 래퍼가 추가되면 실제로 어떤 조회를 하는지 확인하려고 파일을 하나 더 열어야 하니까요.

다만 수동 `refetch`가 필요한 조회는 다르게 봐요. `skipToken`인 상태에서는 실행할 조회 함수가 없으니, 그런 경우에는 `enabled` 같은 다른 방식이 필요해요. 이 동작은 [TanStack Query 문서](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries)에 설명돼 있어요.

## 테스트도 그 자리에서 동작 명세가 읽히게 써요

테스트에서도 준비 과정을 숨길 수는 있지만, 어떤 조건에서 무엇을 하고 무엇이 남아야 하는지는 테스트 안에 남겨요.

복지몰 검색 필터의 혜택 해제 테스트예요.

```ts
it('켜져 있던 혜택 칩을 다시 누르면 그 파라미터만 빼야 한다', () => {
  const result = renderSearchFilter(
    'q=검색어&tab=partner&todayDiscount=true&hasEvent=true',
  );

  result.current.toggleBenefit('todayDiscount');

  expect(writtenParams()).toEqual({
    q: '검색어',
    tab: 'partner',
    hasEvent: 'true',
  });
});
```

`renderSearchFilter`는 경로 mock과 Query 캐시를 준비하고, `writtenParams`는 History API로 쓴 URL을 읽어줘요. 그 준비 과정은 몰라도 어떤 혜택을 누르고 어떤 조건을 남겨야 하는지 테스트 하나에서 읽혀요.

`hasEvent`를 함께 비교하는 것도 명세의 일부예요. 누른 혜택만 해제돼야 하고, 다른 조건까지 지워지면 안 되거든요. 헬퍼 안에서 행동과 검증까지 모두 처리하게 만들면 이 조건을 확인하기 어려워져요.

새 기능의 기대 동작은 `*.spec`에 BDD 형식으로 적고, 운영이나 QA에서 발견한 오류는 `*.test`에 재현해요. 같은 규칙을 입력값만 바꿔 확인하는 경우에는 `it.each`를 쓰지만, 서로 다른 동작을 줄 수만 줄이려고 하나의 설정 배열에 넣지는 않아요.

## 반복해서 내리는 판단은 skills와 lint에 남겨요

이 기준을 매번 기억해서 리뷰하려고만 하지는 않아요. 에이전트가 구획의 맥락을 다시 섞거나 불필요한 래퍼를 만들면, 해당 코드와 함께 skills의 설명과 예제도 보강해요. 정적으로 검사할 수 있는 부분은 lint 규칙으로 옮기고요.

구현을 에이전트에게 맡기더라도 결과의 구조는 제가 확인해요. 화면의 구획이 같은 수준으로 놓여 있는지, 데이터와 동작이 관련된 자리에 모여 있는지, 값 하나를 이해하려고 너무 많은 파일을 따라가야 하는지 봐요.

제가 선언적으로 작성하려는 이유도 여기에 있어요. 사용하는 쪽에서는 의도를 읽고, 세부 동작을 확인할 때는 관련 구현을 찾아갈 수 있었으면 해요. 그렇게 구조를 유지하는 것이 코드 리뷰와 검증에도 도움이 된다고 생각해요.

## 참고

- [React: Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)
- [TanStack Query: Disabling/Pausing Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries)
- [es-toolkit: keyBy](https://es-toolkit.dev/reference/array/keyBy.html)
