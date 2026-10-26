// Image carousel (wired by assets/js/main.js through the .carousel class).
import { ARROW_RIGHT } from './util.mjs';

export function gallery({ t, slides, alts, mod = '', pad }) {
  const p = ' '.repeat(pad);
  const cls = `carousel gallery-carousel${mod ? ` ${mod}` : ''}`;
  const items = slides
    .map(
      (s, i) => `${p}      <div class="carousel__slide">
${p}        <img src="${s.src}" alt="${alts[i]}" width="${s.width}" height="${s.height}" loading="lazy" />
${p}      </div>`,
    )
    .join('\n');
  return `${p}<div class="${cls}">
${p}  <button class="carousel__btn carousel__btn--prev" aria-label="${t.gallery.prev}">${ARROW_RIGHT}</button>
${p}  <div class="carousel__viewport">
${p}    <div class="carousel__track">
${items}
${p}    </div>
${p}  </div>
${p}  <button class="carousel__btn carousel__btn--next" aria-label="${t.gallery.next}">${ARROW_RIGHT}</button>
${p}</div>`;
}
