# 38개 필드로 구성된 프로그램 폼을 타입과 변환 계층으로 나눈 과정

병원 관리자의 프로그램 폼은 최상위 필드만 세도 38개다. Back-Office의 같은 폼은 47개이고, 그중 34개를 두 앱이 함께 쓴다(2026-09-29 develop 기준). 필드가 많아서만 어려운 것은 아니었다.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/01-form-anatomy.png" alt="프로그램 드로어를 다시 그린 그림. 오른쪽 폼은 CMS 설정, 기본 정보, 검진 구성, 상세 이미지 네 구획이고 입력마다 담기는 필드 이름을 적었다. 왼쪽에는 미리보기와 상세 폼·검수 폼이 쓰이는 화면을, 아래에는 앱마다 화면 밖에서 담는 값과 최상위 필드 수(공통 34, Back-Office 47, 병원 관리자 38)를 두었다" />
  <figcaption>프로그램 드로어의 구획과 각 입력이 담기는 폼 필드를 짝지었다. 회색은 두 앱이 공유하는 IProgramFormCommon이고, 파란색과 갈색은 각 앱 전용 필드다. 예약금·검진 구성과 노출예정일은 상세 폼과 검수 폼 중 한쪽에만 있다.</figcaption>
</figure>

드로어는 위에서부터 Back-Office만 쓰는 'CMS 설정' 구획, 기본 정보, 검진 프로그램일 때만 나오는 검진 구성, 상세 이미지 순서다. 상세 이미지 유형을 제공 템플릿으로 고르면 추천 대상부터 주의사항까지 일곱 섹션이 각각 노출 토글과 목록 한 쌍으로 펼쳐진다. 그중 다섯 섹션은 '제공 / 해당없음' 토글을 달고, 하위 시술을 바꾸면 시술에 저장된 값으로 채워진다(↻). 추가 혜택과 시술 전후 사진의 토글은 '직접입력 / 해당없음'이다. 같은 틀을 두 폼이 나눠 쓴다. 상세 폼은 Back-Office의 등록·상세·수정 화면과 병원 관리자의 상세(수정·삭제 요청) 화면에, 검수 폼은 두 앱의 검수 상세와 병원 관리자의 신규 등록 화면에 쓰인다.

이 폼을 다루기 어렵게 만든 조건은 다섯 가지였다.

- Ant Design(antd) Form의 `NamePath`와 일부 API가 느슨해 필드 오타가 런타임까지 남았다.
- Back-Office와 병원 관리자 두 앱이 공통 필드를 공유하면서 각자 전용 필드도 가졌다.
- Back-Office의 하위 시술 템플릿 편집 폼도 추천 대상·특장점·장비·과정·주의사항 입력을 따로 갖고 있었다.
- API 응답은 중첩 객체지만 폼은 편집하기 쉬운 배열과 토글 값을 사용했다.
- 하위 시술을 바꾸면 그 시술에 저장된 추천 대상·시술 특장점·장비·과정·주의사항을 폼에 가져와야 했다.

처음에는 공통 FormItem을 늘려 해결했지만, 변환 코드와 그 안의 타입 단언이 API 흐름마다 복제됐고 필드 이름은 이름 상수로만 맞췄다. 그래서 바뀌는 이유가 서로 다른 다섯 부분으로 나눴다.

1. `createTypedForm`: 필드 경로와 값의 타입
2. 앱별 폼 모델: 공통 필드와 전용 필드
3. 템플릿 입력: 하위 시술 템플릿 편집 폼과 함께 쓰는 compound FormItem
4. 변환 계층: API 모델과 폼 모델 사이의 변환
5. 동기화 컴포넌트: 하위 시술 변경에 따른 값 갱신

아래 코드는 2026-09-29 develop에서 옮기되 줄였고, 병원을 가리키는 식별자는 `partner`로 바꿔 적었다.

## Ant Design Form의 필드 경로를 타입으로 제한하기

antd Form은 자체적으로 제네릭을 지원하지만 중첩된 `NamePath`와 `setFieldValue`를 여러 컴포넌트에서 사용하면 타입이 쉽게 느슨해졌다. 그래서 단언을 호출부마다 반복하지 않고 작은 어댑터 안에 모았다.

```ts
type TFieldLeaf = string | number | boolean | bigint | symbol | null | undefined | Date | File;

type TPrev = [never, 0, 1, 2, 3, 4, 5];

// T 안에서 유효한 배열 경로를 모두 만든다(재귀 깊이 5단계 제한)
type TArrayPaths<T, Depth extends number = 5> = [Depth] extends [never]
  ? never
  : T extends TFieldLeaf
    ? []
    : T extends readonly (infer E)[]
      ? [] | [number, ...TArrayPaths<E, TPrev[Depth]>]
      : {
          [K in Extract<keyof T, string>]-?: [] | [K, ...TArrayPaths<T[K], TPrev[Depth]>];
        }[Extract<keyof T, string>];

export type TFieldNamePath<T> = Extract<keyof T, string> | Exclude<TArrayPaths<T>, []>;

// 경로 P가 가리키는 값의 타입
export type TPathValue<T, P> = P extends keyof T
  ? T[P]
  : P extends readonly [infer K, ...infer Rest]
    ? K extends keyof T
      ? Rest extends []
        ? T[K]
        : TPathValue<T[K], Rest>
      : never
    : never;
```

