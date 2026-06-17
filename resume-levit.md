# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

받은 명세를 그대로 구현하기보다 문제를 직접 찾아 근거를 들고 제안하는 프론트엔드 개발자입니다. 2026년 1월부터 복지몰·CMS·병원 CRM 세 서비스를 혼자 맡아 설계부터 출시·운영까지 끌고 왔고, 만든 기능은 Amplitude로 검증해 다음 과제를 데이터로 뽑았습니다. AI 도구를 작업 흐름에 깊게 넣되 그 출력은 그대로 받지 않고 컨벤션으로 한 번 거릅니다. 목적에 맞지 않는 구현은 빠르게 고치고, 피드백과 데이터로 틀린 게 보이면 방향을 바꿉니다.

- Claude Code 기반 `.claude` 스킬·커맨드를 직접 짜서 작업~배포 흐름을 자동화하고, AI가 낸 코드는 컨벤션으로 검증
- 제안된 토큰 전달의 노출 위험을 짚어 form POST BFF로 다시 설계, 대형 PR에서 프레임워크 내장 기능으로 검증 로직 단순화
- Amplitude로 가입→예약 14분→11분, 리뷰 조회 전환율 +15%p 확인 후 과제 도출
- 상품·예약·정산·쿠폰 같은 플랫폼/거래 화면을 설계·개발·운영하고 반복 패턴으로 정리

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 복지몰(B2C)·CMS·병원 CRM 프론트엔드를 혼자 담당합니다. 설계부터 출시·운영까지 끌고 가면서 동료·디자인·마케팅·PO와 같이 일했습니다.

**AI 도구 활용과 비판적 감독**

- Claude Code 기반 `.claude` 스킬·커맨드를 직접 짜서 작업 시작부터 코드 생성·검증·배포까지 이어지게 했고, FSD 경계나 OpenAPI→타입 생성 같은 반복 지식을 스킬에 박아뒀습니다. worktree로 두세 개를 동시에 돌립니다.
- AI가 낸 코드는 그대로 받지 않습니다. 빌드가 깨질 때 `force-dynamic`을 덧붙이는 대신 `'use client'` 누락을 고쳤고, create/update 겸용이라 수정할 때도 `router.push`가 튀던 mutation 훅을 분리했습니다. 손쉬운 우회나 과한 추상화는 근거를 대고 돌려보냅니다.

**직접 찾아서 푼 문제들**

- 정산은 메인과 도메인이 달라 쿠키를 공유할 수 없었습니다. 처음 안이던 URL 토큰 전달은 access log·Referer 노출이 걸려서, form POST BFF로 바꾸고 CSP `form-action` 고정과 open redirect 방어를 붙였습니다. ([글](https://jingeon27.tistory.com/19))
- 대형 검수 화면 PR을 리뷰하며, AntD 내장 Form을 두고 검증을 직접 구현한 부분을 `rules`·`validateFields`로 대체된다고 짚었습니다.
- 서버에서 `dehydrate`한 캐시를 props로만 받아 쓰다 무효화가 화면에 안 먹던 구조를, `useSuspenseQuery` 구독으로 바꿔 캐시와 화면을 한 소스로 묶었습니다.

**데이터로 검증 (Amplitude)**

- 시술상세 개편에 맞춰 퍼널·행동 이벤트 241개를 깔았습니다. 가입→예약이 14분→11분, 리뷰를 본 사용자의 예약 전환율이 안 본 쪽보다 15%p 높게 나와 프로그램별 리뷰 분리와 CTA 위치 조정을 다음 과제로 잡았습니다.
- 신규 가입 UTM이 빠지던 건 Amplitude 속성 상태(`unexpected`)가 원인이라 코드 손 안 대고 해결했습니다.

**개발 환경과 아키텍처**

- 정리해 둔 패턴 덕에 신규 쿠폰 도메인 하나를 12파일 정도로 빠르게 붙였습니다.
- SafeDoc App 961파일을 5-layer FSD로 정리했고, CMS·병원 CRM 모노레포는 넘겨받은 구조에서 기능별 shared 5개를 단일 `@safedoc/shared`로 합치고 공유 도메인을 entities/features로 빼서 13개를 9개로 줄였습니다.
- 예약·리뷰·상담 폼을 `RHF + Zod + @use-funnel/core`로 합쳐 가족 동기화를 520줄에서 55줄로 줄였습니다. ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))
- FE 개발 환경은 Claude Code 스킬·명령, OpenAPI 기반 타입 생성, 레이어별 CLAUDE.md로 반복 지식을 문서와 자동화에 남겼습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- 채용 플랫폼마다 흩어져 있던 Electron 크롤러를 `PlatformAdapter` + `Factory` 구조로 다시 짰습니다. 신규 연동이 3일에서 1일로 줄었고(직접 측정), 플랫폼별 차이는 adapter 경계로 분리했습니다.
- `useFunnel` + sessionStorage 복원 + `FormDirtyContext`를 네 흐름에 재사용했습니다. DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 붙였고요.

---

## Skills

검증된 라이브러리 내부를 읽고 그 위에 얇은 어댑터를 두는 편입니다. Server·Form·UI 상태의 역할을 섞지 않고, 추상화는 같은 패턴이 세 번 나온 뒤에 합니다.

- **TypeScript / JavaScript** — Zod 스키마 추론으로 폼 타입 동기화, mapped type·discriminated union 도메인 모델링
- **React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary`, `useSyncExternalStore` 어댑터
- **Next.js App Router** — Middleware/BFF, 캐싱 모델 구분, RSC 경계
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod
- **아키텍처/생산성** — FSD 5-layer + sub-domain, Turborepo + pnpm 모노레포, Claude Code 기반 워크플로우 + 비판적 감독

REST/axios·TanStack Query·BFF 기반으로 서버 상태 모델링, 캐시 일관성, optimistic update와 롤백을 다뤄왔습니다. GraphQL/Relay와 React Native 같은 새 스택도 라이브러리의 내부 계약부터 읽고 흡수하는 방식으로 빠르게 따라갑니다.

---

## Side Project — data-structure-ts

- Queue/Heap/PriorityQueue를 observer 기반 외부 store로 만들고 React binding을 분리한 라이브러리입니다. `useSyncExternalStore`로 구독하고, `bindMethods<T>` mapped type으로 class instance의 method key만 추려 hook으로 노출했습니다. 자료구조 동작은 core에서, hook 구독은 adapter에서 각각 Jest로 검증했습니다.

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
