# 결제 내역에 쿠폰 결제를 추가하며 분기를 한곳으로 모은 과정

<div class="note note-summary">
  <strong>요약</strong>
  <p>쿠폰 결제를 추가하면서 결제수단과 상태, 저장 여부가 섞인 조건을 정리했어요. 서버 DTO는 유지하고 폼 전용 값을 분리했으며, 노출 조건과 상세 컴포넌트를 고르는 기준을 모았어요.</p>
</div>

시술 결제 내역은 결제수단 하나만 보고 화면을 정할 수 없었어요. 결제수단(현장 결제, 취소, 쿠폰)과 결제상태(처리 중, 대기, 완료)에 더해, 서버에 저장된 행인지, 쿠폰을 골랐는지와 할인 금액이 얼마인지도 함께 봐야 했어요.

결제 취소도 별도 거래 건으로 기록해요. 취소하면 기존 결제는 그대로 두고, 결제수단이 취소인 결제 내역이 새로 쌓여요.

처음에는 쿠폰 타입과 렌더러 하나만 더하면 될 줄 알았어요. 막상 해 보니 결제 예정 금액이 바뀌면 적용된 쿠폰을 풀어야 했고, 저장 전과 후의 표시도 달랐어요. 현장 결제 금액과 쿠폰 사용액을 같이 보여 줘야 하는 경우도 있었고요.

모든 상태를 discriminated union으로 모델링하려고도 했는데요. 서버 DTO는 enum과 optional field를 가진 단일 구조였고, 알 수 없는 값이 오면 fallback도 필요했어요. 그래서 서버 계약은 그대로 두고, 흩어진 판단을 몇 군데로 모으는 쪽으로 방향을 바꿨어요.

글의 코드는 결제수단과 상태를 셋씩만 남겨 줄였어요. 실제 DTO에는 결제수단 8종, 상태 6종이 있고, 그림은 실제 이름으로 그렸어요.

## 서버 DTO와 폼 모델을 구분하기

서버 응답은 이런 DTO 하나로 내려왔어요.

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

API가 이 구조를 보장하니 클라이언트에서 다른 union인 것처럼 단언하지 않았어요. 편집 중에만 필요한 계산 값은 폼 모델을 따로 두고 거기에 더했어요.

```ts
interface PaymentHistoryFormValue extends PaymentHistoryResponse {
  couponDiscountAmount?: number | null;
}
```

`couponDiscountAmount`는 최종 금액을 미리 보여 주기 위한 폼 전용 값이에요. 처음에는 응답 DTO에 넣었다가 폼 타입으로 분리했어요. 확정 요청을 만들 때는 필요한 필드를 골라 담으므로 할인 금액과 쿠폰명은 보내지 않아요.

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

쿠폰 예약의 결제 내역은 병원 관리자의 예약 상세에서 확정해요. 확정 전에는 폼의 결제 내역이 화면이 만든 쿠폰 행 하나뿐이라, 예약 상세의 폼 타입도 이 배열을 원소 하나짜리 튜플로 좁혀 뒀어요.

폼 모델을 요청 DTO로 바꾸는 함수는 따로 만들지 않았어요. 폼 전용 값은 optional 필드 하나뿐이고, 요청을 만드는 쪽이 필드를 골라 담으면서 그 값은 자연히 빠지니까요.

