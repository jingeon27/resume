# 김진건

**Frontend Engineer**  
jingeon27@gmail.com | 010-6865-8208 | [GitHub](https://github.com/jingeon27) | [Blog](https://jingeon27.tistory.com/)

---

## Summary

빠르게 만들어진 서비스에 합류해 기존 기술 부채와 구조적 문제를 정리하고, 신규 기능 개발과 구조 개선을 함께 진행해 온 프론트엔드 엔지니어입니다. 예약·상담·리뷰처럼 복잡한 사용자 플로우는 폼 아키텍처와 공통 UI 시스템으로 재구성했고, SafeDoc App에서는 800+ 파일 규모 코드베이스와 query pattern을, Admin·병원 CRM에서는 FSD custom, 모노레포, 복합 폼 구조를 정리해 제품이 계속 확장될 수 있는 기반을 만들었습니다. 현재는 세이프닥 복지몰·CMS·병원 CRM 3개 서비스의 단독 Frontend Engineer로 신규 기능 개발·운영·구조 개선 전반을 담당하고 있습니다.

- 빠르게 만들어진 3개 서비스(복지몰, CMS, 병원 CRM)에 합류한 뒤, 운영 가능한 구조로 재정비하며 신규 기능 개발과 구조 개선을 병행
- 예약 페이지 1,400줄 → 700줄, 가족 데이터 동기화 550줄 → 55줄로 축소하며 폼 아키텍처 재설계
- `@core` 디자인 시스템, `useFunnel`, `useZodForm`, queryOptions 패턴을 설계해 반복 구현을 공통 패턴으로 전환
- SafeDoc App의 800+ 파일 규모 코드베이스와 Admin·병원 CRM의 FSD custom·모노레포 패키지 구조를 정리해 코드베이스 경계를 표준화
- Amplitude 237개 이벤트와 퍼널 분석으로 제품 역효과를 진단하고 실제 사용자 흐름 개선
- Electron 크롤러를 MVC + DI + Factory Pattern으로 재설계해 코드 중복 70% 감소, 신규 플랫폼 연동 기간 3일 → 1일 단축

- 산업기능요원 현역 복무 중 (2025.08 - 2028.06)

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼에서 **SafeDoc App(복지몰)**, **CMS**, **병원 CRM** 프론트엔드 개발과 구조 개선을 담당했습니다.  
빠르게 만들어져 운영 부담이 높았던 제품에 합류해 기존 기술 부채와 구조적 문제를 정리했고, 현재는 3개 서비스의 단독 Frontend Engineer로 제품 전반의 신규 기능 개발·운영·구조 개선을 맡고 있습니다.

- **복지몰 `@core` 디자인 시스템 설계·구현**
  - 포트폴리오: [Safedoc App](https://portpolio-ivory.vercel.app/?company=safedoc#usermall), [공통](https://portpolio-ivory.vercel.app/?company=safedoc#shared)
  - `Button`, `Input`, `BottomSheet`, `Dialog`, `Toast`, `Tooltip`, `Callout`, `Checkbox`, `Radio`, `Toggle`, `Tabs`, `Chip`, `Menu` 등 주요 Primitive Component를 공통화
  - Legacy UI를 `@core` 중심 구조로 전환하고 variant, size, state API를 표준화
  - BottomSheet를 Compound Component 구조로 재설계해 route change, popstate, backdrop cleanup, mount point 제어 등 모바일 UX 이슈를 공통 레이어에서 처리

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
  - Amplitude 237개 이벤트와 UTM/QR 유입 경로 추적 체계를 구축해 주요 퍼널의 행동 데이터를 수집
  - 시술상세 개편 배포 후 예약 클릭 -16%, 상담 클릭 -66%, 최종 예약 -40%의 역효과를 퍼널로 진단
  - 병원 상세에서 바로 예약/상담 가능한 CTA 구조로 재설계해 사용자 depth를 줄이는 방향으로 개선

- **SafeDoc App 프론트 아키텍처 정리**
  - 포트폴리오: [Safedoc App](https://portpolio-ivory.vercel.app/?company=safedoc#usermall), [공통](https://portpolio-ivory.vercel.app/?company=safedoc#shared)
  - FSD와 Atomic Design이 혼재된 800+ 파일 규모 코드베이스의 레이어 경계와 공통 패턴을 정리
  - TanStack Query v5, queryOptions, `prefetch + hydration + useSuspenseQuery` 패턴을 도입해 데이터 페칭과 캐시 전략을 표준화
  - Radix UI 기반 Primitive Component와 Compound Pattern을 설계해 디자인 시스템 기반 UI 구조를 정리

- **Admin · 병원 CRM FSD custom + 모노레포 패키지 구조 설계**
  - 포트폴리오: [공통](https://portpolio-ivory.vercel.app/?company=safedoc#shared), [주요 의사결정](https://portpolio-ivory.vercel.app/?company=safedoc#decisions)
  - CMS와 병원 CRM에 프로젝트 특성에 맞춘 FSD custom 구조를 적용하고, `shared`, `entities`, `features`, `apps`의 책임과 Public API 기준을 정리
  - CMS와 병원 CRM이 공유하는 `config`, `entities`, `features` 패키지를 구축
  - 패키지 빌드 방식을 `prebuilt`에서 `no-build bundled` 방식으로 전환해 앱-패키지 간 DX 개선
  - pnpm catalog 기반 공통 의존성 버전 관리와 CI/CD workflow를 구성

- **복합 폼 / 도메인 시스템 설계**
  - 포트폴리오: [Admin · 병원 CRM](https://portpolio-ivory.vercel.app/?company=safedoc#react)
  - CMS와 병원 CRM이 공유하는 10,000+ 라인 규모의 프로그램 등록·수정·검수 플로우를 `entities -> features -> apps` 구조로 분리
  - `Form.List`, `useWatch`, cascade validation 기반 동적 폼 구조를 설계하고, 이미지 validation/임시저장/검수 워크플로우를 구현
  - 시술/결제 이력 관리 시스템을 병원 CRM에 구축하고 Admin 구현 후 공통 기능으로 확장

- **정산 도메인 분리 및 FSD 전환**
  - 포트폴리오: [Admin · 병원 CRM](https://portpolio-ivory.vercel.app/?company=safedoc#react)
  - Next.js Middleware와 Route Group을 활용해 정산 도메인을 별도 호스트로 분리하면서도 단일 코드베이스 유지
  - 정산 도메인을 legacy `fetch/apis` 구조에서 FSD `entities/features` 구조로 마이그레이션
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

### Core

- React
- TypeScript
- Next.js
- SSR / ISR / Streaming

### Architecture

- FSD custom
- Feature-Sliced Design
- Atomic Pattern
- Factory Pattern
- Monorepo / Turborepo
- MVC + DI
- Compound Pattern / Composition Pattern

### State & Data Fetching

- TanStack Query
- Query Options Pattern
- Zustand
- React Hook Form
- Zod
- Yup

### UI & Styling

- Tailwind CSS
- Radix UI
- Ant Design
- Emotion

---

## Education

### 대덕소프트웨어마이스터고등학교 | 소프트웨어 개발과 | 2021.03 - 2024.01

---

## Certification

- 정보처리기능사 | 한국산업인력공단 | 2023.04
