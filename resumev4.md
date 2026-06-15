# 김진건

**Frontend Engineer** · jingeon27@gmail.com · 010-6865-8208 · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

빠르게 찍어낸 MVP에 합류해 부채를 정리하고 운영 가능한 제품으로 끌어올린 2년차 프론트엔드 엔지니어입니다. 2026.01부터 복지몰·CMS·병원 CRM 3개 서비스의 프론트엔드를 맡아, 받은 명세를 구현하기보다 **제안된 설계의 약점을 짚고 더 단순·정확한 구조로 바꾸는** 방식으로 일해 왔습니다. 검증된 라이브러리 위에 얇은 어댑터를 두고, Rule of Three 이후에만 추상화를 도입합니다.

- **비판적 검증** — 제안된 토큰 위임의 노출 위험을 짚어 form POST BFF로 재설계, 7년차 PR에서 프레임워크 재발명 지적, 캐시 미구독 결함 진단
- **커머스 백오피스** — 상품(Program 38필드)·정산·쿠폰·예약을 SearchFilter/Table/Modal/Drawer 반복 패턴으로 표준화
- **아키텍처** — SafeDoc App 961파일 5-layer FSD 정리, CMS·병원 CRM 모노레포 13→9개 패키지 재설계
- **데이터 기반** — Amplitude 241개 이벤트로 실험 계측, 가입→예약 14분→11분·리뷰 조회 전환율 +15%p 확인
- **AI 워크플로우** — `.claude` 스킬·커맨드 자체 작성, AI 생성 코드를 컨벤션으로 비판적 게이트

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 **복지몰(B2C)·CMS·병원 CRM** 프론트엔드. 예약 중심 MVP를 운영·분석·관리자 기능까지 확장.

- **비판적 검증·엔지니어링 판단**
  - 정산 크로스 도메인 인증을 URL 토큰으로 위임하려던 초안에서 access log·Referer 노출 위험을 짚고 **form POST BFF**로 재설계 (CSP `form-action` 고정 + open redirect 방어) ([글](https://jingeon27.tistory.com/19))
  - `dehydrate`한 캐시를 props/Context로 받아 *구독하지 않아* `invalidate`가 무력화되던 구조를 진단, `useSuspenseQuery` 캐시 구독으로 단일 소스화
  - 7년차 동료의 1,800줄 검수 PR 리뷰에서, AntD 내장 Form을 두고 검증을 수동 구현한 부분을 `rules`+`validateFields`로 대체 가능함을 제시

- **Program 관리 v2 — 공유 도메인 + 대규모 복합 폼**
  - CMS·병원 CRM 공유 38필드 Program 폼을 `common/inspection/draft` sub-domain + 2-tier `FORM_NAME` enum + Transfer Layer로 재설계, `Form.List`·`useWatch`·custom validator로 cascade validation 구현 ([글](https://jingeon27.tistory.com/18))

- **예약/리뷰/상담 폼 통합**
  - `useState` 30개+props drilling로 얽힌 가족 동기화를 `RHF + Zod + @use-funnel/core`로 정리 — **520→55줄(−89%)**, `superRefine` 선언형 검증. 리뷰 작성(0→1 신규 도메인)·상담에 재사용 ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))

- **아키텍처 정리**
  - SafeDoc App 961파일을 5-layer FSD(`app/pages/widgets/features/entities/shared`)로 표준화, sub-domain 패턴 자체 정립 (25 entities / 20 features)
  - 공통 `layout.tsx` prefetch로 상세→상담 전환 시 `/program/detail` server-level 중복 호출 제거
  - CMS·병원 CRM 모노레포 — 이전 개발자들이 만든 구조를 인수해, 이후 entities/features 신설 + shared 통합으로 **13→9개 패키지** 재설계 (Turborepo + pnpm)

- **데이터 기반 실험 (Amplitude)**
  - 시술상세 개편 퍼널·행동 이벤트 241개 설계 → 가입→예약 14분→11분, 리뷰 조회 사용자 전환율 +15%p 확인, 후속 과제 도출 (디자인·마케팅·PO와 협업)
  - 신규 가입 UTM 유실을 가설 검증 후 Amplitude 속성 상태(`unexpected`)가 원인임을 규명, 코드 수정 없이 해결

- **AI 워크플로우 — 비판적 감독**
  - `.claude` 스킬·커맨드를 자체 작성해 FSD 경계·모달 패턴·OpenAPI→타입 생성 절차를 codify
  - AI 생성 코드를 수동 수용하지 않고 컨벤션으로 게이트 — `force-dynamic` 우회를 근본 원인(`'use client'` 누락)으로, AI가 만든 mutation 훅의 create/update 겸용 `router.push` 버그를 진단해 분리

- **디자인 시스템 & 모바일** — `@core` 20개 primitive를 `tailwind-variants` 3축 토큰으로 표준화, BottomSheet Compound + `overlay-kit`로 뒤로가기/backdrop/snap 등 모바일 엣지케이스 일관 처리

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- **Electron 크롤러 재설계 (MVC + DI + Factory)** — 플랫폼별 구현을 `PlatformAdapter`+`Factory`로 분리, **신규 연동 3일→1일**(직접 측정). *한계: 단위 테스트 후행*
- **다단계 funnel** — `useFunnel` + sessionStorage 자동 복원 + `FormDirtyContext`를 4개 흐름에 재사용 (세이프닥 `useZodForm`의 원형)

---

## Skills

**시그니처** — Server/Form/UI 전역/로컬 상태의 역할을 분리해 한 도구에 책임을 몰지 않습니다. 검증된 라이브러리 내부를 읽고 얇은 어댑터를 설계하며(`useZodForm`, BottomSheet compound, `infiniteSetData`), Rule of Three 이후에만 추상화합니다.

- **React 18 / Next.js App Router** — `useSuspenseQuery` + `HydrationBoundary` SSR 데이터 페칭, `useSyncExternalStore` 어댑터, Middleware/BFF, 캐싱 모델(request memoization / Data Cache / dynamic 강등) 구분
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), RHF + Zod(`useZodForm`, `superRefine`), Zustand. AntD Form(`Form.List` cascade validation) 대규모 복합 폼
- **아키텍처** — FSD 5-layer + sub-domain, Turborepo + pnpm 모노레포, Compound / Adapter 패턴
- **AI 워크플로우** — `.claude` 스킬·커맨드 자체 작성, AI 출력 비판적 감독, worktree 병렬
- **Open Source Reading** — RHF / Toss Slash(use-funnel·overlay-kit) / TanStack Query 내부를 읽고 사내 어댑터 설계에 반영

REST/axios 기반 — GraphQL/Relay는 미경험이나 검증된 스택을 내부 코드까지 읽고 흡수해 온 트랙레코드로 빠르게 적응합니다.

---

## Side Project — data-structure-ts

- core 자료구조(Queue/Heap/PriorityQueue)를 observer 외부 store로 모델링하고 React binding을 분리. `useSyncExternalStore` 구독 + `bindMethods<T>` mapped type으로 class method key만 추론해 hook API로 노출. (Jest로 store/hook 분리 테스트)

---

## Education & Certification

- **대덕소프트웨어마이스터고등학교** 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
