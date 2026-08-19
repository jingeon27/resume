# SafeDoc User Mall Sentry 보완 검토

- 검토 기준: `origin/develop@5a1488b4`
- SDK: `@sentry/nextjs@10.70.0`
- 작성일: 2026-08-20

## 결론

클라이언트·Node·Edge 런타임을 분리하고 Next.js의 요청/라우팅 훅, 환경 구분, 트레이싱 샘플링, 소스맵 업로드를 연결한 기본 구조는 잘 잡혀 있다. 다만 의료 서비스의 개인정보 보호 기준으로 보면 **자동 수집 차단 설정과 실제 전송 경로 사이에 빈틈이 있다.**

가장 먼저 해야 할 일은 다음 두 가지다.

1. `dataCollection`에서 누락된 수집 항목을 명시적으로 닫는다.
2. 수동 context, breadcrumb, span에 공통 마스킹 계층을 둔다.

그다음 404와 네트워크 오류의 수집 정책을 조정하고, 소스맵과 알림의 운영 검증을 보완한다.

## 현재 잘 구성된 부분

- `instrumentation.ts`에서 Node와 Edge 런타임의 SDK 초기화를 분리했다.
- `onRequestError = Sentry.captureRequestError`로 서버 컴포넌트, 라우트 핸들러, 서버 액션 오류를 수집한다.
- `instrumentation-client.ts`에서 `onRouterTransitionStart`를 내보내 App Router 이동을 계측한다.
- DSN 유무를 SDK 활성화 스위치로 사용하고 `environment`로 배포 환경을 구분한다.
- 프로덕션 트레이싱을 20%로 샘플링한다.
- 빌드 인증 토큰은 CI에서만 주입하고, 업로드한 소스맵은 배포 산출물에서 삭제한다.
- 쿠키, 헤더, HTTP 본문, URL query, GenAI 입출력, DB query data를 명시적으로 차단하려는 정책이 코드에 드러난다.

## P0: 개인정보 보호 경계 보완

### 1. `dataCollection`의 누락 항목

대상: `src/modules/shared/monitoring/sentry.constant.ts`

Sentry 10.70.0은 `dataCollection` 객체가 전달되면 누락된 속성을 제한적인 이전 기본값이 아니라 새 기본값으로 채운다. 현재 상수에는 다음 세 항목이 없다.

| 항목 | 누락 시 유효값 | 위험 |
| --- | --- | --- |
| `graphQL.document` | `true` | Node SDK의 기본 GraphQL tracing 통합이 실행되면 literal을 가린 문서가 span에 포함될 수 있다. |
| `graphQL.variables` | `true` | 현재 표준 통합은 이 옵션을 읽어 변수 값을 수집하지 않지만, 향후 통합 추가·변경에도 닫힌 정책을 유지하려면 명시해야 한다. |
| `stackFrameVariables` | `true` | 오류 시점의 지역 변수에 토큰, 회원 정보, 진료 관련 값이 들어 있을 수 있다. |
| `frameContextLines` | `5` | 스택 주변 소스 코드가 함께 전송된다. 개인정보보다는 소스 공개 정책의 문제지만 명시적인 결정이 필요하다. |

의료 서비스의 차단 우선 정책이라면 다음 값을 추가한다.

```ts
graphQL: { document: false, variables: false },
stackFrameVariables: false,
frameContextLines: 0,
```

`frameContextLines`는 디버깅 가치와 소스 공개 정책을 검토해 허용할 수 있지만, 암묵적인 기본값으로 남겨서는 안 된다. `frameContextLines: 0`은 오류 이벤트에 붙는 주변 코드만 막는다. 빌드 때 업로드하는 source map의 `sourcesContent`는 별도 경로이므로, 원본 코드 접근 정책은 소스맵 보관·권한과 함께 따로 관리해야 한다.

### 2. 수동 context는 자동 수집 차단 대상이 아니다

대상:

