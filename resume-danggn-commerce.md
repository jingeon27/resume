# 김진건

**Frontend Engineer** · <jingeon27@gmail.com> · 010-6865-8208 · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)
2년차 · 단독 3개 서비스(B2C 복지몰·CMS·병원 CRM) 주도 · Claude Code 기반 AI 워크플로우 자체 구축
산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

빠르게 찍어낸 MVP에 합류해 부채를 갈아엎고(재직 중 순수 코드 +128K 라인, 94%가 재작성 churn) 운영 가능한 제품으로 끌어올린, **오너십 중심의 프론트엔드 엔지니어**입니다. 2026.01부터 복지몰·CMS·병원 CRM 3개 서비스를 **단독으로** 맡아 기획 협의 전이라도 엔지니어링 관점에서 자율 판단·실행하며, 상품(프로그램)·주문(예약)·정산·쿠폰 같은 **커머스 인접 도메인**을 직접 설계해 왔습니다. 검증된 라이브러리 위에 얇은 어댑터를 두고, 반복 작업은 AI로 자동화해 확보한 시간을 사용자 경험에 투자합니다.

- **AI로 개발 속도 극대화** — Claude Code 기반 `.claude` 스킬·서브에이전트를 *직접 설계*해 팀 워크플로우를 자동화, 신규 도메인 초기 구현 ~30분
- **주도적 개발·운영** — 단독 FE로 3개 서비스의 기능 개발·운영·구조 개선을 끝까지 완수
- **판매자/운영자 관리 도구** — 상품 관리·주문·정산·쿠폰 기획전·데이터 대시보드를 도메인 단위로 표준화
- **데이터 기반 개선** — Amplitude 241개 이벤트 설계로 실험 계측, 데이터로 후속 과제 도출
- **모바일/웹뷰 일관 경험** — 모바일 우선 B2C + 네이티브 웹뷰 브릿지 + 디자인 시스템

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 **복지몰(B2C) · CMS · 병원 CRM** 프론트엔드를 단독 담당. 예약 중심 MVP를 예약 이후 운영·분석·판매자(병원) 관리 기능까지 확장.

**AI로 개발 속도 극대화 (Claude Code)**
- Claude Code 기반으로 `.claude` 스킬·명령(`/component`·`/drawer`·`/query`·`/jira-branch` 등)과 `code-reviewer` 서브에이전트를 **직접 설계**해, 작업 시작→코드 생성→검증→배포 흐름을 자동화. 반복 작업을 줄이고 확보한 시간을 UX에 투자.
- 시안 없이 와이어프레임만 있는 화면은 **Jira·API 스펙·Figma를 묶어 원샷 plan → Figma Dev Mode MCP로 컨텍스트 추출 → 표준 스킬·`@core` 패턴 조립 → `code-reviewer` 게이트 → worktree 병렬**로 처리.
- 검증된 패턴을 추출·codify해 *매 작업이 다음 작업의 비용을 낮추도록* 누적 — 신규 쿠폰 도메인 3종(템플릿 관리·기업 쿠폰팩·감사 로그, 28파일) 단독 출시, **초기 구현 ~30분**(이후는 기획 합의 반복).

