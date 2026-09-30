// 사용: node scripts/build-lessons-preview.mjs
// 원문 내용과 순서를 유지하고 A4 다섯 쪽으로 나눈 미리보기 HTML을 만든다.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceName = 'resume-daangn-lessons-draft.md';
const outputName = 'resume-daangn-lessons-preview.html';
const source = readFileSync(resolve(root, sourceName), 'utf8');
const css = readFileSync(resolve(root, 'templates/resume-print.css'), 'utf8');

const escape = (text) => text.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

function inline(text) {
  const pattern = /`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|([\w.+-]+@[\w.-]+\.\w+)/g;
  let result = '';
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    result += escape(text.slice(cursor, match.index));
    if (match[1]) result += `<code>${escape(match[1])}</code>`;
    else if (match[2]) result += `<a href="${escape(match[3])}">${escape(match[2])}</a>`;
    else if (match[4]) result += `<strong>${escape(match[4])}</strong>`;
    else result += `<a href="mailto:${escape(match[5])}">${escape(match[5])}</a>`;
    cursor = match.index + match[0].length;
  }
  return result + escape(text.slice(cursor));
}

const blocks = source.trim().split(/\n\s*\n/).map((raw, id) => {
  const heading = raw.match(/^(#{1,4}) (.+)$/);
  if (heading) return { id, kind: 'heading', level: heading[1].length, text: heading[2] };
  if (raw.startsWith('- ')) {
    const lines = raw.split('\n');
    if (lines.some((line) => !line.startsWith('- '))) {
      throw new Error(`지원하지 않는 목록 형식: block ${id}`);
    }
    return { id, kind: 'list', items: lines.map((line) => line.slice(2)) };
  }
  return { id, kind: 'paragraph', text: raw.replace(/\n/g, ' ') };
});

const plans = [
  { label: '소개와 주요 경험', short: '소개', start: '김진건' },
  { label: '세이프닥 · 제품 개발', short: '제품 개발', start: '경력' },
  { label: '세이프닥 · 제품 개선', short: '제품 개선', start: '병원 등록부터 예약·정산까지' },
  { label: '세이프닥 · 계측과 운영', short: '계측과 운영', start: '실험에 참여하며 행동을 기록한 일' },
  { label: '왓타임 · 지원동기', short: '경력과 지원동기', start: '왓타임 | Frontend Engineer | 2024.01 – 2024.11' },
];

const starts = plans.map(({ start }) => {
  const matches = blocks.filter((block) => block.kind === 'heading' && block.text === start);
  if (matches.length !== 1) throw new Error(`페이지 시작 제목을 확인하세요: ${start}`);
  return matches[0].id;
});
if (starts[0] !== 0 || starts.some((start, i) => i > 0 && start <= starts[i - 1])) {
  throw new Error('페이지 구성이 원문의 순서와 다릅니다.');
}

function renderBlock(block, section) {
  const attr = `data-source-block="${block.id}"`;
  if (block.kind === 'heading') {
    if (block.level === 3 && block.text.includes(' | ')) {
      const [company, role, dates] = block.text.split(' | ');
      return `<h3 class="company" ${attr}><span>${inline(company)}</span><span class="company-meta">${inline(role)} <span aria-hidden="true">·</span> ${inline(dates)}</span></h3>`;
    }
    return `<h${block.level} ${attr}>${inline(block.text)}</h${block.level}>`;
  }
  if (block.kind === 'list') {
    const className = section === '주요 경험' ? 'highlights' : section === '기술' ? 'skills' : 'simple-list';
    const items = block.items.map((item) => {
      if (className === 'skills') {
        const match = item.match(/^\*\*([^*]+)\*\* (.+)$/);
        if (match) return `<li><strong>${escape(match[1])}</strong><span>${inline(match[2])}</span></li>`;
      }
      return `<li>${inline(item)}</li>`;
    });
    return `<ul class="${className}" ${attr}>\n${items.join('\n')}\n</ul>`;
  }
  const className = block.id === 1 ? 'contact' : block.text.startsWith('병역 ·') ? 'service-note'
    : block.text.startsWith('**역할**') ? 'role-note' : '';
  return `<p${className ? ` class="${className}"` : ''} ${attr}>${inline(block.text)}</p>`;
}

let currentSection = '';
const sheets = plans.map((plan, index) => {
  const contents = blocks.slice(starts[index], starts[index + 1] ?? blocks.length).map((block) => {
    if (block.kind === 'heading' && block.level === 2) currentSection = block.text;
    return renderBlock(block, currentSection);
  }).join('\n');
  const number = String(index + 1).padStart(2, '0');
  return `<article class="sheet${index === 0 ? ' sheet-cover' : ''}" id="page-${index + 1}" aria-label="${index + 1}쪽 · ${plan.label}">
  <header class="running-header"><span>김진건 <span class="running-role">Frontend Engineer</span></span><span>${plan.label}</span></header>
  <div class="page-content">\n${contents}\n</div>
  <footer class="page-footer"><span>김진건 · Frontend Engineer</span><span>${number} <span class="page-total">/ 0${plans.length}</span></span></footer>
</article>`;
});

const html = `<!doctype html>
<!-- ${sourceName}에서 생성. 수정 후 node scripts/build-lessons-preview.mjs로 갱신. -->
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="description" content="김진건 프론트엔드 엔지니어 이력서. 제품 개발, 사용자 경험 개선, AI 개발 workflow와 운영 문제 해결 경험.">
  <title>김진건 | Frontend Engineer 이력서</title>
  <style>\n${css}\n</style>
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
  <main id="resume">\n${sheets.join('\n')}\n</main>
  <script>document.getElementById('print-button').addEventListener('click', () => window.print());</script>
</body>
</html>
`;

writeFileSync(resolve(root, outputName), html, 'utf8');
console.log(`${outputName}: ${plans.length} pages, ${blocks.length} source blocks, links preserved`);
