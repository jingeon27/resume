# 선언적 코드는 변경을 작게 만든다

내가 말하는 선언적 코드는 `map`이나 커스텀 훅을 많이 쓰는 코드가 아니다. VOC나 예외가 추가돼도 공통 구조를 다시 뜯지 않고, 바뀐 요구사항이 코드의 한 구획에 그대로 보이는 구조에 가깝다.

물론 읽기 쉬워야 한다. 확장을 위해 설정 객체와 범용 렌더러를 만들었는데 실제 화면을 이해하려고 여러 파일을 오가야 한다면 좋은 구조라고 보기 어렵다.

## 고정된 Filter Chip은 컴포넌트로 나열한다

병원 검색에는 검색 모드와 탭에 따라 서로 다른 Filter Chip이 나타난다. 각 Chip은 라벨, 선택 상태와 클릭 동작이 다르다.

이걸 데이터로 표현할 수도 있다.

```tsx
const filters = [
  {
    type: 'region',
    label: '지역',
    pressedKey: 'selectedRegions',
    sheet: 'region',
  },
  {
    type: 'coupon',
    label: '쿠폰 추가 할인',
    queryKey: 'couponDiscount',
  },
];

return filters.map((filter) => <FilterRenderer key={filter.type} config={filter} />);
```

처음에는 반복이 줄어 보여도 예외가 추가될 때마다 `FilterRenderer`의 설정 문법이 커진다. 쿠폰 Chip에만 아이콘을 넣거나 진료과 Chip만 특정 탭의 BottomSheet를 열어야 하면 데이터 구조가 UI 컴포넌트를 흉내 내기 시작한다.

현재는 완성된 컴포넌트를 나열한다.

```tsx
function RegionChip(props: FilterChipProps) {
  const openFilter = useOpenFilterSheet('region', props.filterType, props.isFilterSearch);

  return (
    <Chip pressed={(props.filterState.selectedRegions?.length ?? 0) > 0} onClick={openFilter}>
      {getRegionLabel(props.filterState)}
    </Chip>
  );
}

function CouponChip() {
  const { currentParams, toggleBenefit } = useSearchFilter();

  return (
    <Chip pressed={parseUrlBoolean(currentParams.couponDiscount)} onClick={() => toggleBenefit('couponDiscount')}>
      <CouponIcon />
      쿠폰 추가 할인
    </Chip>
  );
}

const FILTER_CHIPS = {
  hospital_filter: [RegionChip, DepartmentChip, CouponChip, HospitalInfoChip],
  hospital_integrated: [RegionChip, DepartmentIdsChip, CouponChip],
  program_filter: [RegionChip, DepartmentChip, CouponChip, TodayDiscountChip],
  program_integrated: [RegionChip, DepartmentIdsChip, CouponChip],
} satisfies Record<SearchFilterCase, ComponentType<FilterChipProps>[]>;
```

배열을 사용하지만 데이터 조합은 아니다. 각 항목은 자기 동작을 가진 컴포넌트이고, 배열은 화면에 놓을 순서와 조합만 말한다. 쿠폰 요구사항이 바뀌면 `CouponChip`을, 한 검색 케이스의 구성이 바뀌면 해당 배열만 수정한다.

서버가 내려주는 임의 길이 목록처럼 항목의 구조가 정말 같고 데이터만 다를 때는 `map`이 맞다. 고정된 소수의 UI가 저마다 예외를 가진다면 직접 나열하는 편이 읽기 쉽다.

## props가 UI 명세처럼 늘어나면 컴파운드 구조를 검토한다

검색 필터를 하나의 컴포넌트로 만들면 금방 이런 API가 된다.

```tsx
<SearchFilter
  keywordOptions={keywordOptions}
  selects={selects}
  dates={dates}
  cascaders={cascaders}
  fieldOrder={['keyword', 'status', 'period']}
  onSubmit={handleSubmit}
/>
```

사용처는 짧지만 실제 화면을 알려면 컴포넌트 내부의 렌더러를 읽어야 한다. 검색 화면은 다음처럼 직접 조립하게 했다.