<figure class="figure-wide">
  <img src="../assets/figures/payment-history/01-row-sources.png" alt="위쪽은 폼의 결제 내역 배열에 들어오는 두 종류의 행이다. 왼쪽은 id가 있는 서버 응답 행으로, ITreatmentPaymentHistoryResDTO의 필드 칩(결제수단 8종, 상태 6종)과 결제를 취소하면 원래 행은 두고 현장취소 행이 새로 쌓인다는 설명이 있다. 오른쪽은 id가 없는 화면 행으로, 정산 상세의 대기 행과 병원 관리자 예약 상세에서 쿠폰 예약을 확정하기 전의 쿠폰 행이며 쿠폰 행에만 점선 칩 couponDiscountAmount가 붙는다. 가운데는 두 종류의 행이 합쳐지는 폼 값 ITreatmentPaymentHistoryClient 인터페이스이고, 예약 상세는 확정 전 이 배열을 쿠폰 행 하나짜리 튜플로 좁힌다는 설명이 붙어 있다. 아래쪽은 요청으로 나가는 두 경로로, 정산 상세 저장은 대기나 처리 중인 현장결제와 현장취소 행만 거르고 나머지를 거의 그대로 싣는다. 예약 상세 결제 내역 확정은 쿠폰결제 행을 찾아 금액, 쿠폰 id, 결제일만 이름으로 옮긴다. 쿠폰명과 할인 금액 칩에는 취소선이 그어져 있다. 맨 아래는 확정 뒤 다시 받은 응답에서 현장결제 행과 쿠폰결제 행이 transactionId로 연결돼 화면에서는 한 줄이 된다는 설명이다" />
  <figcaption>폼의 결제 내역 배열에는 서버가 저장한 행과 화면이 붙인 대기, 쿠폰 행이 함께 들어와요. 결제 내역 DTO에 없는 값은 쿠폰 할인 금액 하나이고, 확정 요청은 쿠폰 행에서 필요한 필드만 골라 만들어요.</figcaption>
</figure>

저장된 쿠폰결제 행은 따로 줄을 만들지 않아요. 같은 거래를 가리키는 현장결제 행 안에서 쿠폰 사용 금액으로 읽혀요.

## 화면 상태를 표로 정리하기

컴포넌트 안에 조건문을 늘리기 전에, 화면에서 구분해야 할 상태부터 표로 정리했어요.

| 저장 여부 | 결제수단 | 상태 | 화면 |
| --- | --- | --- | --- |
| 미저장 | 쿠폰 | 처리 중 | 쿠폰 선택과 예상 결제 금액 |
| 미저장 | 그 외 | 처리 중 | 일반 결제 입력 |
| 저장 | 현장 결제 | 완료 | 완료 정보와 연결된 쿠폰 |
| 저장 | 취소 | 완료 | 취소 정보 |
| 저장 | 그 외 | 대기/처리 중 | 일반 대기 정보 |

노출 여부와 색상은 쿠폰을 넣기 전부터 helper 함수로 빠져 있었어요. 색상 함수를 먼저 만들었고, 노출 조건 함수는 그 뒤 병원 관리자와 Back-Office의 결제 내역 UI를 공통 패키지로 옮기면서 만들었어요. 쿠폰 조건은 그 함수에 더했고, 상세 컴포넌트를 고르는 코드는 이 표처럼 저장 여부부터 가르도록 다시 짰어요.

<figure class="figure-wide">
  <img src="../assets/figures/payment-history/02-row-states.png" alt="위쪽 왼쪽은 결제 내역 타임라인을 단순화해 다시 그린 화면이다. 펼쳐진 미저장 행(3)에는 빨간 '결제 금액 입력하기' 태그와 결제일, 미수잔금, 총 결제 예정 금액, 최종 결제금액 칸이 있고, 그 아래 결제취소 행(2)과 결제완료 행(1)이 있으며 1~5 번호가 붙어 있다. 오른쪽은 그 번호의 다섯 자리로, 타임라인에 올릴지(isVisiblePaymentHistory), 점 색(getPaymentHistoryColor), 헤더 태그와 날짜 및 금액(PaymentHistoryHeader), 처음부터 펼칠지(PaymentHistory), 펼쳤을 때의 칸(PaymentHistoryDescriptions)이다. 아래 표는 미저장 행, 저장된 행, 타임라인에 올리지 않는 행으로 묶은 행 종류마다 노출, 점 색, 헤더 태그, 상세 컴포넌트가 무엇이 되는지 보여 준다. 저장된 완료 현장결제는 CompletedDescriptions 하나가 그리며, 연결된 쿠폰결제 행이 있으면 미수잔금 자리에 쿠폰 사용 금액을 넣는다. 저장된 쿠폰결제 행은 숨김이다" />
  <figcaption>한 결제 내역 행을 두고 노출, 점 색, 헤더, 펼침, 상세 칸을 다섯 곳에서 따로 판단해요. 표는 행의 저장 여부, 결제수단, 상태에 따라 각 자리가 내는 결과예요.</figcaption>
