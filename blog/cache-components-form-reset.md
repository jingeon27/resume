# 폼 초기화를 고쳤더니 빈 폼이 됐다: Cache Components 가 드러낸 상태 소유권

복지몰 서비스의 예약 신청 화면에서 "재진입하면 폼이 초기화되지 않는다"는 버그를 맡았다. 이 화면은 Next 16 위에서 돌고 `cacheComponents` 가 켜져 있다.

증상은 이랬다. 폼을 채우다 다른 화면으로 나갔다 돌아오면 이전 입력이 그대로 남았다. 접수를 끝낸 뒤 다시 들어가도 방금 접수한 내용이 떠 있었다. 새로고침으로 들어가면 멀쩡했고, 앱 안에서 이동했을 때만 그랬다. 그마저도 어떤 경로로 돌아오느냐에 따라 나타나기도 하고 나타나지 않기도 했다.

이미 한 번 고쳐진 상태였다. 재진입 시점에 `reset()` 을 부르는 수정이 들어가 있었고, 원래 증상은 그걸로 사라졌다. 대신 다른 문제가 드러났다. 폼이 *초기 상태* 로 돌아가지 않고 빈 폼이 됐다. 진입할 때 자동 적용되던 최대 혜택 쿠폰까지 같이 지워졌고, 지워지는 과정이 한 프레임 보였다.

결국 초기화 코드를 더 넣지 않고, 되돌리는 시점을 뒤집고 되돌아갈 곳을 만드는 것으로 해결했다. Cache Components 는 원래부터 애매했던 상태 소유권을 드러냈을 뿐이다. 그동안은 언마운트가 매번 그걸 대신 정리해 주고 있었다.

> 코드는 실제 코드에서 곁가지를 덜어냈다. 회사와 서비스를 식별할 수 있는 부분만 일반화했고 구조는 그대로다.

---

## 언마운트되지 않고 숨는다

Next 문서에 동작이 그대로 적혀 있다.

> *"Instead of unmounting pages on navigation, Next.js hides them using React's `<Activity>` component. Activity keeps the DOM in the document (hidden with `display: none`), so both React state and DOM state are preserved."*

한 줄이 더 있다.

> *"Effects are cleaned up when a route is hidden, and recreated when it becomes visible again"*

두 문장을 겹쳐 보면 hidden 전환이 무엇인지 나온다.

| 대상 | 라우트가 hidden 될 때 |
| --- | --- |
| React state (`useState`, 폼 값) | 보존 |
| DOM state (스크롤, `<details>` open, uncontrolled input, 비디오 재생 위치) | 보존 |
| ref | 보존(정리되지 않는다) |
| effect | cleanup 실행 → 다시 보일 때 재생성 |

**effect 는 언마운트처럼 정리되고 state 는 리렌더처럼 남는다.** 한 번의 전환 안에 두 생명주기가 섞여 있고, 뒤에 나오는 증상은 모두 이 비대칭에서 나온다. 정리 로직은 도는데 state 초기화는 일어나지 않으니, "언마운트되면 어차피 사라진다"에 기대던 코드만 정확히 골라서 깨진다. 폼 값이 그랬다. 그 값의 수명을 누가 책임지는지 아무도 정하지 않았고, 그동안은 라우트 전환이 대신 지워 주고 있었다.

여기서 한 번 멈칫했다. `Activity` 는 React 19.2 기능인데 이 프로젝트의 `package.json` 은 `react: ^18.2.0` 이다.

```bash
$ node -p "require('react/package.json').version"
18.3.1
$ node -p "typeof require('react').Activity"
undefined
$ node -p "typeof require('next/dist/compiled/react').Activity"
symbol
```

App Router 는 앱이 설치한 React 대신 Next 가 번들한 React 로 돈다. `package.json` 의 선언은 이 동작과 상관이 없다. 버전을 올리지 않았는데 동작이 바뀐 것도 이 때문이다.

이 동작을 끌 방법도 없다. 문서는 *"Opt-out strategies are being considered for gradual migration."* 이라고만 적는다. 끄려면 `cacheComponents` 를 내리는 수밖에 없는데, 이 플래그는 `use cache` 캐싱 모델을 함께 묶고 있어서 캐싱 전략 전체를 되돌리게 된다. 그건 선택지가 아니라고 봤다.

## 재현이 경로를 탄 이유

