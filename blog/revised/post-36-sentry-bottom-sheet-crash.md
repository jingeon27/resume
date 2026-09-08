# Sentry가 잡아 준 Bottom Sheet 드래그 크래시, 원인 경로가 사라진 버전으로 올리기까지

운영 Sentry에 시트를 드래그하다 놓는 순간 화면이 멈추는 오류가 잡혔어요. 확인 당시 같은 원인으로 묶은 오류 그룹 두 개에서 23건이 났고, 영향을 받은 사용자는 17명이었는데요. 개발하면서는 한 번도 만나지 못한 오류였어요. 그런데 스택 추적에서 예외가 난 위치는 전부 `react-modal-sheet`의 드래그 종료 처리로 이어졌어요.

<div class="note note-summary">
  <strong>이 글에서 다루는 것</strong>
  <p>소비자용 앱에서 Bottom Sheet를 드래그하다 놓으면 화면이 죽던 오류를 라이브러리 소스까지 따라간 과정이에요. 스택이 끝난 지점과 끝내 재현하지 못한 구간, `react-modal-sheet` 2.2.1 → 5.6.0(motion 11.18.2) 업그레이드로 원인 코드 경로가 사라진 이유, 제품 코드 26개 사용처의 API를 유지하려고 만든 변환 계층과 그 한계를 다뤄요.</p>
</div>

처음엔 앱의 닫기 로직을 의심했어요. 시트를 닫는 경로가 여러 갈래라 그중 하나가 ref를 먼저 치웠겠거니 했는데요. 스택을 따라가 보니 예외가 난 자리는 앱 코드보다 한 단계 아래였어요.

## Sentry에서 크기와 공통 경로를 먼저 봤어요

브라우저 콘솔에서 한 번 봤다면 우선순위를 정하기 어려웠을 거예요. Sentry에서는 같은 스택의 오류가 반복됐고, 이벤트 수뿐 아니라 영향을 받은 사용자 수도 같이 보였는데요. 간헐적으로 나는 제스처 오류가 제 기기만의 문제가 아니라 실제 사용자 흐름을 끊고 있다는 근거가 됐어요.

예외가 난 위치는 앱의 시트 호출부가 아니라 `react-modal-sheet` 2.2.1의 `onDragEnd`였어요. 그 버전 코드를 단순화하면 이래요.

```ts
// react-modal-sheet 2.2.1 sheet.tsx, 분기와 계산을 줄인 단순화 코드
function onDragEnd(_event, { velocity }) {
  if (velocity.y > 500) {
    onClose(); // 빠르게 아래로 튕겨 닫는 경로는 ref를 읽지 않아요
    return;
  }

  const sheetEl = sheetRef.current as HTMLDivElement;
  const sheetHeight = sheetEl.getBoundingClientRect().height;

  // 드래그가 끝난 위치에 맞는 snap point 계산
}
```

`sheetRef.current`를 `as HTMLDivElement`로 캐스팅한 다음 곧바로 DOM 크기를 읽고 있었어요. 캐스트라 타입 검사도 통과해요. 같은 파일의 `snapTo`에는 null 검사가 있는데(`sheet.tsx:186-191`) 드래그 종료 경로에만 빠져 있었어요. 게다가 이 콜백은 라이브러리 내부에 있어서 앱의 `onClose`에서 ref 상태를 확인하는 방식으로는 끼어들 자리가 없었어요.

여기서 재현 조건 하나가 보였어요. 빠르게 튕겨 닫으면 ref를 읽지 않으니 죽지 않아요. 천천히 끌다가 놓을 때만 이 줄에 도달해요(`sheet.tsx:128-133`).

## 스택은 라이브러리 안에서 끝났고, 그 앞은 재현하지 못했어요

처음 적어 둔 설명은 "시트가 닫히기 시작하면 곧바로 언마운트되고, 그 사이 예약된 콜백이 빈 ref를 읽는다"였어요. 그런데 2.2.1 소스를 다시 읽어 보니 그 단정은 코드로 성립하지 않았어요.

