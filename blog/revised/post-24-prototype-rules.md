# 프로토타입을 실사용 서비스로 옮기며 작업 규칙을 먼저 만든 이유

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>검증용 SPA를 실사용 서비스로 옮기는데 화면마다 같은 문제가 되풀이돼서, 반복되는 판단을 skill로 옮긴 과정이에요. 짧고 강하게 적었던 규칙을 조건과 반례가 붙은 규칙으로 고친 세 사례(hook과 props, 마운트 지연과 Suspense, mutation 상태)를 보여 주고, 리뷰 지적 중 무엇을 규칙으로 남겼는지와 완료 조건도 적어요.</p>
</div>

검증용 SPA를 실사용 서비스로 옮기면서 처음 만든 화면들은 겉보기에는 빨리 나왔어요. 그런데 다음 화면에서도 같은 hydration 문제와 번역 누락, 폼 초기화 오류가 반복됐어요. 화면마다 Claude Code에 다시 설명하는 방식으로는 속도가 쌓이지 않았어요.

SSR, SEO, 다국어, 폼 검증과 관리자 화면은 앞으로도 계속 반복될 예정이었어요. 그래서 구현을 요청하기 전에 작업 순서와 판단 기준부터 저장소 안에 적었어요.

여기서 말하는 규칙은 Jira task를 읽고 plan을 세우는 단계부터 구현, 검증, code review, commit까지 매번 반복되는 판단을 적어 둔 문서예요.

## 화면마다 설명하는 대신 작업 흐름을 skill에 적었어요

skill은 저장소에 두고 Claude Code가 작업할 때 읽는 지침 문서예요. 서비스 작업용 skill에는 다음 순서를 넣었어요.

```text
Jira task와 acceptance criteria 확인
  -> 관련 route, API, 기존 pattern 탐색
  -> 변경 파일과 검증 방법을 plan으로 작성
  -> 작은 단위로 구현
  -> typecheck, lint, build, route smoke test
  -> diff 기반 code review
  -> 지적 반영 후 commit
```

명령 이름보다 각 단계에서 무엇을 남기는지가 중요했어요.

- plan에는 바꿀 route, 재사용할 pattern, loading/error/empty state를 적어요.
- 구현 전에 현재 codebase에서 가장 가까운 예제를 찾아요.
- review에서는 task 범위를 벗어난 변경, hydration, 접근성, 번역 누락을 확인해요.
- commit은 검증을 통과한 한 작업 단위로 만들어요.

폼, query, drawer처럼 반복되는 구현은 별도 skill에 코드베이스의 기존 패턴과 금지 사례를 함께 적었어요. 화면을 만들 때마다 같은 설명을 반복하지 않고, Jira 작업마다 달라지는 내용만 plan에 남겼어요.

## 짧고 강한 규칙은 오히려 코드를 숨겼어요

그런데 skill에 적은 규칙이 처음부터 맞지는 않았어요. AI가 반복해서 만든 문제를 짧게 막으려다 너무 강한 규칙을 만들기도 했는데요. "hook으로 얻을 수 있는 값은 prop으로 넘기지 않는다"가 그랬어요.

이 문장은 prop drilling을 줄이는 데는 도움이 되지만 항상 맞지는 않아요. props는 컴포넌트의 입력을 명시하고, 그 컴포넌트를 순수하게 테스트할 수 있게 해 주거든요. 그래서 규칙에 조건을 붙여 다음처럼 고쳤어요.

> router, locale, theme처럼 이미 공통 provider가 소유한 값을 관계없는 중간 컴포넌트가 전달만 하게 두지 않는다. 반면 부모가 계산한 화면 데이터와 컴포넌트의 명시적인 입력은 props로 전달한다.

수정 전에는 관계없는 컴포넌트 두 개가 locale을 전달만 했어요.

```tsx
function Page() {
  const locale = useLocale();
  return <Section locale={locale} />;
}

function Section({ locale }: { locale: Locale }) {
  return <ProductCard locale={locale} />;
}
```

수정 후에는 순수 UI 바로 위, 가장 가까운 소비 지점인 `ProductCard`에서 hook을 읽어요. 그 아래의 순수 UI는 locale을 props로 받는 명시적인 입력으로 남겨요.

```tsx
function Page() {
  return <Section />;
}

function Section() {
  return <ProductCard />;
}

function ProductCard() {
  const locale = useLocale();
  return <ProductName locale={locale} />;
}

// ProductName은 명시적인 입력을 받는 순수 UI로 남긴다.
function ProductName({ locale }: { locale: Locale }) {
  // ...
}
```

## 마운트 지연을 지워 달랬더니 hook으로 옮겨 왔어요

조건을 붙여야 했던 규칙은 이것만이 아니었어요. 레거시에는 `mounted`가 된 뒤에만 children을 보여 주는 컴포넌트가 있었어요.

```tsx
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : null;
}
```

AI에게 제거를 요청했더니 같은 코드를 `useMounted` hook으로 옮겼어요. 이름은 바뀌었지만 첫 paint를 비우는 동작은 그대로였어요.

