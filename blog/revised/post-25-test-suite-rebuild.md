# 테스트를 전부 지운 뒤 다시 만든 기준

입사 초기에 두 저장소의 Vitest 테스트 파일 23개를 모두 지웠다. 테스트가 싫어서가 아니었다. 사라진 화면을 계속 가리키는 테스트, 실제 서버와 다른 Mock, 기능을 검증하지 않는 예제가 섞여 있었고 통과 여부를 신뢰할 수 없었다.

몇 달 뒤에는 반대로 테스트를 대규모로 다시 만들었다. 관리자 모노레포에서 19일 동안 102개 파일을 추가했고 후속 작업까지 합치면 116개가 됐다. 숫자만 보면 앞뒤가 맞지 않는다. 달라진 것은 테스트의 개수가 아니라 “초록색이 무엇을 보장하는가”에 대한 기준이었다.

## 테스트를 소스 옆에 둔 이유

기존 테스트는 별도 디렉터리에 모여 있었다.

```text
src/
legacy-tests/
  pages/
  hooks/
  mocks/
```

도메인 코드를 옮겨도 테스트는 따라오지 않았다. 오래된 화면의 테스트는 남고 새 화면에는 테스트가 없었다. 다시 만들 때는 대상 파일 옆에 두었다.

```text
program-form.tsx
program-form.test.tsx
```

파일을 이동하거나 삭제하면 테스트도 같은 diff에서 눈에 띈다. 작은 규칙이지만 레거시 테스트가 조용히 방치되는 일을 줄였다.

## 첫 통합 테스트의 실패

처음에는 폼을 감싼 `FormHarness`가 제출 순서를 대신 실행했다.

```tsx
function FormHarness() {
  const form = useForm();

  const submit = () => {
    const values = form.getValues();
    return api.create(toRequest(values));
  };

  return <ProgramForm form={form} onSubmit={submit} />;
}
```

보기에는 편했지만 테스트가 프로덕션의 제출 로직을 복제하고 있었다. 실제 컴포넌트의 `onSubmit`이 깨져도 Harness만 맞으면 테스트가 통과했다. 만든 다음 날 이런 Harness 네 개를 모두 지우고 실제 컨테이너를 렌더했다.

테스트 코드의 중복보다 더 위험한 것은 테스트가 제품의 결정을 대신하는 경우였다. 화면을 띄우는 provider나 결과 조회처럼 준비와 관찰을 담당하는 코드는 묶었다. 무엇을 언제 보낼지는 제품 코드만 소유하게 했다.

## Mock 서버가 모든 요청을 받아주고 있었다

통합 테스트는 초록색인데 실서버 등록은 400으로 실패하는 일이 반복됐다. MSW handler가 요청 본문을 검증하지 않고 그대로 저장했기 때문이다.

Mock 시드의 분류·언어·지역 코드도 실서버 초기 데이터와 겹치는 값이 없었다. Mock에만 있는 카테고리 때문에 존재하지 않는 탭이 화면에 나타났고, E2E는 그 탭을 정상 기능으로 단언했다.

백엔드 DTO와 validation annotation에서 확인한 규칙만 Mock에 옮겼다.

```ts
const createProgramRequestSchema = z.object({
  name: z.string().trim().min(1),
  locale: z.enum(['ko', 'en', 'ar']),
  hospitalId: z.number().int().positive(),
});

http.post('/programs', async ({ request }) => {
  const result = createProgramRequestSchema.safeParse(await request.json());

  if (!result.success) {
    return HttpResponse.json(toValidationError(result.error), { status: 400 });
  }

  return HttpResponse.json(programStore.create(result.data));
});
```

프론트 테스트에 편한 규칙을 추가하지 않았다. Mock을 고치는 일도 테스트 데이터 정리가 아니라 서버 계약 변경으로 취급했다.

## Mock과 실서버 테스트가 맡는 일

MSW는 오류, 지연, 빈 목록처럼 실제 환경에서 안전하게 만들기 어려운 상태를 재현한다. 하지만 실제 엔드포인트와 DTO가 맞는지는 알려주지 못한다.

그래서 개발 서버에 연결하는 `*.remote.test.ts` 계층을 따로 뒀다. 로그인은 한 번 수행하고, 쓰기 테스트는 자신이 만든 데이터를 다시 조회한 뒤 정리할 수 있는 도메인에만 허용했다. 8월 11일 기준 실서버 테스트 파일은 17개였다.

