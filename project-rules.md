# 프로젝트에 적용한 규칙

safedoc-react·safedoc-usermall 저장소에 코드화된 개발 규칙 목록. 중복 제거 후 610건. 2026년 8월 기준.

강제 수단별로는 문서 규칙이 가장 많고, lint·타입·테스트로 자동 검사되는 것이 그다음이다.

## 아키텍처 (103)

### safedoc-react

- `packages/entities`·`packages/features` 수정은 CMS·PA 두 앱에만 영향을 주고, global-cms 는 자체 `src/modules/entities`·`modules/features` 를 쓰므로 별개로 다룬다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: global-cms 는 shared(ui/hooks/utils/types) 만 공유 패키지로 쓴다</sub>
- 로컬 개발 시 쿠키 충돌을 막기 위해 각 앱 `.env.local` 에 `NEXT_PUBLIC_APP_TYPE` 을 앱별로(CMS=BO, hospital-admin=PA, global-cms=GLOBAL_BO) 설정한다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 쿠키 충돌 방지</sub>
- 라우트 `page.tsx` 를 구성할 때 조회는 페이지가 아니라 ListView 가 한다.  
  <sub>문서 · `AGENTS.md`</sub>
- shared 레이어는 외부 라이브러리만 import 하고 다른 FSD 레이어(entities/features/app)를 import 하지 않는다.  
  <sub>문서 · `.claude/architecture/shared.md`</sub>  
  <sub>왜: 최소 의존성</sub>
- shared 에는 도메인과 무관하고 여러 곳에서 재사용 가능한 코드만 두고, 도메인 특화 코드(`TreatmentDatePicker`, `formatTreatmentDate` 등)는 해당 entity/feature 로 옮긴다.  
  <sub>문서 · `.claude/architecture/shared.md`</sub>  
  <sub>왜: 도메인 무관성·재사용성</sub>
- 모든 앱에서 쓰는 공통 코드만 `packages/shared/*` 에 두고, 한 앱에서만 쓰는 공통 코드는 `apps/*/src/modules/shared/` 에 둔다 — `packages/shared/*` 변경은 세 앱(CMS·Hospital Admin·Global CMS) 전부에 영향이 간다.  
  <sub>문서 · `.claude/architecture/shared.md`</sub>
- 레이아웃 컴포넌트(`BaseLayout`, `ListLayout`)는 독립 패키지가 아니라 `@safedoc/ui` 의 `src/layout/` 에 둔다.  
  <sub>문서 · `.claude/architecture/shared.md`</sub>
- entities 는 shared 레이어와 동일 레이어의 다른 entities 슬라이스만 import 할 수 있고, features 를 import 하지 않는다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>  
  <sub>왜: 동일 레이어 cross-reference 는 허용 (예: A 도메인 mutation 에서 B 도메인 리스트 invalidate)</sub>
- 도메인 객체를 표시하는 UI, 도메인 조회 API(queryOptions), 도메인 mutation 훅, 도메인 타입은 entities(`packages/entities/` 또는 `apps/*/modules/entities/`)에 배치한다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>
- entities 의 UI 는 표시 전용으로 만들고, 클릭·제출 같은 사용자 액션은 features 에서 처리한다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>
- entities 슬라이스는 flat(`{domain}/` 아래 api/model/types/ui/index.ts)으로 시작하고, 독립적 하위 개념이 생겨 타입/훅이 충돌할 때 sub-domain 구조(`common/` + sub-domain 폴더)로 승격한다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>
- entities 파일명은 `{sub-domain}.api.ts` / `{sub-domain}.options.ts` / `{sub-domain}.hook.ts` / `{sub-domain}.type.ts` 로 짓고 파일명에는 main-domain 없이 sub-domain 이름만 쓴다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>  
  <sub>왜: 파일 경로에 이미 main-domain 이 포함된다</sub>
- entities 의 `common/` 에는 여러 sub-domain 또는 외부 feature 가 공유하는 자산만 두고, sub-domain 하나에서만 쓰이면 그 sub-domain 내부로 옮긴다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>
- sub-domain 간 cross-reference 는 `common → sub` 일방향만 허용하고, sub → sub 직접 참조는 피해 `common` 으로 추출한다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>
- features 는 entities 와 shared 레이어만 import 하고, app/pages(`@/app/...`)를 import 하지 않는다.  
  <sub>문서 · `.claude/architecture/features.md`</sub>
- features → entities import 는 Public API(`index.ts`) 를 경유하고 내부 세그먼트로 deep import 하지 않는다.  
  <sub>문서 · `.claude/architecture/features.md`</sub>
- 사용자 인터랙션이 포함된 기능(검색 필터·테이블·모달), 여러 엔티티를 조합하는 복합 화면, 검색 파라미터/URL 상태 훅, 페이지 단위 UI 조립은 features(`packages/features/` 또는 `apps/*/modules/features/`)에 배치한다.  
  <sub>문서 · `.claude/architecture/features.md`</sub>
- features 네이밍은 UI 컴포넌트 `{Domain}{Role}.tsx`(도메인 prefix 유지), 훅 `{sub-domain}.hook.ts`, 상수 `constants.ts` 로 한다.  
  <sub>문서 · `.claude/architecture/features.md`</sub>  
  <sub>왜: 훅 파일은 경로에 main-domain 이 있으므로 sub-domain 만, UI 파일명은 충돌 방지를 위해 도메인 prefix 유지</sub>
- features 의 자산은 한 sub-domain 안에서 완결되도록 두고, 여러 sub-domain 이 같은 자산을 쓰기 시작하면 `common/` 으로 승격한다(sub-domain 간 직접 참조는 피한다).  
  <sub>문서 · `.claude/architecture/features.md`</sub>
- API query/mutation 정의·읽기 전용 Tag/Badge·서버 상태는 entities 에, 테이블/폼/모달/필터·URL 파라미터 및 화면 조합 훅·검색 파라미터/UI 상태는 features 에 둔다(예: `{Sub}StatusTag`·`useUpdate{Main}{Sub}` → Entities, `{Main}{Sub}Table`·`{Main}{Sub}Modal`·`use{Main}{Sub}SearchParams` → Features).  
  <sub>문서 · `.claude/architecture/features.md`</sub>
- flat/sub-domain 선택 기준, 레이어 계층, Public API 규칙의 단일 출처는 `/fsd` 스킬이고, `.claude/architecture/{shared,entities,features}.md` 는 각 레이어의 배치 원칙과 코드 패턴만 다룬다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>
- import는 상위 레이어에서 하위 레이어 방향으로만 한다 (app → pages → widgets → features → entities → shared).  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>  
  <sub>왜: FSD의 단방향 의존성 원칙</sub>
- 슬라이스는 index.ts(Public API)로만 외부에 노출하고 다른 슬라이스의 ui/·model/·api/·lib/ 로 deep import 하지 않는다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>  
  <sub>왜: 각 슬라이스는 index.ts를 통해서만 외부에 노출</sub>
- 같은 레이어의 슬라이스끼리는 import 해도 되지만 반드시 Public API(index.ts)를 경유한다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>
- shared 레이어는 외부 라이브러리만 import하고 entities/features 등 다른 FSD 레이어를 import하지 않는다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>
- entities는 features를 import하지 않는다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>
- sub-domain은 다른 sub-domain을 직접 참조하지 않고 공유 자산은 common/으로 승격한다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>
- 도메인은 flat 구조로 시작하고 독립적인 하위 개념·URL 분기·화면별 훅/상수 그룹이 생겼을 때만 sub-domain으로 승격한다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>  
  <sub>왜: 타입/훅 충돌이 생기고 한 폴더에 담기 어려워질 때가 승격 시점</sub>
- queryOptions 파일은 api/ 가 아니라 model/ 안에 두고 파일명은 복수형 `*.options.ts` 로 한다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>
- 세그먼트는 용도별로 나눈다 — 컴포넌트는 ui/, queryOptions·훅·변환 로직은 model/, API 호출 함수는 api/, 타입은 types/, 헬퍼는 lib/, 상수는 constants/.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>
- 한 슬라이스의 ui/ 에서 진입 뷰가 쓰는 building-block이 2~3개를 넘으면 form/·descriptions/·modal/ 같은 역할별 하위 폴더로 분리하고, 파일 이동은 git mv로 한다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>  
  <sub>왜: 히스토리 보존</sub>
