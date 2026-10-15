# 38필드 복합 폼을 타입으로 길들이기: 프로그램 관리 폼 설계기

복지몰에서 "프로그램"은 병원이 파는 시술 상품이다. 이 프로그램을 등록하고 수정하는 폼은 평범한 CRUD로 끝나지 않았다. 기본 정보에 시술 템플릿 섹션 8개가 붙어서 필드가 38개를 넘는다. 서버 응답은 `templates.RecommendedTarget[].title`처럼 중첩돼 있는데 폼은 평탄한 구조라서, 오갈 때마다 양방향으로 변환해야 한다. 같은 폼을 관리자(CMS)와 병원(Admin) 두 앱이 함께 쓰는데, 앱마다 고유 필드가 따로 붙는다. 여기에 하위시술이 가진 템플릿 데이터(추천 대상과 시술 특장점 등)가 프로그램 폼으로 자동 상속돼야 했다.

그래서 네 부분으로 나눠 관리했다. 폼 타입을 좁히는 `createTypedForm`, 타입 확장으로 두 앱이 폼을 공유하는 방식, 서버와 폼 사이의 변환을 떼어 낸 Transfer Layer, 하위시술 상속을 맡는 side-effect 컴포넌트다. 예시 코드는 핵심만 추려 단순화하고 마스킹했다. 타입명과 필드명도 설명하기 쉽게 바꿔서 실제 사내 코드와는 다르다.

---

## 타입 안전: antd Form의 `any`를 길들이는 팩토리

antd Form에서 필드명은 그냥 문자열이다. 그래서 오타가 런타임까지 살아남는다.

```tsx
<Form.Item name="progamName">  {/* programName 오타 — 컴파일은 통과한다 */}
  <Input />
</Form.Item>
```

`getFieldValue('xxx')`도 반환 타입이 `any`다. 필드가 38개쯤 되고 같은 필드명이 변환 함수와 컴포넌트 곳곳에 반복되니, 이 `any`가 꽤 부담스러웠다.

처음에는 `fieldNames` 상수 객체에 문자열을 모아 두는 방식으로 시작했다. 그런데 문자열을 상수로 옮겼을 뿐이라 `getFieldValue`는 여전히 `any`였다. 그래서 폼 값 타입 `T`로 좁힌 Form을 만드는 작은 팩토리를 뒀다. antd Form을 감싸서 `name`, `getFieldValue`, `setFieldValue`를 모두 `T` 기준으로 좁힌다.

```ts
// 폼 값 타입으로 좁힌 Form 을 만든다 (개념 단순화 버전)
const ProgramForm = createTypedForm<ProgramFormValues>();

const [form] = ProgramForm.useForm();
form.getFieldValue('programName'); // string
form.getFieldValue('progamName');  // ❌ 컴파일 에러 (그런 키 없음)
```

```tsx
<ProgramForm.Item name="programName">  {/* name 도 ProgramFormValues 의 키로 좁혀짐 */}
  <Input />
</ProgramForm.Item>
```

`name`은 `keyof T`로 추론되고, 중첩 필드는 경로 배열로 추론된다. `['items', 0, 'title']` 같은 경로도 타입에서 검증하기 때문에 없는 경로를 쓰면 컴파일 에러가 난다. 오타나 구조 변경을 빌드 타임에 잡을 수 있게 됐다.

---

## 두 앱이 같은 폼을 공유하는 법: 타입 확장

CMS와 병원 앱에 따로 붙는 필드는 `Object.assign` 같은 런타임 상속 없이 타입 확장만으로 연결했다. 공통 폼 값 타입(`ProgramFormCommon`)을 두고, 각 앱은 여기에 자기 필드를 더한 타입으로 자기 Form을 만든다.

```ts
// 공통 (두 앱 공유 FormItem 에서 사용)
const ProgramForm = createTypedForm<ProgramFormCommon>();

// 병원 앱 — 공통 + 앱 전용 필드
interface HospitalProgramValues extends ProgramFormCommon {
  adminId: number;
  inspectionType: InspectionType;
}
const HospitalProgramForm = createTypedForm<HospitalProgramValues>();
```

