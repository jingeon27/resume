# 김진건 Portfolio

> Frontend Engineer
>
> jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://blog.bambyul.com/ko/blog)

---

## 0. 소개

빠르게 만들어진 서비스에 합류해 기술 부채를 정리하고, 신규 기능 개발과 구조 개선을 함께 진행해 온 프론트엔드 엔지니어예요.

- **세이프닥 (2025.05 ~ 현재)** — 복지몰·CMS·병원 CRM 3개 서비스의 단독 Frontend Engineer.
- **왓타임 (2024.01 ~ 2024.11)** — ATS 서비스 round의 Electron 크롤러 아키텍처 재설계 + 면접 템플릿 / 채용 페이지 구현.

| 영역            | 작업                                   | 결과                                                               |
| --------------- | -------------------------------------- | -------------------------------------------------------------|
| 제품 분석       | 시술상세 개편 역효과 진단 → CTA 재설계 | 예약 -16% / 상담 -66% / 최종 -40% 진단                                                 |
| 폼 아키텍처     | 예약 페이지 리팩토링                   | RHF + Zod로 상태 소유권 단일화                                                      |
| 폼 아키텍처     | 가족 데이터 동기화 로직                | 520 → 55줄                                                                   |
| 데스크톱 크롤러 | Electron 아키텍처 재설계               | 신규 플랫폼 연동 3일 → 1일 정도 (점핏/잡플래닛/게임잡 3개 도입 후 체감)                              |
| 디자인 시스템   | `@core` Primitive Component            | 20개 컴포넌트 표준화                                                       |
| 모노레포        | 구조 단독 재설계(entities/features 신설) | 13 → 9개 패키지 통합                                                          |
| 코드베이스      | FSD sub-domain 패턴                    | 25 entities / 20 features 슬라이스                                      |

작업 방향은 **검증된 라이브러리 위에 얇은 어댑터를 두는 것**이에요. 사용자 입장에서 더 명확하고 편한 경험이 무엇인지 먼저 판단하고, Rule of Three 이후에만 추상화를 도입해 과한 설계를 피했어요.

---

## 1. 세이프닥 (Safedoc) — 2025.05 ~ 현재

병원·의원 복지 할인 플랫폼 3개 서비스 (복지몰 / CMS / 병원 CRM)의 단독 Frontend Engineer로 일하고 있어요. 합류 당시 서비스는 병원 프로그램 탐색과 예약 흐름 중심의 MVP였고, 시술 이후 단계는 앱 안에서 거의 관리되지 않는 상태였어요. 이후 예약 이후 운영 기능, 분석 환경, 관리자 기능까지 확장하며 운영 가능한 제품 구조로 고도화했고, **빅뱅 리팩토링 없이 신규 기능 PR 안에서 해당 영역만 점진적으로 정리**하는 원칙으로 작업했어요.

---

### 1.1. Amplitude 241개 이벤트 + 시술상세 개편 역효과 진단

제가 **가장 임팩트가 컸다고 생각하는 작업**이에요. 제가 동의해서 구현한 기능이 실제로는 사용자 행동을 더 나쁘게 만들었다는 점을 데이터로 확인하고 다시 설계했어요.

#### 가설과 측정

디자인팀과 합의해 시술 상세 페이지를 개편했어요. 가설은 "정보가 풍부해지면 신뢰가 올라가고, 전환율도 좋아질 것"이었어요. 저도 이 가설에 동의하고 직접 구현했어요.

배포 후에는 마케팅팀이 도입한 Amplitude 환경 위에서 설계해 둔 퍼널 이벤트로 바로 측정했어요.

- 예약 클릭률 -16%
- 상담 클릭률 -66%
- 최종 예약 완료 -40%

#### 진단

퍼널 단계별 이탈을 추적해 보니 CTA(예약 / 상담)가 스크롤 깊은 곳에 있어 사용자가 도달하기 전에 이탈하고 있었어요. **정보가 풍부해진 만큼 페이지가 길어졌고, 그게 오히려 부작용으로 돌아온 상황**이었어요.

#### 재설계

