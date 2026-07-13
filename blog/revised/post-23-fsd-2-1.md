# FSD 2.1의 pages-first를 멀티앱 모노레포에 적용한 기준

FSD를 적용하면서 자주 했던 질문은 "이 코드는 feature인가 entity인가"였다. 그런데 FSD 2.1 문서를 다시 읽고 나니, 이름을 먼저 고르는 것보다 앞선 질문이 있었다.

> 지금 이 코드를 page 밖으로 꺼내야 할 이유가 증명됐는가?

FSD 2.1은 처음부터 모든 레이어를 채우기보다 App, Pages, Shared로 시작하고 필요가 드러날 때 Widgets, Features, Entities를 추출하는 방향을 강조한다. 한 번만 쓰는 기능을 도메인 이름만 보고 미리 entity나 feature로 만들면, 아직 굳지 않은 경계가 전역 의존성으로 남기 때문이다.

내가 맡은 프로젝트는 CMS와 병원 관리자 두 앱이 같은 도메인을 사용하는 모노레포였다. 그래서 단일 앱의 pages-first를 그대로 복사하지 않고, **두 번째 사용처가 무엇인지**를 기준으로 다시 해석했다.

## 기본값은 여전히 page다

한 화면에서만 쓰고 요구사항도 아직 바뀌는 코드는 해당 app의 page 가까이에 둔다.

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
- page 파일 안의 서로 다른 변경 이유가 실제로 충돌하기 시작한다.

## 모노레포에서는 두 번째 app도 두 번째 사용처다

CMS와 병원 관리자가 같은 예약, 프로그램, 쿠폰 API model을 사용한다면 공유 필요가 이미 증명된 셈이다. 한 app의 page에 둔 코드를 다른 app이 직접 import하는 대신, 어느 app에도 속하지 않는 package로 올렸다.

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
└── hospital-admin/
```

여기서 package에 있다는 사실과 FSD 레이어는 같은 개념이 아니다.

- `packages/entities`: 두 app이 공유하는 domain model, API, 표현 UI
- `packages/features`: 두 app이 공유하는 사용자 행위
- 각 app의 `modules`: 한 app에서만 쓰는 entity, feature, widget
- `packages/shared`: domain을 모르는 UI와 utility

공유될 가능성이 아니라 **실제로 두 app이 사용하는가**를 package 승격 기준으로 삼았다.

## form은 무조건 feature가 아니다

초기에는 form을 "사용자 행위"라고 보고 모두 feature에 두려 했다. 하지만 FSD 2.1의 지연 분해 기준으로 보면 form이라는 기술 형태만으로 위치가 정해지지 않는다.

- 한 page에서만 쓰는 등록 form은 page에 남을 수 있다.
- 같은 사용자 행위를 여러 page가 재사용하면 feature로 추출한다.
- 서버 DTO와 validation schema처럼 domain model에 가까운 부분은 entity에 둘 수 있다.
- 여러 app이 공유하는 FormItem이라도 제출 흐름이 다르면 UI 재료만 공유하고 orchestration은 app에 남긴다.

예를 들어 프로그램 폼은 공통 field와 typed FormItem을 package에서 공유하지만, CMS의 직접 수정과 병원 관리자의 검수 요청은 각 app feature가 담당한다.

```text
packages/entities/program       API type, query option
packages/features/program       공통 FormItem, form helper
apps/cms/.../program            CMS 제출 흐름
apps/hospital-admin/.../program 병원 검수 흐름
```

같은 화면처럼 보여도 생명주기가 다른 동작까지 억지로 공유하지 않았다.

## entity 안에서도 flat하게 시작한다

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

## Shared에는 domain 언어를 넣지 않는다

`shared`는 모든 레이어에서 접근하기 쉬워서 애매한 코드를 넣고 싶은 유혹이 크다. 하지만 TypeScript import가 없더라도 domain event 이름과 parameter를 알고 있다면 semantic dependency는 존재한다.

```ts
// shared가 맡을 수 있는 것
interface AnalyticsAdapter {
  track(name: string, properties: Record<string, unknown>): void;
  identify(userId: string): void;
  reset(): void;
}
```

vendor SDK wrapper와 전송 규약은 Shared에 둘 수 있다. 반면 `reservation_created`, `coupon_applied` 같은 event catalog, 로그인 전후 identify 정책, queue의 소유권은 app 또는 해당 domain의 설계 문제다. 단지 어디서든 호출해야 한다는 이유로 Shared가 모든 event를 알게 하지 않는다.

FSD는 analytics의 초기화 순서나 queue 정책까지 해결하는 framework가 아니다. FSD가 정하는 것은 import 경계이고, 횡단 관심사의 runtime 동작은 별도로 설계해야 한다.

## 내가 정한 판단 순서

새 코드를 배치할 때 다음 순서로 판단한다.

1. 지금 한 page에서만 쓰는가? 그렇다면 page에서 시작한다.
2. 같은 app의 여러 page가 같은 행위를 쓰는가? feature 또는 widget 추출을 검토한다.
3. 두 app이 같은 domain model을 실제로 쓰는가? shared package의 entity로 올린다.
4. 두 app의 동작과 생명주기까지 같은가? 같을 때만 feature를 공유한다.
5. domain을 전혀 모르는가? 그때만 Shared 후보가 된다.

이 순서는 "entity를 만들지 말라"도 아니고 "모노레포니까 미리 package로 빼라"도 아니다. 추상화의 비용을 지불할 사용처가 이미 있는지를 확인하는 절차다.

## 마치며

FSD 2.1에서 가장 유용했던 것은 새 폴더 이름이 아니라 **증명된 만큼만 분리하라**는 기본값이었다. 단일 app에서는 두 번째 page가 증거가 되고, 멀티앱 모노레포에서는 두 번째 app이 증거가 될 수 있다.

공유가 확실한 domain model은 package에서 시작하고, app 전용 동작은 page 가까이에 남긴다. form, query, analytics도 이름만으로 레이어를 정하지 않고 실제 사용 범위와 변경 이유를 기준으로 배치한다. 이 기준을 세운 뒤에는 "이게 feature인가"라는 논쟁보다 "누가 실제로 재사용하는가"라는 더 확인 가능한 질문으로 이야기할 수 있었다.

참고: [FSD Layers](https://feature-sliced.design/docs/reference/layers), [Excessive entities](https://feature-sliced.design/docs/guides/issues/excessive-entities), [Slice groups](https://feature-sliced.design/docs/reference/slice-groups)
