# 38필드 복합 폼을 타입으로 길들이기: 프로그램 관리 폼 설계기

복지몰에서 "프로그램"은 병원이 파는 시술 상품이다. 이 프로그램을 등록하고 수정하는 폼은 평범한 CRUD가 아니었다.

- 기본 정보 + 8개 시술 템플릿 섹션 = **38개가 넘는 필드**
- 서버 응답은 중첩 구조(`templates.RecommendedTarget[].title`), 폼은 평탄한 구조 → **양방향 변환** 필요
- 같은 폼을 **관리자(CMS)와 병원(Admin) 두 앱이 공유**하되, 앱마다 고유 필드가 붙음
- 하위시술이 가진 템플릿 데이터(추천 대상과 시술 특장점 등)가 프로그램 폼에 **자동 상속**

이걸 네 가지로 나눠 관리했다 — **타입 안전 폼(createTypedForm)**, **멀티앱 타입 공유(타입 확장)**, **Transfer Layer(서버↔폼 변환 분리)**, **하위시술 상속(side-effect 컴포넌트)**. 코드는 실제 코드 그대로가 아니라 핵심만 추려 단순화하고 마스킹한 예시다.

> 글에 나오는 타입명과 필드명은 설명을 위해 단순화했고, 실제 사내 코드와는 다르다.

---

## 타입 안전: antd Form의 `any`를 길들이는 팩토리

antd Form에서 필드명은 그냥 문자열이다. 그래서 오타가 런타임까지 살아남는다.

```tsx
<Form.Item name="progamName">  {/* programName 오타 — 컴파일은 통과한다 */}
  <Input />
</Form.Item>
```

`getFieldValue('xxx')`도 반환 타입이 `any`다. 필드가 38개쯤 되고 같은 필드명이 변환 함수와 컴포넌트 곳곳에서 반복되면, 이 `any`가 진짜 부담이 된다.

그래서 폼 값 타입 `T`로 좁힌 Form을 만드는 작은 팩토리를 뒀다. antd Form을 감싸되, `name`, `getFieldValue`, `setFieldValue`가 전부 `T` 기준으로 좁혀진다.

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

핵심은 `name`이 `keyof T`(중첩은 경로 배열)로 추론된다는 것이다. 중첩 필드는 `['items', 0, 'title']` 같은 경로로 접근하는데, 이 경로도 타입 위에서 검증된다 — 존재하지 않는 경로는 컴파일 에러가 난다. 오타와 구조 변경이 런타임이 아니라 빌드 타임에 잡힌다.

> 처음엔 `fieldNames` 상수 객체를 만들어 문자열을 한 곳에 모으는 방식으로 시작했다. 그런데 그건 "문자열을 상수로 옮겼을 뿐" 타입 안전은 아니었다(여전히 `getFieldValue`는 `any`). 그래서 폼 자체를 타입으로 좁히는 팩토리로 옮겼다. 같은 "한 곳 관리"라도 *문자열 모으기*와 *타입 강제*는 다르다.

---

## 두 앱이 같은 폼을 공유하는 법: 타입 확장

프로그램 폼은 CMS와 병원 앱이 같이 쓰되, 앱마다 고유 필드가 붙는다. 이걸 런타임 상속(`Object.assign` 같은) 없이 **타입 확장**으로만 연결했다.

공통 폼 값 타입(`ProgramFormCommon`)을 두고, 각 앱은 거기에 자기 필드를 더한 타입으로 자기 Form을 만든다.

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

공통 FormItem 컴포넌트(`packages`)는 `ProgramForm`을 쓰고, 앱은 자기 타입으로 만든 Form으로 그걸 감싼다. 공통 필드는 `ProgramFormCommon` 한 곳에만 정의되므로, 필드를 바꾸면 두 앱에 동시에 반영된다 — 런타임 트릭 없이 타입 확장만으로.

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

차이는 네 군데였다 — 중첩↔평탄, 서버 이미지 객체↔antd `UploadFile`, `orderNo` 정렬↔배열 순서, "배열 비어있음"↔명시적 토글 값.

이 변환을 컴포넌트 안 `useEffect`/`onFinish`에 흩으면, 폼 UI 로직과 데이터 변환이 섞인다. 그래서 양방향을 **순수 함수 두 개**로 떼어냈다.

