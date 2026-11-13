# Blog articles

One Markdown file per article, Italian only for now. The build skips files starting with `_` (unless `BLOG_SAMPLES=1`) and this README.

## File format

```
---
order: 1
slug: brand-manager-esterno
title: Cosa fa un <em-magenta>BRAND MANAGER</em-magenta> esterno per una piccola impresa
seo: Brand manager esterno: cosa fa e quando serve
short: Cosa fa un brand manager esterno
description: 140–160 caratteri, con le parole che la gente cerca, scritto per il risultato di Google.
projects: dentisti, alplan
related: coordinare-fornitori-comunicazione, comunicazione-studio-dentistico
date: 2026-11-04
---

Primo paragrafo: la risposta in due o tre frasi.

## Un sottotitolo

Testo...
```

- `order`: position in every list (blog index, footer, related). Follows the order of the projects on the site.
- `title`: the H1. Exactly ONE accent span, `<em-magenta>…</em-magenta>` or `<em-acqua>…</em-acqua>`, around the UPPERCASE key words (same style as the site headlines). The colour you pick is not kept: the build gives the articles magenta and acqua in turn, by their place in the blog index, and the "Approfondimento" eyebrow takes the other colour. In the `<title>` tag and JSON-LD the build strips the tags and writes the words in normal case — so write the accent words in UPPERCASE in the source anyway.
- `seo`: optional, plain text, ≤ 52 characters. The `<title>` and `og:title` (the build adds " — Elenia Bozzato"); the H1 keeps `title`. Search keyword first, because Google cuts the end. Without it the build uses the plain `title`.
- `short`: ≤ 32 characters, plain text, used in the footer and in compact links.
- `description`: meta description, plain text, 140–160 characters, no quotes.
- `projects`: comma-separated project keys from `src/data/projects.mjs` (`dentisti, alplan, carrozzeria, perform, pulicasa, paola`), or empty. The page ends with a marquee of all projects, these first and with no heading.
- `related`: 2–3 slugs of other articles (cross links "Leggi anche").
- `date`: always `2026-11-04` (go-live). Not shown on the page; used only in the JSON-LD, `article:published_time` and the sitemap.

## Markdown subset (the build supports only this)

Paragraphs, `## ` and `### ` headings (no `#`: the H1 is the title), `- ` bullet lists, `1. ` numbered lists, `**bold**`, `*italic*`, `> ` blockquote (one paragraph), links `[text](target)`.
Link targets — never write a file name by hand:
- `page:home|about|how|experience|contact` → static pages (Italian versions),
- `article:<slug>` → another article,
- `page:how#<anchor>` works for the "Come lavoro" accordion items: `direzione-brand`, `brand-identity`, `formazione-consulenza`.
- External links: full `https://` URL (avoid unless essential).
No raw HTML in the body, no images in the body.

## Writing rules (SEO)

- **Never name the client** in the text: describe it and link the project with that description as anchor, e.g. `[uno studio dentistico che seguo](project:dentisti)`. The project marquee at the end repeats the link. The build warns if a body contains a client name.
- **Teach, don't replace the consultation.** Explain how the work is done and why (culture of the field), enough to spark curiosity and show the method; leave the decision on the reader's own case to a conversation.
- **One search query per article**, different from every other article (no two articles on the same query). Put it in the title, the first paragraph and the description.
- **Open with the answer** in two or three sentences, then go deeper.
- **Only real facts.** Cases, quotes and results come from the project texts in `src/i18n/it.json`. No invented numbers or anecdotes; an invented example must say so.
- **Something only Elenia can say** in every article: a real case, a checklist or a clear opinion. Generic advice alone is not enough.
- **Vary the structure.** Not every H2 is a question; endings differ.
- **Local:** Friuli Venezia Giulia and Veneto, at most once or twice per article and only where it is natural.
- **Links:** 2–3 `article:` links and, where it fits, one `page:how#<anchor>` to the matching service.
- Length: about 650–900 words.