이 버그에서 가장 오래 걸린 건 원인 파악보다 재현이었다. 같은 화면인데 A→B→돌아오기는 재현되고, 몇 단계 더 돌다 오면 멀쩡했다.

문서에는 *"Next.js preserves up to 3 routes"* 라고만 적혀 있다. 그 한 줄로는 우리 화면에서 왜 어떤 경로만 재현되는지 설명이 안 됐다. 그래서 `node_modules` 를 열었다.

```ts
// next/dist/client/components/bfcache-state-manager
const MAX_BF_CACHE_ENTRIES = process.env.__NEXT_CACHE_COMPONENTS ? 3 : 1;

let n = 1; // 새 활성 엔트리를 이미 1로 세고 시작한다
let oldEntry = prevActiveEntry;
let clonedEntry = newActiveEntry;
while (oldEntry !== null && n < MAX_BF_CACHE_ENTRIES) {
  /* 과거 엔트리를 새 리스트로 클론 */
}
```

읽고 나니 문서 문장에 붙는 단서가 세 가지 있었다.

1. 3은 활성 엔트리를 포함한 값이다. 카운터가 `n = 1` 로 시작하므로 클론되는 과거 엔트리는 최대 2개다. 보이는 1개와 숨겨진 2개로 구성된다.
2. 상한은 세그먼트 레벨마다 따로 적용된다. 타입 주석이 *"Keeps track of the most recent N trees that were active at a certain segment level"* 이라고 못 박는다. 중첩 레이아웃이 있으면 레벨마다 독립적으로 유지된다.
3. eviction 은 복사에서 빠지는 방식으로 일어난다. 링크드 리스트를 새로 만들면서 상한을 넘는 꼬리를 잇지 않는다. 리스트에 이미 있는 키로 되돌아가면 fast path 를 타서 크기가 늘지 않는다.

순서 문제도 겹친다. 되돌아가기로 기존 엔트리에 들어가도 리스트는 history 순서 대신 최근 활성 순으로 다시 정렬된다. 코드에는 *"Once we start tracking back/forward history at each route level, we should use the history order instead"* 라는 TODO 가 달려 있다. 어떤 화면의 상태가 살아남는지가 히스토리 스택과 일치하지 않는다는 뜻이다.

evict 되면 잃는 건 React state 와 DOM state 뿐이고, RSC 데이터는 부모 CacheNode 에 남는다. 데이터는 캐시에서 나오고 컴포넌트만 새로 렌더된다. 그래서 증상이 조용히 사라진다.

여기까지가 `node_modules` 의 구현을 읽고 알 수 있는 것이다. 우리 화면의 재현 실패가 실제로 이 경로를 탔는지는 계측하지 않았고, 세그먼트 레벨별 상한이 우리 라우트 트리에서 어떻게 나뉘는지도 확인하지 못했다. 다만 상한이 있고 그래서 경로에 따라 다르게 보인다는 것까지는 확인했으니, 재현 시나리오를 경로별로 고정하는 쪽으로 방향을 잡았다.

숫자 3은 계약으로 보지 않기로 했고, 코드가 이 값에 기대지 않게 했다. 가이드는 *"preserves up to 3 routes"* 라고 단언하지만, API 레퍼런스는 같은 내용을 *"uses heuristics to keep a few recently visited routes"* 라고 숫자 없이 쓴다. 두 문서의 표현이 다르다는 것 자체가 구현 세부라는 신호다.

하나 더 있다. state key 는 search params 를 빼고 만들어진다.

```ts
// next/dist/client/components/layout-router
const activeStateKey = createRouterCacheKey(activeSegment, true); // no search params
```

같은 pathname 에 다른 쿼리로 들어가면 같은 Activity 경계다. 예약 신청 화면은 대상 프로그램을 쿼리로 받으므로, 다른 시술을 골라 들어가도 앞서 쓰던 입력이 그대로 보인다. 뒤에 나오는 데이터 게이트가 이 문제까지 같이 막는다.

## 첫 수정: 방향은 맞고 시점이 틀렸다

기존 코드는 폼 훅에 이렇게 들어가 있었다.

```ts
// before — 다시 보이는 시점에 되돌린다
export function useZodForm<T extends ZodRawShape>({ schema, ...props }: TUseZodForm<T>) {
  const form = useForm({ ...props, resolver: zodResolver(schema) });
  const { reset } = form;

  // 최초 마운트는 건너뛰고 재진입(다시 visible)마다 실행 → 이전 입력이 남지 않게
  useUpdateEffect(() => {
    reset();
  }, [reset]);

  return form;
}
```

