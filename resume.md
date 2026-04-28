# 김진건

**Frontend Engineer**  
jingeon27@gmail.com | 010-6865-8208 | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

---

## Summary

빠르게 만들어진 서비스에 합류해 기존 기술 부채와 구조적 문제를 정리하고, 신규 기능 개발과 구조 개선을 함께 진행해 온 프론트엔드 엔지니어입니다. 예약·상담·리뷰처럼 복잡한 사용자 플로우는 폼 아키텍처와 공통 UI 시스템으로 재구성했고, SafeDoc App에서는 961 파일 규모 FSD 코드베이스와 query pattern을, Admin·병원 CRM에서는 13개 패키지 모노레포와 FSD sub-domain 구조, 복합 폼 시스템을 정리해 제품이 계속 확장될 수 있는 기반을 만들었습니다. 현재는 세이프닥 복지몰·CMS·병원 CRM 3개 서비스의 단독 Frontend Engineer로 신규 기능 개발·운영·구조 개선 전반을 담당하고 있습니다.

- 빠르게 만들어진 3개 서비스(복지몰, CMS, 병원 CRM)에 합류한 뒤, 운영 가능한 구조로 재정비하며 신규 기능 개발과 구조 개선을 병행
- 예약 페이지 1,400줄 → 700줄, 가족 데이터 동기화 550줄 → 55줄로 축소하며 폼 아키텍처 재설계
- `@core` 20개 Primitive Component 디자인 시스템과 `useFunnel`·`useZodForm`·queryOptions 패턴을 설계해 반복 구현을 공통 패턴으로 전환
- SafeDoc App의 961 파일 규모 FSD 코드베이스(25 entities / 20 features 슬라이스)와 Admin·병원 CRM의 13개 패키지 모노레포 구조를 정리해 코드베이스 경계를 표준화
- Amplitude 241개 이벤트와 퍼널 분석으로 제품 역효과를 진단하고 실제 사용자 흐름 개선
- Electron 크롤러를 MVC + DI + Factory Pattern으로 재설계해 코드 중복 70% 감소, 신규 플랫폼 연동 기간 3일 → 1일 단축

- 산업기능요원 현역 복무 중 (2025.08 - 2028.06)

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 **SafeDoc App(복지몰)**, **CMS**, **병원 CRM** 프론트엔드 개발과 구조 개선을 담당했습니다.  
빠르게 만들어져 운영 부담이 높았던 제품에 합류해 기존 기술 부채와 구조적 문제를 정리했고, 현재는 3개 서비스의 단독 Frontend Engineer로 제품 전반의 신규 기능 개발·운영·구조 개선을 맡고 있습니다.

