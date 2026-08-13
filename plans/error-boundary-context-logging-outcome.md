# Error Boundary 자동 컨텍스트 로깅 — 시도와 철회 기록

> 계획: [error-boundary-context-logging-plan.md](./error-boundary-context-logging-plan.md)
> 형식: [engineering-impact-record.md](../templates/engineering-impact-record.md) — 근거가 있는 항목만 채웠다.

## 1. 기본 정보

- 작업명: Error Boundary 오류 컨텍스트 자동 수집 시도와 철회
- 작업일: 2026-08-13 (시도 11:08 → 철회 12:12)
- 담당 범위: 단독
- 관련 앱: safedoc 모노레포 — CMS / hospital-admin / global-cms (Next 16.2.12, Turbopack 빌드)
- 관련 커밋: `86917880` (시도, 미머지) / `616496be` (철회, PR #1444 develop 머지)
- 관련 PRD: 없음 — 내부 개선 과제

## 2. 문제

모든 Error Boundary 호출부가 컴포넌트 구조를 문자열로 다시 적고 있었다.

```tsx
<QueryErrorBoundary name="customer/reservation:detail" variant="section">
```

이 문자열은 코드가 옮겨가도 따라오지 않는다. 낡은 `name` 은 CloudWatch 로그를 엉뚱한 화면으로 안내한다.

## 3. 시도한 방법

`name` 을 지우고 호출부는 복구 방식만 선언한다. "어느 화면의 어느 컴포넌트"는 바운더리가
`componentDidCatch` 에서 받는 `errorInfo.componentStack` 으로 **런타임에** 채운다.

```tsx
<QueryErrorBoundary variant="section">
```

## 4. 왜 철회했나

프로덕션 빌드 산출물로 확인했다. componentStack 이 이렇게 남는다.

```text
at o (chunks/8241-abc.js:1:5678)
```

minifier 가 컴포넌트 함수 이름을 mangle 한다. 이름이 보이던 건 개발 빌드뿐이었다.
주입은 런타임이지만, **이름이 살아남아야 하는 시점은 빌드 타임**이라는 걸 놓쳤다.

이름을 되찾는 경로 두 개를 확인했고 둘 다 배포에 못 쓴다.

| 방법 | 동작하는가 | 왜 못 쓰나 |
| --- | --- | --- |
| `next build --no-mangling` | **된다** (Turbopack 빌드에도 전달됨) | 빌드 전체의 mangle 을 끈다. Next 자신이 *"should only be used for debugging purposes"* 로 경고 — 일회성 진단용 |
| `productionBrowserSourceMaps: true` + 로그 역매핑 | 된다 | 배포 시간 증가와 소스 공개. 둘 다 수용 불가 |

`--no-mangling` 은 처음에 webpack 전용으로 판단했으나 오판이었다. 설치된 Next 16.2.12 에서 CLI 플래그가
`NextBuildContext.noMangling` 을 거쳐 Turbopack `createProject` 옵션까지 도달한다
(`dist/bin/next` → `dist/cli/next-build.js` → `dist/build/index.js` → `dist/build/turbopack-build/impl.js`).
결론은 같지만 근거가 틀렸었고, 코드 주석을 정정했다.

## 5. 내가 내린 판단

트레이드오프의 축은 번들러가 아니라 **이름을 누가 대는가** 였다.

- 선택한 방법: 수동 `name` 유지
- 고려한 대안: componentStack 자동 수집 / `--no-mangling` / 소스맵 역매핑
- 선택 이유: 낡은 이름은 **사람이 고칠 수 있는** 결함이고, mangle 된 이름은 배포 파이프라인 어디를
  건드려도 **못 살리는** 결함이다. 고칠 수 있는 쪽을 남겼다.
- 감수한 제약: 애초에 없애려던 문자열 동기화 부담을 그대로 안고 간다.

## 6. 실제로 반영한 변경

componentStack 을 자동 수집원으로 못 쓰는 이상 로그에 싣는 것도 의미가 없다 —
`logError` 가 이미 싣는 `stack` 과 **같은 청크 위치를 읽지도 못하는 형태로 중복**시킬 뿐이다.

- `ErrorScope` 에서 `component`·`componentStack` 필드 제거
- 이 둘의 유일한 사용처였던 `getComponentFromStack` 제거
- 로그에 남는 것: `boundary` + `path` + `stack`
- 판단 근거를 코드 주석에 남겨, 다음에 같은 조사를 반복하지 않게 했다

## 7. 증거 수준

**D — 코드 변경과 프로덕션 빌드 산출물로 확인.** 배포 후 수치는 없다.

- 측정하지 않은 것: CloudWatch 이벤트 크기 변화, 로그만으로 화면을 특정하기까지 걸린 시간
- 더 높은 수준으로 확인하려면: 위 두 지표를 철회 전후로 비교해야 하는데 기준값을 안 재고 있었다

## 8. 이력서용 문장

> Error Boundary 호출부의 수동 문자열을 React componentStack 자동 수집으로 대체하려다,
> 프로덕션 빌드에서 컴포넌트 이름이 mangle 되어 로그가 무용해지는 것을 빌드 산출물로 확인하고 철회했습니다.
> 대안 두 가지(mangle 비활성화, 소스맵 역매핑)가 각각 번들 크기와 소스 공개 문제로 배포에 쓸 수 없음을
> 확인한 뒤, 읽을 수 없는 필드를 로그에서 제거하고 판단 근거를 코드에 남겼습니다.

## 9. 면접에서 설명할 내용

- **되돌린 시도**: 자동화가 개발 환경에서만 성립하는 걸 늦게 발견했다. 프로덕션 빌드로 먼저 확인했다면
  코드를 고치기 전에 알 수 있었다.
- **다른 방법을 선택하지 않은 이유**: 두 대안 모두 "가능한가"가 아니라 "배포에 쓸 수 있는가"에서 갈렸다.
  가능 여부만 보고 판단하면 `--no-mangling` 은 되는 방법처럼 보인다.
- **가장 어려웠던 판단**: 없애려던 결함을 도로 안고 가기로 한 것. 두 결함 중 **사람이 고칠 수 있는 쪽**을
  남기는 게 기준이었다.
- **남은 것**: 복구 범위를 `variant`(page/section/overlay)로 가르는 축은 componentStack 과 무관하게
  유효하다. 이름 자동화만 무너졌고 이 축은 반증되지 않았다 — 미머지 브랜치로 남아 있다.
- **다시 한다면**: 런타임에서 얻을 수 있는 값과 빌드를 통과해 살아남는 값을 먼저 구분한다.
