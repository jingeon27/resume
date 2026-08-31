# SafeDoc 3개 저장소 코드 품질 감사

- **감사 기준**: `safedoc-react@develop` · `safedoc-usermall@develop` · `safedoc-global@main` (모두 origin 최신)
- **감사 일자**: 2026-08-06 ~ 08-07
- **범위**: 6개 감사 단위 / 약 196,800 LOC
- **방식**: 6개 단위 × 3개 렌즈 = 18개 정밀 감사 → 적대적 검증 → 교차 확인. 총 262건 지적 중 검증 통과분 수록.

> 검증 단계 3건(safedoc-cms / global-fe / global-be)이 실행 실패해, 해당 단위의 CRITICAL 9건은 파일을 직접 열어 수동 검증했습니다. 각 항목에 검증 방법을 명시했습니다.

---

## 총평

**의도는 성숙한데 강제 수단이 없는 코드베이스다.**

세 저장소 모두 FSD 레이어링, 자체 ESLint 경계 플러그인, 상세한 규약 문서(CLAUDE.md / AGENTS.md), 한국어 의도 주석 등 상위권 수준의 설계 의지를 보여준다. 그런데 그 규약을 CI가 검증하지 않는다. safedoc-react는 린트 게이트가 구조적으로 무력화돼 있고, 세 저장소 모두 PR에서 타입체크·테스트를 돌리지 않는다.

그 결과 "문서에 있고 코드에는 없는" 규칙이 누적됐고, 특히 인증·콜백·프록시 같은 경계 코드에서 심각한 보안 결함으로 터졌다. 신규 코드(global-fe, global-cms)일수록 눈에 띄게 좋고 오래된 코드(safedoc-cms)일수록 나쁜, 뚜렷한 시간 기울기가 있다.

---

## 종합 점수

| 감사 단위 | 아키텍처 | 결함·보안 | 타입·성능·테스트 | 검증후 | LOC | 등급 |
|---|---:|---:|---:|---:|---:|:--:|
| safedoc-cms | 55 | **37** | 52 | **46** | 56,640 | D |
| hospital-admin + global-cms | 58 | 46 | 57 | **58** | 35,406 | C |
| react 공용 패키지 | 54 | 41 | 54 | **44** | 13,586 | D |
| safedoc-usermall | 58 | **34** | 46 | **46** | 58,779 | D |
| global 프런트엔드 | 66 | 63 | 68 | **64** | 16,207 | C |
| global 백엔드 (Kotlin) | 63 | 52 | 62 | **56** | 16,230 | C |

| 저장소 | LOC 가중 점수 | 등급 |
|---|---:|:--:|
| safedoc-react | **50** | D |
| safedoc-usermall | **46** | D |
| safedoc-global | **60** | C |
| **전체** | **50 / 100** | **D** |

등급 기준: A 85+ / B 70+ / C 55+ / D 40+ / F 40 미만. 가중치는 LOC 비중.
모든 렌즈에서 "결함·보안"이 최저인 것이 이 점수의 주된 원인이다.

---

## 객관 지표 (명령어 직접 측정)

| | 파일 | LOC | 테스트 | 테스트비율 | `any` | ts-ignore | >300줄 |
|---|---:|---:|---:|---:|---:|---:|---:|
| react/safedoc-cms | 691 | 56,640 | 17 | **2.5%** | **135** | 3 | 22 |
| react/hospital-admin | 301 | 21,451 | 14 | 4.7% | 17 | 1 | 9 |
| react/global-cms | 202 | 13,955 | 43 | **21%** | 4 | 3 | 3 |
| react/packages | 286 | 13,586 | 26 | 9.1% | 5 | 0 | 1 |
| usermall | 1,225 | 58,779 | 37 | 3.0% | 44 | 5 | 3 |
| global/frontend | 295 | 16,207 | 51 | **17%** | **0** | 1 | 1 |
| global/backend | 195 | 16,230 | 49 | 25% | `!!` 14 | — | 8 |

`any` 161개 중 **135개가 safedoc-cms 한 곳**. 반대로 global/frontend는 16k LOC에 `any` 0개.
같은 조직 코드의 편차가 이 정도라는 것이 핵심 신호다.

---

## CRITICAL — 즉시 조치

### 1. AWS 액세스 키가 백엔드 저장소에 평문 커밋 (최우선)

`safedoc-global/backend/application/src/main/resources/application.yml:55-56`

