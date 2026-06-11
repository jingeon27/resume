# 김진건

**Frontend Engineer** <jingeon27@gmail.com> | 010-6865-8208 | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 - 2028.06)

---

## Summary

빠르게 만들어진 서비스에 합류해 기술 부채를 정리하고, 신규 기능 개발과 구조 개선을 함께 진행해 온 프론트엔드 엔지니어입니다. 2025.05 세이프닥에 합류했고, 2026.01부터는 복지몰·CMS·병원 CRM 3개 서비스를 단독 Frontend Engineer로 맡아 신규 기능 개발·운영·구조 개선을 담당하고 있습니다. React, Next.js(App Router), TypeScript 기반에서 복잡한 사용자 플로우를 운영 가능한 구조로 정리하고, 사용자 입장에서 더 명확하고 편한 경험이 무엇인지 먼저 판단하며 구현해 왔습니다.

- **AI 상담 챗봇 스트리밍 연결 계층 설계** — 레거시 apiv3 SSE를 `@tanstack/ai` adapter 계약에 맞춰 연결하고, AI 생성 / 자체 SSE 두 채널 분리 렌더 구조 설계
- **Amplitude 241개 이벤트 설계 + 시술상세 실험 계측** — 최종 예약 전환율은 변화가 없었지만 가입 후 예약까지 소요시간 14분 → 11분 단축, 리뷰 조회 사용자의 예약 전환율 +15%p를 확인해 CTA 재배치 등 후속 과제 도출
- **예약 폼 아키텍처 리팩토링** — `React Hook Form + Zod + @use-funnel/core`로 상태 소유권 단일화 (1,400 → 700줄), 동일 패턴을 리뷰 작성 / 상담 신청 / 회원정보 수정 3개 플로우에 재사용
- **CMS · 병원 CRM 13개 패키지 모노레포 단독 설계 + SafeDoc App 961파일 5-layer FSD 표준화** — 정립한 패턴 위에서 신규 쿠폰 도메인을 12파일 규모로 추가하며 구조 투자가 개발 속도로 회수됨을 확인
- **Compound Engineering — 누적되는 개발 생산성** — 패턴·스킬·에이전트에 누적 투자해 개발 속도를 지속적으로 끌어올리는 중입니다. Jira 티켓·API 스펙·Figma 와이어프레임을 묶어 원샷 plan → 표준 스킬(`/component`·`/drawer`·`/query`) + `@core` 패턴 조립 → `code-reviewer` 게이트 → worktree 병렬. 디자이너·시안 의존 없이 단독으로 신규 쿠폰 도메인 3종(템플릿 관리·기업 쿠폰팩·감사 로그, 28파일)을 출시했고, 표준 패턴 덕에 **도메인 초기 구현은 ~30분**(첫 feat 커밋 → PR 머지)까지 단축
- **Cross-domain token handoff 보안 설계** — URL token handoff의 access log / Referer 노출 위험을 form POST BFF 방식으로 전환하고 CSP `form-action` 고정 + open redirect 방어 추가

스타트업 환경에서 검증 범위와 유지보수 비용을 함께 고려하며, 검증된 라이브러리 위에 얇은 어댑터를 두고 Rule of Three 이후에만 추상화를 도입합니다.

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 **SafeDoc App(복지몰)**, **CMS**, **병원 CRM**의 프론트엔드 개발과 구조 개선을 담당하고 있습니다.

합류 당시 서비스는 병원 프로그램 탐색과 예약 흐름 중심의 MVP였고, 시술 이후 단계는 앱 내에서 거의 관리되지 않는 상태였습니다. 이후 예약 이후 운영 기능, 분석 환경, 관리자 기능까지 확장하며 운영 가능한 제품 구조로 고도화했습니다.