"재진입할 때 초기화한다"는 방향은 맞다. 틀린 건 언제 되돌리는가와 어디로 되돌리는가, 두 가지다.

시점부터 보자. 이 effect 는 화면이 다시 보이고 나서 돈다. 그래서 지워지는 과정이 사용자 눈에 걸린다. 최종안은 시점을 뒤집었다.

```ts
// after — 숨겨지는 시점(effect cleanup)에 되돌린다
export function useZodForm<T extends ZodRawShape>({ schema, ...props }: TUseZodForm<T>) {
  const form = useForm({ ...props, resolver: zodResolver(schema) });
  const { reset } = form;

  // 떠난 라우트는 언마운트되지 않고 숨겨져 입력값이 그대로 남는다.
  // 폼은 들어올 때마다 새로 시작해야 하므로 숨겨지는 시점에 되돌린다.
  useIsomorphicLayoutEffect(() => reset, [reset]);

  return form;
}
```

cleanup 은 언마운트와 같은 타이밍에 돈다. 여기서 되돌려 두면 다음에 들어올 때는 이미 초기 상태인 폼을 만난다. layout effect 를 쓴 건 페인트 전에 붙이기 위해서다. 문서도 드롭다운을 닫는 예제에서 같은 이유를 든다. *"Using `useLayoutEffect` ensures the cleanup runs synchronously before the component is hidden, avoiding any flash of stale state."*

cleanup 을 `() => reset` 으로 넘긴 건 React 가 cleanup 을 인자 없이 호출하기 때문이다. `() => () => reset()` 으로 한 겹 감싼 것과 똑같이 동작한다.

## 초기화가 빈 폼이 되는 지점

`reset()` 을 인자 없이 부르면 마운트 시점의 `defaultValues` 로 돌아간다. 그러니 물어야 할 건 "그 폼이 기억하는 초기값이 언제 굳었느냐"였다.

예약 신청 화면은 회원 정보, 진료 대상 목록, 사용 가능 쿠폰이 도착하기 전에 이미 폼을 만들고 있었다. 그리고 늦게 온 데이터를 effect 로 밀어 넣어 메우고 있었다.

```ts
// 처음에 있던 안티패턴 — 늦게 온 데이터를 effect 로 폼에 밀어 넣기
useEffect(() => {
  method.reset(defaultValues, { keepDirtyValues: true });
}, [defaultValues, method]);
```

앞선 수정이 이 effect 를 걷어낸 것 자체는 옳았다. `set-state-in-effect` 가 가리키는 바로 그 모양이다. 문제는 그 역할을 넘겨받을 곳을 만들지 않았다는 데 있었다. effect 를 지우는 순간 `defaultValues` 는 빈 값으로 굳고, `reset()` 은 사실상 "전부 지우기"가 된다. 재진입할 때마다 자동 적용 쿠폰이 날아간 것도 이 때문이다.

그래서 화면을 데이터 게이트와 폼, 둘로 쪼갰다.

```tsx
// after — 초기값이 될 데이터가 다 온 뒤에만 폼을 마운트한다
function ReservationPageTemplate() {
  const { hospitalInfo } = useProgramHospitalInfo();
  const { data: programDetail } = useQuery(programDetailOption(programId));
  // 회원 정보는 쿠폰 조회 가능 여부와 진료 대상 목록을 함께 결정하므로 먼저 확정돼야 한다
  const { isLoading: isMemberInfoLoading } = useMemberInfo();
  const { data: usableCoupons, isLoading: isCouponsLoading } = useQuery(usableCouponsOption({ programId }));
  const { isLoading: isTargetsLoading } = useQuery(targetsOption);

  const program = programDetail?.data;
  if (!hospitalInfo || !program || isMemberInfoLoading || isCouponsLoading || isTargetsLoading) return null;

  return <ReservationForm program={program} usableCoupons={usableCoupons ?? []} />;
}
```

