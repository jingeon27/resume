# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

---

## Summary

기능 개발과 함께 프론트엔드 코드베이스의 빌드·테스트·아키텍처를 개선해 온 엔지니어입니다. B2B2C WebView 서비스와 두 운영 앱을 단독으로 운영하며, 문제가 생기면 임시 우회에 그치지 않고 원인을 추적해 테스트·lint·자동화로 재발을 막습니다.

- B2B2C 앱 빌드 시간 **4분 → 1분**, 타입 검사 **12.5초 → 1.9초** 단축
- production 번들에 유입된 Mock DB를 제거해 글로벌 앱 번들 **2,564KB → 1,880KB** 축소
- Next.js 14→16, Node 20→24, ESLint 8→9, Webpack→Turbopack 마이그레이션 주도
- Unit·Integration·E2E·실서버 계약 테스트의 역할을 나누고 CI에서 자동 검증
- 레이어 규칙을 검사하는 ESLint 플러그인과 Jira→worktree→검증→PR 자동화 도구 개발

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

회원 약 15만 명 규모의 병원 복지 플랫폼에서 B2C 웹(모바일 브라우저·앱 내 WebView), 운영 백오피스, 병원 어드민을 개발하고 운영합니다. 2026년 1월부터 세 제품의 프론트엔드를 단독 담당하며 코드베이스와 배포 품질을 함께 책임지고 있습니다.

#### 빌드·번들·프레임워크

- Next.js 14→16, Node 20→24, ESLint 8→9 flat config, Webpack→Turbopack 전환을 단계적으로 진행했습니다. breaking change와 미사용 설정을 정리해 B2C 앱 빌드를 **약 4분에서 1분으로 75% 단축**했습니다.
- JavaScript compiler API가 없는 TypeScript 네이티브 체커를 typecheck 전용으로 병행하고, 기존 TypeScript는 ESLint·Next.js 도구에 유지해 호환성을 지키면서 로컬 타입 검사를 **12.5초에서 1.9초**로 줄였습니다.
- 테스트용 Mock DB가 Public API를 거쳐 production 번들에 포함된 문제를 bundle analyzer로 확인했습니다. 런타임 코드와 테스트 지원 코드의 import 경계를 분리하고 Public API export를 제거해 글로벌 앱 번들을 **2,564KB에서 1,880KB로 축소**했습니다. 이후 FSD ESLint 규칙과 production bundle 검사로 같은 유입을 차단했습니다.

#### 장애 분석과 재발 방지

- Next.js 16.3 업그레이드 후 정산 도메인에서 발생한 CORS 장애를 Network panel과 Next.js Issue·PR까지 추적했습니다. `/_next` 번들 요청이 정산 proxy를 거쳐 원본 도메인으로 redirect된 것이 직접 원인이어서 정적 경로를 matcher에서 제외했습니다. 다른 콘텐츠의 운영 위험까지 고려해 업스트림 수정 전에는 16.2로 되돌렸습니다.
- 한 화면의 두 입금 테이블이 URL page key를 공유하고, 서버 응답을 펼친 뒤 Ant Design Table이 다시 slicing해 행이 사라지는 장애를 분석했습니다. page key를 분리하고 공통 테이블이 서버·클라이언트 pagination을 명시적으로 구분하게 수정했습니다.
- 정산 도메인 인증에서 URL로 토큰을 전달하던 구현이 access log와 Referer에 인증 정보를 남길 수 있음을 발견했습니다. form POST BFF로 재설계하고 CSP `form-action`, open redirect 방어와 회귀 테스트를 적용했습니다. ([기술 글](https://jingeon27.tistory.com/19))

#### 테스트와 CI/CD

- 테스트를 순수 함수·스키마 → API 계약 → UI 통합 → 브라우저 E2E로 구분합니다. 폼은 MSW에 저장한 뒤 API로 다시 조회해 결과를 검증하고, soft navigation·SSR·가상화처럼 브라우저 결합이 필요한 동작만 E2E에 둡니다.
- E2E 10개가 콜드 실행에서 3.5분 걸리고 간헐 실패하던 문제를 잘못된 navigation 대기 조건과 반복 삽입되는 프로모션 overlay로 분리해 **20초, 3회 연속 flaky 0**으로 안정화했습니다.
- Mock이 실제 서버의 필수값·enum 계약 위반을 가린 실패를 계기로, 실제 인증과 API로 등록 payload를 검증하는 테스트를 분리했습니다. 서버의 거절 코드와 필드별 위반을 그대로 노출하고 그 제약을 Mock·Zod schema에 되돌려 반영했습니다.
- lint·typecheck·test와 dev·stage·production 배포, 실패 알림을 담당하는 GitHub Actions 워크플로를 운영합니다. 패키지별 Vitest 동시 실행의 CPU 경합은 worker 상한으로 해결했습니다.

#### 아키텍처와 개발 도구

- 합류 당시 `@legacy`에 남아 있던 250개 파일을 26일 동안 도메인·레이어 기준으로 재분류했습니다. 레이어별 책임과 Public API 기준을 문서화하고, 역방향 의존을 막는 ESLint 플러그인을 외부 의존성 없이 직접 만들어 위반을 CI에서 검출합니다.
- Jira 조회, branch·worktree 생성, baseline 비교, 검증 명령, PR 작성 같은 반복 절차를 에이전트 작업 흐름으로 만들었습니다. 생성된 코드는 같은 lint·typecheck·test·bundle gate를 통과하며, 설계와 예외 처리는 직접 검토합니다.

#### 글로벌 서비스와 CMS 0→1 · 2026.07

- 기존 세 제품의 운영을 병행하며 Vite 프로토타입을 Next.js 16·strict TypeScript 기반 글로벌 서비스로 제품화하고, 병원·시술·콘텐츠 운영 CMS까지 **3주 만에 출시**했습니다.
- 영어·한국어·아랍어와 RTL을 지원하고, 200건 일괄 조회를 20건 단위 무한스크롤과 행 단위 가상화로 바꿨습니다. 폭 측정 전에는 첫 페이지를 그대로 렌더해 SSR HTML과 hydration 일치를 유지했습니다.

#### 제품 운영

- 예약까지만 있던 MVP를 시술상세·리뷰·상담·쿠폰·정산·검수까지 확장하고, 제품 분석 이벤트 약 250개 중 140개 이상을 구현했습니다. 신규 가입 UTM 유실은 Amplitude 속성 상태가 원인임을 stage에서 검증해 **코드 변경 없이 해결**했습니다.

### 왓타임 | Frontend Engineer | 2024.01 – 2024.11

일정 조율 서비스 ‘되는시간’과 ATS ‘RoundHR’의 pnpm 모노레포에서 채용 관리 웹과 후보자 수집 Electron 앱을 개발했습니다.

- 사이트마다 중복되던 크롤러를 공통 서비스와 사이트별 Adapter 구조로 재설계하고, 기존 3개 사이트와 신규 3개 사이트를 같은 파이프라인으로 통합했습니다. 지원자 한 명의 오류가 전체 수집을 중단하지 않도록 실패를 격리했습니다.
- `useFunnel`을 검토하며 발견한 타입 오류를 [toss/slash에 기여해 머지](https://github.com/toss/slash/pull/363)했습니다.

---

## Skills

- **Frontend** — TypeScript, React, Next.js App Router, HTML/CSS, WebView, Electron
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
