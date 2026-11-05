// Blog article page (Italian only): /it/blog/<slug>.html, built from src/articles/it/<slug>.md.
import { SITE_URL } from '../data/pages.mjs';
import { articleUrl, blogIndexUrl } from '../data/articles.mjs';
import { blogCards } from '../partials/blog-card.mjs';
import { projectCard } from '../partials/more-exp.mjs';
import { escAttr, jsonLd } from '../partials/util.mjs';

const FALLBACK_IMAGE = '/assets/img/home-hero-elenia.webp';

const imageOf = (a, projects) => {
  const p = projects.find((x) => x.key === a.projectKeys[0]);
  return SITE_URL + (p ? p.card.src : FALLBACK_IMAGE);
};

export const layout = ({ article: a, projects, t }) => {
  const url = SITE_URL + articleUrl(a.slug);
  const title = `${a.titlePlain} \u2014 Elenia Bozzato`;
  const image = imageOf(a, projects);
  const person = { '@type': 'Person', name: 'Elenia Bozzato', url: `${SITE_URL}/` };
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

  const projectBlock = mine.length
    ? `
    <!-- IL PROGETTO -->
    <section class="blog-block" aria-labelledby="blog-projects-title">
      <div class="container">
        <h2 class="blog-block__title" id="blog-projects-title">${mine.length > 1 ? b.projects : b.project}</h2>
        <ul class="blog-projects">
${mine.map((p) => `          <li>\n${projectCard({ t, href, p, pad: 12 })}\n          </li>`).join('\n')}
        </ul>
      </div>
    </section>
`
    : '';
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