`createTypedForm<T>()`은 antd Form을 감싼 compound 컴포넌트를 돌려준다. `Form` 자신에 `Item`, `List`, `useForm`, `useFormInstance`, `useWatch`가 붙은 모양이다. 필드 경로를 받는 자리, 곧 `Item`·`List`·`useWatch`의 `name`(`Item`은 `dependencies`까지)과 폼 인스턴스의 `getFieldValue`·`setFieldValue`·`getFieldError`는 `TFieldNamePath<T>`로 좁혀진다. `getFieldValue`·`useWatch`가 돌려주는 값과 `setFieldValue`가 받는 값은 `TPathValue<T, P>`로 좁혀지고, `Form` 자신은 `initialValues`를 `TDeepPartial<T>`로, `onFinish`의 값을 `T`로 받는다. 런타임에는 antd 원본을 그대로 부르고, 바꾸는 것은 타입뿐이다.

```tsx
export interface ITypedFormInstance<T>
  extends Omit<
    FormInstance<T>,
    'getFieldValue' | 'getFieldsValue' | 'getFieldError' | 'setFieldValue' | 'setFieldsValue'
  > {
  getFieldValue: <P extends TFieldNamePath<T>>(name: P) => TPathValue<T, P>;
  getFieldsValue: () => T;
  getFieldError: (name: TFieldNamePath<T>) => string[];
  setFieldValue: <P extends TFieldNamePath<T>>(name: P, value: TPathValue<T, P> | undefined) => void;
  setFieldsValue: (values: TDeepPartial<T>) => void;
}

export function createTypedForm<T extends object>(): TTypedForm<T> {
  function useForm(): [ITypedFormInstance<T>] {
    // antd 타입과 잇는 `as unknown as` 단언은 이 파일 안에만 둔다
    return Form.useForm<T>() as unknown as [ITypedFormInstance<T>];
  }

  function useWatch<P extends TFieldNamePath<T>>(name: P, form: ITypedFormInstance<T>) {
    return Form.useWatch(name as never, form as unknown as FormInstance<T>) as TPathValue<T, P> | undefined;
  }

  function Item(props: ITypedFormItemProps<T>) {
    return createElement(Form.Item, props as unknown as FormItemProps);
  }

  // Form 자신(TypedFormComponent)과 List, useFormInstance도 같은 방식으로 감싼다
  return Object.assign(TypedFormComponent, { Item, List, useForm, useFormInstance, useWatch }) as unknown as TTypedForm<T>;
}
```

사용하는 쪽에서는 폼 타입 하나로 `createTypedForm`을 호출해 폼을 만든다. 이하 이렇게 만든 폼을 typed form이라고 부른다.

```tsx
export const ProgramForm = createTypedForm<IProgramFormCommon>();

<ProgramForm.Item name="programName" />;
// OK

<ProgramForm.Item name={['recommendedTarget', 0, 'title']} />;
// OK — 중첩 배열 경로도 이름은 검사된다

<ProgramForm.Item name="progamName" />;
// 컴파일 오류 — 오타를 사용하는 지점에서 바로 잡는다

const form = ProgramForm.useFormInstance();
form.getFieldValue('treatmentSubId');
// number — 반환값도 경로 기준으로 좁혀진다(아직 비어 있을 때의 undefined는 타입에 없다)
```

어댑터 내부에는 antd의 넓은 타입과 잇기 위한 단언(`as unknown as`)이 남는다. 그 비용을 어댑터에 모아 두고, 실제 FormItem과 헬퍼에서는 잘못된 필드 경로와 최상위 값의 타입을 바로 확인한다. 좁혀지지 않는 곳도 남았다.

- 중첩 경로의 값 타입은 좁혀지지 않는다. `TPathValue`는 경로 중간의 배열이 optional이거나 `null`을 허용하면 `never`가 되는데, 이 폼의 배열 필드는 모두 그렇다. 그래서 목록 항목의 값은 antd `useWatch`와 `getFieldValue`로 읽는다.
- `Form.List` 안의 상대 경로(`name={[field.name, 'title']}`)는 루트 타입으로 표현되지 않아 antd `Form.Item`을 그대로 쓴다. 하위 시술 템플릿 편집 폼과 같이 쓰는 템플릿 입력(추천 대상 등)도 antd Form과 이름 상수로 남아 있다.
- 빈 경로(`[]`, `''`)도 표현하지 않아서, 폼 전체를 읽는 미리보기와 정가·우대가 교차 검증은 antd를 그대로 쓴다.
- 프로그램 폼을 그리는 래퍼는 antd 기반 폼 컴포넌트를 써서, 앱마다 `props as FormProps` 단언이 하나씩 있다.

## 공통 필드와 앱 전용 필드 나누기

