# 김진건

**Frontend Engineer** · <jingeon27@gmail.com> · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

복지몰·CMS·병원 CRM 단독 담당 · Claude Code 기반 AI 워크플로우 구축

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

급하게 만들어진 MVP를 넘겨받아 운영 가능한 제품으로 다시 세워온 프론트엔드 개발자입니다. 2026년 1월부터 복지몰(B2C 웹·인앱 웹뷰)과 어드민 두 종 — 병원이 자기 프로그램·예약·정산을 직접 관리하는 병원 CRM, 내부 구성원이 플랫폼 전반을 운영하는 CMS — 의 프론트엔드 오너십을 맡고 있습니다. 운영에서 반복되는 이슈를 화면 패턴과 자동화로 줄여, 확보한 시간을 사용자 경험과 안정성에 쓰는 방식으로 일합니다.

검증된 도구를 골라 얇게 감싸 쓰고, 반복 작업은 Claude Code 기반 워크플로우로 자동화합니다. AI 생성 코드는 팀 컨벤션과 실제 동작을 기준으로 검증합니다.

- 단독 FE로 B2C 웹(+인앱 웹뷰)과 셀러형·운영형 어드민 2종을 함께 개발·운영
- 케이스가 계속 늘어나는 운영 화면을 union 타입과 공통 패턴으로 정리해, 빠른 개발 속도와 확장 비용을 같이 관리
- Amplitude 계측을 먼저 설계해두고 개편 효과를 데이터로 검증 (리뷰 조회 사용자의 예약 전환율 +15%p 확인 → 후속 과제 도출)
- `.claude` 스킬·에이전트를 직접 작성해 작업 시작부터 배포까지 잇는 AI 워크플로우 구축

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 복지몰(B2C)·CMS·병원 CRM 프론트엔드 오너십을 맡고 있습니다. 예약까지만 있던 MVP를 예약 이후 운영·분석·관리 기능까지 확장했습니다.

**어드민 2종 운영 — 셀러형(병원 CRM) · 운영형(CMS)**

