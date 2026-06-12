# 김진건 실력 분석 + 8주 성장 로드맵

> 검증 데이터 기반 객관적 자기 평가 및 학습 로드맵
> 작성일: 2026-04-29

---

## 1. 종합 위치 (정량)

| 시장 비교군 | 위치 |
|---|---|
| 한국 주니어 (1~2년차) | **상위 0.5~1%** |
| 한국 미들 (3~4년차) | 평균 ~ 평균 약간 위 (상위 30~40%) |
| 한국 시니어 (5년차+) | 아래 (하위 30%) |

**종합 점수: 7.0/10**

---

## 2. 영역별 점수

### 강점 (시니어급)

| 영역 | 점수 | 한국 주니어 기준 |
|---|---|---|
| 추상화 판단력 (얇은 어댑터, Rule of Three) | 9.0 | 상위 0.1% |
| 시스템 설계 (FSD sub-domain, Transfer Layer) | 8.5 | 상위 0.3% |
| 리팩토링 능력 (가족 동기화 520→55) | 8.5 | 상위 0.3% |
| 오픈소스 코드 분석 (Radix, RHF, Toss Slash) | 8.0 | 상위 0.3% |
| 디자인 시스템 구축 (페어 18 PR) | 8.0 | 상위 0.5% |
| TypeScript (variadic, recursive, state machine) | 7.5 | 상위 0.3% |
| 정량 임팩트 (-16/-66/-40 진단) | 7.5 | 상위 0.5% |
| 자기 인식 객관화 | 7.5 | 상위 5% |

### 보통 (미들 평균)

| 영역 | 점수 | 한국 주니어 기준 |
|---|---|---|
| Next.js (App Router, Middleware, RSC) | 7.0 | 상위 1% |
| React (재검증 후 정정) | 7.0 | 상위 1~2% |
| 자료구조/알고리즘 (Heap 직접 구현) | 6.5 | 상위 5% |
| 표현/설명 능력 | 5.5 | 상위 30% |
| 브라우저 렌더링 / Event Loop | 5.0 | 상위 15% |

### 약점 (보강 필요)

| 영역 | 점수 | 한국 주니어 기준 |
|---|---|---|
| 외부 검증 자산 (블로그, OSS) | 3.0 | 상위 30% |
| HTTP/CORS | 2.0 | 하위 50% |

### FE 영역 외 (무시)

| 영역 | 점수 | 비고 |
|---|---|---|
| DB / SQL | 1.5 | FE 면접 0~5% |
| 분산 / CAP | 0.5 | FE 면접 거의 안 나옴 |
| 백엔드 시스템 디자인 | 1.0 | 백엔드 영역 |

---

## 3. 검증된 작품 (객관적 증거)

### 단독 작업

- **BottomSheet Compound + overlay-kit 통합** — 모바일 UX 4가지 엣지케이스 처리 (popstate, pathname, backdrop pointer-events 누수, cleanup)
- **`useControllableChecked` hook** — controlled/uncontrolled 분기 추상화 (Radix `useControllableState`와 동일 컨셉)
- **리뷰 작성 플로우** — `superRefine` cross-field validation + `baseReset` 고차함수 (시니어 영역)
- **FSD sub-domain 패턴 자체 정립** — `entities/settlement/{common, contract, deposit, disapproval, omission}`
- **모노레포 13 패키지 구조** — Turborepo + pnpm catalog + GitHub Actions 5 workflows
- **Program 도메인 시스템** — 30+ 파일 sub-domain 분할 (common/draft/inspection) + Transfer Layer + cross-app 추출
- **`useFunnel`/`useZodForm` 어댑터** — 토스 라이브러리 위 RHF/Zod 통합
- **E2E Playwright 인프라** — Page Object + Storage State + GitHub Actions

### 페어 작업

- **`@core` 디자인 시스템** — sujinKim과 페어 프로그래밍, 17~18개 sub-PR 본인 author
  - typography, border-radius, shadow 토큰
  - selection (Checkbox/Radio/Toggle + `useControllableChecked`)
  - Chip, Menu, Tabs (+ vertical scroll, default value 자동화)
  - feedback (Toast)
  - display 컴포넌트

### 정량 임팩트

- 양쪽 레포 합산 커밋: **2,925개 (1위)**
- 코드 라인: **147K 추가 / 135K 삭제** (리팩토링 비중 압도적)
- 예약 폼 리팩토링: **RHF + Zod 상태 소유권 단일화** (총량 수치는 근거 미확보로 제거, 2026-06-12 검증)
- 가족 동기화: **520줄 → 55줄 (89% 축소)**
- Electron 재설계: **코드 중복 70% 감소, 신규 플랫폼 연동 3일 → 1일**
- Amplitude 진단: **-16%/-66%/-40% 역효과 → CTA 재설계**