- `src/modules/shared/model/error/error.helper.ts`
- `src/modules/shared/model/error/schema-parse.helper.ts`
- `src/modules/shared/monitoring/sentry.helper.ts`

현재 다음 값이 `scope.setContext()`나 메시지·fingerprint에 직접 들어간다.

- `getCurrentPath()`가 반환하는 `pathname + search`
- Axios 요청 URL
- 백엔드 응답의 `resMsg`
- 스키마 불일치의 URL, 화면 경로, Zod issue 메시지

`dataCollection.urlQueryParams: false`는 SDK가 자동으로 수집하는 request data를 제어한다. 애플리케이션이 직접 context, message, tag, fingerprint에 넣은 값까지 정리하지는 않는다. 따라서 현재처럼 query string에 회원 식별자가 포함될 수 있는 서비스에서는 수동 전송 경로를 별도로 제한해야 한다.

권장 정책은 다음과 같다.

- 화면 위치는 query와 hash를 제거한 `pathname`만 전송한다.
- API URL은 origin과 query 값을 제거하고 경로를 동적 세그먼트 기준으로 정규화한다.
- 백엔드 `resMsg` 원문은 전송하지 않고 오류 코드와 상태만 남긴다.
- Zod issue는 `path`와 `code`만 허용하고 자유 문자열인 `message`는 전송하지 않는다.
- 검색 조건이나 식별자가 들어갈 수 있는 값을 tag와 fingerprint에 사용하지 않는다.
- `beforeSend`에서 context, message, request, breadcrumbs를 최종 마스킹한다.
- `beforeSendTransaction`에서 transaction metadata를 정규화한다.
- `beforeSendSpan`에서 span 이름과 URL 속성을 정규화한다.

### 3. 기본 breadcrumb 수집

대상: `src/modules/app/monitoring/sentry.client.ts`

브라우저 SDK의 기본 Breadcrumbs 통합은 console, DOM 클릭, fetch, XHR, history 이동을 모두 수집한다. 현재 별도의 `beforeBreadcrumb`가 없으므로 다음 값이 오류 이벤트의 breadcrumb에 포함될 수 있다.

- `console.error` 인자에 포함된 응답 객체나 사용자 데이터
- fetch/XHR URL의 query string
- history 이동 전후 URL
- DOM의 ID, class, 접근성 속성에 포함된 식별 정보

다음과 같이 보완한다.

- 의료 서비스에서 필요성이 낮은 console·DOM breadcrumb는 끈다.
- fetch/XHR/history breadcrumb URL은 query와 hash를 제거한다.
- `beforeBreadcrumb`와 `beforeSend`가 같은 URL 정규화·민감 키 마스킹 함수를 사용하게 한다.
- custom context·tag·fingerprint는 상태 코드, 오류 코드, HTTP method처럼 허용한 필드만 조립하는 allowlist 방식으로 만든다.
- `authorization`, `cookie`, `token`, `accessToken`, `refreshToken`, `password`, `memberId`, `patientId`, `phone`, `email` 등의 denylist 마스킹은 미등록 키와 문자열 내부 개인정보를 놓칠 수 있으므로 보조 방어로만 사용한다.

## P1: 이슈 품질과 장애 감지 보완

### 4. 모든 404를 pathname별 `fatal`로 수집

대상: `src/app/not-found.tsx`

현재 모든 404가 `fatal`이며 `['NOT_FOUND', pathname]`으로 그룹핑된다. 공개 서비스에서는 봇과 잘못된 외부 링크가 임의 경로를 계속 요청하므로 다음 문제가 생긴다.

- pathname마다 새로운 이슈가 생성되어 이슈 수가 급증한다.
- 동적 ID가 들어간 경로가 tag와 fingerprint에 남을 수 있다.
- 실제 렌더링 장애와 일반 404가 같은 심각도로 보인다.

