# 선언적이라고 다 읽기 쉬운 건 아니었어요

복지몰 검색 화면의 Chip 구성을 확인하려고 코드를 열었는데, 어떤 Chip이 보이는지 바로 알기 어려웠어요. 설정 배열에는 라벨과 클릭 동작뿐 아니라 노출 조건까지 들어 있었거든요. 프로그램 탭에서 필터 검색을 했을 때의 화면을 보려면 각 항목의 조건을 하나씩 따라가야 했어요.

설정으로 화면을 만들면 반복을 줄일 수는 있어요. 그런데 사용처가 짧아진 만큼 공통 렌더러를 더 많이 읽어야 한다면, 이해하기 쉬워진 것인지는 따로 봐야겠더라고요.

React에서는 현재 상태에 맞는 UI를 선언하고, 실제 DOM을 어떻게 갱신할지는 React에 맡겨요. 설정 배열로 UI를 만드는 것도 선언적인 방식일 수 있어요. 제가 바꾸고 싶었던 건 배열이라는 형식 자체가 아니라, 화면 구성을 읽으려면 공통 구현의 분기까지 따라가야 하는 구조였어요.

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>복지몰의 검색 Chip과 관리자 서비스의 검색 필터를 바꾸면서, 공통으로 처리할 동작과 사용처에 남길 구성을 어떻게 나눴는지 적었어요. 코드 예제는 저장소에서 필요한 부분만 줄였고, 내부 식별자 일부는 공개용으로 바꿨어요.</p>
</div>

## Chip 하나를 바꾸는데 설정의 문법부터 봐야 했어요

복지몰 검색 화면은 병원·프로그램 탭과 필터 검색·통합 검색의 조합에 따라 Chip 구성이 달라요. 지역과 진료과는 Bottom Sheet을 열고, 혜택은 선택 여부를 토글해요. 보여주는 라벨도 다르고요.

이전에는 이런 차이를 설정 배열 안에 넣었어요.

```tsx
const FILTER_CHIPS_CONFIG: FilterChipConfig[] = [
  {
    key: 'department',
    label: getDepartmentLabel,
    hasArrow: true,
    pressed: (state) => !!state.selectedDepartmentId || !!currentParams.departmentId,
    onClick: (openFilter) => openFilter('department'),
    visible: (_, isFilterSearch) => isFilterSearch,
  },
  {
    key: 'hasEvent',
    label: BENEFIT_LABEL.hasEvent,
    pressed: (state) => state.selectedBenefits?.includes('hasEvent') || false,
    onClick: (_, toggleBenefit) => toggleBenefit('hasEvent'),
    visible: (tab, isFilterSearch) =>
      tab === 'program' ? isFilterSearch : tab === 'partner',
  },
  // 나머지 항목 생략
];

return FILTER_CHIPS_CONFIG
  .filter((config) => config.visible(currentTab, isFilterSearch))
  .map((config) => (
    <Chip
      key={config.key}
      pressed={config.pressed(filterState)}
      onClick={() => config.onClick(handleOpenFilter, handleBenefitToggle)}
    >
      {typeof config.label === 'function'
        ? config.label(filterState)
        : config.label}
    </Chip>
  ));
```

각 항목은 자기에게 필요한 동작만 쓰는데, 렌더러는 `openFilter`와 `toggleBenefit`을 모두 넘겨요. 라벨이 문자열인지 함수인지도 렌더러가 판단하고요. 선택 상태를 읽는 방법까지 항목마다 달랐어요.

쿠폰 Chip에만 아이콘을 넣거나 선택했을 때 글자를 굵게 표시하려면 어떻게 해야 할까요? 이 구조에서는 설정에 속성을 더하고, 렌더러도 그 속성을 처리하게 바꾸기 쉬워요. Chip 하나의 예외를 공통 렌더러가 계속 알아야 하는 셈이에요.

그래서 각 Chip이 자기 동작을 가진 컴포넌트가 되도록 바꿨어요.

