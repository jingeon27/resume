# 38개 필드로 구성된 프로그램 폼을 타입과 변환 계층으로 나눈 과정

프로그램 등록 폼에는 기본 정보와 상세 템플릿을 합쳐 38개가 넘는 필드가 있었다. 필드가 많아서만 어려운 것은 아니었다. 같은 폼을 Back-Office와 병원 관리자가 공유했고, API 응답과 편집 화면의 모양도 달랐다. 하위 시술을 바꾸면 이미 입력한 값 일부를 새 템플릿으로 교체해야 했다.

- API 응답은 중첩 객체지만 폼은 편집하기 쉬운 배열과 toggle 값을 사용했다.
- Back-Office와 병원 관리자 두 앱이 공통 필드를 공유하면서 각자 전용 필드도 가졌다.
- 하위 시술을 바꾸면 추천 대상과 시술 특징을 폼에 가져와야 했다.
- Ant Design Form의 `NamePath`와 일부 API가 느슨해 필드 오타가 런타임까지 남았다.

처음에는 공통 Form Item을 늘려 해결했지만, 타입 단언과 변환 코드가 호출부마다 퍼졌다. 이후 수정 이유가 다른 네 부분으로 나눴다.

1. `createTypedForm`: 필드 경로와 값의 타입
2. 앱별 폼 모델: 공통 필드와 전용 필드
3. 변환 계층: API 모델과 폼 모델 사이의 변환
4. 동기화 컴포넌트: 하위 시술 변경에 따른 값 갱신

## Ant Design Form의 필드 경로를 타입으로 제한하기

Ant Design Form은 자체적으로 제네릭을 지원하지만 중첩된 `NamePath`와 `setFieldValue`를 여러 컴포넌트에서 사용하면 타입이 쉽게 느슨해졌다. 그래서 단언을 호출부마다 반복하지 않고 작은 어댑터 안에 모았다.

```ts
type FieldLeaf =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | File;

type Prev = [never, 0, 1, 2, 3, 4, 5];

type ArrayPaths<T, Depth extends number = 5> =
  [Depth] extends [never]
    ? never
    : T extends FieldLeaf
      ? []
      : T extends readonly (infer Item)[]
        ? [] | [number, ...ArrayPaths<Item, Prev[Depth]>]
        : {
            [Key in Extract<keyof T, string>]-?:
              | []
              | [Key, ...ArrayPaths<T[Key], Prev[Depth]>];
          }[Extract<keyof T, string>];

export type FieldNamePath<T> =
  | Extract<keyof T, string>
  | Exclude<ArrayPaths<T>, []>;
```

`createTypedForm<T>()`은 Ant Design Form을 감싸고 `Item`, `List`, `useForm`, `useWatch`, `useFormInstance`가 받는 `name` 경로를 같은 `T` 기준으로 좁힌다. 팩토리 본체는 antd 원본을 그대로 감싸되 `name` 계열 타입만 `FieldNamePath`로 바꾸는 것이 전부다.

```tsx
export function createTypedForm<Values extends object>() {
  type Path = FieldNamePath<Values>;

  function Item<P extends Path>(props: Omit<FormItemProps, 'name'> & { name: P }) {
    // antd FormItemProps['name']은 넓은 NamePath라 단언은 여기 한 번으로 끝낸다.
    return <Form.Item {...props} name={props.name as FormItemProps['name']} />;
  }

  function List<P extends Path>(props: Omit<FormListProps, 'name'> & { name: P }) {
    return <Form.List {...props} name={props.name as FormListProps['name']} />;
  }

  const useForm = () => Form.useForm<Values>();
  const useWatch = <P extends Path>(name: P, form?: FormInstance<Values>) =>
    Form.useWatch(name as NamePath, form);
  const useFormInstance = () => Form.useFormInstance<Values>();

  return { Item, List, useForm, useWatch, useFormInstance };
}
```

사용하는 쪽에서는 폼 타입 하나로 팩토리를 만들고, 반환된 adapter만 쓴다.

