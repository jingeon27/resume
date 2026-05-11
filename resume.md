# 김진건

**Frontend Engineer** jingeon27@gmail.com | 010-6865-8208 | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 - 2028.06)

---

## Summary

빠르게 만들어진 서비스에 합류해 기술 부채를 정리하고, 신규 기능 개발과 구조 개선을 함께 진행해 온 프론트엔드 엔지니어입니다. 2026.01부터 세이프닥 복지몰·CMS·병원 CRM 3개 서비스의 단독 Frontend Engineer로 신규 기능 개발·운영·구조 개선을 담당하고 있습니다. React, Next.js(App Router), TypeScript 기반에서 복잡한 사용자 플로우를 운영 가능한 구조로 정리하고, 사용자 입장에서 더 명확하고 편한 경험이 무엇인지 먼저 판단하며 구현해 왔습니다.

- **Amplitude 241개 이벤트 + 시술상세 실험 분석** — 최종 예약 전환율은 유의미한 변화가 없었지만, 가입 후 예약까지의 소요시간 14분 → 11분 감소와 프로그램 기준 리뷰 수요 확대를 확인하고 CTA 및 후속 과제를 재설계
- **예약 폼 1,400 → 700줄, 가족 동기화 550 → 55줄** (`React Hook Form + Zod + @use-funnel/core`)
- **`@core` 디자인 시스템 20개 Primitive Component** 표준화 (Radix UI 기반)
- **SafeDoc App 961 파일 5-layer FSD 정리** + sub-domain 패턴 자체 정립 (25 entities / 20 features 슬라이스)
- **CMS · 병원 CRM 13개 패키지 모노레포 단독 설계** (Turborepo + pnpm)
- **Electron 크롤러 MVC + DI + Factory Pattern 재설계** — 신규 플랫폼 연동 3일 → 1일 (3개 플랫폼 도입 후 본인 측정)

검증된 라이브러리 위에 얇은 어댑터를 두는 방향을 선호하며, Rule of Three 이후에만 추상화를 도입해 과한 설계를 피합니다.

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 **SafeDoc App(복지몰)**, **CMS**, **병원 CRM**의 프론트엔드 개발과 구조 개선을 담당하고 있습니다.

합류 당시 서비스는 병원 프로그램 탐색과 예약 흐름 중심의 MVP였고, 시술 이후 단계는 앱 내에서 거의 관리되지 않는 상태였습니다. 이후 예약 이후 운영 기능, 분석 환경, 관리자 기능까지 확장하며 운영 가능한 제품 구조로 고도화했습니다.

- **MVP 이후 제품 구조 확장 및 운영 기능 고도화**
  - 예약 이전까지만 중심이던 MVP를 유저용 프로그램 상세, 관리자용 프로그램 검수, 검색 필터 고도화까지 확장해 운영 가능한 제품 구조로 발전시켰습니다.
  - 마케팅팀이 도입한 Amplitude 환경 위에서 예약 전후 핵심 퍼널 이벤트를 설계·확장했고, 이후 기능 우선순위와 개편 효과를 데이터 기반으로 판단할 수 있게 했습니다.
  - 시술 이후 금액 변동(업셀링/다운셀링) 추적 공백을 보완하기 위해 기업 쿠폰과 정산 기능을 추가했고, 외부업체가 개발한 정산 영역은 계약 종료 후 요구사항 반영과 함께 FSD 전환, 컴포넌트 분리·추상화, 모달 패턴 공통화까지 정리했습니다.

- **Amplitude 241개 이벤트 + 시술상세 실험 분석**
  - 디자인팀의 가설("정보 풍부 → 신뢰 → 전환율")에 동의해 구현했고, 배포 후 퍼널과 행동 데이터를 기준으로 전후 변화를 분석했습니다.
  - 최종 예약 전환율은 유의미한 변화가 없었지만, 가입 후 예약까지의 소요시간은 14분에서 11분으로 줄었고, 예약 페이지 진입 후 최종 신청까지의 전환은 개선되었습니다.
  - 시술상세 진입 사용자 중 25%가 리뷰를 조회했고(병원상세 8%), 리뷰 조회 사용자의 예약 전환율이 비조회 사용자보다 약 15%p 높다는 점을 확인해 프로그램 기준 리뷰 분리와 CTA 재배치를 후속 과제로 도출했습니다.

- **예약 Form 아키텍처 리팩토링 — 1,400 → 700줄**
  - `useState` 30개와 props drilling, `useEffect` 5~6개로 얽혀 있던 가족 동기화 코드를 `React Hook Form + Zod + @use-funnel/core` 조합으로 정리했습니다.
  - 가족 데이터 동기화 로직을 550줄에서 55줄로 줄였고, cross-field 검증을 if 분기에서 `superRefine` 선언형 schema로 옮겼습니다.
  - 이 패턴은 리뷰 작성 / 상담 신청 / 회원정보 수정에도 재사용했습니다.

