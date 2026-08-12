# Error Boundary 자동 컨텍스트 로깅 전환 계획

## 1. 배경

현재 `QueryErrorBoundary`는 모든 호출부에서 사람이 `name`을 작성하도록 요구한다.

```tsx
<QueryErrorBoundary name="customer/reservation:detail" variant="section">
  <ReservationDetail />
</QueryErrorBoundary>
```

`name`은 로그에서 오류가 발생한 구획을 구분하는 데 사용되지만, 컴포넌트 구조를 문자열로 다시 표현한다는 문제가 있다.

- 화면이나 컴포넌트를 옮겨도 문자열은 자동으로 바뀌지 않는다.
- 같은 경계가 파일 구조와 `name`에 중복으로 표현된다.
- 개발자마다 경로와 구획을 표기하는 방식이 달라질 수 있다.
- 경계를 세분화할수록 의미 없는 프로퍼티 작성 비용이 늘어난다.
- 오래된 `name`은 로그를 잘못된 화면으로 안내할 수 있다.

이미 런타임에서 다음 정보를 자동으로 얻을 수 있다.

- `path`: `pathname + search`
- `variant`: `page | section | overlay`
- `component`: React `componentStack`의 첫 번째 컴포넌트
- `componentStack`: 오류가 발생한 실제 컴포넌트 계층
- `stack`: 원본 JavaScript 오류 스택
- `appName`: 앱별 로깅 설정

따라서 수동 `name`을 제거하고 `path + variant + componentStack`을 기본 오류 컨텍스트로 사용한다.

---

## 2. 목표

호출부는 실패했을 때의 UI 복구 방식만 선언한다.

```tsx
<QueryErrorBoundary variant="section">
  <ReservationDetail />
</QueryErrorBoundary>
```

Error Boundary는 오류를 잡은 시점에 컨텍스트를 자동으로 구성한다.

```json
{
  "type": "GENERAL_ERROR",
  "boundaryVariant": "section",
  "path": "/customer/reservation?reservationId=7012",
  "component": "ReservationDetail",
  "componentStack": "at ReservationDetail (...)\nat QueryErrorBoundary (...)"
}
```

이번 변경의 목표는 다음과 같다.

1. 모든 Error Boundary 호출부에서 필수 `name` 프로퍼티를 제거한다.
2. 현재 URL, 경계 종류, 오류 발생 컴포넌트 계층을 자동으로 기록한다.
3. 페이지·구획·오버레이별 복구 동작은 그대로 유지한다.
4. 라우트 또는 쿼리 파라미터가 바뀌면 기존 폴백이 초기화되는 동작을 유지한다.
5. 로그만 보고 오류가 발생한 화면과 컴포넌트를 재현할 수 있게 한다.
6. 수동 문자열 제거가 기존 오류 처리 범위를 넓히거나 좁히지 않게 한다.

---

## 3. 범위에서 제외할 것

이번 단계에서는 다음 작업을 하지 않는다.

- Babel·SWC·Turbopack 플러그인을 이용한 파일 위치 자동 주입
- 파일 경로와 행 번호로 만든 `boundaryId`
- 사람이 작성하는 `label` 또는 `name`의 선택적 유지
- API 응답 스키마나 에러 메시지 정책 변경
- Mutation 오류를 Error Boundary로 이동
- CloudWatch 저장 구조와 보존 정책 변경

`componentStack`과 프로덕션 source map만으로 장애 위치를 찾기 어렵다는 실제 사례가 확인될 때 빌드 타임 `boundaryId`를 후속 검토한다. 가능성만으로 컴파일러 확장을 먼저 추가하지 않는다.

---

## 4. 설계

### 4.1. 로그 타입

기존 `ErrorScope.boundary?: string`을 `boundaryVariant`로 교체한다.

```ts
export type ErrorBoundaryVariant = 'page' | 'section' | 'overlay';

export interface ErrorScope {
  path?: string;
  boundaryVariant?: ErrorBoundaryVariant;
  component?: string;
  componentStack?: string;
}
```

