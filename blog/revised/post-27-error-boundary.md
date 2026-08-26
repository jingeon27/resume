# 오류는 남기고 화면은 덜 잃게 만든 에러 처리 개편

기존 레거시 설계에선 병원이 쓰는 CRM 화면에서 목록 API 하나가 실패했는데 사이드 메뉴와 헤더까지 전부 사라집니다. 앱 루트의 Query Error Boundary 하나가 모든 조회 오류를 받고 있었기 때문인데요. 사용자는 정상인 다른 기능으로 이동하거나 실패한 조회만 다시 시도할 수도 없었습니다.

지금까지 서비스를 유지 보수하면서 API 응답 타입과 실제 값이 어긋나는 경우도 3번 발견됐습니다. TypeScript로 정상으로 보이지만 서버가 새로운 enum이나 `null`을 보내면 렌더링 중에야 문제가 드러났습니다. 로그에는 메시지와 stack만 있어서 어느 앱의 어떤 화면인지 다시 찾는 데 시간이 걸렸고요.

처음에는 이 문제를 "Zod를 붙이고 Error Boundary를 늘리면 된다"고 생각했습니다. 실제 작업에서는 세 결정을 따로 내려야 했습니다.

- 외부 값을 어디에서 검사할 것인가
- 발견한 불일치를 어디까지 기록할 것인가
- 오류가 생겼을 때 화면을 어디까지 멈출 것인가

## API 응답은 먼저 관측만 했다

병원 CRM과 내부 운영 백오피스를 포함한 세 앱의 API 응답 타입을 Zod schema에서 추론하도록 옮겼습니다.

```ts
export const reservationSchema = z.object({
  id: z.number(),
  status: z.enum(['WAIT', 'CONFIRMED', 'CANCELED']),
  couponDiscountAmount: z.number().nullish(),
});

export type Reservation = z.infer<typeof reservationSchema>;
```

타입 선언과 런타임 계약이 한 파일에 놓였지만, 기존 응답에 바로 `parse()`를 적용하지는 않았습니다. 운영 화면에서 아직 사용 중인 필드를 schema에 빠뜨리면 Zod의 파싱 결과에서 그 key가 사라질 수 있거든요. 선택 필드 하나가 실제와 다르다는 이유로 병원 담당자의 업무 전체를 막는 것도 위험했습니다.

그래서 첫 단계는 `safeParse`로 차이만 기록하고 원본 값을 반환했습니다.

```ts
export function parseApiResponse<T>(schema: z.ZodType, response: AxiosResponse<T>): T {
  const result = schema.safeParse(response.data);

  if (!result.success) {
    reportOnce({
      code: 'RESPONSE_SCHEMA_MISMATCH',
      source: `${response.config.method?.toUpperCase()} ${response.config.url}`,
      issues: result.error.issues,
    });
  }

  return response.data;
}
```

이 방식으로 런타임 타입 안전성이 완성되는 것은 아닙니다. 잘못된 값도 호출부까지 갈 수 있습니다. 대신 이미 운영 중인 250개 파일에 계약 검증을 도입하면서 실제 응답과 스키마의 차이를 먼저 수집할 수 있었습니다. 확인된 `null`, 응답 envelope와 enum 차이는 다음 수정에서 스키마와 Mock에 반영했고요.

신규 기능이나 잘못된 값을 그대로 사용하면 안 되는 입력에는 차단형 검증을 씁니다. 모든 Zod 스키마가 실패했을 때 같은 동작을 할 필요는 없었습니다.

## URL도 경로별 입력 계약으로 다뤘다

주소창은 사용자가 직접 고칠 수 있고 오래된 북마크도 들어옵니다. 기존에는 각 화면이 `searchParams`를 문자열로 읽고 원하는 타입으로 단언했습니다.

```ts
export const reservationSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  status: z.enum(['WAIT', 'CONFIRMED']).optional().catch(undefined),
  reservationId: z.coerce.number().int().positive().optional().catch(undefined),
});
```

잘못된 필드는 해당 schema의 fallback으로 복구하고 어떤 값이 어긋났는지는 한 번만 기록합니다. 잘못된 URL 하나가 목록 전체를 Error Boundary로 보내지 않게 하기 위해서입니다.