```tsx
function RegionChip({ filterState, filterType, isFilterSearch }: IFilterChipProps) {
  const openFilter = useOpenFilterSheet('region', filterType, isFilterSearch);

  return (
    <Chip
      hasArrow
      pressed={(filterState.selectedRegions?.length ?? 0) > 0}
      onClick={openFilter}
    >
      {getRegionLabel(filterState)}
    </Chip>
  );
}

function BenefitChip({
  benefit,
  className,
}: {
  benefit: BenefitKey;
  className?: string;
}) {
  const { currentParams, toggleBenefit } = useSearchFilter();
  const pressed = currentParams[benefit] === 'true' || currentParams[benefit] === true;

  return (
    <Chip
      pressed={pressed}
      className={className}
      onClick={() => toggleBenefit(benefit)}
    >
      {BENEFIT_CHIP_LABEL[benefit]}
    </Chip>
  );
}

function CouponChip(_: IFilterChipProps) {
  return (
    <BenefitChip
      benefit="couponDiscount"
      className="data-[state=on]:text-body-md-semibold"
    />
  );
}
```

지역 Chip은 지역 선택 동작을, 혜택 Chip은 토글 동작을 갖고 있어요. 쿠폰 Chip의 선택 스타일도 그 컴포넌트에서 정해요. 혜택처럼 동작이 같고 라벨만 다른 것은 `BenefitChip`을 같이 쓰고요.

화면마다 어떤 Chip을 놓을지는 별도로 남겼어요.

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

여전히 배열을 써요. 다만 이제 배열에는 컴포넌트의 순서와 조합만 있어요. 프로그램 탭의 통합 검색에 무엇이 나오는지 알려면 `program_integrated`만 보면 돼요.

이후 쿠폰 Chip에 아이콘과 선택 스타일을 넣을 때는 Chip 컴포넌트 쪽을 바꿨어요. 병원 탭에도 노출할 때는 해당 배열에 `CouponChip`을 넣었고요. 요청 파라미터와 API 타입은 따로 수정했지만, 화면 쪽 변경을 위해 공통 렌더러에 새로운 규칙을 추가하지는 않았어요.

모든 항목을 별도 컴포넌트로 만들 필요는 없어요. 같은 모양의 서버 목록을 렌더링할 때는 데이터와 `map`이 자연스럽죠. 여기서는 항목마다 다른 동작과 예외를 설정 객체 안에 맞춰 넣는 게 더 복잡했어요.

## 검색 필터의 필드명도 사용처에서 보이게 했어요

관리자 서비스의 검색 필터에도 비슷한 구조가 있었어요. 페이지가 `{ key, type, options }` 같은 설정을 넘기면, 공통 레이아웃이 `type`을 보고 입력 컴포넌트를 골랐어요.

날짜 범위는 예약일인지 상담일인지에 따라 쓰는 필드명이 달랐는데요. 그 필드명을 페이지가 적는 게 아니라 공통 렌더러가 `key`에서 알아냈어요.

```tsx
const isConsultationDate = filter.key === 'consultationDate';
const startKey = isConsultationDate ? 'consultationStartDt' : 'reservationStartDt';
const endKey = isConsultationDate ? 'consultationEndDt' : 'reservationEndDt';
```

공통 날짜 입력이 예약 관리 화면의 필드명까지 알고 있었어요. 다른 종류의 날짜가 필요해지면 공통 코드의 분기도 늘어나기 쉬웠고요.

이를 compound 컴포넌트로 바꾸면서 필드명과 화면 구성을 페이지에 남겼어요. 아래는 예약 목록의 검색 필터를 줄인 코드예요.

