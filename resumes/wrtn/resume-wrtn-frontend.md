# 김진건 · Frontend Engineer

jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [기술 블로그](https://blog.bambyul.com/ko/blog)

---

## Professional Summary

회원 약 15만 명 규모의 B2C·B2B2C WebView 서비스에서 검색·예약·리뷰를 개선하고, 시술 상세·쿠폰·결제 내역까지 제품 흐름을 확장했습니다. 2026년 1월부터 기존 세 제품의 개발·운영 책임을 맡고 4월부터 유일한 프론트엔드 엔지니어로 운영했으며, 7월 31일부터 글로벌 사용자 서비스와 운영 CMS까지 현재 다섯 제품을 담당하고 있습니다.

React·Next.js·TypeScript로 제품을 구현하는 것과 제품이 늘어도 변경 속도가 떨어지지 않는 기반을 함께 만들어 왔습니다. TanStack Query의 서버·클라이언트 데이터 소유권, 폼과 API 계약, FSD 경계를 정리하고 테스트·Error Boundary·Sentry·자체 ESLint 규칙을 도입했습니다. Jira 요구사항부터 plan·격리 worktree·구현·검증·PR까지 연결한 AI 개발 워크플로도 실제 제품 개발에 운영하고 있습니다.

### Role Fit

- **B2C 제품 개발·출시** · 검색·예약·리뷰 개선, 시술 상세·쿠폰·결제 내역 개발, 글로벌 사용자 서비스와 운영 CMS 출시
- **React·Next.js 깊이** · App Router SSR, TanStack Query prefetch·hydration, 프로덕션 빌드 전용 Router Cache 회귀 분석
- **모노레포·플랫폼 운영** · pnpm·Turborepo 3개 앱·9개 패키지, 공용 UI·도메인 계약·ESLint 규칙 운영
- **관측을 개선으로 연결** · Sentry의 client·server·Edge trace로 `next/link` prefetch가 반복하던 유저 정보 조회와 권한 검증을 찾아 제거
- **AI-native 개발 방식** · 요구사항 확인과 plan 검토를 앞에 두고 구현·테스트·리뷰를 자동화하며, 배포 후 발견한 기준을 Skill과 lint로 환류

---

## 지원 동기 및 커리어 방향

대규모 B2C 제품은 새 기능을 빠르게 내는 것만큼, 반복되는 실험과 여러 웹 프로젝트의 변경을 안정적으로 수용하는 기반이 중요하다고 생각합니다. 뤼튼의 프론트엔드 포지션은 React·Next.js 제품 개발과 모노레포의 프로젝트·라이브러리 운영을 함께 다룬다는 점에서 제가 해온 일과 맞닿아 있습니다.

저는 제한된 기능으로 시작한 사용자 서비스를 검색·혜택·예약·결제까지 확장하고, 그 과정에서 반복되는 구현을 Query·폼·검증·UI 패턴과 개발 도구로 정리해 왔습니다. 뤼튼에서는 이 실행력으로 사용자 기능과 공통 기반에 바로 기여하고, 관측한 사용자 행동과 성능 데이터를 다음 제품 개선으로 연결하는 프로덕트 엔지니어로 성장하고 싶습니다.

---

## Work Experience

### 세이프닥 · Frontend Engineer

**재직 기간** · 2025.05 – 현재  
**역할** · 2026.01 기존 세 제품 개발·운영 책임 · 2026.04부터 유일한 프론트엔드 · 2026.07.31 글로벌 두 제품 추가  
**제품 규모** · 회원 약 15만 명 · 제휴 기업·대학 1,800곳 · 제휴 병원 400여 곳 · 등록 프로그램 5,000개

B2C·B2B2C WebView 사용자몰, 운영 백오피스, 병원 어드민과 글로벌 서비스 2종을 개발·운영하고 있습니다. 기획·운영 담당자와 요구사항을 구체화하고 백엔드 개발자와 API 계약을 맞춘 뒤, 프론트엔드 설계·구현·출시 후 운영까지 맡고 있습니다.

#### 프로젝트 1 · 사용자 제품 확장과 React 구조 개선

**기간** · 2025.05 – 현재  
**역할** · 검색·예약·리뷰 개선, 신규 사용자 흐름 개발, 프론트엔드 공통 패턴 설계  
**스택** · React 18·19, Next.js, TypeScript, TanStack Query, React Hook Form, Zod, Zustand, Radix UI, Ant Design

**배경과 목표** · 합류 당시 사용자 서비스에는 검색·예약·리뷰의 MVP가 있었지만, Atomic Design과 초기 형태의 FSD가 혼재하고 화면마다 폼과 서버 상태를 다르게 관리하고 있었습니다. 기존 사용자 흐름을 개선하고 신규 기능을 추가하면서도 다음 변경을 수용할 수 있는 구조가 필요했습니다.

- **제품 개발** · 검색 페이지를 개편하고 예약·리뷰 흐름을 개선했습니다. 시술 상세, 쿠폰 발급·적용, 결제 내역을 추가해 사용자가 탐색부터 혜택 확인·예약·이력 조회까지 이어갈 수 있도록 제품 범위를 확장했습니다.
- **폼 상태 정리** · React Hook Form을 도입해 Zustand에 있던 작성 중 상태를 폼 내부로 옮겼습니다. 예약 폼에서는 React Query·Zustand·컴포넌트에 흩어진 상태 소유권을 정리하고 가족 동기화 컴포넌트를 **519줄에서 55줄**로 줄였습니다.
- **서버 상태 정리** · TanStack Query의 query option·key·캐시 무효화 방식을 통일했습니다. 서버에서 `ensureQueryData`로 준비한 데이터를 `HydrationBoundary`로 전달하고, 클라이언트 View가 같은 Query 캐시를 `useQuery`로 구독하도록 raw props 전달을 줄였습니다.
- **계약과 UI 패턴** · Zod를 폼·API 응답·검색 파라미터 검증과 type guard에 적용했습니다. Ant Design의 폼·테이블 사용 방식을 표준화하고 Radix UI·es-toolkit·ts-pattern을 도입해 복잡한 분기와 반복 UI를 조합 가능한 패턴으로 바꿨습니다.
- **정산 기능 인수·개선** · 전달받은 정산 코드를 기존 프로젝트의 폴더 구조, 상태 관리, API 호출과 검증 기준에 맞게 리팩터링했습니다. 이후 추가된 결제 내역과 운영 요구사항, 예외 상황을 반영하며 유지보수했습니다.
- **산출물** · [예약 폼의 작성 상태를 한 곳에서 관리하도록 바꾼 과정](https://blog.bambyul.com/ko/blog/예약-폼의-작성-상태를-zustand에서-react-hook-form으로-옮긴-과정) · [선언적 코드는 변경을 작게 만든다](https://blog.bambyul.com/ko/blog/선언적으로-코드를-쓰는-기준) · [38필드 프로그램 폼을 타입과 변환 계층으로 나눈 과정](https://blog.bambyul.com/ko/blog/두-관리자-앱의-프로그램-폼을-만드는-과정)

#### 프로젝트 2 · 글로벌 사용자 서비스와 운영 CMS 출시

**기간** · 2026.07.31 – 2026.08, 3주  
**역할** · 확정된 프로토타입 전체의 프론트엔드 제품화·출시 담당  
**스택** · Next.js 16, TypeScript strict mode, TanStack Query, TanStack Virtual, shadcn/ui, Base UI, next-intl

**배경과 목표** · 개발팀장·PO·해외 담당자가 사전 논의를 마친 뒤 전달한 Vite 프로토타입 전체를 실제 API와 연결하고, 사용자 서비스와 콘텐츠·병원·시술을 관리하는 CMS를 함께 출시해야 했습니다. 기존 국내 제품 운영을 병행하면서 두 제품을 3주 안에 완성하는 일정이었습니다.

- **제품화** · 프로토타입의 모든 화면과 기능을 Next.js 16·TypeScript strict mode 구조로 옮기고 실제 API, 오류·빈 상태와 폼 검증을 연결했습니다.
- **UI 기반** · shadcn/ui와 Base UI primitive를 프로젝트 디자인에 맞게 조합하고, Select·Dialog·Input 등 공통 UI의 접근성과 폼 연동 방식을 통일했습니다.
- **다국어·렌더링** · 영어·한국어·아랍어와 RTL을 지원하고, SSR HTML과 hydration 결과가 일치하도록 초기 렌더링을 설계했습니다.
- **목록 성능** · 200건 일괄 조회를 20건 단위 무한 스크롤로 바꾸고 TanStack Virtual을 적용해 긴 목록의 렌더링 범위를 제한했습니다.
- **결과** · 글로벌 사용자 서비스와 운영 CMS, 두 제품을 **3주 안에 출시**했습니다.

#### 프로젝트 3 · 다제품 운영을 위한 플랫폼·검증·관측 체계

**기간** · 2025.10 – 현재  
**역할** · 모노레포·아키텍처·테스트·모니터링·AI 워크플로 개선 주도  
**스택** · pnpm, Turborepo, Next.js, Turbopack, ESLint, Vitest, Playwright, Sentry, CloudWatch

**배경과 목표** · 다섯 제품의 변경을 병행하면서 수동 확인만으로 회귀를 막기 어려워졌습니다. 개별 기능 개발에 반복되는 구조와 검증 기준을 코드베이스와 개발 절차에 남길 필요가 있었습니다.

- **모노레포와 경계** · pnpm·Turborepo의 3개 앱·9개 패키지에서 계약이 안정된 API·도메인 모델·UI만 공유하고 앱별 사용자 흐름은 앱에 두는 기준을 적용했습니다. FSD의 레이어·슬라이스·Public API를 현재 구조에 맞게 정의하고 반복되는 위반은 자체 ESLint 규칙과 RuleTester로 검사했습니다.
- **부분 장애 격리 (2026.08–현재)** · Error Boundary의 기준을 컴포넌트 크기가 아니라 사용자가 독립적으로 다시 시도할 수 있는 기능으로 정했습니다. page·section·overlay로 경계를 나눠 일부 조회가 실패해도 정상 영역은 계속 사용할 수 있게 했습니다. 이를 적용하며 백오피스 라우트 30개의 화면 구성을 통일했습니다.
- **테스트 체계 (2026.07–현재)** · 순수 함수·스키마는 Unit, 실제 UI와 MSW 계약은 Integration, 브라우저 탐색·인증 흐름은 Playwright E2E로 나눴습니다. 실제 개발 서버 확인을 우선하고 만들기 어려운 상태만 Mock으로 고정했으며, 새 테스트는 제품 코드를 잠시 깨뜨려 실제로 실패하는지 확인했습니다. 변경 파일의 lint·typecheck와 관련 테스트를 기본 검증 절차로 운영하고 있습니다.
- **Sentry 활용 (2026.08–현재)** · client·server·Edge trace에서 `next/link`의 prefetch가 권한 검증 proxy를 통과하며 유저 정보 API `/member/info`를 반복 호출하는 흐름을 발견했습니다. proxy는 토큰 권한과 현재 유저 권한을 비교하기 위해 이 API를 호출하고 있었는데요. 권한 검증 경로를 가리키는 Link 9곳의 prefetch를 비활성화해 사용자가 이동하지 않은 화면의 불필요한 유저 정보 조회를 제거했습니다.
- **오류·성능 관측 (2026.08–현재)** · Sentry에 에러 레벨·Web Vitals·릴리스·소스맵을 연결하고, MCP로 이슈와 transaction을 코드 작업 중 조회할 수 있게 했습니다. 요청 URL·본문·쿠키와 breadcrumb에서 불필요한 개인정보를 제거하고, 같은 오류가 여러 런타임에서 중복 수집되지 않도록 했습니다.
- **AI 개발 워크플로 (2026.04–현재)** · Jira 티켓과 Figma를 먼저 확인해 불명확한 요구사항을 조율한 뒤, 에이전트가 영향 범위와 판단 지점을 포함한 실행 계획을 제안하도록 했습니다. 계획을 검토하면 격리 worktree에서 구현·테스트·AI 리뷰를 진행하고 Critical 항목은 자동 수정한 뒤, 변경 파일의 lint·typecheck·관련 테스트를 통과해 push·PR까지 이어지도록 구성했습니다. 스테이지 배포 전에는 누적 diff 전체를 직접 읽어 리팩터링하고, 배포 후 발견한 반복 패턴은 Skill·lint·공통 구현에 반영합니다.
- **메이저 업그레이드** · React 18→19, Next.js 14→16, TypeScript 5→6, Node.js 20→24, ESLint 8→9, Webpack→Turbopack 전환을 진행했습니다. TypeScript 네이티브 체커 `tsgo`는 기존 도구와 병행해 타입 검사에 사용했습니다.
- **개발 성능** · TypeScript 7 네이티브 체커 병행으로 타입 검사를 **12.5초→1.9초**, 복지몰 E2E의 내비게이션 대기와 오버레이 간섭을 고쳐 콜드 실행을 **3.5분→20초**로 단축했습니다.
- **산출물** · [Compound Engineering으로 코드 검토 위치를 바꿔 온 과정](https://blog.bambyul.com/ko/blog/ai가-코드를-잘-짜기-시작했는데-제가-덜-바빠지지는-않았어요) · [Sentry 도입기](https://blog.bambyul.com/ko/blog/sentry로-에러-수집부터-web-vitalsmcp릴리스까지-연결한-과정) · [에러 처리 개편](https://blog.bambyul.com/ko/blog/오류는-남기고-화면은-덜-잃게-만든-에러-처리-개편) · [테스트 도입](https://blog.bambyul.com/ko/blog/테스트-코드를-도입하면서-세운-기준)

#### 프로젝트 4 · Next.js 프로덕션 회귀 분석과 내비게이션 재설계

**기간** · 2026.08  
**역할** · 재현·원인 분석·해결 방식 결정  
**스택** · Next.js App Router, TanStack Query, History API, Turbopack

**배경과 목표** · 조회 조건이 URL에 있는 상태로 관리자 목록에 진입하면 `router.replace`를 호출해도 검색 조건이 바뀌지 않았습니다. 개발 서버와 jsdom 테스트는 통과했고 프로덕션 빌드에서만 발생했습니다.

- **원인 분석** · 실제 프로덕션 빌드로 관리자 목록을 점검해 당시 7개 중 6개에서 같은 문제를 재현했습니다. 서버가 `searchParams`를 읽지 않는 라우트에서 요청 URL과 다른 검색 문자열이 Router Cache에 기록되는 Next.js 회귀를 업스트림 이슈와 수정 PR까지 추적했습니다.
- **기술 결정** · 같은 pathname에서 서버 컴포넌트를 다시 계산할 필요 없이 클라이언트 Query가 조회를 담당하는 상태는 native History API로 변경했습니다. 뒤로가기 의미에 따라 `pushState`와 `replaceState`를 구분하고, 조회 책임은 목록 View의 `useQuery`에 뒀습니다.
- **결과** · 불필요한 RSC 내비게이션 없이 검색과 상세 URL 상태가 갱신되도록 했습니다. 프레임워크 수정 버전을 기다리는 임시 조치가 아니라 상태를 실제로 소비하는 계층이 소유한다는 내비게이션 기준으로 남겼습니다.
- **산출물** · [Next.js를 사용하며 겪은 프로덕션 이슈](https://blog.bambyul.com/ko/blog/nextjs를-사용하면서-겪었던-이슈들)

### 왓타임 · Frontend Engineer

**재직 기간** · 2024.01 – 2024.11  
**제품** · 일정 조율 서비스 ‘되는시간’ · 채용 관리 서비스 ‘RoundHR’ · 후보자 수집 Electron 앱  
**스택** · React, TypeScript, TanStack Query, Electron, pnpm 모노레포

**배경과 목표** · 채용 사이트마다 로그인부터 후보자 수집·중복 확인·업로드까지 유사한 흐름이 중복 구현돼 있어, 새로운 사이트를 연동할 때마다 같은 구조를 다시 만들어야 했습니다.

- **담당 역할** · 채용 관리 웹과 Electron 수집 앱을 개발하고, 사이트별 후보자 수집 구조를 개선했습니다.
- **제안·실행** · 로그인→수집→중복 확인→업로드의 공통 흐름과 사이트별 차이를 Adapter로 분리했습니다. 한 지원자의 실패가 전체 수집을 중단하지 않도록 오류 범위도 나눴습니다.
- **결과** · 기존 3개와 신규 3개를 합친 **6개 사이트**를 같은 수집 흐름에서 운영할 수 있게 했습니다.
- **오픈소스** · Toss Slash의 `useFunnel` 타입 계약 오류를 수정한 [PR #363](https://github.com/toss/slash/pull/363)이 병합됐습니다.

---

## Skills

- **Language & Frontend** · TypeScript(strict), JavaScript, React 18·19, Next.js 16 App Router, HTML, CSS
- **State & API** · TanStack Query v5, Zustand, React Hook Form, Zod, REST API, Axios
- **UI** · Ant Design, Radix UI, shadcn/ui, Base UI, Compound Components, Tailwind CSS
- **Architecture & Build** · pnpm, Turborepo, FSD, Vite, Webpack, Turbopack, Next.js Route Handler·BFF
- **Observability & Quality** · Sentry, Web Vitals, CloudWatch, Vitest, Testing Library, MSW, Playwright, ESLint plugin
- **Collaboration & Automation** · Git, GitHub, Jira, Figma, Claude Code, Codex, Git worktree

---

## Open Source & Technical Writing

- **Open Source** · Toss Slash `useFunnel` 타입 계약 수정 [PR #363](https://github.com/toss/slash/pull/363) 병합
- **AI Workflow** · [Compound Engineering으로 코드 검토 위치를 바꿔 온 과정](https://blog.bambyul.com/ko/blog/ai가-코드를-잘-짜기-시작했는데-제가-덜-바빠지지는-않았어요)
- **Observability** · [Sentry 도입기 — 에러 수집과 Web Vitals·MCP·릴리스까지](https://blog.bambyul.com/ko/blog/sentry로-에러-수집부터-web-vitalsmcp릴리스까지-연결한-과정)
- **Testing** · [테스트를 전부 지운 뒤 다시 만든 기준](https://blog.bambyul.com/ko/blog/테스트-코드를-도입하면서-세운-기준)
- **Next.js** · [Next.js를 사용하며 겪은 프로덕션 이슈](https://blog.bambyul.com/ko/blog/nextjs를-사용하면서-겪었던-이슈들)

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 · 2021.03 – 2024.01
- 정보처리기능사 · 한국산업인력공단 · 2023.04
