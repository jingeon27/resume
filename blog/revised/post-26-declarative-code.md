# 선언적 코드는 변경을 작게 만든다

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>제가 말하는 선언적 코드가 무엇인지 실제로 바꾼 구조 세 가지로 설명해요. 복지몰의 검색 Chip, 관리자 서비스 모노레포의 검색 필터와 폼 타입 팩토리를 두고 무엇이 문제였는지, 어떻게 바꿨는지, 이후 변경이 어디까지 닿았는지 순서로 적었어요. 그 결과 쿠폰 필터 요구사항 세 건의 화면 쪽 변경은 Chip 파일 안에서 끝났어요. 검색 필터에 칸 단위 에러 처리를 붙일 때는 화면의 필터 선언을 건드리지 않고 필터 위젯과 공유 모듈만 고쳤고, 폼 타입 팩토리 위에는 번역 입력과 검색 필터 팩토리가 경로 타입을 다시 만들지 않고 올라갔어요. 걸린 시간은 재지 않았어요. 뒤쪽에는 `skipToken`, 변환과 실행 분리, 파생값, 테스트처럼 더 작은 단위에 같은 기준을 적용한 규칙을 모았어요. 저장소 사례는 2026-09-28 develop 기준이고, 식별자 일부는 공개용으로 바꿨어요.</p>
</div>

제가 말하는 선언적 코드는 `map`이나 커스텀 훅을 많이 쓰는 코드가 아니에요. VOC(고객 의견)나 예외가 추가돼도 공통 구조를 다시 뜯지 않고, 바뀐 요구사항이 코드의 한 구획에 그대로 보이는 구조에 가까워요.

물론 읽기 쉬워야 해요. 확장을 위해 설정 객체와 범용 렌더러를 만들었는데 실제 화면을 이해하려고 여러 파일을 오가야 한다면 좋은 구조라고 보기 어려워요.

## 설정 배열 안의 조건이 화면 구성을 가리고 있었어요

복지몰의 검색 화면에는 검색 모드(필터 검색·통합 검색)와 탭(파트너·프로그램)에 따라 서로 다른 Filter Chip이 나타나요. 각 Chip은 라벨, 선택 상태와 클릭 동작이 달라요.

처음 구조는 설정 배열 하나였어요.

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
    visible: (tab, isFilterSearch) => (tab === 'program' ? isFilterSearch : tab === 'partner'),
  },
  // ... 여섯 항목 더
];

return FILTER_CHIPS_CONFIG.filter((config) => config.visible(currentTab, isFilterSearch)).map((config) => (
  <Chip key={config.key} pressed={config.pressed(filterState)} onClick={() => config.onClick(handleOpenFilter, handleBenefitToggle)}>
    {typeof config.label === 'function' ? config.label(filterState) : config.label}
  </Chip>
));
```

반복은 줄었지만 읽는 비용이 컸어요. 프로그램 탭의 필터 검색에 어떤 Chip이 보이는지 알려면 여덟 항목의 `visible`을 하나씩 계산해 봐야 했어요. 항목마다 쓰는 콜백은 하나뿐인데 `onClick`은 `openFilter`와 `toggleBenefit`을 둘 다 받았고요. Chip 하나에 예외가 생기면 모든 항목이 공유하는 `FilterChipConfig`의 문법을 넓히거나 그 문법 밖으로 새어 나가야 했어요. 지역·진료과 Chip은 선택 여부가 `filterState`만으로 나오지 않아서, 위 예시의 진료과처럼 `pressed`가 바깥의 URL 파라미터(`currentParams`)를 클로저로 읽고 있었어요. 나중에 들어온 "쿠폰 Chip에만 아이콘" 같은 요구를 이 구조에서 받았다면 설정에 필드가 하나 더 늘었을 거예요. 데이터 구조가 UI 컴포넌트를 흉내 내기 시작하는 지점이에요.

2026년 6월 5일에 각 Chip을 완성된 컴포넌트로 만들고 검색 케이스별로 나열하도록 바꿨어요. 지금 코드는 이래요.

```tsx
function RegionChip({ filterState, filterType, isFilterSearch }: IFilterChipProps) {
  const openFilter = useOpenFilterSheet('region', filterType, isFilterSearch);

  return (
    <Chip hasArrow pressed={(filterState.selectedRegions?.length ?? 0) > 0} onClick={openFilter}>
      {getRegionLabel(filterState)}
    </Chip>
  );
}

