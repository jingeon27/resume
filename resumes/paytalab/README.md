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

[기존 HTML 미리보기](resume-paytalab-preview.html)와 이전에 만든 PDF는 이번 원문을 반영하지 않은 버전입니다. 제출용 PDF는 원문 검토 후 다시 생성해야 합니다.

저장소 루트에서 실행합니다.

```sh
node scripts/build-paytalab-preview.mjs
node scripts/build-paytalab-preview.mjs --pdf
```

PDF 생성은 기본적으로 macOS Google Chrome을 사용하며 다른 환경은 CHROME_BIN으로 지정합니다. 이번 작업에서는 HTML과 PDF를 재생성하지 않았습니다.