</figure>

상세 칸은 id부터 봐요. 그래서 결제일을 골라 상태가 완료로 바뀌어도 저장하기 전까지는 입력 칸이 그대로 남아요. 헤더와 점 색은 상태를 바로 따르니, 같은 행이 잠깐 '결제완료' 태그와 입력 칸을 함께 보여 주게 돼요.

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

저장된 쿠폰 행은 완료된 현장 결제에 붙여 보여 주니 타임라인에 따로 올리지 않아요. 기존 노출 조건 함수에 쿠폰 규칙을 더하고, 렌더러와 마찬가지로 저장 여부를 먼저 판단하도록 맞췄어요.

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

`paymentForm`은 antd `Form`을 결제 내역 폼의 필드 타입으로 감싼 래퍼(가명)예요. `useFormInstance`와 `useWatch`는 antd Form API 그대로고요. `field`는 antd `Form.List`가 넘기는 항목 정보이고, `field.name`이 결제 내역 배열의 인덱스예요.

`ts-pattern`을 썼다고 누락이 다 막히지는 않아요. 입력 타입이 완전한 판별 유니언이 아니고 마지막에 `.otherwise()`도 있어서, 새 결제수단에 필요한 UI를 빠뜨려도 컴파일러가 다 잡아 주지 못해요. 그래도 쿠폰은 상태로, 나머지는 id와 상태를 섞어 가르던 if 문이 저장 여부로 먼저 묶은 match 하나가 됐어요. 어떤 행이 어느 컴포넌트로 가는지 한곳에서 읽을 수 있게 됐고요.

모든 경우를 컴파일 단계에서 검사하려면 API 응답을 파싱해 클라이언트 도메인의 유니언으로 바꾸고 `.exhaustive()`를 써야 해요. 이번에는 서버 계약과 기존 화면에 미치는 영향을 생각해 거기까지는 가지 않았어요.

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

`setFields`도 antd Form API 그대로예요. 편집 중인 값의 주인은 폼이에요. 그래서 상세 컴포넌트는 지난 시점의 `payment` 스냅샷을 받지 않고, 현재 폼 경로를 가리키는 `field`를 받아 값을 그때그때 폼에서 읽어요.

일반 결제 컴포넌트는 쿠폰 초기화나 할인 계산을 몰라요. 타임라인과 헤더도 쿠폰 선택 모달이 안에서 어떻게 움직이는지 모르고요.

<figure class="figure-wide">
  <img src="../assets/figures/payment-history/03-coupon-descriptions.png" alt="위쪽은 병원 관리자의 예약 상세에서 쿠폰 예약을 확정하기 전 결제 내역 행을 펼친 화면이다. 결제일, 쿠폰 사용 금액과 쿠폰 변경 버튼(B), 총 결제 예정 금액(A), 최종 결제금액(C) 순서로 칸이 있고, 오른쪽에 A는 금액을 바꾸면 적용된 쿠폰을 바로 풀고, B는 선택 모달을 열어 memberCouponId, couponName, couponDiscountAmount 세 값을 한꺼번에 바꾸며, C는 총 결제 예정 금액에서 쿠폰 사용 금액을 뺀다는 설명이 있다. 가운데 왼쪽은 '쿠폰 미사용'과 쓸 수 있는 쿠폰 중 하나를 고르는 쿠폰 정보 수정 모달이고, 오른쪽은 금액을 바꿀 때의 세 단계다. 행이 펼쳐져 있는 동안 라벨 툴팁이 쿠폰 초기화를 미리 알리고, 입력하는 순간 쿠폰이 풀리고 안내 메시지가 뜨며, 쿠폰을 다시 고를지는 사용자에게 맡기고 선택 모달에 '쿠폰 미사용'도 있다는 설명이 있다. 아래쪽은 확정 뒤 저장된 현장결제 행을 그리는 CompletedDescriptions로, 연결된 쿠폰결제 행이 있을 때와 없을 때를 나란히 보여 준다. 연결된 행이 있으면 미수잔금 자리에 쿠폰 사용 금액이 들어가고 최종 결제금액은 두 금액의 합이다" />
  <figcaption>확정 전 쿠폰 행에서 총 결제 예정 금액을 바꾸면 적용된 쿠폰이 바로 풀리고 안내 메시지가 떠요. 확정 뒤 저장된 행은 완료 상세가 연결된 쿠폰결제 행을 찾아 같은 칸 순서로 그려요.</figcaption>
