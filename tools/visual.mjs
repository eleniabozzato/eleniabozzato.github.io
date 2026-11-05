// Visual regression gate. Builds the current tree and a BASE ref, screenshots every page of both
// at several widths and compares them pixel by pixel. No PNG baselines are stored in the repo.
//
// Usage: npm run visual -- [--base <ref>] [--pages a,b] [--widths 390,1025] [--tolerance N] [--threshold N]
//   --base       git ref to compare against. Default: $VISUAL_BASE, else HEAD, so the working tree is
//                compared with the last commit.
//   --pages      page names without .html, e.g. index,contatti (default: every .html in dist/).
//                With --head-prefix, names are the base names (without the prefix).
//   --head-prefix  compare the head pages under this folder with the base page of the same file name,
//                e.g. `--head-prefix it/` compares dist/it/chi-sono.html with the base's chi-sono.html
//                (used while the base still has the Italian site at its root). Other head pages are skipped.
//   --ignore-header  do not count differences inside the header (it changes on purpose, e.g. the language
//                selector). Differences below it still fail. The report always lists the rows that differ.
//   --widths     viewport widths (default 390,1025,1440,2560)
//   --tolerance  max differing pixels allowed per pair (default 0)
//   --threshold  per-channel difference (0-255) above which a pixel counts as different (default 8)
// Only failing pairs are written, to design/shots/visual/<page>-<width>-{base,head,diff}.png.
// The base is built in a temporary git worktree. If it has no build.mjs, its root files are served as they are.
// Needs the browser once: npx playwright install chromium. Exit code 1 on any failure.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { startServer } from './serve.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => (args.includes(name) ? args[args.indexOf(name) + 1] : def);
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const refExists = (r) => { try { git('rev-parse', '--verify', '--quiet', r); return true; } catch { return false; } };

const WIDTHS = opt('--widths', '390,1025,1440,2560').split(',').map(Number);
const TOLERANCE = Number(opt('--tolerance', 0));
const THRESHOLD = Number(opt('--threshold', 8));
const ONLY = opt('--pages', '') ? opt('--pages').split(',').map((p) => p.replace(/\.html$/, '')) : null;
const PREFIX = opt('--head-prefix', '');
const IGNORE_HEADER = args.includes('--ignore-header');
const BASE = opt('--base', process.env.VISUAL_BASE || 'HEAD');
const OUT_DIR = path.join(ROOT, 'design/shots/visual');
const HEAD_DIR = path.join(ROOT, 'dist');

const listHtml = (dir) => {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== 'assets' && e.name !== 'node_modules' && e.name !== '.git' && e.name !== 'design') walk(p); }
      else if (e.name.endsWith('.html')) out.push(path.relative(dir, p).split(path.sep).join('/').replace(/\.html$/, ''));
    }
  };
  walk(dir);
  return out.sort();
};

// 1. Build both trees.
console.log('Building head ...');
execFileSync('node', ['build.mjs'], { cwd: ROOT, stdio: 'inherit' });

if (!refExists(BASE)) { console.error(`Base ref not found: ${BASE}`); process.exit(2); }
const wt = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-base-'));
fs.rmSync(wt, { recursive: true });
console.log(`Building base ${BASE} (${git('rev-parse', '--short', BASE)}) ...`);
git('worktree', 'add', '--detach', wt, BASE);
let baseDir = wt;
const cleanup = () => { try { git('worktree', 'remove', '--force', wt); } catch {} };
process.on('exit', cleanup);
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => process.exit(130));
if (fs.existsSync(path.join(wt, 'build.mjs'))) {
  execFileSync('node', ['build.mjs'], { cwd: wt, stdio: 'inherit' });
  baseDir = path.join(wt, 'dist');
}

// 2. Serve both.
const headSrv = await startServer(HEAD_DIR);
const baseSrv = await startServer(baseDir);

// 3. Page list: everything in head's dist, plus pages that only the base has (reported as removed).
// With a prefix, head pages are named by their base name; headFile() gives the real path back.
const headFile = (page) => PREFIX + page;
const headPages = listHtml(HEAD_DIR)
  .filter((p) => !PREFIX || p.startsWith(PREFIX))
  .map((p) => p.slice(PREFIX.length));
const basePages = new Set(listHtml(baseDir));
const pick = (p) => !ONLY || ONLY.includes(p);
const pages = headPages.filter(pick);
const removed = [...basePages].filter((p) => !headPages.includes(p) && pick(p) && p !== '404');
const results = [];

// 4. Capture.
const CSS = `*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;caret-color:transparent!important}
.to-top{display:none!important}`;

