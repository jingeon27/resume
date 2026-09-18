ㅔ# 이력서 작업 요약 (다른 에이전트 인계용)

기준일: 2026-08-02

---

## 1. 인물 / 배경

- 김진건, Frontend Engineer. jingeon27@gmail.com · github.com/jingeon27 · jingeon27.tistory.com
- 대덕소프트웨어마이스터고 졸업(2024.01) 후 바로 취업. 경력 약 2년 7개월
- **왓타임 (2024.01 – 2024.11)** — 일정 조율 '되는시간' + 채용 관리 'RoundHR' 모노레포. 프론트엔드 팀원
- **세이프닥 (2025.05 – 현재)** — 병원 복지 할인 플랫폼. 2025.12까지 팀원, **2026.01부터 사내 유일 프론트엔드 엔지니어**
- 2024.11 – 2025.05 사이 약 6개월 공백 있음 (취업 준비. 이력서에 설명 없음, 본인 판단으로 미기재)

**제품 규모(본인 제공):** 회원 약 15만 명 · 제휴 기업·대학 1,800곳 · 제휴 병원 400여 곳 · 등록 프로그램 5,000개. 글로벌 서비스는 별개 신규 서비스로 병원 16곳.

---

## 2. 관련 코드베이스 (전부 로컬, 독립 git 저장소)

| 경로                                   | 내용                                                 | 본인 author            |
| -------------------------------------- | ---------------------------------------------------- | ---------------------- |
| `projects/safedoc-usermall`            | B2C 웹 (Next 16.2.10, React 18)                      | `jingeonkim`, `김진건` |
| `projects/safedoc-react`               | CMS·병원CRM·글로벌CMS 모노레포 (앱 3개, 패키지 8개) | 〃                     |
| `projects/safedoc-global`              | 글로벌 서비스 (2026-07 신규, Next 16.2.10, React 19) | 〃                     |
| `projects/when-front`                  | 왓타임/RoundHR 모노레포                              | `gun kim`              |
| `projects/korea-care2-source-20260708` | 글로벌 서비스의 원본 프로토타입                      | (전달받은 것)          |

---

## 3. 이번 작업에서 한 일

1. `resume-sionic-ai.md` 를 **실제 코드베이스와 전수 대조 검증**한 뒤 전면 재작성
2. `resume-levit.md`, `resume-challengers.md`, `resume-dailyfunding.md` 를 같은 기준으로 재작성
3. `resume-inflab.md` 신규 작성
4. `cover-letter-sionic.md` (지원동기) 신규 작성
5. `.pdfbuild/build.mjs` 작성 → `pdf/` 에 PDF 6개 생성 (**렌더 결과 육안 확인 아직 안 함**)

---

## 4. 검증 결과 — 사실이 아니어서 삭제한 주장

기존 이력서에 있었으나 코드로 반박된 것들. **다시 넣으면 안 됨.**

| 삭제한 주장 | 근거 |
| --- | --- |
| Quill `{{candidateName}}` 변수를 atomic node로 구현 | `when-front/packages/ui/quill/src/variable-text-area/CustomVariableQuillEmbed.ts` blame = rangken 61 / pqr4579 4 / jongmyeong 2 / Jay 1. **gun kim 0줄.** 실제 변수 문법도 `{{candidate-name}}` (케밥) |
| 채용 공고 DnD에 optimistic update + **실패 롤백** | `packages/round/common-api/src/hooks/job/useJobMultiple.tsx` 52줄 전부 Jay. `onMutate`만 있고 `onError` 없음 → 롤백이 존재한 적 없음 (`git log -S 'context?.previousJobs'` 0건) |
| 신규 사이트 연동 기간 3일 → 1일 | 저장소에 근거 문서 0건. 실제 커밋 경과: 점핏 29일, 잡플래닛 34일, 게임잡 10일 |
| Quill 기반 메일 템플릿 편집기 구현 | 변수 에디터 화면들 blame에서 본인 기여 0~2줄 |
| 이벤트 "240개 설계" | 마스터 이력서 기준 "250개 중 140개 이상 직접 구현·고도화"가 정확 |
| 프로그램 폼 "38필드" | `IProgramFormCommon` 실측 = **공통 31개** + 앱별 확장 |
| "13개 패키지를 9개로 재편" | 현재 `packages/**` package.json = 13개. 이력 불명확해 수치 제거 |

**대체한 내용(전부 검증됨):** dnd-kit 공통 컴포넌트(`SideFilterSortableTreeItem` 89/129, `DataGridDndInline` 47/68, `DndSortableContext` 50/81), `useFunnel` 직접 구현(`apps/round/src/components/hooks/useFunnel.tsx` **92/94줄**), 면접 템플릿 생성 흐름(`CreateTempInterviewTemplate.tsx` 155/201) + sessionStorage dirty 복원, 탈락 메일 자동화(커밋 2024-06-17)

---

