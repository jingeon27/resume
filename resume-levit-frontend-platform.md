# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [기술 블로그](https://jingeon27.tistory.com/)

**지원 포지션** · Software Engineer (Frontend Platform)  
**병역사항** · 현역 산업기능요원 복무 중

---

## Professional Summary

회원 약 15만 명 규모의 B2B2C WebView 서비스와 글로벌 서비스, 운영 도구를 개발하며 기능뿐 아니라 프론트엔드 코드베이스의 빌드·테스트·관측성·아키텍처를 함께 개선해 왔습니다. 타입 검사를 **12.5초에서 1.9초**, E2E 콜드 실행을 **3.5분에서 20초**로 단축했습니다.

운영 장애를 임시로 봉합하는 데서 멈추지 않고 원인을 코드와 실행 환경까지 추적합니다. 발견한 문제는 Error Boundary·계약 검증·회귀 테스트·ESLint 규칙·CI 게이트로 연결해 같은 유형의 실패가 반복되지 않도록 만듭니다. Jira 요구사항부터 격리된 worktree, 검증, PR과 stage 배포까지 이어지는 AI 개발 워크플로도 직접 설계해 운영하고 있습니다.

### Core Strengths

- **Build & Performance** — Next.js·Node.js·ESLint·Turbopack 마이그레이션, 번들 분석, 타입 검사와 E2E 실행 최적화
- **Reliability & Observability** — Zod API 계약 검증, 구획별 Error Boundary, CloudWatch 구조화 로그, 장애 원인 분석과 회귀 테스트
- **Frontend Platform** — pnpm·Turborepo 모노레포, 공통 패키지, 자체 ESLint 플러그인, 타입 안전 폼·검색 팩토리
- **Testing** — Unit·Integration·E2E·실서버 계약 테스트의 역할 분리와 GitHub Actions 자동 검증
- **Mobile WebView** — 앱 내 WebView 서비스 운영, 네이티브 브리지와 인증·외부 링크·권한 콜백 연동
- **AI Workflow** — Claude Code·Codex, 저장소 규칙과 실행 가능한 스킬, Jira·worktree·검증·PR 자동화

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

회원 약 15만 명 규모의 병원 복지 플랫폼에서 B2B2C WebView, 운영 백오피스, 병원 어드민, 글로벌 사용자 서비스와 CMS를 개발합니다. 2026년 1월부터 기존 세 제품의 프론트엔드를 단독으로 담당했으며, 글로벌 서비스 두 개를 추가로 출시한 뒤 현재 다섯 제품의 기능·아키텍처·테스트·배포 품질을 책임지고 있습니다.

#### 빌드·모노레포·프레임워크 개선

**기간** · 2025.10 – 현재　 **역할** · 개선 과제 발굴, 마이그레이션과 검증 주도  
**기술** · TypeScript 7, Next.js 16, Node.js 24, Turbopack, pnpm, Turborepo, GitHub Actions

- B2B2C 앱의 테스트 지원 코드가 프로덕션 번들에 포함되는 문제를 분석했습니다. Next.js 14→16, Node.js 20→24, ESLint 8→9, Webpack→Turbopack 전환을 단계적으로 진행했습니다.
- TypeScript 7 네이티브 체커를 기존 검사와 병행해 결과가 일치하는지 확인한 뒤 로컬 검사 경로에 적용했습니다. 타입 검사 시간은 **12.5초에서 1.9초로 85% 단축**했습니다.
- 글로벌 앱의 의존성과 클라이언트 경계를 분석해 프로덕션 번들을 **2,564KB에서 1,880KB로 27% 축소**했습니다.
- pnpm·Turborepo의 앱 3개와 공유 패키지에서 계약이 안정된 도메인과 UI만 공유하도록 경계를 정했습니다. 역방향 의존성과 Mock 코드의 프로덕션 유입은 자동 검사로 차단했습니다.

#### 부분 장애를 허용하는 에러 처리·관측성 체계

**기간** · 2026.08　 **역할** · 설계·구현·테스트 주도  
**기술** · React Error Boundary, TanStack Query, Zod, CloudWatch, ESLint