// 혜택 Chip은 URL의 boolean 하나를 토글하고 라벨만 달라서 컴포넌트 하나를 같이 써요.
function BenefitChip({ benefit, className }: { benefit: BenefitKey; className?: string }) {
  const { currentParams, toggleBenefit } = useSearchFilter();
  const pressed = currentParams[benefit] === 'true' || currentParams[benefit] === true;

  return (
    <Chip pressed={pressed} className={className} onClick={() => toggleBenefit(benefit)}>
      {BENEFIT_CHIP_LABEL[benefit]}
    </Chip>
  );
}

function CouponChip(_: IFilterChipProps) {
  return <BenefitChip benefit="couponDiscount" className="data-[state=on]:text-body-md-semibold" />;
}

const FILTER_CONFIG: Record<SearchFilterCase, ComponentType<IFilterChipProps>[]> = {
  partner_filter: [RegionChip, DepartmentChip, CouponChip, HasEventChip, NewPartnerChip, PartnerInfoChip, TreatmentTimeChip],
  partner_integrated: [RegionChip, DepartmentIdsChip, CouponChip, HasEventChip, NewPartnerChip, PartnerInfoChip, TreatmentTimeChip],
  program_filter: [RegionChip, DepartmentChip, CouponChip, TodayDiscountChip, HasEventChip],
  program_integrated: [RegionChip, DepartmentIdsChip, CouponChip],
};
```

배열을 쓰지만 데이터 조합은 아니에요. 각 항목은 자기 동작을 가진 컴포넌트이고, 배열은 화면에 놓을 순서와 조합만 말해요. 한 검색 케이스의 구성은 그 케이스의 배열 한 줄에서 읽혀요.

이후 들어온 요구사항에서 화면 쪽 변경은 Chip 파일 안에서 끝났어요.

- 6월 18일 쿠폰 필터 추가: `CouponChip` 함수 하나를 만들고 프로그램 배열 두 줄에 넣었어요. 혜택 키와 라벨, API 파라미터 매핑과 응답 타입은 다른 파일에서 바꿨어요.
- 7월 3일 쿠폰 Chip에만 아이콘을 넣고 선택 시 굵게 표시: 변경은 이 파일 하나였어요(18줄 추가, 6줄 삭제). 혜택 라벨 표가 아이콘을 담을 수 있게 바꾸고, `BenefitChip`에 `className`을 열고, `CouponChip`에서만 그 값을 넘겼어요.
- 7월 9일 파트너 탭에도 쿠폰 필터 노출: 파트너 배열 두 곳에 `CouponChip`을 넣었어요. 요청 타입과 API 파라미터 매핑은 타입 파일과 helper에서 바꿨어요.

혜택 Chip처럼 구조가 정말 같고 라벨만 다른 항목은 컴포넌트 하나와 라벨 표로 묶었어요. 서버가 내려주는 임의 길이 목록도 같은 이유로 `map`이 맞고요. 고정된 소수의 UI가 저마다 예외를 가질 때만 직접 나열해요.

<div class="note note-decision">
  <strong>map과 나열을 가르는 기준</strong>
  <p>항목의 구조가 같고 데이터만 다르면 데이터와 `map`으로 둬요. 항목마다 동작과 예외가 다르면 컴포넌트로 만들고, 배열에는 순서와 조합만 남겨요. 한 Chip의 요구사항은 그 컴포넌트에서, 한 검색 케이스의 구성은 그 배열에서 고칠 수 있게 하려는 기준이에요.</p>
</div>

## 필드 종류가 늘 때마다 렌더러의 분기가 커졌어요

관리자 서비스 모노레포의 검색 필터도 설정 배열을 받는 레이아웃 컴포넌트였어요. 페이지가 `filters: [{ key, type: 'select', options }]` 같은 배열을 넘기면 레이아웃이 `filter.type`별 `switch`로 입력 위젯을 골랐어요. 날짜 범위만 해도 `date`, `reservationRangeDate`·`consultationRangeDate`, `multiRangeDate`로 갈렸고, 예약 관리 전용 렌더러는 key 문자열을 보고 폼 필드명을 골랐어요.

```tsx
// 이전: 필드명을 key 문자열에서 역산해요
const isConsultationDate = filter.key === 'consultationDate';
const startKey = isConsultationDate ? 'consultationStartDt' : 'reservationStartDt';
const endKey = isConsultationDate ? 'consultationEndDt' : 'reservationEndDt';
```

사용처는 짧았지만 실제 화면을 알려면 렌더러 내부를 읽어야 했어요. 날짜 필드가 하나 더 생기면 이 분기에 조건이 하나 더 붙는 구조였고요.

2026년 8월 11일에 필터를 JSX로 선언하는 compound 컴포넌트로 바꿨어요.

```tsx
const SearchFilter = createSearchFilter(reservationSearchParamsSchema);

