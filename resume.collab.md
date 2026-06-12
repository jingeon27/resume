# 김진건

**Frontend Engineer** jingeon27@gmail.com | 010-6865-8208 | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 - 2028.06) — 산업기능요원 지정업체 전직 가능

---

## Summary

디자인·마케팅·기획과 함께 가설을 검증하고, **공통 패턴을 문서·패키지로 만들어 팀이 재사용하게 하는** 프론트엔드 엔지니어입니다. 빠르게 만들어진 서비스에 합류해 동료와 함께 구조를 정리했고, 2026.01부터는 복지몰·CMS·병원 CRM 3개 서비스의 Frontend를 맡아 신규 기능과 구조 개선을 함께 진행하고 있습니다.

- **크로스펑셔널 협업** — 디자인팀 가설("정보 풍부 → 신뢰 → 전환율")을 함께 검증하고, 마케팅팀이 도입한 Amplitude 위에서 퍼널 이벤트를 설계해 의사결정을 데이터로 뒷받침
- **팀이 재사용하는 자산화** — FSD 경계·Public API 기준·모달 패턴을 `.claude` skills로 문서화, 공통 도메인을 `@safedoc/features` 패키지로 추출해 CMS / 병원 CRM이 함께 사용
- **리뷰 문화** — PR 전 AI agent 코드리뷰로 경계 위반·네이밍·Public API 누락을 사전 점검하는 흐름 운영
- **트레이드오프 커뮤니케이션** — UI 일관성·사용자 인지·기존 패턴 정합성을 근거로 디자이너·기획자와 소통하며 의사결정
- **측정 가능한 임팩트** — 가입~예약 14분 → 11분, 리뷰 조회 사용자 전환율 +15%p 확인, 예약 폼 가족 동기화 520 → 55줄

검증된 라이브러리 위에 얇은 어댑터를 두는 방향을 선호하며, Rule of Three 이후에만 추상화를 도입해 과한 설계를 피합니다.

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 **복지몰**, **CMS**, **병원 CRM**의 프론트엔드를 담당합니다. 합류 초기에는 동료 엔지니어들과 함께 예약 흐름 중심 MVP를 정리했고, 이후 예약 이후 운영 기능·분석 환경·관리자 기능까지 확장하며 디자인·마케팅·기획과 협업해 제품을 고도화했습니다.

- **데이터 기반 의사결정 — 디자인·마케팅팀과 협업한 시술상세 실험**
  - 디자인팀 가설("정보 풍부 → 신뢰 → 전환율")에 동의해 함께 구현했고, 마케팅팀이 도입한 Amplitude 환경 위에 예약 전후 핵심 퍼널 이벤트(241개)를 설계.
  - 배포 후 퍼널·행동 데이터로 전후 변화를 분석 → 최종 예약 전환율은 변화 없었으나 가입~예약 14분 → 11분 감소 확인.
  - 시술상세 진입 사용자 25%가 리뷰 조회(병원상세 8%), 리뷰 조회 사용자 전환율이 비조회 대비 +15%p 높음을 발견 → **프로그램 기준 리뷰 분리·CTA 재배치를 기획과 함께 후속 과제로 도출**.

- **공통 패턴을 팀 자산으로 — 문서화 + 패키지 추출**
  - FSD 경계, Public API 기준, 모달 제작 패턴, 정산 리팩토링 방식을 `.claude` skills로 문서화해 반복 작업의 문맥 비용을 줄이고 누구나 같은 기준으로 작업하게 함.
  - CMS / 병원 CRM이 공유하는 Program 도메인을 안정화 후 `@safedoc/features` 패키지로 추출해 두 앱이 함께 사용하도록 확장.
  - PR 전 AI agent 코드리뷰로 critical한 경계 위반·네이밍·Public API 누락을 사전 점검하는 리뷰 흐름을 운영.

- **예약 Form 아키텍처 리팩토링 — 가족 동기화 520 → 55줄**
  - `useState` 30개 + props drilling + `useEffect` 5~6개로 얽힌 가족 동기화를 `React Hook Form + Zod + @use-funnel/core`로 정리, 동기화 로직(ReservationPersonSelector) 520줄 → 55줄.
  - `superRefine` 선언형 schema로 cross-field 검증을 이전하고, 이 패턴을 리뷰 작성 / 상담 신청 / 회원정보 수정 등 **여러 도메인에 재사용 가능한 형태로** 정리.

- **`@core` 디자인 시스템 — 디자이너와 함께 토큰 표준화**
  - `Button` `Input` `BottomSheet` 등 Primitive를 `tailwind-variants`로 size / intent / state 3축 표준화해 inline `className` override 안티패턴을 줄이고, 디자이너와 합의한 토큰 스키마를 코드에 반영.
  - BottomSheet Compound(`Root/Header/Content/Footer`)를 `react-modal-sheet` + `overlay-kit`으로 구성해 호출부에서 한 줄로 쓰도록 공통화 → 다른 작업자도 동일하게 사용.

