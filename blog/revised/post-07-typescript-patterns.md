# 타입을 복잡하게 만들지 않고 잘못된 상태만 막은 네 가지 경우

저는 TypeScript를 잘 쓴다는 게 복잡한 타입을 만들 줄 안다는 뜻이라고 생각하지 않아요. 호출부에서 실수할 만한 지점을 찾아 그 상태만 컴파일 단계에서 막으면 충분하다고 봐요. 실제 코드에서 자주 내렸던 판단 네 가지를 골라 봤어요.

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

변수에 `Record<RouteName, string>`을 직접 붙이면 값이 `string`으로 넓어질 수 있어요. `satisfies`는 키 누락과 잘못된 경로를 검사하면서도 리터럴 추론은 그대로 둬요. 객체에 필요한 값이 다 있는지만 확인하고 싶을 때 써요.

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

API 요청 객체에서는 이 차이가 실제 동작으로 이어졌어요. 키를 보내면서 값이 아직 없다고 알리는 것과 요청에서 조건 자체를 빼는 건 같지 않았거든요. `exactOptionalPropertyTypes`를 켜면 이 차이를 타입에도 남길 수 있어요.

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

여기서 필요한 건 `value`와 callback의 인자가 어긋나지 않는다는 보장 하나였어요. 범용 Select 타입 체계까지 만들 일은 아니었고요. 타입으로 풀어야 할 관계가 하나면 제네릭도 하나면 돼요.

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

참고: [TypeScript 4.9 `satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html), [`exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
