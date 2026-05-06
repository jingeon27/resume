# 김진건 Portfolio

> Frontend Engineer
>
> jingeon27@gmail.com · 010-6865-8208 · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

---

## 0. 소개

빠르게 만들어진 서비스에 합류해 기술 부채와 구조적 문제를 정리하면서 신규 기능을 함께 만들어온 프론트엔드 엔지니어.

- **세이프닥 (2025.05 ~ 현재)** — 복지몰·CMS·병원 CRM 3개 서비스의 단독 Frontend Engineer. 961 파일 SafeDoc App과 13개 패키지 모노레포(CMS·병원 CRM)의 구조 정리, 신규 기능 개발·운영 병행.
- **왓타임 (2024.01 ~ 2024.11)** — ATS 서비스 round의 Electron 크롤러 아키텍처를 MVC + DI + Factory Pattern으로 재설계. 면접 템플릿·채용 페이지 등 핵심 워크플로우의 폼·서버 상태 표준 정립.

| 영역 | 작업 | 결과 |
| --- | --- | --- |
| 폼 아키텍처 | 예약 페이지 리팩토링 | 1,400줄 → 700줄 |
| 폼 아키텍처 | 가족 데이터 동기화 로직 | 550줄 → 55줄 |
| 데스크톱 크롤러 | Electron 아키텍처 재설계 | 코드 중복 70% 감소, 신규 플랫폼 연동 3일 → 1일 |
| 제품 분석 | 시술상세 개편 역효과 진단 | 예약 -16% / 상담 -66% / 최종 예약 -40% 진단 후 CTA 재설계 |
| 디자인 시스템 | `@core` Primitive Component | 20개 컴포넌트 표준화 |
| 모노레포 | Turborepo + pnpm 패키지 분할 | 13개 패키지 + 5개 GitHub Actions workflow |
| 코드베이스 | FSD sub-domain 패턴 | 25 entities / 20 features 슬라이스 |

작업의 일관된 방향은 "검증된 라이브러리 위에 얇은 어댑터로 추상화 비용 최소화". `@use-funnel/core`, `react-hook-form`, `react-modal-sheet`, `overlay-kit`을 다시 만들지 않고 30~50줄 어댑터로 도메인에 통합. 1,400줄 → 700줄도 새 추상화가 아니라 라이브러리 정확한 활용 + 중복 제거의 결과.

---

## 1. 세이프닥 (Safedoc) — 2025.05 ~ 현재

병원·의원 복지 할인 플랫폼 3개 서비스(복지몰 / CMS / 병원 CRM)의 단독 프론트엔드 엔지니어.

### 1.1. 합류 시점 상태

- **SafeDoc App (복지몰)**: 961 파일. UI는 Legacy와 신규 컴포넌트 혼재. 폼이 매번 useState 기반으로 직접 구현, 같은 도메인이 여러 위치에서 중복.
- **CMS / 병원 CRM**: 단일 패키지에 두 앱의 도메인 코드가 섞임. 공통 폼 워크플로우(예약, 병원정보)가 매번 다르게 구현.
- **공통**: FSD 시도 + Atomic Design 잔재 혼재. widgets / features / entities 경계 모호. 디자인 토큰 부재, inline className override 다수, 서버 상태 캐시 전략 부재.

원칙은 "빅뱅 리팩토링은 하지 않는다, 신규 기능을 핑계로 구조를 점진적으로 정리한다".

---

### 1.2. 복지몰 `@core` 디자인 시스템 — Primitive Component 20개

Radix UI / Headless UI를 다시 구현하지 않고 그 위에 얇은 어댑터로 정리. Radix는 a11y / 키보드 인터랙션 / focus management를 이미 풀어둠.

#### 배경

Legacy UI에는 다음 패턴이 반복됨.

```tsx
<button className={`${baseStyles} ${size === 'lg' ? 'h-12' : 'h-10'} ${className}`}>
```

inline override는 디자인 시스템 통일성을 깨고, variant / size / state 조합 폭발을 className에 떠넘기고, 토큰 변경 시 모든 호출부 수정 비용을 만듦.

#### 결정

- Radix UI / Headless UI 기반으로 `Button`, `Input`, `BottomSheet`, `Dialog`, `Toast`, `Tooltip`, `Callout`, `Checkbox`, `Radio`, `Toggle`, `Tabs`, `Chip`, `Menu` 등 20개 Primitive 공통화.
- `tailwind-variants`로 `size / intent / state` 3축 표준화. compound variants로 "primary + disabled" 조합을 명시.
- BottomSheet는 Compound Pattern (`Root / Header / Content / Footer`)으로 props 폭발 차단.

#### BottomSheet 모바일 엣지 케이스

