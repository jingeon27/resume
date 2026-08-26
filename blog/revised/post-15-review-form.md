# 3단계 리뷰 작성 폼의 역할을 RHF·Zod·퍼널로 다시 나눈 과정

리뷰 작성 화면은 세 단계로 이어진다.

1. 방문 인증을 위한 영수증 업로드
2. 시술과 결제 정보 입력
3. 별점, 사진, 리뷰 내용 작성

문제는 단계가 세 개라는 사실이 아니었다. 값용 Zustand와 단계용 Zustand가 따로 있었고, 각 입력 컴포넌트가 검증과 store action까지 알고 있었다. 필드 하나를 추가할 때 값, 오류 문구, 다음 단계 조건을 여러 파일에서 함께 바꿔야 했다.

처음에는 하나의 거대한 폼으로 합치려 했다. 실제로는 단계마다 마운트되는 필드와 검증 시점이 달랐다. 그래서 세 책임만 분리했다.

- 입력값과 필드의 생명주기: React Hook Form
- 검증 규칙: Zod
- 단계와 이동 이력: `@use-funnel/core`를 감싼 공용 퍼널 훅

완성된 구조는 아니다. 전체 스키마 조립은 아직 Zod 내부의 `_def`에 의존하고 최종 제출 직전의 전체 검증도 빠져 있다. 이 제약을 감춘 채 “Zod로 타입 안전한 퍼널을 만들었다”고 쓰고 싶지는 않았다.

## 기존 구조의 문제

```ts
type DraftStore = {
  draft: ReviewDraft;
  setField: <K extends keyof ReviewDraft>(
    key: K,
    value: ReviewDraft[K],
  ) => void;
};

type StepStore = {
  step: number;
  moveForward: () => void;
  moveBack: () => void;
};
```

```tsx
switch (step) {
  case 1:
    return <ProofStep />;
  case 2:
    return <DetailsStep />;
  default:
    return <FeedbackStep />;
}
```

화면 전환과 작성 중인 값이 앱 전역에서 공유돼야 할 이유는 없었다. 임시 저장은 별도 API가 담당하고 있었고, 화면 안에서 이전 단계 값을 보존하는 일은 RHF 폼 인스턴스 사이에서 처리할 수 있었다.

## 단계별 스키마와 전체 스키마의 현재 경계

각 단계에서는 해당 단계의 값만 검증하고, 최종 제출에서는 전체 값을 다시 검증하는 구조가 이상적이다. 현재 구현은 단계별 스키마를 분리했지만 전체 스키마를 조립하는 부분에는 기술 부채가 남아 있다.

아래 코드는 현재 스키마에서 핵심 필드와 추가 검증만 추린 것이다. 사용자 정의 스키마와 필드 이름은 공개용 가명이다.

```ts
import { z } from 'zod';

export const ProofStepSchema = z.object({
  proofFiles: z.array(UploadSchema).min(1).max(5),
});

export const DetailsStepSchema = z
  .object({
    visibilityFlag: z.boolean(),
    items: z.array(ItemSchema).min(1).max(5),
    quoteFieldEnabled: z.boolean().optional(),
    quotedAmount: z.number().optional(),
    paidAmount: z.number().min(1),
    amountFlag: z.boolean().optional(),
    receivedBenefitInfo: z.boolean(),
    missingBenefitReason: z
      .object({
        value: z.enum(MISSING_INFO_REASONS),
        description: z.string(),
      })
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.quoteFieldEnabled && (!data.quotedAmount || data.quotedAmount <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['quotedAmount'],
        message: '금액을 입력해 주세요.',
      });
    }

    if (!data.receivedBenefitInfo && !data.missingBenefitReason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['missingBenefitReason'],
        message: '안내받지 못한 이유를 입력해 주세요.',
      });
    }
  });

export const FeedbackStepSchema = z.object({
  attachments: z.array(UploadSchema),
  ratings: z.array(
    z.object({
      criterion: z.enum(RATING_CRITERIA),
      score: z.number().min(0).max(2),
    }),
  ),
  body: z.string().min(50).max(500),
  wouldRecommend: z.boolean(),
});

export const SubmissionSchema = z
  .object({
    // 방문 인증 단계에서는 min(1)을 쓰지만 전체 스키마에서는 필수가 아니다.
    proofFiles: z.array(UploadSchema).max(5),
  })
  .extend(DetailsStepSchema._def.schema.shape)
  .extend(FeedbackStepSchema.shape);
```

