# 김진건

**Frontend Engineer** · jingeon27@gmail.com · 010-6865-8208 · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 - 2028.06) — 산업기능요원 지정업체 전직 가능

---

## Summary

2년차에 **3개 서비스(B2C 복지몰 · CMS · 병원 CRM)의 단독 Frontend Engineer**로 0→1 설계와 운영을 동시에 수행하는 엔지니어입니다. 검증된 라이브러리 위에 얇은 어댑터를 두는 방향을 선호하며, Rule of Three 이후에만 추상화를 도입해 과한 설계를 피합니다.

- **단독 책임 범위** — SafeDoc App 961 파일 5-layer FSD 정리 + 모노레포(Turborepo + pnpm) 구조 단독 재설계(entities/features 신설, 13→9개 패키지)
- **측정 가능한 임팩트** — 예약 폼 가족 동기화 520 → 55줄 / 가입~예약 14분 → 11분 / 신규 플랫폼 연동 3일 → 1일
- **데이터 기반 의사결정** — Amplitude 241개 이벤트 설계 후 시술상세 실험 분석으로 후속 과제 재설계, 리뷰 조회 사용자 전환율 +15%p 확인
- **아키텍처 패턴 자체 정립** — FSD sub-domain 패턴(`entities/settlement/{common, contract, deposit, ...}`), 2-tier FORM_NAME enum, Transfer Layer 패턴
- **AI 워크플로우 운영** — `.claude` 스킬 39개·커맨드 15개 자체 작성(usermall + 모노레포), jira-branch / drawer-refactoring / full-deploy 등 반복 작업 자동화, worktree 기반 2~3개 작업 병렬 진행
- **오픈소스 내부 reading** — React Hook Form / Toss Slash / TanStack Query 내부 구조 분석 후 사내 어댑터(`useZodForm`, BottomSheet compound, `infiniteSetData`) 설계

---

## Work Experience

### 세이프닥 (SafeDoc) | Frontend Engineer | 2025.05 - 현재

병원·의원 복지 할인 플랫폼. **SafeDoc App(B2C 복지몰)**, **CMS**, **병원 CRM** 3개 서비스의 단독 Frontend Engineer로 신규 기능 개발과 구조 개선을 함께 진행합니다.

합류 시점에 서비스는 병원 프로그램 탐색·예약 흐름 중심의 MVP였습니다. 이후 예약 이후 운영 기능, 분석 환경, 관리자 기능까지 확장하면서, 동시에 5-layer FSD 표준화·디자인 시스템·모노레포 인프라까지 단독으로 정리했습니다.

#### MVP → 운영 가능한 제품으로 확장

- 예약 이전 중심이던 MVP를 유저용 프로그램 상세, 관리자용 프로그램 검수, 검색 필터 고도화까지 확장해 운영 가능한 구조로 발전시켰습니다.
- 시술 이후 금액 변동(업셀링/다운셀링) 추적 공백을 보완하기 위해 기업 쿠폰과 정산 기능을 추가했고, 외부업체가 개발한 정산 영역은 계약 종료 후 FSD 전환·컴포넌트 분리·모달 패턴 공통화까지 정리했습니다.

#### 데이터 기반 의사결정 — Amplitude 241개 이벤트 + 시술상세 실험

- 마케팅팀이 도입한 Amplitude 환경 위에서 예약 전후 핵심 퍼널 이벤트를 설계·확장했습니다.
- 디자인팀 가설("정보 풍부 → 신뢰 → 전환율")로 시술상세 개편 후, **최종 예약 전환율은 유의미한 변화가 없었지만 가입~예약 소요시간 14분 → 11분 감소, 예약 페이지 진입 후 신청 전환은 개선**됨을 확인.
- 시술상세 진입 사용자 중 25%가 리뷰 조회(병원상세 8%), **리뷰 조회 사용자의 예약 전환율이 비조회 사용자보다 약 15%p 높다**는 점을 발견 → 프로그램 기준 리뷰 분리·CTA 재배치를 후속 과제로 도출.

