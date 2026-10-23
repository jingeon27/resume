# 김진건

Frontend Engineer | jingeon27@gmail.com | [GitHub](https://github.com/jingeon27) | [기술 블로그](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 | 2025.08 편입 | 전직 희망

## 소개

제품 기능을 개발하면서 코드 구조와 개발 기준도 함께 정리해 온 프론트엔드 엔지니어입니다. 여러 제품에서 쓰는 폼과 데이터 조회, 공통 UI를 설계하고, 기능이 늘 때마다 쌓인 예외와 상태 동기화를 줄여 왔습니다. 요구사항의 빈틈과 사용성 문제는 담당자와 논의해 반영합니다.

AI로 구현하는 속도를 높이면서 테스트와 lint rule, skills도 함께 다듬었습니다. 에이전트의 코드와 테스트를 직접 읽고, 화면의 동작과 운영 오류까지 확인합니다.

## 지원동기

엘리스가 복잡한 서비스의 상태와 권한을 일관된 화면으로 풀고, 공통 컴포넌트와 개발 환경을 함께 개선하는 역할을 찾는다는 점에 관심이 갔습니다. 여러 제품의 프론트엔드 구조를 정리하고 테스트, Sentry, AI 개발 workflow를 도입한 경험을 살리고 싶습니다. 동료들과 설계와 코드를 검토하며 교육과 실습, 클라우드 제품에서 다루는 문제로 경험을 넓히고 싶습니다.

## 기술

- Frontend: JavaScript, TypeScript, React 19, Next.js App Router, Electron
- State & Form: TanStack Query, React Hook Form, Zustand, Zod, Ant Design Form
- UI: Radix UI, shadcn/ui, Base UI, Tailwind CSS, overlay-kit
- Testing: Vitest, React Testing Library, MSW, Playwright
- Monitoring & Logging: Sentry, AWS CloudWatch
- Analytics: Amplitude
- Tooling: pnpm, Turborepo, Turbopack, ESLint, Knip, GitHub Actions
- AI: Claude Code, Codex

## 경력

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

제휴 병원의 비급여 프로그램을 예약하는 B2B2C 서비스입니다. 가입 회원 약 15만 명, 주간 활성 사용자 약 1만 명의 [복지몰](https://safedoc.io/), 병원 관리자, 백오피스와 글로벌 사용자 서비스, CMS를 개발합니다. 2026년 1월부터 사내 유일한 프론트엔드 개발자이며, 4월부터 전사 프론트엔드를 단독으로 담당합니다.

#### 공통 폼과 아키텍처 | 2025.06 – 현재

관리자 화면이 늘면서 공통 검색 필터에 화면별 예외가 쌓였습니다. 각 화면이 필요한 필터를 조합하도록 바꾸고, URL과 폼, API 요청을 같은 Zod 스키마로 연결해 27개 화면을 옮겼습니다. 화면마다 JSX가 일부 반복되는 비용은 감수했습니다.

- Ant Design Form은 중첩 필드명과 값의 타입이 이어지지 않아 실행해야 오류가 드러났습니다. 재귀 조건부 타입과 infer로 유효한 경로와 값을 계산하는 `createTypedForm<T>`를 만들어 name, getFieldValue, setFieldValue, useWatch에 적용했습니다. 라이브러리 타입을 보완하는 단언은 래퍼 안에 두었습니다.
- 예약은 가족과 날짜가 Query, Zustand, 로컬 상태에 나뉘어 있어 가족을 추가하면 선택 일시가 어긋났습니다. 서버 목록은 Query, 입력은 React Hook Form, 제출 조건은 Zod가 맡도록 나눴습니다.
- FSD는 재사용할 것 같으면 entities에 두던 기준을 저장소에 맞게 다시 정했습니다. 서버 모델과 API는 features, 화면 조합은 pages, 도메인과 무관한 공통 UI는 shared에 둡니다. 화면 간 직접 참조 62건을 정리하고 lint error로 막았습니다.
- 공통 UI는 접근성 primitive와 조합 유연성을 보고 Headless UI에서 Radix UI로 옮겼습니다. Bottom Sheet는 Compound Components와 overlay-kit으로 바꿔 본문과 하단 버튼이 같은 폼을 쓰게 했습니다.
- 인수한 정산 페이지는 1,170줄, 1,164줄이었습니다. 조회, 표, 선택, 편집, 정산 처리로 나누고 타입과 파일 위치를 정리했습니다. ref로 열던 모달도 대상과 열림 상태를 props로 받게 바꿨습니다.

[폼 타입 설계](https://jingeon27.tistory.com/18) | [공통 UI와 추상화](https://jingeon27.tistory.com/26) | [FSD 구조 변경](https://jingeon27.tistory.com/23)

#### 서버 렌더링과 데이터 조회 | 2025.05 – 현재

서버의 `ensureQuery` 결과를 render props로 받던 화면은 클라이언트 캐시를 구독하지 않아 무효화해도 갱신되지 않았습니다. 2025년 5월 예약 화면부터 prefetch와 hydration으로 옮겼습니다. 서버는 초기 HTML을 준비하고, 화면은 같은 캐시로 이후 조회와 갱신을 처리합니다.

- 인증 뒤 이동 중 앱이 멈추는 오류는 조사 당시 68건, 53명에게 발생했습니다. Next.js 소스에서 `redirect()` 처리 중 렌더마다 훅 개수가 달라지는 경로를 찾아 진입 판정과 리다이렉트를 React 렌더 전의 proxy로 옮겼습니다.
- 관리자 검색 오류는 개발 서버에서는 나타나지 않아 build 후 start로 목록 7개 중 6개에서 재현했습니다. 업스트림 이슈와 수정 PR로 라우터 캐시 문제를 확인하고, 서버가 읽지 않는 URL 조건 변경은 History API로 처리했습니다. 수정 뒤 9월 28일까지 같은 증상은 다시 보고되지 않았습니다.
- Next.js 14→16, React 18→19는 Turbopack과 로컬 개발 속도 개선을 보고 전환했습니다. 비동기 API와 캐시 변경에 맞춰 코드를 수정하고 직접 진입, 뒤로가기, 새로고침을 확인했습니다.
- TypeScript 7 네이티브 체커를 병행해 복지몰 타입 검사를 12.5초에서 1.9초로 줄였습니다. 반면 타입 인지 lint는 검사 시간이 3.3배 늘어 보류했습니다.

[Next.js 오류 대응](https://jingeon27.tistory.com/27)

#### 상담 채팅과 공유 패키지 | 2026.06 – 현재

동료가 처음 만든 유저 상담 채팅의 입력과 실시간 연결을 개선하고, 10월부터 병원 상담 채팅을 개발했습니다. 최고 관리자가 방을 열고 병원 관리자와 상담사를 초대하는 흐름입니다. 두 앱이 같은 대화 화면과 입력칸, 실시간 연결을 쓰도록 공유 패키지로 옮기고 API 함수만 주입하게 했습니다.

- 방 SSE는 React 밖 스토어와 `useSyncExternalStore`로 연결합니다. 토큰 갱신과 `last-event-id` 재연결을 처리하고, 받은 메시지와 읽음은 Query 캐시에 바로 반영합니다.
- 첫 페이지 조회 전 스트림을 열어 지난 이벤트를 다시 받던 순서를 고쳤습니다. 초기 조회의 마지막 순번부터 연결하고, 읽음은 500ms 동안 모아 보냅니다.
- 한글 조합 중 Enter로 메시지가 두 번 전송되는 문제는 `isComposing`과 전송 중 가드로 막았습니다.
- lint와 테스트에서 빠져 있던 채팅 영역을 다시 검사 대상으로 넣고 회귀 테스트를 보완했습니다.

#### 건강검진 도메인 내재화 | 2026.09 – 현재

검사 구성과 기업지원 코드, 예약금 흐름이 달라 기존 서비스로 처리하기 어려웠던 건강검진을 내재화했습니다. 제휴 병원의 요청으로 세 제품의 프론트엔드를 맡고 개발팀장, 부팀장과 빠진 동작과 예외를 확인했습니다. 9월 9일 개발을 시작해 30일 정식 오픈했습니다.

백오피스에는 검사 구성, 검진 프로그램, 기업지원 코드와 서류 확인, 결제취소와 환불 승인을, 병원 관리자에는 검진 예약 관리와 결제취소 요청 접수를, 복지몰에는 검사 선택과 기업 검진 코드, 토스페이먼츠 결제를 만들었습니다.

모바일 결제 복귀 시에는 같은 `orderId`와 Zod 검증을 통과한 입력만 한 번 복원합니다. 결제 실패 후 입력 복원과 승인 요청 실패 시 예약 목록 이동은 dev API 서버 E2E로 확인했습니다. 검사항목의 일괄 저장이 일부만 성공하면 발급된 ID를 폼에 반영해 재시도 중복을 막았습니다.

[건강검진 개발 과정](https://jingeon27.tistory.com/34)

#### Sentry 도입과 운영 오류 추적 | 2026.08 – 현재

복지몰의 브라우저, 서버, Edge에 Sentry를 도입해 8월 27일 운영에 배포했습니다. 오류 레벨과 중복 수집 기준을 정하고 release와 브라우저 소스맵을 연결했습니다. SDK와 payload에서 의료와 인증 정보가 담기는 값을 확인해 제거했습니다.

- Web Vitals가 pageload 트랜잭션에 담기도록 tracing을 연결하고, 값이 도착하기 전에 종료되지 않게 idleTimeout을 조정했습니다.
- Bottom Sheet 크래시는 라이브러리의 null ref 접근까지 추적해 고쳤습니다. 누적 75건, 57명 이상이던 오류 그룹은 9월 10일 배포 뒤 28일까지 18일간 0건이었습니다.
- 일부 조회의 실패가 앱 루트까지 번지던 오류 경계를 기능별로 나눴습니다. 백오피스 라우트 30개를 같은 구성으로 맞추고 실패한 구획만 다시 시도하게 했습니다.
- Zod 실패는 출처에 따라 다르게 처리합니다. 기존 API 응답 불일치는 CloudWatch로 트래킹하고, 잘못된 URL 필드는 기본값으로 돌리며 결제 복원값은 버립니다.

[Sentry 도입](https://jingeon27.tistory.com/30) | [크래시 분석](https://jingeon27.tistory.com/33) | [부분 장애 격리](https://jingeon27.tistory.com/28)

#### 테스트 도입 | 2026.07 – 현재

Vitest, React Testing Library, MSW, Playwright를 도입하고 기능 개발과 오류 대응을 거치며 기준을 보완했습니다. 새 동작은 BDD 형식의 `*.spec`, 운영과 QA 오류는 `*.test`로 나눕니다.

- 폼은 실제 RHF와 Ant Design Form을 조작해 제출합니다. 기대 payload는 제품의 변환 함수를 그대로 가져오지 않고 따로 작성합니다.
- API는 dev API 서버를 우선하고, 재현하기 어려운 조건에만 MSW를 씁니다. 성공만 반환하는 목이 실제 서버 제약을 가리지 않도록 계약 테스트를 추가했습니다.
- 병원 관리자 등록부터 백오피스의 검수, 반려, 승인까지 두 앱을 넘나드는 E2E를 만들었습니다.
- 새 테스트 패턴은 제품 코드를 일부러 깨뜨려 실패하는지도 확인합니다. 자체 lint rule도 RuleTester와 fixture, mock으로 검증합니다.

[테스트 코드를 도입하면서 세운 기준](https://jingeon27.tistory.com/25)

#### AI 개발 workflow | 2026.04 – 현재

반복되는 설계 판단은 skills에, 의존 방향과 공개 API, queryKey 같은 정적 기준은 lint rule에 남깁니다. 상태 관리와 폴더 구조도 저장소에 맞게 정리해 에이전트가 같은 기준으로 작업하도록 했습니다.

티켓과 plan 검토 → 테스트 작성 → 에이전트 구현과 에이전트 코드 리뷰 → 변경분 테스트, lint, typecheck → 직접 diff 리뷰와 화면 동작 확인 → 전체 CI(테스트, knip, lint) → QA 더블 체크 요청

공통 Bottom Sheet에서는 diff를 읽고도 헤더까지 스크롤되는 문제를 놓쳤습니다. 본문만 스크롤되게 수정하고 브라우저 레이아웃 테스트를 추가했습니다. 코드, 테스트, 화면 확인을 각각 거칩니다. 병렬 worktree의 CPU 부하를 줄이려고 작업 중에는 lint와 테스트를 변경분과 영향 범위로 좁히고, 타입 검사는 앱과 패키지 단위로 돌립니다. 전체 검사는 CI에서 확인합니다.

[AI 개발 workflow 개선](https://jingeon27.tistory.com/31)

#### 글로벌 사용자 서비스와 CMS | 2026.07 – 09

PO의 프로토타입 화면을 모두 구현해 두 제품을 3주 만에 PoC로 배포했습니다. Next.js, shadcn/ui와 Base UI를 사용하고 영어, 한국어, 아랍어와 RTL을 지원했습니다.

파일 전송 상태는 React 밖 스토어와 `useSyncExternalStore`로 관리했습니다. 동시 전송 용량 합을 2GB로 제한해 FIFO로 처리했고, 큰 파일 뒤에서 작은 파일이 기다리는 비용은 감수했습니다. 목 백엔드 의존을 클라이언트에서 분리해 앱 번들을 2,564KB에서 1,880KB로 줄였습니다.

[글로벌 서비스 개발 과정](https://jingeon27.tistory.com/24)

### 왓타임 | Frontend Engineer | 2024.01 – 2024.11

채용 SaaS RoundHR이 시장성을 확인하며 기능을 늘리던 시기에 합류했습니다. 개발자, 디자이너와 pnpm, Turborepo 모노레포의 채용 관리, 채용 담당자용 웹, 랜딩과 라운지, Electron 지원자 데이터 수집 앱을 개발했습니다.

- 채용 설정, 메일과 면접 알림 템플릿, 채용 단계 자동화, 평가와 온보딩을 개발했습니다. 랜딩과 모바일 화면에 Notion, Strapi 콘텐츠를 연결했습니다.
- 면접 템플릿은 네 단계 입력과 검증, sessionStorage 복원을 만들었습니다. 앱별 Query key와 조회 함수는 공용 패키지로 모으고, 공고 순서와 중첩 필터, 테이블의 드래그 공통 컴포넌트를 만들었습니다.
- Electron 앱의 수집 단계와 사이트별 adapter를 나누는 초기 구조를 설계하고 잡플래닛, 게임잡을 연동했습니다. NestJS는 무겁다는 CTO 피드백으로 걷어내고 모듈 경계와 생성자 주입만 참고했습니다.

[Electron 초기 구조](https://jingeon27.tistory.com/5) | [Query key 공통화](https://jingeon27.tistory.com/6)

## 학력

대덕소프트웨어마이스터고등학교 소프트웨어개발과 | 2021.03 – 2024.01
