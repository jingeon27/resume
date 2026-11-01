# 개인 블로그 포트폴리오 화면

2026년 11월 1일 공개 배포 중인 개인 블로그를 로그인 정보가 없는 Chromium에서 촬영했습니다. 실제 발행된 글이며 이미지의 문구와 픽셀을 편집하지 않았습니다.

- `01-blog-list-desktop.png`: 글 목록, 제목과 태그 통합 검색, 카테고리, 2열 카드. 1440×1080.
- `02-blog-article-mobile.png`: 목록에서 실제 글 링크를 따라 연 모바일 상세의 제목, 발행 정보와 접이식 목차. 430×932.
- `manifest.json`: 촬영 URL과 페이지 제목, 화면 크기, UTC 촬영 시각과 SHA-256.

저장소 루트에서 Node.js 20 이상과 Playwright를 사용합니다.

```sh
node scripts/capture-blog-portfolio.mjs
```

Playwright가 이 저장소에 없으면 같은 작업 공간의 `side-project` 설치를 사용합니다. 각 실행은 별도 브라우저 컨텍스트를 만들고 종료합니다.
