# blog/revised 수정본 리뷰 보고서

> 2026-08-19 · 멀티에이전트 리뷰로 작성
> 리뷰 방식: 20편을 2편씩 10개 그룹으로 나눠 정밀 리뷰(기술 정확성 · 구조/가독성 · 익명화 · 톤/문체 · 한계 구분 · 맞춤법) + README 포함 시리즈 전체 교차 일관성 리뷰 + high 심각도 지적은 회의적 검증자가 재검증.
> 결과: 글별 지적 **139건** (high 지적 3건 재검증 → 2건 확정, 1건 기각·제외) + 시리즈 교차 지적 **10건**.

## 총평

개별 글 단위의 수정 품질은 높다. 완료된 구현과 남은 부채의 구분, 수치의 정확한 범위 표기, 라이브러리 동작에 대한 절제된 서술은 11·15·19·21·25번을 중심으로 일관되게 지켜졌다. 그러나 시리즈 전체를 가로지르는 정합성은 아직 관리되지 않고 있다. 같은 공용 폼 훅이 두 가명(useSchemaForm/useZodForm)으로 등장하고, 같은 장애가 19번과 28번에 중복 서술되며, 18번이 부채로 명시한 것을 26번이 완료로 서술하는 모순이 있다. 익명화도 글 단위로만 적용돼 hospitalId·hospital_filter·accessToken 같은 식별자와 서비스 호칭(쇼핑몰/사용자 웹, CMS/내부 운영 백오피스)이 글마다 달라, 여러 글을 조합하면 익명화한 회사·서비스를 특정할 수 있는 조각이 남는다. 발행 전에 가명 대응표·용어집·문체 규칙을 README에 두고 전 편을 한 번에 교차 점검하는 단계가 필요하다.

## 우선 조치 (발행 전 반드시)

재검증에서 확정된 high 지적과 시리즈 교차 high 지적을 모았다.

1. **[post-25-test-suite-rebuild.md · 익명화]** ✅ 재검증 확정 — `hospitalId`는 백엔드 DTO에서 온 내부 식별자로 서비스가 병원 도메인임을 드러내고, 한국어·영어·아랍어라는 로케일 조합까지 더해지면 어떤 서비스인지 상당히 좁혀진다. 시리즈 목표 (1) 내부 코드 식별자 익명화에 어긋난다.
   - 위치: MSW 스니펫의 `hospitalId: z.number().int().positive()`와 `locale: z.enum(['ko', 'en', 'ar'])`
   - 수정: `hospitalId`를 `partnerId`나 `storeId` 같은 중립 식별자로 바꾸고, 로케일 enum은 `['ko', 'en']` 정도로 일반화한다. 예제의 논지(서버 계약을 Mock에 옮긴다)는 필드명이 바뀌어도 그대로 성립한다.
2. **[post-28-next-server-to-client.md · 맞춤법·표기]** ✅ 재검증 확정 — 첫 섹션 첫 문장에 '안 된되는'이라는 오타가 있습니다. 도입 직후라 글 전체의 신뢰도에 바로 영향을 줍니다.
   - 위치: "stage 환경에서 관리자 목록 화면 검색이 안 된되는 이슈가 있었습니다."
   - 수정: "검색이 안 되는 이슈가 있었습니다"로 수정하세요.
3. **[시리즈 교차 · 내용 모순 (완료/부채 구분)]** — post-18은 `createTypedForm`이 `name` 경로만 좁히고 `getFieldValue` 반환 타입은 여전히 antd의 넓은 타입이라며 반환값 재타이핑을 '후속 과제'로 명시했는데, post-26은 `form.getFieldValue('programName'); // string`, `form.getFieldValue('progamName'); // compile error`로 반환 타입 좁힘과 인자 오타 검출이 이미 구현된 것처럼 서술한다. 같은 팩토리에 대해 한 글은 부채, 다른 글은 완료로 적어 시리즈 목표 (2)·(3)에 정면으로 어긋난다.
   - 해당 글: post-18-program-form.md, post-26-declarative-code.md
   - 수정: post-26의 예시를 `name` 경로 좁힘(Item/List/useWatch)까지만 보여주도록 수정하고, `getFieldValue` 반환 타입은 post-18과 동일하게 남은 과제로 표기하거나 post-18로 상호 링크를 걸어 상세 설명을 한 곳에만 둔다.
4. **[시리즈 교차 · 가명 일관성]** — 동일한 공용 폼 훅(zodResolver 연결 + Cache Components의 <Activity> 숨김 시 cleanup에서 reset)이 post-11과 post-15에서는 가명 `useSchemaForm`으로, post-28에서는 `useZodForm`으로 등장한다. post-11의 '공용 폼 훅은 화면이 숨겨질 때 정리 함수에서 reset을 호출한다'는 문단과 post-28의 '프레임워크가 상태를 대신 남겨줘서 폼이 비워지지 않았다' 섹션은 같은 코드를 두 이름으로 중복 설명하고 있어, 독자가 서로 다른 훅으로 오해하거나 반대로 가명 체계가 무너졌음을 눈치챌 수 있다.
   - 해당 글: post-11-reservation-form.md, post-15-review-form.md, post-28-next-server-to-client.md
   - 수정: 가명을 하나로 통일하고(예: `useSchemaForm`), reset 메커니즘의 상세 설명은 post-28에만 남긴 뒤 post-11에서는 한 문장 요약과 링크로 대체한다.
5. **[시리즈 교차 · 내용 중복 + 익명화 붕괴]** — post-19의 '석 달 뒤, 같은 미들웨어에서 다른 문제가 드러났다' 섹션과 post-28의 '정작 고쳐진 버전으로는 올릴 수 없었다' 섹션이 같은 사건(16.3의 `crossorigin=""` 직렬화 변경 + matcher가 `_next/**` 청크를 잡아 다른 호스트로 리다이렉트 → CORS 실패 → 16.2.x 고정 + matcher 수정)을 중복 서술한다. post-19는 '미들웨어', post-28은 '프록시'로 다르게 부르고, post-19가 익명화한 정산 호스트 장애를 post-28이 버전·GitHub 이슈 번호·병원 관리자 앱 맥락과 함께 노출해 두 글을 조합하면 post-19의 가명(finance.example.net)이 어느 회사·서비스인지 특정 가능해진다.
   - 해당 글: post-19-cross-domain-token.md, post-28-next-server-to-client.md
   - 수정: 장애 서사는 한 글(post-28)에만 두고 post-19에서는 '이후 matcher 범위 문제로 별도 장애가 있었다' 수준의 요약과 링크로 축약한다. 남기는 쪽에서 미들웨어/프록시 용어를 통일하고, 이슈 번호·버전 같은 특정 가능 정보가 익명화된 글과 연결되지 않는지 재검토한다.
6. **[시리즈 교차 · 익명화 일관성 (내부 식별자)]** — 같은 '병원' 도메인 식별자의 익명화 수준이 글마다 다르다. post-21은 코드에서 `getAllLocationIds()`로 가명화했지만(본문에는 '병원'이 그대로 남아 코드와도 불일치), post-12는 query key 예시에 `hospitalId`, post-14는 `hospitalOptions`/`hospitalId`, post-25는 Mock 스키마에 `hospitalId`, post-26은 `hospital_filter`/`hospital_integrated` 키를 그대로 노출한다. 또 post-12는 `TReviewDTO`, `TGlobalListResponse`, `TGlobalResponse` 같은 내부 타입 명명 규칙을 가명 고지 없이 사용하고, post-19가 `sessionToken`/`renewalToken`으로 가명화한 토큰 이름을 post-20·28은 `accessToken`/`refreshToken`으로 노출해 익명화 정책이 시리즈 안에서 상충한다.
   - 해당 글: post-12-review-like-optimistic-update.md, post-14-next-seo-prefetch.md, post-21-sitemap-cache.md, post-25-test-suite-rebuild.md, post-26-declarative-code.md, post-19-cross-domain-token.md, post-20-chatbot-message-layer.md, post-28-next-server-to-client.md
   - 수정: 식별자별 익명화 대응표(예: hospital→location 또는 병원 유지 여부, 내부 T-prefix 타입의 가명화 여부, 토큰 쿠키 이름)를 하나 만들어 20편 전체에 일괄 적용하고, 가명을 쓴 글에는 post-11·15처럼 '공개용 가명' 고지를 동일 문구로 넣는다.

## 글별 요약

