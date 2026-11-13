// Tiny Markdown -> HTML converter for the blog subset (see CLAUDE.md, "Blog"):
// paragraphs, ## and ### headings, - and 1. lists, > quote, **bold**, *italic*, [text](target).
// Raw HTML is escaped. `resolve(target)` turns page:/project:/article: targets into URLs (or throws).

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function inline(text, resolve) {
  return esc(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, target) => {
      const url = resolve(target);
      const external = /^https?:\/\//.test(url);
      return `<a href="${url.replace(/"/g, '&quot;')}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*(?!\*)/g, '$1<em>$2</em>');
}

export function markdown(src, resolve) {
  const out = [];
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  let i = 0;
  const blank = (l) => !l.trim();
  while (i < lines.length) {
    const line = lines[i];
    if (blank(line)) { i++; continue; }
    let m;
    if ((m = line.match(/^(##|###) +(.+)$/))) {
      const tag = m[1] === '##' ? 'h2' : 'h3';
      out.push(`<${tag}>${inline(m[2].trim(), resolve)}</${tag}>`);
      i++;
    } else if (/^[-*] +/.test(line) || /^\d+\. +/.test(line)) {
      const ordered = /^\d+\. +/.test(line);
      const re = ordered ? /^\d+\. +(.*)$/ : /^[-*] +(.*)$/;
      const items = [];
      while (i < lines.length && (m = lines[i].match(re))) { items.push(`<li>${inline(m[1].trim(), resolve)}</li>`); i++; }
      out.push(`<${ordered ? 'ol' : 'ul'}>\n${items.join('\n')}\n</${ordered ? 'ol' : 'ul'}>`);
    } else if (/^> ?/.test(line)) {
      const parts = [];
      while (i < lines.length && /^> ?/.test(lines[i])) { parts.push(lines[i].replace(/^> ?/, '').trim()); i++; }
      out.push(`<blockquote><p>${inline(parts.join(' '), resolve)}</p></blockquote>`);
    } else {
      const parts = [];
      while (i < lines.length && !blank(lines[i]) && !/^(#{2,3} |[-*] +|\d+\. +|> ?)/.test(lines[i])) { parts.push(lines[i].trim()); i++; }
      out.push(`<p>${inline(parts.join(' '), resolve)}</p>`);
    }
  }
  return out.join('\n');
}

// Plain text of a Markdown/HTML fragment (for word counts).
export const plainText = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&\w+;/g, ' ');
