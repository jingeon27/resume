# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

빠르게 찍어낸 MVP에 합류해 부채를 정리하고 운영 가능한 제품으로 끌어올린 프론트엔드 엔지니어입니다. 2026.01부터 복지몰·CMS·병원 CRM 3개 서비스를 맡아 **판매자(병원)·운영자 관리 도구** — 상품 등록·주문(예약)·정산·쿠폰 기획전·대시보드 — 를 직접 설계했고, **기획 협의 전이라도 엔지니어링 관점에서 자율적으로 판단·실행**해 왔습니다. 반복 작업은 AI 도구로 자동화하되 출력은 비판적으로 감독하고, 확보한 시간을 사용자 경험에 투자합니다.

- **판매자/운영자 관리 도구** — 상품(38필드 Program)·주문·정산·쿠폰 기획전·정산 대시보드를 도메인 단위 반복 패턴으로 표준화
- **AI로 개발 속도 극대화** — Claude Code 기반 `.claude` 스킬·커맨드 자체 작성, AI 생성 코드는 컨벤션으로 비판적 게이트, 신규 도메인 초기 구현 ~30분
- **자율 판단·오너십** — 단독 FE로 3개 서비스를 끝까지 완수, 기획 합의 전 엔지니어링 관점에서 정산 토큰 핸드오프 등 자율 설계
- **데이터 기반 개선** — Amplitude 241개 이벤트로 배포 전후 비교, 가입→예약 14분→11분 / 리뷰 조회 전환율 +15%p 확인 → 후속 과제 도출
- **웹뷰/웹 일관 경험** — 모바일 우선 B2C + 네이티브 웹뷰 브릿지 + `@core` 디자인 시스템, 인앱 환경 라이프사이클 처리

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 **복지몰(B2C)·CMS·병원 CRM** 프론트엔드. 단독 책임 범위에서 판매자(병원)·운영자 관리 도구를 설계부터 운영까지 수행하며, 동료·디자인·마케팅·PO와 협업.

- **판매자/운영자 관리 도구 (백오피스)**
  - 상품 등록·수정(38필드 Program 폼), 주문/예약, **정산**, 쿠폰 기획전, 병원 계약, 정산 대시보드를 SearchFilter / Table / Modal / Drawer / Detail Form **반복 패턴**으로 표준화 — 레거시 page 중심 구조를 기능 단위로 재편 ([글](https://jingeon27.tistory.com/18))
  - 정립한 패턴 위에서 신규 쿠폰 기획전 도메인을 12파일 규모로 빠르게 추가 — 구조 투자가 개발 속도로 회수됨을 확인

- **AI로 개발 속도 극대화 (Claude Code)**
  - `.claude` 스킬·커맨드를 자체 작성해 작업 시작→코드 생성→검증→배포를 자동화, worktree로 2~3개 병렬
  - AI 생성 코드를 수동 수용하지 않고 컨벤션으로 게이트 — `force-dynamic` 우회를 근본 원인으로, AI가 만든 mutation 훅의 create/update 겸용 `router.push` 버그를 진단해 분리

- **기획 협의 전 자율 판단**
  - 정산 크로스 도메인 인증을 URL 토큰으로 위임하려던 초안에서 access log·Referer 노출 위험을 짚고, 기획 협의 전 엔지니어링 관점에서 **form POST BFF**로 재설계 (CSP `form-action` 고정 + open redirect 방어) ([글](https://jingeon27.tistory.com/19))
  - 7년차 동료의 1,800줄 검수 PR 리뷰에서 AntD 내장 Form을 두고 검증을 수동 구현한 부분을 `rules`+`validateFields`로 대체 가능함을 제시

- **데이터 기반 실험·개선 (Amplitude)**
  - 시술상세 개편 퍼널·행동 이벤트 241개 설계 → 배포 전후 비교로 가입→예약 14분→11분, 리뷰 조회 사용자 전환율 +15%p 확인 → 후속 과제 도출
  - 신규 가입 UTM 유실을 가설 검증 후 Amplitude 속성 상태(`unexpected`)가 원인임을 규명, **코드 수정 없이** 해결

- **웹뷰/웹 일관 경험 & 디자인 시스템**
  - `@core` 20개 primitive를 `tailwind-variants` 3축 토큰으로 표준화, BottomSheet Compound + `overlay-kit`로 뒤로가기/backdrop/snap 등 인앱 웹뷰 라이프사이클 일관 처리
  - 예약/리뷰/상담 폼을 `RHF + Zod + @use-funnel/core`로 통합, 가족 동기화 **520→55줄(−89%)** ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))

- **아키텍처**
  - SafeDoc App 961파일 5-layer FSD 표준화(sub-domain 패턴 자체 정립), CMS·병원 CRM 모노레포는 인수 후 entities/features 신설 + shared 통합으로 13→9개 패키지 재설계 (Turborepo + pnpm)
  - `dehydrate`한 캐시를 props로 받아 구독하지 않던 구조를 진단, `useSuspenseQuery` 구독으로 캐시·화면 단일 소스화

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- **Electron 크롤러 재설계 (MVC + DI + Factory)** — 플랫폼별 구현을 `PlatformAdapter`+`Factory`로 분리, **신규 연동 3일→1일**(직접 측정). *한계: 단위 테스트 후행*
- **다단계 funnel** — `useFunnel` + sessionStorage 자동 복원 + `FormDirtyContext`를 4개 흐름에 재사용. **DnD 정렬** `@dnd-kit` + optimistic update/롤백

---

## Skills

**시그니처** — Server/Form/UI 전역/로컬 상태의 역할을 분리하고, 검증된 라이브러리 내부를 읽어 얇은 어댑터를 설계합니다. 빠른 실행과 확장성을 Rule of Three로 균형 잡습니다.

- **TypeScript 5 / React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary` SSR, `useSyncExternalStore` 어댑터, Zod schema 추론으로 폼 타입 자동 동기화
- **Next.js App Router** — Middleware/BFF, 캐싱 모델(request memoization / Data Cache / dynamic 강등) 구분, RSC 경계, 인앱 웹뷰 브릿지
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), **Zustand**, RHF + Zod(`superRefine`)
- **UI/디자인 시스템** — tailwind-variants 3축 토큰, Radix/Headless, overlay-kit, Framer Motion
- **아키텍처/AI** — FSD 5-layer + sub-domain, Turborepo + pnpm 모노레포, Claude Code 기반 AI 워크플로우 + 비판적 감독
- **Open Source Reading** — RHF / Toss Slash / TanStack Query 내부를 읽고 사내 어댑터 설계에 반영

**이커머스(쇼핑몰) 자체는 미경험**이나, 상품·주문·정산·쿠폰 기획전·판매자 관리 도구를 직접 설계한 경험이 커머스 판매자 페이지/기획전 업무와 직결됩니다. **GraphQL/Relay·React Native는 미경험**이나 검증된 스택을 내부까지 읽고 흡수해 온 방식으로 빠르게 적응합니다.

---

## Side Project — data-structure-ts

- core 자료구조(Queue/Heap/PriorityQueue)를 observer 외부 store로 모델링하고 React binding을 분리. `useSyncExternalStore` 구독 + `bindMethods<T>` mapped type으로 class method key만 추론해 hook API로 노출. (Jest로 store/hook 분리 테스트)

---

## Education & Certification

- **대덕소프트웨어마이스터고등학교** 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
