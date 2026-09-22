# 김진건

**Frontend Engineer** · 010-6865-8208 · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

사용자 행동을 계측하고, 결과를 다음 제품 개선으로 연결하는 프론트엔드 엔지니어입니다. React·Next.js·TypeScript 기반 B2C 복지몰과 CMS·병원 CRM을 개발·운영하고 있으며, 2026년 1월부터 세 서비스의 프론트엔드를 단독 담당하고 있습니다. 기능을 빠르게 출시하는 데서 끝내지 않고 모바일 인터랙션의 예외 상황, 데이터 정합성, 배포 이후 퍼널까지 함께 확인합니다.

- **대화형 AI UI** — 외부 세션 SSE와 AI 생성 스트림을 연결하는 push→pull 브릿지를 설계하고, 중복 메시지·malformed payload·연결 상태를 제어
- **데이터 기반 검증** — Amplitude 이벤트 약 240개를 설계하고 개편 전후 퍼널을 분석해, 리뷰 조회 사용자의 예약 전환율이 미조회 사용자 대비 **15%p 높음**을 확인
- **모바일 사용자 경험** — BottomSheet 공통 컴포넌트에서 뒤로가기, route change, backdrop, snap point 등 모바일 엣지 케이스를 일관되게 처리
- **글로벌 프론트 기반 구축** — 외국인 의료관광 서비스의 Next.js 16 프로젝트를 세팅하고 en·ko·ar 다국어 라우팅·번역 구조와 초기 UI 구현
- **빠른 제품 개발을 위한 기반** — 예약 폼 가족 동기화 로직을 **520줄에서 55줄**로 축소하고, 디자인 시스템 primitive 20개와 모노레포 공통 패키지를 구축
- **배포 이후 검증** — 시술상세 개편의 퍼널 변화를 추적해 기대와 달랐던 사용자 행동을 수치로 확인

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 **B2C 복지몰, 사내 CMS, 병원 CRM** 프론트엔드를 개발·운영합니다. PO·디자이너·백엔드·마케팅과 협업하며 설계부터 출시, 계측, 운영 개선까지 담당합니다.

**AI 상담 챗봇 — 스트리밍 대화 인터페이스**

