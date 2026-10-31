# 김진건

AI Product Engineer 지원 | jingeon27@gmail.com | [GitHub](https://github.com/jingeon27) | [기술 블로그](https://blog.bambyul.com/ko/blog)

산업기능요원 현역 복무 중 | 2025.08 편입 | 전직 희망

## 소개

AI를 활용해 생산성을 높이고, 제품에 필요한 기획과 디자인, 프론트엔드와 서버 개발을 함께 다룹니다. **두 서비스와 개인 기술 블로그를 혼자 2주 만에 구현했습니다.** 사용자의 입장에서 기능 범위와 화면을 정하고 API 계약과 DB 모델, 실패 처리와 테스트 기준, 배포 구성을 설계합니다. 구현과 테스트 작성은 코딩 에이전트에 맡기고, 완성된 코드와 테스트를 읽고 화면을 띄워 동작을 확인합니다.

실무에서는 세이프닥의 전사 프론트엔드와 QA, 병원 관리자와 백오피스의 화면 설계를 맡습니다. 건강검진은 세 제품의 프론트엔드를 맡아 정식 오픈했고, **기존 제품 운영과 병행해 글로벌 사용자 서비스와 CMS를 3주 만에 PoC로 배포했습니다.** 요구사항의 빠진 동작과 API 계약을 담당자와 맞추고 공통 구조 설계와 운영 오류 대응도 맡습니다.

[AI 활용 경험과 실제 화면](https://github.com/jingeon27/resume/blob/main/resumes/doers/portfolio-doers-ai-experience.md) | [상세 포트폴리오와 경력기술서](https://github.com/jingeon27/resume/blob/main/portfolio.md) | [개인 프로젝트 코드](https://github.com/jingeon27/side-project)

## 경력

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

가입 회원 약 15만 명, 주간 활성 사용자 약 1만 명의 [복지몰](https://safedoc.io/)과 병원 관리자, 백오피스를 개발합니다. 2026년 1월부터 사내 유일한 프론트엔드로, 4월부터 전사 프론트엔드를 단독으로 담당합니다. 요구사항의 빠진 동작은 기획과 운영 담당자와 논의하고 API 계약은 백엔드 개발자와 맞춥니다.

#### 건강검진 서비스 내재화 | 2026.09 – 현재

아임웹에서 정보를 보고 전화로 문의하던 건강검진은 검사 구성과 예약금 처리가 달라 기존 비급여 예약 구조로 관리하기 어려웠습니다. 제휴 병원의 요청을 개발팀장, 부팀장과 확인하고 백엔드 개발자와 API와 예외 처리를 맞췄습니다. **세 제품의 프론트엔드 개발과 연동 검증을 전담해 9월 9일 개발 시작, 23일 운영 배포, 30일 정식 오픈했습니다.**

복지몰의 검사 선택과 기업지원 코드, 토스페이먼츠 예약금 결제, 병원 관리자의 예약 관리와 결제취소 요청 접수, 백오피스의 검진 구성과 환불 승인을 개발했습니다.

- 모바일 결제창을 다녀오면 입력이 사라졌습니다. 한 번의 결제 왕복에 필요한 값이어서 복원 범위를 해당 탭과 주문으로 좁히고 `orderId`와 함께 sessionStorage에 저장했습니다. 같은 주문이며 Zod 검증을 통과한 값만 한 번 복원합니다. 결제 실패 후 입력 복원과 승인 요청 실패 시 예약 목록 이동은 dev API 서버 E2E로 확인했습니다.
- 선택 수를 채우면 다음 그룹을 자동으로 열자는 요청에, 기존 선택을 고칠 때도 화면이 넘어간다는 문제를 짚었습니다. 담당자와 논의해 미선택 chip만 비활성화하고 빠져 있던 디자인도 요청해 반영했습니다.
- 일괄 저장이 일부만 성공하면 서버가 발급한 ID를 다시 조회해 폼에 반영하고 재시도 때 중복 등록을 막았습니다.

[건강검진 개발 과정](https://blog.bambyul.com/ko/blog/기존-프로그램-구조에-건강검진을-들이며-화면을-나눈-기준)

#### 글로벌 사용자 서비스와 CMS | 2026.07 – 09

PO가 전달한 프로토타입을 바탕으로 **두 제품의 전체 화면과 프론트엔드 구조, 빠진 상태와 인터랙션 구현을 맡아 3주 만에 PoC로 배포했습니다.** Next.js와 shadcn/ui, Base UI로 구현하고 영어, 한국어, 아랍어와 RTL을 지원합니다. 시안에 없는 인증 전후 입력 유지와 실패 안내, 완료 후 이동도 검증 범위에 넣었습니다.

클라이언트에 목 백엔드가 포함되는 의존을 분리해 번들을 2,564KB에서 1,880KB로 줄였습니다. 로컬에서 빌드한 백엔드를 연결해 CMS 링크 발급 → 사용자 업로드 → CMS 다운로드를 하나의 E2E로 확인했습니다.

[프로토타입을 서비스로 옮긴 과정](https://blog.bambyul.com/ko/blog/프로토타입을-실사용-서비스로-옮기며-작업-규칙을-먼저-만든-이유)

#### AI 개발 workflow와 검증 기준 | 2026.04 – 현재

에이전트 구현에서 파일 배치와 공통 코드 사용이 반복해서 어긋나, 검토 기준을 다음 구현에도 적용하도록 skills와 lint rule로 남겼습니다. 맥락이 필요한 사용법은 skills에, 정적으로 검사할 수 있는 import 방향과 공개 API, queryKey는 lint rule에 반영했습니다. **작업 기준과 검증 범위, 제출된 구현과 테스트의 리뷰를 맡습니다.** 7월부터 테스트를 도입했고 완성본의 부족한 부분은 반려해 다시 확인합니다.

티켓과 plan 검토 → 테스트 작성 → 에이전트 구현과 에이전트 코드 리뷰 → 변경분 테스트, lint, typecheck → 직접 diff 리뷰와 화면 동작 확인 → 전체 CI(테스트, knip, lint) → QA 더블 체크 요청

- 새 기능은 BDD 형식의 `*.spec`에 컴포넌트별 기대 동작을 적고 누락을 검토합니다. 운영이나 QA 오류는 `*.test`에 재현하며, 새 테스트 패턴은 제품 코드를 일부러 깨뜨려 실패하는지 확인합니다. API 연동은 dev API 서버를 우선하고 어려운 조건은 MSW로 재현합니다.
- 테스트용 QueryClient가 앱과 달라 실제로는 오류 경계에 가려질 화면을 검증하고 있었습니다. 통과 여부와 함께 테스트의 전제도 확인해 설정을 맞추고 첫 조회 실패와 기존 데이터의 재조회 실패를 나눴습니다. diff에서 놓친 Bottom Sheet의 헤더 스크롤은 고친 뒤 브라우저 레이아웃 회귀 테스트로 남겼습니다.
- 자체 규칙은 RuleTester와 fixture, mock으로 검사하고 미사용 코드는 Knip으로 찾습니다.

[AI 개발 workflow](https://blog.bambyul.com/ko/blog/ai가-코드를-잘-짜기-시작했는데-제가-덜-바빠지지는-않았어요) | [테스트 도입 기준](https://blog.bambyul.com/ko/blog/테스트-코드를-도입하면서-세운-기준)

#### 상태 설계와 운영 오류 대응 | 2025.05 – 현재

- 서버 조회 결과를 render props로만 읽는 화면은 Query 캐시를 무효화해도 갱신되지 않았습니다. 데이터를 읽는 경계를 바꿔야 한다고 판단해 2025년 5월부터 prefetch와 hydration 전환을 설계하고 화면별로 적용했습니다. 예약 폼은 서버 목록을 Query, 입력을 React Hook Form, 제출 조건을 Zod로 나눴습니다.
- 인증 화면에서 돌아올 때 멈추는 오류를 Next.js 소스까지 추적했습니다. `redirect()`가 AppRouter 렌더를 중단해 훅 개수가 달라지는 경로를 찾아 진입 판정을 proxy로 옮겼습니다.
- 공통 필터의 화면별 예외가 늘어, 달라지는 화면 배치와 같아야 하는 데이터 계약을 나눴습니다. URL과 폼, API 요청은 같은 Zod 스키마를 따르고 각 화면은 필터를 조합하도록 설계해 27개 화면에 적용했습니다. JSX 중복은 일부 감수하고 Ant Design Form의 중첩 필드명과 값은 `createTypedForm<T>`의 재귀 조건부 타입으로 검사합니다.
- 운영 오류의 원인과 영향받은 사용자를 찾으려고 복지몰의 브라우저, 서버, Edge에 Sentry를 도입하고 수집 정책과 오류 대응을 맡았습니다. 민감정보를 제거하고 Bottom Sheet 크래시는 라이브러리 소스까지 추적해 고쳤습니다. 배포 전 누적 75건, 57명 이상에게 발생한 오류 그룹은 **9월 10일 배포 뒤 28일까지 18일간 추가 발생 0건**이었습니다. 기능별 오류 경계는 백오피스 라우트 30개에 적용하고 API 오류와 응답 스키마 불일치는 CloudWatch로 트래킹합니다.

[설계와 운영 대응 상세](https://github.com/jingeon27/resume/blob/main/portfolio.md#세이프닥)

#### 사용자 행동 측정과 실험 참여 | 2025.07 – 현재

Amplitude 기반 A/B 테스트 환경을 구축하고 담당자가 주도한 제품 실험의 화면과 사용자 행동 측정을 맡았습니다. 이벤트 140개 이상을 새로 붙이거나 고쳤습니다. UTM 누락에 저장 코드를 추가한 뒤 측정 설정을 다시 확인해, 속성 설정으로 해결할 수 있음을 PO에게 공유했습니다. 별도의 저장 상태를 관리할 필요가 없어진 코드는 운영 배포 전에 되돌렸습니다.

### 왓타임 | Frontend Engineer | 2024.01 – 2024.11

채용 SaaS RoundHR의 채용 관리와 채용 담당자용 웹, 랜딩과 라운지를 개발했습니다. 외부 채용 사이트의 지원자 데이터를 가져오는 Electron 앱도 맡았습니다. 개발자, 디자이너와 pnpm, Turborepo 모노레포에서 협업했습니다.

- 채용 설정, 알림 템플릿, 채용 단계 자동화, 평가와 온보딩을 개발하고 Notion, Strapi 콘텐츠를 연결했습니다.
- 면접 템플릿은 긴 입력 중 이탈해도 이어 쓸 수 있도록 네 단계로 나눠 검증하고 작성 내용을 복원했습니다. 앱 간 Query key와 조회 함수를 공통화해 갱신 대상을 맞추고 공통 드래그 컴포넌트를 공고 순서와 중첩 필터, 설정 테이블에 적용했습니다.
- Electron 앱은 사이트별 차이를 공통 수집 순서와 분리하는 초기 구조 설계를 맡고 잡플래닛, 게임잡을 연동했습니다. NestJS는 main 프로세스에 무겁다는 CTO 피드백으로 제거하되 모듈 경계와 생성자 주입을 참고한 구조는 유지했습니다.

## 개인 프로젝트 | 2026.10 – 현재

사진 커뮤니티 별사대와 Game Mate, 개인 기술 블로그의 **요구사항 정의와 화면 설계, 기술 선택, API 계약과 DB 모델, 테스트 기준과 배포 구성을 맡습니다.** 구현과 테스트 작성은 에이전트에 맡기고 제출된 코드와 화면, 검증 결과를 검토합니다. 블로그는 공개했으며 두 서비스는 공개 전으로 초기 사용자 검증을 준비하고 있습니다.

### 제품 범위와 화면 설계

- **별사대:** 직접 써 보며 대회가 없을 때도 사진을 모을 공간이 필요하다고 판단했습니다. 상시 그룹과 홈 피드, 공개 탐색으로 제품 범위를 바꾸고 기존 사진과 링크를 보존했습니다. 사진을 가리는 순위 표시와 기능 없는 스토리 테두리는 뺐습니다.
- **Game Mate:** 친추 판매와 코칭 글의 가격과 조건 확인 → 1:1 채팅 문의를 첫 구현의 완료 지점으로 정했습니다. 주문과 취소, 환불까지 필요한 결제와 정산은 범위에 넣지 않고 가입과 프로필 수정 흐름을 나눴습니다.
- 입력창과 Dialog는 공통 디자인 시스템으로 모으고 데이터 조회와 완료 후 이동은 앱에 남겼습니다. 공통 UI 수정 뒤 두 앱을 확인하는 비용을 감수했습니다. 반응형 Bottom Sheet의 입력과 포커스 유지, Storybook과 접근성 검사, 색 대비 테스트도 검토합니다.

[실제 제품 화면](https://github.com/jingeon27/resume/blob/main/resumes/doers/assets/ai-experience/01-service-screens.png) | [공통 디자인 시스템](https://github.com/jingeon27/side-project/tree/eaf692c52479da09a643c9d13f54be92a1444cd8/packages/design-system)

### API와 실패 처리

API 계약과 DB 모델을 정하고 NestJS, Prisma와 PostgreSQL로 구현하도록 했습니다. 별사대는 schema-first GraphQL과 Apollo Client, Game Mate는 OpenAPI 기반 Orval SDK와 TanStack Query를 사용합니다. 생성 타입만으로 화면 캐시까지 보장할 수 없어 GraphQL 문서의 서버 스키마 대조와 실제 Apollo 캐시 검증을 나눴습니다.

- Game Mate에서 글이 저장됐는데 캐시 만료만 실패한 상황을 저장 실패로 알리면 중복 작성을 유발할 수 있어 **저장 결과와 캐시 복구를 분리했습니다.** 데이터와 만료 태그를 같은 DB 트랜잭션에 저장하고 커밋 뒤 만료 호출이 실패해도 저장 성공으로 응답합니다. 공개 화면의 갱신이 늦어질 수 있는 비용을 받아들이고, 재시작 뒤 재처리와 늦은 호출이 새 revision을 지우지 않는 조건을 통합 테스트에 넣었습니다.
- 파일은 S3로 직접 보내 API가 전체 파일을 메모리에 올리지 않게 했습니다. Game Mate는 크기와 형식, 내용 일부를 검사한 뒤 같은 ETag일 때만 최종 객체로 복사해 검사 뒤 바뀐 파일이 확정되는 것을 막았습니다. 별사대는 원본 보관과 HEAD 확인을 사용했습니다.

[캐시 실패 처리 코드](https://github.com/jingeon27/side-project/blob/eaf692c52479da09a643c9d13f54be92a1444cd8/projects/game-feedback/apps/api/src/cache-invalidation/cache-invalidation.service.ts) | [API와 업로드 설계](https://github.com/jingeon27/resume/blob/main/resumes/doers/portfolio-doers-ai-experience.md#글-저장과-캐시-갱신의-실패를-나눴습니다)

### 테스트와 모니터링, 배포 구성

- UI는 폼 입력과 제출값, Apollo 캐시는 페이지네이션과 낙관적 갱신, API는 Supertest 요청 뒤 실제 PostgreSQL 저장 결과를 확인합니다. 웹과 Expo WebView의 연결도 테스트하며 OS와 외부 OAuth는 fixture로 대체합니다.
- Sentry와 Amplitude에 확인용 이벤트를 보내고 MCP로 실제 저장된 데이터를 조회해 중복 페이지뷰와 URL에 남는 검색어를 찾아 고쳤습니다.
- 처음 검토한 EC2와 RDS 구성에서 초기 비용을 줄이려고 PostgreSQL도 같은 EC2에 두도록 바꿨습니다. 두 서비스와 DB가 함께 중단될 수 있고 복구를 직접 맡아야 해, DB 데이터는 별도 EBS에 두고 S3 백업을 준비했습니다. 백업 업로드 실패 시 migration 중단, readiness 실패 시 이전 이미지 복귀를 구성했습니다. Terraform은 mock provider로 테스트하며 실제 EC2 구성 적용과 DB 백업 복구, 운영 부하는 아직 검증하지 않았습니다.

[검증 범위와 결과](https://github.com/jingeon27/resume/blob/main/resumes/doers/portfolio-doers-ai-experience.md#테스트마다-확인할-결과를-나눴습니다) | [배포 구성](https://github.com/jingeon27/side-project/blob/eaf692c52479da09a643c9d13f54be92a1444cd8/deploy/shared-instance/README.md)

### 개인 기술 블로그

한국어와 영어 MDX를 정적 페이지로 만들고 검색과 SEO, RSS를 연결했습니다. 제목이 바뀌어도 고정 주소를 유지하며 이전 주소의 301 대상과 번역 연결, 키보드 검색과 모바일 탐색을 검사합니다.

[블로그 구현과 검증 기록](https://github.com/jingeon27/side-project/blob/eaf692c52479da09a643c9d13f54be92a1444cd8/projects/blog/docs/implementation.md)

## 지원동기

AI를 활용하면서 혼자 만들고 검토할 수 있는 제품의 범위가 넓어졌습니다. 두어스에서는 PO와 사용자가 겪는 불편을 정리하고 무엇을 먼저 만들지 정하는 일부터 함께하고 싶습니다. 제품에 필요한 역할을 넓게 맡아 화면 설계와 프론트엔드, API 구현을 오가며 사용자에게 결과물을 빠르게 내놓고 싶습니다.

AI로 구현이 빨라질수록 무엇을 만들고 무엇을 검증할지 판단하는 일이 중요하다고 생각합니다. 사용자 반응과 데이터에서 개선의 단서를 읽는 통찰과 우선순위를 정하는 판단력을 기르고 싶습니다. 빠르게 만들고 검증한 결과를 PO와 함께 다음 결정에 반영하며 사용자의 불편을 줄이겠습니다.

## 기술

- Frontend: TypeScript, React, Next.js, Electron
- API & Data: NestJS, GraphQL, REST, Prisma, PostgreSQL, Apollo Client, TanStack Query
- UI & Form: shadcn/ui, Base UI, Ant Design, React Hook Form, Zod, Storybook
- Mobile: Expo, WebView
- Testing: Vitest, Supertest, React Testing Library, MSW, Playwright, axe-core
- Monitoring & Logging: Sentry, AWS CloudWatch
- Analytics: Amplitude
- Infrastructure: AWS EC2, EBS, S3, Terraform
- AI: Claude Code, Codex

서버와 인프라 구성은 개인 프로젝트에서 다룬 경험입니다.

## 학력

대덕소프트웨어마이스터고등학교 소프트웨어개발과 | 2021.03 – 2024.01
