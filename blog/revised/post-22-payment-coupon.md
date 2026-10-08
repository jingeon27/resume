# 결제 내역에 쿠폰 결제를 추가하며 분기를 한곳으로 모은 과정

시술 결제 내역은 결제수단 하나만 보고 화면을 결정할 수 없었다. 다음 값이 함께 작용했다.

- 결제수단: 현장 결제, 취소, 쿠폰
- 결제상태: 처리 중, 대기, 완료
- 서버 저장 여부
- 쿠폰 선택 여부와 할인 금액

이 서비스는 결제 취소도 별도 거래 건으로 기록한다. 취소가 일어나면 기존 결제를 수정하는 대신 결제수단이 취소인 결제 내역이 새로 추가된다.

처음에는 쿠폰 타입과 렌더러 하나만 추가하면 될 거라 생각했다. 실제로는 결제 예정 금액이 바뀌면 적용된 쿠폰을 풀어야 했고, 저장 전후의 표시도 달랐다. 현장 결제 금액과 쿠폰 사용액을 함께 보여줘야 하는 경우도 있었다.

discriminated union으로 모든 상태를 모델링하려 했지만 서버 DTO는 enum과 optional field를 가진 단일 구조였고 알 수 없는 값의 fallback도 필요했다. 서버 계약을 다른 모양인 것처럼 단언하는 대신, 흩어진 판단을 몇 군데로 모으는 쪽으로 방향을 바꿨다.

이 글의 코드는 결제수단과 상태를 셋씩만 남겨 줄인 것이고, 실제 DTO에는 결제수단 8종과 상태 6종이 있다. 그림은 실제 이름으로 그렸다.

## 서버 DTO와 폼 모델을 구분하기

서버 응답은 다음처럼 하나의 DTO로 내려왔다.

```ts
interface PaymentHistoryResponse {
  id?: number | null;
  method: 'NORMAL' | 'CANCEL' | 'COUPON';
  status: 'PROCESSING' | 'WAITING' | 'COMPLETED';
  paymentAmount: number;
  paymentDate?: string | null;
  memberCouponId?: number | null;
  couponName?: string | null;
}
```

API가 이 구조를 보장하므로 client에서 다른 union인 것처럼 단언하지 않았다. 대신 편집 중에만 필요한 계산 값을 별도 폼 모델에 추가했다.

```ts
interface PaymentHistoryFormValue extends PaymentHistoryResponse {
  couponDiscountAmount?: number | null;
}
```

`couponDiscountAmount`는 최종 결제 금액을 미리 보여주기 위한 값이고 서버의 결제 내역 DTO에는 없다. 처음에는 이 필드를 응답 DTO에 함께 선언했다가, 다음 날 오후 폼 전용 타입으로 떼어 냈다. 폼 모델은 서버 DTO에 이 필드 하나를 더한 타입이다. 확정 요청은 쿠폰 행에서 필요한 필드만 이름으로 골라 만들기 때문에 할인 금액과 쿠폰명은 요청에 실리지 않는다.

```ts
// 확정 전 예약 상세의 결제 내역은 화면이 만든 쿠폰 행 하나뿐이다.
const couponPayment = payments.find(({ method }) => method === 'COUPON');
if (!couponPayment) return;

confirmReservation({
  reservationId,
  paymentAmount: couponPayment.paymentAmount,
  paymentDate: couponPayment.paymentDate,
  memberCouponId: couponPayment.memberCouponId,
  // 견적 금액·내원일·메모는 폼의 다른 칸에서 채운다.
});
```

쿠폰 예약의 결제 내역 확정은 병원 관리자의 예약 상세에서 한다. 확정 전에는 폼의 결제 내역이 화면이 만든 쿠폰 행 하나뿐이라, 예약 상세의 폼 타입도 이 배열을 원소 하나짜리 튜플로 좁혀 두었다.

폼 모델을 요청 DTO로 바꾸는 함수는 따로 두지 않았다. 폼 전용 값은 optional 필드 하나이고, 그 값을 요청에서 빼는 일은 요청을 만드는 쪽이 필드를 골라 담으며 맡는다.

