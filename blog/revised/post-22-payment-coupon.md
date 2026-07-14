# 결제내역에 쿠폰 결제를 추가하며 분기를 한곳으로 모은 과정

시술 결제내역은 결제수단 하나만 보고 화면을 결정할 수 없었다. 다음 값이 함께 작용했다.

- 결제수단: 현장 결제, 취소, 쿠폰
- 결제상태: 처리 중, 대기, 완료
- 서버 저장 여부
- 쿠폰 선택 여부와 할인 금액

이 서비스는 결제 취소도 별도 거래 건으로 기록한다. 취소가 일어나면 기존 결제를 수정하는 대신 `method: 'CANCEL'`인 결제내역이 새로 추가된다.

쿠폰 결제를 추가하는 일은 label 하나를 늘리는 작업이 아니었다. 결제 예정 금액이 바뀌면 선택한 쿠폰을 초기화해야 했고, 결제가 완료된 뒤에는 현장 결제와 연결된 쿠폰 사용 금액을 함께 보여줘야 했다.

처음에는 이 작업을 discriminated union으로 모델링하고 OCP를 지키는 확장으로 접근하려 했다. 하지만 실제 서버 DTO는 enum과 optional field를 가진 단일 구조였고, 렌더 분기에도 fallback이 필요했다. 이 구조에서는 "새 case 누락을 compiler가 모두 잡는다"거나 "기존 코드를 건드리지 않고 추가한다"는 목표가 성립하지 않았다.

실제로 한 일은 **기존 계약은 유지하면서 판단과 표현의 위치를 좁힌 것**이다.

## 서버 DTO와 form model을 구분하기

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

API 모델과 form model의 차이를 optional field 하나로 숨기지 않고 변환 경계에서 드러냈다.

## 화면 상태를 표로 정리하기

렌더 조건을 component 안에서 바로 늘리기 전에 화면이 구분해야 할 상태를 표로 정리했다.

| 저장 여부 | 결제수단 | 상태 | 화면 |
| --- | --- | --- | --- |
| 미저장 | 쿠폰 | 처리 중 | 쿠폰 선택과 예상 결제 금액 |
| 미저장 | 그 외 | 처리 중 | 일반 결제 입력 |
| 저장 | 현장 결제 | 완료 | 완료 정보와 연결된 쿠폰 |
| 저장 | 취소 | 완료 | 취소 정보 |
| 저장 | 그 외 | 대기/처리 중 | 일반 대기 정보 |

이 표를 기준으로 "보여줄지", "어떤 색인지", "어떤 상세 component인지"를 각각 helper와 dispatcher로 옮겼다.

## 노출 조건은 domain helper로 모으기

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

저장된 쿠폰 row는 완료된 현장 결제에 연결해 함께 보여주기 때문에 독립 timeline item에서는 제외한다. 이런 정책을 JSX의 filter callback마다 복사하지 않고 helper 하나에 뒀다.

## renderer는 한곳에서 선택하기

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

여기서 `ts-pattern`의 역할을 과장하지 않는 것이 중요하다. 입력 타입이 완전한 discriminated union이 아니고 마지막에 `.otherwise()`가 있으므로, 새로운 payment method의 모든 UI 누락을 compiler가 잡아주지는 않는다. 대신 분기가 component 여러 곳에 흩어지지 않고 dispatcher 한곳에 모여, 새 method를 검토할 위치가 분명해진다.

정말 exhaustiveness가 필요하다면 API 응답을 parsing한 뒤 client domain union으로 변환하고 `.exhaustive()`를 사용해야 한다. 이번 작업에서는 서버 계약과 기존 영향 범위를 고려해 그 단계까지 넓히지 않았다.

## 쿠폰 전용 동작은 전용 component에 둔다

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

`usePaymentForm`은 antd `Form` instance를 결제내역 field 타입으로 감싼 wrapper이고, `form.useWatch`와 `form.setFieldValue`는 antd Form API를 그대로 노출한다. 편집 중인 값은 form이 소유하므로 `CouponDescriptions`는 `payment` snapshot 대신 form 경로를 가리키는 `index`를 받는다.

일반 결제 component는 쿠폰 초기화나 할인 계산을 모른다. 반대로 timeline과 header는 쿠폰 선택 modal의 세부 동작을 모른다.

## 실제 변경의 의미

쿠폰 기능을 넣는 과정에서 기존 renderer를 그대로 둔 채 branch 하나만 추가한 것은 아니다. 결제내역 description을 분리하고, 노출 조건을 정리하고, `ts-pattern` dispatcher를 도입하는 리팩터링이 함께 있었다.

따라서 결과를 "개조 없이 추가"라고 표현하기보다 다음처럼 정리하는 것이 정확하다.

- 쿠폰을 추가하면서 기존 분산 조건을 한 dispatcher와 helper로 모았다.
- 쿠폰 전용 선택, 초기화, 금액 계산은 전용 component에 가뒀다.
- 서버 DTO와 편집용 값을 구분해 요청에 client-only field가 섞이지 않게 했다.
- 이후 결제수단을 추가할 때 검토해야 할 위치가 helper, dispatcher, 전용 description으로 좁아졌다.

남은 과제는 상태표를 table-driven test로 고정하는 것이다. `method x status x 저장 여부` 조합이 늘어나는 화면에서는 몇 줄 줄였는지보다, 지원하는 조합과 fallback이 테스트에 명시돼 있는지가 더 강한 안전장치다.

이번 작업에서 얻은 기준은 "변경에 닫힌 코드"가 아니었다. 요구사항이 늘어날 때 기존 조건문을 다시 찾아다니지 않도록 **변경해야 할 장소를 예측 가능하게 만드는 것**이었다.
