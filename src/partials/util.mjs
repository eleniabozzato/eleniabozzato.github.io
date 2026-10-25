// Small markup helpers shared by templates and partials.

export const ARROW_RIGHT = '<svg class="arrow arrow--right" viewBox="0 0 40 24" aria-hidden="true"><path d="M1 12h37M27 1l11 11-11 11"/></svg>';
export const ARROW_UP = '<svg class="accordion__icon arrow arrow--up" viewBox="0 0 34 40" aria-hidden="true"><path d="M17 39V3M3 17L17 2l14 15"/></svg>';

// Headline accent word: <span class="italic-accent italic-accent--magenta">WORD</span>
export const accent = (word, color = 'magenta') =>
  `<span class="italic-accent italic-accent--${color}">${word}</span>`;

// Project name: "Dentisti <accent>CORDOVADO</accent>"; some names are a single accent word.
export const projectName = (p) =>
  `${p.name.plain ? `${p.name.plain} ` : ''}${accent(p.name.accent)}`;

// Optional attribute: returns ` name="value"` or an empty string.
export const attr = (name, value) => (value == null ? '' : ` ${name}="${value}"`);

// Indent every line after the first by `n` spaces (used to nest multi-line partials).
export const indent = (s, n) => s.split('\n').map((l, i) => (i && l ? ' '.repeat(n) + l : l)).join('\n');
