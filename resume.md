# 김진건

**Frontend Engineer** jingeon27@gmail.com | 010-6865-8208 | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 - 2028.06)

---

## Summary

빠르게 만들어진 서비스에 합류해 기술 부채를 정리하면서 신규 기능을 함께 만들어온 프론트엔드 엔지니어. 현재 세이프닥 복지몰·CMS·병원 CRM 3개 서비스의 단독 Frontend Engineer로 신규 기능 개발·운영·구조 개선을 담당.

- **Amplitude 241개 이벤트 + 시술상세 개편 역효과 진단** — 본인이 동의해 구현한 개편이 예약 -16% / 상담 -66% / 최종 -40%의 역효과를 일으켰음을 데이터로 확인하고 CTA 재설계
- **예약 폼 1,400 → 700줄, 가족 동기화 550 → 55줄** (`React Hook Form + Zod + @use-funnel/core`)
- **`@core` 디자인 시스템 20개 Primitive Component** 표준화 (Radix UI / Headless UI 기반)
- **SafeDoc App 961 파일 5-layer FSD 정리** + sub-domain 패턴 자체 정립 (25 entities / 20 features 슬라이스)
- **CMS · 병원 CRM 13개 패키지 모노레포 단독 설계** (Turborepo + pnpm + 5 GitHub Actions workflows)
- **Electron 크롤러 MVC + DI + Factory Pattern 재설계** — 신규 플랫폼 연동 3일 → 1일 (3개 플랫폼 도입 후 본인 측정)

작업 방향: **검증된 라이브러리 위에 얇은 어댑터로 추상화 비용 최소화**. Rule of Three 충족 후에만 추상화. 빅뱅 리팩토링 없이 신규 기능 PR에 해당 영역만 점진 정리.

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 **SafeDoc App(복지몰)**, **CMS**, **병원 CRM** 프론트엔드 개발·구조 개선 담당. 빠르게 만들어진 제품에 합류해 운영 가능한 구조로 정리하면서 신규 기능 개발·운영을 병행. 현재 3개 서비스의 단독 Frontend Engineer.

- **Amplitude 241개 이벤트 + 시술상세 개편 역효과 진단**
  - 디자인팀 가설 ("정보 풍부 → 신뢰 → 전환율") 에 동의하고 구현, 배포 후 예약 클릭 -16% / 상담 -66% / 최종 예약 -40% 측정.
  - 퍼널 단계별 이탈 추적 → CTA가 스크롤 깊은 곳에 위치해 사용자 도달 전 이탈 진단.
  - 병원 상세에서 바로 예약 / 상담 가능한 구조 + sticky CTA 로 재설계.

- **예약 Form 아키텍처 리팩토링 — 1,400 → 700줄**
  - `useState` 30개 + props drilling + useEffect 5~6개로 얽힌 가족 동기화 코드를 `React Hook Form + Zod + @use-funnel/core` 조합으로 정리.
  - 가족 데이터 동기화 550 → 55줄. cross-field 검증을 if 분기에서 `superRefine` 선언형 schema 로 이동.
  - 패턴은 리뷰 작성 / 상담 신청 / 회원정보 수정에 재사용.

- **리뷰 작성 플로우 — 0부터 설계한 신규 도메인 (1,290 LOC)**
  - 4단계 funnel + step별 Zod schema + 통합 schema. iOS `.heic` → `heic2any` 클라이언트 변환. 가족 정보 prefetch 후 form 주입.
  - 이후 상담 / 견적 요청 플로우의 레퍼런스 구현.

- **`@core` 디자인 시스템 — 20개 Primitive Component**
  - Radix UI / Headless UI 위에 `Button`, `Input`, `BottomSheet`, `Dialog`, `Toast`, `Tooltip`, `Callout`, `Checkbox`, `Radio`, `Toggle`, `Tabs`, `Chip`, `Menu` 등 공통화.
  - `tailwind-variants` 로 size / intent / state 3축 표준화 → inline className override 안티패턴 제거.
  - BottomSheet Compound (`Root/Header/Content/Footer`) + `react-modal-sheet` + `overlay-kit` 통합. route change / popstate / backdrop pointer-events / setTimeout cleanup 4가지 모바일 엣지 케이스를 라이프사이클 레이어 한 곳에서 처리.

