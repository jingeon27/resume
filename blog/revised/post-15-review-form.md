# 3단계 리뷰 작성 폼을 RHF, Zod, useFunnel로 다시 나눈 과정

리뷰 작성 화면은 세 단계로 이어진다.

1. 방문 인증을 위한 영수증 업로드
2. 시술과 결제 정보 입력
3. 별점, 사진, 리뷰 내용 작성

기존 구현은 Zustand store 하나에 모든 단계의 값을 저장하고, `switch` 문으로 현재 화면을 골랐다. 각 input은 `setReviewForm`을 직접 호출했고 에러 문구도 component 안에서 계산했다. 기능은 동작했지만 필드를 추가할수록 값, 검증, 화면 전환이 서로 다른 파일에서 함께 바뀌었다.

이 글에서는 코드를 몇 퍼센트 줄였다는 수치보다, 세 책임을 각각 어디로 옮겼는지 설명한다.

- 값과 field lifecycle: React Hook Form
- 검증 규칙: Zod
- 단계와 history: `@use-funnel/next`

## 기존 구조의 문제

```ts
type ReviewStore = {
  step: 'first' | 'second' | 'third';
  form: Partial<ReviewForm>;
  setReviewForm: (values: Partial<ReviewForm>) => void;
  setStep: (step: ReviewStore['step']) => void;
};
```

```tsx
switch (step) {
  case 'first':
    return <ReceiptStep />;
  case 'second':
    return <HospitalInfoStep />;
  case 'third':
    return <ReviewContentStep />;
}
```

store가 전역이어야 할 이유는 없었다. 작성 값은 이 화면을 벗어나면 폐기되고, 뒤로 가기에 필요한 것은 전역 접근이 아니라 단계별 값 보존이었다.

## Step별 schema와 전체 schema를 함께 관리하기

각 단계에서는 그 단계의 값만 검증하고, 최종 제출에서는 전체 값을 다시 검증해야 했다. Zod 내부의 `_def`에 접근해 shape를 꺼내면 refinement가 유실되고 Zod 버전에도 결합된다. 대신 field shape와 refinement 함수를 공개 API 위에서 재사용했다.

```ts
import { z } from 'zod';

const ReceiptListSchema = z.array(ReviewImageSchema).max(5);

const step1Shape = {
  receipts: ReceiptListSchema,
} satisfies z.ZodRawShape;

const step2Shape = {
  visibility: z.enum(['PUBLIC', 'HIDDEN']),
  programs: z.array(ProgramSchema).min(1).max(5),
  quoteRequired: z.boolean(),
  quoteAmount: z.number().positive().optional(),
  paymentAmount: z.number().positive(),
  discountGuideReceived: z.boolean(),
  notReceivedReason: z.string().optional(),
} satisfies z.ZodRawShape;

const step3Shape = {
  images: z.array(ReviewImageSchema).max(5),
  ratings: z.array(RatingSchema),
  content: z.string().min(50).max(500),
  recommend: z.boolean(),
} satisfies z.ZodRawShape;

const ReviewStep2Base = z.object(step2Shape);
type ReviewStep2 = z.infer<typeof ReviewStep2Base>;

function validateStep2(data: ReviewStep2, ctx: z.RefinementCtx) {
  if (data.quoteRequired && data.quoteAmount === undefined) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['quoteAmount'],
      message: '견적 금액을 입력해 주세요.',
    });
  }

  if (!data.discountGuideReceived && !data.notReceivedReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['notReceivedReason'],
      message: '안내받지 못한 사유를 입력해 주세요.',
    });
  }
}

// 방문 인증 step을 거치는 흐름에서만 영수증을 필수로 검사한다.
// 수정 모드는 이미 인증을 마친 리뷰라 영수증 step 자체를 건너뛰므로
// 최종 ReviewSchema에는 min(1)을 두지 않는다.
export const ReviewStep1Schema = z.object({
  receipts: ReceiptListSchema.min(1),
});
export const ReviewStep2Schema = ReviewStep2Base.superRefine(validateStep2);
export const ReviewStep3Schema = z.object(step3Shape);

export const ReviewSchema = z
  .object({
    ...step1Shape,
    ...step2Shape,
    ...step3Shape,
  })
  .superRefine((data, ctx) => validateStep2(data, ctx));
```

폼 내부에서도 `visibility`처럼 의미가 있는 enum을 유지하면 boolean의 `true`가 공개인지 숨김인지 다시 해석할 필요가 없다. API가 boolean을 요구한다면 제출 직전 Transfer 함수에서 바꾼다.

