# 두 관리자 앱에서 프로그램 폼을 공유하는 방법

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>Back-Office와 병원 관리자는 같은 프로그램을 편집하지만 제출하는 업무는 달라요. 입력 컴포넌트와 값 변환은 공유하고 제출은 각 앱에 남겼어요. 필드명과 값의 관계는 typed form으로, 요청 내용은 변환 테스트로 확인해요.</p>
</div>

병원 관리자는 프로그램을 등록하고 검수를 요청해요. Back-Office에서는 그 요청을 확인하고 승인하거나 반려해요. 같은 프로그램을 다루니 입력 항목은 겹치는데, 제출할 때 하는 일은 달랐어요.

처음에는 두 앱에 FormItem이 따로 있었어요. 추천 대상, 시술 장비, 주의사항 같은 입력은 하위 시술의 기본 템플릿을 편집하는 화면에도 있었고요. 같은 입력을 고쳐도 다른 화면까지 함께 고쳤는지 다시 확인해야 했어요.

## 폼 하나로 합치기엔 두 앱의 값과 할 일이 달랐어요

폼을 하나로 합치면 될 것 같았어요. 그런데 Back-Office에는 운영 메모와 노출 설정이 있고, 병원 관리자에는 요청자와 검수 요청 종류가 있어요. API 응답을 입력칸에 옮기는 일과, 수정한 값을 요청 본문으로 만드는 일도 별도였어요.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/01-form-anatomy.png" alt="프로그램 폼의 기본 정보, 상세 이미지와 건강검진 구성. 공통 필드와 Back-Office 및 병원 관리자 전용 필드를 구분한 그림" />
  <figcaption>같은 프로그램을 다뤄도 두 앱에 필요한 값은 조금씩 달라요. 그림의 입력값은 예시예요.</figcaption>
</figure>

<div class="note note-decision">
  <strong>공유할 기준</strong>
  <p>폼 전체를 공유하기보다, 바뀌는 이유가 다른 부분을 나눴어요. 공통 값의 타입, 함께 쓰는 입력, API와 폼 사이의 변환, 하위 시술 템플릿을 가져오는 동작은 공유하고, 검수와 제출 흐름은 각 앱에 남겼어요. API와 입력 방식의 차이는 컴포넌트 안에서 매번 처리하지 않고 변환 함수가 맡도록 했어요.</p>
</div>

코드는 설명에 필요한 부분만 옮겼고, 병원을 가리키는 내부 식별자는 `partner`로 바꿨어요.

## 필드 이름을 모아도 값의 타입까지 맞지는 않았어요

처음에는 필드 이름을 enum으로 모았어요. 여러 곳에 흩어진 문자열을 맞추는 데는 도움이 됐는데요. 이름이 맞는다고 읽거나 쓰는 값까지 맞는 건 아니었어요. `price`에 문자열을 넣거나 `getFieldValue`로 읽은 값을 잘못 다뤄도 놓칠 수 있었어요.

지금 프로그램 공통 폼과 앱별 폼에서는 `createTypedForm<T>()`을 사용해요. 폼 값 타입을 한 번 전달하면 `Item`, `List`, `useForm`, `useFormInstance`, `useWatch`를 같은 타입 기준으로 쓸 수 있도록 만든 래퍼예요.

```ts
// 공유 패키지
export const ProgramForm = createTypedForm<IProgramFormCommon>();

// Back-Office 앱: 공통 값에 운영·검수 전용 값을 더해요.
export interface IProgramInspectionClient extends IProgramFormCommon {
  memo?: string;
  hidePrice?: boolean | null;
  rejectReason?: string;
  // 나머지 앱 전용 필드 생략
}

export const ProgramInspectionForm =
  createTypedForm<IProgramInspectionClient>();
```

공유 FormItem은 `ProgramForm`을 쓰고, 앱 전용 값을 다루는 곳에서는 해당 앱의 `ProgramInspectionForm`을 써요. 그렇다고 폼 인스턴스나 값을 두 벌 만드는 것은 아니에요. 둘 다 같은 Ant Design Form 컨텍스트를 사용하고, 코드에서 다룰 수 있는 필드의 범위만 달라져요.

