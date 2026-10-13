// 사용: node scripts/build-paytalab-preview.mjs [resume|career] [--pdf]
// 회사별 Markdown의 본문·링크를 보존해 A4 HTML과 제출용 PDF를 생성한다.
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const folder = 'resumes/paytalab';
const documents = [
  {
    id: 'resume', name: '이력서', source: 'resume-paytalab-frontend.md', output: 'resume-paytalab-preview.html',
    pdf: '김진건_페이타랩_이력서.pdf',
    plans: [
      { start: '김진건', label: '소개 · 제품 개발', short: '소개·제품 개발' },
      { start: '조회 구조·성능·운영 오류 대응', label: '기술 · 협업 · 지원동기', short: '기술·지원동기' },
    ],
  },
  {
    id: 'career', name: '경력기술서', source: 'career-paytalab-frontend.md', output: 'career-paytalab-preview.html',
    pdf: '김진건_페이타랩_경력기술서.pdf',
    plans: [
      { start: '김진건 경력기술서', label: '제품 흐름 · 모바일 · 백오피스', short: '제품·모바일·운영' },
      { start: '데이터 조회 전환과 네트워크 요청', label: '조회 · 운영 오류 · 웹 성능', short: '조회·오류·성능' },
      { start: '테스트 도입과 AI 개발 workflow', label: '테스트 · 공통 코드 · 왓타임', short: '테스트·공통 코드' },
    ],
  },
];
const selected = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
if (selected && !documents.some((doc) => doc.id === selected)) throw new Error('문서는 resume 또는 career입니다.');
const css = ['templates/resume-print.css', 'templates/resume-paytalab-print.css']
  .map((file) => readFileSync(resolve(root, file), 'utf8')).join('\n');
const escape = (text) => text.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function inline(text) {
  const pattern = /`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|([\w.+-]+@[\w.-]+\.\w+)/g;
  let rendered = '', cursor = 0;
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

function parse(source) {
  return source.trim().split(/\n\s*\n/).map((raw, id) => {
    const heading = raw.match(/^(#{1,4}) (.+)$/);
    if (heading) return { id, kind: 'heading', level: heading[1].length, text: heading[2] };
    if (raw.startsWith('- ')) {
      const lines = raw.split('\n');
      if (lines.some((line) => !line.startsWith('- '))) throw new Error(`지원하지 않는 목록: ${id}`);
      return { id, kind: 'list', items: lines.map((line) => line.slice(2)) };
    }
    if (/^```|^>|^\d+\. |^\|/m.test(raw)) throw new Error(`지원하지 않는 블록: ${id}`);
    return { id, kind: 'paragraph', text: raw.replace(/\n/g, ' ') };
  });
}
const titleOf = (block) => block.level === 4 ? block.text.split(' | ')[0] : block.text;

function renderBlock(block, section, documentId) {
  const attr = `data-source-block="${block.id}"`;
  if (block.kind === 'heading') {
    if (block.level === 4) {
      const [title, period] = block.text.split(' | ');
      return `<h4 class="project" ${attr}><span>${inline(title)}</span>${period ? `<span class="project-period">${inline(period)}</span>` : ''}</h4>`;
    }
    return `<h${block.level} ${attr}>${inline(block.text)}</h${block.level}>`;
  }
  if (block.kind === 'list') {
    const className = section === '기술' ? 'skills' : section === '소개' && documentId === 'resume' ? 'highlights' : 'simple-list';
    return `<ul class="${className}" ${attr}>${block.items.map((item) => {
      const skill = className === 'skills' && item.match(/^([^:]+): (.+)$/);
      return skill ? `<li><strong>${escape(skill[1])}</strong><span>${inline(skill[2])}</span></li>` : `<li>${inline(item)}</li>`;
    }).join('\n')}</ul>`;
  }
  const className = block.id === 1 ? 'contact' : block.text.startsWith('병역') ? 'role-note'
    : block.text.startsWith('티켓·plan 검토 →') ? 'workflow' : '';
  return `<p${className ? ` class="${className}"` : ''} ${attr}>${inline(block.text)}</p>`;
}