1. **route change**: 시트 열린 상태에서 페이지 이동 시 시트 잔존
2. **popstate**: 안드로이드/브라우저 뒤로가기로 페이지 자체가 이전으로 돌아감
3. **backdrop pointer-events 누수**: 닫힘 애니메이션 중 backdrop이 클릭 가로챔
4. **setTimeout cleanup**: 닫히기 전 unmount 시 cleanup 누락

호출자가 신경 쓰지 않도록 라이프사이클 레이어 한 곳에서 처리.

- 시각적 동작 (드래그, 스냅, 애니메이션) → `react-modal-sheet`
- 라이프사이클 (open / close / unmount) → `overlay-kit`
- popstate / pathname change 구독 + cleanup은 라이프사이클 콜백에서 일괄 처리

이전엔 글로벌 config 객체에 등록하는 패턴 → 명시적 함수 호출로 전환. 어디서 시트가 열리는지 코드에서 바로 보임.

#### `useControllableChecked`

Radix `useControllableState`와 같은 컨셉을 직접 구현.

```ts
function useControllableChecked(props: { checked?: boolean; defaultChecked?: boolean; onChange?: (value: boolean) => void }) {
  // checked undefined → uncontrolled (내부 state만 갱신)
  // checked 정의 → controlled (외부 state만 반영)
  // onChange는 모드 무관하게 항상 호출
}
```

Radix를 그대로 쓸 수도 있었지만 사내 사용 범위가 좁아 단순 버전 유지가 인지 비용 측면에서 더 나음. 추상화 레벨을 의도적으로 낮춘 케이스.

#### 결과

- sujinKim과 페어 프로그래밍, 17~18개 sub-PR 본인 author. typography, border-radius, shadow 토큰 / selection (Checkbox/Radio/Toggle) / Chip, Menu, Tabs / Toast 영역 담당.
- Legacy → `@core` 전환으로 inline className override 안티패턴 제거.

---

### 1.3. 예약 Form 아키텍처 리팩토링 — 1,400줄 → 700줄

새 폼 라이브러리를 만들지 않고 `React Hook Form + Zod + @use-funnel/core` 조합으로 정리. 50% 축소는 추상화 도입이 아니라 중복 제거 + 라이브러리 정확한 활용의 결과.

#### 기존 문제

- `useState` 30개 + props drilling. 단계 전환 시 setState 누적이 렌더 폭증 유발.
- "치과면 견적 금액 필수", "우대가 미수령 시 사유 필수" 같은 cross-field 검증을 if 분기로 흩뿌림.
- 가족 데이터 동기화 코드 550줄. "가족 선택 → 보험 정보 자동 채움 → 일부 필드는 사용자 덮어쓰기" 흐름이 useEffect 5~6개로 얽힘.

#### 결정

1. 단계 관리는 `@use-funnel/core`에 위임. 30줄 어댑터로 도메인 step type만 합성.
2. 폼 상태는 `react-hook-form` 단일 소유. view 컴포넌트의 로컬 state 제거.
3. 검증은 Zod schema로 선언적 표현. step별 schema 분리, `superRefine`으로 cross-field.
4. 가족 동기화는 `setValue` + Zod default 조합으로 단순화. useEffect 체인을 watch + setValue 한 번으로 축약.

#### `useZodForm` 어댑터

```ts
type UseZodFormProps<T extends ZodObject<any>> = Omit<UseFormProps<z.infer<T>>, 'resolver'> & { schema: T };

export function useZodForm<T extends ZodObject<any>>(props: UseZodFormProps<T>) {
  return useForm<z.infer<T>>({
    ...props,
    resolver: zodResolver(props.schema),
  });
}
```

핵심은 schema 변경 시 form 타입이 자동 동기화. 기존엔 `interface ReservationForm`을 별도 정의해 schema와 drift 발생. `z.infer<typeof schema>`로 단일 소스 통합.

#### `superRefine` Cross-Field Validation

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

흩뿌렸던 if 분기를 schema 한 곳으로 모음. 새 진료과 추가 시 수정 위치 명확. 검증 로직이 form 라이브러리에 통합되어 에러 표시 자동 동작.

#### `baseReset` 고차함수

3 step 폼에서 step 1 데이터가 step 3에서 필요한 경우, funnel state에 누적하면서 RHF form state도 step 전환 시 reset 동기화 필요.

```ts
const baseReset =
  <S extends FieldValues>(prevValues: Partial<S>) =>
  (form: UseFormReturn<S>) => {
    form.reset({ ...form.getValues(), ...prevValues });
  };
```

step 전환 직전에 이전 값을 다음 step form에 주입. 호출부는 `baseReset(prev)(nextForm)` 한 줄.

#### 결과

- 예약 페이지 1,400 → 700줄 (50% 축소)
- 가족 데이터 동기화 550 → 55줄 (90% 축소)
- 패턴은 리뷰 작성, 상담 신청, 회원정보 수정에 재사용