```ts
const form = ProgramForm.useFormInstance();

const name = form.getFieldValue('programName'); // string
const price = form.getFieldValue('price');     // number

form.setFieldValue('price', 100000);
form.setFieldsValue({ programName: '프로그램명', price: 100000 });

// 아래 두 호출은 타입 검사에서 걸려요.
form.getFieldValue('programNmae');
form.setFieldValue('price', '100000');
```

여기서 필요한 건 허용하는 이름과 그 이름에 해당하는 값의 타입을 연결하는 일이었어요. `TFieldNamePath<T>`로 필드 이름과 중첩 경로를 제한하고, `TPathValue<T, P>`로 그 경로의 값 타입을 구했어요.

```ts
// TFieldNamePath<T>와 TDeepPartial<T>의 구현은 생략했어요.
type TPathValue<T, P> =
  P extends keyof T
    ? T[P]
    : P extends readonly [infer K, ...infer Rest]
      ? K extends keyof T
        ? Rest extends []
          ? T[K]
          : TPathValue<T[K], Rest>
        : never
      : never;

// 인스턴스에서 제공하는 메서드의 타입
interface ITypedFieldAccess<T> {
  getFieldValue: <P extends TFieldNamePath<T>>(
    name: P,
  ) => TPathValue<T, P>;

  setFieldValue: <P extends TFieldNamePath<T>>(
    name: P,
    value: TPathValue<T, P> | undefined,
  ) => void;
}
```

`infer`로 경로의 첫 항목과 나머지를 나눠서, 경로를 따라 값의 타입을 찾는 방식이에요. `setFieldsValue`는 중첩 객체 일부만 바꿀 수 있도록 `TDeepPartial<T>`를 받고, `useWatch`에는 아직 값이 등록되지 않은 경우를 고려해 `undefined`도 포함했어요.

Ant Design에 연결하면서 필요한 타입 단언은 래퍼 안에만 두었어요. 호출하는 곳마다 반환값을 단언하지 않고, 폼 타입으로 이름과 값을 이어 주는 API를 쓰게 바꾼 거예요.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/02-form-name-layers.png" alt="공통 폼 타입과 앱별 확장 타입에서 typed form을 만들고, 필드 경로와 값 타입을 연결하는 구조" />
  <figcaption>공통 타입과 앱별 타입을 나누되, 읽고 쓰는 메서드도 그 타입을 따르도록 했어요.</figcaption>
</figure>

## 입력은 공유하고 조립은 쓰는 쪽에 남겼어요

하위 시술 템플릿 편집 화면과 프로그램 폼에는 같은 입력이 있어요. 추천 대상, 시술 특장점, 시술 장비, 시술 과정, 주의사항이에요.

다만 시술 특장점은 사용하는 방식이 달랐어요. 하위 시술 템플릿에서는 아이콘과 문구를 함께 등록하지만, 프로그램에서는 가져온 아이콘을 유지하고 문구만 고쳐요. 이 차이를 공유 컴포넌트의 옵션으로 계속 늘리기보다, 목록과 행 안의 입력을 나눴어요.

```tsx
// 하위 시술 템플릿 편집: 아이콘과 문구를 함께 입력해요.
<ProcedureHighlight.FormList>
  {({ field, index }) => (
    <>
      <ProcedureHighlight.Image field={field} />
      <ProcedureHighlight.Input field={field} index={index} />
    </>
  )}
</ProcedureHighlight.FormList>

// 프로그램 폼: 문구만 수정해요.
<ProcedureHighlight.FormList>
  {({ field, index }) => (
    <ProcedureHighlight.Input field={field} index={index} />
  )}
</ProcedureHighlight.FormList>
```

