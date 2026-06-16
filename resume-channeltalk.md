# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

특정 스택보다 **그 라이브러리가 왜 그런 API를 갖는지**를 이해하는 게 다음 추상을 설계할 때 결정적이라고 믿는 프론트엔드 엔지니어입니다. RHF·Zod·use-funnel·TanStack Query 같은 검증된 라이브러리 내부를 읽고 사내 어댑터를 설계해 왔고, 자료구조를 직접 구현한 라이브러리와 타입 레벨 프로그래밍으로 기초 역량을 실무에 적용합니다. 메신저/상담 도메인에서는 레거시 SSE를 스트리밍 어댑터 계약에 맞추는 i/o 브릿지를 설계한 경험이 있습니다.

- **core-library / 디자인 시스템** — `@core` 20개 primitive를 `tailwind-variants` 토큰으로 표준화, BottomSheet Compound·`useZodForm`·`infiniteSetData` 같은 사내 어댑터를 라이브러리 내부 분석 후 설계
- **상담 메신저 i/o 설계** — 레거시 SSE를 `@tanstack/ai` adapter 계약에 맞춘 push→pull 브릿지로 연결, AI 생성/자체 SSE 두 채널 분리 렌더
- **기초 역량** — Queue/Heap/PriorityQueue를 observer store로 직접 구현(`useSyncExternalStore` 어댑터), mapped type·recursive type·variadic tuple로 타입 레벨 설계
- **빠른 학습 (단일 스택 비종속)** — 검증된 라이브러리 내부를 읽고 흡수해 새 스택을 빠르게 익힘
- **개발 환경 개선** — `.claude` 스킬·커맨드 자체 작성, FSD·모노레포로 대규모 코드베이스 표준화

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 **복지몰(B2C)·CMS·병원 CRM** 프론트엔드. 단독 책임 범위에서 설계부터 운영까지 수행하며 동료·디자인·마케팅·PO와 협업.

- **상담 메신저 — SSE i/o 브릿지 (채널톡 도메인 직결)**
  - 레거시 apiv3 SSE 응답을 `@tanstack/ai`의 `SubscribeConnectionAdapter` 계약에 맞추기 위해, 콜백 기반 SSE 이벤트를 async generator로 변환하는 **push→pull 브릿지**(`createPushStream`)를 설계
  - AI 생성 스트림과 자체 SSE 두 채널을 분리하고 렌더는 SSE 단일 소스로 둬 중복 렌더 제거, 서버 status를 권위로 두고 `connecting` 클라이언트 상태로 보강. Zod `.catch()` per-field degradation으로 malformed SSE가 스트림을 죽이지 않게 처리

- **core-library / 디자인 시스템**
  - Radix/Headless 위 20개 primitive를 `tailwind-variants` size/intent/state 3축 토큰으로 표준화, inline `className` override 안티패턴 제거
  - BottomSheet Compound(`Root/Header/Content/Footer`)를 `react-modal-sheet` + `overlay-kit`로 설계해 popstate·backdrop·snap을 라이프사이클 한 곳에서 처리
  - RHF·Toss Slash·TanStack Query 내부를 읽고 `useZodForm`(schema→타입 자동 동기화), `infiniteSetData`(nested page 내 개별 아이템 갱신) 어댑터 설계

- **타입 레벨 / 기초 역량**
  - Zod schema 추론(`z.infer<ZodObject<T>>`), class instance에서 method key만 추론하는 mapped type 유틸, recursive type nested key path 추론, variadic tuple 단계별 폼 타입 합성

- **개발 환경 개선 / 아키텍처**
  - SafeDoc App 961파일 5-layer FSD 표준화(sub-domain 패턴 자체 정립), CMS·병원 CRM 모노레포는 인수 후 entities/features 신설 + shared 통합으로 13→9개 패키지 재설계 (Turborepo + pnpm)
  - `.claude` 스킬·커맨드를 자체 작성해 반복 작업을 자동화하고 AI 생성 코드를 컨벤션으로 비판적 게이트

- **주도적 문제 해결**
  - 정산 크로스 도메인 인증을 URL 토큰으로 위임하려던 초안에서 access log·Referer 노출 위험을 짚고 form POST BFF로 재설계 ([글](https://jingeon27.tistory.com/19))
  - `dehydrate`한 캐시를 props로 받아 구독하지 않아 `invalidate`가 무력화되던 구조를 진단, `useSuspenseQuery` 구독으로 단일 소스화

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- **Electron 크롤러 재설계 (MVC + DI + Factory)** — 플랫폼별 구현을 `PlatformAdapter`+`Factory`로 분리, **신규 연동 3일→1일**(직접 측정). *한계: 단위 테스트 후행*
- **WYSIWYG 에디터** — `@whattime/quill` 기반 + 템플릿 변수 placeholder 치환, quill blot으로 변수를 atomic node 처리. **다단계 funnel** + sessionStorage 자동 복원

---

## Skills

**시그니처** — 검증된 라이브러리 내부를 읽고 *왜 그런 API를 갖는지* 이해한 뒤 얇은 어댑터를 설계합니다. Server/Form/UI/외부 구독 상태의 역할을 분리하고, Rule of Three 이후에만 추상화합니다.

- **TypeScript 5 (타입 레벨)** — mapped type + key remapping 도메인 타입 생성, recursive nested key path, variadic tuple 폼 합성, discriminated union, `satisfies`
- **React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary`, **`useSyncExternalStore` 외부 store 어댑터**, SSE push→pull 브릿지
- **자료구조 / 라이브러리 설계** — Queue/Heap/PriorityQueue observer store 직접 구현, core 로직과 React binding 분리
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod
- **아키텍처/생산성** — FSD 5-layer + sub-domain, Turborepo + pnpm 모노레포, Claude Code 기반 AI 워크플로우 + 비판적 감독

검증된 스택을 내부까지 읽고 흡수해 온 방식으로 새 언어·프레임워크에 빠르게 적응합니다. (GraphQL/Relay·React Native 미경험)

---

## Side Project — data-structure-ts

- core 자료구조(Queue/Heap/PriorityQueue)를 observer 기반 외부 store로 모델링하고 React binding을 분리한 라이브러리. `useSyncExternalStore` 구독 + `bindMethods<T>` mapped type으로 class instance의 method key만 추론해 hook API로 노출. 자료구조 동작은 core에서, hook 구독은 adapter에서 각각 Jest로 검증.

---

## Education & Certification

- **대덕소프트웨어마이스터고등학교** 소프트웨어 개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