</figure>

금액 칸에는 수정 시 쿠폰이 초기화된다는 툴팁을 두고, 값을 바꾸면 적용된 쿠폰을 해제하며 안내해요. 쿠폰 사용액까지 포함한 값임을 알 수 있도록 라벨도 '총 결제 예정 금액'으로 맞췄어요. 쿠폰을 다시 고를지는 사용자에게 맡겼고, 선택 모달에는 '쿠폰 미사용'도 있어요.

## 바꾸고 나서 남은 것

처음에는 기존 if 문에 쿠폰 조건을 더했어요. 이를 match로 옮기기만 했을 때는 id와 상태가 여전히 섞여 있었어요. 저장 여부를 먼저 구분한 뒤 결제수단과 상태를 판단하도록 순서를 바꾸면서 읽기 쉬워졌어요.

새 결제수단이 생기면 기존 렌더러도 고쳐야 하니 OCP를 지켰다고 말하긴 어려워요. 그래도 어디를 고쳐야 할지는 미리 짐작할 수 있게 됐어요.

<figure class="figure-wide">
  <img src="../assets/figures/payment-history/04-branch-history.png" alt="위쪽은 렌더러가 행을 가르는 순서를 세 시점으로 나란히 보여 준다. 쿠폰을 처음 넣은 날 오전에는 469줄 한 파일 안에서 다섯 개의 if로 여섯 갈래를 나누며, 쿠폰은 상태로, 나머지는 id와 상태를 섞어 갈랐다. 같은 날 오후에는 컴포넌트를 파일로 나눠 렌더러를 41줄로 줄인 뒤 ts-pattern match로 바꿔 34줄로 만들었지만, if 순서를 그대로 옮겨 id와 상태가 여전히 섞여 있었다. 다음 날 오전부터는 id 없음(쿠폰, 그 외)과 id 있음(취소, 완료, 그 외)으로 먼저 묶은 34줄 렌더러다. 아래 표는 사흘 동안 쿠폰을 넣으며 결제수단 enum, 응답 타입, 노출 판정, 점 색과 헤더, 렌더러, 쿠폰 편집, 완료 상세, 앱 코드 중 어디를 고쳤는지 정리하고, 점 색과 헤더는 손대지 않았다고 표시한다. 맨 아래 두 상자는 고칠 자리가 정해졌다는 점과 한곳은 아니라는 점을 정리한다" />
  <figcaption>렌더러의 갈래는 쿠폰을 처음 넣은 날의 if 다섯 개에서, 다음 날 저장 여부로 먼저 묶은 match로 바뀌었어요. 아래 표는 쿠폰을 넣으며 손댄 자리예요.</figcaption>
</figure>

쿠폰 하나를 넣는 데도 결제수단 enum, 응답 타입, 노출 판정, 렌더러, 완료 상세를 고쳤고, 두 앱의 결제 합계와 정산 상세, 병원 관리자의 확정 코드까지 손댔어요. 점 색과 헤더는 쿠폰 행이 회색 점과 대기 헤더로 떨어져서 그대로 뒀지만, 새 결제수단이 생기면 이 자리들이 맞는지 다시 봐야 해요. 이걸 확인해 줄 테스트는 아직 없어요. 다음에는 `결제수단 × 상태 × 저장 여부` 조합을 테이블 기반 테스트로 고정하려고 해요.