- 컴포넌트 위치는 도메인/앱 의존도로 정한다 — 둘 다 무관하면 packages/shared, 도메인만 필요하면 packages/entities·features, 앱 특화면 apps/*/modules/features.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>
- entities에는 queryOptions·mutation 훅·읽기 전용 Tag/Badge와 서버 상태만 두고, 테이블·폼·모달·필터와 URL 파라미터·UI 상태는 features에 둔다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>  
  <sub>왜: 사용자 액션이 포함되면 features, 표시만 하면 entities</sub>
- safedoc-global-cms는 packages/entities·packages/features를 쓰지 않고 도메인 코드를 자기 src/modules/entities·features에 두며 공유는 @safedoc/ui·hooks·utils·types만 사용한다.  
  <sub>문서 · `.claude/skills/fsd/SKILL.md`</sub>
- packages에서 apps를 import하지 않는다 (apps → packages 방향만 허용).  
  <sub>문서 · `.claude/skills/agent-guide/SKILL.md`</sub>
- `*.type.ts` 파일에는 타입만 두고 함수/로직을 넣지 않는다.  
  <sub>문서 · `.claude/skills/agent-guide/SKILL.md`</sub>
- packages/shared/* 를 수정하면 세 앱(CMS·Hospital Admin·Global CMS) 전부, packages/entities·features를 수정하면 CMS·Hospital Admin 사용처를 grep해서 영향도를 확인한다.  
  <sub>문서 · `.claude/skills/agent-guide/SKILL.md`</sub>  
  <sub>왜: Global CMS는 packages/entities·features를 사용하지 않음</sub>
- 새 기능은 타입 정의 → Transfer Layer → API 함수 → Query Options → Mutation 훅 → 컴포넌트 순으로 만든다.  
  <sub>문서 · `.claude/skills/agent-guide/SKILL.md`</sub>
- id 식별자가 URL에 들어가는 뷰는 Modal이 아니라 Drawer(`DetailDrawer`)로 만들고, 메모·확인·짧은 폼 같은 단일 액션만 antd `Modal` 로 만든다.  
  <sub>문서 · `.claude/skills/modal/SKILL.md`</sub>
- 모달의 `open` 은 props로만 받고 내부 `useState(false)` + `forwardRef`/`useImperativeHandle` 로 노출하지 않는다.  
  <sub>문서 · `.claude/skills/modal/SKILL.md`</sub>
- 모달은 `<Modal destroyOnHidden>` 으로 사라질 때 폼/state가 자동 정리되게 한다.  
  <sub>문서 · `.claude/skills/modal/SKILL.md`</sub>
- click handler로 여는 모달/드로어는 `overlay.open` 을 쓰고 `overlayId` 는 지정하지 않는다.  
  <sub>문서 · `.claude/skills/modal/SKILL.md`</sub>  
  <sub>왜: 사용자 액션마다 새 인스턴스로 열어야 한다</sub>
- 상세와 수정은 별도 Drawer로 나누지 말고 하나의 `XxxDetailDrawerView` 안에서 `editMode` state로 조건부 렌더하며 `edit*Id` 같은 별도 param을 만들지 않는다.  
  <sub>문서 · `.claude/skills/drawer/SKILL.md`</sub>  
  <sub>왜: URL에는 "무엇을 보는가"(id)만 남기고 "어떻게 보는가"(모드)는 컴포넌트 state로 둔다 — 수정 상태는 공유·복원 대상이 아니다</sub>
- Drawer를 닫을 때 `handleClose` 에서 `editMode` 를 직접 리셋한 뒤 `onClose()` 를 호출한다.  
  <sub>문서 · `.claude/skills/drawer/SKILL.md`</sub>  
  <sub>왜: destroyOnClose는 자식만 destroy하므로 Drawer 자신의 state는 남는다</sub>
- 상세 Drawer 뷰는 도메인 feature 하위에 직접 두고 그 안에서 호출되는 보조 모달만 같은 feature의 `modal/` 로 분리한다.  
  <sub>문서 · `.claude/skills/drawer/SKILL.md`</sub>
- page.tsx는 조회하지 않는다 — 목록·표·통계는 스스로 조회하는 `XxxListView` 로 내리고 `QueryErrorBoundary` 로 감싼다.  
  <sub>커맨드 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: 바운더리를 걸 자리가 생기고, prop 드릴링이 사라지며, 재조회 범위가 좁아진다</sub>
- 페이지에는 브레드크럼·Tabs 뼈대·레이아웃·검색 필터 선언과 onSubmit·URL로 여는 상세 Drawer/Modal·정적 옵션 상수만 남기고 useQuery·표·인라인 columns·getPagination·목록 버튼과 뮤테이션은 ListView로 내린다.  
  <sub>커맨드 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: 페이지와 ListView는 data가 아니라 URL로 이어진다</sub>
- URL 파라미터로 열리는 상세 Drawer/Modal은 목록 안이 아니라 라우트에 선언해 목록과 형제가 되게 한다.  
  <sub>커맨드 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: 목록 조회가 실패해 section 폴백이 떠도 상세는 열려 있고, Tabs destroyOnHidden에서 패널이 헐려도 죽지 않으며, 여러 탭이 같은 드로어를 써도 중복 렌더가 없다</sub>
- 행 데이터를 들고 여는 오버레이만 예외적으로 그 목록 옆에 남긴다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: 라우트로 올리면 페이지가 목록을 다시 조회해야 해서 "page.tsx는 조회하지 않는다"를 깨뜨린다</sub>
- `modules/pages/` 레이어를 두지 않고 라우트가 곧 템플릿이며 화면을 이루는 컴포넌트는 features/ 슬라이스에 둔다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: 라우트의 추상화 레벨은 하나다</sub>
- `XxxListView` 가 이미 있으면 조회만 하는 `XxxListContainer` 래퍼를 얹지 않고 조회는 표를 그리는 컴포넌트 안에서 한다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>
- 탭마다 목록이 갈리는 화면은 조회에 `enabled` 를 달지 말고 `<Tabs destroyOnHidden>` 으로 활성 탭만 마운트한다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: antd Tabs는 한 번 연 패널을 계속 붙여둬 안 보는 탭까지 재조회된다; "마운트되면 조회한다"가 그대로 성립하고 컴포넌트는 탭을 몰라도 된다</sub>
- `if (isLoading) return null` 은 페이지가 아니라 ListView 안에 둔다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: 페이지에 두면 로딩 중 브레드크럼·탭까지 사라진다</sub>
- 뮤테이션 결과를 여러 구획이 쓰면 그건 조회가 아니므로 페이지에 남겨두고 props로 넘긴다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>
- 라우트에 조회·인라인 columns가 남았는지, 상세가 라우트 밖에 선언됐는지, 바운더리 없는 라우트가 있는지는 스킬의 grep 점검 명령으로 확인하고 앞의 세 명령 결과는 비어 있어야 한다.  
  <sub>커맨드 · `.claude/skills/page-composition/SKILL.md`</sub>
- FSD 레이어는 `shared < entities < features < widgets < pages < app` 순서이며, 자기보다 상위 레이어(rank가 큰 레이어)를 import 하면 `fsd/layer-imports` 위반이다 — 동일 레이어와 하위 레이어만 허용된다.  
  <sub>lint · `packages/config/eslint-config/fsd-boundaries.js`</sub>  
  <sub>왜: FSD(Feature-Sliced Design) 레이어 경계를 lint로 강제하는 자체 플러그인. 외부 의존성 없음. ESLint 9 flat config 전용.</sub>
- 같은 레이어의 같은 슬라이스 내부 import는 `fsd/layer-imports` 검사에서 제외한다(layer와 slice가 모두 같으면 무조건 통과).  
  <sub>lint · `packages/config/eslint-config/fsd-boundaries.js`</sub>  
  <sub>왜: 같은 슬라이스 내부는 자유</sub>
- 레이어 판정 경로 컨벤션은 `.../modules/<layer>/<slice>/<segment>/...` 이며(rootDir 기본값 `modules`), 이 패턴에 맞지 않는 파일(Next app 라우터 등 FSD 슬라이스 밖 파일)은 `fsd/layer-imports` 검사 대상이 아니다.  
  <sub>lint · `packages/config/eslint-config/fsd-boundaries.js`</sub>  
  <sub>왜: FSD 슬라이스 밖 파일(Next app 라우터 등)은 검사 안 함</sub>
- 레이어 경계 검사는 `import` 선언뿐 아니라 `export { x } from '...'`, `export * from '...'` 재수출에도 똑같이 적용한다.  
  <sub>lint · `packages/config/eslint-config/fsd-boundaries.js`</sub>
- 상대경로 import는 파일 기준 절대경로로 resolve 한 뒤 레이어를 판정하고, alias/절대경로(`@/modules/...`)는 import 문자열을 그대로 파싱하며, `modules/` 를 포함하지 않는 모듈은 외부 라이브러리로 보고 검사하지 않는다.  
  <sub>lint · `packages/config/eslint-config/fsd-boundaries.js`</sub>
- 각 Next 앱은 `src/modules/**/*.{ts,tsx}` 에 대해서만 `fsd/layer-imports` 를 'error' 로 켠다.  
  <sub>lint · `apps/safedoc-cms/eslint.config.mjs`</sub>  
  <sub>왜: FSD 레이어 경계 강제 (app 내부 modules)</sub>
- 슬라이스 Public API(`index.ts`) 경유 여부는 lint 로 검사하지 않는다 — fsd 플러그인에는 `layer-imports` 하나만 남기고 `public-api` 규칙은 제거했다.  
  <sub>lint · `packages/config/eslint-config/fsd-boundaries.js`</sub>  
  <sub>왜: 규칙: fsd/layer-imports — 하위 레이어만 import 허용 (상위 레이어 import 금지). (커밋 d06f377a5 "eslint-plugin-fsd-boundaries: layer-imports(upward)만 유지, public-api 규칙 제거")</sub>
- 패키지 단위 레이어 경계는 fsd 플러그인이 아니라 `no-restricted-imports` 패턴으로 막는다 — `packages/entities` 의 `src/**` 는 `@safedoc/features`, `@safedoc/features/*` 를 import 할 수 없다.  
  <sub>lint · `packages/entities/eslint.config.js`</sub>  
  <sub>왜: 패키지=레이어 경계: entities 는 상위 레이어 features 를 import할 수 없음 (CLAUDE.md 명문 규칙). 플러그인 주석에도 '패키지=레이어 경계는 이 플러그인 범위 밖'이라 적혀 있다.</sub>

### safedoc-usermall

- FSD 레이어 의존 방향은 app → pages → widgets → features → entities → shared 이며 상위 레이어만 하위를 import 한다.  
  <sub>문서 · `AGENTS.md`</sub>
- 슬라이스는 `ui` / `model` / `api` / `type(s)` / `lib` 세그먼트로 나누고, 외부 노출은 `index.ts` Public API 로만 한다.  
  <sub>문서 · `AGENTS.md`</sub>
- 읽기 전용 데이터 표현이면 entities, 사용자 상호작용/CUD 로직이면 features 에 둔다.  
  <sub>문서 · `AGENTS.md`</sub>
- App Router 라우트는 `src/app/` 에, 도메인 로직은 `src/modules/` 아래 FSD 레이어에 둔다.  
  <sub>문서 · `AGENTS.md`</sub>
- 레이어별 책임·구성·재사용 카탈로그는 각 레이어 폴더의 `modules/{shared,entities,features,widgets,pages,app}/CLAUDE.md` 에 정의한다 (해당 폴더 작업 시 자동 로드).  
  <sub>문서 · `AGENTS.md`</sub>
- app 레이어(`src/modules/app/`)는 전역 providers·layout·script·seo·styles·response 같은 앱 부트스트랩 코드만 담으며, FSD 최상위로 모든 레이어를 조합할 수 있다.  
  <sub>문서 · `src/modules/app/CLAUDE.md`</sub>
- `src/modules/app/` 은 Next.js App Router 라우트 폴더인 `src/app/` 과 다른 것으로, 라우트가 가져다 쓰는 앱 초기화 모듈이다.  
  <sub>문서 · `src/modules/app/CLAUDE.md`</sub>
- CKEditor 콘텐츠 스타일은 app 레이어의 전역 스타일이 아니라 `shared/ui/ck-content` 컴포넌트가 캡슐화한다.  
  <sub>문서 · `src/modules/app/CLAUDE.md`</sub>
- 환경별 동작은 `NEXT_PUBLIC_*` 환경변수로 분기한다.  
  <sub>문서 · `src/modules/app/CLAUDE.md`</sub>
- entities 레이어는 도메인 데이터의 표현/조회만 담당하고 상호작용(CUD)·비즈니스 로직은 features 로 올린다.  
  <sub>문서 · `src/modules/entities/CLAUDE.md`</sub>
- 새 도메인은 슬라이스 단위 폴더로 추가하고, 복잡한 슬라이스(reservation, program, treatment 등)는 슬라이스별 `CLAUDE.md` 를 둔다.  
  <sub>문서 · `src/modules/entities/CLAUDE.md`</sub>
- 도메인 타입은 `types/` 세그먼트에 정의하고 `api/`·`model/` 에는 타입 파일을 두지 않는다.  
  <sub>문서 · `src/modules/entities/CLAUDE.md`</sub>
- 트래킹 소비(`useAnalytics`/`AMPLITUDE_EVENTS`/트래킹 컴포넌트)는 `shared/analytics` 에서 import 하고, `features/analytics` 에는 entity 데이터를 읽는 impure 부분(`AnalyticsProvider`/`useAmplitude`/`useNotifly`/`*SearchList*`)만 남긴다.  
  <sub>문서 · `src/modules/features/CLAUDE.md`</sub>
- 여러 페이지에서 재사용되는 조합 UI 만 widgets 에 두고, 한 페이지 전용이면 `pages/{route}/ui` 로 내린다.  
  <sub>문서 · `src/modules/widgets/CLAUDE.md`</sub>
- 공용 단일 컴포넌트는 widgets 가 아니라 `shared/ui` 에 둔다.  
  <sub>문서 · `src/modules/widgets/CLAUDE.md`</sub>
- 페이지 컴포넌트는 `pages/{route}/ui/XxxPage.tsx` 형태로 두고, 그 페이지 전용 하위 컴포넌트도 같은 `ui/` 에 둔다.  
  <sub>문서 · `src/modules/pages/CLAUDE.md`</sub>
- 페이지는 조합·레이아웃에만 집중하고 재사용 로직은 features, 데이터 표현은 entities, 공용 UI 는 shared 로 내린다.  
  <sub>문서 · `src/modules/pages/CLAUDE.md`</sub>
- 한 곳에서만 쓰는 하위 컴포넌트를 공용으로 올리거나 단일 사용처용 추상화를 만들지 않는다.  
  <sub>문서 · `src/modules/pages/CLAUDE.md`</sub>
- shared 는 도메인 무관 공용 코드만 담고 다른 레이어를 import 하지 않으며, 어떤 레이어에서도 import 할 수 있다.  
  <sub>문서 · `src/modules/shared/CLAUDE.md`</sub>
- shared 의 외부 노출은 반드시 `index.ts` 배럴을 통해서만 하고, 새 공용 컴포넌트는 배럴에 export 를 추가한다.  
  <sub>문서 · `src/modules/shared/CLAUDE.md`</sub>
- 유틸 함수는 `shared/lib`·`shared/util` 에 두고 es-toolkit 을 우선 사용한다.  
  <sub>문서 · `src/modules/shared/CLAUDE.md`</sub>
- mock 모듈은 배럴이 아니라 파일을 직접 import 한다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 배럴을 거치면 devDependency 인 msw 가 프로덕션 모듈 그래프까지 딸려온다.</sub>
- MSW 핸들러·시드는 각 엔티티의 `mocks/` 세그먼트, MSW 인프라는 `shared/mocks`, 조립은 `modules/app/mocks` 에 둔다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: shared 는 entities 를 못 봐서 조립을 못 한다.</sub>
- 레이어 import 는 app → pages → widgets → features → entities → shared 단방향으로만 하고, 하위 레이어가 상위 레이어를 import 하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/architecture/SKILL.md`</sub>  
  <sub>왜: FSD 의 단방향 의존성 원칙</sub>
- 슬라이스는 `index.ts` Public API 로만 외부에 노출하고, 같은 레이어 슬라이스끼리도 내부 경로를 직접 import 하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/architecture/SKILL.md`</sub>  
  <sub>왜: 각 슬라이스는 index.ts 를 통해서만 외부에 노출한다는 FSD Public API 원칙</sub>
- 컴포넌트는 도메인 의존이 없으면 `shared/`, 도메인 의존이 있고 읽기 전용이면 `entities/[domain]/`, 도메인 의존 + 인터랙션(CUD)이면 `features/[domain]/` 에 둔다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/architecture/SKILL.md`</sub>  
  <sub>왜: entities 는 읽기 전용 데이터 표현, features 는 상호작용/복잡한 비즈니스 로직 담당</sub>
- 슬라이스 세그먼트는 ui(React 컴포넌트) / model(상태·훅·Query Options·스키마) / api(IO만) / types(타입) / lib(헬퍼) 로 역할을 나눈다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/architecture/SKILL.md`</sub>
- 도메인 타입·API request/response 타입·enum 은 `types/{name}.type.ts` 또는 `{name}.enum.ts` 에 정의하고, `api/*.api.type.ts`·`model/*.type.ts` 형태의 타입 파일은 만들지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/architecture/SKILL.md`</sub>  
  <sub>왜: api/ 는 IO만 담당하고 model/ 은 상태·훅만 두기 때문</sub>
- 신규 슬라이스의 타입 세그먼트는 legacy 단수 `type/` 이 아니라 항상 복수 `types/` 로 만든다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/architecture/SKILL.md`</sub>  
  <sub>왜: 기존 슬라이스 다수가 쓰는 legacy type/ 을 점진적으로 types/ 로 이동하는 중</sub>
- 새 코드를 추가할 때 기존 슬라이스에 속하는지 먼저 확인하고, 없을 때만 적절한 레이어에 슬라이스를 신설한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/architecture/SKILL.md`</sub>
- 같은 레이어의 두 슬라이스가 서로의 배럴을 참조하지 않도록 공용 값을 양쪽이 의존하는 제3의 슬라이스(도메인 의존 없으면 shared, 있으면 적절한 entities)로 내리고, 타입만 필요하면 `import type` 을 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/architecture/SKILL.md`</sub>  
  <sub>왜: 배럴 순환 참조는 모듈 로드 시점에 값을 읽는 코드(z.nativeEnum, 상수 계산)에서 아직 평가되지 않은 export 를 undefined 로 읽어 조용히 깨진다</sub>
- 배럴에 클라이언트 훅·서버 전용 코드·API 호출이 섞여 있고 가져오려는 것이 의존성 거의 없는 순수 헬퍼라면, Public API 대신 정의 파일을 직접 import 한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/architecture/SKILL.md`</sub>  
  <sub>왜: 배럴이 관련 없는 무거운 모듈을 함께 끌고 오기 때문</sub>
- `*.server.ts` 서버 전용 모듈은 슬라이스 배럴에 `export *` 하지 않고 소비처에서 파일을 직접 import 한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: .server.ts 는 파일명 규칙일 뿐 번들러 경계가 아니어서, 클라이언트 컴포넌트가 배럴을 참조하면 서버 전용 코드가 클라이언트 번들로 딸려오고 node:async_hooks 같은 Node builtin 이 섞이면 빌드가 끊긴다</sub>
- 비즈니스 로직·상태·데이터 연동은 `useXxx` hook 에 모으고 컴포넌트 본문에는 fetch/분기 로직을 늘어놓지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 로직은 hook, UI는 컴포넌트</sub>
- 사용처가 한 곳뿐인 로직을 위해 공용 컴포넌트에 prop 을 추가하지 말고 호출부 안에서 해결한 뒤, 두 번째 사용처가 실제로 생길 때 공용으로 올린다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 단일 호출부를 위한 공용 API 확장은 표면적만 늘리고 재사용 근거가 없다</sub>
- 파일명은 컴포넌트만 PascalCase(`MyComponent.tsx`)이고 훅·유틸·타입·API·스키마 파일과 폴더는 kebab-case(`domain.hook.ts`, `domain.helper.ts`, `program.type.ts`, `program.api.ts`, `program.schema.ts`, `my-feature/`)로 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>
- entity API 함수는 `src/modules/entities/<entity>/api/<entity>.api.ts` 에 `fetch<Entity><Action>` 이름으로 두고 반환 타입을 `Promise<...>` 로 명시하며 `response.data` 만 반환한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>
- 트래킹 소비용 공용 API(`useAnalytics`, `AMPLITUDE_EVENTS`, `ClickAmplitudeEvent` 등)는 `@/modules/shared/analytics` 에서 import 하고, entity 데이터를 읽어 enrich 하는 impure 부분만 `@/modules/features/analytics` 에 둔다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/analytics/SKILL.md`</sub>  
  <sub>왜: entities 포함 모든 레이어에서 import 가능해야 하므로</sub>
- BottomSheet 본체는 `features/<feature>/ui/bottom-sheet/XxxBottomSheet.tsx` 별도 파일로 분리하고 호출자에 inline `<BottomSheet.Root>` 를 작성하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/bottom-sheet/SKILL.md`</sub>
- 페이지 레이어(`app/.../page.tsx`)에서만 쓰는 시트는 `app/.../_components/` 에 둔다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/bottom-sheet/SKILL.md`</sub>

## 상태·데이터 (74)

### safedoc-react

- 필드명("treatmentStatus" 등)의 기술적 의미만 보고 동작을 단정하지 말고, 그 필드를 변경하는 호출지점(버튼 onClick, mutation)을 grep 해 실제 트리거를 확인한 뒤 데이터 의미를 해석한다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 데이터 모델보다 UX 흐름이 먼저다</sub>
- queryKey 는 상수로 빼지 말고 인라인 문자열 + `compact([...])` 로 쓴다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>  
  <sub>왜: /query-key 스킬</sub>
- 조회는 호출처에서 `useQuery({main}{Sub}ListOptions(params))` 로 직접 하고 `useXxxList` 같은 query 래퍼 훅은 만들지 않는다 — `*.hook.ts` 에는 mutation 훅만 둔다.  
  <sub>문서 · `.claude/architecture/entities.md`</sub>  
  <sub>왜: /react-query 스킬</sub>
- features 훅은 entities 훅을 새로 만들지 말고 URL 파라미터·페이지 상태를 주입해 호출하는 래퍼로 작성한다.  
  <sub>문서 · `.claude/architecture/features.md`</sub>  
  <sub>왜: Entities 훅에 화면 맥락을 주입</sub>
- useEffect는 구독·외부 SDK 초기화·디바운스 fetch·로깅/URL 동기화 같은 React 바깥 세상 연결에만 쓰고, 파생 상태·prop→state 복사·서버 데이터→폼 주입은 effect로 만들지 않는다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: "값이 바뀌면 다른 값을 맞춰주는" 동기화 코드는 effect가 아니다</sub>
- prop이 바뀔 때 내부 state를 되돌려야 하면 렌더 시점 비교로 처리하되 prev는 조건 밖에서 항상 갱신하고 값 반영만 조건부로 한다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 조건 안에 prev 갱신을 넣으면 'A' → '' → 'A' 처럼 falsy를 거쳐 돌아올 때 동기화를 놓친다</sub>
- localStorage·window를 렌더 중에 읽어야 하면 마운트 후 setState 하는 effect 대신 `useIsHydrated()`(@safedoc/hooks) 게이트 안에서 렌더한다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 렌더가 한 번 덜 돈다</sub>
- 남겨 둔 useEffect에는 왜 effect여야 하는지 한 줄 주석을 단다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 없으면 다음 사람이 "지울 수 있는 것"으로 읽는다</sub>
- 조회 옵션은 `queryOptions` 함수(`*.options.ts`)로 정의하고 호출처에서 `useQuery(xxxOptions(params))` 를 직접 쓴다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>
- 조건부 조회는 `enabled: !!x` 대신 `queryFn: x ? () => fetch(x) : skipToken` 으로 보류한다.  
  <sub>타입 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: non-null assertion 없이 타입이 좁혀지고 data 타입이 T | undefined 로 안전하게 추론된다</sub>
- 객체 파라미터는 `Partial<Req>` 로 받아 const 구조분해 후 `&&` 가드를 걸고 spread 뒤 좁혀진 값을 덮어써서 `as` 캐스팅 없이 처리한다.  
  <sub>타입 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: params.x 처럼 속성 직접 접근은 queryFn 클로저 안에서 타입이 다시 넓어져 as를 부르게 된다</sub>
- `useQuery` 를 그대로 감싸는 래퍼 훅(`useXxxDetail`)을 만들지 않고 entity에는 options만 export한다.  
  <sub>커맨드 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 래퍼는 isFetching·refetch 등 반환값을 가리고 호출별 override를 막으며 예측 가능성을 떨어뜨린다; 기존 코드에 래퍼가 남아 있어도 위반 사례이므로 따라하지 않는다</sub>
- 여러 useQuery를 조합하거나 파생값을 계산하는 훅은 래퍼가 아니므로 남긴다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>
- 제출/클릭 핸들러 안에서 `queryClient.ensureQueryData()`·`fetchQuery()` 로 값을 끌어오지 말고 필요한 값은 eager `useQuery` 로 들고 있다가 판단한다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: ensureQueryData/fetchQuery는 select가 적용되지 않아 raw 응답 구조에 의존하게 되고 선언적 캐시 흐름을 벗어난다</sub>
- mutationFn의 baseURL이 `SAFEDOC_SUB_API_URL`(V3)이면 `useMutation` 대신 `useV3Mutation` 을 쓴다.  
  <sub>타입 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: V3 에러 형식(SafedocV3AxiosError의 response.data.detail.resMsg)을 타입 안전하게 꺼낼 수 있다</sub>
- mutation 훅은 useMutation 결과를 그대로 반환하고 `onSubmitNew` 처럼 변수명을 리매핑하지 않는다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: mutateAsync/isPending 같은 표준 API를 가린다</sub>
- mutation 훅의 onSuccess에 `router.push` 를 넣지 않고 네비게이션은 호출 컴포넌트에서 한다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 화면 전환 책임이 entity 훅에 새어든다</sub>
- create/update가 같은 upsert API를 써도 훅은 `useCreateX`/`useUpdateX` 로 분리하고 새 id로 이동하는 router.push는 create 플로우에만 둔다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: update 훅이 create를 겸하면 수정 시에도 네비게이션이 터진다</sub>
- 새 mutation은 7개 부수효과 체크리스트(연관 query key 전부 무효화·도메인 넘는 무효화·로딩/에러 UI·에러 메시지·서버 비동기 후속 작업·낙관적 업데이트·모달 close 타이밍)를 통과해야 머지한다.  
  <sub>커맨드 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 캐시 무효화/에러 처리/로딩 UI를 1차 구현에서 빠뜨리고 후행 fix로 보강하는 패턴이 반복됐다</sub>
- 리스트 페이지네이션은 `getPagination(data?.criteria, total)` 로 만들고 총건수 필드는 V2 `totalCnt` / V3 `totalCount` 로 구분해서 쓴다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: V3에서 습관적으로 totalCnt를 쓰면 total이 undefined가 된다</sub>
- 서버 페이지를 넘나드는 다중 선택은 `rowSelection={{ preserveSelectedRowKeys: true }}` 로 유지하고, pagination을 false로 두지 말고 항상 page/size를 API에 전달한다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 클라이언트 단일 페이지는 데이터가 size를 넘으면 잘린다</sub>
- kubb/orval/openapi-typescript 같은 generic codegen 도구를 도입하지 않고 swagger JSON을 읽어 직접 작성한다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: x-enum-varnames 없으면 enum 멤버를 값 그대로 내보내 기존 사용처를 깨고 생성물 커밋·alias 브릿지 같은 마찰만 더한다</sub>
- queryKey 문자열을 위한 `XXX_QUERY_KEY` 상수를 선언하지 않고 options 함수 안에 인라인 문자열(fetch 함수명)로 둔다.  
  <sub>커맨드 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: queryKey의 단일 출처는 options 함수</sub>
- queryKey에 optional param이 하나라도 들어가면 es-toolkit `compact(...)` 로 감싼다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: compact 없이 optional을 넣으면 무인자 무효화 키가 ['fetchX', undefined] 라 실제 쿼리와 어긋난다</sub>
- queryKey에 0이 들어갈 수 있으면(0-based id 등) compact 대신 `.filter((key) => !isNil(key))` 를 쓴다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: compact는 0·'' 도 제거한다</sub>
- 캐시 무효화는 `queryClient.invalidateQueries(xxxOptions())` 단축형으로 하고 `.queryKey` 를 따로 꺼내지 않는다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: invalidateQueries/cancelQueries/getQueriesData/refetchQueries는 filters 객체를 받고 여분 필드를 무시한다(TanStack 공식 패턴)</sub>
- `setQueryData`/`getQueryData` 만 예외적으로 `xxxOptions(id).queryKey` 를 쓴다.  
  <sub>타입 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: 이 둘은 filters가 아니라 (queryKey, ...) 시그니처다</sub>
- options 함수 인자는 api 함수와 같은 모양으로 받고 `enabled`·화면 전용 플래그를 options 안으로 끌어들이지 않는다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: 그건 호출부 사정이라 스프레드로 얹는다</sub>
- URL → 요청 params 변환은 options가 아니라 호출부에 두고 options는 완성된 params만 받는다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: options가 URL 스키마·화면 상태를 알게 하지 않는다</sub>
- 조회는 전부 options 함수로 정의하고 inline `useQuery({ queryKey: [...] })` 나 화면 파일의 raw-string 키 배열을 새로 쓰지 않는다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>
- 옵션 함수를 optional로 바꿀 때 기존 queryKey 모양을 그대로 유지해 동작 중인 쿼리와 키가 어긋나지 않게 한다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: 무인자일 때만 prefix가 되도록 각 요소를 falsy로 만든 뒤 compact로 거른다</sub>
- 여러 쿼리를 덮던 우산 prefix를 특정 options 하나로 바꾸지 말고 덮던 옵션을 전부 나열해 무효화한다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: 무효화 범위가 줄어든다</sub>
- 조건에 따라 다른 options를 무효화할 때는 인라인 삼항 대신 if/else로 분기해 각 분기에서 단축형을 쓴다.  
  <sub>타입 · `.claude/skills/query-key/SKILL.md`</sub>  
  <sub>왜: 삼항으로 넘기면 두 옵션의 DataTag 브랜딩이 union이 되어 invalidateQueries 타입과 충돌한다</sub>
- 래퍼 훅을 호출처로 옮길 때 래퍼가 isFetching을 isLoading으로 바꿔 내보내던 경우 `isFetching: isLoading` 으로 받아야 동작이 같다.  
  <sub>문서 · `.claude/skills/query-key/SKILL.md`</sub>
- 모달에서 API 호출은 `fetch*` 직접 호출이 아니라 도메인 mutation 훅으로 하고 캐시 무효화는 훅 내부에서 한다.  
  <sub>문서 · `.claude/skills/modal/SKILL.md`</sub>
- 같은 조회를 여러 구획이 쓰면 각자 부르게 두고, 파라미터 조립이 길면 훅 하나로 묶어 나눠 쓴다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: queryKey가 같으면 요청은 한 번이다</sub>
- 바운더리 밖(탭 라벨·버튼 행)에서 부르는 조회만 `throwOnError: false` 로 낮춘다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>
- HTTP 클라이언트는 `axios` 를 직접 import하지 말고 `@safedoc/utils` 의 `createInstance()` 로 만들며 V3는 `createInstance({ options: { baseURL: SAFEDOC_SUB_API_URL } })` 로 만든다.  
  <sub>문서 · `.claude/skills/api/SKILL.md`</sub>
- API 파일은 `<entity>/api/<entity>.api.ts` 에 두고 조회는 `fetch<Entity><Action>`, mutation은 HTTP 메서드 접두사(`post`/`put`/`delete`/`patch`)로 이름 짓는다.  
  <sub>문서 · `.claude/skills/api/SKILL.md`</sub>
- API 함수는 `response.data`(봉투로 감싸면 `response.data.data`)만 반환하고 반환 타입을 `Promise<...>` 로 명시한다.  
  <sub>타입 · `.claude/skills/api/SKILL.md`</sub>
- 응답 타입은 `@safedoc/types` 의 `TGlobalResponse`/`TGlobalListResponse`(V3는 `TV3GlobalListResponse`)로 감싸 명시한다.  
  <sub>타입 · `.claude/skills/api/SKILL.md`</sub>

### safedoc-usermall

- 응답 검증 스키마는 `api/<entity>.schema.ts` 로 `<entity>.api.ts` 와 나란히 두고 API 호출을 `parseApiResponse` 로 감싼다 (스키마는 DTO 와 정확히 일치할 필요 없는 근사치).  
  <sub>문서 · `src/modules/entities/CLAUDE.md`</sub>
- `z.nativeEnum` 에 넘길 enum 은 배럴이 아니라 `types/` 에서 직접 가져온다.  
  <sub>문서 · `src/modules/entities/CLAUDE.md`</sub>  
  <sub>왜: 배럴을 거치면 모듈 로드 시점에 순환 참조가 생긴다.</sub>
- entity 의 조회는 `queryOptions` 패턴으로 작성한다.  
  <sub>문서 · `src/modules/entities/CLAUDE.md`</sub>
- `useMutation` 은 UI 컴포넌트 내부에서 직접 호출해도 되고, 여러 곳에서 재사용할 때만 hook 으로 추출한다.  
  <sub>문서 · `src/modules/features/CLAUDE.md`</sub>
- MSW 사용 시 서버는 `globalThis.fetch` 를 MSW 로 고정한다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: Next 가 나중에 fetch 를 다시 덮어쓰면 raw fetch 호출만 mock 을 지나쳐 실제 API 로 샌다.</sub>
- 입력값처럼 자주 바뀌는 상태는 부모로 올리지 말고 그 입력 컴포넌트가 자체 `useState` 로 보유한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 부모로 올리면 타이핑마다 형제(목록 등)까지 리렌더된다</sub>
- 의존성 배열에 있지만 effect 를 다시 돌릴 이유가 없는 값(트래킹 함수·라우터·폼 setter·인라인 콜백·렌더마다 새로 만들어지는 객체)은 `useEffectEvent` 로 빼고 의존성에 넣지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 새 배열 참조 등으로 같은 화면에서 이벤트가 중복 발사되는 것을 막는다</sub>
- `memo`/`forwardRef` 로 감싼 컴포넌트에는 `useEffectEvent` 를 쓰지 않는다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: React 19.2 가 이 경우 구현체를 리렌더 때 갱신하지 않아 마운트 시점 클로저에 고정되고 옛 값을 조용히 읽는다 — `shared/hooks/use-effect-event.test.tsx` 가 이 동작을 고정한다</sub>
- 트래킹 effect 는 `trackAmplitudeEvent` 를 의존성 배열에 남기고 `useEffectEvent` 로 빼지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: `useAnalytics().trackAmplitudeEvent` 는 초기화 전 no-op 이라 참조 교체가 '이제 발사 가능' 신호이고, 의존성에서 빼면 SDK 초기화 전 1회만 돌아 이벤트가 유실된다</sub>
- HTTP 인스턴스는 axios 를 직접 import 하지 말고 `@/modules/shared/api` 의 `createHttpClient()` 로 만든다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>
- 서버(SSR)에서는 기본적으로 토큰을 첨부하지 않고, 회원별 응답을 SSR prefetch 에서도 받아야 하는 호출만 요청 단위 옵션 `useServerCookie: true` 로 켠다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: `cookies()` 를 호출하면 해당 경로가 dynamic 으로 전환돼 sitemap 등 정적 생성이 깨진다</sub>
- `queryFn` 에 api 함수를 직접 넘기지 말고 `() => fetch(..., true)` 형태로 감싼다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: React Query 의 `QueryFunctionContext` 가 첫 인자로 들어가 `useServerCookie` 가 truthy 가 된다</sub>
- `'use cache'` 스코프 안의 API 호출은 반드시 `runAsBackgroundRequest` 로, 서버 queryClient 의 prefetch/ensure 는 `runAsPrefetchRequest` 로 감싼다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: 캐시 스코프에서 `headers()` 를 읽으면 Next 가 프리렌더 오류로 기록해 빌드가 깨지고, try/catch 로 잡아도 기록이 남으며 dev 서버에서는 통과해 `next build` 에서만 드러난다</sub>
- Amplitude SDK 를 직접 호출하지 말고 `useAnalytics()` 훅 또는 래퍼 컴포넌트를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/analytics/SKILL.md`</sub>
- 이벤트명은 문자열 리터럴로 쓰지 말고 `AMPLITUDE_EVENTS` enum 에 snake_case 값으로 추가한 뒤 사용하며, `view_*`/`click_*`/`*_complete` 접두·접미 관용을 따른다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/analytics/SKILL.md`</sub>
- 클릭 트래킹만 필요하면 핸들러를 만들지 말고 `ClickAmplitudeEvent` 로 감싸며, 이 래퍼는 `click_*` 이벤트에만 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/analytics/SKILL.md`</sub>  
  <sub>왜: Slot 기반이라 자식의 onClick 과 합성된다</sub>
- Query option 파일은 `model/<entity>.api.option.ts` 로 통일하고 queryKey 첫 요소는 fetch 함수명을 그대로 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/react-query/SKILL.md`</sub>
- 쿼리는 `queryOptions()` factory 패턴으로 정의한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 재사용 + `invalidateQueries` 에도 활용하기 위해</sub>
- `useQuery(xxxOption(...))` 한 줄을 감싸기만 하는 1-deps 래퍼 훅을 만들지 말고 소비처에서 직접 호출하며, `select` 나 기본 파라미터는 `queryOptions` 안에 넣는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 래퍼 훅에 넣으면 소비처마다 select 가 흩어지고 prefetch/invalidateQueries 재사용 시 가공이 빠진다 — 여러 쿼리를 조합하는 복잡한 파생 상태는 훅으로 묶어도 된다</sub>
- 조건부 쿼리에는 `enabled` 를 붙인다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/react-query/SKILL.md`</sub>
- mutation 성공 후에는 `invalidateQueries` 로 관련 캐시를 무효화한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/react-query/SKILL.md`</sub>
- `useMutation` 은 UI 컴포넌트(`ui/*.tsx`) 내부에서 직접 호출해도 되고, 여러 컴포넌트가 재사용하거나 model 레이어에서 다뤄야 할 때만 `model/*.hook.ts` 로 추출하며 리뷰에서 hook 으로 빼라고 지적하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 한 곳에서만 쓰는 mutation 을 hook 파일로 빼는 것은 과한 추상화 (useQuery 는 queryOptions 패턴 유지로 별개 규칙)</sub>
- Server Component prefetch 에서 `new QueryClient()` 를 직접 만들지 말고 `@/modules/shared/lib` 의 `getQueryClient()` 를 쓰며 Next.js 16 의 `params` 는 반드시 `await` 한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: getQueryClient 는 React `cache` 기반으로 요청 단위 공유; params 가 Promise 이기 때문</sub>
- 무한 스크롤은 `useInfiniteQuery` + `useInView` 조합으로 만들고 `getNextPageParam`·`infiniteSetData` 공유 헬퍼를 `@/modules/shared/lib` 에서 가져다 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/infinite-scroll/SKILL.md`</sub>
- 무한 스크롤 옵션은 `model/*.api.option.ts` 에 `infiniteQueryOptions` 로 분리하는 것을 권장하고, 페이지 기반이면 `cursorKey: 'page'` 를 명시한다(기본값 `'cursor'`).  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/infinite-scroll/SKILL.md`</sub>
- IntersectionObserver threshold 는 선행 로딩 여유가 필요하면 `0.1`, sentinel 이 닿는 즉시 감지하려면 `0` 을 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/infinite-scroll/SKILL.md`</sub>
- 서버 데이터는 Zustand 가 아니라 React Query 로 다루고 Zustand 는 전역 클라이언트 상태에만 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/zustand/SKILL.md`</sub>
- 스토어는 도메인 무관 공용 상태면 `src/modules/shared/lib/stores/`, 특정 feature/entity 상태면 해당 슬라이스 `model/<name>.store.ts` 에 둔다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/zustand/SKILL.md`</sub>
- 스토어에서 여러 속성을 한 번에 꺼낼 때는 반드시 `useShallow` 를 쓰고 단일 값은 선택자만 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/zustand/SKILL.md`</sub>  
  <sub>왜: 객체를 새로 생성해 무한 리렌더가 나는 것을 방지</sub>
- 영속이 필요한 스토어는 `persist` 를 씌우고 전부 저장할 필요가 없으면 `partialize` 로 좁히며, 세션 한정이면 `storage` 를 sessionStorage 로 직접 지정한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/zustand/SKILL.md`</sub>  
  <sub>왜: 기본 storage 는 localStorage</sub>
- 리액트 컨텍스트 밖(헬퍼 함수·이벤트 콜백)에서는 훅 대신 `store.getState()`/`store.setState()` 를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/zustand/SKILL.md`</sub>
- 날짜/시간은 dayjs 를 직접 import 하지 말고 `@/modules/shared/model` 의 `Timestamp` 클래스를 쓰며, 꼭 필요하면 `timestamp.helper.ts` 에서 re-export 된 dayjs 를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/timestamp/SKILL.md`</sub>  
  <sub>왜: 한국어 로케일·Asia/Seoul 타임존·필요한 플러그인이 모두 설정돼 있다</sub>
- 날짜 포맷 문자열은 직접 쓰지 말고 `DATE_TIME_FORMAT` 상수를 `toFormattedString({ format })` 에 넘긴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/timestamp/SKILL.md`</sub>

## URL·라우팅 (40)

### safedoc-react

- features 슬라이스의 sub-domain 승격 기준은 URL 분기이며, sub-domain 디렉토리 이름은 URL 세그먼트와 1:1 로 매핑한다.  
  <sub>문서 · `.claude/architecture/features.md`</sub>  
  <sub>왜: 특정 URL 에 문제가 있을 때 바로 해당 모듈을 찾을 수 있다</sub>
- 모달·상세 안의 부속 테이블도 URL 기반 PaginationTable로 하되 `paramsKey={{ pageKey: '{용도}PageNumber', pageSizeKey: '{용도}PageSize' }}` 전용 키를 지정한다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 기본 키(pageNumber/pageSize)와 겹치면 드로어 뒤 목록 페이지가 같이 움직인다</sub>
- URL 쿼리 파라미터는 검증 없이 흘리지 말고 `entities/{domain}/model/{domain}-search-params.schema.ts` 의 zod 스키마로 한 번 거른 뒤 `z.infer` 로 타입을 파생한다.  
  <sub>타입 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: URL은 사용자가 고치거나 오래된 링크로 들어오는 입력이고, 손으로 쓴 인터페이스는 런타임에 아무것도 막지 못한다</sub>
- 화면이 URL에 싣는 키(필터 name·typeName·startName·endName·subName, 커스텀 필터 키, 드로어 id, 서브탭 키, 조회 훅만 읽는 키, 페이지/정렬 키)를 스키마에 전부 적는다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 제출 핸들러가 { ...currentParams, ...values } 로 URL을 다시 만들기 때문에 스키마에 없는 키는 검색 한 번에 사라진다</sub>
- 검색 파라미터 스키마는 필드마다 `.catch(undefined)` 를 붙인다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: parseSearchParams는 한 필드만 어긋나도 fallback으로 전체를 떨어뜨려 나머지 조건이 다 날아간다</sub>
- `pageNumber`/`pageSize` 스키마에 `.default()` 를 박지 않고 값이 없으면 없는 채로 둬 매퍼·PaginationTable이 기본값을 정하게 한다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 기본 페이지 크기가 화면마다 달라 검색할 때마다 URL에 pageSize가 실려 페이지당 건수가 바뀐다</sub>
- 검색 파라미터 enum은 서버 enum이 아니라 기존 URL이 통과하는 넓은 쪽으로 잡고, API가 내려주는 동적 id는 `z.string()` 으로 둔다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 화면 옵션과 서버 enum이 어긋난 경우가 있어 서버 기준으로 좁히면 지금 돌아가는 URL이 깨진다</sub>
- boolean 계열 파라미터는 문자열로 다뤄 체크박스·Select multiple은 `createListParamSchema(z.enum(['true','false']))`, Radio·Select single은 `z.enum(['true','false']).optional()` 로 정의한다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 필드마다 단일/배열이 갈리므로 UI를 보고 정한다</sub>
- URL 파싱은 훅 안이면 `useTypedQueryParams({ schema })`, 옵션 함수·순수 매퍼면 `parseSearchParams` 를 쓴다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>
- `useTypedQueryParams` 는 순서 인자가 아니라 객체 하나(`{ schema, pick?, fallback? }`)로 호출한다.  
  <sub>타입 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 순서 인자면 fallback만 주려 해도 pick을 같이 써야 해서 기본값이 무의미해진다</sub>
- `..._SEARCH_PARAMS_FALLBACK` 상수는 스키마에 `.default()` 가 걸려 출력 타입이 필수가 될 때만 만들고 빈 객체 상수는 선언하지 않는다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 훅/헬퍼가 이미 {} 를 기본값으로 쓴다</sub>
- 어느 화면에 얹힐지 모르는 공용 컴포넌트(PaginationTable 등)만 예외로 `qs.parse(useSearchParams().toString())` 로 URL 문자열을 그대로 병합한다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 스키마를 알 수 없어 거르면 그 화면의 다른 조건이 페이지를 넘기는 순간 사라진다</sub>
- 요청 타입이 실제 전송값과 다르면(선언은 boolean인데 체크박스가 ['true']를 보냄) 값을 바꾸지 말고 선언을 실제 전송값에 맞춘다.  
  <sub>타입 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 값을 바꾸면 동작이 바뀐다</sub>
- 매퍼에서 `Number(currentParams.pageNumber) || 1` 처럼 다시 변환하지 않는다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 스키마의 z.coerce.number()가 이미 확정한다</sub>
- 파싱 결과를 useCallback deps로 쓰면서 안정된 참조를 기대하지 않는다.  
  <sub>문서 · `.claude/skills/query-params/SKILL.md`</sub>  
  <sub>왜: 매 렌더 새 객체다 — useQuery는 키를 해시하므로 무해하지만 메모이제이션은 안 걸린다</sub>
- 검색 필터는 `createSearchFilter(schema)` 로 만들고 타입 인자가 아니라 스키마를 넘긴다.  
  <sub>타입 · `.claude/skills/search-filter/SKILL.md`</sub>  
  <sub>왜: 폼 타입과 URL 검증 규칙이 갈라질 수 없고 폼 초기값이 검증된 값으로 채워진다</sub>
- 필터 설정 배열이나 레거시 `SearchFilterLayout` 을 새로 쓰지 않고 Keyword·Fields·Select·Checkbox·Radio·Date·DateRange·ScrollSearch·Field 프리미티브를 쓴다.  
  <sub>문서 · `.claude/skills/search-filter/SKILL.md`</sub>
- 상위·하위 값을 서로 다른 서버 파라미터로 보내는 2단 선택은 `Cascader` 의 `name` 과 `subName` 을 쓴다.  
  <sub>문서 · `.claude/skills/search-filter/SKILL.md`</sub>
- 옵션을 조회로 받아오는 필터는 페이지에서 useQuery 하지 말고 앱의 `widgets/search-filter` 위젯이 조회를 안에 갖게 한다.  
  <sub>문서 · `.claude/skills/search-filter/SKILL.md`</sub>  
  <sub>왜: 루트 SearchFilter가 에러 바운더리라 검색바만 폴백이 되고 목록은 살아 있다; 페이지에서 부르면 throwOnError 때문에 화면 전체가 죽는다</sub>
- 검색 필터 폼 값의 단일 출처는 URL이고, URL이 바뀌면 루트가 `form.resetFields()` 로 폼을 다시 채운다.  
  <sub>문서 · `.claude/skills/search-filter/SKILL.md`</sub>  
  <sub>왜: 뒤집으면 제출 전 입력이 URL이 바뀌는 순간(페이지 이동·드로어 열기 포함) 사라진다</sub>
- 검색 제출은 현재 URL과 폼 값을 합쳐 `pageNumber: 1`, `arrayFormat: 'repeat'` 로 갱신한 뒤 그 화면의 목록 쿼리를 무효화한다.  
  <sub>문서 · `.claude/skills/search-filter/SKILL.md`</sub>  
  <sub>왜: 같은 조건으로 다시 검색하면 URL이 안 바뀌어 queryKey도 그대로라 재조회를 강제해야 한다</sub>
- 탭마다 다른 쿼리를 그리는 화면은 검색 제출 시 탭 쿼리를 전부 무효화한다.  
  <sub>문서 · `.claude/skills/search-filter/SKILL.md`</sub>
- URL 트리거 Drawer는 부모 render tree에 `<Detail open={!!id} onClose={() => removeQueryParams.removeByKey(...)} />` 로 선언하고 `useEffect` + `overlay.open` + `overlayId` 가드 패턴을 쓰지 않는다.  
  <sub>문서 · `.claude/skills/drawer/SKILL.md`</sub>  
  <sub>왜: params 있음↔Drawer 열림이 render tree와 일치하고, slide-out 애니메이션이 정상 재생되며, 새로고침·뒤로가기·공유 시 다시 열린다</sub>
- Drawer 열림 상태를 `useState<number | null>` 로컬 state로 두지 않는다.  
  <sub>문서 · `.claude/skills/drawer/SKILL.md`</sub>  
  <sub>왜: URL 흐름과 분리돼 새로고침 시 닫히고 외부 컴포넌트가 같은 Drawer를 트리거할 수 없다</sub>
- Drawer에서 저장이 성공하면 `setEditMode(false)` 로 상세로 복귀하고 `router.push` 로 URL을 바꾸지 않는다.  
  <sub>문서 · `.claude/skills/drawer/SKILL.md`</sub>
- Drawer를 여는 id는 화면 조회조건 스키마에 `z.coerce.number().int().positive().optional().catch(undefined)` 로 두고 `useTypedQueryParams` 로 읽는다.  
  <sub>문서 · `.claude/skills/drawer/SKILL.md`</sub>  
  <sub>왜: 스키마에 없는 키는 검색 한 번에 사라진다</sub>

### safedoc-usermall

- Path alias 는 `@/` → `./src/` 를 쓰고 App Router 는 `@/app/` 으로 참조한다 (`@app/` 는 정의만 돼 있고 미사용).  
  <sub>타입 · `AGENTS.md`</sub>
- Next 16 은 뒤로가기 복귀 시 페이지를 다시 마운트하지 않고 이전 state 를 복원하므로, "한 번 하고 나면 끝"인 화면은 마운트 effect 에서 일회성 화면 state 를 초기화한다.  
  <sub>문서 · `src/modules/pages/CLAUDE.md`</sub>  
  <sub>왜: 완료 state 가 되살아나 조작이 막히고 그 state 를 조건으로 걸어둔 안내까지 함께 막혀 아무것도 못 하는 상태가 되기 쉽다. 실제 완료 여부는 서버·쿠키가 알고 있다.</sub>
- 뒤로가기 복귀 감지 용도로 `popstate` 리스너를 쓰지 않는다.  
  <sub>문서 · `src/modules/pages/CLAUDE.md`</sub>  
  <sub>왜: popstate 리스너는 화면이 숨겨질 때 effect cleanup 으로 떨어져 복귀 시점에 동작하지 않는다.</sub>
- 뒤로가기 복원 시 state 를 되돌릴 때는 애니메이션 컨트롤러의 시각 상태(`controls.set(...)`)도 같이 되돌린다.  
  <sub>문서 · `src/modules/pages/CLAUDE.md`</sub>  
  <sub>왜: framer-motion `useAnimationControls` 등 애니메이션 컨트롤러도 함께 복원된다.</sub>
- 클릭 시 페이지 이동하는 카드/리스트 아이템은 호출부에서 `<Link>` 로 감싸거나 `onClick + router.push` 를 받지 말고 컴포넌트 레이아웃 루트 자체를 `next/link` 의 `Link` 로 만들고 `href` prop 을 받는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>
- 카드 루트 Link 는 `prefetch={false}` 와 `scroll={true}` 를 명시하고, 카드 내부 인터랙션 요소는 핸들러가 있을 때만 `event.preventDefault()` 로 링크 이동을 막는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 리스트에 카드가 여러 장 렌더되므로 프리페치를 끈다</sub>
- 빌드/프리렌더 문제가 보여도 `export const dynamic = 'force-dynamic'` 을 추가하지 말고 진짜 원인(`'use client'` 누락 등)을 고치며, 한 번 제거된 `force-dynamic` 을 복구하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: `(auth-check)` 하위 라우트는 쿠키/헤더 접근으로 이미 request-time dynamic 이라 중복이다</sub>
- URL 쿼리 스트링을 만들 때 템플릿 리터럴(`?key=value`) 대신 `qs.stringify(params, { addQueryPrefix: true })` 를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/qs/SKILL.md`</sub>
- searchParams 는 `useTypedQueryParams({ schema })` 로 zod 스키마를 붙여 읽는다(`useQueryParams` 는 제거됨).  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/qs/SKILL.md`</sub>  
  <sub>왜: any 를 반환하던 훅이 제거됐다</sub>
- 쿼리 파라미터 스키마와 `fallback` 은 인라인이 아니라 모듈 상수로 둔다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/qs/SKILL.md`</sub>  
  <sub>왜: 렌더마다 새 참조가 되면 파싱 결과 참조가 매번 바뀌고 파싱이 다시 돈다</sub>
- 쿼리 파라미터 값 프리미티브는 `shared/util/url-param-schema` 의 `urlStringSchema`/`urlStringArraySchema`/`urlFiniteNumberSchema`/`urlNumberArraySchema`/`urlBooleanSchema`/`strictUrlNumberSchema` 를 재사용한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/qs/SKILL.md`</sub>
- 반복 키(`subRegion=A&subRegion=B`)와 qs 인덱스 키(`subRegion[0]=A`)는 훅이 같은 배열로 모아주므로 호출부에서 정규화하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/qs/SKILL.md`</sub>
- 현재 URL 을 통째로 다시 실어 보내는 왕복 화면(공유 링크·탭 전환·필터 토글)의 스키마에는 `.passthrough()` 를 붙인다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/qs/SKILL.md`</sub>  
  <sub>왜: zod 가 스키마에 없는 키를 잘라내 URL 파라미터가 조용히 유실된다</sub>
- 쿼리 파라미터 스키마는 한 화면에서만 쓰면 그 파일 상단 모듈 상수로, 여러 화면이 공유하면 슬라이스의 헬퍼 파일에 둔다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/qs/SKILL.md`</sub>

## 폼 (32)

### safedoc-react

- 폼 재초기화는 `<Form key={...}>` 로 하지 않고, `useForm()` 을 부르는 컴포넌트째 keying 하거나 `form.resetFields()` 를 쓴다.  
  <sub>테스트 · `AGENTS.md`</sub>  
  <sub>왜: rc-field-form 스토어는 useForm() 인스턴스에 붙어 있어 Form 엘리먼트가 언마운트돼도 남고, 재마운트 시 merge(initialValues, store) 로 이전 store 가 이긴다 (SE-2731 에서 key 로 바꿨다가 예약 상세 메모·견적금액이 옛 값으로 남는 회귀 발생)</sub>
- 새 폼은 antd `Form`/`Form.useForm<T>()` 대신 `@safedoc/ui`의 `createTypedForm<T>()` 로 만든 타입드 폼을 쓴다.  
  <sub>타입 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 제네릭 antd 폼은 레거시; createTypedForm은 name/반환값/입력값을 폼 값 타입 T 기준으로 좁혀 준다</sub>
- Form.List 내부 Form.Item의 상대경로 name만 antd `Form.Item`을 그대로 쓰고, 절대경로 접근(setFieldValue·useWatch)은 타입드 폼으로 처리한다.  
  <sub>타입 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 상대경로 name은 루트 타입으로 표현되지 않는다</sub>
- 필드를 비울 때는 폼 값 타입을 optional로 바꾸지 말고 `setFieldValue(name, undefined)` 로 처리한다.  
  <sub>타입 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 억지로 optional로 바꾸면 하위 소비자가 깨진다</sub>
- 서버-클라이언트 데이터 변환은 컴포넌트에서 직접 하지 말고 `*.transfer.ts` 의 serverToClient / clientToServer / getInitialValues 로 분리한다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>
- 폼 필드명은 `*.type.ts` 의 FORM_NAME enum으로 관리하고 폼 값 타입도 그 enum 키로 정의한다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>
- 수정 폼의 id는 제출 핸들러에서 `{ ...values, id: data.id as number }` 로 끼워넣지 말고 hidden `Form.Item name="id"` 로 둔다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: initialValues로 자동 채워져 제출값에 포함되고 as 캐스팅이 사라진다</sub>
- 임시저장/발행처럼 제출 버튼이 여러 개면 useRef로 폼 밖에 상태를 두지 말고, 눌린 버튼이 hidden `Form.Item` 으로 등록된 status 필드를 setFieldValue로 채운 뒤 submit한다.  
  <sub>테스트 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: rc-field-form은 등록된 필드만 수집하므로 hidden Form.Item이 없으면 onFinish values에 실리지 않아 '발행'을 눌러도 DRAFT로 저장되는 버그가 났다</sub>
- 제출 콜백 시그니처는 `onSubmit(values)` 하나로 두고 `(values, status)` 같은 곁가지 인자를 만들지 않는다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 호출부는 values.status를 쓴다</sub>
- 저장 body 스펙에 없고 별도 PATCH API로 처리하는 필드는 clientToServer()에 포함하지 않고 transfer 테스트로 회귀를 막는다.  
  <sub>테스트 · `.claude/skills/form/SKILL.md`</sub>
- `shouldUpdate` 는 전체 갱신 대신 `(prev, cur) => prev[FIELD] !== cur[FIELD]` 로 특정 필드 비교만 하고 `noStyle` 과 함께 쓴다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 모든 필드 변경 시 리렌더링되는 것을 막는다</sub>
- validation 실패는 `onFinishFailed` 에서 첫 번째 에러 메시지를 `message.warning` 으로 노출하고 `message.error` 를 쓰지 않는다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: validation 실패는 사용자 입력 오류이고 error는 서버/시스템 오류용</sub>
- `scrollToFirstError` 와 `onFinishFailed` 를 함께 쓰고 onFinishFailed 핸들러는 인라인으로 둔다(useCallback·별도 타입 선언 불필요).  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 둘은 독립적으로 동작한다</sub>
- 금액·수량 InputNumber는 단위를 `suffix` 로 넣고 `controls={false}`, 천 단위는 `formatter={formatNumber}`(@safedoc/utils)를 쓰며 `addonAfter` 나 커스텀 formatter/parser를 새로 만들지 않는다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: addonAfter는 회색 박스로 분리된다; 프로젝트 표준 PriceInfoFormItem 패턴</sub>
- 이미지 폼 값은 fileId만 두지 말고 `{ fileId, url }` 한 값으로 담고 위젯은 그 값만 그린다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 출처가 둘이면 수정 화면에서 값은 멀쩡한데 썸네일만 안 뜨는 상태가 생긴다</sub>
- 썸네일이 깨져도 fileId는 지우지 않는다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 값이 비면 저장할 때 멀쩡한 이미지가 통째로 날아간다</sub>
- 업로드 확정(complete)은 파일을 고를 때마다가 아니라 폼 저장 때 한 번에 호출한다.  
  <sub>문서 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 고를 때마다 부르면 저장하지 않고 닫은 파일까지 전부 확정돼 남는다</sub>
- 이미지 목록을 받는 API에서는 배열 순서를 그대로 orderNo로 보내고 맨 앞을 대표로 삼으며 별도 "대표 지정" UI를 두지 않는다.  
  <sub>테스트 · `.claude/skills/form/SKILL.md`</sub>  
  <sub>왜: 서버가 대표를 정확히 하나만 받으므로 배열 순서가 곧 계약이다</sub>
- 폼 제출은 `form.validateFields()` 수동 호출이 아니라 `<Form onFinish>` 로 한다.  
  <sub>문서 · `.claude/skills/modal/SKILL.md`</sub>
- 폼이 있는 URL 트리거 Drawer에는 `drawerProps={{ destroyOnClose: true }}` 를 준다.  
  <sub>문서 · `.claude/skills/drawer/SKILL.md`</sub>  
  <sub>왜: URL 트리거 Drawer는 항상 mount 상태라 form.isFieldsTouched 같은 상태가 다음 open까지 남는다</sub>
- Drawer의 `askBeforeClose` 는 폼이 있으면 `form.isFieldsTouched`, 없으면 boolean으로 준다.  
  <sub>문서 · `.claude/skills/drawer/SKILL.md`</sub>

### safedoc-usermall

- 폼은 React Hook Form + Zod 로 작성하고, 다단계 플로우는 `funnel`, 전역 상태는 `zustand` 패턴을 따른다.  
  <sub>문서 · `src/modules/features/CLAUDE.md`</sub>
- 폼은 `@/modules/shared/model` 의 `useZodForm({ schema, defaultValues, mode })` 로 만들고 zodResolver 를 직접 붙이지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/form/SKILL.md`</sub>
- Zod 스키마는 `model/*.schema.ts` 로 분리하고 폼 타입은 `z.infer<typeof schema>` 로 추론한다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/form/SKILL.md`</sub>
- 필드 간 조건부 검증은 `superRefine` 에서 `ctx.addIssue({ path, code, message })` 로 처리한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/form/SKILL.md`</sub>
- 커스텀 입력 컴포넌트는 `Controller` 로 래핑해 `field`/`fieldState` 를 넘긴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/form/SKILL.md`</sub>
- 폼을 여러 컴포넌트로 쪼갤 때는 `FormProvider` + `useFormContext<TForm>()` 를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/form/SKILL.md`</sub>
- 서버 데이터로 폼을 초기화할 때는 `reset(data)` 를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/form/SKILL.md`</sub>
- 폼 mutation 의 에러는 `onError` 에서 `toast.warning(SafedocError.getMessage(error))` 로 처리한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/form/SKILL.md`</sub>
- 회원가입·리뷰 작성처럼 여러 단계를 거치는 화면은 step 을 `useState` 로 직접 관리하지 말고 공용 `useFunnel` 을 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/funnel/SKILL.md`</sub>
- `@use-funnel/core` 를 직접 import 하지 말고 `@/modules/shared/model/funnel` 의 `useFunnel` 을 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/funnel/SKILL.md`</sub>  
  <sub>왜: 공용 `base-funnel.hook.ts` 가 in-memory history 로 createUseFunnel 을 구성해 둔 것</sub>
- 스텝 렌더링은 `funnel.Render` 에 스텝 이름을 prop 키로 매핑하고, 스텝 전환은 `funnel.history.replace/push/go` 로만 한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/funnel/SKILL.md`</sub>

## 에러·로깅 (33)

### safedoc-react

- Query 에러는 `throwOnError: true` + `<ErrorBoundary>` 전역 fallback 으로 처리하고, mutation 에러는 호출처별 `onError` 에서 명시적으로 처리한다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>  
  <sub>왜: mutation 은 호출처가 컨텍스트를 가지고 UX 메시지 톤이 다르다</sub>
- 네트워크/타임아웃 처리와 401 자동 로그아웃은 axios interceptor 에 이미 구현돼 있으므로 손대지 않는다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>
- V3 API(`SAFEDOC_SUB_API_URL`)는 `useV3Mutation` 을 쓰고 메시지를 `response?.data?.detail?.resMsg` 에서, V2 API(`SAFEDOC_API_URL`)는 `useMutation` 을 쓰고 `error.response?.data?.resMsg`(fallback `getErrorMessage(error)`)에서 뽑는다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>
- 에러 메시지 추출 시 optional chaining 을 끝까지 붙인다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>  
  <sub>왜: 네트워크 에러/타임아웃 등 비정형 응답에서 response 또는 하위 필드가 undefined 일 수 있다</sub>
- 에러 메시지 fallback 은 기본 메시지 문자열로 두고 빈 문자열 fallback 은 쓰지 않는다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>  
  <sub>왜: 빈 문자열 fallback 은 빈 토스트를 띄운다</sub>
- 에러 표시는 상황별로 나눈다 — 폼 제출 실패는 `modal.error()`, 비동기 백그라운드 작업 실패는 `message.error()`, 페이지 진입 데이터 로드 실패는 `<ErrorBoundary>` fallback, 서버 인풋 검증은 `Form.Item` 의 `help` + `validateStatus="error"`.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>
- 같은 도메인에서 여러 mutation 이 비슷한 에러 메시지를 다루면 `packages/entities/src/{domain}/lib/{domain}.error.ts` 헬퍼로 추출한다(권장).  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>
- `onError` 를 빈 함수로 두거나 `console.log(error)` 만 찍고 끝내지 않는다 — 사용자에게 실패를 숨기는 행위다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>
- V3 mutation 에서 `error.message` 만 쓰지 않는다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>  
  <sub>왜: V3 응답 형식을 무시하게 된다</sub>
- 모든 에러를 `<ErrorBoundary>` 에 위임하지 않는다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>  
  <sub>왜: mutation 은 호출처가 컨텍스트를 가짐</sub>
- 모달 안에서 mutation 이 실패하면 모달을 close 하지 않고 유지한다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>  
  <sub>왜: 새 mutation 체크리스트 항목</sub>
- mutation 에러 처리 전체 코드 예시는 `/react-query` 스킬의 "Mutation 패턴" 절이 단일 출처이며 정책 문서에 복제하지 않는다.  
  <sub>문서 · `.claude/policies/error-handling.md`</sub>
- mutation onError의 메시지 fallback으로 빈 문자열을 쓰지 않고, 메시지가 없으면 띄우지 않거나 기본 메시지를 쓴다.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 빈 토스트가 뜬다</sub>
- 에러 메시지 추출 시 optional chaining을 끝까지 적용한다 — V3는 `response?.data?.detail?.resMsg`, V2는 `error.response?.data?.resMsg`.  
  <sub>문서 · `.claude/skills/react-query/SKILL.md`</sub>  
  <sub>왜: 네트워크 에러/타임아웃 등 비정형 응답에서 response 또는 하위 필드가 undefined일 수 있다</sub>
- `QueryErrorBoundary` 의 variant는 감싸는 대상으로 정하고(구획 section / Drawer·Modal overlay / 컴포넌트 하나뿐인 라우트 page) name은 `'라우트경로:컴포넌트명'` 으로 짓는다.  
  <sub>커맨드 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: QueryErrorBoundary는 DOM 노드를 만들지 않아 Flex 자식을 감싸도 레이아웃이 그대로다</sub>
- overlay variant 바운더리에는 `onError={() => removeByKey('id')}` 로 URL을 정리한다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>
- `overlay.open`/`openAsync` 호출부를 `QueryErrorBoundary` 로 다시 감싸지 않는다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>  
  <sub>왜: @safedoc/ui의 overlay가 이미 withBoundary로 감싸고 unmount()로 껍데기까지 걷어낸다; 직접 감싸면 close(=isOpen만 false)로 잘못 걷어내기 쉽다</sub>
- 에러 메시지는 `error.response...` 를 직접 파고들지 말고 `@safedoc/utils` 의 `getErrorMessage(error)` 로 추출한다.  
  <sub>문서 · `.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: 응답 인터셉터는 에러를 별도 에러 클래스로 변환하지 않고 AxiosError를 그대로 throw한다</sub>
- `overlay-kit` 에서 `overlay` 를 직접 import 하지 않고 `@safedoc/ui` 에서 가져온다(`OverlayProvider` 는 그대로 overlay-kit 에서 가져온다).  
  <sub>lint · `packages/config/eslint-config/base.js`</sub>  
  <sub>왜: overlay-kit 의 overlay 는 OverlayProvider 자리에서 모달을 그려 화면의 에러 바운더리 바깥에 놓인다. @safedoc/ui 가 재수출하는 쪽은 바운더리로 감싸져 있어, 모달이 터져도 앱 전체가 죽지 않는다.</sub>
- `packages/shared/ui/src/error/overlay.tsx` 한 파일에서만 `no-restricted-imports` 를 off 로 풀어 overlay 원본을 가져올 수 있다.  
  <sub>lint · `packages/shared/ui/eslint.config.js`</sub>  
  <sub>왜: 바운더리로 감싼 overlay 를 만드는 곳 자체 — 원본을 가져올 수 있는 유일한 파일이다</sub>

### safedoc-usermall

- 전송/요청 실패 같은 사용자 피드백은 인라인 에러 상태를 직접 그리지 말고 공용 토스트(`toast.warning`/`success`/`point`)를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>
- API 응답은 `parseApiResponse(스키마, response)` 로 감싸 검증하되, parse 결과로 값을 갈아끼우지 않고 원본을 그대로 통과시킨다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: zod 는 스키마에 안 적은 키를 버리므로 결과를 반환하면 멀쩡하던 화면이 깨진다</sub>
- 스키마 불일치 로그에 어느 호출인지 손으로 적지 않고 axios `config` 의 메서드·URL 에서 뽑는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: 손으로 적으면 경로가 바뀔 때 로그만 옛 값으로 남는다</sub>
- 응답 봉투는 `globalResponseSchema`/`globalListResponseSchema`/`emptyResponseSchema`/`listCriteriaSchema` 를 쓰고, 봉투 없이 배열/객체가 오는 엔드포인트는 `z.array(itemSchema)` 를 그대로 넘긴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>
- DTO 스키마는 `api/` 세그먼트에 `<entity>.schema.ts` 로 두고, 타입의 `foo?: T`·`T | null` 과 서버가 실제로 비워 보내는 칸은 `.nullish()` 로 적는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: 없는 칸을 required 로 적으면 정상 응답마다 불일치가 찍혀 진짜 사고가 로그에 묻힌다</sub>
- 스키마 로그가 시끄러우면 스키마를 지우지 말고 해당 필드를 `.nullish()` 로 낮춘다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>
- 스키마를 쓴 뒤에는 추측으로 두지 말고 dev 응답(`curl ... | jq`)으로 한 번 맞춰본다.  
  <sub>커맨드 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: 목록 응답이 상세 전용 칸을 null 로 내려주는 식의 차이를 놓친다</sub>
- 서버가 값을 계속 늘리는 칸(포인트 적립 액션·약관 타입·신고 사유)은 enum 대신 `z.string()` 으로 적는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: 화면이 함께 내려온 라벨을 그대로 쓰기 때문</sub>
- `z.nativeEnum(...)` 에 넘길 enum 은 배럴이 아니라 타입 세그먼트(`../type/*.enum`)에서 직접 import 한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: 스키마는 모듈 로드 시점에 만들어져 배럴을 거치면 순환 참조로 enum 이 아직 undefined 다</sub>
- 두 엔티티가 서로의 스키마를 참조하면 공통 조각을 `program-common.schema.ts` 같은 leaf 파일로 빼서 순환을 끊는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>
- 응답 본문을 쓰지 않는 호출(`Promise<void>`)과 필드가 전부 optional 인 DTO 는 스키마 검증하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: 불일치가 화면에 영향이 없어 로그만 늘거나, 스키마가 무엇도 걸러내지 못한다</sub>
- 에러 메시지는 `error.response...` 를 직접 파고들지 말고 `SafedocError.getMessage(error)` 로 뽑는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api/SKILL.md`</sub>  
  <sub>왜: 응답 인터셉터가 모든 API 에러를 SafedocError 로 변환하며 서버 resMsg 를 우선 사용</sub>
- URL 을 다시 쓰는 왕복 화면과 같은 URL 을 여러 컴포넌트가 나눠 읽는 화면은 필드별 `.catch(...)` 를 쓰고, 그 외 읽기 전용 화면은 `.catch` 없이 `fallback` 을 전달한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/qs/SKILL.md`</sub>  
  <sub>왜: 값 하나가 어긋나 전체가 fallback 이 되면 나머지 파라미터를 잃거나 목록과 필터 UI 가 어긋나고, 읽기 전용은 잘못된 딥링크가 조용히 무시되지 않고 CloudWatch 에 남아야 한다</sub>

## 테스트 (53)

### safedoc-react

- 동작을 바꾸는 리팩토링은 바꾸기 전 계약을 테스트로 먼저 고정한다 — 나중에 쓰면 새 동작을 박제할 뿐 회귀를 못 잡는다.  
  <sub>테스트 · `AGENTS.md`</sub>
- 이미 리팩토링을 끝낸 뒤라면 git 이력의 옛 동작을 기준으로 테스트를 쓰고, 프로덕션 코드를 일부러 깨뜨려 그 테스트만 실패하는지(뮤테이션 체크) 확인한다.  
  <sub>테스트 · `AGENTS.md`</sub>
- 테스트 파일은 소스 파일 바로 옆에 두고 `__tests__/` 같은 별도 디렉토리를 만들지 않는다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>
- `describe` 는 함수명/컴포넌트명 그대로 쓰고 번역하지 않으며, `it` 은 한국어 평서문 "~해야 한다" 로 쓴다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>
- vitest globals가 켜진 앱에서도 `import { describe, expect, it } from 'vitest'` 를 명시한다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>
- vitest 설정 파일은 packages/* 는 `vitest.config.ts`, apps/* 는 `vitest.config.mts` 로 둔다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 앱 package.json에 type이 없어 .ts는 CJS로 읽혀 ERR_REQUIRE_ESM으로 죽는다</sub>
- 시간에 의존하는 로직은 `test.env.TZ = 'Asia/Seoul'` 과 `vi.useFakeTimers()` + `vi.setSystemTime()` 으로 고정하고 `getUTCDay()` 는 쓰지 않는다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 로컬 타임존·현재 시각에 기대면 CI에서 깨지고, getUTCDay()는 KST 자정에서 전날을 가리킨다</sub>
- 통합 테스트에서 제출 로직을 흉내 낸 harness 컴포넌트를 만들지 말고 실제 프로덕션 컴포넌트를 렌더한다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 테스트가 만든 사본을 검증하면 프로덕션 컴포넌트가 깨져도 초록불이 뜬다</sub>
- MSW는 `onUnhandledRequest: 'error'` 이므로 뷰와 모든 자식 컴포넌트의 useQuery·xxxOptions( 를 grep해 실제 호출 엔드포인트를 전부 등록하고 추측하지 않는다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 하나라도 핸들러에 없으면 테스트가 죽는다</sub>
- MSW 핸들러 응답은 api 함수의 반환 타입으로 판별해 봉투면 `ok(data)`, RAW DTO면 `HttpResponse.json(store)` 로 준다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: RAW 엔드포인트를 ok()로 감싸면 select/convertToFormData에서 깨진다</sub>
- `enabled` 가 걸린 인증 훅(useUserInfo 등)은 `importOriginal` 부분목으로 갈아끼운다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 목하지 않으면 로딩이 끝나지 않아 drawer가 Spin에 고정된다</sub>
- MSW 시드 id는 추측하지 말고 `shared/api/mock/handlers/*.handler.ts` 에서 실제 값을 읽어 쓴다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 추측하면 404가 나고 데이터가 없어 엉뚱한 실패로 보인다 (도메인마다 다르다)</sub>
- MSW 핸들러는 서버 DTO·@AssertTrue의 제약을 그대로 검사해 실서버와 같은 코드로 거절하고, 추측한 제약은 넣지 않는다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 무엇이든 받아주는 목은 계약 위반을 통과시킨다 — 실제로 목이 200을 주는 동안 실서버에서 등록이 계속 400이었다</sub>
- 실서버에 붙는 `*.live.test.ts` 는 마지막 수단이고, 계약이 어긋난 걸 발견하면 live 테스트를 새로 만들지 말고 목과 기존 테스트를 서버에 맞춰 고친다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>
- 위젯 스텁의 접근성 이름은 값이 생겨도 바뀌지 않게 고정하고 상태는 별도 텍스트로 보여주며, 스텁이 넣는 id는 상수로 export해 payload를 고정값으로 단언한다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 라벨이 바뀌면 두 번째로 누르려는 테스트가 버튼을 못 찾아 깨진다</sub>
- jsdom이 못 보는 동작(dnd 드래그 등)은 드래그 자체 대신 그것이 만들어내는 계약을 transfer 레벨에서 단언하고, 브라우저 확인이 필요한 범위는 보고할 때 그대로 말한다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: jsdom에는 레이아웃이 없어 모든 요소의 좌표·크기가 0이다</sub>
- 병렬 처리 테스트는 목의 완료 순서가 입력 순서와 반대가 되도록 만들어 순서 보장을 검증한다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 우연히 빠른 순서로 끝나면 잘못된 구현도 통과한다</sub>
- 렌더 대기는 Drawer 타이틀 같은 정적 텍스트가 아니라 시드 데이터 값 같은 데이터 의존 요소로 기다린다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 정적 텍스트는 데이터 없이도 떠서 대기 조건이 되지 못한다</sub>
- 콜드스타트에서는 정적 라벨을 넉넉한 timeout으로 먼저 기다린 뒤 useWatch로 채워지는 동적 값을 단언한다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 첫 테스트 파일은 transform 캐시가 없어 antd 트리 렌더가 기본 findBy* 1000ms를 넘길 수 있다</sub>
- `DrawerFooter.Submit` 제출은 `modal.confirm` 내용 문구로 기다린 뒤 같은 이름의 버튼 중 마지막(모달 확인)을 누르고, 성공 문구가 안 뜨면 통과가 아니라 검증 실패로 보고 원인을 찾는다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: jsdom에서 findByRole('dialog')는 불안정하고, 성공 문구가 없으면 onFinishFailed → message.warning으로 조용히 막힌 것이다</sub>
- 막힌 필수 필드는 시드로 눈속임하지 말고 실제 UI 상호작용으로 채운다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 그래야 프로덕션 폼 검증과 연결된다</sub>
- URL 값이 있는 상황은 `src/modules/shared/test/navigation-mock.ts` 의 `setMockSearchParams()` 로 만들고 `vitest.setup.ts` 의 전역 스텁 기본 동작은 건드리지 않는다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 기본 동작을 바꾸면 기존 테스트가 전부 깨진다</sub>
- 새로 쓴 테스트는 프로덕션 코드를 일부러 깨뜨려 해당 테스트만 실패하는지 확인하고 반드시 원복하는 뮤테이션 체크를 거친다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>  
  <sub>왜: 실패하지 않으면 그 테스트는 아무것도 지키지 못하고 있다</sub>
- 테스트를 통과시키려고 단언을 삭제하거나 약화시키지 않고, 실패가 프로덕션 버그를 가리키면 그 사실을 보고한다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>
- 구현을 그대로 따라 쓴 토톨로지 단언(`expect(fn(x)).toBe(fn(x))`)을 만들지 않고, 고정 리스트를 map으로 돌려 케이스를 생성하지 말고 직접 나열한다.  
  <sub>테스트 · `.claude/skills/test/SKILL.md`</sub>

### safedoc-usermall

- 뒤로가기 state 복원 케이스는 E2E 로 "이동 → 뒤로가기" 시나리오를 반드시 덮는다.  
  <sub>테스트 · `src/modules/pages/CLAUDE.md`</sub>  
  <sub>왜: 새로고침은 초기화되므로 로컬 확인이나 새로고침으로는 재현되지 않는다.</sub>
- 테스트 파일은 대상 파일 옆에 co-locate 하고(`Foo.tsx` ↔ `Foo.test.tsx`), `it` 은 `~해야 한다` 로 서술한다.  
  <sub>테스트 · `AGENTS.md`</sub>
- E2E 스펙은 `@playwright/test` 가 아니라 `e2e/support/test` 의 `test`/`expect` 를 import 한다.  
  <sub>테스트 · `AGENTS.md`</sub>  
  <sub>왜: dev 오버레이 숨김과 MSW 워커 대기가 이 fixture 에 들어 있어, 직접 import 하면 둘 다 빠진 채로 돈다.</sub>
- E2E 라우트 예열은 직접 `page.goto` 로 훑지 말고 `e2e/support/warm-up` 의 `warmUpRoutes` 로 한다.  
  <sub>테스트 · `AGENTS.md`</sub>  
  <sub>왜: 인증 게이트가 걸린 경로는 로그인 없는 예열 페이지에서 리다이렉트되며 이동을 `net::ERR_ABORTED` 로 끊는데, 직접 goto 하면 그 예외가 beforeAll 실패로 잡혀 스위트가 통째로 죽는다.</sub>
- `/api/mock/state` 가 404 면 `.next` 가 stale 한 것이므로 `rm -rf .next` 후 재기동한다.  
  <sub>테스트 · `AGENTS.md`</sub>  
  <sub>왜: mocking 을 끈 채로 켠 적 있는 디렉토리(특히 새 worktree)는 `pageExtensions` 가 `mock.ts` 를 뺀 결과가 캐시돼 있어, dev:mock 으로 다시 띄워도 상태 브리지 라우트가 생기지 않는다.</sub>
- E2E 서버는 dev API CORS allowlist(3000/3001/3002/3031/8080) 에 있는 포트로만 띄운다.  
  <sub>테스트 · `AGENTS.md`</sub>  
  <sub>왜: allowlist 밖 포트로 띄우면 API 가 전부 막혀 스펙이 통째로 실패한다.</sub>
- 테스트는 `.nvmrc` 의 Node v24.15.0 에서 실행한다(`nvm use` 먼저).  
  <sub>테스트 · `AGENTS.md`</sub>  
  <sub>왜: jsdom 27 이 ESM 전용 의존성을 require 해서 require(esm) 미지원 Node(20.19 미만, 22.0~22.11)에서는 vitest 가 기동조차 안 된다.</sub>
- Playwright E2E 는 CI 에 연동돼 있지 않으므로 로컬에서 직접 돌린다.  
  <sub>테스트 · `AGENTS.md`</sub>
- vitest 는 `src/**` 만 include 하고 Playwright 스펙은 `e2e/` 에 두어 두 러너가 겹치지 않게 한다.  
  <sub>테스트 · `AGENTS.md`</sub>
- 테스트 파일은 대상 파일 옆에 co-locate 하고 별도 `__tests__` 폴더를 만들지 않는다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: `vitest.config.mts` 의 include 가 `src/**/*.{test,spec}.{ts,tsx}` 이기 때문</sub>
- `describe` 는 대상(함수/컴포넌트)명으로, `it` 은 기대 동작을 `~해야 한다` 로 서술하며 `it.each` 도 `%s 는 ~해야 한다` 형태로 쓴다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>
- 테스트는 mocking 없이 순수하게 검증 가능한 대상(`lib/` 헬퍼, `shared/util`·`shared/model`, Zod 스키마·URL 파라미터, Zustand 스토어, props 로만 동작하는 컴포넌트)을 우선한다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>
- App Router 서버 컴포넌트와 Provider 를 5개씩 요구하는 컴포넌트는 단위 테스트하지 말고, 그 안의 계산 로직을 `lib/` 순수 함수로 추출해 그것을 테스트한다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: 서버 컴포넌트는 단위 테스트로 검증 불가한 E2E 영역이고, mocking 비용이 assert 대비 과하다</sub>
- 새 테스트를 붙였으면 대상 코드를 잠깐 망가뜨려 빨갛게 뜨는지 확인한다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: 통과만 보고 넘어가면 아무것도 검증하지 않는 테스트가 남는다</sub>
- 머신 TZ 에 의존하는 테스트를 쓰지 않는다(TZ 는 `vitest.config.mts` 에서 Asia/Seoul 로 고정돼 있다).  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: `Timestamp.midnight()` 등이 로컬 타임존을 타 머신마다 결과가 갈린다</sub>
- 시간 고정은 `vi.useFakeTimers()` + `vi.setSystemTime()` 으로 하고 `afterEach` 에서 `vi.useRealTimers()` 로 반드시 복구한다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>
- Zustand 스토어는 훅을 렌더링하지 말고 `getState()` 로 직접 검증하며 `beforeEach` 에서 `setState` 로 초기화하고, fixture 생성 함수는 action 래퍼 안에 숨기지 말고 호출부에 드러낸다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: 스토어 action 은 참조가 안정적이라 상단에서 한 번 꺼내 써도 된다</sub>
- RTL 쿼리는 `getByRole`/`getByText` 등 접근성 기준을 우선하고 `data-testid` 는 다른 방법이 없을 때만 쓰며, 상태는 DOM 속성으로 확인하고 비동기 변화는 `waitFor` 로 기다린다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: `@core` 컴포넌트는 wrapper 없이 그냥 렌더된다</sub>
- Playwright E2E 는 dev API CORS allowlist 에 있는 포트(3000/3001/3002/3031/8080)에서만 띄우고 임의 포트를 고르지 않는다.  
  <sub>커맨드 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: 다른 포트면 페이지는 200 이지만 API 요청이 전부 `net::ERR_FAILED` 로 죽어 스펙이 통째로 실패한다</sub>
- `E2E_BASE_URL` 로 이미 떠 있는 서버를 지정할 때는 그 서버가 이 프로젝트의 것인지 먼저 확인한다.  
  <sub>커맨드 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: 다른 프로젝트 서버가 3000 을 쓰고 있으면 모든 라우트가 404 로 나온다</sub>
- `page.route` 로 API 를 목킹해 CORS 를 우회하지 말고 포트를 맞춰 실서버로 돌린다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: 목킹하면 통과하는 것처럼 보이지만 실제 응답 계약을 검증하지 못한다</sub>
- E2E 스펙에 `localhost:3000` 같은 절대 URL 을 하드코딩하지 말고 `toHaveURL('/')` 처럼 baseURL 상대 경로로 쓴다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>
- 스위트에서 쓰는 라우트는 `test.beforeAll` 에서 미리 한 번씩 열어 warm-up 한다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: dev 서버가 라우트를 온디맨드 컴파일해 첫 진입이 느리다</sub>
- 오버레이가 열려 있는 동안 뒤쪽 요소에 `toBeEnabled()` 를 걸지 말고 관찰 가능한 결과(상태 해제·안내로 빠져나가기)로 검증한다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: Radix Dialog 가 바깥 콘텐츠를 `inert` 처리하고 Playwright 는 inert 안의 요소를 disabled 로 보기 때문</sub>
- `waitForURL(..., { waitUntil: 'commit' })` 직후 바로 `goBack()` 하지 말고 화면 요소가 보이는 것까지 확인하고 넘어간다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: 대상 화면이 마운트되기 전이라 복원 시점이 흔들려 flaky 해진다</sub>
- 테스트는 반드시 `.nvmrc` 버전(v24.15.0)에서 실행하고 셸이 다른 버전이면 `nvm use` 를 먼저 한다.  
  <sub>커맨드 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: jsdom 27 이 ESM 전용 의존성을 require 하므로 require(esm) 미지원 Node(20.19 미만, 22.0~22.11)에서는 테스트가 기동조차 안 된다</sub>
- `vitest.config.mts` 는 `.ts` 가 아닌 `.mts` 확장자를 유지하고 `package.json` 에 `type: module` 을 추가해 해결하지 않는다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: Vite 가 config 를 CJS 로 로드하는데 `vite-tsconfig-paths` v6 는 ESM 전용이라 ERR_REQUIRE_ESM 이 나고, type: module 은 postcss/tailwind config 까지 영향이 간다</sub>
- `vitest.setup.ts` 의 React `cache` shim 과 `matchMedia`/`IntersectionObserver`/`ResizeObserver` stub 을 제거하지 않는다.  
  <sub>테스트 · `safedoc-usermall/src/.claude/skills/testing/SKILL.md`</sub>  
  <sub>왜: React 18 에는 cache export 가 없고 vitest 는 node_modules/react 를 그대로 보는데 `shared/lib` 배럴이 서버 전용 getQueryClient(cache())를 끌고 오므로 shim 이 없으면 관련 테스트가 전부 깨진다</sub>

## 스타일 (100)

### safedoc-react

- 기본 UI(Button, Input, Modal, Table 등)는 antd 를 직접 사용하고 `@safedoc/ui` 로 감싸지 않는다 — `@safedoc/ui` 는 antd 래퍼가 아니라 도메인 무관 조합 컴포넌트(DetailDrawer, PaginationTable, SelectMenu, ClosableTooltip, createTypedForm 등) 모음이다.  
  <sub>문서 · `.claude/architecture/shared.md`</sub>
- Prettier 설정은 singleQuote·semi·tabWidth 2·trailingComma all·printWidth 120·arrowParens always 로 고정한다.  
  <sub>lint · `.claude/skills/code-style/SKILL.md`</sub>
- import는 react/next → antd/@ant-design → 외부 라이브러리 → FSD 레이어(@/app…@/shared) → @safedoc/* → 상대 경로 순으로 정렬한다.  
  <sub>lint · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: Prettier가 자동 정렬</sub>
- 이름 있는 컴포넌트는 function 선언문으로, 이름 없는 렌더 함수는 arrow function으로 작성한다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>
- 컴포넌트 내부 이벤트 핸들러는 handle 접두사, props로 받는 콜백은 on 접두사로 이름 짓는다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>
- children 하나만 감싸는 불필요한 Fragment(`<>{children}</>`)를 쓰지 않는다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>
- render prop이 컴포넌트 하나만 렌더하면 `{() => <C />}` 로 감싸지 말고 `{C}` 처럼 컴포넌트 자체를 전달한다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 함수로 감싸면 매 렌더마다 새 함수가 생성되어 불필요한 리렌더 발생</sub>
- use case가 3개 미만이면 추상화하지 않는다 — 중복이 보여도 2곳까지는 그대로 두고 제네릭 컴포넌트/훅·복잡한 Compound Pattern을 미리 만들지 않는다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 도메인 특화 구현을 범용 추상화보다 우선; 미래를 위한 일반화는 하지 않는다</sub>
- antd Form 안에서 서버 목록을 옵션/맵으로 변환하는 값은 useMemo로 감싸고, 반대로 React.memo는 함부로 넣지 않는다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: antd Form은 입력 한 글자마다 다시 그려져 매 렌더 새 배열이 생기면 자식이 통째로 다시 그려진다; Form.Item은 자기 필드 값이 바뀔 때만 자식을 그리므로 React.memo는 얻는 게 적다</sub>
- 같은 배열을 반복해서 find 하지 말고 es-toolkit `keyBy` 로 한 번 색인해 O(1)로 읽는다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 언어·요일·항목마다 다시 훑으면 조용히 O(n×m)이 된다</sub>
- 다중 기준 정렬·변환은 손으로 짠 reduce/`[...arr].sort()` 대신 es-toolkit의 sortBy·mapValues·uniq·compact를 쓴다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 원본을 건드리지 않아 복사가 필요 없다</sub>
- 미사용 변수는 `_` 접두사를 붙여 무시한다.  
  <sub>lint · `.claude/skills/code-style/SKILL.md`</sub>
- 공통 enum은 packages/shared/types에 정의하고 앱별로는 그 멤버를 참조해 확장한다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>
- `any` 타입을 쓰지 않고 명시적 타입을 정의한다.  
  <sub>타입 · `.claude/skills/agent-guide/SKILL.md`</sub>
- 복잡한 렌더/값 분기는 중첩 if-else·삼항 대신 ts-pattern의 `match().with()` 으로 쓴다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>
- ts-pattern에서 optional 키(`key?: T | null`)는 `P.optional`로 감싸고 값 자체가 nullish일 수 있으면 `P.union(P.nullish, ...)`로 함께 처리한다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 객체 패턴 `{ key: ... }` 는 키 존재를 요구하므로 `{ key: P.nullish }` 는 키가 아예 없는 `{}` 에 매칭되지 않는다</sub>
- ts-pattern에서 헬퍼 술어로 분기하면 `.when(predicate, …)`, 패턴이면 `.with(pattern, …)` 를 쓰고 가장 좁은 분기를 위에 둔다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>
- 파일명은 컴포넌트만 PascalCase(`MyComponent.tsx`)로 하고 훅·유틸·타입·API·스키마 파일과 폴더는 kebab-case(`domain.hook.ts`, `program.api.ts`, `my-feature/`)로 한다.  
  <sub>문서 · `.claude/skills/code-style/SKILL.md`</sub>
- 모달 컴포넌트명은 `*Modal` 접미형으로 하고 `Modal*` 접두형을 쓰지 않으며 feature 하위 `modal/` 폴더에 한 파일 하나씩 둔다.  
  <sub>문서 · `.claude/skills/modal/SKILL.md`</sub>
- 반복되는 JSX는 `renderXxx` 함수가 아니라 props를 받는 컴포넌트로 만들어 파일 하단에 `function` 으로 선언하고 끼워 넣는 자리는 `children` 을 쓴다.  
  <sub>문서 · `.claude/skills/page-composition/SKILL.md`</sub>
- 호버와 무관하게 고정 노출되는 안내 말풍선은 antd `Tooltip` 대신 `@safedoc/ui` 의 `ClosableTooltip` 을 쓰고, 호버용 Tooltip은 antd 기본값(zIndex 1070)을 그대로 쓴다.  
  <sub>문서 · `.claude/skills/tooltip/SKILL.md`</sub>  
  <sub>왜: 항상 떠 있는 툴팁이 1070이면 같은 페이지의 Dropdown/Select/Modal을 가리므로 프로젝트 컨벤션은 1000으로 낮춘다 (SE-2606)</sub>
- `ClosableTooltip` 은 `zIndex` 를 직접 지정하지 않고, 무조건 상시 노출이면 `open` 을 생략하고 조건부면 `open={조건}` 을 전달한다.  
  <sub>문서 · `.claude/skills/tooltip/SKILL.md`</sub>  
  <sub>왜: zIndex 1000과 open 기본값 true가 내장돼 있다</sub>
- `ClosableTooltip` 에 `styles={{ body: { width } }}` 로 폭을 고정하면 기존보다 약 20px 여유를 둔다.  
  <sub>문서 · `.claude/skills/tooltip/SKILL.md`</sub>  
  <sub>왜: x 버튼이 title 우측에 추가된다</sub>
- 미사용 import 는 `unused-imports/no-unused-imports` 를 'error' 로 두어 잡고, 기본 `no-unused-vars` 와 `@typescript-eslint/no-unused-vars` 는 off 로 위임한다.  
  <sub>lint · `packages/config/eslint-config/next.js`</sub>  
  <sub>왜: @typescript-eslint/no-unused-vars는 import 자동 제거 fix를 제공하지 않아 저장 시 미사용 import가 사라지지 않던 문제를 해결. error로 두어 저장 시 자동 제거되도록 함 (커밋 2dffacf99)</sub>
- 미사용 변수 검사(`unused-imports/no-unused-vars`)는 `args: 'after-used'` 로 돌리고, 이름이 `_` 로 시작하는 변수·인자·catch 파라미터는 예외로 둔다.  
  <sub>lint · `packages/config/eslint-config/next.js`</sub>
- 이름 있는 컴포넌트는 `function` 선언문으로, 이름 없는 컴포넌트는 화살표 함수로 정의한다(`react/function-component-definition`, error).  
  <sub>lint · `packages/config/eslint-config/next.js`</sub>  
  <sub>왜: code-style 스킬 문서(.claude/skills/code-style/SKILL.md)의 'Named Component - function 선언문 / Unnamed Component - arrow function' 규칙과 같은 내용</sub>
- 내부 이벤트 핸들러는 `handle` 접두사, 핸들러 prop 은 `on` 접두사로 이름 짓는다(`react/jsx-handler-names`, error).  
  <sub>lint · `packages/config/eslint-config/next.js`</sub>  
  <sub>왜: code-style 스킬 문서의 '내부 핸들러: handle 접두사 / Props: on 접두사' 규칙과 같은 내용</sub>
- JSX 컴포넌트명은 PascalCase 로 쓴다(`react/jsx-pascal-case`, error).  
  <sub>lint · `packages/config/eslint-config/next.js`</sub>  
  <sub>왜: code-style 스킬 문서의 'PascalCase 컴포넌트명' 규칙과 같은 내용</sub>
- 불필요한 Fragment 를 쓰지 않는다(`react/jsx-no-useless-fragment`, error).  
  <sub>lint · `packages/config/eslint-config/next.js`</sub>  
  <sub>왜: code-style 스킬 문서의 '불필요한 Fragment 금지' 규칙과 같은 내용</sub>
- `@typescript-eslint/no-explicit-any` 는 off 로 꺼 두어 `any` 사용을 lint 로 막지 않는다.  
  <sub>lint · `packages/config/eslint-config/next.js`</sub>
- `react/react-in-jsx-scope` 는 off 로 꺼서 JSX 파일에 React import 를 요구하지 않는다.  
  <sub>lint · `packages/config/eslint-config/next.js`</sub>  
  <sub>왜: React scope no longer necessary with new JSX transform.</sub>
- 포매팅 관련 ESLint 규칙은 `eslint-config-prettier` 를 모든 config(base/next/react-internal)에 넣어 전부 끈다 — 포매팅은 Prettier 가 담당한다.  
  <sub>lint · `packages/config/eslint-config/base.js`</sub>

### safedoc-usermall

- UI 를 새로 만들기 전에 `shared/ui` 카탈로그(`@core/` 디자인 시스템 + 공용 `ui/`)부터 검색해 재사용하고, 직접 마크업은 공용으로 표현 불가능할 때만 작성한다.  
  <sub>문서 · `src/modules/shared/CLAUDE.md`</sub>
- 새 svg 를 만들기 전에 `shared/ui/icon/` 을 grep/glob 으로 먼저 검색한다.  
  <sub>문서 · `src/modules/shared/CLAUDE.md`</sub>
- 브랜드 컬러는 `shared/style/colors.ts` 의 `PRIMARY_COLOR` 단일 출처를 쓰고, JS 값(인라인 style/SVG prop)에 브랜드 hex 리터럴을 직접 쓰지 않는다.  
  <sub>문서 · `src/modules/shared/CLAUDE.md`</sub>  
  <sub>왜: tailwind.config 도 이 상수를 참조한다.</sub>
- z-index 는 원시값 대신 tailwind.config 의 시맨틱 토큰(`z-floating`/`z-search-bar`/`z-navigation-bar`/`z-top-banner`/`z-bottom-navigation`/`z-layout`·`z-loading`/`z-bottom-sheet`/`z-dialog-overlay`/`z-dialog`)을 쓴다.  
  <sub>문서 · `src/modules/shared/CLAUDE.md`</sub>
- 모달/바텀시트는 `overlay`·`bottom-sheet` 패턴으로, 토스트는 `@core/toast` 로 구현한다.  
  <sub>문서 · `src/modules/shared/CLAUDE.md`</sub>
- Prettier 설정은 singleQuote / semi / tabWidth 2 / trailingComma 'all' / printWidth 120 / arrowParens 'always' 를 따른다.  
  <sub>lint · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>
- import 순서는 react·next → 외부 라이브러리 → FSD 레이어(app→pages→widgets→features→entities→shared) → 상대 경로이며, 정렬은 `@trivago/prettier-plugin-sort-imports` 에 맡기고 손으로 맞추지 않는다.  
  <sub>lint · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: Prettier 플러그인이 자동 정렬하므로</sub>
- 이름 있는 컴포넌트는 `function` 선언문으로 정의하고 arrow function(`const MyComponent = () => ...`)으로 정의하지 않으며, render prop 같은 이름 없는 컴포넌트만 arrow function 을 쓴다.  
  <sub>lint · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>
- 이벤트 핸들러는 내부 함수에 `handle` 접두사, props 에 `on` 접두사를 붙인다.  
  <sub>lint · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: `clickHandler`/`sendMessage` 같은 이름은 `react/jsx-handler-names` lint fail</sub>
- 짧고 한 곳에서만 쓰이는 핸들러는 인라인 화살표 함수로 두고, 로직이 5줄을 넘거나 `useCallback` 이 필요하거나 여러 prop 에 재사용할 때만 추출한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 인라인 화살표 함수가 더 선호됨</sub>
- 동일 핸들러를 2곳 이상에서 앞쪽 인자만 달리해 쓰고 뒤쪽 콜백 인자는 prop 이 제공할 때는 `(고정인자) => (콜백인자) => ...` curried 핸들러로 바인딩해 넘긴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 호출부마다 인라인 래퍼로 콜백 인자를 다시 전달하는 반복·장황함을 없애고 선언적으로 호출하기 위해</sub>
- 항목 개수와 라벨이 컴파일 타임에 고정된 리스트(탭·네비게이션·세그먼트 컨트롤·칩 그룹·가격표)는 `.map()` 으로 돌리지 말고 JSX 에 직접 나열한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 데이터 소스에서 받아오는 동적 리스트만 .map() 대상</sub>
- 항목마다 핸들러·아이콘·경로가 달라도 배열로 모아 `.map()` 돌리지 말고, 반복되는 마크업만 작은 컴포넌트로 추상화한 뒤 각 항목을 prop 으로 넘겨 직접 나열하며 hook 은 데이터 배열이 아니라 핸들러만 반환한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>
- string 값을 갖는 식별자 집합은 `as const` 객체 + `keyof typeof` 타입 추출 대신 `enum` 으로 정의하되, plain string literal 유니온으로 충분하면 enum 을 강요하지 않는다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 타입 추출 번거로움이 사라지고 호출부가 짧아짐; 식별자가 여러 곳에서 import 되어 값으로 쓰일 때만 enum 으로 올린다</sub>
- 식별자가 URL/경로 같은 다른 의미 값과 1:1 대응하면 `Record<Key, Value>` 매핑·역매핑을 만들지 말고 enum 값 자체를 그 의미 값으로 둔다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 매핑 객체, 역매핑 객체, 분기문이 모두 사라진다</sub>
- value 가 한글/UI 라벨/다국어 문구/컴포넌트이면 `Record<Key, Value>` 매핑 객체를 유지하고 enum 값에 한글을 담지 않으며, 리뷰에서 한글 라벨 매핑을 enum 으로 합치자고 지적하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: enum 값이 의미값을 표현하지 못하는 경우이기 때문</sub>
- 불필요한 Fragment(`<>{children}</>`)를 감싸지 않는다.  
  <sub>lint · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>
- 한 컴포넌트는 한 가지 일만 하도록 목록 렌더·입력·항목 렌더를 각각 분리한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 단일 책임</sub>
- `<Link>` 안에 `<Button>` 을 중첩하지 말고 `Button` 의 `asChild` 로 자식 엘리먼트에 버튼 스타일을 합성한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 결과 DOM 이 `<a><button>` 으로 비표준 중첩이 되기 때문</sub>
- `useMemo`/`useCallback` 의존성 배열에 `data?.items` 같은 옵셔널 체이닝 표현식을 넣지 말고 훅 위에서 지역 상수로 풀어 그 상수를 의존성에 둔다.  
  <sub>lint · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 컴파일러가 추론한 의존성과 수동 배열이 어긋나 `react-hooks/preserve-manual-memoization`(error) 에 걸린다</sub>
- 훅 안에서 객체를 새로 만들고 변형(`new URLSearchParams()` 후 `.set()`)하지 말고 생성자 인자로 한 번에 넘기거나 `qs.stringify` 를 쓴다.  
  <sub>lint · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 수동 메모이제이션 보존 규칙에 걸린다</sub>
- 자기참조(재귀 호출) 핸들러는 `useCallback` 으로 감싸지 않고 그냥 `const handleX = () => {}` 로 둔다.  
  <sub>lint · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 의존성 순환이 돼 `react-hooks/immutability`(error) 에 걸리고, 소비처가 DOM prop 하나뿐이면 메모이제이션 이득이 없다</sub>
- 각 항목이 0~N 개 결과를 만드는 배열 변환은 `filter + map` 대신 `flatMap` 에 `isNil`/`isNotNil` 가드를 조합해 쓴다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: filter 술어는 다음 map 으로 narrowing 이 전파되지 않아 `!`(런타임 구멍)를 강요하고, truthy 필터는 0 같은 값도 탈락시킨다</sub>
- 배열 변환은 0/1·입력 기준 스킵이면 `filter + map`, 결과 기준 스킵이면 `map + filter(isNotNil)` 또는 `flatMap`, 0/N 펼침이면 `flatMap`, 누적·그룹·집계면 `reduce`(그룹·키는 es-toolkit `groupBy`/`keyBy` 우선)로 고르고 단순 매핑을 `reduce` 로 쓰지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 모두 O(n) 이라 성능이 아닌 타입 안전·가독성 기준으로 고른다</sub>
- 조각이 컴파일 타임에 고정된 문자열 조합은 `parts` 배열 push + join 대신 조각을 삼항(없으면 `''`)으로 만들어 template literal 로 합치고 `.trim()` 한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 조각 개수가 런타임 가변이면 join 이 맞다</sub>
- `switch`·`if-else` 가 값(또는 함수) 하나로 1:1 대응하면 `Record<Key, Value>` 객체 조회로 바꾸고, 값을 반환하는 enum/유니온 분기는 ts-pattern 의 `match().with().exhaustive()` 를 쓴다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: enum 키를 쓰면 누락이 컴파일 에러로 잡힌다</sub>
- `any` 를 쓰지 말고 명시적 타입을 정의하거나 `unknown` 으로 받아 타입 가드로 좁힌다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>
- `window.scrollTo(0, 0)`·`document.querySelector`·`ref.current.scrollIntoView` 강제 호출 같은 DOM 트릭으로 UI 동작을 보정하지 말고 프레임워크 기본 동작(Next.js `Link` 의 `scroll` prop 등)이나 컴포넌트 책임으로 풀며, 불가피하면 사용자에게 명시적으로 확인 후 진행한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 회귀 위험이 크다</sub>
- 스크롤바 커스텀은 native scroll + `::-webkit-scrollbar` CSS 로만 하고 `ref`/`useState`/`onScroll` 로 썸 오버레이를 직접 그리는 JS 구현은 사용자가 명시적으로 요청할 때만 만든다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 시안에 썸 길이가 고정으로 그려져 있어도 네이티브 비율 썸으로 갈음하는 것이 기본값</sub>
- 스크롤 유무에 따라 우측 여백이 달라지는 문제는 JS 측정 기반 조건부 클래스가 아니라 `scrollbar-gutter: stable` 로 해결하고, 기존 유틸리티(`.scroll-thumb`/`.scrollbar-hide`/`.scroll-none`)를 재사용한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 스크롤바 자리가 항상 예약되어 양쪽 상황에서 여백이 유지된다</sub>
- `ScrollableWrap` 은 가로 스크롤 전용이므로 세로 스크롤 리스트에 감싸지 말고 native scroll 을 그대로 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>  
  <sub>왜: 세로 드래그 스크롤은 동작하지 않고 드래그 하이재킹 부작용만 생긴다</sub>
- 모든 시트 컴포넌트의 props 는 `IBottomSheetControlProps`(`isOpen`/`onClose`/`unmount`)를 확장하고, 호출자는 `overlay.open(({isOpen, close, unmount}) => <XxxBottomSheet ... />)` 한 줄로 호출한다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/bottom-sheet/SKILL.md`</sub>  
  <sub>왜: 모든 시트가 동일한 컨트롤 시그니처를 갖도록</sub>