```tsx
const SearchFilter = createSearchFilter(reservationSearchParamsSchema);

<SearchFilter onSubmit={handleSubmit} onReset={handleReset}>
  <SearchFilter.Keyword name="keyword" typeName="keywordType" options={keywordOptions} />
  <SearchFilter.Fields>
    <SearchFilter.Select name="status" label="예약 상태" options={statusOptions} />
    <SearchFilter.DateRange label="예약일" startName="startDate" endName="endDate" />
  </SearchFilter.Fields>
</SearchFilter>
```

화면의 구조는 JSX에 남고 제출·초기화·레이아웃 생명주기만 Root가 공유한다. `createSearchFilter`는 Zod schema를 받아 URL 파싱, 폼 필드와 API 요청의 key를 같은 계약으로 제한한다. JSX 조합은 열어 두고 잘못된 필드명만 닫은 셈이다.

## 팩토리는 여러 사용처의 계약을 한 번에 고정할 때 쓴다

Ant Design Form은 중첩 `NamePath`와 일부 조회·수정 API의 타입이 느슨했다. 38개 이상의 프로그램 필드에서 문자열 오타를 모두 상수로 옮겨도 반환값의 `any`는 남았다.

```tsx
const ProgramForm = createTypedForm<ProgramFormValues>();

const [form] = ProgramForm.useForm();

form.getFieldValue('programName'); // string
form.getFieldValue('progamName');  // compile error

<ProgramForm.Item name={['templates', 0, 'title']}>
  <Input />
</ProgramForm.Item>
```

unsafe assertion은 팩토리 안 한 곳에 가두고 `Form`, `Item`, `List`, `useForm`, `useWatch`를 같은 `T`로 묶었다. 호출부가 같은 제네릭과 field type을 반복하지 않기 때문에 팩토리를 둘 이유가 있었다.

반대로 한 화면에서 한 번 쓰는 컴포넌트에 팩토리를 만들지는 않는다. 추상화 이름이 사용처보다 더 어려우면 그냥 가까이에 둔다.

## 여러 동작을 한 컴포넌트에 모으지 않는다

대화 UI를 예로 들면 다음 책임은 바뀌는 이유가 다르다.

```text
Conversation
  MessageList       목록 렌더링과 자동 스크롤
  ChatInput         입력과 전송
  MessageBubble     메시지 한 건 렌더링
  SessionConnection SSE 연결과 정리
```

API 호출, 입력 상태, 스크롤과 메시지 분기를 한 `Conversation` 안에 넣으면 요구사항 하나가 전체 컴포넌트를 건드린다. 분리할 수 있는 동작은 각자의 컴포넌트나 순수 함수로 둔다. 컨테이너는 어떤 부품이 함께 동작하는지만 보여준다.

컴포넌트의 추상화 수준도 맞춘다. `MessageList`, `ChatInput`, `MessageBubble` 옆에 특정 버튼 하나인 `SendIcon`을 같은 레벨로 올리지 않는다. 한 트리를 읽을 때 형제 이름이 비슷한 크기의 책임을 말해야 한다.

## 한 번 쓰는 로직은 먼저 가까이에 둔다

custom hook이라는 형태만으로 코드가 재사용 가능해지지는 않는다.

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

한곳에서만 쓰는 위 흐름을 `useReservationCancellation`로 옮기면 이름 하나가 더 생길 뿐이다. 독립된 도메인 동작으로 여러 화면에서 사용되거나 별도 테스트 계약이 생겼을 때 추출한다.

## 커링으로 클릭 핸들러의 두 입력을 구분한다

목록 항목의 ID는 렌더 시점에 알고 클릭 event는 나중에 들어온다. 두 인자를 같은 callback에 억지로 맞추기보다 고정할 값과 이벤트가 주는 값을 나눈다.

```tsx
const handleSelect = (programId: number) => (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  openProgram(programId);
};

<button onClick={handleSelect(program.id)}>상세 보기</button>
```

모든 handler를 커링하지는 않는다. 반복되는 inline closure가 있고 첫 인자가 도메인 값, 두 번째 인자가 UI callback의 값일 때 사용한다.

## 실행할 수 없는 Query는 `skipToken`으로 표현한다

상세 조회에는 ID가 필요하다. ID가 없을 때 `enabled: false`만 붙이면 `queryFn`은 여전히 ID가 있다고 가정한 채 작성되기 쉽다.

