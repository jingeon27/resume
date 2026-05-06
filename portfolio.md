# 김진건 Portfolio

> Frontend Engineer
>
> jingeon27@gmail.com · 010-6865-8208 · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

---

## 0. 소개

빠르게 만들어진 서비스에 합류해 기술 부채를 정리하면서 신규 기능을 함께 만들어온 프론트엔드 엔지니어.

- **세이프닥 (2025.05 ~ 현재)** — 복지몰·CMS·병원 CRM 3개 서비스의 단독 Frontend Engineer.
- **왓타임 (2024.01 ~ 2024.11)** — ATS 서비스 round의 Electron 크롤러 아키텍처 재설계 + 면접 템플릿 / 채용 페이지 구현.

| 영역            | 작업                                   | 결과                                                               |
| --------------- | -------------------------------------- | ------------------------------------------------------------------ |
| 제품 분석       | 시술상세 개편 역효과 진단 → CTA 재설계 | 예약 -16% / 상담 -66% / 최종 -40% 진단                             |
| 폼 아키텍처     | 예약 페이지 리팩토링                   | 1,400 → 700줄                                                      |
| 폼 아키텍처     | 가족 데이터 동기화 로직                | 550 → 55줄                                                         |
| 데스크톱 크롤러 | Electron 아키텍처 재설계               | 신규 플랫폼 연동 3일 → 1일 (점핏/잡플래닛/게임잡 3개 도입 후 측정) |
| 디자인 시스템   | `@core` Primitive Component            | 20개 컴포넌트 표준화                                               |
| 모노레포        | Turborepo + pnpm 패키지 분할           | 13개 패키지 + 5개 GitHub Actions workflow                          |
| 코드베이스      | FSD sub-domain 패턴                    | 25 entities / 20 features 슬라이스                                 |

작업 방향: **검증된 라이브러리 위에 얇은 어댑터**. `@use-funnel/core`, `react-hook-form`, `react-modal-sheet`, `overlay-kit`을 다시 만들지 않고 30~50줄 어댑터로 도메인에 통합. **Rule of Three가 충족된 후에만 추상화**.

---

## 1. 세이프닥 (Safedoc) — 2025.05 ~ 현재

병원·의원 복지 할인 플랫폼 3개 서비스 (복지몰 / CMS / 병원 CRM) 단독 Frontend Engineer. 합류 시점 코드베이스는 FSD와 Atomic Design 잔재 혼재, 폼 useState 직접 구현, 디자인 토큰 부재 상태였음. **빅뱅 리팩토링 없이 신규 기능 PR에 해당 영역만 점진 정리**하는 원칙으로 작업.

---

### 1.1. Amplitude 241개 이벤트 + 시술상세 개편 역효과 진단

**가장 임팩트 큰 작업**이라고 본인이 평가하는 사례. 본인이 동의해서 구현한 기능이 사용자 행동을 더 나쁘게 만들었음을 데이터로 증명하고 재설계.

#### 가설과 측정

디자인팀과 합의해 시술 상세 페이지 개편. 가설은 "정보 풍부 → 신뢰 상승 → 전환율 향상". 본인이 동의하고 구현.

배포 후 Amplitude 퍼널 측정.

- 예약 클릭률 -16%
- 상담 클릭률 -66%
- 최종 예약 완료 -40%

#### 진단

퍼널 단계별 이탈 추적 → CTA(예약 / 상담)가 스크롤 깊은 곳에 있어 사용자가 도달 전 이탈. **정보가 풍부해진 만큼 페이지가 길어진 부작용**.

#### 재설계

- 병원 상세 → 시술 상세 → 예약의 3단계 depth → 병원 상세에서 바로 예약 / 상담 가능한 CTA 구조.
- "더 자세히 보기" 누르지 않은 사용자도 행동 가능하도록 sticky CTA 도입.
- A/B 테스트 대신 사후 측정 + 즉시 롤백. 회사 단계상 트래픽이 의미있는 표본을 만들기에 빠듯했음.

#### 한계 / 다시 한다면