- 시트 본체에서 router/store/도메인 hook 은 자유롭게 쓰되 다음 시트를 여는 `overlay.open(...)` chain 결정은 호출 위치가 책임진다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/bottom-sheet/SKILL.md`</sub>  
  <sub>왜: 시트 본체는 다음 시트가 무엇인지 모른다</sub>
- 시트 자식이 닫기가 필요하면 `closeBottomSheet` 같은 전역 헬퍼를 쓰지 말고 `onClose: () => void` prop 으로 받는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/bottom-sheet/SKILL.md`</sub>
- 시트 컴포넌트 이름은 본문만 있어도 `XxxContent`/`XxxModal` 이 아니라 `XxxBottomSheet` 패턴을 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/bottom-sheet/SKILL.md`</sub>
- `Promise<T>` 를 반환해야 하는 시트는 `onClose` 대신 `onCancel`/`onConfirm` 시그니처로 만들고 `overlay.openAsync<T>` 로 띄운다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/bottom-sheet/SKILL.md`</sub>
- 모달 열림 상태를 `useState` 로 만들지 말고 `overlay.open(...)` 으로 명령형 호출한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/overlay/SKILL.md`</sub>
- 닫고 나서 값이 필요하면 `overlay.openAsync<T>` + `close(value)` 로 결과를 받는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/overlay/SKILL.md`</sub>
- 오버레이 본체에는 `isOpen`/`onClose(close)`/`unmount` 를 전달하고 `BottomSheet.Root` 의 `onCloseEnd` 에 `unmount` 를 연결한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/overlay/SKILL.md`</sub>  
  <sub>왜: 애니메이션 종료 후 DOM 에서 제거하기 위해</sub>
- 표준 확인/알림 다이얼로그는 컴포넌트를 새로 만들지 말고 `openDialog({ type, title, description, confirmButton, cancelButton })` 헬퍼를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/overlay/SKILL.md`</sub>
- `openDialog` 의 title/description 으로 표현되지 않는 본문이 있으면 Radix 를 직접 쓰지 말고 `@core/dialog` compound(`Root`/`Header`/`Content`/`Footer`)를 조합해 별도 파일로 만든 뒤 `overlay.open` 으로 연다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/overlay/SKILL.md`</sub>
- `Dialog.Header` 에는 항상 `title` 을 넣고, 닫혀야 하는 버튼은 `Dialog.Close asChild` 로 감싼다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/overlay/SKILL.md`</sub>  
  <sub>왜: Radix a11y 요구</sub>