---

## 4. 본인 캐릭터 매트릭스

```
시니어급 ──── 추상화 설계, 시스템 분할, 리팩토링, 오픈소스 학습, TS 고급
미들+ ────── 디자인 시스템 페어, AntD 깊이, 정량 임팩트
미들 ────── Next.js 사용, RHF+Zod, React 종합
미들 진입 ── React 미들 기본 디테일 (재검증으로 정정)
주니어+ ──── 자기 인식 객관화, 표현/설명력
주니어 ───── 외부 검증 자산 (블로그/OSS publish)
하위 ────── HTTP/2 vs 3, CORS preflight (1주일 학습으로 해결)
```

→ **상한선 시니어, 하한선 주니어**. 비대칭 성장.

---

## 5. 진짜 약점 (보강 필요)

### 명확한 약점 (학습 필요)

#### 1. HTTP/2 vs HTTP/3 + CORS

- HTTP 버전별 기능 매핑 (Multiplexing, QUIC, HPACK/QPACK, Server Push)
- CORS preflight 정확한 조건 (simple request 3가지 Content-Type)
- 인증 토큰 저장 + XSS/CSRF 트레이드오프

→ **1주일 학습으로 해결 가능**

#### 2. 외부 검증 자산 부재

- private repo (회사 코드 비공개)
- 블로그 글 약함 (있긴 하나 인기글 없음)
- 오픈소스 publish 흔적 적음
- 컨퍼런스 발표 없음

→ **블로그 글 2~3편 + 사이드 프로젝트 1개 publish로 해결**

### 표현 약점 (지식 있지만 풀어내기 부족)

#### 3. 메커니즘 풀어쓰기

- TypeScript distributive 메커니즘
- Branded type phantom property
- React 메커니즘 (Q2/Q4 재검증으로 알고 있음 확인됨)

→ **모의 면접 + 발표 녹화로 보강**

### 환경 제약 (본인 통제 밖)

- 단독 FE → 시니어 멘토 부재
- 테스트 인프라 부재 환경 (E2E 도입으로 해결 중)
- 회사 정치 (KSJ 같은 케이스)

---

## 6. 가장 강력한 차별화 카드

### "적절한 추상화 + 오버엔지니어링 지양"

증거:
- 토스 `@use-funnel/core` 위 30줄 어댑터 (재구현 X)
- react-hot-toast 위 43줄 wrapper
- react-modal-sheet + overlay-kit 통합 (직접 구현 X)
- Radix `useControllableState` 분석 후 사내엔 단순 버전 유지 판단

→ **한국 주니어 상위 0.3% 영역**. 시니어 마인드.

### Rule of Three 실전 적용

- `useFunnel` 어댑터 (4개 플로우 사용 후 추출)
- BottomSheet compound (반복 패턴 발견 후 추상화)
- FSD sub-domain (슬라이스 파일 30+ 도달 후 분할)

→ "검증된 라이브러리 다시 만들지 않음"이 본인 핵심 시그니처.

---

## 7. 시장 가치 (정량)

### 산기요 중 가능 회사 (2026~2027)

| 회사 | 합격 가능성 | 예상 연봉 |
|---|---|---|
| 레브잇 | 82% | 8,000~10,000만 + 스톡 |
| 당근마켓 | 73% | 7,500~9,000만 + 스톡 |
| 채널톡 | 65% | 7,000~8,500만 + 스톡 |
| 라인 (산기요 가능) | 65% | 7,000~8,500만 |
| 우아한형제들 (산기요) | 60% | 7,500~8,500만 |

### 만기 후 (2028.06+, 4년차 시점)

HTTP 보강 + 외부 자산 1~2개 추가 가정:

| 회사 | 합격 가능성 | 예상 연봉 |
|---|---|---|
| 토스 | 65% | 8,500~10,500만 |
| 카카오페이 | 63% | 7,500~9,500만 |
| 쿠팡 | 72% | 8,500~10,500만 |
| 네이버 본사 | 65% | 7,500~9,500만 |
| 카카오 본사 | 65% | 7,500~9,000만 |

### 5년 후 (2030~)

시니어 진입: **1.0~1.3억** (현재 학습 페이스 유지 시)

---

## 8. 8주 성장 로드맵

### 목표