두 앱이 같은 폼 컴포넌트를 사용해도 제출 방식까지 같지는 않았다.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/02-typed-form-layers.png" alt="세 층의 구조도. 맨 위는 name 경로와 값 타입을 좁히는 createTypedForm, 가운데는 공통 필드 34개로 만든 ProgramForm과 그 타입만 아는 공유 FormItem, 아래는 Back-Office(공통 34 + 전용 13)와 병원 관리자(공통 34 + 전용 4)가 각자 정의한 IProgramInspectionClient와 제출 함수다. 맨 아래에 런타임의 폼 인스턴스가 하나라는 설명과 타입이 좁혀지지 않는 곳을 적었다" />
  <figcaption>공유 패키지는 공통 필드 34개만 알고, 앱 전용 필드와 제출 흐름은 각 앱의 typed form과 컨테이너에 남는다.</figcaption>
</figure>

그림은 세 층이다. 공유 UI의 `createTypedForm`, 공유 프로그램 패키지의 `ProgramForm`, 그리고 두 앱이 같은 이름으로 각자 정의한 `IProgramInspectionClient`와 `ProgramInspectionForm`이다. 그림 1의 검수 폼 화면(`ProgramInspectionForm.tsx`)과 이름이 같지만, 여기서 `ProgramInspectionForm`은 상세 폼과 검수 폼의 컨테이너가 모두 인스턴스를 만드는 typed form이다. 병원 관리자 코드는 둘을 함께 쓰는 컨테이너에서 typed form을 `ProgramInspectionTypedForm`이라는 별칭으로 가져온다. 타입은 층마다 다르지만 런타임의 폼 인스턴스는 하나다. 앱 컨테이너가 `ProgramInspectionForm.useForm()`으로 만든 인스턴스를 공유 FormItem은 `ProgramForm.useFormInstance()`로 받아, 공통 필드만 보이는 타입으로 쓴다.

```ts
// 공유 패키지: 두 앱이 같이 쓰는 34개
export interface IProgramFormCommon {
  labels?: { id: number; text: string; type?: TProgramLabelType }[];
  // 기본 정보 12개
  partnerId: number;
  programName: string;
  treatmentSubId: number;
  // ...
  // 상세 이미지 18개
  detailTemplateType: PROGRAM_DETAIL_TEMPLATE_TYPE; // SAFEDOC_TEMPLATE | CUSTOM_IMAGE | CHECKUP_TEMPLATE | NONE
  isRecommended: SAFEDOC_PROVIDED_TYPE;
  recommendedTarget: TBaseTreatmentTemplateItemType; // { image?, title, content? }[] | null | undefined
  // ...
  // 검진 구성 3개 (검진 프로그램에서만 채운다)
  healthCheckDepositAmount?: number | null;
  // ...
}

export const ProgramForm = createTypedForm<IProgramFormCommon>();
```

```ts
// Back-Office 앱: 공통 34개 + 전용 13개
export interface IProgramInspectionClient extends IProgramFormCommon {
  inspectionStatus?: PROGRAM_INSPECTION_STATUS | null;
  rejectReason?: string;
  memo?: string;
  hidePrice?: boolean | null;
  // ...
}

// 병원 관리자 앱: 공통 34개 + 전용 4개
export interface IProgramInspectionClient extends IProgramFormCommon {
  adminId: number;
  adminName: string;
  programId?: number;
  inspectionType: PROGRAM_INSPECTION_TYPE; // INSERT | UPDATE | DELETE
}

export const ProgramInspectionForm = createTypedForm<IProgramInspectionClient>();
```

공유 패키지의 FormItem은 `IProgramFormCommon`만 알고, 각 앱의 컨테이너는 전용 필드를 더한 타입과 제출 동작을 가진다. 공통 UI를 공유한다는 이유로 Back-Office 전용 검수 상태나 병원 관리자 전용 검수 요청 종류까지 패키지에 올리지는 않았다. 반대로 공통 타입에 있어도 화면은 한쪽에만 있는 필드가 있다. `labels`는 공통 필드지만 편집 UI는 Back-Office에만 있다. 병원 관리자는 조회한 라벨을 hidden 필드로 폼에 담아 미리보기에만 쓰고, 요청에는 보내지 않는다.

폼 하나를 FormItem 단위로 펼치면 다음과 같다.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/06-formitem-design.png" alt="위쪽은 컨테이너가 useForm 으로 만든 인스턴스가 폼 컴포넌트, 래퍼, TemplateForm 을 거쳐 FormItem 의 useFormInstance 까지 내려가는 흐름이다. 가운데는 Back-Office 상세 폼의 FormItem 트리로, 왼쪽 미리보기와 오른쪽 CMS 설정·기본 정보·검진 구성·상세 이미지 구획의 부품을 앱, program 패키지, treatment 템플릿 입력, shared·asset 층으로 색을 나누고 각 부품이 쓰는 폼 API 를 뱃지로 달았다. 상세 이미지 아래는 하위 시술 템플릿 편집 폼과 함께 쓰는 입력, 프로그램 폼 전용 입력, SyncTreatmentSub 로 나눴다. 아래에는 병원 관리자와의 차이와 설계 규칙 네 가지를 적었다" />
  <figcaption>Back-Office 상세 폼을 FormItem 단위로 펼쳤다. 색은 부품이 있는 층이고, 뱃지는 부품이 폼과 닿는 방식(앱 typed form, ProgramForm, antd)이다. 인스턴스는 컨테이너가 한 번 만들고, FormItem은 컨텍스트에서 받는다.</figcaption>
