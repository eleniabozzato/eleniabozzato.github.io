// Byte-identity check: builds the site, then compares every dist/it/<page>.html with the hand-written
// Italian file at a git ref (default: the commit where those pages were last edited).
// The <head> and the header block change by design (SEO tags, redirect, language selector), so both
// are cut out of both sides. The rest of <body> must match byte for byte, after undoing the two
// URL changes that are also by design: root-absolute assets ("/assets/..." -> "assets/...") and
// links under /it/ ("/it/chi-sono.html" -> "chi-sono.html", "/it/" -> "index.html").
// Usage: node tools/identity.mjs [--ref <git-ref|WORKTREE>] [--no-build]
// --ref WORKTREE compares with the files currently on disk in the repo root.
// Exit code 1 if any page differs or is missing.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const REF = opt('--ref', process.env.IDENTITY_REF || '135726a');

// Pages compared: the Italian files that exist at the reference commit.
const PAGES = [
  'index', 'chi-sono', 'come-lavoro', 'esperienze', 'contatti',
  'dentisti-cordovado', 'al-plan-hotel', 'carrozzeria-bozzato', 'perform-health', 'pulicasa', 'paola-nadin',
].map((n) => `${n}.html`);

if (!args.includes('--no-build')) execFileSync('node', ['build.mjs'], { cwd: ROOT, stdio: 'inherit' });

// Remove everything up to </head> and the <header class="site-header"> block.
function stripHeadAndHeader(html) {
  const afterHead = html.slice(html.indexOf('</head>') + '</head>'.length);
  return afterHead.replace(/ *<header class="site-header">[\s\S]*?<\/header>\n/, '');
}
function undoUrls(html) {
  return html
    .replace(/(["\s,])\/assets\//g, '$1assets/')
    .replace(/href="\/it\/"/g, 'href="index.html"')
    .replace(/href="\/it\//g, 'href="');
}

let failed = 0;
for (const file of PAGES) {
  let expected;
  try {
    expected =
      REF === 'WORKTREE'
        ? fs.readFileSync(path.join(ROOT, file))
        : execFileSync('git', ['show', `${REF}:${file}`], { cwd: ROOT, maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    console.log(`MISSING  ${file} (not in ${REF})`);
    failed++;
    continue;
  }
  const built = path.join(ROOT, 'dist', 'it', file);
  if (!fs.existsSync(built)) {
    console.log(`MISSING  it/${file} (not built)`);
    failed++;
    continue;
  }
  const actual = Buffer.from(undoUrls(stripHeadAndHeader(fs.readFileSync(built, 'utf8'))));
  expected = Buffer.from(stripHeadAndHeader(expected.toString('utf8')));
  if (actual.equals(expected)) {
    console.log(`OK       it/${file}`);
    continue;
  }
  failed++;
  const a = actual.toString('utf8').split('\n');
  const e = expected.toString('utf8').split('\n');
  let i = 0;
  while (i < a.length && i < e.length && a[i] === e[i]) i++;
  console.log(`DIFF     it/${file} (first difference at line ${i + 1})`);
  console.log(`  expected: ${JSON.stringify(e[i] ?? '<end of file>').slice(0, 220)}`);
  console.log(`  built:    ${JSON.stringify(a[i] ?? '<end of file>').slice(0, 220)}`);
}
console.log(failed ? `\n${failed} page(s) differ from ${REF}` : `\nAll ${PAGES.length} pages are byte-identical to ${REF} (outside <head> and the header)`);
process.exit(failed ? 1 : 0);