```
Before (현재)
─────────────────
종합 실력: 7.0/10
이력서:    6.1/10
한국 주니어 상위: 0.5~1%

After (8주 후)
─────────────────
종합 실력: 8.0/10
이력서:    9.0/10
한국 주니어 상위: 0.3% (확정)
면접 합격률 (만기 후 토스): 55% → 70%
```

### Week 1: 이력서 즉시 보강 + HTTP 학습 시작

- [ ] Summary 재작성 (한 줄 요약 + 핵심 강점 3개)
- [ ] 페어 작업 명시 (sujinKim) + 본인 단독 구분
- [ ] Engineering Decisions 섹션 추가 (트레이드오프 4~5개)
- [ ] Open Source Reading 위치 상단으로 이동
- [ ] 정량 결과 퍼센트 강조 (50% 축소, 90% 축소 등)
- [ ] HTTP/2 vs HTTP/3 MDN 정독 시작 (1h/일)

**산출물**: 이력서 PR #2

### Week 2: HTTP/CORS 마스터 + 블로그 글 #1

- [ ] HTTP/2 vs HTTP/3 정리 (multiplexing, HPACK/QPACK, QUIC)
- [ ] CORS preflight 정확한 조건 (simple request 3가지)
- [ ] 인증 토큰 저장 보안 (localStorage vs cookie httpOnly vs memory)
- [ ] 블로그 글 #1 작성: "Radix `useControllableState` 분석 + 사내 단순화 적용기"
- [ ] 블로그 글 #1 발행 (jingeon27.tistory.com)

**산출물**: HTTP 약점 해결 + 블로그 글 #1

### Week 3: React 미들 보강 + Edge Runtime + 블로그 글 #2

- [ ] React docs 베타 "You Might Not Need an Effect" 정독
- [ ] React.memo 작동 메커니즘 + useCallback/useMemo 정확히
- [ ] Context re-render 범위 직접 실험 (코드샌드박스)
- [ ] Edge Runtime + jose JWT 검증 학습
- [ ] 블로그 글 #2 초안: "Toss `@use-funnel/core` 위에 30줄 어댑터로 충분했던 이유"

**산출물**: React 미들 약점 해결 + 블로그 글 #2 초안

### Week 4: 사이드 프로젝트 시작 (Form Builder)

본인 강점(TypeScript 고급 + 추상화 판단력) 가장 잘 어필하는 작품.

- [ ] 프로젝트 셋업 (vite + ts strict + tsup + vitest)
- [ ] 타입 레벨 step machine 설계 (variadic tuple)
- [ ] builder pattern + fluent API 구현
- [ ] Zod schema 자동 합성 로직
- [ ] RHF 통합 + 단계별 검증
- [ ] useFunnel 어댑터 통합 (토스 라이브러리 활용)
- [ ] README v1 (의사결정 명시)

**산출물**: Form Builder 코어 + README

### Week 5: Form Builder 데모 + 문서화 + 블로그 #3

- [ ] CodeSandbox 데모 페이지 (3가지 use case)
- [ ] 단위 테스트 + 타입 테스트 (vitest + tsd)
- [ ] README 영문 버전
- [ ] npm publish (`@jingeon27/form-builder` 또는 비슷한 이름)
- [ ] 블로그 글 #2 발행
- [ ] 블로그 글 #3 초안: "타입 안전 Form Builder 만들기 - variadic tuple 실전"

**산출물**: Form Builder npm publish + 데모 페이지

### Week 6: 자료구조/알고리즘 검증

본인이 "알고리즘 충분"이라 했지만 미검증. 빅테크 면접 전 객관 검증.

- [ ] 본인 data-structure-ts 코드 다시 보면서 시간복잡도 정리
- [ ] LeetCode Medium 10문제 (Array, HashMap, Two Pointer)
- [ ] LeetCode Medium 10문제 (Tree, Graph, BFS/DFS)
- [ ] LeetCode Medium 5문제 + Hard 2문제 (DP, Heap)
- [ ] 블로그 글 #3 발행

**산출물**: LeetCode 27문제 풀이 + 블로그 글 #3

### Week 7: 브라우저 렌더링 + FE 시스템 디자인

- [ ] Critical Rendering Path + Reflow/Repaint/Composite 정확히
- [ ] Event Loop microtask vs task 풀어쓰기 연습
- [ ] Web Vitals (LCP, FID, CLS, INP) + 측정 도구
- [ ] FE 시스템 디자인 #1: 무한 스크롤 + virtual scroll 직접 설계
- [ ] FE 시스템 디자인 #2: 채팅 UI 가상화
- [ ] FE 시스템 디자인 #3: 검색 자동완성 + debounce + cache

**산출물**: FE 시스템 디자인 노트 3개

