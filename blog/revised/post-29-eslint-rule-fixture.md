# 리뷰 코멘트를 실행 가능한 아키텍처로: 모노레포에서 ESLint 규칙과 fixture를 함께 관리하기

“Next.js의 `page.tsx`에서는 직접 조회하지 않는다.”

프로젝트에는 이런 규칙이 있었습니다. 페이지는 화면 조립에 집중하고, 조회는 `ListView` 같은 하위 컴포넌트가 소유해야 에러 바운더리와 로딩 UI의 범위를 명확하게 나눌 수 있다는 원칙입니다.

문서로 설명하는 것은 어렵지 않았습니다. 문제는 우회가 너무 쉽다는 점이었습니다.

```tsx
// 직접 호출은 리뷰에서 눈에 띈다.
const result = useQuery(options);
```

하지만 커스텀 훅을 한 겹 거치면 이야기가 달라집니다.

```tsx
const result = useProgramList();
```

`useProgramList()` 내부에서 `useQuery()`를 호출하는지 알려면 선언 파일을 열어봐야 합니다. 훅이 배럴 파일을 거쳐 재수출되거나 default export라면 추적해야 할 경로는 더 길어집니다.

배럴의 사용하지 않는 export, 슬라이스 사이의 deep import, 손으로 작성한 queryKey도 비슷했습니다. 문서에 규칙을 추가할수록 문서는 길어졌지만, 리뷰에서 놓칠 가능성은 크게 줄지 않았습니다.

그래서 문서를 더 자세히 쓰는 대신, 기계가 판단할 수 있는 부분을 ESLint 규칙으로 옮겼습니다.

그 순간 ESLint 설정은 단순한 설정 파일이 아니게 됐습니다. 파일 시스템을 읽고, import graph를 따라가며, 캐시를 관리하는 작은 정적 분석 도구가 됐습니다. 자연스럽게 이 코드에도 테스트와 fixture가 필요해졌습니다.