## 5. 검증 통과한 수치 (그대로 써도 됨)

| 주장                                           | 실측                                                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `@legacy` 250개 파일을 합류 후 한 달 만에 정리 | 합류일 2025-05-14 시점 `src/@legacy` **정확히 250개** → 2025-06-09 **0개**. 앞선 담당자들은 2025-02-03 442개에서 3개월간 250개까지   |
| Vitest 1,200개 이상                            | **1,201개** (usermall 294 + react 680 + global 227)                                                                                  |
| Playwright E2E 70개 이상                       | **74개** (usermall 25 + global 49)                                                                                                   |
| TypeScript 네이티브 체커 병행                  | `typescript-native: npm:typescript@^7.0.2` + `typescript ^6.0.3`, `typecheck = node node_modules/typescript-native/bin/tsc --noemit` |
| Next 14→16 · Node 24                           | `next 16.2.10`, `.nvmrc v24.15.0`                                                                                                    |
| 3개 앱 · 13개 워크스페이스 패키지              | apps 3개, packages package.json 13개                                                                                                 |
| 프로토타입 21개 파일 6,350줄                   | `find src -type f` = 21, `wc -l` 합계 = **6350** (정확 일치)                                                                         |
| 프로토타입 23개 라우트 → 현재 12개 화면        | `app` 하위 `page.tsx` = 12                                                                                                           |
| RSC prefetch 10개 라우트                       | `prefetchQuery`/`prefetchInfiniteQuery` 보유 파일 정확히 10개                                                                        |
| 공통 31개 필드                                 | `packages/entities/src/program/types/program.type.ts` `IProgramFormCommon` top-level = 31                                            |
| `createTypedForm` 폼 15개                      | 실제 호출 지점 정확히 15개 (cms 5 + hospital-admin 3 + global-cms 5 + packages/features 2)                                           |
| AI 상담 테스트 36개                            | `vitest run src/modules/features/chatbot` → 36 passed (`it.each` 전개 포함, 소스상 `it(`는 28개)                                     |
| 글로벌 CMS 12일 / 커밋 83건                    | 2026-07-20 ~ 07-31, `git log -- apps/safedoc-global-cms` = 83                                                                        |
| 2026.07 운영 병행                              | 본인 non-merge 커밋 457건 (global 139 / usermall 129 [`fix` 39·`hotfix` 11] / react 189)                                             |
| 왓타임 크롤러 커밋 163건                       | `git log --author="gun kim" -- apps/round-app` = 163                                                                                 |
| 스킬 문서 64개 / 레이어 가이드 20개            | skills SKILL.md 28+18+18, CLAUDE.md 14+5+1                                                                                           |

**검증 못 한 것:** "3회 연속 flaky 0" — 본인의 기존 이력서에서 가져온 수치, 저장소에 근거 없음.

---

## 6. 표현을 좁힌 것 (사실이지만 과장으로 읽히던 것)

- "**외부** 상담 세션의 SSE" → 실제로는 자사 백엔드 `apiv3.safedoc.io`. "상담 서버"로 수정
- "기존 화면 동작을 **유지하면서** 이관" → 프로토타입 23개 라우트 중 12개만 이관. "서비스로 남길 12개 화면을 골라"로 수정
- `common/inspection/draft` 3분할 → `draft`는 병원 CRM에만 존재. 단서 추가
- `ai/connecting/live/hold/done` 5개 상태 라우팅 → 실제 분기는 2갈래(connecting·live·hold→상담사 / ai·done→AI)
- "단독 프론트엔드 엔지니어" → "**사내 유일** 프론트엔드 엔지니어". 2026.01~04에 외주 인력(`sungryeolp` 127커밋, `pocket.kyw1` 98커밋) 커밋 다수 존재. 단, 본인이 "외주 인력과 나누어 진행" 표현은 실제 비중 대비 축소로 읽혀 불쾌하다고 하여 **삭제**
- 시술 항목 Excel→CRUD 전환은 국내가 아니라 **글로벌 CMS** 작업 (`treatmentGroup`·`pickCount`·`treatments/import`가 `safedoc-global-cms`에만 존재)
- 프로토타입 "4개 언어" → 실제 지원은 **3개(en/ko/ar)**. `ja`는 레지스트리에만 있던 오버레이 언어

---

## 7. 이력서에 새로 넣은 것 (기존에 없었으나 코드에 있던 강점)