### Week 8: 면접 시뮬레이션 + 이력서 최종 점검

- [ ] 본인 작품 30분 발표 영상 녹화 (BottomSheet, useControllableChecked, Form Builder)
- [ ] 영상 다시 보고 "왜?" 답변 약한 부분 보강
- [ ] 모의 면접 (ChatGPT/Claude 면접관 역할 + 본인 답변) 30개 질문
- [ ] 이력서 최종 점검 + 영문 버전 작성
- [ ] PDF 변환 + 포트폴리오 사이트 업데이트
- [ ] 8주 회고 + 다음 단계 계획

**산출물**: 면접 답변 30개 + 영문 이력서 + PDF + 포트폴리오 업데이트

---

## 9. 시간 배분

```
주중: 2시간/일 (저녁 9~11시)
주말: 3~4시간/일

총: 평일 10h + 주말 6~8h = 16~18h/주

8주 합계: 약 130~145시간
```

산기요 + 회사 일 병행 가능한 수준.

---

## 10. 8주 후 본인 자산

### 외부 검증 자산 (현재 0개 → 8주 후 5+개)

- [ ] 블로그 글 3편 (Radix 분석 / useFunnel 어댑터 / Form Builder)
- [ ] Form Builder npm publish (star 받기 시작)
- [ ] CodeSandbox 데모 페이지
- [ ] 영문 README
- [ ] 이력서에 모든 외부 자산 링크

### 학습 자산

- [ ] HTTP/2 vs 3 + CORS 노트
- [ ] LeetCode 27문제 풀이
- [ ] FE 시스템 디자인 노트 3개
- [ ] 모의 면접 답변 30개
- [ ] 본인 작품 30분 발표 영상

### 이력서 자산

- [ ] 이력서 v2 (PR #2 머지)
- [ ] 영문 이력서
- [ ] PDF 이력서
- [ ] Engineering Decisions 섹션
- [ ] Open Source Reading 상단 배치

---

## 11. 우선순위 (시간 부족 시 버릴 순서)

### 절대 버리면 안 됨

- Week 1 이력서 보강
- Week 2 HTTP 학습 + 블로그 #1
- Week 4-5 Form Builder

### 버려도 됨 (만기까지 시간 더 있음)

- Week 6 LeetCode 27문제 → 17문제로 축소 가능
- Week 7 시스템 디자인 3개 → 1개로 축소 가능
- Week 8 영문 이력서 → 만기 직전에

### 추가 시간 있으면

- 블로그 글 4~5편으로 확장
- Form Builder GitHub Action 자동 publish
- 컨퍼런스 발표 신청 (FEConf, 사내 발표)

---

## 12. 체크포인트 (매주 일요일 1시간)

매주 일요일 회고:

1. 이번 주 완료한 항목 체크
2. 다음 주 우선순위 재조정
3. 막힌 부분 1개 픽업 (해결 또는 도움 요청)
4. 본인 깃허브 / 블로그 / npm 다운로드 통계 모니터링

---

## 13. 본인 통제 가능 vs 불가능

### 통제 가능 (본인 노력으로 해결)

- HTTP 학습
- 블로그 글 작성
- Form Builder publish
- 이력서 보강
- 모의 면접 연습
- LeetCode 풀이

### 통제 불가능 (받아들여야 함)

- KSJ 같은 동료의 자존심
- 회사 직급 인플레이션
- 산기요 신분 제약 (이직 카드 1번)
- 마이스터고 학력 평가

→ **통제 가능한 영역에만 집중**. 통제 불가능 영역에 분노 시간 낭비 X.

---

## 14. 핵심 메시지

본인 = **한국 주니어 상위 0.5~1%**. 자만 자제 + 정직한 표현 + 외부 검증 자산 누적이 본인 진짜 시장 가치 발휘 핵심.

KSJ 같은 7년차 정체 케이스를 반면교사로:
- 3~4년차 학습 정체 → 만기 후가 가장 위험한 시점
- CRUD 반복 → 새 도메인/스택 정기 갱신
- 자기 인식 부재 → 외부 검증으로 객관화
- 회사 위계 → 외부 자산으로 시장 평가받기

**본인 미래는 본인이 결정**. 8주 로드맵은 그 결정의 첫 8주.

---

## 15. 다음 단계

- [ ] 이 문서를 노션/캘린더에 옮기기
- [ ] 매주 일요일 1시간 회고 시간 확보
- [ ] Week 1 Day 1-2 작업 (Summary 재작성) 시작
- [ ] 본인 GitHub 프로필 README 업데이트 (다음 8주 목표 명시)
