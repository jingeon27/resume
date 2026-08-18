# safedoc-react 재측정 (2026-08-19)

- **기준**: `safedoc-react` 로컬 작업 트리 (클린 상태, `git status` 비어 있음)
- **선행 문서**: [safedoc-코드품질-감사.md](safedoc-코드품질-감사.md) (2026-08-06~07, 3개 저장소 196,800 LOC)
- **범위**: safedoc-react만. usermall·global은 이번에 안 봤다.
- **방식**: 명령어 직접 실행 측정 + 소스 확인. 추정치 없음.

---

## 요약

선행 감사의 진단(**"의도는 성숙한데 강제 수단이 없다"**)은 12일 뒤에도 그대로다. 달라진 건 하나 — **고치는 비용을 실측했더니 거의 0이었다.**

| | 선행 감사 | 오늘 |
| --- | --- | --- |
| lint 게이트 | 지적됨 (`base.js` only-warn) | **그대로.** FSD 위반 파일로 실증 → `exit 0` |
| CI 테스트 | 없다고 지적됨 | 그대로 없음 |
| 테스트 상태 | 언급 없음 | **832개 중 9개 실패 중** (신규) |
| 고치는 비용 | 미측정 | **error 1건 + 72초** (신규) |

---

## 실측 1 — lint 게이트는 여전히 죽어 있다

`entities`에서 `features`를 import하는 파일을 만들어 돌렸다.

```
1:1  warning  FSD 위반: 'entities' 레이어는 상위 레이어 'features'를 import할 수 없습니다  fsd/layer-imports
✖ 1 problem (0 errors, 1 warning)
EXIT=0
```

앱 config에 `'error'`로 선언돼 있는데 warning으로 나온다. `packages/config/eslint-config/base.js`의 `eslint-plugin-only-warn`이 전역 강등한다. `lint-check.yml`의 `pnpm run lint || exit 1`은 항상 통과.

### 새 정보: 걷어내는 비용이 error 1건이다

`onlyWarn`을 임시 제거하고 전체를 다시 돌려 severity를 분해했다 (측정 후 원복 완료).

| 앱 | 룰 | 건수 | 강등 해제 시 |
| --- | --- | --- | --- |
| hospital-admin | `react/no-unknown-property` | 1 | **error** |
| cms | `react-hooks/exhaustive-deps` | 7 | warn 유지 |
| hospital-admin | `react-hooks/exhaustive-deps` | 1 | warn 유지 |
| global-cms, entities, features, shared/ui | — | 0 | — |

`exhaustive-deps` 8건이 warn으로 남는 건 `react-hooks` recommended가 그렇게 선언하기 때문. 게이트를 막지 않는다.

**유일한 블로커**는 `apps/safedoc-hospital-admin/src/modules/entities/asset/ui/UploadImageItem.tsx:109`의 `<style jsx>{UPLOAD_STYLE}</style>`. styled-jsx 문법인데 `eslint-plugin-react`가 모르는 속성이라 잡는 오탐이다.

→ `next.js` config에 `react/no-unknown-property: ['error', { ignore: ['jsx', 'global'] }]` 추가하면 error 0건. 그 뒤 `base.js`에서 `onlyWarn` import(3행)와 plugins 블록(39–43행) 제거.

해제하면 FSD 룰이 정상 동작한다:

```
1:1  error  FSD 위반: 'entities' 레이어는 상위 레이어 'features'를 ...
✖ 1 problem (1 error, 0 warnings)
EXIT=1
```

---

## 실측 2 — 테스트 스위트가 이미 빨간불이다 (신규)

선행 감사는 "크리티컬 경로에 테스트가 없다"를 지적했다. 그건 맞지만, **있는 테스트가 깨져 있다**는 건 안 적혀 있다.

**전체 72초** (cold, `--force`, 캐시 없음, 832개). turbo 캐시가 걸리면 바뀐 패키지만 재실행.

```
Tasks:    5 successful, 7 total
Failed:   @safedoc/utils#test, safedoc-global-cms#test
```

### 실패 9건 — 전부 낡은 테스트, 제품 버그 아님

**`@safedoc/utils` 1건** — `schema/parse.test.ts > parseApiResponse > 목록 봉투의 totalCnt·criteria 가 빠져도 잡아낸다`

```
AssertionError: expected [ 'data.totalCnt' ] to include 'data.criteria'
```

