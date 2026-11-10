// Tiny static-site generator: templates (src/pages, src/partials) + texts (src/i18n) + data (src/data) -> HTML.
// No framework, no dependencies. Run with `node build.mjs`; output lands in dist/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LANG, SITE_URL, absoluteUrl, langs, linkHelpers, oldUrls, outPath, pageFiles, routes, urlPath } from './src/data/pages.mjs';
import { projects, services } from './src/data/projects.mjs';
import { articleFile, loadArticles } from './src/data/articles.mjs';
import { head } from './src/partials/head.mjs';
import { header } from './src/partials/header.mjs';
import { footer } from './src/partials/footer.mjs';
import { OG_IMAGE, breadcrumbs, homeGraph, profileGraph } from './src/data/schema.mjs';
import { jsonLd } from './src/partials/util.mjs';

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

/* ── Open Graph and structured data for the static and project pages (blog pages set their own) ── */
// i18n strings are already HTML, so only quotes need escaping inside an attribute.
const q = (s) => s.replace(/"/g, '&quot;');
function openGraph({ layout, url, route }) {
  const image = route.project ? route.project.card.src : OG_IMAGE;
  return [
    ['og:type', 'website'],
    ['og:site_name', 'Elenia Bozzato'],
    ['og:title', q(layout.title)],
    ['og:description', q(layout.description)],
    ['og:url', url],
    ['og:image', SITE_URL + image],
  ];
}
function structuredData({ lang, t, route, url }) {
  const home = absoluteUrl(lang, pageFiles[lang].home);
  const about = absoluteUrl(lang, pageFiles[lang].about);
  if (route.id === 'home') {
    return [jsonLd(homeGraph({ lang, t, homeUrl: home, aboutUrl: about, services: services.map((x) => t.services[x.key].title) }))];
  }
  if (route.id === 'about') return [jsonLd(profileGraph({ lang, url, aboutUrl: about }))];
  if (route.project) {
    const exp = absoluteUrl(lang, pageFiles[lang].experience);
    return [jsonLd(breadcrumbs([[t.nav.home, home], [t.nav.experience, exp], [route.project.navName, url]]))];
  }
  return [];
}

/* ── page wrapper: <head>, header, footer and scripts around a template's <main> ── */
function page({ lang, t, href, layout, main, route, footerLinks = null }) {
  // `layout` is reassigned below to add structured data.
  // Blog pages have no English version: the language selector sends English to the home page.
  const alternates = route.blog
    ? [{ lang: 'en', path: urlPath('en', 'index.html') }, { lang: 'it', path: urlPath('it', route.files.it) }]
    : langs.map((l) => ({ lang: l, path: urlPath(l, route.files[l]), url: absoluteUrl(l, route.files[l]) }));
  const indexed = route.id !== 'notfound';
  // English pages send first-time Italian browsers to the same page under /it/ (see partials/head.mjs).
  const redirectTo = lang === DEFAULT_LANG ? urlPath('it', route.files.it) : null;
  const seo = route.blog
    ? layout.seo
    : indexed
    ? {
        canonical: absoluteUrl(lang, route.files[lang]),
        alternates,
        defaultUrl: absoluteUrl(DEFAULT_LANG, route.files[DEFAULT_LANG]),
        redirectTo,
      }
    : { redirectTo };
  if (!route.blog && indexed) {
    seo.og = openGraph({ layout, url: seo.canonical, route });
    layout = { ...layout, extra: [...(layout.extra || []), ...structuredData({ lang, t, route, url: seo.canonical })] };
  }
  const headHtml = head({ lang, ...layout, seo, noindex: !indexed });
  return `${headHtml}<body${layout.bodyAttrs || ''}>
${header({ t, href, projects, lang, alternates })}
${main}
${footer({ t, href, cta: layout.footerCta !== false, links: footerLinks })}
  <script src="/assets/js/main.js"></script>
${(layout.scripts || []).map((s) => `  ${s}\n`).join('')}</body>
</html>
`;
}

/* ── redirect stubs for the URLs of the old Mobirise site ── */
function stub(to) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Elenia Bozzato</title>
<link rel="canonical" href="${SITE_URL}${to}">
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url=${to}">
</head>
<body>
<p>This page has moved to <a href="${to}">${SITE_URL}${to}</a>.</p>
</body>
</html>
`;
}

/* ── sitemap: every indexed page in both languages, with hreflang alternates ── */
function sitemap(all, blogRoutes) {
  const entries = [];
  for (const route of all.filter((r) => r.id !== 'notfound')) {
    const alts = [
      ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(l, route.files[l])}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(DEFAULT_LANG, route.files[DEFAULT_LANG])}"/>`,
    ].join('\n');
    for (const l of langs) entries.push(`  <url>\n    <loc>${absoluteUrl(l, route.files[l])}</loc>\n${alts}\n  </url>`);
  }
  // Blog (Italian only): no alternates.
  for (const r of blogRoutes) entries.push(`  <url>\n    <loc>${absoluteUrl('it', r.files.it)}</loc>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

/* ── build ── */
async function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const all = routes(projects);
  const articles = loadArticles(projects);
  // Blog routes (Italian only): the index, then one per article. Always built, even with no articles.
  const blogRoutes = [
    { id: 'blog', blog: true, files: { it: 'blog/index.html' } },
    ...articles.map((a) => ({ id: `article:${a.slug}`, blog: true, article: a, files: { it: articleFile(a.slug) } })),
  ];
  // Footer link lists (Italian pages): 3 articles picked by context, plus the six projects.
  const footerLinks = (route) => {
    const pick = (list) => [...new Set(list)].slice(0, 3);
    let list = articles.slice(0, 3);
    if (route.article) list = route.article.related.map((s) => articles.find((x) => x.slug === s)).filter(Boolean);
    else if (route.project) {
      const own = articles.filter((a) => a.projectKeys.includes(route.project.key));
      list = pick([...own, ...articles]);
    }
    return { articles: list.slice(0, 3), projects };
  };
  const projectMod = await import('./src/pages/project.mjs');

  for (const lang of langs) {
    const t = loadTexts(lang);
    const href = linkHelpers(lang);
    const ctx = { t, lang, href, projects, articles, pageFiles: pageFiles[lang] };

    for (const route of all) {
      // Static pages: src/pages/<id>.mjs. Project pages share one template.
      const mod = route.project ? projectMod : await import(`./src/pages/${route.id}.mjs`);
      const c = route.project ? { ...ctx, project: route.project } : ctx;
      const footerLinksFor = lang === 'it' ? footerLinks(route) : null;
      const html = page({ lang, t, href, route, layout: mod.layout(c), main: mod.default(c), footerLinks: footerLinksFor });
      writeFile(outPath(lang, route.files[lang]), html);
    }

    // Blog pages: Italian only.
    if (lang === 'it') {
      for (const route of blogRoutes) {
        const mod = await import(`./src/pages/${route.article ? 'article' : 'blog'}.mjs`);
        const c = route.article ? { ...ctx, article: route.article } : ctx;
        const html = page({ lang, t, href, route, layout: mod.layout(c), main: mod.default(c), footerLinks: footerLinks(route) });
        writeFile(outPath(lang, route.files.it), html);
      }
    }
  }

  for (const [file, to] of Object.entries(oldUrls)) writeFile(file, stub(to));
  writeFile('sitemap.xml', sitemap(all, blogRoutes));
  writeFile('robots.txt', `User-agent: *\nDisallow:\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
  if (fs.existsSync(path.join(ROOT, 'CNAME'))) fs.copyFileSync(path.join(ROOT, 'CNAME'), path.join(OUT, 'CNAME'));
  writeFile('.nojekyll', '');
  const count = (d) => fs.readdirSync(d).filter((f) => f.endsWith('.html')).length;
  console.log(`Built ${count(OUT)} root pages (en + stubs) and ${count(path.join(OUT, 'it'))} Italian pages (incl. blog: ${blogRoutes.length - 1} articles) -> dist/`);
}

await build();