#### 예약 Form 아키텍처 리팩토링 — 가족 동기화 520 → 55줄 ([글](https://jingeon27.tistory.com/11))

- `useState` 30개 + props drilling + `useEffect` 5~6개로 얽혀 있던 가족 동기화를 `React Hook Form + Zod + @use-funnel/core` 조합으로 정리.
- **가족 데이터 동기화 로직(ReservationPersonSelector) 520줄 → 55줄 (89% 감소)**. cross-field 검증을 if 분기에서 `superRefine` 선언형 schema로 이전.
- 이 패턴을 리뷰 작성 / 상담 신청 / 회원정보 수정에 재사용.

#### 리뷰 작성 플로우 — 0→1 신규 도메인 설계 (1,290 LOC) ([글](https://jingeon27.tistory.com/15))

- 4단계 funnel + step별 Zod schema + 통합 schema 설계. 가족 정보는 prefetch 후 form 주입.
- 이후 상담 / 견적 요청 플로우의 레퍼런스 구현으로 활용.

#### `@core` 디자인 시스템 — 20개 Primitive Component 표준화

- Radix UI / Headless UI 기반으로 `Button` `Input` `BottomSheet` `Dialog` `Toast` `Tooltip` `Callout` `Checkbox` `Radio` `Toggle` `Tabs` `Chip` `Menu` 등 20개 표준화.
- `tailwind-variants`로 size / intent / state 3축을 표준화해 inline `className` override 안티패턴 제거.
- BottomSheet Compound(`Root/Header/Content/Footer`) + `react-modal-sheet` + `overlay-kit` 통합으로 **route change / popstate / backdrop pointer-events / setTimeout cleanup** 4가지 모바일 엣지 케이스를 라이프사이클 레이어 한 곳에서 처리.

#### SafeDoc App 프론트 아키텍처 정리 — 961 파일 5-layer FSD 표준화

- FSD + Atomic Design 잔재가 섞여 있던 구조를 `app / pages / widgets / features / entities / shared` 5-layer로 표준화. **25 entities / 20 features 슬라이스**의 경계와 Public API 기준을 정립.
- widgets → features 이관, 순환 의존 해소, 파일명 kebab-case 정리를 점진적으로 진행.
- TanStack Query v5 `queryOptions` 패턴과 **Server Component prefetch → HydrationBoundary → `useSuspenseQuery`** 흐름 정리. infinite query는 `infiniteSetData` 헬퍼로 nested page 안의 개별 아이템을 업데이트할 수 있게 함.
- **공통 부모 `layout.tsx` 단계에서 program 상세를 prefetch**하도록 구조 변경 → 프로그램 상세 페이지와 상담 페이지가 각각 별도로 호출하던 `/program/detail` API를 request-scoped 캐시 안에서 재사용, 하위 page 전환 시 server-level 중복 fetch 제거.
- `profile` route를 `(affiliation)` 그룹으로 재배치하고 page 단위 hydration/server fetch를 client query로 위임 → **page.tsx 평균 -25줄 / 서버 호출 4건 → 0건**.

#### FSD sub-domain 패턴 자체 정립

- 단일 슬라이스 파일이 30개 이상 누적되면 평평한 구조가 가독성을 해친다고 판단해 **`entities/settlement/{common, contract, deposit, disapproval, omission}` 도메인 라이프사이클 단계별 분할** 도입.
- sub-feature 패턴(`features/program/ui/{detail, modal}`)으로 UI 블록 의존성을 폴더 트리에서 가시화.
- **한계 인지**: 30+ 누적 후에야 도입 → 마이그레이션 비용 증가. 15개 시점에 도입 기준이 있었다면 비용 절반.

#### CMS · 병원 CRM 모노레포 구조 단독 재설계 — entities/features 신설 + shared 통합 (13→9)