`sheet.tsx:249-258`은 `isOpen ? children : null`을 `AnimatePresence`로 감싸고, `SheetContainer`는 `exit={{ y: windowHeight }}`로 0.2초짜리 트윈 종료 애니메이션을 가져요. `isOpen`이 `false`가 되어도 시트는 그 애니메이션이 끝날 때까지 DOM에 남아 있어요. 이 저장소의 닫기 경로도 마찬가지였어요. `overlay.close`, `closeAll`, Root의 popstate → `onClose` 전부 `isOpen=false` → 종료 애니메이션 → `onCloseEnd` → 언마운트 순서예요. 상태 전환 하나만으로는 다음 프레임의 post-render 전에 ref가 비지 않아요.

그래서 확실하게 말할 수 있는 건 여기까지예요. 스택은 `sheet.tsx:133`에서 끝났고, 드래그 종료 콜백은 framer-motion 11(현 Motion)의 `VisualElementDragControls`가 다음 프레임 post-render에 예약해요. 그 사이에 시트 트리가 통째로 사라지면 null을 읽게 돼요. 어떤 앱 동작이 그 틈에 시트를 없앴는지는 끝내 재현하지 못했어요.

```text
포인터 입력 종료
  → 드래그 종료 콜백이 다음 프레임 post-render에 예약됨
  → 그 사이 시트 트리 언마운트(트리거 미확인)
  → sheetRef.current = null
  → 예약된 onDragEnd 실행
  → null에서 getBoundingClientRect 호출
  → 화면 크래시
```

혼자 겪는 일은 아니었어요. 업스트림 이슈 #188(2025-01-03 등록, 지금도 열려 있음)이 "시트를 닫는 버튼 위에서 드래그를 시작해 같은 버튼에서 손을 떼면 `sheetRef.current.getBoundingClientRect`가 null"이라고 같은 크래시를 보고하고 있었어요. 트리거는 우리 쪽과 다를 수 있지만 죽는 지점은 같아요.

그러다 5.x 소스를 열어 봤어요. 드래그가 끝날 때 ref를 다시 읽지 않았어요. `useMeasure`(react-use-measure 2.1.7)로 미리 측정해 둔 `sheetHeight`를 쓰고, `AnimatePresence`도 쓰지 않아요. 누가 null 검사를 추가한 게 아니라 재작성 과정에서 문제가 되던 DOM 접근 자체가 없어진 거예요.

## 선택지 셋 중 업그레이드를 골랐어요

| 선택지 | 장점 | 비용·위험 | 판단 |
| --- | --- | --- | --- |
| 호출부에서 닫힘을 지연 | 변경 범위가 작음 | 라이브러리 내부 콜백을 확실히 막지 못하고, 트리거를 재현하지 못한 상태라 지연 시간이 근거 없는 값이 됨 | 버림 |
| 패키지에 null guard 패치 | 원인 지점을 직접 막음 | 설치할 때마다 사설 패치를 유지해야 하고, 업스트림이 고쳐도 따라가지 않음 | 버림 |
| 5.6.0으로 업그레이드 | ref 접근 경로 자체가 사라짐 | `snapPoints`·`detent` 의미 변경, `framer-motion` → `motion/react` import 30파일 이동, 사용 규칙 문서(AGENTS·SKILL) 갱신 | 선택 |

<div class="note note-decision">
  <strong>최종 결정</strong>
  <p>5.6.0으로 올렸어요. 사용자 영향은 화면이 죽는 것이라 회피보다 경로 제거가 필요했고, 실패해도 피해는 시트 높이나 초기 위치가 어긋나는 정도라 배포 후에 눈으로 확인할 수 있어요. 되돌리는 건 라이브러리 버전과 공통 Root를 원래대로 돌리면 되고(애니메이션 패키지는 그대로 남아 옮긴 30파일은 손대지 않아도 돼요), 뒤에 지운 `detent` 세 곳만 함께 되살리면 돼요. 사설 패치와 달리 다음 사람이 유지할 것도 없고요. 대신 메이저 변경을 흡수할 자리가 공통 Root 하나뿐이라는 점이 전제였어요.</p>