<SearchFilter onSubmit={handleSearch}>
  <SearchFilter.Keyword name="keyword" typeName="keywordType" options={SEARCH_KEYWORD_TYPES} />
  <SearchFilter.Fields>
    <SearchFilter.DateRange label="상담일" startName="consultationStartDt" endName="consultationEndDt" />
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

필드명은 호출부에 그대로 적히고, `createSearchFilter`가 받은 Zod 스키마의 경로로 좁혀져요. 필드명이 스키마에 없으면 컴파일 오류가 나고, URL을 읽을 때도 같은 스키마로 걸러요. 8월 11일 처음에는 타입 인자를 받았는데, 폼 타입과 URL 검증 규칙이 갈라질 수 있어서 다음 날 스키마를 받게 바꿨어요. 네 갈래였던 날짜 범위는 시작·끝 필드명을 직접 받는 `DateRange` 하나로 합쳐졌어요.

Root는 폼 인스턴스, URL과 폼 값의 동기화, 초기화, 레이아웃과 에러 바운더리를 맡아요. 제출이 무엇을 할지는 페이지가 `onSubmit`으로 정하고요. 화면의 구조는 JSX에 남기고 잘못된 필드명만 닫은 셈이에요.

같은 날 옛 검색 필터 위젯을 걷어냈고, 지금은 내부 CMS와 파트너용 관리자의 검색 필터 27곳이 이 방식으로 선언돼 있어요. 8월 20일에는 옵션 조회 하나가 실패해도 검색바 전체가 사라지지 않게 칸 단위 에러 바운더리를 붙였는데, 옵션을 조회하는 필터 위젯과 공유 모듈만 고쳤어요. 화면의 필터 선언은 한 곳도 건드리지 않았고요. 필터가 엘리먼트가 되면서 필터만 따로 에러 바운더리로 감쌀 수 있게 된 경위는 [에러 처리 개편 글](https://jingeon27.tistory.com/28)에 적었어요.

## 팩토리는 여러 사용처의 타입 계약을 한 번에 고정할 때 만들어요

Ant Design Form도 `Form.useForm<T>()`로 받은 인스턴스는 `getFieldValue`에 없는 필드명을 넣으면 컴파일 오류를 내요. 하지만 돌려주는 값은 `any`예요. `Form.Item`은 호출마다 `<Form.Item<T>>`처럼 제네릭을 붙여야 이름을 검사하고, `Form.List`의 `name`은 아예 좁혀지지 않아요. 호출부마다 단언으로 타입을 붙이면 그 단언 하나하나가 폼 타입과 어긋날 자리가 되고요.

2026년 6월 25일에 폼 값 타입 하나로 Ant Design Form을 좁히는 `createTypedForm`을 만들었어요.

```tsx
const ProgramForm = createTypedForm<ProgramFormValues>();
const [form] = ProgramForm.useForm();

form.getFieldValue('programName'); // string (antd 원본은 any)

// 'progamName' 오타는 제네릭을 따로 붙이지 않아도 컴파일 오류
<ProgramForm.Item name="progamName">
  <Input />
</ProgramForm.Item>

<ProgramForm.Item name={['templates', 0, 'title']}>
  <Input />
</ProgramForm.Item>
```

`Item`·`List`의 `name`, `useWatch`, 폼 인스턴스의 `getFieldValue`·`setFieldValue`가 같은 `T`의 경로와 그 경로의 값 타입으로 묶여요. Ant Design의 넓은 타입과 잇는 단언은 팩토리 파일 안에만 뒀어요. 호출부가 같은 제네릭과 필드 타입을 반복하지 않아도 되니 팩토리를 둘 이유가 있었어요.

지금은 관리자 서비스 모노레포의 세 앱(내부 CMS·파트너용 관리자·글로벌 서비스 관리 화면)과 공유 패키지가 이 팩토리를 써요. 폼 위에 기능을 얹는 팩토리도 경로 타입을 다시 만들지 않고 이 위에 올라갔어요. 8월 4일에는 글로벌 서비스 관리 화면의 번역 입력을 옮겼어요. 필드명을 자유 문자열로 받아 어느 폼에 붙여도 통과하던 컴포넌트였는데, `createTypedForm` 위에 번역 입력만 얹은 팩토리로 바꾸자 필드명이 폼 타입의 번역 키로 좁혀졌어요. 앞의 검색 필터 팩토리도 내부에서 이걸로 폼을 만들고요. 경로 타입을 만든 방식은 [프로그램 폼을 정리한 글](https://jingeon27.tistory.com/18)에 따로 적었어요.

다만 좁혀진 타입이 런타임 값까지 보장하지는 않아요. `useWatch`는 반환 타입에 `undefined`를 붙이는데, `getFieldValue`는 경로의 타입을 그대로 돌려줘요. 폼 타입에서 필수로 적은 필드는 아직 채워지지 않았어도 `undefined`가 타입에 드러나지 않아요.

반대로 한 화면에서 한 번 쓰는 컴포넌트에는 팩토리를 만들지 않아요. 추상화 이름이 사용처보다 더 어려우면 그냥 가까이에 둬요.

## 작은 규칙도 변경이 닿는 곳을 기준으로 정했어요

아래 규칙들은 더 작은 단위에 같은 질문을 적용한 것이에요. 다음 요구사항이 오면 어디를 고치게 되는지, 그 자리가 코드에서 바로 보이는지를 봐요.

### 여러 동작을 한 컴포넌트에 모으지 않아요

대화 UI를 예로 들면 다음 책임은 바뀌는 이유가 달라요.

```text
Conversation
  MessageList       목록 렌더링과 자동 스크롤
  ChatInput         입력과 전송
  MessageBubble     메시지 한 건 렌더링
  SessionConnection SSE 연결과 정리
```

API 호출, 입력 상태, 스크롤과 메시지 분기를 한 `Conversation` 안에 넣으면 요구사항 하나가 전체 컴포넌트를 건드려요. 분리할 수 있는 동작은 각자의 컴포넌트나 순수 함수로 둬요. 컨테이너는 어떤 부품이 함께 동작하는지만 보여주고요. 그러면 메시지 모양이 바뀔 때는 `MessageBubble`만, 재연결 정책이 바뀔 때는 `SessionConnection`만 열면 돼요.

컴포넌트의 추상화 수준도 맞춰요. `MessageList`, `ChatInput`, `MessageBubble` 옆에 특정 버튼 하나인 `SendIcon`을 같은 레벨로 올리지 않아요. 한 트리를 읽을 때 형제 이름이 비슷한 크기의 책임을 말해야 하니까요.

### 한 번 쓰는 로직은 먼저 가까이에 둬요

커스텀 훅이라는 형태만으로 코드가 재사용 가능해지지는 않아요.

```tsx
function ReservationDetail() {
  const reservationId = useReservationId();
  const query = useQuery(reservationDetailOptions(reservationId));

  // 이 화면에만 있는 실행 흐름
  const handleCancel = async () => {
    await cancelReservation(reservationId);
    toast.success('예약을 취소했습니다.');
    router.back();
  };

  // ...
}
```

한곳에서만 쓰는 위 흐름을 `useReservationCancellation`으로 옮기면 이름 하나가 더 생길 뿐이에요. 취소 흐름이 바뀌면 이 화면만 고치면 되는데, 훅으로 빼면 파일 하나를 더 따라가야 해요. 독립된 도메인 동작으로 여러 화면에서 쓰이거나 별도 테스트 계약이 생겼을 때 추출해요.

### 커링으로 클릭 핸들러의 두 입력을 구분해요

목록 항목의 ID는 렌더 시점에 알고 클릭 이벤트는 나중에 들어와요. 두 인자를 같은 콜백에 억지로 맞추기보다 고정할 값과 이벤트가 주는 값을 나눠요.

```tsx
const handleSelect = (programId: number) => (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  openProgram(programId);
};

<button onClick={handleSelect(program.id)}>상세 보기</button>
```

모든 핸들러를 커링하지는 않아요. 반복되는 인라인 클로저가 있고, 첫 인자가 도메인 값이고 두 번째 인자가 UI 콜백의 값일 때 써요.

### 실행할 수 없는 Query는 `skipToken`으로 표현해요

상세 조회에는 ID가 필요해요. ID가 없을 때 `enabled: false`만 붙이면 `queryFn`은 여전히 ID가 있다고 가정한 채 작성되기 쉬워요.

```ts
const programDetailOptions = (programId?: number) =>
  queryOptions({
    queryKey: ['program', 'detail', programId],
    queryFn: programId ? () => getProgramDetail(programId) : skipToken,
  });
```

호출부는 조회 가능 여부를 다시 계산하지 않아요. 필수 입력이 없을 때의 처리가 options 한 곳에 있어서, 호출부가 늘어도 조건을 복사하지 않아요.

```tsx
const { data } = useQuery(programDetailOptions(programId));
```

`enabled`가 나쁘다는 뜻은 아니에요. 복지몰도 위 예시처럼 ID가 없거나 `0`이면 `id ? … : skipToken`으로 조회를 막아요. 그런데 서버에서 `ensureQueryData`로 미리 받는 options에는 이렇게 쓰지 않아요. `ensureQueryData`는 `enabled`를 무시하고, `queryFn`이 `skipToken`이면 `Missing queryFn`으로 거절하거든요. 404를 `notFound()`로 바꾸는 상세 페이지에 ID `0`이 들어오면 404 대신 500이 되는 셈이라, 그런 options는 안에 `enabled: !!id`를 둬요. 다른 options와 queryKey를 나눠 쓰는 경우에도 `skipToken`이 그 키에 남아 이후 다시 조회할 때 실패할 수 있어서 `enabled`를 써요.

### 변환과 실행을 섞지 않아요

다음 함수는 URL을 만들면서 이동까지 해요.

```ts
function moveToProgram(programId: number, keyword: string) {
  router.push(`/program/${programId}?q=${encodeURIComponent(keyword)}`);
}
```

이러면 URL 규칙만 테스트하거나 `Link`와 공유하기 어려워요. 값 변환과 실행을 나눠요.

```tsx
const createProgramHref = (programId: number, keyword: string) =>
  `/program/${programId}?q=${encodeURIComponent(keyword)}`;

<Link href={createProgramHref(program.id, keyword)}>상세 보기</Link>;

const handleOpenProgram = (programId: number) => {
  router.push(createProgramHref(programId, keyword));
};
```

인코딩, 요청 DTO 변환과 금액 계산은 값을 반환하는 함수에 둬요. `router.push`, 토스트, API 호출은 실행 경계에 두고요. URL 규칙이 바뀌면 `createProgramHref` 하나만 고치면 되고, 순수 함수 안에서 다른 작업이 함께 실행되지도 않아요.

### 파생값은 다시 저장하지 않아요

현재 경로가 탭 값과 같다면 별도의 매핑과 `activeTab` 상태가 필요 없어요.

```tsx
const BENEFIT_TAB_PATH = {
  Sale: '/benefit',
  Event: '/benefit/event',
} as const;

<TabsRoot value={pathname} onValueChange={(path) => router.push(path)}>
  <TabsTrigger value={BENEFIT_TAB_PATH.Sale}>특가전</TabsTrigger>
  <TabsTrigger value={BENEFIT_TAB_PATH.Event}>이벤트</TabsTrigger>
</TabsRoot>
```

선택한 쿠폰에서 계산되는 할인 금액, URL에서 알 수 있는 선택 탭, Query 결과로 알 수 있는 로딩 여부도 같은 기준을 써요. 원본이 이미 있다면 state와 effect로 복사하지 않아요. 앞의 검색 Chip도 옛 구조에서는 URL 파라미터를 `useState`에 복사하고 `useEffect`로 맞추고 있었는데, 지금은 `useMemo`로 URL에서 바로 파생해요.

상태는 실제로 함께 읽고 수정하는 컴포넌트의 가장 가까운 공통 부모에 둬요. "나중에 다른 곳에서도 쓸 것 같다"는 이유만으로 전역 store에 올리지 않아요.

## 테스트도 한눈에 읽혀야 해요

테스트는 실패했을 때 다시 읽는 문서예요. 고정된 시나리오 몇 개를 데이터 배열과 범용 함수로 줄이면 줄 수는 줄지만 조건과 행동을 찾기 어려워져요. 복지몰의 검색 필터 훅 테스트는 이렇게 써요.

```ts
it('꺼져 있던 혜택 칩을 누르면 그 파라미터를 true 로 붙여야 한다', () => {
  const result = renderSearchFilter('q=검색어&tab=partner');

  result.current.toggleBenefit('todayDiscount');

  expect(writtenParams()).toEqual({ q: '검색어', tab: 'partner', todayDiscount: 'true' });
});

it('켜져 있던 혜택 칩을 다시 누르면 그 파라미터만 빼야 한다', () => {
  const result = renderSearchFilter('q=검색어&tab=partner&todayDiscount=true&hasEvent=true');

  result.current.toggleBenefit('todayDiscount');

  expect(writtenParams()).toEqual({ q: '검색어', tab: 'partner', hasEvent: 'true' });
});
```

`renderSearchFilter`는 경로·검색 파라미터 mock과 조회 캐시 준비를, `writtenParams`는 History API로 쓰인 URL을 객체로 읽는 일만 감춰요. 입력 URL, 행동, 기대 결과는 테스트마다 반복되지만 테스트 하나만 읽어도 보장하는 동작이 보여요. 두 번째 테스트는 `hasEvent`까지 비교해서, 토글이 다른 혜택을 같이 지우는 회귀도 잡아요. 행동과 기대 결과까지 다시 서술하는 범용 함수는 만들지 않아요.

계층도 나눠요. 단위 테스트는 순수 변환과 경곗값, 통합 테스트는 컴포넌트와 API의 연결, E2E는 브라우저 흐름, dev API 서버 계약 테스트는 프론트가 이해한 계약과 서버의 차이를 맡아요. 같은 사실을 모든 계층에서 반복하지 않아요. 계층별 통과가 무엇을 보장하고 무엇은 보장하지 않는지는 [테스트를 다시 만든 글](https://jingeon27.tistory.com/25)에 적었어요.

## 추상화의 개수보다 변경 지점이 보여야 해요

정리하면, 데이터 구조가 같고 개수만 달라질 때는 `map`을 써요. 고정된 UI가 저마다 동작과 예외를 가진다면 컴포넌트를 직접 나열해요. compound 컴포넌트와 팩토리도 반복을 없애려고 미리 만드는 게 아니라, 여러 사용처에서 같은 생명주기나 타입 계약이 확인됐을 때 꺼내요.

다음 VOC가 들어왔을 때 바뀐 요구사항이 적힌 곳을 바로 찾고 그 부분만 고칠 수 있다면 충분해요. 추상화의 개수보다 변경 지점이 잘 보이는지가 더 중요해요.

<div class="note note-limit">
  <strong>확인하지 못한 것</strong>
  <p>변경이 작아졌다는 근거는 이후 커밋 몇 건의 diff를 다시 본 것이에요. 변경에 든 시간, 리뷰 비용, 동료가 코드를 이해하는 데 걸린 시간은 측정하지 않았어요. `createTypedForm`의 `getFieldValue`는 필수로 적은 필드가 아직 비어 있을 때의 `undefined`를 타입에 드러내지 않아요. 검색 필터의 스키마는 서버 조회 파라미터를 보고 옮겨 적은 것이라, 서버 쪽 이름이 바뀌는 것까지 타입이 잡지는 못해요. 검색 Chip·검색 필터·혜택 탭·테스트 코드는 저장소 코드를 줄이고 식별자를 바꾼 것이고, 폼 팩토리 사용 예와 대화 UI·예약 취소·커링·`skipToken`·변환과 실행 예시는 원칙을 보이려고 쓴 코드예요.</p>
</div>

## 참고

- [TanStack Query — Disabling/Pausing Queries (`skipToken`)](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries)
- [TanStack Query — `queryClient.ensureQueryData`](https://tanstack.com/query/latest/docs/reference/QueryClient#queryclientensurequerydata)
- [Ant Design — Form](https://ant.design/components/form)
- [React — Choosing the State Structure: Avoid redundant state](https://react.dev/learn/choosing-the-state-structure#avoid-redundant-state)
- [Kent C. Dodds — AHA Testing](https://kentcdodds.com/blog/aha-testing)
- 관련 글: [프로그램 폼을 타입과 변환 계층으로 나눈 과정](https://jingeon27.tistory.com/18) · [테스트를 전부 지운 뒤 다시 만든 기준](https://jingeon27.tistory.com/25) · [오류는 남기고 화면은 덜 잃게 만든 에러 처리 개편](https://jingeon27.tistory.com/28)