일반 404는 Sentry 오류로 전송하지 않는 것이 기본안이다. 내부 링크 단절을 탐지해야 한다면 `document.referrer`에 의존하지 않는다. SPA 내부 이동에서는 referrer가 이동마다 갱신되지 않으므로, 링크 클릭이나 router transition 시 이전 route를 명시적으로 기록하고 404와 연결한다. 이 경우에도 `warning`, 고정 fingerprint, 정규화한 route, 샘플링을 사용한다.

### 5. `ignoreErrors` 범위가 넓다

대상: `src/modules/shared/monitoring/sentry.constant.ts`

현재 다음 오류가 원인과 관계없이 전부 버려진다.

- `ChunkLoadError`와 동적 import 실패
- `Failed to fetch`, `Load failed`, `NetworkError`
- `AbortError`
- non-Error promise rejection

이 메시지들은 오래 열린 탭이나 사용자 네트워크 단절로도 발생하지만, 잘못된 배포, CDN 장애, CORS, TLS, API 장애, 의도하지 않은 요청 중단에서도 발생한다. 전역 문자열 필터로 제거하면 실제 장애까지 보이지 않는다.

권장 정책은 다음과 같다.

- ResizeObserver와 브라우저 확장 프로그램처럼 원인이 명확한 잡음만 전역 제외한다.
- 의도적인 요청 취소는 해당 호출부에서 식별해 제외한다.
- 오프라인 상태의 네트워크 오류만 조건부 제외한다.
- 청크 오류는 release 기준으로 묶어 낮은 비율로 수집하거나 별도 지표로 집계한다.
- 일반 네트워크 오류는 샘플링하더라도 완전히 버리지는 않는다.

## P2: 설정 정리와 운영 검증

### 6. 중복 선언된 Browser Tracing 통합

대상: `src/modules/app/monitoring/sentry.client.ts`

`@sentry/nextjs@10.70.0`은 `browserTracingIntegration()`을 기본 통합에 이미 추가한다. 현재의 명시적 선언은 통합 이름 기준 dedupe로 실제 중복 수집될 가능성은 낮지만, 기본 동작을 커스텀 설정처럼 보이게 한다. 별도 옵션을 전달하지 않는다면 제거하는 편이 명확하다.

### 7. API 분산 추적 범위가 명시되지 않음

대상: `src/modules/app/monitoring/sentry.client.ts`

브라우저와 API가 서로 다른 origin인데 `tracePropagationTargets`가 없다. 기본 설정에서는 별도 API origin으로 `sentry-trace`와 `baggage` 헤더가 전달되지 않아 브라우저 navigation과 백엔드 요청을 하나의 trace로 연결할 수 없다.

- 백엔드 연계 추적이 필요하면 환경별 SafeDoc API origin만 `tracePropagationTargets`에 allowlist한다.
- 백엔드 CORS 설정에서 `sentry-trace`, `baggage` 요청 헤더를 허용한다.
- 연계 추적이 목적이 아니라면 현재 범위를 client-only tracing으로 문서화한다.
- 토큰이나 회원별 URL이 외부 origin으로 전파되지 않도록 와일드카드 대신 정확한 origin을 사용한다.

### 8. 소스맵 업로드 실패가 배포를 통과함

대상: `next.config.ts`

현재 `errorHandler`는 업로드 실패를 `console.warn`으로 남기고 빌드를 계속한다. 배포 가용성을 우선하는 선택으로는 타당하지만, 실패를 놓치면 운영 오류가 minified stack으로만 남는다.

- 프로덕션 빌드에서 인증 토큰 누락과 업로드 실패를 CI 결과에 명확히 표시한다.
- 배포 후 client·server 테스트 오류를 각각 한 번 발생시켜 release, environment, 원본 파일·행 번호를 확인한다.
- 필요하면 `sentry-cli sourcemaps explain <event-id>`로 debug ID와 artifact 매칭을 점검한다.
- self-hosted Sentry 버전과 Symbolicator 상태가 현재 SDK를 지원하는지 확인한다.