```ts
interface ProgramFormValues {
  programName: string;
  highlights: Array<{
    title: string;
    image: UploadFile[];
  }>;
}

const ProgramForm = createTypedForm<ProgramFormValues>();

<ProgramForm.Item name="programName" />;
// OK

<ProgramForm.Item name={['highlights', 0, 'title']} />;
// OK — 중첩 배열 경로도 좁혀진다

<ProgramForm.Item name="progamName" />;
// 컴파일 오류 — 오타를 사용하는 지점에서 바로 잡는다
```

adapter 내부에는 Ant Design의 넓은 타입과 연결하기 위한 단언이 남는다. 대신 그 비용을 한 파일에 가두고 실제 FormItem과 helper에서는 잘못된 field path를 바로 발견한다. 다만 이 팩토리가 좁히는 것은 어디까지나 `name` 경로다. `getFieldValue`의 반환 타입은 여전히 antd의 넓은 타입이라, 반환값까지 경로 기준으로 좁히려면 `useForm` 반환을 한 번 더 재타이핑하는 래핑이 필요하다. 그 작업은 후속 과제로 남겼다.

## 공통 필드와 앱 전용 필드 나누기

두 앱이 같은 폼 컴포넌트를 사용해도 제출 방식까지 같지는 않았다.

```ts
interface ProgramFormCommon {
  programName: string;
  departmentId: number;
  treatmentId: number;
  treatmentSubId: number;
  detailTemplateType: 'NONE' | 'TEMPLATE' | 'CUSTOM_IMAGE';
  recommendedTargets: Array<{ title: string }>;
}

interface CmsProgramForm extends ProgramFormCommon {
  labels: Array<{ id: number; name: string }>;
  memo?: string;
}

interface HospitalProgramForm extends ProgramFormCommon {
  inspectionType: 'CREATE' | 'UPDATE';
}
```

공유 패키지의 FormItem은 `ProgramFormCommon`만 알고, 각 앱의 컨테이너는 확장 타입과 제출 동작을 가진다. 공통 UI를 공유한다는 이유로 Back-Office 전용 검수 상태까지 패키지에 올리지는 않았다.

## 서버 모델과 폼 모델 사이에 변환 계층 두기

API와 form이 원하는 모양은 달랐다.

```text
API response
  -> serverToForm
  -> 폼 값
  -> formToRequest
  -> API request
```

예를 들어 서버 이미지 객체는 Ant Design `UploadFile[]`로 바뀌고, 상세 template은 `orderNo`로 정렬된 편집 배열이 된다.

```ts
// toggle 변환 규칙만 떼어 낸 예시다. 아래 serverToForm 예제에는
// toggle 필드를 생략했지만, 실제 변환에서는 배열 필드마다 이 함수를 거친다.
function hasProvidedValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
}

function toToggle(value: unknown): 'NONE' | 'PROVIDED' {
  return hasProvidedValue(value) ? 'PROVIDED' : 'NONE';
}

function toUploadFile(asset: ServerAsset): UploadFile {
  return {
    uid: String(asset.id),
    name: asset.fileName,
    status: 'done',
    url: asset.src,
    response: asset,
  };
}

function serverToForm(response: ProgramResponse): ProgramFormCommon {
  const targets = [...(response.templates.recommendedTargets ?? [])]
    .sort((a, b) => a.orderNo - b.orderNo)
    .map(({ title }) => ({ title }));

  return {
    programName: response.name,
    departmentId: response.departmentId,
    treatmentId: response.treatmentId,
    treatmentSubId: response.treatmentSubId,
    detailTemplateType: response.detailTemplateType,
    recommendedTargets: targets,
  };
}
```

처음에 `isNil(value)`만 확인하던 toggle 변환은 빈 배열을 `PROVIDED`로 처리하는 버그가 있었다. 배열은 길이까지 확인해야 "항목 없음"을 정확히 표현할 수 있다.

제출 방향은 form 전용 필드를 제거하고 API가 요구하는 순서를 다시 만든다.

