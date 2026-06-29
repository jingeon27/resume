# 결제내역에 쿠폰을 붙이면서 든 생각 (feat. 내가 짠 구조 검증받기)

회사에서 시술 결제내역에 쿠폰결제를 추가하는 작업을 했다. 기능 자체는 그렇게 복잡한 게 아니었는데, 작업을 끝내고 나서 한 가지가 눈에 들어왔다. **새 결제수단을 붙이는데 기존 코드를 거의 안 건드렸다.**

특별히 뭘 영리하게 한 건 아니다. 그냥 평소에 내가 지키는 원칙대로 짰을 뿐인데, 몇 달 전에 그 원칙대로 결제내역 구조를 잡아둔 게 이번에 효과를 봤다. 그래서 그때 무슨 생각으로 짰는지, 그리고 짜면서 뭘 헤맸는지를 정리해두려고 한다. 코드는 회사 코드 대신 핵심만 추려서 단순화한 예시로 적는다.

## 도메인부터: 결제내역이 뭐냐

우리 서비스는 병원·의원 시술을 예약하고 결제까지 가는 플랫폼이고, 나는 병원이 쓰는 어드민 쪽을 맡고 있다. 환자가 예약을 하면 병원 담당자가 어드민에서 시술을 확정하고, 그 뒤로 **결제내역**이 시간순으로 쌓인다.

결제내역 한 건은 대충 이런 정보다.

- 무슨 수단으로 냈는지 (현장결제 같은 일반결제)
- 얼마를
- 언제 (결제일을 넣으면 자동으로 "결제완료"가 되고, 이게 정산에 반영된다)

여기서 중요한 도메인 규칙이 두 개 있다.

첫째, **결제내역은 정산이랑 직결된다.** 결제일이 들어가는 순간 "이 돈은 받은 돈"이 되고 정산 집계에 잡힌다. 그래서 결제 한 건의 상태를 잘못 다루면 돈 계산이 틀어진다.

둘째, **결제는 견적과 잔액 사이에서 움직인다.** 시술 견적금액이 있고, 결제가 쌓이면서 잔액이 줄어든다. 잔액이 0이면 더 받을 게 없으니 결제내역을 추가로 못 넣게 막아야 한다.

이 두 규칙 때문에, 결제내역은 "그냥 리스트 그리기"가 아니라 **상태와 종류가 계속 늘어나는** 영역이었다. 그리고 실제로 늘어났다. 처음엔 일반결제뿐이었는데 이번에 쿠폰결제가 들어온 거다.

## 처음 짤 때 정한 원칙

이 영역을 처음 만들 때부터 한 가지는 확실했다. **결제수단은 언젠가 늘어난다.** 쿠폰이든 분할이든 환불이든. 안 늘어날 리가 없었다. 그래서 결제 한 건을 특정 수단에 묶어서 짜고 싶지 않았다.

원칙은 세 개였다.

**1) 컴포넌트는 "결제건"만 알고, 종류는 모른다**

제일 신경 쓴 부분이다. 결제건을 그리는 컴포넌트가 `if (쿠폰) ... else ...`를 들고 있으면, 수단이 늘 때마다 이 컴포넌트가 부풀어 오른다. 그래서 컴포넌트는 그냥 "결제건 하나"를 받아서 그리고, "이게 무슨 수단인지"는 밖에서 판단하게 했다.

**2) 보여줄지 / 무슨 색인지 같은 판단은 함수로 뺀다**

```tsx
<Timeline
  items={payments
    .filter(isVisible)      // 표시 여부 판단
    .map((p) => ({
      color: getColor(p),   // 색상 판단
      children: <PaymentRow payment={p} />,
    }))}
/>
```

별거 아니어 보이지만, 종류가 늘어날 때 고칠 곳을 `isVisible`·`getColor` 같은 함수 한 군데로 모으려는 거였다. 실제 판단 함수는 이렇게 생겼다.

```ts
// 표시 여부: 일반/취소결제는 상태로, 쿠폰은 '아직 저장 안 된 것'만 노출
function isVisible(p?: Payment): boolean {
  if (!p) return false;
  const normalVisible = VISIBLE_STATUSES.includes(p.status) && VISIBLE_METHODS.includes(p.method);
  const couponVisible = p.method === 'COUPON' && p.id == null;
  return normalVisible || couponVisible;
}

// 색상: 완납-현장결제는 초록, 취소는 빨강, 나머지는 회색
function getColor(p?: Payment): string {
  if (p?.status === 'COMPLETED' && p?.method === 'NORMAL') return 'green';
  if (isCanceled(p)) return 'red';
  return 'gray';
}
```

쿠폰이 들어왔을 때 노출 규칙은 한 줄(`couponVisible`)이 추가된 게 다였다. 컴포넌트는 안 건드리고 이 함수만 손봤다. (`getColor`는 보다시피 아직 색 문자열이 박혀 있다 — 솔직히 여기가 제일 안 예쁜 부분이고, 뒤에서 다시 얘기한다.)

**3) 결제건은 수단에 독립적인 데이터로 본다**

