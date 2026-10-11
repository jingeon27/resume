// 사용: node scripts/build-moim-preview.mjs
// 모임 지원 이력서 초안2의 본문을 보존하는 A4 HTML 미리보기.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceName = 'resumes/daangn/resume-daangn-moim-draft2.md';
const outputName = 'resumes/daangn/resume-daangn-moim-preview.html';
const source = readFileSync(resolve(root, sourceName), 'utf8');
const css = ['templates/resume-print.css', 'templates/resume-moim-print.css']
  .map((file) => readFileSync(resolve(root, file), 'utf8')).join('\n');

const escape = (text) => text.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function inline(text) {
  const pattern = /`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|([\w.+-]+@[\w.-]+\.\w+)/g;
  let rendered = '';
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    rendered += escape(text.slice(cursor, match.index));
    if (match[1]) rendered += `<code>${escape(match[1])}</code>`;
    else if (match[2]) rendered += `<a href="${escape(match[3])}">${escape(match[2])}</a>`;
    else if (match[4]) rendered += `<strong>${escape(match[4])}</strong>`;
    else rendered += `<a href="mailto:${escape(match[5])}">${escape(match[5])}</a>`;
    cursor = match.index + match[0].length;
  }
  return rendered + escape(text.slice(cursor));
}

const blocks = source.trim().split(/\n\s*\n/).map((raw, id) => {
  const heading = raw.match(/^(#{1,4}) (.+)$/);
  if (heading) return { id, kind: 'heading', level: heading[1].length, text: heading[2] };
  if (raw.startsWith('- ')) {
    const lines = raw.split('\n');
    if (lines.some((line) => !line.startsWith('- '))) throw new Error(`지원하지 않는 목록: ${id}`);
    return { id, kind: 'list', items: lines.map((line) => line.slice(2)) };
  }
  if (raw.startsWith('|')) {
    const rows = raw.split('\n').map((line) => line.trim().replace(/^\||\|$/g, '')
      .split('|').map((cell) => cell.trim()));
    const [headers, divider, ...body] = rows;
    if (!divider?.every((cell) => /^:?-{3,}:?$/.test(cell))
      || body.some((row) => row.length !== headers.length)) throw new Error(`잘못된 표: ${id}`);
    return { id, kind: 'table', headers, rows: body };
  }
  if (/^```|^>|^\d+\. /m.test(raw)) throw new Error(`지원하지 않는 블록: ${id}`);
  return { id, kind: 'paragraph', text: raw.replace(/\n/g, ' ') };
});

const plans = [
  { label: '소개 · 지원동기 · 기술 · 경력', short: '소개·경력', start: '김진건' },
  { label: '사용자 경험 · 건강검진 · SSR', short: 'UX·SSR', start: '주요 프로젝트' },
  { label: '타입과 구조 · 운영 · 테스트 · 기술 선택', short: '구조·운영', start: '코드 구조와 기술부채 개선' },
  { label: 'AI 개발 · 실험 참여 · 왓타임', short: 'AI·기타 경험', start: 'AI 개발 workflow', supporting: true },
];

// 기술 목록은 지원동기 뒤로, 기술 선택 사례는 AI 개발 사례 앞으로 이동한다.
const technologyStart = blocks.findIndex((block) => block.kind === 'heading' && block.text === '기술');
const educationStart = blocks.findIndex((block) => block.kind === 'heading' && block.text === '학력');
const careerStart = blocks.findIndex((block) => block.kind === 'heading' && block.text === '경력 요약');
if (careerStart < 0 || technologyStart <= careerStart || educationStart <= technologyStart) {
  throw new Error('소개·기술·경력 구성을 확인하세요.');
}
const frontLoadedBlocks = [
  ...blocks.slice(0, careerStart),
  ...blocks.slice(technologyStart, educationStart),
  ...blocks.slice(careerStart, technologyStart),
  ...blocks.slice(educationStart),
];

const titleOf = (block) => block.level === 4 ? block.text.split(' | ')[0] : block.text;
const choicesStart = frontLoadedBlocks.findIndex((block) => block.kind === 'heading'
  && titleOf(block) === '기술 선택과 전환');
const choicesEnd = frontLoadedBlocks.findIndex((block, index) => index > choicesStart
  && block.kind === 'heading' && block.level <= 4);
const aiStart = frontLoadedBlocks.findIndex((block) => block.kind === 'heading'
  && titleOf(block) === 'AI 개발 workflow');
if (aiStart < 0 || choicesStart <= aiStart || choicesEnd <= choicesStart) {
  throw new Error('기술 선택·AI 개발 사례 구성을 확인하세요.');
}
const layoutBlocks = [
  ...frontLoadedBlocks.slice(0, aiStart),
  ...frontLoadedBlocks.slice(choicesStart, choicesEnd),
  ...frontLoadedBlocks.slice(aiStart, choicesStart),
  ...frontLoadedBlocks.slice(choicesEnd),
];

const starts = plans.map(({ start, kind = 'heading' }) => {
  const matches = layoutBlocks.filter((block) => block.kind === kind
    && (kind !== 'heading' || titleOf(block) === start));
  if (matches.length !== 1) throw new Error(`페이지 시작 제목을 확인하세요: ${start}`);
  return layoutBlocks.indexOf(matches[0]);
});
if (starts[0] !== 0 || starts.some((start, index) => index > 0 && start <= starts[index - 1])) {
  throw new Error('페이지 구성이 원문의 순서와 다릅니다.');
}

