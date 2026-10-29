# 블로그 수정본 안내

발행에 사용할 개정본 35편을 이 폴더에서 관리해요. 상위 `blog/`의 같은 이름 파일은 이전 초안이고, 공개 글에 반영할 내용은 이 폴더를 기준으로 확인해요. 현재 공개 글은 [개인 블로그](https://blog.bambyul.com/ko/blog)에서 볼 수 있어요. 이 폴더를 수정해도 배포된 블로그에는 자동으로 반영되지 않아요.

## 먼저 읽어볼 글

- [두 관리자 앱에서 프로그램 폼을 공유하는 방법](post-18-program-form.md): 필드의 타입과 공용 입력, API 변환을 나눈 과정
- [선언적으로 코드를 쓰는 기준](post-26-declarative-code.md): 맥락과 추상화 수준을 맞추고, 읽기 쉬운 조합을 고른 사례
- [테스트 코드를 도입하면서 세운 기준](post-25-test-suite-rebuild.md): 실제 제출 경로와 서버 계약을 검증하며 테스트 기준을 보완한 과정
- [Sentry 도입](post-30-sentry-pii-hardening.md): 런타임별 오류 수집, 전송 정책, Web Vitals, MCP와 릴리스 연결
- [AI 개발 workflow](post-34-plan-gated-ai-workflow.md): plan 검토와 완성본 리뷰, 테스트와 CI를 나눠 맡긴 방식
- [타입 단언과 런타임 검증](post-35-zod-assertion-boundaries.md): 값의 출처와 실패 동작에 맞춰 검증 경계를 나눈 기준

## 문체와 구성

- `~했어요`와 `~인데요`를 기본으로 쓰되, 모든 문단을 같은 어미와 결론으로 맞추지 않아요.
- 실제로 겪은 일과 선택한 이유를 설명해요. 문제, 해결, 결과 형식이나 세 가지 교훈을 억지로 만들지 않아요.
- 제목에 em dash나 순번을 붙이지 않아요. 기술 버전과 본문의 절차 번호는 유지해요.
- 낱말을 가운데 점으로 잇지 않아요. 둘은 조사로, 셋 이상은 쉼표로 연결하고 링크는 ` | `로 나눠요.
- 요약은 짧게 쓰고, 중요한 선택 옆에 `note-decision`을 둬요. 기술적 한계도 해당 설명 옆에서 다뤄요.
- 말미에 범위나 면책 문단을 붙이지 않아요. 불필요한 stage 표기와 일시적인 브랜치 상태도 덜어내요.
- 반복되는 판단은 skills와 lint rule에 남긴다고 표현해요. `AI 개발 workflow` 등 사용자가 정한 용어는 유지해요.

## 호칭과 가명

| 대상 | 글에서 쓰는 이름 |
| --- | --- |
| 회원 대상 웹 서비스 | 복지몰 |
| 여러 관리자 앱과 공용 패키지가 있는 저장소 | 관리자 서비스 모노레포, 줄여서 관리자 서비스 |
| 병원이 쓰는 관리자 앱 | 병원 관리자 |
| 사내 운영팀의 관리자 앱 | Back-Office |
| 해외 사용자용 서비스 | 글로벌 서비스 |
| 해외 서비스의 관리자 앱 | 글로벌 CMS |
| 공용 폼 훅 | `useSchemaForm` |
| 인증 토큰 쿠키 | `sessionToken`, `renewalToken` |

내부 도메인과 계정, 경로는 공개에 필요한 범위에서 가명으로 바꿔요. 예제 속 식별자도 중립적인 이름을 쓰고, 공개 기술명과 라이브러리 API는 바꾸지 않아요.

## 사실과 시점

- 실제로 맡은 역할과 확인한 결과를 구분해요. 에이전트 리뷰를 동료와의 설계 리뷰 경험으로 바꾸지 않아요.
- 테스트 성공을 예약 증가나 전환율 개선으로 쓰지 않아요. 수치는 집계 범위와 비교 조건을 함께 설명해요.
- 추정한 원인과 재현한 원인을 구분해요. 크래시의 코드 경로를 찾았어도 앱의 재현 동작을 확인하지 못했다면 그대로 적어요.
- 공개된 글은 원칙적으로 당시 구현을 설명해요. 이후 수정된 문제를 처음부터 해결한 것처럼 넣지 않아요.
- 프로그램 폼 글(`post-18`)과 AI 개발 workflow 글(`post-34`)은 사용자 결정에 따라 현재 구현과 작업 방식을 반영해요.
- 본문과 그림에 불필요한 기준일이나 작업 날짜를 넣지 않아요. 구현 순서는 처음, 그 뒤, 이후로 설명해요.
- 11번 예약 폼과 15번 리뷰 폼, 22번 정산 글은 당시의 동작과 남아 있던 제약을 유지해요. 11번에는 이후의 폼 reset 방식과 27번 글을 소급해 넣지 않아요.
- 기술 용어를 고쳤다면 관련 공식 문서도 확인해요. 코드 예제의 동작이 달라지는 수정은 문장 수정과 구분해 검토해요.

## 파일과 공개 주소

아래 링크는 개인 블로그에 배포된 같은 글로 연결해요. 표의 번호는 이전 Tistory 공개 번호를 대조하기 위한 기록이에요. 파일명 숫자로 공개 주소를 만들지 않고, 로컬 파일명도 이전 공개 번호에 맞춰 바꾸지 않아요.

| 공개 글 | 제목과 로컬 수정본 |
| --- | --- |
| [4번](https://blog.bambyul.com/ko/blog/puppeteer의-request와-response를-함께-기다리기-closure보다-중요했던-수명-관리) | [Puppeteer에서 요청과 응답을 함께 기다릴 때 놓쳤던 것](post-04-puppeteer-closure.md) |
| [5번](https://blog.bambyul.com/ko/blog/nestjs의-책임-분리를-참고해-electron-수집-앱을-나눈-기준) | [NestJS의 책임 분리를 참고해 Electron 수집 앱을 나눈 기준](post-05-electron-nestjs-inspired.md) |
| [6번](https://blog.bambyul.com/ko/blog/tanstack-query-v4의-query-key를-query-key-factory로-정리한-이유) | [TanStack Query v4의 query key를 Query Key Factory로 정리한 이유](post-06-query-key-factory.md) |
| [7번](https://blog.bambyul.com/ko/blog/실무에서-자주-쓰는-typescript-패턴-네-가지) | [TypeScript로 호출부의 실수를 줄이는 방법](post-07-typescript-patterns.md) |
| [8번](https://blog.bambyul.com/ko/blog/nextjs-app-router에서-tanstack-query를-ssr과-함께-쓰는-방법) | [Next.js App Router에서 서버와 브라우저의 QueryClient를 나눈 이유](post-08-next-tanstack-query.md) |
| [11번](https://blog.bambyul.com/ko/blog/예약-폼의-작성-상태를-zustand에서-react-hook-form으로-옮긴-과정) | [예약 폼의 작성 상태를 Zustand에서 React Hook Form으로 옮긴 과정](post-11-reservation-form.md) |
| [12번](https://blog.bambyul.com/ko/blog/리뷰-좋아요-optimistic-update-여러-캐시를-함께-갱신하고-실패-시-복구하기) | [리뷰 좋아요의 목록과 상세 캐시를 함께 갱신하기](post-12-review-like-optimistic-update.md) |
| [14번](https://blog.bambyul.com/ko/blog/nextjs-app-router에서-prefetch를-기다려야-하는-경우) | [Next.js App Router에서 prefetch를 기다려야 하는 경우](post-14-next-seo-prefetch.md) |
| [15번](https://blog.bambyul.com/ko/blog/3단계-리뷰-작성-폼의-역할을-rhfzod퍼널로-다시-나눈-과정) | [3단계 리뷰 작성 폼의 역할을 RHF, Zod, 퍼널로 다시 나눈 과정](post-15-review-form.md) |
| [18번](https://blog.bambyul.com/ko/blog/두-관리자-앱의-프로그램-폼을-만드는-과정) | [두 관리자 앱에서 프로그램 폼을 공유하는 방법](post-18-program-form.md) |
| [19번](https://blog.bambyul.com/ko/blog/정산-서비스를-별도-호스트로-분리하며-도메인-간-토큰-전달을-설계한-과정) | [정산 서비스를 별도 호스트로 분리하며 토큰 전달 방식을 바꾼 과정](post-19-cross-domain-token.md) |
| [20번](https://blog.bambyul.com/ko/blog/우리-백엔드가-못-건드리는-영역에서-ai-상담-챗봇-붙이기) | [서로 다른 두 SSE를 하나의 상담 화면에 연결한 과정](post-20-chatbot-message-layer.md) |
| [21번](https://blog.bambyul.com/ko/blog/동적-사이트맵을-만들며-공개-api와-인증-api의-경계를-나눈-과정) | [동적 사이트맵에서 공개 API와 인증 API의 경계를 나눈 과정](post-21-sitemap-cache.md) |
| [22번](https://blog.bambyul.com/ko/blog/결제-내역에-쿠폰-결제를-추가하며-분기를-한곳으로-모은-과정) | [결제 내역에 쿠폰 결제를 추가하며 분기를 한곳으로 모은 과정](post-22-payment-coupon.md) |
| [23번](https://blog.bambyul.com/ko/blog/fsd-폴더는-다-있었는데-새-파일을-어디에-둘지-설명하기-어려웠어요) | [FSD 레이어를 저장소에 맞게 다시 나눈 과정](post-23-fsd-2-1.md) |
| [24번](https://blog.bambyul.com/ko/blog/프로토타입을-실사용-서비스로-옮기며-작업-규칙을-먼저-만든-이유) | [프로토타입을 옮기며 반복되는 판단을 skills에 남긴 과정](post-24-prototype-rules.md) |
| [25번](https://blog.bambyul.com/ko/blog/테스트-코드를-도입하면서-세운-기준) | [테스트 코드를 도입하면서 세운 기준](post-25-test-suite-rebuild.md) |
| [26번](https://blog.bambyul.com/ko/blog/선언적으로-코드를-쓰는-기준) | [선언적으로 코드를 쓰는 기준](post-26-declarative-code.md) |
| [27번](https://blog.bambyul.com/ko/blog/nextjs를-사용하면서-겪었던-이슈들) | [Next.js의 라우팅과 캐시 문제를 추적한 기록](post-27-next-server-to-client.md) |
| [28번](https://blog.bambyul.com/ko/blog/오류는-남기고-화면은-덜-잃게-만든-에러-처리-개편) | [오류가 난 영역만 다시 시도하도록 Error Boundary 나누기](post-28-error-boundary.md) |
| 미정 | [반복되는 리뷰 코멘트를 ESLint 규칙으로 옮기기](post-29-eslint-rule-fixture.md) |
| [30번](https://blog.bambyul.com/ko/blog/sentry로-에러-수집부터-web-vitalsmcp릴리스까지-연결한-과정) | [Sentry로 에러 수집부터 Web Vitals, MCP, 릴리스까지 연결한 과정](post-30-sentry-pii-hardening.md) |
| 미정 | [제가 내린 판단을 다음 작업에서도 확인할 수 있게 만들기](post-31-strength-and-blind-spot.md) |
| 미정 | [반복되는 코드 작성 기준을 lint로 옮긴 과정](post-32-convention-to-lint.md) |
| [29번](https://blog.bambyul.com/ko/blog/가장-값진-성공은-노력이-적은-성공입니다) | [가장 값진 성공은 노력이 적은 성공이에요](post-33-low-effort-success.md) |
| [31번](https://blog.bambyul.com/ko/blog/ai가-코드를-잘-짜기-시작했는데-제가-덜-바빠지지는-않았어요) | [AI에 구현을 맡기며 다듬은 개발 workflow](post-34-plan-gated-ai-workflow.md) |
| [32번](https://blog.bambyul.com/ko/blog/타입-단언을-걷어내며-zod를-경계마다-다르게-배치한-기준) | [타입 단언을 줄이며 정리한 런타임 검증 기준](post-35-zod-assertion-boundaries.md) |
| [33번](https://blog.bambyul.com/ko/blog/sentry가-잡아-준-bottom-sheet-드래그-크래시-원인-경로가-사라진-버전으로-올리기까지) | [Sentry로 추적한 Bottom Sheet 드래그 크래시](post-36-sentry-bottom-sheet-crash.md) |
| 미정 | [Amplitude에서 이벤트를 붙이는 일과 읽는 일](post-new-analytics-integrity.md) |
| 미정 | [크롤러가 받는 HTML로 복지몰 SEO 다시 살펴보기](post-new-crawler-view-seo.md) |
| 미정 | [굳이 무리하지 않기](post-new-dont-rush.md) |
| [34번](https://blog.bambyul.com/ko/blog/기존-프로그램-구조에-건강검진을-들이며-화면을-나눈-기준) | [건강검진 예약을 기존 서비스에 연결한 과정](post-new-health-check-program.md) |
| 미정 | [기능을 만든 뒤 어떤 숫자를 봐야 할까](post-new-product-metrics.md) |
| [35번](https://blog.bambyul.com/ko/blog/저는-코드를-읽어요) | [저는 코드를 읽어요](post-new-reading-ai-code.md) |
| 미정 | [임시 진료일을 세 제품의 예약 달력에 반영하기](post-new-temporary-open-day.md) |

## 이번 전체 개정에서 손본 부분

- 긴 요약과 반복되는 결론, 번역체 문장을 줄였어요. 기술명 나열보다 바꾸기 전 상황과 선택한 이유가 이어지도록 다듬었어요.
- JSON 직렬화의 `undefined` 처리, TanStack Query v5의 prefetch 실패 처리, 타입 단언 검사 규칙의 범위와 SEO 설명을 바로잡았어요.
- Sentry 글은 오류 대응과 전송 정책, Web Vitals, MCP, 릴리스를 먼저 읽을 수 있게 재배치했어요. 민감 정보 처리와 서버의 INP 저장 제약은 관련 설명 옆에 유지했어요.
- AI 개발 workflow의 완성본 검토 방식과 현재 검증 범위를 맞추고, 본문과 달랐던 그림 두 장도 수정했어요.
- 35편의 코드 블록은 변경하지 않았어요. 로컬 이미지와 문서 링크, 관련 글 제목과 공개 번호를 점검했어요.

기존 감사 기록은 [REVIEW.md](REVIEW.md)에 남아 있어요. 그 문서의 예전 파일 번호와 배포 상태를 현재 글에 그대로 옮기지는 않아요.