두 번째 단계 스키마의 `superRefine`은 해당 단계 폼에서 실행된다. 그러나 전체 스키마는 `DetailsStepSchema._def.schema.shape`에서 내부 필드 정의를 꺼낸다. `_def`는 Zod의 공개 API가 아니며, 이 방식으로는 `superRefine`도 전체 스키마에 전달되지 않는다. 현재 제출 경로에는 `SubmissionSchema.parse`를 다시 호출하는 단계도 없다. 단계별 검증은 동작하지만, 공개 API로 필드와 추가 검증을 재사용하고 최종 제출에서 전체 규칙을 확인하는 구조는 아직 완성되지 않았다.

방문 인증 단계에서는 증빙 파일을 한 개 이상 요구한다. 다만 이 단계를 건너뛰는 흐름도 있어 전체 `SubmissionSchema`에는 `min(1)`을 두지 않았고, 현재 구현도 이 차이를 반영한다.

폼의 공개 여부도 현재는 의미가 드러나는 열거형 대신 불리언 값을 쓴다. 실제 요청을 만들 때는 다른 필드도 함께 가공하지만, 이 값의 변환만 추리면 다음과 같다.

```ts
function toSubmissionRequest(form: ReviewDraft): SubmissionRequest {
  const { visibilityFlag, ...rest } = form;

  return {
    ...rest,
    visibilityFlag: visibilityFlag
      ? VISIBILITY.Hidden
      : VISIBILITY.Public,
  };
}
```

현재 변환은 동작하지만 `true`가 숨김인지 공개인지 알려면 필드 이름과 변환 코드를 함께 봐야 한다. 폼 내부에서도 `PUBLIC | HIDDEN` 같은 값을 쓰면 해석하기 쉬워지지만, 현재 구현에는 반영되지 않은 후속 개선안이다.

## 커스텀 입력은 `Controller`에서 연결한다

```tsx
function AmountField() {
  const { control } = useFormContext<DetailsStepValues>();

  return (
    <Controller
      control={control}
      name="paidAmount"
      render={({ field: { value, onChange } }) => (
        <NumericInput
          value={value}
          onChange={normalizeNumericInput(onChange)}
        />
      )}
    />
  );
}
```

커스텀 입력의 값과 변경 핸들러를 RHF에 연결하는 코드는 `Controller` 안에서 끝난다. 검증 규칙은 단계 스키마가 맡으므로 컴포넌트가 Zustand 액션과 별도 검증 함수를 모두 알 필요가 없다.

## 퍼널이 단계 이동과 이력을 관리한다

```tsx
const form = useSchemaForm({
  schema: SubmissionSchema,
  defaultValues: savedDraft
    ? mapResponseToDraft(savedDraft.data)
    : emptyDraft,
});

const flow = useStepFunnel<Record<'proof' | 'details' | 'feedback', object>>({
  initial: {
    step: needsProof ? 'proof' : 'details',
    context: {},
  },
  id: 'public-example-flow',
});

const mergeAndReset = useCallback(
  (callback: (data: ReviewDraft) => void) =>
    <T extends Partial<ReviewDraft>>(stepValues?: T) => {
      const mergedDraft = {
        ...form.formState.defaultValues,
        ...stepValues,
      } as ReviewDraft;

      form.reset(mergedDraft);
      callback(mergedDraft);
    },
  [form],
);

const moveToStep = useCallback(
  (step: typeof flow.step) =>
    mergeAndReset(() => flow.history.replace(step)),
  [mergeAndReset, flow],
);

const confirmSubmission = mergeAndReset((data) =>
  openConfirmDialog({
    primaryAction: {
      text: '제출',
      onConfirm: () => submitDraft(data),
    },
  }),
);

return (
  <flow.Render
    proof={() => (
      <StepForm
        schema={ProofStepSchema}
        defaultValues={form.formState.defaultValues}
        onComplete={moveToStep('details')}
      >
        <ProofStep />
      </StepForm>
    )}
    details={() => (
      <StepForm
        schema={DetailsStepSchema}
        defaultValues={form.formState.defaultValues}
        onBack={needsProof ? moveToStep('proof') : undefined}
        onComplete={moveToStep('feedback')}
      >
        <DetailsStep />
      </StepForm>
    )}
    feedback={() => (
      <StepForm
        schema={FeedbackStepSchema}
        defaultValues={form.formState.defaultValues}
        onBack={moveToStep('details')}
        onComplete={confirmSubmission}
      >
        <FeedbackStep needsProof={needsProof} />
      </StepForm>
    )}
  />
);
```

