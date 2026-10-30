# 김진건

Frontend Engineer | jingeon27@gmail.com | [GitHub](https://github.com/jingeon27) | [기술 블로그](https://blog.bambyul.com/ko/blog)

산업기능요원 현역 복무 중 | 2025.08 편입 | 전직 희망

## 소개

테스트와 검증을 강점으로 삼는 프론트엔드 엔지니어입니다. 예약금 결제와 쿠폰, 정산 화면을 개발하며 실제 폼의 제출값과 API 실패 뒤 동작을 확인해 왔습니다. 결제 복귀 시 입력 복원과 부분 저장 후 재시도를 다루며, 실패한 작업을 다시 처리할 때 입력이 유지되고 중복 등록이 생기지 않는지 검증합니다.

현재 개발과 QA, 병원 관리자와 백오피스의 화면 디자인을 맡고 있습니다. AI가 구현한 제품 코드와 테스트를 읽고, 테스트가 실제 앱과 같은 조건을 확인하는지도 검토합니다.

[상세 포트폴리오와 경력기술서](https://github.com/jingeon27/resume/blob/main/portfolio.md) | [AI 활용 경험](https://github.com/jingeon27/resume/blob/main/resumes/doers/portfolio-doers-ai-experience.md)

## 지원동기

왓타임의 B2B 채용 SaaS RoundHR에서 채용 설정과 평가, 온보딩을 개발했고, 세이프닥에서는 병원과 운영팀이 쓰는 화면을 맡았습니다. B2B 제품에서는 고객의 업무 흐름과 규칙을 이해하고, 필요한 정보를 바로 찾고 반복 입력이나 처리 상태의 혼동 없이 일을 마칠 수 있게 만드는 것이 중요하다고 생각합니다.

의료복지와 금융은 금액과 처리 상태를 잘못 다루면 고객의 업무에 직접 문제가 생길 수 있어 사용성과 안정성을 함께 챙겨야 한다고 생각합니다. 세이프닥에서 결제 실패 뒤 입력 복원과 부분 저장 후 재시도를 처리하고 실제 제출값과 실패 경로를 테스트했습니다. 이 경험으로 고위드에서도 기업 고객의 금융 업무와 예외 조건을 이해하고, 테스트와 운영 오류 추적으로 안심하고 쓸 수 있는 화면을 만들고 싶습니다.

## 경력

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

세이프닥은 제휴 병원의 비급여 프로그램을 예약하는 B2B2C 서비스입니다. [복지몰](https://safedoc.io/) MVP 출시 초기에 합류해 가입 회원 약 15만 명, 주간 활성 사용자 약 1만 명의 복지몰과 병원 관리자, 백오피스를 개발합니다. 2026년 1월부터 사내 유일한 프론트엔드 개발자이며, 4월부터 전사 프론트엔드를 단독으로 담당합니다. 7월부터 글로벌 사용자 서비스와 CMS도 맡았습니다.

#### 건강검진 예약과 결제 | 2026.09 – 현재

검사 구성과 기업지원 코드, 예약금이 비급여 프로그램과 달라 기존 서비스로 관리하기 어려웠습니다. 제휴 병원의 요청으로 시작해 개발팀장, 부팀장과 빠진 동작과 예외를 확인하며 세 제품의 프론트엔드를 맡았습니다. 9월 9일 개발을 시작해 23일 운영에 배포하고 30일 정식 오픈했습니다.

복지몰의 검사 선택과 기업 검진 코드, 토스페이먼츠 예약금 결제, 병원 관리자의 예약 관리와 결제취소 요청 접수, 백오피스의 검진 구성과 결제취소, 환불 승인을 개발했습니다.

- 모바일 결제창을 다녀오면 페이지가 새로 열려 입력이 사라졌습니다. 입력값과 `orderId`를 sessionStorage에 저장하고, 같은 주문이며 현재 Zod 스키마를 통과한 값만 한 번 복원했습니다. 입력 복원과 승인 요청 실패 뒤 예약 목록 이동은 dev API 서버 E2E로 확인했습니다.
- 검사항목 일괄 저장이 일부만 성공하면 서버 목록을 다시 받아 발급된 ID를 폼에 반영했습니다. 재시도할 때 이미 저장한 항목이 중복 등록되지 않도록 했습니다.

[건강검진 개발 과정](https://blog.bambyul.com/ko/blog/기존-프로그램-구조에-건강검진을-들이며-화면을-나눈-기준)

#### 테스트와 AI 개발 workflow | 2026.04 – 현재

2026년 7월부터 테스트를 도입해 실제 폼 입력과 제출값, API 실패 뒤 화면 동작을 검증합니다. 4월부터는 에이전트로 구현하며, 완성된 제품 코드와 테스트를 읽고 화면을 띄워 동작을 확인합니다. 반복해서 어긋나는 판단은 skills에 남기고, 의존 방향과 공개 API처럼 자동 검사할 수 있는 항목은 lint rule로 만듭니다.

티켓과 plan 검토 → 테스트 작성 → 에이전트 구현과 에이전트 코드 리뷰 → 변경분 테스트, lint, typecheck → 직접 diff 리뷰와 화면 동작 확인 → 전체 CI(테스트, knip, lint) → QA 더블 체크 요청

- 새 기능은 BDD 형식의 `*.spec`에 컴포넌트별 기대 동작을 적고 누락을 검토합니다. 운영이나 QA 오류는 `*.test`에 재현하며, 새 테스트 패턴은 제품 코드를 일부러 깨뜨려 실패하는지 확인합니다.
- 실제 폼을 입력하고 제출해 요청값을 검증합니다. 기대 payload는 제품의 변환 함수를 재사용하지 않고 따로 적습니다. API 연동은 dev API 서버를 우선하고 어려운 조건은 MSW로 재현합니다.
- 테스트용 QueryClient를 앱과 맞춰 첫 조회 실패와 기존 데이터의 재조회 실패를 나눠 확인합니다. 병원 관리자 등록부터 백오피스 검수와 승인까지는 두 앱을 연결한 E2E로 검증합니다. 자체 lint rule은 RuleTester와 fixture, mock으로 확인합니다.

[테스트 도입 기준](https://blog.bambyul.com/ko/blog/테스트-코드를-도입하면서-세운-기준) | [AI 개발 workflow](https://blog.bambyul.com/ko/blog/ai가-코드를-잘-짜기-시작했는데-제가-덜-바빠지지는-않았어요)

#### 정산과 쿠폰 결제, 기업 관리 | 2025.06 – 현재

정산 기능의 최초 구현을 인수한 뒤 프론트엔드를 리팩터링하고 배포 전 운영 요구사항과 이후 오류를 반영했습니다. 1,170줄과 1,164줄인 화면에서 조회와 표, 편집, 정산 처리를 나누고 함께 바뀌는 코드를 모았습니다. ref로 열던 모달은 대상 데이터와 열림 상태를 props로 받게 했습니다.

- 프로그램 가격이 바뀌어도 정산이 맞는지 논의하며 기준 금액부터 확인했습니다. 정산은 견적 금액을 쓰고 프로그램 가격은 참고만 하므로 별도 가격 이력 구조는 만들지 않았습니다.
- 쿠폰 결제의 입력과 완료, 취소 조건을 도메인 함수와 ts-pattern으로 모았습니다. 결제 예정 금액이 바뀌면 적용한 쿠폰을 해제하도록 했습니다.
- 기업과 대학의 연락 상태, 활동 이력, 다음 일정과 담당자별 목록을 개발했습니다. 제휴 해지의 쿠폰 회수 판정은 현재 대상의 조회가 끝난 뒤에만 하도록 고쳐, 이전 기업의 데이터나 조회 전 상태로 저장하는 경우를 막았습니다.

[쿠폰 결제 처리](https://blog.bambyul.com/ko/blog/결제-내역에-쿠폰-결제를-추가하며-분기를-한곳으로-모은-과정)

#### 공통 폼과 데이터 조회 | 2025.05 – 현재

서버의 `ensureQuery` 결과를 render props로 받던 화면은 Query 캐시를 구독하지 않아 무효화해도 갱신되지 않았습니다. 2025년 5월 예약 화면부터 prefetch와 hydration으로 바꿔, 서버가 준비한 데이터를 클라이언트도 같은 캐시에서 읽고 갱신하게 했습니다.

- 예약 화면의 가족과 날짜 값이 Query, Zustand, 로컬 상태에 흩어져 선택한 일시가 어긋났습니다. 서버 목록은 Query, 작성 중인 값은 React Hook Form, 제출 조건은 Zod로 나눴습니다.
- 공통 검색 필터의 예외 분기를 화면별 조합으로 바꿔 27개 화면에 적용했습니다. JSX 중복은 일부 감수하고 URL과 폼, API 요청은 같은 Zod 스키마를 따르도록 했습니다.
- Ant Design Form에는 재귀 조건부 타입과 `infer`를 쓴 `createTypedForm<T>`를 만들어 중첩 필드명과 값의 타입을 검사했습니다. 라이브러리 연결에 필요한 단언은 래퍼 안에 뒀습니다.
- 공통 UI는 접근성 primitive와 조합 유연성을 보고 Headless UI에서 Radix UI로 옮겼습니다. Bottom Sheet는 Compound Components와 overlay-kit으로 구성해 본문과 하단 버튼이 같은 폼을 쓰게 했습니다.

[폼 타입 설계](https://blog.bambyul.com/ko/blog/두-관리자-앱의-프로그램-폼을-만드는-과정) | [공통 UI와 추상화](https://blog.bambyul.com/ko/blog/선언적으로-코드를-쓰는-기준)

#### 운영 오류 추적과 복구 | 2026.08 – 현재

복지몰의 브라우저, 서버, Edge에 Sentry를 도입했습니다. 오류별 level과 중복 수집을 정리하고 release와 브라우저 소스맵을 연결했습니다. SDK와 전송 payload를 확인해 의료 정보와 인증 정보가 담긴 값은 제거했습니다.

- Bottom Sheet 크래시를 라이브러리의 null ref 접근까지 추적해 버전업으로 해결했습니다. 달라진 snap point는 공통 Root에서 변환했습니다. 누적 75건, 57명 이상에게 발생한 오류 그룹은 9월 10일 배포 뒤 28일까지 18일간 추가 발생 0건이었습니다.
- 회원 조회가 타임아웃이나 서버 오류로 실패해도 로그아웃되던 동작은 401일 때만 끊도록 나눴습니다. 일시적인 실패는 다시 시도할 수 있게 했습니다.
- 동의서의 외부 문서 조회가 실패해도 고객명과 동의 내역은 남도록 오류 경계를 나누고 실패 응답으로 테스트했습니다. 관리자 서비스의 API 오류와 Zod 응답 불일치는 CloudWatch로 트래킹합니다.

[Sentry 도입](https://blog.bambyul.com/ko/blog/sentry로-에러-수집부터-web-vitalsmcp릴리스까지-연결한-과정) | [크래시 분석](https://blog.bambyul.com/ko/blog/sentry가-잡아-준-bottom-sheet-드래그-크래시-원인-경로가-사라진-버전으로-올리기까지)

#### 글로벌 서비스와 개발 환경

- 기존 제품을 운영하면서 PO의 프로토타입을 사용자 서비스와 CMS로 옮겨 3주 만에 PoC로 배포했습니다. 영어, 한국어, 아랍어와 RTL을 지원하고 인증 전후 입력 유지와 실패 안내를 보완했습니다.
- Turbopack과 Next.js 16의 개발 속도 개선을 보고 Next.js 14→16, React 18→19로 전환했습니다. 별도로 TypeScript 7 네이티브 체커를 병행해 타입 검사 시간을 12.5초에서 1.9초로 줄였습니다. 타입 정보를 쓰는 lint는 검사 시간이 3.3배 늘어 도입을 보류했습니다.

### 왓타임 | Frontend Engineer | 2024.01 – 2024.11

채용 SaaS RoundHR이 시장성을 확인하며 기능을 늘리던 시기에 합류했습니다. 채용 관리와 채용 담당자용 웹, 랜딩과 라운지, Electron 지원자 데이터 수집 앱을 개발했습니다. 개발자, 디자이너와 pnpm, Turborepo 모노레포에서 협업했습니다.

- 채용 페이지와 지원서 설정, 메일과 면접 알림 템플릿, 채용 단계 자동화, 평가와 온보딩을 개발하고 Notion, Strapi 콘텐츠를 연결했습니다.
- 면접 템플릿의 네 단계 입력을 `useFunnel`로 만들고 단계별로 검증했습니다. 작성 중인 값은 sessionStorage로 복원했습니다. 앱 간 Query key와 조회 함수를 공용화하고 드래그 공통 컴포넌트를 공고 순서, 중첩 필터와 설정 테이블에 적용했습니다.
- Electron 앱은 로그인 → 수집 → 중복 확인 → 업로드를 공통 단계와 사이트별 adapter로 나누는 초기 구조를 설계하고 잡플래닛, 게임잡을 연동했습니다. NestJS는 main 프로세스에 무겁다는 CTO 피드백을 받아 제거하고 모듈 구분과 생성자 주입만 참고해 남겼습니다.

[Electron 초기 구조](https://blog.bambyul.com/ko/blog/nestjs의-책임-분리를-참고해-electron-수집-앱을-나눈-기준) | [Query key 공통화](https://blog.bambyul.com/ko/blog/tanstack-query-v4의-query-key를-query-key-factory로-정리한-이유)

## 개인 프로젝트 | 2026.10 – 현재

별사대와 Game Mate의 요구사항 정의부터 화면 설계, API와 DB, 테스트 기준과 배포 구성까지 맡습니다. 구현과 테스트 작성은 코딩 에이전트에 맡기고 기술 선택과 완성된 결과를 검토합니다. 두 서비스 모두 공개 전입니다.

별사대는 사진 대회에서 상시 그룹으로 방향을 바꾸고 기존 사진과 링크를 보존했습니다. GraphQL과 Apollo Client를 사용하며 문서 계약과 캐시 갱신을 테스트합니다. Game Mate는 친추 판매와 코칭 모집 글에서 가격과 조건을 확인한 뒤 1:1 채팅으로 문의하는 서비스입니다. REST와 TanStack Query, NestJS, Prisma, PostgreSQL을 사용하고 S3 직접 업로드와 공개 캐시 갱신을 연결했습니다.

API 요청 뒤 실제 PostgreSQL의 저장 결과를 확인하고, 트랜잭션 롤백과 캐시 갱신 재시도, 늦은 응답이 새 변경 기록을 지우는 경합을 통합 테스트로 검증했습니다.

[소스 코드](https://github.com/jingeon27/side-project) | [DB 롤백과 캐시 경합 테스트](https://github.com/jingeon27/side-project/blob/eaf692c52479da09a643c9d13f54be92a1444cd8/projects/game-feedback/apps/api/src/cache-invalidation/cache-invalidation.integration.spec.ts#L217) | [제품 판단과 구현 상세](https://github.com/jingeon27/resume/blob/main/resumes/doers/portfolio-doers-ai-experience.md#개인-프로젝트에서-직접-정한-제품-방향)

## 기술

- Frontend: JavaScript, TypeScript, React, Next.js, Electron
- State & Form: TanStack Query, React Hook Form, Zustand, Zod, Ant Design Form
- UI: Radix UI, shadcn/ui, Base UI, Tailwind CSS, overlay-kit
- Testing: Vitest, React Testing Library, MSW, Playwright
- Monitoring & Logging: Sentry, AWS CloudWatch
- Analytics: Amplitude
- Tooling: pnpm, Turborepo, ESLint, Knip, GitHub Actions
- AI: Claude Code, Codex

## 학력

대덕소프트웨어마이스터고등학교 소프트웨어개발과 | 2021.03 – 2024.01