- 프로그램 관리는 시술상세 추가에 맞춰, 프로그램을 상세 이미지 템플릿(`SafedocTemplate`/`CustomImage`) 형식으로 등록하도록 다시 설계했습니다(38필드 복합 폼). 예약·정산·쿠폰·병원 계약 운영 화면은 SearchFilter / Table / Modal / Drawer / Detail Form 패턴으로 정리했습니다. ([글](https://jingeon27.tistory.com/18))
- CMS와 병원 CRM이 공유하는 폼은 공통 폼 값 타입 위에 각 앱이 자기 필드를 더한 타입으로 `createTypedForm`을 만들어, 공통 필드 정의를 한 곳에서 바꾸면 양쪽 앱에 같이 반영되고 잘못된 필드 경로는 컴파일 에러로 잡히게 했습니다. 서버 응답/요청과 폼 값 사이는 Transfer Layer로 분리해 양방향 변환을 한 곳에 모았습니다.
- 정산은 메인과 도메인이 달라 HttpOnly 쿠키를 공유할 수 없었습니다. 첫 구현이던 URL 토큰 전달은 access log·Referer에 토큰이 남을 위험이 있어, form POST BFF로 바꾸고 CSP `form-action` 고정, open redirect 방어를 적용했습니다. ([글](https://jingeon27.tistory.com/19))
- 정리해 둔 패턴을 기반으로 신규 쿠폰 템플릿 관리 도메인을 약 12개 파일 규모로 구현했습니다.
- 대형 검수 화면 PR을 리뷰하면서, AntD 내장 Form이 제공하는 `rules`와 제출 시점 `validateFields`로 대체할 수 있는 직접 구현 검증 로직을 짚고 단순화를 제안했습니다.

**빠른 사이클에서 안정성·확장성 관리**

- 시술 결제내역에 쿠폰결제를 추가할 때, 결제건을 수단 독립적 union 타입으로 두고 분기를 `ts-pattern`으로 한곳에 모아 기존 렌더링 코드를 거의 수정하지 않고 새 결제수단을 흡수했습니다. 결제내역처럼 케이스가 계속 늘어나는 화면은 처음부터 "늘어난다"를 전제로 확장 지점을 설계합니다.
- 복지몰의 FSD 레이어 경계는 의존성 없는 자체 ESLint 플러그인(flat config)으로 강제해, 레이어 위반이 문서나 리뷰가 아니라 lint 단계에서 잡히게 했습니다.
- 서버에서 `dehydrate`한 캐시를 클라이언트가 props/Context로만 받아 쓰다 무효화가 화면에 반영되지 않던 구조를, `queryOptions` prefetch → `HydrationBoundary` → `useSuspenseQuery` 구독으로 바꿔 캐시와 화면을 한 소스로 묶었습니다. 유저 정보 Context는 React Query로, Zustand에 흩어져 있던 폼 상태는 React Hook Form으로 통합했습니다.
- 추상화는 같은 패턴이 세 번 나온 뒤에 적용하고, 신규 기능 PR 안에서 해당 영역만 조금씩 정리해 빠른 배포 주기와 구조 개선을 병행합니다.

**B2C 웹 · 인앱 웹뷰**

- 웹과 네이티브 앱 내 웹뷰에서 같은 예약/상담 흐름이 깨지지 않도록 bridge, `popstate`, BottomSheet, backdrop 동작을 함께 검증했습니다. BottomSheet는 Compound(`Root/Header/Content/Footer`) + `overlay-kit`로 만들어 뒤로가기·backdrop tap·snap point 같은 모바일 엣지케이스를 라이프사이클 한곳에서 처리합니다.
- `@core` primitive 20개를 `tailwind-variants`의 size/intent/state 토큰으로 묶어, 신규 화면을 조립식으로 빠르게 세울 수 있게 정리했습니다.
- 예약·리뷰·상담 폼을 `RHF + Zod`로 정리하고, 다단계 리뷰 작성은 `@use-funnel/core`로 구조화했습니다. 가족 동기화 컴포넌트는 520줄에서 55줄로 줄었고, 흩어져 있던 if 검증을 `superRefine` 스키마로 옮겼습니다. ([글](https://jingeon27.tistory.com/11))
- AI 상담 챗봇은 포맷을 바꿀 수 없는 외부 세션 SSE를 `@tanstack/ai` 어댑터 계약에 맞춰야 했습니다. 콜백으로 오는 SSE를 async generator로 바꾸는 push→pull 브릿지를 만들었고, 렌더는 세션 SSE 하나로 일원화하되 AI 생성 스트림은 연결 유지용으로 분리했습니다. 이 과정에서 `useChat`이 `ChatClient`를 `useMemo`로 생성해 인스턴스 안정성이 보장되지 않는 걸 발견해 `useState` lazy init PR을 upstream에 올렸습니다([PR #864](https://github.com/TanStack/ai/pull/864), 리뷰 중). ([글](https://jingeon27.tistory.com/20))
- 병원 검색은 `geolib` 거리 계산, `naver-maps` SDK, `react-intersection-observer` 무한 스크롤에 자동완성·인기 검색어를 연동했습니다. 동적 sitemap은 5개 API를 모아 생성하되 `'use cache'`로 생성 비용을 제어했습니다. ([글](https://jingeon27.tistory.com/21))

**데이터로 문제 정의 (Amplitude)**

- 복지몰 전반에 퍼널·행동 이벤트 약 240개를 먼저 설계해 깔아뒀고, 시술상세 개편의 배포 전후를 이 계측으로 비교했습니다.
- 리뷰를 조회한 사용자의 예약 전환율이 미조회 사용자보다 15%p 높게 나타났고, 이 결과를 근거로 프로그램별 리뷰 분리와 CTA 위치 조정을 후속 과제로 제안했습니다.
- 신규 가입 UTM 유실은 코드 문제가 아니라 Amplitude 속성 상태(`unexpected`)가 원인임을 확인해, 코드 변경 없이 마케팅팀과 해결했습니다.

**AI 워크플로우 (Claude Code)**

- `.claude` 스킬과 명령(`/component`·`/drawer`·`/query`·`/jira-branch`), `code-reviewer` 에이전트를 직접 작성해 작업 시작부터 코드 생성, 검증, 배포까지 이어지게 했습니다.
- 시안 없이 와이어프레임만 있는 화면은 Jira·API 스펙·Figma를 묶어 plan을 세우고, Figma Dev Mode MCP로 맥락을 뽑은 뒤 표준 패턴으로 조립합니다. 쿠폰 템플릿 관리 같은 신규 도메인을 이 방식으로 빠르게 세웠습니다.
- AI가 생성한 코드는 컨벤션과 빌드 결과를 기준으로 검토합니다. 빌드 오류를 `force-dynamic` 추가로 우회하지 않고 `'use client'` 누락을 수정했으며, create/update 겸용이라 수정 시에도 `router.push`가 실행되던 mutation 훅은 역할별로 분리했습니다.

**모노레포 재설계 (Turborepo + pnpm)**

- CMS와 병원 CRM 모노레포에서 기능별 shared 5개가 import 경로를 흩뜨리고 컴파일도 느리게 했습니다.
- 두 앱이 공유할 도메인을 entities/features 패키지로 새로 정의하고(이 시점 13개), 기능별 shared 5개를 FSD에 맞게 단일 `@safedoc/shared`로 통합해 9개로 정리했습니다. 경계 규칙은 레이어별 CLAUDE.md와 문서로 남겼습니다.
- 아키텍처는 FSD의 도메인 중심 분리를 그대로 따르기보다, 서버 모델을 그대로 반영하는 재사용 UI(예: `ProgramCard`)는 공용 레이어로 내리고 page마다 달라지는 특이 UI는 page에서 조립하는 걸 기준으로 삼았습니다. 도메인이 아니라 두 번째 사용처(재사용)가 분리 신호이고, page는 로직 없이 연결만 하는 얇은 adapter로 둡니다. (전임자가 도입한 FSD가 Atomic Design과 혼용돼 있던 상태를 FSD로 통일한 뒤 이 방향으로 개선했습니다.)

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- ATS 크롤러가 사이트마다 중복 구현되던 구조를, NestJS의 module/DI/factory 패턴을 Electron에 적용한 사이트별 어댑터 구조로 재설계하고 팀에 공유했습니다. 새 사이트는 service·repository·helper 구현만으로 연동할 수 있게 했고, 점핏·잡플래닛·게임잡 3개 연동 이후 신규 연동 기간이 기존 약 3일에서 약 1일 수준으로 줄었습니다. 단위 테스트는 후행 과제로 남았습니다.
- 폼 dirty 추적·복원(`FormDirtyContext` + sessionStorage) 패턴을 네 흐름에 재사용했고, 다단계 입력은 `useFunnel`로 구조화했습니다. 세이프닥 `useZodForm`의 원형이 된 패턴입니다. DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 적용했습니다.

---

## Skills

**오너십** — 서비스를 혼자 설계·운영하며 끝까지 끌고 갑니다. 기획 결정 전에도 엔지니어링 판단이 서면 먼저 제안하고 움직이되, 추상화는 Rule of Three를 넘긴 뒤에 합니다.

**AI 워크플로우** — Claude Code 스킬·에이전트·MCP를 직접 엮어 반복 작업을 줄이고, AI 출력은 컨벤션으로 검증합니다.

**프론트엔드** — TypeScript 5, React 18(Compound/Custom Hook, `useSuspenseQuery`, `useSyncExternalStore` 어댑터, SSE push→pull 브릿지), Next.js App Router(Middleware/BFF, 캐싱 모델, RSC 경계). 브라우저·플랫폼 경계를 직접 다뤄왔습니다 — HttpOnly 쿠키와 registrable domain 제약(크로스 도메인 BFF), `EventSource`의 커스텀 헤더 한계(fetch 기반 SSE로 교체), `popstate`·웹뷰 라이프사이클.

**상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod(`useZodForm`, `superRefine`). REST/axios 기반에서 서버 상태·캐시 일관성·BFF 경계를 다뤄왔습니다.

**아키텍처/UI** — FSD 6-layer + sub-domain, Turborepo + pnpm 모노레포, tailwind-variants, Radix, overlay-kit, 인앱 웹뷰 브릿지.

**새 스택 흡수** — Vue.js와 React Native는 실무 경험이 없습니다. 다만 라이브러리를 내부 계약까지 읽고 도입해 온 방식(RHF·Zod·use-funnel·Radix)으로 빠르게 따라갑니다. toss/slash `useFunnel`의 `NonEmptyArray` 타입 오류를 고쳐 머지된 기여가 있고([PR #363](https://github.com/toss/slash/pull/363), 2024.05), 챗봇 작업 중 TanStack/ai에 올린 PR은 리뷰 중입니다([PR #864](https://github.com/TanStack/ai/pull/864)).

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