실서버에서 차이를 찾으면 계약 테스트만 늘리지 않았다. 확인한 제약을 Zod schema, Mock handler와 통합 테스트로 되돌려 로컬에서 먼저 실패하게 했다.

이 계층도 완전하지 않다. 데이터가 없으면 실패하는 조회가 있고, 서버가 필터를 무시해도 결과 개수만 맞으면 통과하는 테스트도 있다. 다른 사람의 개발 데이터를 건드리는 흐름은 자동화하지 않았다. 실서버에 붙었다는 이유만으로 더 강한 테스트가 되는 것은 아니었다.

## 새 테스트가 정말 실패하는지 확인하기

초기 19일 동안 새로 보호한 경로는 제품 코드를 일부러 잘못 바꿔 봤다.

```ts
// 정상
const finalAmount = paymentAmount - couponDiscount;

// 확인을 위해 잠시 변경
const finalAmount = paymentAmount + couponDiscount;
```

해당 테스트만 실패하는지 확인하고 코드를 되돌렸다. 자동 mutation testing을 구축한 것은 아니다. 수동 절차였고 이후의 모든 테스트에 적용했다고 말할 수도 없다. 그래도 “테스트를 추가했다”와 “그 테스트가 회귀를 잡는 것을 확인했다”를 구분하는 데 도움이 됐다.

## E2E는 브라우저에서만 보이는 경계에 뒀다

회원가입 퍼널은 URL 직접 진입, 새로고침, 뒤로 가기와 인증 상태가 함께 움직였다. 함수 테스트로는 이 조합을 확인하기 어려웠다.

처음 요구사항 표에는 26개 시나리오 중 11개만 테스트가 있었다. 우회 진입 E2E를 추가한 뒤 25개 시나리오에 최소 하나의 대표 E2E가 생겼다. 하지만 개수만 채우지는 않았다. 기존 테스트 하나는 실제 가드가 없어도 통과하고 있었다. URL만 확인하고 사용자가 막혔는지는 보지 않았기 때문이다.

```ts
await page.goto('/signup/profile');

await expect(page).toHaveURL('/signup/terms');
await expect(page.getByRole('heading', { name: '약관 동의' })).toBeVisible();
```

리다이렉트 목적지와 실제 화면을 함께 확인하도록 고쳤다. E2E의 가치는 브라우저를 띄웠다는 데 있지 않고, 가드가 사라지면 실패하는 단언에 있었다.

## 테스트에서는 반복을 남긴다

제품 코드에서는 공통화를 자주 검토하지만 테스트에서는 시나리오를 한눈에 읽는 쪽을 우선한다.

```ts
it('쿠폰 필터를 누르면 URL에 couponDiscount=true가 남아야 한다', async () => {
  renderSearchPage();

  await user.click(screen.getByRole('button', { name: '쿠폰 추가 할인' }));

  expect(window.location.search).toContain('couponDiscount=true');
});
```

클릭과 URL 검증이 다른 테스트에도 반복되더라도 핵심 행동을 `expectFilterScenario()` 같은 범용 헬퍼 안에 숨기지 않는다. 로그인이나 provider처럼 이 테스트의 관심사가 아닌 준비만 감춘다.

## 지금 테스트가 통과한다는 말의 범위

- 순수 함수 테스트는 변환과 도메인 경곗값을 보장한다.
- MSW 통합 테스트는 실제 컴포넌트와 프론트가 알고 있는 계약의 연결을 보장한다.
- 실서버 테스트는 자동으로 만들고 정리할 수 있는 범위에서 실제 계약과의 차이를 찾는다.
- E2E는 브라우저 탐색과 퍼널처럼 낮은 계층에서 재현하기 어려운 흐름을 맡는다.

이 네 종류를 모두 갖췄다고 제품 전체가 검증되는 것은 아니다. 대표 E2E가 없는 시나리오가 하나 남아 있고, 일부 테스트는 상태의 일부만 본다. 직접 테스트가 없는 proxy 분기도 있다.

AI에게 작업을 맡길 때도 같은 기준을 쓴다. 성공 조건이 코드로 적힌 구간은 병렬로 맡길 수 있다. 다만 그 조건 자체가 실제 서버 계약인지, 테스트가 복제한 가짜 계약인지는 사람이 확인해야 한다. 테스트 수보다 이 구분을 유지하는 일이 지금의 테스트 정책이다.
