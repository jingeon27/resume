# 프로토타입을 실사용 서비스로 옮기며 작업 규칙을 먼저 만든 이유

검증용 SPA를 운영 서비스로 옮기면서 처음 만든 화면들은 겉보기에는 빨리 나왔다. 하지만 다음 화면에서 같은 hydration 문제와 번역 누락, 폼 초기화 오류가 반복됐다. 화면마다 Claude Code에 다시 설명하는 방식으로는 속도가 누적되지 않았다.

SSR, SEO, 다국어, 폼 검증과 관리자 화면이 계속 반복될 예정이어서 구현 요청보다 먼저 작업 순서와 판단 기준을 저장소 안에 적었다.

여기서 규칙은 "항상 hook을 써라" 같은 취향 목록이 아니었다. Jira task를 읽고 plan을 세우는 단계부터 구현, 검증, code review, commit까지 반복되는 판단을 문서화한 것이었다.

## 작업 흐름부터 고정하기

서비스 작업용 skill에는 다음 순서를 넣었다.

```text
Jira task와 acceptance criteria 확인
  -> 관련 route, API, 기존 pattern 탐색
  -> 변경 파일과 검증 방법을 plan으로 작성
  -> 작은 단위로 구현
  -> typecheck, lint, build, route smoke test
  -> diff 기반 code review
  -> 지적 반영 후 commit
```

명령 이름보다 각 단계에서 무엇을 남기는지가 중요했다.

- plan에는 바꿀 route, 재사용할 pattern, loading/error/empty state를 적는다.
- 구현 전에 현재 codebase에서 가장 가까운 예제를 찾는다.
- review에서는 task 범위를 벗어난 변경, hydration, 접근성, 번역 누락을 확인한다.
- commit은 검증을 통과한 한 작업 단위로 만든다.

폼, query, drawer처럼 반복되는 구현은 별도 skill에 코드베이스의 기존 패턴과 금지 사례를 함께 적었다. 화면을 만들 때마다 같은 설명을 반복하지 않고 Jira 작업마다 달라지는 내용만 계획에 남겼다.

## 규칙은 포괄 규칙이 아니라 조건으로 쓴다

처음에는 AI가 반복해서 만든 문제를 짧게 막으려다 너무 강한 규칙을 만들기도 했다. 예를 들어 "hook으로 얻을 수 있는 값은 prop으로 넘기지 않는다"는 규칙이다.

이 문장은 prop drilling을 줄이는 데는 도움이 되지만 항상 맞지는 않는다. props는 컴포넌트의 입력을 명시하고 순수하게 테스트할 수 있게 해준다. 규칙을 다음처럼 고쳤다.

> router, locale, theme처럼 이미 공통 provider가 소유한 값을 관계없는 중간 컴포넌트가 전달만 하게 두지 않는다. 반면 부모가 계산한 화면 데이터와 컴포넌트의 명시적인 입력은 props로 전달한다.

수정 전에는 관계없는 컴포넌트 두 개가 locale을 전달만 했다.

```tsx
function Page() {
  const locale = useLocale();
  return <Section locale={locale} />;
}

function Section({ locale }: { locale: Locale }) {
  return <ProductCard locale={locale} />;
}
```

수정 후에는 순수 UI 바로 위, 가장 가까운 소비 지점에서 hook을 읽는다.

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

viewport도 표시만 달라진다면 JavaScript hook보다 CSS media query를 우선한다. 하지만 viewport에 따라 fetch나 행동 자체가 달라진다면 그 결정은 별도 client logic으로 명시한다.

## 마운트 지연과 Suspense를 구분한다

레거시에는 `mounted`가 된 뒤에만 children을 보여주는 컴포넌트가 있었다.

```tsx
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : null;
}
```

AI에게 제거를 요청했더니 같은 코드를 `useMounted` hook으로 옮겼다. 이름은 바뀌었지만 첫 paint를 비우는 동작은 그대로였다.

그렇다고 layout에 Suspense가 있다는 이유로 모든 마운트 지연 코드를 지울 수도 없었다. Suspense는 중단된 작업의 fallback을 처리하지만 `window` 접근이나 화면 크기에 따른 hydration 불일치까지 해결하지는 않는다.

규칙을 원인별로 나눴다.

