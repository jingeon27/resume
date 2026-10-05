# 김진건

**Frontend Engineer** · <jingeon27@gmail.com> · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

복지몰 웹과 인앱 웹뷰, 병원 CRM, 내부 운영 CMS 단독 담당 · Claude Code로 반복되는 운영 업무 자동화

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

초기 MVP를 넘겨받아 예약 이후의 운영·분석·관리 기능까지 확장해 온 프론트엔드 개발자입니다. 2026년 1월부터 사용자가 예약·상담을 진행하는 복지몰 웹과 인앱 웹뷰, 병원이 프로그램·예약·정산을 관리하는 CRM, 내부 구성원이 플랫폼 운영에 쓰는 CMS의 프론트엔드를 맡고 있습니다. 반복 업무는 화면 패턴과 자동화로 줄이고, 데이터로 문제를 확인해 사용자 경험과 운영 효율을 함께 개선합니다.

검증된 도구를 먼저 쓰되, 우리 서비스에 필요한 만큼만 얇게 감싸서 씁니다. 반복 작업은 Claude Code로 자동화하고, AI가 만든 코드는 팀 컨벤션과 실제 동작을 기준으로 다시 확인합니다.

- 프론트엔드 단독 담당으로 복지몰 웹과 인앱 웹뷰, 병원 CRM, 내부 운영 CMS를 함께 개발·운영
- 결제수단·상태처럼 케이스가 계속 늘어나는 운영 화면을 union 타입과 공통 패턴으로 정리
- Amplitude 이벤트 약 240개로 사용자 행동을 확인하고, 리뷰 조회 사용자의 예약 전환율이 미조회 사용자 대비 +15%p 높음을 확인
- 서비스 작업 패턴을 Claude Code skills로 정리하고, Jira 기반 계획 수립부터 머지 전 검증까지 반복 흐름 자동화

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼에서 복지몰 웹과 인앱 웹뷰, 병원 CRM, 내부 운영 CMS를 단독으로 개발·운영하고 있습니다. 예약까지만 있던 MVP를 예약 이후 운영·분석·관리 기능까지 넓혀 왔습니다.

**복지몰 웹 · 인앱 웹뷰**