`boundaryVariant`는 오류가 발생한 업무 영역의 이름이 아니라 사용자에게 적용된 복구 범위를 뜻한다. URL과 컴포넌트 계층은 각각 `path`, `componentStack`이 담당한다.

이전 로그와의 검색 호환성이 필요하면 전환 기간 동안 `boundary`를 optional deprecated 필드로 유지하되 새 로그에서는 채우지 않는다. 별도의 호환 요구가 없다면 같은 변경에서 제거한다.

### 4.2. `QueryErrorBoundary` 공개 API

```ts
interface QueryErrorBoundaryProps {
  variant?: ErrorBoundaryVariant;
  onError?: () => void;
  children: ReactNode;
}
```

변경 전:

```tsx
<QueryErrorBoundary name="review:detail" variant="section">
  <ReviewDetail />
</QueryErrorBoundary>
```

변경 후:

```tsx
<QueryErrorBoundary variant="section">
  <ReviewDetail />
</QueryErrorBoundary>
```

`variant`의 기본값은 기존과 동일하게 `page`를 유지한다. 다만 경계 범위를 코드 리뷰에서 바로 확인할 수 있도록 페이지 루트를 제외한 호출부에서는 `section`과 `overlay`를 명시한다.

### 4.3. `ErrorBoundary` 내부 API

`ErrorBoundary`에는 의미 이름 대신 경계 종류를 전달한다.

```tsx
<ErrorBoundary
  variant={variant}
  onReset={reset}
  onError={onError}
  FallbackComponent={FALLBACK_BY_VARIANT[variant]}
>
  {children}
</ErrorBoundary>
```

오류를 잡으면 다음 정보를 그 시점에 구성한다.

```ts
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  logError(error, APP_ERROR_OPTIONS, {
    boundaryVariant: this.props.variant,
    path: getCurrentPath(),
    component: getComponentFromStack(errorInfo.componentStack),
    componentStack: errorInfo.componentStack ?? undefined,
  });

  this.props.onError?.();
}
```

`getDerivedStateFromError`에서는 폴백 렌더링에 필요한 오류 데이터와 오류 발생 경로만 저장한다. 로그 컨텍스트는 `componentStack`을 받을 수 있는 `componentDidCatch`에서 완성한다.

### 4.4. Fallback API

현재 `FallbackProps.boundary`를 폴백 UI가 실제로 사용하지 않는다면 제거한다.

```ts
export interface FallbackProps {
  error: ErrorLogData | null;
  resetErrorBoundary: () => void;
}
```

폴백 문구는 수동 경계 이름이 아니라 HTTP 상태와 `variant`에 따라 결정한다.

- `page`: 전체 본문용 오류 안내와 다시 시도·뒤로 가기·새로고침
- `section`: 해당 구획 안의 작은 오류 안내와 다시 시도
- `overlay`: 별도 폴백을 렌더링하지 않고 토스트 표시

### 4.5. 라우트 경계

`RouteErrorBoundary`에서는 `usePathname()`으로 `name`을 만들어 넘기는 코드를 제거한다. 실제 로그 경로는 오류가 발생한 순간 `getCurrentPath()`가 `pathname + search` 형태로 수집한다.

```tsx
export function RouteErrorBoundary({ children }: Props) {
  return <QueryErrorBoundary variant="page">{children}</QueryErrorBoundary>;
}
```

이를 통해 라우트 경계와 일반 페이지 경계가 동일한 자동 컨텍스트 수집 경로를 사용한다.

### 4.6. 오버레이 경계

공용 `overlay.open`과 `overlay.openAsync` 래퍼에서도 고정값인 `name="overlay"`를 제거한다.

```tsx
<QueryErrorBoundary variant="overlay" onError={handleError}>
  <Controller {...props} />
</QueryErrorBoundary>
```

다음 기존 동작은 변경하지 않는다.

- 렌더링 실패 시 오버레이 unmount
- 토스트 오류 안내
- `openAsync`를 `undefined`로 종료
- 호출부의 `finally` 실행 보장

---

## 5. 구현 순서

### 1단계: 로그 계약 변경

대상:

