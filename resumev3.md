# 김진건

**Frontend Engineer** · <jingeon27@gmail.com> · 010-6865-8208 · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)
산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

2년차에 세이프닥 **복지몰·CMS·병원 CRM 3개 서비스를 단독 Frontend Engineer**로 맡아, 빠르게 찍어낸 MVP의 부채를 갈아엎고 운영 가능한 구조로 끌어올려 왔습니다. (재직 중 순수 코드 **+128K 라인, 그중 94%가 재작성 churn** — 신규보다 *레거시 개선* 비중이 큼.) 검증된 라이브러리 위에 얇은 어댑터를 두고 Rule of Three 이후에만 추상화하며, 패턴·스킬·에이전트를 누적해 개발 속도를 복리로 올리는 방식으로 일합니다.

- **AI 상담 챗봇 SSE 스트리밍 계층 설계** — 레거시 apiv3 SSE를 `@tanstack/ai` adapter 계약에 맞춰 연결(callback→AsyncGenerator push→pull 브릿지), AI 생성/자체 SSE 두 채널 분리 렌더
- **RSC 캐싱 설계** — request memoization / Data Cache / dynamic 강등을 구분해, 서버 토큰 첨부 제거로 정적 생성 보존 + `member/info` 중복 호출 dedup
- **CMS·병원 CRM 모노레포 경계 재설계(entities/features 신설, 13→9개 패키지)** + SafeDoc App 961파일 5-layer FSD 표준화
- **Compound Engineering** — 표준 패턴·`.claude` 스킬·`code-reviewer` 에이전트를 누적해 신규 어드민 도메인 **초기 구현 ~30분**(첫 feat 커밋→PR 머지)까지 단축
- **Cross-domain 토큰 핸드오프 보안 설계** — URL 토큰의 access log/Referer 노출을 form POST BFF로 제거(CSP `form-action` 고정 + open redirect 방어)

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 **복지몰(B2C) · CMS · 병원 CRM** 프론트엔드를 단독 담당. 예약 중심 MVP를, 예약 이후 운영·분석·관리자 기능까지 확장해 운영 가능한 제품으로 고도화.

