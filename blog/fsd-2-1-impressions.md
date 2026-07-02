# FSD 2.1 실무 적용기: pages-first 이후에도 남는 것들

FSD(Feature-Sliced Design)를 실무에 적용해본 사람이라면 한 번쯤 같은 벽에 부딪힌다. **"이건 `feature`인가 `widget`인가, 아니면 `entity`인가?"** 2.0의 FSD는 표현력은 좋았지만, 그만큼 경계를 어디에 그을지 매번 팀과 합의해야 했다. 추상화의 여지가 많다는 건 곧 논의 비용이 크다는 뜻이기도 했다.

그러다 [FSD 2.1](https://github.com/feature-sliced/documentation/releases/tag/v2.1)을 보고 생각이 꽤 정리됐다. 그리고 내 프로젝트의 실제 배치 고민거리(auth·api·form·analytics)를 하나씩 FSD에 대입해 보면서, **FSD가 잘 관리하는 것과 끝까지 내 몫으로 남겨두는 것**의 경계가 선명해졌다. 이 글은 그 기록이다.

## 2.1은 레이어를 줄인 게 아니라, "적게 시작하라"고 말한다

먼저 흔한 오해 하나. 2.1이 레이어 개수를 줄인 건 아니다. [공식 레이어 문서](https://feature-sliced.design/docs/reference/layers)는 `App` / `Processes` / `Pages` / `Widgets` / `Features` / `Entities` / `Shared`를 설명하지만, `Processes`는 deprecated 상태다. 그래서 실무적으로는 `App` / `Pages` / `Widgets` / `Features` / `Entities` / `Shared` 여섯 레이어를 기준으로 보면 된다.

달라진 건 **시작점**이다. [공식 튜토리얼](https://feature-sliced.design/docs/get-started/tutorial)은 이렇게 말한다. *"It's highly likely that the entire app will fit into just three layers: App, Pages, and Shared."* 즉 **`App` / `Pages` / `Shared` 세 레이어로 시작하고, 그 사이의 `Widgets` / `Features` / `Entities`는 정말 필요할 때만 추출하라**는 것이다. 이 접근을 이 글에선 pages-first라 부르겠다.

여기서 "필요할 때"의 기준이 중요하다. 도메인에 얽혀 있다고 바로 분리하는 게 아니다. 기준은 **재사용**이다. 처음엔 화면 로직을 page의 `model`/`ui`에 다 넣어두고, **두 번째 사용처가 나타날 때** 비로소 아래 레이어로 내린다. [excessive-entities 가이드](https://feature-sliced.design/docs/guides/issues/excessive-entities)가 말하는 *deferred decomposition*(지연 분해)이다. 전역 레이어에 일찍 박아둔 추상은 틀렸을 때 되돌리는 비용이 크니까, 늦게 옮길수록 안전하다는 논리다.

그래서 흥미로운 결론 하나. **`entities`는 아예 안 써도 된다.** 가이드가 직접 말한다. *"it is completely fine for the application to have no `entities` layer... it simplifies the architecture."* 백엔드가 비즈니스 로직을 쥐고 있는 thin client라면, entities 생략은 미완성이 아니라 문서가 직접 인정하는 정상 구성이다.

## 각 레이어가 실제로 맡는 것

여기서 내가 처음에 헷갈렸던 부분을 짚어야겠다. [layers 문서](https://feature-sliced.design/docs/reference/layers)의 정의는 이렇다.

- **`app`** — 라우팅, 스토어, 전역 스타일 등 앱 전역 관심사
- **`pages`** — 화면
- **`widgets`** — *"large self-sufficient blocks of UI"*, 여러 페이지에서 재사용되는 큰 UI 덩어리
- **`features`** — *"the main interactions in your app, things that your users care to do"* → **사용자 행위/인터랙션**
- **`entities`** — *"concepts from the real world... data models, validation schemas, API functions"* → **서버·도메인 모델, API**
- **`shared`** — UI 키트, 유틸, 설정 등 도메인 무관 공통 (슬라이스 없이 세그먼트만)

내가 처음엔 `features`를 "서버 모델"쯤으로 이해하고 있었는데, FSD 기준에서 **서버 모델·API는 `features`가 아니라 `entities` 소관**이다. `features`는 "사용자가 하고 싶어 하는 행위"다. 이 이름표를 헷갈리면 레이어 매핑 전체가 한 칸씩 밀린다.

의존 규칙은 하나뿐이다. [layers 문서](https://feature-sliced.design/docs/reference/layers): *"a module can only import other slices when they are located on layers strictly below."* **위가 아래를 import한다.** `pages → features → entities → shared`. 그리고 같은 레이어의 슬라이스끼리는 서로 import할 수 없다([slices-segments](https://feature-sliced.design/docs/reference/slices-segments)).

## 내가 잡아둔 구조와 비교하면

내 실무 구조는 FSD를 그대로 따른 게 아니라 **설계의 출발점을 의도적으로 뒤집은** 형태다(이 점은 분명히 해둔다). 이 비교는 "내 구조가 FSD다"라는 주장이 아니라, FSD의 이름표를 빌려 내 구조의 책임 배치를 다시 해석해보려는 시도다.

- `page`는 로직 없이 조립·연결만 하는 adapter로 둔다.
- `features`는 pages의 필요에서 출발해 정의한다. 재사용 가능한 feature를 먼저 만들어두고 페이지가 갖다 쓰는 게 아니라, 페이지가 요구할 때 feature로 추출한다 — 설계의 *출발점*이 반대라는 뜻이지, import 방향은 여전히 `pages → features` 하향이다.
- `entities`는 서버 모델을 기준으로 정의한다. (이건 FSD `entities`와 같은 자리다.)

이름표를 FSD 기준으로 정리하면, 내가 "서버 모델"이라 부르던 레이어는 결국 **FSD의 `entities`**에 해당한다. 그리고 큰 도메인의 응집도를 유지하려고 도입했던 **서브도메인** 개념 — 비슷한 레벨의 코드를 한곳에 뭉쳐두는 그 패턴이, 알고 보니 2.1에 [**slice groups**](https://feature-sliced.design/docs/reference/slice-groups)라는 이름으로 이미 있었다. *"A slice group places related slices close together within the same layer, making the structure easier to navigate."* 다만 slice groups는 **근접성만** 풀어준다. *"Each slice remains independent even when it belongs to a slice group"* — 같은 그룹이어도 결합도는 그대로다.

## 실전 배치 ① — API endpoint는 shared냐 entities냐

여기서 문서가 두 군데서 다른 말을 하는 것처럼 보인다. 인용 둘을 나란히 놓으면 정리된다.

**"shared/api에 둬라"** — [excessive-entities](https://feature-sliced.design/docs/guides/issues/excessive-entities):
> *"CRUD operations... often involve **boilerplate code without significant business logic**... place CRUD operations in `shared/api`."*

**"entities에 둬라"** — [layers](https://feature-sliced.design/docs/reference/layers):
> entities contain *"data models, **validation schemas**, **API functions**, and UI representations."*

모순이 아니라 **무게로 나눈 분업**이다.

| endpoint 종류 | 자리 |
| --- | --- |
| 보일러플레이트 CRUD (도메인 로직 X) | **`shared/api`** |
| zod 스키마 붙은 도메인 API 함수 | **`entities/[도메인]/api`** |
| 복잡 연산 (atomic update, rollback, transaction) | **`entities`** (문서: *"use it with caution"*) |

기준은 "endpoint냐"가 아니라 **"비즈니스 로직/도메인 무게가 있냐"**다. thin client면 다 `shared/api`로 몰고 entities를 생략해도 된다. 하지만 응답을 zod 스키마(서버 모델)로 정의해 검증하고, request params도 스키마로 묶는 순간, 그건 이미 boilerplate가 아니라 도메인이다 → `entities`.

> **정직하게:** endpoint+zod가 entities라는 건 layers 문서 근거가 있다. query·mutation의 *배치*도 공식 가이드가 있다 — [Usage with React Query](https://feature-sliced.design/docs/guides/tech/with-react-query)가 `shared/api/queries`(소규모) / controller별 분리(대규모) / `entities/[entity]/api`(엔티티 기반) 세 갈래를 제시한다. 다만 **"어떤 mutation이 어떤 query를 invalidate하는가"라는 관계를 어디 두느냐**는 이 가이드도 다루지 않는다. 그 부분부터는 문서가 아니라 **내 해석**이다.

## 실전 배치 ② — queryOptions·mutation과 `@x`의 무게

`queryOptions`와 mutation hook은 **"어떤 mutation이 어떤 query를 invalidate하는가"**라는 도메인 관계를 품는다. 그건 boilerplate가 아니라 도메인 지식이므로 `entities/[도메인]/model`에 둔다. 그리고 이 배치가 FSD의 아픈 지점 하나를 풀어준다.

같은 도메인 안에서 `queryOptions` 기반 캐시 무효화를 하려면 query와 mutation이 서로를 참조해야 한다. 그런데 같은 레이어의 슬라이스는 서로 import할 수 없고, 유일한 통로인 `@x`는 [cross-imports 가이드](https://feature-sliced.design/docs/guides/issues/cross-imports)가 *"a **last resort** — a **necessary compromise**, not a recommended approach"* 라고 못 박은, **`entities` 전용의 무거운 장치**다. 일상적인 invalidate마다 `@x`를 쓰는 건 과하다.

**해법은 colocation이다.** query와 mutation을 **같은 entity 슬라이스 안에** 두면, mutation이 같은 슬라이스의 query를 invalidate하니 크로스임포트 자체가 안 생긴다. `@x`는 `entities/reservation`의 mutation이 `entities/family`의 query를 건드릴 때 — **도메인을 넘을 때만** 쓰면 되고, 그게 정확히 `@x`의 설계 용도다. 배치를 제대로 하면 "일상 결합에 @x가 무겁다"는 문제가 대부분 사라진다. 마침 [React Query 가이드](https://feature-sliced.design/docs/guides/tech/with-react-query)도 *"If the project already has a division into entities... the cleanest approach is to split by entity"* — 엔티티별로 묶는 게 가장 깔끔하다며 같은 방향을 가리킨다.

## 실전 배치 ③ — form은 클라이언트 모델, features의 몫

폼을 어디 둘지 고민하다 보면 "서버 모델과 클라이언트 모델이 한 파일에 섞이는" 어색함을 만난다. 그 어색함이 정답 신호다 — **둘을 레이어로 가르면 된다.**

- **서버 모델** (API가 주고받는 값, wire 안전용 zod) → **`entities`**
- **클라이언트 모델** (폼 상태, 입력 UX용 validation, 뷰모델) → **`features`**

form은 "사용자가 하는 행위"라 features의 영역이다. 폼 스키마·RHF·제출 핸들러가 features에 살고, **제출 시 entities의 mutation hook을 호출**한다(features → entities, 하향 참조라 합법). UI도 갈린다: 서버모델을 **읽어서 보여주기만** 하는 표현형은 `entities/[x]/ui`, **인터랙션**이 있으면 `features`. 전부 features에 몰면 features가 서버모델 정의까지 떠안아 다시 섞인다.

## 그리고 진짜 어려운 것 — 횡단 관심사

여기까지는 "어디 두나"가 다 풀린다. 끝까지 남는 건 **레이어를 가로지르는 횡단 관심사(cross-cutting concern)**다. logging, analytics, 인증, 에러 트래킹처럼 어느 한 레이어에 "속한다"고 말하기 어려운 것들.

### auth를 예로 — 문서 예제가 함정이다

문서는 간단히 말한다. [excessive-entities](https://feature-sliced.design/docs/guides/issues/excessive-entities)는 *"Prefer `shared` layer to creating a `user` entity for authentication data, such as tokens or user DTOs returned from the backend"* — 토큰이든 백엔드가 준 user DTO든, `user` 엔티티를 만들지 말고 `shared`에 두라고 권한다. `shared`는 모든 레이어가 import할 수 있으니 자연스러워 보인다.

그런데 실서비스를 운영하면 auth는 예제처럼 순수하게 남지 않는다. 로그인 사용자 정보에 **소속인증(affiliation)**, **가족(family)** 같은 정보가 통합되기 시작한다. 이쯤 되면 "auth 정보"는 토큰 한 조각이 아니라 **도메인 성격이 짙은 사용자 모델**이다. 이걸 통째로 `shared`에 두려 하면 두 가지가 걸린다. 첫째, 도메인 모델이 도메인 무관 레이어에 앉아 원칙이 깨진다. 둘째, 더 결정적으로 — **`shared`는 최하위라 `entities`를 import할 수 없다.** 도메인 모델에 의존하는 auth를 `shared`에 두는 건 규칙상 애초에 성립하지 않는다.

그래서 실무의 답은 "auth를 어디에 두나"가 아니라 **"auth를 쪼갠다"**가 된다.

| auth 구성 요소 | 성격 | 자리 |
| --- | --- | --- |
| 토큰 저장·갱신·인터셉터, "토큰 있냐" | 도메인 지식 없음, 전송/인프라 | **`shared/api`** |
| 현재 사용자의 affiliation·family·권한 | 도메인 개념 | **`entities/session`** (또는 `viewer`) |

문서의 "auth → shared"는 **user DTO까지** shared로 보내라는 조언인데, 그건 DTO가 백엔드가 준 모양 그대로의 값(wire shape)인 동안만 성립한다. 소속·가족·권한 같은 도메인 관계가 붙는 순간 그건 더 이상 wire 모양이 아니라 사용자 도메인 모델이고, 자리는 처음부터 엔티티의 몫이다. 문서 한 줄을 곧이곧대로 따르면 도메인 모델을 `shared`로 끌어내리는 실수로 직행한다.

### 위치는 정리되는데, "가로질러 적용하는 법"이 없다

배치 자체는 이렇게 정리된다 — **인프라성이면 `shared`(모든 레이어가 import 가능), 도메인성이면 `entities`.** 그런데 진짜 문제는 "어디 두나"가 아니라 **"어떻게 *가로질러* 적용하나"**다. FSD엔 **AOP·미들웨어·인터셉터처럼 횡단 관심사를 1급으로 다루는 개념이 없다.**

그리고 이 문제는 **도메인 주입점이 하나로 모이냐, 흩어지냐**로 난이도가 갈린다.

- **주입점이 하나로 모이면** — 예: analytics의 `identify`. app에서 한 번 꿰면 끝. **깔끔하게 풀린다.**
- **주입점이 흩어지면** — 예: "어떤 도메인 에러든 → 도메인별 토스트 메시지". 에러 종류마다 매핑이 달라 app 한 곳에 못 모으고 feature마다 번진다. **FSD가 1급으로 안 풀어주는 진짜 구멍.**

## 케이스 스터디 — analytics를 아키텍처로 관리하기

analytics는 "주입점이 init 한 곳으로 모이는" 경우라 풀리는 쪽에 속한다. 다만 init 순서·큐잉·이벤트 카탈로그 같은 **본연의 복잡도**가 있어서, 그걸 어떻게 *가둬* 관리하느냐가 관건이다.

요구는 둘이다. **(1) 이벤트는 어느 레이어에서든 찍혀야 하고, (2) init 때 userProperty(affiliation·family 등 도메인)를 주입해야 한다.**

**설계: `shared`는 "단순한 sink", `app`이 도메인 주입.**

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

이 설계가 처음의 걱정들을 어떻게 흡수하는지:

- **init 지연·순서** → 큐잉/flush를 **shared sink 안에 캡슐화.** 호출부는 `track()`만 하면 되고 `isInitialized`를 몰라도 된다.
- **"흩어지면 관리가 별로"** → **정의와 발화를 분리.** 이벤트 계약(`EventMap`)은 한 곳에 모아 매직 스트링·오타를 컴파일 에러로 막고, 발화는 어디서 하든 이 타입에 묶여 추적된다. 흩어지는 건 call site뿐, 정의는 중앙에 남는다.
- **도메인 주입** → `app`에서 `setUserProperties` 한 번. shared는 `Props`를 opaque하게 받아 도메인 지식이 새지 않는다.
- **원칙 준수** → 이벤트는 전부 하향 import(어느 레이어 → shared), 파라미터는 primitive(id·count)라 shared가 entities의 타입을 import하지 않는다. 남는 건 이벤트 *이름*이 도메인 어휘라는 것 정도 — 그마저 싫다면 declaration merging으로 `EventMap`을 각 도메인 쪽에서 augment해 분산 정의할 수도 있지만, 중앙 카탈로그가 주는 한눈 파악이 더 커서 그대로 뒀다.

## 그래서 — 좋은 아키텍처는 복잡도를 없애지 않는다, 가둔다

여기서 마지막 질문이 남는다. *"이런 복잡도마저 아키텍처가 관리해줘야 좋은 아키텍처 아닌가? 고려할 게 이렇게 많은 게 별로 아닌가?"* 절반은 맞고 절반은 아니다.

**복잡도는 지워지지 않는다. 옮겨질 뿐이다.** analytics의 init 순서·큐잉·유저식별은 문제 자체에 내재된 **본질적 복잡도**다. 어떤 아키텍처도 이걸 삭제하진 못한다 — 에너지 보존처럼 복잡도도 보존된다(Larry Tesler가 말한 **복잡도 보존의 법칙**이다). "고려할 게 0"은 누군가(프레임워크·라이브러리)가 대신 고려했다는 뜻이지 사라진 게 아니다. 좋은 아키텍처가 하는 일은 삭제가 아니라 **한 번만 지불하고, 안정된 인터페이스 뒤에 가둬서, 나머지 코드엔 안 보이게** 하는 것이다.

그래서 진짜 smell test는 **"복잡도를 어디서 고려하느냐"**다.

- **호출부마다 고려해야 하면** → 나쁜 설계다. 매 caller가 `isInitialized`를 체크하고 userProps를 직접 붙이면 추상화가 샌 것이다.
- **`shared/analytics` 한 모듈에 다 흡수되면** → 그게 곧 **"아키텍처가 복잡도를 관리한 것"**이다. 고려사항이 사라진 게 아니라 한 곳에 갇혔고, 그게 좋은 설계의 정의다.

즉 "고려할 게 많다"가 문제가 아니라, **그 고려가 흩어지면** 문제다.

그럼 FSD는 이 일을 해주는가? **여기서 FSD의 한계를 정직하게 인정해야 한다. FSD는 경계(layering) 방법론이지 프레임워크가 아니다.** DI 컨테이너도, 미들웨어 파이프라인도, aspect weaving도 **제공하지 않는다.** FSD는 "이 모듈을 `shared`에 둬라"까지만 말하고, 그 큐잉 sink·타입드 계약·app 주입을 **직접 짓는 건 당신 몫**으로 남긴다.

그걸 **1급으로** 원한다면, 그건 FSD가 스코프 밖에 둔 자리다 — NestJS·Angular의 DI/인터셉터, Effect-TS 같은 effect system, 미들웨어 파이프라인. 이들은 횡단 관심사를 선언적으로 다루게 해 "고려할 것"을 진짜 줄여준다. **대신 런타임/프레임워크에 결합**되고 그 자체의 마법·학습비용·락인을 감수해야 한다. 트레이드오프는 이렇게 요약된다.

> **단순한 경계** ↔ **횡단 관심사 관리** — 둘 다 최대로는 못 가진다.
> FSD는 "레이어 여섯, import 규칙 하나"로 경계를 단순하게 유지하는 대가로, 횡단 관심사는 직접 구현하게 둔다.

## 마무리

정리하면 이렇다. FSD 2.1은 **"세 레이어로 시작하고 증명된 만큼만 추출하라"**는 한 문장으로, 2.0 시절 회의실에서 태우던 시간의 상당 부분을 돌려준다. 경계를 긋는 규율로서는 훌륭하다.

다만 그 단정한 의존 그래프에 **안 맞는 잔여물**이 있다 — 도메인을 *넘는* 결합(통로가 @x 하나뿐인), 그리고 주입점이 흩어지는 횡단 관심사. 이건 FSD의 버그가 아니라 **스코프 선택**이다. 경계를 단순하게 유지하려고 횡단 관심사 관리를 1급 기능으로 두지 않은 것이고, 그 대가는 캡슐화를 직접 짓는 노동이다.

그러니 정확한 평가는 *"FSD가 별로다"*가 아니라 — **"FSD는 경계는 훌륭히 관리하지만 횡단은 관리 대상에서 뺐고, 그 빈자리는 프레임워크급 도구로 메우거나 내가 캡슐화로 메워야 한다"**이다. 좋은 아키텍처의 기준을 "복잡도를 없애는 것"이 아니라 **"복잡도를 한 곳에 가두는 것"**으로 잡으면, FSD의 경계 위에서 그 가두는 작업을 직접 하는 것 — 그게 지금 내가 선 자리다.

---

## 참고 문서

- [FSD 공식 튜토리얼 (Get Started)](https://feature-sliced.design/docs/get-started/tutorial)
- [FSD v2.1 릴리스 노트](https://github.com/feature-sliced/documentation/releases/tag/v2.1)
- [Layers (Reference)](https://feature-sliced.design/docs/reference/layers)
- [Slices & Segments (Reference)](https://feature-sliced.design/docs/reference/slices-segments)
- [Slice groups (Reference)](https://feature-sliced.design/docs/reference/slice-groups)
- [Public API (Reference)](https://feature-sliced.design/docs/reference/public-api)
- [Excessive entities — entities 레이어를 안 쓰는 법 (Guide)](https://feature-sliced.design/docs/guides/issues/excessive-entities)
- [Cross-imports & `@x` (Guide)](https://feature-sliced.design/docs/guides/issues/cross-imports)
- [Usage with React Query (Guide)](https://feature-sliced.design/docs/guides/tech/with-react-query)
- [Desegmented (Guide)](https://feature-sliced.design/docs/guides/issues/desegmented)
