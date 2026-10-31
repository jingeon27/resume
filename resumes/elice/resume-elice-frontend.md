# 김진건

Frontend Engineer | jingeon27@gmail.com | [GitHub](https://github.com/jingeon27) | [기술 블로그](https://blog.bambyul.com/ko/blog)

산업기능요원 현역 복무 중 | 2025.08 편입 | 전직 희망

## 소개

여러 제품에서 함께 쓰는 폼과 데이터 조회, 오류 처리를 정리해 온 프론트엔드 엔지니어입니다. 예외가 쌓인 공통 검색 필터를 화면별 조합으로 바꿔 27개 화면에 적용하고, 재귀 조건부 타입으로 중첩 필드명과 값의 타입을 검사하도록 만들었습니다.

새 기능의 출시와 기존 구조 개선을 함께 맡습니다. 현재 전사 프론트엔드 개발과 QA, 병원 관리자와 백오피스 화면 디자인을 담당합니다. AI가 구현한 코드와 테스트를 검토하고, 테스트가 실제 앱과 같은 조건을 보장하는지도 확인합니다.

[상세 포트폴리오와 경력기술서](https://github.com/jingeon27/resume/blob/main/portfolio.md) | [AI 활용 경험](https://github.com/jingeon27/resume/blob/main/resumes/doers/portfolio-doers-ai-experience.md)

## 지원동기

학습과 실습, 평가가 연결된 제품에서 기능을 확장하면서도 상태와 오류 처리의 기준을 유지하는 일을 하고 싶습니다. 여러 사용자 웹과 관리자 서비스의 공통 구조를 다듬고 실시간 연결을 다뤄 온 경험을 엘리스에 살리고 싶습니다.

[프론트엔드팀 소개](https://elice.io/ko/resources/blog/ai-a-z-part2)에서 기획부터 의견을 나누고 코드 리뷰와 기술 논의를 제품에 반영하는 방식을 읽었습니다. 현재는 프론트엔드를 단독으로 맡고 있는데, 엘리스에서는 동료들과 설계를 검토하며 기능과 공통 도구를 함께 개선하고 싶습니다.

## 경력

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

세이프닥은 제휴 병원의 비급여 프로그램을 예약하는 B2B2C 서비스입니다. [복지몰](https://safedoc.io/) MVP 출시 초기에 합류해 가입 회원 약 15만 명, 주간 활성 사용자 약 1만 명의 복지몰과 병원 관리자, 백오피스를 개발합니다. 2026년 1월부터 사내 유일한 프론트엔드 개발자이며, 4월부터 전사 프론트엔드를 단독으로 담당합니다. 7월부터 글로벌 사용자 서비스와 CMS도 맡았습니다.

#### 공통 폼과 코드 구조 | 2025.06 – 현재

공통 검색 필터에 화면별 예외가 쌓여 한 화면을 고칠 때 다른 화면의 조건도 확인해야 했습니다. 필요한 필터를 화면에서 조합하도록 바꿔 27개 화면에 적용했습니다. JSX 중복은 일부 감수하고 URL과 폼, API 요청은 같은 Zod 스키마를 따르도록 맞췄습니다.

- Ant Design Form에는 `createTypedForm<T>`를 만들었습니다. 재귀 조건부 타입과 `infer`로 유효한 중첩 경로와 값을 계산해 name, 값 조회와 수정, 구독에 적용했습니다. 라이브러리 연결에 필요한 단언은 래퍼 안에 뒀습니다.
- 가족과 날짜 값이 Query, Zustand, 로컬 상태에 흩어진 예약 폼은 서버 목록, 작성 중인 값, 제출 조건의 책임을 Query와 React Hook Form, Zod로 나눴습니다. 예약 대상 선택 컴포넌트는 519줄에서 55줄로 줄었습니다.
- FSD의 모호했던 레이어 기준을 정리해 서버 도메인은 features, 화면 조합은 pages, 공통 UI는 shared에 뒀습니다. 화면 간 직접 참조 62건을 정리하고 lint error로 막았으며, 관리자 서비스의 프로그램과 시술 도메인 사이 순환 의존성도 끊었습니다.
- 공통 UI는 Headless UI에서 Radix UI로 옮겨 접근성 primitive와 조합 방식을 활용했습니다. Bottom Sheet는 Compound Components와 overlay-kit으로 구성해 본문과 하단 버튼이 같은 폼을 쓰게 했습니다.

[폼 타입 설계](https://blog.bambyul.com/ko/blog/두-관리자-앱의-프로그램-폼을-만드는-과정) | [공통 UI와 추상화](https://blog.bambyul.com/ko/blog/선언적으로-코드를-쓰는-기준) | [FSD 구조 변경](https://blog.bambyul.com/ko/blog/fsd-폴더는-다-있었는데-새-파일을-어디에-둘지-설명하기-어려웠어요)

#### 건강검진 도메인 내재화 | 2026.09 – 현재

검사 구성과 기업지원 코드, 예약금이 비급여 프로그램과 달라 기존 서비스로 관리하기 어려웠습니다. 제휴 병원의 요청으로 시작해 개발팀장, 부팀장과 빠진 동작과 예외를 확인하며 세 제품의 프론트엔드를 맡았습니다. 9월 9일 개발을 시작해 23일 운영에 배포하고 30일 정식 오픈했습니다.

백오피스의 검진 구성과 기업지원 서류 확인, 결제취소와 환불 승인, 병원 관리자의 예약 관리와 결제취소 요청, 복지몰의 검사 선택과 기업 검진 코드, 토스페이먼츠 결제를 개발했습니다.

모바일 결제 복귀 시에는 같은 `orderId`이며 Zod 검증을 통과한 입력값만 한 번 복원합니다. 입력 복원과 승인 요청 실패 뒤 이동은 dev API 서버 E2E로 확인했습니다. 일괄 저장이 일부만 성공하면 서버 목록의 발급된 ID를 폼에 반영해 재시도 때 중복 등록되지 않게 했습니다.

[건강검진 개발 과정](https://blog.bambyul.com/ko/blog/기존-프로그램-구조에-건강검진을-들이며-화면을-나눈-기준)

#### Sentry 도입과 운영 오류 추적 | 2026.08 – 현재

브라우저, 서버, Edge에 Sentry를 도입해 8월 27일 운영에 배포했습니다. 오류별 level과 중복 수집을 정리하고 release와 브라우저 소스맵을 연결했습니다. SDK와 payload를 확인해 민감정보를 제거하고, Web Vitals가 pageload 트랜잭션에 담기도록 idleTimeout을 조정했습니다.

- Bottom Sheet 크래시를 라이브러리 내부의 null ref 접근까지 추적해 버전업으로 해결했습니다. 누적 75건, 57명 이상에게 발생한 오류 그룹은 9월 10일 배포 뒤 28일까지 18일간 추가 발생 0건이었습니다.
- 일부 조회 실패가 정상 화면까지 가리지 않도록 기능별 오류 경계를 두고 백오피스 라우트 30개에 적용했습니다. 동의서 문서 조회가 실패해도 고객명과 동의 내역은 남는지 테스트했습니다.
- API 응답 스키마 불일치는 CloudWatch로 트래킹합니다. URL은 잘못된 필드만 기본값으로 바꾸고, 결제 후 복원할 입력은 검증에 실패하면 버리는 등 값의 출처별로 실패 정책을 나눴습니다.

[Sentry 도입](https://blog.bambyul.com/ko/blog/sentry로-에러-수집부터-web-vitalsmcp릴리스까지-연결한-과정) | [크래시 분석](https://blog.bambyul.com/ko/blog/sentry가-잡아-준-bottom-sheet-드래그-크래시-원인-경로가-사라진-버전으로-올리기까지)

#### 테스트 도입 | 2026.07 – 현재

함수와 스키마는 Vitest, UI와 폼은 React Testing Library, 브라우저 흐름은 Playwright로 확인합니다. 실제 RHF와 Ant Design Form을 조작해 제출하고 기대 payload는 제품의 변환 함수를 재사용하지 않고 작성합니다.

- 새 기능은 BDD 형식의 `*.spec`에 컴포넌트별 기대 동작을 적고 누락을 검토합니다. 운영이나 QA 오류는 `*.test`에 재현하며 새 패턴은 제품 코드를 일부러 깨뜨려 실패하는지 확인합니다.
- API 연동은 dev API 서버를 우선하고 어려운 조건에 MSW를 씁니다. 목의 성공 응답이 실제 서버의 계약 위반을 가리지 않도록 계약 테스트도 뒀습니다. 병원 관리자 등록부터 백오피스 반려와 승인까지는 두 앱을 연결한 E2E로 검증합니다.
- 테스트용 QueryClient가 앱과 다르게 오류를 처리해 실제로는 오류 경계에 가려질 UI를 검증하고 있었습니다. 설정을 맞추고 데이터가 없는 첫 조회 실패와 기존 데이터의 재조회 실패를 구분했습니다.

[테스트 도입 기준](https://blog.bambyul.com/ko/blog/테스트-코드를-도입하면서-세운-기준)

#### 서버 렌더링과 개발 환경 | 2025.05 – 현재

`ensureQuery` 결과를 render props로 받던 화면은 Query 캐시를 구독하지 않았습니다. 2025년 5월 예약 화면부터 prefetch와 hydration으로 바꿔 서버가 준비한 데이터를 클라이언트도 같은 캐시에서 읽고 갱신하도록 했습니다.

- 인증 후 이동 중 앱이 멈춰 조사 당시 53명에게 68건의 오류가 발생했습니다. Next.js 소스를 읽어 `redirect()` 처리 중 AppRouter의 렌더가 끊기며 훅 개수가 달라지는 경로를 찾고 진입 판정과 리다이렉트를 proxy로 옮겼습니다.
- 개발 서버에서 나타나지 않던 검색 오류는 build 후 start로 목록 7개 중 6개에서 재현했습니다. 업스트림 이슈와 수정 PR로 원인을 확인하고 서버가 읽지 않는 URL 조건은 History API로 처리했습니다. 수정 뒤 9월 28일까지 같은 증상은 다시 보고되지 않았습니다.
- Next.js 14→16, React 18→19 전환은 Turbopack과 Next.js 16의 개발 속도 개선을 보고 결정했습니다. 별도로 TypeScript 7 네이티브 체커를 병행해 타입 검사 시간을 12.5초에서 1.9초로 줄였고, 타입 기반 lint는 3.3배 느려 도입을 보류했습니다.

[Next.js 오류 대응](https://blog.bambyul.com/ko/blog/nextjs를-사용하면서-겪었던-이슈들)

#### AI 개발 workflow | 2026.04 – 현재

파일 배치와 공통 코드 사용 기준은 skills에 남기고 의존 방향과 공개 API는 lint rule로 검사합니다. 에이전트가 완성본을 제출하면 제품 코드와 테스트를 읽고 부족한 부분은 수정을 요청해 다시 확인합니다.

티켓과 plan 검토 → 테스트 작성 → 에이전트 구현과 에이전트 코드 리뷰 → 변경분 테스트, lint, typecheck → 직접 diff 리뷰와 화면 동작 확인 → 전체 CI(테스트, knip, lint) → QA 더블 체크 요청

자체 lint rule은 RuleTester와 fixture, mock으로 검증하고 미사용 코드는 Knip으로 찾습니다. diff에서 놓친 Bottom Sheet의 헤더 스크롤은 수정 후 브라우저 레이아웃 회귀 테스트로 남겼습니다.

#### 실시간 채팅과 글로벌 서비스

- 사용자 상담 채팅을 개선하고 병원 상담 채팅을 새로 만들었습니다. 대화와 입력창, SSE 연결을 공유 패키지로 옮겨 API 함수를 주입하게 했습니다. `useSyncExternalStore`로 연결을 구독하고 토큰 갱신, `last-event-id` 재연결과 Query 캐시 갱신을 처리했습니다. 첫 조회의 마지막 순번부터 연결하도록 고쳐 회귀 테스트를 남겼습니다.
- PO의 프로토타입을 글로벌 사용자 서비스와 CMS로 옮겨 3주 만에 PoC로 배포했습니다. 영어, 한국어, 아랍어와 RTL을 지원하고, CMS 링크 발급 → 사용자 업로드 → CMS 다운로드를 하나의 E2E로 확인했습니다. 목 백엔드 의존을 분리해 앱 번들을 2,564KB에서 1,880KB로 줄였습니다.

[글로벌 서비스 개발](https://blog.bambyul.com/ko/blog/프로토타입을-실사용-서비스로-옮기며-작업-규칙을-먼저-만든-이유)

### 왓타임 | Frontend Engineer | 2024.01 – 2024.11

채용 SaaS RoundHR이 시장성을 확인하며 기능을 늘리던 시기에 합류했습니다. 채용 관리와 채용 담당자용 웹, 랜딩과 라운지, Electron 지원자 데이터 수집 앱을 개발했습니다. 개발자, 디자이너와 pnpm, Turborepo 모노레포에서 협업했습니다.

- 채용 페이지와 지원서 설정, 메일과 면접 알림 템플릿, 채용 단계 자동화, 평가와 온보딩을 개발하고 Notion, Strapi 콘텐츠를 연결했습니다.
- 면접 템플릿의 네 단계 입력을 `useFunnel`로 만들고 단계별로 검증했습니다. 작성 중인 값은 sessionStorage로 복원했습니다. 앱 간 Query key와 조회 함수를 공용화하고 드래그 공통 컴포넌트를 공고 순서, 중첩 필터와 설정 테이블에 적용했습니다.
- Electron 앱은 로그인 → 수집 → 중복 확인 → 업로드를 공통 단계와 사이트별 adapter로 나누는 초기 구조를 설계하고 잡플래닛, 게임잡을 연동했습니다. NestJS는 main 프로세스에 무겁다는 CTO 피드백을 받아 제거하고 모듈 구분과 생성자 주입만 참고해 남겼습니다.

[Electron 초기 구조](https://blog.bambyul.com/ko/blog/nestjs의-책임-분리를-참고해-electron-수집-앱을-나눈-기준) | [Query key 공통화](https://blog.bambyul.com/ko/blog/tanstack-query-v4의-query-key를-query-key-factory로-정리한-이유)

## 개인 프로젝트 | 2026.10 – 현재

피식과 Game Mate의 요구사항 정의부터 화면 설계, API와 DB, 테스트 기준과 배포 구성까지 맡습니다. 구현과 테스트 작성은 코딩 에이전트에 맡기고 기술 선택과 완성된 결과를 검토합니다. 두 서비스 모두 공개 전입니다.

피식은 사진 대회에서 상시 그룹으로 방향을 바꾸고 기존 사진과 링크를 보존했습니다. GraphQL과 Apollo Client를 사용하며 문서 계약과 캐시 갱신을 테스트합니다. Game Mate는 친추 판매와 코칭 모집 글에서 가격과 조건을 확인한 뒤 1:1 채팅으로 문의하는 서비스입니다. REST와 TanStack Query, NestJS, Prisma, PostgreSQL을 사용하고 S3 직접 업로드와 공개 캐시 갱신을 연결했습니다.

[소스 코드](https://github.com/jingeon27/side-project) | [제품 판단과 구현 상세](https://github.com/jingeon27/resume/blob/main/resumes/doers/portfolio-doers-ai-experience.md#개인-프로젝트에서-직접-정한-제품-방향)

## 기술

- Frontend: JavaScript, TypeScript, React, Next.js, Electron
- State & Form: TanStack Query, React Hook Form, Zustand, Zod, Ant Design Form
- UI: Radix UI, shadcn/ui, Base UI, Tailwind CSS, overlay-kit
- Testing: Vitest, React Testing Library, MSW, Playwright
- Monitoring & Logging: Sentry, AWS CloudWatch
- Analytics: Amplitude
- Tooling: pnpm, Turborepo, ESLint, Knip, GitHub Actions
- AI: Claude Code, Codex
- API & Data(개인 프로젝트): GraphQL, Apollo Client, NestJS, Prisma, PostgreSQL

## 학력

대덕소프트웨어마이스터고등학교 소프트웨어개발과 | 2021.03 – 2024.01
