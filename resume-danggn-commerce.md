# 김진건

**Frontend Engineer** · <jingeon27@gmail.com> · 010-6865-8208 · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

복지몰·CMS·병원 CRM 단독 담당 · Claude Code 기반 AI 워크플로우 구축

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

급하게 만들어진 MVP를 넘겨받아 운영 가능한 제품으로 다시 세워온 프론트엔드 개발자입니다. 2026년 1월부터 복지몰·CMS·병원 CRM 세 서비스를 혼자 맡고 있고, 프로그램 탐색·예약·정산·쿠폰처럼 돈과 운영이 얽힌 화면을 주로 다뤘습니다. 기획이 확정되기 전이라도 엔지니어링 관점에서 판단이 서면 먼저 제안하고 만듭니다.

검증된 도구를 골라 얇게 감싸 쓰고, 반복 작업은 Claude Code 기반 워크플로우에 넘겨 확보한 시간을 사용자 경험과 운영 안정성에 씁니다. AI가 낸 코드는 그대로 받지 않고 팀 컨벤션과 실제 동작으로 검증합니다.

- 단독 FE로 세 서비스의 개발·운영·구조 개선을 처음부터 끝까지 책임
- 프로그램 등록·예약 전환 흐름·정산·쿠폰 등 판매자/운영자 화면을 반복 패턴으로 정리
- Amplitude로 가설을 검증해 다음 과제를 데이터로 뽑아냄 (가입→예약 소요시간 소폭 감소 등)
- 모바일 우선 B2C, 인앱 웹뷰 브릿지, 신규 화면을 빠르게 조립하기 위한 `@core` 디자인 시스템

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 복지몰(B2C)·CMS·병원 CRM 프론트엔드를 혼자 담당합니다. 예약까지만 있던 MVP를 예약 이후 운영·분석·병원 관리 기능까지 넓혔습니다.

**판매자/운영자 관리 도구 (백오피스)**