`AKIA`로 시작하는 실제 IAM 액세스 키와 시크릿이 그대로 있다. 바로 위에 `# TODO: 배포 전 정적 키를 제거하고...` 주석이 달려 있으나 제거되지 않았다. 공통 프로필이라 prod 외 모든 환경에 적용된다.

**git 히스토리에 남아 있으므로 파일 수정만으로는 해결되지 않는다.**

1. 키 즉시 폐기·재발급
2. CloudTrail로 해당 키 사용 이력 확인
3. IAM Role 또는 시크릿 매니저로 전환
4. git 히스토리에서 제거

### 2. 인증 없는 오픈 프록시 (SSRF)

`safedoc-react/apps/safedoc-cms/src/app/api/asset/proxy/file/route.ts:12`

`searchParams.get('url')`을 검증 없이 `fetch(url)`에 넘긴다. origin 허용목록도, 프로토콜 검사도, 로그인 검사도 없고 CMS 앱에는 middleware도 없다.

**검증 근거**: 형제 라우트 `proxy/auth/route.ts:6-7`에는 `ALLOWED_ORIGINS` 검사와 `// SSRF·토큰 유출 방지` 주석이 있다. 팀이 위험을 인지하고 한쪽만 막았다. 클라우드 메타데이터 엔드포인트(`169.254.169.254`)와 내부망이 노출된다.

**수정**: 형제 라우트의 `ALLOWED_ORIGINS` 검사를 그대로 복사하면 된다.

### 3. 인증 불필요 반사형 XSS (소셜 로그인 콜백)

`safedoc-usermall/src/modules/app/response/auth/lib/create-social-login-callback.ts:146`

```js
window.opener.postMessage({ type: 'SOCIAL_CONNECT_CODE', code: '${code}', ... }, '*')
```

쿼리스트링의 `code`가 이스케이프 없이 `<script>` 안 문자열 리터럴에 보간된다. 진입 조건인 `state`가 `connecting_`으로 시작하기만 하면 되는데 이것도 쿼리 파라미터다. **링크 한 줄로 safedoc 오리진에서 임의 JS 실행**이 가능하다.

**수정**: `code`/`state` 이스케이프(JSON.stringify 경유) + `postMessage`의 targetOrigin을 `'*'`에서 명시적 origin으로 변경.

### 4. Authorization 헤더가 로그로 유출

`safedoc-usermall/src/modules/shared/model/error/error.helper.ts:233`

`headers: this.config.headers`로 axios 요청 헤더 전체를 로그 데이터에 담는다. `Authorization: Bearer ...`가 통째로 포함되며 요청 바디(`payload`)도 함께 전송된다.

수신처인 `src/app/api/logging/error/route.ts:91`은 인증·레이트리밋·크기 제한이 없는 공개 엔드포인트다. 액세스 토큰과 개인정보가 CloudWatch에 평문 적재된다.

### 5. `'use server'` 쿠키 액션 — httpOnly가 이름뿐이다

- `safedoc-react/packages/shared/utils/http/serverCookie.ts:7`
- `safedoc-usermall/src/modules/shared/server-utils/cookies/cookie.ts:8`

`getCookie(key)`가 **임의 키**의 쿠키 값을 반환하는 Server Action이다. `setCookie` / `deleteCookie`도 함께 노출된다.

**검증한 도달 경로**: `apps/safedoc-cms/src/modules/features/login/model/login.hook.tsx:52`가 클라이언트 모듈인데 `@safedoc/utils`에서 `setCookie`를 import한다. `cookie/cookie.ts`에는 `setCookie`가 없으므로 이는 `serverCookie.ts`로 해석된다 → 액션이 클라이언트 그래프에 포함되고 공개 액션 엔드포인트가 생성된다.

더 중요한 건 이게 우발적 유입이 아니라 **설계상 상시 호출**이라는 점이다. `packages/shared/utils/http/axiosInstance.ts:57`이 **매 요청 인터셉터에서** `getCookie('accessToken')`으로 토큰을 꺼내 Authorization 헤더를 만들고, 같은 파일 `:104`는 재발급을 위해 `refreshToken`까지 읽어 요청 바디에 담는다.

즉 두 토큰 모두 브라우저 JS를 통과한다. 쿠키에 걸어둔 `httpOnly: true`(`packages/shared/utils/cookie/cookie.ts:19`)는 **표시만 남고 방어 효과가 없다.** 오히려 코드를 읽는 사람에게 "토큰은 JS에서 못 읽는다"는 잘못된 확신을 주고, 그 대가로 임의 키 쿠키 RPC라는 공개 엔드포인트가 하나 늘었다.

