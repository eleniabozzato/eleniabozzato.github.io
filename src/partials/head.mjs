// <head> shared by every page. `css` is the page-specific stylesheet, `extra` any additional tags.
// `seo` = { canonical, alternates: [{ lang, url }], defaultUrl, locale, redirectTo } (on the 404 page only `redirectTo` is set: no canonical or hreflang).
// `redirectTo` is set on English pages only: the first script in <head> sends first-time Italian
// browsers to the same page under /it/. A stored choice (localStorage.lang) stops it.
const LOCALE = { en: 'en_US', it: 'it_IT' };

export function head({ lang, title, description, css, extra = [], seo, noindex }) {
  const pageCss = css ? `  <link rel="stylesheet" href="/assets/css/pages/${css}.css" />\n` : '';
  const redirect = seo?.redirectTo
    ? `  <script>var l;try{l=localStorage.lang}catch(e){}if(!l&&/^it/i.test((navigator.languages&&navigator.languages[0])||navigator.language||""))location.replace("${seo.redirectTo}"+location.search+location.hash)</script>\n`
    : '';
  const robots = noindex ? `  <meta name="robots" content="noindex" />\n` : '';
  const links = seo?.canonical
    ? `  <link rel="canonical" href="${seo.canonical}" />
${seo.alternates.map((a) => `  <link rel="alternate" hreflang="${a.lang}" href="${a.url}" />\n`).join('')}  <link rel="alternate" hreflang="x-default" href="${seo.defaultUrl}" />
  <meta property="og:locale" content="${LOCALE[lang]}" />
`
    : '';
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${redirect}  <title>${title}</title>
  <meta name="description" content="${description}" />
${robots}${links}  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900&family=Bodoni+Moda:ital,wght@1,400;1,500;1,600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/css/style.css" />
  <script src="/assets/js/scale.js"></script>
${pageCss}  <link rel="icon" href="/assets/img/logo-elenia.png" type="image/png" />
${extra.map((l) => `  ${l}\n`).join('')}</head>
`;
}
