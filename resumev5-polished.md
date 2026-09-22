# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

**병역사항** · 현역 산업기능요원 복무 중

---

## Summary

기능 개발뿐 아니라 프론트엔드 코드베이스의 빌드·테스트·아키텍처를 지속적으로 개선해 온 엔지니어입니다. B2B2C WebView 서비스와 글로벌 서비스, 운영 앱 3개의 프론트엔드 전반을 단독으로 담당하고 있습니다. 사용자 탐색·예약부터 프로그램·결제·쿠폰·정산과 운영 도구, 빌드·배포 품질까지 책임지며, 문제가 발생하면 원인을 추적해 테스트·lint·자동화로 재발을 방지합니다.

- B2B2C 앱 빌드 시간 **4분 → 1분**, 타입 검사 시간 **12.5초 → 1.9초** 단축
- Next.js 14→16, Node.js 20→24, ESLint 8→9, Webpack→Turbopack 마이그레이션 전담 및 TypeScript 7 네이티브 체커 도입
- Unit·Integration·E2E의 책임을 나누고 Mock·실서버 계약 검증을 결합한 테스트 아키텍처를 설계해 CI에 적용
- pnpm·Turborepo 기반 **3개 앱·13개 워크스페이스 패키지**의 경계를 설계하고 운영
- 3개 운영 앱의 API 응답을 Zod로 검증하고 페이지·화면 구획별 오류 격리와 재시도를 지원하는 에러 처리 체계 구축
- 레이어 규칙을 검사하는 ESLint 플러그인과 Jira→worktree→검증→PR 자동화 도구 개발

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

회원 약 15만 명 규모의 병원 복지 플랫폼에서 B2B2C 웹(모바일 브라우저·앱 내 WebView), 글로벌 사용자 서비스, 운영 백오피스, 병원 어드민, 글로벌 CMS를 개발하고 운영합니다. 2026년 1월부터 기존 세 제품의 프론트엔드를 단독으로 담당했으며, 글로벌 서비스 2개를 추가로 출시한 뒤 현재 다섯 제품의 기능·아키텍처·테스트·배포 품질 전반을 책임지고 있습니다.

#### 빌드·번들·프레임워크

- Next.js 14→16, Node.js 20→24, ESLint 8→9 flat config, Webpack→Turbopack 전환을 단계적으로 진행했습니다. 주요 변경 사항과 더 이상 사용하지 않는 설정을 정리해 B2C 앱의 빌드 시간을 **약 4분에서 1분으로 75% 단축**했습니다.
- JavaScript Compiler API를 지원하지 않는 TypeScript 네이티브 체커를 타입 검사 전용으로 병행했습니다. 기존 TypeScript 컴파일러는 ESLint·Next.js 도구와의 호환성을 위해 유지하면서 로컬 타입 검사 시간을 **12.5초에서 1.9초로 단축**했습니다.
- 테스트용 Mock DB가 Public API를 거쳐 프로덕션 번들에 포함된 문제를 bundle analyzer로 확인했습니다. 런타임 코드와 테스트 지원 코드의 import 경계를 분리하고 Public API export를 제거해 글로벌 앱 번들을 **2,564KB에서 1,880KB로 축소**했습니다. 이후 FSD ESLint 규칙과 프로덕션 번들 검사를 추가해 같은 문제가 재발하지 않도록 했습니다.

#### 장애 분석과 재발 방지