이 schema는 URL을 읽는 데만 쓰려고 만든 것이 아닙니다. 해당 path가 허용하는 검색 조건의 스펙인데요. 다음 단계에서는 path와 schema를 factory로 묶어 `Link`, `router.push`, `router.replace`가 같은 입력 타입을 사용하게 할 계획입니다.

```ts
const reservationRoute = createRoute({
  path: '/customer/reservations',
  searchParamsSchema: reservationSearchParamsSchema,
});

router.push(reservationRoute.href({ page: 2, status: 'WAIT' }));
```

현재 구현과 계획은 구분해서 적습니다. URL을 읽는 쪽의 schema 검증은 적용됐고, 모든 이동 호출부를 factory로 제한하는 작업은 아직 하지 않았습니다.

## 로그에는 재현할 위치를 남겼다

API 오류, 일반 렌더링 오류와 schema 불일치를 같은 로그 모델로 모았습니다.

```ts
type ErrorLog = {
  type: 'API_ERROR' | 'GENERAL_ERROR' | 'SCHEMA_MISMATCH';
  code: string;
  message: string;
  appName?: string;
  path?: string;
  boundary?: string;
  method?: string;
  url?: string;
  status?: number;
  issues?: Array<{ path: string; code: string; message: string }>;
  stack?: string;
};
```

API 응답에는 method와 URL이 이미 있으므로 호출부가 이름을 다시 적지 않습니다. schema 불일치는 필드 경로와 오류 code를 남기고, 같은 요청의 같은 불일치는 브라우저 세션에서 한 번만 보냅니다. 목록 50개가 같은 필드에서 어긋났다고 같은 로그를 50건 쌓을 이유가 없었으니까요.

로그 전송 자체도 화면을 깨뜨리면 안 됩니다. 직렬화할 수 없는 값과 바이너리는 제외하고, 큰 응답은 잘라서 보냅니다. 전송 실패는 사용자 흐름으로 다시 던지지 않습니다.

### `componentStack` 자동 수집을 포기한 이유

Error Boundary마다 수동 `name`을 적는 것이 마음에 들지 않았습니다.

```tsx
<QueryErrorBoundary name="customer/reservations:detail" variant="section">
  <ReservationDetail />
</QueryErrorBoundary>
```

React의 `componentStack`에서 컴포넌트 이름을 얻으면 이 문자열을 없앨 수 있을 것 같았습니다. 개발 빌드에서는 잘 보였지만 프로덕션 Turbopack 빌드에서는 이름이 축약돼 `at o (chunks/...)`처럼 남았습니다.

전체 mangling을 끄거나 source map으로 역변환하는 방법은 가능했지만 배포 비용과 소스 공개 범위를 감수할 만큼의 이득은 아니었습니다. 자동화 코드를 철회하고 지금은 읽을 수 있는 `path`, 수동 `boundary`와 오류 stack만 남깁니다. 자동으로 채울 수 있다는 것보다 운영에서 실제로 읽을 수 있는지가 중요했습니다.

## Error Boundary는 복구 단위로 나눴다

기존 구조는 단순했습니다.

```text
App Root Query Error Boundary
  Header
  Side Menu
  Page
    List
    Detail Drawer
```

목록 하나가 실패해도 Root가 전체 트리를 오류 화면으로 바꿨습니다. 그렇다고 바운더리를 작은 컴포넌트마다 두는 방식으로 반대로 치우치고 싶지는 않았고요. 함께 로딩되고 함께 다시 시도해야 하는 UI를 하나의 복구 단위로 봤습니다.

```text
App Shell
  Route Boundary
    Page Boundary
      List Section Boundary
      Detail Section Boundary
      Overlay Boundary
```

구현에서는 세 variant를 사용합니다.

```tsx
<QueryErrorBoundary name="customer/reservations" variant="page">
  <ReservationPage />
</QueryErrorBoundary>

<QueryErrorBoundary name="customer/reservations:list" variant="section">
  <ReservationList />
</QueryErrorBoundary>

<QueryErrorBoundary
  name="customer/reservations:detail"
  variant="overlay"
  onError={closeDetail}
>
  <ReservationDetailDrawer />
</QueryErrorBoundary>
```