</figure>

FormItem은 form을 props로 받지 않는다. 컨테이너가 앱 typed form으로 만든 인스턴스가 래퍼와 `TemplateForm`을 거쳐 컨텍스트로 내려가고, 각 FormItem은 자기 층 typed form의 `Item`으로 컨텍스트에 붙는다. 인스턴스가 필요하면 `useFormInstance()`나 render-prop 인자로 같은 인스턴스를 자기 타입으로 받는다. 공유 부품이 쓰는 `ProgramForm`은 패키지 밖으로 내보내지 않는다. antd를 직접 쓰는 곳은 대부분 typed form으로 표현하기 어려운 자리다. 병원 검색이나 카테고리 캐스케이더 같은 위젯은 폼 인스턴스를 받지 않고 값과 콜백만 주고받는다. 화면에 칸이 없는 값(병원 id·이름, 진료과, 하위 시술)은 hidden 필드가 들고, 여러 필드를 한 번에 채우는 일은 FormItem이 `setFieldsValue`로 맡는다. 패키지가 부를 수 없는 조회(병원 검사항목)는 앱의 `…WithItems` 래퍼가 하고 결과를 props로 넘긴다. 상세 이미지 구획은 `…WithHealthCheck` 래퍼에게서 검진 여부를 받지만, 판정이 진료과 id 비교라서 예약금과 검진 구성은 패키지 안에서 같은 판정을 직접 한다.

## 하위 시술 템플릿 입력을 compound FormItem으로 함께 쓰기

상세 이미지의 템플릿 일곱 섹션 중 '제공 / 해당없음' 토글을 단 다섯은 프로그램 폼에만 있는 입력이 아니다. Back-Office에는 하위 시술마다 템플릿 값을 등록하는 편집 폼이 따로 있고, 프로그램 폼은 하위 시술을 고르면 그 값을 가져온다. 하위 시술 템플릿 편집 폼이 생긴 2026년 1월 14일에는 두 폼이 추천 대상·특장점·장비·과정·주의사항 입력을 따로 들고 있었고, 프로그램 폼 쪽은 두 앱에 한 벌씩 있어서 모두 세 벌이었다. 여러 벌이면 검증이나 안내 문구를 고칠 때마다 모두 같이 고쳐야 한다(1월 21일·23일의 글자 수 변경은 세 곳을 함께 고쳤다). 1월 26일에 프로그램 폼의 두 벌을 공유 패키지로 모았고, 27일에 남은 두 벌을 treatment 슬라이스의 한 벌로 합쳤다.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/05-shared-template-formitems.png" alt="위쪽은 Back-Office 하위 시술 템플릿 편집 폼과 두 앱의 프로그램 폼 상세 이미지 구획이 각자 조립한 FormItem 목록이다. 초록은 두 폼이 함께 쓰는 템플릿 입력, 회색은 프로그램 폼 전용, 파랑은 Back-Office 전용이다. 아래쪽은 공유 템플릿 입력 층으로, 이름 계약, 토글과 목록을 묶는 ProgramConditionedRender, 바깥 틀 TemplateForm, compound ProcedureHighlight·ProcedureEquipment·Precautions를 적었고, 맨 아래에 하위 시술 값을 프로그램 폼으로 옮기는 흐름과 2026-01-27에 두 벌을 합친 이력을 두었다" />
  <figcaption>하위 시술 템플릿 편집 폼과 프로그램 폼이 treatment 슬라이스의 템플릿 입력 한 벌을 각자 조립한다. 행 구성이 다른 특장점은 compound로 나눠, 하위 시술 편집은 아이콘과 문구를, 프로그램 폼은 문구만 받는다.</figcaption>
</figure>

함께 쓰는 입력은 세 가지 약속 위에 선다. 필드 이름은 `SAFEDOC_TEMPLATE_NAME_TYPE`의 열 개로 두 폼이 같고, '제공 / 해당없음' 토글과 목록은 `ProgramConditionedRender`가 묶고, 바깥 틀은 두 폼 모두 `TemplateForm`이다. 그래서 추천 대상·과정·주의사항과 시술 장비는 두 폼이 같은 컴포넌트를 그대로 쓴다. 두 폼의 값 타입은 전체로는 다르지만, 이 입력들이 쓰는 열 개 필드는 타입까지 같고 그 교집합 타입(`ITreatmentTemplateForm`)도 이미 있다. 다만 `ProgramForm`처럼 이 타입으로 typed form을 만들지는 않아서, 이 입력들은 antd Form과 이름 상수로 남아 있다. 첫 절에서 좁혀지지 않는 곳으로 적은 템플릿 입력이 이것이다.

