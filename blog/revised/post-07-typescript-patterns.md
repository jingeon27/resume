# TypeScript로 호출부의 실수를 줄이는 방법

<div class="note note-summary">
  <strong>요약</strong>
  <p>필수 키의 누락, 서로 연결된 prop, 함께 넘기면 안 되는 조합을 타입으로 검사한 예제예요. 호출부에서 어떤 실수를 막을지 정한 뒤 그 관계에 맞는 타입을 골랐어요.</p>
</div>

타입을 정리할 때는 호출부에서 어떤 실수가 가능한지 먼저 봐요. 필드가 빠지는지, 값과 콜백의 타입이 따로 움직이는지, 허용하면 안 되는 prop 조합이 열려 있는지요. 자주 마주친 네 가지 경우를 정리했어요.

## 키 누락은 막고 값은 좁게 남겨요

라우트 객체는 모든 key를 빠짐없이 가져야 했어요. 그러면서도 각 value는 그냥 `string`보다 구체적인 경로로 남아야 했고요.

```ts
type RouteName = 'home' | 'profile' | 'settings';

const ROUTES = {
  home: '/',
  profile: '/profile',
  settings: '/settings',
} as const satisfies Record<RouteName, `/${string}`>;

ROUTES.profile;
// '/profile'
```

변수에 `Record<RouteName, string>`을 직접 붙이면 각 경로는 `string`으로 읽혀요. 위 예제는 `as const`로 경로 리터럴을 유지하고 `satisfies`로 키와 경로 형식을 검사해요. 호출부에서는 `ROUTES.profile`이 정확히 어떤 경로인지도 알 수 있어요.

## `undefined` 값과 키 생략은 달라요

```ts
interface Example {
  requiredKey: number | undefined;
  optionalKey?: number;
}

const value: Example = {
  requiredKey: undefined,
};
```

읽을 때는 둘 다 `number | undefined`인데, 객체를 만드는 쪽이 지켜야 할 계약은 달라요.

- `requiredKey`는 키가 꼭 있어야 하고, 값으로 `undefined`를 넣을 수 있어요.
- `optionalKey`는 키 자체를 빼도 돼요.

객체에서 키의 존재 여부를 검사하거나 여러 객체를 합칠 때 이 차이가 드러나요. `exactOptionalPropertyTypes`를 켜면 `optionalKey?: number`에 명시적으로 `undefined`를 넣는 것도 구분해 검사해요. 다만 JSON 객체로 직렬화하면 값이 `undefined`인 프로퍼티는 생략되므로, 이 타입 차이가 서버까지 그대로 전달된다고 보면 안 돼요.

## 함께 움직이는 prop은 제네릭 하나로 묶어요

선택값과 변경 콜백을 각각 `string`으로 선언하면, 둘이 같은 값 집합을 쓴다는 관계가 사라져요.

```tsx
interface SelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
}

function Select<T extends string>({ value, onValueChange }: SelectProps<T>) {
  return <button onClick={() => onValueChange(value)}>{value}</button>;
}

type PaymentMethod = 'normal' | 'coupon';

<Select<PaymentMethod>
  value="coupon"
  onValueChange={(method) => {
    // method: 'normal' | 'coupon'
  }}
/>;
```

이 예제에서는 `PaymentMethod`를 한 번 정하면 선택값과 콜백이 같은 값 집합을 사용해요. 두 prop에 타입을 따로 적지 않아도 관계를 유지할 수 있어요.

## 같이 들어오면 안 되는 prop 조합은 막아요

한 컴포넌트를 제어형 입력으로도, 읽기 전용 라벨로도 썼어요. 두 경우의 prop을 모두 optional로 열어 두면 `label`과 `value`를 같이 넘기는 잘못된 상태도 통과해요.

```tsx
type ControlledProps<T extends string> = {
  value: T;
  onValueChange: (value: T) => void;
  label?: never;
};

type LabelOnlyProps = {
  label: string;
  value?: never;
  onValueChange?: never;
};

type Props<T extends string> = ControlledProps<T> | LabelOnlyProps;
```

```tsx
<Field label="읽기 전용" />;                         // 가능
<Field value="active" onValueChange={() => {}} />; // 가능
<Field label="잘못된 조합" value="active" />;      // 오류
```

경우가 둘뿐이라 `never`를 쓴 union으로 충분했어요. 분기가 더 늘거나 구현부에서 narrowing이 불편해지면 그때 명시적인 discriminant를 더하면 돼요. 처음부터 overload나 거대한 조건부 타입을 만들 필요는 없었어요.

네 경우 모두 실제로 틀릴 수 있는 지점만 막았어요. 객체에서 빠지면 안 되는 값, key가 있는지 없는지, 서로 연결된 prop, 허용하면 안 되는 조합이요. 타입 정의가 길어졌는데 호출부가 더 읽기 쉬워지지도, 실수가 줄지도 않는다면 그 추상화는 걷어내요.

## 참고

- [TypeScript 4.9: satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- [TypeScript: exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
- [MDN: JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