- 목록 API 하나가 실패해도 앱 루트의 Error Boundary가 헤더·사이드 메뉴와 정상적인 형제 영역까지 제거하는 문제를 발견했습니다. Error Boundary를 컴포넌트 크기가 아니라 **독립적으로 복구할 수 있는 사용자 기능**을 기준으로 페이지·구획·오버레이에 배치했습니다.
- 실패한 구획만 대체하고 사용자는 다른 기능을 계속 이용하도록 바꿨습니다. URL로 열린 Drawer와 Modal이 실패하면 URL 상태까지 정리해 같은 항목을 다시 열 수 있게 했으며, 재시도와 화면 복구 동작을 회귀 테스트로 고정했습니다.
- API 오류·렌더링 오류·Zod 스키마 불일치를 공통 오류 모델로 통합했습니다. 앱·경로·오류 구획·요청 method·URL·HTTP 상태를 구조화해 CloudWatch로 전송하고, 반복되는 스키마 오류는 세션에서 한 번만 기록하도록 제어했습니다.
- 화면마다 조회와 상세 선언 위치가 달라 Error Boundary를 일관되게 적용할 수 없었습니다. 조회를 소유하는 View와 URL 상세의 배치 규칙을 정해 라우트 **30개**를 통일하고 **1,000줄 이상**을 줄였습니다.
- 문서로만 남긴 규칙이 다시 깨지는 것을 확인한 뒤 페이지 레이어 조회, 경계 중복과 레이어 역방향 의존성을 검사하는 **ESLint 플러그인 2종**을 개발했습니다. 경고도 CI를 통과하지 못하도록 `--max-warnings=0`을 적용했습니다.

#### 테스트 체계와 CI 신뢰도 개선

**기간** · 2025.05 – 현재　 **역할** · 테스트 전략 수립·자동화  
**기술** · Vitest, React Testing Library, MSW, Playwright, GitHub Actions

- 테스트를 순수 함수·스키마의 Unit, 컴포넌트와 API 연결의 Integration, 브라우저 흐름의 E2E, 실제 서버 계약 검증으로 나누고 각 계층의 책임을 문서화했습니다.
- 초기 Playwright E2E 10개는 콜드 실행에 3.5분이 걸리고 간헐적으로 실패했습니다. 잘못된 내비게이션 대기 조건과 반복 삽입되는 프로모션 오버레이를 각각 분리해 수정하여 **20초**, **3회 연속 flaky test 0건**으로 안정화한 뒤 CI에 연결했습니다.
- 모든 요청에 성공 응답을 반환하던 Mock이 누락된 handler와 서버 계약 차이를 가리는 문제를 발견했습니다. 처리하지 않은 요청은 즉시 실패하도록 바꾸고, 실제 인증과 서버 API를 사용하는 계약 테스트를 별도 계층으로 분리했습니다.
- 신규 테스트를 작성한 뒤 구현을 의도적으로 되돌려 해당 테스트만 실패하는지 확인했습니다. 화면이 실제로 막혀도 통과하던 회원가입 E2E의 거짓 양성을 찾아 URL과 화면 상태를 함께 검증하도록 고쳤습니다.

#### AI-native 개발 워크플로와 공통 개발 도구

**기간** · 2026.04 – 현재　 **역할** · 개발 규칙·자동화 파이프라인 설계 및 운영  
**기술** · Claude Code, Codex, git worktree, Jira, GitHub Actions

- 코딩 에이전트가 요구사항과 코드베이스 규칙을 매번 다르게 해석하고 병렬 작업의 브랜치 충돌과 검증 누락이 반복되는 문제를 해결했습니다.
- 저장소 규칙의 정본을 `AGENTS.md`로 통합하고 FSD·폼·React Query·테스트의 판단 기준을 실행 가능한 스킬로 분리했습니다. Jira 티켓 조회·계획 수립·격리 worktree 생성·코드 리뷰·lint·테스트·PR·stage 배포를 하나의 흐름으로 연결했습니다.
- 검증이 실패하면 다음 단계로 진행하지 않게 했으며, 폼 재초기화 회귀와 E2E 거짓 양성처럼 실제 작업에서 발견한 실패를 회귀 테스트와 에이전트 규칙에 함께 반영했습니다.
- 38개 이상의 중첩 필드를 가진 폼에서 Ant Design Form의 느슨한 필드 경로를 제한하는 `createTypedForm<T>`과, URL·폼·API 요청의 필드 계약을 Zod 스키마 하나로 묶는 `createSearchFilter(schema)`를 개발해 여러 앱에 적용했습니다.

#### WebView 서비스와 제품 운영

**기간** · 2025.05 – 현재　 **역할** · 사용자 서비스·운영 도구 개발 및 장애 대응  
**기술** · React, Next.js, TanStack Query, WebView Bridge

