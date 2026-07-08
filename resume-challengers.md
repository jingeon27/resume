# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

시술·프로그램 도메인과 운영 화면을 함께 다뤄온 프론트엔드 개발자입니다. 2026년 1월부터 복지몰·CMS·병원 CRM 세 서비스의 프론트엔드 오너십을 맡아 프로그램·예약·정산·쿠폰처럼 매출과 운영이 얽힌 화면을 개발해 왔습니다. 개발한 기능은 Amplitude 이벤트로 검증하고, 사용자 행동 데이터를 기반으로 후속 과제를 도출했습니다. 기능 구현에 그치지 않고 사용자 경험과 사업 지표를 함께 개선하는 방향을 찾습니다.

- 시술상세 개편을 데이터로 검증: 리뷰 조회 사용자의 예약 전환율이 미조회 사용자 대비 +15%p 높게 나타남
- 프로그램(38필드 Program)·예약·정산·쿠폰 등 판매자/운영자 화면을 반복 패턴으로 정리
- 첫 구현이던 URL 토큰 전달의 로그 노출 위험을 확인해 form POST BFF로 다시 설계
- 기획·디자인·마케팅과 함께 기존/신규 기능을 검토하고, `.claude` 스킬·커맨드로 반복 작업을 자동화

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 복지몰(B2C)·CMS·병원 CRM 프론트엔드 오너십을 맡고 있습니다. 예약까지만 있던 MVP를 운영·분석·병원 관리까지 확장하는 과정에서 동료 개발자·디자인·마케팅·PO와 협업했습니다.

**데이터로 검증해서 비즈니스에 기여 (Amplitude)**

- 마케팅팀이 사용하던 Amplitude 위에 복지몰 전반의 퍼널·행동 이벤트 약 240개를 설계했고, 디자인팀 가설("정보가 많으면 신뢰가 오르고 전환율도 오른다")에 따른 시술상세 개편의 배포 전후를 이 계측으로 비교했습니다.
- 리뷰를 조회한 사용자의 예약 전환율이 미조회 사용자보다 15%p 높게 나타났고, 이 결과를 근거로 프로그램별 리뷰 분리와 CTA 위치 조정을 후속 과제로 제안했습니다.
- 신규 가입 UTM 유실은 코드 문제가 아니라 Amplitude 속성 상태(`unexpected`)가 원인임을 확인해, 코드 변경 없이 해결했습니다.

**판매자/운영자 관리 도구**

- 프로그램 관리(38필드 Program 폼), 예약, 정산, 쿠폰, 병원 계약 같은 운영 화면을 SearchFilter / Table / Modal / Drawer / Detail Form 몇 가지 패턴으로 정리했습니다. ([글](https://jingeon27.tistory.com/18))
- 정리해 둔 패턴을 기반으로 신규 쿠폰 도메인을 약 12개 파일 규모로 구현했습니다.

**직접 판단해서 바꾼 것들**

- 정산은 메인과 도메인이 달라 쿠키를 공유할 수 없었습니다. 첫 구현이던 URL 토큰 전달은 access log·Referer에 토큰이 남을 위험이 있어, form POST BFF로 바꾸고 CSP `form-action` 고정과 open redirect 방어를 적용했습니다. ([글](https://jingeon27.tistory.com/19))
- 1,800줄 규모의 검수 PR을 리뷰하며, AntD 내장 Form이 제공하는 `rules`·`validateFields`로 대체할 수 있는 직접 구현 검증 로직을 짚고 단순화를 제안했습니다.

**빠르게 실험하고 배포 (AI 워크플로우)**

- `.claude` 스킬·커맨드를 직접 작성해 작업 시작부터 배포까지의 반복 절차를 자동화했고, worktree로 두세 개 과제를 병렬로 검토합니다.
- AI가 생성한 코드는 컨벤션과 빌드 결과를 기준으로 검토합니다. 빌드 오류를 `force-dynamic` 추가로 우회하지 않고 `'use client'` 누락을 수정했으며, create/update 겸용이라 수정 시에도 `router.push`가 실행되던 mutation 훅은 역할별로 분리했습니다.

**폼·아키텍처·모바일**

- 예약·리뷰·상담 폼을 `RHF + Zod`로 정리하고 다단계 리뷰 작성은 `@use-funnel/core`로 구조화했고, 가족 동기화 컴포넌트는 520줄에서 55줄로 줄었습니다. ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))
- SafeDoc App 약 1,100파일을 6-layer FSD로 정리했고, CMS·병원 CRM 모노레포는 두 앱이 공유할 도메인을 entities/features 패키지로 새로 정의하고(이 시점 13개), shared 5개를 FSD에 맞게 하나로 통합해 9개로 정리했습니다. 레이어 경계는 의존성 없는 자체 ESLint 플러그인으로 강제해 위반이 lint에서 잡힙니다.
- `@core` primitive 20개를 `tailwind-variants` 토큰으로 묶고, BottomSheet는 Compound + `overlay-kit`로 만들어 뒤로가기·backdrop·snap 같은 모바일 엣지케이스를 한곳에서 처리했습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- ATS 크롤러가 사이트마다 중복 구현되던 구조를, NestJS의 module/DI/factory 패턴을 Electron에 적용한 사이트별 어댑터 구조로 재설계하고 팀에 공유했습니다. 새 사이트는 service·repository·helper 구현만으로 연동할 수 있게 했고, 점핏·잡플래닛·게임잡 3개 연동 이후 신규 연동 기간이 기존 약 3일에서 약 1일 수준으로 줄었습니다. 단위 테스트는 후행 과제로 남았습니다.
- 폼 dirty 추적·복원(`FormDirtyContext` + sessionStorage) 패턴을 네 흐름에 재사용했고, 다단계 입력은 `useFunnel`로 구조화했습니다. DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 적용했습니다.

---

## Skills

검증된 라이브러리 내부를 읽고 그 위에 얇은 어댑터를 두는 방식을 선호합니다. Server·Form·UI 상태의 역할을 섞지 않고, 추상화는 같은 패턴이 세 번 나온 뒤에 적용합니다.

- **TypeScript 5 / React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary`, `useSyncExternalStore` 어댑터, Zod 스키마 추론
- **Next.js App Router** — Middleware/BFF, 캐싱 모델 구분, RSC 경계
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod, AntD Form
- **아키텍처/UI** — FSD 6-layer + sub-domain, Turborepo + pnpm 모노레포, tailwind-variants, Radix, overlay-kit, 인앱 웹뷰 브릿지

모바일 우선 B2C, 네이티브 웹뷰 브릿지, popstate/backdrop/snap 같은 모바일 라이프사이클을 다뤄왔습니다. React Native 같은 새 스택도 라이브러리의 내부 계약부터 읽고 흡수하는 방식으로 빠르게 학습할 수 있습니다. 실제로 toss/slash `useFunnel`의 `NonEmptyArray` 타입 오류를 고쳐 머지된 기여가 있고, 실전에서 쓰는 TanStack/ai에도 `useChat` 인스턴스 안정성 리팩토링 PR을 제출해 리뷰를 받고 있습니다. ([toss/slash #363](https://github.com/toss/slash/pull/363) · [TanStack/ai #864](https://github.com/TanStack/ai/pull/864))

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