```ts
function toReviewRequest(form: ReviewForm): ReviewRequest {
  const { visibility, ...rest } = form;
  return {
    ...rest,
    hideAffiliation: visibility === 'HIDDEN',
  };
}
```

## custom input은 Controller 경계에서 연결하기

```tsx
function PaymentAmountField() {
  const { control } = useFormContext<ReviewStep2>();

  return (
    <Controller
      control={control}
      name="paymentAmount"
      render={({ field, fieldState }) => (
        <PriceInput
          value={field.value}
          onChange={field.onChange}
          errorMessage={fieldState.error?.message}
        />
      )}
    />
  );
}
```

custom input의 value와 error를 RHF에 연결하는 코드는 `Controller` 안에서 끝난다. component가 store와 검증 함수를 각각 알 필요가 없다.

## 퍼널은 화면 선택보다 history를 맡긴다

```tsx
const [draft, setDraft] = useState<Partial<ReviewForm>>(initialValues ?? {});

const funnel = useFunnel<{
  first: object;
  second: object;
  third: object;
}>({
  id: 'review-write',
  initial: { step: 'first', context: {} },
});

return (
  <funnel.Render
    first={() => (
      <ReviewStepForm
        schema={ReviewStep1Schema}
        defaultValues={draft}
        onSubmit={(values) => {
          setDraft((current) => ({ ...current, ...values }));
          funnel.history.push('second');
        }}
      >
        <ReceiptStep />
      </ReviewStepForm>
    )}
    second={() => (
      <ReviewStepForm
        schema={ReviewStep2Schema}
        defaultValues={draft}
        onSubmit={(values) => {
          setDraft((current) => ({ ...current, ...values }));
          funnel.history.push('third');
        }}
      >
        <HospitalInfoStep />
      </ReviewStepForm>
    )}
    third={() => (
      <ReviewStepForm
        schema={ReviewStep3Schema}
        defaultValues={draft}
        onSubmit={(values) => {
          const completed = ReviewSchema.parse({ ...draft, ...values });
          submitReview(completed);
        }}
      >
        <ReviewContentStep />
      </ReviewStepForm>
    )}
  />
);
```

핵심은 `switch`를 없앤 사실이 아니라 이전, 다음, replace 같은 이동이 history API로 드러난 점이다. 각 step은 자기 schema만 알며, step을 통과한 값은 상위 draft에 합친다. 최종 제출 직전에는 `ReviewSchema.parse({ ...draft, ...values })`로 전체 규칙을 다시 확인한다.

## 수정 데이터는 폼을 만들기 전에 준비한다

React Hook Form의 `defaultValues`는 첫 생성 시점을 기준으로 캐시된다. 수정용 review data가 비동기로 늦게 도착한다면 첫 렌더에 빈 값을 넣고 끝내면 안 된다.

이 화면에서는 query가 준비된 뒤 퍼널을 mount하도록 Suspense 경계를 사용한다.

```tsx
function ReviewEditPage() {
  const { data } = useSuspenseQuery(reviewDetailOptions());
  return <ReviewWriteFunnel initialValues={toReviewForm(data)} />;
}
```

Suspense를 쓰지 않는 화면이라면 데이터가 도착했을 때 `reset(nextValues)`을 명시적으로 호출해야 한다.

## 결과와 남은 비용

이 구조로 바꾸면서 확인 가능한 변화는 다음과 같다.

- 리뷰 작성용 Zustand store를 제거했다.
- component에 흩어져 있던 조건부 검증을 step schema로 옮겼다.
- 화면 전환과 form validation을 분리했다.
- step별 schema와 최종 schema가 같은 field 정의와 refinement 함수를 사용한다.

반면 step마다 form instance를 만들면 이전 단계 값을 합치고 복원하는 코드가 필요하다. 이미지처럼 browser object를 포함한 값은 URL 직렬화만으로 history를 복원하기 어렵다. 3단계라고 해서 항상 funnel library가 필요한 것도 아니다. 단계 이동과 context 복원이 단순하다면 local state가 더 작을 수 있다.

이번 리팩터링에서 중요한 것은 RHF, Zod, useFunnel을 한꺼번에 도입한 사실이 아니다. 값, 검증, 이동이 서로 다른 이유로 바뀐다는 점을 코드 구조에도 그대로 반영한 것이다.
