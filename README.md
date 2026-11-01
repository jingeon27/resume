# 이력서와 포트폴리오

## 공통 문서

- [최신 공통 이력서](resumev7.md)
- [경력과 역량 중심 이력서 초안](resume-draft.md)
- [별도 제출용 경력기술서 초안](career-statement-draft.md)
- [이미지 포트폴리오 초안](portfolio-draft.md)
- [상세 이력서](resume.md)
- [일반 포트폴리오와 경력기술서](portfolio.md)
- [AI 활용 경험 포트폴리오](resumes/doers/portfolio-doers-ai-experience.md)
- [이전 경력기술서](경력기술서.md)
- [이전 포트폴리오](portfolio-v2.md)
- [성격상 장단점](성격상-장단점.md)
- [공통 컬처핏과 업무 사례](공통%20컬처핏%20-%20유니크한%20장점.md)
- [블로그 수정본](blog/revised/README.md)
- [개인 블로그](https://blog.bambyul.com/ko/blog)
- [이력서와 포트폴리오 작성 및 평가 스킬](.agents/skills/resume-evidence/SKILL.md)

## 회사별 이력서

[회사별 목록](resumes/README.md)에서 이력서를 찾을 수 있습니다. 회사별 초안과 HTML 미리보기도 같은 폴더에 둡니다.

공통 이력서와 예전 버전, 포트폴리오, 블로그, 면접 준비 문서는 루트와 기존 폴더에 그대로 있습니다.

## 당근 레슨/과외 이력서 미리보기

```sh
node scripts/build-lessons-preview.mjs
```

[초안](resumes/daangn/resume-daangn-lessons-draft.md)을 읽어 [HTML 미리보기](resumes/daangn/resume-daangn-lessons-preview.html)를 만듭니다. 인쇄용 CSS는 `templates/resume-print.css`에서 관리합니다.

## 당근 모임 이력서 미리보기

```sh
node scripts/build-moim-preview.mjs
```

[모임 초안2](resumes/daangn/resume-daangn-moim-draft2.md)를 읽어 [HTML 미리보기](resumes/daangn/resume-daangn-moim-preview.html)를 만듭니다. 본문은 보존하고 기술 목록을 지원동기 뒤로 옮겨 A4 페이지로 나눕니다. 공통 인쇄 스타일은 `templates/resume-print.css`, 모임 전용 스타일은 `templates/resume-moim-print.css`에서 관리합니다.

소개·지원동기·기술·경력 순으로 시작하는 5쪽 미리보기입니다. 사용자 경험·건강검진·SSR·타입 설계·운영 안정성 사례는 더 눈에 띄게 배치했습니다. HTML의 `PDF로 저장` 버튼을 누르고 A4·배율 100%·여백 없음으로 저장합니다. 브라우저 머리글과 바닥글은 끕니다. 초안2를 수정했다면 위 명령으로 HTML도 다시 생성합니다.
