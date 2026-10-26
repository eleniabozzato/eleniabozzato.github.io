# Blog articles

One Markdown file per article, Italian only for now. The build skips files starting with `_` (unless `BLOG_SAMPLES=1`) and this README.

## File format

```
---
order: 1
slug: brand-manager-esterno
title: Cosa fa un <em-magenta>BRAND MANAGER</em-magenta> esterno per una piccola impresa
short: Cosa fa un brand manager esterno
description: 140–160 caratteri, con le parole che la gente cerca, scritto per il risultato di Google.
theme: direzione
projects: dentisti, alplan
related: comunicazione-frammentata, quando-fare-rebranding
date: 2026-11-04
---

Primo paragrafo: la risposta in due o tre frasi.

## Un sottotitolo

Testo...
```

- `order`: position in every list (blog index, footer, related). Follows the order of the projects on the site.
- `title`: the H1. Exactly ONE accent span, `<em-magenta>…</em-magenta>` or `<em-acqua>…</em-acqua>`, around the UPPERCASE key words (same style as the site headlines). In the `<title>` tag and JSON-LD the build strips the tags and writes the words in normal case — so write the accent words in UPPERCASE in the source anyway.
- `short`: ≤ 32 characters, plain text, used in the footer and in compact links.
- `description`: meta description, plain text, 140–160 characters, no quotes.
- `theme`: `direzione` | `rebranding` | `identity` | `professionisti` (section of the blog index).
- `projects`: comma-separated project keys from `src/data/projects.mjs` (`dentisti, alplan, carrozzeria, perform, pulicasa, paola`), or empty.
- `related`: 2–3 slugs of other articles (cross links "Leggi anche").
- `date`: always `2026-11-04` (go-live).

## Markdown subset (the build supports only this)

Paragraphs, `## ` and `### ` headings (no `#`: the H1 is the title), `- ` bullet lists, `1. ` numbered lists, `**bold**`, `*italic*`, `> ` blockquote (one paragraph), links `[text](target)`.
Link targets — never write a file name by hand:
- `page:home|about|how|experience|contact` → static pages (Italian versions),
- `project:<key>` → a project page, e.g. `project:dentisti`,
- `article:<slug>` → another article,
- `page:how#<anchor>` works for the "Come lavoro" accordion items: `direzione-brand`, `brand-identity`, `formazione-consulenza`.
- External links: full `https://` URL (avoid unless essential).
No raw HTML in the body, no images in the body (the template adds the project card).

Theme labels for the blog index: direzione = "Direzione del brand", rebranding = "Rebranding", identity = "Brand identity", professionisti = "Professionisti".