- UI 를 새로 작성하기 전에 `shared/ui/@core/`·`shared/ui/`·`shared/ui/icon/` 을 먼저 검색해 재사용하고, 직접 마크업은 공용으로 표현이 불가능할 때만 짠다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>
- 특정 페이지에서 문제가 보여도 `@core` 컴포넌트 자체를 수정하지 말고 사용처 래퍼로 해결하며, @core 수정이 정말 필요하면 사용자 확인 후에만 진행한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: 전 사용처에 영향이 번진다</sub>
- `(미채택)` 표시된 @core 컴포넌트(indicator/menu/radio)를 처음 도입할 때는 동작을 직접 검증하고, radio 는 현역인 레거시 `ui/radio/*` 와의 일관성을 먼저 확인한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: 코드베이스 사용처 0건</sub>
- Figma 의 px/hex 값을 그대로 박지 말고 디자인 토큰(`bg-box-*`, `text-font-*`, `border-lined-*`, `text-*`, `gap-*`)으로 매핑하며, 토큰에 없는 색이면 `tailwind.config.ts` 에 토큰을 추가한 뒤 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>
- `bg-[#233054]` 같은 arbitrary 색을 JS 상수로 추출해 `bg-[${VAR}]` 로 쓰지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: Tailwind JIT 는 정적 클래스만 추출하므로 클래스가 생성되지 않는다</sub>
- z-index 는 원시값 대신 시맨틱 토큰(`z-search-bar`/`z-navigation-bar`/`z-top-banner`/`z-bottom-navigation`/`z-loading`/`z-bottom-sheet`/`z-dialog`)을 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>
- 인라인 style·SVG color prop 등 JS 값에서 브랜드 컬러가 필요하면 hex 리터럴 대신 단일 출처 상수 `PRIMARY_COLOR`(`src/modules/shared/style/colors.ts`)를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: tailwind.config 의 primary 계열 토큰도 이 상수를 참조한다</sub>
- Figma 의 px line-height 를 `leading-[1.4]` 같은 arbitrary 값으로 강제하지 말고 폰트 토큰(`text-heading-*`/`text-body-*`)의 기본 line-height 에 맡긴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: 폰트 토큰에 이미 적절한 line-height 가 포함돼 있다</sub>
- 시안 텍스트가 코드의 동적 문구와 달라 보여도 `josa()` 조사 처리·길이 초과 대체 문구 같은 기존 문구 로직을 임의로 제거/교체하지 않고, 기획 변경인지 애매하면 구현 전에 확인한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: Figma 프레임의 문구는 특정 상태의 예시인 경우가 많다</sub>
- SVG 아이콘은 루트에 `width`/`height` 를 넣지 않고 `viewBox` 만 유지하며 `path` 는 `fill="currentColor"` 로 작성하고, 크기는 사용처의 prop/className 으로 색은 `text-*` 토큰으로 제어한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: `width="current"` 같은 placeholder 는 무효값이라 콘솔 에러를 유발한다</sub>
- 기존 아이콘을 재사용하기 전에 svg 원본을 열어 `stroke="currentColor"` 여부와 viewBox 비율을 확인하고, 색은 `className` 의 `text-*` 로 주며 width/height 를 viewBox 비율과 다르게 강제하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: 자식의 명시적 stroke 속성이 래퍼의 color prop 을 이기고, 비율이 다르면 도형이 찌그러진다</sub>
- Figma 아이콘은 내부 단일 `Vector`/sub-path 가 아니라 `icon_24/*` 컴포넌트(래퍼) 노드 전체를 가져오고, viewBox 는 네이티브 크기를 유지하며 하드코딩된 fill/stroke 는 `currentColor` 로 바꾼다(의도적으로 다른 색인 보조요소는 제외).  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: 아이콘이 본체 + 보조요소 여러 path 로 구성된 경우 일부가 누락된다</sub>
- 시안 서체가 웹폰트 임베딩 라이선스 없는 상용 폰트면 유사 폰트를 임의로 넣지 말고 디자이너에게 해당 텍스트가 포함된 이미지를 요청하며, 문구가 이미지로 옮겨가면 코드에 남은 라벨 문자열·타입 필드도 지운다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: Figma MCP 의 dirForAssetWrites 는 이미지 fill·벡터 노드만 파일로 떨어뜨리고 텍스트는 서체 이름이 박힌 JSX 로 내려온다</sub>
- `tv` 는 `tailwind-variants` 에서 직접 import 하지 말고 `@/modules/shared/style/tailwind-variants` 의 커스텀 tv 를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/tailwind/SKILL.md`</sub>  
  <sub>왜: 커스텀 tv 에 `twMerge: false` 가 설정돼 있다</sub>
- variant props 타입은 직접 정의하지 말고 `VariantProps<typeof x>` 로 추론하며, `VariantProps` 는 라이브러리에서 직접 import 한다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/tailwind/SKILL.md`</sub>  
  <sub>왜: 커스텀 모듈은 VariantProps 를 re-export 하지 않는다</sub>