const primaryCases = new Set([
  '모바일 리뷰 작성 개선', '건강검진 서비스 내재화', 'CSR·SSR 범위와 데이터 조회 설계',
  '코드 구조와 기술부채 개선', 'Sentry 도입과 운영 오류 추적', '테스트 도입',
]);

function renderBlock(block, section) {
  const attr = `data-source-block="${block.id}"`;
  if (block.kind === 'heading') {
    if (block.level === 4) {
      const [title, period] = block.text.split(' | ');
      return `<h4 class="project" ${attr}><span>${inline(title)}</span>${period ? `<span class="project-period">${inline(period)}</span>` : ''}</h4>`;
    }
    return `<h${block.level} ${attr}>${inline(block.text)}</h${block.level}>`;
  }
  if (block.kind === 'table') {
    return `<table class="career-table" aria-label="경력 기간과 담당 업무" ${attr}><thead><tr>${block.headers.map((cell) => `<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  if (block.kind === 'list') {
    const className = section === '기술' ? 'skills' : 'simple-list';
    const items = block.items.map((item) => {
      if (className === 'skills') {
        const match = item.match(/^\*\*([^*]+)\*\* (.+)$/);
        if (match) return `<li><strong>${escape(match[1])}</strong><span>${inline(match[2])}</span></li>`;
      }
      const emphasis = item.includes('createTypedForm<T>') ? ' class="type-design"' : '';
      return `<li${emphasis}>${inline(item)}</li>`;
    });
    return `<ul class="${className}" ${attr}>${items.join('\n')}</ul>`;
  }
  const className = block.id === 1 ? 'contact' : block.text.startsWith('**병역**') ? 'service-note'
    : block.text.includes('티켓·plan 검토 →') ? 'workflow' : '';
  return `<p${className ? ` class="${className}"` : ''} ${attr}>${inline(block.text)}</p>`;
}

let currentSection = '';
const sheets = plans.map((plan, index) => {
  let caseOpen = false;
  let contents = '';
  for (const block of layoutBlocks.slice(starts[index], starts[index + 1] ?? layoutBlocks.length)) {
    if (block.kind === 'heading' && block.level <= 4 && caseOpen) {
      contents += '</section>\n';
      caseOpen = false;
    }
    if (block.kind === 'heading' && block.level === 2) currentSection = block.text;
    if (block.kind === 'heading' && block.level === 4) {
      contents += `<section class="case ${primaryCases.has(titleOf(block)) ? 'case-primary' : 'case-supporting'}">\n`;
      caseOpen = true;
    }
    contents += `${renderBlock(block, currentSection)}\n`;
  }
  if (caseOpen) contents += '</section>\n';
  const number = String(index + 1).padStart(2, '0');
  return `<article class="sheet${index === 0 ? ' sheet-cover' : ''}${plan.supporting ? ' sheet-supporting' : ''}" id="page-${index + 1}" aria-label="${index + 1}쪽 · ${plan.label}">
  <div class="page-content">${contents}</div>
  <footer class="page-footer"><span>${number} <span class="page-total">/ ${String(plans.length).padStart(2, '0')}</span></span></footer>
</article>`;
});

const html = `<!doctype html>
<!-- ${sourceName}에서 생성. node scripts/build-moim-preview.mjs로 갱신. -->
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="김진건 프론트엔드 엔지니어 이력서. 제품 개발과 사용자 경험 개선, SSR, AI 개발 workflow, 테스트와 운영 경험.">
  <title>김진건 | Frontend Engineer 이력서</title>
  <style>${css}</style>
</head>
<body>
  <a class="skip-link" href="#resume">이력서 본문으로 이동</a>
  <div class="preview-controls">
    <div class="toolbar">
      <div class="preview-title"><strong>김진건 <span>이력서 미리보기</span></strong><small>A4 · ${plans.length}쪽 · 원문 전체</small></div>
      <button type="button" id="print-button"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7z"/><path d="M16 11h1"/></svg>PDF로 저장</button>
    </div>
    <div class="navigation-row">
      <nav aria-label="이력서 페이지">${plans.map((plan, index) => `<a href="#page-${index + 1}">${plan.short}</a>`).join('')}</nav>
      <details class="print-help"><summary>인쇄 설정</summary><p>대상: PDF로 저장<br>용지: A4 · 배율: 100%<br>여백: 없음<br>브라우저 머리글·바닥글: 끄기</p></details>
    </div>
  </div>
  <main id="resume">${sheets.join('\n')}</main>
  <script>document.getElementById('print-button').addEventListener('click', () => window.print());</script>
</body>
</html>
`;

const renderedBlockIds = [...html.matchAll(/data-source-block="(\d+)"/g)].map((match) => Number(match[1]));
if (renderedBlockIds.length !== blocks.length
  || renderedBlockIds.some((id, index) => id !== layoutBlocks[index].id)
  || new Set(renderedBlockIds).size !== blocks.length) {
  throw new Error('원문에서 빠졌거나 중복된 블록이 있습니다.');
}
const sourceLinks = [...source.matchAll(/\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/g)].map((match) => match[1]);
for (const link of sourceLinks) {
  if (!html.includes(`href="${escape(link)}"`)) throw new Error(`링크가 빠졌습니다: ${link}`);
}

writeFileSync(resolve(root, outputName), html, 'utf8');
console.log(`${outputName}: ${plans.length} pages, ${blocks.length} source blocks, ${sourceLinks.length} links preserved`);
