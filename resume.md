# 김진건

**Frontend Engineer** jingeon27@gmail.com | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 - 2028.06)

---

## Summary

급하게 만들어진 서비스를 넘겨받아 기술 부채 정리와 신규 기능 개발을 병행해 온 프론트엔드 개발자입니다. 2026년 1월부터 세이프닥 복지몰·CMS·병원 CRM의 프론트엔드 개발·운영 책임을 맡았고, 4월부터 유일한 프론트엔드 엔지니어로 운영했습니다. 7월 31일부터 외국인 의료관광 Global 사용자 서비스와 운영 CMS까지 담당 범위를 넓혔습니다. React·Next.js(App Router)·TypeScript로 복잡한 사용자 흐름을 운영 가능한 구조로 정리하고 받은 명세를 그대로 구현하기보다 사용자에게 더 나은 방향을 먼저 검토합니다.

- 시술상세 개편을 Amplitude로 검증했고, 리뷰 조회 사용자의 예약 전환율이 미조회 사용자 대비 +15%p 높게 나타난 것을 확인했습니다.
- 신규 가입 UTM 유실은 코드 문제가 아니라 Amplitude 속성 상태(`unexpected`)가 원인임을 확인해, 코드 변경 없이 해결했습니다.
- 예약 폼의 가족 동기화 컴포넌트를 520줄에서 55줄로 줄였습니다 (`RHF + Zod`).
- CMS·병원 CRM이 함께 쓰는 Program 관리 v2(목록/등록·수정/삭제 검수/임시저장/검수 내역)를 타입 안전 폼(`createTypedForm`) + Transfer Layer + `common/inspection/draft` 구조로 재설계했습니다. ([글](https://jingeon27.tistory.com/18))
- `@core` 디자인 시스템 primitive 20개를 Radix 위에 정리했습니다.
- SafeDoc App 약 1,100파일을 6-layer FSD로 정리하고 sub-domain 패턴을 따로 뒀습니다 (entities 26 / features 21). 레이어 경계는 의존성 없는 자체 ESLint 플러그인으로 강제했습니다.
- CMS·병원 CRM 모노레포는 공유 도메인을 entities/features 패키지로 새로 정의하고(이 시점 13개), shared 5개를 FSD에 맞게 하나로 통합해 9개로 정리했습니다 (Turborepo + pnpm).
- SafeDoc App을 Next.js 15.5→16.2·Node 20→24·ESLint 8→9 flat config·Turbopack으로 이행했습니다. TypeScript 7 네이티브 체커를 TS6 툴체인과 병행해 Next.js·ESLint 호환성을 유지하면서 타입체크를 **12.5초→1.9초**로 단축했고, 638KB base64 PNG가 포함된 SVG를 정적 자산으로 이관해 JS 번들에서 제거했습니다.
- 복지몰을 제외한 서비스는 디자이너가 만든 상세 UI·상태 명세보다 기능 요구사항과 기존 화면을 기준으로 개발해, 요구한 동작을 매번 수동으로 확인하는 과정이 병목이었습니다. Claude Code Skills로 API·query·form·FSD 패턴과 입출력을 규격화한 뒤 테스트를 도입해, 세이프닥 프론트 전반의 Vitest **1,227개**와 Playwright E2E **47개**의 기능 검증을 자동화했습니다.
- Global 사용자 프론트의 실제 API 연동과 함께 운영 CMS를 신규 구축했습니다. 병원·시술·블로그·FAQ의 다국어 CRUD와 이미지·CKEditor·DnD 정렬을 구현하고 MSW 통합 테스트를 포함한 Vitest **223개**로 검증했습니다. 목만 보고 개발하면 거짓 초록이 난다는 걸 실서버 등록이 막히고서 알았고, 실서버 계약 테스트 **20개**(`pnpm test:live`)와 서버 제약을 이식한 목으로 같은 실수가 로컬에서 먼저 깨지게 만들었습니다.
- 정산 크로스 도메인 인증은 첫 구현이던 URL 토큰 전달의 노출 위험을 짚어 form POST BFF로 다시 설계했습니다. ([글](https://jingeon27.tistory.com/19))
- (왓타임) 사이트마다 중복 구현되던 ATS Electron 크롤러를, NestJS의 모듈 경계·constructor injection을 참고해 사이트별 어댑터 구조로 재설계·공유했고(프레임워크는 과하다고 판단해 제거, factory로 조립), 점핏·잡플래닛·게임잡 연동과 2차 인증 흐름을 구현했습니다.

레거시를 정리하며 배운 기준을 다음 프로젝트의 기본값으로 옮기는 방식으로 일해왔습니다. 복지몰에서 FSD 경계가 리뷰만으로는 지켜지지 않는 걸 겪고 자체 ESLint 플러그인으로 강제했고, Global은 그 기준을 처음부터 적용해 시작했습니다.

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 SafeDoc App(복지몰)·CMS·병원 CRM을 담당하고 외국인 의료관광 Global 사용자 서비스·운영 CMS 프론트엔드를 단독으로 신규 구축하고 있습니다.

합류했을 때는 병원 탐색과 예약 흐름 중심의 MVP였고, 시술 이후 단계는 앱에서 거의 다뤄지지 않았습니다. 이어서 예약 이후 운영 기능, 분석 환경, 관리자 기능까지 넓히며 운영 가능한 제품으로 만들었습니다.

**직접 판단해서 바꾼 것들**

- 정산은 메인과 도메인이 달라 쿠키를 공유할 수 없었습니다. 첫 구현이던 URL 토큰 전달은 서버 access log·Referer에 토큰이 남을 위험이 있어, form POST BFF로 바꾸고 referrer-policy(no-referrer)·CSP `form-action` 고정·open redirect 방어를 적용했습니다. ([글](https://jingeon27.tistory.com/19))
- 서버에서 `dehydrate`한 캐시를 클라이언트가 props/Context로만 받아 쓰다 보니, 캐시를 무효화해도 화면이 안 바뀌었습니다. `useSuspenseQuery`로 캐시를 직접 구독하게 바꿔 캐시와 화면을 한 소스로 묶었습니다.
- 시술 결제내역에 쿠폰결제를 추가할 때, 결제건을 수단 독립적 타입(union)으로 두고 분기를 `ts-pattern` `exhaustive`로 모아 기존 렌더링 코드를 거의 수정하지 않고 새 결제수단을 흡수했습니다. 처음 이 영역을 "결제수단은 늘어난다"는 전제로 설계해둔 덕분이고 확장 diff가 근거입니다(개방-폐쇄).
- 신규 가입 UTM 유실은 OAuth 식별자 분리·신규 속성 가설부터 확인한 뒤, Amplitude 속성 상태(`unexpected`)가 원인임을 찾아 코드 변경 없이 해결했습니다.

**MVP 이후 제품 확장**

- 예약까지만 있던 MVP를 유저용 프로그램 상세, 관리자용 프로그램 검수, 검색 필터까지 넓혔습니다.
- 마케팅팀이 깔아둔 Amplitude 위에 예약 전후 퍼널 이벤트를 설계해, 기능 우선순위와 개편 효과를 데이터로 판단할 수 있게 했습니다.
- 시술 이후 금액 변동(업셀링/다운셀링)을 확인하지 못하던 공백을 메우기 위해 기업 쿠폰과 정산 기능을 구현했습니다. 기존에 별도로 개발돼 있던 정산 영역을 넘겨받아 FSD 정리, 컴포넌트 분리, 모달 공통화까지 진행했습니다.

**데이터로 검증 (Amplitude)**

- 복지몰 전반의 퍼널·행동 이벤트를 먼저 설계해 깔아뒀고, 디자인팀 가설("정보가 많으면 신뢰가 오르고 전환율도 오른다")에 따른 시술상세 개편의 배포 전후를 이 계측으로 비교했습니다.
- 최종 예약 전환율 자체는 큰 변화가 없었지만, 리뷰 조회 행동이 예약 전환과 강하게 연결된다는 점을 확인했습니다.
- 시술상세에 들어온 사용자 중 25%가 리뷰를 조회했고(병원상세는 8%), 리뷰를 조회한 사용자의 예약 전환율이 미조회 사용자보다 15%p 높았습니다. 이는 인과관계가 아닌 행동 간 상관관계로 해석했습니다.

**예약 폼 리팩토링 (가족 동기화 520 → 55줄)** · 2025.06 ([글](https://jingeon27.tistory.com/11))

- props drilling과 `useEffect` 4개로 얽혀 있던 가족 동기화를 `RHF + Zod`로 정리했습니다.
- 날짜 선택 상태가 local state와 Zustand store에 중복으로 있고, 가족 목록이 React Query 캐시와 store에 이중으로 관리되던 걸 FormProvider 중심으로 모아 한 곳에서 들고 있게 했습니다.
- 가족 동기화 로직(ReservationPersonSelector)이 520줄에서 55줄로 줄었고 if로 흩어져 있던 검증을 `superRefine` 스키마로 옮겼습니다. 같은 패턴을 리뷰 작성·상담 신청·회원정보 수정에도 썼습니다.

**리뷰 작성 플로우 재설계 (3단계 funnel + step별 Zod schema, FSD 분리)** · 2025.05 ([글](https://jingeon27.tistory.com/15))

- 3단계 funnel, step별 Zod schema, 통합 schema를 설계했습니다. 가족 정보는 prefetch한 뒤 폼에 주입했습니다. 이후 상담·견적 요청 플로우를 설계할 때 레퍼런스로 활용했습니다.

**`@core` 디자인 시스템 (primitive 20개)**

- Radix 위에 Button·Input·BottomSheet·Dialog·Toast·Tooltip·Callout·Checkbox·Radio·Toggle·Tabs·Chip·Menu 등을 공통으로 만들었습니다.
- `tailwind-variants`로 size/intent/state 세 축을 묶어, 호출부마다 inline `className`으로 덮어쓰는 걸 줄였습니다.
- BottomSheet는 Compound(`Root/Header/Content/Footer`)로 `react-modal-sheet` 위에 구성하고 `overlay-kit`로 호출하게 해서, 뒤로가기(`popstate`)·backdrop tap·snap point를 `Root` 라이프사이클 한 곳에서 처리했습니다.

**SafeDoc App 아키텍처 정리**

- 전임자들이 4개월간 점진 이관하던 `@legacy` 디렉터리 246파일을 합류 후 한 달 만에 전량 제거해 이관을 완결했습니다.
- 전임자가 도입한 FSD가 Atomic Design과 혼용돼 있던 약 1,100파일 규모를 6-layer FSD(`app/pages/widgets/features/entities/shared`)로 통일했습니다(entities 26 / features 21). 경계와 Public API 기준을 잡고, widgets→features 이관·순환 의존 해소·파일명 정리를 조금씩 진행했습니다.
- 서버 모델을 그대로 반영하는 재사용 UI(예: `ProgramCard`)는 공용 레이어로 내리고 page마다 달라지는 특이 UI는 page에서 조립했습니다. FSD처럼 도메인이 나오자마자 분리하지 않고 두 번째 사용처(재사용)가 신호일 때 분리하며 page는 로직 없이 연결만 하는 얇은 adapter로 뒀습니다.
- `ensureQueryData` + props drilling으로 캐시를 구독하지 않던 구조를 `queryOptions` + Server Component prefetch → `HydrationBoundary` → `useSuspenseQuery`로 바꿔 구독을 호출 지점으로 내렸습니다. infinite query는 `infiniteSetData` 헬퍼로 nested page 안 개별 아이템을 갱신했습니다.
- 공통 부모 `layout.tsx`에서 program 상세를 prefetch하게 바꿔, 상세 페이지와 상담 페이지가 따로 부르던 `/program/detail`을 request 캐시 안에서 재사용하게 했습니다.

**모노레포 재설계 (13 → 9개 패키지)**

- 인수 당시 패키지 구조는 기능별 shared 5분할 등으로 나뉘어 있었습니다. 두 앱이 공유할 도메인을 entities/features로 먼저 분리하고 import 경로만 흩뜨리던 shared 5개는 단일 `@safedoc/shared`로 통합했습니다.
- `entities`·`features`·`shared`·`config`·`lib` 경계로 CMS와 병원 CRM의 공통 도메인을 한 번만 만들어 같이 쓰게 했습니다.
- `@safedoc/ui`는 `prebuilt(tsup)`에서 `no-build bundled`로 바꿔, 패키지를 고치면 앱 HMR에 바로 반영되게 했습니다.

**AI 워크플로우와 비판적 감독**

- `.claude` 설정과 skills로 FSD 경계, Public API 기준, 모달 패턴, 정산 리팩토링 방식, 기획 맥락 같은 반복 지식을 문서화했습니다. `jira-branch`로 티켓 맥락을 읽어 plan 초안을 만들고, 커밋/PR 흐름도 명령으로 묶었습니다. worktree로 두세 개 과제를 병렬로 검토합니다.
- OpenAPI→타입은 제네릭 codegen(kubb)이 `x-enum-varnames` 없을 때 PascalCase enum(`Rejected = 'REJECTED'`)이나 Transfer Layer 컨벤션을 못 맞춰서, AI가 스펙 JSON을 읽어 컨벤션대로 `types/*.type.ts`를 만드는 절차를 스킬로 정해뒀습니다.
- AI가 생성한 코드는 컨벤션과 빌드 결과를 기준으로 검토합니다. 빌드 오류를 `force-dynamic` 추가로 우회하지 않고 `'use client'` 누락을 수정했으며 제출 시점 데이터를 `ensureQueryData`로 가져오려던 구현은 eager `useQuery`로 되돌렸습니다. `window.scrollTo` 트릭이나 한 곳에서만 쓰는 공용 컴포넌트 추상화도 호출부 정리로 수정했습니다. create/update 겸용이라 수정 시에도 `router.push`가 실행되던 mutation 훅은 역할별로 분리했고, 부수효과가 함께 묶이는 mutation 훅은 래핑을 허용했습니다.

**FSD sub-domain 패턴**

- 슬라이스 파일이 30개를 넘으면 평평한 구조가 읽기 어려워져서, `entities/settlement/{common, contract, deposit, disapproval, omission}`처럼 도메인 라이프사이클 단계로 나눴습니다. `features/program/ui/{detail, modal}` 같은 sub-feature로 UI 의존성도 폴더에서 보이게 했습니다.
- 다만 30개가 쌓인 뒤에 도입해서 마이그레이션 비용이 더 들었습니다. 15개쯤에 기준이 있었으면 절반이었을 겁니다.

**Program 관리 v2 (업무 흐름 + 대규모 복합 폼)**

- 기존 병원 CRM의 프로그램/검수 흐름을 대체해, 목록·등록·수정·삭제 검수·임시저장·검수 내역·상세까지 새로 짰습니다.
- CMS/병원 CRM이 공유하는 38필드짜리 폼을 `program/{common, inspection, draft}`로 나눠, 원본·검수 요청·임시저장의 다른 생명주기를 구조에 반영했습니다.
- 공통 폼 값 타입을 두고 각 앱이 자기 필드를 더한 타입으로 `createTypedForm`을 만들어, 공통 필드 정의를 한 곳에서 바꾸면 양쪽 앱에 같이 반영되게 했습니다.
- 서버 응답·요청과 AntD Form 값 사이는 Transfer Layer(`programDetailToClientProgramForm` 등)로 분리해 Dayjs/UploadFile/상세 이미지 템플릿을 양방향으로 변환했습니다.
- 상세 이미지 템플릿(`SafedocTemplate`/`CustomImage`)은 `@safedoc/features`의 `ProgramDetailImageFormSection`으로 빼고, 각 앱은 자기 설정·검수·노출 필드만 조립하게 했습니다.
- `Form.List`·`useWatch`·`shouldUpdate`·custom validator로 조건부 렌더링, 시술 전후 이미지 페어 검증, 비동기 이미지 업로드 응답 검증, cascade validation을 적용했습니다.

**콜인 / 워크인 동의서**

- `PROXY_RESERVATION_INFLOW_TYPE` enum(`CallIn`/`WalkIn`)으로 진입을 나누고, `AgreementCallInFormValues`(4개 필드)와 `AgreementWalkInFormValues`(1개 필드)를 분리했습니다. 동의서 콘텐츠는 양쪽 앱이 공통 패키지로 같이 씁니다.

**정산 리팩토링과 운영** · 2026.04–06

- Next.js Middleware + Route Group `(altLayout)/settlement`로 별도 호스트를 분리하면서 코드베이스는 하나로 뒀고, 동시에 legacy `fetch/apis`를 FSD `entities/features`로 옮겼습니다.
- 도메인이 달라 HttpOnly 쿠키를 공유할 수 없는 문제를, 정산 진입 시 토큰을 전달하는 흐름으로 해결했습니다. URL query에서 form POST BFF로 바꿔 access log·Referer 노출을 제거했습니다.
- BFF에는 `referrer-policy: no-referrer`, CSP `form-action` 고정, `X-Frame-Options: DENY`, 폼 값 HTML escape, `no-store`, 토큰 수신 POST 라우트의 `303`(POST→GET 강제, 재제출 방지), `next` pathname 정규화 기반 open redirect 방어를 적용하고 미들웨어는 도메인 라우팅만 담당하도록 핸드오프를 별도 API 라우트로 분리했습니다.
- `queryClient.setQueriesData`로 즉시 반영하고 실패하면 catch에서 롤백되게 해서, 정산내역과 숨김처리 비교 두 탭이 같이 갱신되게 했습니다.
- 정산 `entities`는 `common/omission/disapproval/deposit/contract`로, `features/settlement`는 URL 기준 `dashboard/monthly/program/contract`로 나눴습니다. 대표 페이지는 SearchFilter/Table/hook/modal 단위로 분리해 레거시 page 구조를 제거했습니다.
- 레거시 `forwardRef` 모달은 `overlay-kit`으로 바꿨습니다. 대표 모달 둘을 먼저 정리한 뒤 같은 체크리스트로 나머지를 옮겼고, PR 전 보조 코드리뷰로 경계 위반과 Public API 문제를 먼저 봤습니다.

**백오피스 도메인 정리**

- 예약·프로그램 검수·정산·병원 계약·리뷰·채팅·홈 설정·기업/대학교 관리처럼 운영자가 자주 쓰는 화면을 도메인 단위로 나눴습니다.
- SearchFilter/Table/Modal/Drawer/Detail Form을 재사용 가능한 패턴으로 정리하고 그 위에서 신규 쿠폰 템플릿 관리 도메인(목록/등록/복제 prefill/상태 일괄변경)을 약 12개 파일 규모로 구현했습니다.

**병원 검색**

- `geolib` 거리 계산, `naver-maps` SDK, `react-intersection-observer` 무한 스크롤에 자동완성·인기 검색어·실시간 검색 카운트를 연동했습니다.

**동적 sitemap / robots (SEO)**

- 병원·프로그램·공지·혜택 탐색·검색 경로를 5개 API에서 `Promise.all`로 모아 sitemap을 동적으로 만들었고 페이지 유형별 우선순위를 줬습니다.
- `page:1, size:1`로 `totalCnt`를 먼저 받고 `size=totalCnt`로 전량을 가져왔습니다. Next.js가 `<loc>`를 XML 이스케이프하지 않아서 직접 escape를 적용했습니다.
- 세부시술 allowlist와 `'use cache'`(`cacheLife('days')`, 24시간 재생성)로 sitemap이 너무 커지거나 생성이 무거워지는 문제를 함께 막았고 `robots.ts`의 disallow 경로도 정리했습니다. ([글](https://jingeon27.tistory.com/21))

**글로벌 서비스 신규 프론트 구축 (safedoc-global)** · 2026.07.31 – 08

- PO가 바이브코딩한 Vite SSG 서비스 `korea-care`를 Next.js 16 App Router + TypeScript 기반 `safedoc-global`로 재구축했습니다. VOC 수정사항이 반영된 korea-care 화면을 캡처해 만든 Figma 스토리보드를 시각 기준으로 삼되, 상세 컴포넌트·상태 명세는 기존 동작과 기능 요구사항을 분석해 직접 정의했습니다.
- 복지몰에서 쌓은 FSD를 `_app/_pages/features/shared` 4레이어로 줄이고 새 코드는 page에 둔 뒤 두 번째 사용처가 생길 때 공용 레이어로 옮기는 pages-first 규칙을 기본값으로 잡았습니다. 프론트·백엔드도 동시에 개발을 시작해 API 완성을 기다릴 수 없었고 기능 동작을 반복해서 수동 확인하는 과정이 개발 속도의 병목이 될 수 있다고 판단했습니다.
- 합의한 병원·시술·콘텐츠·문의·예약 endpoint와 응답 schema를 기준으로 **MSW mock server**를 만들고, 도메인별 seed DB·handler가 실제 요청과 상태 변경을 처리하게 해 백엔드 완성 전에도 화면과 사용자 흐름을 독립적으로 개발·검증했습니다.
- 실제 API가 확정된 뒤 reference·program·hospital·content·inquiry·reservation 6개 도메인을 순차 연동했습니다. mock과 실제 응답에 같은 Zod schema를 적용하고 공통 `http()`에서 계약 불일치를 실패시켜, mock 전용 UI 분기 없이 API base URL만 전환해 연동했습니다.
- 시술 목록의 검색·진료과·금액대·정렬을 서버 `ProgramCriteria`로 일원화하고, 필터 상태의 출처를 URL 하나로 뒀습니다. 처음에는 RHF 폼과 URL query를 양방향 동기화했는데 같은 값의 복제본과 동기화 이펙트가 따라와, 폼을 걷어내고 `useSearchParams`를 읽어 `router`로 쓰는 훅(95줄 → 41줄)만 남겼습니다. 검색어는 `replace`, 명시적 필터 선택은 `push`로 나눠 공유 URL·새로고침·뒤로가기를 같은 상태 모델로 처리했습니다.
- 목록을 서버에서 200건 통째로 받아 클라이언트가 자르던 구조를 `PAGE_SIZE=20` 무한스크롤로 바꾸고, 카드 그리드를 `useWindowVirtualizer` 행 단위로 가상화했습니다. CSS 반응형 열 수와 가상 행의 묶음 단위를 같은 함수(`columnsFor`)로 맞춰 어긋나지 않게 했고, 폭을 재기 전(서버 렌더·hydration 직후)에는 받은 목록을 그대로 그려 SSR HTML에 목록이 남고 hydration 마크업도 서버와 일치하게 뒀습니다. 다음 페이지 요청은 가상화 컴포넌트가 아니라 목록 아래 `InfiniteSentinel`이 소유하도록 분리했습니다.
- route별 React Query prefetch·`HydrationBoundary`와 Cache Components를 적용하고 next-intl 라우팅(en 무접두어 / ko·ar 접두어) 및 ar RTL을 구성했습니다. UI 문자열은 자체 `ui-strings + createT`로 en/ko 필수 번역을 컴파일 단계에서 검증했습니다.
- Vitest **204개**와 Playwright E2E **47개**로 API 응답·mock DB·예약 제출·본인확인·다국어 라우팅·필터 URL/브라우저 히스토리를 검증했습니다. lint·타입체크·포맷 검사와 Next.js 프로덕션 빌드까지 통과시켰습니다.
- 테스트가 쌓인 뒤에는 개수를 늘리는 대신 **위험 기준으로 재분류**했습니다. 브라우저가 아니어도 증명되는 항목(URL 필터 동기화, 카테고리 필터, 디바운스)은 통합·계약 테스트로 내려 E2E를 42개에서 30개로 줄인 뒤(이후 무한스크롤·가상화 같은 신규 기능에서만 다시 붙여 현재 47개), 그 자리에 아무도 보지 않던 위험(`http()` 실패 경로, 로그인 없는 서비스의 유일한 접근 제어인 본인확인 3분기, 중복 제출)에 테스트를 새로 붙였습니다. 사용자가 보는 것을 단언하는 화면 테스트를 쓰다가 이메일 검증 오류가 계산만 되고 화면에 표시되지 않던 결함을 발견해 함께 고쳤습니다.

**Global 운영 CMS 신규 구축 (safedoc-global-cms)** · 2026.07.31 – 08

- 기존 Turborepo에 Next.js 14 App Router 앱을 추가하고 `entities/features/shared/widgets`로 경계를 나눠 병원·시술·블로그·FAQ의 목록·등록·수정·상세 운영 흐름을 신규 구축했습니다.
- 한국어·영어·아랍어 입력을 필드별 언어 map과 Segmented UI로 표현하고 한국어·영어 필수 검증과 아랍어 폴백 규칙을 공통화했습니다. 서버의 번역 배열과 AntD Form 값 사이는 도메인별 Transfer Layer로 변환했습니다.
- 이미지 업로드·CKEditor·운영시간·지역 Cascader·시술 구성별 조건부 필드·FAQ DnD 정렬을 공통 UI와 폼 규칙 위에 구현했습니다.
- Global API 스펙으로 MSW의 상태 기반 CRUD handler를 만들어 백엔드 연동 전에도 폼 전체 흐름을 검증했고, API·Transfer Layer·공용 UI·폼 통합 테스트 **223개**를 구축했습니다. 폼 통합 테스트는 mutation 호출 인자가 아니라 실제 Drawer를 사용자 입력으로 채운 뒤 목록·상세 API로 되읽어 저장 결과를 확인하게 해, 호출 방식이 바뀌어도 저장 계약이 지켜지면 통과하도록 뒀습니다. 이 중 장애 경로(500·네트워크 단절·지연 응답·부분 응답)는 별도로 보강했는데, 모든 실패가 사용자 문구로 바뀌는 길목인 `getGlobalErrorMessage`가 무테스트였고 저장 실패 시 입력이 보존되는지·재시도가 되는지를 아무도 확인하지 않고 있었기 때문입니다.
- 그런데 이 목이 거짓 초록을 냈습니다. 제가 쓴 handler가 보낸 값을 그대로 200으로 받아줘 통합 테스트는 전부 통과했는데, 실서버 등록은 `orderNo` 누락과 운영시간 7일 미만(`@Size(min=7,max=7)`)으로 막혀 있었습니다. 두 방향으로 갚았습니다. ① 실서버(dev)를 직접 호출하는 **계약 테스트 20개**(`pnpm test:live`, 별도 러너)를 만들어 등록 화면이 실제로 만드는 payload를 서버가 받아들이는지 확인하고, 거절당하면 `code`와 `violations`를 그대로 드러냅니다(생성한 테스트 데이터는 `DELETED`로 정리). 필수값 누락은 `violations: []`인 `INVALID_REQUEST`, bean validation 실패는 `violations`가 채워진 `VALIDATION_FAILED`로 서버가 다르게 응답한다는 사실까지 테스트로 고정했습니다. ② **목을 서버처럼 거절하게** 고쳐, 같은 제약을 handler에 이식해 다음부터는 실서버가 아니라 로컬·CI에서 먼저 깨지게 했습니다.
- 여기서 얻은 결론은 "테스트를 많이 쓰자"가 아니라 **검증을 붙이는 시점**이었습니다. 목은 내가 쓴 기대를 확인해 줄 뿐 서버의 기대를 알려주지 않으므로, 신규 API 연동은 목보다 계약 테스트를 먼저 걸어야 한다고 정리했습니다.

**복지몰 Next 16 / Turbopack 이행 · 타입 안전 정리** · 2026.07

- SafeDoc App을 Next.js 15.5→16.2.10, Node 20.18→24.15, ESLint 8→9 flat config로 이행했습니다. `middleware`→`proxy`, `next lint`→ESLint CLI 등 breaking change를 반영하고 dev·stage·production 빌드를 Turbopack으로 전환했습니다.
- TypeScript 7의 Go 네이티브 체커는 JS compiler API가 없어 `typescript-eslint`·Next build와 단독 사용이 어려웠습니다. TS6는 툴체인에 남기고 TS7을 `typecheck` 전용으로 병행해 호환성을 유지하면서 타입체크를 **12.5초에서 1.9초**로 단축했습니다.
- 병원 상세의 Lighthouse 병목을 기준으로 `next/image`·이미지 크기 추적·프리패치·캐시를 정리했습니다. 638KB base64 PNG가 포함된 SVG가 SVGR를 통해 JS에 인라인되던 원인을 찾아 `public` 정적 자산으로 이관하고 번들에서 제거했습니다.
- 검색 필터 전 구간을 zod 스키마 검증으로 바꿔 `any/unknown`을 제거하고 탭/모드 유니온을 단일 zod enum으로 모아 분기를 `ts-pattern`으로 통일했습니다. URL 파라미터 zod 프리미티브도 중복 3곳을 공용화했습니다.
- 로그인·약관 리다이렉트 흐름에서 `redirectUrl` 정규화를 공용 유틸로 뽑아 이중 인코딩 복원·외부 URL·게이트 자기참조를 차단하고 소셜 콜백 리다이렉트 쿠키 유실을 정리했습니다.
- 마이페이지 쿠폰 보유 개수 강조(SE-2532), 프로그램 필터 '쿠폰 추가 할인' 칩 강조(SE-2530) 등 쿠폰 사용자 노출을 이어 붙였고, Figma Mode1 디자인 토큰을 tailwind와 동기화했습니다.

**제휴실적관리 대시보드 · 정산 운영 확장** · 2026.07 (병원 CRM/CMS)

- 제휴실적관리를 CRM에서 정산관리로 옮기며 대시보드를 새로 만들고, 검색·날짜 필터를 문의·정산관리와 같은 `scrollSearch`·개별 범위 패턴으로 통일했습니다. 기업/대학 `partnership` 필드를 `partnershipStatus` enum으로 대치하고 인계유무(handover) 필터를 더했습니다(SE-2581·2582·2608).
- 상시 노출 말풍선을 `ClosableTooltip` 공통 컴포넌트(z-index 관례 + x 버튼 + open 상태 캡슐화)로 묶고(SE-2606), 정산 상세 말풍선 겹침·재확인필요 모달·전체 예약 목록·정산제외·성과금 표시 등 운영 기능을 이어서 확장했습니다.
- 한 화면의 두 테이블이 URL page key를 공유하고 월 단위 서버 응답을 입금 행으로 펼친 뒤 AntD Table이 다시 pagination slicing하며 행이 유실되는 원인을 찾았습니다. 테이블별 파라미터를 분리하고 `PaginationTable`이 서버·클라이언트 paging을 구분하게 바꿔 입금 내역 페이지 이동과 행 유실을 해결했습니다(SE-2624).
- `lodash`를 `es-toolkit`으로 마이그레이션해 번들에서 걷어냈습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 - 2024.11

캘린더 기반 일정 조율과 ATS SaaS인 round에서 신규 기능과 유지보수를 담당했습니다.

**기존 ATS Electron 크롤러 구조 재설계와 신규 연동**

- 사이트마다 로그인→수집→중복 체크→업로드가 중복 구현되고 크롤링 로직이 한 파일에 뭉쳐 있었습니다. 백엔드 팀의 NestJS 코드에서 모듈 경계와 constructor injection을 참고해, 입사 2개월차에 이 흐름을 controller/service/repository/helper로 분해하고 사이트별 어댑터 + `CandidateServiceHelper` 공통 프로세스(Template Method) 구조로 재설계해 팀에 공유했습니다. 이 리팩토링 커밋은 14개 파일에서 순 -140줄이었습니다.
- NestJS를 실제로 도입해봤지만 Electron main process에 프레임워크까지 얹는 건 과하다고 판단해 5일 만에 걷어냈고, DI 컨테이너 없이 factory와 정적 레지스트리로 의존성을 조립했습니다. 새 사이트는 정해진 인터페이스(service·repository·helper)만 구현하면 연결됩니다.
- 점핏·잡플래닛·게임잡 연동을 구현했고, 2차 인증 처리·후보자 수집 계측·파일 업로드 흐름을 공통 프로세스 위에 구현했습니다. 지원자 한 명의 수집 실패가 배치 전체를 멈추지 않도록 루프 안에서 에러를 격리했습니다. 3개 연동 이후로는 새 사이트를 붙일 때 정해진 인터페이스(service·repository·helper) 구현만 남았습니다.
- 제가 뼈대를 깔았고 이후 팀이 함께 확장해, 지금 그 모듈의 코드 다수는 동료가 다시 썼습니다. 레지스트리를 `satisfies`로 검증하는 데까지는 갔지만 키와 클래스 제네릭을 묶는 매핑 타입까지 가지 못해 생성자 타입을 `any`로 열어뒀고, 그 자리는 동료가 매핑 타입으로 채웠습니다. 단위 테스트와 DOM 셀렉터 변경 헬스체크도 후행 과제로 남겼습니다.

**자동화·운영 화면과 인터랙션 기능**

- 채용 자동화와 온보딩 흐름을 포함한 기존 운영 화면을 계속 확장했습니다. 지원서/면접/리뷰 자동화 페이지, 후보자 생성 플로우, 워크태스크 온보딩 등을 개편하면서 관련 UI와 상태 흐름을 정리했습니다.
- 메일/알림 템플릿 관리 화면과 미리보기를 구현했습니다. `@whattime/quill` 기반 WYSIWYG 위에 변수 치환(`{{candidateName}}`)이 반영된 템플릿 작성 경험을 구현했습니다.
- `@lukemorales/query-key-factory`로 도메인별 query key를 정리해 무효화 누락과 key drift를 줄였습니다.
- 공고 DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 적용했습니다.
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
- 상세 UI·상태 명세가 없는 기능 중심 개발에서는 코드 자체가 요구사항을 설명할 수 있어야 했습니다. Claude Code Skills에 API·query options·form·FSD 경계와 파일 배치 기준을 명시해 같은 문제는 비슷한 구조와 입출력으로 구현되게 했고, 이를 기반으로 순수 로직·계약·사용자 흐름의 테스트 경계를 정했습니다.
- PR 전에는 AI 코드리뷰를 보조로 돌리고 skills에 코드 패턴과 기획 맥락을 적어 반복 작업의 맥락 비용을 줄였습니다.
- AI 출력은 그대로 받지 않고 스킬(API·form·경계 규격)과 CI 게이트(lint·typecheck·test) 안에서만 나오게 통제했습니다. 다만 신규 프로젝트(safedoc-global)의 `any` 0·평균 파일 49줄·레이어 경계 위반 0을 만든 건 도구가 아니라 경계 설계입니다. 공통 `http()`가 zod 응답 스키마를 필수 인자로 받아 계약 불일치를 실패시키니 타입을 열어둘 자리 자체가 없었고, AI 통제는 그 위에서 편차를 줄이는 역할이었습니다.
- worktree로 두세 개를 동시에 진행합니다.

### React 18/19

- Compound Pattern + Custom Hook으로 디자인 시스템과 폼 도메인을 직접 설계.
- `useSuspenseQuery` + `getQueryClient` + `HydrationBoundary` SSR 데이터 페칭.
- 외부 mutable store를 React state로 억지로 감싸지 않고 `useSyncExternalStore` 어댑터로 연결.
- BottomSheet Compound + `overlay-kit` 라이프사이클 명시로 모바일 엣지 케이스 처리.

### TypeScript

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
- Registry + Adapter + Template Method: NestJS의 모듈 경계·constructor injection을 참고한 Electron 사이트별 어댑터 크롤러 구조 설계 (왓타임, DI 컨테이너 없이 factory 조립).
- Compound/Composition: BottomSheet, Tabs, Form.

### Form & Validation

- RHF + Zod: `useZodForm` 어댑터, step별 + 통합 schema, `superRefine` 교차 필드 검증.
- AntD Form: 대규모 폼에서 `Form.List` + `shouldUpdate` + `useWatch` cascade validation, custom trigger, 비동기 이미지 업로드 검증.

### State & Data

- TanStack Query v5: `queryOptions`로 useQuery/useSuspenseQuery/prefetch/getQueryData 통합, infinite query + intersection observer, `setQueriesData` optimistic + 롤백.
- 캐시 일관성은 `invalidateQueries` → `setQueryData` → 정규화 순으로, 네트워크·즉시성·오프라인 비용에 따라 escalation으로 판단.
- Zustand: UI 전역 상태(최근 본 프로그램, 검색 필터) 정도만.

### Test & Quality

- 디자인 시안 대조보다 기능 동작 검증의 비중이 큰 CMS·병원 CRM·global에서 반복적인 수동 확인을 병목으로 정의. Claude Code Skills로 규격화한 입출력 경계를 기준으로 Vitest 4 + Testing Library를 도입해 순수 helper·Zod 변환·React Query pagination·공용 UI를 자동 검증.
- 시간 의존 테스트는 TZ와 system time을 고정해 결정적으로 실행하고 mock server와 실제 API가 같은 계약을 통과하도록 구성해 기능 변경 시 확인 범위를 테스트 결과로 좁힘.
- 목이 거짓 초록을 낼 수 있다는 전제로 설계. 목은 내 기대만 확인해 주므로 서버 제약(`@Size`·`@NotBlank` 등)을 handler에 이식해 목이 서버처럼 거절하게 만들고, 그 위에 실서버를 직접 호출하는 계약 테스트를 별도 러너(`test:live`)로 분리해 CI 기본 실행과 떼어 둠. 거절 응답은 `code`·`violations`를 그대로 드러내 어느 필드가 막혔는지 테스트 실패 메시지에서 바로 읽히게 함.
- MSW의 브라우저·Node handler가 같은 API 계약을 사용하게 구성하고 Playwright로 예약 제출·본인확인·다국어/RTL·URL 필터·뒤로가기까지 실제 브라우저 흐름을 검증.
- 테스트는 개수가 아니라 위험 기준으로 배치. 같은 사실을 브라우저에서 다시 확인하던 E2E는 증명 비용이 더 싼 통합·계약 테스트로 내리고, 무테스트로 남아 있던 위험(장애 경로·접근 제어·중복 제출)을 우선 채움. 서버가 막지 않는 것을 API 테스트로 못박은 뒤 화면이 막는지를 사용자 행동으로 확인하는 식으로 층을 나눔.
- 콜드 전체 실행에서만 나는 간헐 실패는 노브 단위로 원인을 분리해 대응 — turbo가 패키지별 vitest를 동시에 띄워 워커가 코어의 3배로 경합하던 것은 패키지별 `maxWorkers` 캡으로, vitest `testTimeout`과 별개 노브라 기본 1s로 남아 있던 RTL `asyncUtilTimeout`은 셋업 전역값으로 통일. 테스트별 timeout 지정은 금지해 조절 지점을 한 곳에 둠. antd 제어 입력의 문자 단위 `type`이 글자 수에 비례해 느려지는 것도 붙여넣기 헬퍼로 통일.

### UI & Styling

- tailwind-variants(size/intent/state 토큰), Radix(Compound, asChild + Slot), overlay-kit, Framer Motion.

### Open Source

검증된 라이브러리 내부를 읽고 사내 어댑터 설계에 반영했으며 발견한 문제는 upstream에 PR을 보내 기여했습니다.

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
- React adapter는 `useSyncExternalStore`로 구독하고 `bindMethods<T>` mapped type으로 class instance의 method key만 추려 hook으로 노출했습니다.
- 자료구조 동작은 core에서, hook 구독은 adapter에서 각각 검증할 수 있게 나눴습니다.

---

## Education

### 대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

---

## Certification

- 정보처리기능사 | 한국산업인력공단 | 2023.04
