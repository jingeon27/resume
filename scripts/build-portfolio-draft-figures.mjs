import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'assets/portfolio-draft');
mkdirSync(output, { recursive: true });
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require(process.env.SHARP_MODULE || 'sharp');
} catch {
  sharp = createRequire(join(root, '../side-project/package.json'))('sharp');
}

// 실제 화면은 수정하지 않는다. 아래 그림은 본문의 설계와 작업 순서를 설명하는 구성도다.
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
const text = (x, y, s, size = 25, bold = false, color = '#172b4d') => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${bold ? 700 : 400}" fill="${color}">${escape(s)}</text>`;
const card = (x, y, w, h, title, rows, color = '#eef4ff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="20" fill="${color}" stroke="#dbe4f0"/>` + text(x + 26, y + 45, title, 29, true) + rows.map((s, i) => text(x + 26, y + 93 + i * 36, s, 24, false, '#52647a')).join('');
const arrow = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} H${x2} V${y2}" stroke="#8494a7" stroke-width="3" fill="none" marker-end="url(#arrow)"/>`;
const frame = (title, subtitle, height, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="${height}" viewBox="0 0 1440 ${height}">
<title>${escape(title)}</title><desc>${escape(subtitle)}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#8494a7"/></marker></defs>
<style>text{font-family:'Apple SD Gothic Neo','Noto Sans KR',sans-serif}</style>
<rect width="1440" height="${height}" fill="#fff"/>
${text(72, 78, title, 40, true)}${text(72, 124, subtitle, 24, false, '#52647a')}
${body}
<path d="M72 ${height - 66} H1368" stroke="#dbe4f0"/>
${text(72, height - 31, '김진건 | 포트폴리오 | 설명용 구성도', 19, false, '#52647a')}
</svg>`;

const figures = [
  ['01-architecture-boundaries', frame('프론트엔드 구조를 나눈 기준', '세이프닥: 코드의 위치와 값의 책임을 구분하고 lint와 타입 검사로 유지', 940,
    card(80, 185, 400, 220, 'pages', ['화면 조합', '페이지별 배치와 이동']) +
    card(520, 185, 400, 220, 'features', ['서버 도메인', '계약과 조회, 갱신']) +
    card(960, 185, 400, 220, 'shared', ['도메인과 무관한 UI', '공통 필드와 기반 코드']) +
    arrow(486, 288, 510, 288) + arrow(926, 288, 950, 288) +
    text(80, 475, '폼과 서버 상태는 값의 출처에 따라 분리', 29, true) +
    card(80, 515, 400, 220, 'TanStack Query', ['서버 목록', '조회와 캐시'], '#f4f6f8') +
    card(520, 515, 400, 220, 'React Hook Form', ['작성 중인 입력', '선택과 수정'], '#f4f6f8') +
    card(960, 515, 400, 220, 'Zod', ['제출 조건', 'URL과 요청의 공통 계약'], '#f4f6f8') +
    text(80, 808, '화면 간 직접 참조와 순환 의존성을 정리하고, 필드 경로와 값은 타입으로 검사합니다.', 26))],
  ['02-ai-workflow', frame('AI 구현과 사람의 검토를 연결한 순서', '세이프닥 실무 workflow: 에이전트가 완성본을 제출하면 검토하고 반려와 수정을 반복', 940,
    card(80, 190, 400, 190, '티켓과 plan 검토', ['요구사항과 빠진 동작', '검증 조건 확인']) +
    card(520, 190, 400, 190, '테스트 작성', ['새 기능의 기대 동작', '운영과 QA 오류 재현']) +
    card(960, 190, 400, 190, '에이전트 구현과 리뷰', ['제품 코드와 테스트', '완성본 제출']) +
    arrow(486, 278, 510, 278) + arrow(926, 278, 950, 278) +
    `<path d="M1160 390 V430 H280 V465" stroke="#8494a7" stroke-width="3" fill="none" marker-end="url(#arrow)"/>` +
    card(80, 480, 400, 190, '변경분 검사', ['테스트, lint, typecheck', '요구 조건과 결과 비교'], '#f4f6f8') +
    card(520, 480, 400, 190, '직접 리뷰와 화면 확인', ['제품 코드와 테스트 읽기', '입력과 실패 동작 확인'], '#f4f6f8') +
    card(960, 480, 400, 190, '전체 CI와 QA 요청', ['테스트, knip, lint', '마지막 QA 더블 체크'], '#f4f6f8') +
    arrow(486, 568, 510, 568) + arrow(926, 568, 950, 568) +
    text(80, 755, '새 테스트 패턴은 제품 코드를 일부러 깨뜨려 실제로 실패하는지 확인합니다.', 26) +
    text(80, 802, '반복되는 기준은 skills와 lint rule에 남깁니다. QA 요청은 실무에서 수행합니다.', 25))],
  ['03-electron-collection', frame('지원자 데이터 수집의 공통 단계와 사이트별 차이', '왓타임: Electron 수집 앱의 초기 구조 설계와 잡플래닛, 게임잡 연동', 760,
    [80, 414, 748, 1082].map((x, i) => card(x, 190, 280, 155, ['로그인', '수집', '중복 확인', '업로드'][i], [])).join('') +
    [0, 1, 2].map((i) => arrow(370 + i * 334, 267, 404 + i * 334, 267)).join('') +
    card(80, 405, 600, 195, '공통 실행 단계', ['단계의 순서와 실행을 공통화', '모듈 경계와 생성자 주입 참고'], '#f4f6f8') +
    card(760, 405, 600, 195, '사이트별 adapter', ['잡플래닛과 게임잡 연동', '사이트별 화면과 수집 방식 분리'], '#f4f6f8') +
    text(80, 656, 'NestJS는 CTO 피드백으로 제거하고, 공통 단계와 adapter로 나눈 구조는 유지했습니다.', 25))],
];

const previews = [];
for (const [name, svg] of figures) {
  writeFileSync(join(output, `${name}.svg`), svg);
  const path = join(output, `${name}.png`);
  await sharp(Buffer.from(svg), { density: 144 }).png().toFile(path);
  const preview = await sharp(path).resize({ width: 720 }).png().toBuffer();
  previews.push({ input: preview, top: previews.length * 490, left: 0 });
  console.log(`${name}.png`);
}
mkdirSync(join(root, '.pdfbuild'), { recursive: true });
await sharp({ create: { width: 720, height: 1470, channels: 4, background: '#f4f6f8' } }).composite(previews).png().toFile(join(root, '.pdfbuild/portfolio-draft-figures-contact.png'));
