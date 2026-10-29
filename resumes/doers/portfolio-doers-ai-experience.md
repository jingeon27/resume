# 김진건의 사이드프로젝트와 AI 활용 경험

jingeon27@gmail.com | [GitHub](https://github.com/jingeon27) | [이력서](https://github.com/jingeon27/resume/blob/main/resumes/doers/resume-doers-ai-product-engineer.md)

## 직접 만들고 있는 제품

2026년 10월부터 사진 커뮤니티 별사대와 글로벌 게임 커뮤니티 Game Mate를 만들고 있습니다. 요구사항 정의와 디자인, 기술 선택은 제가 맡고 구현과 테스트 작성은 코딩 에이전트에 맡깁니다. 웹과 API, DB, 테스트 기준과 배포 구성까지 다룹니다. 두 서비스 모두 공개 전이며 초기 사용자 검증을 준비하고 있습니다.

별사대는 친구끼리 사진을 올리고 투표하는 대회로 시작했습니다. 직접 써 보며 대회가 없을 때도 사진을 모을 공간이 필요하다고 판단해 상시 그룹 커뮤니티로 바꿨습니다. Game Mate는 친추 판매와 게임 코칭을 원하는 사람을 연결하려고 시작했습니다. 모집 글에서 가격과 조건을 확인하고 1:1 채팅으로 문의할 수 있도록 만들었습니다.

![사진 커뮤니티의 그룹 게시물과 Game Mate의 프로필 수정 화면](assets/ai-experience/09-product-interactions.png)

*실제 구현 화면입니다. 게시물과 계정은 화면 검증용 데이터입니다.*

[전체 저장소](https://github.com/jingeon27/side-project) | [피드와 회원가입, 그룹 탐색 화면](assets/ai-experience/01-service-screens.png)

## 에이전트에게 맡기는 일과 제가 확인하는 것

실무에서 쓰던 AI 개발 workflow를 개인 프로젝트의 구조와 기술에 맞게 가져왔습니다.

작업 목표와 plan 검토 → 테스트 작성 → 에이전트 구현과 에이전트 코드 리뷰 → 변경분 테스트, lint, typecheck → 직접 diff 리뷰와 화면 동작 확인 → 전체 CI

구현 전에는 기능의 범위와 공개 권한, 실패했을 때의 동작을 정합니다. 낯선 기술은 에이전트에게 대안과 비용, 동작 원리를 묻고 코드와 문서를 함께 보며 선택합니다. 완성본은 요구사항과 테스트 명세를 대조하고 화면을 직접 써 봅니다. critical 리뷰 항목은 자동으로 고치게 하되 수정 결과를 다시 확인합니다.

제품 판단은 직접 합니다. 사진을 가리는 순위나 실제로 없는 스토리 기능의 테두리는 빼도록 요청했습니다. 반복해서 어긋나는 구현 기준은 skills에 적고, 자동 검사할 수 있는 항목은 lint rule로 만듭니다.

## 사진 대회에서 상시 커뮤니티로

처음에는 대회 마감일과 한 사람당 한 장의 제약이 있었습니다. 평소에도 사진과 동영상, 합성 이미지를 모을 수 있도록 그룹을 계속 유지하고 게시물을 추가했습니다. 기존 대회와 사진 데이터, 이전 링크는 보존하고 대회는 그룹 안의 선택 기능으로 남겼습니다.

홈에는 가입한 그룹의 새 게시물을 보여 주고 그룹 목록은 MY로 옮겼습니다. 초대 링크가 없어도 공개 그룹을 찾아볼 수 있게 했습니다. 공개 게시물은 로그인 없이 볼 수 있지만 비공개 그룹은 가입 승인이 필요합니다.

![기간제 사진 대회를 상시 그룹 커뮤니티로 바꾼 제품 방향](assets/ai-experience/02-product-direction.png)

*대회가 끝나도 그룹과 게시물은 남고, 그룹 안에서 새 대회를 열 수 있습니다.*

Game Mate에서는 가입 때 게임 프로필 연결을 선택 사항으로 두고 로그인과 가입 정보 입력을 별도 페이지로 나눴습니다. 짧은 화면에서도 가입 완료 버튼은 하단에 남기고 입력 본문만 스크롤되게 했습니다. 프로필 수정은 Bottom Sheet로 모으고 자기소개 DB 필드와 API 계약, SDK도 함께 바꿨습니다.

친추 판매 글에는 판매 금액을 표시하고, 코칭은 코치와 수강생 모두 모집 글을 쓸 수 있게 했습니다. 코칭 수강료는 시간당, 월 단위, 목표 달성까지로 나눠 표시합니다. 글에서 상대를 확인하고 채팅으로 문의하는 흐름을 만들었으며 결제와 정산은 구현하지 않았습니다. 운영자 문의와 인증 요청도 관리자 1:1 채팅으로 받도록 했습니다.

[별사대 제품 방향](https://github.com/jingeon27/side-project/blob/89b25290/projects/photo-contest/docs/product-plan.md) | [Game Mate 제품 범위](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/docs/product.md)

## 함께 쓰는 UI와 서비스별 상태 관리

두 서비스는 Yarn workspace 모노레포에서 관리합니다. shadcn/ui와 Base UI 기반 공통 디자인 시스템에 색과 글자 스타일, 버튼과 입력창, Dialog를 두고 피드와 라우팅, 데이터 조회는 앱별로 유지합니다. 공통 UI를 고칠 때는 두 앱에서 확인합니다.

별사대는 schema-first GraphQL과 Apollo Client, Game Mate는 REST와 TanStack Query를 사용합니다. API와 캐시도 각각 유지합니다. 서버 데이터는 각 캐시에, 폼은 RHF와 Zod에 두고 오버레이는 overlay-kit으로 관리합니다.

![서비스별 API와 클라이언트 캐시, 공용 디자인 시스템과 lint의 구조](assets/ai-experience/03-service-architecture.png)

*서비스별 웹과 API, 모바일은 projects 아래에, 공용 UI와 설정은 packages에 둡니다.*

Game Mate의 작성과 수정은 입력 필드만 공유합니다. 작성 후 페이지 이동과 수정 후 창 닫기는 각 화면에서 처리하도록 나눴습니다. REST는 서버 스키마에서 OpenAPI 문서와 Orval SDK를 생성합니다. 응답 검증에서 ID, 권한, 세션을 잘못 읽으면 요청을 실패로 처리하고, 표시용 필드에만 기본값을 허용했습니다.

별사대는 쿼리 문서에서 타입을 생성하고 모든 문서를 서버 스키마와 대조하는 계약 테스트를 뒀습니다. Apollo 캐시는 객체 id로 갱신하고, 페이지네이션과 낙관적 갱신은 실제 InMemoryCache로 테스트합니다.

[공통 디자인 시스템](https://github.com/jingeon27/side-project/tree/82199271/packages/design-system) | [작성과 수정 흐름 분리](https://github.com/jingeon27/side-project/tree/82199271/projects/game-feedback/apps/web/src/widgets/post-composer) | [Apollo 사용 기준](https://github.com/jingeon27/side-project/blob/89b25290/projects/photo-contest/apps/web/.agents/skills/apollo/SKILL.md)

## 공개 캐시 갱신과 재시도

일정 시간마다 캐시를 만료하면 단순하지만, 방금 수정한 글이 바로 바뀌지 않을 수 있습니다. 대안을 비교한 뒤 Game Mate는 NestJS에서 저장을 마치면 Next.js Route Handler로 해당 태그를 만료하도록 했습니다. 공개 글은 쿠키 없이 캐시하고 사용자별 상태는 별도로 조회합니다.

![데이터와 캐시 무효화 태그를 함께 저장하고 실패한 호출은 재시도하는 흐름](assets/ai-experience/04-cache-invalidation.png)

*브라우저의 Query 캐시와 Next.js 서버 캐시는 각각 갱신합니다.*

글은 저장됐는데 캐시 만료 호출이 실패했다고 저장 실패를 반환하면 사용자가 다시 작성할 수 있습니다. DB에 변경 내용과 만료 태그를 함께 저장하고, 응답은 저장 성공으로 돌려준 뒤 만료만 재시도합니다. 이전 호출이 늦게 끝나 새 기록을 지우지 않도록 revision이 같은 경우에만 대기 기록을 삭제합니다.

재시도 기록을 관리해야 하는 복잡성은 감수했습니다. 트랜잭션 롤백, 호출 실패 후 재시작, 이전 호출이 늦게 끝나는 조건을 통합 테스트에 넣었습니다. 별사대는 공개 SEO 조회만 서버 캐시에 저장하고 개인화된 Apollo 요청은 no-store로 유지하며 mutation 뒤 공개 태그를 만료합니다.

[캐시 무효화 구현](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/apps/api/src/cache-invalidation/cache-invalidation.service.ts) | [실패와 경합 테스트](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/apps/api/src/cache-invalidation/cache-invalidation.integration.spec.ts)

## S3 직접 업로드로 변경

처음에는 API 서버가 파일을 받으며 동시 처리 3개, 대기 12개로 제한했습니다. 이후 프로필 사진까지 브라우저에서 S3로 직접 보내도록 바꿔 서버가 파일 전체를 메모리에 올리지 않게 했습니다.

![서버 처리 상한에서 S3 직접 업로드와 파일 확정으로 바꾼 흐름](assets/ai-experience/05-upload-concurrency.png)

Game Mate는 서명 발급 → S3 직접 전송 → 완료 확인 순서입니다. POST 정책에 크기와 형식을 제한하고 HEAD와 파일 앞 4KB를 검사합니다. 검사 후 파일이 바뀌는 경우를 막으려고 ETag가 일치할 때만 최종 객체로 복사합니다.

별사대는 원본을 보관하고 HEAD로 크기와 형식만 확인합니다. 파일 내용 검사와 별도 객체 복사는 하지 않아, 서명 정책이 만료되기 전 같은 키의 파일이 다시 올라올 수 있습니다.

초기 반복 검증에는 S3 대역을 썼고, Game Mate의 게시물과 프로필, 채팅 파일은 실제 AWS S3에서도 서명 발급부터 업로드, 완료, 원본 일치와 Range 조회를 확인했습니다. 10월 26일에는 개발과 통합 테스트의 S3 대역을 제거하고 실행별 경로로 객체를 격리하도록 바꿨습니다. 전환 후 통합 검증에는 해당 테스트 경로의 AWS 권한 설정이 필요합니다.

[Game Mate 파일 확정](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/apps/api/src/media-storage/media-storage.service.ts) | [별사대 업로드](https://github.com/jingeon27/side-project/blob/82199271/projects/photo-contest/apps/api/src/media-upload/media-upload.service.ts) | [실제 S3 검증 기록](https://github.com/jingeon27/side-project/blob/89b25290/projects/game-feedback/docs/implementation.md) | [S3 대역 제거](https://github.com/jingeon27/side-project/commit/4114b5bd)

## 앱별 테스트와 공통 lint

테스트 설정은 앱별로 관리하고 루트에서는 실행만 위임합니다. 함수와 UI는 Vitest, API와 DB 결과는 Supertest와 격리된 PostgreSQL, 브라우저 흐름은 Playwright로 확인합니다. unit과 integration은 구현 파일 옆에 둡니다.

![함수와 UI, API와 DB, 브라우저 흐름의 테스트 범위](assets/ai-experience/06-test-strategy.png)

새 동작은 BDD 형식의 `*.spec`에 적고 컴포넌트별 조건이 빠지지 않았는지 검토합니다. 발견한 오류는 `*.test`에 재현하고, 새 테스트 패턴은 제품 코드를 일부러 깨뜨려 실패하는지 확인합니다. 대회당 한 표, 동시 가입과 양도, 캐시 호출 경합은 실제 DB 결과로 검증합니다.

웹과 WebView 호스트를 연결한 테스트에서는 글과 댓글, 채팅과 화면 이동을 확인합니다. OS 기능과 외부 인증은 fixture로 대체합니다. 실행별 스키마와 포트, 빌드 경로를 나눠 다른 테스트와 개발 서버를 건드리지 않게 했습니다.

공용 ESLint는 FSD 의존 방향과 공개 API, 컴포넌트의 직접 fetch, 중복된 오버레이 상태를 검사합니다. RuleTester와 fixture로 규칙을 테스트하고 DOM 관련 규칙은 Expo에서 제외합니다. 작성과 수정 흐름의 분리처럼 맥락이 필요한 판단은 skills와 리뷰에 남겼습니다.

[테스트 기준](https://github.com/jingeon27/side-project/blob/82199271/projects/photo-contest/.agents/skills/testing/SKILL.md) | [공용 ESLint](https://github.com/jingeon27/side-project/blob/b758d2e8/packages/config/eslint/README.md)

## 사용자 행동 측정과 모니터링

Sentry에는 API와 웹의 오류를 서비스, 실행 위치, 배포 버전과 함께 남깁니다. Amplitude에는 페이지 방문과 가입, 글쓰기, 채팅 같은 행동을 수집하며 완료 이벤트는 요청 성공 뒤 전송합니다.

![Sentry와 Amplitude 수집 결과를 MCP로 다시 조회하는 흐름](assets/ai-experience/08-monitoring-mcp.png)

개발용 확인 이벤트를 보낸 뒤 Sentry는 eventId, Amplitude는 개발 프로젝트의 페이지뷰로 수신 결과를 다시 조회했습니다. 사진 서비스의 개발 모드 중복 페이지뷰와 자동 URL 수집에 검색어가 붙는 문제도 찾아 고쳤습니다.

Web Vitals는 두 웹에서 LCP, CLS, INP, FCP, TTFB 전송을 브라우저 테스트로 확인합니다. 경로의 ID와 검색어는 제거하고 측정값은 남깁니다. 실제 Sentry로 보낸 검증용 LCP, CLS, INP span은 MCP에서 trace ID로 다시 조회했습니다. 초기 사용자의 가입 → 첫 게시물 → 좋아요 → 재방문을 확인할 준비이며, 전환이나 성능 개선 성과를 측정한 단계는 아닙니다.

[Game Mate 수집 검증](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/docs/observability.md) | [별사대 수집 검증](https://github.com/jingeon27/side-project/blob/82199271/projects/photo-contest/docs/observability.md) | [Web Vitals 전송 테스트](https://github.com/jingeon27/side-project/blob/82199271/projects/game-feedback/apps/web/e2e/sentry-web-vitals.spec.ts)

## 인프라 선택과 배포 구성

Lightsail과 EC2, DB 구성의 비용과 관리 범위를 비교했습니다. 처음에는 두 서비스를 EC2 한 대에, DB는 RDS에 두려 했습니다. 초기 비용을 줄이려고 PostgreSQL도 같은 EC2로 옮겼습니다. 한 대가 멈추면 두 서비스와 DB가 함께 중단되고 백업과 복구를 직접 관리해야 하는 구성을 선택했습니다.

![한 EC2의 두 서비스와 PostgreSQL, 별도 EBS와 S3 백업 구성](assets/ai-experience/07-deployment.png)

DB 데이터는 별도 EBS에 두고 일일 스냅샷과 배포 전 S3 덤프를 준비했습니다. 덤프 업로드가 실패하면 migration도 진행하지 않습니다. 서비스별 DB와 계정, 실행용 계정과 migration 계정을 나누고 외부 요청은 Caddy로 받습니다.

CI에서 검증한 이미지를 digest로 고정하고 readiness 실패 시 이전 이미지로 되돌리도록 했습니다. 배포가 겹치지 않게 잠금을 두고, DB migration은 이미지 롤백과 별도로 다룹니다. Terraform은 mock provider로 테스트하고 컨테이너 재배포와 재시작, 롤백을 확인할 smoke 테스트도 마련했습니다. 실제 AWS 리소스 적용과 운영 부하 검증은 별도입니다.

[공통 배포 구성](https://github.com/jingeon27/side-project/blob/b758d2e8/deploy/shared-instance/README.md) | [Terraform](https://github.com/jingeon27/side-project/tree/b758d2e8/deploy/shared-instance/terraform) | [설정 테스트](https://github.com/jingeon27/side-project/blob/b758d2e8/deploy/shared-instance/terraform/tests/plan.tftest.hcl)

## 실무의 AI 개발 workflow

세이프닥에서는 요구사항과 Figma를 검토하고 빠진 동작을 담당자와 논의합니다. 구현 후에는 아래 순서로 확인하며 마지막에 QA 더블 체크를 요청합니다.

티켓과 plan 검토 → 테스트 작성 → 에이전트 구현과 에이전트 코드 리뷰 → 변경분 테스트, lint, typecheck → 직접 diff 리뷰와 화면 동작 확인 → 전체 CI(테스트, knip, lint) → QA 더블 체크 요청

공통 Bottom Sheet를 바꾸면서 본문과 헤더가 함께 스크롤되는 문제를 diff에서 놓쳤습니다. 본문만 스크롤되게 고치고 화면 확인과 레이아웃 회귀 테스트를 보완했습니다. 이런 반복 수정은 skills와 lint rule에 반영하며, 개인 프로젝트에는 별도 QA 요청 단계를 두지 않았습니다.

[AI 개발 workflow](https://jingeon27.tistory.com/31) | [테스트 도입](https://jingeon27.tistory.com/25)