---

### 1.4. 리뷰 작성 플로우 — 1,290 LOC

단계별 schema + cross-field validation + 이미지 압축 + 분석 이벤트 통합.

- 4단계 funnel: 가족 선택 → 평점 + 치료 태그 → 견적 / 보험 → 사진 + 텍스트
- step별 Zod schema: `ReviewStep1Schema`, `ReviewStep2Schema`, `ReviewStep3Schema` + 통합 `ReviewSchema`
- iOS `.heic` → `heic2any`로 클라이언트 변환 후 압축. 메인 스레드 블록 가능성 있어 "변환 중" 피드백 명시.
- 가족 정보 자동 입력: 가족 ID에서 보험 / 진료 이력 prefetch 후 form 주입.
- step 누적 데이터 단일 소스: `@use-funnel/core` history snapshot. RHF는 step 진입 시마다 `baseReset` 동기화로 funnel ↔ form drift 방지.
- Amplitude: step 진입 / 이탈 / 완료 / 사진 첨부 / 평점 입력 세분화.

이후 상담, 견적 요청 플로우의 레퍼런스 구현.

---

### 1.5. 병원 검색 — 거리 / 지도 / 무한 스크롤

- `geolib` — 사용자 위치 ↔ 병원 좌표 거리 계산. 정렬 / 필터링.
- `naver-maps` SDK — 마커 / 클러스터링 / 카메라 이동.
- `react-intersection-observer` + TanStack Query `useInfiniteQuery` 무한 스크롤.
- 자동완성 + 인기 검색어 + 실시간 검색 카운트.

#### `infiniteSetData` 헬퍼

`useInfiniteQuery`는 `pages: [Page1, Page2, ...]` 구조라 특정 항목 업데이트 시 nested unwrap → update → wrap 필요.

```ts
infiniteSetData<TPage, TItem>(
  queryClient,
  queryKey,
  (item) => item.id === targetId,
  (item) => ({ ...item, isBookmarked: true }),
);
```

찜하기 토글, 카운트 증가 등 무한 스크롤 안의 개별 아이템 업데이트를 타입 안전하게 처리.

---

### 1.6. 제품 분석 — Amplitude 241개 이벤트 + 역효과 진단

구현한 기능이 제품을 더 나쁘게 만들었음을 데이터로 증명한 사례.

#### 가설

디자인팀과 시술 상세 페이지 개편. 가설은 "정보 풍부 → 신뢰 상승 → 전환율 향상".

#### 측정

배포 후 Amplitude 퍼널 측정 결과.

- 예약 클릭률 -16%
- 상담 클릭률 -66%
- 최종 예약 완료 -40%

가설과 정반대.

#### 진단

퍼널 단계별 이탈 추적 → 새 상세 페이지는 CTA(예약 / 상담)가 스크롤 깊은 곳에 있어 사용자가 도달 전 이탈. 정보가 풍부해진 만큼 페이지 길이가 길어진 부작용.

#### 재설계

- 병원 상세 → 시술 상세 → 예약 의 3단계 depth → 병원 상세에서 바로 예약 / 상담 가능한 CTA 구조.
- "더 자세히 보기" 누르지 않은 사용자도 행동 가능하도록 sticky CTA 도입.
- A/B 테스트 대신 사후 측정 + 즉시 롤백. 회사 단계상 트래픽이 의미있는 표본을 만들기에 빠듯.

#### 학습

- 디자인 가설은 사용자 행동으로 검증. 풍부한 정보가 항상 좋은 것은 아님.
- 분석 인프라가 없으면 진단 자체가 불가능. 인프라 구축이 제품 의사결정의 전제조건.
- 241개 이벤트는 단순 수가 아니라 "사용자 흐름의 모든 분기점에 측정 지점" 원칙의 결과.

---

### 1.7. SafeDoc App 프론트 아키텍처 — FSD 6-layer 표준화

#### 합류 시점

- 961 파일.
- FSD 시도 + Atomic Design 잔재.
- widgets / features / entities 경계 모호. 같은 도메인 코드가 여러 슬라이스에 흩어짐.
- Public API 기준 부재 → 직접 deep import.
- 파일명 case 혼재 (PascalCase / camelCase / kebab-case).

#### 정리

1. 6-layer FSD 표준화: `app / pages / widgets / features / entities / shared`. 의존 방향 (`app → pages → widgets → features → entities → shared`) 표준화.
2. 25개 entities / 20개 features 슬라이스 경계와 Public API 기준 정립.
3. 위반 케이스 점진 정리: widgets 도메인 컴포넌트 → features 이관, 순환 의존 해소, 파일명 kebab-case.
4. TanStack Query v5: `queryOptions` 패턴으로 `useQuery / useSuspenseQuery / prefetchQuery / getQueryData` 호출부 통합. Server Component prefetch → HydrationBoundary → useSuspenseQuery 흐름 정리.