- 초기 패키지 구조(기능별 shared 5분할 등)는 이전 개발자들 설계였고, 인수 이후 구조 설계는 단독 — 도메인 공유 패키지(entities/features) 신설(13개), shared 5개의 import 분산 비용을 진단해 단일 `@safedoc/shared`로 통합 **9개로 재편**. workspace protocol과 pnpm catalog로 공통 의존성 관리.
- `@safedoc/ui` 패키지 빌드를 `prebuilt(tsup)` → **`no-build bundled`** 로 전환 → 패키지 ↔ 앱 변경이 즉시 HMR 반영.
- Turborepo + GitHub Actions **5 workflows**(prod/stage/dev deploy + lint + slack-alarm) + `dorny/paths-filter` 기반 변경 감지로 CMS / Hospital 선택 배포 구성.

#### Program 도메인 폼 설계 — sub-domain + Transfer Layer

- CMS / 병원 CRM이 공유하는 도메인을 `program/{common, inspection}`으로 나누고, AntD Form 기반으로 설계.
- **2-tier `FORM_NAME` enum**으로 `@safedoc/types` 공통 enum과 CMS 전용 enum이 같은 값을 재참조하게 만들어 공통 필드 변경을 양쪽에 자동 동기화.
- **Transfer Layer** (`programDetailToClientProgramForm` / `clientProgramFormToCreateRequest`) 로 서버 ↔ 폼 변환 로직을 격리. Dayjs / UploadFile / 템플릿 데이터 양방향 변환.
- `Form.List` + `useWatch` cascade validation으로 시술 전후 이미지 페어 검증, 비동기 이미지 업로드는 `customRequest` + validator가 응답 객체(`response.src`) 존재 여부로 판단.
- 검수 플로우는 단일 폼 인스턴스 + 상태 머신(`PROGRAM_INSPECTION_STATUS`: `Request → Waiting → Confirm | Reject`) + Callout 배지 조합으로 단순화.
- Admin 안정화 후 `@safedoc/features`로 추출해 CMS / 병원 CRM이 함께 쓰도록 확장.

#### 정산 도메인 재설계 + 운영

- **Next.js Middleware + Route Group `(altLayout)/settlement`** 로 별도 호스트를 분리하면서 단일 코드베이스 유지. 동시에 legacy `fetch/apis` 구조를 FSD `entities/features` 구조로 마이그레이션.
- 정산 `entities`를 `common / omission / disapproval / deposit / contract` sub-domain으로 분할, `features/settlement`는 URL 기준 `dashboard / monthly / program / contract` 구조로 재편.
- **Optimistic Update 표준화** — `queryClient.setQueriesData`로 즉시 반영하고 실패 시 catch 블록에서 자동 롤백 → 정산내역 / 숨김처리 비교 두 탭이 함께 갱신.
- 레거시 `forwardRef` 모달을 `overlay-kit` 패턴으로 전환. `settlement/program`과 `settlement/monthly` 대표 모달을 먼저 리팩토링한 뒤, 그 컨텍스트를 Claude Code에 넘겨 **9개 CMS 도메인 + hospital-admin 앱까지 단일 사이클에 useModalStore 의존 제거**.

#### AI Workflow — Claude skills 기반 개발 자동화

- `.claude` 설정과 스킬 39개·커맨드 15개를 자체 작성해 **FSD 경계, Public API 기준, 모달 제작 패턴, 정산 도메인 리팩토링 방식**을 문서화. architecture 문서·error-handling 정책·레이어별 CLAUDE.md로 경계 규율을 박제해 반복 작업의 문맥 비용 감소.
- `jira-branch` 명령으로 JIRA 티켓과 브랜치 맥락을 읽고 계획 → 구현 → 커밋 → PR 생성까지 자동화.
- PR 전에 AI agent 코드리뷰를 먼저 수행해 critical한 경계 위반·네이밍·Public API 누락을 사전 점검.
- **worktree로 2~3개 작업 병렬 진행**. `/full-deploy` 커맨드로 commit → push → PR → merge → stage-deploy를 단일 명령으로 실행.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 - 2024.11

캘린더 기반 일정 조율 + ATS SaaS의 ATS 서비스 round에서 신규 기능 개발과 유지보수 담당.

#### Electron Desktop 크롤러 아키텍처 재설계 — MVC + DI + Factory Pattern