```ts
type PaymentItem = {
  paymentMethod: 'NORMAL';
  amount: number;
  paidAt: string | null;
};
```

그리고 이 폼 전체를 antd Form으로 다루는데, antd는 `getFieldValue('xxx')`가 `any`라 필드가 많아지면 오타에 취약하다. 그래서 폼 값 타입으로 좁힌 래퍼를 하나 만들어서 썼다.

```ts
// 폼 값 타입으로 좁혀진 Form
const paymentForm = createTypedForm<PaymentFormValues>();

// 쓸 땐 중첩 필드 경로까지 타입이 따라온다
const form = paymentForm.useFormInstance();
const amt = paymentForm.useWatch(['payments', field.name, 'amount'], form); // number
```

`['payments', field.name, 'amount']` 같은 중첩 경로에서 키를 오타 내면 빨간 줄이 뜬다. 그리고 위 ts-pattern 분기도 결국 이 `useWatch`가 정확한 타입을 물어다 주니까, `match` 안에서 좁히기가 깨끗하게 됐다 — 타입 안전한 폼 래퍼랑 ts-pattern 분기가 사실 한 세트로 굴러간 셈이다. (래퍼 구현 자체는 따로 글로 쓸 만큼 양이 있어서 여기선 넘어간다.)

## 그리고 쿠폰이 들어왔다

기업 쿠폰이 붙으면서 결제내역에 쿠폰결제가 들어와야 했다. 일반결제랑 다른 점이 생각보다 많았다.

- 결제 문구가 다르다 (편집 중일 때랑 완료됐을 때 다르게 보여줘야 함)
- 예약을 취소하면 **쿠폰을 다시 살려줘야** 한다 (일반결제엔 없는 흐름)
- 쿠폰 예약 확정은 일반 저장이랑 다른 API로 간다

여기서부터가 진짜다. 그리고 여기서 좀 헤맸다.

### 시행착오 1: 처음엔 그냥 분기로 박았다

솔직히 처음엔 빨리 보여주고 싶어서 `paymentMethod === 'COUPON' ? '쿠폰' : '일반'` 식으로 문구부터 박았다. 그게 제일 빠르니까. 근데 막상 해보니 문구만이 아니었다. 편집/완료 상태까지 곱해지면서 `쿠폰 && 편집`, `쿠폰 && 완료`, `일반 && ...` 분기가 description, 색상, 노출 여부에 하나씩 퍼지기 시작했다.

이걸 보고 멈췄다. 지금이야 두 종류라 괜찮지, 다음에 분할결제 들어오면 이 삼항들을 전부 다시 찾아다녀야 한다는 게 보였다. 예전에 그러다 버그 낸 적이 있어서 더 그랬다.

그래서 분기를 한 곳으로 모으기로 했다. `ts-pattern`을 썼다. 실제로 들어간 description 분기는 이렇게 생겼다.

```tsx
const payment = paymentForm.useWatch(['payments', field.name]);

return match(payment)
  // 아직 저장 안 된 결제건(id 없음) → 클라가 제어하는 중
  .with(P.union(P.nullish, { paymentId: P.optional(P.nullish) }), (p) =>
    match(p)
      .with({ method: 'COUPON' }, () => <CouponDescriptions field={field} />)
      .otherwise(() => <WaitingDescriptions field={field} />),
  )
  // 저장된 결제건 → 런타임 상태로 분기 (취소 / 완납 / 그 외 대기)
  .when(isCanceled, () => <CanceledDescriptions field={field} />)
  .when(isCompleted, () => <CompletedDescriptions field={field} />)
  .otherwise(() => <WaitingDescriptions field={field} />);
```

짜면서 보인 건, 분기 축이 **두 개**라는 거였다. 먼저 **저장됐냐 안 됐냐**(결제건 `id` 유무)로 가르고, 그 안에서 결제수단이나 상태로 또 갈린다. 처음엔 결제수단 하나로 `.exhaustive()`까지 가서 컴파일러가 빠진 분기를 잡게 하고 싶었는데, 저장된 쪽은 '취소/완납' 같은 **런타임 상태**로 갈려서 깔끔한 discriminated union이 안 됐다. 그래서 거긴 `.when()`/`.otherwise()`로 갔다.

그래서 솔직히 말하면, 내가 얻은 건 `.exhaustive()`의 컴파일 타임 보장 그 자체가 아니다 — **흩어질 뻔한 분기를 `match` 한 곳에 다 모아둔 것**이다. 결제수단을 추가하든 상태를 추가하든, 고칠 곳이 이 함수 하나로 좁혀진 게 핵심이었다. (결제수단 축만 따로 떼면 거긴 `.exhaustive()`로 더 조일 수 있다. 다음 리팩터링 숙제로 남겨뒀다.)

### 시행착오 2: 타입을 안 나눠서 옵셔널 지옥이 됐다

쿠폰결제는 `couponName`이 있고 일반결제는 없다. 처음엔 귀찮아서 결제건 타입 하나에 `couponName?: string`로 옵셔널을 그냥 추가했다. 그랬더니 코드 곳곳에서 `payment.couponName?.` 같은 옵셔널 체이닝이 늘어나고, "쿠폰인데 couponName이 없는" 말이 안 되는 상태도 타입상 가능해졌다.