- **MVP 이후 제품 구조 확장 및 운영 기능 고도화**
  - 예약 이전까지만 중심이던 MVP를 유저용 프로그램 상세, 관리자용 프로그램 검수, 검색 필터 고도화까지 확장해 운영 가능한 제품 구조로 발전시켰습니다.
  - 마케팅팀이 도입한 Amplitude 환경 위에서 예약 전후 핵심 퍼널 이벤트를 설계·확장했고, 이후 기능 우선순위와 개편 효과를 데이터 기반으로 판단할 수 있게 했습니다.
  - 시술 이후 금액 변동(업셀링/다운셀링) 추적 공백을 보완하기 위해 기업 쿠폰과 정산 기능을 추가했고, 외부업체가 개발한 정산 영역은 계약 종료 후 요구사항 반영과 함께 FSD 전환, 컴포넌트 분리·추상화, 모달 패턴 공통화까지 정리했습니다.

- **Amplitude 241개 이벤트 설계 + 시술상세 실험 계측 지원**
  - 디자인팀의 가설("정보 풍부 → 신뢰 → 전환율")에 맞춰 시술상세 개편을 구현하고, 배포 전후 비교가 가능하도록 퍼널·행동 이벤트를 설계해 PO가 분석할 수 있는 계측 기반을 만들었습니다.
  - PO 분석 결과, 최종 예약 전환율은 유의미한 변화가 없었지만 가입 후 예약까지의 소요시간은 14분에서 11분으로 줄었고, 예약 페이지 진입 후 최종 신청까지의 전환은 개선되었습니다.
  - 또한 시술상세 진입 사용자 중 25%가 리뷰를 조회했고(병원상세 8%), 리뷰 조회 사용자의 예약 전환율이 비조회 사용자보다 약 15%p 높다는 점이 확인되어 프로그램 기준 리뷰 분리와 CTA 재배치를 후속 과제로 도출했습니다.
  - 신규 가입 유저의 UTM 유실 문제에서는 OAuth 로그인 전후 식별자 분리와 신규 속성 추가 가설을 먼저 검증했고, 실제 원인이 Amplitude Data의 `initial_utm_source` 속성 상태(`unexpected`)임을 찾아 코드 수정 / 배포 없이 해결했습니다.

- **AI 상담 챗봇 — 스트리밍 연결 계층 설계**
  - 메시지 store를 자체 구현하는 대안과 비교한 뒤 `@tanstack/ai`를 채택했습니다. 당장 필요한 것은 스트리밍 텍스트뿐이었지만, 이후 tool call / message parts 기반 렌더링 확장을 고려해 표준 스트리밍 계약 위에 얹는 쪽을 선택했습니다.
  - 레거시 apiv3 SSE 응답을 `@tanstack/ai`의 `SubscribeConnectionAdapter` 계약에 맞추기 위해, 콜백 기반 SSE 이벤트를 async generator로 변환하는 push→pull 브릿지(`createPushStream`)를 설계했습니다.
  - AI 생성 스트림과 자체 apiv3 SSE 두 채널을 분리하고, 렌더링은 apiv3 SSE를 단일 소스로 두어 같은 메시지가 중복 렌더되지 않게 했습니다.
  - 메시지 상태는 서버 status를 권위로 두고 클라이언트 전용 `connecting` 상태 + Suspense `initialMessages`로 effect 동기화 없이 초기 상태를 시드했고, Zod `.catch()` per-field degradation으로 malformed SSE가 스트림을 죽이지 않게 했습니다.

- **예약 Form 아키텍처 리팩토링 — 1,400 → 700줄**
  - `useState` 30개와 props drilling, `useEffect` 5~6개로 얽혀 있던 가족 동기화 코드를 `React Hook Form + Zod + @use-funnel/core` 조합으로 정리했습니다.
  - 날짜 선택 상태가 local state와 Zustand store에 중복 저장되고, 가족 목록이 React Query cache와 store에 이중 관리되던 구조를 FormProvider 중심으로 재정리해 상태 소유권을 단일화했습니다.
  - 가족 데이터 동기화 로직을 550줄에서 55줄로 줄였고, cross-field 검증을 if 분기에서 `superRefine` 선언형 schema로 옮겼습니다.
  - 이 패턴은 리뷰 작성 / 상담 신청 / 회원정보 수정에도 재사용했습니다.
  - 테스트 코드가 없는 코드베이스라 회귀 위험은 검증 표면을 컴파일 타임으로 옮겨 관리했습니다. `Partial` 기반 느슨한 폼 타입을 Zod 추론 타입으로 교체해 검증 누락이 타입 에러로 드러나게 했고, 매 액션마다 수동 호출하던 `checkFormValidation` 패턴을 제거했습니다. PR마다 `tsc --noemit` + ESLint CI 게이트를 거치고 develop → stage → production 단계 배포로 확인 후 반영했습니다.