- 병원 상세 → 시술 상세 → 예약의 3단계 depth → 병원 상세에서 바로 예약 / 상담 가능한 CTA 구조.
- "더 자세히 보기" 누르지 않은 사용자도 행동 가능하도록 sticky CTA 도입.
- A/B 테스트 대신 사후 측정 후 즉시 롤백했어요. 회사 단계상 트래픽이 충분하지 않아 의미 있는 표본을 만들기엔 빠듯했어요.

#### 한계 / 다시 한다면

- 측정 인프라가 먼저 있어야 진단이 가능했어요. 합류 직후 Amplitude 이벤트 설계가 더 늦었다면 이 문제도 제대로 확인하지 못했을 거예요.
- 가설 검증 단계에서 제가 "무슨 지표로 성공을 볼 것인지"를 더 집요하게 물었어야 했어요. 이후부터는 가설 단계에서 측정 지표까지 함께 합의하는 걸 원칙으로 삼았어요.

---

### 1.2. 예약 Form 아키텍처 리팩토링 — 가족 동기화 520줄 → 55줄

`React Hook Form + Zod + @use-funnel/core` 조합으로 정리했어요.

#### 기존 문제

- `useState` 30개 + props drilling. 단계 전환 시 setState 누적이 렌더 폭증 유발.
- "치과면 견적 금액 필수" 같은 cross-field 검증을 if 분기로 흩뿌림.
- 가족 데이터 동기화 코드 520줄. useEffect 5~6개로 얽힘.

#### 결정

1. 단계 관리 → `@use-funnel/core`. 30줄 어댑터로 도메인 step type만 합성.
2. 폼 상태 → `react-hook-form` 단일 소유. view 컴포넌트의 로컬 state 제거.
3. 검증 → Zod schema. step별 분리, `superRefine`으로 cross-field.
4. 가족 동기화 → `setValue` + Zod default 조합. useEffect 체인을 watch + setValue 하나로 축약.

#### `useZodForm`

```ts
type UseZodFormProps<T extends ZodObject<any>> = Omit<UseFormProps<z.infer<T>>, 'resolver'> & { schema: T };

export function useZodForm<T extends ZodObject<any>>(props: UseZodFormProps<T>) {
  return useForm<z.infer<T>>({
    ...props,
    resolver: zodResolver(props.schema),
  });
}
```

`z.infer<typeof schema>`를 써서 schema가 바뀌면 form 타입도 자동으로 동기화되게 만들었어요. 기존에는 별도 `interface`를 두고 있어서 schema와 drift가 자주 생겼어요.

#### `superRefine` Cross-Field

```ts
const ReviewStep1Schema = z.object({
  treatmentCategory: z.enum(['dental', 'plastic', ...]),
  estimatedAmount: z.number().optional(),
  benefitReceived: z.boolean(),
  benefitMissingReason: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.treatmentCategory === 'dental' && !data.estimatedAmount) {
    ctx.addIssue({ path: ['estimatedAmount'], message: '치과는 견적 금액 필수' });
  }
  if (!data.benefitReceived && !data.benefitMissingReason) {
    ctx.addIssue({ path: ['benefitMissingReason'], message: '미수령 사유 필요' });
  }
});
```

흩어져 있던 if 분기를 schema 한 곳으로 모았어요.

#### 결과 / 한계

- 가족 동기화(ReservationPersonSelector) 520 → 55줄. 복잡도가 사라진 게 아니라 `useSyncFormReservationTarget` 훅으로 — 적절한 레이어로 — 이동한 것이에요.
- 패턴은 리뷰 작성, 상담 신청, 회원정보 수정에 재사용.
- **한계**도 있었어요. 리팩토링 후에도 페이지 컴포넌트가 여전히 커서, 이후에는 view 단위로 한 번 더 쪼개야 했어요. 이번 작업은 우선 "구조 정리"까지 진행했고, "view 분할"은 후속 작업으로 남겨뒀어요.

---

### 1.3. 리뷰 작성 플로우 재설계 — 3단계 funnel 구조로

이 작업은 **기존 리뷰 작성 플로우를 3단계 funnel + step별 Zod schema 구조로 재설계**한 것이었어요. (원래 플로우/스텝 컴포넌트는 동료가 만들었고, `@use-funnel` 기반 funnel 구조화·스키마 분리·FSD 정리를 제가 맡았어요.)