단계 폼 래퍼(가명 `StepForm`)는 단계마다 `mode: 'all'`인 폼 인스턴스를 만들고 해당 단계 스키마를 검증한다. 통과한 값은 상위 RHF 인스턴스의 `defaultValues`와 합친 뒤 `reset`해 다음 단계의 초기값으로 쓴다. 단계 이동은 퍼널의 `history.replace`로 표현한다. 퍼널 `context`에 폼 값을 넣거나 `history.push`로 단계별 스냅샷을 쌓지는 않는다.

세 번째 단계도 같은 방식으로 값을 합쳐 확인 대화상자와 API 요청에 전달한다. 이 경로에는 명시적인 `SubmissionSchema.parse`가 없다. 앞 단계에서 검증한 값이 그대로 유지된다는 전제에 기대고 있어 최종 전체 검증은 남은 과제다.

## 수정 데이터는 폼을 만들기 전에 준비한다

React Hook Form의 `defaultValues`는 처음 생성될 때 캐시된다. 수정용 리뷰 데이터가 비동기로 늦게 도착하는 경우 첫 렌더링에 빈 값을 넣고 끝내서는 안 된다.

현재 화면은 `useQueries`로 예약 정보와 리뷰 정보를 함께 요청하고, 두 로딩이 끝난 뒤 퍼널을 마운트한다.

```tsx
function ReviewEditorPage() {
  const { sourceId, draftId } = useParams<EditorRouteParams>();
  const [
    { data: sourceInfo, isLoading: isSourceLoading },
    { data: savedDraft, isLoading: isDraftLoading },
  ] = useQueries({
    queries: [
      sourceByIdQuery(toOptionalNumber(sourceId)),
      draftByIdQuery(toOptionalNumber(draftId)),
    ],
  });

  if (isSourceLoading || isDraftLoading) return null;

  return (
    <ReviewFlow
      sourceInfo={sourceInfo}
      savedDraft={savedDraft}
    />
  );
}
```

두 요청이 끝날 때까지 기다리므로 응답을 폼 값으로 바꾸는 변환 함수가 만든 수정값이 첫 `defaultValues`에 들어간다. Suspense는 사용하지 않는다. 대신 마운트 시점을 늦춰 비동기 데이터가 오기 전에 빈 폼이 만들어지는 것을 피한다.

## 바뀐 부분과 남아 있는 문제

- 리뷰 작성용 Zustand 스토어를 제거했다.
- 컴포넌트에 흩어져 있던 조건부 검증을 단계별 스키마로 옮겼다.
- 화면 전환과 폼 검증을 분리했다.
- 각 단계가 자신에게 필요한 스키마로 제출 가능 여부를 판단한다.

단계마다 폼 인스턴스를 만들기 때문에 `defaultValues`를 합치고 `reset`하는 코드는 여전히 필요하다. 현재 전체 스키마 조립은 Zod 내부 `_def`에 의존하고 2단계의 추가 검증을 보존하지 않으며, 최종 제출 직전의 전체 `parse`도 없다. 이 경로를 보장하는 스키마·퍼널 자동화 테스트 역시 충분하지 않다.

이미지처럼 브라우저 객체를 포함한 값은 URL 직렬화만으로 이동 이력을 복원하기 어렵다. 3단계라는 이유만으로 퍼널 라이브러리가 필요한 것은 아니다. 현재 구현처럼 `context`를 비워 두고 `replace`만 사용한다면 로컬 상태나 명시적인 리듀서가 더 단순한지도 비교할 필요가 있다.

두 Zustand store를 없앤 것보다 각 단계가 자기 필드와 검증만 알게 된 점이 더 유용했다. 반면 `_def` 의존과 최종 전체 검증 부재는 그대로다. 지금 다시 손댄다면 먼저 전체 스키마의 공개 API를 만들고, 마지막 제출이 모든 단계의 값을 다시 검사하는 테스트부터 추가할 것이다.