`FormList`가 토글과 목록을 맡고, 목록의 각 행에 어떤 입력을 넣을지는 호출하는 쪽이 정해요. 입력 모양이 같은 추천 대상과 시술 과정은 그대로 공유했어요. 시술 장비와 주의사항은 기본 조립을 제공하면서 필요한 조각도 열어 두었고요.

공유 템플릿 입력에는 기존 Ant Design Form을 쓰는 부분도 있어요. 프로그램 폼의 typed API와 템플릿 입력을 조립하는 compound 구조는 하는 일이 달라요. typed API는 필드 접근을 제한하고, compound 구조는 입력을 어디까지 재사용할지 정해요.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/05-shared-template-formitems.png" alt="하위 시술 템플릿 편집과 프로그램 폼이 같은 입력을 조립하되, 특장점의 이미지 입력 여부는 각 화면에서 결정하는 구조" />
  <figcaption>차이가 있는 입력만 조립을 다르게 하고, 나머지는 같은 구현을 사용해요.</figcaption>
</figure>

공통 입력은 검수 요청이나 승인 API를 몰라요. `onFinish`와 요청 버튼은 앱이 맡아서, 병원 관리자가 요청을 보내는 일과 Back-Office가 승인하는 일이 같은 컴포넌트에 들어가지 않아요.

## 서버의 모양을 입력칸까지 가져오지는 않았어요

API 응답과 폼 값은 용도가 달라요. 서버에서는 템플릿 항목을 종류별로 나누고 `orderNo`를 붙여 보내요. 폼에서는 사용자가 행을 추가하고 지우기 편해야 하고, 이미지는 업로드 컴포넌트의 파일 목록으로 다뤄야 해요.

그래서 응답을 폼 값으로 바꾸는 함수와, 폼 값을 요청 본문으로 바꾸는 함수를 따로 두었어요. 입력 컴포넌트는 편집에 필요한 모양만 다뤄요.

```text
API 응답 → 응답 변환 함수 → 폼 값 → 요청 변환 함수 → API 요청
                            ↑
                   FormItem은 이 모양만 다뤄요.
```

이미지가 대표적인 예예요. 서버가 준 이미지 객체를 `UploadFile`로 바꾸면서 원래 에셋을 `response`에 보관해요. 새로 업로드한 파일도 응답이 같은 자리에 들어가니, 제출할 때 기존 이미지와 새 이미지를 다르게 처리할 필요가 없어요.

지금 썸네일과 자체 제작 이미지의 폼 타입은 `UploadFile<TCommonAsset>`이에요. 업로드 응답에 제네릭을 지정해서 `response.id`를 읽는 부분까지 에셋 타입을 유지했어요.

```ts
type TProgramClientImage = UploadFile<TCommonAsset>;

// 저장된 이미지도 업로드 컴포넌트가 사용하는 형태로 바꿔요.
function convertCommonAssetToUploadFile<T extends TImageFileInfo>(
  asset: T,
): UploadFile & { response: T } {
  return {
    uid: String(asset.id),
    name: asset.originalFileName || asset.fileName,
    status: 'done',
    url: asset.src,
    response: asset,
  };
}
```

요청을 만들 때도 폼 값을 그대로 펼치지 않아요. API에 필요한 필드를 골라 담고, 썸네일은 이미지 ID로, 날짜는 문자열로 바꿔요. 화면에서만 필요한 이전 가격이나 입력 모드는 요청에 섞이지 않아요. 나중에 더한 건강검진 구성도 같은 폼에서 편집하지만 별도 API가 저장하므로 프로그램 요청에서는 제외해요.

템플릿 목록의 변환에는 몇 가지 규칙이 있어요.

