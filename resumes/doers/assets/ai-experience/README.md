# AI 활용 포트폴리오 그림

[포트폴리오 본문](../../portfolio-doers-ai-experience.md)에 넣은 그림입니다. PNG는 본문 삽입용, 같은 이름의 SVG는 확대와 재편집용입니다. 모두 흰 배경과 공통 색상, 글자 크기를 사용합니다.

| 파일 | 내용 |
| --- | --- |
| 01-service-screens | 실제 개발 화면 캡처 세 장 |
| 02-product-direction | 기간제 사진 대회에서 상시 그룹으로 바꾼 방향 |
| 03-service-architecture | 두 서비스의 API와 클라이언트 캐시, 공유 패키지 |
| 04-cache-invalidation | DB 변경과 태그 무효화, 전달 실패 복구 |
| 05-upload-concurrency | Game Mate의 직접 업로드와 프로세스별 처리 상한 |
| 06-test-strategy | 테스트 범위와 명세, 회귀 테스트, lint 검증 |
| 07-deployment | 공용 EC2와 외부 RDS, 서비스별 S3 배포 구성 |

## 화면 캡처

captures 폴더는 기존 개발 화면의 PNG를 수정 없이 복사한 원본입니다.

- game-home.png: side-project-bambyul의 game-final-mobile.png
- game-login.png: side-project-bambyul의 game-login-monogram.png
- photo-login.png: side-project-bambyul의 contest-monogram-mobile.png

세 원본은 2026년 10월 21일 저장된 파일입니다. 첫 화면의 초기 빈 상태와 소셜 로그인 준비 중 표시는 그대로 남겼습니다. 수정 전 화면을 새로 만들어 비교 이미지로 사용하지 않았습니다. 새 캡처를 시도했으나 사용할 수 있는 브라우저 연결이 없어 기존 캡처를 사용했습니다.

## 구성도의 기준

본문의 코드 링크와 같은 side-project 커밋 6d858497을 기준으로 했습니다. 캐시 전달 실패 후 재시도와 revision 확인, 파일 처리 상한은 실제 구현과 대조했습니다. 사진 서비스는 파일 내용을 읽지 않고 HEAD만 확인하므로 Game Mate의 4KB 검사와 구분합니다. 배포 그림은 Terraform 구성과 mock provider 테스트까지 준비한 상태를 설명하며 실제 AWS 적용 완료를 뜻하지 않습니다.

실무의 QA 더블 체크 요청은 그대로 유지하고, 사이드 프로젝트에 별도 QA 요청 단계가 있었다고 그리지 않았습니다.

## 다시 생성하기

저장소 루트에서 실행합니다.

```sh
node scripts/build-doers-portfolio-figures.mjs
```

sharp를 사용합니다. 현재 작업 환경에서는 이웃 side-project 저장소에 설치된 sharp를 읽으며, SHARP_MODULE 환경변수로 다른 모듈 경로를 지정할 수 있습니다. captures에 원본이 있으면 외부 worktree는 필요 없습니다. SVG에 캡처를 포함하므로 SVG 파일만 열어도 화면이 보입니다.

검토용 전체 모음은 Git에서 제외되는 .pdfbuild/doers-figures-contact.png에 생성합니다. 실제 서비스, DB와 실행 중인 개발 서버는 변경하지 않습니다.
