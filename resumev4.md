# 김진건

**Frontend Engineer** · jingeon27@gmail.com · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

---

## Summary

급하게 만들어진 MVP를 넘겨받아 운영 가능한 제품으로 다시 세워온 프론트엔드 개발자입니다. 2026년 1월부터 복지몰·CMS·병원 CRM 세 서비스의 프론트엔드를 단독 담당하고 있고, 받은 명세를 그대로 구현하기보다 제안된 설계의 약점을 먼저 검토합니다. 새 도구는 직접 만들기보다 검증된 도구를 골라 얇게 감싸 쓰고, 아직 필요하지 않은 구조는 미리 만들지 않습니다.

- 첫 구현이던 URL 토큰 전달의 로그 노출 위험을 확인해 form POST BFF로 다시 설계
- Amplitude로 가설을 검증해 다음 과제를 데이터로 도출 (리뷰 조회 사용자 예약 전환율 +15%p)
- 프로그램·예약·정산·쿠폰 같은 판매자/운영자 화면을 반복 패턴으로 정리

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 복지몰(B2C)·CMS·병원 CRM 프론트엔드를 단독 담당하고 있습니다. 예약까지만 있던 MVP를 운영·분석·병원 관리 기능까지 확장했습니다.

**직접 판단해서 바꾼 것들**

- 정산은 메인과 도메인이 달라 쿠키를 공유할 수 없었습니다. 첫 구현이던 URL 토큰 전달은 access log·Referer에 토큰이 남을 위험이 있어, form POST BFF로 바꾸고 CSP `form-action` 고정과 open redirect 방어를 적용했습니다. ([글](https://jingeon27.tistory.com/19))
- 서버에서 `dehydrate`한 캐시를 클라이언트가 props로만 받아 쓰다 보니 무효화해도 화면이 안 바뀌었습니다. `queryOptions` prefetch → `HydrationBoundary` → `useSuspenseQuery` 구독으로 바꿔 캐시와 화면을 한 소스로 묶었습니다.

**Program 관리 v2**

- CMS와 병원 CRM이 함께 쓰는 38필드 Program 폼을 다뤘습니다. 공통 원본·검수 요청·임시저장이 생명주기가 달라서 `common/inspection/draft`로 나누고, 필드명은 `createTypedForm`으로 타입 안전하게 좁히고, 서버↔폼 변환은 Transfer Layer로 분리했습니다. `Form.List`·`useWatch`·custom validator로 cascade validation을 적용했습니다. ([글](https://jingeon27.tistory.com/18))

**폼 정리**

- 예약·리뷰·상담 폼을 `RHF + Zod`로 정리하고 다단계 리뷰 작성은 `@use-funnel/core`로 구조화했습니다. props drilling으로 얽혀 있던 가족 동기화 컴포넌트가 520줄에서 55줄로 줄었고, 흩어진 if 검증은 `superRefine` 스키마로 옮겼습니다. ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))

**아키텍처**

- SafeDoc App 약 1,100파일을 6-layer FSD로 정리했습니다(entities 26 / features 21). 슬라이스가 30개를 넘으면 평평한 구조가 읽기 어려워져서, 도메인 라이프사이클 단계로 나누는 sub-domain 패턴을 따로 뒀습니다.
- 공통 부모 `layout.tsx`에서 program 상세를 prefetch하게 바꿔, 상세→상담으로 넘어갈 때 `/program/detail`을 두 번 호출하던 걸 한 번으로 줄였습니다.
- 인수 당시 CMS·병원 CRM 모노레포는 기능별 shared 패키지가 나뉘어 있었습니다. 공유 도메인을 entities/features 패키지로 새로 정의하고(이 시점 13개), import만 흩뜨리던 기능별 shared 5개를 FSD에 맞게 단일 `@safedoc/shared`로 통합해 9개로 정리했습니다.

**데이터로 검증 (Amplitude)**

- 복지몰 전반에 퍼널·행동 이벤트 약 240개를 설계했고, 시술상세 개편의 배포 전후를 이 계측으로 비교했습니다. 리뷰를 조회한 사용자의 예약 전환율이 미조회 사용자보다 15%p 높게 나타났으며, 이를 인과관계가 아닌 행동 간 상관관계로 해석했습니다.
- 신규 가입 UTM 유실은 프론트엔드에 `utm_source` 저장 코드를 먼저 넣었다가, 코드 문제가 아니라 Amplitude 속성 상태(`unexpected`)가 원인임을 확인해 열흘 만에 되돌리고 설정으로 해결했습니다.

**AI 워크플로우**

- `.claude` 스킬·커맨드를 직접 작성해 작업 시작부터 배포까지 이어지게 했고, worktree로 작업 두세 개를 병렬로 검토합니다.
- AI가 생성한 코드는 컨벤션과 빌드 결과를 기준으로 검토합니다. 빌드 오류를 `force-dynamic` 추가로 우회하지 않고 `'use client'` 누락을 수정했으며, create/update 겸용이라 수정 시에도 `router.push`가 실행되던 mutation 훅은 역할별로 분리했습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- ATS 크롤러가 사이트마다 중복 구현되던 구조를, NestJS의 모듈 경계·constructor injection을 참고해(프레임워크 자체는 과하다고 판단해 제거, DI 컨테이너 없이 factory로 조립) 사이트별 어댑터 구조로 재설계하고 팀에 공유했습니다. 새 사이트는 service·repository·helper 구현만으로 연동할 수 있게 했고, 점핏·잡플래닛·게임잡 3개 연동 이후로는 새 사이트를 붙일 때 정해진 인터페이스 구현만 남았습니다. 단위 테스트는 후행 과제로 남았습니다.
- 폼 dirty 추적·복원(`FormDirtyContext` + sessionStorage) 패턴을 네 흐름에 재사용했고, 다단계 입력은 `useFunnel`로 구조화했습니다. 이 패턴이 세이프닥 `useZodForm`의 원형입니다. DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 적용했습니다.

---

## Skills

검증된 라이브러리 내부를 읽고 그 위에 얇은 어댑터를 두는 방식을 선호합니다(`useZodForm`, BottomSheet compound, `infiniteSetData`). Server·Form·UI·전역 상태의 역할을 섞지 않고, 지금 필요한 범위를 단순하게 유지합니다.

- **TypeScript 5 / React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary`, `useSyncExternalStore` 어댑터, Zod 스키마 추론으로 폼 타입 동기화
- **Next.js App Router** — Middleware/BFF, 캐싱 모델(request memoization / Data Cache / dynamic 강등) 구분, RSC 경계
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod, AntD Form(대규모 복합 폼)
- **아키텍처/AI** — FSD 6-layer + sub-domain, Turborepo + pnpm 모노레포, Claude Code 기반 워크플로우 + 비판적 감독

REST/axios 기반이라 GraphQL/Relay·React Native는 아직 사용 경험이 없습니다. 대신 라이브러리를 내부까지 읽고 도입해 온 방식으로 새 스택을 빠르게 학습할 수 있습니다. 이런 방식으로 toss/slash `useFunnel`의 타입 오류를 고쳐 머지된 기여가 있습니다(2024.05, [PR #363](https://github.com/toss/slash/pull/363)).

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
