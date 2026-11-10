// Blog articles: src/articles/it/<slug>.md (front matter + Markdown, format in CLAUDE.md "Blog").
// Italian only. Invalid files are skipped with a warning, so a half-written article never breaks the build.
// Files starting with "_" are ignored unless BLOG_SAMPLES=1.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdown, plainText } from './markdown.mjs';
import { pageFiles, urlPath } from './pages.mjs';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'articles', 'it');
const warn = (m) => console.warn(`warning: articles: ${m}`);

export const WORDS_PER_MIN = 200;

const KEYWORD = /<em-(acqua|magenta)>([\s\S]*?)<\/em-\1>/g;
export const expandTitle = (s) => s.replace(KEYWORD, '<span class="italic-accent italic-accent--$1">$2</span>');
// Plain title: tags stripped, accent words in normal case (first letter kept if the title starts with them).
export const plainTitle = (s) =>
  s.replace(KEYWORD, (m, _c, w, off) => (off === 0 ? w.charAt(0) + w.slice(1).toLowerCase() : w.toLowerCase()));

export const blogIndexUrl = () => urlPath('it', 'blog/');
export const articleFile = (slug) => `blog/${slug}.html`;
export const articleUrl = (slug) => urlPath('it', articleFile(slug));

function parseFile(file, projects) {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8').replace(/\r\n?/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error('missing front matter');
  const fm = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue;
    const kv = line.match(/^([a-z]+):\s*(.*)$/);
    if (!kv) throw new Error(`bad front matter line "${line}"`);
    fm[kv[1]] = kv[2].trim();
  }
  for (const k of ['order', 'slug', 'title', 'short', 'description', 'date']) if (!fm[k]) throw new Error(`missing "${k}"`);
  const slug = file.replace(/\.md$/, '');
  if (fm.slug !== slug) throw new Error(`slug "${fm.slug}" differs from file name`);
  if (!Number.isFinite(Number(fm.order))) throw new Error('order is not a number');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) throw new Error('date must be YYYY-MM-DD');
  const list = (v) => (v ? v.split(',').map((x) => x.trim()).filter(Boolean) : []);
  return { fm, slug, body: m[2], list, projectKeys: new Set(projects.map((p) => p.key)) };
}

export function loadArticles(projects) {
  if (!fs.existsSync(DIR)) return [];
  const samples = process.env.BLOG_SAMPLES === '1';
  const clientNames = [...projects.map((p) => p.navName), 'Al Plan', 'Consulab', 'Consu.Lab'];
  const articles = [];
  for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).sort()) {
    if (file.startsWith('_') && !samples) continue;
    try {
      const { fm, slug, body, list, projectKeys } = parseFile(file, projects);
      const a = {
        order: Number(fm.order), slug, titleRaw: fm.title, title: expandTitle(fm.title), titlePlain: plainTitle(fm.title),
        short: fm.short, seoTitle: fm.seo || plainTitle(fm.title), description: fm.description, date: fm.date,
        projectKeys: list(fm.projects), related: list(fm.related), body,
      };
      if (a.seoTitle.length > 52) warn(`${file}: "seo" is ${a.seoTitle.length} characters (max 52)`);
      if (a.short.length > 32) warn(`${file}: "short" is ${a.short.length} characters (max 32)`);
      if (a.description.length < 120 || a.description.length > 170) warn(`${file}: description is ${a.description.length} characters (aim for 140-160)`);
      if ((fm.title.match(KEYWORD) || []).length !== 1) warn(`${file}: the title needs exactly one accent span`);
      for (const k of a.projectKeys) if (!projectKeys.has(k)) { warn(`${file}: unknown project "${k}"`); }
      // The text never names a client: it links the project with a descriptive anchor ("uno studio che seguo").
      const prose = body.replace(/\]\([^)]*\)/g, ']').toLowerCase(); // link targets are not text
      for (const n of clientNames) if (prose.includes(n.toLowerCase())) warn(`${file}: the text names the client "${n}"`);
      a.projectKeys = a.projectKeys.filter((k) => projectKeys.has(k));
      articles.push(a);
    } catch (e) {
      warn(`skipped ${file}: ${e.message}`);
    }
  }
  articles.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  const bySlug = new Map(articles.map((a) => [a.slug, a]));

  // Link targets: page:<id>[#anchor], project:<key>, article:<slug>, or an https:// URL.
  const projectByKey = new Map(projects.map((p) => [p.key, p]));
  const resolver = (file) => (target) => {
    let m;
    if (/^https?:\/\//.test(target)) return target;
    if ((m = target.match(/^page:([a-z]+)(?:#(.+))?$/)) && pageFiles.it[m[1]]) return urlPath('it', pageFiles.it[m[1]]) + (m[2] ? `#${m[2]}` : '');
    if ((m = target.match(/^project:(.+)$/)) && projectByKey.has(m[1])) return urlPath('it', `${projectByKey.get(m[1]).slug}.html`);
    if ((m = target.match(/^article:(.+)$/)) && bySlug.has(m[1])) return articleUrl(m[1]);
    warn(`${file}: unresolved link target "${target}"`);
    return blogIndexUrl();
  };
  for (const a of articles) {
    a.related = a.related.filter((s) => (bySlug.has(s) && s !== a.slug) || (warn(`${a.slug}.md: related "${s}" not found`), false));
    a.html = markdown(a.body, resolver(`${a.slug}.md`));
    a.minutes = Math.max(1, Math.ceil(plainText(a.html).split(/\s+/).filter(Boolean).length / WORDS_PER_MIN));
  }
  return articles;
}