- 프로그램 관리는 시술 상세 개편에 맞춰, 프로그램을 상세 이미지 템플릿(`SafedocTemplate`/`CustomImage`) 형식으로 등록하는 방식으로 다시 설계했습니다(38필드 복합 폼). 예약·정산·쿠폰·병원 계약 운영 화면은 SearchFilter / Table / Modal / Drawer / Detail Form 패턴으로 정리했고요. ([글](https://jingeon27.tistory.com/18))
- 정산은 메인과 도메인이 달라 쿠키를 공유할 수 없었는데, 처음 안이던 URL 토큰 전달은 access log·Referer에 토큰이 남는 게 걸렸습니다. form POST BFF로 바꾸고 CSP `form-action` 고정, open redirect 방어를 붙였습니다. 기획 협의 전에 제가 판단해서 설계한 건입니다. ([글](https://jingeon27.tistory.com/19))
- 정리해 둔 패턴 덕에 신규 어드민 도메인 하나를 12파일 정도로 빠르게 붙일 수 있었습니다.
- 대형 검수 화면 PR을 리뷰하면서, AntD 내장 Form을 두고 검증을 직접 구현한 부분을 짚었습니다. `rules`와 제출 시점 `validateFields`로 대체 가능하다고 봤고요.

**모노레포 재설계 (Turborepo + pnpm)**

- CMS와 병원 CRM 모노레포에서 기능별 shared 5개가 import 경로를 흩뜨리고 컴파일도 느리게 했습니다.
- 두 앱이 공유할 도메인을 entities/features 패키지로 새로 정의하고(이 시점 13개), 기능별 shared 5개를 FSD에 맞게 단일 `@safedoc/shared`로 통합해 9개로 정리했습니다. 경계 규칙은 레이어별 CLAUDE.md와 문서로 남겼습니다.
- 복지몰의 FSD 레이어 경계는 의존성 없는 자체 ESLint 플러그인으로 강제해, 위반이 문서나 리뷰가 아니라 lint 단계에서 잡히게 했습니다.

**AI 워크플로우 (Claude Code)**

- `.claude` 스킬과 명령(`/component`·`/drawer`·`/query`·`/jira-branch`), `code-reviewer` 에이전트를 직접 짜서 작업 시작부터 코드 생성, 검증, 배포까지 이어지게 했습니다.
- 시안 없이 와이어프레임만 있는 화면은 Jira·API 스펙·Figma를 묶어 plan을 세우고, Figma Dev Mode MCP로 맥락을 뽑은 뒤 표준 패턴으로 조립합니다. 쿠폰 템플릿 관리 같은 신규 도메인을 이 방식으로 빠르게 세웠습니다.
- AI가 낸 코드는 컨벤션으로 거릅니다. 빌드가 깨질 때 `force-dynamic`을 덧붙이려는 걸 막고 `'use client'` 누락이라는 원인을 고쳤고, create/update 겸용이라 수정할 때도 `router.push`가 튀던 mutation 훅을 분리했습니다.

**데이터로 검증 (Amplitude)**

- 복지몰 전반에 퍼널·행동 이벤트 약 240개를 먼저 설계해 깔아뒀고, 시술상세 개편의 배포 전후를 이 계측으로 비교했습니다.
- 가입에서 예약까지 걸리는 시간이 소폭 줄었고, 리뷰를 본 사용자의 예약 전환율이 안 본 쪽보다 15%p 높게 나왔습니다. 여기서 프로그램별 리뷰 분리와 CTA 위치 조정을 다음 과제로 잡았습니다.
- 신규 가입 UTM이 빠지던 문제는 코드가 아니라 Amplitude 속성 상태(`unexpected`)가 원인이라, 코드 손 안 대고 해결했습니다.

**제품 UX & 모바일**

- AI 상담 챗봇은 레거시 SSE를 `@tanstack/ai` 어댑터 계약에 맞춰야 했습니다. 콜백으로 오는 SSE를 async generator로 바꾸는 push→pull 브릿지를 만들었고, AI 생성 스트림과 자체 SSE 두 채널을 나눠 렌더했습니다. 이 과정에서 `useChat`이 `ChatClient`를 `useMemo`로 생성해 인스턴스 안정성이 보장되지 않는 걸 발견해 `useState` lazy init PR을 upstream에 올렸습니다([PR #864](https://github.com/TanStack/ai/pull/864), 리뷰 중). ([글](https://jingeon27.tistory.com/20))
- `@core` primitive 20개를 `tailwind-variants` 토큰으로 묶고, BottomSheet은 Compound + `overlay-kit`로 만들어 뒤로가기·backdrop·snap 같은 모바일 엣지케이스를 한곳에서 처리했습니다.
- 예약·리뷰·상담 폼을 `RHF + Zod + @use-funnel/core`로 합쳤습니다. 가족 동기화는 520줄에서 55줄로 줄었고, 흩어져 있던 if 검증을 `superRefine` 스키마로 옮겼습니다. ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))
- 웹과 인앱 웹뷰에서 같은 예약/상담 흐름이 깨지지 않도록 bridge, popstate, BottomSheet, backdrop 동작을 함께 봤습니다.

**데이터 레이어 & RSC 캐싱**

- 서버에서 `dehydrate`한 캐시를 클라이언트가 props/Context로만 받아 쓰다 보니, 캐시를 무효화해도 화면이 안 바뀌는 상태였습니다. `queryOptions` prefetch → `HydrationBoundary` → `useSuspenseQuery` 구독으로 바꿔 캐시와 화면을 한 소스로 묶었습니다.
- 전역 상태도 정리했습니다. 유저 정보 Context를 걷어내 React Query로 모으고, Zustand store에 흩어져 있던 폼 상태 관리를 React Hook Form으로 통합했습니다.
- axios 서버 인터셉터에서 `cookies()`를 떼서 공개 API의 정적 생성(sitemap 등)을 살렸고, 토큰이 꼭 필요한 `member/info`만 전용 fetch로 따로 뺐습니다. ([글](https://jingeon27.tistory.com/21))
- `code-reviewer`, Zod·타입 경계, 도메인별 패턴으로 반복 회귀를 줄였습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- ATS 크롤러가 사이트마다 복붙되던 걸, NestJS의 module/DI/factory 패턴을 Electron에 적용해 사이트별 어댑터 구조로 설계하고 팀에 공유했습니다. 새 사이트는 service·repository·helper 구현만으로 붙어서, 신규 연동이 체감상 3일에서 1일 정도로 줄었습니다. 단위 테스트는 후행됐고요.
- `useFunnel` + sessionStorage 복원 + `FormDirtyContext`를 네 개 흐름에 재사용했습니다. 세이프닥 `useZodForm`의 원형이 된 패턴입니다. DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 붙였습니다.

---

## Skills

**오너십** — 서비스를 혼자 설계·운영하며 끝까지 끌고 갑니다. 기획 결정 전에도 엔지니어링 판단이 서면 먼저 움직이되, 추상화는 Rule of Three를 넘긴 뒤에 합니다.

**AI 워크플로우** — Claude Code 스킬·에이전트·MCP를 직접 엮어 반복 작업을 줄이고, AI 출력은 컨벤션으로 검증합니다.

**프론트엔드** — TypeScript 5, React 18(Compound/Custom Hook, `useSuspenseQuery`, `useSyncExternalStore` 어댑터, SSE push→pull 브릿지), Next.js App Router(Middleware/BFF, 캐싱 모델, RSC 경계).

**상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod(`useZodForm`, `superRefine`). REST/axios 기반에서 서버 상태·캐시 일관성·BFF 경계를 다뤄왔습니다. GraphQL/Relay는 아직 안 써봤지만, RHF·Zod·use-funnel·Radix를 내부 코드까지 읽고 도입해 온 방식으로 빠르게 따라갑니다. 실제로 toss/slash `useFunnel`의 `NonEmptyArray` 타입 오류를 고쳐 머지된 기여가 있습니다([PR #363](https://github.com/toss/slash/pull/363)).

**아키텍처/UI** — FSD 6-layer + sub-domain, Turborepo + pnpm 모노레포, tailwind-variants, Radix/Headless, overlay-kit, Framer Motion, 인앱 웹뷰 브릿지.

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