위 3번 XSS와 결합하면 accessToken뿐 아니라 **refreshToken까지 반출**되어, 피해자가 탭을 닫은 뒤에도 재발급으로 세션이 유지되는 완전한 계정 탈취 체인이 된다. 3번을 먼저 막아야 하는 이유다.

**수정 (범위를 좁힌 안)** — 토큰 저장 구조를 전면 개편하지 않고 refreshToken만 클라이언트에서 걷어낸다:

1. `POST /api/auth/refresh` route handler 신설 — 쿠키에서 refreshToken을 읽어 백엔드를 호출하고, 새 토큰 두 개를 **서버에서** `Set-Cookie`로 심는다
2. `axiosInstance.ts:104-115`의 재발급 블록을 `fetch('/api/auth/refresh', { method: 'POST' })`로 교체 — 바디 없음, 응답에서 accessToken만 받아 대기 큐에 넘긴다. `refreshSubscribers` 큐잉 로직은 그대로 둔다
3. 로그인도 route handler로 옮기고, `serverCookie.ts`의 임의 키 시그니처를 무인자 `getAccessToken()` 하나로 교체

이러면 refreshToken은 브라우저 JS에 노출되지 않는다. accessToken은 여전히 JS를 통과하지만 수명이 짧고, 애초에 XSS 상황에서 이만큼은 httpOnly로도 막지 못한다 — 공격자가 피해자 브라우저에서 그대로 인증된 요청을 보내면 되므로, httpOnly가 막는 것은 세션 *오남용*이 아니라 *반출*뿐이다. 변경 범위가 인터셉터 한 블록과 로그인 훅으로 국한되는 것이 이 안의 요점이다.

accessToken까지 JS에서 걷어내려면 동일 오리진 프록시(BFF)로 가야 하는데, `createInstance`를 공유하는 네 앱의 인증 경계를 한꺼번에 건드리게 되므로 중기 과제로 분리한다.

### 6. MSW mock 백엔드가 프로덕션 번들에 포함

`safedoc-global/frontend/src/features/reservation/index.ts:9`

배럴이 `reservationHandlers`, `resetReservationDb`를 Public API로 재수출한다. 주석은 "tree-shake 된다"고 단언하지만 실제로는 아니다.

**검증 근거**: `.next/BUILD_ID`가 있는 프로덕션 빌드에서, 한국어 홈 프리렌더 HTML(`.next/server/app/ko.html`)이 로드하는 청크 목록과 mock 코드(`seedReservations`)를 포함한 청크의 교집합이 `chunks/2-aedakct9dtw.js`(92KB)로 확인됐다. `setupWorker`(msw 런타임)가 들어간 청크도 별도로 존재한다.

원인: `package.json`에 `sideEffects` 필드가 없어 번들러가 부작용 없음을 가정할 수 없고, `reservation.db.ts` 톱레벨에 `mockNumericId()` 호출이 있다.

**수정**: 배럴에서 mocks 재수출 제거 + `sideEffects` 필드 선언. (로컬 `.next` 산출물 기준이므로 `next build` 재실행으로 한 번 더 확인 권장)

### 7. 공개 쓰기 엔드포인트에 봇 차단·레이트리밋 없음

`safedoc-global/backend/.../contact/api/ContactControllers.kt:18-22`

`@PublicApi`로 열린 POST 3종(`/v1/inquiries`, `/v1/newsletter-subscriptions`, `/v1/reservations`)이 각각 DB INSERT + SES 메일 발송으로 이어진다.

프런트의 `Turnstile.tsx:15`는 **소스 주석이 스스로 밝히듯** 토큰을 서버로 보내지 않는 클라이언트 게이트다. curl로 무제한 호출 가능하고, SES 발송량이 직접 과금·평판 손상으로 이어진다.

### 하향 조정한 건

**`NEXT_PUBLIC_AWS_CLOUDWATCH_SECRET_ACCESS_KEY`** — 감사자 3명이 CRITICAL로 올렸으나 **HIGH로 조정**.

`packages/shared/utils/env/env.ts:26`에 선언된 것은 사실이나, 사용처를 전수 조사한 결과 `app/api/logging/error/route.ts` 등 **서버 라우트 핸들러뿐**이라 현재 클라이언트 번들에 인라인되고 있다는 증거가 없다.

