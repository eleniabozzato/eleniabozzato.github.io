// Accordion item. `body` is the HTML placed inside .accordion__panel-content (already indented).
import { ARROW_UP } from './util.mjs';

export function accordionItem({ title, body, id, pad }) {
  const p = ' '.repeat(pad);
  return `${p}<div class="accordion__item"${id ? ` id="${id}"` : ''} data-open="false">
${p}  <button class="accordion__trigger" aria-expanded="false">
${p}    <span>${title}</span>
${p}    ${ARROW_UP}
${p}  </button>
${p}  <div class="accordion__panel">
${p}    <div class="accordion__panel-inner">
${p}      <div class="accordion__panel-content">
${body}
${p}      </div>
${p}    </div>
${p}  </div>
${p}</div>`;
}
