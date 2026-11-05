// Sanity check on dist/: every internal link, asset and #fragment referenced by an HTML page
// (and every url() in the CSS) must exist. Builds first unless --no-build.
// Usage: node tools/links.mjs [--no-build]   Exit code 1 if anything is missing.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
if (!process.argv.includes('--no-build')) execFileSync('node', ['build.mjs'], { cwd: ROOT, stdio: 'inherit' });

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const idCache = new Map();
const ids = (file) => {
  if (!idCache.has(file)) idCache.set(file, new Set([...fs.readFileSync(file, 'utf8').matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1])));
  return idCache.get(file);
};

const external = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i; // http:, mailto:, tel:, data:, javascript:, //cdn ...
function resolve(from, ref) {
  const [pathAndQuery, hash = ''] = ref.split('#');
  const p = pathAndQuery.split('?')[0];
  let target = p === '' ? from : p.startsWith('/') ? path.join(DIST, p) : path.resolve(path.dirname(from), p);
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  return { target, hash: decodeURIComponent(hash) };
}

// Known gaps, reported as warnings only: the Bauer Bodoni font is declared but never shipped (see CLAUDE.md).
const KNOWN_MISSING = ['assets/fonts/bauer-bodoni.woff2'];
const problems = [];
const warnings = [];
let checked = 0;
function check(from, ref) {
  ref = ref.trim();
  if (!ref || external.test(ref)) return;
  checked++;
  const { target, hash } = resolve(from, decodeURI(ref).replace(/#.*/, '') + (ref.includes('#') ? '#' + ref.split('#')[1] : ''));
  const rel = path.relative(DIST, from);
  if (KNOWN_MISSING.includes(path.relative(DIST, target)) && !fs.existsSync(target)) { warnings.push(`${rel}: known missing ${ref}`); return; }
  if (!target.startsWith(DIST) || !fs.existsSync(target)) { problems.push(`${rel}: missing ${ref}`); return; }
  if (hash && target.endsWith('.html') && !ids(target).has(hash)) problems.push(`${rel}: no #${hash} in ${path.relative(DIST, target)} (${ref})`);
}

for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/\s(?:href|src|poster|data-src)=["']([^"']*)["']/g)) check(f, m[1]);
  for (const m of html.matchAll(/\ssrcset=["']([^"']*)["']/g)) for (const c of m[1].split(',')) check(f, c.trim().split(/\s+/)[0]);
}
for (const f of files.filter((x) => x.endsWith('.css'))) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) check(f, m[1]);
}

for (const w of new Set(warnings)) console.warn('warning: ' + w);
if (problems.length) {
  console.error(`links: ${problems.length} problem(s)\n` + [...new Set(problems)].map((p) => '  ' + p).join('\n'));
  process.exit(1);
}
console.log(`links: ${htmlFiles.length} pages, ${checked} internal references, all resolve`);