다만 클라이언트 모듈이 한 번만 import하면 즉시 유출되는 구조이고, `NEXT_PUBLIC_` 접두사가 "공개해도 되는 값"이라고 잘못 신호하므로 접두사 제거는 필수다. usermall도 `src/modules/shared/util/env.ts:10`에 동일 문제가 있다.

---

## 구조적 부채 (반복 패턴)

### 1. CI가 아무것도 막지 못한다 — 가장 큰 근본 원인

`safedoc-react/packages/config/eslint-config/base.js:26`이 `eslint-plugin-only-warn`을 전역 로드해 **FSD 경계 규칙을 포함한 모든 error를 warning으로 강등**한다. `.github/workflows/lint-check.yml`의 `pnpm run lint || exit 1`은 항상 exit 0이다.

게다가 세 저장소 CI 어디에도 타입체크와 테스트가 없다. react의 공유 tsconfig는 `strict` + `noUncheckedIndexedAccess`로 오히려 엄격한데 아무도 검증하지 않으니 무의미하다. CI Node는 20인데 `engines`는 `>=24`다.

### 2. HTML/스크립트 문자열 조립이 인증 경계 전반에 퍼져 있다

usermall의 소셜 콜백 · 로그아웃(`src/app/api/logout/route.ts:11`, `referer` 보간) · KCP 콜백(`generate-callback-script.ts:19`)이 모두 템플릿 리터럴로 `<script>`를 만들고 외부 입력을 이스케이프 없이 넣는다. 3중 복제라 이스케이프 정책도 서로 다르다.

개별 수정이 아니라 **콜백 응답 생성기를 단일 안전 함수로 통합**해야 재발이 멈춘다.

### 3. 에러 처리 전략이 없다

- `packages/shared/hooks/src/useHttpError.ts:20` — 네트워크 에러·타임아웃 시 사용자에게 아무것도 표시하지 않음
- `usermall/src/proxy.ts:58` — `fetchMemberInfo` 실패를 강제 로그아웃으로 삼킴. 백엔드 일시 장애가 곧 대량 로그아웃
- global-cms — `throwOnError:false` + ErrorBoundary 0개라 조회 실패가 전부 조용히 삼켜짐 (레포 에러 정책 문서와 정반대)

### 4. 크리티컬 경로에 테스트가 없다

인증·결제·예약 콜백 유닛 테스트 0건.

- `GifticonBuyBottomSheet.tsx:140` — mutation pending 미반영으로 **이중 결제** 가능
- `packages/features/src/reservation/ui/consent/ConsentFormView.tsx:24` — 고객 동의서 PDF를 실제 동의 여부와 무관하게 항상 '체크됨'으로 렌더. 의료 도메인에서 법적 리스크

### 5. 성능: Server Action 왕복과 워터폴

- `usermall/src/modules/shared/api/axios.instance.ts:38` — 모든 클라이언트 API 요청 앞에 Server Action 왕복 1회 → 병렬 쿼리 직렬화
- `ReservationPageTemplate.tsx:166` — 4중 쿼리 워터폴 동안 빈 화면
- `usermall/src/proxy.ts:40` — 전 경로·프리페치 포함 매 요청 `fetchMemberInfo()` 호출

---

## 추상화·설계 관점

아키텍처 렌즈 86건을 관통하는 실패 유형은 하나다.

### 핵심 진단: 추상화는 만들어지는데 채택되지 않는다

설계 역량 자체는 상위권이다. 문제는 만든 추상화가 쓰이지 않고 방치된다는 것.

| 만든 것 | 실제 |
|---|---|
| `@safedoc/ui`의 검색 필터 API | 두 앱이 모두 버리고 **905줄을 각자 재구현** |
| 백엔드 `MemberDataAccessPolicy` (architecture.md의 데이터 접근 정책) | 프로덕션 코드에서 **호출 0회** |
| i18n 인프라 (MessageResolver + messages 번들 5개) | 샘플 키 1개짜리 죽은 코드, 실제 문구는 **275줄 Kotlin에 하드코딩** |
| 슬라이스 Public API 배럴 | cms는 전부 deep import, usermall은 **배럴 우회 456건** |
| `framework-data`의 공통 Clock 빈 | 우회해서 **시간 소스 3종**으로 분기 |

