# 타입을 복잡하게 만들지 않고 잘못된 상태만 막은 네 가지 경우

TypeScript를 잘 쓴다는 말을 복잡한 타입을 만들 수 있다는 뜻으로 생각하지 않는다. 호출부에서 실수할 수 있는 지점을 찾고, 그 상태만 컴파일 단계에서 막을 수 있으면 충분하다. 실제 코드에서 자주 남긴 네 가지 판단을 정리했다.

## 객체의 누락을 막되 값은 좁게 유지한다

라우트 객체는 모든 key를 가져야 하지만, 각 value는 단순한 `string`보다 구체적인 경로로 남아야 했다.

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

변수에 `Record<RouteName, string>`을 직접 지정하면 값이 `string`으로 넓어질 수 있다. `satisfies`는 키 누락과 잘못된 경로를 검사하면서 리터럴 추론은 유지한다. 객체에 필요한 값이 모두 있는지만 확인하고 싶을 때 사용한다.

## `undefined` 값과 키 생략을 구분한다

```ts
interface Example {
  requiredKey: number | undefined;
  optionalKey?: number;
}

const value: Example = {
  requiredKey: undefined,
};
```

둘 다 읽을 때는 `number | undefined`지만 객체를 만드는 쪽의 계약은 다르다.

- `requiredKey`는 키가 반드시 존재하고 값으로 `undefined`를 허용한다.
- `optionalKey`는 키 자체를 생략할 수 있다.

API 요청 객체에서는 이 차이가 실제 동작으로 이어졌다. 키를 보내면서 값이 아직 없다고 표현하는 경우와 요청에서 조건 자체를 제외하는 경우는 같지 않았다. `exactOptionalPropertyTypes`를 켜면 이 차이를 타입에도 남길 수 있다.

## 서로 연관된 prop을 제네릭 하나로 묶는다

선택값과 변경 콜백을 각각 `string`으로 선언하면 둘이 같은 값 집합을 사용한다는 관계가 사라진다.

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

여기서 필요한 것은 범용 Select 타입 체계가 아니라 `value`와 callback의 인자가 어긋나지 않는다는 보장이다. 타입이 해결해야 할 관계가 하나라면 제네릭도 하나면 된다.

## 함께 들어오면 안 되는 prop 조합을 막는다

한 컴포넌트가 제어형 입력과 읽기 전용 라벨이라는 두 사용법을 지원했다. 두 경우의 prop을 모두 optional로 만들면 `label`과 `value`를 동시에 넘기는 잘못된 상태도 허용한다.

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

경우가 둘뿐일 때는 `never`를 이용한 union으로 충분했다. 분기가 더 늘어나거나 구현부의 narrowing이 불편해지면 명시적인 discriminant를 추가한다. 처음부터 overload나 거대한 조건부 타입을 만들 필요는 없었다.

이 네 패턴의 공통점은 타입을 많이 쓰는 데 있지 않다. 객체에서 빠지면 안 되는 값, key의 존재 여부, 서로 연결된 prop, 허용하면 안 되는 조합처럼 실제로 틀릴 수 있는 지점만 제한한다. 타입 정의가 길어졌는데 호출부가 더 읽기 쉬워지지 않고 실수도 줄지 않는다면 그 추상화는 제거한다.

참고: [TypeScript 4.9 `satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html), [`exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
