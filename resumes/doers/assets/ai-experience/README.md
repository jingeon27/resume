# AI 활용 포트폴리오 그림

[포트폴리오 본문](../../portfolio-doers-ai-experience.md)에 넣은 실제 UI 캡처와 설명 그림입니다. PNG는 본문 삽입용, 같은 이름의 SVG는 확대와 편집용입니다.

사진 커뮤니티 이름은 피식입니다. 웹의 메타데이터와 로고, 공유 문구, 모바일 표시 이름이 반영된 origin/develop의 실제 화면으로 캡처와 설명 그림을 갱신했습니다. 내부 패키지명과 도메인 등 기술 식별자는 표시 이름과 구분합니다.

| 파일 | 내용 |
| --- | --- |
| 01-service-screens | 최신 Game Mate 친추 판매와 코칭, 피식 소개 |
| 02-product-direction | 기간제 사진 대회에서 상시 그룹으로 바꾼 방향 |
| 03-service-architecture | 서비스별 API와 캐시, 공용 패키지 |
| 04-cache-invalidation | DB 변경과 태그 무효화, 전달 실패 복구 |
| 05-upload-concurrency | API 파일 수신에서 S3 직접 업로드로 바꾼 흐름 |
| 06-test-strategy | UI와 API, DB, 브라우저 흐름의 테스트 범위 |
| 07-deployment | EC2와 PostgreSQL, 별도 EBS와 S3 백업 구성 |
| 08-monitoring-mcp | 오류와 Web Vitals, 행동 이벤트 수집과 MCP 확인 |
| 09-product-interactions | 최신 피식 그룹 게시물과 Game Mate 프로필 수정 |
| 10-game-marketplace | 최신 Game Mate 친추 판매와 코칭 모집 |
| 11-photo-group-flow | 최신 피식 그룹 생성과 탐색 |
| 12-photo-introduction | 피식 이름과 새 로고가 보이는 실제 소개 페이지 |

## 최신 실제 화면

2026년 10월 31일 Playwright Chromium으로 두 서비스의 origin/develop 코드를 다시 촬영했습니다. 제품 웹의 production build와 실제 API, 테스트 전용 PostgreSQL의 격리 스키마를 사용했습니다. 피식의 게시물 이미지는 실제 S3에 업로드해 조회했습니다.

촬영 데이터는 테스트용입니다. Game Mate의 모집 글과 가격, 계정은 제품의 seed와 테스트 로그인으로 준비했습니다. 피식의 그룹과 게시물은 테스트 전용 사용자와 제품 API로 만들었습니다. 실제 이용자, 거래나 매칭 성과를 나타내지 않습니다. 개인 계정과 개발 DB의 데이터는 수정하지 않았습니다.

| 원본 | 화면 |
| --- | --- |
| captures/game-feed.png | Game Mate 모바일 홈 |
| captures/game-sales.png | Game Mate 모바일 친추 판매 |
| captures/game-coaching.png | Game Mate 모바일 코칭 모집 |
| captures/game-sales-desktop.png | Game Mate 데스크톱 친추 판매 |
| captures/game-login.png | Game Mate 로그인 |
| captures/game-profile-edit.png | Game Mate 프로필 수정 |
| captures/photo-explore.png | 피식 공개 그룹 탐색 |
| captures/photo-group.png | 피식 그룹과 게시물 |
| captures/photo-group-create.png | 피식 그룹 생성 페이지 |
| captures/photo-about.png | 피식 모바일 소개와 새 로고 |
| captures/photo-about-desktop.png | 피식 데스크톱 소개와 새 로고 |

원본은 captures 폴더에 픽셀 수정 없이 보관합니다. 설명 그림에서는 원본의 비율을 유지해 배치합니다. 실제 촬영 시각, 크기와 SHA-256, 기준 커밋과 원격 ref, 촬영 시나리오의 해시는 [manifest.json](captures/manifest.json)에 기록했습니다.

촬영 기준은 side-project의 `origin/develop`, 커밋 `0deb9209f7f8a7b8a4c7f3e2e446634c8637d41d`입니다. 별도 checkout에서 추적 소스의 변경 없이 실행했습니다. 이름과 로고 변경(`86fab1db`)과 Game Mate의 프로필 수정 전용 페이지(`ce7f4fc4`)가 포함되어 있습니다. 촬영용 시나리오와 빌드 결과, 테스트 데이터만 Git에서 제외되는 경로에 추가했습니다. 사용자가 작업하던 checkout의 미커밋 변경은 촬영 소스에 섞지 않았습니다.

두 촬영 시나리오는 각각 최종 1건씩 통과했습니다. 화면 진입과 입력, 모바일의 가로 넘침, pageerror와 hydration 오류를 확인했습니다. 피식은 소개 화면의 이름과 로고도 확인했습니다. 촬영에는 기존 개발 DB 대신 피식 55434와 Game Mate 55444의 전용 PostgreSQL을 사용했습니다. 촬영 도구는 자신이 만든 스키마와 S3 객체만 정리합니다. 작업에서 시작한 테스트 서버와 두 PostgreSQL도 촬영 후 종료했습니다.

예전 game-signup.png와 game-home.png, photo-login.png는 과거 캡처로 보관하며 최신 그림에서는 사용하지 않습니다. 이전 캡처의 출처와 해시는 Git 이력에 남아 있습니다.

## 구성도와 코드 링크

기술 구성도와 고정 코드 링크는 본문에서 설명하는 작업 시점의 코드에 맞춥니다. 캐시 전달 실패 후 재시도와 revision 확인, S3 직접 업로드의 두 서비스별 검사 범위, 같은 EC2의 DB와 EBS 분리, S3 덤프를 구분합니다. UI 캡처가 최신이라고 해서 Terraform 실제 적용이나 운영 검증까지 완료된 것은 아닙니다.

포트폴리오는 분량을 줄이는 것보다 제품 의도와 판단, 구현과 검증 내용을 상세하게 보여 주는 것을 우선합니다. 실무에서 수행한 QA 더블 체크 요청과 개인 프로젝트의 검증 범위도 구분합니다.

## 설명 그림 다시 생성하기

저장소 루트에서 실행합니다.

```sh
node scripts/build-doers-portfolio-figures.mjs
```

sharp는 이웃 side-project 저장소의 설치 모듈을 사용하며 SHARP_MODULE로 다른 경로를 지정할 수 있습니다. 생성기는 manifest의 해시를 확인하고 원본 비율대로 화면을 배치합니다. 캡처를 다시 촬영하면 원본과 manifest를 함께 갱신합니다. SVG에도 캡처가 포함되어 있어 단독으로 열 수 있습니다.

검토용 모음은 Git에서 제외되는 `.pdfbuild/doers-figures-contact.png`에 만듭니다. 이 명령은 서비스와 DB를 실행하거나 변경하지 않습니다.