**판매자/운영자 관리 도구 (커머스 백오피스)**
- 상품 관리(38필드 규모 Program 폼), 주문/예약, **정산**, 쿠폰 기획전, 병원 계약 등 운영 화면을 SearchFilter / Table / Modal / Drawer / Detail Form **반복 패턴**으로 표준화 — 레거시 page 중심 구조를 기능 단위로 재편 ([글](https://jingeon27.tistory.com/18)).
- 정산은 서로 다른 도메인 간 쿠키 공유 불가 문제를 **form POST BFF 토큰 핸드오프**로 해결(URL 토큰의 access log/Referer 노출 제거, CSP `form-action` 고정 + open redirect 방어). 기획 협의 전 엔지니어링 관점에서 자율 설계한 사례 ([글](https://jingeon27.tistory.com/19)).
- 표준화한 패턴 위에서 신규 어드민 도메인을 12파일 규모로 빠르게 추가 — 구조 투자가 개발 속도로 회수됨을 확인.
- 1,800줄 규모 검수 화면 PR 리뷰에서 AntD 내장 Form을 두고 검증을 수동 구현한 부분을 짚어, `rules` + 제출 시점 `validateFields`로 대체 가능함을 제시 — 받은 코드를 비판적으로 검증하는 리뷰.
- CMS·병원 CRM **모노레포 구조 단독 재설계**(Turborepo + pnpm) — 이전 개발자들이 만든 OLD 구조를 인수, 이후 설계는 단독으로: shared 5분할의 한계(import 분산·컴파일 비용)를 진단해 단일 `@safedoc/shared`로 통합하고 도메인 공유 패키지(entities/features)를 신설해 **13→9개 패키지**로 재편. 레이어별 CLAUDE.md·architecture 문서로 경계 규율을 문서화.

**데이터 기반 실험·개선 (Amplitude)**
- 시술상세 개편에 맞춰 퍼널·행동 이벤트 241개를 설계해 배포 전후 비교 기반 마련.
- 데이터 분석: 가입→예약 소요시간 **14분→11분**, 리뷰 조회 사용자의 예약 전환율 **+15%p** 확인 → 프로그램 기준 리뷰 분리·CTA 재배치 후속 과제 도출.
- 신규 가입 UTM 유실은 원인이 Amplitude 속성 상태(`unexpected`)임을 규명해 **코드 수정 없이** 해결.

**커머스 UX & 모바일/웹뷰**
- AI 상담 챗봇의 스트리밍 계층 설계 — 레거시 SSE를 `@tanstack/ai` adapter 계약에 맞춘 push→pull 브릿지로 연결, AI 생성/자체 SSE 두 채널 분리 렌더(향후 tool call/parts 확장 대비 베팅) ([글](https://jingeon27.tistory.com/20)).
- `@core` 디자인 시스템 20개 primitive를 `tailwind-variants` 3축 토큰으로 표준화, BottomSheet Compound + `overlay-kit`로 모바일 엣지케이스(뒤로가기/backdrop/snap) 일관 처리.
- 예약/리뷰/상담 폼을 `RHF + Zod + @use-funnel/core`로 통합해 상태 소유권 단일화 — 가족 동기화 **520→55줄(−89%)**, `superRefine` 선언형 검증. 네이티브 웹뷰 브릿지로 인앱 환경 연동 ([예약 글](https://jingeon27.tistory.com/11) · [리뷰 글](https://jingeon27.tistory.com/15)).

**기술 깊이 — 데이터 레이어 & RSC 캐싱**
- "dehydrate한 캐시를 클라이언트가 구독하지 않아 invalidate가 화면에 반영되지 않는 이원화"를 진단 — 서버에서 `ensureQueryData`로 풀어 props/Context로 내려주던 흐름을 `queryOptions` prefetch → `HydrationBoundary` → `useSuspenseQuery` 구독으로 전환해 캐시·화면을 단일 소스화. 경계를 layout→page→섹션 3단으로 중첩해 느린 섹션은 Suspense 스트리밍으로 분리.
- 전역 상태를 근원지별 단일 도구로 재배정 — 유저 정보 Context 제거 후 React Query로 수렴, Zustand store 7→4개(`persist` 영속화), 분산돼 있던 에러 처리를 `QueryCache.onError` 한 곳으로 일원화.
- 인증/공개 데이터의 서버 경로를 **분리 설계** — axios 서버 인터셉터에서 `cookies()` 접근을 제거해 공개 API의 정적 생성(sitemap 등)을 보존하고, 유일한 인증 서버 호출(`member/info`)은 전용 fetch(`no-store`)로 토큰 직접 첨부. React `cache()`로 묶은 QueryClient + `ensureQueryData`로 request당 1회 호출 보장(**2회→1회**).
- *한계: 단독 FE 환경에서 단위 테스트는 후행 — `code-reviewer` 게이트, Zod/TypeScript 타입 경계, 도메인별 표준 패턴으로 회귀 리스크를 관리.*

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- **Electron 크롤러 아키텍처 재설계 (MVC + DI + Factory)** — 플랫폼별 구현을 `PlatformAdapter` + `Factory`로 분리, **신규 연동 3일→1일**(직접 측정). *한계: 단위 테스트는 후행.*
- **다단계 funnel 패턴** — `useFunnel` + sessionStorage 자동 복원 + `FormDirtyContext`를 4개 흐름에 재사용(세이프닥 `useZodForm`의 원형). **DnD 정렬** `@dnd-kit` + optimistic update/롤백.

---

## Skills

**오너십·실행** — 단독으로 서비스를 주도 설계·운영하고 끝까지 완수. 비즈니스 의사결정 전에도 엔지니어링 관점에서 자율 판단. 빠른 실행과 확장성을 Rule of Three로 균형.

**AI 워크플로우** — Claude Code 기반 스킬·서브에이전트·MCP 파이프라인을 직접 구축해 생산성을 복리로 향상. 반복 작업 자동화 → UX 투자.

**프론트엔드** — TypeScript 5, React 18(Compound/Custom Hook, `useSuspenseQuery`, `useSyncExternalStore` adapter, SSE push→pull 브릿지), Next.js App Router(Middleware/BFF, 캐싱 모델, RSC 경계).

**상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), **Zustand**, RHF + Zod(`useZodForm`, `superRefine`). REST/axios 기반 — GraphQL/Relay는 미경험이나, RHF·Zod·use-funnel·Radix 등을 내부 코드까지 읽고 도입해 온 트랙레코드로 새 스택을 빠르게 흡수.

**아키텍처/UI** — FSD 5-layer + sub-domain · Turborepo + pnpm 모노레포 · tailwind-variants · Radix/Headless · overlay-kit · Framer Motion · 인앱 웹뷰 브릿지.

---

## Side Project — data-structure-ts

- core 자료구조(Queue/Heap/PriorityQueue)를 observer 외부 store로 모델링하고 React binding을 분리. `useSyncExternalStore` 구독 + `bindMethods<T>` mapped type으로 class method key만 추론해 hook API로 노출.

---

## Awards & Education

- **D:CHAMPS 본선 진출** — 참가자 18,927명 중 TOP 30 (상위 0.16%) | 2023.09
- **대덕소프트웨어마이스터고등학교** 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
