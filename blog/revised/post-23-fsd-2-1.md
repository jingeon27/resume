# FSD 2.1의 pages-first를 멀티앱 모노레포에 적용한 기준

250개가 넘는 레거시 파일을 FSD 구조로 옮길 때 가장 오래 붙잡았던 질문은 “이게 feature인가 entity인가”였다. 폴더 이름을 먼저 정하려다 보니 한 화면에서만 쓰는 코드까지 공용 레이어로 올라갔다. FSD 2.1 문서를 다시 읽은 뒤 질문을 바꿨다.

> 지금 이 코드를 page 밖으로 꺼내야 할 이유가 생겼는가?

FSD 2.1은 처음부터 모든 레이어를 채우기보다 App, Pages, Shared로 시작하고 필요가 드러날 때 Widgets, Features, Entities를 추출하는 방향을 강조한다. 이 지연 분해 방향을 이하 pages-first라고 부른다. 한 번만 쓰는 기능을 도메인 이름만 보고 미리 entity나 feature로 만들면, 아직 굳지 않은 경계가 전역 의존성으로 남기 때문이다.

내가 맡은 프로젝트는 CMS와 병원 관리자 두 앱이 같은 도메인을 사용하는 모노레포였다. 그래서 단일 앱의 pages-first를 그대로 복사하지 않고, **두 번째 사용처가 무엇인지**를 기준으로 다시 해석했다.

## 처음에는 page에 둔다

한 화면에서만 쓰고 요구사항도 계속 바뀌는 코드는 해당 앱의 page 가까이에 둔다.

```text
apps/cms/src/app/coupon/template/
├── page.tsx
├── ui/
└── model/
```

page에서 시작하면 화면을 만드는 동안 바뀌는 모델과 UI를 한곳에서 고칠 수 있다. 이름이 `coupon`이라는 이유만으로 바로 `packages/entities/coupon`을 만들지 않는다.

다음과 같은 신호가 생겼을 때만 아래 레이어나 공유 package를 검토했다.

- 같은 app의 다른 page에서 같은 사용자 행위를 다시 사용한다.
- 두 app이 같은 API model이나 읽기 UI를 사용한다.
- page 안에서 서로 다른 이유로 바뀌는 코드가 충돌하기 시작한다.

## 모노레포에서는 다른 앱도 재사용 근거가 된다

CMS와 병원 관리자가 같은 예약·프로그램·쿠폰 API 모델을 실제로 사용한다면 공유할 근거가 생긴다. 한 앱의 page를 다른 앱이 직접 import하지 않고, 어느 앱에도 속하지 않는 패키지로 옮겼다.

```text
packages/
├── entities/
│   ├── reservation/
│   ├── program/
│   └── coupon/
├── features/
│   └── treatment-history/
└── shared/
    ├── ui/
    └── utils/

apps/
├── cms/
│   └── src/modules/
└── hospital-admin/
    └── src/modules/
```

여기서 package에 있다는 사실과 FSD 레이어는 같은 개념이 아니다.

- `packages/entities`: 두 앱이 공유하는 도메인 모델, API, 표현 UI
- `packages/features`: 두 app이 공유하는 사용자 행위
- 각 app의 `modules`: 한 app에서만 쓰는 entity, feature, widget
- `packages/shared`: domain을 모르는 UI와 utility

나중에 공유할 가능성이 아니라 **현재 두 앱에서 함께 사용하는가**를 패키지로 올리는 기준으로 삼았다.

## 폼이라고 모두 feature로 옮기지는 않는다

초기에는 form을 "사용자 행위"라고 보고 모두 feature에 두려 했다. 하지만 FSD 2.1의 지연 분해 기준으로 보면 form이라는 기술 형태만으로 위치가 정해지지 않는다.

- 한 page에서만 쓰는 등록 form은 page에 남을 수 있다.
- 같은 사용자 행위를 여러 page가 재사용하면 feature로 추출한다.
- 서버 DTO와 검증 스키마처럼 도메인 모델에 가까운 부분은 entity에 둘 수 있다.
- 여러 app이 공유하는 FormItem이라도 제출 흐름이 다르면 UI 재료만 공유하고 orchestration은 app에 남긴다.

예를 들어 프로그램 폼은 공통 필드와 타입이 지정된 FormItem을 패키지에서 공유한다. CMS의 직접 수정과 병원 관리자의 검수 요청은 각 앱의 feature에 남겼다.