ESLint 역시 기본 규칙이나 공개 플러그인으로 해결되지 않는 프로젝트 고유의 요구사항에는 custom rule을 만들 수 있도록 지원하며, 규칙 테스트를 위한 `RuleTester`를 제공합니다. 자세한 기본 구성은 [ESLint Custom Rule Tutorial](https://eslint.org/docs/latest/extend/custom-rule-tutorial)에서 확인할 수 있습니다.

## ESLint 설정을 독립된 workspace package로 만들기

처음에는 각 앱의 `eslint.config`에 규칙을 직접 넣을 수도 있습니다. 하지만 앱이 세 개가 되고 React 패키지와 FSD 패키지가 생기면 설정이 빠르게 갈라집니다.

모노레포에서는 ESLint 설정을 private workspace package로 분리했습니다.

```text
packages/config/eslint-config/
├── package.json
├── eslint.config.ts
├── tsconfig.json
├── vitest.config.ts
└── src/
    ├── base.ts
    ├── next.ts
    ├── react-internal.ts
    ├── app-boundaries.ts
    ├── slice-boundaries.ts
    ├── error-boundary.ts
    ├── lib/
    │   ├── module-resolve.ts
    │   ├── module-graph.ts
    │   └── usage-index.ts
    └── rules/
        ├── no-query.ts
        ├── no-query.test.ts
        ├── no-unused-public-api.ts
        ├── no-unused-public-api.test.ts
        └── __fixtures__/
```

패키지는 하나의 거대한 설정 대신 역할별 진입점을 제공합니다.

```json
{
  "name": "@repo/eslint-config",
  "private": true,
  "type": "module",
  "scripts": {
    "lint": "eslint . && tsc --noEmit",
    "test": "vitest run"
  },
  "exports": {
    "./base": "./src/base.ts",
    "./next-js": "./src/next.ts",
    "./react-internal": "./src/react-internal.ts",
    "./app-boundaries": "./src/app-boundaries.ts",
    "./slice-boundaries": "./src/slice-boundaries.ts",
    "./error-boundary": "./src/error-boundary.ts"
  }
}
```

각 앱과 패키지는 필요한 설정만 조합합니다.

```ts
// apps/admin/eslint.config.ts
import { appBoundaries } from '@repo/eslint-config/app-boundaries';
import { buildArtifactIgnores, tsconfigRootDir } from '@repo/eslint-config/base';
import { nextJsConfig } from '@repo/eslint-config/next-js';

export default [
  tsconfigRootDir(import.meta.url),
  { ignores: buildArtifactIgnores },
  ...nextJsConfig,
  ...appBoundaries,
];
```

```ts
// packages/entities/eslint.config.ts
import { tsconfigRootDir } from '@repo/eslint-config/base';
import { reactConfig } from '@repo/eslint-config/react-internal';
import { sliceBoundaries } from '@repo/eslint-config/slice-boundaries';

export default [
  tsconfigRootDir(import.meta.url),
  ...reactConfig,
  ...sliceBoundaries('entities'),
];
```

ESLint의 flat shareable config도 본질적으로 설정 객체나 배열을 export하는 패키지입니다. 하나의 패키지에서 여러 설정을 별도 진입점으로 제공할 수도 있습니다. 자세한 패키지 구성은 [ESLint Share Configurations](https://eslint.org/docs/latest/extend/shareable-configs)에 설명돼 있습니다.

내부 패키지는 다음처럼 `workspace:*`로 연결합니다.

```json
{
  "devDependencies": {
    "@repo/eslint-config": "workspace:*"
  }
}
```

pnpm의 `workspace:` 프로토콜은 같은 저장소의 패키지만 사용하도록 보장합니다. 이름이 같은 외부 패키지로 조용히 대체되지 않는다는 점도 내부 설정 패키지에 잘 맞습니다. 자세한 동작은 [pnpm Workspace](https://pnpm.io/workspaces)에 정리돼 있습니다.

## 모든 규칙을 같은 방식으로 테스트하지 않는다

Custom rule이라고 항상 실제 파일이 필요한 것은 아닙니다. 규칙이 어떤 정보를 사용하는지에 따라 테스트를 세 단계로 나눌 수 있습니다.

| 규칙의 성격 | 예시 | 테스트 방법 |
| --- | --- | --- |
| 현재 파일의 AST만 사용 | raw queryKey, JSX 속성 | 인라인 `code` |
| 파일 경로의 의미까지 사용 | 슬라이스 구조, deep import | 가상 `filename` |
| 다른 파일까지 추적 | 간접 query hook, 미사용 Public API | 실제 fixture |

### AST만 보는 규칙

다음 규칙은 `QueryErrorBoundary`에 복구 범위를 나타내는 `variant`를 명시하도록 강제합니다.

현재 파일의 JSX만 보면 되므로 fixture가 필요 없습니다.

```ts
ruleTester.run('explicit-variant', rule, {
  valid: [
    {
      code: `
        <QueryErrorBoundary variant="section">
          <List />
        </QueryErrorBoundary>
      `,
    },
  ],
  invalid: [
    {
      code: `
        <QueryErrorBoundary>
          <List />
        </QueryErrorBoundary>
      `,
      errors: [{ messageId: 'implicitVariant' }],
      output: `
        <QueryErrorBoundary variant="page">
          <List />
        </QueryErrorBoundary>
      `,
    },
  ],
});
```

Autofix를 제공하는 규칙이라면 오류 발생만 확인하지 않고 `output`까지 계약으로 고정합니다.

### 경로 의미가 필요한 규칙

FSD 슬라이스 사이의 deep import를 막는 규칙은 실제 파일 내용보다 현재 파일과 import 대상의 경로가 중요합니다.

이 경우 파일을 만들 필요 없이 가상의 절대 경로를 넘길 수 있습니다.

```ts
ruleTester.run('slice-public-api', rule, {
  valid: [
    {
      filename: '/repo/packages/entities/src/treatment/model/treatment.options.ts',
      code: `import { reservationOptions } from '../../reservation';`,
    },
  ],
  invalid: [
    {
      filename: '/repo/packages/entities/src/treatment/model/treatment.options.ts',
      code: `
        import type {
          Reservation
        } from '../../reservation/types/reservation.type';
      `,
      errors: [{ messageId: 'deepRelative' }],
    },
  ],
});
```

여기서 `filename`은 실제로 존재할 필요가 없습니다. 규칙이 경로 문자열만 해석하기 때문입니다.

### 모듈 그래프를 따라가는 규칙

`page.tsx`에서 호출한 훅이 내부적으로 `useQuery()`를 사용하는지 판단하려면 상황이 달라집니다.

규칙은 다음을 처리해야 합니다.

- 직접 `useQuery()`를 호출하는 경우
- `useQuery as useRQ`처럼 별칭을 붙인 경우
- namespace import를 사용한 경우
- 커스텀 훅으로 감싼 경우
- default export인 훅
- `export *` 배럴을 거친 훅
- 순환 참조가 있는 경우

이때는 인라인 코드만으로 충분하지 않습니다. import 대상 파일이 실제로 존재해야 합니다.

## RuleTester의 가상 코드와 실제 fixture 결합하기

Fixture에는 제품 앱 전체를 복사하지 않고, 규칙이 따라가야 하는 최소한의 파일 구조만 만듭니다.

```text
__fixtures__/app/
├── package.json
└── src/
    ├── app/
    │   ├── page.tsx
    │   └── consumer.ts
    ├── hooks/
    │   ├── index.ts
    │   ├── use-query-hook.ts
    │   ├── use-default-hook.ts
    │   └── use-plain-hook.ts
    └── modules/slice/
        ├── index.ts
        ├── thing.ts
        └── defaultThing.ts
```

조회 훅은 실제 파일로 둡니다.

```ts
// __fixtures__/app/src/hooks/use-query-hook.ts
import { useQuery } from '@tanstack/react-query';

export function useQueryHook() {
  return useQuery({
    queryKey: ['fixture'],
    queryFn: async () => 1,
  });
}
```

배럴도 실제로 만듭니다.

```ts
// __fixtures__/app/src/hooks/index.ts
export * from './use-query-hook';
export * from './use-plain-hook';
```

테스트에서는 fixture의 라우트 파일 경로를 `filename`으로 사용합니다.

```ts
import { RuleTester } from 'eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parser } from 'typescript-eslint';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROUTE = path.join(here, '__fixtures__/app/src/app/page.tsx');

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});
```

이제 배럴을 거친 훅 호출을 테스트할 수 있습니다.

```ts
ruleTester.run('no-query', rule, {
  valid: [
    {
      name: '조회하지 않는 훅은 허용한다',
      filename: ROUTE,
      code: `
        import { usePlainHook } from '../hooks/use-plain-hook';
        usePlainHook();
      `,
    },
    {
      name: '조회 훅을 import만 하면 허용한다',
      filename: ROUTE,
      code: `
        import { useQueryHook } from '../hooks/use-query-hook';
        export { useQueryHook };
      `,
    },
  ],
  invalid: [
    {
      name: '배럴을 거친 조회 훅 호출을 검출한다',
      filename: ROUTE,
      code: `
        import { useQueryHook } from '../hooks';
        useQueryHook();
      `,
      errors: [
        {
          messageId: 'indirect',
          data: {
            hook: 'useQueryHook',
            chain: 'useQueryHook → useQuery',
          },
        },
      ],
    },
  ],
});
```

여기서 중요한 점은 `RuleTester`의 `code`가 fixture의 `page.tsx`를 덮어쓰는 것이 아니라는 점입니다.

`code`는 현재 검사할 가상 소스이고, 실제 `filename`은 다음 정보를 제공합니다.

- 상대 import를 해석할 기준 디렉터리
- 가장 가까운 package root
- import graph 탐색의 시작점
- `@/` 같은 앱 단위 alias의 기준점

테스트 진입 코드는 문자열로 자유롭게 바꾸되, 규칙이 따라갈 배럴과 훅만 실제 파일로 유지하는 혼합 방식입니다.

## Fixture의 package.json은 경계 표식이다

Fixture의 `package.json`은 앱을 실행하기 위해 존재하지 않습니다.

```json
{
  "name": "eslint-rule-fixture",
  "private": true,
  "version": "0.0.0"
}
```

Resolver는 현재 파일에서 부모 디렉터리로 올라가며 가장 가까운 `package.json`을 package root로 판단합니다.

```ts
export function findPackageRoot(fromFile: string): string | null {
  let directory = path.dirname(fromFile);

  for (;;) {
    if (fs.existsSync(path.join(directory, 'package.json'))) {
      return directory;
    }

    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}
```

Fixture에 별도 `package.json`이 없다면 테스트 대상 앱의 루트가 아니라 `eslint-config` 패키지 전체가 root로 인식됩니다. 그러면 미사용 Public API 규칙이 fixture의 `src`가 아닌 ESLint 패키지 전체를 검색하게 됩니다.

따라서 이 파일은 의존성 선언보다 패키지 경계를 재현하는 표식에 가깝습니다.

## 미사용 Public API도 실제 소비자로 테스트하기

배럴의 미사용 export를 찾는 규칙은 현재 파일만 보고 판단할 수 없습니다. 해당 이름을 가져가는 소비자가 패키지 안에 존재하는지 확인해야 합니다.

Fixture에 사용하는 값과 사용하지 않는 값을 함께 둡니다.

```ts
// modules/slice/thing.ts
export const usedThing = 1;
export const unusedThing = 2;
```

실제 소비자도 만듭니다.

```ts
// app/consumer.ts
import { usedThing } from '../modules/slice';

export const total = usedThing;
```

테스트에서는 같은 배럴 경로를 사용합니다.

```ts
const BARREL = path.join(here, '__fixtures__/app/src/modules/slice/index.ts');

ruleTester.run('no-unused-public-api', rule, {
  valid: [
    {
      filename: BARREL,
      code: `export { usedThing } from './thing';`,
    },
  ],
  invalid: [
    {
      filename: BARREL,
      code: `export { unusedThing } from './thing';`,
      errors: [
        {
          messageId: 'unused',
          data: { name: 'unusedThing' },
        },
      ],
    },
  ],
});
```

이 방식은 규칙의 AST 방문자만 테스트하지 않습니다. package root 탐색, 디렉터리 순회, import 이름 수집까지 실제 동작을 함께 검증합니다.

## Fixture는 lint와 typecheck 대상에서 격리한다

Fixture에는 의도적으로 규칙을 위반하는 코드가 들어 있습니다. 이를 ESLint 패키지 자체의 lint 대상에 포함하면 테스트 데이터 때문에 lint가 실패합니다.

```ts
// packages/config/eslint-config/eslint.config.ts
export default [
  tsconfigRootDir(import.meta.url),
  ...baseConfig,
  {
    ignores: ['src/rules/__fixtures__/**'],
  },
];
```

TypeScript 검사에서도 제외합니다.

```json
{
  "compilerOptions": {
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "eslint.config.ts", "vitest.config.ts"],
  "exclude": ["node_modules", "src/rules/__fixtures__"]
}
```

Fixture를 제외한다고 해서 테스트에서 접근하지 못하는 것은 아닙니다. RuleTester가 명시적으로 넘긴 경로를 custom rule이 직접 읽기 때문입니다.

## RuleTester를 Vitest에서 실행하기

RuleTester가 사용하는 `describe`와 `it`을 제공하도록 Vitest globals를 활성화합니다.

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

Vitest의 global API는 기본적으로 비활성화돼 있으며, `globals: true`를 사용한다면 TypeScript 설정에 `vitest/globals`도 추가해야 합니다. 자세한 설정은 [Vitest globals](https://vitest.dev/config/globals)에 나와 있습니다.

현재 구조에서는 여섯 개의 custom rule 테스트 파일이 50개의 valid·invalid 계약을 관리합니다.

규칙 테스트는 다음을 함께 확인합니다.

- 잡아야 할 코드
- 허용해야 할 코드
- 오류의 `messageId`
- 메시지에 전달되는 데이터
- autofix 결과
- 별칭, 배럴, default export 같은 우회 경로
- 오탐이 발생했던 실제 패턴

특히 custom rule에서는 invalid 사례만큼 valid 사례가 중요합니다. 오탐이 많은 린트 규칙은 개발자가 경고를 신뢰하지 않게 만들기 때문입니다.

## 실제 오탐을 fixture 회귀 테스트로 바꾸기

미사용 Public API 규칙의 초기 구현은 named import만 수집했습니다.

```ts
import { Program } from './program';
```

하지만 다음 default import는 사용처로 세지 못했습니다.

```ts
import Program from './program';
```

배럴이 같은 값을 다음처럼 다시 내보내는 코드가 있었기 때문에 문제가 됐습니다.

```ts
export { default as Program } from './program';
```

그 결과 실제로 사용 중인 export 약 30건이 미사용으로 판정됐습니다.

수정은 두 부분으로 나눴습니다. 먼저 중괄호 앞의 식별자를 default import로 수집했습니다.

```ts
const defaultBinding = clause
  .split('{')[0]
  ?.replace(/,\s*$/, '')
  .trim();

if (IDENTIFIER.test(defaultBinding)) {
  names.add(defaultBinding);
}
```

같은 문제가 돌아오지 않도록 fixture에도 default export와 소비자를 추가했습니다.

```ts
// defaultThing.ts
const defaultThing = 3;
export default defaultThing;
```

```ts
// consumer.ts
import DefaultThing from '../modules/slice/defaultThing';
```

```ts
{
  name: '원본 파일의 default import도 사용처로 센다',
  filename: BARREL,
  code: `export { default as DefaultThing } from './defaultThing';`,
}
```

Fixture의 가치는 처음부터 모든 경우를 예측하는 데 있지 않습니다. 운영 중 발견한 오탐과 누락을 최소 재현 구조로 남겨 같은 판단이 반복해서 깨지는 것을 막는 데 있습니다.

## 정확한 분석보다 안전한 분석을 택하기

`no-unused-public-api`는 완전한 dead-code analyzer가 아닙니다.

현재 구현은 패키지 안에서 import되는 이름의 합집합을 만듭니다. 같은 이름이 다른 모듈에서 사용되면 실제로는 쓰이지 않는 export도 사용 중이라고 판단할 수 있습니다.

이는 의도적인 선택입니다.

- 사용 중인 코드를 미사용이라고 보고하는 false positive
- 미사용 코드를 놓치는 false negative

두 가지 중 후자를 택했습니다. 삭제 후보를 찾는 보조 규칙이라면 일부를 놓치는 것보다 정상 코드를 지우도록 유도하는 쪽이 더 위험하기 때문입니다.

좋은 사내 린트 규칙이 반드시 작은 TypeScript compiler일 필요는 없습니다. 규칙의 실패 비용에 맞는 정확도를 선택해야 합니다.

## Custom rule의 성능도 운영 대상이다

파일 시스템을 읽는 규칙은 정확하기만 해서는 부족합니다. ESLint는 CLI뿐 아니라 VSCode처럼 오래 살아 있는 프로세스에서도 반복 실행됩니다.

초기 `no-unused-public-api`는 배럴을 검사할 때마다 앱의 `src` 전체를 다시 순회했습니다.

당시 측정 기준으로는 다음 작업이 발생했습니다.

- 배럴 약 101개
- 소스 파일 약 854개
- 약 8만 6천 번의 `statSync`
- 전체 rule 실행 시간의 64.8%, 약 3.7초 사용

파일 내용은 mtime으로 캐시했지만, 디렉터리 순회와 합산 작업을 배럴마다 반복하고 있었기 때문입니다.

최종적으로 캐시를 두 층으로 나눴습니다.

```ts
interface UsageIndex {
  perFile: Map<string, Set<string>>;
  mtimes: Map<string, number>;
  used: Set<string> | null;
  builtAt: number;
}
```

파일별 import 결과는 mtime이 달라졌을 때만 갱신합니다.

```ts
if (index.mtimes.get(file) !== mtime) {
  index.mtimes.set(file, mtime);
  index.perFile.set(file, importedNames(fs.readFileSync(file, 'utf8')));
}
```

패키지 전체 합산 결과는 짧은 시간 동안 재사용합니다.

```ts
const REBUILD_INTERVAL_MS = 1_000;

if (index.used && Date.now() - index.builtAt < REBUILD_INTERVAL_MS) {
  return index.used;
}
```

CLI 한 번이 도는 동안에는 사실상 한 번만 계산하고, 에디터처럼 프로세스가 오래 살아 있어도 1초 뒤에는 변경을 반영합니다.

로컬 교차 측정에서는 Back-Office ESLint 실행 시간이 `13.1초·10.6초`에서 `7.5초·6.3초`로 줄었습니다. 기기와 캐시 상태에 영향을 받는 수치지만, custom rule도 반드시 프로파일링해야 한다는 근거로는 충분했습니다.

반대로 “이 훅이 최종적으로 `useQuery`에 도달하는가” 같은 판정 결과는 캐시하지 않았습니다. 의존 파일이 바뀌었을 때 캐시 무효화에 필요한 전체 dependency graph를 관리하지 않으면, 장기 실행되는 에디터가 영원히 오래된 결과를 보여줄 수 있기 때문입니다.

원본 파일의 AST처럼 mtime으로 안전하게 무효화할 수 있는 정보만 캐시하고, 여러 파일의 상태에 의존하는 최종 판단은 매번 다시 계산합니다.

## 모노레포에서는 config root도 명시한다

여러 workspace가 각각 `eslint.config.ts`를 가지면 VSCode ESLint 프로세스 하나가 여러 설정을 읽을 수 있습니다. 이때 TypeScript parser가 `tsconfigRootDir`을 자동 추론하도록 두면 설정 파일 기준점이 흔들릴 수 있습니다.

각 config의 첫 항목에서 자신의 위치를 명시합니다.

```ts
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function tsconfigRootDir(configFileUrl: string) {
  return {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: dirname(fileURLToPath(configFileUrl)),
      },
    },
  };
}
```

```ts
export default [tsconfigRootDir(import.meta.url), ...nextJsConfig];
```

중앙 패키지가 모든 workspace에 하나의 root를 강요하지 않고, 소비하는 config가 자신의 기준점을 넘기는 구조입니다.

## 테스트를 모노레포 작업 그래프에 포함하기

ESLint 설정 패키지도 일반 패키지와 같은 `test` 스크립트를 가집니다.

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

루트에서는 Turbo가 workspace의 테스트를 실행합니다.

```json
{
  "scripts": {
    "test": "turbo test --concurrency=1"
  }
}
```

이렇게 하면 애플리케이션 테스트와 custom rule 테스트가 같은 명령 아래 들어가고, Turbo의 작업 단위와 캐시도 사용할 수 있습니다.

다만 `lint`와 `test`는 별개의 작업입니다. `pnpm lint`가 성공했다고 해서 RuleTester 계약도 실행됐다는 의미는 아닙니다. 배포 게이트에서 두 계약을 모두 요구한다면 파이프라인에서도 두 명령을 명시적으로 실행해야 합니다.

## 모든 규칙을 처음부터 error로 만들지 않는다

린트 규칙의 심각도는 취향이 아니라 실패 비용으로 정했습니다.

예를 들어 손으로 작성한 queryKey는 캐시 무효화를 조용히 실패시킬 수 있습니다.

```ts
// 문자열이 조금만 달라도 아무 일 없이 실패한다.
queryClient.invalidateQueries({
  queryKey: ['fetchProgramList'],
});
```

따라서 options 함수를 단일 출처로 사용하게 합니다.

```ts
queryClient.invalidateQueries(programListOptions());
```

이 규칙은 실제 런타임 오류를 막기 때문에 error입니다.

반면 기존 파일 배치나 배럴 정리는 한 번에 모두 고칠 수 없고, 당장 실행을 깨뜨리지도 않습니다. 이런 아키텍처 드리프트는 warning으로 도입했습니다.

새 규칙을 적용하는 과정은 대체로 다음과 같았습니다.

1. 반복해서 발생하는 실제 문제를 찾습니다.
2. 기계가 판단할 수 있는 계약만 추출합니다.
3. valid 사례를 충분히 작성해 허용 범위를 먼저 정합니다.
4. warning으로 전체 저장소에 적용합니다.
5. 오탐을 fixture 회귀 테스트로 남깁니다.
6. 성능을 측정합니다.
7. 조용한 런타임 실패를 막는 규칙만 error로 승격합니다.

## 아직 남아 있는 한계

이 구조가 모든 TypeScript 코드를 완전히 이해하는 것은 아닙니다.

- 미사용 Public API 분석은 정적 import 이름 중심입니다.
- dynamic import와 `require()`는 완전히 추적하지 않습니다.
- resolver는 상대 경로, 저장소의 `@/` alias와 workspace exports만 이해합니다.
- query 추적은 알려진 React Query hook 목록과 `use[A-Z]` 명명 규칙에 의존합니다.
- RuleTester는 개별 규칙의 동작을 검증하지만, 소비 앱이 해당 규칙을 실제로 활성화했는지는 별도의 config wiring 문제입니다.
- 오래전에 작성한 일부 규칙은 아직 같은 수준의 계약 테스트로 이전되지 않았습니다.

이 한계를 숨기기보다 규칙의 범위로 명시하는 편이 낫습니다. 범용 정적 분석기를 만들려는 순간 유지 비용이 급격하게 커집니다.

## 마치며

Custom ESLint rule을 만드는 일의 핵심은 AST visitor를 작성하는 것이 아니었습니다.

프로젝트의 반복되는 실수를 작은 계약으로 정의하고, 그 계약을 모노레포 전체에 배포하며, 우회 경로와 오탐을 fixture로 고정하고, 에디터와 CI에서 감당할 수 있도록 성능을 관리하는 일이었습니다.

좋은 사내 ESLint rule은 모든 코드를 이해하는 작은 TypeScript compiler가 아닙니다.

> 반복해서 놓친 결함 하나를 명확한 계약으로 만들고, 그 계약의 우회 경로를 fixture로 고정하며, 오탐과 실행 비용까지 운영하는 도구입니다.

문서를 없애는 것이 아니라, 문서 중 기계가 판정할 수 있는 부분을 실행 가능한 코드로 옮기는 것입니다.