- **SafeDoc App 프론트 아키텍처 정리**
  - 961 파일 규모. FSD + Atomic Design 잔재 혼재 → 5-layer FSD (`app / pages / widgets / features / entities / shared`) 표준화. 25 entities / 20 features 슬라이스 경계 + Public API 기준 정립.
  - widgets → features 이관, 순환 의존 해소, 파일명 kebab-case 점진 정리.
  - TanStack Query v5 `queryOptions` 패턴 + Server Component prefetch → HydrationBoundary → useSuspenseQuery 흐름 정리. infinite query는 `infiniteSetData` 헬퍼로 nested page 안의 개별 아이템 업데이트 처리.

- **CMS · 병원 CRM 13개 패키지 모노레포 단독 설계**
  - 13개 = 3 config + 5 shared + 2 lib + entities + features. workspace protocol + pnpm catalog 공통 의존성 관리.
  - `@safedoc/ui` 패키지 빌드 방식을 `prebuilt(tsup)` → `no-build bundled` 로 전환해 패키지 ↔ 앱 변경이 즉시 HMR 반영 (사내 패키지 한정 의도적 트레이드오프).
  - Turborepo + GitHub Actions 5 workflows (prod/stage/dev deploy + lint + slack-alarm) + `dorny/paths-filter` 기반 변경 감지로 CMS / Hospital 선택 배포.

- **FSD sub-domain 패턴 자체 정립**
  - 단일 슬라이스 파일이 30+ 개로 누적되면 평탄한 구조가 가독성을 해침. `entities/settlement/{common, contract, deposit, disapproval, omission}` 형태로 도메인 라이프사이클 단계별 분할.
  - sub-feature 패턴 (`features/program/ui/{detail, modal}`) 으로 UI 블록 의존성을 폴더 트리에서 가시화.
  - **한계**: 30+ 누적 후에야 도입 → 마이그레이션 비용 증가. 15개 시점에 도입 기준이 있었다면 비용 절반.

- **Program 도메인 폼 설계 — sub-domain + Transfer Layer**
  - CMS / 병원 CRM 공유 도메인. `program/{common, inspection}` 분할. AntD Form 기반.
  - 2-tier `FORM_NAME` enum: `@safedoc/types` 공통 enum + CMS 전용 enum이 같은 값 재참조 → 공통 필드 한 군데 변경으로 양쪽 동기화.
  - Transfer Layer (`programDetailToClientProgramForm` / `clientProgramFormToCreateRequest`) 로 서버 ↔ 폼 변환 로직 분리. Dayjs / UploadFile / 템플릿 데이터 양방향 변환.
  - `Form.List` + `useWatch` cascade validation (시술 전후 이미지 페어 검증). 비동기 이미지 업로드는 `customRequest` + validator 가 응답 객체 (`response.src`) 존재 여부로 판단.
  - 검수는 단일 폼 인스턴스 + 상태 머신 (`PROGRAM_INSPECTION_STATUS` enum: `Request → Waiting → Confirm | Reject`) + Callout 배지. 처음엔 두 폼 인스턴스 side-by-side 였으나 동기화 비용으로 단순화.
  - Admin 안정화 후 `@safedoc/features` 추출 → CMS / 병원 CRM 공유 (Rule of Three 충족 후 추상화).

- **콜인 / 워크인 듀얼 패스 동의서**
  - `PROXY_RESERVATION_INFLOW_TYPE` enum (`CallIn` / `WalkIn`) 으로 진입 분기. `AgreementCallInFormValues` (4 동의 필드) / `AgreementWalkInFormValues` (1 필드) 분리. CMS / 병원 CRM 양쪽에서 동의서 콘텐츠를 공통 패키지로 공유.

- **정산 도메인 분리 + Optimistic Update**
  - Next.js Middleware + Route Group `(altLayout)/settlement` 로 별도 호스트 분리하면서 단일 코드베이스 유지. legacy `fetch/apis` → FSD entities/features 마이그레이션.
  - `queryClient.setQueriesData` 즉시 반영 → 실패 시 catch 블록에서 자동 롤백. 정산내역 / 숨김처리 비교 두 탭 동시 갱신.