- **복지몰 `@core` 디자인 시스템 설계·구현**
  - 포트폴리오: [Safedoc App](https://portpolio-ivory.vercel.app/?company=safedoc#usermall), [공통](https://portpolio-ivory.vercel.app/?company=safedoc#shared)
  - Radix UI / Headless UI 기반으로 `Button`, `Input`, `BottomSheet`, `Dialog`, `Toast`, `Tooltip`, `Callout`, `Checkbox`, `Radio`, `Toggle`, `Tabs`, `Chip`, `Menu` 등 20개 Primitive Component를 공통화
  - Legacy UI를 `@core` 중심 구조로 전환하고 variant, size, state API를 `tailwind-variants` 토큰 스키마(size/intent/state)로 표준화하여 inline className override 안티패턴 제거
  - BottomSheet를 Compound Component(`Root/Header/Content/Footer`) + overlay-kit 구조로 재설계해 route change, popstate, backdrop cleanup, mount point 제어 등 모바일 UX 이슈를 공통 레이어에서 처리하고, 글로벌 config 객체 호출 패턴을 명시적 라이프사이클로 전환

- **예약 Form 아키텍처 리팩토링**
  - 포트폴리오: [리팩토링 비교](https://portpolio-ivory.vercel.app/?company=safedoc#refactor-compare)
  - `React Hook Form + Zod + useFunnel` 구조로 전환해 예약 페이지를 1,400줄에서 700줄로 축소
  - 가족 데이터 동기화 로직을 550줄에서 55줄로 줄이고, 조건부 검증을 선언형 스키마 구조로 정리
  - `ReservationInfoFormView`의 로컬 상태 의존을 제거하고 폼 상태 소유권을 일원화

- **공통 폼 패턴 정립**
  - 포트폴리오: [공통](https://portpolio-ivory.vercel.app/?company=safedoc#shared), [리팩토링 비교](https://portpolio-ivory.vercel.app/?company=safedoc#refactor-compare)
  - `useFunnel`, `useZodForm`을 설계해 단계 전환, 폼 상태, 검증 스키마를 공통 패턴으로 표준화
  - 리뷰, 예약, 상담, 회원정보 등 복수 플로우에 공통 기반으로 확장
  - 폼 타입과 검증 스키마 간 drift를 줄이고 반복 구현을 제거

- **제품 분석 및 전환 구조 개선**
  - 포트폴리오: [Safedoc App](https://portpolio-ivory.vercel.app/?company=safedoc#usermall)
  - Amplitude 241개 이벤트와 UTM/QR 유입 경로 추적 체계를 구축해 주요 퍼널의 행동 데이터를 수집
  - 시술상세 개편 배포 후 예약 클릭 -16%, 상담 클릭 -66%, 최종 예약 -40%의 역효과를 Amplitude 퍼널로 진단
  - 병원 상세에서 바로 예약/상담 가능한 CTA 구조로 재설계해 사용자 depth를 줄이는 방향으로 개선

- **SafeDoc App 프론트 아키텍처 정리**
  - 포트폴리오: [Safedoc App](https://portpolio-ivory.vercel.app/?company=safedoc#usermall), [공통](https://portpolio-ivory.vercel.app/?company=safedoc#shared)
  - FSD와 Atomic Design이 혼재된 961 파일 규모 코드베이스를 5-layer FSD(`app/shared/entities/features/widgets/pages`)로 정리하고, 25개 entities 슬라이스 / 20개 features 슬라이스의 경계와 Public API 기준을 표준화
  - widgets → features 이관, 순환 의존 제거, 파일명 kebab-case 표준화 등 FSD 위반 케이스를 지속적으로 정리
  - TanStack Query v5(`^5.28.4`) queryOptions와 `getQueryClient + 서버 prefetch + HydrationBoundary + useSuspenseQuery` 패턴을 도입해 데이터 페칭과 캐시 전략을 표준화하고, infinite query 페이지네이션을 `infiniteSetData` 헬퍼로 타입 안전하게 처리
  - Radix UI 기반 Primitive Component와 Compound Pattern을 설계해 디자인 시스템 기반 UI 구조를 정리

- **리뷰 작성 / 병원 검색 등 핵심 사용자 플로우 구현**
  - 포트폴리오: [Safedoc App](https://portpolio-ivory.vercel.app/?company=safedoc#usermall)
  - 리뷰 작성(1,290 LOC) 플로우를 `useFunnel` + `useZodForm` 기반으로 구현하고, heic2any 이미지 압축·가족 선택·평점·치료 태그·분석 이벤트 트래킹을 통합
  - 병원 검색 기능에 geolib 거리 계산, naver-maps 연동, react-intersection-observer 기반 무한 스크롤, 자동완성 / 인기 검색어, 실시간 검색 카운트 업데이트를 구현

- **Admin · 병원 CRM FSD custom + 모노레포 패키지 구조 설계**
  - 포트폴리오: [공통](https://portpolio-ivory.vercel.app/?company=safedoc#shared), [주요 의사결정](https://portpolio-ivory.vercel.app/?company=safedoc#decisions)
  - CMS와 병원 CRM 2개 앱에 프로젝트 특성에 맞춘 FSD custom 구조(`app/entities/features/shared/widgets/pages`)를 적용하고, Public API와 sub-feature 패턴(예: `features/program/ui/{detail/form, detail/preview, detail/callout, modal}`)으로 UI 블록 의존성을 폴더 트리에서 가시화
  - CMS와 병원 CRM이 공유하는 13개 패키지(3 config + 5 shared + 2 lib + entities + features) 구조를 설계하고 workspace protocol 기반으로 모듈화
  - 대형 도메인을 위한 sub-domain 패턴을 도입(예: `entities/settlement/{common, contract, deposit, disapproval, omission}`)해 단일 슬라이스 안의 평탄한 파일 누적 문제 해소
  - `@safedoc/ui` 패키지 빌드 방식을 `prebuilt(tsup)`에서 `no-build bundled`로 전환해 패키지↔앱 변경이 HMR로 즉시 반영되도록 DX 개선
  - pnpm catalog 기반 공통 의존성 버전 관리, Turborepo 멀티 환경(dev/staging/prod) 빌드, dorny/paths-filter 기반 변경 감지로 CMS/Hospital 선택 배포가 가능한 GitHub Actions CI/CD(5 workflows: prod/stage/dev deploy + lint + slack-alarm)를 구성

- **복합 폼 / 도메인 시스템 설계**
  - 포트폴리오: [Admin · 병원 CRM](https://portpolio-ivory.vercel.app/?company=safedoc#react)
  - CMS와 병원 CRM이 공유하는 프로그램 등록·수정·검수 플로우를 `entities → features → apps` 3-layer 재사용 구조로 분리하고, `program/{common, draft, inspection}` sub-domain으로 워크플로우 단계를 분할
  - Ant Design `Form.List` + `shouldUpdate` + `useWatch` 기반 cascade validation 구조와 이미지 validation, 임시저장(draft sub-domain), 검수(competition drawer 기반 side-by-side 비교) 워크플로우를 구현
  - DragTable + Form.Item custom trigger(`onDragTable`)로 프로그램 순서 드래그 변경을 폼 상태와 일관되게 동기화
  - 시술/결제 이력 관리 시스템을 병원 CRM에 구축하고 Admin 구현 후 `@safedoc/features` 공통 기능으로 확장
  - 콜인 / 워크인 듀얼 패스 예약 플로우를 `AgreementFormValues`의 `CallIn/WalkIn` 서브타입으로 추출해 경로별 필드 구조를 분리하고, CMS/CRM 양쪽에서 동의서 콘텐츠를 공통 패키지로 공유

- **정산 도메인 분리 및 FSD 전환**
  - 포트폴리오: [Admin · 병원 CRM](https://portpolio-ivory.vercel.app/?company=safedoc#react)
  - Next.js Middleware와 Route Group을 활용해 정산 도메인을 별도 호스트로 분리하면서도 단일 코드베이스 유지
  - Route Group `(altLayout)/settlement`로 별도 레이아웃을 유지하면서 단일 코드베이스 / 환경 게이팅으로 DX 보존
  - 정산 도메인을 legacy `fetch/apis` 구조에서 FSD `entities/features` 구조로 마이그레이션하고, "정산내역" / "숨김처리 비교" 탭과 1200px 예약 상세 drawer(`askBeforeClose`) UX를 구성
  - `queryClient.getQueriesData()` 기반 Optimistic Update 및 자동 롤백 패턴을 정립

### 왓타임 | Frontend Engineer | 2024.01 - 2024.11

캘린더 기반 일정 조율 서비스와 ATS 솔루션을 제공하는 B2B SaaS 기업에서 ATS 서비스 **round**의 신규 기능 개발 및 유지보수를 담당했습니다.

- **Electron Desktop 크롤러 아키텍처 재설계**
  - 포트폴리오: [Whattime 리팩토링 비교](https://portpolio-ivory.vercel.app/?company=whattime#whattime-refactor)
  - MVC + DI + Factory Pattern 기반으로 구조를 재설계하고 `CandidateServiceHelper`로 로그인 → 검색 → 수집 → 업로드 4단계 프로세스를 표준화
  - 코드 중복 70% 감소, 신규 플랫폼 연동 기간 3일 → 1일 단축
  - 점핏, 잡플래닛, 게임잡 연동과 AWS S3 기반 이력서 수집 파이프라인을 구축

- **템플릿 시스템 및 채용 페이지 개선**
  - 포트폴리오: [Whattime 경력](https://portpolio-ivory.vercel.app/?company=whattime#whattime-career)
  - 메일 템플릿·면접 알림 템플릿 기능을 개선하고 템플릿 변수 시스템 기반 동적 메시지 작성 흐름을 정리
  - `@whattime/quill` 기반 WYSIWYG 작성 UI와 실시간 미리보기 경험을 개선
  - 채용 페이지/지원서 설정 폼을 `React Hook Form`, `useFieldArray`, `FormProvider`, `useYupValidation` 기반으로 재구성

- **서버 상태 및 관리 UX 표준화**
  - 포트폴리오: [Whattime 경력](https://portpolio-ivory.vercel.app/?company=whattime#whattime-career)
  - `@lukemorales/query-key-factory` 기반으로 candidate, recruit, member, interviewAlarm 등 주요 도메인의 query key를 표준화
  - `DndContext`, `SortableContext`, `PointerSensor`, `arrayMove` 기반 DnD 공고 정렬 인터랙션을 구현
  - 태그, 평가 템플릿, 자동화 규칙, 온보딩 checklist, 면접 템플릿 생성 플로우를 고도화

- **면접 템플릿 / 온보딩 플로우 고도화**
  - 포트폴리오: [Whattime 경력](https://portpolio-ivory.vercel.app/?company=whattime#whattime-career)
  - `useFunnel`, `usePromiseSessionStorage`, `FormDirtyContext`를 활용해 4단계 면접 템플릿 생성 플로우를 구현
  - 단계 데이터 복원, 이탈 방지, 생성 완료 흐름을 하나의 퍼널로 정리

- **roundhr.com 랜딩 페이지 개선**
  - 포트폴리오: [Whattime 경력](https://portpolio-ivory.vercel.app/?company=whattime#whattime-career)
  - Next.js 기반으로 메인·가격·기능 소개 섹션을 개선하고 GSAP ScrollTrigger, 스크롤 스냅, 다운로드 CTA를 적용
  - Notion CMS 기반 콘텐츠 운영 구조와 `react-notion-x` 렌더링 흐름을 정리

---

## Skills

### Engineering Philosophy

**검증된 라이브러리 위에 얇은 어댑터로 추상화 비용 최소화**. Rule of Three와 명확한 도메인 경계가 있을 때만 추상화를 도입하며, `@use-funnel/core`, `react-hook-form`, `react-modal-sheet` 같은 외부 라이브러리를 다시 만들지 않고 활용. 1,400줄 → 700줄 리팩토링도 신규 추상화 도입이 아닌 기존 라이브러리 활용 + 중복 제거로 달성.

---

### Core Stack

#### React 18

Compound Pattern + Custom Hook 추상화로 디자인 시스템과 폼 도메인을 직접 설계해 운영 중인 수준.

- **Compound Pattern 직접 설계**: BottomSheet(Root/Header/Content/Footer) Context API 기반 분리, overlay-kit과 통합해 라이프사이클 명시화. route change / popstate / backdrop pointer-events 누수 / setTimeout cleanup 4가지 모바일 UX 엣지케이스를 한 레이어에서 처리
- **Controlled/Uncontrolled 패턴 추상화**: `useControllableChecked` hook으로 `checked` prop이 undefined면 uncontrolled로 내부 상태만 갱신, 정의되어 있으면 controlled로 외부 상태만 반영, `onChange` 콜백은 모드 무관하게 항상 호출하는 분기 로직 직접 구현 (Radix UI `useControllableState`와 동일 컨셉)
- **Suspense + TanStack Query**: `useSuspenseQuery` + `getQueryClient` + `HydrationBoundary` 패턴으로 SSR 데이터 페칭 표준화. 서버 prefetch 후 클라이언트 hydration까지 일관된 인터페이스로 통합
- **외부 store 구독**: `useSyncExternalStore` 기반 Concurrent rendering 환경의 tearing 문제를 render phase 동기 snapshot 일관성 검증으로 해결하는 패턴 적용
- **React 내부 메커니즘 활용**: Fiber 아키텍처(double buffering, alternate pointer 기반 트리 swap), Lane-based priority scheduling, useTransition/useDeferredValue 차이(setState 트리거 위치 vs props deferred)를 이해하고 사내 추상화 설계에 반영

#### TypeScript 5

Variadic tuple, recursive type, type-level state machine까지 활용하는 고급 영역.

- **고급 타입 패턴**: variadic tuple로 단계별 폼 타입 합성(`[T, ...K]` ↔ `[...K, T]`), recursive type으로 nested key path 추론(`'a' | 'a.b' | 'a.b.c'`), mapped type + key remapping(`Capitalize<string & K>`)으로 도메인 타입 자동 생성
- **Type extraction**: `infer` 기반 ReturnType/Parameters 패턴, Zod schema 추론 제네릭(`z.infer<ZodObject<T>>`)으로 schema 변경 시 form 타입 자동 동기화
- **Type-level state machine**: lookup type 패턴(`{ idle: ...; loading: ... }[S]`)으로 invalid transition을 컴파일 타임에 차단
- **Discriminated Union 도메인 적용**: `AgreementFormValues`의 CallIn/WalkIn 서브타입으로 콜인/워크인 폼 필드 분기, narrowing + exhaustiveness check 활용
- **`satisfies` + `as const`**: 도메인 상수 객체에서 좁은 추론 유지하면서 타입 검증
- **HKT 시뮬레이션**: fp-ts URI 룩업 패턴(`URItoKind<A>` + `Kind<F, A>`)으로 TypeScript native HKT 미지원을 우회하는 함수형 추상화 활용

#### Next.js 15 App Router

Middleware cross-domain 토큰 위임, Streaming SSR + RSC 직렬화 제약, Edge Runtime까지 활용하는 영역.

- **Middleware**: `/settlement/*` 라우트를 별도 호스트로 분리하면서 `accessToken`/`refreshToken`을 URL 파라미터로 cross-domain 위임. 단일 코드베이스 / 환경 게이팅으로 DX 보존
- **Route Group**: `(altLayout)/settlement`로 별도 레이아웃을 유지하면서 단일 코드베이스에서 도메인 분리
- **Streaming SSR + Suspense**: Suspense boundary 단위 chunk 분할로 초기 렌더 시간 단축. Server Component에서 병렬 fetch + 각자 resolve 시점에 chunk 전송하는 흐름 적용
- **Caching 전략**: `cookies()`/`headers()`/`searchParams`가 라우트를 dynamic으로 강제하는 트리거, fetch caching 옵션(`force-cache` / `no-store` / `revalidate: N` / `tags: [...]`) 도메인별 적용. `revalidatePath` vs `revalidateTag` 차이(특정 라우트의 모든 fetch vs 태그 단위 선택적 무효화) 기반 무효화 전략 설계
- **RSC**: Server Component → Client Component props로 함수/class instance/Symbol 전달 불가, plain object/Promise만 직렬화 가능한 wire format(`M`/`J` row prefix) 이해 기반 컴포넌트 경계 설계
- **Edge Runtime**: Node.js API와 Web API 차이(jsonwebtoken 불가, jose 가능 등 Web Crypto 기반)를 고려한 Middleware 설계, Server Action의 POST + RPC wire protocol 활용

---

### Architecture

#### Feature-Sliced Design (FSD)

961 파일 규모 코드베이스를 6-layer FSD로 정리하고 sub-domain 패턴을 자체 정립한 수준.

- **6-layer 표준화**: `app / pages / widgets / features / entities / shared` 레이어와 25개 entities / 20개 features 슬라이스의 경계 + Public API 기준 표준화
- **Sub-domain 패턴**: 단일 슬라이스가 비대해지는 문제를 해결하기 위해 `entities/settlement/{common, contract, deposit, disapproval, omission}` 형태로 도메인 라이프사이클 단계별 분할. FSD 공식 문서엔 없는 자체 발전형으로, 슬라이스 파일 수와 변경 빈도를 기준으로 도입 시점 판단
- **Sub-feature 패턴**: `features/program/ui/{detail/form, detail/preview, detail/callout, modal}` 형태로 UI 블록 의존성을 폴더 트리에서 가시화
- **위반 케이스 정리**: widgets → features 이관, 순환 의존 제거, 파일명 kebab-case 표준화

#### Monorepo (Turborepo + pnpm)

13개 패키지 구조를 단독으로 설계하고 멀티 환경 CI/CD 구성.

- **13개 패키지 분할**: 3 config + 5 shared + 2 lib + entities + features. workspace protocol + pnpm catalog로 공통 의존성 버전 관리
- **No-build bundled 전환**: `@safedoc/ui` 패키지를 prebuilt(tsup)에서 no-build bundled로 전환해 패키지↔앱 변경이 HMR로 즉시 반영 (외부 publish 안 하는 내부 패키지 한정의 의도적 트레이드오프)
- **Turborepo + GitHub Actions**: 5 workflows(prod/stage/dev deploy + lint + slack-alarm) + dorny/paths-filter 기반 변경 감지로 CMS/Hospital 선택 배포

#### MVC + DI + Factory Pattern

Electron desktop 크롤러 아키텍처를 직접 재설계해 코드 중복 70% 감소, 신규 플랫폼 연동 기간 3일 → 1일 단축.

#### Compound / Composition Pattern

BottomSheet, Tabs, Form 등 핵심 UI 도메인에 직접 적용. props 폭발 방지 + 호출자 자유 배치.

---

### Form & Validation

#### React Hook Form + Zod

Step별 schema 분리 + cross-field validation + step 누적 데이터 패턴까지 직접 설계.

- **`useZodForm` 어댑터**: Zod schema 추론 기반 제네릭으로 schema 변경 시 form 타입 자동 동기화 (`Omit<UseFormProps, 'resolver'> & { schema }` 합성)
- **Step별 schema 분리**: `ReviewStep1Schema` / `ReviewStep2Schema` / `ReviewStep3Schema` 단계별 검증 + 최종 통합 `ReviewSchema`로 단계 검증과 최종 검증 분리
- **`superRefine` cross-field validation**: "치과 진료과면 견적 금액 필수", "우대가 미수령 시 사유 필수" 같은 조건부 검증을 명령형 if 분기 대신 선언적 스키마로 처리
- **단계 데이터 누적 패턴**: `baseReset` 고차함수로 step 전환 시 누적된 form 데이터를 다음 step에 전달

#### Ant Design Form System

CMS / 병원 CRM의 핵심 폼 워크플로우를 AntD로 깊이 활용.

- **Cascade Validation**: `Form.List` + `shouldUpdate` + `useWatch` 조합으로 한 필드 변경이 다른 필드 검증에 영향을 주는 의존성을 선언적으로 관리
- **Custom Trigger**: `Form.Item` custom trigger(`onDragTable`)로 DragTable 컴포넌트와 폼 상태 동기화
- **워크플로우**: 임시저장(draft sub-domain) + 검수(competition drawer 기반 side-by-side 비교) + 이미지 비동기 validation 통합

---

### State & Data Fetching

- **TanStack Query v5**: `queryOptions` 패턴으로 useQuery/useSuspenseQuery/prefetchQuery/getQueryData 호출부 통합. infinite query 페이지네이션 + intersection observer 무한 스크롤. `queryClient.getQueriesData` 기반 Optimistic Update + 자동 롤백
- **Zustand**: UI 전역 상태(최근 본 프로그램, 검색 필터)에만 한정 사용. **Server state는 TanStack Query, Form state는 RHF, UI state는 Zustand로 분리해 책임 명확화** — 상태 관리 라이브러리를 모든 상태에 쓰지 않고 도메인별로 적절한 도구 선택

---

### UI & Styling

- **tailwind-variants**: variants/slots/compoundVariants로 디자인 토큰 스키마(size/intent/state) 표준화
- **Radix UI / Headless UI**: Compound Pattern, asChild + Slot, Primitive 활용
- **overlay-kit**: BottomSheet/Dialog 호출 라이프사이클을 명시적으로 제어, 글로벌 config 호출 패턴을 함수 호출 단위로 변환
- **Framer Motion**: AnimatePresence + motion 기반 페이지/단계 전환 애니메이션

---

### Analytics

- **Amplitude**: 241개 이벤트 + UTM/QR 유입 경로 추적. 시술상세 개편 후 -16%/-66%/-40% 역효과를 퍼널 분석으로 진단해 CTA 재설계로 개선
- **Notifly**: 세그멘테이션 SDK (이벤트 큐 기반 비동기 초기화)
- **Kakao Pixel**: 전환 추적

---

### Open Source Reading

검증된 라이브러리 내부 구현을 직접 읽고 패턴을 흡수해 사내 추상화 설계에 반영:

- **React Hook Form**: `Controller` 내부 구현, `useForm` proxy 기반 selective re-render 메커니즘
- **Toss Slash** (`@use-funnel/core`, `overlay-kit`): funnel history snapshot 패턴, overlay 라이프사이클 디자인
- **Radix UI**: Compound Component, asChild + Slot 패턴, controlled state hook (`useControllableState`)
- **TanStack Query**: queryOptions 패턴, infinite query cache 매니저

→ `useControllableChecked` (Radix `useControllableState` 컨셉), BottomSheet compound (Radix Compound + react-modal-sheet 통합), `useZodForm` (RHF + Zod resolver 어댑터) 같은 사내 추상화에 직접 적용.

---

## Education

### 대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

---

## Certification

- 정보처리기능사 | 한국산업인력공단 | 2023.04