`ReservationForm` 은 확정된 데이터를 props 로 받아 `defaultValues` 를 만든다. 폼이 기억하는 초기값이 곧 "진입 직후의 올바른 상태"가 되니, 자동 적용된 쿠폰도 초기값의 일부로 복원된다. 늦게 온 데이터를 밀어 넣을 이유가 사라졌고, 그 effect 의 의존성을 안정시키려고 걸어 둔 `useMemo` 두 개도 같이 없어졌다. 그 메모는 계산 비용보다 참조를 고정하려고 둔 것이라, effect 가 없어지자 고정할 이유도 없어졌다.

앞에서 본 쿼리 문제도 여기서 같이 막힌다. `programId` 가 바뀌면 그 id 로 키가 잡힌 쿼리들이 로딩 상태가 되고, 게이트가 `null` 을 돌려주면서 `ReservationForm` 이 언마운트된다. 다른 시술로 들어가면 폼이 새로 만들어진다.

이 함정은 테스트로 못 박았다.

```ts
const defaultValues = { userMessage: '', coupon: 7000 };

it('되돌아간 값은 초기값이어야 한다 — 빈 폼이 아니다', () => {
  const { result, unmount } = renderZodForm();
  act(() => result.current.setValue('coupon', null));

  act(() => unmount());

  // 진입 시 자동 적용되는 값(최대 혜택 쿠폰 등)은 초기화 후에도 남아 있어야 한다
  expect(result.current.getValues('coupon')).toBe(7000);
});
```

## 단위 테스트는 시점을, E2E 는 경로를 고정한다

단위 테스트로 고정한 건 세 가지다. 평소 입력은 건드리지 않는다. `unmount()` 로 cleanup 을 일으키면 초기값으로 돌아간다. 되돌아간 값은 빈 폼이 아니다. 여기에 하나를 더 붙였다.

```ts
it('리렌더만으로는 입력이 지워지지 않아야 한다', () => {
  const { result, rerender } = renderZodForm();
  act(() => result.current.setValue('userMessage', '작성 중'));

  rerender();

  expect(result.current.getValues('userMessage')).toBe('작성 중');
});
```

layout effect 의 의존성이 `[reset]` 이라는 걸 못 박는 테스트다. `reset` 참조가 렌더마다 바뀌면 cleanup 도 렌더마다 돌아 입력 중인 값을 지운다. 시점을 cleanup 으로 옮기면서 새로 생긴 위험이라 따로 테스트를 걸었다.

다만 단위 테스트로는 표현하지 못하는 축이 하나 있다. `unmount()` 는 cleanup 을 흉내 낼 뿐이고, 어떤 이동이 Activity 보존을 일으키고 어떤 이동이 화면을 새로 그리는지는 재현하지 못한다. 이 버그는 경로를 탄다. 그래서 E2E 는 경로별로 나눠 깔았다. 앱 안에서 이동한 뒤 재진입, 되돌아가기 → 앞으로가기, 접수 완료 후 목록에서 되돌아오기, 재진입 후 자동 적용 쿠폰 복원이다.

```ts
test('예약을 접수한 뒤 다시 들어오면 방금 접수한 내용이 남아있지 않아야 한다', async ({ page }) => {
  await goToProgramDetail(page);
  await goToReservation(page);
  await fillReservationForm(page, '접수 후에는 남으면 안 되는 내용');

  await submitReservation(page);

  // 접수 후 목록으로 보내진 뒤 되돌아온다 — 하드 로드로 들어가면 화면이 통째로 새로 그려져 검증이 되지 않는다
  await page.goBack();
  await expect(page).toHaveURL(RESERVATION_URL);

  await expectPristineForm(page);
});
```

주석이 이 테스트의 전제다. 하드 로드로 들어가면 라우트가 Activity 로 보존되지 않아서, 테스트는 통과하지만 아무것도 검증하지 않는다.

셀렉터도 같은 이유로 손봐야 했다. 숨겨진 라우트가 문서에 그대로 남아 있어서 DOM 쿼리에 걸린다. 증상이 "못 찾음"으로 나오지 않고 "잘못된 것을 찾음"으로 나와서 더 고약하다.

```ts
/** 숨겨진 라우트도 DOM 에 남으므로(Activity) 보이는 것만 고른다 */
const visible = (page: Page, selector: string) => page.locator(selector).filter({ visible: true });
```

기본은 `getByRole` 계열을 쓴다. 접근성 트리를 조회하므로 숨은 요소가 처음부터 후보에서 빠진다. `locator()` 를 써야 하는 자리에만 `filter({ visible: true })` 를 붙였다.

## 같은 원인에서 나올 다른 것들