- **스트리밍 마크다운 렌더 안정화** — `MarkdownContent.tsx`: 모델 출력의 4칸/탭 들여쓰기가 코드블록으로 오해석되는 문제 정규화, loose list 구조적 개행 제거, `Children.toArray`가 스트리밍 갱신마다 remount를 유발해 회피
- **대기 인디케이터를 AI 구간에만 노출** (상담사 구간은 사람이 답하므로)
- **Presigned PUT을 `fetch`로 분리** — 공용 axios의 baseURL·인증 인터셉터를 타면 서명이 깨짐
- **`translations[{languageCode,...}]` 배열 ↔ 언어 탭 폼** 변환이 Transfer Layer의 실제 정체
- **타입 안전 UI 사전** — en/ko 필수, ar 선택 → 번역 누락이 컴파일에서 걸림
- **AI 리뷰 트리아지** — 전수로 깊게 읽지 않고, 금지된 훅·상수 처리·순수 함수의 이상한 의존을 신호로 정해 그 지점만 파고듦. "제가 다시 설명할 수 없는 코드는 반영하지 않는다"
- **3주 breakdown** — 1주차 레이어 구조+변경분 반영+위험 코드 정리 / 2주차 API 스펙 반영+테스트 / 3주차 QA+실서버 검증+배포
- **보안 항목 복구** — 정산 크로스 도메인 인증을 URL 토큰 → form POST BFF (CSP `form-action`, open redirect 방어)

---

## 8. 파일별 타겟팅

| 파일 | 회사 | 앞세운 것 |
| --- | --- | --- |
| `resume-sionic-ai.md` | 사이오닉에이아이 (AI 에이전트 플랫폼) | 실시간 AI 스트리밍 UI → 스키마 기반 폼 + 어댑터 계층 → 다국어 → 대규모 렌더링 → 레거시 마이그레이션. JD의 "서버 스키마와 프론트 폼 데이터 사이의 어댑터 계층"이 Transfer Layer와 1:1 |
| `resume-levit.md` | 레브잇 (올웨이즈, 커머스) | 커머스 흐름(쿠폰·결제·정산) → 문제 발견·원인 제거 → **개발 환경·팀 생산성** → **AI 개발 툴 통제** → 0→1. 우대사항이 "자동화로 팀 생산성", "AI 개발 툴 활용능력"이라 생산성을 앞에 배치 |
| `resume-challengers.md` | 챌린저스 (커머스/광고) | 비즈니스 지표 → 쿠폰·결제·정산 → 백오피스 → 빠른 실험. 우대사항이 "기술 그 자체의 개선보다 고객 중심 비즈니스 문제 해결"이라 테스트 개수·빌드 시간을 **맨 뒤로** |
| `resume-dailyfunding.md` | 데일리펀딩 (P2P 금융) | 인증·정산·결제 → 사용자 경험 → 데이터 기반 개선 → 웹 플랫폼 → 0→1 → 생산성. 우대사항 "금융 프로젝트 경험" |
| `resume-inflab.md` | 인프랩 (인프런, 교육) | 운영까지 책임 → 재발 방지 → 모노레포·빌드 → 다국어·접근성 → 문서화. 문화 항목(재발 방지, 팀 비효율 자동화, 디자인 시스템, 문서화)과 가장 잘 맞음 |
| `cover-letter-sionic.md` | 사이오닉 지원동기 | **AI 에이전트를 실무에서 통제해 쓴 경험** 중심. STORM Code(폐쇄망 AI 코딩 에이전트)·STORM Platform(비개발자용 에이전트 빌더)·금융공기업 고객과 연결 |

**모든 파일 공통:** 연차 표기 없음(본인 요청) · 병역 미기재 · TanStack/ai PR #864 미기재(본인 요청, 유쾌하지 않게 끝난 PR) · toss/slash PR #363만 유지

---

## 9. 남은 작업 / 미해결

1. **PDF 렌더 결과 육안 확인 안 됨** — `pdf/` 에 6개 생성했으나 레이아웃·페이지 나눔 검증 전
2. **"3회 연속 flaky 0"** — 유일하게 검증 못 한 수치. 본인 확인 필요
3. **공개 저장소 링크 없음** — 자체 ESLint 플러그인, `createTypedForm`, `SubscribeConnectionAdapter` 등 재사용 산출물이 여러 번 언급되나 서류 단계에서 코드로 확인할 방법이 없음. 하나라도 공개하면 신뢰도에서 가장 효율 높은 한 수
4. **면접 대비** — 인프랩은 서류 다음 바로 과제, 챌린저스는 라이브 코딩 + 화이트보드, 레브잇은 과제/사전질문 추가 가능. `createTypedForm`의 타입 추론과 SSE push→pull 브릿지는 화이트보드에서 그릴 수 있게 준비 권장

---

## 10. 참고 파일

- `ably-사전질문.md` — 협업 서사("혼자 개발한다고 혼자 결정해도 되는 건 아니다"), 학습법, "다음에 고치는 사람이 덜 헤매는 코드", "제가 다시 설명할 수 없는 코드는 반영하지 않습니다". 이번 이력서들에 인용됨
- `resume.md` — 마스터 이력서 (가장 상세)
- `경력기술서.md`, `portfolio.md` — 원자료
- `.pdfbuild/build.mjs` — 마크다운 → HTML → PDF 변환 (Chrome headless, `ably-resume.css` 사용)