<figure class="figure-wide">
  <img src="../assets/figures/payment-history/01-row-sources.png" alt="위쪽은 폼의 결제 내역 배열에 들어오는 두 종류의 행이다. 왼쪽은 id가 있는 서버 응답 행으로, ITreatmentPaymentHistoryResDTO의 필드 칩(결제수단 8종, 상태 6종)과 결제를 취소하면 원래 행은 두고 현장취소 행이 새로 쌓인다는 설명이 있다. 오른쪽은 id가 없는 화면 행으로, 정산 상세의 대기 행과 병원 관리자 예약 상세에서 쿠폰 예약을 확정하기 전의 쿠폰 행이며 쿠폰 행에만 점선 칩 couponDiscountAmount가 붙는다. 가운데는 두 종류의 행이 합쳐지는 폼 값 ITreatmentPaymentHistoryClient 인터페이스이고, 예약 상세는 확정 전 이 배열을 쿠폰 행 하나짜리 튜플로 좁힌다는 설명이 붙어 있다. 아래쪽은 요청으로 나가는 두 경로로, 정산 상세 저장은 대기·처리 중인 현장결제·현장취소 행만 거르고 나머지를 거의 그대로 싣는다. 예약 상세 결제 내역 확정은 쿠폰결제 행을 찾아 금액·쿠폰 id·결제일만 이름으로 옮긴다. 쿠폰명과 할인 금액 칩에는 취소선이 그어져 있다. 맨 아래는 확정 뒤 다시 받은 응답에서 현장결제 행과 쿠폰결제 행이 transactionId로 연결돼 화면에서는 한 줄이 된다는 설명이다" />
  <figcaption>폼의 결제 내역 배열에는 서버가 저장한 행과 화면이 붙인 대기·쿠폰 행이 함께 들어온다. 결제 내역 DTO에 없는 값은 쿠폰 할인 금액 하나이고, 확정 요청은 쿠폰 행에서 필요한 필드만 골라 만든다.</figcaption>
</figure>

저장된 쿠폰결제 행은 따로 줄이 생기지 않는다. 같은 거래를 가리키는 현장결제 행 안에서 쿠폰 사용 금액으로 읽힌다.

## 화면 상태를 표로 정리하기

컴포넌트 안에 조건문을 늘리기 전에 화면에서 구분해야 할 상태를 표로 정리했다.

| 저장 여부 | 결제수단 | 상태 | 화면 |
| --- | --- | --- | --- |
| 미저장 | 쿠폰 | 처리 중 | 쿠폰 선택과 예상 결제 금액 |
| 미저장 | 그 외 | 처리 중 | 일반 결제 입력 |
| 저장 | 현장 결제 | 완료 | 완료 정보와 연결된 쿠폰 |
| 저장 | 취소 | 완료 | 취소 정보 |
| 저장 | 그 외 | 대기/처리 중 | 일반 대기 정보 |

노출 여부와 색상은 쿠폰 전부터 helper 함수로 나와 있었다. 색상 함수는 먼저 만들었고, 노출 조건 함수는 그 뒤 병원 관리자와 Back-Office의 결제 내역 UI를 공통 패키지로 옮기며 만들었다. 쿠폰 조건은 그 함수에 더했고, 상세 컴포넌트 선택은 이 표처럼 저장 여부부터 가르도록 다시 짰다.

<figure class="figure-wide">
  <img src="../assets/figures/payment-history/02-row-states.png" alt="위쪽 왼쪽은 결제 내역 타임라인을 단순화해 다시 그린 화면이다. 펼쳐진 미저장 행(3)에는 빨간 '결제 금액 입력하기' 태그와 결제일·미수잔금·총 결제 예정 금액·최종 결제금액 칸이 있고, 그 아래 결제취소 행(2)과 결제완료 행(1)이 있으며 1~5 번호가 붙어 있다. 오른쪽은 그 번호의 다섯 자리로, 타임라인에 올릴지(isVisiblePaymentHistory), 점 색(getPaymentHistoryColor), 헤더 태그·날짜·금액(PaymentHistoryHeader), 처음부터 펼칠지(PaymentHistory), 펼쳤을 때의 칸(PaymentHistoryDescriptions)이다. 아래 표는 미저장 행, 저장된 행, 타임라인에 올리지 않는 행으로 묶은 행 종류마다 노출·점 색·헤더 태그·상세 컴포넌트가 무엇이 되는지 보여 준다. 저장된 완료 현장결제는 CompletedDescriptions 하나가 그리며, 연결된 쿠폰결제 행이 있으면 미수잔금 자리에 쿠폰 사용 금액을 넣는다. 저장된 쿠폰결제 행은 숨김이다" />
  <figcaption>한 결제 내역 행을 두고 노출·점 색·헤더·펼침·상세 칸을 다섯 곳에서 따로 판단한다. 표는 행의 저장 여부·결제수단·상태에 따라 각 자리가 내는 결과다.</figcaption>
