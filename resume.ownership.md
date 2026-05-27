# 김진건

**Frontend Engineer** jingeon27@gmail.com | 010-6865-8208 | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 - 2028.06) — 산업기능요원 지정업체 전직 가능

---

## Summary

빠르게 만들어진 서비스를 **단독으로 떠안아 기능·구조·인프라까지 끝까지 책임지는** 프론트엔드 엔지니어입니다. 2026.01부터 세이프닥 복지몰·CMS·병원 CRM **3개 서비스의 단독 Frontend Engineer**로, 신규 기능 개발부터 아키텍처 표준·배포 인프라까지 스스로 결정하고 결과를 책임집니다.

- **단독 소유 범위** — SafeDoc App 961 파일 5-layer FSD 표준화 + 13패키지 모노레포(Turborepo + pnpm) 설계·운영
- **자율적 의사결정 + 한계까지 책임** — 추상화 도입 시점, sub-domain 분할 기준을 직접 판단하고, 잘못 잡은 도입 시점(30+ 누적 후 도입)까지 회고로 명시
- **기술부채 단독 청산** — 외부업체가 만든 정산 영역을 계약 종료 후 FSD 전환·컴포넌트 분리·모달 패턴 공통화까지 인수해 운영 가능한 상태로 정리
- **아키텍처 패턴 자체 정립** — FSD sub-domain 패턴, 2-tier FORM_NAME enum, 서버↔폼 Transfer Layer
- **데이터 기반 의사결정** — Amplitude 241개 이벤트 설계 후 시술상세 실험을 직접 분석해 후속 과제 재설계
- **AI 워크플로우 단독 구축** — `.claude` skills를 자체 작성해 FSD 경계·정산 리팩토링 방식을 박제, worktree로 2~3개 작업 병렬 운영

검증된 라이브러리 위에 얇은 어댑터를 두는 방향을 선호하며, Rule of Three 이후에만 추상화를 도입해 과한 설계를 피합니다.

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 **SafeDoc App(복지몰)**, **CMS**, **병원 CRM**을 단독으로 맡아 신규 기능 개발과 구조 개선, 배포 인프라까지 책임지고 있습니다. 합류 당시 예약 흐름 중심의 MVP였던 제품을, 예약 이후 운영 기능·분석 환경·관리자 기능까지 확장하며 운영 가능한 구조로 끌어올렸습니다.

- **MVP → 운영 제품으로 단독 확장**
  - 예약 이전 중심이던 MVP를 유저용 프로그램 상세, 관리자용 프로그램 검수, 검색 필터 고도화까지 확장해 운영 가능한 구조로 발전시켰습니다.
  - 시술 이후 금액 변동(업셀링/다운셀링) 추적 공백을 보완하기 위해 기업 쿠폰·정산 기능을 추가했고, 외부업체가 개발한 정산 영역은 계약 종료 후 FSD 전환·컴포넌트 분리·모달 패턴 공통화까지 단독으로 인수·정리했습니다.

- **Amplitude 241개 이벤트 + 시술상세 실험을 직접 설계·분석**
  - 예약 전후 핵심 퍼널 이벤트를 직접 설계·확장했고, 배포 후 퍼널·행동 데이터로 전후 변화를 분석했습니다.
  - 최종 예약 전환율은 유의미한 변화가 없었지만, 가입~예약 소요시간 14분 → 11분 감소를 확인했습니다.
  - 시술상세 진입 사용자의 25%가 리뷰를 조회했고(병원상세 8%), 리뷰 조회 사용자의 예약 전환율이 비조회 대비 약 15%p 높다는 점을 발견해 **프로그램 기준 리뷰 분리·CTA 재배치를 후속 과제로 직접 도출**했습니다.

- **예약 Form 아키텍처 단독 리팩토링 — 1,400 → 700줄**
  - `useState` 30개 + props drilling + `useEffect` 5~6개로 얽힌 가족 동기화를 `React Hook Form + Zod + @use-funnel/core`로 정리, 동기화 로직 550줄 → 55줄(90% 감소).
  - cross-field 검증을 if 분기에서 `superRefine` 선언형 schema로 이전하고, 이 패턴을 리뷰 작성 / 상담 신청 / 회원정보 수정에 재사용했습니다.

- **리뷰 작성 플로우 — 0부터 설계한 신규 도메인 (1,290 LOC)**
  - 4단계 funnel + step별 Zod schema + 통합 schema 설계. 이후 상담 / 견적 요청 플로우의 레퍼런스 구현으로 활용.

- **`@core` 디자인 시스템 운영·확장**
  - `Button` `Input` `BottomSheet` `Dialog` `Toast` `Tooltip` `Callout` 등 Primitive를 `tailwind-variants`로 size / intent / state 3축 표준화해 inline `className` override 안티패턴을 줄였습니다.
  - `Input` focus/scroll 시스템(`useImperativeHandle` + 스크롤 부모 탐색 + 오프셋 보정), controlled/uncontrolled 양립 등 핵심 동작을 직접 설계.
  - BottomSheet Compound(`Root/Header/Content/Footer`)를 `react-modal-sheet` 위에 설계하고 `overlay-kit` imperative API로 호출하도록 구성해, 뒤로가기(`popstate`)·backdrop tap·snap point를 `Root` 라이프사이클 한 곳에서 처리.