- **리뷰 작성 플로우 — 0부터 설계한 신규 도메인**
  - 4단계 funnel, step별 Zod schema, 통합 schema를 설계했습니다. 가족 정보는 prefetch 후 form에 주입했습니다.
  - 이후 상담 / 견적 요청 플로우를 설계할 때 레퍼런스 구현으로 활용했습니다.

- **`@core` 디자인 시스템 — 20개 Primitive Component**
  - Radix UI / Headless UI 위에 `Button`, `Input`, `BottomSheet`, `Dialog`, `Toast`, `Tooltip`, `Callout`, `Checkbox`, `Radio`, `Toggle`, `Tabs`, `Chip`, `Menu` 등을 공통화했습니다.
  - `tailwind-variants`로 size / intent / state 3축을 표준화해 inline `className` override 안티패턴을 줄였습니다.
  - BottomSheet Compound (`Root/Header/Content/Footer`)를 `react-modal-sheet` 위에 설계하고 `overlay-kit` imperative API로 호출하도록 구성해, 뒤로가기(`popstate`) 닫기 · backdrop tap 닫기 · snap point/detent를 `Root` 라이프사이클 레이어 한 곳에서 처리했습니다.

- **SafeDoc App 프론트 아키텍처 정리**
  - 961 파일 규모의 코드베이스에서 FSD와 Atomic Design 잔재가 섞여 있던 구조를 5-layer FSD (`app / pages / widgets / features / entities / shared`)로 표준화했고, 25개 entities / 20개 features 슬라이스의 경계와 Public API 기준을 정립했습니다.
  - widgets → features 이관, 순환 의존 해소, 파일명 kebab-case 정리를 점진적으로 진행했습니다.
  - `ensureQueryData` + props drilling로 캐시를 구독하지 않아 무효화가 화면에 반영되지 않던 구조를, `queryOptions` + Server Component prefetch → `HydrationBoundary` → `useSuspenseQuery`로 전환해 구독을 호출 지점으로 분산했습니다. infinite query는 사내 `infiniteSetData` 헬퍼로 nested page 내 개별 아이템을 갱신했습니다.
  - 공통 부모 `layout.tsx` 단계에서 program 상세 정보를 prefetch하도록 구조를 바꿔, 기존에 프로그램 상세 페이지와 상담 페이지가 각각 별도로 호출하던 `/program/detail` API를 request-scoped 캐시 안에서 재사용하게 만들어, 상세 → 상담 전환 플로우 기준 해당 API 서버 호출을 2회에서 1회로 줄였습니다.

- **CMS · 병원 CRM 13개 패키지 모노레포 단독 설계**
  - 13개 패키지(3 config + 5 shared + 2 lib + entities + features)를 설계했고, workspace protocol과 pnpm catalog로 공통 의존성을 관리했습니다.
  - CMS와 병원 CRM의 중복 구현을 줄이기 위해 `entities`, `features`, `shared`, `config`, `lib` 패키지 경계를 나누고, 공통 도메인은 패키지로 추출해 두 앱에서 같은 구현을 재사용하도록 설계했습니다.
  - `@safedoc/ui` 패키지 빌드 방식을 `prebuilt(tsup)`에서 `no-build bundled`로 전환해 패키지 ↔ 앱 변경이 즉시 HMR에 반영되도록 했습니다.