- 3단계 funnel: 영수증 인증 → 시술·결제·우대가 정보 → 평점·사진·후기
- step별 Zod schema + 통합 `ReviewSchema`
- iOS `.heic` → `heic2any` 클라이언트 변환 + 압축
- 가족 정보 자동 입력 (가족 ID에서 prefetch 후 form 주입)
- step 누적 데이터: `@use-funnel/core` history snapshot, RHF는 step 진입 시 동기화
- Amplitude 이벤트 세분화

이후 상담 / 견적 요청 플로우를 설계할 때도 레퍼런스 구현으로 계속 활용했어요.

---

### 1.4. SafeDoc App 프론트 아키텍처 정리

#### 합류 시점

- 961 파일 규모였고, FSD 시도와 Atomic Design 잔재가 함께 섞여 있었어요.
- widgets / features / entities 경계가 모호해서 같은 도메인 코드가 여러 슬라이스에 흩어져 있었어요.
- Public API 기준도 없어서 직접 deep import가 많았고, 파일명 case도 섞여 있었어요.

#### 정리

1. **6-layer FSD 표준화**: `app / pages / widgets / features / entities / shared`. (`processes`는 deprecated라 제외)
2. 25 entities / 20 features 슬라이스 경계와 Public API 기준 정립.
3. 위반 케이스 점진 정리: widgets 도메인 컴포넌트 → features 이관, 순환 의존 해소, 파일명 kebab-case.
4. TanStack Query v5 `queryOptions` 패턴과 Server Component prefetch → HydrationBoundary → `useSuspenseQuery` 흐름도 함께 정리했어요.
5. 공통 부모 `layout.tsx` 단계에서 program 상세 정보를 prefetch하도록 바꿔, 기존에 프로그램 상세 페이지와 상담 페이지가 각각 별도로 호출하던 `/program/detail` API를 request-scoped 캐시 안에서 재사용하게 만들었어요.

#### Sub-Domain 패턴 (자체 정립)

이건 FSD 공식에 있는 패턴은 아니에요. 다만 `entities` / `features` 안에서 단일 슬라이스 파일이 30개 이상 쌓이기 시작하면 평평한 구조가 오히려 가독성을 해친다고 판단했어요.

```
entities/settlement/
├── common/      # 공통 타입, 유틸
├── contract/    # 계약 단계
├── deposit/     # 입금 단계
├── disapproval/ # 미승인 처리
└── omission/    # 누락 처리
```

도메인 라이프사이클 단계에 맞춰 나눴어요.

#### 한계 / 다시 한다면

- sub-domain 도입 시점이 늦었어요. 30개 이상 파일이 쌓인 뒤에야 나누다 보니 마이그레이션 비용이 커졌어요. 슬라이스 파일이 15개쯤 되었을 때 기준을 세웠다면 비용을 훨씬 줄일 수 있었을 거예요.
- 또 "sub-domain은 FSD 공식 패턴이 아니다" 보니 신규 합류자에게 학습 비용이 있었어요. 가이드 문서를 뒤늦게 추가해 해결했지만, 처음 도입할 때 같이 만들었어야 했어요.

---

### 1.5. CMS · 병원 CRM — 모노레포 구조 단독 재설계 (13 → 9)

두 앱이 공통 도메인(예약, 병원정보, 동의서 등)은 공유하면서도 각자 앱의 도메인 코드는 분리되어야 했어요. 초기 모노레포 구조는 이전 개발자들의 설계였고, 저는 그 구조를 인수한 뒤 이후 구조 설계를 단독으로 맡아 도메인 공유 패키지(entities/features)를 신설하고 경계를 다시 그었어요.

#### 패키지 구조

13개 = 3 config + 5 shared + 2 lib + entities + features.

| 카테고리   | 역할                                                |
| ---------- | --------------------------------------------------- |
| config (3) | eslint / tsconfig / tailwind 공통 설정              |
| shared (5) | `@safedoc/ui` (Primitive), icons, utils, types, api |
| lib (2)    | auth / analytics 어댑터                             |
| entities   | 비즈니스 엔티티                                     |
| features   | 두 앱이 공유하는 사용자 시나리오                    |

#### `@safedoc/ui` no-build bundled 전환

초기에는 `tsup` 기반 prebuilt 구조였어요. 패키지 코드를 바꿀 때마다 다시 빌드해야 해서 앱 HMR 흐름이 느렸어요. 그래서 `package.json`의 `exports`가 `src`를 직접 가리키게 바꿔서 패키지 변경이 즉시 앱 HMR에 반영되도록 했어요.