#### Sub-Domain 패턴

FSD 공식 문서엔 sub-domain 개념 없음. entities / features 안에서 단일 슬라이스의 파일이 30+ 개로 누적되면 평탄한 구조가 가독성을 해침. 자체 정립한 패턴.

```
entities/settlement/
├── common/      # 공통 타입, 유틸
├── contract/    # 계약 단계
├── deposit/     # 입금 단계
├── disapproval/ # 미승인 처리
└── omission/    # 누락 처리
```

도메인 라이프사이클 단계별 분할. 도입 시점은 슬라이스 파일 수와 변경 빈도 기준으로 판단.

features에서도 UI 블록 의존성을 폴더 트리에서 가시화하는 sub-feature 패턴.

```
features/program/ui/
├── detail/
│   ├── form/
│   ├── preview/
│   └── callout/
└── modal/
```

#### 결과

- 신규 도메인 추가 시 "어디에 둘지" 토론 사라짐.
- 단독 운영자의 가장 큰 리스크인 "설계 일관성 무너짐"을 패턴 + 가이드로 방어.

---

### 1.8. CMS · 병원 CRM — 13 패키지 모노레포 단독 설계

두 앱이 70% 코드를 공유하면서도 도메인은 다름. 단일 패키지로 두면 도메인이 섞이고, 완전 분리하면 공유 코드가 4배. 모노레포 + 패키지 분할로 절충.

#### 패키지 구조

13개 = 3 config + 5 shared + 2 lib + entities + features.

| 카테고리 | 역할 |
| --- | --- |
| `@safedoc/eslint-config`, `@safedoc/tsconfig`, `@safedoc/tailwind-config` | 빌드 / 린트 / 스타일 공통 설정 |
| `@safedoc/ui` (shared) | Primitive Component (Button, Input, Modal 등) |
| `@safedoc/icons`, `@safedoc/utils`, `@safedoc/types`, `@safedoc/api` (shared) | 도메인 무관 자산 |
| `@safedoc/auth`, `@safedoc/analytics` (lib) | 인증 / 분석 어댑터 |
| `@safedoc/entities` | 비즈니스 엔티티 |
| `@safedoc/features` | 두 앱이 공유하는 사용자 시나리오 |

#### `@safedoc/ui` no-build bundled 전환

초기엔 `tsup` prebuilt.

```
@safedoc/ui 코드 변경 → tsup 빌드 → 앱이 dist 참조 → HMR
```

앱에서 패키지 코드를 수정해도 빌드를 다시 돌려야 반영되어 DX가 나쁨. `package.json`의 `main` / `exports`가 src를 직접 가리키도록 변경.