- 응답은 `orderNo`로 정렬하고, 폼에서는 배열 순서로 편집해요.
- 제출할 때 제목만 사용하는 섹션은 빈 줄을 거른 뒤 순번을 다시 매겨요. 이미지가 있는 섹션은 같은 필터를 적용하지 않아요.
- 시술 전후 사진은 배열 인덱스 대신 `orderNo`로 짝을 찾아 한 행으로 합쳐요. 요청할 때는 같은 순번의 두 배열로 나눠요.
- `null`이나 `undefined`와 빈 배열은 구분해요. 응답에 섹션이 없으면 토글을 끄고, 빈 배열이면 토글은 켠 채 초기 입력 행을 보여줘요.
- 임시저장과 최종 요청에서 빈 섹션을 보내는 방식은 달라요. 임시저장은 편집 중인 빈 배열을 보낼 수 있고, 검수와 등록 요청은 비어 있는 섹션을 제외해요.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/03-transfer-layer.png" alt="서버 응답과 폼 값 및 요청 본문의 이미지, 순번, 토글, 폼 전용 필드 변환 규칙" />
  <figcaption>공유할 입력의 모양과, 각 요청에서 보내야 하는 모양을 구분했어요.</figcaption>
</figure>

## 처음 불러온 값과 카테고리를 바꾼 값을 구분했어요

상세를 열 때 저장된 프로그램 값을 넣는 일과, 카테고리를 바꿨을 때 하위 시술의 기본 템플릿을 가져오는 일은 달라요. 처음 받은 조회 응답으로 사용자가 편집 중인 값을 계속 덮어서는 안 돼요.

검수 상세 컨테이너에서는 필요한 조회가 끝나고 초기값을 만들 수 있을 때 폼을 그려요. 같은 드로어에서 다른 건으로 이동해 초기값이 바뀌면 `resetFields()`로 다시 채워요. 비동기 응답을 `initialValues`에 넘기는 것만으로 기존 인스턴스가 다시 초기화되지는 않기 때문이에요.

하위 시술 템플릿을 가져오는 동작은 `SyncTreatmentSub`가 맡아요. 폼에서 시술과 하위 시술 ID를 읽고, 둘 다 있을 때만 조회하도록 query options에 `skipToken`을 사용해요.

지금 구현은 조회 결과와 필드의 touched 상태를 확인하는 effect 방식이에요. 시술 ID뿐 아니라 하위 시술 ID의 touched 상태도 확인해서, 같은 시술 안에서 하위 항목을 바꾸는 경우를 포함해요.

```tsx
const form = ProgramForm.useFormInstance();

const treatmentId =
  ProgramForm.useWatch(['treatmentId'], form) ||
  form.getFieldValue(['treatmentId']);
const treatmentSubId =
  ProgramForm.useWatch(['treatmentSubId'], form) ||
  form.getFieldValue(['treatmentSubId']);

const { data } = useQuery(
  treatmentSubDetailQueryOptions({ treatmentId, treatmentSubId }),
);

const isTouchedTreatmentId = form.isFieldsTouched(['treatmentId']);
const isTouchedTreatmentSubId = form.isFieldsTouched(['treatmentSubId']);

useEffect(() => {
  if (!data || !(isTouchedTreatmentId || isTouchedTreatmentSubId)) return;

  // 실제 구현은 추천 대상·특장점·장비·과정·주의사항을 갱신해요.
  const { recommendedTargets } = data.data;
  form.setFieldValue(
    'recommendedTarget',
    isEmpty(recommendedTargets)
      ? INITIAL_RECOMMENDED_TARGET
      : recommendedTargets?.map((title) => ({ title })),
  );
}, [data, form, isTouchedTreatmentId, isTouchedTreatmentSubId]);
```

기본 템플릿에서 가져오는 값은 다섯 섹션으로 한정했어요. 직접 입력하는 추가 혜택과 시술 전후 사진은 이 동기화에서 바꾸지 않아요. 조회 응답을 폼 값으로 바꾸는 일도 이 컴포넌트 안에서 처리해요. 입력 컴포넌트마다 조회와 값 갱신을 반복하지 않도록 한 거예요.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/04-treatment-sync.png" alt="시술, 하위 시술 ID와 touched 상태를 확인하고, 조회 응답을 프로그램 폼의 다섯 템플릿 필드에 적용하는 흐름" />
  <figcaption>조회 조건, 적용 조건, 갱신할 필드를 한곳에서 확인할 수 있도록 했어요.</figcaption>