- **Claude skills 기반 개발 문서화 및 workflow 변경**
  - `.claude` 설정과 skills 문서를 정리해 FSD 경계, Public API 기준, 모달 제작 패턴, 정산 도메인 리팩토링 방식, 기획 맥락 같은 반복 지식을 문서화했습니다.
  - `jira-branch` 명령으로 이슈와 브랜치 맥락을 읽고 작업 계획 초안을 만들 수 있게 했고, 반복되는 커밋 / PR 작성 흐름을 명령화해 문맥 전환 비용을 줄였습니다.
  - PR 전에는 AI agent 코드리뷰를 보조 점검 단계로 활용해 경계 위반, 네이밍, Public API 누락 같은 이슈를 먼저 확인했고, worktree를 활용해 2~3개의 작업을 병렬로 진행하는 workflow를 운영했습니다.

- **FSD sub-domain 패턴 자체 정립**
  - 단일 슬라이스 파일이 30개 이상 누적되면 평평한 구조가 가독성을 해친다고 판단해 `entities/settlement/{common, contract, deposit, disapproval, omission}` 형태로 도메인 라이프사이클 단계별 분할을 도입했습니다.
  - sub-feature 패턴 (`features/program/ui/{detail, modal}`)으로 UI 블록 의존성을 폴더 트리에서 가시화했습니다.
  - **한계**: 30+ 누적 후에야 도입 → 마이그레이션 비용 증가. 15개 시점에 도입 기준이 있었다면 비용 절반.

- **Program 도메인 폼 설계 — 대규모 복합 폼 시스템**
  - CMS / 병원 CRM이 공유하는 38개 필드 규모의 Program 관리 폼을 `program/{common, inspection}` sub-domain으로 나눴고, 폼 / 서버 변환 / 검수 UI / 상세 설명 템플릿을 포함한 AntD Form 도메인으로 설계했습니다.
  - 2-tier `FORM_NAME` enum을 통해 `@safedoc/types` 공통 enum과 CMS 전용 enum이 같은 값을 재참조하도록 만들어 공통 필드 변경을 양쪽에 동기화했습니다.
  - Transfer Layer (`programDetailToClientProgramForm` / `clientProgramFormToCreateRequest`)로 서버 ↔ 폼 변환 로직을 분리했고, Dayjs / UploadFile / 템플릿 데이터를 양방향으로 변환했습니다.
  - `Form.List`, `useWatch`, `shouldUpdate`, custom validator를 조합해 조건부 렌더링, 시술 전후 이미지 페어 검증, 비동기 이미지 업로드 응답 검증, cascade validation을 구현했습니다.
  - 검수는 단일 폼 인스턴스와 상태 머신 (`PROGRAM_INSPECTION_STATUS`: `Request → Waiting → Confirm | Reject`), Callout 배지 조합으로 단순화했습니다.
  - Admin 안정화 후 `@safedoc/features`로 추출해 CMS / 병원 CRM이 함께 쓰도록 확장했습니다.

- **정산 리팩토링 + 운영 개선**
  - Next.js Middleware + Route Group `(altLayout)/settlement`로 별도 호스트를 분리하면서도 단일 코드베이스를 유지했습니다. 동시에 legacy `fetch/apis` 구조를 FSD `entities/features` 구조로 마이그레이션했습니다.
  - 서로 다른 registrable domain 간 HttpOnly 쿠키를 공유할 수 없는 문제를 해결하기 위해 정산 메뉴 클릭 시 토큰을 handoff하는 흐름을 설계했고, URL query 방식에서 form POST BFF 방식으로 전환해 access log / Referer 노출 위험을 제거했습니다.
  - BFF에는 토큰을 HTML 속성 escape 후 주입하고, CSP `form-action`을 목적지 origin으로 고정, `Cache-Control: no-store`, `referrer-policy: no-referrer`, `303 See Other`, `next` pathname 정규화 기반 open redirect 방어를 적용했으며, 미들웨어는 도메인 라우팅만 담당하도록 handoff 책임을 별도 API 라우트로 분리했습니다.
  - `queryClient.setQueriesData`로 즉시 반영하고, 실패 시 catch 블록에서 자동 롤백되도록 구성해 정산내역 / 숨김처리 비교 두 탭이 함께 갱신되도록 했습니다.
  - 정산 `entities`를 `common / omission / disapproval / deposit / contract` sub-domain으로 나누고, `features/settlement`는 URL 기준 `dashboard / monthly / program / contract` 구조로 재편했습니다. `settlement/program`과 `settlement/monthly` 페이지는 SearchFilter / Table / hook / modal 단위로 분리해 레거시 page 중심 구조를 걷어냈습니다.
  - 레거시 `forwardRef` 기반 모달은 `overlay-kit` 패턴으로 전환했습니다. `settlement/program`과 `settlement/monthly`의 대표 모달을 먼저 리팩토링한 뒤, 동일한 컨벤션과 체크리스트를 바탕으로 비슷한 패턴의 모달과 페이지를 같은 방식으로 정리했고, PR 전 보조 코드리뷰로 경계 위반과 Public API 문제를 먼저 점검했습니다.
  - 이 과정에서 `handleUpdate` 계열 로직은 curried 함수 → 단일 함수 통합 + 실패 폴백 추가로 정리했고, settlement mutation은 optimistic update 패턴으로 통일했습니다.

