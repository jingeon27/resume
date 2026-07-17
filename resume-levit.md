# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

---

## Summary

받은 명세를 그대로 구현하기보다 문제를 직접 찾아 근거를 들어 제안하는 프론트엔드 개발자입니다. 2026년 1월부터 복지몰·CMS·병원 CRM 세 서비스의 프론트엔드를 단독 담당하며 설계부터 출시·운영까지 다뤄왔고, 개발한 기능은 Amplitude 이벤트로 배포 전후 결과를 검증했습니다. AI 도구를 작업 흐름에 깊게 넣되, 생성 결과는 팀 컨벤션과 실제 동작을 기준으로 검토합니다. 목적에 맞지 않는 구현은 빠르게 수정하고, 피드백과 데이터로 다른 방향이 확인되면 방향을 조정합니다.

- Claude Code 기반 `.claude` 스킬·커맨드를 직접 작성해 작업~배포 흐름을 자동화하고, AI 생성 코드는 컨벤션으로 검증
- 첫 구현이던 URL 토큰 전달의 로그 노출 위험을 확인해 form POST BFF로 다시 설계, 대형 PR 리뷰에서 라이브러리 내장 기능으로 검증 로직 단순화를 제안
- Amplitude로 리뷰 조회 사용자의 예약 전환율이 미조회 사용자 대비 +15%p 높게 나타난 것을 확인
- 프로그램·예약·정산·쿠폰 같은 플랫폼/거래 화면을 설계·개발·운영하고 반복 패턴으로 정리

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 복지몰(B2C)·CMS·병원 CRM 프론트엔드를 단독 담당하고 있습니다. 설계부터 출시·운영까지 진행하며 동료 개발자·디자이너·마케터·PO와 협업합니다.

**AI 도구 활용과 비판적 감독**

- Claude Code 기반 `.claude` 스킬·커맨드를 직접 작성해 작업 시작부터 코드 생성·검증·배포까지 이어지게 했고, FSD 경계나 OpenAPI→타입 생성 같은 반복 지식을 스킬에 정리했습니다. worktree로 작업 두세 개를 병렬로 검토합니다.
- AI가 생성한 코드는 컨벤션과 빌드 결과를 기준으로 검토합니다. 빌드 오류를 `force-dynamic` 추가로 우회하지 않고 `'use client'` 누락을 수정했으며, create/update 겸용이라 수정 시에도 `router.push`가 실행되던 mutation 훅은 역할별로 분리했습니다. 손쉬운 우회나 과한 추상화는 근거를 들어 수정합니다.

**직접 찾아서 푼 문제들**

