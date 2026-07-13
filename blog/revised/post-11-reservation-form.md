# 예약 폼의 상태 소스를 하나로 줄인 과정: Zustand에서 React Hook Form으로

복지몰의 예약 폼은 날짜와 시간을 고르고 예약할 가족을 선택하는 화면이다. 화면만 보면 단순하지만 상태의 출처는 세 군데로 나뉘어 있었다.

- 서버에서 가져온 가족 목록은 React Query cache에 있었다.
- 예약 대상과 날짜는 Zustand store에 다시 저장했다.
- 사용자가 방금 고른 날짜는 component local state에도 있었다.

같은 의미의 값이 여러 곳에 있으니 한쪽을 바꿀 때마다 나머지를 맞춰야 했다. 이 글은 라이브러리를 교체한 이야기보다 **서버 상태와 폼 상태의 소유권을 다시 나눈 과정**에 가깝다.

## 기존 구조에서 복잡도가 생긴 이유

기존 store는 폼 값뿐 아니라 검증 결과도 함께 저장했다.

```ts
type ReservationStore = {
  form: Partial<ReservationForm>;
  isValid: boolean;
  updateFamily: (userId: number, values: Partial<FamilyReservation>) => void;
  updateDateForAll: (date: string, time: string) => void;
};
```

모든 action 끝에서 수동 검증을 다시 실행해야 했다.

```ts
updateFamily: (userId, values) =>
  set((state) => {
    // 값 수정
    state.isValid = checkFormValidation(state.form);
  });
```

검증 호출을 빠뜨리면 값은 최신인데 버튼의 활성화 상태는 이전 값인 상황이 생겼다. 가족을 추가하거나 삭제할 때는 React Query cache와 Zustand 배열도 함께 갱신해야 했다.

```text
서버 API
  -> React Query 가족 목록
  <-> Zustand 예약 대상
  <-> local state 날짜
```

문제는 Zustand 자체가 아니었다. **서버에서 온 값과 사용자가 작성 중인 값을 두 저장소가 함께 소유한 것**이 문제였다.

## 상태의 역할을 다시 나누기

리팩터링 후에는 역할을 다음처럼 정했다.

- React Query: 서버에서 받은 가족 목록
- React Hook Form: 제출 전까지 사용자가 편집하는 예약 값
- Zod: 제출 가능한 값의 조건
- local state: drawer의 열림 여부처럼 제출 데이터와 무관한 UI 상태

```text
서버 API -> React Query -> React Hook Form -> 제출
```

폼의 생명주기는 페이지와 같으므로 별도 전역 store를 두지 않고 `FormProvider`를 페이지에 배치했다.

```tsx
function ReservationPage() {
  const { data: familyReservations } = useSuspenseQuery(
    familySelectionTargetOptions,
  );

  const methods = useZodForm({
    schema: ReservationFormSchema,
    defaultValues: {
      wishedDate: '',
      firstWishedTime: '',
      familyReservations: familyReservations.map((family) => ({
        ...family,
        wishedDate: '',
        firstWishedTime: '',
      })),
      userMessage: '',
    },
  });

  return (
    <FormProvider {...methods}>
      <ReservationDateTimePicker />
      <ReservationPersonSelector />
      <ReservationRequestMessage />
      <ReservationSubmitButton />
    </FormProvider>
  );
}
```

페이지가 unmount되면 폼 상태도 함께 사라진다. store 초기화용 cleanup effect가 필요하지 않다.

## 검증은 값에서 계산한다

```ts
const FamilyReservationSchema = z.object({
  userId: z.number(),
  name: z.string().min(1),
  target: z.boolean(),
  wishedDate: z.string(),
  firstWishedTime: z.string(),
});

export const ReservationFormSchema = z
  .object({
    wishedDate: z.string().min(1, '희망 날짜를 선택해 주세요.'),
    firstWishedTime: z.string().min(1, '희망 시간을 선택해 주세요.'),
    familyReservations: z.array(FamilyReservationSchema),
    userMessage: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.familyReservations.some((family) => family.target)) return;

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['familyReservations'],
      message: '최소 한 명은 예약 대상이어야 합니다.',
    });
  });
```

