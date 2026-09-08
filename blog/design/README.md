# jingeon27 기술 블로그 디자인 가이드

## 방향

블로그를 포트폴리오 카드 모음처럼 꾸미기보다, 운영에서 발견한 문제를 재현하고 기준으로 남기는 엔지니어링 저널로 보이게 한다.

- 분위기: 장식을 줄이고 글의 흐름에 집중하는 에디토리얼
- 배경·본문: white `#ffffff`
- 글자: graphite `#242a32`, 보조 텍스트 `#626c79`
- 강조: 링크와 카테고리에 blue `#2859a3`
- 보조: 주의 상자 `#a64b34`, 판단 상자 `#526c50`
- 한글: Pretendard
- 코드: JetBrains Mono
- 장식: 그림자보다 얇은 테두리와 여백

## 2026년 9월 읽기 화면 개편

- 상세 페이지에서는 사이드바를 숨기고 820px 컨테이너 안에 본문을 중앙 정렬한다. 좌우 여백을 뺀 실제 읽기 폭은 764px이다.
- 제목은 고정 높이 대신 내용만큼 늘어난다. 긴 제목이 잘리거나 본문과 겹치지 않도록 한다.
- 본문은 데스크톱 17px, 모바일 16px로 두고 문단과 소제목 사이의 여백으로 구조를 구분한다.
- 코드 블록은 밝은 회청색 배경과 어두운 텍스트를 사용한다. highlight.js 토큰 색도 같은 배경에 맞추고, 긴 코드는 블록 안에서 가로로 스크롤한다.
- 인용문은 장식 이미지를 없애고 얇은 왼쪽 선과 왼쪽 정렬을 사용한다. 인용문 안의 여러 문단 사이 간격은 유지한다.
- 홈 목록은 둥근 카드와 떠오르는 효과 대신 구분선과 제목의 색 변화로 정리한다.
- 표와 이미지는 본문 폭 안에 둔다. 요약·판단·주의 상자는 낮은 채도의 색으로 구분한다.
- 키보드 포커스를 표시하고, 동작 줄이기 설정에서는 부드러운 스크롤을 끈다.

공개 스킨은 자동으로 바뀌지 않는다. 아래 적용 순서에 따라 전체 CSS를 교체해야 한다. 새 스타일은 파일 하단의 `Reading edition` 영역에서 관리하며, 원본 뒤에 같은 영역을 반복해서 덧붙이지 않는다.

`preview.html`을 브라우저에서 열면 본문·인용·코드·표·안내 상자를 한 번에 확인할 수 있다. 티스토리 서버 없이 열리는 샘플이며, 실제 글과 홈 화면은 공개 페이지에 CSS를 임시로 대체 적용해 별도로 확인한다.

## 생성된 이미지

티스토리에 올릴 때는 용량을 줄인 JPG를 사용한다. PNG는 원본 보관용이다.

| 용도 | 업로드 파일 | 연결할 글 |
| --- | --- | --- |
| 블로그 홈 Hero | `../assets/covers/blog-hero.jpg` | 홈 소개 영역 |
| Compound Engineering | `../assets/covers/compound-engineering.jpg` | `/31` |
| Sentry Observability | `../assets/covers/sentry-observability.jpg` | `/30` |
| Test Suite Rebuild | `../assets/covers/test-suite-rebuild.jpg` | `/25` |
| Next Router Cache | `../assets/covers/next-router-cache.jpg` | Next.js 프로덕션 이슈 글 |

커버 안에는 글자를 넣지 않는다. 티스토리 제목과 OG 메타데이터가 텍스트 역할을 맡는다. 이렇게 해야 모바일 크롭, 다크모드, 제목 변경에도 이미지를 다시 만들 필요가 없다.

## 글 한 편의 구성

1. 커버 이미지
2. 두세 문장의 문제 요약
3. `이 글에서 다루는 것` 세 항목
4. 실제 증상과 재현 조건
5. 원인과 검토한 선택지
6. 결정한 방법과 코드
7. 검증 결과
8. 한계와 아직 측정하지 못한 것
9. 다음 작업에 남긴 기준
10. 참고 링크