- 정산은 메인과 도메인이 달라 쿠키를 공유할 수 없었습니다. 첫 구현이던 URL 토큰 전달은 access log·Referer 노출 위험이 있어, form POST BFF로 바꾸고 CSP `form-action` 고정과 open redirect 방어를 적용했습니다. ([글](https://jingeon27.tistory.com/19))
- 서버에서 `dehydrate`한 캐시를 props로만 받아 쓰다 무효화가 화면에 안 먹던 구조를, `useSuspenseQuery` 구독으로 바꿔 캐시와 화면을 한 소스로 묶었습니다.

**데이터로 검증 (Amplitude)**

- 복지몰 전반에 퍼널·행동 이벤트 약 240개를 설계했고, 시술상세 개편의 배포 전후를 이 계측으로 비교했습니다. 리뷰를 조회한 사용자의 예약 전환율이 미조회 사용자보다 15%p 높게 나타났으며, 이를 인과관계가 아닌 행동 간 상관관계로 해석했습니다.
- 신규 가입 UTM 유실은 Amplitude 속성 상태(`unexpected`)가 원인임을 확인해, 코드 변경 없이 해결했습니다.

**개발 환경과 아키텍처**

- 정리해 둔 패턴을 기반으로 신규 쿠폰 도메인을 약 12개 파일 규모로 구현했습니다.
- 전임자가 도입한 FSD가 Atomic Design과 혼용돼 있던 약 1,100파일 규모를 6-layer FSD로 통일했고, CMS·병원 CRM 모노레포는 공유 도메인을 entities/features 패키지로 새로 정의하고(이 시점 13개), 기능별 shared 5개를 FSD에 맞게 단일 `@safedoc/shared`로 통합해 9개로 정리했습니다. 레이어 경계는 의존성 없는 자체 ESLint 플러그인으로 강제해 위반이 lint에서 잡힙니다.
- 다만 FSD의 도메인 중심 분리를 그대로 따르지는 않습니다. 서버 모델을 그대로 반영하는 재사용 UI(예: `ProgramCard`)는 공용 레이어로 내리고, page마다 달라지는 특이 UI는 page에서 조립합니다. 도메인이 나오자마자 나누지 않고 두 번째 사용처(재사용)가 신호일 때 분리하며, page는 로직 없이 연결만 하는 얇은 adapter로 둡니다.
- 예약·리뷰·상담 폼을 `RHF + Zod`로 정리해 가족 동기화 컴포넌트를 520줄에서 55줄로 줄였고, 다단계 리뷰 작성은 `@use-funnel/core`로 구조화했습니다. ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))
- FE 개발 환경에서는 Claude Code 스킬·명령, OpenAPI 기반 타입 생성, 레이어별 CLAUDE.md로 반복 지식을 문서와 자동화에 남겼습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- ATS 크롤러가 사이트마다 중복 구현되던 구조를, NestJS의 모듈 경계·constructor injection을 참고해(프레임워크 자체는 과하다고 판단해 제거, DI 컨테이너 없이 factory로 조립) 사이트별 어댑터 구조로 재설계하고 팀에 공유했습니다. 새 사이트는 service·repository·helper 구현만으로 연동할 수 있게 했고, 점핏·잡플래닛·게임잡 3개 연동 이후 신규 연동 기간이 체감상 기존 약 3일에서 약 1일 수준으로 줄었습니다(체감치). 단위 테스트는 후행 과제로 남았습니다.
- 폼 dirty 추적·복원(`FormDirtyContext` + sessionStorage) 패턴을 네 흐름에 재사용했고, 다단계 입력은 `useFunnel`로 구조화했습니다. DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 적용했습니다.

---

## Skills

검증된 라이브러리 내부를 읽고 그 위에 얇은 어댑터를 두는 방식을 선호합니다. Server·Form·UI 상태의 역할을 섞지 않고, 추상화는 같은 패턴이 세 번 나온 뒤에 적용합니다.

- **TypeScript / JavaScript** — Zod 스키마 추론으로 폼 타입 동기화, mapped type·discriminated union 도메인 모델링
- **React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary`, `useSyncExternalStore` 어댑터
- **Next.js App Router** — Middleware/BFF, 캐싱 모델 구분, RSC 경계
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod
- **아키텍처/생산성** — FSD 6-layer + sub-domain, Turborepo + pnpm 모노레포, Claude Code 기반 워크플로우 + 비판적 감독

REST/axios·TanStack Query·BFF 기반으로 서버 상태 모델링, 캐시 일관성, optimistic update와 롤백을 다뤄왔습니다. GraphQL/Relay와 React Native 같은 새 스택도 라이브러리의 내부 계약부터 읽고 흡수하는 방식으로 빠르게 학습할 수 있습니다. 실제로 toss/slash `useFunnel`의 `NonEmptyArray` 타입 오류를 고쳐 머지된 기여가 있고, 실전에서 쓰는 TanStack/ai에도 `useChat` 인스턴스 안정성 리팩토링 PR을 제출해 리뷰를 받고 있습니다. ([toss/slash #363](https://github.com/toss/slash/pull/363) · [TanStack/ai #864](https://github.com/TanStack/ai/pull/864))

---

## Side Project — data-structure-ts

- Queue/Heap/PriorityQueue를 observer 기반 외부 store로 만들고 React binding을 분리한 라이브러리입니다. `useSyncExternalStore`로 구독하고, `bindMethods<T>` mapped type으로 class instance의 method key만 추려 hook으로 노출했습니다. 자료구조 동작은 core에서, hook 구독은 adapter에서 각각 Jest로 검증했습니다.

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
