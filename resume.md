# 김진건

**Frontend Engineer** jingeon27@gmail.com | 010-6865-8208 | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 - 2028.06)

---

## Summary

급하게 만들어진 서비스를 넘겨받아 기술 부채를 정리하면서 신규 기능과 구조 개선을 같이 해온 프론트엔드 개발자입니다. 2026년 1월부터 세이프닥 복지몰·CMS·병원 CRM 세 서비스를 혼자 맡고 있습니다. React·Next.js(App Router)·TypeScript로 복잡한 사용자 흐름을 운영 가능한 구조로 정리하고, 받은 명세를 그대로 구현하기보다 사용자에게 더 나은 쪽이 뭔지 먼저 따져보는 편입니다.

- 시술상세 개편을 Amplitude로 검증했습니다. 최종 예약 전환율은 큰 변화가 없었지만 가입에서 예약까지의 소요 시간이 소폭 줄고 프로그램 기준 리뷰 수요가 확인돼, CTA와 후속 과제를 다시 잡았습니다.
- 신규 가입 UTM이 빠지던 문제는 코드가 아니라 Amplitude 속성 상태(`unexpected`)가 원인이라, 코드에 손 안 대고 해결했습니다.
- 예약 폼의 가족 동기화를 520줄에서 55줄로 줄였습니다 (`RHF + Zod + @use-funnel/core`).
- CMS·병원 CRM이 같이 쓰는 Program 관리 v2(목록/등록·수정/삭제 검수/임시저장/검수 내역)를 타입 안전 폼(`createTypedForm`) + Transfer Layer + `common/inspection/draft` 구조로 다시 짰습니다. ([글](https://jingeon27.tistory.com/18))
- `@core` 디자인 시스템 primitive 20개를 Radix 위에 정리했습니다.
- SafeDoc App 약 1,100파일을 6-layer FSD로 정리하고 sub-domain 패턴을 따로 뒀습니다 (entities 26 / features 21). 레이어 경계는 의존성 없는 자체 ESLint 플러그인으로 강제했습니다.
- CMS·병원 CRM 모노레포는 공유 도메인을 entities/features 패키지로 새로 정의하고(이 시점 13개), shared 5개를 FSD에 맞게 하나로 통합해 9개로 정리했습니다 (Turborepo + pnpm).
- 정산 크로스 도메인 인증은 처음 안이던 URL 토큰 전달의 노출 위험을 짚어 form POST BFF로 다시 설계했습니다. ([글](https://jingeon27.tistory.com/19))
- (왓타임) 사이트마다 복붙되던 ATS Electron 크롤러를 NestJS의 module/DI/factory 패턴을 적용해 사이트별 어댑터 구조로 설계·공유했고, 점핏·잡플래닛·게임잡 연동과 2차 인증 흐름을 붙였습니다. 신규 연동은 체감상 3일에서 1일 정도로 줄었습니다.

검증된 라이브러리 위에 얇은 어댑터를 두는 편이고, 추상화는 같은 패턴이 세 번 나온 뒤에 합니다.

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 SafeDoc App(복지몰)·CMS·병원 CRM 프론트엔드를 담당합니다.

합류했을 때는 병원 탐색과 예약 흐름 중심의 MVP였고, 시술 이후 단계는 앱에서 거의 다뤄지지 않았습니다. 이어서 예약 이후 운영 기능, 분석 환경, 관리자 기능까지 넓히며 운영 가능한 제품으로 만들었습니다.

**직접 판단해서 바꾼 것들**

- 정산은 메인과 도메인이 달라 쿠키를 공유할 수 없었습니다. 처음 안이던 URL 토큰 전달은 서버 access log·Referer에 토큰이 남는 게 걸려서, form POST BFF로 바꾸고 referrer-policy(no-referrer)·CSP `form-action` 고정·open redirect 방어를 붙였습니다. ([글](https://jingeon27.tistory.com/19))
- 서버에서 `dehydrate`한 캐시를 클라이언트가 props/Context로만 받아 쓰다 보니, 캐시를 무효화해도 화면이 안 바뀌었습니다. `useSuspenseQuery`로 캐시를 직접 구독하게 바꿔 캐시와 화면을 한 소스로 묶었습니다.
- 시술 결제내역에 쿠폰결제를 추가할 때, 결제건을 수단 독립적 타입(union)으로 두고 분기를 `ts-pattern` `exhaustive`로 모아 기존 렌더링 코드를 거의 수정하지 않고 새 결제수단을 흡수했습니다. 처음 이 영역을 "결제수단은 늘어난다"는 전제로 설계해둔 덕분이고, 확장 diff가 근거입니다(개방-폐쇄).
- 신규 가입 UTM 유실은 OAuth 식별자 분리·신규 속성 가설부터 확인한 뒤, Amplitude 속성 상태(`unexpected`)가 원인임을 찾아 코드에 손 안 대고 해결했습니다.

**MVP 이후 제품 확장**

- 예약까지만 있던 MVP를 유저용 프로그램 상세, 관리자용 프로그램 검수, 검색 필터까지 넓혔습니다.
- 마케팅팀이 깔아둔 Amplitude 위에 예약 전후 퍼널 이벤트를 설계해, 기능 우선순위와 개편 효과를 데이터로 판단할 수 있게 했습니다.
- 시술 이후 금액 변동(업셀링/다운셀링)을 못 보던 공백을 메우려 기업 쿠폰과 정산 기능을 붙였습니다. 기존에 별도로 개발돼 있던 정산 영역을 넘겨받아 FSD 전환, 컴포넌트 분리, 모달 공통화까지 정리했습니다.

**데이터로 검증 (Amplitude)**

- 복지몰 전반의 퍼널·행동 이벤트를 먼저 설계해 깔아뒀고, 디자인팀 가설("정보가 많으면 신뢰가 오르고 전환율도 오른다")에 따른 시술상세 개편의 배포 전후를 이 계측으로 비교했습니다.
- 최종 예약 전환율 자체는 큰 변화가 없었지만 가입에서 예약까지의 소요 시간이 소폭 줄었고, 예약 페이지에 들어온 뒤 신청까지의 전환은 나아졌습니다.
- 시술상세에 들어온 사용자 중 25%가 리뷰를 봤고(병원상세는 8%), 리뷰를 본 사용자의 예약 전환율이 안 본 쪽보다 15%p 높았습니다. 여기서 프로그램별 리뷰 분리와 CTA 위치 조정을 다음 과제로 잡았습니다.

**예약 폼 리팩토링 (가족 동기화 520 → 55줄)** · 2025.06 ([글](https://jingeon27.tistory.com/11))

- `useState` 30개에 props drilling, `useEffect` 대여섯 개로 얽혀 있던 가족 동기화를 `RHF + Zod + @use-funnel/core`로 정리했습니다.
- 날짜 선택 상태가 local state와 Zustand store에 중복으로 있고, 가족 목록이 React Query 캐시와 store에 이중으로 관리되던 걸 FormProvider 중심으로 모아 한 곳에서 들고 있게 했습니다.
- 가족 동기화 로직(ReservationPersonSelector)이 520줄에서 55줄로 줄었고, if로 흩어져 있던 검증을 `superRefine` 스키마로 옮겼습니다. 같은 패턴을 리뷰 작성·상담 신청·회원정보 수정에도 썼습니다.

**리뷰 작성 플로우 재설계 (3단계 funnel + step별 Zod schema, FSD 분리)** · 2025.05 ([글](https://jingeon27.tistory.com/15))

- 3단계 funnel, step별 Zod schema, 통합 schema를 설계했습니다. 가족 정보는 prefetch한 뒤 폼에 주입했고요. 이후 상담·견적 요청 플로우를 짤 때 레퍼런스로 썼습니다.

**`@core` 디자인 시스템 (primitive 20개)**

- Radix/Headless 위에 Button·Input·BottomSheet·Dialog·Toast·Tooltip·Callout·Checkbox·Radio·Toggle·Tabs·Chip·Menu 등을 공통으로 만들었습니다.
- `tailwind-variants`로 size/intent/state 세 축을 묶어, 호출부마다 inline `className`으로 덮어쓰는 걸 줄였습니다.
- BottomSheet는 Compound(`Root/Header/Content/Footer`)로 `react-modal-sheet` 위에 짜고 `overlay-kit`로 호출하게 해서, 뒤로가기(`popstate`)·backdrop tap·snap point를 `Root` 라이프사이클 한 곳에서 처리했습니다.

**SafeDoc App 아키텍처 정리**

- 약 1,100파일 규모에서 FSD와 Atomic Design 잔재가 섞여 있던 걸 6-layer FSD(`app/pages/widgets/features/entities/shared`)로 정리했습니다(entities 26 / features 21). 경계와 Public API 기준을 잡고, widgets→features 이관·순환 의존 해소·파일명 정리를 조금씩 진행했습니다.
- `ensureQueryData` + props drilling으로 캐시를 구독하지 않던 구조를 `queryOptions` + Server Component prefetch → `HydrationBoundary` → `useSuspenseQuery`로 바꿔 구독을 호출 지점으로 내렸습니다. infinite query는 `infiniteSetData` 헬퍼로 nested page 안 개별 아이템을 갱신했고요.
- 공통 부모 `layout.tsx`에서 program 상세를 prefetch하게 바꿔, 상세 페이지와 상담 페이지가 따로 부르던 `/program/detail`을 request 캐시 안에서 재사용하게 했습니다.

**모노레포 재설계 (13 → 9개 패키지)**

- 초기 패키지 구조(기능별 shared 5분할 등)는 이전 개발자들이 만든 것이고, 넘겨받은 뒤 구조 설계는 제가 했습니다. shared 5개가 import 경로만 흩뜨려서 단일 `@safedoc/shared`로 합치고, 두 앱이 공유할 도메인은 entities/features로 따로 뺐습니다.
- `entities`·`features`·`shared`·`config`·`lib` 경계로 CMS와 병원 CRM의 공통 도메인을 한 번만 만들어 같이 쓰게 했습니다.
- `@safedoc/ui`는 `prebuilt(tsup)`에서 `no-build bundled`로 바꿔, 패키지를 고치면 앱 HMR에 바로 반영되게 했습니다.

**AI 워크플로우와 비판적 감독**

- `.claude` 설정과 skills로 FSD 경계, Public API 기준, 모달 패턴, 정산 리팩토링 방식, 기획 맥락 같은 반복 지식을 적어뒀습니다. `jira-branch`로 티켓 맥락을 읽어 plan 초안을 만들고, 커밋/PR 흐름도 명령으로 묶었습니다. worktree로 두세 개를 동시에 돌립니다.
- OpenAPI→타입은 제네릭 codegen(kubb)이 `x-enum-varnames` 없을 때 PascalCase enum(`Rejected = 'REJECTED'`)이나 Transfer Layer 컨벤션을 못 맞춰서, AI가 스펙 JSON을 읽어 컨벤션대로 `types/*.type.ts`를 만드는 절차를 스킬로 정해뒀습니다.
- AI가 낸 코드는 그대로 받지 않습니다. 빌드가 깨질 때 `force-dynamic`을 덧붙이는 대신 `'use client'` 누락을 고쳤고, 제출 시점 데이터를 `ensureQueryData`로 가져오려던 걸 eager `useQuery`로 되돌렸습니다. `window.scrollTo` 트릭이나 한 곳에서만 쓸 공용 컴포넌트 추상화도 호출부 정리로 돌려보냈고요. create/update 겸용으로 만들어져 수정할 때도 `router.push`가 튀던 mutation 훅은 분리했습니다. 다만 다 거부하는 건 아니라, 부수효과가 묶이는 mutation 훅은 래핑을 허용했습니다.

**FSD sub-domain 패턴**

- 슬라이스 파일이 30개를 넘으면 평평한 구조가 읽기 어려워져서, `entities/settlement/{common, contract, deposit, disapproval, omission}`처럼 도메인 라이프사이클 단계로 나눴습니다. `features/program/ui/{detail, modal}` 같은 sub-feature로 UI 의존성도 폴더에서 보이게 했고요.
- 다만 30개가 쌓인 뒤에 도입해서 마이그레이션 비용이 더 들었습니다. 15개쯤에 기준이 있었으면 절반이었을 겁니다.

**Program 관리 v2 (업무 흐름 + 대규모 복합 폼)**

- 기존 병원 CRM의 프로그램/검수 흐름을 대체해, 목록·등록·수정·삭제 검수·임시저장·검수 내역·상세까지 새로 짰습니다.
- CMS/병원 CRM이 공유하는 38필드짜리 폼을 `program/{common, inspection, draft}`로 나눠, 원본·검수 요청·임시저장의 다른 생명주기를 구조에 반영했습니다.
- 공통 폼 값 타입을 두고 각 앱이 자기 필드를 더한 타입으로 `createTypedForm`을 만들어, 공통 필드 정의를 한 곳에서 바꾸면 양쪽 앱에 같이 반영되게 했습니다.
- 서버 응답·요청과 AntD Form 값 사이는 Transfer Layer(`programDetailToClientProgramForm` 등)로 분리해 Dayjs/UploadFile/상세 이미지 템플릿을 양방향으로 변환했습니다.
- 상세 이미지 템플릿(`SafedocTemplate`/`CustomImage`)은 `@safedoc/features`의 `ProgramDetailImageFormSection`으로 빼고, 각 앱은 자기 설정·검수·노출 필드만 조립하게 했습니다.
- `Form.List`·`useWatch`·`shouldUpdate`·custom validator로 조건부 렌더링, 시술 전후 이미지 페어 검증, 비동기 이미지 업로드 응답 검증, cascade validation을 붙였습니다.

**콜인 / 워크인 동의서**

- `PROXY_RESERVATION_INFLOW_TYPE` enum(`CallIn`/`WalkIn`)으로 진입을 나누고, `AgreementCallInFormValues`(4개 필드)와 `AgreementWalkInFormValues`(1개 필드)를 분리했습니다. 동의서 콘텐츠는 양쪽 앱이 공통 패키지로 같이 씁니다.

**정산 리팩토링과 운영** · 2026.04–06

- Next.js Middleware + Route Group `(altLayout)/settlement`로 별도 호스트를 분리하면서 코드베이스는 하나로 뒀고, 동시에 legacy `fetch/apis`를 FSD `entities/features`로 옮겼습니다.
- 도메인이 달라 HttpOnly 쿠키를 공유할 수 없는 문제를, 정산 진입 시 토큰을 넘기는 흐름으로 풀었습니다. URL query에서 form POST BFF로 바꿔 access log·Referer 노출을 없앴고요.
- BFF에는 `referrer-policy: no-referrer`, CSP `form-action` 고정, `X-Frame-Options: DENY`, 폼 값 HTML escape, `no-store`, 토큰 수신 POST 라우트의 `303`(POST→GET 강제, 재제출 방지), `next` pathname 정규화 기반 open redirect 방어를 넣고, 미들웨어는 도메인 라우팅만 하게 핸드오프를 별도 API 라우트로 뗐습니다.
- `queryClient.setQueriesData`로 즉시 반영하고 실패하면 catch에서 롤백되게 해서, 정산내역과 숨김처리 비교 두 탭이 같이 갱신되게 했습니다.
- 정산 `entities`는 `common/omission/disapproval/deposit/contract`로, `features/settlement`는 URL 기준 `dashboard/monthly/program/contract`로 나눴습니다. 대표 페이지는 SearchFilter/Table/hook/modal 단위로 쪼개 레거시 page 구조를 걷어냈고요.
- 레거시 `forwardRef` 모달은 `overlay-kit`으로 바꿨습니다. 대표 모달 둘을 먼저 정리한 뒤 같은 체크리스트로 나머지를 옮겼고, PR 전 보조 코드리뷰로 경계 위반과 Public API 문제를 먼저 봤습니다.

**백오피스 도메인 정리**

- 예약·프로그램 검수·정산·병원 계약·리뷰·채팅·홈 설정·기업/대학교 관리처럼 운영자가 자주 쓰는 화면을 도메인 단위로 나눴습니다.
- SearchFilter/Table/Modal/Drawer/Detail Form을 재사용 가능한 패턴으로 정리하고, 그 위에서 신규 쿠폰 템플릿 관리 도메인(목록/등록/복제 prefill/상태 일괄변경)을 12파일 정도로 빠르게 붙였습니다.

**병원 검색**

- `geolib` 거리 계산, `naver-maps` SDK, `react-intersection-observer` 무한 스크롤에 자동완성·인기 검색어·실시간 검색 카운트를 붙였습니다.

**동적 sitemap / robots (SEO)**

- 병원·프로그램·공지·혜택 탐색·검색 경로를 5개 API에서 `Promise.all`로 모아 sitemap을 동적으로 만들었고, 페이지 유형별 우선순위를 줬습니다.
- `page:1, size:1`로 `totalCnt`를 먼저 받고 `size=totalCnt`로 전량을 가져왔습니다. Next.js가 `<loc>`를 XML 이스케이프하지 않아서 직접 escape를 넣었고요.
- 세부시술 allowlist와 `revalidate=86400`(24h ISR)로 sitemap이 너무 커지거나 빌드가 무거워지는 걸 같이 막았고, `robots.ts`의 disallow 경로도 정리했습니다. ([글](https://jingeon27.tistory.com/21))

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 - 2024.11

캘린더 기반 일정 조율과 ATS SaaS인 round에서 신규 기능과 유지보수를 담당했습니다.

**기존 ATS Electron 크롤러 구조 재설계와 신규 연동**

- 사이트마다 복붙되던 로그인→수집→중복 체크→업로드 흐름을, NestJS의 module/DI/factory 패턴을 Electron에 적용해 사이트별 어댑터 + `CandidateServiceHelper` 공통 프로세스 구조로 재설계하고 팀에 공유했습니다. 새 사이트는 정해진 인터페이스(service·repository·helper)만 구현하면 붙습니다.
- 점핏·잡플래닛·게임잡 연동을 구현했고, 2차 인증 처리·후보자 수집 계측·파일 업로드 흐름을 공통 프로세스 위에 붙였습니다.
- 신규 플랫폼 연동이 3일에서 1일 정도로 줄었습니다(점핏·잡플래닛·게임잡 3개 도입 후 체감).
- 단위 테스트와 DOM 셀렉터 변경 헬스체크는 시간에 밀려 뒤로 미뤄졌습니다.

**자동화·운영 화면과 인터랙션 기능**

- 채용 자동화와 온보딩 흐름을 포함한 기존 운영 화면을 계속 확장했습니다. 지원서/면접/리뷰 자동화 페이지, 후보자 생성 플로우, 워크태스크 온보딩 등을 개편하면서 관련 UI와 상태 흐름을 정리했습니다.
- 메일/알림 템플릿 관리 화면과 미리보기를 구현했습니다. `@whattime/quill` 기반 WYSIWYG 위에 변수 치환(`{{candidateName}}`)이 반영된 템플릿 작성 경험을 붙였습니다.
- `@lukemorales/query-key-factory`로 도메인별 query key를 정리해 무효화 누락과 key drift를 줄였습니다.
- 공고 DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 붙였습니다.
- 채용 페이지/지원서 폼은 `RHF + useFieldArray + FormProvider + useYupValidation`으로 구현했습니다.
- roundhr.com 랜딩은 Next.js에 Notion CMS + `react-notion-x` + Strapi를 엮어 간단한 콘텐츠 운영 서버로 구성했습니다.

---

## Skills

### 일하는 방식

- 검증된 라이브러리 위에 얇은 어댑터를 두고, 추상화는 같은 패턴이 세 번 나온 뒤에 합니다. 신규 기능 PR 안에서 해당 영역만 조금씩 정리해 처음부터 과하게 짜는 걸 피합니다.
- Server / Form / UI 전역 / 로컬 상태의 역할을 섞지 않습니다.
- `es-toolkit`·`ts-pattern`으로 선언적으로 쓰되, 과한 추상화는 피합니다.
- virtual scroll, 검색·필터 구조, 모달 공통화처럼 성능과 운영 경험을 같이 개선하는 제안을 해왔습니다.
- UI 일관성과 기존 패턴 정합성을 근거로 디자이너·기획자와 얘기합니다.

### AI Workflow

- `jira-branch`로 티켓·브랜치 맥락을 읽어 plan 초안을 만들고, 커밋/PR 흐름을 명령으로 묶었습니다.
- PR 전에는 AI 코드리뷰를 보조로 돌리고, skills에 코드 패턴과 기획 맥락을 적어 반복 작업의 맥락 비용을 줄였습니다.
- worktree로 두세 개를 동시에 진행합니다.

### React 18

- Compound Pattern + Custom Hook으로 디자인 시스템과 폼 도메인을 직접 설계.
- `useSuspenseQuery` + `getQueryClient` + `HydrationBoundary` SSR 데이터 페칭.
- 외부 mutable store를 React state로 억지로 감싸지 않고 `useSyncExternalStore` 어댑터로 연결.
- BottomSheet Compound + `overlay-kit` 라이프사이클 명시로 모바일 엣지 케이스 처리.

### TypeScript 5

- 폼 값 타입으로 좁힌 `getFieldValue`/`setFieldValue` 래퍼(`createTypedForm`) — 잘못된 필드 경로는 컴파일 에러. recursive nested key path 추론, mapped type + key remapping 도메인 타입 생성.
- class instance에서 method key만 추론하는 mapped type으로 자료구조 API를 hook으로 노출.
- Zod 스키마 추론(`z.infer<ZodObject<T>>`)으로 스키마 바뀌면 폼 타입도 따라감.
- discriminated union(콜인/워크인 동의서 폼 분리), `satisfies` + `as const` 좁은 추론.

### Next.js App Router

- Middleware/BFF: `/settlement/*` 호스트 분리, 핸드오프 API 라우트, form POST 토큰 전달. `referrer-policy`·CSP `form-action`·`X-Frame-Options`·`no-store`·`303`(POST→GET)·open redirect 방어.
- Route Group `(altLayout)/settlement` 별도 레이아웃 + 단일 코드베이스.
- Streaming SSR + Suspense boundary 분할.
- 캐싱: `cookies()`/`searchParams` dynamic 트리거, fetch 옵션(`force-cache`/`no-store`/`revalidate`/`tags`) 도메인별 적용, `revalidatePath` vs `revalidateTag` 구분.
- RSC: Server→Client props 직렬화 제약(함수/class instance/Symbol 불가)을 이해하고 경계 설계.

### Architecture

- FSD 6-layer + sub-domain: 약 1,100파일 정리. sub-domain은 공식이 아닌 자체 패턴이라 파일 수와 변경 빈도로 도입 시점을 정함. 경계는 자체 ESLint 플러그인으로 강제.
- Monorepo(Turborepo + pnpm): entities/features 신설(13개) 후 shared 5개 단일 통합으로 9개 재편.
- Library Adapter: core 로직과 React binding 분리, observer + `useSyncExternalStore`로 imperative 자료구조를 hook으로 노출.
- NestJS의 module/DI/factory 패턴을 Electron에 적용한 사이트별 어댑터 크롤러 구조 설계 (왓타임).
- Compound/Composition: BottomSheet, Tabs, Form.

### Form & Validation

- RHF + Zod: `useZodForm` 어댑터, step별 + 통합 schema, `superRefine` 교차 필드 검증.
- AntD Form: 대규모 폼에서 `Form.List` + `shouldUpdate` + `useWatch` cascade validation, custom trigger, 비동기 이미지 업로드 검증.

### State & Data

- TanStack Query v5: `queryOptions`로 useQuery/useSuspenseQuery/prefetch/getQueryData 통합, infinite query + intersection observer, `setQueriesData` optimistic + 롤백.
- 캐시 일관성은 `invalidateQueries` → `setQueryData` → 정규화 순으로, 네트워크·즉시성·오프라인 비용에 따라 escalation으로 판단.
- Zustand: UI 전역 상태(최근 본 프로그램, 검색 필터) 정도만.

### UI & Styling

- tailwind-variants(size/intent/state 토큰), Radix/Headless(Compound, asChild + Slot), overlay-kit, Framer Motion.

### Open Source

검증된 라이브러리 내부를 읽고 사내 어댑터 설계에 반영했으며, 발견한 문제는 upstream에 PR을 보내 기여했습니다.

**기여**

- toss/slash — `useFunnel`의 `NonEmptyArray` 타입 오류 수정 PR 머지 (2024.05, [PR #363](https://github.com/toss/slash/pull/363))
- TanStack/ai — `useChat`이 `ChatClient`를 `useMemo`(성능 힌트일 뿐 시맨틱 보장 아님)로 생성하는 문제를 `useState` lazy init으로 바꾸는 PR 제출 (2026.06, 리뷰 중, [PR #864](https://github.com/TanStack/ai/pull/864))

**Reading**

- React Hook Form: `useForm` proxy 기반 selective re-render → `useZodForm` 설계에 참고.
- Toss Slash(`@use-funnel/core`, `overlay-kit`): funnel history snapshot, overlay 라이프사이클 → 사내 funnel/BottomSheet 설계에 참고.
- TanStack Query: `queryOptions`, infinite query 캐시 구조 → 사내 query key 표준에 참고.

---

## Side Projects

### data-structure-ts

- core 자료구조 패키지와 React binding 패키지를 나누고, Queue/Heap/PriorityQueue를 observer 기반 외부 store로 만들었습니다.
- React adapter는 `useSyncExternalStore`로 구독하고, `bindMethods<T>` mapped type으로 class instance의 method key만 추려 hook으로 노출했습니다.
- 자료구조 동작은 core에서, hook 구독은 adapter에서 각각 검증할 수 있게 나눴습니다.

---

## Education

### 대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

---

## Certification

- 정보처리기능사 | 한국산업인력공단 | 2023.04