그래서 결제건 타입을 union으로 나눴다.

```ts
type PaymentItem =
  | { paymentMethod: 'NORMAL'; amount: number; paidAt: string | null }
  | { paymentMethod: 'COUPON'; amount: number; couponName: string };
```

이러니까 `paymentMethod`로 좁히는 순간 그 안에서 `couponName`이 보장된다. 위의 ts-pattern도 이 union 덕분에 `.with` 안에서 타입이 정확히 좁혀진다. 둘이 같이 가는 설계였다.

### 시행착오 3: 읽기전용인데 취소 버튼까지 죽었다

쿠폰으로 확정된 예약은 폼 전체를 읽기전용으로 막아야 했다. antd는 Form에 `disabled`를 주면 그게 하위 모든 컨트롤로 내려간다(`DisabledContext`). 편했다. 그런데 막고 보니 "예약 취소" 같은, 읽기전용이어도 살아있어야 하는 버튼까지 같이 죽어버렸다.

처음엔 이걸 왜 이러지 하고 한참 봤다. antd가 `disabled`를 컨텍스트로 전파한다는 걸 그때 제대로 알았다. 결국 그 컨트롤만 `disabled={false}`로 컨텍스트를 덮어쓰는 식으로 풀었다. `disabled`를 아예 안 주는 거랑 `false`를 명시하는 게 다르다는 걸(생략은 상속, false는 옵트아웃) 이때 처음 체감했다.

쿠폰만의 흐름(취소하면 복원하는 것)은 결제내역 렌더링을 아예 안 건드리고 따로 모달로 뺐다. 결제내역은 "결제건을 그리는" 책임만 두고, 쿠폰 복원 같은 액션은 그 바깥에서 처리하게.

한 가지 더 신경 쓴 건, 쿠폰이 자동 적용된 상태에서 **현장 결제금액을 사람이 직접 고치면 적용된 쿠폰을 초기화**하는 거였다. 금액이 바뀌면 그 쿠폰의 사용 조건이 더는 안 맞을 수 있어서다.

```ts
// 현장 결제금액 수정 시 자동 적용된 쿠폰 초기화
const handleAmountChange = () => {
  if (couponId == null) return;
  form.setFields([
    { name: ['payments', field.name, 'couponId'], value: null },
    { name: ['payments', field.name, 'couponName'], value: null },
    { name: ['payments', field.name, 'couponDiscount'], value: 0 },
  ]);
  message.info('결제금액이 변경되어 적용된 쿠폰이 초기화되었습니다.');
};
```

이런 쿠폰 전용 규칙들을 죄다 `CouponDescriptions` 안에 가둬서, 일반결제 코드는 이게 있는지조차 모르게 했다. 결국 "컴포넌트는 종류를 모른다"는 원칙이 여기서도 한 번 더 일을 한 거다.

## 끝나고 보니

쿠폰을 다 붙이고 diff를 봤는데, 기존 결제내역 렌더링 코드는 거의 그대로였다. 추가된 건 union 멤버 하나, ts-pattern 분기 하나, 쿠폰 전용 모달 하나 정도. 헤맨 건 위 세 개였지만 다 "구조를 바꾸는" 헤맴이 아니라 "구조에 맞게 넣는" 헤맴이었다.

설계를 잘했는지는 짤 때는 모른다. 그때는 다 그럴듯해 보인다. 진짜 시험은 몇 달 뒤 새 요구가 들어왔을 때 온다. 그걸 기존 코드 안 뜯고 받아내면 잘 짠 거고, 여기저기 다시 고쳐야 하면 처음부터 틀린 거다.

나중에 알았는데, 이걸 OCP(개방-폐쇄 원칙)라고 부른다더라. 확장엔 열려있고 수정엔 닫혀있게 짜라는 거다. 나는 그런 용어를 알고 짠 게 아니라 그냥 "결제수단은 늘어난다"는 전제로 짰을 뿐인데, 누가 그게 그 원칙이라고 알려줬다. 말로 들을 땐 와닿지 않던 게 내 코드가 직접 그걸 보여주니까 그제서야 이해됐다.

물론 아쉬운 것도 있다. 타임라인 쪽에 색상이 아직 하드코딩으로 남아있고, 배열 조립도 좀 지저분하다. 근데 그건 마감 문제지 구조 문제는 아니라서 우선순위에서 뒤로 미뤘다.

결국 한 게 뭐냐면, 대단한 패턴을 쓴 게 아니라 그냥 **"결제수단은 늘어난다"는 전제 하나를 끝까지 안 버린 것**뿐이다. 컴포넌트에서 종류를 모르게, 분기는 한 곳에, 타입은 union으로 — 이 세 개를 일관되게 지킨 게 다였다. 다음에 분할결제나 환불이 들어오면 이 구조가 또 버티는지 보면 된다. 그때도 컴파일러가 빠진 곳을 짚어줄 거라, 적어도 어디를 고쳐야 하는지는 안 헤맬 거다.
