# 페이타랩 Web Frontend 지원 서류

[최신 이력서 원문](resume-paytalab-frontend.md)

2026년 10월 24일 [공식 공고](https://recruit.passorder.co.kr/c/SKo7m1X2Wm)를 다시 확인해 원문을 다듬었습니다. 현역 산업기능요원 전직 가능은 사용자가 확인받았습니다.

## 이번에 앞에 둔 경험

- SEO와 이벤트 랜딩, WebView, 백오피스를 함께 개발하고 운영한 범위
- 에이전트 리뷰의 critical 자동 수정, skills와 lint rule 보강, 변경분 검사와 전체 CI를 나눈 AI 개발 workflow
- 직접 발견한 모바일 리뷰의 세 가지 선택 불편을 PO에게 공유하고 담당자의 개선안을 구현한 과정
- 건강검진의 동작과 예외를 개발팀장, 부팀장과 맞추고 세 제품에 반영한 경험
- 결제 복귀와 WebView 이동, 프로그램 등록과 검수, 정산과 관리자 업무
- Sentry 오류 대응, 테스트와 AI 개발 workflow, 기술 전환 비용

설계와 분석을 주도하지 않은 제품 실험은 구현과 사용자 행동 측정 역할로 적었습니다. 리뷰 개선은 Amplitude 도입 전의 직접 사용 경험입니다.

## 미리보기와 PDF

[HTML 미리보기](resume-paytalab-preview.html)는 2026년 10월 29일 최신 원문으로 다시 생성했습니다. PDF도 4쪽으로 생성해 페이지별 잘림과 줄바꿈을 확인했습니다. 원문 52개 블록과 외부 링크 14개를 보존합니다. PDF는 저장소의 `*.pdf` 제외 규칙에 따라 로컬 파일로만 관리합니다.

저장소 루트에서 실행합니다.

```sh
node scripts/build-paytalab-preview.mjs
node scripts/build-paytalab-preview.mjs --pdf
```

PDF 생성은 기본적으로 macOS Google Chrome을 사용하며 다른 환경은 CHROME_BIN으로 지정합니다. 원문이나 인쇄 스타일을 수정하면 HTML과 PDF를 함께 다시 생성하고 페이지 넘침을 확인합니다.