- 측정 인프라가 먼저 있어야 진단이 가능했음. 합류 직후 Amplitude 이벤트 설계가 후행됐다면 이 진단도 불가능했을 것.
- 가설 검증 단계에서 본인이 "지표 기준이 뭔가" 충분히 묻지 않았음. 다음 개편부터는 가설 단계에 측정 지표를 합의하는 것을 원칙으로 함.

---

### 1.2. 예약 Form 아키텍처 리팩토링 — 1,400줄 → 700줄

`React Hook Form + Zod + @use-funnel/core` 조합으로 정리.

#### 기존 문제

- `useState` 30개 + props drilling. 단계 전환 시 setState 누적이 렌더 폭증 유발.
- "치과면 견적 금액 필수" 같은 cross-field 검증을 if 분기로 흩뿌림.
- 가족 데이터 동기화 코드 550줄. useEffect 5~6개로 얽힘.

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

`z.infer<typeof schema>`로 schema 변경 시 form 타입 자동 동기화. 기존엔 별도 `interface`로 정의해 schema와 drift 발생.

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

흩뿌렸던 if 분기를 schema 한 곳으로 집결.

#### 결과 / 한계

- 예약 페이지 1,400 → 700줄, 가족 동기화 550 → 55줄 (git diff 기준).
- 패턴은 리뷰 작성, 상담 신청, 회원정보 수정에 재사용.
- **한계**: 700줄도 여전히 큰 컴포넌트. 차후 view 단위로 한 번 더 분할 필요. 이번 작업은 "구조 정리" 단계이고 "view 분할" 은 후속 작업으로 남겨둠.

---

### 1.3. 리뷰 작성 플로우 — 0부터 설계한 신규 도메인 (1,290 LOC)

**기존 코드 정리가 아닌, 0부터 설계한 신규 도메인**.

- 4단계 funnel: 가족 선택 → 평점 + 치료 태그 → 견적 / 보험 → 사진 + 텍스트
- step별 Zod schema + 통합 `ReviewSchema`
- iOS `.heic` → `heic2any` 클라이언트 변환 + 압축
- 가족 정보 자동 입력 (가족 ID에서 prefetch 후 form 주입)
- step 누적 데이터: `@use-funnel/core` history snapshot, RHF는 step 진입 시 동기화
- Amplitude 이벤트 세분화

이후 상담 / 견적 요청 플로우의 레퍼런스 구현으로 사용.

---

### 1.4. SafeDoc App 프론트 아키텍처 정리

#### 합류 시점

- 961 파일 규모. FSD 시도 + Atomic Design 잔재 혼재.
- widgets / features / entities 경계 모호 → 같은 도메인 코드가 여러 슬라이스에 흩어짐.
- Public API 기준 부재 → 직접 deep import. 파일명 case 혼재.

#### 정리

1. **5-layer FSD 표준화**: `app / pages / widgets / features / entities / shared`. (FSD 공식은 5-layer. `processes`는 deprecated)
2. 25 entities / 20 features 슬라이스 경계와 Public API 기준 정립.
3. 위반 케이스 점진 정리: widgets 도메인 컴포넌트 → features 이관, 순환 의존 해소, 파일명 kebab-case.
4. TanStack Query v5 `queryOptions` 패턴 + Server Component prefetch → HydrationBoundary → useSuspenseQuery 흐름 정리.

#### Sub-Domain 패턴 (자체 정립)

FSD 공식에는 없는 패턴. entities / features 안에서 단일 슬라이스의 파일이 30+ 개로 누적되면 평탄한 구조가 가독성을 해침.

```
entities/settlement/
├── common/      # 공통 타입, 유틸
├── contract/    # 계약 단계
├── deposit/     # 입금 단계
├── disapproval/ # 미승인 처리
└── omission/    # 누락 처리
```

도메인 라이프사이클 단계별 분할.

#### 한계 / 다시 한다면

- sub-domain 도입 시점이 늦었음. 30+ 파일이 누적된 후에야 분할 → 마이그레이션 비용 증가. 슬라이스 파일 15개 시점에 도입 결정 기준을 세웠다면 비용이 절반이었을 것.
- "sub-domain은 FSD 공식이 아님" → 신규 합류자 학습 비용. 가이드 문서 후행 작성으로 해결했지만, 처음 도입 시점에 문서를 같이 만들었어야 함.