- **병원 검색**
  - `geolib` 거리 계산 + `naver-maps` SDK + `react-intersection-observer` 무한 스크롤 + 자동완성 / 인기 검색어 / 실시간 검색 카운트.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 - 2024.11

캘린더 기반 일정 조율 + ATS 솔루션 SaaS 의 ATS 서비스 round 신규 기능 개발 / 유지보수.

- **Electron Desktop 크롤러 아키텍처 재설계 — MVC + DI + Factory Pattern**
  - 채용 플랫폼 (점핏 / 잡플래닛 / 게임잡) 마다 별도 구현체 + 공통 흐름 (로그인 → 검색 → 수집 → 업로드) 이 반복 / 변형되어 있던 구조를 재설계.
  - `CandidateServiceHelper` 컨트롤러 + `PlatformAdapter` 인터페이스 + `PlatformAdapterFactory` 로 분리. 신규 플랫폼은 adapter 구현 + factory 등록만.
  - **신규 플랫폼 연동 3일 → 1일** (3개 플랫폼 도입 후 본인 측정).
  - **한계**: DI 구조는 갖췄지만 단위 테스트는 시간 부족으로 후행. DOM 셀렉터 변경에 대한 헬스체크 / 알람도 별도로 만들었다면 운영 비용 더 줄었을 것.

- **면접 템플릿 / 온보딩 4단계 funnel**
  - `useFunnel` (단계 전환) + `usePromiseSessionStorage` (단계 데이터 sessionStorage 자동 백업, 새로고침 / 탭 닫힘 후 복원) + `FormDirtyContext` (변경 있음 전역 노출, `beforeunload` + 라우터 confirm) 통합.
  - 면접 템플릿 / 온보딩 / 자동화 규칙 / 평가 템플릿 4가지 흐름에 동일 패턴 재사용.

- **채용 페이지 / 지원서 설정 폼**
  - `React Hook Form` + `useFieldArray` + `FormProvider` + `useYupValidation`. 세이프닥 `useZodForm` 의 yup 버전 원형.

- **메일 / 알림 템플릿 시스템**
  - `@whattime/quill` 기반 WYSIWYG + 템플릿 변수 시스템 (`{{candidateName}}` placeholder 치환). quill blot 시스템으로 변수를 atomic node 처리.

- **Server State 표준화**
  - `@lukemorales/query-key-factory` 로 candidate / recruit / member / interviewAlarm 도메인 query key 표준화. 무효화 누락 / 키 drift 제거.

- **DnD 공고 정렬**
  - `@dnd-kit` (DndContext + SortableContext + PointerSensor + arrayMove). optimistic update + 자동 롤백.

- **roundhr.com 랜딩**
  - Next.js + GSAP ScrollTrigger + Notion CMS + `react-notion-x`.

---

## Skills

### 시그니처

- **검증된 라이브러리 위에 얇은 어댑터**: `@use-funnel/core`, `react-hook-form`, `react-modal-sheet`, `overlay-kit` 을 다시 만들지 않고 30~50줄 어댑터로 도메인 통합.
- **Rule of Three**: 3번 사용 + 도메인 경계 + 변경 축이 명확할 때만 추상화. (`useFunnel` 어댑터 — 4개 플로우 후 추출 / Electron `CandidateServiceHelper` — 3개 플랫폼 시점 / FSD sub-domain — 슬라이스 30+ 시점)
- **빅뱅 리팩토링 회피**: 신규 기능 PR 안에서 해당 영역만 점진 정리.
- **상태 도구 분리**: Server (TanStack Query) / Form (RHF, AntD Form) / UI 전역 (Zustand) / 로컬 (useState). 모든 것을 한 도구에 몰지 않음.

### React 18

- Compound Pattern + Custom Hook 추상화로 디자인 시스템 / 폼 도메인 직접 설계.
- `useSuspenseQuery` + `getQueryClient` + `HydrationBoundary` SSR 데이터 페칭 표준화.
- BottomSheet Compound (`Root/Header/Content/Footer`) + `overlay-kit` 라이프사이클 명시화로 4가지 모바일 엣지 케이스 처리.

### TypeScript 5