- 포맷을 변경할 수 없는 외부 세션 SSE를 `@tanstack/ai` 어댑터 계약에 연결하기 위해 자체 `SubscribeConnectionAdapter`와 콜백 이벤트를 async generator로 변환하는 **push→pull 브릿지**를 구현했습니다.
- 화면의 메시지 소스는 세션 SSE 하나로 일원화하고 AI 생성 스트림은 연결 유지 역할로 분리해, 두 스트림에서 같은 메시지가 중복 렌더링되는 문제를 방지했습니다.
- 서버 status를 기준으로 연결 상태를 관리하되 클라이언트의 `connecting` 상태를 보강하고, malformed SSE는 Zod `.catch()`로 필드별 fallback을 적용해 일부 payload 오류가 전체 스트림 종료로 번지지 않게 했습니다.
- 사용 과정에서 `@tanstack/ai`의 `ChatClient` 인스턴스 안정성 문제를 발견해 lazy initialization 방식의 개선 PR을 제출했습니다. ([TanStack/ai #864](https://github.com/TanStack/ai/pull/864))

**Amplitude 계측과 퍼널 기반 제품 개선**

- PO·백엔드와 이벤트명·프로퍼티를 함께 정의하고, 예약·상담·검색·상세 등 핵심 사용자 여정에 **약 240개 이벤트**와 UTM·QR 유입경로 추적 체계를 구축했습니다.
- 시술상세 개편의 배포 전후 퍼널을 비교해 예약·상담 동선에서 사용자가 이탈하는 구간을 확인했습니다.
- 리뷰를 본 사용자의 예약 전환율이 보지 않은 사용자보다 **15%p 높음**을 확인했습니다. 이는 인과관계가 아닌 행동 간 상관관계로 해석했습니다.
- 신규 가입 UTM 유실 문제는 코드와 OAuth 흐름을 차례로 검증하며 `utm_source` 저장 코드를 먼저 넣었다가, Amplitude 속성 상태(`unexpected`)가 원인임을 찾아 열흘 만에 되돌리고 설정으로 해결했습니다.

**모바일 B2C 서비스와 디자인 시스템**

- Radix UI와 `tailwind-variants`를 기반으로 Button, Input, BottomSheet, Dialog, Toast, Tooltip, Checkbox, Radio, Toggle, Tabs, Chip, Menu 등 **primitive 20개**를 설계하고 예약·검색·리뷰·마이페이지에 적용했습니다.
- BottomSheet를 Compound API(`Root/Header/Content/Footer`)와 `overlay-kit` 기반으로 재설계해 뒤로가기(`popstate`), route change, backdrop cleanup, snap point, mount point를 공통 라이프사이클에서 처리했습니다.
- 연관 검색어 자동완성, 필터·정렬, 무한 스크롤, 병원 지도, 동적 OG와 sitemap을 구현하고 SVG lazy import, 데이터 prefetch, Suspense boundary를 적용해 모바일 탐색 경험과 초기 로딩을 개선했습니다.

**글로벌 서비스 프론트 기반 구축 — en·ko·ar 다국어 (진행 중)**

- 외국인 의료관광 서비스의 **Next.js 16 App Router + TypeScript** 프로젝트를 세팅하고, API 연동 전 단계의 초기 구조와 Figma 기반 UI 구현을 담당하고 있습니다.
- 복지몰에서 사용한 FSD를 `_app/_pages/features/shared` 4개 레이어로 줄였습니다. 새 코드는 page에 두고 두 번째 사용처가 생길 때 공통 레이어로 옮기는 pages-first 기준으로 초기 과설계를 줄였습니다.
- `next-intl`은 en 무접두어, ko·ar 접두어 라우팅에 사용하고, UI 문자열은 자체 `ui-strings + createT` 구조로 en·ko 필수 번역을 컴파일 단계에서 검증했습니다.
- 페이지별로 나뉘었던 번역 파일 19개를 외부 번역가가 한 파일에서 작업할 수 있도록 단일 JSON으로 통합하고, shadcn(base-ui)·Tailwind 4 기반 UI와 전역 포커스 링 정책을 구축했습니다.
- API 연동을 앞두고 프로젝트 전반에 테스트 코드를 적용하기 위한 대상과 범위, 작성 기준을 정리하고 있습니다.

**복잡한 사용자 흐름의 구조 개선**

- `useEffect` 4개와 props drilling으로 얽혀 있던 예약 폼을 `React Hook Form + Zod`로 전환해 가족 데이터 동기화 컴포넌트를 **520줄에서 55줄**로 줄였습니다. 조건부 검증은 `superRefine` 스키마로 옮기고 같은 패턴을 리뷰·상담·회원정보 폼에 확장했습니다. ([관련 글](https://jingeon27.tistory.com/11))
- 3단계 리뷰 작성 흐름을 step별 Zod schema와 funnel로 구조화하고, 공통 `useZodForm` 어댑터로 스키마와 폼 타입이 함께 변경되도록 만들었습니다. ([관련 글](https://jingeon27.tistory.com/15))
- CMS와 병원 CRM이 공유하는 38필드 프로그램 폼을 `common/inspection/draft` 생명주기와 Transfer Layer로 분리하고, `createTypedForm`으로 잘못된 필드 경로를 컴파일 단계에서 차단했습니다. ([관련 글](https://jingeon27.tistory.com/18))

**개발 생산성과 안정적인 운영**

- Atomic Design과 FSD가 혼재된 약 **1,100개 파일**을 6-layer FSD로 정리하고, 레이어 의존 규칙을 자체 ESLint 플러그인으로 자동 검증했습니다.
- CMS·병원 CRM Turborepo에서 공통 도메인을 entities/features 패키지로 분리하고 shared 패키지 5개를 하나로 통합해 **13개 패키지를 9개로 재편**했습니다. pnpm catalog와 GitHub Actions 기반 병원 CRM 배포 workflow도 구성했습니다.
- Next.js의 `queryOptions → Server prefetch → HydrationBoundary → useSuspenseQuery` 패턴으로 서버·클라이언트 캐시를 한 소스로 연결하고, optimistic update와 자동 롤백으로 운영 화면의 즉시성을 높였습니다.
- `.claude` Skills·Commands에 FSD 경계, 모달 패턴, OpenAPI 타입 생성, PR 검증 절차를 문서화해 반복 작업과 리뷰 맥락 비용을 줄였습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

캘린더 기반 일정 조율 서비스와 채용 ATS SaaS에서 사용자 기능과 운영 도구를 개발했습니다.

- 사이트마다 중복되던 Electron ATS 크롤러를 NestJS의 모듈 경계와 constructor injection을 참고한 사이트별 adapter 구조로 재설계했습니다. 프레임워크 자체는 Electron에 과하다고 판단해 제거하고 DI container 없이 factory로 조립했습니다.
- 점핏·잡플래닛·게임잡 연동 이후로는 새 사이트를 붙일 때 정해진 인터페이스(service·repository·helper) 구현만 남았습니다.
- `@dnd-kit` 기반 채용 칸반 보드에 optimistic update와 실패 시 rollback을 적용하고, TanStack Table 기반 정렬·필터·다중 선택 인터랙션을 구현했습니다.
- 후보자 생성과 면접 템플릿을 다단계 funnel로 구조화하고 URL query와 동기화했으며, 폼 dirty 추적·복원 패턴을 네 개 사용자 흐름에 재사용했습니다.
- Quill 기반 WYSIWYG에 `{{candidateName}}` 형태의 변수를 atomic node로 구현해 편집 중 변수 내부가 깨지지 않도록 했습니다.
- `@lukemorales/query-key-factory`로 도메인별 query key를 표준화해 무효화 누락과 key drift를 줄였습니다.

---

## Skills

- **Core** — TypeScript, JavaScript(ES6+), React 18/19, Next.js 15/16(App Router / Pages Router), HTML, CSS
- **Data & State** — TanStack Query v5, Zustand, React Hook Form, Zod, Amplitude
- **Conversational UI** — SSE, async generator, streaming response, `@tanstack/ai`, push→pull adapter
- **Mobile UI** — Responsive Web, Radix UI, Compound Component, Tailwind CSS, `tailwind-variants`, `overlay-kit`
- **Architecture** — FSD, Turborepo, pnpm workspace, BFF, SSR / Streaming / Hydration, i18n(next-intl)
- **Quality & Delivery** — Jest, Vitest, ESLint custom rule, GitHub Actions, OpenAPI type generation

---

## Open Source

- **toss/slash** — `useFunnel`의 `NonEmptyArray` 타입 오류 수정 ([PR #363](https://github.com/toss/slash/pull/363), merged)
- **TanStack/ai** — `useChat` 내부 `ChatClient` 인스턴스 안정성 개선 ([PR #864](https://github.com/TanStack/ai/pull/864), review)

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