- 공용 오류 타입
- `createErrorLogData`
- `logError`
- 관련 단위 테스트

작업:

1. `ErrorBoundaryVariant` 타입을 공용 위치에 정의한다.
2. `ErrorScope.boundary`를 `boundaryVariant`로 교체한다.
3. 일반 오류와 API 오류 모두 새 필드를 보존하는지 확인한다.
4. Error Boundary 밖에서 발생한 오류에는 `boundaryVariant`가 없어도 직렬화되도록 optional로 둔다.

### 2단계: 공용 Error Boundary 변경

대상:

- `ErrorBoundary`
- `QueryErrorBoundary`
- `RouteErrorBoundary`
- 공용 overlay 래퍼

작업:

1. 필수 `name` 프로퍼티를 제거한다.
2. `variant`를 `ErrorBoundary`까지 전달한다.
3. `componentDidCatch`에서 `path + variant + componentStack`을 기록한다.
4. 사용하지 않는 `FallbackProps.boundary`를 제거한다.
5. 페이지·구획·오버레이별 fallback과 loading UI가 기존과 같은지 확인한다.

### 3단계: 호출부 마이그레이션

모든 `QueryErrorBoundary` 호출부에서 `name`을 제거한다.

```bash
rg -n '<QueryErrorBoundary|name=' apps packages
```

기계적으로 제거한 뒤 다음을 별도로 확인한다.

- 중첩된 page·section 경계
- 드로어 내부의 탭 경계
- `onError`로 URL을 되돌리는 상세 오버레이
- `overlay.openAsync`를 사용하는 호출부
- 기본 `variant`에 의존하는 페이지 경계

`name`을 없애면서 경계 자체를 합치거나 위치를 옮기지 않는다. 이번 변경에서는 로깅 메타데이터만 자동화하고 복구 단위는 유지한다.

### 4단계: 테스트 변경

기존 `QueryErrorBoundary` 테스트의 `name`을 제거하고 로그 단언을 변경한다.

필수 테스트:

1. **자동 컨텍스트 수집**
   - 로그에 `path`가 `pathname + search`로 들어간다.
   - 로그에 `boundaryVariant`가 들어간다.
   - `component`가 `componentStack`의 첫 컴포넌트와 일치한다.
   - `componentStack` 원문이 보존된다.

2. **최소 실패 범위**
   - section이 실패해도 형제 section은 남는다.
   - 안쪽 section이 실패해도 바깥 page 경계는 fallback으로 바뀌지 않는다.
   - 탭 내부가 실패해도 탭 목록과 형제 탭은 남는다.

3. **경로 변경 복구**
   - pathname이 바뀌면 기존 폴백이 초기화된다.
   - search만 바뀌어도 상세 드로어의 폴백이 초기화된다.
   - 중첩 바운더리의 mount·unmount 이후에도 history 구독이 유지된다.

4. **오버레이 복구**
   - 실패한 overlay가 자리를 차지하는 폴백을 남기지 않는다.
   - `onError`가 한 번만 실행된다.
   - URL과 오버레이 상태가 복구돼 같은 항목을 다시 열 수 있다.
   - `openAsync` Promise가 `undefined`로 종료된다.

5. **재시도**
   - section의 다시 시도는 해당 section만 다시 렌더링한다.
   - React Query 오류 상태가 reset된다.

### 5단계: 문서와 규칙 갱신

대상:

- 에러 처리 정책
- React Query 사용 지침
- Error Boundary 관련 블로그 글

작업:

1. `name` 필수 예시를 모두 제거한다.
2. 로그 식별 기준을 `path + variant + componentStack`으로 명시한다.
3. “에러 경계를 최소화한다”를 “경계의 개수를 최소화한다”로 오해하지 않도록 설명한다.
4. 독립적으로 복구할 수 있는 최소 UI 구획에 경계를 둔다는 기준을 남긴다.

---

## 6. 검증 명령

저장소의 실제 스크립트 이름을 확인한 뒤 영향 범위가 작은 명령부터 실행한다.

