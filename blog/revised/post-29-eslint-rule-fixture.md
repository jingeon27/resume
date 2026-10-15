# 리뷰 코멘트를 ESLint 규칙으로: 모노레포에서 규칙과 fixture를 함께 관리하기

“Next.js의 `page.tsx`에서는 직접 조회하지 않는다.”

프로젝트에는 이런 규칙이 있었어요. 페이지는 화면을 조립하고, 조회는 `ListView` 같은 하위 컴포넌트가 맡아야 에러 바운더리와 로딩 UI의 범위를 나눌 수 있다는 원칙이었죠.

문서로 설명하기는 어렵지 않았어요. 문제는 우회하기가 너무 쉽다는 거였는데요.

```tsx
// 직접 호출은 리뷰에서 눈에 띈다.
const result = useQuery(options);
```

커스텀 훅을 한 겹 거치면 얘기가 달라져요.

```tsx
const result = useProgramList();
```

`useProgramList()` 안에서 `useQuery()`를 부르는지 알려면 선언 파일을 열어 봐야 해요. 훅이 배럴 파일을 거쳐 재수출되거나 default export라면 따라가야 할 경로는 더 길어지고요.

배럴의 사용하지 않는 export, 슬라이스 사이의 deep import, 손으로 쓴 queryKey도 비슷했어요. 문서에 규칙을 더할수록 문서는 길어졌는데, 리뷰에서 놓칠 가능성은 별로 줄지 않았어요.

그래서 문서를 더 자세히 쓰는 대신, 기계가 판단할 수 있는 부분을 ESLint 규칙으로 옮겼어요.

그러자 ESLint 설정이 파일 시스템을 읽고, import graph를 따라가고, 캐시까지 관리하는 작은 정적 분석 도구가 됐어요. 이 코드에도 테스트와 fixture가 필요해졌고요.

