# 김진건 · Frontend Engineer

010-6865-8208 · jingeon27@gmail.com  
[GitHub](https://github.com/jingeon27) · [기술 블로그](https://blog.bambyul.com/ko/blog)  
**병역사항** · 현역 산업기능요원 복무 중 · 전직 지원

## Professional Summary

2년 이상 React·TypeScript 기반 제품을 개발해 왔으며, 현재 사내 유일 프론트엔드 엔지니어로 국내 서비스 3개와 글로벌 서비스 2개를 책임지고 있습니다. pnpm·Turborepo 모노레포, SSE 기반 실시간 UI, 대규모 목록 가상화, 다중 파일 업로드, 운영 콘솔과 공통 UI 시스템을 설계하고 운영했습니다. Claude Code·Codex가 아키텍처 규칙을 따르고 테스트와 자동 검증을 거쳐 작업하도록 개발 하네스를 구축했으며, PO·디자이너·백엔드와 요구사항 및 API 계약을 조율해 제품에 반영하고 있습니다.

### Key Achievements

- **AI 개발 하네스** · FSD·API·폼·다국어·테스트 규칙을 저장소 문서와 자동 가드로 관리하고 Jira → worktree → 검증 → PR 흐름 자동화
- **모노레포·공통 UI** · 앱 3개와 패키지 9개의 경계를 설계하고 타입 안전 검색 필터를 만들어 운영 화면 27개에 적용
- **실시간·대규모 UI** · 비표준 SSE를 표준 스트림 인터페이스로 변환하고, 200건 목록을 무한스크롤·행 단위 가상화로 전환
- **업로드·글로벌 서비스** · 다중 파일 업로드 파이프라인을 구현하고 영어·한국어·아랍어와 RTL을 지원하는 서비스 및 CMS 구축
- **테스트·운영 품질** · Vitest 1,200개 이상, Playwright E2E 70개 이상, 실서버 계약 테스트 20개를 계층별로 운영
- **성능 최적화** · 타입 검사 12.5초 → 1.9초, 글로벌 앱 번들 2,564KB → 1,880KB 축소

### Key Skills

- **Core** · React 18/19, TypeScript 7 strict, JavaScript, HTML, CSS
- **Framework** · Next.js 16 App Router, Vite, React Router
- **State & Data** · TanStack Query v5, Zustand, React Hook Form, Zod, Axios, REST
- **Realtime & Performance** · SSE, Fetch Stream, async generator, TanStack Virtual, SSR·Streaming·Hydration
- **UI** · Radix UI, Ant Design, Tailwind CSS, `tailwind-variants`, Compound Components, Accessibility
- **Architecture** · pnpm, Turborepo, Feature-Sliced Design
- **Desktop** · Electron
- **Testing & CI/CD** · Vitest, Testing Library, MSW, Playwright, GitHub Actions
- **AI-assisted Development** · Claude Code, Codex, `AGENTS.md`, 저장소 스킬·에이전트, worktree 자동화

## Experience

### 세이프닥 · Frontend Engineer

**재직 기간** · 2025.05 – 현재  
**역할** · 2026.01부터 사내 유일 프론트엔드 엔지니어  
**제품 규모** · 회원 약 15만 명, 제휴 기업·대학 1,800곳, 제휴 병원 400여 곳, 등록 프로그램 5,000개

국내 B2B2C 사용자 웹과 운영 백오피스·병원 어드민을 운영하고, 글로벌 사용자 서비스와 CMS를 새로 구축했습니다. 현재 5개 제품의 기능 개발·공통 기반·테스트·배포 품질을 담당합니다.

#### 프로젝트 1 · 운영 콘솔과 공통 UI 시스템

**기간** · 2025.05 – 현재  
**역할** · 구조 설계, 공통 모듈 개발 및 운영 화면 전환

- **타입 안전 검색 필터 구축** · `createSearchFilter<T>()` Compound API를 설계해 잘못된 서버 필드명을 컴파일 단계에서 차단하고, Keyword·Select·DateRange 등 8개 프리미티브를 제공했습니다.
- **운영 화면 27개 전환** · PA·CRM·CS·병원·회원·쿠폰·리뷰·정산 화면의 기존 필터를 공통 모듈로 이전하고 중복 날짜 필터와 레거시 위젯을 제거했습니다.
- **UI 프리미티브 20여 개 설계** · Button·Input·BottomSheet·Dialog·Toast 등을 예약·검색·리뷰·마이페이지에 적용하고, 키보드 탐색과 오류 발생 시 포커스 이동을 회귀 테스트로 고정했습니다.
- **요구사항을 UI 구조로 구체화** · 담당 유형과 개인 담당자를 하나의 Cascader에서 선택하도록 구성했습니다. Jira·Figma·API 명세의 차이와 영향 범위를 정리해 PO·디자이너·백엔드와 합의했습니다.

#### 프로젝트 2 · 실시간 AI·상담 인터페이스

**기간** · 2026.04 – 2026.07 · 스테이징 검증  
**역할** · 스트림 어댑터와 연결 상태 모델 설계·구현

- **비표준 SSE를 표준 인터페이스로 변환** · 콜백 이벤트를 async generator로 바꾸는 push→pull 브릿지와 `SubscribeConnectionAdapter`를 구현했습니다.
- **중복 렌더링 차단** · 화면에 표시할 메시지는 세션 SSE에서만 받고, AI 생성 스트림은 연결 유지에만 사용하도록 책임을 분리했습니다.
- **연결 오류 격리** · 서버 상태와 클라이언트 상태의 전이를 분리하고, 서로 다른 형태의 페이로드를 Zod로 방어적으로 파싱해 일부 메시지의 오류가 전체 스트림 종료로 번지지 않도록 했습니다.

#### 프로젝트 3 · 글로벌 사용자 서비스와 CMS 0→1

**기간** · 2026.07 · 3주  
**역할** · 단독 프론트엔드 엔지니어 / 프로토타입 제품화 및 CMS 구축

- **글로벌 서비스 2개 출시** · 기존 제품 3개의 운영을 병행하며 Vite 프로토타입을 Next.js 16·strict TypeScript 기반 서비스로 제품화하고 운영 CMS를 새로 구축했습니다.
- **대규모 목록 렌더링 개선** · 200건 일괄 렌더링을 20건 단위 무한스크롤과 행 단위 가상화로 바꾸고, 첫 페이지의 SSR HTML과 하이드레이션 결과가 일치하도록 유지했습니다.
- **파일 업로드 파이프라인 구현** · Presigned URL 발급 → 스토리지 PUT → 저장 확정으로 단계를 분리했습니다. 여러 파일의 병렬 업로드, 일부 파일이 실패했을 때 성공한 파일의 보존, 정렬 및 대표 이미지 설정을 지원합니다.
- **다국어·성능 기반 구축** · 영어·한국어·아랍어와 RTL을 지원했습니다. 프로덕션 번들에 포함되던 Mock DB를 분리해 번들을 **2,564KB에서 1,880KB**로 줄였습니다.

#### 프로젝트 4 · 프론트엔드 플랫폼과 AI 개발 하네스

**기간** · 2025.05 – 현재  
**역할** · 아키텍처·빌드·테스트·CI/CD 개선 주도

- **모노레포 경계 설계** · pnpm·Turborepo 기반 앱 3개와 패키지 9개에서 계약이 안정적으로 정리된 도메인·API·UI만 공유하고, 앱별 흐름은 각 앱에 유지했습니다.
- **아키텍처 규칙 코드화** · 250개 파일을 26일 동안 FSD 레이어로 이전하고 의존 방향과 Public API를 검사하는 ESLint 플러그인을 개발했습니다.
- **AI 작업 규칙 정립** · `AGENTS.md`와 저장소 스킬에 API·상태·폼·FSD·접근성·다국어·테스트 기준을 기록하고, 에이전트가 작업 전에 읽도록 구성했습니다.
- **작업 흐름 자동화** · Jira 작업 맥락 조회 → 브랜치·worktree 생성 → 기준 브랜치 비교 → lint·typecheck·test → PR·배포 PR 생성 과정을 반복 가능한 도구로 만들었습니다.
- **검증 체계 구축** · 단위·통합·E2E·실서버 계약 테스트의 책임을 나누고, 패키지별 검증 명령을 루트에서 반복 실행할 수 있도록 구성했습니다.
- **API 장애 추적 개선** · 앱 3개에 Zod 응답 검증과 Query·Route Error Boundary를 적용하고, 개인정보를 남기지 않으면서 파싱 오류와 서버 오류를 CloudWatch에서 추적할 수 있도록 했습니다.
- **개발 환경 최적화** · Next.js 14→16, Node.js 20→24, ESLint 8→9, Webpack→Turbopack 전환을 진행했습니다. TypeScript 7 네이티브 체커를 타입 검사 전용으로 병행해 타입 검사를 **12.5초에서 1.9초**로 줄였습니다.

### 왓타임 · Frontend Engineer

**재직 기간** · 2024.01 – 2024.11  
**제품** · 일정 조율 서비스 ‘되는시간’, 채용 관리 서비스 ‘RoundHR’, 후보자 수집 Electron 앱

- **예약 폼 구조 재설계** · React Query·Zustand·로컬 상태에 분산된 소유권을 정리하고 핵심 컴포넌트를 **520줄에서 55줄**로 축소했습니다.
- **Electron 수집기 아키텍처 개선** · 사이트별 코드를 Registry·Adapter·Template Method 구조로 재설계해 신규 채용 사이트 연동 비용을 줄였습니다.
- **데이터 운영 UI 개발** · TanStack Table 기반 정렬·필터·다중 선택과 `@dnd-kit` 칸반의 낙관적 업데이트 및 실패 시 롤백을 구현했습니다.

## Open Source & Writing

- **Open Source** · Toss Slash의 `useFunnel` 타입 오류를 수정한 [PR #363](https://github.com/toss/slash/pull/363) 병합
- **Realtime UI** · [AI와 상담사가 함께 답하는 대화 UI의 메시지 계층 설계](https://blog.bambyul.com/ko/blog/우리-백엔드가-못-건드리는-영역에서-ai-상담-챗봇-붙이기)
- **Performance** · [Next.js `'use cache'`로 대규모 사이트맵 생성 비용 줄이기](https://blog.bambyul.com/ko/blog/동적-사이트맵을-만들며-공개-api와-인증-api의-경계를-나눈-과정)
- **Architecture** · [예약 폼 리팩터링: 520줄 컴포넌트를 55줄로 줄인 과정](https://blog.bambyul.com/ko/blog/예약-폼의-작성-상태를-zustand에서-react-hook-form으로-옮긴-과정)

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 · 2021.03 – 2024.01
- 정보처리기능사 · 2023.04