폼은 이런 문제의 한 사례일 뿐이다. 아래는 문서를 보고 예상한 것이고, 이번에 실제로 확인한 건 폼 하나다. 진입 이벤트 중복은 정황상 의심스럽지만 확증하지 못해서 검증할 빚으로 남겨 뒀다.

| 나올 수 있는 증상 | 왜 | 대응 |
| --- | --- | --- |
| 다이얼로그가 열린 채로 다시 보인다 | `isOpen` 이 컴포넌트 state 라 보존된다. 다시 열어도 `true` → `true` 라 초기화 effect 가 안 돈다 | 초기화를 덧대지 말고 상태를 search param 에서 파생 |
| 화면 진입 이벤트가 재진입마다 다시 찍힌다 | *"Effects run on every hide-to-visible transition, not just the initial mount"* | 첫 마운트 구분은 ref(hide/show 사이클에서 ref 는 정리되지 않는다) |

다이얼로그 줄이 이 글의 결론과 가장 가깝다. 다시 보일 때 닫는 코드를 덧대기보다, 그 상태를 컴포넌트가 갖지 않게 하는 게 처방이다. 폼도 같은 모양이었다.

반대 방향으로 조심할 점도 있다. 문서가 무조건 cleanup 에서 비우라고 하지는 않는다. 의도적으로 세팅한 뷰 상태(사이드바 확장, 필터 패널)는 유지하고, 버튼으로 잠깐 뜨는 UI 만 닫으라고 구분한다. 폼 예제에서도 "성공 제출 후에만" cleanup 이 동작하도록 ref 로 가드한다. 작성 중에 이탈한 초안은 보존하는 게 이득이기 때문이다. 우리 화면은 접수 후 재진입이 정상 흐름이고, 초안이 남아 있으면 오히려 오해를 만든다. 그래서 무조건 초기화를 택했다. 이 화면에 대한 판단이고, 폼 일반의 규칙으로 삼을 건 아니다.

## 마치며

이번 작업에서 얻은 기준은 **언마운트가 대신 지워 주던 상태를 하나씩 찾아 소유자를 정하는 것**이다. 폼 값은 폼 훅이 cleanup 에서 되돌리고, 초기값은 데이터가 확정된 뒤 마운트해서 고정하고, 다이얼로그처럼 컴포넌트가 들고 있으면 안 되는 상태는 URL 로 옮긴다. 화면 하나를 고치는 것보다 같은 원인이 새로 생기지 않게 막는 쪽이 이런 버그에 맞는 대응이라고 봤다.

그래서 마지막으로 lint 를 손봤다. `react-hooks` 규칙 네 개를 `off` 에서 `warn` 으로 올렸다.

```text
-      // TODO(후속): 아래 4건은 깊은 리팩토링이 필요해 별도 PR 로 분리
-      'react-hooks/set-state-in-effect': 'off',
+      // TODO(후속): 남은 건은 화면별로 깊은 리팩토링이 필요해 별도 PR 로 분리한다.
+      // 그때까지 error 로 올리면 lint 게이트가 막히므로, 새로 늘어나는 것만 눈에 띄도록 warn 으로 둔다.
+      'react-hooks/set-state-in-effect': 'warn',
```

`error` 와 `off` 둘 다 맞지 않았다. `error` 로 올리면 아직 남은 위반 때문에 lint 게이트가 통째로 막혀 관계없는 PR 까지 멈춘다. `off` 로 두면 지금은 조용하지만 새로 늘어나는 위반이 보이지 않는다. 이번에 걷어낸 `keepDirtyValues` effect 도 그런 상태에서 자란 것이다. `warn` 은 쌓인 건 통과시키고 새로 생기는 건 눈에 띄게 하는 중간 단계다.

`set-state-in-effect` 위반은 아직 여러 화면에 남아 있다. 화면마다 "초기값을 언제 확정하느냐"를 다시 정해야 하는 작업이라 화면 단위로 나눴다.

규칙에 붙어 있던 위반 건수도 지웠다. 숫자는 커밋 한 번이면 낡아서 주석이 거짓말을 하게 된다.

## 참고 문서

- [Preserving UI state (Next.js)](https://nextjs.org/docs/app/guides/preserving-ui-state)
- [cacheComponents (Next.js config)](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)
- [`<Activity>` (React)](https://react.dev/reference/react/Activity)