</div>

## 공통 Root에서 좌표계를 변환했어요

메이저 버전을 올리면 크래시 경로는 사라지지만 `snapPoints`의 의미가 달라져요.

| 구분 | 2.x | 5.x |
| --- | --- | --- |
| 0~1 비율의 기준 | 뷰포트 높이 | 시트 높이 |
| 순서 | 내림차순 | 오름차순 |
| 인덱스 0 | 가장 높이 열린 위치 | 닫힘, 마지막이 완전히 열린 위치 |
| 경계 값 | `0`·`1` 강제 없음 | `0`에서 시작해 `1`로 끝남(없으면 자동 삽입 후 `console.error`) |

공통 `BottomSheet.Root`는 제품 코드 26곳에서 쓰이고 있었어요(`<BottomSheet.Root` grep 기준, 문서 예시 5건 제외. 커밋 메시지에는 28곳이라고 적었는데 다시 세어 보니 26이었어요). 이 중 3곳이 뷰포트 기준 `snapPoints`를 직접 넘겼는데요(`[0.8, 0.5, 0.3, 0]` 두 곳, `[0.8]` 한 곳). 세 호출부를 새 좌표계에 맞춰 손으로 고치면 라이브러리 규칙이 기능 코드로 새어 나와요. 그래서 Root의 외부 인터페이스는 그대로 두고 내부에서만 변환했어요. `IBottomSheetRootProps`에는 주석만 더했어요.

```ts
function toSheetSnapConfig(points: number[], initialSnap: number) {
  const [tallest] = points;
  const ascending = [...points].reverse().map((point) => point / tallest);

  const needsClosedSnap = ascending[0] !== 0;
  const snapPoints = needsClosedSnap ? [0, ...ascending] : ascending;
  const closedSnapOffset = needsClosedSnap ? 1 : 0;
  const height = Number((tallest * 100).toFixed(2));

  return {
    snapPoints,
    initialSnap: points.length - 1 - initialSnap + closedSnapOffset,
    contentHeight: `calc(${height}dvh - ${BOTTOM_SHEET_HEADER_HEIGHT}px)`,
  };
}
```

기존의 `[0.8, 0.5, 0.3, 0]`은 뷰포트의 80%·50%·30%·닫힘을 뜻해요. 새 라이브러리에는 시트의 최대 높이인 `0.8`로 나눠 `[0, 0.375, 0.625, 1]`을 넘겨요. 호출부는 같은 값을 계속 쓰고, 라이브러리는 자기가 요구하는 좌표계로 값을 받아요.

시트의 실제 높이도 이 변환 계층에서 함께 계산했어요. 5.x는 `detent`가 컨테이너의 `height`를 나중에 결정해서 컨테이너 스타일만으로는 기존 높이를 지킬 수 없었는데요. 컨테이너 높이를 콘텐츠가 정하는 `content` 모드를 쓰고 `Sheet.Content`에 계산한 높이를 넘겼어요. 헤더 40px은 계산과 마크업이 어긋나지 않도록 `BOTTOM_SHEET_HEADER_HEIGHT` 상수 하나로 묶었어요.

명시적 `snapPoints`가 없는 나머지 사용처는 이름만 보고 옮기지 않았어요. `content-height`는 `content`로, `full-height`는 옮기기 전 높이와 가장 가까운 `default`로 매핑했어요. 5.x에 `full`이라는 이름이 있어도 이름보다 실제 렌더링 결과를 보존하는 쪽을 택했어요.

## 메이저 셋을 한 번에 건넜어요