```ts
const programDetailOptions = (programId?: number) =>
  queryOptions({
    queryKey: ['program', 'detail', programId],
    queryFn: programId ? () => getProgramDetail(programId) : skipToken,
  });
```

호출부는 조회 가능 여부를 다시 계산하지 않는다.

```tsx
const { data } = useQuery(programDetailOptions(programId));
```

`enabled`가 나쁘다는 뜻은 아니다. 사용자가 조회를 일시 정지하고 재개하는 기능이라면 `enabled`가 그 상태를 잘 표현한다. 필수 입력이 없어 요청 함수를 만들 수 없는 경우에는 `skipToken`이 더 정확하다.

## 변환과 실행을 섞지 않는다

다음 함수는 URL을 만들면서 이동까지 수행한다.

```ts
function moveToProgram(programId: number) {
  const url = `/program/${programId}?from=list`;
  router.push(encodeURI(url));
}
```

URL 규칙만 테스트하거나 `Link`와 공유하기 어렵다. 값 변환과 실행을 나눈다.

```ts
const createProgramHref = (programId: number) => `/program/${programId}?from=list`;

const handleOpenProgram = (programId: number) => {
  router.push(createProgramHref(programId));
};
```

`encodeURIComponent`, 요청 DTO 변환과 금액 계산은 값을 반환하는 함수에 둔다. `router.push`, toast, API 호출은 실행 경계에 둔다. 순수 함수 안에서 다른 작업이 함께 실행되지 않게 한다.

## 파생값은 다시 저장하지 않는다

현재 경로가 탭 값과 같다면 별도의 매핑과 `activeTab` 상태가 필요 없다.

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

선택한 쿠폰에서 계산되는 할인 금액, URL에서 알 수 있는 선택 탭, Query 결과로 알 수 있는 loading 여부도 같은 기준을 쓴다. 원본이 이미 있다면 state와 effect로 복사하지 않는다.

상태는 실제로 함께 읽고 수정하는 컴포넌트의 가장 가까운 공통 부모에 둔다. “나중에 다른 곳에서도 쓸 것 같다”는 이유만으로 전역 store에 올리지 않는다.

## 테스트도 한눈에 읽혀야 한다

테스트는 실패했을 때 다시 읽는 문서다. 고정된 시나리오 몇 개를 데이터 배열과 범용 함수로 줄이면 줄 수는 감소하지만 조건과 행동을 찾기 어려워진다.

```ts
it('쿠폰 Chip을 누르면 쿠폰 필터가 URL에 반영돼야 한다', async () => {
  renderSearchPage();

  await user.click(screen.getByRole('button', { name: '쿠폰 추가 할인' }));

  expect(window.location.search).toContain('couponDiscount=true');
});

it('선택된 쿠폰 Chip을 다시 누르면 URL에서 필터가 제거돼야 한다', async () => {
  renderSearchPage('?couponDiscount=true');

  await user.click(screen.getByRole('button', { name: '쿠폰 추가 할인' }));

  expect(window.location.search).not.toContain('couponDiscount');
});
```

렌더링, 클릭, URL 검증이 반복되지만 테스트 하나만 읽어도 보장하는 동작이 보인다. 로그인이나 provider, 큰 기본 fixture처럼 시나리오와 관계없는 준비만 함수로 감춘다. 행동과 기대 결과까지 다시 서술하는 범용 함수는 만들지 않는다.

단위 테스트는 순수 변환과 경곗값, 통합 테스트는 컴포넌트와 API의 연결, E2E는 브라우저 탐색, 실서버 테스트는 실제 계약의 차이를 맡긴다. 같은 사실을 모든 계층에서 반복하지 않는다.

데이터 구조가 같고 개수만 달라질 때는 `map`을 쓴다. 반대로 고정된 UI가 저마다 동작과 예외를 가진다면 컴포넌트를 직접 나열한다. 컴파운드 API와 팩토리도 반복을 없애기 위해 미리 만드는 것이 아니라 여러 사용처에서 같은 생명주기나 타입 계약이 확인됐을 때 꺼낸다.

다음 VOC가 들어왔을 때 바뀐 요구사항이 적힌 곳을 바로 찾고 그 부분만 고칠 수 있다면 충분하다. 추상화의 개수보다 변경 지점이 잘 보이는지가 더 중요하다.