ESLint는 기본 규칙이나 공개 플러그인으로 풀리지 않는 프로젝트만의 요구사항을 위해 custom rule을 만들 수 있게 해 주고, 규칙을 테스트하는 `RuleTester`도 제공해요. 기본 구성은 [ESLint Custom Rule Tutorial](https://eslint.org/docs/latest/extend/custom-rule-tutorial)에 나와 있어요.

## ESLint 설정을 독립된 workspace package로 만들기

규칙을 각 앱의 `eslint.config`에 바로 넣을 수도 있어요. 그런데 앱이 세 개가 되고 React 패키지와 FSD 패키지까지 생기면 설정이 금방 갈라져요.

그래서 모노레포에서는 ESLint 설정을 private workspace package로 분리했어요.

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

설정 하나를 크게 내보내지 않고, 역할별로 진입점을 나눴어요.

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

각 앱과 패키지는 필요한 설정만 골라 조합해요.

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

ESLint의 flat shareable config도 결국 설정 객체나 배열을 export하는 패키지예요. 한 패키지에서 여러 설정을 진입점별로 나눠 내보낼 수도 있고요. 패키지 구성은 [ESLint Share Configurations](https://eslint.org/docs/latest/extend/shareable-configs)에 설명돼 있어요.

내부 패키지는 `workspace:*`로 연결해요.

```json
{
  "devDependencies": {
    "@repo/eslint-config": "workspace:*"
  }
}
```

pnpm의 `workspace:` 프로토콜을 쓰면 같은 저장소의 패키지만 연결돼요. 이름이 같은 외부 패키지로 조용히 바뀌지 않으니 내부 설정 패키지에 잘 맞았어요. 자세한 동작은 [pnpm Workspace](https://pnpm.io/workspaces)에 정리돼 있어요.

## 규칙이 보는 정보에 따라 테스트를 나눴어요

Custom rule이라고 늘 실제 파일이 필요하지는 않아요. 규칙이 어떤 정보를 쓰는지에 따라 테스트를 세 단계로 나눴어요.

| 규칙의 성격 | 예시 | 테스트 방법 |
| --- | --- | --- |
| 현재 파일의 AST만 사용 | raw queryKey, JSX 속성 | 인라인 `code` |
| 파일 경로의 의미까지 사용 | 슬라이스 구조, deep import | 가상 `filename` |
| 다른 파일까지 추적 | 간접 query hook, 미사용 Public API | 실제 fixture |

### AST만 보는 규칙

아래 규칙은 `QueryErrorBoundary`에 복구 범위를 뜻하는 `variant`를 꼭 적게 해요. 현재 파일의 JSX만 보면 되니 fixture가 필요 없어요.

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

autofix가 있는 규칙은 오류가 나는지만 보지 않고 `output`까지 계약으로 고정해요.

### 경로 의미가 필요한 규칙

FSD 슬라이스 사이의 deep import를 막는 규칙에서는 파일 내용보다 현재 파일과 import 대상의 경로가 중요해요. 그래서 파일을 만들지 않고 가상의 절대 경로만 넘겨도 돼요.

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

여기서 `filename`은 실제로 없어도 돼요. 규칙이 경로 문자열만 해석하거든요.

### 모듈 그래프를 따라가는 규칙

`page.tsx`에서 부른 훅이 안에서 `useQuery()`를 쓰는지 판단하려면 얘기가 달라져요. 규칙이 처리해야 하는 경우만 이만큼이에요.

- 직접 `useQuery()`를 호출하는 경우
- `useQuery as useRQ`처럼 별칭을 붙인 경우
- namespace import를 사용한 경우
- 커스텀 훅으로 감싼 경우
- default export인 훅
- `export *` 배럴을 거친 훅
- 순환 참조가 있는 경우

이건 인라인 코드만으로는 테스트할 수 없어요. import 대상 파일이 실제로 있어야 하니까요. 참고로 query 추적은 알려진 React Query hook 목록과 `use[A-Z]` 명명 규칙에 기대고 있어요.

## RuleTester의 가상 코드와 실제 fixture를 함께 쓰기

Fixture에는 제품 앱을 통째로 복사하지 않고, 규칙이 따라가야 하는 최소한의 파일 구조만 만들었어요.

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

조회 훅은 실제 파일로 뒀어요.

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

배럴도 실제로 만들었고요.

```ts
// __fixtures__/app/src/hooks/index.ts
export * from './use-query-hook';
export * from './use-plain-hook';
```

테스트에서는 fixture의 라우트 파일 경로를 `filename`으로 넘겨요.

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

이제 배럴을 거친 훅 호출도 테스트할 수 있어요.

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

이때 `RuleTester`의 `code`가 fixture의 `page.tsx`를 덮어쓰지는 않아요. `code`는 지금 검사할 가상 소스이고, 실제 `filename`은 이런 정보를 줘요.

- 상대 import를 해석할 기준 디렉터리
- 가장 가까운 package root
- import graph 탐색의 시작점
- `@/` 같은 앱 단위 alias의 기준점

resolver가 이해하는 건 상대 경로와 저장소의 `@/` alias, workspace exports까지예요.

테스트 진입 코드는 문자열로 자유롭게 바꾸고, 규칙이 따라갈 배럴과 훅만 실제 파일로 두는 방식이에요.

## Fixture의 package.json은 패키지 경계를 알려 줘요

Fixture에도 `package.json`을 하나 뒀어요. 앱을 실행하려는 건 아니고요.

```json
{
  "name": "eslint-rule-fixture",
  "private": true,
  "version": "0.0.0"
}
```

Resolver는 현재 파일에서 부모 디렉터리로 올라가면서 가장 가까운 `package.json`이 있는 곳을 package root로 봐요.

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

Fixture에 `package.json`이 없으면 테스트 대상 앱의 루트 대신 `eslint-config` 패키지 전체가 root로 잡혀요. 그러면 미사용 Public API 규칙이 fixture의 `src` 대신 ESLint 패키지 전체를 뒤지게 되고요.

그래서 이 파일은 의존성을 선언하는 용도보다 패키지 경계를 재현하는 표식에 가까워요.

## 미사용 Public API도 실제 소비자로 테스트하기

배럴의 미사용 export를 찾는 규칙은 현재 파일만 보고는 판단할 수 없어요. 그 이름을 가져가는 소비자가 패키지 안에 있는지 확인해야 하니까요.

그래서 fixture에 쓰는 값과 쓰지 않는 값을 함께 뒀어요.

```ts
// modules/slice/thing.ts
export const usedThing = 1;
export const unusedThing = 2;
```

실제 소비자도 만들었어요.

```ts
// app/consumer.ts
import { usedThing } from '../modules/slice';

export const total = usedThing;
```

테스트에서는 같은 배럴 경로를 써요.

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

이렇게 하면 규칙의 AST 방문자뿐 아니라 package root 탐색, 디렉터리 순회, import 이름 수집까지 실제로 돌려 보며 검증할 수 있어요.

## Fixture는 lint와 typecheck에서 뺐어요

Fixture에는 일부러 규칙을 어기는 코드가 들어 있어요. 이걸 ESLint 패키지 자체의 lint 대상에 넣으면 테스트 데이터 때문에 lint가 실패해요.

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

TypeScript 검사에서도 뺐어요.

```json
{
  "compilerOptions": {
    "types": ["node", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "eslint.config.ts", "vitest.config.ts"],
  "exclude": ["node_modules", "src/rules/__fixtures__"]
}
```

이렇게 빼도 테스트에서는 fixture를 그대로 쓸 수 있어요. RuleTester가 넘긴 경로를 custom rule이 직접 읽거든요.

## RuleTester를 Vitest에서 실행하기

RuleTester가 가져다 쓰는 `describe`와 `it`이 있어야 해서 Vitest globals를 켰어요.

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

Vitest의 global API는 기본으로 꺼져 있어요. `globals: true`를 쓴다면 TypeScript 설정에도 `vitest/globals`를 넣어야 하고요. 자세한 설정은 [Vitest globals](https://vitest.dev/config/globals)에 나와 있어요.

지금 구조에서는 custom rule 테스트 파일 여섯 개가 valid, invalid 계약 50개를 관리해요. 오래전에 작성한 일부 규칙은 아직 같은 수준의 계약 테스트로 옮기지 못했고요.

규칙 테스트에서는 이런 것들을 함께 확인해요.

- 잡아야 할 코드
- 허용해야 할 코드
- 오류의 `messageId`
- 메시지에 전달되는 데이터
- autofix 결과
- 별칭, 배럴, default export 같은 우회 경로
- 오탐이 발생했던 실제 패턴

custom rule에서는 invalid 사례만큼 valid 사례도 중요했어요. 오탐이 많은 린트 규칙은 개발자가 경고를 믿지 않게 만드니까요.

## 실제 오탐을 fixture 회귀 테스트로 바꾸기

미사용 Public API 규칙은 처음에 named import만 수집했어요.

```ts
import { Program } from './program';
```

그래서 이런 default import는 사용처로 세지 못했는데요.

```ts
import Program from './program';
```

배럴에서 같은 값을 이렇게 다시 내보내는 코드가 있어서 문제가 됐어요.

```ts
export { default as Program } from './program';
```

그 결과 실제로 쓰고 있는 export 약 30건이 미사용으로 판정됐어요.

수정은 두 부분으로 나눴어요. 먼저 중괄호 앞의 식별자를 default import로 수집했어요.

```ts
const defaultBinding = clause
  .split('{')[0]
  ?.replace(/,\s*$/, '')
  .trim();

if (IDENTIFIER.test(defaultBinding)) {
  names.add(defaultBinding);
}
```

그리고 같은 문제가 다시 생기지 않게 fixture에도 default export와 소비자를 추가했어요.

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

처음부터 모든 경우를 예측해서 fixture를 만들 수는 없어요. 규칙을 쓰다가 발견한 오탐과 누락을 최소 재현 구조로 남겨 두면, 같은 판단이 다시 깨지는 걸 막을 수 있어요.

## 일부를 놓치더라도 안전한 쪽을 택했어요

`no-unused-public-api`는 완전한 dead-code analyzer는 아니에요.

지금 구현은 패키지 안에서 import되는 이름을 모아 합집합을 만들어요. 그래서 같은 이름을 다른 모듈에서 쓰고 있으면, 실제로는 안 쓰이는 export도 사용 중이라고 판단할 수 있어요. 정적 import 이름을 중심으로 보기 때문에 dynamic import와 `require()`도 완전히 추적하지는 않고요.

일부러 이렇게 뒀어요. 사용 중인 코드를 미사용이라고 보고하는 false positive와, 미사용 코드를 놓치는 false negative 중에서 후자를 택했어요. 삭제 후보를 찾는 보조 규칙이라면 일부를 놓치는 것보다 정상 코드를 지우게 만드는 쪽이 더 위험하니까요.

사내 린트 규칙이 꼭 작은 TypeScript compiler일 필요는 없다고 생각해요. 범용 정적 분석기를 만들려는 순간 유지 비용이 급격히 커지거든요. 규칙이 틀렸을 때 드는 비용에 맞춰 정확도를 고르면 돼요.

## Custom rule도 성능을 재야 했어요

파일 시스템을 읽는 규칙은 정확하기만 해서는 부족했어요. ESLint는 CLI뿐 아니라 VSCode처럼 오래 살아 있는 프로세스에서도 계속 실행되니까요.

처음 만든 `no-unused-public-api`는 배럴을 검사할 때마다 앱의 `src` 전체를 다시 순회했어요. 당시 측정해 보니 배럴 약 101개와 소스 파일 약 854개를 두고 `statSync`가 약 8만 6천 번 불렸고, 전체 rule 실행 시간의 64.8%, 약 3.7초가 여기에 들어갔어요. 파일 내용은 mtime으로 캐시했지만, 디렉터리 순회와 합산은 배럴마다 반복하고 있었거든요.

결국 캐시를 두 층으로 나눴어요.

```ts
interface UsageIndex {
  perFile: Map<string, Set<string>>;
  mtimes: Map<string, number>;
  used: Set<string> | null;
  builtAt: number;
}
```

파일별 import 결과는 mtime이 달라졌을 때만 갱신해요.

```ts
if (index.mtimes.get(file) !== mtime) {
  index.mtimes.set(file, mtime);
  index.perFile.set(file, importedNames(fs.readFileSync(file, 'utf8')));
}
```

패키지 전체를 합산한 결과는 잠깐 동안 재사용하고요.

```ts
const REBUILD_INTERVAL_MS = 1_000;

if (index.used && Date.now() - index.builtAt < REBUILD_INTERVAL_MS) {
  return index.used;
}
```

CLI를 한 번 돌리는 동안에는 사실상 한 번만 계산하고, 에디터처럼 프로세스가 오래 살아 있어도 1초 뒤에는 변경이 반영돼요.

로컬 교차 측정에서는 Back-Office ESLint 실행 시간이 `13.1초, 10.6초`에서 `7.5초, 6.3초`로 줄었어요. 기기와 캐시 상태에 따라 달라지는 수치지만, custom rule도 프로파일링해야 한다는 근거로는 충분했어요.

반면 “이 훅이 최종적으로 `useQuery`에 도달하는가” 같은 판정 결과는 캐시하지 않았어요. 의존 파일이 바뀔 때 캐시를 무효화하려면 전체 dependency graph를 관리해야 하는데, 그걸 하지 않으면 오래 실행되는 에디터가 계속 낡은 결과를 보여 줄 수 있거든요.

그래서 원본 파일의 AST처럼 mtime으로 안전하게 무효화할 수 있는 정보만 캐시하고, 여러 파일의 상태에 기대는 최종 판단은 매번 다시 계산해요.

## 모노레포에서는 config root도 직접 넘겨요

여러 workspace가 각자 `eslint.config.ts`를 가지면 VSCode ESLint 프로세스 하나가 여러 설정을 읽을 수 있어요. 이때 TypeScript parser가 `tsconfigRootDir`을 알아서 추론하게 두면 설정 파일의 기준점이 흔들릴 수 있어요.

그래서 각 config의 첫 항목에서 자기 위치를 명시해요.

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

중앙 패키지가 root 하나를 모든 workspace에 강요하지 않고, 설정을 가져다 쓰는 각 config가 자기 기준점을 넘기는 구조예요.

## 테스트를 모노레포 작업 그래프에 포함하기

ESLint 설정 패키지에도 다른 패키지와 같은 `test` 스크립트를 뒀어요.

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

루트에서는 Turbo가 workspace의 테스트를 실행해요.

```json
{
  "scripts": {
    "test": "turbo test --concurrency=1"
  }
}
```

이렇게 하면 앱 테스트와 custom rule 테스트가 같은 명령으로 돌고, Turbo의 작업 단위와 캐시도 쓸 수 있어요.

다만 `lint`와 `test`는 별개의 작업이에요. `pnpm lint`가 성공했다고 RuleTester 계약까지 실행된 건 아니에요. 배포 게이트에서 둘 다 요구한다면 파이프라인에서도 두 명령을 따로 실행해야 해요.

RuleTester가 검증하는 것도 개별 규칙의 동작까지예요. 소비하는 앱이 그 규칙을 실제로 켰는지는 config wiring을 따로 확인해야 해요.

## 처음부터 모든 규칙을 error로 켜지는 않았어요

린트 규칙의 심각도는 실패했을 때 드는 비용을 보고 정했어요.

예를 들어 손으로 쓴 queryKey는 캐시 무효화를 조용히 실패하게 만들 수 있어요.

```ts
// 문자열이 조금만 달라도 아무 일 없이 실패한다.
queryClient.invalidateQueries({
  queryKey: ['fetchProgramList'],
});
```

그래서 options 함수를 단일 출처로 쓰게 했어요.

```ts
queryClient.invalidateQueries(programListOptions());
```

이 규칙은 실제 런타임 오류를 막으니 error로 뒀어요.

반면 기존 파일 배치나 배럴 정리는 한 번에 다 고칠 수 없고, 당장 실행을 깨뜨리지도 않아요. 이런 아키텍처 드리프트는 warning으로 도입했어요.

새 규칙은 대체로 이런 순서로 적용했어요.

1. 반복해서 생기는 실제 문제를 찾아요.
2. 기계가 판단할 수 있는 계약만 뽑아내요.
3. valid 사례를 충분히 써서 허용 범위를 먼저 정해요.
4. warning으로 저장소 전체에 적용해요.
5. 오탐을 fixture 회귀 테스트로 남겨요.
6. 성능을 측정해요.
7. 조용한 런타임 실패를 막는 규칙만 error로 올려요.

## 마치며

돌아보면 custom ESLint rule을 만들면서 AST visitor를 짜는 건 일부였어요. 프로젝트에서 반복되는 실수를 작은 계약으로 정하고, 그 계약을 모노레포 전체에 배포하고, 우회 경로와 오탐을 fixture로 고정하고, 에디터와 CI에서 감당할 수 있게 성능까지 챙겨야 했어요.

문서는 그대로 두고, 그중 기계가 판정할 수 있는 부분만 실행 가능한 코드로 옮긴 셈이에요.