`package.json`의 `^2.2.0`을 `^5.6.0`으로 올렸고, lock 파일 기준으로 2.2.1에서 5.6.0이 됐어요. 문제가 된 함수만 보고 올리면 빌드는 되더라도 다른 동작이 조용히 달라질 수 있었는데요. 실제로 이번엔 메이저 셋을 한 번에 건넜고, 그 사이에 이런 것들이 바뀌어 있었어요.

- v3.0.0(2024-05-11): `Sheet`가 기본 export에서 named export로 바뀜
- v4.0.0(2024-12-27): peer dependency가 `framer-motion`에서 `motion`으로 바뀜
- v5.0.0(2025-09-06): `Sheet.Scroller` 제거(`Sheet.Content`가 스크롤 영역까지 맡음), `snapPoints` 좌표계와 `detent` 값 변경

peer가 `motion`이라 그 패키지(`^11.18.2`)를 설치했어요. 그런데 `motion@11`은 framer-motion 11을 자체 번들한 사본을 들고 있어서, 앱이 `framer-motion`을 직접 import하면 같은 라이브러리가 두 벌 실릴 수 있었는데요. 직접 import하던 30파일을 `motion/react`로 옮겨 실행 경로를 한 벌로 맞췄어요. `framer-motion`(선언은 `^11.0.24` 그대로, lock이 해석한 설치 버전은 11.18.2)을 의존성에 남긴 건 `motion`의 타입 진입점이 `export * from 'framer-motion'`이기 때문이에요. 어차피 `motion`이 `framer-motion`을 dependency로 갖고 있어서 설치는 되고, 런타임에 그 경로를 import하는 코드만 없앤 셈이에요.

후속 diff를 다시 읽으면서 세 가지를 더 정리했어요. 먼저 `detent` prop을 3곳에서 지웠어요. 처음엔 "원래부터 영향이 없던 prop"이라고 적었는데 그것도 틀렸어요. 2.2.1의 `SheetContainer.tsx:30-44`는 `snapPoints`가 있어도 `full-height`면 `height`로, `content-height`면 `maxHeight`로 다르게 적용했거든요. 이 prop이 죽은 값이 된 건 새 Root가 `snapPoints`가 있으면 `detent`를 `content`로 고정한 뒤부터예요. 읽는 사람에게 반영되는 것처럼 보이니 지우고 prop 설명에 그 사실을 적었어요. 다음으로 비율을 그대로 곱하면 `55.00000000000001dvh` 같은 CSS가 나와서 소수 둘째 자리에서 정리했고, 마지막으로 같은 판단이 다음 시트 작업에서도 유지되도록 사용 규칙 문서를 현재 API에 맞췄어요.

## 성공했다는 말도 나눠서 확인했어요

- **테스트로 고정한 것**: 좌표 변환 규칙. `bottom-sheet.lib.test.ts`에 7개 케이스로 남겼어요.
- **개발 서버에서 본 것**: `snapPoints`를 직접 넘기는 3개 시트의 초기 위치와 최대 높이, `Sheet.Scroller`가 사라진 뒤의 스크롤 동작이에요. 눈으로 보고 넘어간 거라 자동으로 남는 기록은 없어요.
- **프로덕션 빌드에서만 볼 수 있는 것**: 애니메이션 런타임이 정말 한 벌만 실리는지예요. import 30파일을 옮긴 근거는 `motion@11`이 framer-motion 사본을 번들한다는 사실이고, 번들을 열어 두 벌이 사라졌는지 대조한 기록은 남기지 않았어요.
- **재현하지 못한 것**: 크래시 그 자체예요. 천천히 끌다 놓는 경로에서만 ref를 읽는다는 조건까지는 좁혔지만, 그 사이 시트 트리를 없애는 앱 동작을 찾지 못해 수정 전/후를 같은 조작으로 비교하지 못했어요.
- **기록이 남지 않은 것**: 배포 전 실기기와 스테이지 확인이에요. 커밋과 문서에 결과를 남기지 않아서 여기에 적을 수 있는 게 없어요.