```json
{
  "name": "@safedoc/ui",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

패키지 코드 변경이 즉시 앱 HMR로 반영. 외부 publish 안 하는 내부 패키지 한정의 의도적 트레이드오프.

#### Turborepo + GitHub Actions

- 5 workflows: prod / stage / dev deploy + lint + slack-alarm
- `dorny/paths-filter`로 변경 감지 → CMS만 변경되면 CMS만 배포.
- pnpm catalog로 공통 의존성 단일 관리. React 19 / Next 15 같은 메이저 업그레이드 시 catalog 한 줄 수정으로 전체 동기화.

---

### 1.9. Program 도메인 — 30+ 파일 sub-domain 분할

CMS와 병원 CRM이 공유하는 가장 큰 도메인. 등록 → 임시저장 → 검수 → 배포 워크플로우.

```
program/
├── common/      # 공통 폼 필드, 검증, 타입
├── draft/       # 임시저장
└── inspection/  # 검수 (side-by-side 비교)
```

#### Ant Design Form

CMS / 병원 CRM은 Ant Design 기반. AntD `Form`은 RHF와 다른 패러다임 (uncontrolled + 내부 store).

- `Form.List` + `shouldUpdate` + `useWatch` 조합 cascade validation. 한 필드 변경이 다른 필드 검증에 영향을 주는 의존성을 선언적으로 관리.
- `Form.Item` custom trigger (`onDragTable`)로 DragTable의 순서 변경을 폼 상태에 자동 반영.
- 이미지 비동기 validation: 업로드 완료 + 사이즈 / 포맷 검증을 `Form.Item` validator에 통합.

#### 검수 워크플로우 (competition drawer)

이전 버전과 새 버전 side-by-side 비교. 1200px drawer에 두 폼을 동시에 띄우고 변경된 필드만 highlight. `askBeforeClose` 훅으로 변경 있을 때 닫기 전 확인.

#### Cross-app 추출

처음엔 Admin (CMS)에만 있던 Program 도메인이 병원 CRM에도 동일 흐름 필요해짐. Admin 구현 안정화 후 `@safedoc/features`로 추출. Rule of Three 충족 후 추상화한 사례.

---

### 1.10. 정산 도메인 — 별도 호스트 + 단일 코드베이스

정산은 보안 / 권한 / 감사 측면에서 별도 호스트 필요. 코드는 단일 레포 운영이 효율적. Next.js Middleware + Route Group으로 절충.

- **Middleware**: `/settlement/*` 진입 시 별도 호스트로 redirect, `accessToken` / `refreshToken`을 URL 파라미터로 cross-domain 위임. (HTTPS 채널 위 한 번 사용 토큰이라 노출 윈도우 좁음 전제)
- **Route Group `(altLayout)/settlement`**: 같은 코드베이스에서 별도 레이아웃. 환경 변수로 도메인 게이팅해 dev / stage / prod 분기.
- **legacy fetch/apis → FSD entities/features 마이그레이션**: 정산 도메인 데이터 페칭 표준화.

#### Optimistic Update + 자동 롤백

정산 데이터의 "숨김 처리" 같은 토글 동작이 빈번. 서버 응답 대기 시 UI가 굼뜸.

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

---

### 1.11. 콜인 / 워크인 듀얼 패스 동의서

같은 "예약 동의" 도메인이지만 콜인 / 워크인 두 경로의 동의 항목이 다름.

- 콜인: 통화녹취, 개인정보 수집, 제3자 제공, 민감정보 — 4개
- 워크인: 제3자 제공 — 1개

단일 폼 타입으로 합치면 콜인 전용 필드를 워크인에서 optional로 만들어야 해서 어느 경로에 어떤 필드가 필요한지 코드에서 안 읽힘.

#### 분리

유입 타입별로 폼 타입과 컴포넌트 분리.

- 유입 enum: [`PROXY_RESERVATION_INFLOW_TYPE`](monorepo/safedoc-react/packages/shared/types/src/reservation.type.ts#L26) (`CallIn` | `WalkIn`)
- 폼 타입: [`AgreementCallInFormValues`](monorepo/safedoc-react/packages/features/src/reservation/ui/consent/agreements-content/CallInAgreementContent.tsx#L12) — `Record<필드명, boolean>`
- 폼 타입: [`AgreementWalkInFormValues`](monorepo/safedoc-react/packages/features/src/reservation/ui/consent/agreements-content/WalkInAgreementContent.tsx#L7) — `Record<필드명, boolean>`
- 진입 시점에 `inflowType`으로 `CallInAgreementContent` / `WalkInAgreementContent` 중 하나 렌더.

콜인 전용 필드를 워크인 코드에서 실수로 참조 불가.

#### Cross-app 공유

양쪽 동의서 콘텐츠를 `@safedoc/features`의 `reservation/ui/consent`에 두어 CMS / 병원 CRM 양쪽에서 같은 컴포넌트 import. 문구 변경 시 한 곳만 수정.

---

### 1.12. 정량 결과

| 지표 | 값 |
| --- | --- |
| 양쪽 레포 합산 커밋 | 2,925개 (1위) |
| 코드 라인 | +147K / -135K (리팩토링 비중 압도적) |
| 예약 폼 리팩토링 | 1,400 → 700줄 (50% 축소) |
| 가족 동기화 | 550 → 55줄 (90% 축소) |
| Amplitude 이벤트 | 241개 |
| 시술상세 개편 진단 | 예약 -16% / 상담 -66% / 최종 -40% |
| `@core` 디자인 시스템 PR | 17~18개 sub-PR |
| FSD 코드베이스 | 25 entities / 20 features 슬라이스 |
| 모노레포 패키지 | 13개 |
| GitHub Actions workflows | 5개 |

---

## 2. 왓타임 (Whattime / round) — 2024.01 ~ 2024.11

캘린더 기반 일정 조율 + ATS 솔루션을 제공하는 B2B SaaS 기업의 ATS 서비스 round.

### 2.1. Electron 크롤러 아키텍처 재설계 — MVC + DI + Factory Pattern

코드 중복 70% 감소 / 신규 플랫폼 연동 3일 → 1일.

#### 배경

round는 채용 플랫폼(점핏 / 잡플래닛 / 게임잡 등)에서 인재 정보를 수집해 자체 DB에 통합. Electron Desktop 앱이 각 플랫폼 로그인 → 검색 → 후보자 정보 수집 → S3 업로드를 자동화.

문제는 플랫폼마다 별도 구현체가 있고 공통 흐름이 반복 / 변형되어 있었던 것.

- 플랫폼 N개 = 비슷하지만 미묘하게 다른 코드 N개. 한쪽 버그 픽스가 다른 쪽 누락.
- 신규 플랫폼 추가 시 기존 코드 복사 + 차이점 패치 = 평균 3일.
- 플랫폼별 DOM 셀렉터 / 로그인 흐름 / 페이지네이션이 한 파일에 섞임.

#### 구조

MVC + DI + Factory Pattern으로 재설계.

```
Controller (CandidateServiceHelper)
   │
   ├── Model (CandidateRepository: S3, DB 어댑터)
   │
   └── View Logic (PlatformAdapter: 플랫폼별 DOM 조작)
         │
         └── Factory (PlatformAdapterFactory: 플랫폼명 → adapter 인스턴스)
```

#### `CandidateServiceHelper` — 4단계 표준화

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

- 공통 흐름은 한 곳: 로그인 → 검색 → 수집 → 업로드. 변경 시 한 군데만 수정.
- 플랫폼별 차이점은 adapter 안에만: 점핏의 DOM 셀렉터, 잡플래닛의 로그인 폼, 게임잡의 페이지네이션.
- DI로 테스트 가능: 가짜 adapter / repository를 주입해 단위 테스트.

#### Factory

```ts
const adapter = PlatformAdapterFactory.create('jumpit'); // 또는 'jobplanet', 'gamejob'
```

신규 플랫폼은 `PlatformAdapter` 인터페이스 구현 + factory 등록만. 3일 → 1일의 핵심.

#### S3 이력서 수집

후보자 첨부 이력서(PDF / 이미지) 다운로드 → S3 presigned URL 업로드 → 자체 DB에 메타데이터 저장. 다운로드 / 업로드 양쪽 progress 추적해 Electron renderer에 IPC로 전달.

#### 학습

- "비슷한 코드 N개"가 보일 때 단순 중복인지 본질적으로 다른지 구분이 첫 단계.
- 공통 흐름 + 플랫폼별 차이점이라는 2축 모델이 보였을 때 추상화가 안전해짐.
- Rule of Three 충족 (3개 플랫폼) 후 추상화 비용이 정당화됨.

---

### 2.2. 면접 템플릿 / 온보딩 플로우 — 4단계 funnel

HR 담당자가 면접 템플릿을 만드는 4단계 흐름 (정보 입력 → 질문 구성 → 평가 기준 → 미리보기). 단계 데이터가 다음 단계 검증에 필요하고, 사용자 이탈 시 복원 필요.

- `useFunnel` — 단계 전환.
- `usePromiseSessionStorage` — 단계 데이터를 sessionStorage에 자동 백업. 새로고침 / 탭 닫힘 후 복원.
- `FormDirtyContext` — "변경 있음" 전역 노출. `beforeunload` + 라우터 이벤트로 confirm 다이얼로그.

3가지를 한 퍼널로 통합. 면접 템플릿 / 온보딩 / 자동화 규칙 / 평가 템플릿 4가지 흐름에 동일 패턴 재사용.

---

### 2.3. 채용 페이지 / 지원서 설정 폼

- `React Hook Form` + `useFieldArray` — 동적 필드 (질문 N개 추가 / 삭제 / 재정렬).
- `FormProvider` — 하위 컴포넌트 form context 전달, props drilling 제거.
- `useYupValidation` 어댑터 — schema 통합 (왓타임 시점 사내 표준은 yup).

세이프닥 `useZodForm`의 원형이 yup 버전으로 한 번 구현된 셈. schema 추론 → form 타입 자동 동기화 패턴이 라이브러리 무관하게 적용된다는 학습.

---

### 2.4. 메일 / 알림 템플릿 시스템

- `@whattime/quill` 기반 WYSIWYG.
- 템플릿 변수 시스템: `{{candidateName}}`, `{{interviewDate}}` placeholder를 본문에 삽입 → 실시간 미리보기에서 실제 값 치환.
- 변수 자동완성 + 미리보기 분리 패널.

WYSIWYG는 placeholder의 DOM 표현 vs 데이터 표현 동기화가 핵심. quill blot 시스템을 학습해 변수를 atomic node로 처리.

---

### 2.5. Server State 표준화 — `@lukemorales/query-key-factory`

TanStack Query 사용은 표준화돼 있었지만 query key가 string array로 곳곳에 흩뿌려져 있어 캐시 분리 / 무효화 누락 / key 변경 시 grep 의존 문제.

```ts
const candidateKeys = createQueryKeys('candidate', {
  list: (filters) => [filters],
  detail: (id) => [id],
  evaluations: (id) => ['evaluations', id],
});

useQuery({ queryKey: candidateKeys.list(filters).queryKey, ... });
queryClient.invalidateQueries({ queryKey: candidateKeys.detail(id).queryKey });
```

candidate / recruit / member / interviewAlarm 등 주요 도메인 query key 표준화. 무효화 누락 / 키 drift 제거.

---

### 2.6. DnD 공고 정렬 — `@dnd-kit`

- `DndContext` + `SortableContext` + `PointerSensor` + `arrayMove`로 공고 카드 드래그 정렬.
- 정렬 결과는 optimistic update 후 서버 동기화. 실패 시 자동 롤백.

HTML5 native DnD가 아닌 `@dnd-kit` 선택 이유는 커스텀 sensor (touch / pointer) 통합이 native보다 깔끔하고 a11y가 기본 제공.

---

### 2.7. roundhr.com 랜딩

- Next.js + GSAP ScrollTrigger 스크롤 애니메이션.
- Notion CMS + `react-notion-x`로 콘텐츠 운영. 마케팅 팀이 Notion에서 직접 수정 → 사이트 자동 반영.
- 다운로드 CTA / 스크롤 스냅 / 가격 / 기능 소개 섹션.

---

## 3. 핵심 의사결정

### 3.1. 검증된 라이브러리 위에 얇은 어댑터

| 라이브러리 | 어댑터 | 줄 수 |
| --- | --- | --- |
| `@use-funnel/core` | 사내 funnel wrapper | ~30줄 |
| `react-hook-form` + `zod` | `useZodForm` | ~20줄 |
| `react-hot-toast` | 사내 toast wrapper | ~43줄 |
| `react-modal-sheet` + `overlay-kit` | BottomSheet compound | ~100줄 |
| Radix `useControllableState` | 사내 `useControllableChecked` (단순화) | ~30줄 |

다시 만들지 않은 것이 핵심. 검증된 라이브러리는 a11y / 엣지 케이스 / 브라우저 호환성을 이미 풀어둠.

### 3.2. Rule of Three

추상화는 다음 조건이 충족된 후 도입.

- 3번 이상 동일 패턴 반복
- 도메인 경계 명확
- 변경의 축 명확 (예: 플랫폼별 차이 vs 공통 흐름)

| 사례 | 도입 시점 |
| --- | --- |
| `useFunnel` 어댑터 | 4개 플로우 (예약 / 리뷰 / 상담 / 회원정보) 사용 후 추출 |
| BottomSheet compound | 반복 패턴 발견 후 |
| FSD sub-domain | 슬라이스 파일 30+ 도달 후 |
| Electron `CandidateServiceHelper` | 3개 플랫폼 동시 사용 시점 |

### 3.3. 추상화 레벨을 의도적으로 낮추는 케이스

- `useControllableChecked`는 Radix `useControllableState`를 그대로 쓰지 않고 단순 버전 유지.
- 사용 범위가 좁아 인지 비용이 더 중요. 일반화된 추상화가 오히려 부담.
- "추상화 = 항상 좋다"가 아니라 도메인 사용 범위와 인지 비용을 함께 본다는 판단.

### 3.4. 빅뱅 리팩토링은 하지 않는다

세이프닥 합류 후 "리팩토링 전용 PR"을 큰 단위로 묶어 올린 적 없음.

- 신규 기능 PR 안에 해당 영역만 함께 정리.
- widgets → features 이관, kebab-case 표준화 등은 점진적 누적.
- 빅뱅을 피하는 이유: 회귀 리스크, 리뷰어 부담, 비즈니스 흐름 정지.

### 3.5. 상태 관리 라이브러리를 모든 상태에 쓰지 않는다

| 상태 | 도구 |
| --- | --- |
| Server | TanStack Query |
| Form | React Hook Form / AntD Form |
| UI 전역 (최근 본 프로그램, 검색 필터) | Zustand |
| 컴포넌트 로컬 | useState |

도메인별 적절한 도구. Redux / Zustand에 모든 것을 몰아넣지 않음.

---

## 4. 기술 스택 깊이

### 4.1. React 18

- Compound Pattern + Custom Hook 추상화로 디자인 시스템과 폼 도메인 직접 설계.
- `useSuspenseQuery` + `getQueryClient` + `HydrationBoundary` 패턴 SSR 데이터 페칭 표준화. 서버 prefetch → 클라이언트 hydration 일관 인터페이스.
- `useSyncExternalStore` 기반 Concurrent rendering tearing 문제 (render phase 동기 snapshot 일관성) 해결.
- Fiber 아키텍처 (double buffering, alternate pointer 트리 swap), Lane-based priority scheduling, `useTransition` vs `useDeferredValue` 차이 (setState 트리거 위치 vs props deferred) 이해 기반 사내 추상화 설계.

### 4.2. TypeScript 5

- Variadic tuple로 단계별 폼 타입 합성 (`[T, ...K]` ↔ `[...K, T]`).
- Recursive type으로 nested key path 추론 (`'a' | 'a.b' | 'a.b.c'`).
- Mapped type + key remapping (`Capitalize<string & K>`)으로 도메인 타입 자동 생성.
- `infer` 기반 ReturnType / Parameters + Zod schema 추론 제네릭 (`z.infer<ZodObject<T>>`)으로 schema → form 타입 자동 동기화.
- Type-level state machine: lookup type 패턴 (`{ idle: ...; loading: ... }[S]`)으로 invalid transition 컴파일 타임 차단.
- `satisfies` + `as const`로 도메인 상수 객체에서 좁은 추론 유지.
- HKT 시뮬레이션: fp-ts URI 룩업 패턴 (`URItoKind<A>` + `Kind<F, A>`)으로 native HKT 미지원 우회.

### 4.3. Next.js 15 App Router

- **Middleware**: `/settlement/*` 별도 호스트 분리, `accessToken` / `refreshToken` URL 파라미터 cross-domain 위임. 단일 코드베이스 / 환경 게이팅.
- **Route Group**: `(altLayout)/settlement` 별도 레이아웃 + 단일 코드베이스.
- **Streaming SSR + Suspense**: Suspense boundary 단위 chunk 분할로 초기 렌더 시간 단축. Server Component 병렬 fetch + 각자 resolve 시점 chunk 전송.
- **Caching**: `cookies()` / `headers()` / `searchParams`가 라우트를 dynamic으로 강제하는 트리거. fetch caching 옵션 (`force-cache` / `no-store` / `revalidate: N` / `tags`) 도메인별 적용. `revalidatePath` vs `revalidateTag` 차이 (특정 라우트의 모든 fetch vs 태그 단위 선택적 무효화) 기반 무효화 전략.
- **RSC**: Server → Client props 직렬화 제약 (함수 / class instance / Symbol 불가, plain object / Promise 가능, `M` / `J` row prefix wire format) 이해 기반 컴포넌트 경계 설계.
- **Edge Runtime**: Node.js API vs Web API 차이 (`jsonwebtoken` 불가, `jose` 가능 등 Web Crypto 기반). Server Action POST + RPC wire protocol.

### 4.4. Form & Validation

- **React Hook Form + Zod**: `useZodForm` 어댑터, step별 schema 분리, `superRefine` cross-field, `baseReset` 고차함수 단계 데이터 누적.
- **Ant Design Form**: `Form.List` + `shouldUpdate` + `useWatch` cascade validation, `Form.Item` custom trigger, 임시저장 + 검수 워크플로우.

### 4.5. State & Data Fetching

- **TanStack Query v5**: `queryOptions` 패턴 통합 호출, infinite query + intersection observer 무한 스크롤, `queryClient.getQueriesData` 기반 Optimistic Update + 자동 롤백.
- **Zustand**: UI 전역 상태 한정. 서버 / 폼 상태는 별도 도구.

### 4.6. UI & Styling

- **tailwind-variants**: variants / slots / compoundVariants 디자인 토큰 스키마 (size / intent / state) 표준화.
- **Radix UI / Headless UI**: Compound Pattern, asChild + Slot, Primitive.
- **overlay-kit**: BottomSheet / Dialog 호출 라이프사이클 명시화. 글로벌 config 호출 → 함수 호출 단위.
- **Framer Motion**: AnimatePresence + motion 페이지 / 단계 전환.

### 4.7. Architecture

- **FSD 6-layer + sub-domain 자체 정립**: 961 파일 코드베이스 표준화.
- **Monorepo (Turborepo + pnpm)**: 13 패키지 + 5 workflows 단독 설계.
- **MVC + DI + Factory Pattern**: Electron 크롤러 재설계.
- **Compound / Composition Pattern**: BottomSheet, Tabs, Form.

### 4.8. Analytics

- **Amplitude**: 241개 이벤트 + UTM / QR 유입 추적. 시술상세 개편 후 -16% / -66% / -40% 진단.
- **Notifly**: 세그멘테이션 SDK (이벤트 큐 기반 비동기 초기화).
- **Kakao Pixel**: 전환 추적.

### 4.9. Open Source Reading

검증된 라이브러리 내부 구현을 직접 읽고 사내 추상화 설계에 반영.

| 라이브러리 | 학습한 패턴 | 사내 적용 |
| --- | --- | --- |
| React Hook Form | `Controller` 내부 구현, `useForm` proxy 기반 selective re-render | `useZodForm` 어댑터 |
| Toss Slash (`@use-funnel/core`, `overlay-kit`) | funnel history snapshot, overlay 라이프사이클 디자인 | 사내 funnel wrapper, BottomSheet compound |
| Radix UI | Compound Component, asChild + Slot, `useControllableState` | `useControllableChecked` (단순화) |
| TanStack Query | `queryOptions` 패턴, infinite query cache 매니저 | 사내 query key 표준 + `infiniteSetData` 헬퍼 |

---

## 5. 연락처

- jingeon27@gmail.com
- 010-6865-8208
- [GitHub @jingeon27](https://github.com/jingeon27)
- [Blog](https://jingeon27.tistory.com/)