```tsx
const SearchFilter = createSearchFilter(
  reservationSearchParamsSchema,
  RESERVATION_SEARCH_PARAMS_FALLBACK,
);

<SearchFilter onSubmit={handleSearch}>
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

이제 `DateRange`는 날짜 범위를 입력받는 방법만 알아요. 그 값이 상담일인지 예약일인지, 어느 필드에 들어가야 하는지는 페이지에서 정해요. JSX를 읽으면 검색 화면의 입력 구성과 필드명을 함께 볼 수 있고요.

그렇다고 폼 동작까지 각 페이지에서 새로 만든 건 아니에요. 폼 인스턴스, URL과 입력값의 동기화, 초기화, 레이아웃은 `SearchFilter`가 맡아요. 검색을 제출한 뒤 무엇을 할지는 페이지가 `onSubmit`으로 정하고요.

나중에 옵션 조회가 실패한 필터만 에러 바운더리로 감쌀 때도 이 구분을 썼어요. 옵션을 가져오는 위젯과 공유 구현을 바꾸고, 각 페이지에 적힌 필터 구성은 그대로 뒀어요. 그 과정은 [에러 처리를 바꾼 글](https://jingeon27.tistory.com/28)에 더 자세히 적었어요.

### 자유롭게 조합하되 필드명까지 자유롭게 두지는 않았어요

사용처에서 필드명을 직접 적으면 오타나 잘못된 연결이 생길 수 있어요. 그래서 `createSearchFilter`는 Zod 스키마에서 폼 타입을 추론하고, 입력 컴포넌트의 필드명을 그 타입의 경로로 제한해요. URL에서 읽은 값도 같은 스키마로 검증하고요.

이때 쓰는 폼은 Ant Design Form을 감싼 `createTypedForm`이에요. Ant Design의 `getFieldValue` 반환 타입이 `any`라서, 필드명과 그 필드의 값 타입을 함께 다룰 수 있게 만들었어요. 아래는 사용 방법을 보여주려고 폼 타입을 줄인 예제예요.

```tsx
type ProgramFormValues = {
  programName: string;
  templates: { title: string }[];
};

const ProgramForm = createTypedForm<ProgramFormValues>();

function ProgramEditor() {
  const [form] = ProgramForm.useForm();
  // form.getFieldValue('programName')은 string으로 추론돼요.

  return (
    <ProgramForm form={form}>
      <ProgramForm.Item name="programName">
        <Input />
      </ProgramForm.Item>
      <ProgramForm.Item name={['templates', 0, 'title']}>
        <Input />
      </ProgramForm.Item>
    </ProgramForm>
  );
}
```

`programName`을 `progamName`으로 잘못 적으면 타입 오류가 나요. 중첩 필드도 같은 폼 타입을 기준으로 검사하고, 값을 읽거나 쓸 때도 그 경로의 타입을 사용해요. 라이브러리 타입과 연결하기 위한 단언은 팩토리 내부에 모았어요.

이 팩토리 자체가 선언적 코드를 만드는 건 아니에요. 사용처에 드러낸 필드명과 연결이 틀렸을 때 타입으로 확인하려고 만든 것이에요. 실제로 검색 필터를 조합하는 방식과, 그 조합을 검사하는 타입의 역할은 달라요.

물론 타입이 입력 완료까지 보장하지는 않아요. 위의 `getFieldValue`는 `string`으로 추론해도 초기화되지 않은 필드에서는 `undefined`가 나올 수 있어요. 입력 검증까지 타입으로 대체하지는 않아요. 필드 경로를 다룬 구현은 [프로그램 폼을 정리한 글](https://jingeon27.tistory.com/18)에 따로 적었어요.

## 화면의 상태를 따로 복사할 필요도 줄였어요

구성이 잘 보여도 선택 상태가 여러 곳에 있으면 동작을 이해하기 어려워요. 검색 조건은 URL에 있는데, Chip의 선택 여부를 별도 state에 복사하고 effect로 맞추면 두 값 사이의 동기화도 살펴봐야 하거든요.

복지몰의 검색 필터는 URL에서 현재 선택 상태를 계산하도록 바꿨어요. 현재 훅에서 그 부분만 가져오면 이렇게 돼요.

```tsx
const currentParams = useTypedQueryParams({
  schema: keywordSearchParamsSchema,
});

