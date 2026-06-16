# 김진건

**Frontend Engineer** · jingeon27@gmail.com · 010-6865-8208 · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

기술 그 자체보다 **그 기술로 어떤 비즈니스 문제를 푸는지**를 먼저 묻는 프론트엔드 엔지니어입니다. 2026.01부터 복지몰·CMS·병원 CRM 3개 서비스를 맡아, **상품(프로그램)·주문(예약)·정산·쿠폰** 등 트랜잭션·백오피스 도메인을 직접 설계하고, Amplitude 데이터로 가설을 검증해 다음 과제를 도출해 왔습니다. 받은 명세를 구현하기보다, **왜 그렇게 해야 하는지 근거를 들고 제안을 뜯어보는** 방식으로 일합니다. "이 정도면 됐다"보다 "한 번 더 깎으면 운영 비용이 절반"인 지점을 찾습니다.

- **데이터로 비즈니스 판단** — Amplitude 241개 이벤트 설계, 가입→예약 14분→11분 / 리뷰 조회 사용자 전환율 +15%p 확인 → 후속 과제 도출 (디자인·마케팅·PO와 협업)
- **커머스 백오피스** — 상품(38필드 Program)·정산·쿠폰·예약을 SearchFilter/Table/Modal/Drawer 반복 패턴으로 표준화
- **근거로 설득하는 판단** — 제안된 토큰 위임의 노출 위험을 짚어 form POST BFF로 재설계, 7년차 PR에서 프레임워크 재발명 지적
- **빠른 실험·시도** — `.claude` 스킬·커맨드 자체 작성 + AI 비판적 감독으로 신규 어드민 도메인 초기 구현 ~30분, worktree 병렬
- **모바일/웹뷰** — 모바일 우선 B2C + 네이티브 웹뷰 브릿지 + `@core` 디자인 시스템

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 **복지몰(B2C)·CMS·병원 CRM** 프론트엔드. 예약 중심 MVP를 운영·분석·판매자 관리까지 확장하며, 단독 책임 범위에서 0→1 설계와 운영을 함께 수행.

- **데이터 기반 실험으로 비즈니스 기여 (Amplitude)**
  - 디자인팀 가설("정보 풍부 → 신뢰 → 전환율")에 맞춰 시술상세를 개편하고, 마케팅팀 Amplitude 환경 위에 퍼널·행동 이벤트 241개를 설계해 배포 전후 비교 기반 마련
  - PO 분석 결과 가입→예약 14분→11분, 리뷰 조회 사용자 전환율 +15%p 확인 → 프로그램 기준 리뷰 분리·CTA 재배치를 후속 과제로 도출
  - 신규 가입 UTM 유실을 가설 검증 후 Amplitude 속성 상태(`unexpected`)가 원인임을 규명, **코드 수정 없이** 해결 — 기술이 아니라 데이터로 푼 사례

- **커머스 백오피스 — 판매자/운영자 관리 도구**
  - 상품 관리(38필드 Program 폼)·주문/예약·정산·쿠폰 기획전·병원 계약을 도메인 단위 반복 패턴으로 표준화, 레거시 page 중심 구조를 기능 단위로 재편
  - 정립한 패턴 위에서 신규 쿠폰 도메인을 12파일 규모로 빠르게 추가 — 구조 투자가 개발 속도로 회수됨을 확인 ([글](https://jingeon27.tistory.com/18))

- **근거로 설득하는 엔지니어링 판단**
  - 정산 크로스 도메인 인증을 URL 토큰으로 위임하려던 초안에서 access log·Referer 노출 위험을 짚고 **form POST BFF**로 재설계 (CSP `form-action` 고정 + open redirect 방어) ([글](https://jingeon27.tistory.com/19))
  - 7년차 동료의 1,800줄 검수 PR 리뷰에서 AntD 내장 Form을 두고 검증을 수동 구현한 부분을 `rules`+`validateFields`로 대체 가능함을 제시 — 원칙이 아니라 코드 근거로
  - `dehydrate`한 캐시를 props로 받아 *구독하지 않아* `invalidate`가 무력화되던 구조를 진단, `useSuspenseQuery` 구독으로 단일 소스화

- **빠른 실험·시도 (AI 워크플로우)**
  - `.claude` 스킬·커맨드를 자체 작성해 FSD 경계·모달 패턴·OpenAPI→타입 생성을 codify, worktree로 2~3개 작업 병렬
  - AI 생성 코드를 수동 수용하지 않고 컨벤션으로 게이트 — `force-dynamic` 우회를 근본 원인으로, AI가 만든 mutation 훅의 create/update 겸용 `router.push` 버그를 진단해 분리

- **폼·아키텍처**
  - 예약/리뷰/상담 폼을 `RHF + Zod + @use-funnel/core`로 통합, 가족 동기화 **520→55줄(−89%)** ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))
  - SafeDoc App 961파일 5-layer FSD 표준화, CMS·병원 CRM 모노레포는 인수 후 entities/features 신설 + shared 통합으로 13→9개 패키지 재설계
  - `@core` 20개 primitive를 `tailwind-variants`로 표준화, BottomSheet Compound + `overlay-kit`로 모바일 엣지케이스(뒤로가기/backdrop/snap) 일관 처리

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- **Electron 크롤러 재설계 (MVC + DI + Factory)** — 플랫폼별 구현을 `PlatformAdapter`+`Factory`로 분리, **신규 연동 3일→1일**(직접 측정). *한계: 단위 테스트 후행*
- **다단계 funnel** — `useFunnel` + sessionStorage 자동 복원 + `FormDirtyContext`를 4개 흐름에 재사용. **DnD 정렬** `@dnd-kit` + optimistic update/롤백

---

## Skills

**시그니처** — Server/Form/UI 전역/로컬 상태의 역할을 분리하고, 검증된 라이브러리 내부를 읽어 얇은 어댑터를 설계합니다(`useZodForm`, BottomSheet compound). Rule of Three 이후에만 추상화하며, 변경마다 *왜 줄였는지·무엇이 후행됐는지*를 함께 정리합니다.

- **TypeScript 5 / React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary` SSR, `useSyncExternalStore` 어댑터, Zod schema 추론으로 폼 타입 자동 동기화
- **Next.js App Router** — Middleware/BFF, 캐싱 모델(request memoization / Data Cache / dynamic 강등) 구분, RSC 경계
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), RHF + Zod(`superRefine`), Zustand, AntD Form(대규모 복합 폼)
- **아키텍처/UI** — FSD 5-layer + sub-domain, Turborepo + pnpm 모노레포, tailwind-variants, Radix/Headless, overlay-kit, 인앱 웹뷰 브릿지
- **AI 워크플로우** — `.claude` 스킬·커맨드 자체 작성, AI 출력 비판적 감독

**React Native는 미경험**이나, 모바일 우선 B2C + 네이티브 웹뷰 브릿지 + 모바일 라이프사이클(popstate/backdrop/snap) 처리 경험과, 라이브러리 내부를 읽고 흡수해 온 트랙레코드로 빠르게 적응할 수 있습니다.

---

## Side Project — data-structure-ts

- core 자료구조(Queue/Heap/PriorityQueue)를 observer 외부 store로 모델링하고 React binding을 분리. `useSyncExternalStore` 구독 + `bindMethods<T>` mapped type으로 class method key만 추론해 hook API로 노출. (Jest로 store/hook 분리 테스트)

---

## Education & Certification

- **대덕소프트웨어마이스터고등학교** 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
