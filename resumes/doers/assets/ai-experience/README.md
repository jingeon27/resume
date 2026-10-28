# AI 활용 포트폴리오 그림

[포트폴리오 본문](../../portfolio-doers-ai-experience.md)에 넣은 그림입니다. PNG는 본문 삽입용, 같은 이름의 SVG는 확대와 재편집용입니다. 모두 흰 배경과 공통 색상, 글자 크기를 사용합니다.

| 파일 | 내용 |
| --- | --- |
| 01-service-screens | 최근 Game Mate 피드와 회원가입, 사진 커뮤니티 탐색 |
| 02-product-direction | 기간제 사진 대회에서 상시 그룹으로 바꾼 방향 |
| 03-service-architecture | 두 서비스의 API와 클라이언트 캐시, 공유 패키지 |
| 04-cache-invalidation | DB 변경과 태그 무효화, 전달 실패 복구 |
| 05-upload-concurrency | API 수신의 동시 처리 제한에서 S3 직접 업로드로 바꾼 흐름 |
| 06-test-strategy | 테스트 범위와 명세, 회귀 테스트, lint 검증 |
| 07-deployment | 같은 EC2의 두 서비스와 PostgreSQL, EBS 분리와 S3 백업 |
| 08-monitoring-mcp | 오류, Web Vitals, 사용자 행동 수집과 MCP 재조회 |
| 09-product-interactions | 사진 커뮤니티 그룹과 Game Mate 프로필 수정 |

## 화면 캡처

captures 폴더에는 실제 UI 검증에서 저장한 PNG 원본을 수정 없이 보관합니다. 포트폴리오 첫 화면에는 09번의 그룹 게시물과 프로필 수정 화면을 사용합니다. 01번 피드와 회원가입, 탐색 화면은 별도 링크로 제공합니다. 아래 다섯 원본은 2026년 10월 25~26일 저장된 실제 UI 캡처입니다. 화면에 보이는 글과 계정, 사진은 검증용 데이터입니다.

| 원본 | 저장 시점 한국 시간 | 대조한 코드 |
| --- | --- | --- |
| game-feed.png | 10월 25일 03:19 | fe32d081의 모바일 셸 검증 |
| game-signup.png | 10월 26일 01:01 | c17a3164의 가입 화면 개선 |
| photo-explore.png | 10월 26일 00:47 | 2aa865bf의 사진 서비스 탐색 |
| photo-group.png | 10월 26일 00:47 | 2aa865bf의 사진 서비스 그룹 |
| game-profile-edit.png | 10월 26일 01:18 | c17a3164의 프로필 수정 |

Game Mate의 가입과 프로필 수정은 캡처 당시 작업 브랜치의 화면이며 97923a8c에서 develop에 합쳐졌습니다. 사진 서비스의 두 화면은 develop과 소스가 같은지 대조했습니다. 원본 경로, 크기, 저장 시점과 SHA-256은 [manifest.json](captures/manifest.json)에 있습니다. 저장 시점은 원본 파일의 수정 시각이며 이미지 생성 후 코드가 바뀌었을 가능성은 대조한 커밋으로 구분합니다.

이번 작업에서는 브라우저를 연결할 수 없어 새로 촬영하지 않고 최근 검증 이미지를 사용했습니다. 원본을 자르거나 내용과 색을 바꾸지 않았고, 구성도 안에서 비율을 유지해 축소했습니다. 이전 game-home.png, game-login.png, photo-login.png는 과거 원본으로 보관하며 현재 본문에는 사용하지 않습니다.

## 구성도의 기준

2026년 10월 26일 side-project의 develop, 커밋 b758d2e8까지 확인해 본문과 구성도를 대조했습니다. 캐시 전달 실패 후 재시도와 revision 확인은 그대로 유지했습니다. 05번은 과거 동시 3개, 대기 12개 제한과 현재의 S3 직접 업로드를 구분하도록 바꿨습니다. 사진 서비스는 파일 내용을 읽지 않고 HEAD만 확인하므로 Game Mate의 4KB 검사와 구분합니다. 03번의 공용 lint 경로는 config/eslint로, 07번은 RDS 대신 같은 EC2의 PostgreSQL과 별도 EBS, S3 덤프로 변경한 최신 설계에 맞췄습니다.

08번은 두 서비스의 observability 문서에 남은 실제 수신과 MCP 재조회 과정을 설명합니다. 오류, 페이지뷰에 더해 Web Vitals 수집을 추가했고, 실제 Sentry의 LCP, CLS, INP span 수신과 브라우저에서 다섯 지표의 전송을 검사하는 범위를 구분했습니다. 개발용 이벤트와 테스트 상호작용의 확인이며 제품의 전환율이나 성능 개선 성과를 뜻하지 않습니다. 배포 그림은 Terraform과 컨테이너 smoke 테스트를 준비한 상태로, 실제 AWS 적용 완료를 뜻하지 않습니다.

실무의 QA 더블 체크 요청은 그대로 유지하고, 사이드 프로젝트에 별도 QA 요청 단계가 있었다고 그리지 않았습니다.

## 다시 생성하기

저장소 루트에서 실행합니다.

```sh
node scripts/build-doers-portfolio-figures.mjs
```

sharp를 사용합니다. 현재 작업 환경에서는 이웃 side-project 저장소에 설치된 sharp를 읽으며, SHARP_MODULE 환경변수로 다른 모듈 경로를 지정할 수 있습니다. 화면 원본은 저장소에 있으므로 삭제된 외부 worktree에 의존하지 않습니다. 생성기는 manifest의 해시를 검사하고 원본의 가로세로 비율로 배치합니다. 캡처를 교체할 때는 원본과 manifest를 함께 갱신합니다. SVG에 캡처를 포함하므로 SVG 파일만 열어도 화면이 보입니다.

검토용 전체 모음은 Git에서 제외되는 .pdfbuild/doers-figures-contact.png에 생성합니다. 실제 서비스, DB와 실행 중인 개발 서버는 변경하지 않습니다.