- **운영자 도구 UX 및 백오피스 도메인 표준화**
  - 예약, 프로그램 검수, 정산, 병원 계약, 리뷰, 채팅, 홈 설정, 기업 / 대학교 관리처럼 운영자가 반복적으로 사용하는 CMS / 병원 CRM 화면을 도메인 단위로 분리했습니다.
  - SearchFilter / Table / Modal / Drawer / Detail Form 패턴을 반복 가능한 단위로 정리해 레거시 page 중심 구조에서 기능 단위 구조로 옮겼습니다.
  - 정립한 `entities` / `DetailDrawer` / SearchFilter 패턴 위에서, 신규 쿠폰 도메인 전체 — 템플릿 관리(목록 / 등록 / 복제 prefill / 상태 일괄변경) · 기업 쿠폰팩(매핑 / 제휴 해지 / 일괄 회수) · 감사 로그 뷰어 — 를 3개 티켓 · 28파일 규모로 단독 출시했습니다. 표준 entity·Drawer·SearchFilter 조립 덕에 **도메인 초기 구현 자체는 ~30분**(첫 feat 커밋 → PR 머지)이었고, 이후 시간은 기획 합의·요구사항 반영 반복이었습니다 — 표준화 투자가 신규 어드민 개발 속도로 회수됨을 보여주는 사례입니다.
  - 디자이너의 완성 시안 없이 저해상도 와이어프레임만 주어진 어드민 작업은, **Jira 티켓 + API 스펙 + Figma 와이어프레임을 한 번에 묶어 원샷으로 작업 plan을 세우고 worktree로 여러 도메인을 병렬 개발하는** 흐름으로 처리했습니다 — **① Figma Dev Mode MCP**(`get_metadata`·`get_design_context`·`get_screenshot`·`get_variable_defs`)로 와이어프레임의 레이아웃·구조·토큰·스크린샷 컨텍스트를 추출해 코드 시작점을 얻고 → **② `/component`·`/drawer`·`/modal`·`/query` 스킬과 `@core`·`DetailDrawer`·SearchFilter 패턴**으로 조립·치환한 뒤 → **③ `code-reviewer` 에이전트** 게이트로 경계 위반·Public API 누락을 점검. MCP는 구조 컨텍스트만 주고 비주얼·로직은 사내 디자인 시스템과 패턴이 메우므로, 시안·디자이너 의존과 작업 직렬화를 동시에 걷어내 어드민 기능을 빠르게 출시했습니다.

- **동적 sitemap / robots 설계 (SEO)**
  - 병원 / 프로그램 / 공지 / 혜택 탐색 / 진료과·시술·세부시술 검색 경로를 5개 API에서 `Promise.all`로 수집해 sitemap을 동적 생성했고, 페이지 유형별 우선순위(`MULTI / SINGLE / ETC / FORM`) taxonomy를 부여했습니다.
  - `page:1, size:1`로 `totalCnt`를 먼저 조회한 뒤 `size=totalCnt`로 전량을 수집했고, Next.js가 `<loc>`를 XML 이스케이프하지 않는 문제를 직접 escape 처리로 보완했습니다.
  - 세부시술 allowlist와 `revalidate=86400`(24h ISR)로 sitemap 비대화와 빌드 부하를 함께 제어했고, `robots.ts`의 disallow 경로를 정리했습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 - 2024.11