---

### 1.5. CMS · 병원 CRM — 13 패키지 모노레포 단독 설계

두 앱이 공통 도메인 (예약, 병원정보, 동의서 등)을 공유하면서 각자 도메인 코드는 분리되어야 하는 환경. 모노레포 + 패키지 분할로 절충.

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

초기 `tsup` prebuilt 구조 → 패키지 코드 변경 시 빌드 → 앱 HMR 흐름이 느려 DX 나쁨. `package.json`의 `exports`가 src를 직접 가리키도록 변경해 패키지 코드 변경이 즉시 앱 HMR로 반영.

#### 트레이드오프

- src 직접 노출은 외부 publish 시 재작업 필요. 사내 패키지 한정.
- IDE go-to-definition / 타입 추론은 더 빨라짐 (dist 거치지 않음).
- **단점**: 의존 패키지가 많아질수록 dev 서버 초기 컴파일 시간 증가. 현재는 13 패키지 규모라 문제 없지만, 20+ 가면 빌드 캐시 전략 재검토 필요.

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

서버 응답과 폼 값의 형태가 달라 변환 레이어를 별도 파일로 분리.

| 방향      | 함수                               | 역할                                                                            |
| --------- | ---------------------------------- | ------------------------------------------------------------------------------- |
| 서버 → 폼 | `programDetailToClientProgramForm` | `Dayjs` 변환, `imageId` → `UploadFile[]`, 템플릿 데이터 → `Form.List` 구조      |
| 폼 → 서버 | `clientProgramFormToCreateRequest` | `Dayjs` → ISO string, `UploadFile[]` → `imageId` 추출, `before/after` 페어 검증 |

검수는 변경 전후 비교가 필요해 별도 변환 파일 (`program.inspection.transfer.ts`) 에서 `originPrice`, `originDiscountPrice` 같은 변경 전 값을 폼에 같이 주입.

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

`useWatch` + `useDeepCompareEffect`로 부분 유효성을 실시간 체크해 추가 버튼 활성화 / 비활성화 제어.

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

업로드 실패 / 진행 중 상태를 별도 state로 관리하지 않고 폼 validator 한 곳에서 판단.

#### 5) 검수 흐름 — 단일 폼 인스턴스 + 상태 머신

처음 설계는 "이전 / 새 버전 두 폼 인스턴스 side-by-side" 였지만, **두 폼을 동기화하는 비용이 컸고 변경 추적은 DB 레벨에서 가능** 해 **단일 폼 인스턴스 + Callout 상태 배지** 로 단순화.

- `PROGRAM_INSPECTION_STATUS` enum으로 상태 머신 관리: `Request → Waiting → Confirm | Reject`
- `Request / Waiting` 만 편집 가능, 나머지는 `disabled` prop으로 폼 잠금
- 변경 전후 비교는 `originPrice` 등 별도 필드로 폼에 같이 주입 → 같은 화면에서 비교

#### 6) Cross-app 추출 (Rule of Three)

처음엔 Admin (CMS) 에만 있던 도메인 → 병원 CRM에도 동일 흐름 필요해짐 → Admin 안정화 후 `@safedoc/features`로 추출.

#### 한계 / 다시 한다면

- **서버 임시저장 부재**: 현재는 `form.resetFields()` 기반 UI 레벨 reset만. 페이지 이탈 시 값 손실 (경고 다이얼로그 없음). 후속으로 `localStorage` 기반 draft + `beforeunload` 가드 도입 필요. 처음 설계 시 draft sub-domain을 만들 계획이었으나 우선순위 조정으로 deprioritize.
- **Transfer 함수의 단위 테스트 부재**: 변환 로직이 복잡해 (10+ 분기) 회귀 위험이 가장 큰 영역인데 테스트 없음. 보강 우선순위 1순위.
- **상세 이미지 변환 (`program.transfer.helper.ts` 200+ 줄)**: SafeDoc 템플릿 ↔ 커스텀 이미지 분기가 함수 안에 누적되어 가독성 낮음. 템플릿 종류별로 strategy pattern 분리가 적합했을 것.