추상화를 설계할 줄 아는데 **채택을 유도하거나 강제하는 장치가 없어서**, 만든 사람만 쓰고 다음 사람은 다시 만든다. 이것이 아래 모든 문제의 상위 원인이다.

### 1. 경계는 그렸는데 의존 방향이 무너졌다

레이어 이름은 있는데 "각 레이어가 무엇을 알아도 되는가"에 대한 합의가 없다.

- `packages/entities`가 **앱 레이어 소유의 queryKey 문자열을 하드코딩**해 캐시를 무효화 — 하위가 상위에 역결합
- 백엔드 **persistence 계층이 api 계층 DTO를 직접 의존** — 레이어 역전이 3개 도메인 리포지토리 *인터페이스 시그니처*에 박힘 (구현이 아니라 계약에 박혔다는 게 더 나쁘다)
- global-fe의 features가 `_pages` 스코프 i18n 네임스페이스에 의존 — ESLint 경로 존이 못 보는 상향 결합
- `shared`에 도메인 지식 유입: 계약 상태 전이표(cms), `location-store` 270줄(usermall)

### 2. 배럴(index.ts)이 경계 장치가 아니라 증폭기로 작동한다

FSD의 Public API 규칙이 배럴을 요구하는데, 순환과 번들 비용에 대한 방어가 없어 역효과가 났다.

- **순환 참조**: cms 3쌍, packages/entities 1쌍, usermall 자기배럴 재import 48파일 + 슬라이스간 3쌍, PA 4곳
  - usermall은 **자체 문서에 사고 사례로 기록해둔 그 패턴이 그대로 재발**했다 (`HOSPITAL_ORDER_TYPE` 동일 심볼)
- `export *` 체인 + `sideEffects` 미선언 → 앱이 루트 배럴을 177회 import하며 `notion-client`까지 동반 로드
- 같은 원인으로 MSW mock이 프로덕션 번들에, `ui-strings.json` 73KB 전량이 모든 클라이언트 번들에

배럴로 캡슐화하려던 의도가 오히려 모듈 그래프를 뭉개고 있다. deep import 456건은 "규칙 위반"이라기보다 **배럴이 실용적으로 못 쓸 물건이 됐다는 신호**로 읽는 게 맞다.

### 3. 중복이 이미 드리프트로 전환됐다

중복 자체보다, 갈라진 값이 이미 버그라는 게 문제다.

- 정산 타입 **792줄이 PA↔CMS 통째 중복 + 이미 드리프트 발생**
- global-fe의 **환율 상수가 1450 / 1350 두 값** — 금액대 필터 판정과 카드에 찍히는 달러가 서로 다른 환율을 씀
- 성별 라벨 매핑이 예약 폼/상세에 복붙되어 **한쪽만 타입 보호** → 서버 enum 추가 시 조용히 선택지에서 누락
- `RecommendHospitalSetting` / `RecommendTreatmentSetting` 233줄 컴포넌트 + 91줄 훅 통째 복붙
- URL 상태 쓰기 로직이 cms 21개 파일에 시그니처 5종으로 재구현
- global-fe는 **스스로 정한 rule of three의 2배인 5곳**에 URL-as-state 복제
- 백엔드 `required()` 3회, `requireUnique()` 3회, `hash()` 2회

### 4. 책임 분해 실패 (God 객체)

- `MainBannersSetting` **846줄** — 죽은 컬럼 정의가 동작까지 다름
- `useSettlementDetailColumns` **413줄 훅** — 컬럼 정의 + 뮤테이션 2종 분기 + 모달 오픈 + URL 조작을 한 함수에, 테스트 0건
- `ReservationService` **415줄, 의존성 16개** (리포지토리 6개 직접 보유)

특히 **훅에 모든 걸 밀어넣는 패턴**이 반복된다. 컴포넌트를 얇게 만들려다 훅이 God 객체가 된 형태로, 컴포넌트가 두꺼운 것보다 테스트하기 더 어렵다.

### 5. 유일하게 작동한 경계

**백엔드 `framework-*` Gradle 멀티모듈 분리.** 모듈 간 의존을 빌드 도구가 강제하니 지켜졌다. 반면 같은 저장소에서 **application 모듈 내부 도메인 패키지 간에는 순환 의존**이 생겼다 — Gradle이 안 보는 영역이라서.

이것이 결론이다. 같은 팀, 같은 저장소인데 **컴파일러/빌드가 강제하는 경계만 살아남았고, 문서·배럴·린트로 표현된 경계는 전부 무너졌다.**