#### 트레이드오프

- `src`를 직접 노출하는 방식이라 외부 publish를 하려면 다시 손봐야 해요. 대신 사내 패키지라는 전제에서는 괜찮았어요.
- IDE의 go-to-definition과 타입 추론은 더 빨라졌어요. `dist`를 거치지 않기 때문이에요.
- **단점**도 있었어요. 기능별로 잘게 쪼갠 shared 패키지(ui/types/utils/hooks/layout)가 import 경로를 분산시키고 dev 서버 초기 컴파일 시간을 늘렸어요. 그래서 이후 단일 `@safedoc/shared`로 통합해 13개 → 9개 패키지로 재편했고, 도메인 공유는 entities/features 패키지가 전담하도록 경계를 다시 그었어요.

#### Turborepo + GitHub Actions

- 5 workflows: prod / stage / dev deploy + lint + slack-alarm
- `dorny/paths-filter`로 변경 감지 → CMS만 변경되면 CMS만 배포
- pnpm catalog로 공통 의존성 단일 관리

---

### 1.6. Program 도메인 폼 설계 — sub-domain 분할 + Transfer Layer

CMS / 병원 CRM 공유 도메인. 단일 프로그램 entity 안에 **CMS 전용 필드 (라벨, 메모, 검수 상태)** 와 **공통 필드 (가격, 분류, 이미지)** 가 섞여 있고, 등록 흐름과 검수 흐름이 다른 상태 머신을 가짐. AntD Form 기반.

#### 폴더 구조

```
features/program/
├── common/      # 등록 / 수정 (CRUD)
│   ├── lib/
│   │   ├── program.transfer.ts        # 폼 ↔ 서버 변환 (main)
│   │   └── program.transfer.helper.ts # 상세 이미지 변환 등 분기 로직
│   ├── model/
│   │   ├── program.model.ts           # FORM_NAME enum, 타입
│   │   └── program.transfer.ts
│   └── ui/
│       └── detail/
│           ├── ProgramDetailFormContainer.tsx  # 진입점 (React Query)
│           └── form/                            # 섹션 단위 컴포넌트
└── inspection/  # 검수 (변경 사항 추적)
    ├── model/
    │   └── program.inspection.transfer.ts      # inspection 전용 변환
    └── ui/
        ├── ProgramInspectionDetailFormContainer.tsx
        └── detail/
            ├── form/
            └── callout/                         # 검수 상태 배지
```

#### 1) 2-tier `FORM_NAME` enum — 공통 필드 재참조

`@safedoc/types`의 공통 enum과 CMS 전용 enum을 합치되 **공통 필드는 같은 값을 재참조**해 한 군데 변경으로 양쪽이 동기화.

```ts
// @safedoc/types
enum PROGRAM_FORM_NAME_TYPE_COMMON {
  HospitalId = 'hospitalId',
  ProgramName = 'programName',
  Price = 'price',
  // ...
}

// apps/safedoc-cms — CMS 전용 + 공통 재참조
enum PROGRAM_FORM_NAME_TYPE {
  // CMS 전용
  InspectionStatus = 'inspectionStatus',
  RejectReason = 'rejectReason',
  Memo = 'memo',
  // 공통 (값 재참조)
  HospitalId = PROGRAM_FORM_NAME_TYPE_COMMON.HospitalId,
  ProgramName = PROGRAM_FORM_NAME_TYPE_COMMON.ProgramName,
}
```

`form.setFieldValue(PROGRAM_FORM_NAME_TYPE.InspectionStatus, ...)` 로 자동완성 + 타입 안전성 확보. 문자열 리터럴 사용 금지를 컨벤션으로 둠.

#### 2) Transfer Layer — 서버 ↔ 폼 양방향 변환

서버 응답과 폼 값의 형태가 달라서 변환 레이어를 별도 파일로 분리했어요.

| 방향      | 함수                               | 역할                                                                            |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| 서버 → 폼 | `programDetailToClientProgramForm` | `Dayjs` 변환, `imageId` → `UploadFile[]`, 템플릿 데이터 → `Form.List` 구조      |
| 폼 → 서버 | `clientProgramFormToCreateRequest` | `Dayjs` → ISO string, `UploadFile[]` → `imageId` 추출, `before/after` 페어 검증 |