function build(doc) {
  const sourceName = `${folder}/${doc.source}`;
  const source = readFileSync(resolve(root, sourceName), 'utf8');
  const blocks = parse(source);
  const starts = doc.plans.map(({ start }) => {
    const matches = blocks.filter((block) => block.kind === 'heading' && titleOf(block) === start);
    if (matches.length !== 1) throw new Error(`페이지 시작 제목을 확인하세요: ${start}`);
    return blocks.indexOf(matches[0]);
  });
  if (starts[0] !== 0 || starts.some((start, index) => index > 0 && start <= starts[index - 1])) throw new Error('페이지 구성이 원문의 순서와 다릅니다.');
  let currentSection = '';
  const sheets = doc.plans.map((plan, index) => {
    let caseOpen = false, contents = '';
    for (const block of blocks.slice(starts[index], starts[index + 1] ?? blocks.length)) {
      if (block.kind === 'heading' && caseOpen) { contents += '</section>\n'; caseOpen = false; }
      if (block.kind === 'heading' && block.level === 2) currentSection = block.text;
      if (block.kind === 'heading' && block.level === 4) { contents += '<section class="case">\n'; caseOpen = true; }
      contents += `${renderBlock(block, currentSection, doc.id)}\n`;
    }
    if (caseOpen) contents += '</section>\n';
    return `<article class="sheet sheet-${doc.id}${index === 0 ? ' sheet-cover' : ''}" id="page-${index + 1}" aria-label="${index + 1}쪽 · ${plan.label}">
<div class="page-content">${contents}</div>
<footer class="page-footer"><span>김진건 · ${doc.name}</span><span>${index + 1} / ${doc.plans.length}</span></footer>
</article>`;
  });
  const html = `<!doctype html>
<!-- ${sourceName}에서 생성. node scripts/build-paytalab-preview.mjs로 갱신. -->
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light">
<meta name="description" content="김진건의 페이타랩 Web Frontend 지원 ${doc.name}. 예약·결제, 모바일·WebView, 백오피스와 운영 오류 대응 경험.">
<title>김진건 | 페이타랩 ${doc.name}</title><style>${css}</style></head><body>
<a class="skip-link" href="#resume">본문으로 이동</a>
<div class="preview-controls"><div class="toolbar"><div class="preview-title"><strong>김진건 <span>${doc.name} 미리보기</span></strong><small>A4 · ${doc.plans.length}쪽</small></div>
<div class="document-links">${documents.filter((other) => other.id !== doc.id).map((other) => `<a href="${other.output}">${other.name}</a>`).join('')}<button type="button" id="print-button">PDF로 저장</button></div></div>
<div class="navigation-row"><nav aria-label="문서 페이지">${doc.plans.map((plan, index) => `<a href="#page-${index + 1}">${plan.short}</a>`).join('')}</nav>
<details class="print-help"><summary>인쇄 설정</summary><p>대상: PDF로 저장<br>용지: A4 · 배율: 100%<br>여백: 없음<br>머리글·바닥글: 끄기</p></details></div></div>
<main id="resume">${sheets.join('\n')}</main><script>document.getElementById('print-button').addEventListener('click', () => window.print());</script></body></html>\n`;
  const ids = [...html.matchAll(/data-source-block="(\d+)"/g)].map((match) => Number(match[1]));
  if (ids.length !== blocks.length || ids.some((id, index) => id !== blocks[index].id) || new Set(ids).size !== blocks.length) throw new Error('원문에서 빠졌거나 중복된 블록이 있습니다.');
  const links = [...source.matchAll(/\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/g)].map((match) => match[1]);
  for (const link of links) if (!html.includes(`href="${escape(link)}"`)) throw new Error(`링크가 빠졌습니다: ${link}`);
  const htmlPath = resolve(root, folder, doc.output);
  writeFileSync(htmlPath, html, 'utf8');
  console.log(`${folder}/${doc.output}: ${doc.plans.length} pages, ${blocks.length} blocks, ${links.length} links preserved`);
  if (process.argv.includes('--pdf')) {
    const chrome = process.env.CHROME_BIN ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (!existsSync(chrome)) throw new Error('Chrome 경로를 CHROME_BIN으로 지정해 주세요.');
    const profile = mkdtempSync(resolve(tmpdir(), 'paytalab-pdf-'));
    try {
      execFileSync(chrome, ['--headless=new', '--disable-gpu', `--user-data-dir=${profile}`, '--no-pdf-header-footer', '--virtual-time-budget=3000', `--print-to-pdf=${resolve(root, folder, doc.pdf)}`, pathToFileURL(htmlPath).href], { stdio: 'pipe', timeout: 30000 });
      console.log(`${folder}/${doc.pdf}`);
    } finally { rmSync(profile, { recursive: true, force: true }); }
  }
}
for (const doc of documents.filter((doc) => !selected || doc.id === selected)) build(doc);