```text
packages/entities/program       API type, query option
packages/features/program       공통 FormItem, form helper
apps/cms/.../program            CMS 제출 흐름
apps/hospital-admin/.../program 병원 검수 흐름
```

공통 FormItem과 폼 함수를 `entities`가 아니라 `packages/features/program`에 둔 이유는 프로그램을 등록하고 수정하는 입력 UI에 가깝다고 봤기 때문이다. 제출 순서는 각 앱의 feature에 남겨 UI 재료만 공유했다.

같은 화면처럼 보여도 생명주기가 다른 동작까지 억지로 공유하지 않았다.

## entity 안에서도 필요한 파일부터 둔다

공유가 증명돼 `entities`로 옮겼다고 바로 하위 domain을 여러 개 만들지는 않았다.

```text
entities/settlement/
├── api/
├── model/
├── ui/
└── index.ts
```

파일이 늘고 서로 다른 업무 흐름이 충돌하기 시작한 뒤에만 group을 도입했다.

```text
entities/settlement/
├── common/
├── contract/
├── deposit/
└── omission/
```

FSD 2.1의 slice groups는 관련 slice를 가까이 두는 탐색 장치다. 같은 group 안의 slice가 서로 자유롭게 import해도 된다는 뜻은 아니다. 그래서 group은 폴더가 많다는 이유보다 독립된 업무 흐름이 반복해서 드러났을 때 사용했다.

## Shared에는 도메인 규칙을 넣지 않는다

`shared`는 모든 레이어에서 접근할 수 있어 위치가 애매한 코드를 넣기 쉽다. TypeScript import가 없더라도 도메인 이벤트 이름과 파라미터를 알고 있다면 의미상의 의존성은 이미 생긴다.

```ts
// shared가 맡을 수 있는 것
interface AnalyticsAdapter {
  track(name: string, properties: Record<string, unknown>): void;
  identify(userId: string): void;
  reset(): void;
}
```

외부 SDK 래퍼와 전송 규약은 Shared에 둘 수 있다. 반면 `reservation_created`, `coupon_applied` 같은 이벤트 목록과 로그인 전후의 사용자 식별 정책, queue의 소유권은 앱이나 해당 도메인에서 결정한다. 어디서든 호출한다는 이유만으로 Shared가 모든 이벤트를 알게 하지는 않는다.

FSD가 분석 도구의 초기화 순서나 queue 정책까지 정해주지는 않는다. FSD는 import 경계를 다루고, 여러 영역에 걸친 런타임 동작은 별도로 설계해야 한다.

## 내가 정한 판단 순서

새 코드를 배치할 때 다음 순서로 판단한다.

1. 지금 한 page에서만 쓰는가? 그렇다면 page에서 시작한다.
2. 같은 app의 여러 page가 같은 행위를 쓰는가? feature 또는 widget 추출을 검토한다.
3. 두 앱이 같은 도메인 모델을 실제로 쓰는가? 공유 패키지의 entity로 올린다.
4. 두 app의 동작과 생명주기까지 같은가? 같을 때만 feature를 공유한다.
5. domain을 전혀 모르는가? 그때만 Shared 후보가 된다.

이 순서는 "entity를 만들지 말라"도 아니고 "모노레포니까 미리 package로 빼라"도 아니다. 추상화의 비용을 지불할 사용처가 이미 있는지를 확인하는 절차다.

FSD 2.1에서 가져온 것은 새로운 폴더 이름이 아니라 분리를 늦추는 기본값이었다. 한 앱에서는 두 번째 페이지가, 모노레포에서는 두 번째 앱이 공유의 근거가 된다. 공통 도메인 모델은 package로 올리되 제출 흐름처럼 앱마다 다른 동작은 가까운 곳에 남겼다.

그 뒤로 코드 위치를 논의할 때 “feature인가 entity인가”부터 묻지 않는다. 지금 실제로 누가 재사용하는지, 함께 바뀌는지부터 확인한다. 이 두 질문에 답하지 못하면 우선 페이지에 둔다.

참고: [FSD Layers](https://feature-sliced.design/docs/reference/layers), [Excessive entities](https://feature-sliced.design/docs/guides/issues/excessive-entities), [Slice groups](https://feature-sliced.design/docs/reference/slice-groups)