- 스타일은 모바일 우선으로 작성하고 브레이크포인트는 `pc`(540px)·`side-img`(1061px) 둘만 쓴다(`sm`/`md`/`lg` 없음).  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/tailwind/SKILL.md`</sub>  
  <sub>왜: `screens` 는 extend 가 아니라 통째 교체라 기본 브레이크포인트가 존재하지 않는다</sub>
- 확장 스케일 값에는 `size-*` 를 쓰지 말고 `h-*`/`w-*` 를 쓰며, `aspect-*` 는 정의된 `1/1`·`4/3`·`16/9` 만 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/tailwind/SKILL.md`</sub>  
  <sub>왜: `spacing` 키는 확장돼 있지 않아 없는 유틸은 에러 없이 클래스가 생성되지 않고 조용히 무시된다</sub>
- 회전(`rotate`)하는 요소는 회전하지 않는 조상에 `overflow-hidden` 을 걸어 잘라내고, 밖으로 삐져나와야 하는 요소는 그 래퍼 바깥에 둔다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/tailwind/SKILL.md`</sub>  
  <sub>왜: rotate 는 레이아웃 크기를 바꾸지 않지만 스크롤 영역에는 반영돼 가로 스크롤이 생긴다</sub>
- 한글 조사는 하드코딩하지 말고 `es-hangul` 의 `josa(단어, '이/가')` 로 종성 유무에 따라 자동 선택한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/es-hangul/SKILL.md`</sub>
- 유틸리티는 lodash 대신 es-toolkit 을 쓰고, 메인 패키지에 없는 lodash 호환 함수(`isEmpty`·`castArray`·`omitBy`·`values`)는 `es-toolkit/compat` 에서 import 한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/es-toolkit/SKILL.md`</sub>  
  <sub>왜: tree-shaking·작은 번들</sub>
- 같은 로직을 직접 구현하지 말고 es-toolkit 표준 함수나 공용 헬퍼를 재사용한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/es-toolkit/SKILL.md`</sub>
- nil 체크와 배열 타입 좁히기는 직접 `(x): x is T` 가드를 쓰지 말고 `isNotNil`/`isNil`/`isUndefined` 로 한 번에 처리한다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/es-toolkit/SKILL.md`</sub>  
  <sub>왜: 타입 가드까지 한 번에 되기 때문</sub>
- enum/유니온/discriminated object 기반 분기와 값·JSX 를 반환하는 분기는 `if-else`·`switch` 대신 ts-pattern 의 `match()` 를 쓴다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/ts-pattern/SKILL.md`</sub>
- 유니온/enum 을 전부 처리해야 하는 분기는 `.otherwise` 대신 `.exhaustive()` 로 닫는다.  
  <sub>타입 · `safedoc-usermall/src/.claude/skills/ts-pattern/SKILL.md`</sub>  
  <sub>왜: 새 값이 추가되면 컴파일 에러로 분기 누락을 알려준다</sub>