</figure>

## 변환 규칙은 테스트로 남겼어요

처음 폼을 만들 때는 변환 함수의 입력과 출력을 테스트로 고정하지 않았어요. 지금은 두 앱의 변환 헬퍼, 프로그램 요청, 검수 요청, 임시저장 변환에 테스트가 있어요.

단순히 변환한 값이 있는지만 보지는 않아요. 응답 순서가 섞여 있을 때도 시술 전후 이미지가 맞는 순번으로 짝지어지는지, 이미지 객체에 ID가 빠졌을 때 별도 ID를 사용하는지, 지운 썸네일이 `null`로 요청되는지 같은 조건을 확인해요.

아래는 실제 변환 테스트를 줄인 예시예요. `createClientForm`은 나머지 기본값을 채우는 테스트 헬퍼예요.

```ts
it('빈 제목을 거른 뒤 남은 순서대로 순번을 매긴다', () => {
  const form = createClientForm({
    isRecommended: SAFEDOC_PROVIDED_TYPE.SafedocProvided,
    recommendedTarget: [
      { title: '' },
      { title: '30대' },
      { title: '40대' },
    ],
  });

  const result = getDetailImageInspection(form);
  const templates = result[PROGRAM_DETAIL_TEMPLATE_TYPE.SafedocTemplate].templates;

  expect(templates.RECOMMENDED_TARGET).toEqual([
    { type: 'RECOMMENDED_TARGET', orderNo: 0, title: '30대' },
    { type: 'RECOMMENDED_TARGET', orderNo: 1, title: '40대' },
  ]);
});
```

반대로 이미지가 있는 시술 특장점은 제목이 비어도 같은 방식으로 지우면 안 돼요. 그 차이도 테스트에 남겼어요. 임시저장은 빈 제목을 거른 결과가 빈 배열이어도 그대로 보내는 조건을 따로 확인하고요.

typed API는 필드명과 값의 타입을 검사해요. 빈 섹션을 제외하는지, 이미지를 올바르게 짝짓는지 같은 요청 내용은 변환 테스트로 확인해요. 조회한 값을 화면에서 편집하고 제출하는 동작도 별도로 봐요.

<figure class="figure-wide">
  <img src="../assets/figures/program-form/06-formitem-design.png" alt="같은 Form 인스턴스에서 공통 입력과 앱 전용 입력을 조립하고, typed API, 공유 템플릿 입력, 변환 테스트의 책임을 구분한 구조" />
  <figcaption>입력은 같은 인스턴스를 사용해요. 필드 접근과 제출 데이터의 검증은 각각 다른 곳에서 맡아요.</figcaption>
</figure>

## 필드와 API를 바꿀 때 확인하는 곳

지금은 프로그램 필드가 바뀌면 폼 타입과 해당 FormItem을 먼저 보고, API가 바뀌면 변환 함수와 그 테스트를 확인해요. 두 앱과 하위 시술 편집에 함께 적용해야 하는 입력은 공유 컴포넌트에서 고치고, 검수와 제출 흐름은 각 앱에서 고쳐요.

공유 입력을 가져다 써도 다른 앱의 검수와 제출 로직은 따라오지 않아요. 공통 필드를 바꾸는 일과 앱의 업무 흐름을 바꾸는 일을 구분해서 다룰 수 있게 됐어요.

## 참고

- [Ant Design 5 Form: 필드와 폼 인스턴스 API](https://5x.ant.design/components/form/)
- [TypeScript Conditional Types: 조건부 타입과 infer](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [선언적인 코드 작성에 대한 기록](https://blog.bambyul.com/ko/blog/선언적으로-코드를-쓰는-기준)
- [테스트 코드를 도입하면서 세운 기준](https://blog.bambyul.com/ko/blog/테스트-코드를-도입하면서-세운-기준)
