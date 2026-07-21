# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

---

## Summary

React·Next.js·TypeScript로 B2C 서비스와 운영 플랫폼을 개발해 온 프론트엔드 엔지니어입니다. 현재 병원 복지 할인 플랫폼에서 복지몰, CMS, 병원 CRM의 프론트엔드를 담당하며 사용자 탐색·예약부터 결제내역·쿠폰·정산과 운영 화면까지 개발하고 있습니다. 사용자에게 간단해 보이는 금융·거래 경험 뒤에서 인증, 금액, 상태와 권한이 정확하게 이어지도록 만드는 데 관심이 많습니다.

- 정산 도메인의 URL 토큰 노출 위험을 발견해 **form POST BFF**로 재설계하고 CSP, open redirect 방어, `no-store`, `303` 등 보안 경계 적용
- 결제수단별 union과 `ts-pattern` exhaustive 분기로 기존 렌더링을 거의 수정하지 않고 **쿠폰결제** 확장
- SafeDoc App을 **Next.js 16.2 + Turbopack** 프로덕션 빌드로 이행하고 RSC prefetch·hydration·캐시 구독 패턴 표준화
- 예약 폼의 가족 데이터 동기화 컴포넌트를 **520줄에서 55줄**로 축소하고 리뷰·상담·회원정보 흐름에 재사용
- Amplitude 이벤트 약 240개를 설계하고, 리뷰 조회 사용자의 예약 전환율이 미조회 사용자 대비 **15%p 높음**을 확인
- B2C 모바일 웹의 BottomSheet에서 뒤로가기, backdrop, snap point와 route change를 공통 라이프사이클로 처리

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원·의원 복지 할인 플랫폼의 **B2C 복지몰, 사내 CMS, 병원 CRM**을 개발·운영합니다. 2026년 1월부터 세 서비스의 프론트엔드를 담당하며 PO·디자이너·마케팅·백엔드와 제품 설계부터 출시, 운영 개선까지 진행하고 있습니다.

**정산·결제·쿠폰 도메인**

