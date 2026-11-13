// Blog index (Italian only): /it/blog/. All articles in one list, in `order`.
import { SITE_URL, absoluteUrl, pageFiles } from '../data/pages.mjs';
import { OG_IMAGE, author, breadcrumbs } from '../data/schema.mjs';
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
        ['og:site_name', 'Elenia Bozzato'],
        ['og:url', url],
        ['og:image', SITE_URL + OG_IMAGE],
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
        author: author(absoluteUrl('it', pageFiles.it.about)),
        blogPost: articles.map((a) => ({
          '@type': 'BlogPosting',
          headline: a.titlePlain,
          url: SITE_URL + articleUrl(a.slug),
          datePublished: a.date,
        })),
      }),
      jsonLd(breadcrumbs([['Home', `${SITE_URL}/it/`], [t.blog.eyebrow, url]])),
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