글의 첫 화면에는 목차보다 문제와 결과가 먼저 보여야 한다. 독자가 제목을 보고 들어왔을 때 20초 안에 왜 읽어야 하는지 판단할 수 있어야 한다.

## 이미지 사용 규칙

- 커버: 모든 대표 글에 1장
- 본문 다이어그램: 상태나 흐름이 세 단계 이상일 때만 사용
- 스크린샷: 실제 증상이나 측정 결과를 증명할 때 사용
- 장식 이미지: 본문 중간에는 넣지 않는다
- 이미지 간격: 앞뒤 48px 이상
- 캡션: 무엇을 봐야 하는지 한 문장으로 작성
- Alt: `이미지`가 아니라 관찰 가능한 내용을 적는다

예시:

```html
<figure class="figure-wide">
  <img src="IMAGE_URL" alt="클라이언트, 서버, Edge를 지나며 반복되는 권한 검증 요청의 trace" />
  <figcaption>Sentry trace에서 클릭 전 prefetch가 권한 검증을 반복하던 구간</figcaption>
</figure>
```

## 글을 예쁘게 만드는 요소

### 요약 상자

```html
<div class="note note-summary">
  <strong>이 글의 결론</strong>
  <p>문제를 고친 방법보다, 다음 작업이 같은 실패를 반복하지 않게 만든 기준을 다룹니다.</p>
</div>
```

### 판단 상자

```html
<div class="note note-decision">
  <strong>왜 이 방법을 골랐나</strong>
  <p>서버가 searchParams를 소비하지 않으므로 같은 경로의 URL 상태는 History API가 소유하는 편이 단순했습니다.</p>
</div>
```

### 한계 상자

```html
<div class="note note-limit">
  <strong>측정하지 못한 것</strong>
  <p>RSC 요청 제거가 네트워크 비용을 얼마나 줄였는지는 별도로 계측하지 않았습니다.</p>
</div>
```

## 적용 순서

`tistory-overrides.css`에는 Odyssey 원본과 사용자 정의 스타일이 모두 들어 있다. 기존 CSS의 마지막에 덧붙이지 않는다.

1. 티스토리 `꾸미기 → 스킨 편집 → HTML 편집 → CSS`를 연다.
   적용 전에 현재 CSS 전체를 별도 파일로 백업한다. 문제가 생기면 백업한 CSS 전체를 복원한다.
2. CSS 내용을 전체 선택한 뒤 `tistory-overrides.css`의 전체 내용으로 교체한다.
3. 적용하고 `/28`, `/31`을 데스크톱과 모바일에서 새로고침한다.
4. 블로그 이름과 설명을 변경한다.
5. 대표 글 네 편에 JPG 커버를 업로드하고 대표 이미지로 지정한다.
6. 카테고리를 Product Engineering, React & Next.js, Architecture, Testing & Observability, AI Workflow로 정리한다.
7. 대표 글부터 `article-template.md` 구조로 문단을 정리한다.
8. 홈 Hero와 Featured 영역은 스킨 HTML에 별도로 추가한다.

## 생성 프롬프트 요약

모든 이미지는 built-in image generation으로 만들었다. 커버 이미지는 warm ivory 종이 질감과 graphite·cobalt·coral·sage 팔레트를 사용하지만, 블로그 UI와 본문 배경은 흰색으로 둔다. 커버는 matte paper-cut과 isometric technical geometry를 혼합했으며 사람, 글자, 로고, 브랜드 마크, 워터마크, 네온·해커 이미지는 제외했다.

- Hero: 관측한 문제를 세 시스템 계층에서 추적하고 테스트·규칙·도구로 정리하는 워크스테이션
- Compound Engineering: 흩어진 작업이 계획·테스트·리뷰·규칙 게이트를 지나 재사용 가능한 시스템이 되는 조립 라인
- Sentry: client·server·Edge trace에서 반복 호출을 발견하고 개인정보를 거른 뒤 이슈로 정리하는 관측소
- Testing: 신뢰할 수 없는 성공 표시를 버리고 Unit·Integration·Contract·Browser 계층을 다시 만드는 실험실
- Next.js: 잘못된 캐시 슬롯의 반복 루프와 서버 내비게이션·클라이언트 Query·브라우저 History의 분리