- Variadic tuple 단계별 폼 타입 합성, recursive type nested key path 추론, mapped type + key remapping 도메인 타입 자동 생성.
- Zod schema 추론 제네릭 (`z.infer<ZodObject<T>>`) → schema 변경 시 form 타입 자동 동기화.
- Discriminated Union 도메인 적용: 콜인 / 워크인 동의서 폼 타입 분리.
- `satisfies` + `as const` 도메인 상수 객체 좁은 추론.

### Next.js 15 App Router

- **Middleware**: `/settlement/*` 별도 호스트 분리, 토큰 위임. 단일 코드베이스 + 환경 게이팅. URL 파라미터 토큰 위임의 보안 트레이드오프 (Referer / 로그 노출 가능성) 인지하고 단명 토큰 + HTTPS 전제로 운영.
- **Route Group**: `(altLayout)/settlement` 별도 레이아웃 + 단일 코드베이스.
- **Streaming SSR + Suspense**: boundary 단위 chunk 분할.
- **Caching**: `cookies()` / `searchParams` dynamic 강제 트리거, fetch caching 옵션 (`force-cache` / `no-store` / `revalidate` / `tags`) 도메인별 적용. `revalidatePath` vs `revalidateTag` 차이 기반 무효화 전략.
- **RSC**: Server → Client props 직렬화 제약 (함수 / class instance / Symbol 불가) 이해 기반 컴포넌트 경계 설계.

### Architecture

- **FSD 5-layer + sub-domain 자체 정립**: 961 파일 코드베이스 표준화. sub-domain은 FSD 공식이 아닌 자체 패턴, 슬라이스 파일 수 + 변경 빈도 기준으로 도입 시점 판단.
- **Monorepo (Turborepo + pnpm)**: 13 패키지 단독 설계. 5 workflows + `dorny/paths-filter` 변경 감지 선택 배포.
- **MVC + DI + Factory Pattern**: Electron 크롤러 재설계 (왓타임).
- **Compound / Composition Pattern**: BottomSheet, Tabs, Form 핵심 UI 도메인 적용.

### Form & Validation

- **React Hook Form + Zod**: `useZodForm` 어댑터 (schema → form 타입 자동 동기화). step별 schema 분리 + 통합 schema, `superRefine` cross-field validation.
- **Ant Design Form**: `Form.List` + `shouldUpdate` + `useWatch` cascade validation, `Form.Item` custom trigger (`onDragTable`), 비동기 이미지 업로드 + `customRequest` + validator 응답 객체 존재 여부 판단.

### State & Data Fetching

- **TanStack Query v5**: `queryOptions` 패턴으로 useQuery / useSuspenseQuery / prefetchQuery / getQueryData 통합. infinite query + intersection observer 무한 스크롤. `queryClient.setQueriesData` 기반 Optimistic Update + 자동 롤백.
- **Zustand**: UI 전역 상태 (최근 본 프로그램, 검색 필터) 한정.

### UI & Styling

- **tailwind-variants**: size / intent / state 3축 디자인 토큰 스키마.
- **Radix UI / Headless UI**: Compound Pattern, asChild + Slot, Primitive.
- **overlay-kit**: BottomSheet / Dialog 호출 라이프사이클 명시화.
- **Framer Motion**: AnimatePresence + motion 페이지 / 단계 전환.

### Analytics

- **Amplitude**: 241개 이벤트 + UTM / QR 유입 추적. 시술상세 개편 후 -16% / -66% / -40% 진단 → CTA 재설계.
- **Notifly**: 세그멘테이션 SDK (이벤트 큐 비동기 초기화).
- **Kakao Pixel**: 전환 추적.

### Open Source Reading

검증된 라이브러리 내부를 읽고 사내 추상화 설계에 반영.

- **React Hook Form**: `useForm` proxy 기반 selective re-render 메커니즘 → `useZodForm` 어댑터 설계 시 참고.
- **Toss Slash** (`@use-funnel/core`, `overlay-kit`): funnel history snapshot + overlay 라이프사이클 → 사내 funnel wrapper / BottomSheet compound 설계 시 참고.
- **TanStack Query**: `queryOptions` 패턴 + infinite query cache 구조 → 사내 query key 표준 + `infiniteSetData` 헬퍼 설계 시 참고.

---

## Education

### 대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

---

## Certification

- 정보처리기능사 | 한국산업인력공단 | 2023.04