특장점만 행 구성이 다르다. 하위 시술 템플릿 편집 폼에서는 행마다 아이콘과 문구를 받고, 프로그램 폼에서는 문구만 고치며 아이콘은 하위 시술 템플릿에서 받아 온 값을 그대로 둔다. 그래서 특장점은 목록 틀과 행 입력을 나눈 compound로 만들고, 행을 채우는 방식은 쓰는 쪽이 정하게 했다.

```tsx
export const ProcedureHighlight = {
  FormList: ProcedureHighlightsFormList, // 라벨·'제공 / 해당없음' 토글·Form.List
  Input: ProcedureHighlightInput, // 행의 문구(필수)
  Image: ProcedureHighlightImage, // 행의 아이콘(필수)
};

// Back-Office 하위 시술 템플릿 편집: 아이콘과 문구
<ProcedureHighlight.FormList>
  {({ field, index }) => (
    <>
      <ProcedureHighlight.Image field={field} />
      <ProcedureHighlight.Input field={field} index={index} />
    </>
  )}
</ProcedureHighlight.FormList>;

// 프로그램 폼: 문구만
<ProcedureHighlight.FormList>
  {({ field, index }) => <ProcedureHighlight.Input field={field} index={index} />}
</ProcedureHighlight.FormList>;
```

시술 장비(`FormList`·`FormItem`·`ImageWrapper`·`Image`·`Title`·`Content`)와 주의사항(`Form`·`FormItem`)도 같은 방식으로 조각을 열어 두었지만, 지금은 두 폼 모두 기본 조립(`<ProcedureEquipment />`·`<Precautions />`)을 그대로 쓴다.

두 폼의 섹션 구성이 같다는 점은 값을 옮길 때도 쓰인다. 마지막 절의 `SyncTreatmentSub`는 하위 시술 상세 응답을 프로그램 폼의 같은 섹션 필드에 넣으면서 모양만 맞춘다.

## 서버 모델과 폼 모델 사이에 변환 계층 두기

API와 폼이 원하는 모양은 달랐다.

```text
API response
  -> programDetailToClientProgramForm   (응답 → 폼 값)
  -> 폼 값
  -> clientProgramFormToCreateRequest   (폼 값 → 요청 본문)
  -> API request
```

예를 들어 서버 이미지 객체는 antd `UploadFile[]`로 바뀌고, 상세 템플릿은 `orderNo`로 정렬된 편집 배열이 된다. 위 두 함수는 Back-Office 상세·수정 화면에서 짝으로 쓰이고, 등록도 같은 요청 함수를 쓴다.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/03-transfer-layer.png" alt="위쪽 표는 두 앱의 변환 파일마다 응답에서 폼 값으로, 폼 값에서 요청 본문으로 바꾸는 함수 이름을 적었다. 아래는 대표 규칙 넷으로, 이미지 객체와 UploadFile 사이의 변환, orderNo 정렬과 재부여, 제공/해당없음 토글 판정, 폼 전용 필드를 요청에서 빼는 방식을 서버 응답·폼 값·요청 본문 세 칸으로 비교한다" />
  <figcaption>두 앱의 변환 파일은 API 흐름마다 하나이고, 대부분 응답을 폼 값으로, 폼 값을 요청 본문으로 바꾸는 두 방향을 함께 둔다. 응답 방향의 이미지 변환과 토글 판정은 공유 헬퍼에, orderNo 정렬은 앱 헬퍼에 있고, 폼 전용 필드는 요청 함수가 보낼 필드만 이름으로 골라 담는 방식으로 뺀다.</figcaption>
</figure>

변환 파일은 API 흐름마다 하나다. Back-Office는 등록·수정, 검수, 검진 구성을, 병원 관리자는 상세 조회, 검수 요청, 임시저장을 각각 파일 하나로 맡는다. 검진 구성은 프로그램과 다른 API라 변환 파일도 따로 두었고, 병원 관리자는 검진 구성을 조회용으로만 채우고 요청에는 싣지 않는다.

응답 방향에서 템플릿 여덟 섹션을 폼으로 옮기는 규칙은 두 앱의 변환 파일 어디서나 같다. 그래서 이미지 변환과 토글 판정은 공유 헬퍼로, `orderNo` 정렬은 앱마다 헬퍼로 뺐다(정렬 코드는 두 앱이 같고, 받는 템플릿 응답 타입만 앱마다 따로 정의돼 있다). 템플릿이 폼에서는 일곱 섹션인데 응답에서는 여덟인 것은 서버가 시술 전후 사진을 `BEFORE_IMAGES`·`AFTER_IMAGES` 두 목록으로 보내서다.

