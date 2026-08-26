# 결제 내역에 쿠폰 결제를 추가하며 분기를 한곳으로 모은 과정

시술 결제 내역은 결제수단 하나만 보고 화면을 결정할 수 없었다. 다음 값이 함께 작용했다.

- 결제수단: 현장 결제, 취소, 쿠폰
- 결제상태: 처리 중, 대기, 완료
- 서버 저장 여부
- 쿠폰 선택 여부와 할인 금액

이 서비스는 결제 취소도 별도 거래 건으로 기록한다. 취소가 일어나면 기존 결제를 수정하는 대신 `method: 'CANCEL'`인 결제 내역이 새로 추가된다.

처음에는 쿠폰 타입과 렌더러 하나만 추가하면 될 거라 생각했다. 실제로는 결제 예정 금액이 바뀌면 선택한 쿠폰을 취소해야 했고, 저장 전후의 표시도 달랐다. 현장 결제 금액과 쿠폰 사용액을 함께 보여줘야 하는 경우도 있었다.

discriminated union으로 모든 상태를 모델링하려 했지만 서버 DTO는 enum과 optional field를 가진 단일 구조였고 알 수 없는 값의 fallback도 필요했다. 서버 계약을 다른 모양인 것처럼 단언하는 대신, 흩어진 판단을 몇 군데로 모으는 쪽으로 방향을 바꿨다.

## 서버 DTO와 폼 모델을 구분하기

서버 응답은 다음처럼 하나의 DTO로 내려왔다.

```ts
interface PaymentHistoryResponse {
  id?: number | null;
  method: 'NORMAL' | 'CANCEL' | 'COUPON';
  status: 'PROCESSING' | 'WAITING' | 'COMPLETED';
  paymentAmount: number;
  memberCouponId?: number | null;
  couponName?: string | null;
}
```

API가 이 구조를 보장하므로 client에서 다른 union인 것처럼 단언하지 않았다. 대신 편집 중에만 필요한 계산 값을 별도 client model에 추가했다.

```ts
interface PaymentHistoryFormValue extends PaymentHistoryResponse {
  couponDiscountAmount?: number | null;
}
```

`couponDiscountAmount`는 최종 결제 금액을 미리 보여주기 위한 값이고 요청 DTO에는 포함되지 않는다.

```ts
function toPaymentRequest({
  id: _id,
  couponName: _couponName,
  couponDiscountAmount: _couponDiscountAmount,
  ...request
}: PaymentHistoryFormValue): PaymentHistoryRequest {
  return request;
}
```

API 모델과 폼 모델의 차이를 optional 필드 하나로 숨기지 않고 변환 함수에서 드러냈다.

## 화면 상태를 표로 정리하기

컴포넌트 안에 조건문을 늘리기 전에 화면에서 구분해야 할 상태를 표로 정리했다.

| 저장 여부 | 결제수단 | 상태 | 화면 |
| --- | --- | --- | --- |
| 미저장 | 쿠폰 | 처리 중 | 쿠폰 선택과 예상 결제 금액 |
| 미저장 | 그 외 | 처리 중 | 일반 결제 입력 |
| 저장 | 현장 결제 | 완료 | 완료 정보와 연결된 쿠폰 |
| 저장 | 취소 | 완료 | 취소 정보 |
| 저장 | 그 외 | 대기/처리 중 | 일반 대기 정보 |

이 표를 기준으로 노출 여부, 색상, 상세 컴포넌트 선택을 각각의 함수로 옮겼다.

## 노출 조건을 도메인 함수로 모으기

```ts
const VISIBLE_STATUSES = ['COMPLETED', 'PROCESSING', 'WAITING'] as const;
// as const만 쓰면 includes의 인자가 'NORMAL' | 'CANCEL'로 좁혀져
// payment.method를 받지 못하므로, 원소 타입을 method 전체 union으로 선언한다.
const VISIBLE_METHODS: readonly PaymentHistoryResponse['method'][] = [
  'NORMAL',
  'CANCEL',
];

function isVisiblePayment(payment: PaymentHistoryResponse | undefined) {
  if (!payment) return false;

  const isVisibleSavedPayment =
    VISIBLE_STATUSES.includes(payment.status) &&
    VISIBLE_METHODS.includes(payment.method);

  const isEditingCoupon =
    payment.method === 'COUPON' && payment.id == null;

  return isVisibleSavedPayment || isEditingCoupon;
}
```

저장된 쿠폰 행은 완료된 현장 결제에 연결해 보여주므로 별도의 타임라인 항목에서는 제외한다. 이 조건을 JSX의 filter callback마다 복사하지 않고 함수 하나에 모았다.