- 웹과 네이티브 앱 웹뷰에서 같은 예약/상담 흐름이 깨지지 않도록 bridge, `popstate`, BottomSheet, backdrop 동작을 함께 검증했습니다. BottomSheet는 Compound(`Root/Header/Content/Footer`) + `overlay-kit`로 만들어 뒤로가기·backdrop tap·snap point 같은 모바일 엣지케이스를 한곳에서 처리합니다.
- `@core` primitive 20개를 `tailwind-variants`의 size/intent/state 토큰으로 묶어, 새 화면을 빠르게 조립할 수 있게 정리했습니다.
- 예약·리뷰·상담 폼을 `RHF + Zod`로 정리하고, 다단계 리뷰 작성은 `@use-funnel/core`로 구조화했습니다. 가족 동기화 컴포넌트는 520줄에서 55줄로 줄었고, 흩어져 있던 if 검증을 `superRefine` 스키마로 옮겼습니다. ([글](https://jingeon27.tistory.com/11))
- AI 상담 챗봇은 포맷을 바꿀 수 없는 외부 세션 SSE를 `@tanstack/ai` 어댑터 계약에 맞추기 위해, SSE 콜백을 async generator로 바꾸는 push→pull 브릿지를 만들고 화면 데이터는 세션 SSE 하나로 모았습니다. ([글](https://jingeon27.tistory.com/20))
- 병원 검색은 `geolib` 거리 계산, `naver-maps` SDK, `react-intersection-observer` 무한 스크롤에 자동완성·인기 검색어를 연동했습니다. 동적 sitemap은 5개 API를 모아 생성하고, `'use cache'`로 생성 비용을 줄였습니다. ([글](https://jingeon27.tistory.com/21))

**어드민 2종 운영 — 병원 CRM · 내부 운영 CMS**

- 프로그램 관리는 시술상세 추가에 맞춰, 프로그램을 상세 이미지 템플릿(`SafedocTemplate`/`CustomImage`) 형식으로 등록하도록 다시 설계했습니다(38필드 복합 폼). 예약·정산·쿠폰·병원 계약 화면은 SearchFilter / Table / Modal / Drawer / Detail Form 패턴으로 정리했습니다. ([글](https://jingeon27.tistory.com/18))
- CMS와 병원 CRM이 함께 쓰는 폼은 공통 폼 값 타입 위에 각 앱의 필드를 더하는 방식으로 `createTypedForm`을 만들었습니다. 공통 필드 정의를 한 곳에서 바꾸면 양쪽 앱에 같이 반영되고, 잘못된 필드 경로는 컴파일 에러로 잡히게 했습니다. 서버 응답/요청과 폼 값 변환은 Transfer Layer 한곳에 모았습니다.
- 정산은 메인과 도메인이 달라 HttpOnly 쿠키를 공유할 수 없었습니다. 첫 구현이던 URL 토큰 전달은 access log·Referer에 토큰이 남을 위험이 있어, form POST BFF로 바꾸고 CSP `form-action` 고정, open redirect 방어를 적용했습니다. ([글](https://jingeon27.tistory.com/19))
- 정리해 둔 패턴을 바탕으로 신규 쿠폰 템플릿 관리 도메인을 약 12개 파일 규모로 구현했습니다.

**빠른 개발 사이클 안에서 안정성 챙기기**

- 시술 결제내역에 쿠폰결제를 추가할 때, 결제건을 결제수단별 union 타입으로 두고 분기를 `ts-pattern` 한곳에 모았습니다. 덕분에 기존 렌더링 코드는 거의 건드리지 않고 새 결제수단을 추가할 수 있었습니다. 결제내역처럼 케이스가 계속 늘어나는 화면은 처음부터 확장될 것을 전제로 설계합니다.
- 복지몰의 FSD 레이어 경계는 의존성 없는 자체 ESLint 플러그인(flat config)으로 강제해, 레이어 위반이 문서나 리뷰가 아니라 lint 단계에서 잡히게 했습니다.
- 서버에서 `dehydrate`한 캐시를 클라이언트가 props/Context로만 받아 쓰다 보니, 무효화해도 화면이 바뀌지 않는 문제가 있었습니다. 이를 `queryOptions` prefetch → `HydrationBoundary` → `useSuspenseQuery` 구독 흐름으로 바꿔 캐시와 화면이 같은 데이터를 보게 했습니다. 유저 정보 Context는 React Query로, Zustand에 흩어져 있던 폼 상태는 React Hook Form으로 옮겼습니다.
- 아직 필요하지 않은 추상화는 미루고, 신규 기능 PR 안에서 실제로 필요한 영역만 조금씩 정리해 배포 속도와 구조 개선을 같이 챙깁니다.

**데이터로 문제 정의 (Amplitude)**

- 복지몰 전반에 퍼널·행동 이벤트 약 240개를 설계해 적용했고, 시술상세 개편 후 예약/상담 퍼널을 비교해 사용자가 CTA에 도달하기 전에 이탈하는 문제를 확인했습니다.
- 리뷰를 조회한 사용자의 예약 전환율이 미조회 사용자보다 15%p 높게 나타났으며, 이를 인과관계가 아닌 행동 간 상관관계로 해석했습니다.
- 신규 가입 UTM 유실은 프론트엔드에 `utm_source` 저장 코드를 먼저 넣었다가, 코드 문제가 아니라 Amplitude 속성 상태(`unexpected`)가 원인임을 확인해 열흘 만에 그 코드를 되돌리고 마케팅팀과 설정으로 해결했습니다.

**AI 작업 흐름 (Claude Code)**

- 서비스 작업에서 반복되는 구조를 Claude Code skills로 패턴화하고, Jira 태스크 기반 계획 수립부터 구현 후 커밋 작성·코드 리뷰·머지 전 검증까지 이어지는 흐름을 자동화했습니다.
- 시안 없이 와이어프레임만 있는 화면은 Jira·API 스펙·Figma를 함께 확인해 작업 계획을 세운 뒤, Figma Dev Mode MCP로 필요한 정보를 확인해 표준 패턴으로 조립합니다. 쿠폰 템플릿 관리 같은 신규 도메인을 이 방식으로 빠르게 세웠습니다.
- AI가 만든 코드는 컨벤션과 빌드 결과를 기준으로 다시 봅니다. 빌드 오류를 `force-dynamic` 추가로 우회하지 않고 `'use client'` 누락을 수정했으며, create/update 겸용이라 수정 시에도 `router.push`가 실행되던 mutation 훅은 역할별로 나눴습니다.

**모노레포 재설계 (Turborepo + pnpm)**

- CMS와 병원 CRM 모노레포에서는 기능별 shared 5개 때문에 import 경로가 흩어지고 컴파일도 느렸습니다.
- 두 앱이 함께 쓰는 도메인은 entities/features 패키지로 새로 정의하고, 기능별 shared 5개는 FSD에 맞게 단일 `@safedoc/shared`로 합쳐 13개 패키지를 9개로 줄였습니다. 경계 규칙은 레이어별 CLAUDE.md와 문서로 남겼습니다.
- 아키텍처는 FSD의 도메인 중심 분리를 그대로 따르기보다, 서버 모델을 그대로 보여주는 재사용 UI(예: `ProgramCard`)는 공용 레이어로 내리고 페이지마다 달라지는 UI는 해당 페이지에서 조립하는 기준을 세웠습니다. 도메인 이름보다 두 번째 사용처가 생겼는지를 분리 신호로 보고, 페이지는 로직 없이 연결만 하는 얇은 연결 계층으로 둡니다. (전임자가 도입한 FSD가 Atomic Design과 섞여 있던 상태를 FSD로 통일한 뒤 이 방향으로 개선했습니다.)

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- ATS 크롤러가 사이트마다 중복 구현되던 구조를, NestJS의 모듈 경계·constructor injection을 참고해(NestJS 도입은 CTO가 Electron main 프로세스에 무겁다고 반려해 걷어내고, DI 컨테이너 없이 factory로 조립) 사이트별 어댑터 구조로 재설계하고 팀에 공유했습니다. 새 사이트는 service·repository·helper 구현만으로 연동할 수 있게 했고, 점핏·잡플래닛·게임잡 3개 연동 이후로는 새 사이트를 붙일 때 정해진 인터페이스 구현만 남았습니다. 단위 테스트는 후행 과제로 남았습니다.
- 폼 dirty 추적·복원(`FormDirtyContext` + sessionStorage) 패턴을 네 흐름에 재사용했고, 다단계 입력은 `useFunnel`로 구조화했습니다. 세이프닥 `useZodForm`의 원형이 된 패턴입니다. DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 적용했습니다.

---

## Skills

**운영 개선** — 복지몰 웹과 인앱 웹뷰, 병원 어드민과 내부 운영 어드민을 혼자 설계·운영하며 끝까지 책임집니다. 기획이 완전히 정해지기 전에도 엔지니어링 관점에서 판단이 서면 먼저 제안하고 움직이되, 아직 필요하지 않은 추상화는 미루고 단순한 구조를 유지합니다.

**AI 작업 흐름** — 서비스 작업에서 반복되는 구조를 Claude Code skills로 패턴화하고, Jira 태스크 기반 계획 수립, 커밋 작성, 코드 리뷰, 머지 전 검증 같은 개발 절차를 자동화합니다. AI가 만든 결과는 컨벤션과 실제 동작으로 다시 확인합니다.

**프론트엔드** — TypeScript 5, React 18(Compound/Custom Hook, `useSuspenseQuery`, `useSyncExternalStore` 어댑터, SSE push→pull 브릿지), Next.js App Router(Middleware/BFF, 캐싱 모델, RSC 경계). 브라우저·플랫폼 경계를 직접 다뤄왔습니다 — HttpOnly 쿠키와 registrable domain 제약(크로스 도메인 BFF), `EventSource`의 커스텀 헤더 한계(fetch 기반 SSE로 교체), `popstate`·웹뷰 라이프사이클.

**상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod(`useZodForm`, `superRefine`). REST/axios 환경에서 서버 상태·캐시 일관성·BFF 경계를 다뤄왔습니다.

**아키텍처/UI** — FSD 6-layer + sub-domain, Turborepo + pnpm 모노레포, tailwind-variants, Radix, overlay-kit, 인앱 웹뷰 브릿지.

**새 스택 흡수** — 주력은 React/Next.js로 만든 복지몰 웹, 인앱 웹뷰, 어드민입니다. 새로운 스택은 공식문서와 내부 계약을 먼저 읽고, 작은 어댑터를 만들어 실제 코드에 붙이는 방식으로 익혀 왔습니다(RHF·Zod·use-funnel·Radix). Vue.js와 React Native도 필요한 플랫폼 차이를 같은 방식으로 빠르게 좁힐 수 있습니다. toss/slash `useFunnel`의 step 타입 제약을 정리한 PR이 머지된 경험도 있습니다([PR #363](https://github.com/toss/slash/pull/363), 2024.05).

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
