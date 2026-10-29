# 김진건의 AI 활용 경험과 제품 개발

jingeon27@gmail.com | [GitHub](https://github.com/jingeon27) | [이력서](https://github.com/jingeon27/resume/blob/main/resumes/doers/resume-doers-ai-product-engineer.md)

세이프닥에서 여러 제품의 프론트엔드를 맡으며 AI로 구현하고 코드와 테스트를 검토하는 방식을 다듬었습니다. 개인 프로젝트에서는 요구사항과 화면 설계부터 API와 DB, 배포 구성까지 직접 정합니다. 구현과 테스트 작성은 코딩 에이전트에 맡기고, 만들 기능과 기술 선택, 완성된 결과의 검토는 제가 맡습니다.

이 문서에는 검증에서 놓친 조건을 고친 경험과 제품 방향을 정한 과정, 캐시와 업로드의 실패 동작을 설계한 사례를 담았습니다. 개인 프로젝트인 별사대와 Game Mate는 2026년 10월부터 만들고 있으며 둘 다 공개 전입니다.

## 실무에서 검증 방식을 바꾼 경험

### 테스트가 확인하는 화면을 다시 확인했습니다

관리자 서비스의 테스트용 QueryClient가 실제 앱과 다르게 조회 오류를 처리하고 있었습니다. 실제 앱에서는 오류 경계에 가려질 UI를 테스트에서는 볼 수 있어, 테스트가 통과해도 같은 화면을 보장하지 못했습니다.

설정을 앱과 맞추고 처음 데이터를 받지 못한 경우와 기존 데이터를 재조회하다 실패한 경우를 나눠 검증했습니다. 첫 조회 실패는 오류 경계가 처리하고, 재조회 실패는 기존 화면 전체를 가리지 않는지 확인하도록 했습니다. 테스트 코드도 제품 코드와 함께 읽으며 어떤 조건을 보장하는지 검토합니다.

### 코드 리뷰에서 놓친 스크롤을 회귀 테스트로 남겼습니다

공통 Bottom Sheet를 바꿀 때 에이전트가 본문과 헤더를 함께 스크롤되게 구현한 것을 diff에서 놓쳤습니다. 본문만 스크롤되도록 고치고 브라우저 레이아웃 회귀 테스트를 추가했습니다. 코드 리뷰 외에 화면을 띄워 동작을 확인하는 과정도 보완했습니다.

현재 실무에서는 요구사항과 Figma를 먼저 보고, 빠진 동작은 담당자와 논의한 뒤 아래 순서로 작업합니다.

티켓과 plan 검토 → 테스트 작성 → 에이전트 구현과 에이전트 코드 리뷰 → 변경분 테스트, lint, typecheck → 직접 diff 리뷰와 화면 동작 확인 → 전체 CI(테스트, knip, lint) → QA 더블 체크 요청

에이전트가 완성본을 제출하면 검토하고 부족한 부분은 수정을 요청해 다시 확인합니다. 기능 개발과 리팩터링에서는 변경된 제품 코드와 테스트를 읽습니다. 새 기능은 BDD 형식의 `*.spec`에 컴포넌트별 기대 동작을 적고 누락을 검토하며, 운영이나 QA 오류는 `*.test`에 재현합니다. 새 테스트 패턴은 제품 코드를 일부러 깨뜨려 실패하는지도 확인합니다.

[테스트 도입과 검증 기준](https://jingeon27.tistory.com/25) | [AI 개발 workflow](https://jingeon27.tistory.com/31)

## 개인 프로젝트에서 직접 정한 제품 방향

실무에서 다듬은 workflow를 가져와 두 제품을 만들고 있습니다. 개인 프로젝트에는 QA 더블 체크 요청 단계가 없습니다. 낯선 기술은 에이전트에게 대안과 비용, 동작 원리를 묻고 코드와 문서를 함께 보며 선택합니다.

작업 목표와 plan 검토 → 테스트 작성 → 에이전트 구현과 에이전트 코드 리뷰 → 변경분 테스트, lint, typecheck → 직접 diff 리뷰와 화면 동작 확인 → 전체 CI

![별사대 그룹 게시물과 Game Mate의 프로필 수정 화면](assets/ai-experience/09-product-interactions.png)

*2026년 10월 30일 최신 작업 코드의 실제 화면을 다시 촬영했습니다. 게시물과 계정, 가격은 촬영용 테스트 데이터입니다.*

### 별사대는 대회가 없어도 사진을 모을 수 있게 바꿨습니다

친구끼리 사진을 올리고 투표하는 대회로 시작했습니다. 직접 써 보니 대회가 열릴 때만 들어오는 서비스보다 평소에도 사진을 모을 공간이 있으면 좋겠다고 생각했습니다. 기간 제한 없이 사진과 동영상, 합성 이미지를 올리는 상시 그룹으로 바꿨습니다.

홈에는 가입한 그룹의 새 게시물을 보여 주고 그룹 목록은 MY로 옮겼습니다. 초대 링크 없이 공개 그룹을 찾는 탐색 화면도 추가했습니다. 기존 대회와 사진 데이터, 이전 링크는 보존하고 대회는 그룹 안에서 필요할 때 여는 기능으로 남겼습니다.

![기간제 사진 대회를 상시 그룹으로 바꾼 제품 방향](assets/ai-experience/02-product-direction.png)

화면에서는 사진을 가리는 순위와 실제로 없는 스토리 기능의 테두리를 빼도록 요청했습니다. 참고한 서비스의 장식을 그대로 가져오기보다 사진을 보고 반응하는 흐름에 필요한 요소를 골랐습니다. 공개 그룹은 누구나 내용을 볼 수 있게 하고 비공개 그룹은 가입 승인을 거치게 했습니다.

![별사대의 최신 그룹 생성과 공개 탐색 화면](assets/ai-experience/11-photo-group-flow.png)

*그룹 이름과 소개, 공개 범위를 입력하는 실제 생성 페이지와 공개 그룹 탐색입니다. 격리 환경에서 만든 그룹을 표시합니다.*

검증하려는 가설은 대회가 없어도 친구들과 사진을 모으는지, 초대와 반응이 재방문으로 이어지는지입니다. 가입 → 첫 게시물 → 좋아요 → 재방문 흐름을 확인할 준비를 했으며 실사용 성과는 아직 측정하지 않았습니다.

### Game Mate는 친추 판매와 코칭을 연결하려고 시작했습니다

친추 판매와 게임 코칭을 원하는 사람이 모집 글에서 가격과 조건을 확인하고 1:1 채팅으로 문의하도록 만들었습니다. 친추 판매는 판매 금액을 표시하고, 코칭은 코치와 수강생 모두 모집 글을 쓸 수 있게 했습니다. 수강료는 시간당, 월 단위, 목표 달성까지로 나눴습니다. 결제와 정산은 구현하지 않았습니다.

가입 때 게임 프로필 연결은 선택 사항으로 뒀습니다. 로그인과 가입 정보 입력은 별도 페이지로 나누고, 짧은 화면에서도 완료 버튼은 하단에 남기고 입력 본문만 스크롤되게 했습니다. 프로필 수정은 Bottom Sheet로 모으고 자기소개 DB 필드와 API 계약, SDK도 함께 바꿨습니다. 운영자 문의와 인증 요청은 관리자 1:1 채팅으로 받도록 했습니다.

![Game Mate의 최신 친추 판매와 코칭 모집 화면](assets/ai-experience/10-game-marketplace.png)

*친추 판매의 금액과 가격 협의, 코칭의 모집 역할과 수강료 단위를 보여 줍니다. 실제 거래나 매칭 성과를 나타내는 데이터는 아닙니다. [데스크톱 친추 판매 화면](assets/ai-experience/captures/game-sales-desktop.png)과 [로그인 화면](assets/ai-experience/captures/game-login.png)도 같은 코드로 촬영했습니다.*

[별사대 제품 방향](https://github.com/jingeon27/side-project/blob/89b25290/projects/photo-contest/docs/product-plan.md) | [Game Mate 구현 범위](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/docs/product.md) | [최신 모바일 화면 모음](assets/ai-experience/01-service-screens.png)

## 글 저장과 캐시 갱신의 실패를 나눴습니다

Game Mate에 Next.js 캐시를 적용하며 에이전트에게 갱신 방법을 묻고 비교했습니다. 일정 시간마다 만료하면 단순하지만 사용자가 방금 수정한 글이 바로 바뀌지 않을 수 있습니다. NestJS에서 저장을 마친 뒤 Next.js Route Handler로 해당 태그를 만료하는 방식을 선택했습니다.

검토할 조건은 글은 저장됐는데 캐시 만료 호출만 실패하는 경우였습니다. 이를 저장 실패로 응답하면 사용자가 같은 글을 다시 작성할 수 있습니다. DB에 변경 내용과 만료 태그를 함께 저장하고, 사용자에게는 저장 성공을 반환한 뒤 캐시 만료만 재시도하도록 했습니다.

![데이터와 캐시 만료 태그를 함께 저장하고 호출 실패는 재시도하는 흐름](assets/ai-experience/04-cache-invalidation.png)

이전 호출을 기다리는 사이 같은 태그에 새 수정이 생길 수도 있습니다. 늦게 끝난 호출이 새 대기 기록까지 지우지 않도록 revision이 같은 경우에만 삭제합니다. 재시도 기록을 관리하는 복잡성은 감수했고, 트랜잭션 롤백과 호출 실패 후 재시작, 이전 호출이 늦게 끝나는 조건을 통합 테스트에 넣었습니다.

브라우저의 Query 캐시와 Next.js 서버 캐시는 각각 갱신합니다. 공개 글만 쿠키 없이 캐시하고 사용자별 상태는 별도로 조회합니다. 별사대도 공개 SEO 조회에만 서버 캐시를 적용하고 개인화된 Apollo 요청은 no-store로 유지합니다.

[캐시 갱신 구현](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/apps/api/src/cache-invalidation/cache-invalidation.service.ts) | [롤백과 재시작, 경합 테스트](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/apps/api/src/cache-invalidation/cache-invalidation.integration.spec.ts)

## 파일을 받는 서버와 검사 범위를 정했습니다

처음에는 API 서버가 파일을 받으며 동시 처리 3개, 대기 12개로 제한했습니다. 이후 프로필 사진까지 브라우저에서 S3로 직접 보내도록 바꿔 서버가 파일 전체를 메모리에 올리지 않게 했습니다.

Game Mate에서는 직접 업로드한 파일의 확정 조건도 검토했습니다. POST 정책에 크기와 형식을 제한하고 HEAD와 파일 앞 4KB를 검사합니다. 검사 뒤 파일이 바뀌는 경우를 막으려고 ETag가 일치할 때만 최종 객체로 복사합니다.

![서버 처리 상한에서 S3 직접 업로드와 파일 확정으로 바꾼 흐름](assets/ai-experience/05-upload-concurrency.png)

별사대는 원본을 보관하고 HEAD로 크기와 형식만 확인합니다. 파일 내용 검사와 별도 객체 복사는 하지 않아 서명 정책이 만료되기 전 같은 키의 파일이 다시 올라올 수 있습니다. 두 서비스가 같은 검증을 한다고 묶지 않고 각 정책의 범위를 구분했습니다.

초기에는 S3 대역으로 반복 검증했고 Game Mate의 게시물과 프로필, 채팅 파일은 실제 AWS S3에서도 업로드와 완료, 원본 일치와 Range 조회를 확인했습니다. 10월 26일에는 개발과 통합 테스트의 S3 대역을 제거하고 실행별 객체 경로로 격리하도록 바꿨습니다. 전환 후 통합 검증에는 해당 경로의 AWS 권한 설정이 필요합니다.

[Game Mate 파일 확정](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/apps/api/src/media-storage/media-storage.service.ts) | [별사대 업로드](https://github.com/jingeon27/side-project/blob/82199271/projects/photo-contest/apps/api/src/media-upload/media-upload.service.ts) | [실제 S3 검증 기록](https://github.com/jingeon27/side-project/blob/89b25290/projects/game-feedback/docs/implementation.md)

## 반복되는 판단을 코드 구조와 검사에 남겼습니다

두 제품을 같은 Yarn workspace 모노레포에서 관리하면서 공통 디자인 시스템과 lint 설정을 분리했습니다. 색과 글자 스타일, 버튼과 입력창, Dialog는 함께 쓰고 피드와 라우팅, 데이터 조회는 앱별로 유지합니다. 공통 UI를 수정하면 두 앱에서 확인합니다.

Game Mate의 작성과 수정은 입력 필드만 공유합니다. 작성 후 페이지 이동과 수정 후 창 닫기는 각 화면에서 처리하도록 나눴습니다. 파일 배치와 공통 코드 사용처럼 맥락이 필요한 기준은 skills에 적고 FSD 의존 방향과 공개 API, 컴포넌트의 직접 fetch와 중복 오버레이 상태는 lint rule로 검사합니다. 규칙은 RuleTester와 fixture로 테스트합니다.

![서비스마다 다른 API와 캐시를 유지하고 UI와 lint 기준을 공유한 구조](assets/ai-experience/03-service-architecture.png)

서버 데이터는 별사대의 Apollo와 Game Mate의 TanStack Query에 두고 폼은 RHF와 Zod, 오버레이는 overlay-kit으로 관리합니다.

[공통 디자인 시스템](https://github.com/jingeon27/side-project/tree/82199271/packages/design-system) | [테스트 기준](https://github.com/jingeon27/side-project/blob/82199271/projects/photo-contest/.agents/skills/testing/SKILL.md) | [공용 ESLint](https://github.com/jingeon27/side-project/blob/b758d2e8/packages/config/eslint/README.md) | [Apollo 사용 기준](https://github.com/jingeon27/side-project/blob/89b25290/projects/photo-contest/apps/web/.agents/skills/apollo/SKILL.md)

### GraphQL과 REST에서 계약을 확인하는 방법

별사대는 NestJS의 schema-first GraphQL을 사용합니다. 도메인별 스키마와 resolver를 나누고 웹의 쿼리 문서에서 GraphQL Code Generator로 타입이 붙은 Document를 만듭니다. 모든 연산과 fragment를 서버 스키마와 대조하고 연산 이름이 겹치지 않는지도 검사합니다. 서버는 쿼리 깊이와 필드, alias 수를 제한합니다.

Apollo 캐시는 객체 id를 기준으로 갱신하고 자식 컴포넌트는 `useFragment`로 필요한 값을 읽습니다. 사진 목록의 페이지네이션과 좋아요의 낙관적 갱신은 실제 InMemoryCache에 데이터를 써서 확인합니다. 도메인별 캐시 정책을 합칠 때 같은 필드를 중복 정의하면 실패하도록 했습니다.

RSC의 `PreloadQuery` 결과를 브라우저로 넘기고 화면은 같은 조회를 구독합니다. 개인화된 요청과 공개 SEO 요청을 분리하고, mutation 일부가 저장된 뒤 다른 필드가 실패해 응답의 `data`가 null이 되는 경우도 공개 캐시 만료 조건에서 다룹니다.

Game Mate는 OpenAPI에서 생성한 Orval SDK와 Zod 응답 검증을 사용합니다. ID와 권한, 세션처럼 잘못 읽으면 안 되는 값은 검증에 실패하면 요청을 실패로 처리하고 화면 표시용 필드에만 기본값을 허용했습니다. 조회와 mutation options는 필요한 곳에서 조합하고 서버 데이터를 별도 UI 상태로 복제하지 않게 했습니다.

### 테스트마다 확인할 결과를 나눴습니다

![함수와 UI, API와 DB, 브라우저 흐름의 검증 범위](assets/ai-experience/06-test-strategy.png)

함수와 스키마는 Vitest로, UI와 폼은 React Testing Library로 확인합니다. 단순 호출 횟수 대신 실제 폼 입력과 제출값, 캐시에 남은 값을 단언합니다. API는 Supertest 요청 뒤 DB에 저장된 결과를 확인합니다. 대회당 한 표와 동시 가입, 관리자 양도, 캐시 호출 경합처럼 권한과 동시성이 중요한 조건을 포함합니다. 브라우저 흐름은 Playwright로 검증합니다. unit과 integration 테스트는 구현 옆에 두고 설정은 앱이 소유하며 루트에서는 실행만 위임합니다.

웹과 WebView 호스트를 연결한 테스트는 글 작성과 댓글, 채팅과 화면 이동을 확인합니다. OS 기능과 외부 OAuth를 fixture로 대신한 테스트를 실기기나 실제 제공자 연동의 성공으로 해석하지 않습니다. DB와 S3의 테스트 데이터도 실행별로 나누고 해당 실행이 만든 스키마와 객체만 정리합니다.

공통 lint rule도 RuleTester와 fixture로 검사합니다. FSD 경계와 공개 API, 직접 fetch와 오버레이 상태 중복을 규칙으로 옮기되 DOM 관련 규칙은 Expo에 적용하지 않습니다. 작성과 수정의 책임을 어디서 나눌지처럼 맥락에 따라 달라지는 판단은 skills와 코드 리뷰에 남깁니다.

## 수집 성공 응답 뒤 실제 데이터도 다시 조회했습니다

Sentry와 Amplitude 설정을 넣은 뒤 개발용 확인 이벤트를 보내고 MCP로 다시 조회했습니다.

![오류와 Web Vitals, 사용자 행동의 수신 결과를 MCP로 다시 확인하는 흐름](assets/ai-experience/08-monitoring-mcp.png)

수집된 값은 서비스와 실행 위치, 배포 버전을 구분해 남깁니다. Sentry에서는 eventId로 오류를, Amplitude에서는 개발 프로젝트의 페이지뷰를 확인했습니다. 이 과정에서 사진 서비스의 개발 모드 중복 페이지뷰와 자동 URL 수집에 검색어가 붙는 문제를 찾아 고쳤습니다.

Web Vitals는 브라우저 테스트에서 LCP, CLS, INP, FCP, TTFB 전송을 확인합니다. 실제 Sentry로 보낸 검증용 LCP, CLS, INP span도 trace ID로 다시 조회했습니다. 경로의 ID와 검색어는 제거하고 측정값을 남깁니다. 수신 경로를 검증한 것이며 사용자 성능을 개선한 결과로 쓰지는 않습니다.

[Game Mate 검증 기록](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/docs/observability.md) | [별사대 검증 기록](https://github.com/jingeon27/side-project/blob/82199271/projects/photo-contest/docs/observability.md)

## 초기 비용과 복구 부담을 함께 비교했습니다

Lightsail과 EC2, DB 구성의 비용과 관리 범위를 비교했습니다. 처음에는 두 서비스를 EC2 한 대에, DB는 RDS에 두려 했습니다. 초기 비용을 줄이려고 PostgreSQL도 같은 EC2로 옮겼습니다. 한 대가 멈추면 두 서비스와 DB가 함께 중단되고 백업과 복구를 직접 관리해야 한다는 부담을 감수한 선택입니다.

![같은 EC2의 두 서비스와 PostgreSQL, 별도 EBS와 S3 백업 구성](assets/ai-experience/07-deployment.png)

DB 데이터는 별도 EBS에 두고 일일 스냅샷과 배포 전 S3 덤프를 준비했습니다. 덤프 업로드가 실패하면 migration도 진행하지 않게 했습니다. CI에서 검증한 이미지는 digest로 고정하고 readiness 실패 시 이전 이미지로 되돌리도록 구성했습니다. 이미지 롤백으로 DB까지 되돌릴 수는 없어 migration과 백업은 별도로 다룹니다.

Terraform은 mock provider로 테스트하고 컨테이너 재배포와 재시작, 롤백을 확인할 smoke 테스트를 마련했습니다. 실제 AWS 리소스 적용과 운영 부하, 백업 복구는 별도로 검증해야 합니다.

[공통 배포 구성](https://github.com/jingeon27/side-project/blob/b758d2e8/deploy/shared-instance/README.md) | [Terraform](https://github.com/jingeon27/side-project/tree/b758d2e8/deploy/shared-instance/terraform) | [설정 테스트](https://github.com/jingeon27/side-project/blob/b758d2e8/deploy/shared-instance/terraform/tests/plan.tftest.hcl) | [전체 소스 코드](https://github.com/jingeon27/side-project)
