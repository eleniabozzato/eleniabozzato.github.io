// The page map: for every page, its file name in each language. Every internal link is built from it.
// Static pages are listed here; project pages come from projects.mjs (same slug in both languages).
// Layout of dist/: English at the root, Italian under /it/.

export const langs = ['en', 'it'];
export const DEFAULT_LANG = 'en';
export const SITE_URL = 'https://www.eleniabozzato.com';
const PREFIX = { en: '/', it: '/it/' };

export const pageFiles = {
  en: {
    home: 'index.html',
    about: 'about.html',
    how: 'how-i-work.html',
    experience: 'experience.html',
    contact: 'contact.html',
    notfound: '404.html',
  },
  it: {
    home: 'index.html',
    about: 'chi-sono.html',
    how: 'come-lavoro.html',
    experience: 'esperienze.html',
    contact: 'contatti.html',
    notfound: '404.html',
  },
};

// Every page as a route: { id, files: { en, it }, project? }. `notfound` is built but not indexed.
export function routes(projects) {
  const statics = Object.keys(pageFiles.en).map((id) => ({
    id,
    files: { en: pageFiles.en[id], it: pageFiles.it[id] },
  }));
  const projectRoutes = projects.map((p) => ({
    id: `project:${p.slug}`,
    project: p,
    files: { en: `${p.slug}.html`, it: `${p.slug}.html` },
  }));
  return [...statics, ...projectRoutes];
}

// Site path of a file: '/about.html', '/it/chi-sono.html'. The home page is the folder itself ('/', '/it/').
export const urlPath = (lang, file) => (file === 'index.html' ? PREFIX[lang] : `${PREFIX[lang]}${file}`);
export const outPath = (lang, file) => PREFIX[lang].slice(1) + file;
export const absoluteUrl = (lang, file) => SITE_URL + urlPath(lang, file);

// Link helpers for one language, passed to every template as `href`.
export function linkHelpers(lang) {
  return {
    page: (id, hash = '') => urlPath(lang, pageFiles[lang][id]) + (hash ? `#${hash}` : ''),
    project: (p) => urlPath(lang, `${p.slug}.html`),
  };
}

// Old URLs of the Mobirise site -> closest new page (language-neutral stubs at the root).
// perform-health.html and carrozzeria-bozzato.html exist with the same name, so they need no stub.
export const oldUrls = {
  'brand-identity-perform-health.html': '/perform-health.html',
  'brand-identity-carrozzeria-bozzato.html': '/carrozzeria-bozzato.html',
  'page1.html': '/',
  'cordovado-medievale.html': '/experience.html',
  'ferragosto-fossaltese.html': '/experience.html',
  'grafica-pubblicitaria--ferragosto-fossaltese.html': '/experience.html',
  'prodotti-editoriali-rivista-calendario-semplice-risolviamo.html': '/experience.html',
  'terre-agricolae.html': '/experience.html',
  'the-jennings-hotel.html': '/experience.html',
  'web-design-the-jennings-hotel.html': '/experience.html',
};