</figure>

상세 칸은 id부터 보므로 결제일을 골라 상태가 완료로 바뀌어도 저장 전까지는 입력 칸이 그대로 남는다. 헤더와 점 색은 상태를 바로 따르기 때문에, 같은 행이 잠시 '결제완료' 태그와 입력 칸을 함께 보여준다.

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

  const isVisibleOnsitePayment =
    VISIBLE_STATUSES.includes(payment.status) &&
    VISIBLE_METHODS.includes(payment.method);

  const isEditingCoupon =
    payment.method === 'COUPON' && payment.id == null;

  return isVisibleOnsitePayment || isEditingCoupon;
}
```

저장된 쿠폰 행은 완료된 현장 결제에 연결해 보여주므로 타임라인에 별도 항목으로 올리지 않는다. 이 조건은 앞서 JSX filter callback에서 함수 하나로 옮겨 두었으므로, 쿠폰 조건도 그 함수 안에 더했다. 쿠폰 조건을 처음 더한 날 오후에는 '처리 중'인 쿠폰 행을 골랐고, 다음 날 오전 렌더러를 저장 여부로 묶으면서 노출 조건도 id 유무로 맞췄다.

## 렌더러 선택을 한곳에 모으기

```tsx
import { P, match } from 'ts-pattern';

const isCanceledPayment = (payment: PaymentHistoryResponse | undefined) =>
  payment?.method === 'CANCEL' && payment.status === 'COMPLETED';

const isCompletedNormalPayment = (payment: PaymentHistoryResponse | undefined) =>
  payment?.method === 'NORMAL' && payment.status === 'COMPLETED';