그렇다고 layout에 Suspense가 있다는 이유로 모든 마운트 지연 코드를 지울 수도 없었어요. Suspense는 중단된 작업의 fallback을 처리하지만, `window` 접근이나 화면 크기에 따른 hydration 불일치까지 해결하지는 않거든요.

그래서 gate를 일괄적으로 금지하지 않고, 첫 render가 달라지는 이유부터 구분해 규칙을 나눴어요.

- `useSearchParams`처럼 정적 렌더링을 클라이언트 렌더링으로 바꿀 수 있는 훅은 그 훅을 쓰는 가장 작은 하위 트리를 Suspense로 감싸요.
- browser API는 event handler나 effect에서 읽고, 첫 server/client render가 같은 markup을 만들게 해요.
- viewport에 따라 표시만 달라진다면 JavaScript hook보다 CSS media query를 우선해요. viewport에 따라 fetch나 행동 자체가 달라진다면 그 결정은 별도 client logic으로 명시해요.
- 외부 위젯처럼 SSR이 불가능한 컴포넌트에만 클라이언트 전용 경계를 써요.

첫 번째 규칙을 적용하면 이런 모양이에요.

```tsx
function SearchSection() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
```

## mutation이 이미 가진 상태는 다시 저장하지 않았어요

폼 제출을 `useMutation`으로 옮긴 뒤에도 성공 여부와 마지막 제출 값을 local state와 ref에 다시 저장한 코드가 있었어요. 한 번에 하나만 제출할 수 있고 마지막 mutation의 상태만 화면에 필요하다면, 같은 값을 `useState`와 `useRef`에 다시 저장하지 않고 `variables`와 `isSuccess`를 그대로 쓸 수 있어요.

```ts
const mutation = useMutation({ mutationFn: submitForm });

const submittedValues = mutation.variables;
const isComplete = mutation.isSuccess;
```

이것도 조건부 규칙이에요. 다음 경우에는 mutation 상태와 별도의 도메인 상태가 필요해요.

- 여러 제출이 동시에 진행될 수 있어요.
- 성공 이후에도 스냅샷을 오래 보존해야 해요.
- mutation reset과 무관한 업무 상태예요.

목표는 이미 원본이 있는 값을 다시 저장하지 않는 거였어요.

## 리뷰 지적은 반복될 것만 규칙으로 옮겼어요

몇 개 route를 옮긴 뒤 전체 diff를 다시 검토했어요. 발견한 문제를 해당 파일만 고치는 데서 끝내지 않고, 반복될 가능성이 있는 항목만 skill에 반영했어요. 예를 들어 이런 항목이 추가됐어요.

- 비동기 page props는 현재 Next.js 버전의 타입에 맞춰 먼저 `await`해요.
- query prefetch는 SEO 필요 여부와 streaming 가능 여부를 계획 단계에서 정해요.
- form의 async initial value는 Suspense gate 또는 `reset` 정책을 명시해요.
- icon button에는 접근 가능한 이름과 tooltip을 둬요.
- 다국어 route는 새 문구의 모든 locale key를 함께 검증해요.

<div class="note note-decision">
  <strong>규칙으로 남긴 기준</strong>
  <p>모든 review 지적을 영구 규칙으로 만들지는 않았어요. 한 화면에만 해당하거나 앞으로 반복될 가능성이 낮은 예외는 코드에서만 고쳤어요. 규칙이 너무 많아지면 서로 충돌하고 중요한 기준이 묻히기 때문이에요.</p>
</div>

## 끝났다는 판단은 완료 조건으로 했어요

빠르게 끝났다는 인상만으로 전환이 끝났다고 판단하지 않도록 완료 조건을 명시했어요.

- 변경 route의 typecheck와 lint 통과
- production build 통과
- 주요 route의 desktop/mobile smoke test
- server-rendered HTML과 metadata 확인
- form의 validation, submit, error path 확인
- 언어별 누락 키 확인
- diff code review 후 task 밖 변경 제거

## 줄어든 건 같은 지적이었어요

AI가 코드를 만든 속도보다 같은 종류의 지적이 다음 작업에서 줄었는지를 봤고, 무엇을 규칙으로 옮길지도 이 기준으로 골랐어요. 효과가 가장 컸던 건 같은 지적이 다음 화면에서 다시 나오지 않은 일이었어요. 반대로 "hook으로 얻을 수 있는 값은 prop으로 넘기지 않는다"처럼 짧지만 과한 규칙은 실제 코드를 더 숨겨서 다시 고쳐야 했고요.

## 다음 규칙을 더할 때 먼저 보는 것

지금은 규칙을 더하기 전에 한 화면의 예외인지, 반복될 실패인지부터 봐요. 반복된다면 적용 조건과 반례를 같이 적고, 아니면 그 코드만 고쳐요. AI가 빨리 쓰는 만큼 잘못된 기본값도 빨리 퍼지거든요.

## 참고

- [Next.js `useSearchParams`와 Suspense](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)
- [React Suspense](https://react.dev/reference/react/Suspense)