- **리뷰 작성 플로우 — 0부터 설계한 신규 도메인 (1,290 LOC)**
  - 4단계 funnel, step별 Zod schema, 통합 schema를 설계했습니다. 가족 정보는 prefetch 후 form에 주입했습니다.
  - 이후 상담 / 견적 요청 플로우를 설계할 때 레퍼런스 구현으로 활용했습니다.

- **`@core` 디자인 시스템 — 20개 Primitive Component**
  - Radix UI / Headless UI 위에 `Button`, `Input`, `BottomSheet`, `Dialog`, `Toast`, `Tooltip`, `Callout`, `Checkbox`, `Radio`, `Toggle`, `Tabs`, `Chip`, `Menu` 등을 공통화했습니다.
  - `tailwind-variants`로 size / intent / state 3축을 표준화해 inline `className` override 안티패턴을 줄였습니다.
  - BottomSheet Compound (`Root/Header/Content/Footer`)와 `react-modal-sheet`, `overlay-kit`을 통합해 route change / popstate / backdrop pointer-events / `setTimeout` cleanup 같은 모바일 엣지 케이스를 라이프사이클 레이어 한 곳에서 처리했습니다.

- **SafeDoc App 프론트 아키텍처 정리**
  - 961 파일 규모의 코드베이스에서 FSD와 Atomic Design 잔재가 섞여 있던 구조를 5-layer FSD (`app / pages / widgets / features / entities / shared`)로 표준화했고, 25개 entities / 20개 features 슬라이스의 경계와 Public API 기준을 정립했습니다.
  - widgets → features 이관, 순환 의존 해소, 파일명 kebab-case 정리를 점진적으로 진행했습니다.
  - TanStack Query v5 `queryOptions` 패턴과 Server Component prefetch → HydrationBoundary → `useSuspenseQuery` 흐름을 정리했고, infinite query는 `infiniteSetData` 헬퍼로 nested page 안의 개별 아이템을 업데이트할 수 있게 했습니다.
  - 공통 부모 `layout.tsx` 단계에서 program 상세 정보를 prefetch하도록 구조를 바꿔, 기존에 프로그램 상세 페이지와 상담 페이지가 각각 별도로 호출하던 `/program/detail` API를 request-scoped 캐시 안에서 재사용하게 만들었고, 하위 page 전환 시 server-level 중복 fetch를 줄였습니다.

- **CMS · 병원 CRM 13개 패키지 모노레포 단독 설계**
  - 13개 패키지(3 config + 5 shared + 2 lib + entities + features)를 설계했고, workspace protocol과 pnpm catalog로 공통 의존성을 관리했습니다.
  - `@safedoc/ui` 패키지 빌드 방식을 `prebuilt(tsup)`에서 `no-build bundled`로 전환해 패키지 ↔ 앱 변경이 즉시 HMR에 반영되도록 했습니다.
  - Turborepo와 GitHub Actions 5 workflows(prod/stage/dev deploy + lint + slack-alarm), `dorny/paths-filter` 기반 변경 감지로 CMS / Hospital 선택 배포를 구성했습니다.

- **Claude skills 기반 개발 문서화 및 workflow 변경**
  - `.claude` 설정과 skills 문서를 정리해 FSD 경계, Public API 기준, 모달 제작 패턴, 정산 도메인 리팩토링 방식, 기획 맥락 같은 반복 지식을 문서화했습니다.
  - `jira-branch` 명령으로 이슈와 브랜치 맥락을 읽고 계획을 세운 뒤, 구현 후 커밋 / PR 생성까지 자동화하는 흐름을 만들었습니다.
  - PR 전에는 AI agent 코드리뷰를 먼저 수행해 critical한 경계 위반, 네이밍, Public API 누락 같은 이슈를 사전에 점검했고, worktree를 활용해 2~3개의 작업을 병렬로 진행하는 workflow를 운영했습니다.

- **FSD sub-domain 패턴 자체 정립**
  - 단일 슬라이스 파일이 30개 이상 누적되면 평평한 구조가 가독성을 해친다고 판단해 `entities/settlement/{common, contract, deposit, disapproval, omission}` 형태로 도메인 라이프사이클 단계별 분할을 도입했습니다.
  - sub-feature 패턴 (`features/program/ui/{detail, modal}`)으로 UI 블록 의존성을 폴더 트리에서 가시화했습니다.
  - **한계**: 30+ 누적 후에야 도입 → 마이그레이션 비용 증가. 15개 시점에 도입 기준이 있었다면 비용 절반.