검수는 변경 전후 비교가 필요해서 별도 변환 파일 (`program.inspection.transfer.ts`)에서 `originPrice`, `originDiscountPrice` 같은 이전 값을 폼에 함께 주입했어요.

#### 3) Form.List + Cascade Validation

`BeforeAfterImagesFormList`는 시술 전후 이미지 페어를 1~4개까지 동적으로 추가. **before / after 둘 다 채워졌을 때만 통과** 하는 cascade validator.

```ts
<Form.Item name={field.name} rules={[
  {
    validator(_, value) {
      const { before, after } = value ?? {};
      if (before?.src && after?.src) return Promise.resolve();
      return Promise.reject(new Error('시술 전후 이미지 필수'));
    }
  }
]}>
```

`useWatch` + `useDeepCompareEffect`로 부분 유효성을 실시간으로 체크해 추가 버튼 활성화 / 비활성화를 제어했어요.

#### 4) 비동기 이미지 업로드 + validator

업로드와 validation을 분리. 업로드는 `customRequest`에서 비동기로 진행하고, validator는 **응답 객체 (`response.src`) 존재 여부** 로 통과 여부를 판단.

```ts
<Form.Item
  valuePropName="fileList"
  getValueFromEvent={getFilelistValue}
  rules={[{
    validator(_, value) {
      if (!value?.[0]?.response?.src) {
        return Promise.reject(new Error('업로드 완료 후 제출'));
      }
      return Promise.resolve();
    }
  }]}
>
  <Upload customRequest={handleImageUpload} maxCount={1} />
</Form.Item>
```

업로드 실패 / 진행 중 상태를 별도 state로 흩어놓지 않고, 폼 validator 한 곳에서 판단하게 했어요.

#### 5) 검수 흐름 — 단일 폼 인스턴스 + 상태 머신

처음에는 "이전 / 새 버전 두 폼 인스턴스를 나란히 두는 방식"으로 생각했어요. 그런데 **두 폼을 동기화하는 비용이 너무 컸고, 변경 추적은 DB 레벨에서도 가능**했어요. 그래서 **단일 폼 인스턴스 + Callout 상태 배지** 구조로 단순화했어요.

- `PROGRAM_INSPECTION_STATUS` enum으로 상태 머신 관리: `Request → Waiting → Confirm | Reject`
- `Request / Waiting` 만 편집 가능, 나머지는 `disabled` prop으로 폼 잠금
- 변경 전후 비교는 `originPrice` 등 별도 필드로 폼에 같이 주입 → 같은 화면에서 비교

#### 6) Cross-app 추출 (Rule of Three)

처음에는 Admin(CMS)에만 있던 도메인이었는데, 병원 CRM에도 같은 흐름이 필요해졌어요. 그래서 Admin 쪽을 먼저 안정화한 뒤 `@safedoc/features`로 추출했어요.

#### 한계 / 다시 한다면

- **서버 임시저장이 없다는 한계**가 있었어요. 현재는 `form.resetFields()` 기반 UI 레벨 reset만 있어서 페이지를 이탈하면 값이 사라졌어요. 이후에는 `localStorage` 기반 draft와 `beforeunload` 가드를 넣어야 했어요. 처음 설계할 때 draft sub-domain까지 생각했지만 우선순위 조정으로 미뤘어요.
- **Transfer 함수의 단위 테스트도 없었어요.** 변환 로직은 10개 이상 분기가 섞여 있어 회귀 위험이 가장 큰 영역인데, 이 부분은 보강 우선순위 1순위였어요.
- **상세 이미지 변환(`program.transfer.helper.ts` 200+ 줄)**도 아쉬웠어요. SafeDoc 템플릿과 커스텀 이미지 분기가 한 함수 안에 계속 쌓이면서 가독성이 낮아졌어요. 템플릿 종류별 strategy pattern으로 나눴다면 더 좋았을 거예요.

---

### 1.7. 정산 도메인 — Middleware + Optimistic Update

정산은 권한 / 감사 측면에서 별도 호스트로 운영했지만, 코드는 단일 레포로 유지했어요.

