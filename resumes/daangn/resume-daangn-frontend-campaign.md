# 김진건

Frontend Engineer | jingeon27@gmail.com | [GitHub](https://github.com/jingeon27) | [기술 블로그](https://blog.bambyul.com/ko/blog)

산업기능요원 현역 복무 중 | 2025.08 편입 | 전직 희망

## 소개

React와 TypeScript로 사용자 웹과 인앱 WebView, 관리자 서비스를 개발하고 운영합니다. 사용자 경험을 우선하며, 사용자의 입장에서 입력과 화면 이동 중 막히는 지점을 살핍니다. 직접 찾은 리뷰 작성의 불편을 PO에게 공유해 개선안을 구현하고, 결제 뒤 입력이 사라지는 문제를 고쳤습니다.

현재 사내 유일한 프론트엔드로 개발과 QA, 병원 관리자와 백오피스의 화면 디자인을 맡습니다. AI가 완성한 코드와 테스트를 읽고 화면을 띄워 동작을 확인하며, 반복되는 판단은 skills와 lint rule에 남깁니다.

[상세 포트폴리오와 경력기술서](https://github.com/jingeon27/resume/blob/main/portfolio.md) | [AI 개발 workflow와 개인 프로젝트](https://github.com/jingeon27/resume/blob/main/resumes/doers/portfolio-doers-ai-experience.md)

## 지원동기

작은 팀에서 사용자 웹과 관리자 서비스를 함께 만들어 왔습니다. 더 많은 사용자가 쓰는 제품을 여러 팀이 함께 만드는 경험을 쌓고 싶습니다. 홈피드와 커뮤니티, 채팅과 알림이 이어지는 당근에서 인증과 화면 이동, 입력 복원을 다뤄 온 경험을 살리고 싶습니다.

사용자가 다음 행동을 마치도록 흐름을 다듬고, 프론트엔드 동료들과 코드와 설계를 검토하며 AI 개발 workflow도 함께 개선하겠습니다. 지금까지 제품 실험에는 구현과 사용자 행동 측정으로 참여했습니다. 당근에서는 PM, 디자이너, 데이터 분석가와 문제를 정의하고 출시 결과를 확인하는 과정부터 함께하고 싶습니다.

## 경력

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

제휴 병원의 비급여 프로그램을 예약하는 B2B2C 서비스입니다. 가입 회원 약 15만 명, 주간 활성 사용자 약 1만 명의 [복지몰](https://safedoc.io/)과 병원 관리자, 백오피스를 개발합니다. MVP 출시 초기에 합류해 2026년 1월부터 사내 유일한 프론트엔드로, 4월부터 전사 프론트엔드를 단독으로 담당합니다. 빠진 동작과 예외는 기획과 운영 담당자와 논의하고 API 계약은 백엔드 개발자와 맞춥니다.

#### 직접 찾은 모바일 불편과 WebView 개선 | 2025.06 – 2026.09

**직접 찾은 리뷰 작성의 불편을 PO에게 공유하고 개선안을 구현했습니다.** 키패드가 시술 목록을 가리고, 하나를 고를 때마다 닫히며, 고른 항목도 잘 보이지 않았습니다. 2025년 6월 Jira로 공유한 뒤 기획과 디자인 담당자가 정한 복수 선택, 체크, chip UI를 구현해 7월 10일 배포했습니다.

- 8월 7일에는 디자인 시스템의 Bottom Sheet를 적용했습니다. 시트에서 고르는 동안에는 폼을 바꾸지 않고, ‘확인’을 누를 때만 선택을 확정하도록 임시 선택과 폼의 값을 나눴습니다.
- `tel:` 상담 버튼은 기존 네이티브 브릿지의 외부 링크 열기에 연결했습니다. 외부 예약 이동에서는 뒤로 가기가 WebView 전체를 닫는 것을 배포 전에 발견해, 외부 사이트는 브릿지로 열고 웹 내부 이동은 웹 라우터로 구분했습니다.

#### 건강검진 서비스 내재화 | 2026.09 – 현재

아임웹에서 정보를 보고 전화로 문의하던 건강검진을 기존 서비스에 넣었습니다. 제휴 병원의 요청으로 시작해 개발팀장, 부팀장과 빠진 동작과 예외를 논의했습니다. **세 제품의 프론트엔드를 맡아 9월 9일 개발을 시작하고 23일 운영 배포, 30일 정식 오픈했습니다.**

복지몰의 검사 선택과 기업지원 코드, 예약금 결제, 병원 관리자의 예약 관리와 결제취소 요청 접수, 백오피스의 검진 구성과 환불 승인을 개발했습니다.

- 모바일 토스페이먼츠 결제창을 다녀오면 입력이 사라져, `orderId`와 함께 sessionStorage에 저장했습니다. 같은 주문이며 현재 Zod 스키마를 통과한 값만 한 번 복원합니다. 결제 실패 후 입력 복원과 승인 요청 실패 뒤 예약 목록 이동은 dev API 서버 E2E로 확인했습니다.
- 정해진 수의 검사를 고르면 다음 그룹을 자동으로 열자는 요청에, 기존 선택을 수정할 때도 화면이 넘어가는 점을 짚었습니다. 담당자와 논의해 선택 수를 채운 그룹의 미선택 chip만 비활성화하고 빠져 있던 디자인도 요청해 반영했습니다.
- 검사항목 일괄 저장이 일부만 성공하면 서버 목록을 다시 받아 발급된 ID를 폼에 반영했습니다. 재시도할 때 이미 만든 항목을 중복 등록하지 않게 했습니다.

[건강검진 개발 과정](https://blog.bambyul.com/ko/blog/기존-프로그램-구조에-건강검진을-들이며-화면을-나눈-기준)

#### SSR과 상태 관리, 화면 이동 | 2025.05 – 현재

render props로 서버 조회 결과를 받던 화면은 Query 캐시를 구독하지 않아 무효화해도 내용이 바뀌지 않았습니다. 2025년 5월 예약 화면부터 prefetch와 hydration으로 바꿔 서버가 초기 데이터를 준비하고 클라이언트는 캐시를 구독하도록 전환했습니다.

- 병원과 시술 상세의 메타데이터와 JSON-LD를 구성했습니다. 스트리밍 메타데이터를 읽지 못하는 봇은 `htmlLimitedBots`로 처리하고, 공개 조회가 인증 쿠키를 읽지 않게 분리해 동적 sitemap을 하루 단위로 재검증합니다.
- 인증 화면에서 돌아갈 때 앱이 멈추는 오류를 Next.js 소스까지 추적했습니다. 서버 컴포넌트의 `redirect()`가 AppRouter 렌더를 중단해 훅 개수가 달라지는 경로를 찾아 진입 판정을 proxy로 옮겼습니다.
- 관리자 검색 오류는 개발 서버에서 재현되지 않아 build 후 start로 목록 7개 중 6개에서 확인했습니다. 업스트림 수정 PR로 라우터 캐시 원인을 확인하고, 서버가 읽지 않는 조회 조건은 History API로 처리했습니다. 수정 뒤 9월 28일까지 같은 증상은 다시 보고되지 않았습니다.
- 예약 화면의 값이 Query, Zustand, 로컬 상태에 흩어져 선택한 일시가 어긋났습니다. 서버 목록은 Query, 입력은 React Hook Form, 제출 조건은 Zod로 나눠 **예약 대상 선택 컴포넌트를 519줄에서 55줄로 줄였습니다.**

[Next.js 오류 대응](https://blog.bambyul.com/ko/blog/nextjs를-사용하면서-겪었던-이슈들) | [예약 폼의 상태 설계](https://github.com/jingeon27/resume/blob/main/portfolio.md#데이터-조회와-nextjs-오류-대응)

#### AI 개발 workflow와 검증 | 2026.04 – 현재

4월부터 코딩 에이전트로 구현하고 7월부터 테스트를 도입했습니다. 완성된 코드와 테스트를 읽고 화면을 띄워 동작을 확인합니다. 구현이 의도와 어긋나면 기준을 skills나 lint rule에 남깁니다.

티켓과 plan 검토 → 테스트 작성 → 에이전트 구현과 에이전트 코드 리뷰 → 변경분 테스트, lint, typecheck → 직접 diff 리뷰와 화면 동작 확인 → 전체 CI(테스트, knip, lint) → QA 더블 체크 요청

- 테스트용 QueryClient 설정을 앱과 맞춰 첫 조회 실패와 재조회 실패를 나눠 검증했습니다. diff에서 놓친 Bottom Sheet의 헤더 스크롤은 고친 뒤 브라우저 레이아웃 회귀 테스트로 남겼습니다.
- 새 기능은 BDD 형식의 `*.spec`에 컴포넌트별 기대 동작을 적고 누락을 검토합니다. 운영이나 QA 오류는 `*.test`에 재현하며, 새 테스트 패턴은 제품 코드를 일부러 깨뜨려 실패하는지 확인합니다. API 연동은 dev API 서버를 우선하고 어려운 조건은 MSW로 재현합니다.
- import 방향과 공개 API, queryKey는 lint rule로 검사하고 규칙 자체는 RuleTester와 fixture, mock으로 검증합니다. 별도로 TypeScript 7 네이티브 체커를 함께 돌려 복지몰 타입 검사 시간을 12.5초에서 1.9초로 줄였습니다.

#### 글로벌 사용자 서비스와 CMS | 2026.07 – 09

기존 제품을 운영하면서 PO의 프로토타입을 Next.js와 shadcn/ui, Base UI로 구현해 두 서비스를 **3주 만에 PoC로 배포했습니다.** 영어, 한국어, 아랍어와 RTL을 지원하고 인증 전후 입력과 실패 흐름을 보완했습니다. 링크 발급 → 업로드 → 다운로드는 하나의 E2E로 확인했습니다.

#### 공통 컴포넌트와 TypeScript | 2025.06 – 현재

- 화면별 예외가 쌓인 공통 검색 필터를 각 화면이 조합하도록 바꿔 **27개 화면에 적용했습니다.** URL과 폼, API 요청은 같은 Zod 스키마를 따르게 하고 화면 배치를 위해 JSX 중복을 일부 감수했습니다.
- Ant Design Form의 중첩 필드명과 값을 검사하는 `createTypedForm<T>`를 만들었습니다. 재귀 조건부 타입과 `infer`로 유효한 경로와 값을 계산하고 공통 필드 31개와 앱별 확장을 타입 검사로 확인합니다.
- 사용자 상담 채팅을 개선하고 병원 상담 채팅을 새로 만들었습니다. 대화와 입력창, SSE 연결은 공유하고 앱별 API를 주입했습니다. 토큰 갱신과 `last-event-id` 재연결, Query 캐시 갱신을 처리했으며 한글 조합 중 Enter 중복 전송은 `isComposing`과 전송 중 가드로 막았습니다.

[공통 폼과 컴포넌트 설계](https://github.com/jingeon27/resume/blob/main/portfolio.md#공통-폼과-관리자-업무) | [상담 채팅](https://github.com/jingeon27/resume/blob/main/portfolio.md#상담-채팅)

#### 운영 오류 추적과 복구 | 2026.08 – 현재

브라우저, 서버, Edge에 Sentry를 도입해 8월 27일 운영에 배포했습니다. SDK 소스에서 URL과 쿠키, 인증 헤더의 수집 경로를 확인해 민감정보를 제거하고 release와 브라우저 소스맵을 연결했습니다. 관리자 서비스의 API 오류와 응답 스키마 불일치는 CloudWatch로 트래킹합니다.

- Bottom Sheet 크래시를 라이브러리 내부의 null ref 접근까지 추적해 버전업으로 고쳤습니다. 달라진 snap point는 공통 Root에서 변환했습니다. 배포 전 누적 75건, 57명 이상에게 발생한 오류 그룹은 **9월 10일 배포 뒤 28일까지 18일간 추가 발생 0건**이었습니다.
- 일부 조회 실패가 정상 화면까지 지우지 않도록 기능별로 오류 경계를 나누고 백오피스 라우트 30개에 적용했습니다. 동의서 문서 조회가 실패해도 고객명과 동의 내역이 남는지 테스트했습니다.

[Sentry 도입](https://blog.bambyul.com/ko/blog/sentry로-에러-수집부터-web-vitalsmcp릴리스까지-연결한-과정) | [Bottom Sheet 크래시 분석](https://blog.bambyul.com/ko/blog/sentry가-잡아-준-bottom-sheet-드래그-크래시-원인-경로가-사라진-버전으로-올리기까지)

#### 사용자 행동 측정과 실험 참여 | 2025.07 – 현재

Amplitude 기반 A/B 테스트 환경을 구축하고 담당자가 설계한 실험의 화면과 사용자 행동 측정을 맡았습니다. 이벤트 140개 이상을 새로 붙이거나 고쳤습니다. 로그인 전 홈을 둘러보는 실험의 진입과 인증 처리를 개선했고, UTM 누락은 Amplitude 설정으로 해결해 추가한 코드를 운영 배포 전에 되돌렸습니다.

### 왓타임 | Frontend Engineer | 2024.01 – 2024.11

채용 SaaS RoundHR이 시장성을 확인하며 기능을 늘리던 시기에 합류했습니다. 채용 관리와 채용 담당자용 웹, 랜딩과 라운지, Electron 지원자 데이터 수집 앱을 개발했습니다. 개발자, 디자이너와 pnpm, Turborepo 모노레포에서 협업했습니다.

- 채용 페이지와 지원서 설정, 메일과 면접 알림 템플릿, 채용 단계 자동화, 평가와 온보딩을 개발하고 Notion, Strapi 콘텐츠를 연결했습니다.
- 면접 템플릿은 네 단계로 나눠 검증하고 sessionStorage에서 작성 내용을 복원했습니다. 앱 간 Query key와 조회 함수를 공용화하고 공통 드래그 컴포넌트를 공고 순서, 중첩 필터와 설정 테이블에 적용했습니다.
- Electron 앱은 로그인 → 수집 → 중복 확인 → 업로드를 공통 단계와 사이트별 adapter로 나누는 초기 구조를 설계하고 잡플래닛, 게임잡을 연동했습니다. NestJS는 main 프로세스에 무겁다는 CTO 피드백을 받아 제거하고 모듈 구분과 생성자 주입만 참고해 남겼습니다.

## 개인 프로젝트 | 2026.10 – 현재

별사대와 Game Mate, 개인 기술 블로그를 AI를 활용해 혼자 2주 만에 구현했습니다. 요구사항과 화면, API와 DB, 테스트 기준과 배포 구성은 제가 정하고, 구현과 테스트 작성은 코딩 에이전트에 맡깁니다. 별사대와 Game Mate는 공개 전입니다.

- 공통 디자인 시스템의 반응형 Bottom Sheet는 시트와 모달로 전환해도 입력과 포커스를 유지합니다. 열고 닫을 때의 이동과 투명도, 크기 전환을 구현하고, 키보드로 시트 높이를 조절하는 동작과 닫은 뒤 포커스 복귀를 테스트합니다. Storybook과 접근성 검사, 색 대비 테스트로도 확인합니다.
- 별사대는 사진 대회에서 상시 그룹으로 바꾸며 기존 사진과 링크를 보존했습니다. schema-first GraphQL과 Apollo Client를 사용하고 문서 계약, 페이지네이션과 낙관적 갱신을 실제 InMemoryCache로 검증합니다.
- Game Mate는 친추 판매와 코칭 글의 조건과 가격을 보고 1:1 채팅으로 문의하는 서비스입니다. OpenAPI에서 생성한 SDK와 TanStack Query를 사용하고 ID와 권한, 세션의 응답 검증 실패는 요청 실패로 처리합니다.
- 개인 블로그는 한국어와 영어 MDX, 검색과 SEO, RSS를 연결하고 고정 주소와 301 이동을 검사합니다.

[공통 UI 코드](https://github.com/jingeon27/side-project/tree/eaf692c52479da09a643c9d13f54be92a1444cd8/packages/design-system) | [키보드와 포커스 테스트](https://github.com/jingeon27/side-project/blob/eaf692c52479da09a643c9d13f54be92a1444cd8/packages/design-system/src/ui/bottom-sheet/BottomSheet.spec.tsx#L83) | [제품 화면과 구현 상세](https://github.com/jingeon27/resume/blob/main/resumes/doers/portfolio-doers-ai-experience.md)

## 기술

- Frontend: JavaScript, TypeScript, React, Next.js, Electron
- State & Form: TanStack Query, Zustand, React Hook Form, Zod
- UI: shadcn/ui, Base UI, Ant Design, Storybook
- Testing: Vitest, React Testing Library, MSW, Playwright, axe-core
- Monitoring & Analytics: Sentry, CloudWatch, Amplitude
- API & Data(개인 프로젝트): GraphQL, Apollo Client
- Tooling: pnpm, Turborepo, ESLint, Knip
- AI: Claude Code, Codex

## 학력

대덕소프트웨어마이스터고등학교 소프트웨어개발과 | 2021.03 – 2024.01