- 채용 플랫폼(점핏 / 잡플래닛 / 게임잡)마다 별도 구현체로 흩어져 있던 공통 흐름(로그인 → 검색 → 수집 → 업로드)을 `CandidateServiceHelper` 컨트롤러 + `PlatformAdapter` 인터페이스 + `PlatformAdapterFactory`로 재설계.
- **신규 플랫폼 연동 기간 3일 → 1일 (66% 감소)**. 3개 플랫폼 도입 후 직접 측정.
- **한계 인지**: DI 구조는 갖췄지만 단위 테스트는 시간 부족으로 후행. DOM 셀렉터 변경 헬스체크/알람까지 만들었다면 운영 비용 더 감소.

#### 면접 템플릿 / 온보딩 — 4단계 funnel 패턴

- `useFunnel`(단계 전환) + `usePromiseSessionStorage`(sessionStorage 자동 백업, 새로고침/탭 닫힘 후 복원) + `FormDirtyContext`(`beforeunload` + 라우터 confirm) 통합.
- 면접 템플릿 / 온보딩 / 자동화 규칙 / 평가 템플릿 4가지 흐름에 재사용. **이후 SafeDoc `useZodForm` 패턴의 yup 버전 원형**.

#### 메일 / 알림 템플릿 — WYSIWYG + 변수 시스템

- `@whattime/quill` 기반 WYSIWYG + 템플릿 변수 placeholder 치환(`{{candidateName}}`) 구현. quill blot 시스템으로 변수를 atomic node로 처리.

#### Server State 표준화

- `@lukemorales/query-key-factory`로 candidate / recruit / member / interviewAlarm 도메인의 query key 표준화 → 무효화 누락 / key drift 감소.

#### 그 외

- DnD 공고 정렬 (`@dnd-kit` + optimistic update + 자동 롤백)
- roundhr.com 랜딩 (Next.js + Notion CMS + `react-notion-x` + Strapi)

---

## Technical Skills

### 시그니처

- 검증된 라이브러리 위에 **얇은 어댑터**를 두는 방향을 선호합니다 — 하드코딩으로 로직을 직접 쌓는 비용과 단위 테스트 부담을 함께 줄이려는 의도입니다.
- **Rule of Three** 이후에만 추상화를 도입하고, 신규 기능 PR 안에서 해당 영역만 점진적으로 정리합니다.
- Server / Form / UI 전역 / 로컬 상태의 역할을 분리해 한 도구에 과도하게 책임을 몰지 않습니다.
- FP 스타일과 `es-toolkit`, `ts-pattern`을 활용해 선언적으로 표현하되 과한 추상화는 지양합니다.
- 리스트 virtual scroll, 검색·필터 구조 개선, 모달 패턴 공통화처럼 **제품 성능과 운영 경험을 함께 개선**하는 제안을 지속해 왔습니다.
- UI 일관성, 사용자 인지 방식, 기존 패턴과의 정합성을 근거로 디자이너·기획자와 소통합니다.

### React 18 / 19

- Compound Pattern + Custom Hook 추상화로 디자인 시스템 / 폼 도메인 직접 설계.
- `useSuspenseQuery` + `getQueryClient` + `HydrationBoundary` SSR 데이터 페칭 표준화.
- BottomSheet Compound + `overlay-kit` 라이프사이클 명시화로 4가지 모바일 엣지 케이스 처리.

### TypeScript 5

- Variadic tuple 단계별 폼 타입 합성, recursive type nested key path 추론, mapped type + key remapping 도메인 타입 자동 생성.
- Zod schema 추론 제네릭(`z.infer<ZodObject<T>>`) → schema 변경 시 form 타입 자동 동기화.
- Discriminated Union 도메인 적용 (콜인 / 워크인 동의서 폼 타입 분리).
- `satisfies` + `as const` 도메인 상수 객체 좁은 추론.

### Next.js 15 App Router