- 앱 내 WebView에서 동작하는 B2B2C 서비스를 운영하며 병원·프로그램 탐색, 상담, 리뷰, 쿠폰, 결제와 예약 흐름을 개발했습니다. JavaScript Channel 기반 브리지에 약관 완료 통지, 전화 외부 링크, 권한 콜백과 로그아웃 연동을 추가했습니다.
- 사용자 화면과 운영 백오피스·병원 어드민에서 예약→시술→결제·취소→검수·정산 상태가 일관되게 이어지도록 API 계약과 화면 상태를 연결했습니다.
- 200건을 한 번에 내려받던 글로벌 서비스 목록을 20건 단위 무한 스크롤과 행 가상화로 전환했습니다. SSR HTML을 유지하면서 카드가 쌓인 뒤에도 화면에 보이는 행만 DOM에 남도록 구성했습니다.
- 기획·운영 담당자와 VOC의 예외 상황과 우선순위를 구체화하고, 백엔드 개발자와 API 계약과 장애 원인을 검증했습니다. 회귀 가능성은 테스트나 자동화 규칙으로 남겨 다음 작업에서도 같은 기준을 사용하게 했습니다.

#### 프레임워크 회귀 원인 분석

**기간** · 2026.08　 **역할** · 재현·원인 분석·우회와 복귀 조건 수립

- 조회 조건이 포함된 주소로 진입하면 `router.replace`가 동작하지 않는 문제를 개발 서버가 아닌 프로덕션 빌드에서 재현했습니다. 관리자 목록 7개 중 6개에서 발생하는 것을 확인하고, 서버 렌더가 검색 조건을 읽지 않는 라우트의 캐시 키 문제를 Next.js 업스트림 이슈와 수정 PR까지 추적했습니다.
- 문제가 수정된 Next.js 16.3에서는 Turbopack 매니페스트 회귀와 기존 프록시 matcher가 함께 작용해 정적 청크가 CORS로 차단됐습니다. matcher에서 정적 경로를 제거하고 버전을 고정했으며, 라우터 캐시는 History API로 우회했습니다.
- 임시 조치에는 업스트림 수정이 안정 릴리즈에 포함됐을 때 다시 검토한다는 복귀 조건을 남겼습니다. 이후 같은 화면의 검증 기준도 개발 서버가 아니라 프로덕션 빌드로 변경했습니다.

### 왓타임 | Frontend Engineer | 2024.01 – 2024.11

일정 조율 서비스 ‘되는시간’과 채용 관리 플랫폼 ‘RoundHR’의 pnpm 모노레포에서 웹 프론트엔드와 후보자 수집용 Electron 앱을 개발했습니다.

- 사이트마다 중복된 크롤러를 공통 `CrawlingService`와 사이트별 Adapter 구조로 재설계해 기존 3개와 신규 3개 사이트를 하나의 파이프라인으로 통합했습니다. 개별 지원자의 오류는 전체 수집을 중단하지 않도록 격리했습니다.
- 플랫폼별 IPC·로그인·Puppeteer 처리와 공통 수집 순서를 분리해 사이트 변경과 공통 흐름 변경의 영향 범위를 나눴습니다.
- `useFunnel`의 타입 제약 문제를 발견해 [toss/slash에 수정 사항을 기여했고 PR이 머지됐습니다](https://github.com/toss/slash/pull/363).

---

## Skills

- **Language & Core** — HTML, CSS, TypeScript 7, JavaScript, React 18·19
- **Framework & Data** — Next.js App Router, TanStack Query v5, Zustand, React Hook Form, Zod
- **Build & Architecture** — Turbopack, Webpack, Vite, pnpm, Turborepo, FSD, ESLint 플러그인
- **Testing & CI** — Vitest, React Testing Library, MSW, Playwright, GitHub Actions
- **Observability** — CloudWatch 구조화 로그, Error Boundary, API 계약 검증, 장애 원인 분석
- **Platform Experience** — 모바일 WebView, JavaScript Bridge, Electron, BFF, SSR·hydration, 가상화
- **AI Development** — Claude Code, Codex, 저장소 스킬·에이전트·worktree 워크플로

---

## Technical Writing

- [오류는 남기고 화면은 덜 잃게 만든 에러 처리 개편](https://jingeon27.tistory.com/27)
- [테스트를 전부 지운 뒤 다시 만든 기준](https://jingeon27.tistory.com/25)
- [프로토타입을 실사용 서비스로 옮기며 작업 규칙을 먼저 만든 이유](https://jingeon27.tistory.com/24)
- [서로 다른 두 SSE를 하나의 상담 화면에 연결한 과정](https://jingeon27.tistory.com/20)
- [선언적 코드는 변경을 작게 만든다](https://jingeon27.tistory.com/26)

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 | 2021.03 – 2024.01
- 정보처리기능사 | 한국산업인력공단 | 2023.04