- 여러 boolean/값의 조합 분기는 `if` 중첩 대신 객체로 묶어 `match({ a, b }).with({ a: false }, ...)` 로 매칭한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/ts-pattern/SKILL.md`</sub>
- 단일 boolean 분기는 그냥 `if` 로 두고 `match` 를 강제하지 않는다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/ts-pattern/SKILL.md`</sub>  
  <sub>왜: 과용 금지</sub>

## 보안 (4)

### safedoc-react

- worktree로 복사한 `.env.local` 은 복사만 하고 커밋하지 않는다.  
  <sub>문서 · `.claude/skills/worktree/SKILL.md`</sub>  
  <sub>왜: 민감 정보일 수 있다</sub>

### safedoc-usermall

- `instrumentation.ts`·`instrumentation-client.ts` 의 mocking 게이트는 `process.env.NEXT_PUBLIC_API_MOCKING === 'enabled'` 리터럴 비교로 쓰고 헬퍼 함수로 감싸지 않으며, `.env.production`/`.env.staging`/`.env.development` 에 `NEXT_PUBLIC_API_MOCKING=disabled` 를 둔다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 헬퍼로 감싸면 번들러가 상수로 접지 못해 동적 import 가 살아남고 msw 청크가 그대로 배포된다. 접히려면 값이 정의돼 있어야 한다.</sub>
- mock 상태 브리지 라우트는 `route.mock.ts` 로 만든다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: `next.config.ts` 의 pageExtensions 가 mocking 을 켰을 때만 `mock.ts` 를 포함하므로 프로덕션 빌드에서는 라우트 자체가 생기지 않는다.</sub>
- MSW 워커 원본은 `e2e/support/mockServiceWorker.js` 에 두고, `npm run dev:mock` 이 `public/` 으로 복사한 사본은 gitignore 한다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: `public/` 은 프로덕션에 그대로 배포된다.</sub>

## 프로세스 (171)

### safedoc-react

- 규칙을 추가·수정할 때는 AGENTS.md 를 고친다 — `.claude/CLAUDE.md` 는 AGENTS.md 를 불러오는 한 줄뿐이고 규칙의 정본은 AGENTS.md 다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 규칙 정본을 한 곳에 둔다</sub>
- 요청받은 범위 그대로 수행하고, 조용히 줄이거나 넓히거나 다른 것으로 바꾸지 않는다 — 요청이 잘못돼 보이면 한 문장으로 짚고 요청대로 진행한다.  
  <sub>문서 · `AGENTS.md`</sub>
- 통상적인 판단은 직접 내리고, 해석이 갈려 결과물 자체가 달라질 때만 확인한다.  
  <sub>문서 · `AGENTS.md`</sub>
- 막힌 부분이 있으면 나머지를 끝까지 끝낸 뒤 무엇을 왜 빼놓았는지 말한다.  
  <sub>문서 · `AGENTS.md`</sub>
- 자동화 스킬(`/pr`, `/push`, `/stage-deploy` 등)은 명시된 한 가지 동작만 하고 머지·알림·다음 PR 제안 같은 후속 단계를 끼워 넣지 않는다 — 커밋→배포를 한 번에 잇는 건 `/full-deploy` 하나뿐이다.  
  <sub>커맨드 · `AGENTS.md`</sub>  
  <sub>왜: 빈 PR도 그대로 두면 머지 시점에 채워진다</sub>
- "마지막에 검증 단계 추가", "재확인 후 응답" 같은 검증 절차를 스스로 만들어 끼워 넣지 않는다.  
  <sub>커맨드 · `AGENTS.md`</sub>
- 이 레포의 검증 게이트는 `/push` 안에서 도는 lint 한 번과 유저가 명시적으로 요청한 `pnpm test` 뿐이다.  
  <sub>커맨드 · `AGENTS.md`</sub>
- 작업 중 타입 확인은 `pnpm lint:local`(ESLint + tsgo --noemit) 로 필요할 때만 돌리고, push 직전 한 번만 `pnpm lint`(ESLint + tsc --noemit, CI와 동일) 로 맞춘다.  
  <sub>커맨드 · `AGENTS.md`</sub>  
  <sub>왜: lint:local 은 native preview 라 훨씬 빠르고, CI 기준은 pnpm lint 다</sub>
- 서브에이전트는 광범위한 다중 파일 조사처럼 크고 독립적이며 병렬화되는 작업에만 쓰고, 자기 작업을 재확인하는 용도로는 쓰지 않는다 — 하나로 끝나면 하나만 띄운다.  
  <sub>문서 · `AGENTS.md`</sub>
- 응답은 짧고 핵심 위주로 쓰고 단서·면책은 짧게 붙이며, 설명 요청에는 개요부터 답하고 깊은 설명은 요청받았을 때만 한다.  
  <sub>문서 · `AGENTS.md`</sub>
- 첫 툴 호출 전에 무엇을 할지 한 문장으로 말하고, 작업 중에는 중요한 발견이나 방향 전환이 있을 때만 짧게 보고하며, 끝나면 결과 문장부터 쓰고 근거는 그 뒤에 둔다.  
  <sub>문서 · `AGENTS.md`</sub>
- 파일로 쓰는 리포트·요약 문서는 내용만큼만 쓰고 빈 요약 섹션·중복 정리·보일러플레이트로 부풀리지 않는다.  
  <sub>문서 · `AGENTS.md`</sub>
- 유저의 코드·결론·판단을 바꾸는 오류만 짧게 정정하고, 아무것도 안 바뀌는 실수는 조용히 고치고 넘어간다.  
  <sub>문서 · `AGENTS.md`</sub>
- 분석을 시작하거나 유저가 "다시"/"재검토"를 요청하면 이전 컨텍스트를 폐기하고 `git fetch origin develop && git log HEAD..origin/develop --oneline` 로 develop 신선도부터 확인한다.  
  <sub>커맨드 · `AGENTS.md`</sub>  
  <sub>왜: 이 레포 고유 함정 — 뒤처진 로컬 기준으로 분석하는 것을 막는다</sub>
- 플랜을 출력할 때는 "현재 develop 기준 commit hash" 를 명시한다(권장).  
  <sub>문서 · `AGENTS.md`</sub>
- 코드를 쓰기 전에 작업 종류에 맞는 스킬·문서를 먼저 연다 — 새 기능·리팩토링은 `/agent-guide`, 폴더·레이어 위치는 `/fsd`, 조회·뮤테이션·캐시 무효화는 `/react-query` + `/query-key`, 에러 처리 정책은 `.claude/policies/error-handling.md` 식으로 매핑된다.  
  <sub>문서 · `AGENTS.md`</sub>
- 규칙 설명을 여러 문서에 복제하지 않는다 — 규칙이 바뀌면 스킬 파일만 고치고, 앱·패키지별 구조/라우트/모듈 현황은 중첩 `CLAUDE.md`(apps/safedoc-cms, apps/safedoc-hospital-admin, packages/entities, packages/features) 가 담당한다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 설명 복제 금지</sub>
- 레거시 검색 필터를 교체할 때는 모든 사용처를 옮긴 커밋에서 레거시 위젯·타입·헬퍼를 함께 삭제한다.  
  <sub>문서 · `.claude/skills/search-filter/SKILL.md`</sub>
- 새 API를 연동할 때 스펙을 추측하지 말고 v2는 `https://api.dev.safedoc.kr/docs`, v3는 `https://apiv3.dev.safedoc.kr/openapi.json` 에서 실제 경로·파라미터·응답 스키마를 확인해 타입에 그대로 옮긴다.  
  <sub>문서 · `.claude/skills/api-spec/SKILL.md`</sub>  
  <sub>왜: Jira 티켓·Figma 스토리보드의 엔드포인트/필드 설명은 자주 실제 스펙과 어긋나며 충돌 시 Swagger가 진실</sub>
- OpenAPI 스펙은 전체를 컨텍스트로 가져오지 말고 `curl | jq` 로 필요한 경로/스키마만 추출한다.  
  <sub>문서 · `.claude/skills/api-spec/SKILL.md`</sub>  
  <sub>왜: 스펙 파일이 각각 약 500KB</sub>
- 어느 스펙을 볼지는 코드의 baseURL 기준으로 정한다 — 기본 `createInstance()` 면 v2, `SAFEDOC_SUB_API_URL` 이면 v3.  
  <sub>문서 · `.claude/skills/api-spec/SKILL.md`</sub>
- Figma 와이어프레임은 레이아웃·문구·동작 흐름 참고용으로만 쓰고 색/픽셀/자동생성 코드를 복제하지 않으며, 와이어프레임 텍스트와 유저 구두 지시가 다르면 유저 지시를 따른다.  
  <sub>문서 · `.claude/skills/agent-guide/SKILL.md`</sub>  
  <sub>왜: 와이어프레임은 초안인 경우가 많음</sub>
- 레거시 코드 교체는 사용처 grep → 교체 대상 구현/시그니처 Read 확인 → 최종 패턴으로 한 번에 교체 → 교체와 삭제를 한 커밋 순으로 한다.  
  <sub>커맨드 · `.claude/skills/refactoring-checklist/SKILL.md`</sub>  
  <sub>왜: 남은 사용처는 pnpm lint가, 패턴 위반은 /review가 잡는다</sub>
- 교체 시 중간 래퍼 훅을 거치지 않고 프로젝트 최종 패턴(query options 직접 사용 등)으로 바로 간다.  
  <sub>문서 · `.claude/skills/refactoring-checklist/SKILL.md`</sub>
- 작업이 끝난 뒤 자기 채점표를 돌리지 않는다 — 코드 스타일·데이터 흐름·mutation 부수효과·FSD 위반은 `/review`(code-reviewer)가 단일 출처이고 `/push`가 리뷰와 lint를 각각 한 번씩 돌린다.  
  <sub>커맨드 · `.claude/skills/agent-guide/SKILL.md`</sub>  
  <sub>왜: 같은 항목을 다시 훑으면 중복이다</sub>