const filterState = useMemo(
  () => urlParamsToFilterState(currentParams),
  [currentParams],
);
```

Chip을 눌렀을 때는 URL을 바꾸고, 화면은 그 URL에서 계산한 상태를 보여줘요. 필터 적용과 화면 표시가 같은 검색 조건을 읽도록 한 거예요.

여기서 중요한 건 `useMemo`를 썼다는 사실이 아니에요. 원본에서 계산할 수 있는 값을 다시 저장하지 않았다는 점이에요. [React의 상태 설계 문서](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)도 렌더링 중 계산할 수 있는 값은 중복 상태로 두지 않는 쪽을 설명해요.

반면 Bottom Sheet에서 고르는 중인 값은 URL과 달라도 돼요. 사용자가 ‘적용하기’를 누르기 전까지는 목록의 검색 조건을 바꾸지 않아야 하니까요. 같은 필터 값처럼 보여도, 적용된 조건과 편집 중인 조건은 역할이 달라요. 중복 상태를 없앤다고 임시 선택까지 모두 URL에 넣는 건 다른 문제예요.

## 테스트에서도 조건과 결과는 숨기지 않았어요

코드를 읽기 쉽게 만들려는 기준은 테스트에도 적용하고 있어요. 테스트를 읽을 때는 어떤 조건에서 무엇을 했고, 무엇이 남아야 하는지가 바로 보였으면 해요.

아래는 검색 필터 훅의 실제 테스트에서 가져온 두 시나리오예요.

```ts
it('꺼져 있던 혜택 칩을 누르면 그 파라미터를 true로 붙여야 한다', () => {
  const result = renderSearchFilter('q=검색어&tab=partner');

  result.current.toggleBenefit('todayDiscount');

  expect(writtenParams()).toEqual({
    q: '검색어',
    tab: 'partner',
    todayDiscount: 'true',
  });
});

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

`renderSearchFilter` 안에는 경로 mock과 Query 캐시 준비가 있고, `writtenParams`는 History API로 쓴 URL을 객체로 읽어줘요. 이런 준비 과정은 묶어도 돼요. 하지만 입력 URL과 토글할 혜택, 기대 결과는 테스트 안에 남겼어요.

두 번째 테스트에서 `hasEvent`도 비교하는 이유가 있어요. 누른 혜택만 해제돼야 하고, 다른 혜택까지 지워지면 안 되거든요. 이름에 ‘그 파라미터만’이라고 적는 데 그치지 않고, 다른 값이 남았는지도 확인한 거예요.

같은 규칙을 입력값만 바꿔 여러 번 확인할 때는 `it.each`를 써도 돼요. 여기서는 선택과 해제라는 서로 다른 행동을 각각 읽을 수 있게 뒀어요. 테스트 작성 방식은 [테스트 체계를 다시 만든 글](https://jingeon27.tistory.com/25)에 이어서 적었어요.

## 줄 수보다 읽으면서 확인할 수 있는 게 중요했어요

이번 변경에서도 배열을 없애지는 않았고, 공통 컴포넌트를 쪼개기만 한 것도 아니에요. Chip의 동작은 컴포넌트에, 화면별 조합은 배열에 뒀어요. 검색 필터에서는 공통 폼 동작을 모으되 화면의 필드명과 구성은 사용처에 남겼고요.

제가 원했던 건 코드가 짧아 보이는 것보다, 코드를 읽을 때 화면과 동작을 같이 확인할 수 있는 구조였어요. 쿠폰이 어느 탭에 나오는지, 날짜 입력이 어느 필드에 연결되는지, 혜택을 해제할 때 다른 조건은 남는지 같은 것들이요.

코드 확인도 검증의 일부라서 이런 부분을 중요하게 보고 있어요. 선언적으로 썼다는 이유만으로 좋은 코드라고 판단하기보다, 실제로 읽으면서 어떤 동작을 확인할 수 있는지 보려고 해요.

## 참고

- [React: Describing the UI](https://react.dev/learn/describing-the-ui)
- [React: Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)
- [Ant Design: Form](https://ant.design/components/form)