- **SafeDoc App 프론트 아키텍처 단독 정리 — 961 파일 5-layer FSD 표준화**
  - FSD와 Atomic Design 잔재가 섞인 구조를 `app / pages / widgets / features / entities / shared` 5-layer로 표준화하고, 25 entities / 20 features 슬라이스의 경계와 Public API 기준을 직접 정립.
  - `ensureQueryData` + props drilling로 캐시를 구독하지 않아 무효화가 화면에 반영되지 않던 구조를, `queryOptions` + Server Component prefetch → `HydrationBoundary` → `useSuspenseQuery`로 전환해 구독을 호출 지점으로 분산. infinite query는 `infiniteSetData` 헬퍼로 nested page 내 개별 아이템을 갱신.
  - 공통 부모 `layout.tsx` 단계에서 program 상세를 prefetch하도록 구조를 바꿔 `/program/detail` 중복 호출을 request-scoped 캐시로 재사용, 하위 page 전환 시 server-level 중복 fetch 제거.

- **CMS · 병원 CRM 13패키지 모노레포 설계·운영**
  - 13패키지(3 config + 5 shared + 2 lib + entities + features) 구조를 설계하고 workspace protocol + pnpm catalog로 공통 의존성을 관리.
  - `@safedoc/ui` 빌드를 `prebuilt(tsup)` → `no-build bundled`로 전환해 패키지 ↔ 앱 변경이 즉시 HMR 반영.
  - Turborepo + GitHub Actions 5 workflows + `dorny/paths-filter` 변경 감지로 CMS / Hospital 선택 배포를 구성.

- **Program 도메인 폼 설계 — sub-domain + Transfer Layer**
  - 2-tier `FORM_NAME` enum으로 공통 enum과 CMS 전용 enum이 같은 값을 재참조하게 해 공통 필드 변경을 양쪽에 자동 동기화.
  - Transfer Layer(`programDetailToClientProgramForm` / `clientProgramFormToCreateRequest`)로 서버↔폼 변환을 격리. 검수는 단일 폼 인스턴스 + 상태 머신(`PROGRAM_INSPECTION_STATUS`)으로 단순화.
  - Admin 안정화 후 `@safedoc/features`로 추출해 CMS / 병원 CRM이 함께 쓰도록 확장.

- **정산 도메인 재설계 + 운영**
  - Next.js Middleware + Route Group `(altLayout)/settlement`로 별도 호스트를 분리하면서 단일 코드베이스 유지. legacy `fetch/apis` → FSD `entities/features` 마이그레이션.
  - `queryClient.setQueriesData` 기반 Optimistic Update + 실패 시 자동 롤백으로 정산내역/숨김처리 두 탭 동시 갱신.
  - 레거시 `forwardRef` 모달을 `overlay-kit` 패턴으로 전환, 대표 모달을 먼저 리팩토링한 뒤 그 컨텍스트를 Claude Code에 넘겨 9개 CMS 도메인 + hospital-admin까지 단일 사이클에 `useModalStore` 의존 제거.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 - 2024.11

캘린더 기반 일정 조율 + ATS SaaS의 ATS 서비스 round에서 신규 기능 개발과 유지보수 담당.

- **Electron Desktop 크롤러 아키텍처 재설계 — MVC + DI + Factory Pattern**
  - 플랫폼(점핏 / 잡플래닛 / 게임잡)마다 흩어진 공통 흐름(로그인 → 검색 → 수집 → 업로드)을 `CandidateServiceHelper` 컨트롤러 + `PlatformAdapter` 인터페이스 + `PlatformAdapterFactory`로 재설계.
  - **신규 플랫폼 연동 3일 → 1일 (66% 감소)** (3개 플랫폼 도입 후 직접 측정).
  - **한계 인지**: DI 구조는 갖췄지만 단위 테스트는 후행, DOM 셀렉터 변경 헬스체크/알람까지 만들었다면 운영 비용을 더 줄일 수 있었습니다.
- **면접 템플릿 / 온보딩 4단계 funnel** — `useFunnel` + `usePromiseSessionStorage` + `FormDirtyContext` 통합, 4가지 흐름에 재사용. 이후 SafeDoc `useZodForm` 패턴의 yup 버전 원형.
- **메일 / 알림 템플릿** — `@whattime/quill` WYSIWYG + 변수 시스템(`{{candidateName}}`), quill blot으로 변수를 atomic node 처리.
- **그 외** — DnD 공고 정렬(`@dnd-kit` + optimistic update), roundhr.com 랜딩(Next.js + Notion CMS).

---

## Skills

- **React 18/19**: Compound + Custom Hook 추상화로 디자인 시스템/폼 도메인 직접 설계, `useSuspenseQuery` + `HydrationBoundary` SSR 표준화.
- **TypeScript 5**: Zod schema 추론 제네릭(`z.infer`), Discriminated Union(콜인/워크인 동의서 분리), `satisfies` + `as const` 상수 좁은 추론, mapped/recursive type 도메인 타입 자동 생성.
- **Next.js 15 App Router**: Middleware 호스트 분리, Route Group, Streaming SSR + Suspense, `revalidatePath`/`revalidateTag` 무효화 전략, RSC 직렬화 제약 기반 경계 설계.
- **Architecture**: FSD 5-layer + sub-domain 자체 정립, Monorepo(Turborepo + pnpm) 설계, MVC + DI + Factory(Electron).
- **State & Data**: TanStack Query v5 `queryOptions` 통합 + Optimistic Update, Zustand(UI 전역 한정).
- **Form**: RHF + Zod `useZodForm` 어댑터 + `superRefine`, AntD Form `Form.List` + `useWatch` cascade validation.

---

## Education

대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

## Certification

정보처리기능사 | 한국산업인력공단 | 2023.04