---

### 1.7. 정산 도메인 — Middleware + Optimistic Update

정산은 권한 / 감사 측면에서 별도 호스트 운영. 코드는 단일 레포 유지.

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

`queryClient.getQueriesData()`로 패턴 매칭되는 모든 쿼리에 일괄 적용 → 정산내역 / 숨김처리 비교 두 탭이 동시 갱신.

#### 트레이드오프 / 한계

- URL 파라미터 토큰 위임은 브라우저 history / Referer / 서버 access log 노출 위험이 있음. **단일 사용 단명 토큰 + HTTPS 전제** 로 운영하지만, 보안 측면에서 더 단단한 방법은 별도 OAuth-style 인가 코드 교환. 현재는 운영 단계상 절충이며, 트래픽 / 감사 요구가 강해지면 교체 필요.

---

### 1.8. 그 외 세이프닥 작업

- **`@core` 디자인 시스템 sub-PR 17~18개 작성**: typography / border-radius / shadow 토큰, selection (Checkbox/Radio/Toggle), Chip / Menu / Tabs, Toast 영역. Radix UI / Headless UI 위에 `tailwind-variants`로 size/intent/state 3축 표준화.
- **BottomSheet Compound (`Root/Header/Content/Footer`)** + `react-modal-sheet` + `overlay-kit` 통합. route change / popstate / backdrop pointer-events / setTimeout cleanup 4가지 모바일 엣지 케이스를 라이프사이클 레이어 한 곳에서 처리.
- **콜인 / 워크인 듀얼 패스 동의서**: `PROXY_RESERVATION_INFLOW_TYPE` enum으로 분기, `AgreementCallInFormValues` (4 필드) / `AgreementWalkInFormValues` (1 필드) 분리. 진입 시점에 `inflowType`으로 컴포넌트 분기.
- **병원 검색**: `geolib` 거리 계산 + `naver-maps` SDK + `react-intersection-observer` 무한 스크롤 + 자동완성 / 인기 검색어. `infiniteSetData` 헬퍼로 `useInfiniteQuery` nested page 안의 개별 아이템 업데이트 처리.

---

## 2. 왓타임 (Whattime / round) — 2024.01 ~ 2024.11

캘린더 기반 일정 조율 + ATS 솔루션 SaaS. ATS 서비스 round 담당.

### 2.1. Electron 크롤러 아키텍처 재설계 — MVC + DI + Factory Pattern

#### 배경

채용 플랫폼 (점핏 / 잡플래닛 / 게임잡)에서 인재 정보 수집 → 자체 DB 통합. 플랫폼마다 별도 구현체 + 공통 흐름 (로그인 → 검색 → 수집 → 업로드)이 반복 / 변형.

- 플랫폼 N개 = 비슷하지만 미묘하게 다른 코드 N개. 한쪽 버그 픽스가 다른 쪽 누락.
- 신규 플랫폼 추가 시 기존 코드 복사 + 차이점 패치 = **3개 플랫폼 평균 3일 (본인이 직접 도입했던 작업 시간 기준)**.

#### 구조

```
Controller (CandidateServiceHelper)
   ├── Model (CandidateRepository: S3, DB 어댑터)
   └── PlatformAdapter (플랫폼별 DOM 조작)
         └── Factory (PlatformAdapterFactory)
```

```ts
class CandidateServiceHelper {
  constructor(
    private adapter: PlatformAdapter,
    private repository: CandidateRepository,
  ) {}

  async run() {
    await this.adapter.login();
    const candidates = await this.adapter.search(criteria);
    const data = await this.adapter.collect(candidates);
    await this.repository.upload(data);
  }
}
```

- 공통 흐름은 한 곳, 플랫폼별 차이점은 adapter 안에만.
- 신규 플랫폼: `PlatformAdapter` 인터페이스 구현 + factory 등록만. **3일 → 1일 (본인 측정)**.
- DI로 단위 테스트 가능 구조.