캘린더 기반 일정 조율 + ATS 솔루션 SaaS의 ATS 서비스 round에서 신규 기능 개발과 유지보수를 담당했습니다.

- **Electron Desktop 크롤러 아키텍처 재설계 — MVC + DI + Factory Pattern**
  - 채용 플랫폼(점핏 / 잡플래닛 / 게임잡)마다 별도 구현체와 공통 흐름(로그인 → 검색 → 수집 → 업로드)이 반복 / 변형되던 구조를 재설계했습니다.
  - `CandidateServiceHelper` 컨트롤러와 `PlatformAdapter` 인터페이스, `PlatformAdapterFactory`로 분리했고, 신규 플랫폼은 adapter 구현 + factory 등록만으로 확장할 수 있게 했습니다.
  - **신규 플랫폼 연동 기간을 3일에서 1일로 줄였습니다.** (3개 플랫폼 도입 후 직접 측정)
  - **한계**도 있었습니다. DI 구조는 갖췄지만 단위 테스트는 시간 부족으로 후행되었고, DOM 셀렉터 변경에 대한 헬스체크 / 알람까지 함께 만들었다면 운영 비용을 더 줄일 수 있었을 것입니다.

- **면접 템플릿 / 온보딩 4단계 funnel**
  - `useFunnel`(단계 전환)과 `usePromiseSessionStorage`(단계 데이터 sessionStorage 자동 백업, 새로고침 / 탭 닫힘 후 복원), `FormDirtyContext`(변경 있음 전역 노출, `beforeunload` + 라우터 confirm)를 통합했습니다.
  - 면접 템플릿 / 온보딩 / 자동화 규칙 / 평가 템플릿 4가지 흐름에 같은 패턴을 재사용했습니다.

- **채용 페이지 / 지원서 설정 폼**
  - `React Hook Form` + `useFieldArray` + `FormProvider` + `useYupValidation` 구조를 적용했습니다. 이후 세이프닥 `useZodForm` 패턴의 yup 버전 원형이 되었습니다.

- **메일 / 알림 템플릿 시스템**
  - `@whattime/quill` 기반 WYSIWYG와 템플릿 변수 시스템(`{{candidateName}}` placeholder 치환)을 구현했습니다. quill blot 시스템을 활용해 변수를 atomic node로 처리했습니다.

- **Server State 표준화**
  - `@lukemorales/query-key-factory`로 candidate / recruit / member / interviewAlarm 도메인의 query key를 표준화해 무효화 누락과 key drift를 줄였습니다.

- **DnD 공고 정렬**
  - `@dnd-kit` (`DndContext` + `SortableContext` + `PointerSensor` + `arrayMove`) 기반으로 구현했고, optimistic update와 자동 롤백을 적용했습니다.

- **roundhr.com 랜딩**
  - Next.js 기반으로 운영했고, Notion CMS와 `react-notion-x`, Strapi를 조합해 간단한 콘텐츠 운영 서버를 구성했습니다.

---

## Skills

### 시그니처

- 스타트업 환경에서 검증 범위와 유지보수 부담을 함께 고려해 검증된 라이브러리 위에 얇은 어댑터를 둡니다.
- Rule of Three 이후에만 추상화를 도입하고, 신규 기능 PR 안에서 해당 영역만 점진적으로 정리해 초기 과설계를 피합니다.
- **Compound engineering** — 반복으로 검증된 패턴을 `@core` / FSD / sub-domain으로 추출하고, `.claude` 스킬(`/component`·`/drawer`·`/query`)과 `code-reviewer` 에이전트로 codify해 *매 작업이 다음 작업의 비용을 낮추도록* 누적 투자하며, 개발 생산성을 지속적으로 끌어올리는 중입니다. 신규 어드민 도메인 초기 구현 ~30분이 그 현재 결과입니다.
- Server / Form / UI 전역 / 로컬 상태의 역할을 분리해 한 도구에 과도하게 책임을 몰지 않습니다.
- FP 스타일과 `es-toolkit`, `ts-pattern`을 활용해 선언적으로 표현하되, 과한 추상화는 지양합니다.
- 리스트 virtual scroll, 검색·필터 구조 개선, 모달 패턴 공통화처럼 제품 성능과 운영 경험을 함께 개선하는 제안을 지속해 왔습니다.
- UI 일관성, 사용자 인지 방식, 기존 패턴과의 정합성을 근거로 디자이너·기획자와 소통합니다.