`packages`에 있는 공통 FormItem 컴포넌트는 `ProgramForm`을 쓰고, 각 앱은 자기 타입으로 만든 Form으로 이걸 감싼다. 공통 필드는 `ProgramFormCommon` 한 곳에만 정의돼 있어서, 필드를 바꾸면 두 앱에 함께 반영된다.

---

## Transfer Layer: 서버와 폼 사이의 번역기

서버 응답과 폼 구조는 모양이 다르다.

```ts
// 서버 응답 (중첩)
{
  name: '울쎄라 리프팅',
  templates: {
    RecommendedTarget: [{ title: '처짐이 고민인 분', orderNo: 0 }],
    ProcedureHighlights: [{ title: 'FDA 승인', commonImage: { id: 1, src: '...' } }],
  },
  thumbnailImage: { id: 1, fileName: 'thumb.jpg', src: '...' },
}

// 폼이 다루기 편한 구조 (평탄)
{
  programName: '울쎄라 리프팅',
  isRecommended: 'PROVIDED',                       // 서버의 null/존재 → 명시적 토글 상태
  recommendedTarget: [{ title: '처짐이 고민인 분' }],
  procedureHighlights: [{ title: 'FDA 승인', image: [/* UploadFile */] }],
  thumbnailImage: [/* antd UploadFile */],
}
```

차이는 네 군데였다. 중첩과 평탄 구조, 서버 이미지 객체와 antd `UploadFile`, `orderNo` 정렬과 배열 순서, 그리고 "배열이 비어 있음"과 명시적인 토글 값이다.

이 변환을 컴포넌트 안의 `useEffect`나 `onFinish`에 흩어 두면 폼 UI 로직과 데이터 변환이 뒤섞인다. 그래서 양방향 변환을 순수 함수 두 개로 떼어 냈다.

```text
[서버 응답] ──serverToClient──▶ [폼 초기값] ──사용자 입력──▶ [폼 값] ──clientToServer──▶ [서버 요청]
```

템플릿 섹션 8개는 변환 패턴이 똑같아서 커리 함수로 반복을 없앴다.

```ts
// 서버의 null/없음 → 명시적 토글 값
const toToggle = <T>(v: T | null | undefined) => (isNil(v) ? 'NONE' : 'PROVIDED');

// 서버 이미지 → antd UploadFile (원본은 response 에 보존해 역변환 때 사용)
const toUploadFile = (asset: ServerAsset): UploadFile => ({
  uid: String(asset.id),
  name: asset.fileName,
  status: 'done',
  url: asset.src,
  response: asset,
});

// 템플릿 한 섹션을 폼 배열로 (orderNo 정렬 → 인덱스 순서)
const toSection = (templates: Templates) => (key: TemplateKey, fallback: Item[]) => {
  const items = templates[key];
  if (isEmpty(items)) return fallback;
  return sortBy(items, 'orderNo').map((it) => ({
    title: it.title,
    image: it.commonImage ? [toUploadFile(it.commonImage)] : undefined,
  }));
};
```

덕분에 컨테이너 컴포넌트는 무엇을 변환하는지만 알고, 어떻게 변환하는지는 모른다.

```tsx
<ProgramForm.Form
  form={form}
  initialValues={{ ...INITIAL_VALUES, ...serverToClient(data) }}
  onFinish={(values) => submit(clientToServer(values))}
>
  {/* FormItem 들 */}
</ProgramForm.Form>
```

변환 규칙이 바뀌어도 컨테이너는 그대로다.

---

## 하위시술 상속: 렌더링 없는 side-effect 컴포넌트

도메인은 진료과 → 상위시술 → 하위시술 → 프로그램의 4단계다. 템플릿 데이터(추천 대상과 시술 특장점 등)는 하위시술이 갖고 있고, 프로그램은 이걸 물려받는다. 그래서 "울쎄라 리프팅" 하위시술을 고르면 그 템플릿이 프로그램 폼에 채워져야 한다.

