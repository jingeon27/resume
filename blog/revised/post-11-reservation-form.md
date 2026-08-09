# 예약 폼의 작성 상태를 한 곳에서 관리하도록 바꾼 과정: Zustand에서 React Hook Form으로

> 회사·서비스 이름과 내부 사용자 정의 식별자는 역할 중심의 가명으로 바꿨다. 예제의 필드명도 공개용으로 일반화했으며, 상태 구조·검증 조건·수치는 실제 변경을 기준으로 한다.

고객용 서비스의 예약 폼은 날짜와 시간을 고르고 예약할 가족을 선택하는 화면이다. 화면만 보면 단순하지만 상태의 출처는 세 군데로 나뉘어 있었다.

- 서버에서 가져온 가족 목록은 React Query 캐시에 있었다.
- 예약 대상과 날짜는 Zustand 스토어에 다시 저장했다.
- 사용자가 방금 고른 날짜는 컴포넌트의 로컬 상태에도 있었다.

같은 의미의 값이 여러 곳에 있으니 한쪽을 바꿀 때마다 나머지를 맞춰야 했다. 이 글은 서버 상태와 폼 상태의 소유권을 다시 나눈 과정이다. 라이브러리 교체는 그 과정에서 택한 수단이었다.

## 기존 구조에서 복잡도가 생긴 이유

기존 스토어는 폼 값과 검증 결과를 함께 저장했다.

```ts
type BookingDraftStore = {
  form: Partial<BookingFormValues>;
  isValid: boolean;
  updateParticipant: (
    memberId: number,
    values: Partial<ParticipantDraft>,
  ) => void;
  applyScheduleToAll: (date: string, time: string) => void;
};
```

모든 액션이 끝날 때마다 검증을 수동으로 다시 실행해야 했다.

```ts
updateParticipant: (memberId, values) =>
  set((state) => {
    // 값 수정
    state.isValid = validateDraft(state.form);
  });
```

검증 호출을 빠뜨리면 값은 최신인데 버튼의 활성화 상태는 이전 값에 머물렀다. 가족을 추가하거나 삭제할 때는 React Query 캐시와 Zustand 배열도 함께 갱신해야 했다.

```text
서버 API
  -> React Query 가족 목록
  <-> Zustand 예약 대상
  <-> local state 날짜
```

Zustand 자체보다 서버에서 온 값과 사용자가 작성 중인 값을 두 저장소가 함께 소유하는 구조가 복잡도를 키웠다.

## 상태의 역할을 다시 나누기

리팩터링 후에는 역할을 다음처럼 정했다.

- React Query: 서버에서 받은 가족 목록
- React Hook Form: 제출 전까지 사용자가 편집하는 예약 값
- Zod: 제출 가능한 값의 조건
- 로컬 상태: 드로어의 열림 여부처럼 제출 데이터와 무관한 UI 상태

```text
서버 API -> React Query -> React Hook Form -> 제출
```

폼의 생명주기는 예약 화면 안에서 끝나므로 별도 전역 스토어를 두지 않고 `FormProvider`를 페이지에 배치했다. 현재 코드는 가족·회원·혜택처럼 초기값에 필요한 쿼리가 끝난 뒤 예약 폼을 마운트한다. 아래 사용자 정의 이름은 모두 공개용 가명이다.

```tsx
function BookingForm({ participants }: BookingFormProps) {
  const methods = useSchemaForm({
    schema: BookingFormSchema,
    defaultValues: {
      preferredDate: undefined,
      preferredTime: undefined,
      participants: participants.map((participant) => ({
        ...participant,
        preferredDate: '',
        preferredTime: '',
      })),
      requestNote: '',
    },
  });

  return (
    <FormProvider {...methods}>
      <ScheduleSection />
      <ParticipantSelector />
      <RequestNoteField />
      <SubmitButton />
    </FormProvider>
  );
}

function BookingPage() {
  const { isLoading: isParticipantLoading } = useQuery(participantOptionsQuery);
  const participants = useBookingParticipants();

  // 실제 화면은 회원·상품·혜택 로딩도 함께 확인한다.
  if (isParticipantLoading) return null;

  return <BookingForm participants={participants} />;
}
```

Zustand 스토어를 비우던 화면별 정리 로직은 없어졌다. 다만 현재 Next.js의 Cache Components는 다른 화면으로 이동해도 이전 라우트를 바로 언마운트하지 않고 숨겨둘 수 있다. 이 경우 RHF 상태도 보존되므로 공용 폼 훅은 화면이 숨겨질 때 실행되는 정리 함수에서 `reset`을 호출해 재진입 시 초기값으로 되돌린다. 초기화 책임이 화면별 스토어 정리에서 공용 폼 생명주기로 이동한 셈이다.

## 검증은 값에서 계산한다

아래 코드는 현재 스키마에서 이 글과 관련된 필드만 추린 것이다.

```ts
const ParticipantSchema = z.object({
  memberId: z.number(),
  name: z.string(),
  selected: z.boolean(),
  preferredDate: z.string().min(1, '희망 날짜를 선택해 주세요.'),
  preferredTime: z.string().min(1, '희망 시간을 선택해 주세요.'),
});

export const BookingFormSchema = z
  .object({
    preferredDate: z.string().min(1, '희망 날짜를 선택해 주세요.'),
    preferredTime: z.string().min(1, '희망 시간을 선택해 주세요.'),
    participants: z
      .array(ParticipantSchema)
      .min(1, '예약 대상이 최소 한 명 이상 있어야 합니다.')
      .default([]),
    requestNote: z.string().max(200).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.participants.some((participant) => participant.selected)) return;

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['participants'],
      message: '예약 대상을 한 명 이상 선택해 주세요.',
    });
  });
```