발행 준비도는 10점 만점. 상세 지적은 아래 [글별 상세 리뷰](#글별-상세-리뷰) 참고.

| 글 | 제목 | 준비도 | 지적 (h/m/l) | 한 줄 총평 |
| --- | --- | --- | --- | --- |
| 04 | Puppeteer에서 요청과 응답을 함께 기다릴 때 놓쳤던 것 | 7.5 | 7 (0/4/3) | 문제 정의(첫 버전의 다섯 가지 결함)가 구체적이고 최종 코드의 완성도도 높지만, 첫 스니펫과 불릿의 불일치, 해법의 핵심(리스너 등록 후 reload)에 대한 본문 설명 누락, 마무리 문단의 중복과 용어 표기 혼용이 남아 있다. |
| 05 | NestJS의 책임 분리를 참고해 Electron 크롤링 앱을 재구성한 과정 | 8 | 6 (0/3/3) | '테스트 가능한 구조와 테스트가 있는 구조는 다르다'는 한계 구분과 과장 없는 성과 서술이 시리즈 목표에 잘 부합하는 글이다. |
| 06 | TanStack Query v4에서 Query Key Factory로 조회 키를 정리한 이유 | 8 | 4 (0/2/2) | 실제 pain point에서 출발해 factory 도입의 판단 근거를 담담하게 풀어낸 완성도 높은 글로, `_def`·`_ctx` 등 라이브러리 동작 설명도 정확하다. |
| 07 | 타입을 복잡하게 만들지 않고 잘못된 상태만 막은 네 가지 경우 | 7.5 | 5 (0/2/3) | "무엇을 막는가"라는 일관된 관점으로 네 패턴을 묶은 절제된 글이며 타입 동작 설명 자체는 정확하다. |
| 08 | Next.js App Router에서 서버와 브라우저의 QueryClient를 나눈 이유 | 8 | 5 (0/2/3) | TanStack Query v5 공식 Advanced SSR 가이드와 일치하는 정확한 코드 위에 '서버는 요청별, 브라우저는 싱글턴'이라는 핵심 판단을 명료하게 얹은 글로, 발행에 근접한 완성도다. |
| 11 | 예약 폼의 작성 상태를 Zustand에서 React Hook Form으로 옮긴 과정 | 7 | 5 (0/3/2) | 상태 소유권 재배치라는 일관된 논리로 리팩터링을 설명하고 수치·한계를 정직하게 구분한 좋은 글이나, Next.js 라우트 캐싱 기능의 귀속과 몇몇 코드 스니펫의 RHF API 사용이 실제 동작과 어긋날 수 있어 검증 후 발행이 필요하다. |
| 12 | 리뷰 좋아요를 낙관적으로 갱신하며 여러 캐시를 함께 복구한 과정 | 8 | 7 (0/3/4) | TanStack Query v5의 실제 동작(자동 롤백 없음, getQueriesData의 범위, onSettled Promise 반환 시 pending 유지)을 정확하게 서술하고 동시성 문제를 범위 밖으로 명확히 구분한 완성도 높은 글이다. |
| 14 | Next.js App Router에서 prefetch를 기다려야 하는 경우 | 7 | 7 (0/2/5) | 실제 버그에서 출발해 `void prefetchQuery`를 이분법이 아닌 상황별 기준으로 정리한 좋은 글이지만, 도입부에 SEO 맥락이 없어 후반 sitemap 섹션이 편집 잔여물처럼 붕 떠 있고, 마지막 문단의 '넘길 수 있다'가 완료인지 남은 보강안인지 모호하다. |
| 15 | 3단계 리뷰 작성 폼의 역할을 RHF·Zod·퍼널로 다시 나눈 과정 | 8 | 7 (0/2/5) | `_def` 의존과 최종 전체 검증 부재를 서두부터 밝히는 정직한 프레이밍과 정확한 Zod 내부 동작 설명이 돋보이는, 발행에 가까운 글이다. |
| 18 | 38개 필드로 구성된 프로그램 폼을 타입과 변환 계층으로 나눈 과정 | 8 | 8 (0/2/6) | 복잡도를 없앤 게 아니라 타입·변환·동기화에 배치했다는 결론까지 판단 중심으로 잘 서술된 글이며, 재귀 경로 타입 코드도 깊이 제한(5단계)까지 실제 동작과 일치한다. |
| 19 | 정산 서비스를 별도 호스트로 분리하며 토큰 전달 방식을 바꾼 과정 | 7 | 8 (0/3/5) | URL → POST 본문 핸드오프의 판단 근거와 잔여 위험을 정직하게 구분한 완성도 높은 글이지만, 본문 중간의 후일담 단락과 후반부 matcher 장애 회고가 흐름을 끊고, 버전-동작 인과 주장 하나에 출처가 없다. |
| 20 | 서로 다른 두 SSE를 하나의 상담 화면에 연결한 과정 | 8 | 6 (0/3/3) | 제약 조건과 판단 근거 중심의 서술이 잘 잡혀 있고 익명화도 깔끔하다. |
| 21 | 동적 사이트맵에서 공개 API와 인증 API의 경계를 나눈 과정 | 8 | 6 (0/3/3) | 원인을 interceptor로 좁혀가는 전개와 해결·부채의 구분이 뛰어난 짧고 밀도 있는 글이나, 'use cache'의 버전·활성화 조건 언급이 없어 재현성이 떨어지고 도입부의 전제(요청마다 조회) 인과가 뒤늦게 밝혀진다. |
| 22 | 결제 내역에 쿠폰 결제를 추가하며 분기를 한곳으로 모은 과정 | 7 | 7 (0/3/4) | 서버 DTO를 단언하지 않은 판단, ts-pattern의 비완전성 인정, OCP 미달성 명시 등 판단과 한계 중심의 서술이 시리즈 목표에 잘 부합한다. |
| 23 | FSD 2.1의 pages-first를 멀티앱 모노레포에 적용한 기준 | 7.5 | 7 (0/3/4) | 질문 전환("feature인가 entity인가" → "page 밖으로 꺼낼 이유가 있는가")이라는 프레임이 글 전체를 일관되게 관통하고 익명화도 자연스러운, 완성도 높은 글이다. |
| 24 | 프로토타입을 실사용 서비스로 옮기며 작업 규칙을 먼저 만든 이유 | 7 | 9 (0/2/7) | 과한 규칙을 만들었다가 조건부 규칙으로 되돌린 실패 경험을 축으로 삼아 설득력이 있고, Suspense·hydration·mutation 관련 기술 설명도 정확하다. |
| 25 | 테스트를 전부 지운 뒤 다시 만든 기준 | 7 | 7 (1/2/4) | 삭제와 재작성이라는 긴장 구도로 시작해 계층별 보장 범위로 닫는 구성이 탄탄하고 한계 구분이 특히 모범적이다. |
| 26 | 선언적 코드는 변경을 작게 만든다 | 7 | 9 (0/3/6) | 각 패턴마다 "언제 쓰지 않는가"를 함께 제시하는 균형 잡힌 판단 서술이 강점이지만, 변환·실행 분리 예시에서 리팩터링 후 encodeURI가 사라지는 동작 불일치, 헤딩 없이 테스트 섹션에 붙어 있는 결론, 나열식 섹션 구성의 연결 고리 부족을 손보면 좋다. |
| 27 | 오류는 남기고 화면은 덜 잃게 만든 에러 처리 개편 | 8 | 9 (0/4/5) | 복구 단위 관점의 Error Boundary 재설계를 '무엇을 관측하고, 무엇을 기록하고, 어디까지 멈출 것인가'라는 판단 축으로 풀어낸 완성도 높은 글입니다. |
| 28 | Nextjs를 사용하면서 겪었던 이슈들 | 7 | 10 (1/4/5) | 라우터 캐시·프록시·서버 액션 세 이슈를 '서버에 맡기던 동작을 클라이언트로 옮긴 결정과 그 비용'이라는 축으로 묶고, 부채 회수 조건까지 명시한 밀도 높은 글입니다. |

## 시리즈 교차 지적

개별 글이 아니라 시리즈 전체를 가로지르는 문제들이다.

### 🔴 High · 내용 모순 (완료/부채 구분)

post-18은 `createTypedForm`이 `name` 경로만 좁히고 `getFieldValue` 반환 타입은 여전히 antd의 넓은 타입이라며 반환값 재타이핑을 '후속 과제'로 명시했는데, post-26은 `form.getFieldValue('programName'); // string`, `form.getFieldValue('progamName'); // compile error`로 반환 타입 좁힘과 인자 오타 검출이 이미 구현된 것처럼 서술한다. 같은 팩토리에 대해 한 글은 부채, 다른 글은 완료로 적어 시리즈 목표 (2)·(3)에 정면으로 어긋난다.

- **해당 글**: post-18-program-form.md, post-26-declarative-code.md
- **수정 제안**: post-26의 예시를 `name` 경로 좁힘(Item/List/useWatch)까지만 보여주도록 수정하고, `getFieldValue` 반환 타입은 post-18과 동일하게 남은 과제로 표기하거나 post-18로 상호 링크를 걸어 상세 설명을 한 곳에만 둔다.

### 🔴 High · 가명 일관성

동일한 공용 폼 훅(zodResolver 연결 + Cache Components의 <Activity> 숨김 시 cleanup에서 reset)이 post-11과 post-15에서는 가명 `useSchemaForm`으로, post-28에서는 `useZodForm`으로 등장한다. post-11의 '공용 폼 훅은 화면이 숨겨질 때 정리 함수에서 reset을 호출한다'는 문단과 post-28의 '프레임워크가 상태를 대신 남겨줘서 폼이 비워지지 않았다' 섹션은 같은 코드를 두 이름으로 중복 설명하고 있어, 독자가 서로 다른 훅으로 오해하거나 반대로 가명 체계가 무너졌음을 눈치챌 수 있다.

- **해당 글**: post-11-reservation-form.md, post-15-review-form.md, post-28-next-server-to-client.md
- **수정 제안**: 가명을 하나로 통일하고(예: `useSchemaForm`), reset 메커니즘의 상세 설명은 post-28에만 남긴 뒤 post-11에서는 한 문장 요약과 링크로 대체한다.

### 🔴 High · 내용 중복 + 익명화 붕괴

post-19의 '석 달 뒤, 같은 미들웨어에서 다른 문제가 드러났다' 섹션과 post-28의 '정작 고쳐진 버전으로는 올릴 수 없었다' 섹션이 같은 사건(16.3의 `crossorigin=""` 직렬화 변경 + matcher가 `_next/**` 청크를 잡아 다른 호스트로 리다이렉트 → CORS 실패 → 16.2.x 고정 + matcher 수정)을 중복 서술한다. post-19는 '미들웨어', post-28은 '프록시'로 다르게 부르고, post-19가 익명화한 정산 호스트 장애를 post-28이 버전·GitHub 이슈 번호·병원 관리자 앱 맥락과 함께 노출해 두 글을 조합하면 post-19의 가명(finance.example.net)이 어느 회사·서비스인지 특정 가능해진다.

- **해당 글**: post-19-cross-domain-token.md, post-28-next-server-to-client.md
- **수정 제안**: 장애 서사는 한 글(post-28)에만 두고 post-19에서는 '이후 matcher 범위 문제로 별도 장애가 있었다' 수준의 요약과 링크로 축약한다. 남기는 쪽에서 미들웨어/프록시 용어를 통일하고, 이슈 번호·버전 같은 특정 가능 정보가 익명화된 글과 연결되지 않는지 재검토한다.

### 🔴 High · 익명화 일관성 (내부 식별자)

같은 '병원' 도메인 식별자의 익명화 수준이 글마다 다르다. post-21은 코드에서 `getAllLocationIds()`로 가명화했지만(본문에는 '병원'이 그대로 남아 코드와도 불일치), post-12는 query key 예시에 `hospitalId`, post-14는 `hospitalOptions`/`hospitalId`, post-25는 Mock 스키마에 `hospitalId`, post-26은 `hospital_filter`/`hospital_integrated` 키를 그대로 노출한다. 또 post-12는 `TReviewDTO`, `TGlobalListResponse`, `TGlobalResponse` 같은 내부 타입 명명 규칙을 가명 고지 없이 사용하고, post-19가 `sessionToken`/`renewalToken`으로 가명화한 토큰 이름을 post-20·28은 `accessToken`/`refreshToken`으로 노출해 익명화 정책이 시리즈 안에서 상충한다.

- **해당 글**: post-12-review-like-optimistic-update.md, post-14-next-seo-prefetch.md, post-21-sitemap-cache.md, post-25-test-suite-rebuild.md, post-26-declarative-code.md, post-19-cross-domain-token.md, post-20-chatbot-message-layer.md, post-28-next-server-to-client.md
- **수정 제안**: 식별자별 익명화 대응표(예: hospital→location 또는 병원 유지 여부, 내부 T-prefix 타입의 가명화 여부, 토큰 쿠키 이름)를 하나 만들어 20편 전체에 일괄 적용하고, 가명을 쓴 글에는 post-11·15처럼 '공개용 가명' 고지를 동일 문구로 넣는다.

### 🟠 Medium · 가명 일관성 (서비스·앱 호칭)

같은 서비스·앱을 글마다 다르게 부른다. 소비자 서비스는 post-20에서 '쇼핑몰', post-28에서 '사용자 웹'으로, 관리자 계열은 post-18·23에서 'CMS'와 '병원 관리자', post-27에서 '병원 CRM'과 '내부 운영 백오피스', post-25에서 '관리자 모노레포'로 등장한다. 독자는 몇 개의 서비스가 있는지 파악하기 어렵고, 반대로 여러 글을 조합하면 병원 CRM + 복지몰 조합의 실제 회사를 특정하는 단서가 된다.

- **해당 글**: post-18-program-form.md, post-20-chatbot-message-layer.md, post-23-fsd-2-1.md, post-25-test-suite-rebuild.md, post-27-error-boundary.md, post-28-next-server-to-client.md
- **수정 제안**: 역할 기반 호칭을 시리즈 차원에서 고정한다(예: '사용자 커머스 웹', '병원 관리자 앱', '내부 운영 CMS' 세 가지로 통일). README에 호칭 표를 두고 각 글이 이를 따르는지 발행 전 점검한다.

### 🟠 Medium · 내용 중복

post-26이 다른 글의 핵심 사례를 거의 그대로 다시 설명한다. `createTypedForm` 팩토리는 post-18과, 설정 배열형 SearchFilter를 compound JSX로 바꾼 사례는 post-27과, '테스트에서는 반복을 남긴다' 절의 쿠폰 필터 테스트 코드(`renderSearchPage()` + `couponDiscount=true` 검증)는 post-25의 예제와 사실상 동일한 코드다. 원칙 모음 글의 성격상 일부 재인용은 가능하지만 현재는 링크 없이 전문이 반복돼, 어느 글이 원본인지 불분명하고 수정 시 두 곳을 함께 고쳐야 한다.

- **해당 글**: post-26-declarative-code.md, post-18-program-form.md, post-25-test-suite-rebuild.md, post-27-error-boundary.md
- **수정 제안**: post-26을 각 원칙의 요약 + 상세 글 링크 구조로 재편하고, 코드 전문은 원본 글(18·25·27)에만 남긴다. 유지하더라도 예제 코드는 원본과 동일하게 맞추고 출처 링크를 명시한다.

### 🟠 Medium · 내용 중복

post-08과 post-14가 App Router + TanStack Query의 prefetch 대기/스트리밍 판단을 상당 부분 중복 서술한다. `shouldDehydrateQuery`로 pending query를 dehydrate하는 동일한 설정 스니펫이 두 글에 모두 있고, 'await prefetchQuery vs pending dehydration + Suspense' 판단 기준도 post-08의 목록과 post-14의 표가 같은 내용이다.

- **해당 글**: post-08-next-tanstack-query.md, post-14-next-seo-prefetch.md
- **수정 제안**: post-08은 QueryClient 수명·Provider 구성에, post-14는 await/streaming 판단 사례에 집중하도록 역할을 나누고, pending dehydration 설정 코드는 한 글에만 두고 상호 링크한다.

### 🟠 Medium · 톤 편차 (문체)

post-04~26은 '~했다/~이다'의 평서체로 통일돼 있는데 post-27과 post-28만 '~습니다/~는데요/~거든요'의 대화형 경어체다. 연속으로 읽으면 다른 필자의 글처럼 느껴질 정도로 문체 단절이 크다.

- **해당 글**: post-27-error-boundary.md, post-28-next-server-to-client.md
- **수정 제안**: 시리즈 기본 문체를 평서체로 정하고 post-27·28을 맞추거나, 반대로 최근 글의 경어체를 표준으로 삼아 나머지를 순차 전환하는 방침을 README에 명시한다.

### 🟠 Medium · 용어 일관성

같은 개념의 한/영 표기가 글 안팎에서 혼용된다. post-12는 '낙관적 업데이트'·'Optimistic Update'·'optimistic update'·'낙관적 값'·'optimistic value'를 한 글에서 섞어 쓰고(README도 '낙관적 업데이트'), post-04는 '클로저'와 'closure'를, post-26('컴파운드')과 post-27('compound')은 같은 패턴을 다르게 표기한다. post-14는 'sitemap', post-21·28은 '사이트맵'으로 갈리고, post-28 제목의 'Nextjs'는 나머지 전부가 쓰는 'Next.js' 표기와 다르다.

- **해당 글**: post-04-puppeteer-closure.md, post-12-review-like-optimistic-update.md, post-14-next-seo-prefetch.md, post-21-sitemap-cache.md, post-26-declarative-code.md, post-27-error-boundary.md, post-28-next-server-to-client.md
- **수정 제안**: 용어집(낙관적 업데이트, 클로저, 컴파운드 패턴, 사이트맵, Next.js 등 대표 표기)을 README에 추가하고, 첫 등장에만 영문 병기(예: 낙관적 업데이트(optimistic update))하는 규칙으로 전 글을 정리한다.

### 🟡 Low · 형식 편차 (제목·부채 섹션)

제목은 대부분 '~한 과정/이유/기준'형 서술문인데 post-28만 'Nextjs를 사용하면서 겪었던 이슈들'로 나열형이라 시리즈 규칙에서 이탈한다. 또 시리즈 목표인 '남은 부채' 구분 섹션의 명칭·유무가 제각각이다: '바뀐 부분과 남아 있는 문제'(15), '아직 남은 경계'(20), '바꾸고 나서 남은 것'(22), '우회를 걷어낼 조건'(28), 별도 섹션 없이 본문에 산재(04·06·07·08·11·14·18·21·23·24·26).

- **해당 글**: post-04-puppeteer-closure.md, post-06-query-key-factory.md, post-07-typescript-patterns.md, post-08-next-tanstack-query.md, post-11-reservation-form.md, post-14-next-seo-prefetch.md, post-15-review-form.md, post-18-program-form.md, post-20-chatbot-message-layer.md, post-21-sitemap-cache.md, post-22-payment-coupon.md, post-23-fsd-2-1.md, post-24-prototype-rules.md, post-26-declarative-code.md, post-28-next-server-to-client.md
- **수정 제안**: post-28 제목을 서술문형으로 바꾸고(예: 'Next.js의 동작을 클라이언트로 옮기며 치른 비용'), '남은 부채'(또는 '남은 문제') 고정 섹션명을 정해 부채가 있는 글에는 동일 명칭의 말미 섹션으로 모은다.

### 발행 순서(README 5단계)에 대한 의견

위험 기반 우선순위(실구현과 다른 완료형 서술 교정 + 실명 노출 제거를 1순위)는 타당하고, 5번을 1단계에 포함한 근거도 명확하다. 다만 세 가지 문제가 있다. 첫째, 26·27·28번이 발행 순서 5단계 어디에도 배정되지 않아 파일 목록 20편과 순서 계획 17편이 불일치한다. 특히 28번은 19번과 같은 장애를 중복 서술하므로 19번을 1단계에서 교체하기 전에 28번과의 중복·익명화 충돌을 먼저 정리하지 않으면, 1단계에서 익명화한 내용이 이후 28번 발행으로 다시 특정 가능해진다. 둘째, 3단계의 근거가 1단계와 동일한 문장("기술 정확성과 직접 맞닿아 있다")의 반복이라 단계 구분 기준이 불명확한데, 12번은 공개본에 라이브러리 동작에 대한 잘못된 설명(자동 롤백)이 남아 있는 글이므로 정확성 기준으로는 1~2단계로 앞당길 근거가 충분하다. 셋째, 18번과 26번 사이의 `createTypedForm` 반환 타입 서술 모순처럼 글 간 정합성 이슈가 해소되기 전에는 4단계 '대표 글' 공개가 오히려 모순을 노출할 수 있어, 상호 참조·중복 정리를 각 단계의 선행 조건으로 명시하는 편이 좋다.

## 글별 상세 리뷰

### 04. Puppeteer에서 요청과 응답을 함께 기다릴 때 놓쳤던 것

`post-04-puppeteer-closure.md` · 발행 준비도 **7.5/10**

문제 정의(첫 버전의 다섯 가지 결함)가 구체적이고 최종 코드의 완성도도 높지만, 첫 스니펫과 불릿의 불일치, 해법의 핵심(리스너 등록 후 reload)에 대한 본문 설명 누락, 마무리 문단의 중복과 용어 표기 혼용이 남아 있다. 익명화와 한계 구분은 잘 되어 있어 다듬기 수준의 수정이면 발행 가능하다.

**잘된 점**

- 첫 버전의 문제를 truthiness 함정(`0`, `false`, 빈 문자열)까지 포함해 불릿으로 구체적으로 나열한 문제 정의가 명확하다.
- `settled` 플래그와 단일 `cleanup` 경로로 성공·실패·타임아웃 모든 종료 경로에서 리스너를 제거하는 최종 코드가 실제로 견고하며, 본문 주장과 코드가 일치한다.
- "클로저 사용 사례라고 생각했는데 실제 문제는 listener의 수명이었다"는 프레이밍 전환이 글의 축을 잡아주고, 과장 없는 회고형 결론과도 맞물린다.
- `/target-api`, `/file-info` 등 일반화된 URL과 플랫폼 무언급으로 익명화가 자연스럽게 처리됐다.

**수정 지적**

- **🟠 Medium · 구조·가독성**
  - 위치: "request와 response callback이 같은 변수를 덮어쓸 수 있었다." (첫 스니펫 아래 불릿)
  - 문제: 첫 코드 스니펫에는 `page.on('request', ...)` 리스너만 있고 response 리스너가 없는데, 불릿은 request와 response callback이 같은 변수를 덮어쓴다고 지적한다. 도입부에서 "response에서는 파일 비밀번호가 나왔다"고 했으므로 원래 코드에는 response 리스너도 있었을 텐데 스니펫에서 생략되어, 독자가 코드와 불릿을 대조하면 어긋난다.
  - 제안: 첫 스니펫에 `page.on('response', (response) => { result = readResponse(response); });` 한 줄을 추가해 불릿과 코드를 일치시키거나, 불릿을 "실제 코드에서는 response listener도 같은 변수에 값을 썼다"처럼 스니펫에서 생략했음을 드러내는 문구로 바꾼다.
- **🟠 Medium · 구조·가독성**
  - 위치: "이 함수는 처음으로 유효한 결과를 반환한 callback에서 완료된다. 완료, 실패, timeout 어느 경로에서도 listener를 제거한다."
  - 문제: 첫 버전의 다섯 번째 문제("listener를 등록하기 전에 reload하면 빠른 이벤트를 놓칠 수 있었다")를 해결한 방식이 최종 코드 마지막 줄(`void page.reload(...)`를 리스너 등록 뒤에 호출)에 숨어 있는데, 본문 설명은 리스너 제거만 언급한다. 다섯 가지 문제를 제기해 놓고 그중 하나의 해법을 독자가 코드에서 스스로 찾아야 한다.
  - 제안: 해당 문단에 "reload를 함수 안으로 옮겨 리스너 등록이 항상 새로고침보다 먼저 일어나게 했다" 같은 한 문장을 추가해, 서두의 다섯 가지 문제가 각각 어디서 해결됐는지 대응이 완결되게 한다.
- **🟠 Medium · 기술 정확성**
  - 위치: "async onResponse(response: HTTPResponse) { ... filePassword = body.password; ... }" (collector 스니펫)
  - 문제: 응답 body에 `password` 필드가 없으면 `filePassword`가 undefined로 남아 아무 에러 없이 timeout까지 기다리게 되고, 반대로 `response.json()` 파싱이 실패하면(리다이렉트 응답 등) `consume`의 catch를 타고 전체 대기가 즉시 실패한다. 같은 "응답이 기대와 다른" 상황이 두 가지 상이한 실패 모드로 갈라지는데 본문에 언급이 없어, 코드를 가져다 쓰는 독자가 timeout 에러 메시지만 보고 원인을 찾기 어렵다.
  - 제안: collector 설명 뒤에 "password가 응답에 없으면 조용히 timeout으로 끝나므로, 실제 코드에서는 `if (body.password === undefined) throw new Error(...)`처럼 명시적으로 실패시키는 편이 원인 추적에 낫다" 같은 한두 문장을 덧붙이거나, 스니펫에 해당 방어 코드를 반영한다.
- **🟠 Medium · 맞춤법·표기**
  - 위치: "처음에는 이 문제를 closure 사용 사례라고 생각했다" / "## 클로저 안에서 두 결과 합치기" / "closure는 `headers`와..." / "클로저는 `headers`와..."
  - 문제: 글의 핵심 개념어인 closure/클로저, listener/리스너가 본문 안에서 영문 표기와 한글 표기로 혼용된다(30행 "closure", 107행 제목 "클로저", 150행 "closure는", 152행 "클로저는"; 24·28·105행 "listener", 152행 "리스너"). 제목급 개념어의 표기가 오가면 퇴고가 덜 된 인상을 준다.
  - 제안: 한국어 서술 문장에서는 '클로저', '리스너'로 통일하고, 코드 식별자·이벤트명(`page.on('request')` 등)만 영문으로 남긴다. request/response/callback/timeout 등 다른 외래어도 같은 기준으로 한 번 훑는다.
- **🟡 Low · 구조·가독성**
  - 위치: "클로저는 `headers`와 `filePassword`를 한 번의 수집 작업 안에 가두는 데 유용했다." (마지막 문단)
  - 문제: 마지막 두 문단(150행, 152행)이 '클로저가 두 값을 가둔다'는 같은 내용을 연달아 반복하고, 22행 "첫 버전은 외부 변수와 polling이었다"도 5행 "처음에는 외부 변수에 값을 넣고 1초마다 확인했다"의 반복이라 글이 같은 자리를 두 번 밟는 느낌을 준다.
  - 제안: 150행의 "closure는 ... 내보낸다" 문장을 삭제하고 152행의 회고 문단만 남기거나, 150행은 코드 동작 설명·152행은 회고로 역할이 겹치지 않게 152행에서 '가두는 데 유용했다' 부분을 덜어낸다. 22행 문장도 삭제하고 바로 불릿으로 진입한다.
- **🟡 Low · 톤·문체**
  - 위치: "파일 하나를 받으려면 두 군데를 엿봐야 했다" / "당장은 동작했지만 다시 실행할수록 이상해졌다"
  - 문제: "엿봐야 했다"는 구어적·연출형 표현이고, "이상해졌다"는 무엇이 어떻게 문제였는지 드러나지 않는 모호한 서술이다. 시리즈 목표인 '판단과 제약 중심 서술'에 비추면 조금 어긋난다.
  - 제안: "두 군데를 지켜봐야 했다" 또는 "두 이벤트를 모두 관찰해야 했다"로, "이상해졌다"는 "실행을 반복할수록 다음 문제들이 드러났다"처럼 뒤따르는 불릿을 예고하는 구체적 문장으로 바꾼다.
- **🟡 Low · 기술 정확성**
  - 위치: "let result: PreInfo | undefined;" (첫 스니펫)
  - 문제: `PreInfo` 타입, `readRequest`, `delay` 함수가 정의나 주석 없이 등장해 독자가 역할을 추측해야 한다. 이후 collector 스니펫의 `SitePreInfo`와 이름도 달라 같은 개념인지 헷갈릴 수 있다.
  - 제안: 스니펫 상단에 `// PreInfo: 요청 header와 파일 비밀번호 묶음, delay: 단순 sleep` 정도의 주석을 달거나, 타입명을 뒤에서 쓰는 `SitePreInfo`로 통일해 앞뒤 스니펫의 연결을 분명히 한다.

### 05. NestJS의 책임 분리를 참고해 Electron 크롤링 앱을 재구성한 과정

`post-05-electron-nestjs-inspired.md` · 발행 준비도 **8/10**

'테스트 가능한 구조와 테스트가 있는 구조는 다르다'는 한계 구분과 과장 없는 성과 서술이 시리즈 목표에 잘 부합하는 글이다. 다만 '대체 객체를 주입할 수 있다'는 주장이 전역 `CRAWLING_HANDLERS` 결합 때문에 절반만 맞고, 제목의 '과정'에 해당하는 마이그레이션·검증 서술이 빠져 있으며, 테스트 아쉬움이 연속 문단에서 중복 서술된다.

**잘된 점**

- "테스트 가능한 구조와 테스트가 있는 구조는 다르다"고 못 박고 수치 성과 대신 '변경 범위가 한쪽으로 좁아졌다'를 성과로 제시한 점이, 미구현을 완료처럼 쓰지 않는다는 시리즈 목표에 정확히 부합한다.
- 도입부에서 수집 데이터가 기업회원으로서 정당한 접근 권한이 있는 데이터임을 명시해, 크롤링 소재가 줄 수 있는 오해를 선제적으로 차단했다.
- platformA/B/C, `CRAWLING_HANDLERS` 등 익명화가 코드 예제까지 일관되게 적용되어 가명 처리가 눈에 띄지 않는다.
- 'IPC 변경 → Controller, 순서 변경 → Service, DOM 변경 → 플랫폼 구현'이라는 세 변경 축을 먼저 제시하고 이후 섹션이 그 축을 그대로 따라가는 구성이 논리적이다.

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "Puppeteer 의존성을 생성자 경계로 옮겨 대체 객체를 주입할 수 있는 구조가 됐다."
  - 문제: `CrawlingService.collect()`가 `CRAWLING_HANDLERS[this.platform]`를 모듈 전역에서 직접 조회하므로, 주입 가능한 것은 `PuppeteerService`뿐이고 로그인 함수·Processor는 여전히 정적으로 결합돼 있다. 이대로면 Service 단위 테스트에서 실제 플랫폼 로그인 코드가 로드되는데, '대체 객체를 주입할 수 있는 구조'라는 문장은 이 한계를 가린다.
  - 제안: 핸들러 설정도 생성자 인자로 받는 코드로 바꾸거나(`constructor(puppeteer, handler: CrawlingHandler)`), 그대로 두려면 해당 불릿을 "Puppeteer 의존성은 생성자 경계로 옮겼지만 플랫폼 핸들러 테이블은 정적 결합으로 남았다"처럼 범위를 좁혀 서술한다.
- **🟠 Medium · 구조·가독성**
  - 위치: 제목 "NestJS의 책임 분리를 참고해 Electron 크롤링 앱을 재구성한 과정"
  - 문제: 제목은 '재구성한 과정'인데 본문은 최종 구조 소개에 집중하고, 어떤 순서로 옮겼는지·자동화 테스트가 없는 상태에서 기존 동작이 깨지지 않았음을 어떻게 확인했는지에 대한 서술이 없다. 특히 테스트 부재를 스스로 밝힌 글이라 '그럼 리팩터링 검증은 어떻게 했나'라는 질문이 자연스럽게 남는다.
  - 제안: "플랫폼 하나를 먼저 새 구조로 옮기고 수집 결과를 기존 구현과 수동 대조했다"처럼 실제 이행 순서와 검증 방법을 한 문단 추가하거나, 그런 서술을 넣기 어려우면 제목을 "...재구성한 이유와 구조"로 조정해 기대치를 맞춘다.
- **🟠 Medium · 구조·가독성**
  - 위치: "당시에는 의존성을 교체할 수 있는 경계까지 만들었지만 자동화 테스트를 충분히 붙이지 못했다." / "당시 자동화 테스트를 충분히 붙이지 못한 점은 아쉽지만"
  - 문제: '자동화 테스트를 충분히 붙이지 못했다'는 같은 고백이 연속된 두 문단(129행, 131행)에서 거의 같은 문장으로 반복되어 마무리의 힘이 분산된다.
  - 제안: 마지막 문단에서는 반복을 빼고 "새 플랫폼을 추가할 때 기존 코드를 복사하지 않게 된 것만으로도 방향은 맞았다"는 결론만 남긴다. 테스트 이야기는 129행의 '테스트 가능한 구조 vs 테스트가 있는 구조' 문단 한 곳으로 모은다.
- **🟡 Low · 기술 정확성**
  - 위치: "추상 클래스는 플랫폼 구현이 지켜야 할 처리 단계를 컴파일 단계에서 확인한다."
  - 문제: TypeScript의 추상 클래스가 컴파일 시점에 강제하는 것은 각 메서드(구현해야 할 집합)의 존재이지 '처리 단계'가 아니다. 단계(호출 순서)는 `CrawlingService.collect()`가 런타임에 결정하므로, 현재 문장은 추상 클래스의 역할을 실제보다 넓게 읽히게 한다.
  - 제안: "추상 클래스는 플랫폼 구현이 갖춰야 할 메서드 집합을 컴파일 단계에서 강제하고, 그 메서드를 부르는 순서는 CrawlingService가 결정한다"로 역할을 나눠 서술한다.
- **🟡 Low · 기술 정확성**
  - 위치: "const page = await this.puppeteer.open(config.pages.recruit);" (CrawlingService.collect)
  - 문제: collect()에 에러 처리와 page 정리(close)가 없어, 예시 그대로면 중간 단계가 던질 때 열린 페이지가 남는다. 뼈대만 보여주려는 의도로 보이나 생략임을 알리는 표시가 없어, 정리 로직을 다룬 post-04와 나란히 읽으면 일관성이 어색하다.
  - 제안: `try { ... } finally { await page.close(); }`를 반영하거나, 스니펫에 `// 에러 처리와 page 정리는 생략` 주석 한 줄을 추가해 의도된 생략임을 명시한다.
- **🟡 Low · 구조·가독성**
  - 위치: "IPC 요청이 바뀌면 Controller만 수정한다." (섹션 '먼저 바꾸고 싶었던 것'의 불릿)
  - 문제: Controller·CrawlingService라는 이름이 정의되기 전에 기준 불릿에서 먼저 등장하고, Service 스니펫에서 쓰는 `CRAWLING_HANDLERS`도 다음 섹션에서야 정의된다. 순서 자체는 통상적인 전개지만 연결 문장이 없어 처음 읽는 독자는 용어를 잠시 공중에 띄워둬야 한다.
  - 제안: 불릿 앞에 "아래에서 각 역할을 하나씩 소개한다" 같은 예고 문장을 넣고, Service 스니펫 아래에 "`CRAWLING_HANDLERS`는 다음 섹션에서 정의한다" 한 줄을 추가해 전방 참조를 명시한다.

### 06. TanStack Query v4에서 Query Key Factory로 조회 키를 정리한 이유

`post-06-query-key-factory.md` · 발행 준비도 **8/10**

실제 pain point에서 출발해 factory 도입의 판단 근거를 담담하게 풀어낸 완성도 높은 글로, `_def`·`_ctx` 등 라이브러리 동작 설명도 정확하다. 다만 도입부 주석의 v5 차이 설명이 useMutation에만 한정되어 있어 본문의 positional `invalidateQueries` 호출과 함께 읽으면 오해 소지가 있다.

**잘된 점**

- "어떤 query를 invalidate해야 하는지 저장소 전체에서 문자열을 검색했다"는 구체적 경험으로 시작해 도입 동기가 설득력 있음
- `_def` 실행 결과를 주석으로 펼쳐 보여줘 key 계층과 무효화 범위가 코드만으로 눈에 들어옴
- 메서드 참조를 queryFn/mutationFn으로 넘길 때의 `this` 바인딩과 `QueryFunctionContext` 첫 인자 문제를 정확히 짚음 — 흔히 빠뜨리는 함정
- 마무리에서 성과를 줄 수 감소가 아니라 "같은 리소스의 key 모양이 한곳에서 결정되는가"로 정의한 판단 중심 서술이 시리즈 목표(연출 제거)에 잘 부합

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "TanStack Query v5의 `useMutation`은 object syntax만 지원하므로 마지막에 별도로 적었다." (도입부 blockquote)
  - 문제: v5에서는 useMutation뿐 아니라 useQuery, `queryClient.invalidateQueries` 등 대부분의 API가 positional 인자 overload를 제거하고 object syntax만 지원한다. 본문의 `queryClient.invalidateQueries(detail.queryKey)`, `invalidateQueries(candidateCollectionKeys.list._def)` 같은 positional 호출도 전부 v4 전용인데, 주석은 useMutation만 다른 것처럼 읽힌다. 또한 v5 비교 코드는 실제로는 마지막 섹션("적용 범위") 앞에 있어 "마지막에 별도로 적었다"도 부정확하다.
  - 제안: 주석을 "TanStack Query v5는 useMutation·invalidateQueries를 포함해 대부분의 API가 object syntax만 지원한다. 본문 코드는 모두 v4 기준이며, v5 예시는 mutation 섹션에서 나란히 적었다." 정도로 수정.
- **🟠 Medium · 구조·가독성**
  - 위치: "queryClient.invalidateQueries(detail.queryKey);" 코드 블록 (상세 화면의 하위 쿼리를 `contextQueries`로 묶기 섹션)
  - 문제: `detail.queryKey`를 무효화하면 기본 prefix(fuzzy) 매칭에 의해 `_ctx`의 memos·histories까지 함께 무효화된다는 점이 설명되지 않았다. 이 전파 동작이야말로 마무리 문단의 "상세 전체를 갱신할지, 메모 목록만 갱신할지가 코드에 드러났다"를 뒷받침하는 핵심인데, 독자는 두 invalidate 호출이 독립적이라고 오해할 수 있다.
  - 제안: 코드 블록 아래에 한 줄 추가: "`detail.queryKey`는 하위 contextQueries의 key를 prefix로 포함하므로, 상위를 무효화하면 memos·histories도 함께 무효화된다. 메모만 갱신하려면 `_ctx.memos.queryKey`를 쓴다."
- **🟡 Low · 한계 구분**
  - 위치: "적용 범위" 섹션의 규칙 목록 ("mutation까지 factory에 억지로 넣지 않는다" 등)
  - 문제: 현재형 규칙 서술이 이미 코드베이스에 적용을 마친 컨벤션인지, 적용하면서 앞으로 지키기로 정한 지침인지 구분되지 않는다. 시리즈 목표인 완료/미완료 구분 관점에서 완료형으로 읽힐 여지가 있다.
  - 제안: 목록 앞에 도입 문장을 추가해 상태를 명시: "적용하면서 팀 컨벤션으로 정리한 기준은 다음과 같다" 또는 일부가 미적용이라면 "아직 전 영역에 적용하지는 못했고, 기준만 먼저 정했다"처럼 구분.
- **🟡 Low · 맞춤법·표기**
  - 위치: "어떤 query를 invalidate해야 하는지" (도입부) vs "무효화해야 하는지"·"무효화 범위" (본문)
  - 문제: invalidate/무효화가 혼용되고, key 표기도 "조회 키"(제목)·"query key"·"키"가 섞여 있어 용어 일관성이 떨어진다.
  - 제안: 첫 등장에서 "무효화(invalidate)"로 병기한 뒤 이후 "무효화"로 통일하고, key는 본문 전체에서 "query key" 하나로 통일.

### 07. 타입을 복잡하게 만들지 않고 잘못된 상태만 막은 네 가지 경우

`post-07-typescript-patterns.md` · 발행 준비도 **7.5/10**

"무엇을 막는가"라는 일관된 관점으로 네 패턴을 묶은 절제된 글이며 타입 동작 설명 자체는 정확하다. 다만 `Field` 컴포넌트 선언 누락과 `exactOptionalPropertyTypes`의 효과를 보여주는 코드 부재로, 독자가 스니펫만으로 주장을 재현·검증하기 어려운 지점이 있다.

**잘된 점**

- 네 섹션이 모두 "호출부에서 실제로 틀릴 수 있는 지점만 막는다"는 하나의 기준으로 수렴해 글의 주장이 선명함
- "분기가 늘어나면 discriminant를 추가한다", "호출부가 읽기 쉬워지지 않으면 그 추상화는 제거한다" 등 패턴의 적용 한계까지 함께 적어 과잉 일반화를 피함
- 예시 도메인(라우트, 결제 수단, 폼 필드)이 중립적이라 익명화가 자연스럽고 어색한 가명이 없음

**수정 지적**

- **🟠 Medium · 구조·가독성**
  - 위치: "<Field label=\"읽기 전용\" />;" 사용 예시 블록 (함께 들어오면 안 되는 prop 조합을 막는다 섹션)
  - 문제: 타입 정의 스니펫에는 `Props<T>`까지만 있고 `Field` 컴포넌트의 선언이 어디에도 없어, 독자가 스니펫을 그대로 옮겨도 사용 예시의 오류 여부를 재현할 수 없다. 앞 섹션의 `Select`는 구현까지 보여준 것과 대비되어 완결성이 떨어진다.
  - 제안: union 정의 아래에 한 줄 추가: `declare function Field<T extends string>(props: Props<T>): JSX.Element;` 또는 `function Field<T extends string>(props: Props<T>) { ... }` 형태의 최소 시그니처를 명시.
- **🟠 Medium · 구조·가독성**
  - 위치: "`exactOptionalPropertyTypes`를 켜면 이 차이를 타입에도 남길 수 있다." (`undefined` 값과 키 생략을 구분한다 섹션)
  - 문제: 본문 예시 코드는 플래그를 켜든 끄든 동일하게 컴파일되기 때문에, 이 옵션이 실제로 무엇을 바꾸는지(optional 프로퍼티에 명시적 `undefined` 대입을 거부) 코드로 드러나지 않는다. 섹션의 결론 문장이 주장으로만 남는다.
  - 제안: 결론 문장 앞에 대비 예시 추가: `const v2: Example = { requiredKey: 1, optionalKey: undefined }; // exactOptionalPropertyTypes를 켜면 오류 — 키를 생략해야 한다`.
- **🟡 Low · 기술 정확성**
  - 위치: "변수에 `Record<RouteName, string>`을 직접 지정하면 값이 `string`으로 넓어질 수 있다. `satisfies`는 키 누락과 잘못된 경로를 검사하면서 리터럴 추론은 유지한다."
  - 문제: 두 가지 정밀도 문제가 있다. (1) 타입을 직접 지정하면 프로퍼티 접근 타입은 조건 없이 `string`이 되므로 "넓어질 수 있다"가 아니라 "넓어진다"가 정확하다. (2) `` `/${string}` ``이 검사하는 것은 슬래시로 시작하는지 여부뿐이므로 "잘못된 경로를 검사"는 과한 표현이다.
  - 제안: "직접 지정하면 프로퍼티 타입이 `string`으로 넓어진다. `satisfies`는 키 누락과 슬래시로 시작하지 않는 값을 걸러내면서 리터럴 추론은 유지한다."로 수정.
- **🟡 Low · 톤·문체**
  - 위치: 섹션 제목 "객체의 누락을 막되 값은 좁게 유지한다"
  - 문제: 막는 대상은 "객체의 누락"이 아니라 "키 누락"이고, "값은 좁게"도 값 자체가 아니라 값의 타입을 좁게 유지한다는 뜻이라 제목이 본문 내용과 어긋난다.
  - 제안: "키 누락은 막되 값 타입은 좁게 유지한다"로 수정.
- **🟡 Low · 맞춤법·표기**
  - 위치: "선택값과 변경 콜백을 각각 `string`으로 선언하면" vs "`value`와 callback의 인자가 어긋나지 않는다는 보장"
  - 문제: 같은 섹션 안에서 콜백/callback이 혼용되고, 글 전체에서 key/키도 섞여 쓰인다("모든 key", "키 누락", "key의 존재 여부", "키 자체를 생략").
  - 제안: 콜백은 한글 "콜백"으로, key는 "키"로(또는 각각 영문으로) 글 전체에서 한 가지 표기로 통일.

### 08. Next.js App Router에서 서버와 브라우저의 QueryClient를 나눈 이유

`post-08-next-tanstack-query.md` · 발행 준비도 **8/10**

TanStack Query v5 공식 Advanced SSR 가이드와 일치하는 정확한 코드 위에 '서버는 요청별, 브라우저는 싱글턴'이라는 핵심 판단을 명료하게 얹은 글로, 발행에 근접한 완성도다. staleTime 수치의 근거 설명과 useSuspenseQuery 예시의 Suspense 경계 관련 뉘앙스만 보강하면 된다.

**잘된 점**

- 도입부에서 '서버 요청끼리는 캐시 공유 금지 / 브라우저는 재생성 금지'라는 상반된 요구를 불릿 두 줄로 대비시켜 글 전체의 문제의식을 즉시 전달한다.
- 코드가 TanStack Query v5 공식 Advanced SSR 가이드 패턴과 정확히 일치하며(isServer, defaultShouldDehydrateQuery + pending 포함), 'children으로 전달된 Server Component는 Client Component로 바뀌지 않는다' 같은 흔한 오해도 정확하게 짚는다.
- queryOptions를 '조회 계약'이라 명명해 서버 prefetch와 클라이언트 구독의 query key 불일치 문제를 구조적으로 예방하는 관점을 제시한다.
- 마무리 섹션이 설정 복사가 아니라 '데이터가 초기 HTML에 있어야 하는가'라는 판단 기준을 제시해, 연출 없이 의사결정 중심으로 끝난다.

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: `staleTime: 60_000` (QueryClient 만들기 섹션 코드)
  - 문제: 60초라는 수치가 코드에만 있고 본문에 근거 설명이 없다. SSR 구성에서 staleTime을 0보다 크게 잡는 이유(hydration 직후 클라이언트가 같은 데이터를 즉시 refetch하는 것을 방지)는 이 글의 주제와 직결되는데 언급이 빠져 있어, 독자가 임의의 매직 넘버로 읽을 수 있다.
  - 제안: 코드 블록 아래에 한 문장 추가: "staleTime을 0보다 크게 잡은 이유는 서버가 넘긴 데이터를 클라이언트가 마운트 직후 곧바로 다시 조회하지 않게 하기 위해서다. 60초는 이 화면의 데이터 갱신 주기에 맞춘 값이다." 같은 식으로 수치의 근거를 명시한다.
- **🟠 Medium · 기술 정확성**
  - 위치: "클라이언트에서 같은 query를 구독하기" 섹션의 `useSuspenseQuery(integrationOptions)` 예시
  - 문제: HomePageView가 Suspense 경계 없이 useSuspenseQuery를 쓴다. awaited prefetch 덕에 첫 렌더는 안전하지만, gcTime 경과로 캐시가 비워진 뒤 클라이언트 내비게이션으로 재진입하면 suspend가 상위 경계까지 전파된다. 뒤의 기준 섹션에서는 'Suspense 경계 안에서 구독'을 조건으로 언급하므로 예시와 기준이 미세하게 어긋난다.
  - 제안: 예시 아래에 한 문장 보강: "awaited prefetch 덕에 첫 렌더에서는 suspend되지 않지만, 캐시가 비워진 뒤 클라이언트 내비게이션으로 진입하는 경우까지 고려하면 이 컴포넌트도 Suspense 경계 안에 두는 편이 안전하다."
- **🟡 Low · 구조·가독성**
  - 위치: "흔히 실수하는 `typeof window !== undefined`는 항상 참이다." 문단
  - 문제: 바로 위 코드는 typeof를 전혀 사용하지 않는데 typeof 실수 이야기가 여담처럼 끼어들어 흐름이 끊긴다. isServer를 선택한 이유 설명으로서는 유효하지만 배치와 연결이 어색하다.
  - 제안: 문단을 "환경 판별을 직접 작성하면 `typeof window === 'undefined'`처럼 문자열 비교를 정확히 해야 하고, `typeof window !== undefined`처럼 쓰면 항상 참이 되는 실수가 흔하다. 그래서 TanStack Query가 제공하는 isServer를 썼다" 순서로 재구성해, isServer 선택의 근거임이 먼저 드러나게 한다.
- **🟡 Low · 구조·가독성**
  - 위치: "서버에서 병렬로 prefetch하기" 섹션 — `categoryOptions` prefetch
  - 문제: categoryOptions를 prefetch하지만 이후 소비 예시(HomePageView)는 integrationOptions만 구독해서, 병렬 prefetch 예시로 등장한 categories가 어디에 쓰이는지 끝까지 나오지 않는다. 독자가 두 조회의 용도를 추적하다 끊긴다.
  - 제안: HomePageView 예시에서 두 옵션을 모두 구독하게 하거나, "categories는 별도 사이드바 컴포넌트가 같은 방식으로 구독한다" 같은 한 문장으로 소비처를 언급해 예시를 닫는다.
- **🟡 Low · 구조·가독성**
  - 위치: "서버에서 병렬로 prefetch하기" 코드 블록 (`import { dehydrate, HydrationBoundary } ...`)
  - 문제: 이 블록만 `getQueryClient`, `categoryOptions`, `integrationOptions`의 import가 빠져 있다. 다른 블록들은 import를 갖춰 보여주고 있어 일관성이 깨지고, 그대로 복사하면 동작하지 않는다.
  - 제안: `import { getQueryClient } from './query-client';`와 옵션 import 두 줄을 추가하거나, 글 전체적으로 '핵심 import만 표기한다'는 방침을 정해 모든 블록에 동일하게 적용한다.

### 11. 예약 폼의 작성 상태를 Zustand에서 React Hook Form으로 옮긴 과정

`post-11-reservation-form.md` · 발행 준비도 **7/10**

상태 소유권 재배치라는 일관된 논리로 리팩터링을 설명하고 수치·한계를 정직하게 구분한 좋은 글이나, Next.js 라우트 캐싱 기능의 귀속과 몇몇 코드 스니펫의 RHF API 사용이 실제 동작과 어긋날 수 있어 검증 후 발행이 필요하다.

**잘된 점**

- 도입부가 '가족 한 명을 추가했는데 날짜 선택은 이전 가족 수 기준으로 움직였다'는 구체적 버그로 시작해 문제를 즉시 체감시키고, 이후 전체 글이 '서버 값과 작성 중인 값의 주인 구분'이라는 하나의 축으로 일관되게 전개된다.
- '519줄→55줄' 수치를 부풀리지 않고 로직이 훅과 하위 컴포넌트로 이동했음을 명시하며, 측정 시점(리팩터링 완료 시점 55줄 vs 현재 58줄)까지 구분해 수치의 근거를 투명하게 밝힌다.
- mode 미지정, setValue의 shouldDirty·shouldValidate 미지정, 동기화 훅 테스트 부재를 각각 '남은 기술 부채'로 명시해 완료와 미완을 명확히 구분한다.
- '아래 사용자 정의 이름은 모두 공개용 가명이다'를 코드 앞에 선언해 익명화 방침이 독자에게 투명하고, 회사명·도메인 누출이 없다.

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: useSyncParticipants 코드의 "const currentById = keyBy(getValues() ?? [], (item) => item.memberId);"
  - 문제: RHF의 `getValues`는 인자 없이 호출하면 배열이 아니라 폼 전체 값 객체를 반환한다. 스니펫만 보면 `getValues()`를 participants 배열로 취급하고 있어, RHF에 익숙한 독자는 동작하지 않는 코드로 읽는다. 파라미터로 주입받은 스코프 getter라면 그 사실이 코드에 드러나지 않는다.
  - 제안: `getValues('participants') ?? []`로 바꾸거나, 파라미터 이름을 `getParticipants`처럼 스코프가 드러나게 바꾸고 "호출부에서 participants 배열만 반환하도록 감싼 getter를 주입한다"는 한 줄 설명을 코드 위에 추가하라.
- **🟠 Medium · 한계 구분**
  - 위치: "이제 유효성 값을 Zustand에 별도 저장하지 않고 `formState.isValid`를 읽는다."
  - 문제: RHF 문서상 `formState.isValid`는 mode가 onChange·onTouched·onBlur(·all)일 때만 입력 중 갱신되며, 기본 onSubmit 모드에서는 실시간으로 반영되지 않는다. 두 문단 뒤에서 mode 미지정을 부채로 밝히긴 하지만, 이 문장만 보면 버튼 활성화가 현재 정상 동작하는 것처럼 완료형으로 읽혀 뒤의 부채 서술과 충돌한다.
  - 제안: 문장 바로 뒤에 현재 동작을 명시하라. 예: "다만 mode를 지정하지 않은 현재 구현에서는 isValid가 입력 중에 갱신되지 않으므로, 버튼 활성화는 제출 시도 이후에야 실제 검증 결과를 반영한다." 이렇게 하면 아래 부채 문단과 자연스럽게 이어진다.
- **🟠 Medium · 기술 정확성**
  - 위치: useSyncParticipants의 useEffect 의존성 배열 "[serverParticipants, getValues, replace, buildParticipant, getDefaultSelection]"
  - 문제: `buildParticipant`·`getDefaultSelection`은 호출부에서 주입받는 콜백이라, 호출부가 useCallback으로 메모이즈하지 않으면 매 렌더마다 effect가 재실행되고 `replace`가 새 배열로 값을 갈아끼워 리렌더 루프가 생길 수 있다. 글에는 이 전제가 없어 독자가 그대로 옮겨 쓰면 무한 렌더를 겪을 수 있다.
  - 제안: 코드 아래에 "주입하는 콜백은 호출부에서 useCallback으로 메모이즈한다는 전제이며, 그렇지 않으면 replace가 매 렌더 실행된다"는 주의 한 문장을 추가하거나, effect 내부에서 서버 목록과 현재 폼 배열이 같으면 replace를 건너뛰는 가드를 함께 보여줘라.
- **🟡 Low · 기술 정확성**
  - 위치: BookingFormSchema의 "participants: z.array(ParticipantSchema).min(1, ...).default([])"
  - 문제: `.default([])`는 입력이 undefined일 때 빈 배열을 넣지만, 그 값은 곧바로 `min(1)`에 걸려 통과할 수 없다. 기본값이 항상 검증에 실패하는 모순된 조합이라 독자에게 잘못된 패턴을 보여준다. RHF defaultValues에서 배열을 항상 채워 넣는 구조라면 default는 불필요하다.
  - 제안: `.default([])`를 제거하거나, 실제 코드에 있는 그대로 옮긴 것이라면 "default([])는 min(1)과 모순이라 사실상 죽은 코드다" 같은 각주를 달아 의도를 밝혀라.
- **🟡 Low · 구조·가독성**
  - 위치: "같은 `name`의 `useFieldArray` 인스턴스를 여러 곳에 두지 않고 동기화 훅 한 곳에서 관리한다." (날짜 일괄 적용 섹션)
  - 문제: 글 어디에도 `useFieldArray`를 만드는 코드가 없어서 동기화 훅이 받는 `replace`의 출처를 알 수 없고, 이 문장이 갑자기 등장한 것처럼 읽힌다.
  - 제안: useSyncParticipants 코드 앞에 "`replace`는 폼 루트에서 한 번만 만든 `useFieldArray('participants')`의 메서드를 주입받는다"는 설명을 한 문장 추가하고, 이 문장은 그 맥락을 받아 다듬어라.

> 참고: 당초 high 지적 1건(“[확인 필요] 기능 귀속이 부정확해 보인다. Cache Components(`use cache`/PPR 계열...”)은 재검증에서 **기각**되어 목록에서 제외했다. 근거: 공식 Next.js 문서(v16.3.1 'Preserving UI state' 가이드)가 이 동작을 Cache Components 기능으로 직접 귀속시킨다: "With Cache Components... Instead of unmounting pages on navigation, Next.js hides them using React's <Activity> component", "Next.js preserves up to 3 routes". routerBFCache는 Next 15 시절 실험 플래그이고, 글이 다루는 Next 16에서는 cacheComponents: true만으로 이 라우트 보존이 동작하므로(같은 시리즈 post-28도 Cache Components를 켠 뒤 이 동작을 확인하고 해당 문서를 인용) 기능 귀속이 부정확하다는 지적 자체가 틀렸다.

### 12. 리뷰 좋아요를 낙관적으로 갱신하며 여러 캐시를 함께 복구한 과정

`post-12-review-like-optimistic-update.md` · 발행 준비도 **8/10**

TanStack Query v5의 실제 동작(자동 롤백 없음, getQueriesData의 범위, onSettled Promise 반환 시 pending 유지)을 정확하게 서술하고 동시성 문제를 범위 밖으로 명확히 구분한 완성도 높은 글이다. 다만 정의 없이 등장하는 내부 타입들, mutationKey의 용도 미설명, 테스트 섹션의 완료 여부 모호함을 정리하면 발행 가능한 수준이다.

**잘된 점**

- "목록에서 누른 좋아요가 상세에서는 반영되지 않았다"는 구체적 증상으로 시작해 문제 코드 → 오해 교정 → 설계 → 한계 순으로 흐름이 논리적이다.
- "TanStack Query가 자동으로 롤백하지는 않는다", "getQueriesData가 해주는 일과 해주지 않는 일" 등 라이브러리가 해주는 것과 직접 해야 하는 것의 경계를 정확히 서술했다. onSettled에서 invalidateQueries의 Promise를 반환하면 pending이 유지된다는 설명도 v5 공식 동작과 일치한다.
- updateReviewLike의 중복 반영 방지 가드(review.like === nextLike 조기 반환)와 Math.max(0, ...) 등 실패·경계 케이스를 코드에 반영했고, 테스트 체크리스트도 실패 경로 중심이다.
- "연속 클릭은 별도의 문제다" 섹션에서 optimistic update가 동시성을 해결해주지 않음을 명시하고, 직렬화·멱등성은 별도 설계 영역으로 구분했다. 과장 없는 판단 중심 서술이 시리즈 목표에 부합한다.

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "이 화면에서는 요청 중 같은 버튼을 다시 누르지 못하게 하는 방법이 가장 단순하다." (연속 클릭은 별도의 문제다)
  - 문제: isLikePending은 useReviewLike를 호출한 컴포넌트 인스턴스에 로컬인 상태다. 같은 리뷰가 목록과 상세에 동시에 렌더링되면 한쪽에서 누른 요청이 다른 쪽 버튼을 막지 못해 중복 요청이 가능하다. 또한 코드에 선언된 mutationKey: ['review-like']는 글 어디에서도 용도가 설명되지 않아 읽는 사람이 이 키가 무언가를 해준다고 오해할 수 있다.
  - 제안: 해당 문장 뒤에 "단, isPending은 훅 인스턴스별 상태라 같은 리뷰가 목록과 상세에 동시에 떠 있으면 서로를 막지 못한다. 화면을 넘어 막으려면 mutationKey와 useIsMutating을 조합해야 한다"를 추가해 mutationKey 선언의 의미를 연결하거나, 사용하지 않는다면 코드에서 mutationKey를 제거하라.
- **🟠 Medium · 한계 구분**
  - 위치: "## 확인해야 할 테스트"
  - 문제: 섹션 제목과 "이 로직은 성공 경로보다 실패와 여러 캐시가 겹치는 경우가 중요하다"라는 문장만으로는 나열된 7개 항목이 실제로 작성된 테스트인지, 아직 자동화하지 못한 남은 부채(체크리스트)인지 구분되지 않는다. 시리즈 목표인 '완료와 미구현의 구분' 관점에서 완료형으로 잘못 읽힐 여지가 있다.
  - 제안: 섹션 도입에 상태를 명시하라. 예: "아래 항목 중 1~4는 테스트로 작성했고, 5~7은 수동으로만 확인한 상태라 자동화가 남은 부채다." 전부 미작성이라면 제목을 "아직 수동으로만 확인한 체크리스트"로 바꾸는 편이 정직하다.
- **🟠 Medium · 구조·가독성**
  - 위치: "type Review = TReviewDTO;" 및 "TGlobalListResponse<TReviewDTO[]>" (리뷰 한 건을 바꾸는 순수 함수)
  - 문제: TReviewDTO, TReviewDetailDTO, TGlobalResponse, TGlobalListResponse가 정의 없이 등장한다. 특히 updateReviewList가 순회하는 page.data.list 구조는 TGlobalListResponse의 모양을 모르면 따라갈 수 없다. 또 T- 접두사의 래퍼 타입명은 실제 코드베이스의 내부 네이밍 컨벤션일 가능성이 있어 익명화 관점에서도 재확인이 필요하다. 아울러 updateReviewLike(oldData.data, ...)가 성립하려면 상세 DTO가 reviewId·like·likeCnt를 포함해야 하는데 이 전제도 드러나 있지 않다.
  - 제안: 글 초반에 최소한의 타입 정의를 3~4줄로 보여줘라. 예: "type Review = { reviewId: number; like: boolean; likeCnt: number }; type ListResponse<T> = { data: { list: T } }" 수준이면 충분하다. 내부 실명과 무관한 중립적 이름(Review, ListEnvelope 등)으로 바꾸면 익명화 우려도 함께 해소된다.
- **🟡 Low · 기술 정확성**
  - 위치: "`onSettled`에서 `invalidateQueries`의 Promise를 반환하면 재검증이 끝날 때까지 mutation의 pending 상태도 유지할 수 있다."
  - 문제: 이 설명 자체는 정확하지만, 뒤 섹션의 disabled={isLikePending}과 결합하면 재검증(refetch)이 끝날 때까지 버튼이 계속 비활성화된다는 상호작용이 생긴다. '버튼을 빠르게 보이게 한다'는 글의 전제와 상충하는 트레이드오프인데 글이 두 선택을 연결해 설명하지 않는다.
  - 제안: 연속 클릭 섹션에 한 문장을 추가하라. 예: "onSettled의 Promise를 반환하고 있으므로 버튼은 재검증이 끝날 때까지 비활성화된다. 응답성보다 정합성을 택한 것으로, 재검증 대기 없이 버튼을 풀고 싶다면 Promise를 반환하지 않으면 된다."
- **🟡 Low · 구조·가독성**
  - 위치: "`getQueriesData`가 모든 화면을 자동으로 찾아주는 것은 아니다. 같은 query key 규칙을 쓰는 목록 캐시를 한꺼번에 찾을 수 있다는 점이 유용했다."
  - 문제: 같은 섹션의 첫 문단("새로운 목록 캐시를 만들거나 앞으로 생길 화면까지 자동으로 동기화하는 기능은 아니다")과 거의 동일한 내용이 두 번 반복된다.
  - 제안: 마지막 두 문장을 삭제하거나 "요컨대 '현재 존재하는' 캐시를 규칙으로 찾는 도구이지, 미래의 화면까지 보장하는 도구는 아니다" 한 문장으로 압축해 조건 목록 바로 뒤에 붙여라.
- **🟡 Low · 맞춤법·표기**
  - 위치: "Optimistic Update가 한 번의 요청을..." / "optimistic update 대상인지 검토해야 한다" / "optimistic value를 중간에 덮지 않는다" / 제목의 "낙관적으로 갱신"
  - 문제: 같은 개념이 '낙관적 갱신', 'Optimistic Update'(대문자), 'optimistic update'(소문자), 'optimistic value'로 혼재되어 표기 일관성이 없다.
  - 제안: 첫 등장에서 "낙관적 업데이트(optimistic update)"로 병기한 뒤 이후에는 한 가지 표기(예: 낙관적 업데이트)로 통일하라. 'optimistic value'는 '낙관적으로 반영한 값'으로 풀어 쓰면 자연스럽다.
- **🟡 Low · 익명화**
  - 위치: "리뷰 목록은 병원과 페이지 크기에 따라 여러 캐시가 생기고" 및 코드의 "{ hospitalId: 1, size: 3 }"
  - 문제: 회사명·서비스명은 없지만 '병원'과 hospitalId가 서비스의 업종(병원 리뷰 플랫폼)을 그대로 드러낸다. 시리즈의 익명화 수위를 업종까지 가리는 것으로 잡았다면 남은 지점이다.
  - 제안: 업종 노출까지 피하려면 '병원' → '매장', hospitalId → placeId(또는 storeId)로 일괄 치환하라. 업종 공개를 의도한 것이라면 시리즈 전체에서 동일 수위를 유지하는지만 확인하면 된다.

### 14. Next.js App Router에서 prefetch를 기다려야 하는 경우

`post-14-next-seo-prefetch.md` · 발행 준비도 **7/10**

실제 버그에서 출발해 `void prefetchQuery`를 이분법이 아닌 상황별 기준으로 정리한 좋은 글이지만, 도입부에 SEO 맥락이 없어 후반 sitemap 섹션이 편집 잔여물처럼 붕 떠 있고, 마지막 문단의 '넘길 수 있다'가 완료인지 남은 보강안인지 모호하다.

**잘된 점**

- '브라우저에서는 보였는데 HTML 원문에는 없었다'는 구체적 버그로 시작하는 도입부가 문제 상황을 즉시 체감하게 한다.
- 'void prefetchQuery가 항상 틀린 것은 아니다' 섹션과 4행짜리 판단 표가 정오 이분법 대신 상황별 기준을 제시해, 시리즈 목표인 판단 중심 서술에 잘 부합한다.
- sitemap은 URL 목록일 뿐이고 crawler가 받은 초기 HTML이 문제라는 교정, generateMetadata가 page와 별도로 실행돼 prefetch 데이터가 자동 공유되지 않는다는 한계 명시 등 기술적으로 정확한 구분이 돋보인다.
- 마지막 문장 "기준은 API의 중요도가 아니라 서버가 첫 응답에서 어디까지 보장해야 하는가였다"가 글 전체의 결론을 한 줄로 응축한다.

**수정 지적**

- **🟠 Medium · 구조·가독성**
  - 위치: "SEO와 sitemap은 구분한다" 섹션 — "문제를 설명할 때는 \"sitemap에서 읽히지 않았다\"보다 ... 가 정확하다"
  - 문제: 도입부에는 SEO나 검색 노출 이야기가 전혀 없는데, 이 섹션에서 갑자기 '누군가 sitemap 탓으로 설명했다'는 전제를 교정한다. 원문에서 맥락(이 버그가 검색 노출 문제로 보고됐다는 배경)이 편집 과정에서 빠진 잔여물처럼 읽혀, 독자는 왜 sitemap 얘기가 나오는지 알 수 없다. 파일명(seo-prefetch)이 시사하는 주제가 본문 도입부와 연결되지 않는 문제이기도 하다.
  - 제안: 도입부 첫 문단에 한 문장 추가: "이 문제는 처음에 '상세 페이지가 검색에 안 잡힌다, sitemap 문제 아니냐'는 보고로 들어왔다." 이렇게 하면 후반 섹션의 교정('sitemap이 아니라 crawler가 받은 초기 HTML이 문제')이 자연스럽게 회수된다.
- **🟠 Medium · 한계 구분**
  - 위치: "화면의 나머지 부분은 pending query를 dehydration하고 Suspense로 넘길 수 있다."
  - 문제: 앞 문장("병원 정보처럼 ... 필요한 데이터만 기다렸다")은 완료형인데 이 문장은 가능형이라, 나머지 화면의 streaming 전환이 실제로 적용된 것인지 아직 남은 보강안인지 구분되지 않는다. 시리즈 목표 (2)에 정확히 걸리는 문장이다.
  - 제안: 실제 적용했다면 "Suspense로 넘겼다"로 완료형으로 고치고, 아직이라면 "나머지 부분은 pending dehydration + Suspense 전환을 검토 중이며 아직 적용하지 않았다"로 미완료임을 명시한다.
- **🟡 Low · 기술 정확성**
  - 위치: "이 코드에서 `dehydrate`는 prefetch가 끝나기 전에 실행될 수 있다."
  - 문제: `void` 뒤의 `dehydrate`는 같은 실행 흐름에서 동기적으로 호출되므로, promise가 그 전에 settle될 수 없어 항상 prefetch 완료 전에 실행된다. '될 수 있다'는 완곡 표현이 오히려 부정확하고, 문제의 결정성을 흐린다.
  - 제안: "이 코드에서 `dehydrate`는 항상 prefetch가 끝나기 전에 실행된다"로 단정하고, 필요하면 "prefetchQuery가 반환한 promise를 기다리지 않으므로"라는 근거를 덧붙인다.
- **🟡 Low · 구조·가독성**
  - 위치: "`HydrationBoundary`가 여러 번 보인다고 무조건 중복도 아니다." 문단
  - 문제: HydrationBoundary 중복 여부 이야기는 유용하지만 'SEO와 sitemap은 구분한다'라는 섹션 제목과 무관해서, 섹션의 초점이 흩어진다.
  - 제안: 이 문단을 "HydrationBoundary가 여러 개인 것은 문제가 아니다" 같은 별도 소절로 분리하거나, 섹션 제목을 "함께 정리한 오해들"처럼 두 주제를 포괄하는 제목으로 바꾼다.
- **🟡 Low · 기술 정확성**
  - 위치: `hospitalOptions(Number(hospitalId))` (수정 코드) vs `hospitalOptions(hospitalId)` (도입부·streaming 예시)
  - 문제: 수정 코드에서만 `Number()` 변환이 있고 도입부와 streaming 예시에는 없다. searchParams 값은 string이므로 변환 여부에 따라 query key가 달라져 서버 cache와 클라이언트 구독이 어긋날 수 있는데, 스니펫 간 불일치가 이 함정을 오히려 재현하고 있다.
  - 제안: streaming 예시(세 번째 스니펫)에도 `Number(hospitalId)`를 적용해 수정본 스니펫끼리 통일하고, 도입부 스니펫은 '발견 당시 코드'임을 감안해 그대로 두되 필요하면 각주로 언급한다.
- **🟡 Low · 익명화**
  - 위치: "병원 정보", "예약 상세", `hospitalOptions`, `hospitalId`, `ReservationPageView`
  - 문제: [확인 필요] 회사명·서비스명·실제 URL은 없지만 '병원 예약'이라는 사업 도메인과 hospital 계열 식별자가 그대로 남아 있다. post-08이 categories/integrations 같은 완전 일반 명사를 쓴 것과 익명화 수위가 달라, 시리즈 기준상 이 수준의 도메인 노출을 허용할지 결정이 필요하다. hospitalOptions가 실제 내부 코드 식별자와 동일하다면 교체 대상이다.
  - 제안: 도메인 맥락이 스토리에 필요하므로 유지한다면 실제 내부 식별자와는 다른 이름인지 확인하고, 수위를 맞추려면 storeOptions/storeId + '매장 상세' 같은 중립 도메인으로 치환한다. 어느 쪽이든 시리즈 전체에서 익명화 수위를 통일한다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "예약 상세가 정상으로 보였는데" / "pending query를 dehydration하고"
  - 문제: '정상으로 보였는데'는 '정상적으로'가 자연스럽고, 'dehydration하고'는 명사를 동사처럼 활용해 어색하다. 같은 문단에서 동사형은 'dehydrate', 명사형은 'dehydration'으로 쓰는 다른 문장들과도 어긋난다.
  - 제안: "정상적으로 보였는데"로 고치고, "pending query를 dehydrate하고" 또는 "pending 상태 그대로 dehydration 대상에 포함하고"로 수정해 동사/명사 표기를 글 전체에서 통일한다.

### 15. 3단계 리뷰 작성 폼의 역할을 RHF·Zod·퍼널로 다시 나눈 과정

`post-15-review-form.md` · 발행 준비도 **8/10**

`_def` 의존과 최종 전체 검증 부재를 서두부터 밝히는 정직한 프레이밍과 정확한 Zod 내부 동작 설명이 돋보이는, 발행에 가까운 글이다. 다만 80줄짜리 퍼널 코드 블록 축약과 URL 직렬화 문단의 배경 보강, 표기 통일 정도의 손질이 남았다.

**잘된 점**

- 서두에서 "이 제약을 감춘 채 'Zod로 타입 안전한 퍼널을 만들었다'고 쓰고 싶지는 않았다"고 밝혀 글 전체의 신뢰도를 높이고, 완료와 부채의 경계를 처음부터 끝까지 일관되게 유지한다.
- `DetailsStepSchema._def.schema.shape`가 비공개 API라는 점, ZodEffects에서 shape를 꺼내면 superRefine이 소실된다는 점, 제출 경로에 SubmissionSchema.parse가 없다는 점까지 Zod 내부 동작을 정확하게 기술했다.
- 퍼널 도입 자체를 정당화하지 않고 "context를 비워 두고 replace만 쓴다면 로컬 상태나 명시적인 리듀서가 더 단순한지도 비교할 필요가 있다"며 자기 선택을 상대화하는 시각이 있다.
- defaultValues가 첫 생성 시 캐시된다는 RHF 동작 설명이 정확하고, useQueries로 로딩을 모은 뒤 마운트를 늦추는 해법이 코드와 함께 명료하게 제시된다.

**수정 지적**

- **🟠 Medium · 구조·가독성**
  - 위치: "퍼널이 단계 이동과 이력을 관리한다" 섹션의 useSchemaForm~flow.Render 코드 블록
  - 문제: 이 코드 블록이 약 80줄로 글 전체 코드의 절반을 차지한다. proof·details·feedback 세 단계가 거의 같은 패턴의 StepForm 호출을 반복하고 있어, 독자가 핵심(mergeAndReset과 단계-스키마 매핑)에 도달하기 전에 스크롤에서 이탈하기 쉽다.
  - 제안: flow.Render에는 details 한 단계만 남기고 나머지는 "proof·feedback도 같은 패턴으로 각자의 단계 스키마를 넘긴다"는 주석 한 줄로 축약하라. mergeAndReset과 moveToStep은 그대로 두되, confirmSubmission은 산문으로 설명해도 충분하다.
- **🟠 Medium · 구조·가독성**
  - 위치: "이미지처럼 브라우저 객체를 포함한 값은 URL 직렬화만으로 이동 이력을 복원하기 어렵다." (마지막 섹션)
  - 문제: 퍼널이 단계 context를 URL이나 히스토리 상태로 직렬화해 복원한다는 배경이 글 앞부분에 없어서, 이 문장이 갑자기 등장한다. use-funnel을 모르는 독자는 왜 URL 직렬화가 화제인지 알 수 없다.
  - 제안: 문장 앞에 배경 한 줄을 추가하라. 예: "@use-funnel은 단계 context를 히스토리 상태로 직렬화해 뒤로 가기 복원을 지원하는 것이 강점인데, 이미지처럼 브라우저 객체를 포함한 값은 이 직렬화만으로 이동 이력을 복원하기 어렵다."
- **🟡 Low · 맞춤법·표기**
  - 위치: "각 입력 컴포넌트가 검증과 store action까지 알고 있었다" / "두 Zustand store를 없앤 것보다" / "리뷰 작성용 Zustand 스토어를 제거했다"
  - 문제: 같은 대상을 'store action', 'Zustand store', 'Zustand 스토어'로 혼용하고 있어 표기가 일관되지 않는다.
  - 제안: 본문 산문에서는 '스토어'·'스토어 액션'으로 통일하라. '각 입력 컴포넌트가 검증과 스토어 액션까지 알고 있었다', '두 Zustand 스토어를 없앤 것보다'로 수정.
- **🟡 Low · 익명화**
  - 위치: "id: 'public-example-flow'"
  - 문제: '공개용 예시'라는 뜻의 메타적인 식별자라서 가명 처리 자체가 눈에 띈다. 익명화 목적은 달성했지만 실제 코드처럼 읽히지 않아 스니펫의 현실감을 깎는다.
  - 제안: 도메인 맥락에 맞는 자연스러운 가명으로 바꿔라. 예: `id: 'review-write-flow'`. 상단의 '공개용 가명' 고지가 이미 있으므로 이름 자체가 예시임을 드러낼 필요는 없다.
- **🟡 Low · 기술 정확성**
  - 위치: "defaultValues: savedDraft ? mapResponseToDraft(savedDraft.data) : emptyDraft" 와 ReviewEditorPage의 "{ data: savedDraft, isLoading: isDraftLoading }"
  - 문제: 페이지에서 쿼리의 `data`를 이미 `savedDraft`로 구조 분해했는데 폼 초기화에서 다시 `savedDraft.data`를 꺼낸다. API 응답 래퍼(예: envelope의 data 필드) 때문이라면 글만 봐서는 알 수 없고, 아니라면 두 스니펫이 서로 모순된다.
  - 제안: 응답 래퍼 구조라면 `savedDraft.data` 옆에 "// 응답 envelope의 data 필드" 주석을 달고, 아니라면 `mapResponseToDraft(savedDraft)`로 통일해 두 스니펫의 형태를 맞춰라.
- **🟡 Low · 구조·가독성**
  - 위치: "React Hook Form의 `defaultValues`는 처음 생성될 때 캐시된다. ... 대신 마운트 시점을 늦춰 비동기 데이터가 오기 전에 빈 폼이 만들어지는 것을 피한다."
  - 문제: 설명 자체는 정확하지만, RHF v7.43+의 `values` 옵션(비동기 데이터 도착 시 폼 값을 반응적으로 갱신)이라는 공식 대안이 있다는 언급이 없어 '마운트 지연'이 유일한 해법처럼 읽힌다.
  - 제안: 한 문장으로 대안을 언급하고 선택 이유를 밝혀라. 예: "RHF의 `values` 옵션으로 도착 시점에 값을 갱신하는 방법도 있지만, 수정 진입 시 초기값이 완전한 상태에서 폼을 만드는 편이 단계 간 reset 로직과 충돌하지 않아 마운트 지연을 택했다."
- **🟡 Low · 맞춤법·표기**
  - 위치: 제목 "3단계 리뷰 작성 폼의 역할을 RHF·Zod·퍼널로 다시 나눈 과정"
  - 문제: 제목에서 'RHF' 약어를 먼저 쓰는데, 본문 첫 등장("입력값과 필드의 생명주기: React Hook Form")에서는 풀네임만 쓰고 약어를 정의하지 않는다. 검색 유입과 비RHF 사용자 가독성 측면에서도 제목의 약어는 불리하다.
  - 제안: 제목을 "3단계 리뷰 작성 폼의 역할을 React Hook Form·Zod·퍼널로 다시 나눈 과정"으로 풀어 쓰거나, 본문 첫 등장에 "React Hook Form(이하 RHF)"을 명시하라.

### 18. 38개 필드로 구성된 프로그램 폼을 타입과 변환 계층으로 나눈 과정

`post-18-program-form.md` · 발행 준비도 **8/10**

복잡도를 없앤 게 아니라 타입·변환·동기화에 배치했다는 결론까지 판단 중심으로 잘 서술된 글이며, 재귀 경로 타입 코드도 깊이 제한(5단계)까지 실제 동작과 일치한다. 몇 군데 서술 정확성과 표기 일관성만 손질하면 발행 가능한 수준이다.

**잘된 점**

- getFieldValue 반환 타입 재타이핑을 '후속 과제로 남겼다', isFieldTouched 한계를 '다시 구현한다면 ~하겠다'로 서술해 완료 구현과 미구현 보강안이 명확히 구분된다.
- 빈 배열을 PROVIDED로 처리한 toggle 버그, 시술 상세와 프로그램 상세의 응답 모양 차이 등 실제 실패 사례를 근거로 설계를 설명해 설득력이 있다.
- 재귀 경로 타입(ArrayPaths)의 Depth=5 기본값과 Prev 튜플 구현이 본문의 '깊이 5단계 제한' 주장과 정확히 일치하고, antd initialValues가 재적용되지 않는다는 설명도 정확하다.
- 회사명·서비스명·실제 도메인이 전혀 남아 있지 않고, treatmentSubId 같은 식별자도 일반적인 도메인 용어 수준으로 자연스럽게 익명화됐다.

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "`Item`, `List`, `useForm`, `useWatch`, `useFormInstance`가 받는 `name` 경로를 같은 `T` 기준으로 좁힌다"
  - 문제: useForm과 useFormInstance는 name 경로를 받는 API가 아니다. 실제 코드에서도 이 둘은 Values 제네릭만 고정할 뿐이어서, 다섯 API가 모두 name을 받는 것처럼 읽히는 이 문장은 부정확하다.
  - 제안: "`Item`, `List`, `useWatch`가 받는 `name` 경로를 같은 `T` 기준으로 좁히고, `useForm`과 `useFormInstance`는 같은 `Values` 타입으로 고정한다"로 수정한다.
- **🟠 Medium · 구조·가독성**
  - 위치: 도입부 번호 목록(1. createTypedForm ~ 4. 동기화 컴포넌트)과 본문 섹션 구성
  - 문제: 도입부에서 '네 부분으로 나눴다'고 예고하는데 본문 섹션은 다섯 개다. '비동기 초기값은 폼을 마운트하기 전에 준비하기' 섹션이 목록에 없어 글의 지도와 실제 구조가 어긋난다.
  - 제안: 목록에 5번 항목(예: "5. 초기값 준비: 비동기 상세 조회와 폼 마운트 순서")을 추가하거나, 해당 섹션을 변환 계층 섹션의 하위 내용으로 합쳐 4부 구성을 유지한다.
- **🟡 Low · 기술 정확성**
  - 위치: serverToForm / formToRequest 코드와 "손실되면 안 되는 규칙을 검증한다" 문단
  - 문제: serverToForm은 detailTemplateType을 폼으로 매핑하지만 formToRequest는 이 필드를 요청에 포함하지 않는다. 왕복(round trip) 보존을 설명하는 맥락에서 두 함수의 비대칭이 발췌 때문인지 실제 설계인지 독자가 판단할 수 없다.
  - 제안: formToRequest에 detailTemplateType을 포함시키거나, toggle 필드 생략 주석처럼 "예시에서는 일부 필드만 다룬다"는 주석을 formToRequest에도 한 줄 추가한다.
- **🟡 Low · 구조·가독성**
  - 위치: "하위 시술을 바꾸면 추천 대상과 시술 특징을 폼에 가져와야 했다."
  - 문제: 도입부에서 '시술 특징'을 언급했지만 동기화 섹션의 코드와 설명은 recommendedTargets(추천 대상)만 다루고 시술 특징은 다시 등장하지 않아 복선이 회수되지 않는다.
  - 제안: 동기화 섹션에 "예시는 추천 대상만 보여주지만 시술 특징도 같은 방식으로 적용한다" 한 줄을 넣거나, 도입부 문장에서 '시술 특징'을 빼고 '추천 대상 등 템플릿 값'으로 일반화한다.
- **🟡 Low · 맞춤법·표기**
  - 위치: `interface ProgramFormValues { ... }`로 시작하는 코드 블록 (```ts 펜스)
  - 문제: 코드 펜스 언어가 ts인데 블록 안에 `<ProgramForm.Item name="programName" />` 같은 JSX가 포함돼 있다. ts 파일에서는 컴파일되지 않는 코드이고 하이라이팅도 깨질 수 있다.
  - 제안: 펜스를 ```tsx로 바꾸거나, 타입 선언부(ts)와 JSX 사용 예시(tsx)를 별도 블록으로 분리한다.
- **🟡 Low · 톤·문체**
  - 위치: "이후 수정 이유가 다른 네 부분으로 나눴다."
  - 문제: '무엇을' 나눴는지 목적어가 빠져 문장이 어색하다.
  - 제안: "이후 폼 구현을 수정 이유가 다른 네 부분으로 나눴다."처럼 목적어를 보충한다.
- **🟡 Low · 맞춤법·표기**
  - 위치: 제목 "38개 필드로 구성된" vs 본문 첫 문장 "38개가 넘는 필드가 있었다"
  - 문제: 제목은 정확히 38개, 본문은 '38개가 넘는'으로 수치 서술이 어긋난다. 수치의 신뢰성을 강조하는 글에서 첫 문장부터 제목과 다르면 눈에 띈다.
  - 제안: 둘 중 하나로 통일한다. 실제로 38개를 넘는다면 제목을 "38개가 넘는 필드로 구성된"으로, 정확히 38개라면 본문을 "38개 필드가 있었다"로 맞춘다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "작은 어댑터 안에 모았다" / "반환된 adapter만 쓴다" / "adapter 내부에는", "폼 값" / "API와 form이 원하는 모양", "필드 경로" / "잘못된 field path"
  - 문제: 같은 개념이 어댑터/adapter, 폼/form, 필드 경로/field path로 한·영이 오가며 표기가 흔들린다.
  - 제안: 글 전체에서 하나씩 정한다. 예: '어댑터', '폼', '필드 경로'로 한글 표기를 기본으로 하고 코드 식별자만 영문을 유지한다.

### 19. 정산 서비스를 별도 호스트로 분리하며 토큰 전달 방식을 바꾼 과정

`post-19-cross-domain-token.md` · 발행 준비도 **7/10**

URL → POST 본문 핸드오프의 판단 근거와 잔여 위험을 정직하게 구분한 완성도 높은 글이지만, 본문 중간의 후일담 단락과 후반부 matcher 장애 회고가 흐름을 끊고, 버전-동작 인과 주장 하나에 출처가 없다.

**잘된 점**

- "화면에서 보이지 않는다는 이유로 안전한 구조는 아니었다"처럼 첫 구현의 문제를 access log·Referer라는 구체적 노출 경로로 짚어 도입부의 설득력이 높다
- 인가 코드 교환을 채택하지 못한 제약(공유 저장소 부재)과 현 방식에 따라오는 잔여 위험 4가지를 불릿으로 명시해, 완료된 것과 한계의 구분이 시리즈 목표에 잘 부합한다
- 보안 헤더 각각의 역할과 한계('unsafe-inline'이 nonce보다 넓게 열려 있다는 점)를 과장 없이 서술한다
- `^16.2.12`가 회피책이 되지 않는 이유, protocol-relative 해석 방지 등 세부 판단의 근거가 구체적이라 실무 신뢰도가 높다

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "16.3이 일부 script에 `crossorigin=\"\"`을 붙이면서 redirect된 청크 요청이 CORS 검사를 받았고 화면 전체가 깨졌다"
  - 문제: [확인 필요] redirect된 cross-origin 요청이 crossorigin 속성 때문에 CORS 검사를 받는다는 메커니즘 설명은 타당하지만, '16.3이라는 특정 마이너 버전이 script에 crossorigin을 붙이기 시작했다'는 버전-동작 인과는 릴리스 노트나 이슈 링크 등 근거 없이 단정으로 서술되어 있다.
  - 제안: 해당 동작 변화를 다룬 Next.js 릴리스 노트·GitHub 이슈를 참고 링크로 달거나, "우리 환경에서는 16.3 업그레이드 후 일부 script 태그에 crossorigin=\"\"이 붙은 것을 확인했다"처럼 관찰 기반 서술로 완화한다.
- **🟠 Medium · 구조·가독성**
  - 위치: "이 글을 쓴 뒤로 하나가 달라졌다. … 왜 그렇게 했는지는 이 글에서 다루지 않는다."
  - 문제: 본문 한가운데(POST 전달 섹션)에 후일담이 삽입되어 흐름이 끊기고, 이유를 다루지 않는다는 문장으로 끝나 독자가 붕 뜬다. 같은 내용이 뒤의 한계 불릿 "옮겨진 뒤 두 쿠키의 보호 수준이 다르다"와 중복되기도 한다.
  - 제안: 이 단락을 삭제하고 '인가 코드 교환을 쓰지 못한 이유' 섹션의 해당 불릿에 합치거나, 글 말미의 '추기' 블록으로 옮긴다. 옮기더라도 "클라이언트에서 값을 직접 읽어야 하는 요구가 생겨" 정도로 이유를 한 문장은 요약해 주는 편이 좋다.
- **🟠 Medium · 구조·가독성**
  - 위치: 섹션 "석 달 뒤, 같은 미들웨어에서 다른 문제가 드러났다"
  - 문제: 제목과 도입부는 토큰 전달 방식 전환인데, 글 후반 약 1/4이 matcher 범위 장애 회고라 한 글에 주제가 두 개다. 예고 없이 등장해 독자가 방향 전환을 스스로 따라가야 한다.
  - 제안: 별도 글('미들웨어 matcher가 _next 청크까지 잡고 있었다')로 분리하는 것이 가장 깔끔하다. 한 글로 유지한다면 도입부에 "이 미들웨어는 석 달 뒤 다른 장애의 원인이 되기도 했다" 같은 예고 문장을 넣고, 장애 섹션을 절반 정도로 압축한다.
- **🟡 Low · 기술 정확성**
  - 위치: "서로 다른 호스트 사이에서는 GET 리다이렉트로 HttpOnly 쿠키를 옮길 수 없다"
  - 문제: 리다이렉트가 쿠키를 다른 등록 도메인으로 전달하지 못하는 것은 HttpOnly 여부와 무관한데, 지금 문장은 HttpOnly라서 못 옮기는 것처럼 읽혀 원인 설명이 부정확하다.
  - 제안: "등록 도메인이 다르면 리다이렉트만으로는 쿠키를 옮길 수 없다(HttpOnly 여부와 무관하다). 값을 전달하려면 URL이나 요청 본문에 실어야 한다" 정도로 수정한다.
- **🟡 Low · 기술 정확성**
  - 위치: POST 핸들러 코드의 `String(form.get('sessionToken') ?? '')`
  - 문제: 토큰이 누락돼도 빈 문자열을 그대로 HttpOnly 쿠키로 저장하고 303 리다이렉트한다. 미인증 쿠키가 심긴 채 정산 화면에 랜딩하는 경로가 예시 코드에 남아 있다.
  - 제안: 코드에 토큰 부재 시 400을 반환하거나 로그인 경로로 보내는 검증 분기를 추가하거나, 본문에 "실제 코드에는 토큰 유효성 검증이 앞에 있다"는 한 줄을 덧붙인다.
- **🟡 Low · 한계 구분**
  - 위치: "두 호스트에서 청크가 redirect 없이 200으로 응답하는지 통합 테스트 대상으로 삼았다"
  - 문제: '대상으로 삼았다'가 테스트를 실제로 추가했다는 뜻인지, 추가할 목록에 올려 둔 것인지 모호해 완료형으로 잘못 읽힐 수 있다.
  - 제안: 사실에 맞춰 "통합 테스트를 추가했다"(완료) 또는 "통합 테스트로 추가할 항목으로 남겨 두었다"(남은 부채) 중 하나로 명확히 쓴다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "GET 리다이렉트로" / "GET redirect에는", "자동 제출 form" / "자동 제출 폼의", "인가 코드 교환" / "code 교환"
  - 문제: redirect·리다이렉트, form·폼, 인가 코드·code 등 같은 개념의 한·영 표기가 글 안에서 섞여 있다.
  - 제안: 본문 서술은 한글(리다이렉트, 폼, 인가 코드)로 통일하고, 상태 코드·헤더 등 프로토콜 고유 명칭(303 See Other, form-action)만 원문을 유지하는 규칙을 정해 전체에 적용한다.
- **🟡 Low · 톤·문체**
  - 위치: "기존 버전에서는 우연히 드러나지 않았지만"
  - 문제: '우연히 드러나지 않았지만'은 부사와 부정이 어색하게 결합되어 문장이 매끄럽지 않다.
  - 제안: "기존 버전에서는 드러나지 않았을 뿐이었는데" 또는 "기존 버전에서는 우연히 문제가 표면화되지 않았을 뿐"으로 다듬는다.

### 20. 서로 다른 두 SSE를 하나의 상담 화면에 연결한 과정

`post-20-chatbot-message-layer.md` · 발행 준비도 **8/10**

제약 조건과 판단 근거 중심의 서술이 잘 잡혀 있고 익명화도 깔끔하다. 다만 비동기 제너레이터의 finally 동작 설명이 실제보다 낙관적으로 쓰여 있고, 알파 단계 라이브러리 API 명칭과 일부 스니펫 간 정합성에 손볼 곳이 남아 있다.

**잘된 점**

- AI 스트림을 화면에 표시하지 않으면서도 연결을 유지하는 이유를 "서버 내부는 확인할 수 없어 관찰한 동작을 기준으로 연결만 유지했다"처럼 관찰 근거와 한계를 함께 서술해, 확인한 것과 추정한 것의 경계가 정직하다.
- 익명화가 자연스럽다. 상태명('ai'|'live'|'hold'|'done'), API 경로, 쿠키명이 모두 일반화됐고 공개 기술명만 남아 있어 가명 처리가 눈에 띄지 않는다.
- useState 난립 → useReducer로 전이 집중 → 연결을 상태의 파생값으로 전환(store + useSyncExternalStore)이라는 설계 전개가 단계별로 논리적이고, 각 단계의 동기가 분명하다.
- "아직 남은 경계" 섹션이 완료된 구현과 남은 부채(parts 렌더러, 중복 제거 검증, abort 경합)를 명확히 구분하고, 마무리 문단이 이 구조의 한계와 교체 지점을 요약하며 글을 닫는다.

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "비동기 제너레이터가 메시지를 기다리는 동안 구독이 해제되면 `finally` 실행이 늦어질 수도 있다."
  - 문제: 실제 동작보다 낙관적인 서술이다. 제너레이터가 `await new Promise(...)`에 걸려 있는 동안 `.return()`이 호출되면 대기 중인 Promise가 settle될 때까지 return이 큐잉되므로, 이후 SSE 메시지가 더 오지 않으면 finally는 "늦어지는" 게 아니라 영영 실행되지 않을 수 있다. 그 경우 `controller.abort()`가 호출되지 않아 SSE 연결이 그대로 남는다.
  - 제안: "구독이 해제되어도 대기 중인 Promise가 resolve되기 전까지 `finally`가 실행되지 않는다. 이후 메시지가 오지 않으면 abort가 영영 호출되지 않아 SSE 연결이 남을 수 있다. 대기 Promise와 abort 신호를 함께 race하는 보강이 남아 있다."로 정확하게 고친다.
- **🟠 Medium · 기술 정확성**
  - 위치: "메시지 모델은 `@tanstack/ai`로 옮겼다" 섹션 (`UIMessage`, `SubscribeConnectionAdapter`, `useChat`, `live: true`)
  - 문제: [확인 필요] `@tanstack/ai`는 알파 단계 라이브러리라 API가 빠르게 바뀌고 있고, `UIMessage`·`useChat`·`parts`는 Vercel AI SDK에서 훨씬 널리 쓰이는 명칭이라 독자가 어느 라이브러리 이야기인지 혼동할 수 있다. `SubscribeConnectionAdapter`, `live: true` 같은 식별자가 현재 배포된 버전과 일치하는지도 글만으로는 검증할 수 없다.
  - 제안: 섹션 도입부에 사용 버전을 명시하고(예: "`@tanstack/ai` 0.x 알파 기준이며 API는 바뀔 수 있다"), 스니펫의 타입·옵션 명칭을 해당 버전 문서와 대조해 확인한다. Vercel AI SDK와의 혼동을 막는 한 문장을 추가하면 더 좋다.
- **🟠 Medium · 기술 정확성**
  - 위치: "두 패널을 하나로 합쳤다" 섹션의 첫 코드 스니펫 (`chatClient.post('/chat/stream', ...)` 후 read 루프)
  - 문제: 화면에 표시하지 않고 읽기만 하는 이 백그라운드 루프에 취소 경로가 없다. timeout 30초 외에는 언마운트나 세션 전환 시 읽기를 중단할 AbortSignal이 전달되지 않아, "연결 수명은 누가 관리할지 정했다"는 글의 핵심 주제와 이 스니펫이 어긋난다.
  - 제안: 스니펫에 `signal`을 함께 전달하는 형태로 고치거나, 최소한 본문에 "이 읽기 루프는 timeout 외에 별도 취소 경로가 없다는 한계가 있다"를 한 문장 추가해 의도적 단순화임을 밝힌다.
- **🟡 Low · 기술 정확성**
  - 위치: `createSessionConnection` 스니펫의 `openSessionStream(sessionId, { signal, onMessage(...) })` 호출
  - 문제: 앞 섹션의 `openSessionStream`은 `StreamInit`의 `onError`를 `onerror`로 연결하는데, 어댑터에서는 `onMessage`만 전달한다. 두 스니펫 간 타입 정합성이 맞지 않아 보이고, SSE 에러가 큐나 notify로 전달되지 않으므로 에러 발생 시 제너레이터가 영원히 대기하는 경로가 생긴다.
  - 제안: 어댑터 스니펫에 `onError`를 전달해 큐를 종료(또는 throw)하는 처리를 넣거나, "아직 남은 경계"에 "SSE 에러가 제너레이터로 전파되지 않는 경로"를 부채로 명시한다.
- **🟡 Low · 구조·가독성**
  - 위치: 섹션 제목 "인증 헤더 때문에 EventSource를 바꿨다"
  - 문제: "EventSource를 바꿨다"는 EventSource 자체를 수정한 것처럼 읽힌다. 실제로는 EventSource를 버리고 fetch 기반 구현으로 대체한 것이다.
  - 제안: "인증 헤더 때문에 EventSource 대신 fetch 기반 클라이언트를 썼다" 정도로 제목을 고친다.
- **🟡 Low · 구조·가독성**
  - 위치: `ChatStore` 스니펫의 `this.syncConnection();`
  - 문제: `syncConnection`이 스니펫 안에 정의 없이 두 번 호출된다. 요약 코드라는 표시가 없어 독자가 빠진 코드를 찾게 되고, 스니펫만 복사하면 동작하지 않는다.
  - 제안: 클래스 안에 `// syncConnection(): '연결 필요' 조건을 평가해 SSE를 열고 닫는다 (구현 생략)` 같은 주석 한 줄을 넣어 생략을 명시한다.

### 21. 동적 사이트맵에서 공개 API와 인증 API의 경계를 나눈 과정

`post-21-sitemap-cache.md` · 발행 준비도 **8/10**

원인을 interceptor로 좁혀가는 전개와 해결·부채의 구분이 뛰어난 짧고 밀도 있는 글이나, 'use cache'의 버전·활성화 조건 언급이 없어 재현성이 떨어지고 도입부의 전제(요청마다 조회) 인과가 뒤늦게 밝혀진다.

**잘된 점**

- "원인은 사이트맵이 아니라 공용 Axios interceptor였다"로 문제를 좁혀가는 전개가 명확하고, 캐시보다 인증 경계를 먼저 다룬 순서가 논리적이다
- cacheLife를 크론으로 오해하는 흔한 포인트를 짚고, 멀티 인스턴스 환경의 캐시 공유 여부까지 주의로 남겨 라이브러리 동작 서술이 신중하다
- 무효화 경로 없는 cacheTag를 제거한 판단, 그리고 마지막 섹션에서 페이지네이션·부분 실패·lastModified를 남은 문제로 명시한 부분이 시리즈의 '한계 구분' 목표에 정확히 부합한다

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "`import { cacheLife } from 'next/cache'`" 및 `'use cache'` 스니펫
  - 문제: 'use cache'와 cacheLife는 기본 활성화 기능이 아니고 버전에 따라 사용법이 다르다. Next.js 15에서는 experimental 플래그와 함께 `unstable_cacheLife`라는 이름을 써야 하고, 16에서도 next.config에서 cacheComponents를 켜야 한다. 글에 Next.js 버전과 설정 언급이 없어 독자가 스니펫을 그대로 옮기면 동작하지 않을 수 있다.
  - 제안: 첫 코드 스니펫 앞에 "Next.js 16 기준이며 next.config에서 cacheComponents를 활성화해야 한다"(실제 사용 버전에 맞춰) 한 줄을 명시하고, 15.x 독자를 위한 명명 차이(unstable_cacheLife)도 각주로 남긴다.
- **🟠 Medium · 기술 정확성**
  - 위치: "사이트맵 함수에 `'use cache'`를 붙이자 공개 API 호출이 캐시 경계 안에서 동작하지 않았다"
  - 문제: 실제 현상은 캐시 스코프 안에서 `cookies()` 같은 요청 시점 API를 호출하면 에러가 발생하는 것인데, '동작하지 않았다'는 표현은 무엇이 어떻게 실패했는지 전달하지 못해 디버깅 과정의 설득력이 약해진다.
  - 제안: "'use cache' 범위 안에서는 `cookies()`를 호출할 수 없다는 에러가 났다"처럼 실제 에러 현상을 구체적으로 쓰고, 가능하면 에러 메시지 한 줄을 인용한다.
- **🟠 Medium · 구조·가독성**
  - 위치: 도입부 "요청마다 전부 조회하면 같은 데이터를 계속 가져온다"
  - 문제: sitemap.ts는 동적 API를 쓰지 않으면 기본적으로 빌드 타임에 정적 생성되므로 '요청마다 조회'라는 전제가 왜 성립했는지(인터셉터의 cookies() 접근 때문에 동적 렌더링이 됨)가 두 번째 문단에야 밝혀진다. 도입부만 읽으면 인과가 비어 있다.
  - 제안: 도입부에서 "공용 interceptor가 cookies()를 읽는 바람에 사이트맵이 매 요청 동적으로 실행되고 있었다"를 먼저 제시해, 정적 생성이 기본인 사이트맵이 왜 요청마다 실행됐는지의 인과를 앞당긴다.
- **🟡 Low · 기술 정확성**
  - 위치: "`cacheLife('days')`는 매일 정해진 시각에 다시 만드는 크론이 아니다. 하루가 지난 뒤 들어온 요청을 계기로 서버가 값을 재검증하는 정책이다."
  - 문제: [확인 필요] revalidate(하루) 축은 정확하지만 'days' 프로필에는 stale(클라이언트 재사용 시간)과 expire(만료 후 blocking 재생성) 값도 있어, '하루 단위'라는 요약이 프로필 전체 동작과 미묘하게 다르게 읽힐 수 있다.
  - 제안: 공식 문서의 'days' 프로필 세 값(stale·revalidate·expire)을 한 문장으로 소개하거나, "revalidate 기준으로 하루"라고 서술 범위를 좁혀 정확히 쓴다.
- **🟡 Low · 익명화**
  - 위치: "사이트맵에 병원·프로그램·공지·콘텐츠 URL을 넣으면서"
  - 문제: 회사·서비스명은 없지만 '병원'으로 업종이 그대로 드러난다. 시리즈의 다른 글과 조합되면 서비스 식별 단서가 될 수 있다.
  - 제안: 시리즈 차원에서 업종 노출 허용 여부를 정하고, 숨기기로 한다면 "시설·프로그램·공지·콘텐츠" 같은 중립 명사로 치환한다. 허용한다면 현행 유지해도 된다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "다섯 개 API를 호출하게 됐다" / "다섯 API의 결과를 하루 단위로 재검증한다"
  - 문제: 수량 표기가 '다섯 개 API'와 '다섯 API'로 섞여 있고, 섹션 제목 시제도 '나눴다'(과거)와 '재검증한다'(현재)로 불일치한다.
  - 제안: '다섯 개 API'로 통일하고, 섹션 제목을 다른 섹션과 같은 과거형("다섯 API 결과에 하루 단위 재검증을 적용했다")으로 맞춘다.

### 22. 결제 내역에 쿠폰 결제를 추가하며 분기를 한곳으로 모은 과정

`post-22-payment-coupon.md` · 발행 준비도 **7/10**

서버 DTO를 단언하지 않은 판단, ts-pattern의 비완전성 인정, OCP 미달성 명시 등 판단과 한계 중심의 서술이 시리즈 목표에 잘 부합한다. 다만 예제 코드에서 상태 검사가 항상 참이 되는 논리 공백, 마무리 문단의 중복, 변환 함수의 설명 누락을 손보면 발행할 수 있다.

**잘된 점**

- "서버 계약을 다른 모양인 것처럼 단언하는 대신, 흩어진 판단을 몇 군데로 모으는 쪽으로 방향을 바꿨다"처럼 이상적 설계(discriminated union)를 포기한 이유와 실제 제약을 정직하게 서술했다.
- "ts-pattern이 모든 누락을 막아주는 것은 아니다" 문단이 .otherwise() 사용 시 완전성 검사가 되지 않는 실제 동작을 정확히 설명하고, .exhaustive()로 가는 확장을 미구현으로 명확히 구분했다.
- VISIBLE_METHODS의 as const/includes 타입 좁힘 주석이 실제 TypeScript 동작('NORMAL' | 'CANCEL'로 좁혀져 전체 union 인자를 받지 못하는 문제)과 정확히 일치한다.
- "OCP를 달성했다고 표현하지는 않는다. 대신 수정할 위치가 예측 가능해졌다"는 마무리가 과장 없이 얻은 것의 크기를 정확히 잰다. 테이블 기반 테스트를 '다음 작업'으로 명시해 완료/부채 구분도 지켰다.

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "const VISIBLE_STATUSES = ['COMPLETED', 'PROCESSING', 'WAITING'] as const;" (노출 조건을 도메인 함수로 모으기)
  - 문제: 글에 제시된 DTO의 status union은 'PROCESSING' | 'WAITING' | 'COMPLETED' 세 값뿐이라 VISIBLE_STATUSES가 전체 union과 동일하고, VISIBLE_STATUSES.includes(payment.status) 검사는 타입상 항상 참인 죽은 조건으로 읽힌다. 도입부에서 "알 수 없는 값의 fallback도 필요했다"고 언급하지만 이 검사와 연결되지 않아, 독자는 불필요한 코드로 오해할 수 있다.
  - 제안: 둘 중 하나로 정리하라. (1) DTO 예시에 비노출 상태(예: 'FAILED')를 하나 추가해 검사가 실제로 거르는 값이 있음을 보이거나, (2) 검사 위에 "타입상으로는 전체 status를 포함하지만, 서버가 새 상태를 먼저 배포하는 경우를 런타임에서 거르기 위한 방어다"라는 주석을 달아 도입부의 fallback 언급과 연결하라.
- **🟠 Medium · 구조·가독성**
  - 위치: "쿠폰 기능을 넣으면서 기존 렌더러에 조건 하나만 추가하지는 않았다. ... 쿠폰을 추가하면서 기존 노출 조건과 렌더링 분기를 각각 한곳에 모았다." (바꾸고 나서 남은 것)
  - 문제: 마무리 섹션의 첫 두 문단이 '분기를 한곳에 모았다'는 같은 내용을 표현만 바꿔 두 번 반복해 마무리의 힘이 빠진다.
  - 제안: 두 문단을 하나로 합쳐라. 예: "쿠폰을 추가하면서 조건 하나를 덧붙이는 대신 노출 조건과 렌더러 선택을 각각 한곳에 모았고, 선택·초기화·금액 계산은 쿠폰 컴포넌트가, 편집 중에만 필요한 할인 금액은 변환 함수가 책임지게 했다. 이후 결제수단이 추가되어도 확인할 파일이 어디인지 바로 알 수 있다."
- **🟠 Medium · 구조·가독성**
  - 위치: "function toPaymentRequest({ id: _id, couponName: _couponName, couponDiscountAmount: _couponDiscountAmount, ...request }..." (서버 DTO와 폼 모델을 구분하기)
  - 문제: 본문은 couponDiscountAmount가 요청에서 빠지는 이유만 설명하는데, 코드는 id와 couponName까지 제거한다. 반환 타입 PaymentHistoryRequest도 글에 정의가 없어, 독자는 왜 이 세 필드가 빠지는지와 요청 DTO의 실제 모양을 추측해야 한다. 특히 저장된 결제를 수정할 때 id가 왜 본문에 없어도 되는지 의문이 남는다.
  - 제안: 코드 앞에 한 문장을 추가하라. 예: "id는 URL 경로로 전달되고 couponName은 응답 전용 표시 필드라 요청 본문에서 함께 제거한다." 그리고 PaymentHistoryRequest의 타입 정의(또는 'Response에서 이 세 필드를 뺀 구조'라는 설명)를 명시하라.
- **🟡 Low · 기술 정확성**
  - 위치: "`form.useWatch`와 `form.setFieldValue`는 antd Form API를 그대로 노출한다."
  - 문제: antd에서 useWatch는 FormInstance의 메서드가 아니라 Form.useWatch(namePath, form) 형태의 정적 훅이다. setFieldValue는 인스턴스 메서드가 맞지만, useWatch는 래퍼가 인스턴스에 바인딩해 붙여준 것이므로 "그대로 노출한다"는 표현은 부정확하다.
  - 제안: "form.setFieldValue는 antd FormInstance API를 그대로 노출하고, form.useWatch는 Form.useWatch를 이 폼 인스턴스에 바인딩해 노출한 래퍼다"로 고쳐 래퍼가 하는 일을 정확히 밝혀라.
- **🟡 Low · 구조·가독성**
  - 위치: "화면 상태를 표로 정리하기" 표의 "일반 대기 정보" 등 화면 이름
  - 문제: 표의 화면 이름("일반 대기 정보", "완료 정보와 연결된 쿠폰")과 이후 렌더러 코드의 컴포넌트명(WaitingDescriptions, CompletedDescriptions, CouponDescriptions)이 독자 머릿속에서 자동으로 이어지지 않는다. 표가 이후 코드의 지도 역할을 하려면 매핑이 보여야 한다.
  - 제안: 표에 '컴포넌트' 열을 추가해 각 행을 CouponDescriptions / WaitingDescriptions / CompletedDescriptions / CanceledDescriptions에 대응시켜라. 이러면 렌더러 섹션의 match 분기가 표의 행을 코드로 옮긴 것임이 한눈에 드러난다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "discriminated union으로 모든 상태를 모델링하려 했지만" / "완전한 판별 유니언이 아니고" / "API가 이 구조를 보장하므로 client에서 다른 union인 것처럼" / "별도 client model에 추가했다"
  - 문제: 같은 개념이 'discriminated union', '판별 유니언', 'union', '유니언'으로, 'client'와 '클라이언트'가 영문/한글로 혼재한다.
  - 제안: 첫 등장에서 "판별 유니언(discriminated union)"으로 병기한 뒤 '판별 유니언'으로 통일하고, 'client에서' → '클라이언트에서', '별도 client model' → '별도 클라이언트 모델'로 한글 표기로 통일하라.
- **🟡 Low · 익명화**
  - 위치: "시술 결제 내역은 결제수단 하나만 보고 화면을 결정할 수 없었다." (도입부)
  - 문제: 회사명·서비스명·내부 식별자는 없지만 '시술'이라는 단어가 의료·미용 업종을 드러낸다. 같은 시리즈의 다른 글('병원')과 함께 보면 업종 특정이 더 쉬워진다.
  - 제안: 업종까지 가리는 것이 시리즈 방침이라면 '시술 결제 내역' → '서비스 결제 내역' 또는 '예약 건 결제 내역'으로 일반화하라. 업종 공개를 의도했다면 그대로 두되 시리즈 전체에서 수위를 통일하라.

### 23. FSD 2.1의 pages-first를 멀티앱 모노레포에 적용한 기준

`post-23-fsd-2-1.md` · 발행 준비도 **7.5/10**

질문 전환("feature인가 entity인가" → "page 밖으로 꺼낼 이유가 있는가")이라는 프레임이 글 전체를 일관되게 관통하고 익명화도 자연스러운, 완성도 높은 글이다. 다만 slice group 예시의 common/ 폴더가 본문에서 인용한 FSD 규칙과 충돌해 보이는 점과 일부 반복·용어 혼용을 정리하면 발행 가능하다.

**잘된 점**

- "이게 feature인가 entity인가"라는 질문을 "지금 이 코드를 page 밖으로 꺼내야 할 이유가 생겼는가"로 바꾸는 도입부 프레임이 강력하고, 이 프레임이 마지막 문단까지 일관되게 유지된다.
- "여기서 package에 있다는 사실과 FSD 레이어는 같은 개념이 아니다"처럼 물리적 패키지 위치와 FSD 레이어 개념을 분리해 설명한 부분이 모노레포 독자에게 실질적인 통찰을 준다.
- 마지막의 5단계 판단 순서가 재사용 가능한 체크리스트로 잘 정리되어 있고, "추상화의 비용을 지불할 사용처가 이미 있는지 확인하는 절차"라는 요약이 정확하다.
- 회사명·서비스명 없이 CMS/병원 관리자라는 일반 명칭과 reservation, coupon 같은 일반 도메인 명사만 사용해 익명화가 어색함 없이 처리됐다.

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "entity 안에서도 필요한 파일부터 둔다" 섹션 — entities/settlement/ 하위의 common/, contract/, deposit/, omission/ 구조와 그 아래 "같은 group 안의 slice가 서로 자유롭게 import해도 된다는 뜻은 아니다"
  - 문제: FSD 2.1 slice groups 문서는 그룹 폴더 안에 공유 코드를 두지 말라고 명시하는데, 예시 구조에 common/이 포함되어 있어 바로 뒤에서 인용한 규칙과 충돌해 보인다. 독자가 "규칙을 인용하면서 스스로 어기는 구조"로 읽을 수 있다.
  - 제안: common/이 규칙을 어떻게 지키는지 한 문장 추가한다. 예: "common은 그룹 내 공유 폴더가 아니라 자체 public API를 가진 하나의 slice이며, FSD의 @x cross-import 표기로만 참조한다" 또는 의도적 절충이라면 "공식 가이드와 달리 그룹 내 공통 slice를 허용하는 절충을 택했다"라고 명시한다.
- **🟠 Medium · 구조·가독성**
  - 위치: "폼이라고 모두 feature로 옮기지는 않는다" 섹션 — "orchestration은 app에 남긴다"(불릿), "각 앱의 feature에 남겼다", "제출 순서는 각 앱의 feature에 남겨 UI 재료만 공유했다"
  - 문제: "UI 재료는 공유하고 제출 흐름은 각 앱에 남긴다"는 같은 내용이 한 섹션 안에서 세 번(불릿, 예시 문단, 마지막 문단) 반복된다.
  - 제안: 마지막 문단은 "공통 FormItem과 폼 함수를 entities가 아니라 packages/features/program에 둔 이유"(레이어 선택 근거)만 남기고, "제출 순서는 각 앱의 feature에 남겨 UI 재료만 공유했다" 문장은 삭제한다.
- **🟠 Medium · 맞춤법·표기**
  - 위치: 글 전체 — "두 앱이 같은 도메인을"(도입부) vs "두 app이 공유하는 사용자 행위", "두 app의 동작과 생명주기", "page에서 시작한다" vs "우선 페이지에 둔다", "form을 '사용자 행위'라고 보고" vs "프로그램 폼은"
  - 문제: 앱/app, 페이지/page, 폼/form의 한·영 표기가 문장마다 뒤섞여 있어 교정되지 않은 인상을 준다.
  - 제안: 일반 명사(앱, 페이지, 폼)는 한글로 통일하고, FSD 레이어·폴더명(pages, entities, features, shared)만 영문 소문자로 유지하는 규칙을 정해 전체를 일괄 수정한다.
- **🟡 Low · 구조·가독성**
  - 위치: 도입부 "250개가 넘는 레거시 파일을 FSD 구조로 옮길 때"
  - 문제: 도입부의 마이그레이션 규모(250개 파일)가 본문과 결론에서 다시 언급되지 않아, 훅으로 던진 숫자가 회수되지 않는다. 이관의 결과나 효과가 없어 글이 기준 설명에서 끝난다.
  - 제안: 결론에 결과를 한두 문장 추가한다. 예: "250여 개 파일 중 실제로 packages로 올라간 것은 두 앱이 함께 쓰는 일부였고, 나머지는 각 앱의 page와 modules에 남았다"처럼 판단 기준이 실제 분포로 이어졌음을 보여준다. 구체 수치가 없다면 도입부를 "레거시 파일 250여 개" 수준으로 완화한다.
- **🟡 Low · 구조·가독성**
  - 위치: "처음에는 page에 둔다" 섹션의 디렉터리 예시 apps/cms/src/app/coupon/template/
  - 문제: Next.js App Router에서 template는 특수 파일(template.tsx)과 이름이 겹쳐, 독자가 라우트 세그먼트가 아니라 Next.js 특수 파일 구조로 오독할 수 있다.
  - 제안: 예시 세그먼트명을 coupon/list나 coupon/templates 같은 덜 헷갈리는 이름으로 바꾸거나, "(쿠폰 템플릿 관리 화면의 라우트)"라는 짧은 설명을 코드 블록 아래 덧붙인다.
- **🟡 Low · 톤·문체**
  - 위치: "이 지연 분해 방향을 이하 pages-first라고 부른다."
  - 문제: "이하 ~라고 부른다"는 논문·계약서 투라 블로그 문체와 어긋나고, 문장 위치도 앞뒤 인과 설명 사이에 끼어 흐름을 끊는다.
  - 제안: "이 글에서는 이 지연 분해 방식을 pages-first라고 부르겠다."로 바꾸고, 가능하면 해당 문단 끝으로 이동한다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "그래서 group은 폴더가 많다는 이유보다 독립된 업무 흐름이 반복해서 드러났을 때 사용했다."
  - 문제: "~이유보다"(비교)와 "~때 사용했다"(시점)가 호응하지 않아 비문에 가깝다.
  - 제안: "그래서 group은 폴더가 많아졌다는 이유가 아니라, 독립된 업무 흐름이 반복해서 드러났을 때 도입했다."로 수정한다.

### 24. 프로토타입을 실사용 서비스로 옮기며 작업 규칙을 먼저 만든 이유

`post-24-prototype-rules.md` · 발행 준비도 **7/10**

과한 규칙을 만들었다가 조건부 규칙으로 되돌린 실패 경험을 축으로 삼아 설득력이 있고, Suspense·hydration·mutation 관련 기술 설명도 정확하다. 다만 mutation 스니펫의 before/after 구분, 'skill' 용어 정의 등 독자 입장의 손질이 필요하다.

**잘된 점**

- "hook으로 얻을 수 있으면 prop으로 넘기지 않는다"는 과한 규칙을 만들었다가 조건과 반례를 붙여 고친 과정을 실패 사례로 솔직하게 제시해, 연출 없이 판단 중심으로 읽힌다.
- Suspense가 hydration 불일치까지 해결하지 않는다는 구분, useSearchParams의 CSR bailout, mutation.variables 활용 조건 등 기술 설명이 모두 정확하고 공식 문서 링크로 뒷받침된다.
- 완료 기준을 체크리스트로 명시해 '빨리 끝났다는 인상'이 아닌 검증 가능한 조건으로 전환을 설명하며, 이는 시리즈의 과장 제거 목표에 부합한다.
- 회사명·서비스명·내부 식별자가 남아 있지 않고, Jira·Claude Code·Next.js 같은 공개 도구명만 유지돼 익명화 기준을 충족한다.

**수정 지적**

- **🟠 Medium · 구조·가독성**
  - 위치: "성공 여부와 마지막 제출 값을 local state와 ref에 다시 저장한 코드가 있었다." 뒤의 코드 블록 (const mutation = useMutation...)
  - 문제: 본문은 '중복 저장한 문제 코드가 있었다'고 설명하는데 바로 아래 스니펫은 중복을 제거한 수정 후 코드다. 라벨이 없어 독자가 스니펫을 문제 코드로 오독하기 쉽다.
  - 제안: 스니펫 앞에 "중복 저장을 제거하면 mutation 상태에서 그대로 파생할 수 있다" 같은 한 줄을 추가하거나, useState·useRef로 중복 저장하던 before 코드를 짧게 함께 보여준다.
- **🟠 Medium · 구조·가독성**
  - 위치: "서비스 작업용 skill에는 다음 순서를 넣었다."
  - 문제: 'skill'이 Claude Code의 저장소 내 지침 문서라는 정의 없이 등장한다. Claude Code를 모르는 독자는 이 핵심 용어를 이해할 수 없고, 글 전체(별도 skill, skill에 반영)에서 반복 사용된다.
  - 제안: 첫 등장 시 짧게 정의한다. 예: "서비스 작업용 skill(Claude Code가 작업 시작 시 불러 읽는, 저장소에 두는 지침 문서)에는 다음 순서를 넣었다."
- **🟡 Low · 구조·가독성**
  - 위치: 수정 전 코드(Page → Section → ProductCard)와 수정 후 코드(ProductName 등장)
  - 문제: 수정 전 예제에는 없던 ProductName 컴포넌트가 수정 후에만 등장해, prop 전달 제거 외에 컴포넌트 분리까지 함께 일어난 것으로 혼동될 수 있다.
  - 제안: 수정 전 코드에도 ProductCard가 ProductName에 locale을 넘기는 형태를 포함시켜 before/after의 구조를 맞추거나, "순수 UI 부분을 ProductName으로 분리했다"는 설명을 한 줄 추가한다.
- **🟡 Low · 기술 정확성**
  - 위치: "비동기 page props는 현재 Next.js 버전의 타입에 맞춰 먼저 `await`한다."
  - 문제: '현재 Next.js 버전'이 모호하다. params·searchParams가 Promise가 된 것은 Next.js 15의 구체적인 변경이고, Next.js는 공개 기술명이라 익명화 대상이 아니므로 버전을 숨길 이유가 없다.
  - 제안: "Next.js 15부터 Promise가 된 page props(params, searchParams)는 사용 전에 먼저 `await`한다"로 구체화한다.
- **🟡 Low · 기술 정확성**
  - 위치: "가장 효과가 컸던 것은 command 개수가 아니라 같은 지적이 다음 화면에서 반복되지 않은 일이었다."
  - 문제: 핵심 성과 주장인데 구체 근거 없이 일반 진술로만 서술된다. 도입부에서 든 hydration 문제·번역 누락·폼 초기화 오류 사례와 연결되지 않아 주장이 다소 공허하게 읽힌다.
  - 제안: 앞에서 든 사례 중 하나를 근거로 연결한다. 예: "규칙을 적은 뒤 옮긴 화면들에서는 초기에 반복되던 마운트 지연 gate와 번역 누락 지적이 다시 나오지 않았다"처럼 구체화한다.
- **🟡 Low · 구조·가독성**
  - 위치: "viewport도 표시만 달라진다면 JavaScript hook보다 CSS media query를 우선한다." 문단
  - 문제: locale 예제 뒤에 한 문단으로 고립돼 있고, 다음 섹션의 규칙 목록("표시 차이는 가능한 CSS media query로 처리한다")과 내용이 중복된다.
  - 제안: 이 문단을 삭제하고 '마운트 지연과 Suspense' 섹션의 규칙 목록으로 통합하거나, 조건부 규칙의 두 번째 사례로 명시적으로 소개("viewport 규칙도 같은 방식으로 조건을 붙였다")한다.
- **🟡 Low · 톤·문체**
  - 위치: "빠르게 끝났다는 인상만으로 실사용 전환을 설명하지 않기 위해 완료 조건을 명시했다."
  - 문제: '전환을 설명하지 않기 위해'가 모호해 문장의 의도(인상이 아닌 조건으로 완료를 판단한다)가 바로 전달되지 않는다.
  - 제안: "빠르게 끝났다는 인상만으로 전환이 끝났다고 판단하지 않도록 완료 조건을 명시했다"로 고친다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "표시 차이는 가능한 CSS media query로 처리한다."
  - 문제: '가능한'을 부사처럼 쓴 표현은 어법에 맞지 않는다. '가능한 한' 또는 '가능하면'이 맞다.
  - 제안: "표시 차이는 가능하면 CSS media query로 처리한다."로 수정한다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "항상 hook을 써라"(곧은따옴표) vs “hook으로 얻을 수 있으면 prop으로 넘기지 않는다”(굽은따옴표), 그리고 앞선 인용 "hook으로 얻을 수 있는 값은 prop으로 넘기지 않는다"
  - 문제: 따옴표 스타일이 곧은따옴표와 굽은따옴표로 섞여 있고, 같은 규칙을 인용한 문구도 두 곳에서 표현이 다르다. 제목·본문의 '실사용 서비스'와 '운영 서비스'도 혼용된다.
  - 제안: 따옴표를 한 스타일로 통일하고, 규칙 인용문은 "hook으로 얻을 수 있는 값은 prop으로 넘기지 않는다"로 두 곳을 동일하게 맞춘다. '실사용 서비스'/'운영 서비스'도 하나로 통일한다.

### 25. 테스트를 전부 지운 뒤 다시 만든 기준

`post-25-test-suite-rebuild.md` · 발행 준비도 **7/10**

삭제와 재작성이라는 긴장 구도로 시작해 계층별 보장 범위로 닫는 구성이 탄탄하고 한계 구분이 특히 모범적이다. 다만 hospitalId와 아랍어 로케일 조합이 서비스 도메인을 드러내는 익명화 구멍이며, '두 저장소'와 '관리자 모노레포'의 관계 같은 맥락 공백이 남아 있다.

**잘된 점**

- "자동 mutation testing을 구축한 것은 아니다. 수동 절차였고 이후의 모든 테스트에 적용했다고 말할 수도 없다", "이 계층도 완전하지 않다"처럼 완료한 것과 하지 않은 것을 반복적으로 구분해, 시리즈 목표인 한계 구분을 가장 잘 지킨 글이다.
- 수치가 본문 안에서 정합적이다. 26개 시나리오 중 25개 커버 → 마무리의 "대표 E2E가 없는 시나리오가 하나 남아 있고"가 정확히 맞아떨어진다.
- FormHarness를 만들었다가 다음 날 지운 실패 사례를 숨기지 않고 "테스트가 제품의 결정을 대신하는 경우"라는 판단 기준으로 승화시킨 서술이 설득력 있다.
- 도입부 훅이 강하다. "테스트 23개를 모두 지웠다" → "몇 달 뒤 116개를 다시 만들었다"는 모순 제시가 독자를 바로 붙잡는다.

**수정 지적**

- **🔴 High · 익명화** _(재검증 확정)_
  - 위치: MSW 스니펫의 `hospitalId: z.number().int().positive()`와 `locale: z.enum(['ko', 'en', 'ar'])`
  - 문제: `hospitalId`는 백엔드 DTO에서 온 내부 식별자로 서비스가 병원 도메인임을 드러내고, 한국어·영어·아랍어라는 로케일 조합까지 더해지면 어떤 서비스인지 상당히 좁혀진다. 시리즈 목표 (1) 내부 코드 식별자 익명화에 어긋난다.
  - 제안: `hospitalId`를 `partnerId`나 `storeId` 같은 중립 식별자로 바꾸고, 로케일 enum은 `['ko', 'en']` 정도로 일반화한다. 예제의 논지(서버 계약을 Mock에 옮긴다)는 필드명이 바뀌어도 그대로 성립한다.
- **🟠 Medium · 구조·가독성**
  - 위치: "입사 초기에 두 저장소의 Vitest 테스트 파일 23개를 모두 지웠다" ↔ "관리자 모노레포에서 19일 동안 102개 파일을 추가했다"
  - 문제: 지운 대상은 '두 저장소'인데 재작성 무대는 '관리자 모노레포'라서, 모노레포가 두 저장소 중 하나인지 제3의 저장소인지 독자가 매핑할 수 없다. 삭제→재작성 대비가 글의 축인데 무대가 어긋나 보이면 수치의 신뢰도도 흔들린다.
  - 제안: 사실관계에 맞게 한 문장으로 관계를 밝힌다. 예: "몇 달 뒤에는 그중 관리자 모노레포에서 반대로 테스트를 대규모로 다시 만들었다" 또는 두 저장소의 성격을 도입부에서 짧게 소개한다.
- **🟠 Medium · 구조·가독성**
  - 위치: 마지막 문단 "AI에게 작업을 맡길 때도 같은 기준을 쓴다."
  - 문제: 결론 직전까지 한 번도 등장하지 않은 'AI에게 작업 위임'이라는 새 주제가 마지막 문단에서 갑자기 나온다. 앞 내용과의 연결 고리 없이 붙어 있어 마무리의 초점이 흩어진다.
  - 제안: "성공 조건이 코드로 적혀 있는가"라는 앞선 기준과 연결하는 문장을 한 줄 추가하거나(예: "이 기준은 사람에게만 적용되는 것이 아니다"), 분량을 늘릴 수 없다면 이 문단을 별도 글로 분리하고 여기서는 네 계층 요약으로 닫는다.
- **🟡 Low · 기술 정확성**
  - 위치: "테스트에서는 반복을 남긴다" 섹션의 `expect(window.location.search).toContain('couponDiscount=true')`
  - 문제: [확인 필요] jsdom 환경에서 `window.location.search`가 갱신되는지는 라우터 테스트 구성에 달려 있다. history API를 실제로 호출하는 구성이면 동작하지만, next-router-mock류의 더블은 window.location을 건드리지 않아 이 단언이 항상 빈 문자열과 비교될 수 있다.
  - 제안: `renderSearchPage()`가 어떤 라우터 구성으로 렌더하는지 한 줄 언급하거나(예: "테스트 라우터가 history API를 실제로 호출하도록 구성했다"), 실제 코드에서 이 단언이 회귀를 잡는지 재확인한다.
- **🟡 Low · 익명화**
  - 위치: "8월 11일 기준 실서버 테스트 파일은 17개였다."
  - 문제: 연도 없는 특정 날짜는 공개 글에서 사내 기록처럼 읽히고, 독자에게는 기준 시점 정보로서의 가치도 없다.
  - 제안: "이 글을 쓰는 시점 기준 실서버 테스트 파일은 17개다"처럼 상대 표현으로 바꾸거나, 남기려면 연도를 포함한다.
- **🟡 Low · 구조·가독성**
  - 위치: "직접 테스트가 없는 proxy 분기도 있다."
  - 문제: 'proxy 분기'가 무엇의 프록시인지(Next.js rewrite, BFF, MSW passthrough 등) 맥락이 전혀 없어, 글에서 처음 등장하는 이 용어를 독자가 해석할 수 없다.
  - 제안: 괄호로 짧게 정체를 밝히거나(예: "API 프록시 라우트의 분기"), 설명을 붙일 수 없다면 이 항목은 삭제해도 문단의 논지는 유지된다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "실제 서버와 다른 Mock" / "실서버 등록은 400으로 실패" 및 “초록색이 무엇을 보장하는가” / "통합 테스트는 초록색인데"
  - 문제: '실제 서버'와 '실서버'가 혼용되고, 인용 부호도 유니코드 곡선 따옴표(“ ”)와 일반 표기가 섞여 있다.
  - 제안: 본문 전체에서 '실서버'로 통일하고(첫 등장 시 "실서버(개발 서버)"로 정의), 따옴표는 한 가지 스타일로 통일한다.

### 26. 선언적 코드는 변경을 작게 만든다

`post-26-declarative-code.md` · 발행 준비도 **7/10**

각 패턴마다 "언제 쓰지 않는가"를 함께 제시하는 균형 잡힌 판단 서술이 강점이지만, 변환·실행 분리 예시에서 리팩터링 후 encodeURI가 사라지는 동작 불일치, 헤딩 없이 테스트 섹션에 붙어 있는 결론, 나열식 섹션 구성의 연결 고리 부족을 손보면 좋다.

**잘된 점**

- 거의 모든 섹션이 반례를 함께 제시한다("모든 handler를 커링하지는 않는다", "enabled가 나쁘다는 뜻은 아니다", "한 화면에서 한 번 쓰는 컴포넌트에 팩토리를 만들지는 않는다") — 패턴 소개 글이 빠지기 쉬운 만능 처방 톤을 피했다.
- "테스트는 실패했을 때 다시 읽는 문서다", "JSX 조합은 열어 두고 잘못된 필드명만 닫은 셈이다" 같은 기준 문장이 짧고 명확해 각 섹션의 판단 근거가 잘 드러난다.
- 데이터 기반 FilterRenderer vs 컴포넌트 나열의 before/after 대비가 구체적이고, satisfies를 활용한 FILTER_CHIPS 예시는 실제로 동작하는 타입 설계다.
- 병원 검색·예약·프로그램이라는 일반 도메인 예시만 사용해 회사·서비스 식별 정보 없이 익명화가 자연스럽다.

**수정 지적**

- **🟠 Medium · 기술 정확성**
  - 위치: "변환과 실행을 섞지 않는다" 섹션 — before의 router.push(encodeURI(url))와 after의 createProgramHref = (programId) => `/program/${programId}?from=list`
  - 문제: 리팩터링 전 코드에는 encodeURI가 있는데 후 코드에서는 인코딩이 사라져, 동작을 보존해야 할 before/after 예시가 동작을 바꾼다. 게다가 바로 아래에서 "encodeURIComponent는 값을 반환하는 함수에 둔다"고 말해 혼란이 커진다.
  - 제안: createProgramHref 안에서 인코딩을 수행하도록 고치거나(예: `/program/${encodeURIComponent(String(programId))}?from=list`), 숫자 ID라 인코딩이 불필요해 제거했다는 설명을 한 줄 추가해 before/after의 차이를 의도된 것으로 만든다.
- **🟠 Medium · 구조·가독성**
  - 위치: 마지막 두 문단 "데이터 구조가 같고 개수만 달라질 때는 map을 쓴다. ..." ~ "...변경 지점이 잘 보이는지가 더 중요하다."
  - 문제: 글 전체의 결론에 해당하는 두 문단이 헤딩 없이 "테스트도 한눈에 읽혀야 한다" 섹션 아래에 붙어 있어, 테스트 이야기의 연장으로 읽히고 결론임이 드러나지 않는다.
  - 제안: "## 정리" 같은 헤딩을 추가하거나, 최소한 "정리하면," 같은 전환 표지를 첫 문장에 넣어 결론 문단임을 표시한다.
- **🟠 Medium · 구조·가독성**
  - 위치: 섹션 구성 전체 — "커링으로 클릭 핸들러의 두 입력을 구분한다", "실행할 수 없는 Query는 skipToken으로 표현한다", "파생값은 다시 저장하지 않는다" 등
  - 문제: 10개 섹션이 나열식으로 이어지는데, 후반부 섹션들(커링, skipToken, 파생값, 테스트)은 제목이 내건 "선언적 코드 = 변경이 한 구획에 보이는 구조"와의 연결 문장이 없어 독립된 팁 모음처럼 읽힌다.
  - 제안: 각 섹션 끝에 "이 방식이 다음 변경을 어디에 국한시키는가"를 한 문장씩 붙이거나, 섹션들을 3~4개 묶음(구성을 나열로 드러내기 / 계약을 타입으로 고정하기 / 값과 실행 분리하기 / 검증)으로 그룹핑하는 상위 헤딩을 도입한다.
- **🟡 Low · 기술 정확성**
  - 위치: skipToken 예시 — queryFn: programId ? () => getProgramDetail(programId) : skipToken
  - 문제: truthy 검사라서 programId가 0이면 유효한 ID인데도 skip된다. 또한 [확인 필요] 클로저 안에서 programId가 number로 좁혀지는 것은 TS 5.4+의 클로저 내로잉 유지에 의존하므로, 이전 버전 독자는 컴파일 에러를 만날 수 있다.
  - 제안: `programId != null ? () => getProgramDetail(programId) : skipToken`으로 바꿔 0 문제를 없애고, TS 버전 의존이 걱정되면 조건 앞에서 `const id = programId`로 받아 사용하는 형태를 보여준다.
- **🟡 Low · 한계 구분**
  - 위치: "단위 테스트는 순수 변환과 경곗값, 통합 테스트는 컴포넌트와 API의 연결, E2E는 브라우저 탐색, 실서버 테스트는 실제 계약의 차이를 맡긴다."
  - 문제: [확인 필요] 4개 테스트 계층을 모두 운영 중인 것처럼 완료형 현재 서술로 읽힌다. 실제로 전 계층이 갖춰져 있지 않다면 시리즈 목표(미구현을 완료된 것처럼 쓰지 않기)에 어긋난다.
  - 제안: 실제 구축된 계층만 사실 서술로 남기고 나머지는 "~로 역할을 나누는 것을 기준으로 삼는다" 같은 원칙 서술로 바꾸거나, "현재는 단위·통합까지 갖췄고 E2E는 도입 중이다"처럼 상태를 한 문장으로 밝힌다.
- **🟡 Low · 톤·문체**
  - 위치: "unsafe assertion은 팩토리 안 한 곳에 가두고"
  - 문제: "안 한 곳"이 "하지 않은 곳"으로 오독되기 쉬운 띄어쓰기·표현이다.
  - 제안: "unsafe assertion은 팩토리 내부의 한 곳에 가두고"로 수정한다.
- **🟡 Low · 톤·문체**
  - 위치: "38개 이상의 프로그램 필드에서 문자열 오타를 모두 상수로 옮겨도 반환값의 any는 남았다."
  - 문제: "오타를 상수로 옮긴다"는 표현이 비논리적이다. 옮기는 대상은 필드명 문자열이고, 그 결과로 오타를 막는 것이다.
  - 제안: "38개가 넘는 프로그램 필드의 이름 문자열을 상수로 옮겨 오타는 막을 수 있었지만, 반환값의 any는 그대로 남았다."로 수정한다.
- **🟡 Low · 구조·가독성**
  - 위치: 도입부 "VOC나 예외가 추가돼도" 및 결론 "다음 VOC가 들어왔을 때"
  - 문제: VOC 약어가 정의 없이 사용된다. 공개 블로그 독자 중 이 약어에 익숙하지 않은 사람이 도입 첫 문단에서 걸릴 수 있다.
  - 제안: 첫 사용에서 "VOC(고객 문의)나 예외가 추가돼도"처럼 병기하고 이후에는 VOC만 쓴다.
- **🟡 Low · 맞춤법·표기**
  - 위치: "커스텀 훅"(도입부) vs "custom hook이라는 형태만으로"(한 번 쓰는 로직 섹션), "loading 여부"(파생값 섹션)
  - 문제: 같은 용어의 한·영 표기가 섹션마다 다르다(커스텀 훅/custom hook, loading/로딩).
  - 제안: 일반 용어는 한글(커스텀 훅, 로딩)로 통일하고, API·코드 식별자(skipToken, enabled, queryFn)만 코드 서체 영문으로 유지한다.

### 27. 오류는 남기고 화면은 덜 잃게 만든 에러 처리 개편

`post-27-error-boundary.md` · 발행 준비도 **8/10**

복구 단위 관점의 Error Boundary 재설계를 '무엇을 관측하고, 무엇을 기록하고, 어디까지 멈출 것인가'라는 판단 축으로 풀어낸 완성도 높은 글입니다. 편집 노트처럼 읽히는 메타 문장 정리와 미설명 내부 식별자 보강, 표기 통일 정도만 하면 발행 가능한 수준입니다.

**잘된 점**

- 도입부가 '목록 API 하나 실패에 사이드 메뉴·헤더까지 사라진다'는 구체적 장애 상황으로 시작해 문제의식이 즉시 전달되고, 이어지는 세 가지 결정(검사 위치·기록 범위·멈춤 범위)이 본문 섹션 구조와 정확히 대응합니다.
- 'safeParse로 관측 먼저, 차단은 데이터 성격에 따라'라는 단계적 도입 판단과 그 근거(운영 화면 보호, key 유실 위험)가 설득력 있게 서술되어 있습니다.
- componentStack 자동 수집 철회, 문서 규칙의 실패와 ESLint 강제 전환 등 실패·철회 과정을 그대로 기록해 신뢰감을 줍니다. '자동으로 채울 수 있다는 것보다 운영에서 실제로 읽을 수 있는지가 중요했습니다' 같은 문장이 시리즈 목표(판단 중심 서술)에 잘 부합합니다.
- factory 계획은 미구현으로, 상세 선언 위치 검증은 '아직 눈으로 본다'로 명시하는 등 완료와 미완의 구분이 전반적으로 정확하고, 회사명·서비스명·실제 도메인 노출도 발견되지 않았습니다.

**수정 지적**

- **🟠 Medium · 톤·문체**
  - 위치: "현재 구현과 계획은 구분해서 적습니다. URL을 읽는 쪽의 schema 검증은 적용됐고, 모든 이동 호출부를 factory로 제한하는 작업은 아직 하지 않았습니다."
  - 문제: 첫 문장이 독자를 향한 서술이 아니라 수정본 시리즈의 편집 방침을 그대로 노출한 메타 문장으로 읽힙니다. 퇴고 과정의 노트가 본문에 남은 인상을 줍니다.
  - 제안: 첫 문장을 삭제하고 사실 서술만 남기세요. 예: "정리하면 URL을 읽는 쪽의 schema 검증은 적용된 상태고, 모든 이동 호출부를 factory로 묶는 작업은 아직 계획 단계입니다."
- **🟠 Medium · 구조·가독성**
  - 위치: ESLint 규칙 표의 "`no-overlay-boundary` — `overlay.open` 안에서 `QueryErrorBoundary` 중복" 및 "`createSearchFilter`가 만든 루트가 자기 children을 section 바운더리로 감쌀 수 있게 됐습니다"
  - 문제: `overlay.open`과 `createSearchFilter`는 본문 어디에도 소개되지 않은 내부 API여서 독자가 무엇인지 알 수 없습니다. 앞선 compound 예시에는 `<SearchFilter>`만 등장하므로 `createSearchFilter`는 특히 갑작스럽습니다.
  - 제안: `overlay.open`에는 한 줄 설명을 붙이거나("모달·Drawer를 명령형으로 여는 내부 overlay 유틸") 규칙 설명을 "오버레이 열기 함수 내부의 바운더리 중복"으로 일반화하고, `createSearchFilter`는 "SearchFilter를 만드는 factory"라고 한 줄 소개하거나 그냥 "SearchFilter 루트가"로 바꾸세요.
- **🟠 Medium · 구조·가독성**
  - 위치: "App Shell / Route Boundary / Page Boundary / List Section Boundary..." 트리와 "구현에서는 세 variant를 사용합니다"
  - 문제: 개념 트리는 Route·Page·Section·Overlay 네 층인데 구현 variant는 page·section·overlay 세 개라, Route Boundary가 어떤 variant로 구현되는지(또는 별도 존재인지) 대응 관계가 설명되지 않습니다.
  - 제안: 트리 직후에 대응을 한 줄로 명시하세요. 예: "Route와 Page 층은 page variant 하나로, Section 층은 section, Overlay 층은 overlay로 구현했습니다." 또는 트리 자체를 variant 기준 세 층으로 단순화하세요.
- **🟠 Medium · 톤·문체**
  - 위치: "`destroyOnHidden` 탭이 헐릴 때도 마찬가지고요."
  - 문제: '헐리다'는 건물 철거에 쓰는 표현이라 어색하고, `destroyOnHidden`이 어떤 라이브러리의 prop인지 맥락이 없어 처음 보는 독자는 이해하기 어렵습니다.
  - 제안: "`destroyOnHidden`이 걸린 탭에서 숨겨진 콘텐츠가 언마운트될 때도 마찬가지고요."처럼 풀어 쓰고, 필요하면 탭 컴포넌트의 옵션임을 짧게 언급하세요.
- **🟡 Low · 기술 정확성**
  - 위치: "export function parseApiResponse<T>(schema: z.ZodType, response: AxiosResponse<T>): T"
  - 문제: `schema: z.ZodType`은 `T`와 타입 관계가 없어, 응답 타입과 무관한 스키마를 넘겨도 컴파일러가 잡지 못합니다. 코드 자체는 동작하지만 '타입 선언과 런타임 계약이 한 파일에 놓였다'는 글의 취지와 시그니처가 어긋납니다.
  - 제안: `schema: z.ZodType<T>`로 좁혀 스키마와 응답 제네릭을 묶으세요. `z.infer`로 추론한 타입을 쓰는 흐름과도 자연스럽게 이어집니다.
- **🟡 Low · 기술 정확성**
  - 위치: "레이아웃을 직접 그리는 것 44곳, 페이지 레이어에 위임하는 것 4곳, ListView에 통째로 맡기는 것 4곳" 및 "내부 운영 백오피스의 라우트 30개를 합치면 1,000줄 넘게 줄었습니다"
  - 문제: 앞의 집계(합계 52곳)와 뒤의 '라우트 30개'가 각각 어느 앱 범위의 수치인지 밝히지 않아, 주의 깊은 독자는 수치가 모순처럼 느낄 수 있습니다.
  - 제안: 각 수치에 범위를 붙이세요. 예: "세 앱 전체 라우트 52곳 중…", "이 중 내부 운영 백오피스에 속한 라우트 30개를 합치면…"처럼 집계 모수를 명시하면 됩니다.
- **🟡 Low · 구조·가독성**
  - 위치: 마지막 문단 "CloudWatch에서 재현할 화면을 찾는 정보"
  - 문제: CloudWatch가 결론에서 처음 등장합니다. 본문의 로그 섹션("로그에는 재현할 위치를 남겼다")에서는 로그가 어디로 수집되는지 언급이 없어, 결론에서 갑자기 구체적 제품명이 나오는 흐름이 어색합니다.
  - 제안: 로그 섹션에서 수집처를 먼저 언급하거나, 결론에서는 "로그 시스템에서 재현할 화면을 찾는 정보"로 일반화하세요.
- **🟡 Low · 톤·문체**
  - 위치: "기존 레거시 설계에선…" / "TypeScript로 정상으로 보이지만 서버가 새로운 enum이나 `null`을 보내면"
  - 문제: '기존 레거시'는 의미가 중복되고, 'TypeScript로 정상으로 보이지만'은 조사가 어색해 번역투처럼 읽힙니다.
  - 제안: "레거시 설계에선" 또는 "기존 설계에선"으로 줄이고, 후자는 "TypeScript 타입상으로는 정상이지만"으로 고치세요.
- **🟡 Low · 맞춤법·표기**
  - 위치: "schema에 빠뜨리면 … 스키마와 Mock에 반영했고요 … 모든 Zod 스키마가 … 해당 schema의 fallback" / "Error Boundary·Boundary·바운더리" 혼용
  - 문제: 같은 개념이 schema/스키마, Boundary/바운더리로 오가며 표기가 일관되지 않습니다. 또한 "운영 화면에서 아직 사용 중인 필드를 schema에 빠뜨리면"은 '스키마에서 빠뜨리면'이 자연스럽습니다.
  - 제안: 표기 기준을 정하세요. 예: 코드 식별자를 가리킬 때만 `schema`, 본문 서술은 '스키마'·'바운더리'로 통일. 해당 문장은 "필드를 스키마에서 빠뜨리면"으로 수정하세요.

### 28. Nextjs를 사용하면서 겪었던 이슈들

`post-28-next-server-to-client.md` · 발행 준비도 **7/10**

라우터 캐시·프록시·서버 액션 세 이슈를 '서버에 맡기던 동작을 클라이언트로 옮긴 결정과 그 비용'이라는 축으로 묶고, 부채 회수 조건까지 명시한 밀도 높은 글입니다. 다만 제목과 도입부가 본문 완성도에 못 미치고, 오타와 표기 정리, 검증 불가한 버전·이슈 번호의 발행 전 재확인이 필요합니다.

**잘된 점**

- '프로덕션 빌드에서만 재현된다'는 조건을 찾아 검증 방법을 `pnpm build && pnpm start`로 바꾼 과정, 관리자 목록 7개 중 6개 재현 같은 구체적 디버깅 서사가 살아 있습니다.
- 업스트림 이슈·PR을 추적해 React Flight의 crossOrigin 정규화(use-credentials가 아니면 anonymous 처리), 매니페스트 직렬화 변화까지 코드 레벨로 파고든 깊이가 돋보이며, 이 동작 설명들은 실제 React 동작과 일치합니다.
- '우회를 걷어낼 조건' 섹션이 부채 네 건과 회수 시점을 목록으로 명시해, 완료와 미구현의 구분이라는 시리즈 목표에 가장 충실합니다. "부채로 적어둡니다", "아직 고치지는 않았습니다" 같은 문장도 일관됩니다.
- httpOnly 해제의 보안 비용을 과장 없이 정확히 서술합니다. 만료 주기 단축을 '차단이 아니라 완화'로 구분하고, 실제 노출 창을 refreshToken 수명으로 평가한 부분은 기술적으로도 타당합니다. 회사명·도메인 노출 없이 익명화도 잘 유지됐습니다.

**수정 지적**

- **🔴 High · 맞춤법·표기** _(재검증 확정)_
  - 위치: "stage 환경에서 관리자 목록 화면 검색이 안 된되는 이슈가 있었습니다."
  - 문제: 첫 섹션 첫 문장에 '안 된되는'이라는 오타가 있습니다. 도입 직후라 글 전체의 신뢰도에 바로 영향을 줍니다.
  - 제안: "검색이 안 되는 이슈가 있었습니다"로 수정하세요.
- **🟠 Medium · 맞춤법·표기**
  - 위치: 제목 "Nextjs를 사용하면서 겪었던 이슈들" 및 첫 문장 "Nextjs를 사용하며,"
  - 문제: 공식 표기는 'Next.js'입니다. 본문에서는 'Next'("Next에 대응이 없는 건 아닙니다", "Next 라우터")로도 쓰여 표기가 세 가지로 갈립니다. 첫 문장의 쉼표("사용하며,")도 어색합니다.
  - 제안: 제목·본문 모두 'Next.js'로 통일하고(문맥상 짧게 쓸 곳만 'Next 라우터' 허용), 첫 문장은 "Next.js를 쓰면서 문제를 세 번 만났습니다."로 다듬으세요.
- **🟠 Medium · 구조·가독성**
  - 위치: 제목 "Nextjs를 사용하면서 겪었던 이슈들"
  - 문제: 제목이 범용적인 트러블슈팅 모음처럼 보여, 글의 실제 관통 주제인 '서버·프레임워크에 맡기던 동작을 클라이언트로 옮긴 결정과 그 비용, 그리고 걷어낼 조건'을 전혀 담지 못합니다. 마지막 문단의 통찰이 제목에서 예고되지 않습니다.
  - 제안: 주제를 드러내는 제목으로 교체하세요. 예: "서버에 맡기던 일을 클라이언트로 옮긴 세 번의 결정, 그리고 걷어낼 조건" 또는 "Next.js에서 프레임워크 몫과 내 몫을 다시 가른 세 가지 이슈".
- **🟠 Medium · 구조·가독성**
  - 위치: 도입부 "관련된 문제를 세 번 만났습니다. 라우터 캐시, 프록시, 서버 액션에서…" 와 실제 5개 섹션 구성
  - 문제: 도입부는 '세 번'을 예고하지만 본문은 폼 관련 섹션 두 개("주소를 기준으로 삼자 폼이 따라오지 않았다", "프레임워크가 상태를 대신 남겨줘서…")를 포함해 다섯 섹션입니다. "비용은 나중에 다른 화면에서 드러났습니다"라는 문장이 있긴 하나, 뒤의 두 섹션이 그 '비용'이라는 관계가 명시되지 않아 구성이 어긋나 보입니다.
  - 제안: 도입부에 구조를 한 줄로 예고하세요. 예: "앞의 세 절은 각 문제와 대응을, 뒤의 두 절은 그 이동이 폼에서 만든 비용을 다룹니다."
- **🟠 Medium · 한계 구분**
  - 위치: "클라이언트에서 쓸 때 도메인과 경로를 서버가 쓰던 것과 똑같이 맞추거나, 이름을 새로 파고 옛 쿠키를 명시적으로 만료시켜야 합니다."
  - 문제: 쿠키 속성 함정에 대한 이 문장이 일반적 조언인지, 실제로 수행한 조치인지 구분되지 않습니다. 이 함정에 실제로 걸렸는지, 어느 방법을 택했는지 독자가 알 수 없어 이 문단만 완료/미완 구분이 흐립니다.
  - 제안: 실제 처리를 명시하세요. 예: "저희는 서버가 쓰던 도메인·경로와 똑같이 맞추는 쪽을 택했습니다." 미적용 상태라면 '우회를 걷어낼 조건' 목록처럼 부채로 명시하세요.
- **🟡 Low · 기술 정확성**
  - 위치: "문서에는 소스가 그대로여도 최대 14일 주기로 회전한다고 돼 있습니다."
  - 문제: [확인 필요] Next.js 문서의 14일 회전은 Vercel 호스팅 환경의 서버 액션 암호화 키 회전에 대한 설명으로 알고 있습니다. 자체 호스팅(글의 다른 정황상 AWS)이라면 '빌드마다 새 키·새 ID'가 실제 조건이라, 14일 주기가 이 서비스에 그대로 적용되는 것처럼 읽히면 부정확할 수 있습니다.
  - 제안: 인용 범위를 명시하세요. 예: "문서에 따르면 Vercel 환경에선 소스가 그대로여도 최대 14일 주기로 키가 회전하고, 자체 호스팅에선 빌드마다 바뀐다"처럼 배포 환경별 조건을 구분해 적으세요.
- **🟡 Low · 기술 정확성**
  - 위치: "#92187", "#94144", "#96831", "v16.3.1-canary.14", "8월 12일에 canary에 머지돼서", "안정 릴리즈에는 아직 없습니다" 등
  - 문제: [확인 필요] 특정 버전·이슈·PR 번호와 '안정 릴리즈에 아직 없다'는 시점 의존적 서술이 많습니다. 제 지식 범위에서 검증 불가한 최신 정보이며, 발행 시점에 이미 수정 릴리즈가 나왔다면 글의 결론(16.2.x 유지)이 낡은 정보가 됩니다. '8월 12일'에는 연도도 없습니다.
  - 제안: 발행 직전에 링크 유효성과 릴리즈 상태를 재확인하고, 날짜에 연도를 병기하세요(예: "2026년 8월 12일"). 시점 의존 서술에는 "이 글을 쓰는 시점 기준"을 붙이면 이후에도 안전합니다.
- **🟡 Low · 기술 정확성**
  - 위치: "const paramsKey = JSON.stringify(currentParams); const initialValues = useMemo(() => ({ ...defaultValues, ...currentParams }), [paramsKey]);"
  - 문제: 의존성 배열에 `currentParams` 대신 `paramsKey`를 쓴 것은 참조 동일성 문제를 피하려는 의도지만 exhaustive-deps 린트에 걸리는 패턴이고, JSON.stringify는 키 순서가 다르면 값이 같아도 다른 문자열을 만들어 불필요한 리셋을 유발할 수 있습니다. 블로그 코드는 그대로 복사되는 경우가 많아 전제를 밝힐 가치가 있습니다.
  - 제안: 코드에 짧은 주석을 추가하세요. 예: "// currentParams는 URL 파싱 결과라 키 순서가 안정적이다. 직렬화 키로 참조 변경에 의한 리셋을 막는다."
- **🟡 Low · 구조·가독성**
  - 위치: "목록에서 행을 눌러 상세를 열 때는 직전에 있던 파라미터 없는 주소가 캐시에 있어서 정상으로 보였습니다. 상세 주소로 바로 들어오면 캐시에 남아 있는 게 행 링크들이 미리 프리페치해 둔 `?id=…` 주소뿐이라, 파라미터를 지워도 원래 주소로 돌아갔습니다."
  - 문제: 두 시나리오(목록 경유 진입 vs 상세 직진입)의 캐시 상태 차이를 두 문장에 압축해 넣어, 앞의 캐시 키 설명을 완전히 소화한 독자가 아니면 두세 번 읽어야 이해됩니다.
  - 제안: 시나리오를 나눠 서술하세요. 예: "목록을 거쳐 들어온 경우: 직전의 파라미터 없는 주소가 캐시에 있어 정상 동작. 상세 URL로 바로 들어온 경우: 캐시에는 프리페치된 `?id=…` 주소뿐이라 파라미터를 지워도 그 주소로 되돌아감." 처럼 구조를 드러내면 읽기 쉬워집니다.
- **🟡 Low · 구조·가독성**
  - 위치: "사용자 웹에서는 반대 방향의 문제가 나왔습니다."
  - 문제: '사용자 웹'이라는 앱 명칭이 여기서 처음 등장합니다. 앞에서는 '관리자 목록 화면', '병원 관리자 앱'만 나왔기 때문에 별개의 앱이 하나 더 있다는 사실을 독자가 여기서 처음 추론해야 합니다.
  - 제안: 한 줄 소개를 붙이세요. 예: "관리자 앱과 별개로 일반 사용자가 쓰는 웹이 있는데, 여기서는 반대 방향의 문제가 나왔습니다."
