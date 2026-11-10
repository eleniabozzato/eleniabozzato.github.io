// Article card (blog index and "Leggi anche"): title, description and an arrow.
// Same border, radius and hover as the project cards. The accent word alternates magenta / acqua
// card by card, whatever colour the article's own title uses.
import { ARROW_RIGHT } from './util.mjs';

export function blogCards({ t, href, articles, mod = '', pad = 10 }) {
  const p = ' '.repeat(pad);
  const items = articles
    .map(
      (a, i) => `${p}  <li>
${p}    <a class="blog-card" href="${href.article(a.slug)}">
${p}      <span class="blog-card__title">${a.title.replace(/italic-accent--(acqua|magenta)/, i % 2 ? 'italic-accent--acqua' : 'italic-accent--magenta')}</span>
${p}      <span class="blog-card__desc">${a.description}</span>
${p}      ${ARROW_RIGHT}
${p}    </a>
${p}  </li>`,
    )
    .join('\n');
  return `${p}<ul class="blog-cards${mod ? ` ${mod}` : ''}">\n${items}\n${p}</ul>`;
}
