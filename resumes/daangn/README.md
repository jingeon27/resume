# 당근 Frontend 산업기능요원 캠페인 지원서

- [캠페인 이력서](resume-daangn-frontend-campaign.md)
- [경력과 역량별 구성의 캠페인 이력서 초안](resume-daangn-frontend-campaign-draft.md)
- [캠페인 이미지 포트폴리오 초안](portfolio-daangn-frontend-campaign-draft.md)
- [공식 공고](https://careers.daangn.com/jobs/role/8043875003/)
- [상세 포트폴리오와 경력기술서](../../portfolio.md)
- [AI 개발 workflow와 개인 프로젝트](../doers/portfolio-doers-ai-experience.md)

제출용 Draft는 이력서와 이미지 포트폴리오 두 문서로 정리했습니다. 별도 경력기술서 초안은 제거했습니다. 두 문서는 다른 문서나 코드의 참조 링크 없이 단독으로 읽히며, 포트폴리오의 이미지는 로컬 파일로 포함합니다. 이력서의 지원동기는 소개 다음, 경력 앞에 배치합니다.

포트폴리오는 프로그램 개발에서 건강검진 내재화까지의 흐름, SSR과 아키텍처, Sentry와 운영 오류, 공통 UI와 인터랙션, 피식의 GraphQL 판단 등 5개 사례에 집중했습니다. 실험과 협업은 짧게 요약했습니다. 이력서에는 3개 제품의 3주 출시, 오류 그룹의 수정 후 18일간 추가 발생 0건, 타입 검사 12.5초에서 1.9초 등 확인된 수치를 보강했습니다. PDF는 갱신하지 않습니다.

## 공고 확인 범위

2026년 10월 30일 공식 공고 원문을 확인했습니다. 실제 사용자가 있는 제품의 개발과 운영, React와 TypeScript, WebView, 사용자 흐름, AI 개발 workflow와 GraphQL 경험을 본문의 사례와 대조했습니다.

2026년 10월 31일 사용자가 강조한 필수 요건 여섯 가지와 SSR 및 WebView, 인터랙션과 모션 경험을 기준으로 사례 순서를 다시 정리했습니다. 직접 발견한 모바일 불편, 출시와 운영, 웹 플랫폼의 동작, 빠른 구현과 협업을 먼저 보여 줍니다.

## 이력서에서 보강한 경험

| 공고 요건 | 본문의 근거 |
| --- | --- |
| 실제 사용자가 있는 제품의 개발과 운영 | 가입 회원 약 15만 명과 주간 활성 사용자 약 1만 명, 건강검진 정식 오픈, Sentry 도입과 운영 오류 수정 |
| JavaScript와 TypeScript, 웹 플랫폼 이해와 기술 선택 | Next.js 소스와 production build를 통한 원인 확인, History API, 한글 조합 중 Enter 처리, 재귀 조건부 타입 |
| 사용자 흐름과 인터랙션 품질 | 리뷰의 선택과 확정 분리, 결제 복원, 검진 선택 동작 논의, 입력과 포커스를 유지하는 공통 UI |
| 문제 정의부터 출시와 운영까지 | 직접 찾은 리뷰 불편을 Jira로 공유하고 개선안 배포, 요청된 검진 선택 동작의 문제 제기와 대안 구현, 운영 오류 대응 |
| AI 활용과 빠른 프로토타입 검증 | 전체 workflow와 테스트 기준, 글로벌 사용자 서비스와 CMS의 3주 PoC, 개인 서비스 두 개와 블로그의 2주 구현 |
| A/B 테스트 환경과 제품 실험 참여 | Amplitude 기반 환경 구축, 이벤트 140개 이상 추가 및 수정, 로그인 진입과 전화상담 실험의 구현 및 측정, UTM 설정 확인 |
| 다양한 직군과 협업 | PO에게 문제 전달, 기획과 디자인의 개선안 구현, 개발팀장과 요구사항의 예외 논의, 백엔드와 API 계약 조율, 왓타임의 개발자와 디자이너 협업 |
| React SSR과 인앱 WebView | prefetch와 hydration, 서버 메타데이터와 JSON-LD, 공개 조회와 인증 쿠키 분리, 외부 링크와 웹 내부 뒤로 가기 구분 |
| Interaction과 Motion, UX 디테일 | Bottom Sheet와 모달의 열림 및 닫힘 전환, 키보드로 높이 조절, 입력 보존, 닫힌 뒤 포커스 복귀 테스트 |

지원동기는 큰 제품을 여러 팀과 함께 만들고 싶은 이유에, 실험 참여 경험과 AI로 구현이 빨라진 만큼 판단력과 통찰을 기르고 싶다는 사용자 설명을 연결했습니다. A/B 테스트 환경 구축과 제품 실험의 구현 및 측정 범위를 명시하고, 문제 정의와 출시 뒤 결과 해석은 앞으로 함께 맡고 싶은 역할로 적었습니다. 개인 프로젝트는 실제 공개 소스 `eaf692c52479da09a643c9d13f54be92a1444cd8`와 기존 포트폴리오를 대조했고, 공통 UI 링크는 해당 커밋에 고정했습니다. 두 서비스와 블로그의 2주 구현 기간은 사용자 설명을 반영했습니다.

개인 프로젝트의 인터랙션과 모션은 [Bottom Sheet 구현](https://github.com/jingeon27/side-project/blob/eaf692c52479da09a643c9d13f54be92a1444cd8/packages/design-system/src/ui/bottom-sheet/BottomSheet.tsx)과 [전환 CSS](https://github.com/jingeon27/side-project/blob/eaf692c52479da09a643c9d13f54be92a1444cd8/packages/design-system/src/ui/bottom-sheet/bottom-sheet.css), [키보드와 포커스 테스트](https://github.com/jingeon27/side-project/blob/eaf692c52479da09a643c9d13f54be92a1444cd8/packages/design-system/src/ui/bottom-sheet/BottomSheet.spec.tsx#L83)를 대조했습니다.

대표 경험의 담당 범위와 판단, 확인한 결과가 먼저 보이도록 이력서를 정리했습니다. 반복 설명과 세부 API 나열을 줄이고 상세 구현은 포트폴리오로 연결했습니다. 사용자 요청에 따라 PDF는 갱신하지 않았습니다.