이 동기화를 UI 없는 side-effect 전용 컴포넌트로 떼어 냈다.

```tsx
// 렌더링 없음 — 카테고리 변경을 감지해 폼에 주입만 한다
function SyncSubProcedure() {
  const form = ProgramForm.useFormInstance();
  const treatmentSubId = ProgramForm.useWatch('treatmentSubId', form);
  const { data } = useQuery(subProcedureDetailOptions(treatmentSubId));

  // 최초 로드가 아니라, 사용자가 "직접 바꿨을 때"만 동기화
  const touched = form.isFieldsTouched(['treatmentId', 'treatmentSubId']);

  useEffect(() => {
    if (!data || !touched) return;
    form.setFieldValue('recommendedTarget', toTargets(data.recommendedTargets));
    form.setFieldValue('procedureHighlights', toHighlights(data.procedureHighlights));
    // ... 나머지 섹션도 동일
  }, [data, touched, form]);

  return null;
}
```

이 컴포넌트에서 중요한 건 `isFieldsTouched`다. 이 조건이 없으면 수정 폼을 열 때 서버가 `treatmentSubId`를 채우는 것만으로 동기화가 돌아서, **사용자가 이미 편집해 둔 템플릿을 덮어쓴다.** 그래서 사용자가 직접 카테고리를 바꿨을 때만 동기화하도록 touched 여부로 막았다.

쓰는 쪽은 JSX 트리에 한 줄 꽂아 두기만 하면 된다.

```tsx
<section>
  <SyncSubProcedure /> {/* 렌더 없이 side-effect 만 */}
  <RecommendedTargetSection />
  <ProcedureHighlightsSection />
</section>
```

---

## 멀티 앱 공유: 공통은 패키지, 전용은 앱

두 앱은 같은 폼을 쓰지만 요구가 다르다. 고유 필드도 다르고, 제출 동작도 직접 수정과 검수 요청으로 갈린다. 그래서 FSD로 나눴다.

```text
packages/                      ← 두 앱 공유
├─ entities/program            ← 공통 타입·초기값
└─ features/program            ← 공통 FormItem, createTypedForm<ProgramFormCommon>()

apps/cms/.../program           ← CMS 전용 타입·Transfer·레이아웃
apps/hospital/.../program      ← 병원 전용 타입·Transfer·레이아웃
```

공통 패키지는 FormItem, 공통 타입, Transfer 헬퍼 같은 폼의 재료를 주고, 각 앱은 그걸 조립하면서 전용 필드와 자기 Transfer를 더한다. 같은 FormItem을 import해도 "직접 수정 요청"과 "검수 요청"을 만드는 `clientToServer`는 앱마다 다르다.

---

## 트레이드오프

비용이 없지는 않았다. 좁힌 타입을 antd의 느슨한 타입에 끼우느라 팩토리 안에는 타입 단언이 들어간다. 대신 호출부는 타입 안전해진다. 단언은 팩토리 한 곳에 가둬 두고, 이득은 사용처 38곳이 본다.

Transfer Layer는 server↔client 변환 함수가 앱마다 두 벌씩 있어서, 서버가 바뀌면 손댈 곳이 늘어난다. 그래도 순수 함수라 테스트하기 쉽고 영향 범위도 잘 보인다. 컴포넌트마다 변환이 흩어져 있는 것보다는 낫다.

`return null`만 하는 side-effect 컴포넌트는 처음 보면 어색하다. 하지만 카테고리가 바뀌면 폼에 값을 넣는 책임 하나를 한 파일에 가두니, 동기화 버그가 날 곳이 한 군데로 좁혀졌다.

---

## 마치며

돌아보면 결국 경계를 나누는 일이었다. 필드명과 타입, 서버와 폼, 도메인과 폼, 공통과 앱 사이에 선을 그어 두니 새 템플릿 섹션을 추가하거나 한쪽 앱에만 필드를 더할 때 손댈 곳과 영향 범위를 미리 알 수 있었다.