- **Middleware**: `/settlement/*` 진입 시 별도 호스트 redirect, 토큰 위임.
- **Route Group `(altLayout)/settlement`**: 같은 코드베이스 + 별도 레이아웃.
- **legacy fetch/apis → FSD entities/features 마이그레이션**.

#### Optimistic Update + 자동 롤백

```ts
// 즉시 UI 업데이트
queryClient.setQueriesData(queryKey, (old) => ({ ...old, hidden: true }));

// 서버 호출
mutateAsync({ id, hidden: true }).catch(() => {
  // 실패 시 자동 롤백
  queryClient.setQueriesData(queryKey, (old) => ({ ...old, hidden: false }));
});
```

`queryClient.getQueriesData()`로 패턴 매칭되는 모든 쿼리에 일괄 적용해서 정산내역 / 숨김처리 비교 두 탭이 함께 갱신되도록 했어요.

#### Claude skills + 리팩토링 workflow

정산 영역은 외부업체가 개발한 뒤 인수한 코드가 많아서, 대표 패턴을 먼저 정리한 뒤 같은 문맥으로 확장하는 방식이 특히 중요했어요.

- `settlement/program`, `settlement/monthly`의 대표 모달을 먼저 `overlay-kit` 패턴으로 리팩토링했어요.
- 그다음 Claude Code에 해당 diff와 패턴 맥락을 넘겨 비슷한 모달과 페이지를 같은 방식으로 정리하게 했어요.
- `.claude` skills 문서에 FSD 경계, Public API 기준, 모달 제작 패턴, 정산 도메인 리팩토링 방식을 문서화해 반복 작업의 문맥 비용을 줄였어요.
- PR 전에는 AI agent 코드리뷰를 먼저 돌려 critical한 경계 위반과 Public API 누락을 사전에 점검했고, worktree로 2~3개 작업을 병렬로 진행했어요.

#### 트레이드오프 / 한계

- URL 파라미터 토큰 위임은 브라우저 history / Referer / 서버 access log에 남을 위험이 있어요. **단일 사용 단명 토큰 + HTTPS 전제**로 운영했지만, 보안 측면에서는 별도 OAuth-style 인가 코드 교환이 더 단단한 방식이에요. 지금은 운영 단계상 절충한 형태였고, 트래픽이나 감사 요구가 더 커지면 교체가 필요했어요.

---

### 1.8. 그 외 세이프닥 작업

- **`@core` 디자인 시스템 sub-PR 17~18개 작성**: typography / border-radius / shadow 토큰, selection (Checkbox/Radio/Toggle), Chip / Menu / Tabs, Toast 영역. Radix UI / Headless UI 위에 `tailwind-variants`로 size/intent/state 3축 표준화.
- **BottomSheet Compound (`Root/Header/Content/Footer`)** + `react-modal-sheet` + `overlay-kit` 통합. route change / popstate / backdrop pointer-events / setTimeout cleanup 4가지 모바일 엣지 케이스를 라이프사이클 레이어 한 곳에서 처리.
- **콜인 / 워크인 듀얼 패스 동의서**: `PROXY_RESERVATION_INFLOW_TYPE` enum으로 분기, `AgreementCallInFormValues` (4 필드) / `AgreementWalkInFormValues` (1 필드) 분리. 진입 시점에 `inflowType`으로 컴포넌트 분기.
- **병원 검색**: `geolib` 거리 계산 + `naver-maps` SDK + `react-intersection-observer` 무한 스크롤 + 자동완성 / 인기 검색어. `infiniteSetData` 헬퍼로 `useInfiniteQuery` nested page 안의 개별 아이템 업데이트 처리.

---

## 2. 왓타임 (Whattime / round) — 2024.01 ~ 2024.11

캘린더 기반 일정 조율 + ATS 솔루션 SaaS에서 ATS 서비스 round를 담당했어요.

### 2.1. Electron Desktop 크롤러 아키텍처 재설계

가장 기술적으로 밀도 높았던 작업은 Electron Desktop 크롤러 구조를 다시 세운 일이에요. round는 점핏 / 잡플래닛 / 게임잡 같은 외부 채용 플랫폼에서 후보자 데이터를 수집해 자체 DB에 통합하고 있었는데, 플랫폼마다 로그인 방식, 상세 진입, 파일 다운로드, 페이지네이션이 조금씩 달라 공통 흐름이 반복 / 복제되고 있었어요.