**AI 상담 챗봇 — 스트리밍 연결 계층 (대표 작업)** ([글](https://jingeon27.tistory.com/20))
- 자체 메시지 store 구현 대안과 비교 후 `@tanstack/ai` 채택 — 당장은 스트리밍 텍스트뿐이지만 이후 tool call / message parts 확장을 보고 표준 스트리밍 계약에 베팅.
- 콜백 기반 apiv3 SSE를 async generator로 바꾸는 push→pull 브릿지(`createPushStream`)를 설계해 `SubscribeConnectionAdapter` 계약에 연결.
- AI 생성/자체 SSE 두 채널을 분리하고 렌더는 SSE 단일 소스로 — 중복 렌더 제거. 상태는 서버 status 권위 + Suspense `initialMessages`로 effect 동기화 제거, Zod `.catch()`로 malformed SSE에도 스트림 생존.

**데이터 레이어 & RSC 캐싱**
- `ensureQueryData` + props drilling(구독 안 됨)을 `queryOptions` + Server Component prefetch → `HydrationBoundary` → `useSuspenseQuery`로 전환해 구독을 호출 지점으로 분산.
- 공통 `layout.tsx`에서 program 상세를 prefetch해 상세→상담 전환 시 `/program/detail` 서버 호출을 **2회→1회**로.
- RSC 캐시 가능성 보존을 위해 axios 인터셉터의 서버 토큰 첨부를 제거(`cookies()` 미호출 → sitemap 정적 생성이 dynamic으로 안 강등)하고, 인증 필요한 `member/info`만 native `fetch`(`no-store`)로 분리 — React `cache()`로 묶은 QueryClient + `ensureQueryData`로 request당 1회 호출 보장.

**폼 아키텍처 — 예약/리뷰/상담 통합 패턴** ([예약 글](https://jingeon27.tistory.com/11) · [리뷰 글](https://jingeon27.tistory.com/15))
- `useState` 30개 + props drilling + `useEffect`로 얽힌 예약 폼을 `RHF + Zod + @use-funnel/core`로 재정리해 상태 소유권 단일화 — **가족 동기화 520→55줄(−89%).**
- cross-field 검증을 if 분기에서 `superRefine` 선언형 schema로 이전. 동일 패턴을 리뷰 작성(0부터 설계한 4단계 funnel)·상담·회원정보 수정에 재사용.

**`@core` 디자인 시스템**
- Radix/Headless 위 20개 primitive를 `tailwind-variants`(size/intent/state 3축 토큰)로 표준화, inline `className` override 안티패턴 제거.
- BottomSheet Compound(`Root/Header/Content/Footer`)를 `react-modal-sheet` + `overlay-kit`로 설계 — 뒤로가기(`popstate`)·backdrop tap·snap point를 `Root` 라이프사이클 한 곳에서 처리.

**모노레포 경계 재설계 (Turborepo + pnpm)**
- 공통 도메인을 entities/features 패키지로 추출해 CMS·병원 CRM 두 앱이 같은 구현을 재사용 — 인수한 기능별 shared 5분할은 import 분산 비용을 진단해 단일 `@safedoc/shared`로 통합(13→9개).
- 961파일 코드베이스의 FSD/Atomic 잔재를 5-layer FSD로 표준화(25 entities / 20 features), sub-domain 분할 기준 자체 정립.

**Compound Engineering — 개발 생산성**
- 반복 검증된 패턴을 `@core`/FSD로 추출하고 `.claude` 스킬(`/component`·`/drawer`·`/query`)·`code-reviewer` 에이전트로 codify해 *매 작업이 다음 작업의 비용을 낮추도록* 누적.
- 디자인 시안 없이 와이어프레임만 있는 어드민은 **Jira·API 스펙·Figma를 묶어 원샷 plan → Figma Dev Mode MCP로 컨텍스트 추출 → 표준 스킬·패턴 조립 → `code-reviewer` 게이트 → worktree 병렬**로 처리.
- 결과: 신규 쿠폰 도메인 3종(템플릿 관리·기업 쿠폰팩·감사 로그, 28파일)을 단독 출시, **도메인 초기 구현 ~30분**(이후는 기획 합의 반복).

**정산 — Cross-domain 토큰 핸드오프 (보안)** ([글](https://jingeon27.tistory.com/19))
- 서로 다른 registrable domain 간 HttpOnly 쿠키 공유 불가 문제를, 정산 진입 시 토큰을 넘기는 흐름으로 해결 — URL query → **form POST BFF**로 전환해 access log/Referer 노출 제거.
- BFF에 HTML escape + CSP `form-action` origin 고정 + `no-store` + `303` + `next` pathname 정규화 open redirect 방어. 미들웨어는 도메인 라우팅만, 핸드오프는 별도 API 라우트로 분리.

**Amplitude 계측 + 실험 (데이터)**
- 시술상세 개편에 맞춰 퍼널·행동 이벤트 241개를 설계, 배포 전후 비교 기반 마련.
- PO 분석: 가입→예약 소요시간 **14분→11분**, 리뷰 조회 사용자의 예약 전환율 **+15%p** 확인 → 프로그램 기준 리뷰 분리·CTA 재배치 후속 과제 도출.
- 신규 가입 UTM 유실은 원인이 Amplitude Data 속성 상태(`unexpected`)임을 규명해 **코드 수정 없이** 해결.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

캘린더 일정 조율 + ATS SaaS의 ATS 서비스 신규 기능/유지보수 담당.

- **Electron 크롤러 아키텍처 재설계 (MVC + DI + Factory)** — 플랫폼별 구현체와 공통 흐름을 `PlatformAdapter` 인터페이스 + `Factory`로 분리, 신규 연동을 adapter 구현 + 등록만으로. **신규 플랫폼 연동 3일→1일**(3개 도입 후 직접 측정). *한계: DI는 갖췄으나 단위 테스트·셀렉터 헬스체크는 후행.*
- **다단계 funnel 패턴** — `useFunnel` + `usePromiseSessionStorage`(새로고침 복원) + `FormDirtyContext`(`beforeunload`/라우터 confirm)를 면접/온보딩/평가 4개 흐름에 재사용. 이후 세이프닥 `useZodForm`의 yup 버전 원형.
- **메일 템플릿 시스템** — `@whattime/quill` WYSIWYG + 변수 placeholder를 quill blot atomic node로 처리. **DnD 공고 정렬** `@dnd-kit` + optimistic update/롤백.

---

## Skills

**핵심 — Compound engineering**: 검증된 패턴을 `@core`/FSD로 추출하고 `.claude` 스킬·`code-reviewer` 에이전트로 codify해 개발 속도를 복리로 올리는 중. 검증된 라이브러리 위 얇은 어댑터 + Rule of Three, Server/Form/UI/Local 상태 역할 분리.

**React 18** — Compound + Custom Hook으로 디자인 시스템/폼 직접 설계 · `useSuspenseQuery`+`HydrationBoundary` SSR 페칭 · 외부 SSE를 `SubscribeConnectionAdapter`에 맞춘 push→pull 브릿지 · `useSyncExternalStore` adapter로 imperative store 연결.

**Next.js App Router** — Middleware/BFF(form POST 토큰 핸드오프) · Route Group · 캐싱 모델(request memoization vs Data Cache vs dynamic 강등) 구분 설계 · RSC 직렬화 경계.

**TypeScript 5** — `as const satisfies` + mapped type 파서 레지스트리(키 누락을 컴파일 에러로) · `z.infer` schema↔form 타입 동기화 · Discriminated Union 도메인 적용 · class method key 추론 mapped type.

**상태/데이터** — TanStack Query v5(`queryOptions`, infinite query, `setQueriesData` optimistic + 롤백) · Zustand(UI 전역 한정) · RHF + Zod(`useZodForm`, `superRefine`).

**아키텍처/UI** — FSD 5-layer + sub-domain · Turborepo + pnpm 모노레포 · tailwind-variants · Radix/Headless(asChild+Slot) · overlay-kit · Framer Motion.

**오픈소스 리딩** — RHF `useForm` proxy 기반 selective re-render, Toss Slash(`@use-funnel`/`overlay-kit`), TanStack Query/AI 내부를 읽고 사내 추상화 설계에 반영.

---

## Side Project — data-structure-ts

- core 자료구조(Queue/Heap/PriorityQueue)를 observer 기반 외부 store로 모델링하고, React binding 패키지를 분리.
- `useSyncExternalStore` 구독 + `bindMethods<T>` mapped type으로 class method key만 추론해 hook API로 노출 — core 동작과 hook 구독을 각 레벨에서 검증 가능하게 설계.

---

## Education & Certification

- **대덕소프트웨어마이스터고등학교** 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
