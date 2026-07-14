# 실무에서 자주 쓰는 TypeScript 패턴 네 가지

TypeScript 문법을 많이 쓰는 것 자체가 목표는 아니다. 데이터가 가질 수 없는 상태를 타입으로 줄이는 데 도움이 되는 패턴을 자주 사용하며, 그중 실무에서 반복해서 쓴 네 가지를 정리했다.

## 1. `satisfies`: 검사는 하되 추론은 유지하기

`satisfies`는 값의 타입을 새로 만들어주는 문법이 아니다. **값이 지정한 타입을 만족하는지 검사하면서, 값 자체의 구체적인 추론을 유지한다.**

```ts
type RouteName = 'home' | 'profile' | 'settings';

const ROUTES = {
  home: '/',
  profile: '/profile',
  settings: '/settings',
} as const satisfies Record<RouteName, `/${string}`>;

ROUTES.profile;
// '/profile'로 추론된다.
```

`Record<RouteName, string>`으로 변수 타입을 직접 지정하면 값이 `string`으로 넓어질 수 있다. `satisfies`를 사용하면 key 누락과 잘못된 value를 검사하면서 literal 정보를 보존할 수 있다.

```ts
const LABELS = {
  normal: '일반 결제',
  coupon: '쿠폰 결제',
  // cancel 누락 시 컴파일 오류
} as const satisfies Record<'normal' | 'coupon' | 'cancel', string>;
```

## 2. `T | undefined`와 optional property는 다르다

```ts
interface Example {
  requiredKey: number | undefined;
  optionalKey?: number;
}

const a: Example = {
  requiredKey: undefined,
};
```

두 값 모두 읽을 때는 `number | undefined`가 될 수 있지만 객체를 만들 때 의미가 다르다.

- `requiredKey`는 key가 반드시 있어야 하며 값으로 `undefined`를 허용한다.
- `optionalKey`는 key 자체를 생략할 수 있다.

`exactOptionalPropertyTypes`를 켜면 이 차이가 더 엄격해진다. `optionalKey?: number`에 `undefined`를 직접 대입하려면 `number | undefined`를 명시해야 한다.

## 3. 제네릭으로 value와 callback의 타입을 연결하기

```tsx
interface SelectProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
}

function Select<T extends string>({ value, onValueChange }: SelectProps<T>) {
  return <button onClick={() => onValueChange(value)}>{value}</button>;
}
```

타입 인자를 명시하지 않으면 `T`는 전달한 값인 `'coupon'` 리터럴로 좁게 추론된다. value와 callback을 union으로 다루려면 아래처럼 타입 인자를 명시한다.

```tsx
type PaymentMethod = 'normal' | 'coupon';

<Select<PaymentMethod>
  value="coupon"
  onValueChange={(method) => {
    // method: 'normal' | 'coupon'
  }}
/>;
```

두 prop이 같은 타입이라는 관계를 각자 `string`으로 선언하지 않고 제네릭 하나로 표현한 것이다.

## 4. 서로 배타적인 props는 overload보다 union으로 표현하기

컴포넌트가 두 사용 방식 중 정확히 하나만 허용해야 한다면 `never`를 이용한 union이 명확하다.

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

function Field<T extends string>(props: Props<T>) {
  if ('label' in props) return <span>{props.label}</span>;
  return <button onClick={() => props.onValueChange(props.value)}>{props.value}</button>;
}
```

```tsx
<Field label="읽기 전용" />;                         // 가능
<Field value="active" onValueChange={() => {}} />; // 가능
<Field label="잘못된 조합" value="active" />;      // 컴파일 오류
```

함수 overload는 호출 시그니처를 설명할 때 유용하지만, React props의 가능한 상태를 모델링할 때는 discriminated union이나 `never` 기반 XOR가 구현부까지 안전하게 좁혀진다. 다만 `label?: never` 방식은 `'label' in props` 같은 검사로도 각 분기가 완전히 좁혀지지 않는 한계가 있어, 케이스가 늘어나면 discriminant 프로퍼티를 두는 방식이 낫다.

## 정리

- `satisfies`는 타입 호환성을 검사하면서 구체적인 추론을 보존한다.
- optional property는 값의 `undefined` 여부뿐 아니라 key의 존재 여부를 표현한다.
- 제네릭은 서로 연관된 prop의 타입 관계를 유지한다.
- 배타적인 props는 union으로 불가능한 조합을 제거한다.

참고: [TypeScript 4.9 `satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html), [exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