핵심은 `CandidateServiceHelper` 추상 클래스로 수집 프로세스를 4단계로 표준화한 거예요.

```ts
export abstract class CandidateServiceHelper<T> {
  abstract createInsertCandidates(): Promise<void>;
  abstract roundCandidateFilter(): Promise<void>;
  abstract createRoundCandidates(): Promise<void>;
  abstract uploadResumes(props: UploadResumes): Promise<{ successCount: number }>;
}
```

- `createInsertCandidates` — 플랫폼에서 수집 대상 후보자 목록 생성
- `roundCandidateFilter` — round 기준 중복 후보자 필터링
- `createRoundCandidates` — round 후보자 등록 및 업로드 대상 생성
- `uploadResumes` — 이력서를 S3에 업로드하고 URL 갱신

플랫폼별 서비스 / repository 구현체는 DOM 조작과 API 차이만 맡고, 공통 흐름은 helper에 남겼어요. 결과적으로 신규 플랫폼 연동 방식이 "기존 코드 복사 후 패치"에서 "정해진 단계 구현"으로 바뀌었고, 코드 중복이 크게 줄고 신규 플랫폼 연동 기간도 3일 → 1일 정도로 줄어든 느낌이었어요.

#### 한계 / 다시 한다면

- DOM 셀렉터 / 로그인 흐름은 플랫폼 UI 변경에 취약해요. 구조는 정리했지만 운영 안정성은 별도 문제였고, 셀렉터 헬스체크나 감지 알람까지 붙였다면 더 좋았을 거예요.
- DI 가능한 구조는 갖췄지만 실제 단위 테스트는 후행이 됐어요.

---

### 2.2. 후보자 평가 / 피드백 / 칸반 관리 화면 고도화

입사 초반에는 후보자 평가와 채용 단계 관리 UX를 집중적으로 맡았어요.

- 평가 제출 / 상세 조회 / 읽기 전용 모드 분리
- 평가 템플릿 cache key 문제 수정과 search / sort 추가
- 후보자 quick memo, 단계별 메모, 상세 피드백 처리
- 칸반 보드 기반 stage 이동 UX 개선

특히 칸반 보드는 `@dnd-kit` 기반으로 구현했어요.

- `DndContext` + `SortableContext` + `PointerSensor` + `arrayMove`
- 드래그 중 로컬 상태를 먼저 갱신한 뒤 서버 mutation
- 실패 시 이전 stage로 롤백
- 평가 미완료 / 면접 진행 중 같은 도메인 조건은 confirm dialog로 제어

단순한 카드 정렬 UI가 아니라, 평가 상태와 채용 단계 규칙이 얽힌 관리 화면을 다뤘다는 점에서 의미가 있었어요.

---

### 2.3. 채용 페이지 / 지원서 설정 / 템플릿 폼 구조 개선

채용 페이지와 지원서 설정은 동적 질문, 중첩된 하위 폼, 조건부 validation이 많은 영역이었어요.

- `React Hook Form` + `useFieldArray`로 질문 추가 / 삭제 / 재정렬
- `FormProvider`로 하위 컴포넌트에 form context 전달
- `useYupValidation` 기반 schema validation 통합
- 메일 / 면접 알림 템플릿 작성 UI를 `@whattime/quill` 기반 WYSIWYG로 개선

템플릿 시스템에서는 `{{candidate-name}}`, `{{organization-name}}` 같은 변수를 삽입하고, 미리보기에서 실제 값으로 치환하는 흐름을 정리했어요. WYSIWYG 내부 표현과 실제 데이터 표현을 분리해 운영자가 반복적으로 쓰는 메시지 작성 UX를 다듬었어요.

---

### 2.4. 면접 템플릿 / 온보딩 — 4단계 funnel 패턴 정리

면접 템플릿 생성 플로우는 4단계로 나뉘어 있었고, 각 단계의 데이터가 다음 단계 validation에 이어지는 구조였어요. 실제 구현은 yup schema를 단계별로 `pick` / `concat` 해서 확장하는 방식이었어요.

- 1단계: 시간 유형 / 가능 시간 / 템플릿 이름
- 2단계: 면접 장소 / 설명 / 시간 범위
- 3단계: 참여자 확인 방식 / 일정 조율 규칙
- 4단계: 이메일 제목 / 본문