원인: `packages/shared/types/src/api.global.schema.ts:23-24`에서 `criteria`를 의도적으로 완화했다.

```ts
// 페이징 없는 목록(예: 예약 사용가능 쿠폰)은 criteria 자체를 null 로 내린다.
criteria: listCriteriaSchema.nullish(),
```

스키마가 맞고 테스트가 안 따라왔다. → 테스트 기대값에서 `data.criteria` 단언 제거.

**`safedoc-global-cms` 8건** — BlogListView 3, FaqListView 4, HospitalListView 1

```
TestingLibraryElementError: Unable to find an element with the text: 숨김
TestingLibraryElementError: Unable to find an element with the text: FAQ 수정
TestingLibraryElementError: Unable to find role="button" and name `/신규 등록/`
```

UI 라벨·구조가 바뀌고 셀렉터가 안 따라왔다. 2건은 `waitFor` 5초 타임아웃까지 갔다. → 셀렉터 갱신. 제품 코드는 안 건드려도 된다.

### 곁가지: MSW 픽스처가 스키마에서 밀렸다 (신규)

cms·hospital-admin 테스트는 **통과하면서** zod 경고를 뱉는다.

```
프론트 응답 타입 불일치 (GET /hospital/filter):
  data.list.0.lunchTime: expected object, received undefined
  data.list.0.departments.0.icon: expected object, received undefined
  data.list.0.address: expected object, received undefined
```

초록불인데 런타임 검증기는 계속 불일치를 외치는 상태. 픽스처를 스키마에 맞추거나, 스키마가 실제 응답을 반영하는지 확인해야 한다.

---

## 신규 발견 — 선행 감사에 없는 것들

**1. FSD 플러그인이 `packages/*`를 아예 검사하지 않는다**

`fsd-boundaries.js`는 경로에 `/modules/`가 있어야 파싱한다. `packages/entities/src/asset/...`는 `modules/` 루트가 없어 파싱 결과가 null → 룰 no-op. 해당 패키지 eslint.config.js도 플러그인을 등록하지 않는다.

세 앱이 공유하는 코드, 즉 경계가 가장 중요한 곳이 사각지대다. `packages/entities`만 `no-restricted-imports`로 features를 막고 있고 그마저 `'warn'`. `shared/*`·`lib/*`는 경계 룰이 전혀 없다 (현재 실제 위반은 0건 — 규율로만 지켜지는 중).

→ 플러그인이 `rootDir` 옵션을 이미 열어놨으므로 `rootDir: 'src'`로 재사용 가능.

**2. 커스텀 lint 룰에 테스트가 0건이다**

정규식 경로 파싱 + 상대경로 resolve + rank 비교인데 `RuleTester` 테스트가 없다. 룰이 조용히 no-op이 돼도 아무도 모른다 — 위 1번이 정확히 그 케이스다. 레포에 vitest는 이미 있다.

**3. ESLint 8.57.1(EOL)인데 config는 ESLint 9 전용으로 작성됐다**

`fsd-boundaries.js` 헤더 주석이 "ESLint 9 flat config 전용"이라 적고 있는데 설치된 건 8.57.1. catalog가 `eslint: ^8.56.0`으로 묶고 있다. 지금은 동작하지만 플러그인들이 9를 요구하기 시작하면 깨진다.

**4. 앱별 `files:` 리매핑 방식이 셋 다 다르다**

`hospital-admin`만 `'rules' in config` 가드가 있고, `cms`·`global-cms`는 모든 config에 `files`를 덮어써서 base의 `{ ignores: ['dist/**'] }`가 global ignores → 일반 config로 바뀐다. 실질 피해는 작지만(앱에 dist 없음) 한 앱만 고쳐둔 상태라 헷갈린다.

**5. `'use server'` 오용 1건**

`apps/safedoc-hospital-admin/src/app/(beforeLogin)/layout.tsx:1`. layout은 App Router에서 기본이 Server Component라 이 지시어가 필요 없다. `'use server'`는 "이 파일의 export를 클라이언트가 호출 가능한 Server Action으로 만들라"는 뜻이라, 레이아웃 컴포넌트를 Server Action으로 등록하는 셈이다. 아무도 액션으로 호출하지 않아서 동작할 뿐이다. **한 줄 삭제**하면 된다 — `checkLogin()` / `redirect()`는 Server Component에서 그냥 된다.