### 9. 오류 화면의 원문 노출

대상:

- `src/app/error.tsx`
- `src/app/global-error.tsx`

Sentry 설정과는 별개지만 같은 오류 처리 경계에 속한다. 두 화면은 `error.message` 원문을 사용자에게 보여준다. 클라이언트 오류 메시지에 내부 URL이나 구현 정보가 들어갈 수 있으므로 운영에서는 일반 안내문만 보여주고 원문은 Sentry에서만 확인한다.

## 테스트 전략

SDK 자체를 그대로 snapshot하는 대신, 공통 sanitizer를 순수 함수로 만들고 fixture 중심으로 검증한다.

| fixture | 기대 결과 |
| --- | --- |
| `/profile?memberId=123&accessToken=secret` | `/profile`만 남는다. |
| API URL에 전화번호·이메일·토큰 query가 포함됨 | query와 hash가 제거된다. |
| 중첩 context에 `authorization`, `cookie`, `patientId`가 존재함 | 값이 `[Filtered]`로 치환된다. |
| 허용하지 않은 custom context·tag·fingerprint 필드가 존재함 | 전송 payload에서 제거된다. |
| console breadcrumb에 Axios 오류 객체가 포함됨 | breadcrumb를 버리거나 허용 필드만 남긴다. |
| transaction과 span URL에 식별자 query가 포함됨 | `beforeSendTransaction`과 `beforeSendSpan`을 거친 뒤 query가 남지 않는다. |
| 동적 404 `/member/12345/unknown` | 일반 404는 전송하지 않거나 고정 fingerprint로 정규화된다. |
| 의도적 abort와 실제 network failure | 의도적 abort만 제외되고 실제 장애는 남는다. |

추가로 custom transport 또는 테스트용 DSN을 이용한 얇은 통합 테스트 한 건으로 최종 event payload에 query, cookie, token이 없는지 확인한다.

## 적용 순서

1. `dataCollection` 누락 항목을 닫는다.
2. URL 정규화와 재귀 민감정보 마스킹 함수를 만들고 fixture 테스트를 추가한다.
3. `beforeBreadcrumb`, `beforeSend`, `beforeSendTransaction`, `beforeSendSpan`에 공통 sanitizer를 연결한다.
4. 수동 context에서 query와 `resMsg`를 제거한다.
5. 404와 `ignoreErrors` 정책을 축소한다.
6. 프로덕션 소스맵 smoke test와 Sentry alert를 확인한다.

## 운영 설정 체크리스트

코드만으로 확인할 수 없는 다음 설정도 self-hosted Sentry에서 점검한다.

- production 환경만 호출하는 Critical/New Issue/Regression 알림
- 프로젝트 키의 허용 도메인과 rate limit
- 서버 측 data scrubbing 규칙
- production과 staging 이벤트의 대시보드·알림 분리
- release와 commit 연결 여부
- 이벤트 보관 기간과 접근 권한

## 참고 자료

- [Sentry 10.70.0 `dataCollection` 기본값 해석](https://github.com/getsentry/sentry-javascript/blob/10.70.0/packages/core/src/utils/data-collection/resolveDataCollectionOptions.ts)
- [Sentry 10.70.0 Next.js 기본 Browser Tracing](https://github.com/getsentry/sentry-javascript/blob/10.70.0/packages/nextjs/src/client/index.ts)
- [Sentry 10.70.0 Browser Breadcrumbs 구현](https://github.com/getsentry/sentry-javascript/blob/10.70.0/packages/browser/src/integrations/breadcrumbs.ts)
- [Sentry JavaScript SDK 10.x → 11.x 마이그레이션 문서](https://github.com/getsentry/sentry-javascript/blob/develop/MIGRATION.md)
- [Sentry Next.js Source Map 문제 해결](https://docs.sentry.io/platforms/javascript/guides/nextjs/sourcemaps/troubleshooting_js/)