- `page`는 본문을 오류 화면으로 바꾸되 Header와 Side Menu는 남깁니다.
- `section`은 실패한 자리에 안내와 재시도 버튼을 표시합니다.
- `overlay`는 열리다 만 Drawer나 Modal을 닫고 toast로 알립니다.

여기서 "경계를 최소화한다"는 바운더리 개수를 줄인다는 말이 아닙니다. 한 번의 실패로 사용자가 잃는 기능의 범위를 줄인다는 뜻입니다.

## 바운더리를 같은 자리에 두려면 추상화의 정도를 통일해야 했다

복구 단위를 정하고 나서 화면에 적용하려니 걸리는 게 있었습니다. 바운더리를 걸 자리가 화면마다 달랐습니다.

가장 큰 이유는 라우트가 직접 조회하는 것이었는데요. `page.tsx` 안에 `useQuery`가 있으면 그 실패는 페이지 전체를 날립니다. 표만 실패하고 검색 필터와 탭은 살아 있는 폴백을 만들 수가 없습니다. section variant를 쓰고 싶어도 감쌀 대상이 없는 셈입니다.

세어보니 편차가 더 컸습니다.

- 상세 Drawer 선언 위치가 라우트 10곳, 목록 컴포넌트 23곳으로 갈려 있었습니다.
- 라우트 자체도 세 형태가 섞여 있었습니다. 레이아웃을 직접 그리는 것 44곳, 페이지 레이어에 위임하는 것 4곳, ListView에 통째로 맡기는 것 4곳입니다.

그래서 바운더리를 추가하기 전에 화면 구성 규칙을 먼저 정했습니다.

**페이지는 조회하지 않는다.** 라우트는 뼈대(브레드크럼·탭·검색 필터·상세 선언)만 그리고, 데이터를 읽는 구획은 스스로 조회하는 `XxxListView`로 내린 뒤 section 바운더리로 감쌉니다.

**URL로 여는 상세는 라우트에 둔다.** 목록 컴포넌트 안에 두면 목록이 실패해 section 폴백이 떴을 때 상세까지 함께 사라집니다. `destroyOnHidden` 탭이 헐릴 때도 마찬가지고요. 상세는 목록과 다른 복구 단위이므로 선언 위치도 목록 밖이어야 합니다.

**검색 필터는 자기 바운더리를 갖는다.** 이건 규칙을 정하는 것만으로는 안 됐고, 검색 필터를 다시 만들어야 했습니다. 이전 구조에서는 바운더리를 넣을 자리가 아예 없었거든요.

```tsx
// 이전 — 필터도 목록도 설정 배열 안에 들어 있다
<SearchFilterLayout
  tabs={[
    {
      key: 'reservations',
      label: '예약 목록',
      searchKeywordType: [{ label: '예약자명', value: 'name' }],
      filters: [
        { key: 'status', name: '예약 상태', type: 'select', options: STATUS_OPTIONS },
        { key: 'department', name: '분류', type: 'select', options: departmentOptions },
      ],
      children: <ReservationList />,
    },
  ]}
/>
```

필터는 `filters` 배열의 데이터고, 목록은 같은 객체의 `children`입니다. 감쌀 대상이 JSX로 존재하지 않으니 필터만 잘라낼 수가 없습니다. 배열 항목에 바운더리를 씌울 방법은 없고, 레이아웃 전체를 감싸면 목록까지 같이 사라집니다.

옵션을 조회로 받아오는 필터는 문제가 한 겹 더 있었습니다. `options`가 prop이라 조회는 호출부인 페이지에서 일어납니다. 필터 옵션 API가 실패하면 그 오류는 필터가 아니라 페이지에서 나고, 화면 전체가 폴백으로 바뀝니다.

그래서 필터를 설정 배열이 아니라 JSX로 선언하는 compound 구조로 바꿨습니다.

```tsx
<SearchFilter onSubmit={handleSearch}>
  <SearchFilter.Keyword name="keyword" typeName="keywordType" options={SEARCH_KEYWORD_TYPES} />
  <SearchFilter.Fields>
    <SearchFilter.Select name="status" label="예약 상태" options={STATUS_OPTIONS} />
    <DepartmentFilter name="department" label="분류" />
  </SearchFilter.Fields>
</SearchFilter>
```