(선행 감사 CRITICAL 5번의 `'use server'` 쿠키 액션 건은 usermall 쪽이라 별건.)

**6. 앱 간 완전 동일 파일 24쌍**

선행 감사의 "중복이 드리프트로 전환됐다"와 같은 문제지만, 해시 일치 기준으로 다시 세었다.

| 파일 | 성격 |
| --- | --- |
| `ReactQueryProvider.tsx`, `LoginRequiredModal.tsx`, `antd-react-19-render.ts` | 앱 인프라 |
| `settlement/disapproval.options.ts`, `settlement/omission.schema.ts` | 도메인 코드 |
| `TaxTypeFormItem.tsx` | 피처 컴포넌트 |
| `api/sign/out/route.ts`, `api/asset/image/upload/common/route.ts` | API 라우트 |
| `mocks/util.ts`, `mock-server.ts`, `treatment-history.handler.ts` | 테스트 인프라 |

**7. 컨벤션 드리프트 — 같은 파일 안에서 갈린다**

`apps/safedoc-cms/src/modules/entities/user/model/user.options.ts:12-16`이 `.claude/skills/query-key/SKILL.md`의 3개 규칙을 전부 어긴다. 바로 아래 형제 함수 3개는 지킨다.

```ts
export const affiliationDocumentOptions = (id?: number) =>
  queryOptions({
    queryKey: ['fetchAffiliationDocumentById', id],   // compact 없음
    queryFn: () => fetchAffiliationDocumentById(id!), // non-null 단언
    enabled: !!id,                                    // skipToken 대신 enabled
  });
```

전체로는 `compact` 112 vs raw 배열 79, `skipToken` 172 vs `enabled` 25.

**지금 실제 버그는 아니다** — `invalidateQueries(affiliationDocumentOptions())` 무인자 호출은 0건이고, 무인자 무효화가 19건 걸리는 `settlementTreatmentsOptions`는 `compact`를 제대로 쓴다. 중요한 곳에서는 지켜지고 있고, 안 지켜진 곳은 아직 안 터졌을 뿐.

**8. 마이그레이션이 앱 사이에 전파되지 않았다**

`apps/safedoc-hospital-admin/.../settlement.options.ts:19`에 `enabled: !!params.hospitalId`가 3개 남아 있다. 이건 스킬 문서가 **❌ 예시로 든 코드 그 자체**다. cms 쪽 동일 슬라이스는 이미 `skipToken`으로 전환됐다.

---

## 우선순위

비용을 실측했으니 순서가 명확하다.

| # | 작업 | 비용 | 효과 |
| --- | --- | --- | --- |
| 1 | `no-unknown-property` ignore 추가 → `onlyWarn` 제거 | **1파일 + 2줄** | lint 게이트 부활. 7·8번 재발 차단 |
| 2 | 빨간 테스트 9건 수정 | 테스트 파일만 | 스위트를 다시 신호로 |
| 3 | `pnpm test`를 `/push`에 추가 | 1줄 | 안전망 자동화 (CI 아님) |
| 4 | `packages/*`에 fsd 적용 (`rootDir: 'src'`) | 설정 | 사각지대 제거 |
| 5 | 중복 24쌍을 packages로 흡수 | 중 | 드리프트 차단 |
| 6 | fsd 플러그인 RuleTester 테스트 | 소 | 룰 no-op 방지 |
| 7 | `'use server'` 한 줄 삭제 | 1줄 | 의미 정정 |

3번을 CI가 아니라 `/push`에 두는 이유: 혼자 PR 열고 혼자 머지하는 구조에서 블로킹 게이트는 의식이다. `AGENTS.md`가 이미 게이트 위치를 `/push`로 정해놨고, lint를 돌리는 자리에 72초짜리(캐시 걸리면 수 초) 테스트를 얹으면 CI 인프라 없이 같은 효과가 난다.

---

## 메모

- 선행 감사가 이미 잡은 것을 오늘 다시 재현했다. 즉 **12일 동안 1번이 안 고쳐졌고, 그 사이 테스트가 9건 깨졌다.** 감사 문서가 있다는 것과 감사 결과가 반영된다는 것은 다르다.
- 반대로 이번에 확인한 강점은 별도 정리 없이 이력서에 반영했다 (zod 검증 316곳, QueryErrorBoundary 격리, 리팩토링 전 계약 고정, FSD 플러그인 설계).