- 코드를 쓰기 전에 작업 영역에 해당하는 스킬(/react-query·/form·/modal·/drawer·/fsd·/code-style·/refactoring-checklist)을 먼저 읽는다.  
  <sub>문서 · `.claude/skills/agent-guide/SKILL.md`</sub>  
  <sub>왜: 스킬에 이미 규칙이 있는데 안 읽고 임의 구현 후 교정받는 패턴 반복 금지</sub>
- 플랜/분석 직전 `git fetch origin develop && git log HEAD..origin/develop --oneline` 으로 develop 신선도를 확인하고, 유저가 "다시 짜줘" 라고 하면 이전 컨텍스트를 폐기하고 fetch부터 재시작한다.  
  <sub>문서 · `.claude/skills/agent-guide/SKILL.md`</sub>
- 필드명만 보고 의미를 단정하지 말고 그 필드를 변경하는 모든 호출지점을 grep해 실제 트리거를 확인한 뒤 데이터 모델을 본다.  
  <sub>문서 · `.claude/skills/agent-guide/SKILL.md`</sub>  
  <sub>왜: 요구사항 → UX 흐름 → 데이터 모델 순서로 파악</sub>
- 해석이 갈려 결과물 자체가 달라질 때만 유저에게 묻고, 파일명·폴더 하나 차이·흔한 패턴 선택 같은 통상적 판단은 직접 내린 뒤 결과에 한 줄로 적는다.  
  <sub>문서 · `.claude/skills/agent-guide/SKILL.md`</sub>
- 브랜치 base는 prefix로 정한다 — `hotfix/` 는 `origin/main`, `feature/`·`bugfix/`·`chore/`·`refactor/` 등 그 외는 `origin/develop`.  
  <sub>커맨드 · `.claude/skills/branch/SKILL.md`</sub>
- `/branch` 는 인자로 받은 브랜치명을 그대로 쓰고 변환/가공하지 않으며 Jira 티켓 정보를 자동으로 가져오지 않는다.  
  <sub>커맨드 · `.claude/skills/branch/SKILL.md`</sub>  
  <sub>왜: Jira 기반 브랜치는 /jira-branch 사용</sub>
- worktree 경로 기본값은 `../<브랜치명의 마지막 세그먼트>` 이고, 이미 존재하면 사용자에게 다른 경로를 묻는다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- `--git-dir` 과 `--git-common-dir` 이 다르면 linked worktree 안이므로 worktree를 중복 생성하지 않는다(단, `--show-superproject-working-tree` 가 비어있지 않으면 서브모듈로 보고 진행).  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- worktree 생성 후 `pnpm lint` 로 베이스라인을 검증하고 실패하면 base 브랜치에 이미 있던 문제로 보고해 계속 진행할지 확인한다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>  
  <sub>왜: 방금 생성한 worktree라 새 코드가 없다</sub>
- worktree 제거는 메인 워킹트리에서 경로로 `git worktree remove` 만 쓰고 `--force` 는 쓰지 않는다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>  
  <sub>왜: 더러운 worktree는 일부러 실패해야 한다; 제거해도 브랜치는 남는다</sub>
- PR title prefix는 브랜치 prefix로 정한다 — `feature/`→`feat:`, `hotfix/`→`hotfix:`, `bugfix/`→`fix:`, `refactor/`→`refactor:`, 그 외는 prefix 없음.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>  
  <sub>왜: 같은 세션에서 /jira-branch로 가져온 Jira title을 본문 제목으로 사용</sub>
- PR base는 `hotfix/` 면 `stage`, 그 외는 `develop` 이며 PR body는 `.github/pull_request_template.md` 구조를 그대로 유지해 채운다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>  
  <sub>왜: hotfix는 origin/main에서 분기하지만 PR은 먼저 stage로 보내 검증하고 운영 반영은 같은 브랜치 → main PR을 별도로 만든다</sub>
- `/pr`·`/stage-deploy` 는 PR 생성 그 이상을 하지 않는다 — 머지 대기/폴링, 자동 머지, 후속 알림, 추가 작업 제안을 끼워 넣지 않는다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>  
  <sub>왜: AGENTS.md 작업 방식 > 작업 범위; 머지→stage 배포까지 한 번에 잇고 싶으면 /full-deploy를 쓴다</sub>
- stage 배포 PR 제목은 직전 STAGE DEPLOY 버전 기준으로 자동 증가시키되, 그보다 최근에 PROD DEPLOY가 있었으면 minor+1·patch=0, 아니면 patch+1로 하고 major는 자동 증가시키지 않는다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>  
  <sub>왜: major는 릴리즈 매니저가 명시적으로 올리는 경우에만 변경</sub>
- stage 배포 PR은 head를 항상 `develop`, base를 항상 `stage` 로 하고 같은 버전으로 close된 PR이 있어도 번호를 재사용하지 않는다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- `/full-deploy` 는 커밋→push→PR→머지→stage-deploy→머지→worktree 정리를 확인 없이 진행하되, code-reviewer가 Critical을 보고하면 push 직전에 한 번만 사용자 확인을 받는다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>  
  <sub>왜: 검증은 각 스킬이 이미 갖고 있는 것(code-reviewer 1회 + lint 1회)뿐이고 단계 사이에 확인 절차를 추가하지 않는다</sub>
- `/full-deploy` 의 리뷰는 push 단계 한 번뿐이고 결과를 재확인하는 추가 에이전트나 2차 리뷰 패스를 두지 않는다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>
- `/full-deploy` 에서 worktree 정리는 push 단계에서 하지 않고 마지막 7단계에서 한 번만 한다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>  
  <sub>왜: push 단계에서 지우면 이후 단계의 cwd가 사라져 흐름이 깨진다</sub>
- force push와 main으로의 직접 push를 금지하고, 머지는 `--merge` 만 쓰며 squash/rebase는 사용자가 명시할 때만 쓴다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>
- 모든 lint 규칙 위반은 `eslint-plugin-only-warn` 을 base config 에 등록해 warn 으로 낮춘다(개별 규칙에 'error' 를 적어도 마찬가지).  
  <sub>lint · `packages/config/eslint-config/base.js`</sub>
- turbo 에 선언하지 않은 환경변수를 코드에서 쓰면 `turbo/no-undeclared-env-vars` 로 경고한다.  
  <sub>lint · `packages/config/eslint-config/base.js`</sub>
- Next 앱에는 `@next/eslint-plugin-next` 의 recommended 와 core-web-vitals 룰셋을 둘 다 적용한다.  
  <sub>lint · `packages/config/eslint-config/next.js`</sub>
- config 는 대상별로 골라 쓴다 — Next 앱은 `@safedoc/eslint-config/next-js`, React 컴포넌트를 가진 패키지(entities/features/shared-ui)는 `/react-internal`, React 없는 패키지(shared hooks/types/utils, lib/qr-generator)는 `/base`.  
  <sub>lint · `packages/config/eslint-config/package.json`</sub>
- 앱에서 공유 config 를 적용할 때 `files: ['src/**/*.{js,ts,jsx,tsx}']` 로 범위를 `src` 아래로 한정하고, `dist/**` 는 base config 에서 전역 ignore 한다.  
  <sub>lint · `apps/safedoc-cms/eslint.config.mjs`</sub>
- 패키지의 `lint` 스크립트는 `eslint . && tsc --noemit` 로 ESLint 와 타입체크를 한 묶음으로 돌리고, 로컬 반복 확인용 `lint:local` 은 `tsc` 대신 `tsgo --noemit` 를 쓴다.  
  <sub>lint · `apps/safedoc-cms/package.json`</sub>  
  <sub>왜: pnpm lint = ESLint + tsc --noemit (CI와 동일 — push/PR 전 검증은 이걸로), pnpm lint:local = ESLint + tsgo --noemit (native preview, 로컬 반복 확인용 — 훨씬 빠름) (AGENTS.md)</sub>
- main·stage·develop·dev/* 로 향하는 PR 은 self-hosted 러너에서 `pnpm run lint` 를 돌려 실패 시 중단한다.  
  <sub>lint · `.github/workflows/lint-check.yml`</sub>  
  <sub>왜: 이 레포의 검증 게이트는 /push 안에서 도는 lint 한 번과 유저가 명시적으로 요청한 pnpm test 뿐이다 (AGENTS.md)</sub>

### safedoc-usermall

- 규칙의 정본은 AGENTS.md 이므로 규칙을 추가·수정할 때는 CLAUDE.md 가 아니라 AGENTS.md 를 고친다 (CLAUDE.md 는 AGENTS.md 를 불러오는 한 줄뿐).  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: CLAUDE.md 는 `@AGENTS.md` 한 줄만 담고 있고, 레이어별 세부 현황만 src/modules/*/CLAUDE.md 가 담당한다.</sub>
- AGENTS.md 의 `BEGIN:nextjs-agent-rules` ~ `END` 마커 블록은 손으로 고치지 말고 저장소 규칙은 마커 바깥에 쓴다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 이 블록은 `next dev` 가 자동 생성·동기화한다. diff 에서 지워도 uncommitted change 로 재생성되므로 작업과 함께 커밋해야 트리가 깨끗해진다.</sub>
- 요청받은 것을 요청받은 범위로 내고, 해석이 갈려 결과물이 실질적으로 달라질 때만 확인한다 (통상적인 판단은 직접 한다).  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: Opus 5 프롬프팅 가이드 권고에 맞춘 규칙.</sub>
- 요청이 잘못됐거나 더 나은 방법이 보이면 한 문장으로 말하고 요청대로 진행하며, 조용히 범위를 좁히거나 넓히거나 다른 작업으로 바꾸지 않는다.  
  <sub>문서 · `AGENTS.md`</sub>
- stub·TODO·placeholder 를 남기지 않고, 일부가 막혔으면 나머지를 전부 끝낸 뒤 무엇이 왜 빠졌는지 명시한다 (완료 보고는 실제로 다 됐을 때만).  
  <sub>문서 · `AGENTS.md`</sub>
- 요청에 없는 리팩토링·추상화·발생 불가능한 케이스의 방어 코드는 추가하지 않는다.  
  <sub>문서 · `AGENTS.md`</sub>
- "재확인해라", "서브에이전트로 검증해라", "마지막에 검증 단계를 넣어라" 류의 검증 지시를 규칙·스킬 문서에 추가하지 않는다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: Opus 5 에서 과잉 검증만 유발하고 품질은 오르지 않는다. 자체 검증은 기본 동작이므로 지시할 필요가 없다.</sub>
- 검증 게이트는 `npm run lint`(eslint + typecheck) / `npm test` / `/push` 의 code-reviewer 뿐이고, 그 위에 별도 검증 패스를 만들지 않는다.  
  <sub>커맨드 · `AGENTS.md`</sub>
- 서브에이전트는 넓은 다중 파일 조사처럼 독립적이고 규모 있는 작업에만 쓴다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 서브에이전트는 컨텍스트를 새로 구축하고 리포트를 되받아 다시 읽는 비용이 붙는다.</sub>
- 직접 몇 번의 tool call 로 끝낼 일과 자기 작업의 검증·재확인에는 서브에이전트를 쓰지 않고 메인 루프에서 검증한다.  
  <sub>문서 · `AGENTS.md`</sub>
- 하나로 끝날 일에 서브에이전트를 여러 개 띄우지 않고, 병렬로 띄울 때는 한 메시지에 묶어 동시 실행한다.  
  <sub>문서 · `AGENTS.md`</sub>
- 정식 서브에이전트는 `code-reviewer` 와 `refactoring` 둘뿐이며, 그 외 임의 위임은 사용자가 요청할 때만 한다.  
  <sub>문서 · `AGENTS.md`</sub>
- code-reviewer 는 발견을 전부 보고하고 심각도·확신도를 붙이며, 필터링은 code-reviewer 가 아니라 `/push` 게이트에서 한다.  
  <sub>커맨드 · `AGENTS.md`</sub>
- refactoring 서브에이전트는 지정된 대상 파일 범위 안에서만 리팩토링한다.  
  <sub>문서 · `AGENTS.md`</sub>
- CDP(Chrome DevTools Protocol)/MCP 크롬 도구 탐색 작업은 `model: "sonnet"` 으로, 코드 작성·리뷰는 Opus 로 라우팅한다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 탐색은 단순·반복이라 Sonnet으로 충분하고, 정확도가 중요한 코드 작성·리뷰는 Opus 가 필요하다.</sub>
- effort 는 코딩·에이전트 작업이면 `xhigh`, 그 외 판단이 필요한 작업이면 `high` 에서 시작해 내려본다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: Opus 5 는 low/medium 에서도 품질이 잘 버티므로 토큰·지연을 줄이는 1순위 수단이다.</sub>
- 응답이 길다는 이유로 effort 를 낮추지 않고, 길이는 프롬프트로 지시한다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: effort 는 사고량을 조절하고 출력 길이는 안정적으로 줄지 않는다.</sub>
- 한 메시지에 커밋/푸쉬/pr/머지/stage-deploy 등 여러 단계를 나열하면 단계마다 확인받지 말고 명시한 마지막 단계까지 자동 실행한다 (예외: code-reviewer 가 Critical 을 보고하면 push 직전 1회만 확인).  
  <sub>커맨드 · `AGENTS.md`</sub>
- `.github/workflows/` 파일은 사용자가 명시적으로 "workflow도 바꿔줘"라고 할 때만 수정하고, Node/Next/패키지 업그레이드 작업이어도 `node-version` 등을 자동으로 따라 올리지 않는다.  
  <sub>문서 · `AGENTS.md`</sub>
- 전역 설정 변경은 영향 범위가 크므로 신중히 다루고, `.github/workflows/` 는 명시적 요청 시에만 수정한다.  
  <sub>문서 · `src/modules/app/CLAUDE.md`</sub>
- 첫 tool call 전에 한 문장으로 무엇을 할지 말하고, 작업 중에는 중요한 발견이나 방향 전환이 있을 때만 한 문장씩 알린다 ("이제 ~하겠습니다" 같은 루틴한 동작은 중계하지 않는다).  
  <sub>문서 · `AGENTS.md`</sub>
- 작업을 끝낼 때는 결과부터 — 첫 문장이 "무엇이 됐는지 / 무엇을 찾았는지"에 답하고 근거는 그 뒤에 붙인다.  
  <sub>문서 · `AGENTS.md`</sub>
- 짧게 쓸 때는 문장을 압축하지 말고 담을 내용을 고르며, 화살표 체인(`A → B → 실패`)·약어·즉석 라벨 대신 완전한 문장으로 쓴다.  
  <sub>문서 · `AGENTS.md`</sub>
- 사용자의 코드·판단·결정을 바꿀 오류일 때만 앞선 발언을 정정하고, 사용자에게 차이가 없는 실수는 사과·서두·자책 없이 조용히 고친다.  
  <sub>문서 · `AGENTS.md`</sub>
- 후속 질문을 "내가 틀렸다"는 신호로 받아들이지 말고 물어본 것에 답한다.  
  <sub>문서 · `AGENTS.md`</sub>
- 파일로 쓰는 문서(PR body, 리뷰 리포트, AGENTS.md·스킬 갱신)는 과제에 필요한 만큼만 쓰고 채우기용 섹션·중복 요약·보일러플레이트를 넣지 않는다.  
  <sub>문서 · `AGENTS.md`</sub>
- 규칙·스킬 문서에 문장을 추가할지는 "이 문장이 없으면 동작이 달라지는가"로 판단하고, 아니면 넣지 않는다.  
  <sub>문서 · `AGENTS.md`</sub>
- 스크립트에서 `tsc` 를 그대로 부르지 말고 실행 경로를 명시한다.  
  <sub>커맨드 · `AGENTS.md`</sub>  
  <sub>왜: `node_modules/.bin/tsc` 는 설치 순서에 따라 typescript 6 이든 typescript-native 7 이든 가리킬 수 있다.</sub>
- typescript(6.x)와 typescript-native(npm:typescript@7)를 병행 유지하고, typescript-eslint 가 TS7 을 지원하면 `typescript` 를 7 로 올리고 `typescript-native` 를 제거한다.  
  <sub>타입 · `AGENTS.md`</sub>  
  <sub>왜: TypeScript 7 은 Go 네이티브 포팅이라 기존 JS 컴파일러 API(`typescript/lib/typescript.js`)가 없어 typescript-eslint 와 `next build` 타입체크가 깨진다.</sub>
- `react-day-picker@8`·`react-naver-maps` 의 `overrides` 고정을 제거하지 않는다.  
  <sub>문서 · `AGENTS.md`</sub>  
  <sub>왜: 두 패키지의 peer 가 react 19 를 거부해, 빼면 clean install 이 ERESOLVE 로 죽는다(CI 4개 워크플로우가 전부 `npm install`).</sub>
- `.claude/`·`src/.claude/` 의 규칙 문서를 추가·수정할 때도 AGENTS.md 의 "Claude 작업 규칙" 절을 기준으로 삼는다 (기준 모델은 Claude Opus 5).  
  <sub>문서 · `AGENTS.md`</sub>
- 코드 리뷰에서 인라인 핸들러를 추출하라고 자동 제안하지 않고, 사용자가 추출을 원할 때만 변환한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/code-style/SKILL.md`</sub>
- 새 API 를 연동할 때 스펙을 추측하지 말고 v2 `https://api.dev.safedoc.kr/docs` / v3 `https://apiv3.dev.safedoc.kr/openapi.json` 에서 실제 경로·파라미터·응답 스키마를 확인해 타입에 반영한다.  
  <sub>커맨드 · `safedoc-usermall/src/.claude/skills/api-spec/SKILL.md`</sub>
- OpenAPI 스펙은 전체를 컨텍스트로 읽지 말고 `curl | jq` 로 필요한 경로/스키마만 추출한다.  
  <sub>커맨드 · `safedoc-usermall/src/.claude/skills/api-spec/SKILL.md`</sub>  
  <sub>왜: 스펙 파일이 각각 약 500KB</sub>
