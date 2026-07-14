# 38필드 프로그램 폼을 타입과 변환 계층으로 나눈 과정

> 이 글은 2026년 6월의 `createTypedForm` 적용과 프로그램 폼 개편을 기준으로 다시 정리했다. 예제의 이름과 데이터는 설명을 위해 단순화했다.

프로그램 등록 폼은 기본 정보와 상세 템플릿을 합쳐 38개 이상의 필드를 다뤘다. 복잡함은 필드 수보다 경계에서 생겼다.

- API 응답은 중첩 객체지만 폼은 편집하기 쉬운 배열과 toggle 값을 사용했다.
- CMS와 병원 관리자 두 앱이 공통 필드를 공유하면서 각자 전용 필드도 가졌다.
- 하위 시술을 바꾸면 추천 대상과 시술 특징을 폼에 가져와야 했다.
- Ant Design Form의 `NamePath`와 일부 API가 느슨해 필드 오타가 런타임까지 남았다.

이 문제를 하나의 거대한 form component에서 풀지 않고 네 경계로 나눴다.

1. `createTypedForm`: 필드 경로와 값의 타입
2. 앱별 form model: 공통 필드와 전용 필드
3. Transfer Layer: API 모델과 form model의 변환
4. 동기화 component: 하위 시술 변경이라는 side effect

## 1. Ant Design Form의 경로를 폼 타입으로 좁히기

Ant Design Form은 자체적으로 generic을 지원하지만 중첩된 `NamePath`와 `setFieldValue`를 여러 component에서 사용할 때 반환 값이 쉽게 느슨해졌다. 그래서 단언을 호출부마다 반복하지 않고 작은 adapter 안에 모았다.

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

## 2. 공통 타입과 앱 전용 타입을 분리하기

두 앱이 같은 form component를 사용한다고 해서 제출 모델까지 같지는 않았다.

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

공유 package의 FormItem은 `ProgramFormCommon`만 알고, 각 app container는 확장 타입과 자기 제출 동작을 가진다. 공통 UI를 공유하기 위해 CMS 전용 검수 상태까지 package에 올리지 않는 것이 기준이었다.

## 3. 서버 모델과 form model 사이에 Transfer Layer 두기

API와 form이 원하는 모양은 달랐다.

```text
API response
  -> serverToForm
  -> form values
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

## 4. 비동기 초기값은 Form mount 전에 준비하기

Ant Design Form의 `initialValues`는 mount 이후 prop이 바뀐다고 자동으로 다시 적용되지 않는다. 따라서 상세 query가 준비되기 전에 빈 form을 먼저 만들지 않았다.

```tsx
function ProgramEditContainer() {
  const { data } = useSuspenseQuery(programDetailOptions());
  const initialValues = serverToForm(data);

  return <ProgramEditForm initialValues={initialValues} />;
}
```

Suspense를 사용하지 않는다면 query 완료 시점에 `form.setFieldsValue`를 호출하고, 사용자가 이미 수정한 값을 덮지 않는 정책을 별도로 정해야 한다.

## 5. 하위 시술 변경 side effect를 한곳에 모으기

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

이 구현에는 한계가 있다. `isFieldTouched`는 한 번 수정한 뒤 계속 `true`이므로, 같은 query가 refetch되면 사용자가 직접 고친 template 값을 다시 덮을 수 있다. 다시 구현한다면 query 변경을 감시하는 effect보다 select의 `onChange`에서 template 적용 command를 직접 호출해 **사용자가 분류를 변경한 사건**과 값 덮어쓰기를 연결하는 편이 더 명확하다.

## 결과와 한계

- field path 오타와 잘못된 value 타입을 form adapter 사용처에서 확인할 수 있게 됐다.
- API 변환이 component의 effect와 submit handler에서 Transfer 함수로 모였다.
- 두 앱의 공통 form item은 공유하면서 검수와 제출 흐름은 각 app에 남겼다.
- 하위 시술 template 상속의 덮어쓰기 조건을 한 component에서 관리했다.

반면 recursive path type은 TypeScript 계산 비용이 있어 깊이를 5단계로 제한했다. Transfer 함수도 API와 form 양쪽이 바뀌면 함께 수정해야 한다. 이 구조가 복잡도를 없애지는 않지만, 타입 경계, 데이터 변환, side effect를 서로 다른 이유로 수정할 수 있게 해줬다.