그래서 설계 개선의 우선순위는 "더 나은 구조를 그리는 것"이 아니라 **이미 그린 구조 중 하나를 골라 기계가 검사하게 만드는 것**이다. `only-warn` 제거 + `--max-warnings=0`이 새 아키텍처 도입보다 설계 품질에 훨씬 크게 기여한다.

---

## 잘 되어 있는 점

- **global/frontend가 모범 사례다** — 16k LOC에 `any` 0개, 테스트 비율 17%, 300줄 초과 파일 1개. 같은 팀이 이 수준을 낼 수 있다는 증거이므로 나머지 저장소의 목표치로 쓸 수 있다.
- **의도 주석 문화가 뛰어나다.** "antd는 어떤 필드든 undefined로 clear할 수 있으므로", "SSRF·토큰 유출 방지" 같이 *왜*를 남기는 주석이 일관되게 있다. mock 이슈처럼 주석이 틀린 경우도 있지만, 검증 가능한 주장을 남긴다는 점 자체가 자산이다.
- **적대적 검증에서 5건이 반증됐다.** "entities 배럴 순환 참조", "정산 타입 13종 중복" 등은 실제로 방어되어 있거나 의도된 설계였다. 겉보기보다 실제 구조가 나은 부분이 있다.
- **백엔드 framework-\* 모듈 분리**와 25% 테스트 비율은 견고하다. 인가 정책 검증 테스트(`ControllerAuthorizationPolicyValidatorTests`)를 갖춘 건 드문 수준.
- global-cms(테스트 21%, `any` 4개)와 usermall의 자체 FSD 경계 린트 플러그인은 방향이 옳다.

---

## 개선 로드맵

### 즉시 (1주) — 보안 사고 차단

| 항목 | 효과 | 난이도 |
|---|---|:--:|
| AWS 키 폐기·재발급 + CloudTrail 확인 | 치명 | 하 |
| `proxy/file` 라우트에 형제 라우트의 `ALLOWED_ORIGINS` 복사 | 치명 | 하 |
| 소셜 콜백 `code`/`state` 이스케이프 + `postMessage` origin 지정 | 치명 | 하 |
| 로깅에서 `Authorization` 헤더·payload 마스킹 | 높음 | 하 |
| `base.js`에서 `eslint-plugin-only-warn` 제거 | 높음 | 하 (경고 폭증 감수) |

### 단기 (1개월) — 재발 방지

| 항목 | 효과 | 난이도 |
|---|---|:--:|
| CI에 typecheck + test 잡 추가 (3개 저장소) | 높음 | 중 |
| refreshToken 재발급을 `/api/auth/refresh` route handler로 이관 + 임의 키 쿠키 액션 폐기 | 높음 | 중 |
| 콜백 스크립트 생성기 단일화 (3중 복제 제거) | 높음 | 중 |
| `NEXT_PUBLIC_` 시크릿 접두사 제거 | 중 | 하 |
| Turnstile 서버 siteverify + 공개 엔드포인트 레이트리밋 | 중 | 중 |
| mock 배럴 재수출 제거 + `sideEffects` 필드 추가 | 중 | 하 |

### 중기 (분기) — 구조 개선

- safedoc-cms의 `any` 135개 단계적 제거 (앱 단위 목표치 설정)
- 인증·결제·예약 경로 유닛 테스트 도입 — global-cms의 21%를 벤치마크로
- 에러 처리 정책 단일화 (`useHttpError` 재설계)
- 동일 오리진 프록시(BFF) 전환 — accessToken까지 JS에서 제거하고 axios의 Server Action 왕복 해소 (네 앱 인증 경계 동시 변경이라 단독 과제로 분리)
- 예약 화면 워터폴 해소
- 배럴 전략 재정립: 순환 차단 린트 + `sideEffects` 선언 + deep import 허용 여부 결정
- 패키지 매니저 3종 · React 18/19 · Next 14/16 파편화 정리 로드맵

---

## 감사 범위 한계

- 워크플로우 실패로 **횡단 점검(저장소 간 중복 구현 조사)이 실행되지 않았다.** API 클라이언트, 인증 로직, 포맷터의 저장소 간 중복 여부는 미조사.
- MSW 번들 증거는 로컬 `.next` 산출물 기준. `next build` 재실행으로 재확인 권장.
- MEDIUM 117건 · LOW 14건은 개별 나열 대신 패턴으로 묶어 수록.
