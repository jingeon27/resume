# 김진건

**Frontend Engineer** · jingeon27@gmail.com · 010-6865-8208 · [GitHub](https://github.com/jingeon27) · [Blog](https://jingeon27.tistory.com/)

산업기능요원 현역 복무 중 (2025.08 – 2028.06)

---

## Summary

상품과 운영 화면을 같이 다뤄온 프론트엔드 개발자입니다. 2026년 1월부터 복지몰·CMS·병원 CRM 세 서비스를 혼자 맡아 상품·예약·정산·쿠폰처럼 매출과 운영이 얽힌 화면을 만들었고, 만든 기능은 Amplitude로 검증해 다음 과제를 데이터로 뽑았습니다. 기능을 빨리 내는 것에서 멈추지 않고, 사용자 경험과 사업 지표가 같이 좋아지는 지점을 찾는 편입니다.

- 시술상세 개편을 데이터로 검증: 가입→예약 14분→11분, 리뷰 조회 사용자 전환율 +15%p
- 상품(38필드 Program)·예약·정산·쿠폰 기획전 등 판매자/운영자 화면을 반복 패턴으로 정리
- 제안된 토큰 전달의 노출 위험을 짚어 form POST BFF로 다시 설계
- 기존/신규 기능을 기획·디자인·마케팅과 같이 고민하고, 빠른 실험을 위해 `.claude` 스킬·커맨드로 반복 작업을 줄임

---

## Work Experience

### 세이프닥 | Frontend Engineer | 2025.05 – 현재

병원 복지 할인 플랫폼의 복지몰(B2C)·CMS·병원 CRM 프론트엔드를 혼자 담당합니다. 예약까지만 있던 MVP를 운영·분석·병원 관리까지 넓히면서, 동료·디자인·마케팅·PO와 같이 일했습니다.

**데이터로 검증해서 비즈니스에 기여 (Amplitude)**

- 디자인팀 가설("정보가 많으면 신뢰가 오르고 전환율도 오른다")에 맞춰 시술상세를 개편하고, 마케팅팀이 쓰던 Amplitude 위에 퍼널·행동 이벤트 241개를 깔아 배포 전후를 비교할 수 있게 했습니다.
- 가입에서 예약까지가 14분→11분, 리뷰를 본 사용자의 예약 전환율이 안 본 쪽보다 15%p 높게 나왔습니다. 여기서 프로그램별 리뷰 분리와 CTA 위치 조정을 다음 과제로 잡았습니다.
- 신규 가입 UTM이 빠지던 건 코드가 아니라 Amplitude 속성 상태(`unexpected`)가 원인이라, 코드 손 안 대고 해결했습니다. 기술이 아니라 데이터로 푼 케이스입니다.

**판매자/운영자 관리 도구**

- 상품 관리(38필드 Program 폼), 예약, 정산, 쿠폰 기획전, 병원 계약 같은 운영 화면을 SearchFilter / Table / Modal / Drawer / Detail Form 몇 가지 패턴으로 정리했습니다. ([글](https://jingeon27.tistory.com/18))
- 정리해 둔 패턴 덕에 신규 쿠폰 도메인 하나를 12파일 정도로 빠르게 붙일 수 있었습니다.

**직접 판단해서 바꾼 것들**

- 정산은 메인과 도메인이 달라 쿠키를 공유할 수 없었습니다. 처음 안이던 URL 토큰 전달은 access log·Referer에 토큰이 남는 게 걸려서, form POST BFF로 바꾸고 CSP `form-action` 고정과 open redirect 방어를 붙였습니다. 기획 협의 전에 제가 판단한 건입니다. ([글](https://jingeon27.tistory.com/19))
- 1,800줄짜리 검수 PR을 리뷰하며, AntD 내장 Form을 두고 검증을 직접 구현한 부분을 짚었습니다. 원칙이 아니라 `rules`·`validateFields`로 대체된다는 코드로 얘기했고요.

**빠르게 실험하고 배포 (AI 워크플로우)**

- `.claude` 스킬·커맨드를 직접 짜서 작업 시작부터 배포까지 이어지게 했고, worktree로 두세 개 과제를 병렬로 검토합니다.
- AI가 낸 코드는 그대로 받지 않습니다. 빌드가 깨질 때 `force-dynamic`을 덧붙이는 대신 `'use client'` 누락을 고쳤고, create/update 겸용이라 수정할 때도 `router.push`가 튀던 mutation 훅을 분리했습니다.

**폼·아키텍처·모바일**

- 예약·리뷰·상담 폼을 `RHF + Zod + @use-funnel/core`로 합쳐 가족 동기화를 520줄에서 55줄로 줄였습니다. ([예약](https://jingeon27.tistory.com/11) · [리뷰](https://jingeon27.tistory.com/15))
- SafeDoc App 961파일을 5-layer FSD로 정리했고, CMS·병원 CRM 모노레포는 넘겨받은 구조에서 entities/features를 새로 빼고 shared를 합쳐 13개를 9개로 줄였습니다.
- `@core` primitive 20개를 `tailwind-variants` 토큰으로 묶고, BottomSheet은 Compound + `overlay-kit`로 만들어 뒤로가기·backdrop·snap 같은 모바일 엣지케이스를 한곳에서 처리했습니다.

### 왓타임 (Whattime / round) | Frontend Engineer | 2024.01 – 2024.11

- 채용 플랫폼마다 흩어져 있던 Electron 크롤러를 `PlatformAdapter` + `Factory` 구조로 다시 짰습니다. 신규 연동이 3일에서 1일로 줄었고(직접 측정), 플랫폼별 차이는 adapter 경계로 분리했습니다.
- `useFunnel` + sessionStorage 복원 + `FormDirtyContext`를 네 흐름에 재사용했습니다. DnD 정렬은 `@dnd-kit`에 optimistic update와 롤백을 붙였고요.

---

## Skills

검증된 라이브러리 내부를 읽고 그 위에 얇은 어댑터를 두는 편입니다. Server·Form·UI 상태의 역할을 섞지 않고, 추상화는 같은 패턴이 세 번 나온 뒤에 합니다.

- **TypeScript 5 / React 18** — Compound + Custom Hook, `useSuspenseQuery` + `HydrationBoundary`, `useSyncExternalStore` 어댑터, Zod 스키마 추론
- **Next.js App Router** — Middleware/BFF, 캐싱 모델 구분, RSC 경계
- **상태/데이터** — TanStack Query v5(`queryOptions`, optimistic + 롤백), Zustand, RHF + Zod, AntD Form
- **아키텍처/UI** — FSD 5-layer + sub-domain, Turborepo + pnpm 모노레포, tailwind-variants, Radix/Headless, overlay-kit, 인앱 웹뷰 브릿지

모바일 우선 B2C, 네이티브 웹뷰 브릿지, popstate/backdrop/snap 같은 모바일 라이프사이클을 다뤄왔습니다. React Native 같은 새 스택도 라이브러리의 내부 계약부터 읽고 흡수하는 방식으로 빠르게 따라갑니다.

---

## Education & Certification

- 대덕소프트웨어마이스터고등학교 소프트웨어개발과 (2021.03 – 2024.01)
- 정보처리기능사 | 한국산업인력공단 (2023.04)