- 어느 스펙을 볼지는 코드의 baseURL 기준으로 정한다 — 기본 `createHttpClient()` 면 v2, `SAFEDOC_SUB_API_URL` 이면 v3.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/api-spec/SKILL.md`</sub>
- Figma MCP 로 export 한 에셋은 해시 파일명을 의미 있는 이름으로 바꾸고 재export 로 생긴 해시 중복 파일을 함께 지우며, 렌더 크기의 3배 정도로 줄여서 커밋한다.  
  <sub>문서 · `safedoc-usermall/src/.claude/skills/design-system/SKILL.md`</sub>  
  <sub>왜: `next.config.ts` 가 `images.unoptimized: true` 라 원본이 그대로 배포된다</sub>

### 공통

- 브랜치 prefix가 `hotfix/`면 base 를 `origin/main` 으로, 그 외(`feature/`·`bugfix/`·`chore/`·`refactor/`)는 `origin/develop` 으로 잡고 `git fetch origin` 후 `git checkout -b` 한다.  
  <sub>커맨드 · `.claude/skills/branch/SKILL.md`</sub>
- `/branch` 는 인자로 받은 브랜치명을 그대로 쓰고 변환·가공하지 않으며, Jira 티켓 기반 생성은 `/jira-branch` 로 분리한다.  
  <sub>커맨드 · `.claude/skills/branch/SKILL.md`</sub>
- Jira 기반 브랜치명은 `{issueType}/{snake_case_slug}_{key}` 형식으로 만들고 티켓 번호는 맨 뒤에 둔다.  
  <sub>커맨드 · `.claude/skills/jira-branch/SKILL.md`</sub>
- Jira title 정규화는 `[FE/BO]`·`[FE/PA]` 같은 대괄호 prefix 제거 → 하이픈 앞뒤 공백·특수문자 정리 → 한글은 영어로 의역 → 영문/숫자만 소문자 snake_case 로, 최대 5단어까지만 남긴다.  
  <sub>커맨드 · `.claude/skills/jira-branch/SKILL.md`</sub>  
  <sub>왜: 대괄호 prefix 는 작업 구분 태그일 뿐 브랜치명에 포함하지 않는다. 브랜치명은 영문/숫자/`_` 만 허용한다.</sub>
- Jira issueType 은 작업→`feature/`, 버그→`bugfix/`, 핫픽스→`hotfix/`, 잡일→`chore/` 로 매핑한다.  
  <sub>커맨드 · `.claude/skills/jira-branch/SKILL.md`</sub>
- safedoc-usermall 에서는 Jira 의 `작업`(Task) issueType 을 무조건 `feature` 로 매핑하고 `chore` 로 매핑하지 않는다.  
  <sub>커맨드 · `.claude/skills/jira-branch/SKILL.md`</sub>
- safedoc-react 에서는 `fetch-jira-api.js` 가 영문 issueType `Task` 를 `chore` 로 매핑하므로, 영문 issueType 을 쓰는 프로젝트에서는 표를 그대로 믿지 말고 스크립트 출력값을 확인한 뒤 prefix 를 정한다.  
  <sub>커맨드 · `.claude/commands/jira-branch.md`</sub>
- 티켓 타이틀에 `HOTFIX`/`핫픽스` 가 포함되면 issueType 이 `작업(feature)` 이어도 issueType 매핑보다 우선해 `hotfix/` 브랜치(base `origin/main`)로 만들고, 애매하면 사용자에게 확인한다.  
  <sub>커맨드 · `.claude/commands/jira-branch.md`</sub>  
  <sub>왜: SE-2454 에서 issueType `작업` 매핑대로 `feature/`(develop base)로 만들었다가 사용자가 hotfix/main 처리 의도였다고 지적해 cherry-pick 재작업이 발생했다.</sub>
- jira-branch 는 브랜치 생성 후 티켓 요약·영향 범위·3~7단계 작업 순서·검토 필요 항목으로 된 Plan 을 출력한 뒤 추가 행동 없이 멈추고, auto mode 여도 사용자 입력을 기다린다.  
  <sub>커맨드 · `.claude/skills/jira-branch/SKILL.md`</sub>  
  <sub>왜: 사용자가 plan 을 보고 진행할지/수정할지/취소할지 판단하게 하는 단계이기 때문.</sub>
- 브랜치 생성 시 작업 중인 변경사항은 그대로 유지한 채 checkout 하고, checkout 이 변경사항을 덮어쓰는 경우(같은 파일 충돌)에만 stash 후 진행할지 사용자에게 확인한다.  
  <sub>커맨드 · `.claude/skills/jira-branch/SKILL.md`</sub>
- safedoc-react 의 jira-branch 는 메인 워킹트리에 커밋 안 된 변경이 있고 그것이 별개 티켓 작업이면 worktree 로 격리해 브랜치를 만들고, 이미 linked worktree 안이거나 워킹트리가 깨끗하면 현재 위치에서 생성한다.  
  <sub>커맨드 · `.claude/commands/jira-branch.md`</sub>  
  <sub>왜: 메인 워킹트리의 진행 중 작업을 건드리지 않기 위함.</sub>
- safedoc-react 의 커밋 타입은 `feat`/`fix`/`hotfix`/`del`/`docs`/`refactor`/`conf`/`chore`/`test` 9가지만 쓰고 `style`·`perf`·`ci` 등은 쓰지 않는다.  
  <sub>커맨드 · `.claude/commands/commit.md`</sub>
- safedoc-usermall 의 커밋 타입은 `feat`/`fix`/`del`/`docs`/`refactor`/`conf`/`chore` 7가지만 쓰고 `style`·`test`·`perf` 등은 쓰지 않으며, 필요하면 `fix(build):` 처럼 괄호 scope 를 붙인다.  
  <sub>커맨드 · `.claude/skills/commit/SKILL.md`</sub>
- 커밋 타입은 사용자에게 보이는 새 동작=`feat`, 사용자에게 보이는 동작 교정=`fix`(main 핫픽스면 `hotfix`), 동작 불변 구조 개선=`refactor`, `.claude`/eslint/tsconfig/CI 설정=`conf`, import 정렬·미사용 제거=`chore`, 테스트 및 테스트 전용 인프라=`test`, 사용처 없는 파일/폴더 통삭제=`del` 로 고른다.  
  <sub>커맨드 · `.claude/commands/commit.md`</sub>
- 테스트와 함께 딸려온 `vitest.config` 등 테스트 전용 설정은 `test` 커밋에 묶고, 프로덕션과 무관한 설정만 단독으로 바꿀 때만 `conf` 를 쓴다.  
  <sub>커맨드 · `.claude/commands/commit.md`</sub>
- 현재 브랜치가 `hotfix/` 로 시작하면 버그 수정 커밋 접두사를 `fix:` 가 아니라 `hotfix:` 로 쓰고, develop 기반 일반 수정은 `fix:` 를 유지한다.  
  <sub>커맨드 · `.claude/skills/commit/SKILL.md`</sub>  
  <sub>왜: 운영 긴급 수정을 PR 목록에서 즉시 구분하기 위함이며 `pr` skill 의 PR title 규칙과 일치시킨다.</sub>
- 커밋 전에 `git status` → `git diff` → `git log --oneline -5` 로 최근 커밋 스타일까지 확인한 뒤 `git add -A` 로 스테이징한다.  
  <sub>커맨드 · `.claude/skills/commit/SKILL.md`</sub>
- `.env` 등 민감한 파일은 커밋하지 않는다.  
  <sub>커맨드 · `.claude/skills/commit/SKILL.md`</sub>
- push 전에 code-reviewer sub-agent 로 `origin/develop...HEAD` 변경사항을 리뷰하고, Critical 항목이 있을 때만 진행 여부를 확인받으며 Warning·Nit 은 보고만 하고 멈추지 않는다.  
  <sub>커맨드 · `.claude/skills/push/SKILL.md`</sub>
- code-reviewer 호출은 이 파이프라인의 유일한 리뷰 게이트이므로, 결과를 재확인하는 2차 에이전트를 띄우거나 같은 변경을 두 번 리뷰하지 않는다.  
  <sub>커맨드 · `.claude/skills/push/SKILL.md`</sub>
- 리뷰어에게는 "중요한 것만 보고" 같은 지시를 주지 않고 전부 보고하게 한 뒤, push 단계에서 그 결과를 필터링한다.  
  <sub>커맨드 · `.claude/skills/push/SKILL.md`</sub>
- code-reviewer 리포트는 심각도가 낮다고 임의로 추려내지 않고 그대로 사용자에게 전달한다(무엇을 무시할지는 사용자가 정한다).  
  <sub>커맨드 · `.claude/commands/review.md`</sub>
- 리뷰 체크리스트·심각도 태그(Critical/Warning/Nit)·출력 형식의 단일 출처는 `.claude/agents/code-reviewer.md` 이며, 리뷰 기준을 바꾸려면 커맨드 파일이 아니라 그 에이전트 파일만 고친다.  
  <sub>문서 · `.claude/commands/review.md`</sub>
- lint(safedoc-react `pnpm run lint`, safedoc-usermall `npm run lint`)를 이 워크플로우의 유일한 검증 게이트로 삼고, 오류가 있으면 push 를 중단하고 통과할 때만 push 한다.  
  <sub>lint · `.claude/skills/push/SKILL.md`</sub>
- push 전에 `gh pr list --state all --head <현재 브랜치>` 로 직전 PR 상태를 선확인하고, 이미 MERGED 면 이번 커밋이 그 PR 에 포함되지 않아 새 PR 이 필요함을 사용자에게 알린 뒤 진행한다.  
  <sub>커맨드 · `.claude/skills/push/SKILL.md`</sub>  
  <sub>왜: 머지된 PR 위에 푸시한 커밋이 반영되지 않는 사고를 막기 위함.</sub>
- `main`·`develop` 브랜치로의 직접 push 는 반드시 사용자 확인 후 진행하고, force push(`--force`)는 절대 사용하지 않는다.  
  <sub>커맨드 · `.claude/skills/push/SKILL.md`</sub>
- upstream 이 없으면 `git push -u origin <브랜치>`, 있으면 `git push origin <브랜치>` 로 push 하고 완료 후 PR URL 을 안내한다.  
  <sub>커맨드 · `.claude/skills/push/SKILL.md`</sub>
- safedoc-usermall 의 push 는 변경 파일 20개 이상 OR 추가·삭제 라인 합 500 이상 OR 새 도메인/모듈 추가일 때 루트 `AGENTS.md`·슬라이스별 `CLAUDE.md`(`src/modules/*/`) 업데이트를 제안하고, 승인 시 `docs:` 타입 별도 커밋으로 반영한다.  
  <sub>커맨드 · `.claude/skills/push/SKILL.md`</sub>  
  <sub>왜: 판단 기준은 "이 문장이 없으면 다음 작업의 동작이 달라지는가" 이며, 코드·git 이력을 읽으면 알 수 있는 내용은 넣지 않는다.</sub>
- 루트 `CLAUDE.md` 는 `@AGENTS.md` 한 줄이므로 문서 업데이트 대상에서 제외한다.  
  <sub>문서 · `.claude/skills/push/SKILL.md`</sub>
- `gh pr list --state open --head <현재 브랜치>` 로 확인해 이미 open PR 이 있으면 PR 생성을 건너뛴다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>
- PR title 은 같은 세션에서 `/jira-branch` 로 얻은 Jira title 을 쓰고, 브랜치 prefix 에 따라 `feature/`→`feat:`, `hotfix/`→`hotfix:`, `bugfix/`→`fix:`, `refactor/`→`refactor:` 를 앞에 붙인다(그 외는 prefix 없음).  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>
- Jira 정보가 없으면 PR title 을 커밋 메시지와 변경사항을 참고해 자연스러운 한국어로 생성한다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>
- PR body 는 `.github/pull_request_template.md` 구조를 그대로 유지해 채우고, Jira 티켓이 있으면 `## Related Issues` 에 `https://safedoc-dev.atlassian.net/browse/<KEY>` 링크를 첨부한다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>
- PR body 길이는 변경 규모에 맞추고, 템플릿을 채우기 위한 빈 섹션·중복 요약·보일러플레이트나 커밋 메시지 나열로 본문을 늘리지 않으며 해당 항목이 없는 섹션은 통째로 생략한다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>
- PR base 는 브랜치 prefix 가 `hotfix/` 면 `stage`, 그 외는 `develop` 으로 잡는다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>
- safedoc-react 에서 hotfix 브랜치는 `origin/main` 에서 분기하되 PR 은 먼저 `stage` 로 보내 검증하고, 운영 반영은 같은 브랜치 → `main` PR 을 별도로 만들며 `pr` 스킬은 첫 번째(stage) PR 만 담당한다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>  
  <sub>왜: 실제 이력상 hotfix 브랜치당 stage/main PR 이 각 1건씩 존재한다.</sub>
- safedoc-usermall 에서 `hotfix/` 브랜치는 base `stage` PR 과 base `main` PR 을 쌍으로 생성해 두 PR URL 을 모두 안내하고, 한쪽만 필요한 특수 상황은 사용자 지시를 따른다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>  
  <sub>왜: stage 검증과 운영 반영을 함께 처리하기 위함.</sub>
- safedoc-react 의 `pr` 스킬은 PR 생성 그 이상을 하지 않는다 — 머지 대기·폴링, `/stage-deploy` 자동 연계, 후속 알림을 끼워 넣지 않는다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>  
  <sub>왜: AGENTS.md `작업 방식` > `작업 범위` 규칙. 머지→stage 배포까지 잇고 싶으면 `/full-deploy` 를, 사용자가 머지를 알리면 그때 `/stage-deploy` 를 쓴다.</sub>
- safedoc-usermall 에서는 base 가 `develop` 인 PR 을 새로 생성한 경우에 한해 `gh pr view <번호> --json state,mergedAt` 을 60~120초 간격으로 폴링하다 MERGED 가 되면 `/stage-deploy` 로 이어가고, base 가 `stage`(hotfix)이거나 기존 open PR 을 재사용한 경우에는 자동 연계하지 않는다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>  
  <sub>왜: hotfix 는 이미 stage 로 직접 배포되고, 기존 open PR 은 이미 진행 중인 흐름이 있다고 간주한다.</sub>
- 머지 폴링은 사용자가 다른 작업으로 넘어가면 중단하고 무한정 대기하지 않으며, 사용자가 "머지했어" 라고 알리면 즉시 머지 상태를 확인하고 `/stage-deploy` 로 넘어간다.  
  <sub>커맨드 · `.claude/skills/pr/SKILL.md`</sub>
- stage 배포 PR 은 head 를 항상 `develop`, base 를 항상 `stage` 로 두고 제목은 `STAGE DEPLOY V{major}.{minor}.{patch}` 형식으로만 만든다(다른 브랜치는 이 스킬로 만들지 않는다).  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- `develop` → `stage` 로 향하는 open PR 이 이미 있으면 새로 만들지 않고 해당 PR URL 만 안내한다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- 다음 버전은 `gh pr list --state all` 결과에서 `STAGE DEPLOY V(\d+)\.(\d+)\.(\d+)` / `PROD DEPLOY V(\d+)\.(\d+)\.(\d+)` 를 정규식으로 뽑아 `mergedAt` 기준 가장 최근 값을 비교해 정하되, 기준은 항상 직전 STAGE DEPLOY 버전에서 출발한다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- safedoc-react 에서는 직전 STAGE 보다 PROD DEPLOY 가 더 최근(mergedAt)이면 `minor`+1·`patch`=0(V2.27.19 → V2.28.0), 그 외(STAGE 가 더 최근이거나 PROD 기록 없음)에는 `patch`+1(V2.27.19 → V2.27.20)로 올린다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- safedoc-usermall 에서는 PROD DEPLOY 가 더 최근이어도 그것이 현재 minor 라인을 마감한 경우에만 `minor`+1·`patch`=0 으로 올리고, 진행 중인 minor 라인 안의 버전(라인 기점·핫픽스)만 배포한 경우에는 `patch`+1 로 라인을 이어간다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>  
  <sub>왜: 실제 이력: STAGE V2.42.8 이후 PROD V2.42.0 머지 → 다음 STAGE 는 V2.43.0 이 아니라 V2.42.9 (PROD V2.42.1 이후에도 V2.42.15 로 patch 지속).</sub>
- minor+1 과 patch+1 두 해석이 모두 가능해 보이면 두 후보를 함께 제시하고 사용자에게 확인한다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- `major` 는 자동으로 증가시키지 않으며 릴리즈 매니저가 명시적으로 올릴 때만 바꾼다(필요 시 사용자 확인 후 진행).  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- 직전 STAGE DEPLOY 버전을 찾을 수 없으면 임의로 정하지 말고 사용자에게 시작 버전을 묻는다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- 같은 버전으로 이미 close 된 PR 이 있어도 그 번호를 재사용하지 않고 다음 버전으로 진행한다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- `git fetch origin stage develop` 후 `git log origin/stage..origin/develop --oneline` 이 비어 있으면 배포할 변경이 없으므로 사용자에게 알리고 종료한다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- stage 배포 PR body 는 Summary 에 `develop → stage 배포 PR (V{버전}).`, Related Issues 에 머지 커밋(`Merge pull request #N …`)에서 뽑은 `#N - 제목` 목록을 쓰고 Features/Bug Fixes/Refactoring 으로 분류하되 항목 없는 섹션은 통째로 생략한다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>
- safedoc-react 의 `stage-deploy` 는 PR 생성 이상을 하지 않는다 — 자동 머지·후속 알림·추가 작업 제안을 하지 않고, PR body 가 비어 있어도 머지 시점에 채워질 수 있으므로 그대로 둔다.  
  <sub>커맨드 · `.claude/skills/stage-deploy/SKILL.md`</sub>  
  <sub>왜: 유저가 명시적으로 요청한 동작(=PR 생성)만 수행한다.</sub>
- `/full-deploy` 는 commit → push → pr → PR 머지 → stage-deploy → stage-deploy 머지 순으로 실행하며, safedoc-react 는 마지막에 worktree 정리 단계를 하나 더 둔다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>
- full-deploy 는 단계 사이에 확인 절차를 추가하지 않고 끝까지 진행하되, code-reviewer 가 Critical 항목을 보고할 때만 push 직전에 한 번 확인한다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>  
  <sub>왜: 검증은 각 스킬이 이미 갖고 있는 것(code-reviewer 1회 + lint 1회)뿐이다.</sub>
- 머지는 `gh pr merge <번호> --merge` 만 사용하고 squash/rebase 옵션은 사용자가 명시할 때만 쓰며, 머지 후 `gh pr view <번호> --json state,mergedAt` 으로 상태를 확인한다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>
- base 가 `stage` 인 hotfix PR 이면 stage-deploy 가 불필요하므로 PR 머지 단계에서 종료한다(safedoc-usermall 은 쌍으로 만든 base `main` PR 까지 머지한 뒤 종료).  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>
- full-deploy 에서는 push 단계의 "worktree 정리" 절을 `--keep-worktree` 와 동일하게 취급해 건너뛰고, 마지막 단계에서 한 번만 정리한다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>  
  <sub>왜: push 단계에서 지우면 이후 PR·머지 단계의 cwd 가 사라져 흐름이 깨진다.</sub>
- full-deploy 의 worktree 정리는 hotfix 로 PR 머지에서 끝나든 develop→stage 가 비어 stage-deploy 에서 끝나든 어느 단계에서 종료하든 종료 직전에 수행한다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>  
  <sub>왜: gh 명령들이 이미 끝난 뒤이므로 cwd 가 사라져도 남은 작업이 없다.</sub>
- `/full-deploy` 의 `$ARGUMENTS` 는 첫 단계 커밋 메시지로만 사용하고 이후 단계는 각 스킬의 자체 규칙을 따르며, 비어 있으면 변경사항을 분석해 커밋 메시지를 자동 생성한다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>
- full-deploy 종료 시 커밋·Push·Feature PR·Stage Deploy(safedoc-react 는 Worktree 포함) 결과를 표 형태로 요약해 보고한다.  
  <sub>커맨드 · `.claude/skills/full-deploy/SKILL.md`</sub>
- worktree 경로 기본값은 `../<브랜치명의 마지막 세그먼트>`(브랜치 `feature/foo-bar` → `../foo-bar`)이고, 이미 존재하는 경로면 사용자에게 다른 경로를 묻는다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- worktree 의 base 브랜치는 `branch` 스킬과 같은 규칙(`hotfix/`→`origin/main`, 그 외→`origin/develop`)을 적용한다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- 인자 없이 `/worktree` 를 실행하면 현재 브랜치를 그대로 쓰되 메인 워킹트리를 `develop` 으로 `checkout` + `pull --ff-only` 시킨 뒤 그 브랜치를 새 worktree 에 체크아웃한다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>  
  <sub>왜: 같은 브랜치를 두 워킹트리에서 동시에 체크아웃할 수 없기 때문.</sub>
- 인자 없는 worktree 생성 시 `git status --porcelain` 이 비어있지 않으면(워킹트리가 더러우면) 사용자에게 안내하고 중단한다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- worktree 추가 시 신규 브랜치는 `-b` 옵션으로 함께 생성하고, 이미 존재하는 브랜치를 체크아웃할 때는 `-b` 를 생략한다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- safedoc-react 에서는 `git rev-parse --git-dir` 과 `--git-common-dir` 이 다르면 이미 linked worktree 이므로 생성을 건너뛰고 현재 worktree 를 그대로 쓰되, `git rev-parse --show-superproject-working-tree` 가 비어있지 않으면 서브모듈로 판단하고 계속 진행한다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>  
  <sub>왜: 서브모듈도 두 값이 다르게 나올 수 있다.</sub>
- worktree 생성 후 gitignore 된 로컬 설정을 복사한다 — safedoc-react 는 `apps/safedoc-cms`·`apps/safedoc-hospital-admin` 의 `.env.local` 과 루트 `tailwind.intellisense.config.ts`·`.vscode`, safedoc-usermall 은 루트 `.env.local` 하나이며, 원본이 없으면 건너뛰고 사용자에게 알린다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- 복사한 `.env.local` 은 민감 정보일 수 있으므로 복사만 하고 커밋하지 않는다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- 새 worktree 에서 의존성을 설치한다(safedoc-react `pnpm install`, safedoc-usermall `npm install`).  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- safedoc-react 는 worktree 생성 직후 `pnpm lint` 로 베이스라인을 검증하고, 실패하면 base 브랜치에 이미 있던 문제로 보고 사용자에게 계속 진행할지 확인한다.  
  <sub>lint · `.claude/skills/worktree/SKILL.md`</sub>  
  <sub>왜: 방금 생성한 worktree 라 새 코드가 없으므로 실패는 base 브랜치의 기존 문제다.</sub>
- safedoc-react 의 worktree 스킬은 에디터를 열지 않고(사용자가 직접 연다), safedoc-usermall 의 worktree 스킬은 마지막에 `code .` 로 VSCode 를 연다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- safedoc-react 에서 linked worktree 로부터 push 해 PR 까지 만들어졌으면 그 worktree 를 제거하고, 메인 워킹트리에서 push 했으면 정리 절 전체를 건너뛴다.  
  <sub>커맨드 · `.claude/commands/push.md`</sub>  
  <sub>왜: PR 까지 만들어졌으면 그 worktree 는 역할이 끝났다.</sub>
- worktree 제거는 `git status --porcelain` 이 비어있고, `git rev-list --count origin/<브랜치>..HEAD` 가 0 이며, PR URL 을 확보한 세 조건을 모두 만족할 때만 하고 하나라도 어기면 제거하지 않고 이유를 보고한다.  
  <sub>커맨드 · `.claude/commands/push.md`</sub>  
  <sub>왜: gitignore 된 `node_modules`·`.env.local` 은 git 이 세지 않으므로 조건 판정과 무관하다.</sub>
- worktree 제거는 반드시 메인 워킹트리로 `cd` 한 뒤 경로를 지정해 `git worktree remove <경로>` 를 실행한다.  
  <sub>커맨드 · `.claude/commands/push.md`</sub>  
  <sub>왜: worktree 안에서 지우면 명령 자체는 성공하지만 셸의 cwd 가 사라진 디렉터리를 가리켜 이후 명령이 전부 깨진다.</sub>
- `git worktree remove` 에 `--force` 는 절대 쓰지 않고, `contains modified or untracked files` 로 거부되면 그대로 두고 사용자에게 알린다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>  
  <sub>왜: 거부는 아직 살릴 게 남았다는 뜻이고, 더러운 worktree 는 일부러 실패해야 한다.</sub>
- worktree 를 제거해도 브랜치는 삭제하지 않는다.  
  <sub>커맨드 · `.claude/commands/push.md`</sub>  
  <sub>왜: PR 이 그 브랜치를 가리키고 있으며 `git worktree remove` 는 브랜치를 건드리지 않는다.</sub>
- `/push --keep-worktree` 이거나 `/full-deploy` 에서 호출된 경우에는 push 단계의 worktree 정리를 건너뛴다.  
  <sub>커맨드 · `.claude/commands/push.md`</sub>  
  <sub>왜: 리뷰 반영 커밋을 이어서 할 예정이거나, 뒤에 머지·stage-deploy 단계가 남아 중간에 지우면 흐름이 깨지기 때문.</sub>
- worktree 제거의 판별·조건·명령은 `.claude/commands/push.md` 의 "worktree 정리" 절이 단일 출처이며, worktree·full-deploy 스킬은 이를 복제하지 않고 참조만 한다.  
  <sub>문서 · `.claude/skills/full-deploy/SKILL.md`</sub>
- safedoc-usermall 의 worktree 스킬은 제거를 다루지 않으며, 제거가 필요하면 `git worktree remove <경로>` 로 별도 수행한다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- 이미 다른 경로에 체크아웃된 브랜치로 worktree 를 만들려 하면 git 에러 메시지를 그대로 사용자에게 전달한다.  
  <sub>커맨드 · `.claude/skills/worktree/SKILL.md`</sub>
- 빌드 에러는 `pnpm build` 로 한 번에 받아 파일·원인별 묶음으로 고치고, 에러 1건마다 빌드를 다시 돌리지 않고 묶음이 끝날 때만 `pnpm lint:local` 로 확인한 뒤 전체 정리 후 마지막에 `pnpm build` 를 한 번 돌린다.  
  <sub>커맨드 · `.claude/commands/build-fix.md`</sub>  
  <sub>왜: `pnpm lint:local` 이 tsc 보다 빠르다.</sub>
- 수정이 새 에러를 만들거나, 같은 에러가 3번 시도해도 남아 있거나, 사용자가 요청하면 build-fix 를 중단하고 고친/남은/새로 생긴 에러를 표로 보고한다.  
  <sub>커맨드 · `.claude/commands/build-fix.md`</sub>
- `/signin` 은 MCP(`claude-in-chrome`)가 아니라 로컬 Chrome CDP(localhost:9222)로 동작하며, 항상 auto mode 로 사용자 확인 없이 연속 실행하고 오류가 났을 때만 사용자에게 알린다.  
  <sub>커맨드 · `.claude/commands/signin.md`</sub>  
  <sub>왜: MCP 서버 연결 여부와 무관하게 동작시키기 위함.</sub>
- Jira API 인증 정보(`JIRA_EMAIL`/`JIRA_API_TOKEN`/`JIRA_BASE_URL`)는 gitignore 된 `.claude/.env.claude` 에 두고, 401 이면 토큰 만료와 발급 계정 이메일을 확인·갱신 요청한다.  
  <sub>커맨드 · `.claude/skills/jira-branch/SKILL.md`</sub>
