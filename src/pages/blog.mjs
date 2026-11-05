// Blog index (Italian only): /it/blog/. All articles in one list, in `order`.
import { SITE_URL } from '../data/pages.mjs';
import { articleUrl, blogIndexUrl } from '../data/articles.mjs';
import { blogCards } from '../partials/blog-card.mjs';
import { escAttr, jsonLd } from '../partials/util.mjs';

export const layout = ({ t, articles }) => {
  const m = t.blog.index.meta;
  const url = SITE_URL + blogIndexUrl();
  return {
    title: escAttr(m.title),
    description: escAttr(m.description),
    css: 'blog',
    bodyAttrs: ' class="page-blog" data-nav-current="blog"',
    seo: {
      canonical: url,
      og: [
        ['og:title', escAttr(m.title)],
        ['og:description', escAttr(m.description)],
        ['og:type', 'website'],
        ['og:url', url],
        ['og:image', `${SITE_URL}/assets/img/home-hero-elenia.webp`],
      ],
    },
    extra: [
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Approfondimenti',
        description: m.description,
        url,
        inLanguage: 'it',
        author: { '@type': 'Person', name: 'Elenia Bozzato', url: `${SITE_URL}/` },
        blogPost: articles.map((a) => ({
          '@type': 'BlogPosting',
          headline: a.titlePlain,
          url: SITE_URL + articleUrl(a.slug),
          datePublished: a.date,
        })),
      }),
    ],
  };
};

export default function blog({ t, href, articles }) {
  const b = t.blog;
  const list = `    <section class="blog-block blog-list" aria-label="${b.index.listLabel}">
      <div class="container">
${blogCards({ t, href, articles, mod: 'blog-cards--2', pad: 8 })}
      </div>
    </section>`;
  return `  <main>
    <header class="blog-head">
      <div class="container">
        <h1 class="section-title blog-head__title">${b.index.title}</h1>
        <p class="blog-head__intro">${b.index.intro}</p>
      </div>
    </header>

${list}
  </main>
`;
}
