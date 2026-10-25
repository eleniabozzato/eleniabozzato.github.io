// Tiny static-site generator: templates (src/pages, src/partials) + texts (src/i18n) + data (src/data) -> HTML.
// No framework, no dependencies. Run with `node build.mjs`; output lands in dist/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageFiles } from './src/data/pages.mjs';
import { projects } from './src/data/projects.mjs';
import { head } from './src/partials/head.mjs';
import { header } from './src/partials/header.mjs';
import { footer } from './src/partials/footer.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'dist');

/* ── helpers ── */
function writeFile(rel, content) {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}
function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// Keyword markup in i18n strings: <em-acqua>WORD</em-acqua> -> accent span.
// Strings are trusted HTML (they may also hold <strong>, <br>, entities).
const KEYWORD = /<em-(acqua|magenta)>([\s\S]*?)<\/em-\1>/g;
const expand = (s) => s.replace(KEYWORD, '<span class="italic-accent italic-accent--$1">$2</span>');
const expandDeep = (v) =>
  typeof v === 'string'
    ? expand(v)
    : Array.isArray(v)
      ? v.map(expandDeep)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, expandDeep(x)]))
        : v;

const loadTexts = (lang) =>
  expandDeep(JSON.parse(fs.readFileSync(path.join(SRC, 'i18n', `${lang}.json`), 'utf8')));

/* ── page wrapper: <head>, header, footer and scripts around a template's <main> ── */
function page({ lang, t, href, layout, main }) {
  const body = `${head({ lang, ...layout })}<body${layout.bodyAttrs || ''}>
${header({ t, href, projects })}
${main}
${footer({ t, href, cta: layout.footerCta !== false })}
  <script src="assets/js/main.js"></script>
${(layout.scripts || []).map((s) => `  ${s}\n`).join('')}</body>
</html>
`;
  return body;
}

/* ── build ── */
async function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  for (const lang of ['it']) {
    const t = loadTexts(lang);
    const files = pageFiles[lang];
    const href = {
      page: (id) => files[id],
      project: (p) => `${p.slug}.html`,
    };
    const ctx = { t, lang, href, projects, pageFiles: files };

    // Static pages: src/pages/<id>.mjs
    for (const id of Object.keys(files)) {
      const mod = await import(`./src/pages/${id}.mjs`);
      writeFile(files[id], page({ lang, t, href, layout: mod.layout(ctx), main: mod.default(ctx) }));
    }

    // Project pages: one template, one entry per project
    const mod = await import('./src/pages/project.mjs');
    for (const p of projects) {
      const c = { ...ctx, project: p };
      writeFile(href.project(p), page({ lang, t, href, layout: mod.layout(c), main: mod.default(c) }));
    }
  }

  copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
  if (fs.existsSync(path.join(ROOT, 'CNAME'))) fs.copyFileSync(path.join(ROOT, 'CNAME'), path.join(OUT, 'CNAME'));
  writeFile('.nojekyll', '');
  console.log(`Built ${fs.readdirSync(OUT).filter((f) => f.endsWith('.html')).length} pages -> dist/`);
}

await build();