function PaymentHistoryDescriptions({ field }: { field: FormListFieldData }) {
  const form = paymentForm.useFormInstance();
  const payment = paymentForm.useWatch(['payments', field.name], form);

  return (
    match(payment)
      // 미저장: 값이 없거나 id가 없다. 그 안에서 결제수단을 본다.
      .with(P.union(P.nullish, { id: P.optional(P.nullish) }), (unsaved) =>
        match(unsaved)
          .with({ method: 'COUPON' }, () => <CouponDescriptions field={field} />)
          .otherwise(() => <WaitingDescriptions field={field} />),
      )
      // 저장됨: 취소 → 완료 → 그 외
      .when(isCanceledPayment, () => <CanceledDescriptions field={field} />)
      .when(isCompletedNormalPayment, () => <CompletedDescriptions field={field} />)
      .otherwise(() => <WaitingDescriptions field={field} />)
  );
}
```

`paymentForm`은 antd `Form`을 결제 내역 폼의 필드 타입으로 감싼 래퍼(가명)다. `useFormInstance`와 `useWatch`는 antd Form API를 그대로 쓴다. `field`는 antd `Form.List`가 넘기는 항목 정보이고, `field.name`이 결제 내역 배열의 인덱스다.

`ts-pattern`이 모든 누락을 막아주는 것은 아니다. 입력 타입이 완전한 판별 유니언이 아니고 마지막에 `.otherwise()`도 있으므로, 새 결제수단에 필요한 UI를 빠뜨려도 컴파일러가 전부 잡지는 못한다. 대신 쿠폰은 상태로, 나머지는 id와 상태를 섞어 가르던 if 문을 저장 여부로 먼저 묶은 match 하나로 바꿔, 어떤 행이 어느 컴포넌트로 가는지 한곳에서 읽을 수 있게 됐다.

모든 경우를 컴파일 단계에서 검사하려면 API 응답을 파싱해 클라이언트 도메인의 유니언으로 바꾸고 `.exhaustive()`를 사용해야 한다. 이번에는 서버 계약과 기존 화면의 영향 범위를 고려해 거기까지 확장하지 않았다.

## 쿠폰에만 필요한 동작을 별도 컴포넌트에 두기

```tsx
function CouponDescriptions({ field }: { field: FormListFieldData }) {
  const { message } = App.useApp();
  const form = paymentForm.useFormInstance();
  const paymentAmount = paymentForm.useWatch(['payments', field.name, 'paymentAmount'], form);
  const memberCouponId = paymentForm.useWatch(['payments', field.name, 'memberCouponId'], form);
  const couponDiscountAmount =
    paymentForm.useWatch(['payments', field.name, 'couponDiscountAmount'], form) ?? 0;

  const finalAmount = (paymentAmount ?? 0) - couponDiscountAmount;

  // 금액은 Form.Item이 폼에 쓰고, 여기서는 적용된 쿠폰만 푼다.
  const handlePaymentAmountChange = () => {
    if (memberCouponId == null) return;

    form.setFields([
      { name: ['payments', field.name, 'memberCouponId'], value: null },
      { name: ['payments', field.name, 'couponName'], value: null },
      { name: ['payments', field.name, 'couponDiscountAmount'], value: 0 },
    ]);
    message.info('총 결제 예정 금액이 변경되어 적용된 쿠폰이 초기화되었습니다.');
  };

  return (
    <>
      <CouponSelector field={field} />
      <Form.Item name={[field.name, 'paymentAmount']} noStyle>
        <InputNumber onChange={handlePaymentAmountChange} />
      </Form.Item>
      <FinalAmount value={finalAmount} />
    </>
  );
}
```

`setFields`도 antd Form API 그대로다. 편집 중인 값은 폼이 소유하므로 상세 컴포넌트는 과거의 `payment` 스냅샷 대신 현재 폼 경로를 가리키는 `field`를 받고, 값은 그때그때 폼에서 읽는다.

일반 결제 컴포넌트는 쿠폰 초기화나 할인 계산을 모른다. 마찬가지로 타임라인과 헤더는 쿠폰 선택 모달의 세부 동작을 모른다.

<figure class="figure-wide">
  <img src="../assets/figures/payment-history/03-coupon-descriptions.png" alt="위쪽은 병원 관리자의 예약 상세에서 쿠폰 예약을 확정하기 전 결제 내역 행을 펼친 화면이다. 결제일, 쿠폰 사용 금액과 쿠폰 변경 버튼(B), 총 결제 예정 금액(A), 최종 결제금액(C) 순서로 칸이 있고, 오른쪽에 A는 금액을 바꾸면 적용된 쿠폰을 바로 풀고, B는 선택 모달을 열어 memberCouponId·couponName·couponDiscountAmount 세 값을 한꺼번에 바꾸며, C는 총 결제 예정 금액에서 쿠폰 사용 금액을 뺀다는 설명이 있다. 가운데 왼쪽은 '쿠폰 미사용'과 쓸 수 있는 쿠폰 중 하나를 고르는 쿠폰 정보 수정 모달이고, 오른쪽은 금액을 바꿀 때의 세 단계다. 행이 펼쳐져 있는 동안 라벨 툴팁이 쿠폰 초기화를 미리 알리고, 입력하는 순간 쿠폰이 풀리고 안내 메시지가 뜨며, 쿠폰을 다시 고를지는 사용자에게 맡기고 선택 모달에 '쿠폰 미사용'도 있다는 설명이 있다. 아래쪽은 확정 뒤 저장된 현장결제 행을 그리는 CompletedDescriptions로, 연결된 쿠폰결제 행이 있을 때와 없을 때를 나란히 보여 준다. 연결된 행이 있으면 미수잔금 자리에 쿠폰 사용 금액이 들어가고 최종 결제금액은 두 금액의 합이다" />
  <figcaption>확정 전 쿠폰 행에서 총 결제 예정 금액을 바꾸면 적용된 쿠폰이 바로 풀리고 안내 메시지가 뜬다. 확정 뒤 저장된 행은 완료 상세가 연결된 쿠폰결제 행을 찾아 같은 칸 순서로 그린다.</figcaption>
</figure>

금액 칸 라벨은 행이 펼쳐져 있는 동안 '총 결제 예정 금액 수정 시 적용된 쿠폰이 초기화됩니다.' 툴팁을 띄워 두고, 금액을 바꾸는 순간 쿠폰이 풀리고 안내 메시지가 뜬다. 해제와 툴팁은 쿠폰 조건을 처음 더한 날, 안내 메시지는 다음 날 넣었고, 라벨과 문구의 '현장 결제금액'은 그로부터 일주일 뒤 '총 결제 예정 금액'으로 바꿨다. 쿠폰을 다시 고를지는 사용자에게 맡긴다. 선택 모달에는 '쿠폰 미사용'도 있다.

## 바꾸고 나서 남은 것

렌더러에 쿠폰을 처음 넣은 날 오전에는 기존 렌더러 파일에 if를 더했다. 같은 날 오후 상세 컴포넌트를 파일로 나누고 if를 ts-pattern의 match로 옮겼는데, 이때는 if 순서를 그대로 옮겨 id와 상태가 여전히 섞여 있었다. 다음 날 오전 저장 여부로 먼저 묶으면서 글의 모양이 됐고, 지금 렌더러도 이 모양이다.

쿠폰을 추가하면서 이미 함수로 모여 있던 노출 조건에 쿠폰 조건을 더했고, 렌더링 분기는 저장 여부로 먼저 묶은 match 하나로 정리했다. 선택·초기화·금액 계산은 쿠폰 컴포넌트가 맡고, 편집 중에만 필요한 할인 금액은 확정 요청에 싣지 않는다.

새 결제수단이 생기면 기존 렌더러도 수정해야 하므로 OCP를 달성했다고 표현하지는 않는다. 대신 수정할 위치가 예측 가능해졌다.

<figure class="figure-wide">
  <img src="../assets/figures/payment-history/04-branch-history.png" alt="위쪽은 렌더러가 행을 가르는 순서를 세 시점으로 나란히 보여 준다. 쿠폰을 처음 넣은 날 오전에는 469줄 한 파일 안에서 다섯 개의 if로 여섯 갈래를 나누며, 쿠폰은 상태로, 나머지는 id와 상태를 섞어 갈랐다. 같은 날 오후에는 컴포넌트를 파일로 나눠 렌더러를 41줄로 줄인 뒤 ts-pattern match로 바꿔 34줄로 만들었지만, if 순서를 그대로 옮겨 id와 상태가 여전히 섞여 있었다. 다음 날 오전부터는 id 없음(쿠폰, 그 외)과 id 있음(취소, 완료, 그 외)으로 먼저 묶은 34줄 렌더러다. 아래 표는 사흘 동안 쿠폰을 넣으며 결제수단 enum, 응답 타입, 노출 판정, 점 색·헤더, 렌더러, 쿠폰 편집, 완료 상세, 앱 코드 중 어디를 고쳤는지 정리하고, 점 색과 헤더는 손대지 않았다고 표시한다. 맨 아래 두 상자는 고칠 자리가 정해졌다는 점과 한곳은 아니라는 점을 정리한다" />
  <figcaption>렌더러의 갈래는 쿠폰을 처음 넣은 날 다섯 개의 if에서, 다음 날 저장 여부로 먼저 묶은 match로 바뀌었다. 아래 표는 쿠폰을 넣으며 손댄 자리다.</figcaption>
</figure>

쿠폰 하나를 넣는 데에도 결제수단 enum, 응답 타입, 노출 판정, 렌더러, 완료 상세에 더해 두 앱의 결제 합계·정산 상세와 병원 관리자의 확정 코드까지 고쳤다. 점 색과 헤더는 쿠폰 행이 회색 점과 대기 헤더로 떨어져 손대지 않았지만, 새 결제수단이 생기면 이 자리들이 맞는지 다시 확인해야 한다. 이를 검증할 테스트는 아직 없다. 다음 작업은 `결제수단 × 상태 × 저장 여부` 조합을 테이블 기반 테스트로 고정하는 것이다.