```ts
// 공유 헬퍼: 토글과 이미지
export const toVisibilityType = <T>(value: T | null | undefined): SAFEDOC_PROVIDED_TYPE =>
  isNil(value) ? SAFEDOC_PROVIDED_TYPE.None : SAFEDOC_PROVIDED_TYPE.SafedocProvided;

export function convertCommonAssetToUploadFile<T extends TImageFileInfo>(asset: T): UploadFile & { response: T } {
  return {
    uid: String(asset.id),
    name: asset.originalFileName || asset.fileName,
    status: 'done',
    url: asset.src,
    response: asset, // 제출할 때 여기서 id를 다시 꺼낸다
  };
}

// 앱 헬퍼: 섹션 하나를 orderNo 순서의 편집 배열로 (타입 인자는 생략했다)
const toClientForm = (templates: TProgramTemplate) => (type, initialValue) => {
  const items = templates[type];
  if (isEmpty(items)) return initialValue; // 섹션 초기값의 빈 줄

  return sortBy(items, 'orderNo').map((item) => ({
    title: item.title,
    content: item.content || '',
    image: item.imageFileInfo ? [convertCommonAssetToUploadFile(item.imageFileInfo)] : undefined,
  }));
};

export function resTemplateToClientTemplate(templates: TProgramTemplate) {
  const toClient = toClientForm(templates);

  return {
    isRecommended: toVisibilityType(templates.RECOMMENDED_TARGET),
    recommendedTarget: toClient('RECOMMENDED_TARGET', INITIAL_RECOMMENDED_TARGET),
    // 나머지 섹션도 같은 모양이다
  };
}
```

토글 판정은 `null`·`undefined`만 '없음'으로 보고, 빈 배열로 내려온 섹션은 켠다(추가 혜택과 시술 전후 사진은 '직접입력', 나머지는 '제공'). 항목은 섹션 초기값의 빈 줄로 채워진다(시술 특장점 3줄, 시술 과정 2줄, 나머지 1줄). 빈 배열을 '없음'으로 볼지는 요청마다 달라서, 토글 함수가 아니라 요청 변환이 정한다. 병원 관리자의 임시저장은 제목이 빈 줄을 거른 뒤 남는 것이 없어도 빈 배열을 보내고, 다시 불러오면 토글이 켜진 채 초기값의 빈 줄로 돌아온다. 검수·등록 요청은 토글이 꺼져 있거나 거른 뒤 남는 것이 없으면 섹션째 보내지 않는다.

제출 방향은 보낼 필드만 골라 담고, API가 요구하는 순서와 모양을 다시 만든다. 요청 방향에서 두 앱 헬퍼가 함께 가진 것은 순번을 붙이는 `titleFormToServerMap`과 공통 값을 고르는 `getBaseProgramInspectionItem`뿐이다. 섹션마다 토글을 확인하고 빈 줄을 거르는 `getDetailImageInspection`은 Back-Office만 헬퍼에 두었고, 병원 관리자는 검수 요청·임시저장 파일에 같은 이름으로 한 벌씩 두었다.

```ts
export const titleFormToServerMap =
  (type: TProgramDetailTemplatesItemType) =>
  ({ title }: { title: string }, orderNo: number) => ({ type, orderNo, title });

// 추천 대상: 꺼져 있거나 제목을 거른 뒤 비면 섹션을 보내지 않는다
const filteredRecommendedTarget = filter(client.recommendedTarget, ({ title }) => !isEmpty(title));
const recommendedTarget =
  client.isRecommended === SAFEDOC_PROVIDED_TYPE.None || isEmpty(filteredRecommendedTarget)
    ? undefined
    : filteredRecommendedTarget.map(titleFormToServerMap('RECOMMENDED_TARGET'));

// 이미지는 UploadFile.response에 실어 둔 에셋에서 id를 다시 꺼낸다
const thumbnailCommonImageId = client.thumbnailImage?.[0]?.response?.id ?? null;
```

제목 기반 섹션은 빈 줄을 거른 뒤 순서대로 `orderNo`를 다시 매기고, 이미지가 있는 섹션(특장점·장비·전후 사진)은 제목이 비어도 거르지 않는다. 전후 사진은 폼에서 한 줄(`{ title, before, after }`)이던 것을 같은 `orderNo`의 `BEFORE_IMAGES`·`AFTER_IMAGES` 두 목록으로 다시 나눈다. 요청 함수는 폼 값을 펼쳐 넘기지 않고 보낼 필드를 이름으로 골라 담는다. 그래서 토글과 변경 전 가격처럼 폼에만 있는 값과 따로 저장하는 검진 구성은 프로그램 요청에 섞이지 않고, 폼 전용 필드를 새로 더해도 마찬가지다.

변환 함수는 순수 함수라 방향마다 단위 테스트로 규칙을 고정했다. 처음 만든 변환 함수에는 테스트가 없었고, 두 앱의 변환 테스트는 2026년 7월에 붙였다. 9월에 더한 검진 구성 변환은 처음부터 테스트와 함께 넣었다. 검수 요청은 빈 섹션을 빼고 임시저장은 빈 배열로 보내는 차이도 각 파일의 테스트가 고정한다.