변환 규칙 테스트는 구현을 그대로 옮겨 적지 않으려고 헬퍼를 하나 뒀어요. 시트 기준 비율을 다시 뷰포트 기준으로 되돌리는 `toViewportRatio`인데요. 사용자가 보게 될 위치의 의미로 검증하려는 의도였어요.

```ts
it('두 번째로 높은 스냅에서 시작하면 그 자리를 가리켜야 한다', () => {
  const { snapPoints, initialSnap } = toSheetSnapConfig([0.8, 0.5, 0.3, 0], 1);

  expect(toViewportRatio(snapPoints[initialSnap], 0.8)).toBe(0.5);
});
```

나머지 케이스는 배열 뒤집기, 가장 높은 스냅이 `1`인지, 닫힌 위치 자동 삽입, 가장 높은 스냅에서 시작할 때의 마지막 인덱스, 시작 인덱스 보정, 콘텐츠 높이를 각각 봐요. 테스트를 쓴 뒤 인덱스 계산을 일부러 틀리게 바꿔 빨간불이 켜지는지도 확인했어요.

## 다음 작업에 남긴 기준

이번 변경으로 null ref를 읽던 2.2.1의 코드 경로는 없어졌고, 26개 사용처의 공개 인터페이스와 명시적 스냅 3개의 위치 의미는 유지했어요. 다만 "5.6.0으로 올렸다"를 완료로 보지 않기로 했어요. 완료 조건은 새 release에서 같은 크래시가 다시 잡히지 않고 주요 시트의 동작이 유지되는 것으로 잡았어요.

남긴 기준은 넷이에요. 간헐적인 UI 오류는 재현 여부만으로 우선순위를 정하지 않고 발생 수와 영향 사용자 수를 함께 봐요. 스택이 의존성 안에서 끝나면 앱 쪽 우회부터 만들기 전에 그 버전의 소스와 이후 릴리스를 먼저 읽어요. 메이저 업그레이드로 의미가 달라진 값은 호출부마다 고치지 말고 공통 경계의 변환 함수에서 처리해요. 그리고 원인을 재현하지 못했으면 원인 문장을 확정형으로 쓰지 않아요. 마지막 기준은 이 글을 고쳐 쓰면서 얻은 거예요.

관측 도구가 오류를 대신 풀어 주지는 않았어요. 다만 누가 얼마나 겪었는지와 어느 경계부터 읽어야 하는지를 알려 줘서, "가끔 시트가 이상하다"는 제보로 남았을 문제를 닫을 수 있는 형태로 바꿔 줬어요.

<div class="note note-limit">
  <strong>아직 확인하지 못한 것</strong>
  <p>크래시를 재현하지 못해서 시트 트리를 없앤 앱 동작이 무엇인지 특정하지 못했어요. 23건·17명은 수정 전에 확인한 값이고, 수정 후 감소는 운영 기간이 쌓인 뒤에 판단할 값이에요. 단위 테스트는 좌표 변환 회귀만 막고 브라우저의 실제 드래그 타이밍은 보지 않아요. 실기기와 스테이지 확인 결과도 기록으로 남기지 않았어요.</p>
</div>

## 참고

- [react-modal-sheet #188 — 닫기 버튼 위에서 끝나는 드래그에서 `getBoundingClientRect` of null](https://github.com/Temzasse/react-modal-sheet/issues/188)
- [react-modal-sheet v5.0.0 릴리스](https://github.com/Temzasse/react-modal-sheet/releases/tag/v5.0.0) — README의 v4 → v5 마이그레이션 안내 포함
- [framer/motion](https://github.com/framer/motion) — 드래그 종료 콜백을 다음 프레임 post-render에 예약하는 `VisualElementDragControls`
- 관련 글: [Sentry를 붙이면서 정한 에러 레벨과 PII 정화 기준](https://jingeon27.tistory.com/30)