이제 유효성 값을 Zustand에 별도 저장하지 않고 `formState.isValid`를 읽는다. 에러 위치와 메시지도 같은 스키마에 남는다.

다만 현재 공용 폼 훅(가명 `useSchemaForm`)은 `zodResolver`만 연결할 뿐, `mode` 옵션으로 검증 시점을 강제하지 않는다. 예약 폼 호출부도 `mode: 'onChange'`를 넘기지 않는다. 입력 중에 버튼 상태와 에러를 바로 갱신하려면 호출부에서 `mode`를 정하거나 `setValue`·`trigger` 정책을 함께 정리해야 한다. 이 부분은 현재 구현에 남은 기술 부채다.

## 서버 목록과 폼 배열은 ID로 맞춘다

가족을 추가하거나 삭제하면 서버 목록이 바뀌고, 작성 중인 폼 배열에도 반영해야 한다. 처음에는 배열 길이만 비교해 추가와 삭제를 판별했다. 하지만 한 명을 지우고 한 명을 추가해 전체 길이가 같으면 변경을 놓친다.

그래서 매번 구성원 ID를 기준으로 폼 배열을 맞춘다.

```ts
function useSyncParticipants({
  getValues,
  replace,
  buildParticipant,
  getDefaultSelection,
}: SyncParticipantsParams) {
  const serverParticipants = useBookingParticipants();

  useEffect(() => {
    if (!serverParticipants.length) return;

    const currentById = keyBy(getValues() ?? [], (item) => item.memberId);

    replace(
      serverParticipants.map((base) => {
        const current = currentById[base.memberId];
        const selected =
          current?.selected ?? getDefaultSelection?.(base) ?? base.selected;

        return buildParticipant(base, selected);
      }),
    );
  }, [
    serverParticipants,
    getValues,
    replace,
    buildParticipant,
    getDefaultSelection,
  ]);
}
```

서버 목록은 구성원의 존재와 이름을 결정하고, 폼은 기존 구성원의 선택 여부를 유지한다. 예약용 래퍼의 초기화 함수는 폼에 보관한 공통 희망 날짜와 시간을 각 항목에 붙인다. 현재 서버 목록에는 로그인한 본인이 포함되므로 목록이 준비되기 전의 빈 배열에서는 동기화를 건너뛴다. 향후 빈 목록 자체가 정상 결과가 될 수 있다면 이 가드는 로딩 상태와 빈 결과를 구분하도록 다시 설계해야 한다.

## 날짜 일괄 적용도 폼 안에서 끝낸다

```ts
function ScheduleSection() {
  const { control, setValue } = useFormContext<BookingFormValues>();
  const participants = useWatch({
    control,
    name: 'participants',
  });

  const handleScheduleSelect = (date: string, time: string) => {
    setValue(
      'participants',
      participants.map((participant) => ({
        ...participant,
        preferredDate: date,
        preferredTime: time,
      })),
    );
    setValue('preferredDate', date);
    setValue('preferredTime', time);
  };

  return <SchedulePicker onSelect={handleScheduleSelect} />;
}
```

같은 `name`의 `useFieldArray` 인스턴스를 여러 곳에 두지 않고 동기화 훅 한 곳에서 관리한다. 날짜 선택기는 `replace` 대신 `setValue`로 배열 전체를 갱신한다. 날짜를 로컬 상태와 스토어에 각각 쓰던 흐름도 폼 업데이트로 합쳐졌다. 현재 구현은 `setValue`에 `shouldDirty`·`shouldValidate` 옵션을 넘기지 않는다. 따라서 실시간 검증 정책까지 해결된 것은 아니며, 앞서 언급한 `mode` 설정과 함께 정리해야 한다.

## 결과와 트레이드오프

Git의 리팩터링 전후 스냅샷을 기준으로 예약 대상 선택 컴포넌트(가명 `ParticipantSelector`) 파일은 519줄에서 55줄로 줄었다. 이후 UI 문구와 구조가 바뀌어 현재 파일은 58줄이므로, 55줄은 리팩터링 완료 시점의 수치다. 가족 선택 기능 전체가 464줄 줄어든 것은 아니다. 서버 목록 동기화는 전용 훅으로, 가족 선택 UI는 하위 컴포넌트로 이동했다. 파일 크기보다 중요한 변화는 각 로직의 입력과 출력이 분명해져 한 파일에서 세 저장소를 동시에 맞추지 않게 된 점이다.

React Hook Form으로 옮기면서 생긴 비용도 있다.

- 커스텀 입력 컴포넌트는 `Controller`로 감싸야 한다.
- 서버 목록과 작성 중인 배열을 맞추는 동기화 로직은 여전히 필요하다.
- `setValue`를 사용할 때 검증과 `dirty` 상태를 갱신할지 정해야 하며, 현재 예약 폼은 이를 명시하지 않는다.

동기화 함수에는 최소한 초기화, 추가, 삭제, 같은 개수의 교체, 빈 목록 상황을 검증하는 테스트가 필요하다. 당시 이 부분의 자동화 테스트를 충분히 남기지 못해 후속 과제로 남았다.

Zustand 제거보다 중요한 변화는 소유권을 나눈 점이다. 서버 데이터는 React Query가, 작성 중인 값은 React Hook Form이 맡아 같은 상태를 여러 저장소가 함께 관리하지 않게 했다.