- **Middleware**: `/settlement/*` 별도 호스트 분리, form POST BFF 기반 토큰 위임으로 전환(URL 토큰의 Referer / 로그 노출 제거, open redirect 방어) ([글](https://jingeon27.tistory.com/19)).
- **Route Group**: `(altLayout)/settlement` 별도 레이아웃 + 단일 코드베이스. `profile/(affiliation)` 그룹으로 layout-level prefetch 끌어올리기.
- **Streaming SSR + Suspense**: boundary 단위 chunk 분할.
- **Caching**: `cookies()` / `searchParams` dynamic 트리거, fetch caching 옵션(`force-cache` / `no-store` / `revalidate` / `tags`) 도메인별 적용. `revalidatePath` vs `revalidateTag` 무효화 전략 구분.
- **RSC**: Server → Client props 직렬화 제약(함수 / class instance / Symbol 불가) 이해 기반 컴포넌트 경계 설계.

### Architecture

- **FSD 5-layer + sub-domain 자체 정립**: 961 파일 코드베이스 표준화. sub-domain은 FSD 공식이 아닌 자체 패턴 — 슬라이스 파일 수 + 변경 빈도 기준으로 도입 시점 판단.
- **Monorepo (Turborepo + pnpm)**: 인수 이후 구조 단독 재설계(13→9 패키지, entities/features 신설). 5 workflows + `dorny/paths-filter` 변경 감지 기반 선택 배포.
- **MVC + DI + Factory Pattern**: Electron 크롤러 재설계 (왓타임).
- **Compound / Composition Pattern**: BottomSheet, Tabs, Form 핵심 UI 도메인 적용.

### Form & Validation

- **React Hook Form + Zod**: `useZodForm` 어댑터(schema → form 타입 자동 동기화), step별 schema 분리 + 통합 schema, `superRefine` cross-field validation.
- **Ant Design Form**: `Form.List` + `shouldUpdate` + `useWatch` cascade validation, `Form.Item` custom trigger, 비동기 이미지 업로드 + `customRequest` + validator 응답 객체 존재 여부 판단.

### State & Data Fetching

- **TanStack Query v5**: `queryOptions` 패턴으로 useQuery / useSuspenseQuery / prefetchQuery / getQueryData 통합. infinite query + intersection observer 무한 스크롤. `queryClient.setQueriesData` 기반 Optimistic Update + 자동 롤백.
- **Zustand**: UI 전역 상태 한정. SafeDoc 사이클 중 `useModalStore` 글로벌 의존을 `overlay-kit` 기반 imperative API로 전환해 9개 도메인에서 제거.

### UI & Styling

- **tailwind-variants**: size / intent / state 3축 디자인 토큰 스키마.
- **Radix UI / Headless UI**: Compound Pattern, asChild + Slot, Primitive.
- **overlay-kit**: BottomSheet / Dialog 호출 라이프사이클 명시화.
- **Framer Motion**: AnimatePresence + motion 페이지 / 단계 전환.

### AI Workflow

- **Claude 스킬 39개·커맨드 15개 자체 작성** — FSD 경계, Public API 기준, 모달 제작 패턴, 정산 리팩토링 방식, drawer-refactoring 등 반복 작업 문맥을 파일로 박제.
- `jira-branch`로 티켓 → 브랜치 → 계획 → 구현 → PR 자동화. `/full-deploy`로 commit → push → PR → merge → stage-deploy 단일 명령 실행.
- PR 전 AI agent 코드리뷰로 경계 위반·Public API 누락·네이밍 사전 점검.
- worktree 기반 2~3개 작업 병렬 진행.

### Open Source Reading

검증된 라이브러리 내부를 읽고 사내 추상화 설계에 반영했습니다.

- **React Hook Form**: `useForm` proxy 기반 selective re-render → `useZodForm` 어댑터 설계 참고.
- **Toss Slash** (`@use-funnel/core`, `overlay-kit`): funnel history snapshot + overlay 라이프사이클 → 사내 funnel wrapper / BottomSheet compound 설계 참고.
- **TanStack Query**: `queryOptions` 패턴 + infinite query cache 구조 → 사내 query key 표준 + `infiniteSetData` 헬퍼 설계 참고.

---

## Education

**대덕소프트웨어마이스터고등학교** | 소프트웨어 개발과 | 2021.03 - 2024.01

---

## Certification

- 정보처리기능사 | 한국산업인력공단 | 2023.04