```text
[서버 응답] ──serverToClient──▶ [폼 초기값] ──사용자 입력──▶ [폼 값] ──clientToServer──▶ [서버 요청]
```

8개 템플릿 섹션은 변환 패턴이 똑같아서, 커리 함수로 반복을 없앴다.

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

덕분에 컨테이너 컴포넌트는 "무엇을 변환하는지"만 알고 "어떻게"는 모른다.

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

도메인은 4단계다: 진료과 → 상위시술 → 하위시술 → 프로그램. 여기서 핵심은 **하위시술이 템플릿 데이터(추천 대상과 시술 특장점 등)를 소유하고, 프로그램이 이를 상속**한다는 것. "울쎄라 리프팅" 하위시술을 고르면 그 템플릿이 프로그램 폼에 채워져야 한다.

이 동기화를 UI 없는 side-effect 전용 컴포넌트로 떼어냈다.

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

`isFieldsTouched`가 이 컴포넌트의 핵심이다. 이게 없으면, 수정 폼을 열 때 서버가 `treatmentSubId`를 채우는 것만으로 동기화가 돌아서 **사용자가 이미 편집한 템플릿을 덮어쓴다.** "사용자가 직접 카테고리를 바꾼 경우"에만 동기화하도록 touched로 가드했다.

쓰는 쪽은 JSX 트리에 한 줄 꽂아두기만 하면 된다.

```tsx
<section>
  <SyncSubProcedure /> {/* 렌더 없이 side-effect 만 */}
  <RecommendedTargetSection />
  <ProcedureHighlightsSection />
</section>
```

---

## 멀티 앱 공유: 공통은 패키지, 전용은 앱

프로그램 폼은 CMS와 병원 앱 둘 다 쓰지만 요구가 다르다 — 고유 필드도, 제출 동작(직접 수정 vs 검수 요청)도 다르다. FSD로 갈랐다.

```text
packages/                      ← 두 앱 공유
├─ entities/program            ← 공통 타입·초기값
└─ features/program            ← 공통 FormItem, createTypedForm<ProgramFormCommon>()

apps/cms/.../program           ← CMS 전용 타입·Transfer·레이아웃
apps/hospital/.../program      ← 병원 전용 타입·Transfer·레이아웃
```

공통 패키지는 폼의 "재료"(FormItem, 공통 타입, Transfer 헬퍼)를 주고, 각 앱은 그걸 조립하면서 전용 필드와 자기 Transfer를 더한다. 같은 FormItem을 import하지만, "직접 수정 요청"과 "검수 요청"을 만드는 `clientToServer`는 앱마다 다르다.

---

## 트레이드오프

- **타입 안전 폼**: 좁힌 타입을 antd의 느슨한 타입에 끼우느라 팩토리 내부엔 단언이 들어간다. 대신 *호출부*는 완전히 타입 안전해진다 — 비용을 한 곳(팩토리)에 가두고 사용처 38곳이 이득을 본다.
- **Transfer Layer**: 변환 함수가 두 벌(server↔client)에 앱마다 있어 서버 변경 시 손댈 곳이 늘어난다. 하지만 순수 함수라 테스트가 쉽고 영향 범위가 명확하다. 컴포넌트에 변환이 흩어진 것보다 낫다.
- **side-effect 컴포넌트**: `return null` 컴포넌트가 처음 보면 어색하다. 하지만 "카테고리 변경 → 폼 주입"이라는 한 가지 책임을 한 파일에 가두니, 동기화 버그가 날 곳이 한 군데로 좁혀졌다.

---

## 마치며

복잡한 폼을 다루며 배운 건 결국 "경계를 분명히 하라"였다.

- 필드명과 타입의 경계 → `createTypedForm`으로 오타를 컴파일 타임에
- 서버와 폼의 경계 → Transfer Layer가 변환을 전담, 컴포넌트는 폼 구조만 안다
- 도메인과 폼의 경계 → 하위시술 상속을 side-effect 컴포넌트 하나로
- 공통과 앱의 경계 → FSD 패키지 분리

이 경계들 덕분에 새 템플릿 섹션을 추가하거나 한쪽 앱에만 필드를 더할 때, 손댈 곳과 영향 범위가 예측 가능해졌다. 폼이 복잡해질수록 관심사 분리는 취향이 아니라 생존 조건이 된다.