#### 한계 / 다시 한다면

- DOM 셀렉터 / 로그인 흐름은 플랫폼이 UI 변경하면 바로 깨짐. 재설계는 구조를 정리했지만 **DOM 변경에 대한 회복 탄력성은 별도**. 셀렉터 헬스체크 + 알람을 같이 만들었다면 운영 비용이 더 줄었을 것.
- DI는 도입했지만 실제 단위 테스트는 시간 부족으로 못 작성. 구조만 갖춰두고 테스트는 후행이 된 케이스.

---

### 2.2. 면접 템플릿 / 온보딩 4단계 funnel

`useFunnel` (단계 전환) + `usePromiseSessionStorage` (단계 데이터 자동 백업, 새로고침 / 탭 닫힘 후 복원) + `FormDirtyContext` (변경 있음 전역 노출, `beforeunload` + 라우터 이벤트 confirm) 통합. 면접 템플릿 / 온보딩 / 자동화 규칙 / 평가 템플릿 4가지 흐름에 동일 패턴 재사용.

---

### 2.3. 그 외 왓타임 작업

- **채용 페이지 / 지원서 설정 폼**: `React Hook Form` + `useFieldArray` + `FormProvider` + `useYupValidation`. 세이프닥 `useZodForm`의 yup 버전 원형.
- **메일 / 알림 템플릿**: `@whattime/quill` 기반 WYSIWYG + 템플릿 변수 시스템 (`{{candidateName}}` placeholder 치환). quill blot 시스템으로 변수를 atomic node 처리.
- **Server State 표준화**: `@lukemorales/query-key-factory`로 candidate / recruit / member / interviewAlarm 도메인 query key 표준화. 무효화 누락 / 키 drift 제거.
- **DnD 공고 정렬**: `@dnd-kit` (DndContext + SortableContext + PointerSensor + arrayMove). optimistic update + 자동 롤백.
- **roundhr.com 랜딩**: Next.js + GSAP ScrollTrigger + Notion CMS + `react-notion-x`.

---

## 3. 의사결정 시그니처

### 3.1. 검증된 라이브러리 위에 얇은 어댑터

| 라이브러리                          | 어댑터               | 줄 수  |
| ----------------------------------- | -------------------- | ------ |
| `@use-funnel/core`                  | 사내 funnel wrapper  | ~30줄  |
| `react-hook-form` + `zod`           | `useZodForm`         | ~20줄  |
| `react-hot-toast`                   | 사내 toast wrapper   | ~43줄  |
| `react-modal-sheet` + `overlay-kit` | BottomSheet compound | ~100줄 |

검증된 라이브러리는 a11y / 엣지 케이스 / 브라우저 호환성을 이미 풀어둠.

### 3.2. Rule of Three

| 사례                              | 도입 시점                                               |
| --------------------------------- | ------------------------------------------------------- |
| `useFunnel` 어댑터                | 4개 플로우 (예약 / 리뷰 / 상담 / 회원정보) 사용 후 추출 |
| BottomSheet compound              | 반복 패턴 발견 후                                       |
| FSD sub-domain                    | 슬라이스 파일 30+ 도달 후 (이건 늦었음 — 1.4 한계 참고) |
| Electron `CandidateServiceHelper` | 3개 플랫폼 동시 사용 시점                               |

### 3.3. 빅뱅 리팩토링은 하지 않는다

- 신규 기능 PR 안에 해당 영역만 함께 정리.
- widgets → features 이관, kebab-case 표준화 등은 점진적 누적.
- 이유: 회귀 리스크, 리뷰어 부담, 비즈니스 흐름 정지.

### 3.4. 상태 도구 분리

| 상태          | 도구            |
| ------------- | --------------- |
| Server        | TanStack Query  |
| Form          | RHF / AntD Form |
| UI 전역       | Zustand         |
| 컴포넌트 로컬 | useState        |

---

## 4. 연락처

- jingeon27@gmail.com
- 010-6865-8208
- [GitHub @jingeon27](https://github.com/jingeon27)
- [Blog](https://jingeon27.tistory.com/)