- **SafeDoc App 프론트 아키텍처 정리 — 961 파일 5-layer FSD 표준화**
  - FSD와 Atomic Design 잔재가 섞인 구조를 5-layer로 표준화하고, 25 entities / 20 features 슬라이스의 경계와 **Public API 기준을 정해 팀이 같은 규칙으로 import하도록** 함.
  - `ensureQueryData` + props drilling로 캐시를 구독하지 않아 무효화가 반영되지 않던 구조를 `queryOptions` + `HydrationBoundary` + `useSuspenseQuery`로 전환해 구독을 호출 지점으로 분산.
  - 공통 부모 `layout.tsx`에서 program 상세를 prefetch하도록 바꿔 페이지 간 `/program/detail` 중복 호출을 request-scoped 캐시로 재사용.

- **CMS · 병원 CRM 모노레포 + 도메인 폼 설계**
  - 동료가 설계한 기능별 shared 5분할 모노레포(Turborepo + pnpm)를 인수해 entities/features 신설 + 단일 `@safedoc/shared` 통합으로 13→9개 패키지 재편, GitHub Actions 5 workflows + `dorny/paths-filter`로 선택 배포 구성.
  - 2-tier `FORM_NAME` enum으로 공통 enum과 CMS 전용 enum이 같은 값을 재참조하게 해 **공통 필드 변경을 양쪽 앱에 자동 동기화** → 두 제품 간 정합성 유지.
  - Transfer Layer로 서버↔폼 변환을 격리, 검수는 상태 머신(`PROGRAM_INSPECTION_STATUS`)으로 단순화.

- **정산 도메인 재설계 + 운영**
  - 외부업체가 만든 정산 영역을 계약 종료 후 인수해 FSD 전환·컴포넌트 분리·모달 공통화로 정리.
  - `setQueriesData` 기반 Optimistic Update + 자동 롤백으로 정산내역/숨김처리 탭 동시 갱신. 레거시 `forwardRef` 모달을 `overlay-kit`으로 전환해 9개 도메인의 `useModalStore` 의존 제거.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 - 2024.11

캘린더 기반 일정 조율 + ATS SaaS의 ATS 서비스 round에서 신규 기능 개발과 유지보수를 담당.

- **Electron 크롤러 아키텍처 재설계 — MVC + DI + Factory Pattern**
  - 플랫폼(점핏 / 잡플래닛 / 게임잡)마다 흩어진 공통 흐름을 `CandidateServiceHelper` + `PlatformAdapter` + `PlatformAdapterFactory`로 재설계, **신규 플랫폼 연동 3일 → 1일**(직접 측정).
  - **한계 인지**: DI 구조는 갖췄지만 단위 테스트는 후행, 셀렉터 변경 헬스체크/알람을 더했다면 운영 비용을 줄일 수 있었습니다.
- **면접 템플릿 / 온보딩 4단계 funnel** — `useFunnel` + `usePromiseSessionStorage` + `FormDirtyContext`, 4가지 흐름에 재사용. SafeDoc `useZodForm` 패턴의 원형.
- **Server State 표준화** — `@lukemorales/query-key-factory`로 도메인별 query key를 표준화해 무효화 누락·key drift 감소.
- **그 외** — 메일/알림 WYSIWYG(`@whattime/quill`), DnD 공고 정렬(`@dnd-kit`), roundhr.com 랜딩.

---

## Skills

- **React 18/19**: Compound + Custom Hook 추상화, `useSuspenseQuery` + `HydrationBoundary` SSR 표준화.
- **TypeScript 5**: Zod schema 추론 제네릭, Discriminated Union, `satisfies` + `as const`, mapped/recursive type 도메인 타입 생성.
- **Next.js 15 App Router**: Middleware, Route Group, Streaming SSR + Suspense, `revalidatePath`/`revalidateTag` 무효화 전략, RSC 경계 설계.
- **Architecture**: FSD 5-layer + sub-domain, Monorepo(Turborepo + pnpm), MVC + DI + Factory.
- **State & Data**: TanStack Query v5 `queryOptions` + Optimistic Update, Zustand(UI 전역 한정).
- **Form**: RHF + Zod `useZodForm` 어댑터 + `superRefine`, AntD `Form.List` + `useWatch` cascade validation.
- **협업**: 디자이너·기획자와 근거 기반 소통, 컨벤션 문서화/공통 패키지화로 팀 재사용성 확보, PR 리뷰 흐름 운영.

---

## Education

대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

## Certification

정보처리기능사 | 한국산업인력공단 | 2023.04