```ts
// 병원 관리자 검수 요청(program.inspection.transfer.test.ts)
it('걸러낸 뒤 남는 항목이 없으면 해당 섹션을 undefined 로 보내야 한다', () => {
  const result = clientProgramFormToProgramInspection(PROGRAM_INSPECTION_TYPE.Insert)(
    createClient({
      recommendedTarget: [{ title: '', content: '' }],
      benefit: [{ title: '', content: '' }],
      procedureProcess: [{ title: '', content: '' }],
      precautions: [{ title: '', content: '' }],
      procedureHighlights: [],
      procedureEquipment: [],
      beforeAfterImages: [],
    }),
  );

  expect(result.templates).toEqual({
    RECOMMENDED_TARGET: undefined,
    ADDITIONAL_BENEFITS: undefined,
    PROCEDURE_HIGHLIGHTS: undefined,
    PROCEDURE_PROCESS: undefined,
    PROCEDURE_EQUIPMENT: undefined,
    PRECAUTIONS: undefined,
    BEFORE_IMAGES: undefined,
    AFTER_IMAGES: undefined,
  });
});

// 병원 관리자 임시저장(program.draft.transfer.test.ts)
it('걸러낸 뒤 남는 항목이 없어도 undefined 가 아니라 빈 배열을 보내야 한다', () => {
  const result = clientInspectionDraftToReqInspectionDraft(
    createClient({
      recommendedTarget: [{ title: '', content: '' }],
      benefit: [{ title: '', content: '' }],
      procedureProcess: [{ title: '', content: '' }],
      precautions: [{ title: '', content: '' }],
    }),
  );

  expect(result.program.templates?.RECOMMENDED_TARGET).toEqual([]);
  expect(result.program.templates?.ADDITIONAL_BENEFITS).toEqual([]);
  expect(result.program.templates?.PROCEDURE_PROCESS).toEqual([]);
  expect(result.program.templates?.PRECAUTIONS).toEqual([]);
});
```

## 비동기 초기값은 폼을 마운트하기 전에 준비하기

antd Form의 `initialValues`는 마운트한 뒤 props가 바뀌어도 자동으로 다시 적용되지 않는다. 따라서 상세 조회가 끝나기 전에 빈 폼부터 만들지 않았다. Back-Office 상세 드로어는 프로그램 상세를 받고, 검진 프로그램이면 검진 구성까지 받은 뒤에야 초기값을 만든다. 그 전에는 폼 대신 로딩을 그린다. 구성 없이 먼저 초기화하면 늦게 온 구성이 폼에 실리지 않기 때문이다.

```tsx
const { data } = useQuery(programDetailOptions(partnerId, programId));
const savedProgramForm = useMemo(() => data && programDetailToClientProgramForm(data.data), [data]);
const { data: configuration, isLoading: isConfigurationLoading } = useQuery(
  healthCheckConfigurationOptions(isHealthCheckProgram(savedProgramForm?.departmentId) ? programId : undefined),
);

// 검진 구성까지 온 뒤에 초기값을 만든다
const initialValues = useMemo(
  () =>
    savedProgramForm && !isConfigurationLoading
      ? { ...PROGRAM_DETAIL_INITIAL_VALUES, ...savedProgramForm, ...healthCheckConfigurationToProgramForm(configuration) }
      : undefined,
  [savedProgramForm, isConfigurationLoading, configuration],
);

// 드로어를 열 때마다(다른 프로그램으로 바뀔 때마다) 한 번, 폼이 붙은 뒤 서버 값으로 되돌린다
useEffect(() => {
  if (!open) {
    resetProgramIdRef.current = undefined;
    return;
  }
  if (!initialValues || resetProgramIdRef.current === programId) return;

  form.resetFields();
  resetProgramIdRef.current = programId;
}, [form, open, programId, initialValues]);

return <DetailDrawer open={open} loading={!initialValues}>{/* 폼 */}</DetailDrawer>;
```

`resetFields`를 따로 부르는 이유는 폼 값이 컴포넌트가 아니라 `useForm()` 인스턴스에 남기 때문이다. 드로어는 `open` 값으로만 열리고 닫힐 뿐 컨테이너가 언마운트되지 않아서, 다시 열면 이전 편집이 `initialValues`를 이긴다. 그래서 열 때마다 한 번 서버 값으로 되돌린다. 열려 있는 동안 다시 조회된 값으로는 되돌리지 않는다. 프로그램은 저장됐는데 검진 구성 저장이 실패해 드로어가 열린 채 남으면, 재시도는 사용자가 고친 값을 보내야 하기 때문이다. `initialValues`와 `resetFields`로 들어간 시술 필드는 touched가 켜지지 않고, 사용자가 캐스케이더로 고른 값만 touched가 켜진다. 다음 절의 동기화는 이 차이로 저장된 값과 사용자 변경을 가른다.

## 하위 시술 변경에 따른 작업을 한곳에 모으기