```bash
# 공용 오류 유틸 단위 테스트
pnpm --filter <shared-utils-package> test -- error

# Error Boundary 컴포넌트 테스트
pnpm --filter <shared-ui-package> test -- QueryErrorBoundary overlay

# 공용 패키지 타입 검사
pnpm --filter <shared-utils-package> type-check
pnpm --filter <shared-ui-package> type-check

# 호출부가 있는 앱 타입 검사
pnpm --filter <cms-app> type-check
pnpm --filter <hospital-admin-app> type-check
pnpm --filter <global-cms-app> type-check

# 전체 정적 검증
pnpm lint
pnpm type-check
```

실제 package script와 다른 명령을 문서만 보고 새로 만들지 않는다. `package.json`과 Turborepo 파이프라인을 확인해 존재하는 명령으로 치환한다.

---

## 7. 완료 조건

- [ ] `QueryErrorBoundary`의 공개 API에서 `name`이 제거됐다.
- [ ] 저장소의 모든 호출부에서 수동 경계 이름이 제거됐다.
- [ ] 오류 로그에 `path`, `boundaryVariant`, `component`, `componentStack`이 자동으로 기록된다.
- [ ] `path`에 쿼리 문자열이 포함된다.
- [ ] 페이지·구획·오버레이의 기존 fallback과 재시도 동작이 유지된다.
- [ ] 한 구획의 실패가 형제 구획이나 공통 레이아웃으로 확산되지 않는다.
- [ ] 오버레이 실패 후 같은 오버레이를 다시 열 수 있다.
- [ ] `openAsync` 호출이 오류 이후에도 영원히 대기하지 않는다.
- [ ] 관련 단위·컴포넌트 테스트와 타입 검사가 통과한다.
- [ ] 에러 처리 정책과 예제에서 `name`이 제거됐다.
- [ ] 배포 후 기존 대비 새 오류 로그의 검색 가능성이 떨어지지 않았는지 확인했다.

---

## 8. 배포 후 확인

배포 후 CloudWatch에서 다음을 확인한다.

1. `boundaryVariant`로 page·section·overlay 오류를 구분할 수 있는가?
2. `path`만으로 오류가 발생한 화면과 상세 상태를 재현할 수 있는가?
3. `component`와 `componentStack`으로 최초 확인할 코드 범위를 찾을 수 있는가?
4. 동일한 화면에 같은 컴포넌트가 여러 번 등장해 로그를 구분하지 못하는 사례가 있는가?
5. 프로덕션 빌드의 minification과 source map 환경에서도 컴포넌트 위치를 찾을 수 있는가?

4번이나 5번의 실제 실패 사례가 확인되면 다음 단계로 빌드 타임 메타데이터 주입을 검토한다.

```ts
type GeneratedBoundarySource = {
  id: string;       // 상대 경로와 위치를 해시한 값
  file?: string;    // 공개 범위를 검토한 상대 경로
  line?: number;
};
```

이 메타데이터는 호출부가 작성하지 않고 컴파일러가 생성해야 한다. 다만 Next.js·Turbopack의 기본 빌드 경로를 변경하는 비용, 캐시 영향, source map으로 이미 해결 가능한지부터 측정한 뒤 도입한다.

---

## 9. 최종 원칙

`name`을 제거하는 목적은 프로퍼티 하나를 줄이는 데 있지 않다. 코드 구조에서 이미 알 수 있는 정보를 사람이 문자열로 다시 관리하지 않게 만드는 것이다.

Error Boundary 호출부는 **어떻게 복구할지**만 선언한다. 오류가 발생한 위치는 런타임이 알고 있는 URL과 React 컴포넌트 계층에서 가져온다.

```text
호출부가 결정할 것   → page / section / overlay
런타임이 기록할 것   → path / component / componentStack
후속 검토할 것       → source map으로 부족할 때만 build-time boundaryId
```

에러 경계를 최소화한다는 것은 바운더리 수를 무조건 줄이는 것이 아니다. 한 오류가 사용자에게 영향을 주는 범위를, 독립적으로 복구할 수 있는 가장 작은 UI 단위로 제한한다는 뜻이다.
