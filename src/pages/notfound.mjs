// 404 page (built in both languages; GitHub Pages serves the root one for unknown URLs).

export const layout = ({ t }) => ({
  title: t.notFound.meta.title,
  description: t.notFound.meta.description,
  css: 'not-found',
  footerCta: false,
});

export default function notFound({ t, href }) {
  const c = t.notFound;
  return `  <main class="not-found">
    <span class="badge badge--acqua">${c.eyebrow}</span>
    <h1>${c.title}</h1>
    <p>${c.text}</p>
    <a class="btn" href="${href.page('home')}">${c.button}</a>
  </main>
`;
}