- **Program 도메인 폼 설계 — sub-domain + Transfer Layer**
  - CMS / 병원 CRM이 공유하는 도메인을 `program/{common, inspection}`으로 나눴고, AntD Form 기반으로 설계했습니다.
  - 2-tier `FORM_NAME` enum을 통해 `@safedoc/types` 공통 enum과 CMS 전용 enum이 같은 값을 재참조하도록 만들어 공통 필드 변경을 양쪽에 동기화했습니다.
  - Transfer Layer (`programDetailToClientProgramForm` / `clientProgramFormToCreateRequest`)로 서버 ↔ 폼 변환 로직을 분리했고, Dayjs / UploadFile / 템플릿 데이터를 양방향으로 변환했습니다.
  - `Form.List` + `useWatch` 기반 cascade validation으로 시술 전후 이미지 페어를 검증했고, 비동기 이미지 업로드는 `customRequest` + validator가 응답 객체(`response.src`) 존재 여부로 판단하도록 구성했습니다.
  - 검수는 단일 폼 인스턴스와 상태 머신 (`PROGRAM_INSPECTION_STATUS`: `Request → Waiting → Confirm | Reject`), Callout 배지 조합으로 단순화했습니다.
  - Admin 안정화 후 `@safedoc/features`로 추출해 CMS / 병원 CRM이 함께 쓰도록 확장했습니다.

- **콜인 / 워크인 듀얼 패스 동의서**
  - `PROXY_RESERVATION_INFLOW_TYPE` enum (`CallIn` / `WalkIn`)으로 진입을 분기했고, `AgreementCallInFormValues`(4개 동의 필드)와 `AgreementWalkInFormValues`(1개 필드)를 분리했습니다. CMS / 병원 CRM 양쪽에서 동의서 콘텐츠는 공통 패키지로 공유했습니다.

- **정산 리펙토링 + 운영건 작업**
  - Next.js Middleware + Route Group `(altLayout)/settlement`로 별도 호스트를 분리하면서도 단일 코드베이스를 유지했습니다. 동시에 legacy `fetch/apis` 구조를 FSD `entities/features` 구조로 마이그레이션했습니다.
  - `queryClient.setQueriesData`로 즉시 반영하고, 실패 시 catch 블록에서 자동 롤백되도록 구성해 정산내역 / 숨김처리 비교 두 탭이 함께 갱신되도록 했습니다.
  - 정산 `entities`를 `common / omission / disapproval / deposit / contract` sub-domain으로 나누고, `features/settlement`는 URL 기준 `dashboard / monthly / program / contract` 구조로 재편했습니다. `settlement/program`과 `settlement/monthly` 페이지는 SearchFilter / Table / hook / modal 단위로 분리해 레거시 page 중심 구조를 걷어냈습니다.
  - 레거시 `forwardRef` 기반 모달은 `overlay-kit` 패턴으로 전환했습니다. `settlement/program`과 `settlement/monthly`의 대표 모달을 먼저 리팩토링한 뒤, 그 컨텍스트를 Claude Code에 넘겨 비슷한 패턴의 모달과 페이지를 같은 방식으로 정리했고, PR 전 AI agent 코드리뷰로 critical한 경계 위반과 Public API 문제를 먼저 점검했습니다.
  - 이 과정에서 `handleUpdate` 계열 로직은 curried 함수 → 단일 함수 통합 + 실패 폴백 추가로 정리했고, settlement mutation은 optimistic update 패턴으로 통일했습니다.

- **병원 검색**
  - `geolib` 거리 계산 + `naver-maps` SDK + `react-intersection-observer` 무한 스크롤 + 자동완성 / 인기 검색어 / 실시간 검색 카운트.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 - 2024.11

캘린더 기반 일정 조율 + ATS 솔루션 SaaS의 ATS 서비스 round에서 신규 기능 개발과 유지보수를 담당했습니다.

- **Electron Desktop 크롤러 아키텍처 재설계 — MVC + DI + Factory Pattern**
  - 채용 플랫폼(점핏 / 잡플래닛 / 게임잡)마다 별도 구현체와 공통 흐름(로그인 → 검색 → 수집 → 업로드)이 반복 / 변형되던 구조를 재설계했습니다.
  - `CandidateServiceHelper` 컨트롤러와 `PlatformAdapter` 인터페이스, `PlatformAdapterFactory`로 분리했고, 신규 플랫폼은 adapter 구현 + factory 등록만으로 확장할 수 있게 했습니다.
  - **신규 플랫폼 연동 기간을 3일에서 1일로 줄였습니다.** (3개 플랫폼 도입 후 직접 측정)
  - **한계**도 있었습니다. DI 구조는 갖췄지만 단위 테스트는 시간 부족으로 후행되었고, DOM 셀렉터 변경에 대한 헬스체크 / 알람까지 함께 만들었다면 운영 비용을 더 줄일 수 있었을 것입니다.