필터가 엘리먼트가 되면서 `createSearchFilter`가 만든 루트가 자기 children을 section 바운더리로 감쌀 수 있게 됐습니다. 조회로 옵션을 받아오는 필터도 그 조회를 자기 안에 들고 있어서, 실패가 바운더리 안쪽에서 납니다. 검색바만 폴백으로 바뀌고 목록은 그대로 남습니다.

바운더리를 넣으려다 컴포넌트를 다시 만든 셈인데, 순서가 반대였다면 같은 결론에 도달하지 못했을 것 같습니다. "여기에 바운더리를 걸 수 있나"를 기준으로 보니까 설정 배열 방식의 한계가 드러났습니다.

적용 전후는 이렇게 달라졌습니다.

```tsx
// 이전 — 라우트가 조회하고, 표와 컬럼과 버튼까지 들고 있다
function ReservationPage() {
  const { data, isFetching } = useQuery(reservationListOptions(getReservationListParams(currentParams)));

  return (
    <Flex vertical gap={10}>
      <BreadCrumb />
      <SearchFilter onSubmit={handleSearch}>{/* ... */}</SearchFilter>
      <ExcelExportButton onClick={() => handleExcelExport(data)}>엑셀 내보내기</ExcelExportButton>
      <Table
        loading={isFetching}
        dataSource={data}
        columns={
          [
            /* 인라인 컬럼 */
          ]
        }
      />
    </Flex>
  );
}
```

```tsx
// 이후 — 조회는 ListView 로 내려가고, 라우트에는 바운더리 두 개가 남는다
function ReservationPage() {
  const currentParams = useTypedQueryParams({ schema: reservationSearchParamsSchema });
  const removeQueryParams = useRemoveQueryParams();

  return (
    <>
      <Flex vertical gap={10}>
        <BreadCrumb />
        <SearchFilter onSubmit={handleSearch}>{/* ... */}</SearchFilter>
        <QueryErrorBoundary name="customer/reservations:list" variant="section">
          <ReservationListView />
        </QueryErrorBoundary>
      </Flex>

      <QueryErrorBoundary name="customer/reservations:detail" variant="overlay" onError={() => removeQueryParams.removeByKey('id')}>
        <ReservationDetailDrawer open={!!currentParams.id} onClose={() => removeQueryParams.removeByKey('id')} />
      </QueryErrorBoundary>
    </>
  );
}
```

이 화면은 161줄에서 84줄이 됐고, 내부 운영 백오피스의 라우트 30개를 합치면 1,000줄 넘게 줄었습니다.

예외도 남겼습니다. 행 데이터를 들고 여는 상세 세 곳은 목록 옆에 그대로 뒀는데요. 라우트로 올리면 페이지가 목록을 다시 조회해야 해서, 조회를 내린다는 규칙과 정면으로 부딪히기 때문입니다. URL로 여는 상세와 행 데이터로 여는 상세는 복구 단위가 다르다고 보고 갈랐습니다.

### 문서로 적어둔 규칙은 지켜지지 않았다

라우트 구성 규칙을 저장소 문서에 적어두고 새 화면을 만들 때 읽도록 했는데, 이걸로는 부족했습니다. 이번에 정리한 것들이 전부 그렇게 쌓인 것이었거든요. 페이지 레이어와 라우트가 섞인 것도, 상세 선언 위치가 갈린 것도, `useQuery`를 그대로 감싼 래퍼 훅도 문서에는 하지 말라고 적혀 있었습니다. 문서와 코드가 갈라져도 아무도 모른다는 게 문제였습니다. 문서에 딸린 grep 점검도 누가 기억해서 돌려야 실행됩니다.

그래서 기계로 판정할 수 있는 것은 ESLint 플러그인으로 옮겼습니다.

| 규칙                    | 잡는 것                                         |
| ----------------------- | ----------------------------------------------- |
| `no-query-in-route`     | `app/**/page.tsx` 안의 `useQuery` 계열 호출     |
| `no-overlay-boundary`   | `overlay.open` 안에서 `QueryErrorBoundary` 중복 |
| `no-query-wrapper-hook` | `useQuery`를 그대로 감싼 `useXxx` 훅            |