async function shot(browser, origin, page, width) {
  // returns { png, headerBottom }: headerBottom is the page y (screenshot px) where the header ends
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce', locale: 'en-US' });
  const p = await ctx.newPage();
  try {
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await p.goto(`${origin}/${page}.html`, { waitUntil: 'load' });
    await p.addStyleTag({ content: CSS });
    await p.evaluate(async () => {
      document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
      const h = () => document.documentElement.scrollHeight;
      for (let y = 0; y < h(); y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
      window.scrollTo(0, 0);
      await document.fonts.ready;
      await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    });
    await p.waitForTimeout(150);
    const box = await p.locator('.site-header').first().boundingBox();
    return { png: await p.screenshot({ fullPage: true }), headerBottom: box ? Math.ceil(box.y + box.height) : 0 };
  } finally { await ctx.close(); }
}

function compare(a, b, skipTop = 0) {
  const A = PNG.sync.read(a), B = PNG.sync.read(b);
  // Different heights: still draw a diff over the larger canvas (rows missing on one side count as different).
  const W = Math.max(A.width, B.width), H = Math.max(A.height, B.height);
  const D = new PNG({ width: W, height: H });
  const sameSize = A.width === B.width && A.height === B.height;
  let diff = 0, y0 = Infinity, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      const inA = x < A.width && y < A.height, inB = x < B.width && y < B.height;
      const oa = (y * A.width + x) * 4, ob = (y * B.width + x) * 4;
      let d = 255;
      if (inA && inB) d = Math.max(Math.abs(A.data[oa] - B.data[ob]), Math.abs(A.data[oa + 1] - B.data[ob + 1]), Math.abs(A.data[oa + 2] - B.data[ob + 2]), Math.abs(A.data[oa + 3] - B.data[ob + 3]));
      if (d > THRESHOLD) {
        if (y >= skipTop) { if (sameSize) diff++; y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        D.data[o] = 255; D.data[o + 1] = 0; D.data[o + 2] = 255; D.data[o + 3] = 255;
      } else { // faded copy of the head pixel for context
        D.data[o] = D.data[o + 1] = D.data[o + 2] = 255 - (255 - B.data[ob]) * 0.25; D.data[o + 3] = 255;
      }
    }
  }
  return { heightA: A.height, heightB: B.height, diff: sameSize ? diff : -1, rows: y1 < 0 ? '' : `${y0}-${y1}`, D };
}

const browser = await chromium.launch({
  // Software rendering: GPU raster gives sparse, random 1-2 level noise on scaled photos.
  args: ['--disable-gpu', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--disable-partial-raster'],
});
const jobs = [];
for (const page of pages) for (const w of WIDTHS) jobs.push({ page, w });
const save = (name, buf) => { fs.mkdirSync(OUT_DIR, { recursive: true }); fs.writeFileSync(path.join(OUT_DIR, name.replace(/\//g, '_')), buf); };

async function run({ page, w }) {
  const r = { page, w, status: 'ok', note: '' };
  results.push(r);
  if (!basePages.has(page)) { r.status = 'new'; r.note = 'not in base'; return; }
  const [base, head] = await Promise.all([
    shot(browser, `http://127.0.0.1:${baseSrv.port}`, page, w),
    shot(browser, `http://127.0.0.1:${headSrv.port}`, headFile(page), w),
  ]);
  const c = compare(base.png, head.png, IGNORE_HEADER ? Math.max(base.headerBottom, head.headerBottom) : 0);
  r.hBase = c.heightA; r.hHead = c.heightB; r.diff = c.diff; r.rows = c.rows; r.header = head.headerBottom;
  if (c.diff === -1) { r.status = 'FAIL'; r.note = `height ${c.heightA} -> ${c.heightB}`; }
  else if (c.diff > TOLERANCE) { r.status = 'FAIL'; r.note = `${c.diff} px differ`; }
  if (r.status === 'FAIL') {
    save(`${page}-${w}-base.png`, base.png);
    save(`${page}-${w}-head.png`, head.png);
    if (c.D) save(`${page}-${w}-diff.png`, PNG.sync.write(c.D));
  }
}

const queue = [...jobs];
const CONC = Math.max(2, Math.min(4, os.cpus().length - 1));
await Promise.all(Array.from({ length: CONC }, async () => { for (let j; (j = queue.shift()); ) await run(j); }));
await browser.close();
await headSrv.close(); await baseSrv.close();

// 5. Report.
results.sort((a, b) => (a.page === b.page ? a.w - b.w : a.page < b.page ? -1 : 1));
const pad = (s, n) => String(s).padEnd(n);
console.log(`\n${pad('page', 24)}${pad('width', 7)}${pad('height', 14)}${pad('diff px', 9)}${pad('rows (header ends)', 22)}status`);
for (const r of results) console.log(`${pad(r.page, 24)}${pad(r.w, 7)}${pad(r.hHead ?? '-', 14)}${pad(r.diff ?? '-', 9)}${pad(r.rows ? `${r.rows} (${r.header})` : '-', 22)}${r.status}${r.note ? '  ' + r.note : ''}`);
for (const p of removed) console.log(`${pad(p, 24)}${pad('-', 7)}${pad('-', 14)}${pad('-', 9)}${pad('-', 22)}FAIL  page exists in base but not in head`);
const failed = results.filter((r) => r.status === 'FAIL').length + removed.length;
const isNew = results.filter((r) => r.status === 'new').length;
console.log(`\nBase ${BASE}: ${results.length} pairs, ${failed} failed, ${isNew} new (not compared).` + (failed ? ` Images: ${path.relative(ROOT, OUT_DIR)}/` : ''));
process.exit(failed ? 1 : 0);
