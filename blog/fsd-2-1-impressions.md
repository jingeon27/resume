# FSD 2.1 실무 적용기: pages-first 이후에도 남는 것들

FSD(Feature-Sliced Design)를 실무에 써 본 사람이라면 한 번쯤 "이건 `feature`인가 `widget`인가, 아니면 `entity`인가?"에서 막혀 봤을 것이다. 2.0은 표현력이 좋은 만큼 경계를 어디에 그을지 매번 팀과 합의해야 했다. 추상화할 여지가 많으니 논의 비용도 컸다.

그러다 [FSD 2.1](https://github.com/feature-sliced/documentation/releases/tag/v2.1)을 보고 생각이 꽤 정리됐다. 내 프로젝트에서 실제로 배치를 고민하던 auth, api, form, analytics를 하나씩 FSD에 대입해 보니, FSD가 잘 관리해 주는 것과 끝까지 내 몫으로 남는 것이 선명하게 갈렸다. 그 과정을 적어 둔다.

## 2.1은 "적게 시작하라"고 말한다

먼저 흔한 오해 하나를 짚고 가자. 2.1에서 레이어 개수가 줄어든 건 아니다. [공식 레이어 문서](https://feature-sliced.design/docs/reference/layers)는 `App` / `Processes` / `Pages` / `Widgets` / `Features` / `Entities` / `Shared`를 설명하는데, 이 중 `Processes`는 deprecated 상태다. 그래서 실무에서는 `App` / `Pages` / `Widgets` / `Features` / `Entities` / `Shared` 여섯 레이어를 기준으로 보면 된다.

달라진 건 시작점이다. [공식 튜토리얼](https://feature-sliced.design/docs/get-started/tutorial)에는 이런 문장이 있다. *"It's highly likely that the entire app will fit into just three layers: App, Pages, and Shared."* `App` / `Pages` / `Shared` 세 레이어로 시작하고, 그 사이의 `Widgets` / `Features` / `Entities`는 정말 필요할 때만 추출하라는 뜻이다. 이 글에서는 이 접근을 pages-first라고 부르겠다.

그럼 "필요할 때"는 언제일까. 기준은 재사용이다. 도메인과 얽힌 로직이라도 처음에는 page의 `model`/`ui`에 다 넣어 두고, 두 번째 사용처가 생기면 그때 아래 레이어로 내린다. [excessive-entities 가이드](https://feature-sliced.design/docs/guides/issues/excessive-entities)가 말하는 *deferred decomposition*(지연 분해)이다. 전역 레이어에 일찍 박아 둔 추상은 틀렸을 때 되돌리는 비용이 크니, 늦게 옮길수록 안전하다는 논리다.

여기서 재미있는 결론이 하나 나온다. `entities`는 아예 안 써도 된다. 가이드에 직접 적혀 있다. *"it is completely fine for the application to have no `entities` layer... it simplifies the architecture."* 백엔드가 비즈니스 로직을 쥐고 있는 thin client라면, entities를 생략한 구성도 문서가 인정하는 정상 구성이다.

## 각 레이어가 실제로 맡는 것

나는 처음에 이 부분을 헷갈렸다. [layers 문서](https://feature-sliced.design/docs/reference/layers)의 정의는 이렇다.

- `app`: 라우팅, 스토어, 전역 스타일 등 앱 전역 관심사
- `pages`: 화면
- `widgets`: *"large self-sufficient blocks of UI"*, 여러 페이지에서 재사용되는 큰 UI 덩어리
- `features`: *"the main interactions in your app, things that your users care to do"*, 즉 사용자 행위와 인터랙션
- `entities`: *"concepts from the real world... data models, validation schemas, API functions"*, 즉 서버 및 도메인 모델과 API
- `shared`: UI 키트, 유틸, 설정 등 도메인과 무관한 공통 코드(슬라이스 없이 세그먼트만)

나는 `features`를 "서버 모델"쯤으로 이해하고 있었다. FSD 기준으로 서버 모델과 API는 `entities` 몫이고, `features`는 사용자가 하고 싶어 하는 행위다. 이 이름표를 헷갈리면 레이어 매핑 전체가 한 칸씩 밀린다.

의존 규칙은 하나뿐이다. [layers 문서](https://feature-sliced.design/docs/reference/layers)는 *"a module can only import other slices when they are located on layers strictly below."*라고 적는다. 위 레이어가 아래 레이어를 import하는 구조(`pages → features → entities → shared`)이고, 같은 레이어의 슬라이스끼리는 서로 import할 수 없다([slices-segments](https://feature-sliced.design/docs/reference/slices-segments)).

## 내가 잡아둔 구조와 비교하면

내 실무 구조는 FSD에서 설계의 출발점을 일부러 뒤집은 형태다. 그래서 아래 비교는 FSD의 이름표를 빌려 내 구조의 책임 배치를 다시 읽어 보는 정도로 봐 주면 좋겠다.

- `page`는 로직 없이 조립과 연결만 하는 adapter로 둔다.
- `features`는 pages가 필요로 하는 것에서 출발해 정의한다. 재사용할 feature를 미리 만들어 두지 않고, 페이지가 요구할 때 feature로 추출한다. 뒤집은 건 설계의 출발점이고, import 방향은 여전히 `pages → features`로 내려간다.
- `entities`는 서버 모델을 기준으로 정의한다. FSD의 `entities`와 같은 자리다.

FSD 이름표로 정리하면, 내가 "서버 모델"이라고 부르던 레이어는 FSD의 `entities`에 해당한다. 큰 도메인의 응집도를 지키려고 도입했던 서브도메인 개념도 있다. 비슷한 레벨의 코드를 한곳에 모아 두는 패턴인데, 알고 보니 2.1에 [slice groups](https://feature-sliced.design/docs/reference/slice-groups)라는 이름으로 이미 있었다. *"A slice group places related slices close together within the same layer, making the structure easier to navigate."* 다만 slice groups가 풀어 주는 건 근접성뿐이다. 문서에도 *"Each slice remains independent even when it belongs to a slice group"*이라고 적혀 있어서, 같은 그룹에 있어도 결합도는 그대로다.

## API endpoint는 shared냐 entities냐

여기서는 문서가 두 군데서 다른 말을 하는 것처럼 보인다. 두 인용을 나란히 놓아 보면 정리가 된다. [excessive-entities](https://feature-sliced.design/docs/guides/issues/excessive-entities)는 `shared/api`에 두라고 한다.

> *"CRUD operations... often involve boilerplate code without significant business logic... place CRUD operations in `shared/api`."*

반면 [layers](https://feature-sliced.design/docs/reference/layers)는 entities에 API 함수가 들어간다고 적는다.

> entities contain *"data models, validation schemas, API functions, and UI representations."*

같이 놓고 보면 도메인 무게에 따라 자리를 나눈 것이다.

| endpoint 종류 | 자리 |
| --- | --- |
| 보일러플레이트 CRUD (도메인 로직 X) | **`shared/api`** |
| zod 스키마 붙은 도메인 API 함수 | **`entities/[도메인]/api`** |
| 복잡 연산 (atomic update, rollback, transaction) | **`entities`** (문서: *"use it with caution"*) |

그러니 따져 볼 건 비즈니스 로직이나 도메인의 무게가 있느냐다. thin client라면 전부 `shared/api`로 모으고 entities를 생략해도 된다. 그런데 응답을 zod 스키마(서버 모델)로 정의해 검증하고 request params까지 스키마로 묶기 시작하면, 그 코드는 이미 도메인을 담고 있다. 그때는 `entities`로 옮긴다.

근거가 있는 부분과 내 해석은 나눠 두려 한다. endpoint와 zod 스키마를 entities에 두는 건 layers 문서에 근거가 있다. query와 mutation의 배치에도 공식 가이드가 있다. [Usage with React Query](https://feature-sliced.design/docs/guides/tech/with-react-query)는 `shared/api/queries`(소규모), controller별 분리(대규모), `entities/[entity]/api`(엔티티 기반) 세 갈래를 제시한다. 하지만 어떤 mutation이 어떤 query를 invalidate하는지, 그 관계를 어디에 둘지는 이 가이드도 다루지 않는다. 그 부분부터는 내 해석이다.

## queryOptions, mutation과 `@x`의 무게

`queryOptions`와 mutation hook에는 어떤 mutation이 어떤 query를 invalidate하는지 같은 도메인 관계가 담긴다. 도메인 지식이니 `entities/[도메인]/model`에 둔다. 이렇게 두면 FSD의 아픈 지점 하나가 풀린다.

같은 도메인 안에서 `queryOptions`로 캐시를 무효화하려면 query와 mutation이 서로를 참조해야 한다. 그런데 같은 레이어의 슬라이스끼리는 import할 수 없다. 유일한 통로인 `@x`는 `entities` 전용의 무거운 장치이고, [cross-imports 가이드](https://feature-sliced.design/docs/guides/issues/cross-imports)도 *"a last resort"*, *"a necessary compromise, not a recommended approach"*라고 못 박는다. 일상적인 invalidate마다 `@x`를 쓰는 건 과하다.

해법은 colocation이다. query와 mutation을 같은 entity 슬라이스 안에 두면, mutation이 같은 슬라이스의 query를 invalidate하니 크로스임포트가 아예 생기지 않는다. `@x`는 `entities/reservation`의 mutation이 `entities/family`의 query를 건드릴 때처럼 도메인을 넘을 때만 쓰면 되고, 원래 그러라고 만든 장치다. 배치를 제대로 하면 일상적인 결합에 `@x`가 무겁다는 문제는 대부분 사라진다. 마침 [React Query 가이드](https://feature-sliced.design/docs/guides/tech/with-react-query)도 *"If the project already has a division into entities... the cleanest approach is to split by entity"*라며 엔티티별로 묶는 쪽을 가리킨다.

## form은 클라이언트 모델, features의 몫

폼을 어디 둘지 고민하다 보면 서버 모델과 클라이언트 모델이 한 파일에 섞여 어색해지는 순간이 온다. 그 어색함이 신호다. 둘을 레이어로 가르면 된다.

- 서버 모델(API가 주고받는 값, wire 안전용 zod)은 `entities`
- 클라이언트 모델(폼 상태, 입력 UX용 validation, 뷰모델)은 `features`

form은 사용자가 하는 행위라서 features의 영역이다. 폼 스키마, RHF, 제출 핸들러를 features에 두고, 제출할 때 entities의 mutation hook을 호출한다. features에서 entities로 내려가는 참조라 규칙에도 맞다. UI도 같은 기준으로 갈린다. 서버 모델을 읽어서 보여 주기만 하는 표현형은 `entities/[x]/ui`에, 인터랙션이 있으면 `features`에 둔다. 전부 features에 몰면 features가 서버 모델 정의까지 떠안아서 다시 섞인다.

## 정말 어려운 건 횡단 관심사

여기까지는 어디에 둘지가 다 풀린다. 끝까지 남는 건 레이어를 가로지르는 횡단 관심사(cross-cutting concern)다. logging, analytics, 인증, 에러 트래킹처럼 어느 한 레이어에 속한다고 말하기 어려운 것들이다.

### auth 문서 예제에서 주의할 점

문서의 답은 간단하다. [excessive-entities](https://feature-sliced.design/docs/guides/issues/excessive-entities)는 *"Prefer `shared` layer to creating a `user` entity for authentication data, such as tokens or user DTOs returned from the backend"*라고 한다. 토큰이든 백엔드가 준 user DTO든, `user` 엔티티를 만들지 말고 `shared`에 두라는 권고다. `shared`는 모든 레이어가 import할 수 있으니 자연스러워 보인다.

그런데 실서비스를 운영하다 보면 auth가 예제처럼 단순하게 남지 않는다. 로그인 사용자 정보에 소속인증(affiliation)이나 가족(family) 같은 정보가 붙기 시작한다. 이쯤 되면 auth 정보는 토큰 한 조각보다 도메인 성격이 짙은 사용자 모델에 가깝다. 이걸 통째로 `shared`에 두려고 하면 두 군데서 걸린다. 우선 도메인 모델이 도메인과 무관한 레이어에 앉게 되어 원칙이 깨진다. 더 결정적인 건 **`shared`가 최하위 레이어라 `entities`를 import할 수 없다**는 점이다. 도메인 모델에 의존하는 auth를 `shared`에 두는 건 규칙상 애초에 성립하지 않는다.

그래서 실무에서는 auth를 쪼개서 두게 된다.

| auth 구성 요소 | 성격 | 자리 |
| --- | --- | --- |
| 토큰 저장, 갱신, 인터셉터와 "토큰 있냐" | 도메인 지식 없음, 전송/인프라 | **`shared/api`** |
| 현재 사용자의 affiliation, family, 권한 | 도메인 개념 | **`entities/session`** (또는 `viewer`) |

문서의 "auth → shared"는 user DTO까지 shared에 두라는 조언이다. 이 조언은 DTO가 백엔드가 준 모양 그대로의 값(wire shape)일 때만 맞다. 소속, 가족, 권한 같은 도메인 관계가 붙으면 그때부터는 사용자 도메인 모델이고, 처음부터 엔티티 자리다. 문서 한 줄을 곧이곧대로 따르면 도메인 모델을 `shared`로 끌어내리는 실수를 하게 된다.

### 위치는 정리되는데, "가로질러 적용하는 법"이 없다

배치는 이렇게 정리된다. 인프라 성격이면 모든 레이어가 import할 수 있는 `shared`에, 도메인 성격이면 `entities`에 둔다. 어려운 건 그다음, 여러 레이어에 걸쳐 어떻게 적용하느냐다. FSD에는 AOP, 미들웨어, 인터셉터처럼 횡단 관심사를 1급으로 다루는 개념이 없다.

이 문제의 난이도는 도메인 주입점이 한곳에 모이는지, 흩어지는지에 따라 갈린다. analytics의 `identify`처럼 주입점이 한곳에 모이면 app에서 한 번 연결하는 것으로 깔끔하게 끝난다. 주입점이 흩어지는 경우는 다르다. 예를 들어 어떤 도메인 에러든 도메인별 토스트 메시지로 바꿔 보여 주려면, 에러 종류마다 매핑이 달라서 app 한곳에 모으지 못하고 feature마다 번진다. FSD가 1급으로 풀어 주지 않는 구멍이 여기다.

## 케이스 스터디: analytics를 아키텍처로 관리하기

analytics는 주입점이 init 한곳으로 모이는 경우라 풀리는 쪽에 속한다. 다만 init 순서, 큐잉, 이벤트 카탈로그 같은 원래부터 있는 복잡도가 있어서, 그걸 어디에 가둬 관리하느냐가 관건이다.

요구는 둘이다. 이벤트는 어느 레이어에서든 찍을 수 있어야 하고, init 때 affiliation, family 같은 도메인 값을 userProperty로 넣어야 한다.

설계는 `shared`를 단순한 sink로 두고, 도메인 주입은 `app`이 맡는 방식이다.

```ts
// shared/analytics ─ 도메인 타입 의존성 없음. userProperty가 뭔지 모름(opaque). init 순서도 여기서 삼킴.
import { sdk } from './sdk'; // 벤더 SDK 래퍼 (amplitude 등)

type Props = Record<string, string | number | boolean>;
let userProps: Props = {};
let ready = false;
const queue: Array<() => void> = [];

export interface EventMap {              // ← 이벤트 계약 = 단일 기준 (이름은 도메인 어휘지만 타입 의존성은 없다)
  reservation_created:  { reservationId: string };
  affiliation_verified: { affiliationId: string };
}

export const analytics = {
  init()               { ready = true; queue.forEach(f => f()); queue.length = 0; },
  setUserProperties(p: Props) { userProps = { ...userProps, ...p }; },
  track<K extends keyof EventMap>(name: K, params: EventMap[K]) {
    const fire = () => sdk.track(name, { ...userProps, ...params });  // userProps 자동 병합
    ready ? fire() : queue.push(fire);   // init 전 호출은 큐잉 → 나중에 순서대로 방출
  },
};
```

```ts
// app ─ 조립 루트. app만 entities(도메인)를 봐도 된다.
const user = useSession();                       // entities/session
useEffect(() => {
  if (!user) return; // 로그인 후 init하는 정책 전제(익명 트래킹이 필요하면 init은 즉시, identify만 늦춘다)
  analytics.setUserProperties({ userId: user.id, affiliation: user.affiliationId });
  analytics.init();                              // ← 도메인 주입점, 딱 한 곳
}, [user]);
```

```ts
// entities/reservation/model ─ 이벤트는 그냥 shared 불러서 찍는다
analytics.track("reservation_created", { reservationId });  // 타입드, 로컬 데이터라 import 문제 X
```

처음에 걱정했던 것들은 이 구조 안에서 대부분 풀린다. init 지연과 순서 문제는 큐잉과 flush를 shared sink 안에 넣어 해결한다. 호출부는 `track()`만 부르면 되고 `isInitialized`를 몰라도 된다.

이벤트가 여기저기 흩어지면 관리하기 어렵다는 걱정은 정의와 발화를 나눠서 푼다. 이벤트 계약(`EventMap`)은 한곳에 모아 매직 스트링과 오타를 컴파일 에러로 막는다. 발화는 어디서 하든 이 타입에 묶여 있어서 추적할 수 있다. 흩어지는 건 call site뿐이고 정의는 중앙에 남는다.

도메인 주입은 `app`에서 `setUserProperties`를 한 번 부르는 것으로 끝난다. shared는 `Props`를 opaque하게 받으니 도메인 지식이 새지 않는다.

의존 규칙도 지킨다. 이벤트는 어느 레이어에서든 shared로 내려가는 import이고, 파라미터는 id나 count 같은 primitive라 shared가 entities의 타입을 import할 일이 없다. 남는 건 이벤트 이름이 도메인 어휘라는 점 정도다. 그것까지 피하고 싶다면 declaration merging으로 각 도메인 쪽에서 `EventMap`을 augment해 나눠 정의할 수도 있다. 그래도 중앙 카탈로그에서 한눈에 보이는 이점이 더 커서 그대로 뒀다.

## 복잡도를 어디에 가둘 것인가

마지막으로 이런 질문이 남는다. 이런 복잡도까지 아키텍처가 관리해 줘야 좋은 아키텍처 아닌가? 고려할 게 이렇게 많다는 것부터 별로인 건 아닐까? 절반은 맞는 말이다.

**복잡도는 지워지지 않고 옮겨질 뿐이다.** analytics의 init 순서, 큐잉, 유저 식별은 문제 자체에 들어 있는 본질적 복잡도라서 어떤 아키텍처도 이걸 없애지 못한다. 에너지처럼 복잡도도 보존된다는, Larry Tesler가 말한 복잡도 보존의 법칙이다. 고려할 게 0이라면 프레임워크나 라이브러리가 대신 고려해 준 것이다. 좋은 아키텍처가 하는 일은 그 비용을 한 번만 치르고, 안정된 인터페이스 뒤에 가둬서, 나머지 코드에는 안 보이게 하는 것이다.

그래서 내가 보는 smell test는 복잡도를 어디서 고려하느냐다. 호출부마다 고려해야 한다면 나쁜 설계다. caller마다 `isInitialized`를 확인하고 userProps를 직접 붙이고 있다면 추상화가 샌 것이다. 반대로 `shared/analytics` 한 모듈이 다 흡수한다면, 그게 아키텍처가 복잡도를 관리한 모습이다. 고려할 것은 그대로 있고 한곳에 갇혔을 뿐이다.

그럼 FSD는 이 일을 해 줄까. 여기서는 FSD의 한계를 인정해야 한다. FSD는 경계(layering)를 나누는 방법론이고, DI 컨테이너나 미들웨어 파이프라인, aspect weaving은 제공하지 않는다. FSD는 이 모듈을 `shared`에 두라는 데까지만 말한다. 큐잉 sink, 타입이 붙은 이벤트 계약, app에서의 주입은 직접 만들어야 한다.

횡단 관심사를 1급으로 다루고 싶다면 FSD가 범위 밖에 둔 도구를 찾아야 한다. NestJS와 Angular의 DI와 인터셉터, Effect-TS 같은 effect system, 미들웨어 파이프라인이 그렇다. 이런 도구는 횡단 관심사를 선언적으로 다루게 해 줘서 고려할 것을 실제로 줄여 준다. 대신 런타임이나 프레임워크에 묶이고, 그 도구만의 마법과 학습 비용, 락인을 감수해야 한다. 단순한 경계와 횡단 관심사 관리를 둘 다 최대로 가질 수는 없다. FSD는 레이어 여섯 개와 import 규칙 하나로 경계를 단순하게 유지하는 대신, 횡단 관심사는 직접 구현하게 둔다.

## 마무리

FSD 2.1은 "세 레이어로 시작하고 증명된 만큼만 추출하라"는 한 문장으로, 2.0 시절 회의실에서 쓰던 시간을 상당 부분 돌려준다. 경계를 긋는 규율로는 훌륭하다.

다만 그 깔끔한 의존 그래프에 들어맞지 않는 것이 남는다. 통로가 `@x` 하나뿐인 도메인 간 결합, 그리고 주입점이 흩어지는 횡단 관심사다. 경계를 단순하게 유지하려고 FSD가 횡단 관심사 관리를 1급 기능으로 두지 않은 결과이고, 그 빈자리는 프레임워크급 도구로 메우거나 직접 캡슐화해서 메워야 한다. 지금 나는 FSD로 경계를 나눠 두고, 그 위에서 복잡도를 한곳에 가두는 작업을 직접 하고 있다.

---

## 참고 문서

- [FSD 공식 튜토리얼 (Get Started)](https://feature-sliced.design/docs/get-started/tutorial)
- [FSD v2.1 릴리스 노트](https://github.com/feature-sliced/documentation/releases/tag/v2.1)
- [Layers (Reference)](https://feature-sliced.design/docs/reference/layers)
- [Slices & Segments (Reference)](https://feature-sliced.design/docs/reference/slices-segments)
- [Slice groups (Reference)](https://feature-sliced.design/docs/reference/slice-groups)
- [Public API (Reference)](https://feature-sliced.design/docs/reference/public-api)
- [Excessive entities: entities 레이어를 안 쓰는 법 (Guide)](https://feature-sliced.design/docs/guides/issues/excessive-entities)
- [Cross-imports & `@x` (Guide)](https://feature-sliced.design/docs/guides/issues/cross-imports)
- [Usage with React Query (Guide)](https://feature-sliced.design/docs/guides/tech/with-react-query)
- [Desegmented (Guide)](https://feature-sliced.design/docs/guides/issues/desegmented)