이제 `isValid`를 별도 상태로 저장하지 않는다. 현재 폼 값으로부터 계산된 `formState.isValid`를 사용한다. 에러 위치와 메시지도 같은 스키마에 남는다.

## 서버 목록과 폼 배열은 ID로 맞춘다

가족을 추가하거나 삭제하면 서버 목록이 바뀌고, 작성 중인 폼 배열에도 반영해야 한다. 처음에는 배열 길이만 비교해 추가와 삭제를 판별했다. 하지만 한 명을 지우고 한 명을 추가해 전체 길이가 같으면 변경을 놓친다.

그래서 길이가 아니라 `userId`를 기준으로 매번 reconcile한다.

```ts
function useSyncFamilyReservations() {
  const { control, getValues } = useFormContext<ReservationForm>();
  const { replace } = useFieldArray({
    control,
    name: 'familyReservations',
  });

  const {
    data: families = [],
    isSuccess,
  } = useQuery(familySelectionTargetOptions);

  useEffect(() => {
    if (!isSuccess) return;

    const currentById = new Map(
      getValues('familyReservations').map((item) => [item.userId, item]),
    );

    replace(
      families.map((family) => {
        const current = currentById.get(family.userId);

        return {
          ...family,
          target: current?.target ?? family.target,
          wishedDate: current?.wishedDate ?? getValues('wishedDate'),
          firstWishedTime:
            current?.firstWishedTime ?? getValues('firstWishedTime'),
        };
      }),
    );
  }, [families, getValues, isSuccess, replace]);
}
```

서버 목록은 구성원의 존재와 이름을 결정하고, 폼은 체크 여부와 희망 날짜처럼 작성 중인 값을 유지한다. 가족 목록이 빈 배열인 경우도 `replace([])`로 반영한다. 로딩 중과 빈 결과를 같은 `[]`로 취급하지 않는 것이 중요하다.

## 날짜 일괄 적용도 폼 안에서 끝낸다

```ts
function ReservationDateTimePicker() {
  const { getValues, setValue } = useFormContext<ReservationForm>();

  const handleSelect = (date: string, time: string) => {
    setValue('wishedDate', date, { shouldDirty: true, shouldValidate: true });
    setValue('firstWishedTime', time, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(
      'familyReservations',
      getValues('familyReservations').map((family) => ({
        ...family,
        wishedDate: date,
        firstWishedTime: time,
      })),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  return <DateTimePicker onSelect={handleSelect} />;
}
```

날짜를 local state와 store에 각각 쓰던 흐름이 폼 업데이트 하나로 합쳐졌다.

## 결과와 트레이드오프

조립 역할을 하던 `ReservationPersonSelector`는 520줄에서 55줄로 줄었다. 다만 복잡도 465줄이 모두 사라진 것은 아니다. 서버 목록 동기화는 전용 hook으로, 가족 선택 UI는 하위 component로 이동했다. 중요한 변화는 각 로직의 입력과 출력이 분명해져 한 파일에서 세 저장소를 동시에 맞추지 않게 된 것이다.

React Hook Form으로 옮기면서 생긴 비용도 있다.

- custom input은 `Controller`로 감싸야 한다.
- 서버 목록과 작성 중인 배열을 맞추는 동기화 로직은 여전히 필요하다.
- `setValue`를 사용할 때 검증과 dirty 상태 갱신 여부를 명시해야 한다.

동기화 함수에는 최소한 초기화, 추가, 삭제, 같은 개수의 교체, 빈 목록을 검증하는 테스트가 필요하다. 당시 이 부분의 자동화 테스트를 충분히 남기지 못한 것은 후속 과제다.

이 리팩터링의 핵심은 Zustand를 없앤 것이 아니다. 서버 데이터는 React Query, 작성 중인 값은 React Hook Form이라는 경계를 세워 **같은 상태를 여러 저장소가 소유하지 않게 만든 것**이다.
