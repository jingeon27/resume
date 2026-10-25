// 두어스 포트폴리오의 설명 그림을 SVG와 PNG로 생성한다.
// 기존 화면 캡처는 원본을 그대로 보관하고 SVG 안에서 배치한다.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'resumes/doers/assets/ai-experience');
const captures = join(output, 'captures');
mkdirSync(captures, { recursive: true });

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require(process.env.SHARP_MODULE || 'sharp');
} catch {
  const sideRequire = createRequire(join(root, '../side-project/package.json'));
  sharp = sideRequire('sharp');
}

const captureManifest = JSON.parse(readFileSync(join(captures, 'manifest.json'), 'utf8'));
for (const capture of captureManifest.captures) {
  const path = join(captures, capture.file);
  if (!existsSync(path)) throw new Error(`화면 원본이 없습니다: ${capture.file}`);
  const hash = createHash('sha256').update(readFileSync(path)).digest('hex');
  if (hash !== capture.sha256) throw new Error(`화면 원본과 출처 기록이 다릅니다: ${capture.file}`);
}

const C = {
  ink: '#182230', muted: '#5e6b7c', line: '#dce3eb', bg: '#f5f7fa',
  orange: '#ee7624', orangeBg: '#fff2e6', blue: '#2563eb', blueBg: '#edf4ff',
  red: '#b84235', redBg: '#fff0ed', white: '#ffffff', green: '#186d5a', greenBg: '#edf8f3',
};
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
const text = (x, y, value, { size = 25, weight = 400, fill = C.ink, anchor = 'start' } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(value)}</text>`;
const lines = (x, y, values, options = {}) => values.map((value, i) => text(x, y + i * (options.leading || 37), value, options)).join('');
const rect = (x, y, w, h, { fill = C.white, stroke = C.line, radius = 20, dash } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
const arrow = (x1, y1, x2, y2, { color = C.muted, dash = false } = {}) =>
  `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="2.5"${dash ? ' stroke-dasharray="7 6"' : ''} marker-end="url(#arrow)"/>`;
const route = (d, { color = C.muted, dash = false } = {}) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5"${dash ? ' stroke-dasharray="7 6"' : ''} marker-end="url(#arrow)"/>`;
const card = (x, y, w, h, title, content, { fill = C.white, accent = C.ink, size = 24 } = {}) =>
  rect(x, y, w, h, { fill }) + text(x + 28, y + 45, title, { size: 28, weight: 700, fill: accent }) +
  lines(x + 28, y + 89, content, { size, fill: C.muted });