여기에 `useFunnel` 기반 단계 전환을 얹어, 면접 템플릿과 온보딩 checklist 같은 멀티스텝 경험을 하나의 패턴으로 정리했어요. 이 시기 경험이 이후 세이프닥에서 funnel + schema 패턴을 더 강하게 발전시키는 기반이 됐어요.

---

### 2.5. Server State 표준화 — `@lukemorales/query-key-factory`

TanStack Query를 쓰고 있었지만 도메인별 query key와 invalidate 기준이 파일마다 흩어져 있어 캐시 drift가 자주 생겼어요.

```ts
export const candidateDetailKeys = createQueryKeys('CandidateDetail', {
  detail: ({ candidateId }) => ({
    queryKey: [candidateId],
    queryFn: () => candidatesApi.show({ candidateId }),
    contextQueries: {
      quick_memo: { queryKey: null, queryFn: () => candidatesQuickMemosApi.index(candidateId!) },
      timelineHistories: { queryKey: null, queryFn: () => candidatesHistoriesApi.timeline(candidateId!) },
    },
  }),
});
```

`createQueryKeys` + `contextQueries` 조합으로 candidate / recruit / member / interviewAlarm 등 주요 도메인의 query key를 계층적으로 표준화했어요. detail, memo, histories처럼 함께 조회되는 데이터를 같은 문맥 안에서 관리할 수 있었고, invalidate 기준이 명시적으로 드러나 캐시 누락과 중복 fetch를 줄였어요.

---

## 3. 의사결정 시그니처

### 3.1. 검증된 라이브러리 위에 얇은 어댑터

| 라이브러리                          | 어댑터               | 줄 수  |
| ----------------------------------- | -------------------- | ------ |
| `@use-funnel/core`                  | 사내 funnel wrapper  | ~30줄  |
| `react-hook-form` + `zod`           | `useZodForm`         | ~20줄  |
| `react-hot-toast`                   | 사내 toast wrapper   | ~43줄  |
| `react-modal-sheet` + `overlay-kit` | BottomSheet compound | ~100줄 |

검증된 라이브러리는 a11y / 엣지 케이스 / 브라우저 호환성을 이미 풀어두고 있었어요.

### 3.2. Rule of Three

| 사례                              | 도입 시점                                               |
| --------------------------------- | ------------------------------------------------------- |
| `useFunnel` 어댑터                | 4개 플로우 (예약 / 리뷰 / 상담 / 회원정보) 사용 후 추출 |
| BottomSheet compound              | 반복 패턴 발견 후                                       |
| FSD sub-domain                    | 슬라이스 파일 30+ 도달 후 (이건 늦었음 — 1.4 한계 참고) |
| Electron `CandidateServiceHelper` | 3개 플랫폼 동시 사용 시점                               |

### 3.3. 빅뱅 리팩토링은 하지 않는다

- 신규 기능 PR 안에서 해당 영역만 함께 정리했어요.
- widgets → features 이관, kebab-case 표준화 같은 작업도 점진적으로 누적했어요.
- 이유는 회귀 리스크와 리뷰어 부담을 줄이고, 비즈니스 흐름을 멈추지 않기 위해서였어요.

### 3.4. 상태 도구 분리

| 상태          | 도구            |
| ------------- | --------------- |
| Server        | TanStack Query  |
| Form          | RHF / AntD Form |
| UI 전역       | Zustand         |
| 컴포넌트 로컬 | useState        |

### 3.5. AI Workflow

- `jira-branch` 명령으로 JIRA 티켓과 브랜치 맥락을 읽고 계획을 세운 뒤, 구현 후에는 커밋과 PR 생성까지 자동화했어요.
- PR 전에는 AI agent 코드리뷰를 거쳐 critical한 부분을 먼저 점검했고, skills에는 코드 패턴과 기획 맥락을 문서화해 반복 작업의 문맥 비용을 줄였어요.
- worktree를 활용해 2~3개의 작업을 병렬로 진행하며 개발 흐름을 운영했어요.

---

## 4. 연락처

- jingeon27@gmail.com
- [GitHub @jingeon27](https://github.com/jingeon27)
- [Blog](https://blog.bambyul.com/ko/blog)
