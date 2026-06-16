# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

받은 명세를 구현하기보다 **문제를 직접 발견하고 근거를 들어 솔루션을 제안하는** 2년차 프론트엔드 엔지니어입니다. 2026.01부터 복지몰·CMS·병원 CRM 3개 서비스를 맡아 아키텍처 설계부터 출시·운영까지 전 과정을 책임졌고, 가설은 Amplitude 데이터로 검증해 실질 임팩트로 이었습니다. 특히 **AI 개발 툴을 워크플로우에 깊게 통합하되 출력을 비판적으로 감독**해 개발 생산성과 품질을 함께 끌어올려 왔습니다. 주장보다 근거를 우선하고, 데이터로 틀린 게 확인되면 바로 정정합니다.

- **AI 개발 툴 활용·통제** — Claude Code 기반 `.claude` 스킬·커맨드를 자체 작성해 작업→생성→검증→배포를 자동화, AI 생성 코드는 컨벤션으로 비판적 게이트
- **주도적 문제 해결** — 제안된 토큰 위임의 노출 위험을 짚어 form POST BFF로 재설계, 7년차 PR에서 프레임워크 재발명 지적, 캐시 미구독 결함 진단
- **데이터로 임팩트** — Amplitude 241개 이벤트, 가입→예약 14분→11분 / 리뷰 조회 사용자 전환율 +15%p 확인 → 후속 과제 도출
- **빠른 개발·배포 주도** — 명령 체인(`/jira-branch`→생성→`/full-deploy`)과 worktree 병렬로 신규 어드민 도메인 초기 구현 ~30분
- **플랫폼/트랜잭션 도메인** — 상품·주문·정산·쿠폰을 SearchFilter/Table/Modal/Drawer 반복 패턴으로 표준화

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 **복지몰(B2C)·CMS·병원 CRM** 프론트엔드. 단독 책임 범위에서 아키텍처 설계부터 출시·운영까지 수행하며, 동료·디자인·마케팅·PO와 협업.

- **AI 개발 툴 활용 + 비판적 감독**
  - Claude Code 기반 `.claude` 스킬·커맨드를 자체 작성해 FSD 경계·모달 패턴·OpenAPI→타입 생성을 codify하고, 작업 시작→코드 생성→검증→배포 흐름을 자동화 (worktree로 2~3개 병렬)
  - AI 생성 코드를 수동 수용하지 않고 컨벤션으로 게이트 — `force-dynamic` 우회를 근본 원인(`'use client'` 누락)으로 되돌리고, AI가 만든 mutation 훅의 create/update 겸용 `router.push` 버그를 진단해 분리. 손쉬운 우회·과한 추상화는 근거 대고 reject

- **주도적 문제 발견 → 솔루션 제안**
  - 정산 크로스 도메인 인증을 URL 토큰으로 위임하려던 초안에서 access log·Referer 노출 위험을 짚고 **form POST BFF**로 재설계 (CSP `form-action` 고정 + open redirect 방어) ([글](https://jingeon27.tistory.com/19))
  - 7년차 동료의 1,800줄 검수 PR 리뷰에서 AntD 내장 Form을 두고 검증을 수동 구현한 부분을 `rules`+`validateFields`로 대체 가능함을 제시 — 원칙이 아니라 코드 근거로
  - `dehydrate`한 캐시를 props로 받아 *구독하지 않아* `invalidate`가 무력화되던 구조를 진단, `useSuspenseQuery` 구독으로 단일 소스화

- **데이터로 임팩트 (Amplitude)**
  - 시술상세 개편 퍼널·행동 이벤트 241개 설계 → 가입→예약 14분→11분, 리뷰 조회 사용자 전환율 +15%p 확인 → 프로그램 기준 리뷰 분리·CTA 재배치 도출 (디자인·마케팅·PO 협업)
  - 신규 가입 UTM 유실을 가설 검증 후 Amplitude 속성 상태(`unexpected`)가 원인임을 규명, **코드 수정 없이** 해결

- **개발 생산성·환경 개선**
  - 정립한 패턴 위에서 신규 쿠폰 도메인을 12파일 규모로 빠르게 추가 — 구조 투자가 개발 속도로 회수됨을 확인
  - SafeDoc App 961파일 5-layer FSD 표준화, CMS·병원 CRM 모노레포는 인수 후 entities/features 신설 + shared 통합으로 13→9개 패키지 재설계 (Turborepo + pnpm)

- **제품·폼**
  - 상품(38필드 Program)·정산·쿠폰·예약을 도메인 단위 반복 패턴으로 표준화 ([글](https://jingeon27.tistory.com/18))
  - 예약/리뷰/상담 폼을 `RHF + Zod + @use-funnel/core`로 통합, 가족 동기화 **520→55줄(−89%)** ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))
  - `@core` 20개 primitive를 `tailwind-variants`로 표준화, BottomSheet Compound + `overlay-kit`로 모바일 엣지케이스 일관 처리

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- **Electron 크롤러 재설계 (MVC + DI + Factory)** — 플랫폼별 구현을 `PlatformAdapter`+`Factory`로 분리, **신규 연동 3일→1일**(직접 측정). *한계: 단위 테스트 후행*
- **다단계 funnel** — `useFunnel` + sessionStorage 자동 복원 + `FormDirtyContext`를 4개 흐름에 재사용. **DnD 정렬** `@dnd-kit` + optimistic update/롤백

---

## Skills

**시그니처** — Server/Form/UI 전역/로컬 상태의 역할을 분리하고, 검증된 라이브러리 내부를 읽어 얇은 어댑터를 설계합니다. Rule of Three 이후에만 추상화하며, 변경마다 *왜 그렇게 했는지* 근거를 남깁니다.

- **TypeScript / JavaScript** — Zod schema 추론으로 폼 타입 자동 동기화, mapped type·discriminated union 도메인 모델링, `satisfies` 좁은 추론
- **React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary` SSR, `useSyncExternalStore` 어댑터
- **Next.js App Router** — Middleware/**BFF**, 캐싱 모델(request memoization / Data Cache / dynamic 강등) 구분, RSC 경계
- **상태/데이터** — **TanStack Query v5**(`queryOptions`, optimistic + 롤백), **Zustand**, RHF + Zod
- **아키텍처/생산성** — FSD 5-layer + sub-domain, Turborepo + pnpm 모노레포, **Claude Code 기반 AI 워크플로우 + 비판적 감독**
- **Open Source Reading** — RHF / Toss Slash / TanStack Query 내부를 읽고 사내 어댑터 설계에 반영

**GraphQL/Relay·React Native는 미경험**이나, REST/axios·TanStack Query·BFF 경험과 라이브러리 내부를 읽고 흡수해 온 트랙레코드로 빠르게 적응할 수 있습니다.

---

## Side Project — data-structure-ts

- core 자료구조(Queue/Heap/PriorityQueue)를 observer 외부 store로 모델링하고 React binding을 분리. `useSyncExternalStore` 구독 + `bindMethods<T>` mapped type으로 class method key만 추론해 hook API로 노출. (Jest로 store/hook 분리 테스트)

---

## Education & Certification

- **대덕소프트웨어마이스터고등학교** 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