const frame = (title, subtitle, height, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="${height}" viewBox="0 0 1440 ${height}" role="img" aria-label="${esc(title)}">
  <title>${esc(title)}</title><desc>${esc(subtitle)}</desc>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7b8797"/></marker></defs>
  <style>text{font-family:'Apple SD Gothic Neo','Noto Sans CJK KR','Noto Sans KR',sans-serif}text{font-variant-numeric:tabular-nums}</style>
  <rect width="1440" height="${height}" fill="${C.bg}"/>
  ${rect(22, 22, 1396, height - 44, { radius: 28 })}
  ${text(76, 85, title, { size: 40, weight: 700 })}
  ${text(76, 127, subtitle, { size: 23, fill: C.muted })}
  ${body}
  <path d="M76 ${height - 67} H1364" stroke="${C.line}"/>
  ${text(76, height - 37, '김진건 | AI 활용 경험', { size: 18, fill: C.muted })}
</svg>`;
const image = (file, x, y, w, h) => `<image x="${x}" y="${y}" width="${w}" height="${h}" href="data:image/png;base64,${readFileSync(join(captures, file)).toString('base64')}"/>`;
const screenImage = (file, x, y, width) => {
  const capture = captureManifest.captures.find((entry) => entry.file === file);
  if (!capture) throw new Error(`화면 출처가 없습니다: ${file}`);
  return image(file, x, y, width, width * capture.height / capture.width);
};

const figures = [];
figures.push({
  name: '01-service-screens',
  svg: frame('현재 개발 중인 모바일 화면', 'Game Mate 피드와 회원가입, 사진 커뮤니티의 그룹 탐색', 1030,
    text(110, 182, 'Game Mate 홈', { size: 26, weight: 700 }) +
    text(570, 182, 'Game Mate 회원가입', { size: 26, weight: 700 }) +
    text(1030, 182, '사진 커뮤니티 탐색', { size: 26, weight: 700 }) +
    [94, 554, 1014].map((x) => rect(x, 198, 332, 720, { radius: 24 })).join('') +
    screenImage('game-feed.png', 110, 214, 300) +
    screenImage('game-signup.png', 570, 214, 300) +
    screenImage('photo-explore.png', 1030, 214, 300)),
});

figures.push({
  name: '02-product-direction',
  svg: frame('사진 대회에서 상시 그룹으로', '그룹의 수명과 게시물 작성을 대회 마감에서 분리했습니다', 650,
    card(80, 190, 550, 278, '처음 구상한 사진 대회', ['정해진 접수와 투표 기간', '대회에 사진을 제출', '투표가 끝나면 결과 확인']) +
    card(810, 190, 550, 278, '변경한 그룹 커뮤니티', ['기간 없이 사진과 동영상 게시', '가입 그룹의 글을 홈에서 모아 보기', '공개 탐색과 비공개 가입 승인'], { fill: C.orangeBg, accent: C.orange }) +
    arrow(654, 326, 786, 326) + text(720, 298, '방향 변경', { anchor: 'middle', size: 22, fill: C.muted }) +
    rect(80, 508, 1280, 66, { fill: C.blueBg, stroke: 'none', radius: 14 }) +
    text(110, 551, '대회는 그룹 안에서 선택해 참여하는 기능으로 유지하고, 이전 사진과 링크는 보존했습니다.', { size: 25 })),
});

function serviceColumn(x, title, protocol, rows) {
  return rect(x, 185, 602, 360) + text(x + 28, 229, title, { size: 30, weight: 700 }) +
    text(x + 572, 229, protocol, { size: 22, fill: C.muted, anchor: 'end' }) +
    rows.map((row, i) => rect(x + 28, 252 + i * 92, 546, 68, { fill: i === 0 ? C.orangeBg : C.bg, stroke: 'none', radius: 12 }) +
      text(x + 301, 295 + i * 92, row, { anchor: 'middle', size: 26, weight: i === 0 ? 600 : 400 }) +
      (i < rows.length - 1 ? arrow(x + 301, 323 + i * 92, x + 301, 340 + i * 92) : '')).join('');
}
figures.push({
  name: '03-service-architecture',
  svg: frame('서로 다른 API와 캐시를 유지한 구조', '서비스는 분리하고, 함께 쓰는 UI와 코드 검사 기준만 공용 패키지로 옮겼습니다', 760,
    serviceColumn(80, '사진 커뮤니티', 'GraphQL', ['Next.js + Apollo Client', 'NestJS + GraphQL', 'Prisma + PostgreSQL']) +
    serviceColumn(758, 'Game Mate', 'REST', ['Next.js + TanStack Query', 'NestJS + REST + Orval', 'Prisma + PostgreSQL']) +
    text(108, 566, '별도 앱: Expo WebView', { size: 21, fill: C.muted }) +
    text(786, 566, '별도 앱: Expo WebView, React/Vite 관리자', { size: 21, fill: C.muted }) +
    rect(80, 580, 1280, 90, { fill: C.blueBg, stroke: 'none', radius: 16 }) +
    text(108, 619, '공용 패키지', { size: 25, weight: 700, fill: C.blue }) +
    text(322, 619, 'design-system', { size: 26, weight: 600 }) + text(795, 619, 'eslint-config', { size: 26, weight: 600 }) +
    text(322, 651, 'shadcn/ui, Base UI, 디자인 토큰', { size: 22, fill: C.muted }) +
    text(795, 651, 'FSD 경계, 공개 API, 상태 중복 검사', { size: 22, fill: C.muted })),
});

figures.push({
  name: '04-cache-invalidation',
  svg: frame('DB 변경과 공개 캐시 갱신을 연결한 방식', 'Game Mate의 공개 게시글 캐시와 무효화 실패 복구', 865,
    card(80, 190, 820, 150, 'NestJS에서 하나의 트랜잭션으로 저장', ['제품 데이터 변경 + 무효화할 tag + revision'], { fill: C.blueBg, accent: C.blue, size: 25 }) +
    arrow(490, 349, 490, 377) + text(515, 371, '커밋 후 전달', { size: 22, fill: C.muted }) +
    card(80, 390, 820, 115, 'Next.js Route Handler', ['허용된 태그와 요청을 확인해 캐시 만료 호출'], { size: 25 }) +
    arrow(490, 514, 490, 542) +
    card(80, 555, 820, 115, 'revalidateTag(tag, { expire: 0 })', ['공개 서버 캐시를 만료하고 다음 조회에 새 데이터 사용'], { size: 25 }) +
    card(980, 190, 380, 150, 'DB의 대기 기록', ['tag별 최신 revision', '커밋 실패 시 함께 롤백'], { size: 23 }) +
    arrow(909, 264, 971, 264) +
    card(980, 400, 380, 270, '콜백 전달이 실패하면', ['DB 기록을 남겨 둠', '5초 후 다시 전달', '앱 재시작 후에도 재시도', '제품 쓰기는 성공으로 응답'], { fill: C.orangeBg, accent: C.orange, size: 23 }) +
    route('M909 448 H948 V512 H971', { dash: true }) +
    rect(80, 715, 1280, 63, { fill: C.bg, stroke: 'none', radius: 14 }) +
    text(110, 756, '성공 응답을 받은 tag와 revision만 지워, 늦게 끝난 이전 요청이 새 기록을 지우지 않게 했습니다.', { size: 24 })),
});

figures.push({
  name: '05-upload-concurrency',
  svg: frame('파일은 S3로, 확정 처리는 API로', '서버의 동시 처리 상한을 두던 방식에서 모든 파일의 직접 업로드로 통일했습니다', 1010,
    [80, 550, 1020].map((x, i) => rect(x, 180, 340, 75, { fill: i === 2 ? C.orangeBg : C.blueBg, stroke: 'none', radius: 14 }) +
      text(x + 170, 229, ['브라우저', 'NestJS API', 'S3'][i], { anchor: 'middle', size: 28, weight: 700 })).join('') +
    [250, 720, 1190].map((x) => `<path d="M${x} 270 V720" stroke="${C.line}" stroke-width="2" stroke-dasharray="6 7"/>`).join('') +
    arrow(250, 315, 708, 315) + text(480, 297, '업로드 주소 발급 요청', { anchor: 'middle', size: 23 }) +
    arrow(720, 385, 262, 385) + text(480, 367, '크기와 형식이 정해진 presigned POST', { anchor: 'middle', size: 23 }) +
    arrow(250, 467, 1178, 467, { color: C.orange }) + text(720, 449, '파일 직접 전송, API 메모리에 전체 파일을 올리지 않음', { anchor: 'middle', size: 24, fill: C.orange, weight: 600 }) +
    arrow(250, 547, 708, 547) + text(480, 529, '전송 후 완료 확인 요청', { anchor: 'middle', size: 23 }) +
    arrow(720, 617, 1178, 617) + text(958, 594, 'HEAD, 앞 4KB 검사, ETag 조건부 복사', { anchor: 'middle', size: 22 }) +
    arrow(720, 687, 262, 687) + text(480, 669, '확정한 객체 ID 반환', { anchor: 'middle', size: 23 }) +
    rect(80, 764, 1280, 150, { fill: C.bg, stroke: 'none', radius: 16 }) +
    text(108, 808, '이전: API에서 파일 수신', { size: 26, weight: 700 }) +
    lines(108, 849, ['동시 3개 처리, 12개 대기', '서버가 받을 수 있는 양을 제한'], { size: 23, leading: 34, fill: C.muted }) +
    arrow(618, 841, 736, 841) +
    text(794, 808, '현재: 모든 파일을 S3로 직접 전송', { size: 26, weight: 700, fill: C.orange }) +
    lines(794, 849, ['프로필 사진도 같은 방식으로 통일', 'API는 필요한 부분만 검사한 뒤 확정'], { size: 23, leading: 34, fill: C.muted })),
});

figures.push({
  name: '06-test-strategy',
  svg: frame('확인하려는 동작에 따라 나눈 테스트', '테스트 설정은 각 앱이 소유하고, 루트에서는 실행만 위임합니다', 775,
    card(80, 190, 392, 280, 'Vitest', ['함수와 스키마, 실제 UI', '폼을 조작하고 제출값 확인', '실제 클라이언트 캐시 사용'], { fill: C.blueBg }) +
    card(524, 190, 392, 280, 'Supertest + PostgreSQL', ['API 요청과 실제 DB 결과', '권한과 동시성, 트랜잭션', '실행마다 격리한 스키마']) +
    card(968, 190, 392, 280, 'Playwright', ['작성과 댓글, 채팅, 이동', '모바일과 데스크톱의 동작', '외부 OS는 WebView fixture'], { fill: C.orangeBg }) +
    rect(80, 508, 1280, 75, { fill: C.bg, stroke: 'none', radius: 14 }) +
    text(110, 555, '*.spec  새 동작의 명세', { size: 27, weight: 600 }) +
    text(748, 555, '*.test  확인한 오류의 재발 방지', { size: 27, weight: 600 }) +
    card(80, 615, 1280, 73, 'lint rule도 RuleTester와 fixture로 검증', [], { accent: C.blue }) +
    text(930, 661, 'FSD, 공개 API, 상태 중복', { size: 23, fill: C.muted })),
});

figures.push({
  name: '07-deployment',
  svg: frame('두 서비스의 공통 배포 구성', 'EC2 한 대로 시작하고, DB와 파일은 외부 RDS와 S3로 분리하는 설계', 895,
    card(70, 210, 280, 372, 'GitHub Actions', ['테스트와 빌드', '검증한 이미지', 'digest로 고정', '배포 작업 직렬화', '실패 시 이전 이미지'], { size: 23 }) +
    arrow(360, 404, 409, 404) +
    rect(430, 180, 550, 465, { fill: C.bg, radius: 22 }) +
    text(458, 225, 'EC2 한 대', { size: 30, weight: 700 }) +
    rect(458, 254, 494, 74, { fill: C.blueBg, stroke: 'none', radius: 13 }) +
    text(705, 301, 'Caddy 80 / 443', { size: 27, weight: 600, anchor: 'middle' }) +
    arrow(584, 338, 584, 361) + arrow(826, 338, 826, 361) +
    card(458, 375, 234, 220, 'Game Mate', ['Next.js Web', 'NestJS API', '전용 네트워크'], { size: 23 }) +
    card(718, 375, 234, 220, '사진 커뮤니티', ['Next.js Web', 'NestJS API', '전용 네트워크'], { size: 23 }) +
    card(1060, 200, 310, 188, 'RDS PostgreSQL', ['한 인스턴스, 별도 DB', 'game_feedback', 'photo_contest'], { size: 22 }) +
    card(1060, 430, 310, 188, '비공개 S3', ['Game Mate 버킷', '사진 커뮤니티 버킷', '서비스별 접근 권한'], { size: 22 }) +
    route('M989 458 H1020 V294 H1051') + route('M989 540 H1051') +
    rect(80, 699, 1280, 106, { fill: C.orangeBg, stroke: 'none', radius: 15 }) +
    text(108, 742, '받아들인 비용', { size: 25, weight: 700, fill: C.orange }) +
    text(337, 742, 'EC2 장애 시 두 서비스가 함께 중단됩니다.', { size: 26, weight: 600 }) +
    text(337, 778, 'Terraform과 컨테이너 smoke 테스트를 준비했으며 실제 AWS 적용과 부하 검증은 별도입니다.', { size: 21, fill: C.muted })),
});

figures.push({
  name: '08-monitoring-mcp',
  svg: frame('수집한 정보를 MCP로 다시 확인', '오류와 사용자 행동을 각각 수집하고 에이전트가 서비스 안에서 다시 조회하게 했습니다', 880,
    card(80, 190, 360, 170, '오류와 로그', ['API와 브라우저', '개발용 확인 이벤트'], { fill: C.blueBg, size: 23 }) +
    card(520, 190, 360, 170, 'Sentry', ['service, layer, release', '수집 응답과 eventId'], { size: 23 }) +
    card(960, 190, 400, 170, 'Sentry MCP', ['eventId로 다시 조회', '발생 위치와 배포 버전 확인'], { fill: C.orangeBg, size: 23 }) +
    arrow(449, 277, 510, 277) + arrow(889, 277, 950, 277) +
    card(80, 420, 360, 170, '사용자 행동', ['페이지뷰와 성공 이벤트', '개발 프로젝트로 전송'], { fill: C.blueBg, size: 23 }) +
    card(520, 420, 360, 170, 'Amplitude', ['화면과 client 구분', '페이지뷰 집계'], { size: 23 }) +
    card(960, 420, 400, 170, 'Amplitude MCP', ['프로젝트와 이벤트 조회', '개발 프로젝트의 집계 확인'], { fill: C.orangeBg, size: 23 }) +
    arrow(449, 507, 510, 507) + arrow(889, 507, 950, 507) +
    rect(80, 654, 1280, 125, { fill: C.bg, stroke: 'none', radius: 15 }) +
    text(108, 699, '수신 확인 과정에서 수정한 부분', { size: 26, weight: 700 }) +
    text(108, 743, '페이지뷰 중복 집계와 자동 URL 수집을 확인하고, 수정 후 실제 전송 데이터를 다시 검사했습니다.', { size: 24, fill: C.muted })),
});

figures.push({
  name: '09-product-interactions',
  svg: frame('그룹에서 사진을 보고 프로필을 수정하는 화면', '사진 커뮤니티의 게시물과 인기, Game Mate의 Bottom Sheet 입력 흐름', 1320,
    text(230, 182, '사진 커뮤니티 그룹', { size: 26, weight: 700 }) +
    text(870, 182, 'Game Mate 프로필 수정', { size: 26, weight: 700 }) +
    rect(214, 198, 372, 1014, { radius: 24 }) +
    rect(854, 198, 372, 818, { radius: 24 }) +
    screenImage('photo-group.png', 230, 214, 340) +
    screenImage('game-profile-edit.png', 870, 214, 340) +
    lines(870, 1080, ['닉네임과 소개, 링크를', '한 시트에서 수정합니다.'], { size: 25, fill: C.muted })),
});

const previews = [];
for (const figure of figures) {
  const svgPath = join(output, `${figure.name}.svg`);
  const pngPath = join(output, `${figure.name}.png`);
  writeFileSync(svgPath, figure.svg);
  await sharp(Buffer.from(figure.svg), { density: 144 }).png().toFile(pngPath);
  const metadata = await sharp(pngPath).metadata();
  if (metadata.width !== 2880) throw new Error(`예상하지 않은 그림 너비: ${figure.name}`);
  const thumb = await sharp(pngPath).resize({ width: 660, height: 510, fit: 'contain', background: C.bg }).png().toBuffer();
  previews.push({ input: thumb, left: (previews.length % 2) * 680, top: Math.floor(previews.length / 2) * 530 });
  console.log(`${figure.name}.png ${metadata.width}x${metadata.height}`);
}
const qa = join(root, '.pdfbuild');
mkdirSync(qa, { recursive: true });
await sharp({ create: { width: 1360, height: Math.ceil(previews.length / 2) * 530, channels: 4, background: C.bg } })
  .composite(previews).png().toFile(join(qa, 'doers-figures-contact.png'));
