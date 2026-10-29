# 김진건 · Design Engineer / Frontend Engineer

010-6865-8208 · jingeon27@gmail.com  
[GitHub](https://github.com/jingeon27) · [기술 블로그](https://blog.bambyul.com/ko/blog)  
**병역사항** · 현역 산업기능요원 복무 중

## Professional Summary

2년 이상 React·Next.js 기반 제품을 개발했으며, 2026년 1월부터 사내 유일 프론트엔드 엔지니어로 국내·글로벌 **5개 제품**을 책임지고 있습니다. UI 규칙을 컴포넌트·타입·접근성 테스트로 구현하고, 번들 크기를 **27%**, 타입 검사 시간을 **85%** 줄였습니다. Codex·Claude Code를 저장소 규칙과 CI/CD에 연결해 제품 개발과 품질 개선을 함께 자동화합니다.

### Key Achievements

- **UI 시스템 구축** · Radix UI와 `tailwind-variants` 기반 프리미티브 20여 개를 설계해 주요 사용자 흐름에 적용
- **접근성 표준화** · 오류 포커스, accessible name, 키보드 탐색과 오류 알림을 테스트 가능한 규칙으로 정립
- **글로벌 제품 출시** · 영어·한국어·아랍어, RTL, 반응형 레이아웃을 지원하는 사용자 서비스와 CMS를 0→1로 출시
- **개발 환경 최적화** · 타입 검사 12.5초 → 1.9초, E2E 3분 30초 → 20초 단축
- **번들 최적화** · 프로덕션에 유입된 Mock DB를 제거해 글로벌 앱 번들 2,564KB → 1,880KB 축소
- **AI 개발 자동화** · Jira 조회부터 worktree·검증·PR 생성까지 연결하고 Codex·Claude Code 결과물에 동일한 품질 기준 적용

### Key Skills

- **Design Engineering** · UI primitives, Design System, Accessibility, Responsive UI, RTL, i18n
- **Frontend** · React, Next.js, TypeScript 7, HTML, CSS, Tailwind CSS, Radix UI
- **Testing & CI/CD** · Vitest, Testing Library, Playwright E2E, MSW, GitHub Actions
- **Quality & Architecture** · Zod, ESLint, pnpm, Turborepo, Feature-Sliced Design, SSR
- **AI-assisted Development** · Codex, Claude Code, repository rules, skills, worktree automation

## Experience

### 세이프닥 · Frontend Engineer

**재직 기간** · 2025.05 – 현재

#### 프로젝트 1 · 국내 B2B2C 사용자 서비스 및 운영 앱

**기간** · 2026.01 – 현재  
**역할** · 사내 유일 프론트엔드 엔지니어 / 사용자 서비스·운영 백오피스·병원 어드민 3개 제품 운영

**주요 성과**

- **UI 시스템 구축** · Radix UI와 `tailwind-variants` 기반 프리미티브 20여 개를 설계해 예약·검색·리뷰·마이페이지에 적용했습니다.
- **접근성 표준화** · 오류 순서에 따른 포커스 이동, accessible name, `role="alert"`, Dialog·라이트박스 키보드 동작을 회귀 테스트로 고정했습니다.
- **오류 처리 재설계** · 앱 3개에 Zod 응답 검증, 페이지·섹션 단위 Error Boundary, CloudWatch 로그를 도입해 오류 위치와 스키마 불일치를 추적하도록 했습니다.
- **제품 판단을 데이터로 전환** · Amplitude 이벤트 140여 개를 도입하고 리뷰 열람 여부에 따른 예약 전환율 **15%p 차이**를 확인해 개선 근거로 공유했습니다.
- **직군 간 의사결정 조율** · Jira·Figma·API 명세의 차이와 선택지별 영향 범위를 정리해 PO·디자이너·백엔드·마케팅과 합의한 뒤 구현했습니다.

#### 프로젝트 2 · 글로벌 사용자 서비스 및 CMS 0→1

**기간** · 2026.07 · 3주  
**역할** · 단독 프론트엔드 엔지니어 / Vite 프로토타입 제품화 및 운영 CMS 신규 구축

**주요 성과**

- **글로벌 서비스 2종 출시** · 기존 3개 제품 운영을 병행하며 Next.js 16·strict TypeScript 기반 사용자 서비스와 CMS를 3주 만에 출시했습니다.
- **다국어 UI 체계 구축** · 영어·한국어·아랍어 라우팅과 RTL을 적용하고 필수 번역 누락을 컴파일 단계에서 검출하도록 설계했습니다.
- **번역 협업 과정 단순화** · 번역가의 작업 방식을 확인해 19개 번역 파일을 JSON 하나로 통합하고, API `translations[]`와 언어 탭 폼 사이의 변환 계층을 도입했습니다.
- **레이아웃·검색 노출 최적화** · 다국어 텍스트와 화면 크기에 대응하는 반응형 UI를 구축하고 `Accept-Language`·`hreflang`·sitemap을 동일한 언어 계약으로 연결했습니다.
- **번들 크기 27% 축소** · Public API를 통해 유입된 Mock DB를 분리해 프로덕션 번들을 **2,564KB에서 1,880KB**로 줄이고, 재유입은 import 제한 lint 규칙으로 막았습니다.

#### 프로젝트 3 · 프론트엔드 플랫폼 및 개발 자동화

**기간** · 2025.05 – 현재  
**역할** · 아키텍처·빌드·테스트·CI/CD 개선 주도

**주요 성과**

- **프레임워크 전환** · Next.js 14→16, Node.js 20→24, ESLint 8→9, Webpack→Turbopack 전환을 단계적으로 진행했습니다.
- **타입 검사 시간 85% 단축** · TypeScript 7 네이티브 체커를 타입 검사 전용으로 병행해 **12.5초에서 1.9초**로 줄였습니다.
- **모노레포 경계 설계** · pnpm·Turborepo로 앱 3개와 패키지 9개를 구성하고, 안정적인 공통 도메인만 공유해 앱 간 결합을 제한했습니다.
- **아키텍처 검증 자동화** · 250개 파일을 26일간 레이어 구조로 이전하고 의존 방향을 검사하는 ESLint 플러그인을 개발했습니다.
- **테스트 체계 정립** · Unit·Integration·E2E·실서버 계약 테스트를 CI/CD에 연결하고 E2E 10개 시나리오를 **3분 30초에서 20초**로 단축했습니다.
- **AI 작업 흐름 구축** · Codex·Claude Code에 저장소 규칙을 적용하고 Jira → worktree → 검증 → PR·배포 PR 생성 과정을 자동화했습니다.

### 왓타임 · Frontend Engineer

#### 프로젝트 · 예약 서비스 및 관리자 서비스

**기간** · 2024.01 – 2024.11  
**역할** · 프론트엔드 엔지니어 / 예약 흐름·운영 기능 개발

**주요 성과**

- **예약 폼 구조를 재설계** · 분기와 상태를 단계별 구성으로 분리해 핵심 컴포넌트를 520줄에서 55줄로 축소했습니다.
- **오류 복구 경험을 개선** · 사용자 흐름과 서버 상태를 분리하고, 실패 이후 사용자가 다음 행동을 선택할 수 있도록 오류 상태를 재구성했습니다.

## Open Source & Writing

- **Open Source** · Toss Slash `useFunnel` 타입 오류 수정 [PR #363](https://github.com/toss/slash/pull/363) 병합
- **Authentication** · [Cross-domain 인증: URL token을 form POST BFF 구조로 전환](https://blog.bambyul.com/ko/blog/정산-서비스를-별도-호스트로-분리하며-도메인-간-토큰-전달을-설계한-과정)
- **Next.js** · [`use cache` 환경에서 sitemap 구성](https://blog.bambyul.com/ko/blog/동적-사이트맵을-만들며-공개-api와-인증-api의-경계를-나눈-과정)
- **Refactoring** · [예약 폼 리팩터링: 520줄 컴포넌트를 55줄로 줄인 과정](https://blog.bambyul.com/ko/blog/예약-폼의-작성-상태를-zustand에서-react-hook-form으로-옮긴-과정)

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 · 2021.03 – 2024.01
- 정보처리기능사 · 2023.04