첫 번째가 이 절에서 정한 규칙입니다. 라우트에서 조회하면 그 실패는 상위 route 바운더리로 올라가고, 표만 잘라내는 section 폴백을 만들 수 없습니다. 그래서 페이지 레이어에서는 조회 자체를 못 쓰게 막았습니다.

마냥 켜지지만은 않았습니다. `--max-warnings=0`을 걸어야 실제로 막히는데, 그러려면 남아 있던 warning 10건을 먼저 없애야 했습니다.

규칙으로 못 잡는 것도 있습니다. 상세를 라우트에 선언했는지, 바운더리가 빠진 라우트가 있는지는 아직 눈으로 봅니다. 이건 위치와 맥락의 문제라 정적 규칙으로 판정하기 어려웠습니다.

## 오버레이는 닫은 다음 다시 열려야 했다

Drawer가 `?reservationId=1` 같은 URL 상태로 열리는 화면이 많았습니다. 내부 조회가 실패해 Drawer만 사라져도 URL에 ID가 남으면 같은 행을 다시 눌러 열 수 없었는데요. overlay variant는 오류를 잡은 직후 `onError`로 URL 상태까지 정리했습니다.

경로가 바뀌었는데 이전 화면의 fallback이 남는 문제도 있었습니다. pathname만 비교하면 `?id=`가 제거되는 Drawer 닫기를 알아채지 못합니다. 현재 경로는 pathname과 search를 함께 비교하고, 바뀌면 해당 Boundary를 reset합니다.

이를 위해 `history.pushState`와 `replaceState` 변경을 구독합니다. 예전 구현은 Error Boundary 인스턴스마다 history 함수를 감싸고 언마운트하면서 과거 함수로 복원했습니다. 바운더리가 중첩되면 다른 Boundary와 Next Router가 나중에 덧댄 함수까지 함께 제거할 수 있었고요.

지금은 모듈에서 history를 한 번만 감싸고 각 Boundary는 listener만 등록하고 제거합니다. Error Boundary를 세분화하기 전에 중첩 구조에서 생길 충돌을 먼저 없앴습니다.

## Mutation 오류는 같은 방식으로 처리하지 않았다

화면을 그리는 데 필요한 Query가 실패하면 해당 Boundary를 정상적으로 렌더할 수 없습니다. Error Boundary가 맞습니다.

반면 저장 버튼을 눌렀다가 Mutation이 실패한 경우에는 사용자가 입력한 폼과 화면을 유지해야 합니다. 이 오류까지 Boundary로 보내면 수정할 기회를 잃습니다. Mutation은 field error, toast와 재시도로 현재 화면 안에서 처리합니다.

```text
Query 실패     해당 복구 단위의 Error Boundary
Mutation 실패  입력 유지 + field error/toast + 다시 제출
Schema 차이    신뢰 경계에서 기록, 데이터 성격에 따라 통과 또는 차단
```

## 테스트에서 본 것은 오류 문구가 아니었다

Error Boundary 테스트는 다음 동작을 고정합니다.

- 목록이 실패해도 상세와 앱 탐색 UI가 남는다.
- 안쪽 section이 오류를 잡고 바깥 page는 정상 상태를 유지한다.
- search가 바뀌면 오래된 Drawer fallback이 사라진다.
- overlay 오류 뒤 URL 상태가 정리되어 같은 항목을 다시 열 수 있다.
- 안쪽 Boundary가 언마운트돼도 다른 history 구독과 Router patch가 남는다.
- 재시도하면 실패한 Boundary만 다시 렌더링한다.

오류 안내가 보인다는 단언만으로는 이전의 전체 화면 장애를 막지 못합니다. 실패한 부분 밖에서 사용자가 계속 무엇을 할 수 있는지를 확인해야 했습니다.

이 작업으로 오류가 없어지지는 않았습니다. 달라진 것은 실제 응답과 타입의 차이를 찾을 위치, CloudWatch에서 재현할 화면을 찾는 정보, 그리고 오류 하나가 가져가는 화면의 범위입니다. 에러 처리를 예외를 잡는 코드로만 보지 않고 사용자가 어디까지 계속 일할 수 있게 할지 정하는 UI 설계로 보게 됐습니다.