### AI Workflow

- 반복되는 개발 흐름을 `.claude` 스킬·명령으로 체계화했습니다 — 작업 시작(`/jira-branch`로 JIRA 티켓 맥락 → 작업 계획 초안, `/branch`), 코드 생성(`/component`·`/query`로 컨벤션 준수 스캐폴딩), 검증·배포(`/push`·`/pr`·`/stage-deploy`·`/full-deploy`·`/build-fix`)를 명령화해 문맥 전환 비용을 줄였습니다.
- **디자인 시안 없는 어드민 화면을 원샷 plan으로 병렬 개발**: Jira 티켓 · API 스펙 · Figma 와이어프레임을 한 번에 묶어 작업 plan을 세우고 → Figma Dev Mode MCP 컨텍스트 추출 → `/component`·`/drawer`·`/modal` + `@core` 패턴 조립 → `code-reviewer` 게이트로 이어, worktree로 2~3개 작업을 병렬 진행했습니다. 디자이너·시안 의존과 작업 직렬화를 제거해 개발 throughput을 높였습니다.
- FSD 경계 / Public API 기준 / 모달·드로어 제작 패턴 / 정산 리팩토링 방식 / 기획 맥락 같은 반복 지식을 스킬·정책 문서로 정리해, PR 전 `code-reviewer` 보조 점검과 결합했습니다.

### React 18

- Compound Pattern + Custom Hook 추상화로 디자인 시스템 / 폼 도메인 직접 설계.
- `useSuspenseQuery` + `getQueryClient` + `HydrationBoundary` SSR 데이터 페칭 표준화.
- 외부 SSE API를 `@tanstack/ai` adapter 계약(`SubscribeConnectionAdapter`)에 맞춰 callback→AsyncGenerator push→pull 브릿지로 연결.
- 외부 mutable store를 React state로 억지로 감싸지 않고 `useSyncExternalStore` 기반 adapter로 연결해 React 18 external store contract에 맞춘 구독 구조 설계.
- BottomSheet Compound (`Root/Header/Content/Footer`) + `overlay-kit` 라이프사이클 명시화로 4가지 모바일 엣지 케이스 처리.
- 스타트업 환경에서 검증된 라이브러리를 우선 활용하고 필요한 만큼만 래핑해, 직접 구현 범위와 검증해야 할 표면적을 함께 줄이는 방향으로 설계했습니다.

### TypeScript 5

- Variadic tuple 단계별 폼 타입 합성, recursive type nested key path 추론, mapped type + key remapping 도메인 타입 자동 생성.
- URL 필터 상태를 `as const satisfies` + mapped type 파서 레지스트리로 모델링해, 키 추가 시 파서 누락 / 반환 타입 불일치를 컴파일 에러로 강제.
- class instance에서 method key만 추론하는 mapped type 유틸을 만들어 core 자료구조 API를 React hook adapter로 노출.
- Zod schema 추론 제네릭 (`z.infer<ZodObject<T>>`) → schema 변경 시 form 타입 자동 동기화.
- Discriminated Union 도메인 적용: 유입 경로별 동의서 폼 타입 분리.
- `satisfies` + `as const` 도메인 상수 객체 좁은 추론.

### Next.js 15 App Router