## 렌더러 선택을 한곳에 모으기

```tsx
import { P, match } from 'ts-pattern';

const isCanceledPayment = (payment: PaymentHistoryResponse) =>
  payment.method === 'CANCEL';

const isCompletedNormalPayment = (payment: PaymentHistoryResponse) =>
  payment.method === 'NORMAL' && payment.status === 'COMPLETED';

function PaymentHistoryDescriptions({ payment, index }: Props) {
  return match(payment)
    .with(
      { id: P.nullish, method: 'COUPON' },
      () => <CouponDescriptions index={index} />,
    )
    .with(
      { id: P.nullish },
      () => <WaitingDescriptions payment={payment} />,
    )
    .when(isCanceledPayment, () => (
      <CanceledDescriptions payment={payment} />
    ))
    .when(isCompletedNormalPayment, () => (
      <CompletedDescriptions payment={payment} />
    ))
    .otherwise(() => <WaitingDescriptions payment={payment} />);
}
```

`ts-pattern`이 모든 누락을 막아주는 것은 아니다. 입력 타입이 완전한 판별 유니언이 아니고 마지막에 `.otherwise()`도 있으므로, 새 결제수단에 필요한 UI를 빠뜨려도 컴파일러가 전부 잡지는 못한다. 대신 여러 컴포넌트에 흩어졌던 분기를 한 렌더러에서 확인할 수 있게 됐다.

모든 경우를 컴파일 단계에서 검사하려면 API 응답을 파싱해 클라이언트 도메인의 유니언으로 바꾸고 `.exhaustive()`를 사용해야 한다. 이번에는 서버 계약과 기존 화면의 영향 범위를 고려해 거기까지 확장하지 않았다.

## 쿠폰에만 필요한 동작은 별도 컴포넌트에 둔다

```tsx
function CouponDescriptions({ index }: { index: number }) {
  const form = usePaymentForm();
  const paymentAmount = form.useWatch(['payments', index, 'paymentAmount']);
  const memberCouponId = form.useWatch(['payments', index, 'memberCouponId']);
  const couponDiscountAmount =
    form.useWatch(['payments', index, 'couponDiscountAmount']) ?? 0;

  const finalAmount = Math.max(
    0,
    (paymentAmount ?? 0) - couponDiscountAmount,
  );

  const handlePaymentAmountChange = (nextAmount: number) => {
    form.setFieldValue(['payments', index, 'paymentAmount'], nextAmount);

    if (memberCouponId != null) {
      form.setFieldValue(['payments', index, 'memberCouponId'], null);
      form.setFieldValue(['payments', index, 'couponName'], null);
      form.setFieldValue(['payments', index, 'couponDiscountAmount'], 0);
      showMessage('결제 예정 금액이 바뀌어 쿠폰을 다시 선택해야 합니다.');
    }
  };

  return (
    <>
      <CouponSelector index={index} />
      <PriceInput value={paymentAmount} onChange={handlePaymentAmountChange} />
      <FinalAmount value={finalAmount} />
    </>
  );
}
```

`usePaymentForm`은 antd `Form` 인스턴스를 결제 내역의 필드 타입으로 감싼 래퍼다. `form.useWatch`와 `form.setFieldValue`는 antd Form API를 그대로 노출한다. 편집 중인 값은 폼이 소유하므로 `CouponDescriptions`는 과거의 `payment` 스냅샷 대신 현재 폼 경로를 가리키는 `index`를 받는다.

일반 결제 컴포넌트는 쿠폰 초기화나 할인 계산을 모른다. 반대로 타임라인과 헤더는 쿠폰 선택 모달의 세부 동작을 모른다.

## 바꾸고 나서 남은 것

쿠폰 기능을 넣으면서 기존 렌더러에 조건 하나만 추가하지는 않았다. 결제 내역별 설명 컴포넌트를 나누고 노출 조건과 렌더러 선택 로직을 정리했다.

쿠폰을 추가하면서 기존 노출 조건과 렌더링 분기를 각각 한곳에 모았다. 선택·초기화·금액 계산은 쿠폰 컴포넌트가 맡고, 편집 중에만 필요한 할인 금액은 서버 요청에서 제거했다. 이후 결제수단이 추가되더라도 확인할 파일이 어디인지 바로 알 수 있다.

새 결제수단이 생기면 기존 렌더러도 수정해야 하므로 OCP를 달성했다고 표현하지는 않는다. 대신 수정할 위치가 예측 가능해졌다. 다음 작업은 `결제수단 × 상태 × 저장 여부` 조합을 테이블 기반 테스트로 고정하는 것이다.