- 3개 운영 앱의 250개 파일에 걸쳐 API 응답을 Zod schema로 검증하도록 개선했습니다. 서버 응답과 프론트 타입이 어긋나면 필드 경로와 원인을 CloudWatch에 기록하되 기존 화면 흐름은 유지하고, 같은 불일치는 세션당 한 번만 전송해 로그가 중복되지 않도록 했습니다.
- 전체 화면과 목록·상세·차트 같은 화면 구획에 서로 다른 Query Error Boundary를 적용했습니다. 한 API가 실패해도 나머지 화면은 계속 사용할 수 있으며, 상태 코드별 안내와 재시도·뒤로가기·새로고침을 제공하고 화면 경로·경계·컴포넌트 정보를 로그에 남기도록 에러 처리 방식을 통일했습니다.
- Next.js 16.3 업그레이드 후 정산 도메인에서 발생한 CORS 장애를 Network panel과 Next.js Issue·PR까지 추적했습니다. `/_next` 번들 요청이 정산 proxy를 거쳐 원본 도메인으로 redirect된 것이 직접적인 원인이었으며, 정적 경로를 matcher에서 제외해 해결했습니다. 다른 콘텐츠에 미칠 운영 위험을 고려해 업스트림 수정 전까지는 16.2로 되돌렸습니다.
- 한 화면에 있는 두 입금 테이블이 URL page key를 공유하고, 펼친 서버 응답을 Ant Design Table이 다시 slicing하면서 행이 사라지는 장애를 분석했습니다. 테이블별 page key를 분리하고 공통 테이블이 서버·클라이언트 pagination 방식을 명시적으로 구분하도록 수정했습니다.
- 정산 도메인 인증 과정에서 URL로 토큰을 전달하던 구현이 access log와 Referer에 인증 정보를 남길 수 있음을 발견했습니다. form POST BFF 방식으로 재설계하고 CSP `form-action`, open redirect 방어, 회귀 테스트를 적용했습니다. ([기술 글](https://jingeon27.tistory.com/19))

#### 테스트와 CI/CD

- 테스트를 순수 함수·스키마 → API 계약 → UI 통합 → 브라우저 E2E 단계로 구분합니다. 폼 데이터는 MSW에 저장한 뒤 API로 다시 조회해 검증하고, soft navigation·SSR·가상화처럼 브라우저와의 결합이 필요한 동작만 E2E에서 다룹니다.
- E2E 테스트 10개의 콜드 실행에 3.5분이 걸리고 간헐적으로 실패하던 문제를 잘못된 navigation 대기 조건과 반복 삽입되는 프로모션 overlay 문제로 나누어 해결했습니다. 실행 시간을 **20초로 단축**했으며, 3회 연속 실행에서 flaky test가 발생하지 않도록 안정화했습니다.
- Mock이 실제 서버의 필수값·enum 계약 위반을 가리던 문제를 계기로, 실제 인증 정보와 API를 사용해 등록 payload를 검증하는 테스트를 분리했습니다. 서버의 거절 코드와 필드별 위반 사항을 그대로 노출하고, 확인한 제약 조건을 Mock과 Zod schema에 다시 반영했습니다.
- lint·typecheck·test와 dev·stage·production 배포, 실패 알림을 담당하는 GitHub Actions 워크플로를 운영합니다. 패키지별 Vitest 동시 실행 과정에서 발생한 CPU 경합은 worker 상한을 설정해 해결했습니다.

#### 아키텍처와 개발 도구

- pnpm·Turborepo 기반 모노레포에서 CMS·병원 CRM·글로벌 CMS 3개 앱과 13개 워크스페이스 패키지를 운영합니다. 예약·시술·결제·쿠폰처럼 여러 앱에서 계약이 안정된 도메인 모델·API·공통 UI만 `entities`·`features` 패키지로 공유하고, 앱마다 다른 제출 흐름과 화면 조합은 각 앱에 남겨 불필요한 결합을 막았습니다.
- 합류 당시 `@legacy`에 남아 있던 250개 파일을 26일 동안 도메인·레이어 기준으로 재분류했습니다. 레이어별 책임과 Public API 기준을 문서화하고, 역방향 의존성을 막는 ESLint 플러그인을 외부 의존성 없이 직접 개발해 위반 사항을 CI에서 검출합니다.
- Jira 조회, branch·worktree 생성, baseline 비교, 검증 명령 실행, PR 작성 등 반복되는 절차를 에이전트 기반 작업 흐름으로 자동화했습니다. 생성된 코드는 동일한 lint·typecheck·test·bundle gate를 통과하며, 설계와 예외 처리는 직접 검토합니다.

#### 글로벌 서비스와 CMS 0→1 · 2026.07

- 기존 세 제품의 운영을 병행하면서 Vite 프로토타입을 Next.js 16·strict TypeScript 기반의 글로벌 서비스로 제품화하고, 병원·시술·콘텐츠 운영 CMS까지 **3주 만에 출시**했습니다.
- 영어·한국어·아랍어와 RTL을 지원하고, 200건을 한 번에 조회하던 방식을 20건 단위 무한 스크롤과 행 단위 가상화로 개선했습니다. 화면 폭을 측정하기 전에는 첫 페이지를 그대로 렌더링해 SSR HTML과 hydration 결과가 일치하도록 했습니다.

#### 서비스 전반과 핵심 운영 도메인

- 병원·프로그램 탐색과 상세, 상담·예약, 리뷰, 쿠폰, 결제 내역, 검수·정산까지 이어지는 사용자·운영자 흐름과 관련 운영 도구의 프론트엔드 전반을 단독으로 담당했습니다.
- 프로그램 등록·수정·검수부터 결제 내역, 쿠폰 발급·사용·취소, 월별 입금·불인정·정산까지 연결해 사용자 화면과 운영 백오피스·병원 어드민에서 동일한 상태가 이어지도록 구현했습니다.
- 프로그램 결제 내역 폼에서 현장 결제·취소·쿠폰을 함께 처리하도록 구현했습니다. 결제 예정 금액이 바뀌면 기존 쿠폰이 잘못 적용되지 않도록 쿠폰을 다시 선택하게 하고 최종 결제 금액을 재계산했습니다. 화면 표시와 취소 여부를 판단하는 코드는 도메인 helper와 `ts-pattern` 분기에 모았습니다.
- 예약 기능만 제공하던 MVP를 시술 상세·리뷰·상담·쿠폰·결제·정산·검수까지 확장하고, 사용자 화면과 운영 백오피스·병원 어드민의 흐름을 연결했습니다.

#### 검색·SEO와 제품 분석

- 병원·프로그램·공지·콘텐츠 URL을 5개 공개 API에서 수집하는 동적 sitemap을 구현했습니다. 공개 API가 인증용 `cookies()`에 의존해 캐시되지 않던 구조를 분리하고, Next.js `'use cache'`와 `cacheLife('days')`를 적용해 sitemap을 24시간 단위로 재생성하도록 구성했습니다. ([기술 글](https://jingeon27.tistory.com/21))
- 제품 분석 이벤트 약 250개 중 140개 이상을 구현했습니다. 신규 가입 과정에서 UTM이 유실되던 문제는 프론트엔드에 저장 코드를 먼저 넣었다가 Amplitude 속성 상태가 원인임을 stage 환경에서 검증해 열흘 만에 되돌리고 **설정으로 해결**했습니다.

### 왓타임 | Frontend Engineer | 2024.01 – 2024.11

일정 조율 서비스 ‘되는시간’과 ATS ‘RoundHR’의 pnpm 모노레포에서 채용 관리 웹과 후보자 수집용 Electron 앱을 개발했습니다.

- 사이트마다 중복으로 구현되어 있던 크롤러를 공통 서비스와 사이트별 Adapter 구조로 재설계하고, 기존 3개 사이트와 신규 3개 사이트를 하나의 파이프라인으로 통합했습니다. 지원자 한 명에게 발생한 오류가 전체 수집을 중단하지 않도록 실패를 격리했습니다.
- `useFunnel`을 검토하던 중 발견한 타입 오류를 수정해 [toss/slash에 기여했으며, 해당 PR이 머지되었습니다](https://github.com/toss/slash/pull/363).

---

## Skills

- **Frontend** — TypeScript 7, React, Next.js App Router, HTML/CSS, WebView, Electron
- **Build & Architecture** — Turbopack, Webpack, Vite, pnpm, Turborepo, FSD, ESLint plugin
- **State & API** — TanStack Query, React Hook Form, Zod, Zustand, Ant Design Form, REST, BFF
- **Quality & Delivery** — Vitest, React Testing Library, MSW, Playwright, GitHub Actions
- **Workflow** — Jira, Claude Code, Codex, repository skills, worktree automation

---

## Writing

- [크로스 도메인 인증을 URL 토큰에서 form POST BFF로](https://jingeon27.tistory.com/19)
- [Next.js `'use cache'`로 대규모 sitemap 생성 비용 줄이기](https://jingeon27.tistory.com/21)
- [예약 폼 리팩토링 — 가족 정보 동기화 520줄을 55줄로](https://jingeon27.tistory.com/11)

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 | 2021.03 – 2024.01
- 정보처리기능사 | 한국산업인력공단 | 2023.04
