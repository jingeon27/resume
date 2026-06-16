# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

라이브러리를 쓸 때 그게 왜 그런 API를 갖는지부터 보는 편입니다. 그래야 다음 추상을 설계할 때 흔들리지 않는다고 생각하고요. RHF·Zod·use-funnel·TanStack Query 내부를 읽고 사내 어댑터를 만들어 왔고, 자료구조를 직접 구현한 라이브러리와 타입 레벨 코드로 기초를 실무에 써왔습니다. 상담 메신저 쪽에서는 레거시 SSE를 스트리밍 어댑터 계약에 맞추는 i/o 브릿지를 설계한 경험이 있습니다.

- 레거시 SSE를 `@tanstack/ai` 어댑터 계약에 맞추는 push→pull 브릿지 설계 (메신저 i/o)
- Queue/Heap/PriorityQueue를 observer store로 직접 구현, `useSyncExternalStore`로 노출
- `@core` 디자인 시스템과 `useZodForm`·`infiniteSetData` 같은 사내 어댑터 설계
- 검증된 라이브러리를 내부까지 읽고 흡수하는 편이라 새 스택을 빠르게 익힘

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 복지몰(B2C)·CMS·병원 CRM 프론트엔드를 혼자 담당하며, 설계부터 운영까지 끌고 갑니다.

**상담 메신저 — SSE i/o 브릿지**

- AI 상담 챗봇은 레거시 apiv3 SSE를 `@tanstack/ai`의 `SubscribeConnectionAdapter` 계약에 맞춰야 했습니다. 콜백으로 오는 SSE 이벤트를 async generator로 바꾸는 push→pull 브릿지(`createPushStream`)를 만들었습니다.
- AI 생성 스트림과 자체 SSE 두 채널을 나누고, 렌더는 SSE를 단일 소스로 둬 같은 메시지가 두 번 그려지지 않게 했습니다. 서버 status를 권위로 두고 클라이언트 `connecting` 상태로 보강했고, malformed SSE가 와도 스트림이 죽지 않도록 Zod `.catch()`로 필드별로 흘려보냈습니다.

**core-library / 디자인 시스템**

- Radix/Headless 위에 primitive 20개를 `tailwind-variants` 토큰으로 묶고, BottomSheet은 Compound + `overlay-kit`로 만들어 popstate·backdrop·snap을 라이프사이클 한곳에서 처리했습니다.
- RHF·Toss Slash·TanStack Query 내부를 읽고 `useZodForm`(스키마→타입 동기화)과 `infiniteSetData`(nested page 안 개별 아이템 갱신) 같은 어댑터를 만들었습니다.

**타입 레벨 / 기초**

- Zod 스키마 추론(`z.infer`), class instance에서 method key만 뽑는 mapped type, recursive nested key path, variadic tuple로 단계별 폼 타입을 합성하는 식으로 타입 레벨을 실무에 썼습니다.

**개발 환경과 아키텍처**

- SafeDoc App 961파일을 5-layer FSD로 정리했고, CMS·병원 CRM 모노레포는 넘겨받은 구조에서 기능별 shared 5개를 합치고 공유 도메인을 entities/features로 빼서 13개를 9개로 줄였습니다.
- `.claude` 스킬·커맨드를 직접 짜서 반복 작업을 줄이고, AI가 낸 코드는 컨벤션으로 거릅니다.
- 정산은 처음 안이던 URL 토큰 전달의 노출 위험을 짚어 form POST BFF로 다시 설계했습니다. ([글](https://jingeon27.tistory.com/19))

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- 채용 플랫폼마다 흩어져 있던 Electron 크롤러를 `PlatformAdapter` + `Factory` 구조로 다시 짰습니다. 신규 연동이 3일에서 1일로 줄었고(직접 측정), 단위 테스트는 후행됐습니다.
- `@whattime/quill` 기반 WYSIWYG에 템플릿 변수 치환을 붙였습니다. quill blot으로 변수를 atomic node로 처리했고요. 다단계 funnel은 sessionStorage 복원과 함께 네 흐름에 재사용했습니다.

---

## Skills

라이브러리를 내부까지 읽고 왜 그런 API인지 이해한 뒤 얇은 어댑터를 둡니다. Server·Form·UI·외부 구독 상태의 역할을 섞지 않고, 추상화는 같은 패턴이 세 번 나온 뒤에 합니다.

- **TypeScript 5 (타입 레벨)** — mapped type + key remapping, recursive nested key path, variadic tuple 폼 합성, discriminated union, `satisfies`
- **React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary`, `useSyncExternalStore` 외부 store 어댑터, SSE push→pull 브릿지
- **자료구조 / 라이브러리 설계** — Queue/Heap/PriorityQueue observer store 직접 구현, core 로직과 React binding 분리
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod
- **아키텍처** — FSD 5-layer + sub-domain, Turborepo + pnpm 모노레포, Claude Code 기반 워크플로우

검증된 스택을 내부까지 읽고 흡수하는 편이라 새 언어·프레임워크에 빠르게 적응합니다. (GraphQL/Relay·React Native는 아직 안 써봤습니다.)

---

## Side Project — data-structure-ts

- Queue/Heap/PriorityQueue를 observer 기반 외부 store로 만들고 React binding을 분리한 라이브러리입니다. `useSyncExternalStore`로 구독하고, `bindMethods<T>` mapped type으로 class instance의 method key만 추려 hook으로 노출했습니다. 자료구조 동작은 core에서, hook 구독은 adapter에서 각각 Jest로 검증했습니다.

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어 개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
