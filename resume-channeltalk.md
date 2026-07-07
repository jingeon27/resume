# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

메시지 스트림, 외부 store, 자료구조처럼 상태와 순서가 중요한 문제를 좋아하는 프론트엔드 개발자입니다. 상담 메신저에서는 외부 세션 SSE를 `@tanstack/ai` 어댑터 계약에 맞추는 i/o 브릿지를 만들었고, 자료구조 라이브러리에서는 Queue/Heap/PriorityQueue를 직접 구현해 React binding과 core 로직을 분리했습니다. 라이브러리를 쓸 때도 API 표면보다 내부 계약, 시간복잡도, 구독 모델, 실패 전파 방식을 먼저 확인하는 편입니다.

- 외부 세션 SSE를 `@tanstack/ai` 어댑터 계약에 맞추는 push→pull 브릿지 설계
- 렌더 채널을 세션 SSE로 일원화하고 AI 생성 스트림은 연결 유지용으로 분리해 중복 렌더·malformed payload·연결 상태를 제어
- Queue/Heap/PriorityQueue를 직접 구현하고 React binding을 `useSyncExternalStore`로 분리
- WYSIWYG 변수 노드, 디자인 시스템 primitive, mapped type 등 GUI/core-library 성격의 문제를 다룸

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 복지몰(B2C)·CMS·병원 CRM 프론트엔드 오너십을 맡아 설계부터 운영까지 다룹니다.

**상담 메신저 — multi-source i/o 브릿지**