- 정산 서비스와 메인 서비스의 도메인이 달라 HttpOnly 쿠키를 공유할 수 없는 상황에서, URL query로 토큰을 전달하던 기존 방식의 access log·Referer 노출 위험을 발견했습니다. **form POST BFF**로 바꾸고 `referrer-policy: no-referrer`, CSP `form-action`, `X-Frame-Options: DENY`, HTML escape, `no-store`, `303`, pathname 정규화 기반 open redirect 방어를 적용했습니다. ([관련 글](https://jingeon27.tistory.com/19))
- Next.js Middleware와 Route Group으로 정산 호스트의 레이아웃·라우팅을 분리하되 코드베이스는 하나로 유지하고, 인증 핸드오프는 별도 API Route의 책임으로 분리했습니다.
- 정산내역 숨김 처리 시 관련 query cache를 즉시 갱신하고 실패하면 이전 상태로 되돌려, 정산내역과 비교 탭의 화면 상태를 함께 유지했습니다.
- 제휴실적관리 화면을 정산관리 대시보드로 새로 구축하고 날짜·검색·인계 상태 필터, 전체 예약 목록, 정산 제외, 성과금 표시 등 운영 기능을 확장했습니다.
- 시술 결제내역에 쿠폰결제를 추가할 때 결제건을 수단별 union 타입으로 나누고, 노출 여부·취소 상태·문구 판단을 `ts-pattern` exhaustive 분기에 모았습니다. 쿠폰 전용 값을 다른 결제수단에 퍼뜨리지 않아 기존 렌더링을 거의 수정하지 않고 확장했습니다.
- 쿠폰 템플릿의 목록·등록·복제 prefill·상태 일괄 변경과 사용자 보유 쿠폰 정렬·노출 흐름을 구현했습니다.

**React·Next.js 웹 플랫폼**

- SafeDoc App을 **Next.js 16.2 + Turbopack** 프로덕션 빌드로 이행하고 미사용 webpack 설정을 제거했습니다. 검색 필터의 `any/unknown`을 Zod schema로 교체하고 탭·모드 분기를 단일 enum과 `ts-pattern`으로 정리했습니다.
- `queryOptions → Server Component prefetch → HydrationBoundary → useSuspenseQuery` 패턴으로 서버와 클라이언트가 같은 query contract를 사용하게 했습니다. props로만 전달받아 무효화 후 갱신되지 않던 데이터를 query cache 직접 구독 방식으로 전환했습니다.
- 외국인 의료관광 서비스의 **Next.js 16 App Router** 프로젝트를 세팅하고, API 연동 전 단계에서 en·ko·ar 다국어 라우팅, 필수 문자열의 컴파일 타임 검증과 shadcn(base-ui) 기반 초기 UI를 구현하고 있습니다. 프로젝트 전반의 테스트 코드 적용을 위한 범위와 작성 기준도 준비하고 있습니다.
- 병원·프로그램·공지·혜택 데이터를 5개 API에서 수집하는 동적 sitemap을 구축하고 XML escape, allowlist와 24시간 cache life로 생성 비용을 제어했습니다. ([관련 글](https://jingeon27.tistory.com/21))
- 로그인·약관 리다이렉트의 이중 인코딩, 외부 URL, 자기참조를 막는 정규화 유틸을 만들고 소셜 로그인 callback의 redirect cookie 유실 문제를 해결했습니다.

**사용자 경험과 데이터 기반 개선**

- Radix UI와 `tailwind-variants`를 기반으로 Button, Input, BottomSheet, Dialog, Toast, Tooltip, Checkbox, Radio, Toggle, Tabs, Chip, Menu 등 **primitive 20개**를 설계하고 예약·검색·리뷰·마이페이지에 적용했습니다.
- BottomSheet를 Compound API로 구성해 브라우저 뒤로가기(`popstate`), route change, backdrop tap, snap point와 mount 해제를 공통 라이프사이클에서 처리했습니다.
- props drilling과 `useEffect` 4개로 얽혀 있던 예약 폼을 React Hook Form·Zod 중심으로 바꾸고, 가족 데이터 동기화 컴포넌트를 **520줄에서 55줄**로 줄였습니다. 같은 기준을 리뷰·상담·회원정보 폼에 적용했습니다. ([관련 글](https://jingeon27.tistory.com/11))
- 복지몰 전반에 예약·상담·검색 행동을 추적하는 Amplitude 이벤트 약 240개를 설계했습니다. 시술상세 개편 전후를 분석해 리뷰 조회 사용자의 예약 전환율이 미조회 사용자보다 **15%p 높음**을 확인했습니다.

**개발 생산성과 협업**

- Atomic Design과 FSD가 혼재한 약 **1,100개 파일**을 6-layer FSD로 점진 정리하고, 레이어 역방향 의존을 자체 ESLint 플러그인으로 검증했습니다.
- CMS·병원 CRM Turborepo에서 공통 도메인을 entities/features 패키지로 정의하고 shared 패키지 5개를 하나로 통합해 **13개 패키지를 9개로 재편**했습니다.
- CMS와 병원 CRM이 공유하는 38필드 프로그램 폼을 원본·검수·임시저장 생명주기로 분리하고, 잘못된 필드 경로를 컴파일 단계에서 차단하는 typed form과 서버↔폼 Transfer Layer를 구현했습니다. ([관련 글](https://jingeon27.tistory.com/18))
- GitHub Actions 기반 병원 CRM 배포 workflow와 pnpm 공통 의존성 관리를 구성하고, Jira·Figma·API·운영 맥락을 확인하며 PO·디자이너·백엔드와 변경 영향과 선택지를 공유했습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

캘린더 기반 일정 조율과 채용 ATS SaaS에서 사용자 기능과 운영 화면을 개발했습니다.

- 사이트마다 중복되던 Electron 크롤러를 controller·service·repository·helper로 분해하고 Registry + Adapter + Template Method 구조로 재설계했습니다. NestJS 도입은 Electron main process에 과하다고 판단해 5일 만에 제거하고 DI container 없이 factory로 조립했습니다.
- 점핏·잡플래닛·게임잡 연동, 2차 인증, 파일 업로드를 공통 프로세스 위에 구현했습니다. 14개 파일 기준 순 140줄을 줄였고, 신규 플랫폼 연동 기간은 측정치가 아닌 **체감상 약 3일에서 1일** 수준으로 줄었습니다.
- 지원자 한 명의 수집 실패가 전체 배치를 중단하지 않도록 오류를 격리하고 레이트리밋과 수집 상한을 적용했습니다.
- `@dnd-kit` 기반 채용 공고 정렬에 optimistic update와 rollback을 적용하고, React Hook Form·`useFieldArray` 기반 지원서 폼과 Quill 기반 메일 템플릿 편집기를 구현했습니다.
- Next.js와 Notion CMS, Strapi를 이용해 서비스 랜딩 페이지의 콘텐츠 운영 환경을 구성했습니다.

---

## Skills

- **Core** — TypeScript 5, JavaScript(ES6+), React 18/19, Next.js 15/16(App Router), HTML5, CSS3
- **React** — Hooks, Compound Component, `useSyncExternalStore`, Suspense, Server/Client Component boundary
- **State & Data** — TanStack Query v5, Zustand, React Hook Form, Zod, optimistic update / rollback
- **Rendering** — SSR, RSC, streaming, prefetch / hydration, cache lifecycle, dynamic sitemap
- **UI & Styling** — Tailwind CSS, `tailwind-variants`, Radix UI, Emotion(CSS-in-JS), Ant Design
- **Architecture & Delivery** — Turborepo, pnpm, FSD, BFF, GitHub Actions, Git, Jira
- **Product Analytics** — Amplitude event design, funnel analysis, UTM attribution

React Native와 Panda CSS의 실무 경험은 아직 없습니다. 모바일 웹과 인앱 웹뷰에서 history·viewport·overlay 생명주기를 다뤄왔고, React 기반 상태·컴포넌트 설계 경험을 바탕으로 플랫폼 차이를 학습할 수 있습니다.

---

## Open Source

- **toss/slash** — `useFunnel`의 `NonEmptyArray` 타입 오류 수정 ([PR #363](https://github.com/toss/slash/pull/363), merged)
- **TanStack/ai** — `useChat` 내부 `ChatClient` 인스턴스 안정성 개선 ([PR #864](https://github.com/TanStack/ai/pull/864), review)

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
