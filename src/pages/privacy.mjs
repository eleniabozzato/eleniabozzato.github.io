// Privacy and cookie policy: one page, texts in src/i18n (`privacy`). Each section is a list of
// blocks: an HTML string becomes a paragraph (or is kept as is if it already starts with a tag),
// `{ table: { head, rows } }` becomes a table.

import { indent } from '../partials/util.mjs';

export const layout = ({ t }) => ({
  title: t.privacy.meta.title,
  description: t.privacy.meta.description,
  css: 'privacy',
});

const block = (b) => {
  if (b.table) {
    const head = b.table.head.map((h) => `<th scope="col">${h}</th>`).join('');
    const rows = b.table.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n      ');
    return `<div class="legal__table">
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>`;
  }
  return b.startsWith('<') ? b : `<p>${b}</p>`;
};

export default function privacy({ t }) {
  const c = t.privacy;
  const toc = c.sections.map((s) => `<li><a href="#${s.id}">${s.title}</a></li>`).join('\n          ');
  const sections = c.sections
    .map(
      (s, i) => `      <section class="legal__section" id="${s.id}">
        <h2>${i + 1}. ${s.title}</h2>
        ${indent(s.body.map(block).join('\n'), 8)}
      </section>`,
    )
    .join('\n');
  return `  <main class="legal container">
    <span class="badge badge--acqua">${c.eyebrow}</span>
    <h1>${c.title}</h1>
    <p class="legal__updated">${c.updated}</p>
    ${c.intro.map(block).join('\n    ')}

    <div class="legal__summary">
      <h2>${c.summary.title}</h2>
      <ul>
        ${c.summary.items.map((li) => `<li>${li}</li>`).join('\n        ')}
      </ul>
    </div>

    <nav class="legal__toc" aria-label="${c.tocLabel}">
      <ol>
          ${toc}
      </ol>
    </nav>

${sections}
  </main>
`;
}