- AI 상담 챗봇에서는 포맷을 바꿀 수 없는 외부 세션 SSE를 `@tanstack/ai`의 어댑터 계약에 맞춰야 했습니다. 자체 어댑터(`SubscribeConnectionAdapter`)와, 콜백으로 오는 SSE 이벤트를 async generator로 바꾸는 push→pull 브릿지(`createPushStream`)를 만들었습니다.
- 렌더 채널은 세션 SSE 하나로 일원화하고 AI 생성 스트림은 연결 유지용으로만 두어, 두 채널이 같은 메시지를 중복 렌더하지 않게 했습니다.
- 서버 status를 기준으로 두고 클라이언트 `connecting` 상태로 보강했습니다. malformed SSE가 와도 스트림이 죽지 않도록 Zod `.catch()`로 필드별 fallback을 두고, 메시지 파싱 실패가 연결 종료로 번지지 않게 했습니다.
- 이 과정에서 `useChat`이 `ChatClient`를 `useMemo`(성능 힌트일 뿐 시맨틱 보장이 아님)로 생성하는 문제를 발견해, `useState` lazy init으로 바꾸는 PR을 TanStack/ai에 제출했습니다. ([PR #864](https://github.com/TanStack/ai/pull/864), 리뷰 중)

**core-library / 디자인 시스템**

- Radix 위에 primitive 20개를 `tailwind-variants` 토큰으로 묶고, BottomSheet는 Compound + `overlay-kit`로 만들어 popstate·backdrop·snap을 라이프사이클 한곳에서 처리했습니다.
- RHF·TanStack Query 위에 `useZodForm`(스키마→타입 동기화)과 `infiniteSetData`(무한 쿼리 페이지를 `select` 단계에서 평탄화해 캐시 원본 보존) 같은 얇은 어댑터를 얹어 폼·서버 상태 패턴을 표준화했습니다. nested page 안 개별 아이템 갱신은 `getQueriesData` 순회로 처리했습니다.

**타입 레벨**

- Zod 스키마 추론(`z.infer`), class instance에서 method key만 뽑는 mapped type(`bindMethods`), 폼 값 타입으로 좁힌 recursive nested key path 추론(`createTypedForm`)처럼 타입 레벨 기법을 실무에 썼습니다.

**개발 환경과 아키텍처**

- 전임자가 도입한 FSD가 Atomic Design과 혼용돼 있던 약 1,100파일 규모를 6-layer FSD로 통일했고, CMS·병원 CRM 모노레포는 공유 도메인을 entities/features 패키지로 새로 정의하고(이 시점 13개), 기능별 shared 5개를 FSD에 맞게 하나로 통합해 9개로 정리했습니다. 레이어 경계는 의존성 없는 자체 ESLint 플러그인(flat config)으로 강제해 위반이 lint에서 잡힙니다.
- FSD의 도메인 중심 분리를 그대로 따르기보다, 서버 모델(wire 안전용 Zod → `entities`)과 클라이언트 모델(폼 상태·입력 UX validation → `features`)을 레이어로 나누고 그 사이를 Transfer Layer로 어댑트했습니다. 두 모델을 같은 곳에 두면 다시 섞이므로, 안정된 인터페이스 뒤에서 독립적으로 진화하게 두는 걸 기준으로 삼습니다.
- `.claude` 스킬·커맨드를 직접 작성해 반복 작업을 줄이고, AI 생성 코드는 컨벤션으로 검증합니다.
- 정산은 첫 구현이던 URL 토큰 전달의 노출 위험을 짚어 form POST BFF로 다시 설계했습니다. ([글](https://jingeon27.tistory.com/19))

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- ATS 크롤러가 사이트마다 중복 구현되던 구조를, NestJS의 module/DI/factory 패턴을 Electron에 적용한 사이트별 어댑터 구조로 재설계하고 팀에 공유했습니다. 새 사이트는 service·repository·helper 구현만으로 연동할 수 있게 했고, 점핏·잡플래닛·게임잡 3개 연동 이후 신규 연동 기간이 기존 약 3일에서 약 1일 수준으로 줄었습니다.
- 폼 dirty 추적·복원 패턴을 네 흐름에 재사용했고, 다단계 입력은 funnel로 구조화했습니다. 폼 dirty 상태, 복원, DnD optimistic update처럼 UI 상태와 저장소 상태가 엇갈리는 케이스를 주로 다뤘습니다.
- `@whattime/quill` 기반 WYSIWYG에 템플릿 변수 치환을 구현했습니다. quill blot으로 변수를 atomic node로 처리해 사용자가 편집 중 변수 내부를 깨뜨리지 않게 했습니다.

---

## Skills

라이브러리를 내부까지 읽고 왜 그런 API인지 이해한 뒤 얇은 어댑터를 둡니다. Server·Form·UI·외부 구독 상태의 역할을 섞지 않고, 추상화는 같은 패턴이 세 번 나온 뒤에 합니다. 이런 방식으로 toss/slash `useFunnel`의 `NonEmptyArray` 타입 오류를 고쳐 머지된 기여가 있습니다(2024.05, [PR #363](https://github.com/toss/slash/pull/363)).

- **TypeScript 5 (타입 레벨)** — mapped type + key remapping, recursive nested key path(타입 안전 Form), discriminated union, `satisfies`
- **React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary`, `useSyncExternalStore` 외부 store 어댑터, SSE push→pull 브릿지, WYSIWYG atomic node
- **자료구조 / 라이브러리 설계** — Queue/Heap/PriorityQueue 직접 구현, observer store 설계, core 로직과 React binding 분리
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod
- **아키텍처** — FSD 6-layer + sub-domain, Turborepo + pnpm 모노레포, Claude Code 기반 워크플로우

검증된 스택을 내부까지 읽고 흡수하는 편이라 새 언어·프레임워크에 빠르게 적응합니다.

---

## Side Project — data-structure-ts

- Queue/Heap/PriorityQueue를 observer 기반 외부 store로 만들고 React binding을 분리한 라이브러리입니다. Heap은 comparator를 주입해 min/max heap을 같은 core로 처리했고, enqueue/dequeue/peek 같은 연산을 React hook이 아니라 core class에 뒀습니다.
- `useSyncExternalStore`로 구독하고, `bindMethods<T>` mapped type으로 class instance의 method key만 추려 hook으로 노출했습니다. 자료구조 동작은 core에서, hook 구독은 adapter에서 각각 Jest로 검증했습니다.

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어 개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