하위 시술을 사용자가 바꾸면 시술에 저장된 템플릿을 프로그램 폼으로 가져온다. 초기 상세 조회로 ID가 채워졌을 때는 템플릿을 다시 적용하지 않고, 사용자가 시술을 직접 바꾼 경우에만 적용하도록 `isFieldsTouched`로 `treatmentId`와 `treatmentSubId`를 확인했다.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/04-treatment-sync.png" alt="왼쪽은 저장된 상세를 처음 불러올 때, 오른쪽은 사용자가 카테고리를 바꿀 때의 순서다. 두 경우 모두 하위 시술 상세를 조회하지만, 왼쪽은 시술 필드가 touched가 아니라 저장된 템플릿이 남고 오른쪽은 touched라 템플릿 필드 다섯 개가 교체된다. 아래 표는 응답 필드와 폼 필드의 대응, 건드리지 않는 필드, 남은 틈을 적었다" />
  <figcaption>SyncTreatmentSub는 두 경우 모두 하위 시술 상세를 조회하지만, 시술 필드가 touched일 때만 템플릿 필드 다섯 개를 교체한다.</figcaption>
</figure>

상세를 처음 열 때는 앞 절처럼 `initialValues`와 `resetFields`로 값이 들어가 두 필드가 touched가 아니다. 조회는 하지만 적용 조건을 통과하지 못해, 저장된 템플릿이 그대로 남는다. 사용자가 캐스케이더에서 진료과, 시술, 하위 시술을 고르면 `setFieldsValue`로 값을 넣어 touched가 켜지고, 새 ID로 조회한 응답이 다섯 필드를 교체한다. `setFields`로 값을 넣으면 touched가 켜지지 않아 자동 채움이 멈추므로, 값은 `setFieldsValue`로 넣는다.

```tsx
export function SyncTreatmentSub() {
  const form = ProgramForm.useFormInstance();
  const treatmentId = ProgramForm.useWatch(['treatmentId'], form) || form.getFieldValue(['treatmentId']);
  const treatmentSubId = ProgramForm.useWatch(['treatmentSubId'], form) || form.getFieldValue(['treatmentSubId']);

  // 두 ID가 모두 있어야 조회한다(없으면 queryFn이 skipToken)
  const { data } = useQuery(treatmentSubDetailQueryOptions({ treatmentId, treatmentSubId }));

  const isTouchedTreatmentId = form.isFieldsTouched(['treatmentId']);
  const isTouchedTreatmentSubId = form.isFieldsTouched(['treatmentSubId']);

  useEffect(() => {
    if (data && (isTouchedTreatmentId || isTouchedTreatmentSubId)) {
      const { recommendedTargets, procedureHighlights /* ... */ } = data.data;

      // 시술 상세는 추천 대상을 string[]로 내려준다. 폼은 { title }[]다.
      form.setFieldValue(
        'recommendedTarget',
        isEmpty(recommendedTargets) ? INITIAL_RECOMMENDED_TARGET : recommendedTargets?.map((title) => ({ title })),
      );
      form.setFieldValue(
        'procedureHighlights',
        isEmpty(procedureHighlights)
          ? INITIAL_PROCEDURE_HIGHLIGHTS
          : procedureHighlights?.map(({ image, title }) => ({
              title,
              image: image && [convertCommonAssetToUploadFile(image)],
            })),
      );
      // 시술 장비·시술 과정·주의사항도 같은 모양이다
    }
  }, [data, form, isTouchedTreatmentId, isTouchedTreatmentSubId]);

  return null;
}
```

이 구현에는 한계가 있다. touched는 폼을 다시 초기화하기 전까지 `true`로 남는다. 카테고리를 바꾼 뒤 상세 이미지 유형을 다른 것으로 바꿨다가 되돌리면 `SyncTreatmentSub`가 다시 마운트되고, 캐시된 응답으로 사용자가 고친 템플릿 값을 한 번 더 덮는다. 테스트로 재현해 확인했다. 다시 구현한다면 조회 결과를 지켜보는 effect 대신 캐스케이더의 `onChange`에서 템플릿 적용 함수를 호출하겠다. 사용자가 하위 시술을 바꾼 시점에만 값을 갱신하는 편이 동작을 이해하기 쉽다.

이렇게 나눈 뒤로 필드 경로 오타와 최상위 필드의 잘못된 값은 `createTypedForm` 사용처에서 바로 확인할 수 있었고, API 모양이 바뀌면 변환 함수부터 살펴보게 됐다. 두 앱은 FormItem을 공유하고 템플릿 입력은 하위 시술 템플릿 편집 폼과도 함께 쓰지만, 두 앱의 검수와 제출 흐름까지 억지로 맞추지는 않았다.

비용도 남았다. 재귀 경로 타입은 계산량 때문에 깊이를 5단계로 제한했고, API와 폼이 함께 바뀌면 양방향 변환 함수도 모두 수정해야 한다. 요청 방향의 템플릿 변환은 Back-Office 헬퍼, 병원 관리자 검수 요청, 임시저장 세 곳에 거의 같은 코드로 복제돼 있어서, 빈 섹션을 다루는 차이처럼 일부러 다르게 둔 부분이 코드 한 줄에 숨어 있다. 응답을 폼으로 바꿨다가 다시 요청으로 되돌리는 왕복 테스트도 아직 없다. 복잡도를 없앴다기보다 타입, 변환, 동기화 중 어디에서 각각의 복잡도를 다룰지 정한 작업이었다.