- **면접 템플릿 / 온보딩 4단계 funnel**
  - `useFunnel`(단계 전환)과 `usePromiseSessionStorage`(단계 데이터 sessionStorage 자동 백업, 새로고침 / 탭 닫힘 후 복원), `FormDirtyContext`(변경 있음 전역 노출, `beforeunload` + 라우터 confirm)를 통합했습니다.
  - 면접 템플릿 / 온보딩 / 자동화 규칙 / 평가 템플릿 4가지 흐름에 같은 패턴을 재사용했습니다.

- **채용 페이지 / 지원서 설정 폼**
  - `React Hook Form` + `useFieldArray` + `FormProvider` + `useYupValidation` 구조를 적용했습니다. 이후 세이프닥 `useZodForm` 패턴의 yup 버전 원형이 되었습니다.

- **메일 / 알림 템플릿 시스템**
  - `@whattime/quill` 기반 WYSIWYG와 템플릿 변수 시스템(`{{candidateName}}` placeholder 치환)을 구현했습니다. quill blot 시스템을 활용해 변수를 atomic node로 처리했습니다.

- **Server State 표준화**
  - `@lukemorales/query-key-factory`로 candidate / recruit / member / interviewAlarm 도메인의 query key를 표준화해 무효화 누락과 key drift를 줄였습니다.

- **DnD 공고 정렬**
  - `@dnd-kit` (`DndContext` + `SortableContext` + `PointerSensor` + `arrayMove`) 기반으로 구현했고, optimistic update와 자동 롤백을 적용했습니다.

- **roundhr.com 랜딩**
  - Next.js 기반으로 운영했고, Notion CMS와 `react-notion-x`, Strapi를 조합해 간단한 콘텐츠 운영 서버를 구성했습니다.

---

## Skills

### 시그니처

- 검증된 라이브러리 위에 얇은 어댑터를 두는 방향을 선호합니다.
- Rule of Three 이후에만 추상화를 도입하고, 신규 기능 PR 안에서 해당 영역만 점진적으로 정리합니다.
- Server / Form / UI 전역 / 로컬 상태의 역할을 분리해 한 도구에 과도하게 책임을 몰지 않습니다.
- FP 스타일과 `es-toolkit`, `ts-pattern`을 활용해 선언적으로 표현하되, 과한 추상화는 지양합니다.
- 리스트 virtual scroll, 검색·필터 구조 개선, 모달 패턴 공통화처럼 제품 성능과 운영 경험을 함께 개선하는 제안을 지속해 왔습니다.
- UI 일관성, 사용자 인지 방식, 기존 패턴과의 정합성을 근거로 디자이너·기획자와 소통합니다.

### AI Workflow

- `jira-branch` 명령으로 JIRA 티켓과 브랜치 맥락을 읽고 계획을 세운 뒤, 구현 후에는 커밋과 PR 생성까지 자동화했습니다.
- PR 전에는 AI agent 코드리뷰를 거쳐 critical한 부분을 먼저 점검했고, skills에는 코드 패턴과 기획 맥락을 문서화해 반복 작업의 문맥 비용을 줄였습니다.
- worktree를 활용해 2~3개의 작업을 병렬로 진행하며 개발 흐름을 운영했습니다.

### React 18

- Compound Pattern + Custom Hook 추상화로 디자인 시스템 / 폼 도메인 직접 설계.
- `useSuspenseQuery` + `getQueryClient` + `HydrationBoundary` SSR 데이터 페칭 표준화.
- BottomSheet Compound (`Root/Header/Content/Footer`) + `overlay-kit` 라이프사이클 명시화로 4가지 모바일 엣지 케이스 처리.
- 검증된 라이브러리를 우선 활용하고 필요한 만큼만 래핑해, 하드코딩으로 로직을 직접 쌓는 비용과 단위 테스트 부담을 함께 줄이는 방향을 선호합니다.

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

### Open Source Reading

검증된 라이브러리 내부를 읽고 사내 추상화 설계에 반영했습니다.

- **React Hook Form**: `useForm` proxy 기반 selective re-render 메커니즘 → `useZodForm` 어댑터 설계 시 참고.
- **Toss Slash** (`@use-funnel/core`, `overlay-kit`): funnel history snapshot + overlay 라이프사이클 → 사내 funnel wrapper / BottomSheet compound 설계 시 참고.
- **TanStack Query**: `queryOptions` 패턴 + infinite query cache 구조 → 사내 query key 표준 + `infiniteSetData` 헬퍼 설계 시 참고.

---

## Education

### 대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

---

## Certification

- 정보처리기능사 | 한국산업인력공단 | 2023.04
