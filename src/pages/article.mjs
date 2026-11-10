// Blog article page (Italian only): /it/blog/<slug>.html, built from src/articles/it/<slug>.md.
import { SITE_URL, absoluteUrl, pageFiles } from '../data/pages.mjs';
import { OG_IMAGE, author } from '../data/schema.mjs';
import { articleUrl, blogIndexUrl } from '../data/articles.mjs';
import { blogCards } from '../partials/blog-card.mjs';
import { projectMarquee } from '../partials/more-exp.mjs';
import { escAttr, jsonLd } from '../partials/util.mjs';

const FALLBACK_IMAGE = OG_IMAGE;

const imageOf = (a, projects) => {
  const p = projects.find((x) => x.key === a.projectKeys[0]);
  return SITE_URL + (p ? p.card.src : FALLBACK_IMAGE);
};

export const layout = ({ article: a, projects, t }) => {
  const url = SITE_URL + articleUrl(a.slug);
  const title = `${a.seoTitle} \u2014 Elenia Bozzato`; // short for search results; the H1 keeps the full title
  const image = imageOf(a, projects);
  const person = author(absoluteUrl('it', pageFiles.it.about));
  return {
    title: escAttr(title),
    description: escAttr(a.description),
    css: 'blog',
    bodyAttrs: ' class="page-blog" data-nav-current="blog"',
    seo: {
      canonical: url,
      og: [
        ['og:title', escAttr(title)],
        ['og:description', escAttr(a.description)],
        ['og:type', 'article'],
        ['og:site_name', 'Elenia Bozzato'],
        ['og:url', url],
        ['og:image', image],
        ['article:published_time', a.date],
      ],
    },
    extra: [
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: a.titlePlain,
        description: a.description,
        datePublished: a.date,
        dateModified: a.date,
        inLanguage: 'it',
        author: person,
        publisher: person,
        isPartOf: { '@type': 'Blog', name: t.blog.eyebrow, url: SITE_URL + blogIndexUrl() },
        wordCount: a.words,
        image,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      }),
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/it/` },
          { '@type': 'ListItem', position: 2, name: t.blog.eyebrow, item: SITE_URL + blogIndexUrl() },
          { '@type': 'ListItem', position: 3, name: a.titlePlain, item: url },
        ],
      }),
    ],
  };
};

export default function article({ t, href, projects, articles, article: a }) {
  const b = t.blog;
  const mine = a.projectKeys.map((k) => projects.find((p) => p.key === k)).filter(Boolean);
  const related = a.related.map((s) => articles.find((x) => x.slug === s)).filter(Boolean);

  // Every project, the article's own first: the reader links the first card to the text. No visible
  // heading on purpose (the article never names the client); the label is for screen readers only.
  const list = [...mine, ...projects.filter((p) => !mine.includes(p))];
  const projectBlock = `
    <!-- PROGETTI -->
    <section class="blog-block blog-block--projects" aria-label="${b.projects}">
${projectMarquee({ t, href, list })}    </section>
`;
  const relatedBlock = related.length
    ? `
    <!-- LEGGI ANCHE -->
    <section class="blog-block" aria-labelledby="blog-related-title">
      <div class="container">
        <h2 class="blog-block__title" id="blog-related-title">${b.related}</h2>
${blogCards({ t, href, articles: related, pad: 8 })}
      </div>
    </section>
`
    : '';

  return `  <main>
    <!-- TESTATA -->
    <header class="blog-head">
      <div class="container">
        <a class="badge badge--acqua blog-head__eyebrow" href="${href.blog()}">${b.eyebrow}</a>
        <h1 class="section-title blog-head__title">${a.title}</h1>
        <p class="blog-head__meta">${a.minutes} ${b.readingTime}</p>
      </div>
    </header>

    <!-- TESTO -->
    <article class="blog-body">
      <div class="container">
        <div class="blog-prose">
${a.html}
        </div>
      </div>
    </article>
${projectBlock}${relatedBlock}  </main>
`;
}