- **Middleware / BFF**: `/settlement/*` 별도 호스트 분리, form POST 기반 cross-domain 토큰 핸드오프 API 라우트 설계.
- **Route Group**: `(altLayout)/settlement` 별도 레이아웃 + 단일 코드베이스.
- **Caching**: `cookies()` / `searchParams` dynamic 강제 트리거, fetch caching 옵션 (`force-cache` / `no-store` / `revalidate` / `tags`) 도메인별 적용. `revalidatePath` vs `revalidateTag` 차이 기반 무효화 전략.
- **RSC**: Server → Client props 직렬화 제약 (함수 / class instance / Symbol 불가) 이해 기반 컴포넌트 경계 설계.

### Architecture

- **FSD 5-layer + sub-domain 자체 정립**: 961 파일 코드베이스 표준화. sub-domain은 FSD 공식이 아닌 자체 패턴, 슬라이스 파일 수 + 변경 빈도 기준으로 도입 시점 판단.
- **Monorepo (Turborepo + pnpm)**: 13 패키지 단독 설계. `entities` / `features` / `shared` / `config` / `lib` 경계로 CMS와 병원 CRM의 공통 도메인 구현 공유.
- **Library Adapter Design**: core 로직과 React binding을 분리하고, observer + `useSyncExternalStore`로 imperative 자료구조를 hook API로 노출.
- **MVC + DI + Factory Pattern**: Electron 크롤러 재설계 (왓타임).
- **Compound / Composition Pattern**: BottomSheet, Tabs, Form 핵심 UI 도메인 적용.

### Form & Validation

- **React Hook Form + Zod**: `useZodForm` 어댑터 (schema → form 타입 자동 동기화). step별 schema 분리 + 통합 schema, `superRefine` cross-field validation.
- **Ant Design Form**: 대규모 복합 폼에서 `Form.List` + `shouldUpdate` + `useWatch` cascade validation, `Form.Item` custom trigger (`onDragTable`), 비동기 이미지 업로드 + `customRequest` + validator 응답 객체 존재 여부 판단.

### State & Data Fetching

- **TanStack Query v5**: `queryOptions` 패턴으로 useQuery / useSuspenseQuery / prefetchQuery / getQueryData 통합. infinite query + intersection observer 무한 스크롤. `queryClient.setQueriesData` 기반 Optimistic Update + 자동 롤백.
- **Zustand**: UI 전역 상태 (최근 본 프로그램, 검색 필터) 한정.

### UI & Styling

- **tailwind-variants**: size / intent / state 3축 디자인 토큰 스키마.
- **Radix UI / Headless UI**: Compound Pattern, asChild + Slot, Primitive.
- **overlay-kit**: BottomSheet / Dialog 호출 라이프사이클 명시화.
- **Framer Motion**: AnimatePresence + motion 페이지 / 단계 전환.

### Open Source Reading

검증된 라이브러리 내부를 읽고 사내 추상화 설계에 반영했습니다.

- **React Hook Form**: `useForm` proxy 기반 selective re-render 메커니즘 → `useZodForm` 어댑터 설계 시 참고.
- **Toss Slash** (`@use-funnel/core`, `overlay-kit`): funnel history snapshot + overlay 라이프사이클 → 사내 funnel wrapper / BottomSheet compound 설계 시 참고.
- **TanStack Query / TanStack AI**: `queryOptions` 패턴 + infinite query cache 구조, `SubscribeConnectionAdapter` 스트리밍 계약 → 사내 query key 표준 / 챗봇 SSE 브릿지 설계 시 참고.

---

## Side Projects

### data-structure-ts

- core 자료구조 패키지와 React binding 패키지를 분리하고, Queue / Heap / PriorityQueue를 observer 기반 외부 store로 모델링했습니다.
- React adapter는 `useSyncExternalStore`로 구독하고, `bindMethods<T>` mapped type으로 class instance의 method key만 추론해 hook API로 노출했습니다.
- core logic과 React binding을 분리해 자료구조 동작은 core에서, hook 구독 동작은 adapter 레벨에서 검증할 수 있게 설계했습니다.

---

## Education

### 대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

---

## Certification

- 정보처리기능사 | 한국산업인력공단 | 2023.04
