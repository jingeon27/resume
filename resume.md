# 김진건

**Frontend Engineer** jingeon27@gmail.com | 010-6865-8208 | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 - 2028.06)

---

## Summary

빠르게 만들어진 서비스에 합류해 기술 부채를 정리하고, 신규 기능 개발과 구조 개선을 함께 진행해 온 프론트엔드 엔지니어입니다. 2026.01부터 세이프닥 복지몰·CMS·병원 CRM 3개 서비스의 단독 Frontend Engineer로 신규 기능 개발·운영·구조 개선을 담당하고 있습니다. React, Next.js(App Router), TypeScript 기반에서 복잡한 사용자 플로우를 운영 가능한 구조로 정리하고, 사용자 입장에서 더 명확하고 편한 경험이 무엇인지 먼저 판단하며 구현해 왔습니다.

- **Amplitude 241개 이벤트 설계 + 시술상세 실험 계측 지원** — PO가 분석한 결과, 최종 예약 전환율은 유의미한 변화가 없었지만 가입 후 예약까지의 소요시간 14분 → 11분 감소와 프로그램 기준 리뷰 수요 확대를 확인했고, 이를 바탕으로 CTA 및 후속 과제를 재설계
- **신규 가입 UTM 유실 원인 규명** — OAuth 식별자 분리 / 신규 속성 추가 가설을 검증한 뒤, Amplitude Data의 `unexpected` 속성 상태가 원인임을 찾아 코드 수정 없이 해결
- **예약 폼 상태 소유권 단일화, 가족 동기화 520 → 55줄(−89%)** (`React Hook Form + Zod + @use-funnel/core`)
- **Program 관리 v2 전면 구축** — CMS · 병원 CRM 공통 Program 업무 흐름(목록 / 등록·수정 / 삭제 검수 / 임시저장 / 검수 내역)을 `FORM_NAME` enum + Transfer Layer + `common / inspection / draft` sub-domain 구조로 재설계 ([글](https://jingeon27.tistory.com/18))
- **`@core` 디자인 시스템 20개 Primitive Component** 표준화 (Radix UI 기반)
- **SafeDoc App 961 파일 5-layer FSD 정리** + sub-domain 패턴 자체 정립 (25 entities / 20 features 슬라이스)
- **CMS · 병원 CRM 모노레포 구조 단독 재설계 — entities/features 신설 + shared 통합 (13→9개 패키지)** (Turborepo + pnpm)
- **Cross-domain token handoff 보안 설계** — URL token handoff의 access log / Referer 노출 위험을 form POST BFF 방식으로 전환하고 login-CSRF / open redirect 방어 추가 ([글](https://jingeon27.tistory.com/19))
- **Electron 크롤러 MVC + DI + Factory Pattern 재설계** — 신규 플랫폼 연동 3일 → 1일 (3개 플랫폼 도입 후 본인 측정)

스타트업 환경에서 검증 범위와 유지보수 비용을 함께 고려하며, 검증된 라이브러리 위에 얇은 어댑터를 두고 Rule of Three 이후에만 추상화를 도입합니다.

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 **SafeDoc App(복지몰)**, **CMS**, **병원 CRM**의 프론트엔드 개발과 구조 개선을 담당하고 있습니다.

합류 당시 서비스는 병원 프로그램 탐색과 예약 흐름 중심의 MVP였고, 시술 이후 단계는 앱 내에서 거의 관리되지 않는 상태였습니다. 이후 예약 이후 운영 기능, 분석 환경, 관리자 기능까지 확장하며 운영 가능한 제품 구조로 고도화했습니다.

- **비판적 검증 · 엔지니어링 판단**
  - **제안된 설계의 약점을 짚어 개선** — 정산 크로스 도메인 인증을 URL 쿼리스트링 토큰으로 위임하려던 초안에서 서버 access log·Referer 평문 노출 위험을 짚고 form POST BFF 핸드오프로 재설계했습니다. ([글](https://jingeon27.tistory.com/19))
  - **캐시가 화면에 반영되지 않는 결함 진단** — `dehydrate`한 React Query 캐시를 props/Context로 받아 _구독하지 않던_ 구조에서 `invalidate`가 무력화되는 원인을 짚고, `useSuspenseQuery` 캐시 구독으로 캐시·화면을 단일 소스화했습니다.
  - **대규모 PR 리뷰에서 프레임워크 재발명 지적** — 1,800줄 규모 검수 화면 PR에서 AntD 내장 Form을 두고 검증을 수동 구현한 부분을 짚어, `rules` + 제출 시점 `validateFields`로 단일·교차 필드·교차 행 검증까지 대체 가능함을 제시했습니다.
  - **데이터로 근본 원인 규명** — 신규 가입 UTM 유실을 OAuth 식별자 분리·신규 속성 가설부터 검증한 뒤, 실제 원인이 Amplitude 속성 상태(`unexpected`)임을 찾아 코드 수정·배포 없이 해결했습니다.

- **MVP 이후 제품 구조 확장 및 운영 기능 고도화**
  - 예약 이전까지만 중심이던 MVP를 유저용 프로그램 상세, 관리자용 프로그램 검수, 검색 필터 고도화까지 확장해 운영 가능한 제품 구조로 발전시켰습니다.
  - 마케팅팀이 도입한 Amplitude 환경 위에서 예약 전후 핵심 퍼널 이벤트를 설계·확장했고, 이후 기능 우선순위와 개편 효과를 데이터 기반으로 판단할 수 있게 했습니다.
  - 시술 이후 금액 변동(업셀링/다운셀링) 추적 공백을 보완하기 위해 기업 쿠폰과 정산 기능을 추가했고, 외부업체가 개발한 정산 영역은 계약 종료 후 요구사항 반영과 함께 FSD 전환, 컴포넌트 분리·추상화, 모달 패턴 공통화까지 정리했습니다.

- **Amplitude 241개 이벤트 설계 + 시술상세 실험 계측 지원**
  - 디자인팀의 가설("정보 풍부 → 신뢰 → 전환율")에 맞춰 시술상세 개편을 구현하고, 배포 전후 비교가 가능하도록 퍼널·행동 이벤트를 설계해 PO가 분석할 수 있는 계측 기반을 만들었습니다.
  - PO 분석 결과, 최종 예약 전환율은 유의미한 변화가 없었지만 가입 후 예약까지의 소요시간은 14분에서 11분으로 줄었고, 예약 페이지 진입 후 최종 신청까지의 전환은 개선되었습니다.
  - 또한 시술상세 진입 사용자 중 25%가 리뷰를 조회했고(병원상세 8%), 리뷰 조회 사용자의 예약 전환율이 비조회 사용자보다 약 15%p 높다는 점이 확인되어 프로그램 기준 리뷰 분리와 CTA 재배치를 후속 과제로 도출했습니다.
  - 신규 가입 유저의 UTM 유실 문제에서는 OAuth 로그인 전후 식별자 분리와 신규 속성 추가 가설을 먼저 검증했고, 실제 원인이 Amplitude Data의 `initial_utm_source` 속성 상태(`unexpected`)임을 찾아 코드 수정 / 배포 없이 해결했습니다.

- **예약 Form 아키텍처 리팩토링 — 가족 동기화 520 → 55줄** ([글](https://jingeon27.tistory.com/11))
  - `useState` 30개와 props drilling, `useEffect` 5~6개로 얽혀 있던 가족 동기화 코드를 `React Hook Form + Zod + @use-funnel/core` 조합으로 정리했습니다.
  - 날짜 선택 상태가 local state와 Zustand store에 중복 저장되고, 가족 목록이 React Query cache와 store에 이중 관리되던 구조를 FormProvider 중심으로 재정리해 상태 소유권을 단일화했습니다.
  - 가족 데이터 동기화 로직(ReservationPersonSelector)을 520줄에서 55줄로 줄였고, cross-field 검증을 if 분기에서 `superRefine` 선언형 schema로 옮겼습니다.
  - 이 패턴은 리뷰 작성 / 상담 신청 / 회원정보 수정에도 재사용했습니다.

- **리뷰 작성 플로우 — 0부터 설계한 신규 도메인 (1,290 LOC)** ([글](https://jingeon27.tistory.com/15))
  - 4단계 funnel, step별 Zod schema, 통합 schema를 설계했습니다. 가족 정보는 prefetch 후 form에 주입했습니다.
  - 이후 상담 / 견적 요청 플로우를 설계할 때 레퍼런스 구현으로 활용했습니다.

- **`@core` 디자인 시스템 — 20개 Primitive Component**
  - Radix UI / Headless UI 위에 `Button`, `Input`, `BottomSheet`, `Dialog`, `Toast`, `Tooltip`, `Callout`, `Checkbox`, `Radio`, `Toggle`, `Tabs`, `Chip`, `Menu` 등을 공통화했습니다.
  - `tailwind-variants`로 size / intent / state 3축을 표준화해 inline `className` override 안티패턴을 줄였습니다.
  - BottomSheet Compound (`Root/Header/Content/Footer`)를 `react-modal-sheet` 위에 설계하고 `overlay-kit` imperative API로 호출하도록 구성해, 뒤로가기(`popstate`) 닫기 · backdrop tap 닫기 · snap point/detent를 `Root` 라이프사이클 레이어 한 곳에서 처리했습니다.

- **SafeDoc App 프론트 아키텍처 정리**
  - 961 파일 규모의 코드베이스에서 FSD와 Atomic Design 잔재가 섞여 있던 구조를 5-layer FSD (`app / pages / widgets / features / entities / shared`)로 표준화했고, 25개 entities / 20개 features 슬라이스의 경계와 Public API 기준을 정립했습니다.
  - widgets → features 이관, 순환 의존 해소, 파일명 kebab-case 정리를 점진적으로 진행했습니다.
  - `ensureQueryData` + props drilling로 캐시를 구독하지 않아 무효화가 화면에 반영되지 않던 구조를, `queryOptions` + Server Component prefetch → `HydrationBoundary` → `useSuspenseQuery`로 전환해 구독을 호출 지점으로 분산했습니다. infinite query는 사내 `infiniteSetData` 헬퍼로 nested page 내 개별 아이템을 갱신했습니다.
  - 공통 부모 `layout.tsx` 단계에서 program 상세 정보를 prefetch하도록 구조를 바꿔, 기존에 프로그램 상세 페이지와 상담 페이지가 각각 별도로 호출하던 `/program/detail` API를 request-scoped 캐시 안에서 재사용하게 만들었고, 하위 page 전환 시 server-level 중복 fetch를 줄였습니다.

- **CMS · 병원 CRM 모노레포 구조 단독 재설계 — 13→9개 패키지**
  - 초기 패키지 구조(기능별 shared 5분할 등)는 이전 개발자들 설계였고, **인수 이후 구조 설계는 단독으로** 진행했습니다 — 도메인 공유 패키지(entities/features) 신설, shared 5분할이 import 경로만 분산시킨다고 진단해 단일 `@safedoc/shared`로 통합(13→9개), FSD sub-domain·queryOptions 컨벤션 정립. workspace protocol과 pnpm catalog로 공통 의존성을 관리합니다.
  - CMS와 병원 CRM의 중복 구현을 줄이기 위해 `entities`, `features`, `shared`, `config`, `lib` 패키지 경계를 나누고, 공통 도메인은 패키지로 추출해 두 앱에서 같은 구현을 재사용하도록 설계했습니다.
  - `@safedoc/ui` 패키지 빌드 방식을 `prebuilt(tsup)`에서 `no-build bundled`로 전환해 패키지 ↔ 앱 변경이 즉시 HMR에 반영되도록 했습니다.

- **Claude skills 기반 개발 문서화 및 workflow 변경**
  - `.claude` 설정과 skills 문서를 정리해 FSD 경계, Public API 기준, 모달 제작 패턴, 정산 도메인 리팩토링 방식, 기획 맥락 같은 반복 지식을 문서화했습니다.
  - **OpenAPI JSON → 컨벤션 인지 타입 생성을 스킬로 표준화** — 제네릭 codegen(kubb)이 `x-enum-varnames` 부재 시 PascalCase enum(`Rejected = 'REJECTED'`)·Transfer Layer 컨벤션을 못 맞추는 문제를, AI가 스펙 JSON을 읽어 컨벤션대로 `types/*.type.ts`를 생성하는 절차를 스킬로 명시해 충족했습니다.
  - `jira-branch` 명령으로 이슈와 브랜치 맥락을 읽고 작업 계획 초안을 만들 수 있게 했고, 반복되는 커밋 / PR 작성 흐름을 명령화해 문맥 전환 비용을 줄였습니다.
  - PR 전에는 AI agent 코드리뷰를 보조 점검 단계로 활용해 경계 위반, 네이밍, Public API 누락 같은 이슈를 먼저 확인했고, worktree를 활용해 2~3개의 작업을 병렬로 진행하는 workflow를 운영했습니다.

- **AI 출력 비판적 감독 — 생성 코드를 컨벤션으로 게이트**
  - AI 생성 코드를 수동 수용하지 않고 `.claude` 컨벤션으로 검증·교정했습니다. 과한 추상화·간접 레이어·손쉬운 우회를 일관되게 reject하고 더 단순하고 정확한 구조로 정리하는 흐름을 운영했습니다.
  - **손쉬운 우회 → 근본 원인** — 빌드 프리렌더 실패에 `force-dynamic`을 덧붙이려는 것을 막고 `'use client'` 누락이라는 실제 원인을 고쳐 전 라우트 dynamic 통과를 검증했고, 제출 시점 데이터를 `ensureQueryData`로 가져오려던 imperative 방식을 eager `useQuery`로 되돌렸습니다.
  - **불필요한 우회·트릭 차단** — `window.scrollTo` 같은 UI 트릭이나 단일 사용처를 위한 공용 컴포넌트 추상화 제안을 거부하고, 프레임워크 기본 동작·호출부 정리로 해결했습니다.
  - **생성 코드 버그 진단** — AI가 만든 mutation 훅이 create/update 겸용이라 _수정 시에도_ `router.push`가 발동하던 버그를 진단해 `useCreate`/`useUpdate`로 분리하고 navigation을 호출 컴포넌트로 옮겼습니다.
  - **무조건 거부가 아닌 경계 판단** — 조회 래퍼 훅은 금지하되 부수효과(캐시 무효화·토스트)가 묶이는 mutation 훅은 예외로 허용했고, 불필요한 묶음 mutation·앱 레벨 re-export 같은 간접 레이어는 직접 호출로 정리했습니다.

- **FSD sub-domain 패턴 자체 정립**
  - 단일 슬라이스 파일이 30개 이상 누적되면 평평한 구조가 가독성을 해친다고 판단해 `entities/settlement/{common, contract, deposit, disapproval, omission}` 형태로 도메인 라이프사이클 단계별 분할을 도입했습니다.
  - sub-feature 패턴 (`features/program/ui/{detail, modal}`)으로 UI 블록 의존성을 폴더 트리에서 가시화했습니다.
  - **한계**: 30+ 누적 후에야 도입 → 마이그레이션 비용 증가. 15개 시점에 도입 기준이 있었다면 비용 절반.

- **Program 관리 v2 전면 구축 — 업무 흐름 재설계 + 대규모 복합 폼 시스템**
  - 기존 병원 CRM 프로그램/검수 관리 흐름을 대체하기 위해 목록, 등록·수정, 삭제 검수 요청, 임시저장, 검수 내역, 상세 확인까지 Program 관리 v2 업무 흐름을 새로 구축했습니다.
  - CMS / 병원 CRM이 공유하는 38개 필드 규모의 Program 관리 폼을 `program/{common, inspection, draft}` sub-domain으로 나누고, 공통 Program 원본 / 검수 요청 / 임시저장의 서로 다른 생명주기를 코드 구조에 반영했습니다.
  - 2-tier `FORM_NAME` enum을 통해 공통 필드는 `PROGRAM_FORM_NAME_TYPE_COMMON`으로 표준화하고, CMS / 병원 CRM 전용 enum이 같은 값을 재참조하도록 만들어 공통 필드 변경을 양쪽 앱에 동기화했습니다.
  - Transfer Layer (`programDetailToClientProgramForm` / `clientProgramFormToCreateRequest` / `clientProgramFormToProgramInspection`)로 서버 응답·요청과 AntD Form 값을 분리했고, Dayjs / UploadFile / 상세 이미지 템플릿 데이터를 양방향으로 변환했습니다.
  - 상세 이미지 템플릿(`SafedocTemplate` / `CustomImage`)은 `@safedoc/features`의 공통 `ProgramDetailImageFormSection`으로 추출하고, CMS / 병원 CRM은 각자 설정·검수·노출 필드만 앱별 section으로 조립하도록 구성했습니다.
  - `Form.List`, `useWatch`, `shouldUpdate`, custom validator를 조합해 조건부 렌더링, 시술 전후 이미지 페어 검증, 비동기 이미지 업로드 응답 검증, cascade validation을 구현했습니다.

- **콜인 / 워크인 듀얼 패스 동의서**
  - `PROXY_RESERVATION_INFLOW_TYPE` enum (`CallIn` / `WalkIn`)으로 진입을 분기했고, `AgreementCallInFormValues`(4개 동의 필드)와 `AgreementWalkInFormValues`(1개 필드)를 분리했습니다. CMS / 병원 CRM 양쪽에서 동의서 콘텐츠는 공통 패키지로 공유했습니다.

- **정산 리펙토링 + 운영건 작업**
  - Next.js Middleware + Route Group `(altLayout)/settlement`로 별도 호스트를 분리하면서도 단일 코드베이스를 유지했습니다. 동시에 legacy `fetch/apis` 구조를 FSD `entities/features` 구조로 마이그레이션했습니다.
  - 서로 다른 registrable domain 간 HttpOnly 쿠키를 공유할 수 없는 문제를 해결하기 위해 정산 메뉴 클릭 시 토큰을 handoff하는 흐름을 설계했고, URL query 방식에서 form POST BFF 방식으로 전환해 access log / Referer 노출 위험을 제거했습니다.
  - BFF에는 Origin / Referer 검증, `Cache-Control: no-store`, `303 See Other`, `next` pathname 정규화 기반 open redirect 방어를 추가했고, 미들웨어는 도메인 라우팅만 담당하도록 handoff 책임을 별도 API 라우트로 분리했습니다.
  - `queryClient.setQueriesData`로 즉시 반영하고, 실패 시 catch 블록에서 자동 롤백되도록 구성해 정산내역 / 숨김처리 비교 두 탭이 함께 갱신되도록 했습니다.
  - 정산 `entities`를 `common / omission / disapproval / deposit / contract` sub-domain으로 나누고, `features/settlement`는 URL 기준 `dashboard / monthly / program / contract` 구조로 재편했습니다. `settlement/program`과 `settlement/monthly` 페이지는 SearchFilter / Table / hook / modal 단위로 분리해 레거시 page 중심 구조를 걷어냈습니다.
  - 레거시 `forwardRef` 기반 모달은 `overlay-kit` 패턴으로 전환했습니다. `settlement/program`과 `settlement/monthly`의 대표 모달을 먼저 리팩토링한 뒤, 동일한 컨벤션과 체크리스트를 바탕으로 비슷한 패턴의 모달과 페이지를 같은 방식으로 정리했고, PR 전 보조 코드리뷰로 경계 위반과 Public API 문제를 먼저 점검했습니다.
  - 이 과정에서 `handleUpdate` 계열 로직은 curried 함수 → 단일 함수 통합 + 실패 폴백 추가로 정리했고, settlement mutation은 optimistic update 패턴으로 통일했습니다.

- **운영자 도구 UX 및 백오피스 도메인 표준화**
  - 예약, 프로그램 검수, 정산, 병원 계약, 리뷰, 채팅, 홈 설정, 기업 / 대학교 관리처럼 운영자가 반복적으로 사용하는 CMS / 병원 CRM 화면을 도메인 단위로 분리했습니다.
  - SearchFilter / Table / Modal / Drawer / Detail Form 패턴을 반복 가능한 단위로 정리해 레거시 page 중심 구조에서 기능 단위 구조로 옮겼습니다.
  - 정립한 `entities` / `DetailDrawer` / SearchFilter 패턴 위에서 신규 쿠폰 템플릿 관리 도메인(목록 / 등록 / 복제 prefill / 상태 일괄변경)을 12파일 규모로 추가해, 표준화된 구조가 신규 어드민 도메인 개발 속도로 회수되는 것을 확인했습니다.

- **병원 검색**
  - `geolib` 거리 계산 + `naver-maps` SDK + `react-intersection-observer` 무한 스크롤 + 자동완성 / 인기 검색어 / 실시간 검색 카운트.

- **동적 sitemap / robots 설계 (SEO)**
  - 병원 / 프로그램 / 공지 / 혜택 탐색 / 진료과·시술·세부시술 검색 경로를 5개 API에서 `Promise.all`로 수집해 sitemap을 동적 생성했고, 페이지 유형별 우선순위(`MULTI / SINGLE / ETC / FORM`) taxonomy를 부여했습니다.
  - `page:1, size:1`로 `totalCnt`를 먼저 조회한 뒤 `size=totalCnt`로 전량을 수집했고, Next.js가 `<loc>`를 XML 이스케이프하지 않는 문제를 직접 escape 처리로 보완했습니다.
  - 세부시술 allowlist와 `revalidate=86400`(24h ISR)로 sitemap 비대화와 빌드 부하를 함께 제어했고, `robots.ts`의 disallow 경로를 정리했습니다.

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

- 스타트업 환경에서 검증 범위와 유지보수 부담을 함께 고려해 검증된 라이브러리 위에 얇은 어댑터를 둡니다.
- Rule of Three 이후에만 추상화를 도입하고, 신규 기능 PR 안에서 해당 영역만 점진적으로 정리해 초기 과설계를 피합니다.
- Server / Form / UI 전역 / 로컬 상태의 역할을 분리해 한 도구에 과도하게 책임을 몰지 않습니다.
- FP 스타일과 `es-toolkit`, `ts-pattern`을 활용해 선언적으로 표현하되, 과한 추상화는 지양합니다.
- 리스트 virtual scroll, 검색·필터 구조 개선, 모달 패턴 공통화처럼 제품 성능과 운영 경험을 함께 개선하는 제안을 지속해 왔습니다.
- UI 일관성, 사용자 인지 방식, 기존 패턴과의 정합성을 근거로 디자이너·기획자와 소통합니다.

### AI Workflow

- `jira-branch` 명령으로 JIRA 티켓과 브랜치 맥락을 읽어 작업 계획 초안을 만들고, 반복되는 커밋 / PR 작성 흐름을 명령화했습니다.
- PR 전에는 AI agent 코드리뷰를 보조 점검 단계로 활용했고, skills에는 코드 패턴과 기획 맥락을 문서화해 반복 작업의 문맥 비용을 줄였습니다.
- worktree를 활용해 2~3개의 작업을 병렬로 진행하며 개발 흐름을 운영했습니다.

### React 18

- Compound Pattern + Custom Hook 추상화로 디자인 시스템 / 폼 도메인 직접 설계.
- `useSuspenseQuery` + `getQueryClient` + `HydrationBoundary` SSR 데이터 페칭 표준화.
- 외부 mutable store를 React state로 억지로 감싸지 않고 `useSyncExternalStore` 기반 adapter로 연결해 React 18 external store contract에 맞춘 구독 구조 설계.
- BottomSheet Compound (`Root/Header/Content/Footer`) + `overlay-kit` 라이프사이클 명시화로 4가지 모바일 엣지 케이스 처리.
- 스타트업 환경에서 검증된 라이브러리를 우선 활용하고 필요한 만큼만 래핑해, 직접 구현 범위와 검증해야 할 표면적을 함께 줄이는 방향으로 설계했습니다.

### TypeScript 5

- Variadic tuple 단계별 폼 타입 합성, recursive type nested key path 추론, mapped type + key remapping 도메인 타입 자동 생성.
- class instance에서 method key만 추론하는 mapped type 유틸을 만들어 core 자료구조 API를 React hook adapter로 노출.
- Zod schema 추론 제네릭 (`z.infer<ZodObject<T>>`) → schema 변경 시 form 타입 자동 동기화.
- Discriminated Union 도메인 적용: 콜인 / 워크인 동의서 폼 타입 분리.
- `satisfies` + `as const` 도메인 상수 객체 좁은 추론.

### Next.js 15 App Router

- **Middleware / BFF**: `/settlement/*` 별도 호스트 분리, handoff API 라우트, form POST 기반 토큰 위임. URL token 방식의 access log / Referer 노출 위험을 제거하고 Origin / Referer 검증, `no-store`, `303`, open redirect 방어 적용.
- **Route Group**: `(altLayout)/settlement` 별도 레이아웃 + 단일 코드베이스.
- **Streaming SSR + Suspense**: boundary 단위 chunk 분할.
- **Caching**: `cookies()` / `searchParams` dynamic 강제 트리거, fetch caching 옵션 (`force-cache` / `no-store` / `revalidate` / `tags`) 도메인별 적용. `revalidatePath` vs `revalidateTag` 차이 기반 무효화 전략.
- **RSC**: Server → Client props 직렬화 제약 (함수 / class instance / Symbol 불가) 이해 기반 컴포넌트 경계 설계.

### Architecture

- **FSD 5-layer + sub-domain 자체 정립**: 961 파일 코드베이스 표준화. sub-domain은 FSD 공식이 아닌 자체 패턴, 슬라이스 파일 수 + 변경 빈도 기준으로 도입 시점 판단.
- **Monorepo (Turborepo + pnpm)**: 인수 이후 구조 단독 재설계(13→9 패키지, entities/features 신설). `entities` / `features` / `shared` / `config` / `lib` 경계로 CMS와 병원 CRM의 공통 도메인 구현 공유.
- **Library Adapter Design**: core 로직과 React binding을 분리하고, observer + `useSyncExternalStore`로 imperative 자료구조를 hook API로 노출.
- **MVC + DI + Factory Pattern**: Electron 크롤러 재설계 (왓타임).
- **Compound / Composition Pattern**: BottomSheet, Tabs, Form 핵심 UI 도메인 적용.

### Form & Validation

- **React Hook Form + Zod**: `useZodForm` 어댑터 (schema → form 타입 자동 동기화). step별 schema 분리 + 통합 schema, `superRefine` cross-field validation.
- **Ant Design Form**: 대규모 복합 폼에서 `Form.List` + `shouldUpdate` + `useWatch` cascade validation, `Form.Item` custom trigger (`onDragTable`), 비동기 이미지 업로드 + `customRequest` + validator 응답 객체 존재 여부 판단.

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
- **TanStack Query**: `queryOptions` 패턴 + infinite query cache 구조 → 사내 query key 표준 설계 시 참고.

---

## Side Projects

### data-structure-ts

- core 자료구조 패키지와 React binding 패키지를 분리하고, Queue / Heap / PriorityQueue를 observer 기반 외부 store로 모델링했습니다.
- React adapter는 `useSyncExternalStore`로 구독하고, `bindMethods<T>` mapped type으로 class instance의 method key만 추론해 hook API로 노출했습니다.
- core logic과 React binding을 분리해 자료구조 동작은 core에서, hook 구독 동작은 adapter 레벨에서 검증할 수 있게 설계했습니다.

---

## Education

### 대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

---

## Certification

- 정보처리기능사 | 한국산업인력공단 | 2023.04