- `useSearchParams`처럼 정적 렌더링을 클라이언트 렌더링으로 바꿀 수 있는 훅은 사용하는 가장 작은 하위 트리를 Suspense로 감싼다.
- browser API는 event handler나 effect에서 읽고, 첫 server/client render가 같은 markup을 만들게 한다.
- 표시 차이는 가능한 CSS media query로 처리한다.
- 외부 위젯처럼 SSR이 불가능한 컴포넌트에만 클라이언트 전용 경계를 사용한다.

```tsx
function SearchSection() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
```

gate를 일괄적으로 금지하지 않고 첫 render가 달라지는 이유부터 구분했다.

## mutation 상태를 다시 저장하지 않는 경우

폼 제출을 `useMutation`으로 옮긴 뒤에도 성공 여부와 마지막 제출 값을 local state와 ref에 다시 저장한 코드가 있었다.

```ts
const mutation = useMutation({ mutationFn: submitForm });

const submittedValues = mutation.variables;
const isComplete = mutation.isSuccess;
```

한 번에 하나만 제출할 수 있고 마지막 mutation의 상태만 화면에 필요하다면 `variables`와 `isSuccess`를 그대로 쓸 수 있다. 같은 값을 `useState`와 `useRef`에 다시 저장하지 않아도 된다.

하지만 이것도 조건부 규칙이다.

- 여러 제출이 동시에 진행될 수 있다.
- 성공 이후에도 스냅샷을 오래 보존해야 한다.
- mutation reset과 무관한 업무 상태다.

이 경우에는 mutation 상태와 별도의 도메인 상태가 필요하다. 상태 수를 무조건 줄이려는 게 아니라, 이미 원본이 있는 값을 다시 저장하지 않으려는 것이다.

## 리뷰에서 발견한 문제를 작업 규칙에 반영하기

몇 개 route를 옮긴 뒤 전체 diff를 다시 검토했다. 발견한 문제를 해당 파일만 고치는 데서 끝내지 않고, 반복될 가능성이 있는 항목만 skill에 반영했다.

예를 들어 다음 항목이 추가됐다.

- 비동기 page props는 현재 Next.js 버전의 타입에 맞춰 먼저 `await`한다.
- query prefetch는 SEO 필요 여부와 streaming 가능 여부를 계획 단계에서 정한다.
- form의 async initial value는 Suspense gate 또는 `reset` 정책을 명시한다.
- icon button에는 접근 가능한 이름과 tooltip을 둔다.
- 다국어 route는 새 문구의 모든 locale key를 함께 검증한다.

모든 review 지적을 영구 규칙으로 만들지는 않았다. 한 화면에만 해당하거나 앞으로 반복될 가능성이 낮은 예외는 code에서만 고쳤다. 규칙이 너무 많아지면 서로 충돌하고 중요한 기준이 묻히기 때문이다.

## 완료 기준

빠르게 끝났다는 인상만으로 실사용 전환을 설명하지 않기 위해 완료 조건을 명시했다.

- 변경 route의 typecheck와 lint 통과
- production build 통과
- 주요 route의 desktop/mobile smoke test
- server-rendered HTML과 metadata 확인
- form의 validation, submit, error path 확인
- 언어별 누락 키 확인
- diff code review 후 task 밖 변경 제거

AI가 코드를 생성한 속도보다 같은 종류의 지적이 다음 작업에서 줄었는지를 봤다. 규칙으로 옮길 가치가 있는 것도 이 기준으로 골랐다.

가장 효과가 컸던 것은 command 개수가 아니라 같은 지적이 다음 화면에서 반복되지 않은 일이었다. 반대로 “hook으로 얻을 수 있으면 prop으로 넘기지 않는다”처럼 짧지만 과한 규칙은 실제 코드를 더 숨겼고 다시 고쳐야 했다.

지금은 규칙을 추가할 때 한 화면의 예외인지 반복될 실패인지 먼저 본다. 반복된다면 적용 조건과 반례를 함께 적고, 그렇지 않으면 해당 코드만 고친다. AI가 빨리 작성하는 만큼 잘못된 기본값도 빨리 퍼지기 때문에, 이 구분이 화면 생성 명령보다 더 중요했다.

참고: [Next.js `useSearchParams`와 Suspense](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout), [React Suspense](https://react.dev/reference/react/Suspense)