```ts
function formToRequest(form: ProgramFormCommon): ProgramRequest {
  return {
    name: form.programName,
    departmentId: form.departmentId,
    treatmentId: form.treatmentId,
    treatmentSubId: form.treatmentSubId,
    templates: {
      recommendedTargets: form.recommendedTargets.map((item, index) => ({
        title: item.title,
        orderNo: index,
      })),
    },
  };
}
```

두 함수는 순수 함수이므로 최소한 다음 성질을 테스트할 수 있다.

```ts
it('서버 응답을 form으로 바꾼 뒤 핵심 값을 잃지 않는다', () => {
  const form = serverToForm(serverFixture);
  const request = formToRequest(form);

  expect(request.name).toBe(serverFixture.name);
  expect(request.templates.recommendedTargets).toHaveLength(
    serverFixture.templates.recommendedTargets.length,
  );
});
```

전체 객체가 완전히 같은 round trip일 필요는 없다. 서버가 생성하는 ID처럼 form이 보존할 필요 없는 값은 제외하고, 순서, 이미지 ID, toggle처럼 손실되면 안 되는 규칙을 검증한다.

## 비동기 초기값은 폼을 마운트하기 전에 준비하기

Ant Design Form의 `initialValues`는 마운트한 뒤 props가 바뀌어도 자동으로 다시 적용되지 않는다. 따라서 상세 query가 준비되기 전에 빈 폼부터 만들지 않았다.

```tsx
function ProgramEditContainer() {
  const { data } = useSuspenseQuery(programDetailOptions());
  const initialValues = serverToForm(data);

  return <ProgramEditForm initialValues={initialValues} />;
}
```

Suspense를 사용하지 않는다면 query 완료 시점에 `form.setFieldsValue`를 호출하고, 사용자가 이미 수정한 값을 덮지 않는 정책을 별도로 정해야 한다.

## 하위 시술 변경에 따른 작업을 한곳에 모으기

하위 시술을 사용자가 바꾸면 시술에 저장된 template을 프로그램 폼으로 가져온다. 초기 상세 조회가 채운 ID에는 template을 다시 적용하지 않고, 사용자가 시술을 직접 바꾼 경우에만 적용하도록 `isFieldTouched`를 확인했다.

```tsx
function SyncTreatmentTemplate() {
  const form = ProgramForm.useFormInstance();
  const treatmentSubId = ProgramForm.useWatch('treatmentSubId', form);

  const { data } = useQuery({
    ...treatmentSubDetailOptions(treatmentSubId),
    enabled: treatmentSubId !== undefined,
  });

  useEffect(() => {
    if (!form.isFieldTouched('treatmentSubId')) return;
    if (!data || treatmentSubId === undefined) return;

    form.setFieldValue(
      'recommendedTargets',
      // 시술 상세 endpoint는 recommendedTargets를 string[]로 내려준다.
      // 프로그램 상세의 { title, orderNo }[]와 모양이 다르다.
      data.recommendedTargets.map((title) => ({ title })),
    );
  }, [data, form, treatmentSubId]);

  return null;
}
```

이 구현에는 한계가 있다. `isFieldTouched`는 한 번 수정한 뒤 계속 `true`이므로 같은 query가 다시 조회되면 사용자가 고친 템플릿 값을 덮을 수 있다. 다시 구현한다면 query 변화를 지켜보는 effect 대신 select의 `onChange`에서 템플릿 적용 함수를 호출하겠다. 사용자가 하위 시술을 바꾼 시점에만 값을 갱신하는 편이 동작을 이해하기 쉽다.

이후 필드 경로 오타와 잘못된 값은 `createTypedForm` 사용처에서 바로 확인할 수 있었고, API 모양이 바뀌면 변환 함수부터 살펴보게 됐다. 두 앱은 Form Item을 공유하지만 검수와 제출 흐름까지 억지로 맞추지는 않았다.

비용도 남았다. 재귀 경로 타입은 계산량 때문에 깊이를 5단계로 제한했고, API와 폼이 함께 바뀌면 양방향 변환 함수도 모두 수정해야 한다. 복잡도를 없앴다기보다 타입, 변환, 동기화 중 어디에서 각각의 복잡도를 다룰지 정한 작업이었다.
