# 김진건 · Frontend Engineer

010-6865-8208 · jingeon27@gmail.com  
[GitHub](https://github.com/jingeon27) · [기술 블로그](https://blog.bambyul.com/ko/blog)  
**병역사항** · 현역 산업기능요원 복무 중 (2025.08 –) · **전직 지원**

## Professional Summary

React·TypeScript로 2년 이상 제품을 개발했고, 현재 사내 유일 프론트엔드 엔지니어로 국내 서비스 3개와 글로벌 서비스 2개를 담당하고 있습니다. AI 스튜디오처럼 **오래 걸리는 작업을 다루는 편집 도구와 관리자 서비스**에 필요한 요소 — 실시간 스트림 UI, 미디어 업로드 파이프라인, CKEditor 기반 에디터 통합, 대규모 목록 가상화 — 를 실제 제품에서 설계하고 운영했습니다. 혼자 다섯 제품을 맡는 만큼 아키텍처 규칙을 문서가 아니라 ESLint 플러그인과 CI 게이트로 강제하고, Jira 티켓부터 개발 서버 배포까지 반복 절차를 자동화해 운영합니다.

### Key Achievements

- **실시간 생성·스트림 UI** · 비표준 SSE를 표준 스트림 인터페이스로 변환하고, 일부 메시지 오류가 전체 스트림을 끊지 않도록 격리
- **미디어 업로드 파이프라인** · Presigned URL 발급 → 스토리지 PUT → 저장 확정 3단계 분리, 병렬 업로드와 부분 실패 보존
- **글로벌 서비스 0→1** · 기존 제품 3개 운영을 병행하며 Vite 프로토타입을 Next.js 16 제품으로 전환, 사용자 서비스와 CMS를 **3주** 만에 출시
- **성능 최적화** · 타입 검사 12.5초 → **1.9초**, 글로벌 앱 번들 2,564KB → **1,880KB**
- **CI/CD 구축·운영** · GitHub Actions로 검증·배포·실패 알림 파이프라인 구성, E2E 콜드 실행 3.5분 → **20초**
- **아키텍처 규칙 자동화** · ESLint 플러그인 2종을 직접 개발해 레이어 의존 방향과 라우트 구성 규칙을 검사
- **화면 구성 표준화** · 백오피스 라우트 30개에서 조회를 화면 컴포넌트로 내려 오류 복구 단위를 통일

### Key Skills

- **Language** · TypeScript (strict), JavaScript, HTML, CSS
- **Frontend** · React 18/19, Next.js 16 App Router, Vite, WebView, Electron
- **Node 런타임** · Next.js Route Handler·BFF, Electron main process, GitHub Actions
- **State & Data** · TanStack Query v5, Zustand, React Hook Form, Zod, Axios, REST
- **Realtime & Media** · SSE, Fetch Stream, async generator, Presigned URL 업로드, CKEditor 5, TanStack Virtual
- **UI** · Ant Design, Radix UI, Tailwind CSS, Compound Components, i18n·RTL
- **Architecture** · pnpm, Turborepo, Feature-Sliced Design, ESLint 플러그인 개발
- **Testing & CI/CD** · Vitest, Testing Library, MSW, Playwright, GitHub Actions
- **협업 도구** · Git, Jira, Figma, Notion, Claude Code·Codex 기반 개발 자동화

## Experience

### 세이프닥 · Frontend Engineer

**재직 기간** · 2025.05 – 현재  
**역할** · 2026.01부터 사내 유일 프론트엔드 엔지니어  
**제품 규모** · 회원 약 15만 명, 제휴 기업·대학 1,800곳, 제휴 병원 400여 곳, 등록 프로그램 5,000개

병원이 사용하는 CRM과 내부 운영 백오피스를 운영하고, 글로벌 사용자 서비스와 CMS를 새로 구축했습니다. 현재 5개 제품의 기능 개발·공통 기반·테스트·배포를 담당합니다.

#### 프로젝트 1 · 실시간 AI·상담 인터페이스

**기간** · 2026.04 – 2026.07 · 스테이징 검증  
**역할** · 스트림 어댑터와 연결 상태 모델 설계·구현

- **비표준 SSE를 표준 인터페이스로 변환** · 콜백 이벤트를 async generator로 바꾸는 push→pull 브릿지와 `SubscribeConnectionAdapter`를 구현해, 서버 구현이 바뀌어도 UI가 같은 인터페이스로 소비하도록 했습니다.
- **중복 렌더링 차단** · 화면에 표시할 메시지는 세션 SSE에서만 받고, AI 생성 스트림은 연결 유지에만 쓰도록 책임을 분리했습니다.
- **연결 오류 격리** · 서버 상태와 클라이언트 상태의 전이를 분리하고 서로 다른 형태의 페이로드를 Zod로 방어적으로 파싱해, 일부 메시지의 오류가 전체 스트림 종료로 번지지 않도록 했습니다.

#### 프로젝트 2 · 글로벌 사용자 서비스와 CMS 0→1

**기간** · 2026.07 · 3주  
**역할** · 단독 프론트엔드 엔지니어 / 프로토타입 제품화 및 CMS 구축

- **글로벌 서비스 2개 출시** · 기존 제품 3개 운영을 병행하며 Vite 프로토타입을 Next.js 16·strict TypeScript 기반 서비스로 제품화하고, 콘텐츠 운영 CMS를 새로 구축했습니다.
- **파일 업로드 파이프라인 구현** · Presigned URL 발급 → 스토리지 PUT → 저장 확정으로 단계를 분리했습니다. 여러 파일의 병렬 업로드, 일부 파일이 실패했을 때 성공한 파일의 보존, 정렬과 대표 이미지 설정을 지원합니다.
- **에디터 통합** · CKEditor 5를 래퍼 패키지로 감싸 CMS 콘텐츠 편집에 적용하고, 본문에 삽입되는 이미지가 같은 업로드 파이프라인을 타도록 연결했습니다.
- **다국어·RTL 지원** · 영어·한국어·아랍어를 지원하고, 아랍어에서 레이아웃이 뒤집히는 RTL을 공통 레이아웃 수준에서 처리했습니다.
- **대규모 목록 렌더링 개선** · 200건 일괄 조회를 20건 단위 무한 스크롤과 행 단위 가상화로 바꾸고, 첫 페이지의 SSR HTML과 하이드레이션 결과가 어긋나지 않도록 화면 폭 측정 전에는 그대로 렌더링했습니다.
- **번들 축소** · 도메인 코드의 공개 경로를 거쳐 프로덕션 번들에 포함되던 Mock DB의 import 경계를 분리해 **2,564KB → 1,880KB**로 줄이고, 재발은 import 제한 lint 규칙으로 막았습니다.

#### 프로젝트 3 · 운영 콘솔과 공통 UI 시스템

**기간** · 2025.05 – 현재  
**역할** · 구조 설계, 공통 모듈 개발 및 운영 화면 전환

- **타입 안전 검색 필터 구축** · `createSearchFilter(schema)` Compound API를 설계해 잘못된 서버 필드명을 컴파일 단계에서 차단하고, Keyword·Select·DateRange 등 8개 프리미티브를 제공했습니다. 설정 배열 방식이던 레거시 위젯에서는 필터만 오류 격리할 수 없어 구조 자체를 바꿨습니다.
- **운영 화면 27개 전환** · CRM·CS·병원·회원·쿠폰·리뷰·정산 화면의 기존 필터를 공통 모듈로 이전하고 중복 날짜 필터와 레거시 위젯을 제거했습니다.
- **오류 복구 단위 설계** · 앱 루트 하나가 모든 조회 오류를 받던 구조를 page·section·overlay 세 단위로 나눠, 목록 하나가 실패해도 헤더·검색 필터·상세는 계속 쓸 수 있게 했습니다.
- **요구사항을 UI 구조로 구체화** · 담당 유형과 개인 담당자를 하나의 Cascader에서 선택하도록 구성했습니다. Jira·Figma·API 명세의 차이와 영향 범위를 정리해 PO·디자이너·백엔드와 합의했습니다.

#### 프로젝트 4 · 프론트엔드 플랫폼과 개발 자동화

**기간** · 2025.05 – 현재  
**역할** · 아키텍처·빌드·테스트·배포 개선 주도

- **CI/CD 파이프라인 구축** · GitHub Actions로 lint·typecheck·test와 dev·stage·production 배포, 실패 Slack 알림을 운영합니다. 패키지별 Vitest 동시 실행에서 발생한 CPU 경합은 worker 상한으로 해결했습니다.
- **개발 환경 최적화** · Next.js 14→16, Node.js 20→24, ESLint 8→9 flat config, Webpack→Turbopack 전환을 단계적으로 진행했습니다. TypeScript 7 네이티브 체커를 타입 검사 전용으로 병행해 타입 검사를 **12.5초에서 1.9초**로 줄였습니다.
- **규칙을 lint로 강제** · 문서로만 적어둔 규칙이 지켜지지 않는 것을 확인하고, 레이어 의존 방향을 검사하는 플러그인과 라우트 구성 규칙(페이지에서의 조회 금지, 바운더리 중복 금지, 조회 래퍼 훅 금지)을 검사하는 플러그인을 외부 의존성 없이 직접 개발했습니다.
- **작업 흐름 자동화** · Jira 티켓 조회 → 격리 worktree 생성 → 작업 계획 → 구현 → 에이전트 코드 리뷰 → PR → 개발 서버 배포까지 반복 절차를 자동화하고, 리뷰 결과를 판단하는 지점 하나로 개입을 모았습니다.
- **테스트 계층 설계** · 순수 함수·스키마 → API 계약 → UI 통합 → 브라우저 E2E로 책임을 나눴습니다. 간헐적으로 실패하던 E2E 10개의 콜드 실행을 **3.5분에서 20초**로 줄이고 flaky를 제거했습니다.
- **모노레포 경계 설계** · pnpm·Turborepo 기반 앱 3개와 패키지 9개에서 계약이 안정된 도메인·API·UI만 공유하고, 앱마다 다른 흐름은 각 앱에 남겼습니다. 레거시 250개 파일을 26일 동안 FSD 레이어로 이전했습니다.
- **장애 추적 체계 구축** · 앱 3개의 API 응답을 Zod로 검증해 서버 응답과 프론트 타입이 어긋나면 필드 경로를 CloudWatch에 남기되 화면 흐름은 유지하고, 같은 불일치는 세션당 한 번만 전송하도록 했습니다.
- **프레임워크 이슈 대응** · 프로덕션 빌드에서만 재현되는 라우터 캐시 버그와 Turbopack 매니페스트 회귀를 업스트림 이슈·PR까지 추적해 원인을 특정하고, 업스트림 수정이 안정 릴리즈에 담기기 전까지의 우회와 되돌릴 조건을 함께 정리했습니다.

### 왓타임 · Frontend Engineer

**재직 기간** · 2024.01 – 2024.11  
**제품** · 일정 조율 서비스, 채용 관리 서비스, 후보자 수집 Electron 앱

- **Electron 수집기 아키텍처 개선** · 사이트마다 중복 구현되던 로그인→수집→중복 체크→업로드 흐름을 Registry·Adapter·Template Method 구조로 재설계했습니다. NestJS의 모듈 경계와 constructor injection을 참고했고, 프레임워크 도입은 CTO가 Electron main process에 과하다고 반려해 5일 만에 걷어낸 뒤 factory로 조립했습니다.
- **예약 폼 구조 재설계** · React Query·Zustand·로컬 상태에 흩어진 소유권을 정리해 핵심 컴포넌트를 **520줄에서 55줄**로 줄였습니다.
- **데이터 운영 UI 개발** · TanStack Table 기반 정렬·필터·다중 선택과 `@dnd-kit` 칸반의 낙관적 업데이트 및 실패 시 롤백을 구현했습니다.

## Open Source & Writing

- **Open Source** · Toss Slash `useFunnel`의 타입 오류를 수정한 [PR #363](https://github.com/toss/slash/pull/363) 병합
- **Realtime UI** · [AI와 상담사가 함께 답하는 대화 UI의 메시지 계층 설계](https://blog.bambyul.com/ko/blog/우리-백엔드가-못-건드리는-영역에서-ai-상담-챗봇-붙이기)
- **Security** · [크로스 도메인 인증을 URL 토큰에서 form POST BFF로](https://blog.bambyul.com/ko/blog/정산-서비스를-별도-호스트로-분리하며-도메인-간-토큰-전달을-설계한-과정)
- **Performance** · [Next.js `'use cache'`로 대규모 사이트맵 생성 비용 줄이기](https://blog.bambyul.com/ko/blog/동적-사이트맵을-만들며-공개-api와-인증-api의-경계를-나눈-과정)
- **Architecture** · [예약 폼 리팩터링: 520줄 컴포넌트를 55줄로 줄인 과정](https://blog.bambyul.com/ko/blog/예약-폼의-작성-상태를-zustand에서-react-hook-form으로-옮긴-과정)

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 · 2021.03 – 2024.01
- 정보처리기능사 · 2023.04
