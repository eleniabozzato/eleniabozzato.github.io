# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Portfolio site for Elenia Bozzato (brand strategy & communication design), served at `www.eleniabozzato.com` via GitHub Pages (`CNAME`). All site copy is in **Italian** — keep full accents and diacritics (è, perché, più, …).

The site is plain static HTML/CSS/vanilla JS. No build step, no package manager, no tests, no linter.

### Redesign in progress (`redesign-2026` branch)

The old site was exported from Mobirise (Bootstrap, embla, `project.mobirise`, many per-project pages). The redesign removes all of that and replaces it with a hand-written site. Pages now in scope:

`index.html`, `chi-sono.html`, `come-lavoro.html`, `esperienze.html`, `contatti.html`, and the project pages `dentisti-cordovado.html`, `al-plan-hotel.html`, `carrozzeria-bozzato.html`, `perform-health.html`, `pulicasa.html` and `paola-nadin.html`. The projects always appear in this order (the client's Word file): in `esperienze.html`, in the "Esperienze" drop-down and in the "Scopri le altre esperienze" sections. The home grid follows the same order

Do not reintroduce Bootstrap or other Mobirise assets. The design reference is the Canva mockup `Sito web Elenia Bozzato.pdf` (CSS comments call it "Canva spec" / "PDF"). PNG slices of it are in `design/mockup/<page>-partN.png`: 1025px wide, 1000px tall, each one overlapping the previous by 100px. Both the PDF and `design/` are git-ignored and exist only locally. If they are missing, ask for the PDF and regenerate the slices with `pdftoppm -r 72`; page order in the PDF is index, chi-sono, come-lavoro, esperienze, dentisti-cordovado, contatti. Use them to compare with screenshots at a 1025px viewport. Desktop must match the mockup. On mobile, change only what is needed to make it responsive.

## Local preview

```sh
docker compose up        # Caddy file server on http://localhost:8080
```

The root `Caddyfile` targets the production host name; `docker-compose.yml` overrides it with a plain `caddy file-server`. Any static server works (e.g. `python3 -m http.server`).

## Architecture

- **No templating.** Header (`.site-header` nav) and footer (`.site-footer`) are copy-pasted in every HTML page. A change to nav, footer, contact info or social links must be applied to every page.
- **CSS has two levels.** `assets/css/style.css` holds tokens, base rules and the components shared by two or more pages. `assets/css/pages/<page>.css` holds only what is specific to one page (`index.css`, `chi-sono.css`, `come-lavoro.css`, `esperienze.css`, `contatti.css`, and `progetto.css` for all project pages). A page file is linked right after `style.css`, in that page only, so its rules need no page prefix. Put a rule in `style.css` only when a second page needs it.
- **Project pages (case studies).** Any project page can be copied as a template. All of them share `assets/css/pages/progetto.css`, scoped by `<body class="page-project" data-nav-current="esperienze.html">` (the data attribute keeps "Esperienze" active in the nav). To add a project: copy a project page, change title, meta, hero, logo, texts, accordion lists and carousel slides, then link it from `esperienze.html` and `index.html`. Do not add per-page CSS. The only per-project style is the hero crop: set `style="--hero-pos: X% Y%"` on the hero `<img>`. If the hero image is only a logo on a flat colour, use `style="--hero-fit: contain; --hero-bg: <that colour>"` so wide screens do not crop it. If the hero already shows the client logo, remove the `.client-logo` block so the logo does not appear twice. Keep the logo slide in the gallery anyway. Al Plan Hotel has its own mockup (`design/mockup/al-plan-hotel-*.png`, from `Pagina progetto Al Plan Hotel.pdf`): its photos are a standalone carousel after the testimonial (`.gallery-carousel--standalone`) instead of a gallery inside "Attività svolte". Every project page ends with a "Scopri le altre esperienze" marquee that lists the other projects; when you add a project, add its card to that section on every project page, and to the "Esperienze" drop-down in the header of every page. Slides are 900×700 WebP (`<project>-slide-N.webp`); the logo is trimmed and exported at 2× its width.
- **`assets/css/style.css`** is organised as a numbered table of contents at the top: fonts, tokens, reset, layout, typography, then components (button, arrow, nav, hero split, accordion, carousel, quote card, footer, back-to-top). Classes are BEM-style (`block__element--modifier`).
  - **Tokens** live in `:root`: colours and gradients, type sizes (`--fs-*`, `--lh-*`), `--line-w`, the spacing scale (`--space-1..4`, `--section-y`), radii, motion (`--dur-*`, `--ease-out`), z-indexes (`--z-*`), component sizes (`--btn-h`, `--social-size`, `--to-top-size`), `--container`, `--gutter`, `--nav-h`. Use a token when one exists; add one only for a value that repeats.
  - **Components are configured with custom properties.** A page does not restyle a component: it sets its variables on a page class, for example `.cl-accordion { --accordion-radius: 47px; --accordion-pt: 1.6rem; }`. The variables are listed in the comment above each component. Badge (`--badge-size`, `--badge-lh`, `--badge-gap`), project name (`--pn-*`) and quote card (`--quote-*`) work the same way.
  - **Media queries sit with their component**, right after its base rules: desktop `≥1024px` (`≥1025px` for the full-bleed rules) and mobile `<768px`. There is no block of responsive rules at the end of the file. A page that sets a variable on desktop must set it again in its mobile block if the value differs.
- **Typography:** Poppins (UI) and Bodoni Moda italic from Google Fonts, linked in each page `<head>`. The CSS also declares `Bauer Bodoni` from `assets/fonts/bauer-bodoni.woff2`, but that folder is currently empty, so Bodoni Moda is the effective fallback. Headline accent words use `<span class="italic-accent italic-accent--magenta|--acqua">WORD</span>`.
- **Desktop scaling.** `assets/js/scale.js` is loaded synchronously in every `<head>`. Between 1025px and 1440px it sets `zoom` on `<html>` so the page keeps the mockup proportions. Above 1440px the zoom stays at 1440/1025 and the layout gets wider than the design. Content stays centred at the design width, while backgrounds, hairlines, the marquee and edge photos run full-bleed. Full-width blocks centre their content with `padding-inline: var(--bleed-pad)`. Use `--bleed` and `--design-w` for custom grids; all three are defined in `:root` at ≥1025px. Write desktop CSS in mockup pixels (1025px wide). Avoid `vw` units, which behave badly under `zoom`. Check each change at 390, 1025, 1440 and 2560.
- **Background glows:** the blurred acqua/pink circles of the mockup are `radial-gradient` backgrounds with the shared stops `var(--glow-acqua)` / `var(--glow-rosa)`. Multiply their sizes by `var(--glow-scale)`, which is `0.6` on mobile. Only the home page has a glow in the header. The home hero photo is a cut-out WebP, and its pink glow is `.hero__media::before`, so it follows the photo when the layout stacks.
- **Buttons:** every `.btn`, every `.pill-card` (home services) and the round footer social links have a gradient and a black border by default: `--grad-social` for `.btn` and social links, `--grad-brand` for `.pill-card`. They turn white on hover and focus. Pages must not override the default fill.
- **Lines and arrows:** every divider, border and icon stroke uses the same thickness, `--line-w` (2px). Use `var(--line-hairline)` or `var(--line-w)`, never a hard-coded width. Every arrow is the same inline SVG, `<svg class="arrow arrow--right|--up" viewBox="…"><path d="…"/></svg>` (accordion, pills, carousels, back-to-top). Its path has a non-scaling stroke, so it stays 2px at any size. Size it with `--arrow-w` / `--arrow-h` set on the `.arrow` element. Never draw an arrow with a mask or a background image, or with a font glyph: their stroke scales with the size.
- **`assets/js/main.js`** — loaded on every page. One IIFE that wires up, by class name: mobile nav toggle, Esperienze drop-down, active nav link (`aria-current` from the URL filename, or from `data-nav-current` on `<body>`), accordions, `.carousel` (reviews/gallery; dots are generated from slides), the injected back-to-top button, and the "more experiences" marquee (`.more-exp__marquee`). The marquee is JS-driven: a scroll container whose `scrollLeft` advances each frame, with swipe, wheel and mouse drag. The markup holds one real set of cards and two `aria-hidden` copies for a seamless loop. Components are activated just by adding the right markup.
- **Accordions:**
  - Items start closed (`data-open="false"`) and toggle independently.
  - The radius is fixed at half the closed height, so a closed item is a pill and opening it does not change its shape. Do not animate `border-radius`.
  - A closed item shows a gradient, set per page with `--accordion-closed-bg`. Opening fades the gradient out and turns the title from ink into gradient text, all with shared transitions in `style.css`. The arrow is an `.arrow--up` SVG that turns 180° when closed.
  - Page CSS sets only the accordion variables (padding, title size, radius, body text). For the closed state use `--accordion-pb-closed`, not `height`, so the animation stays smooth.
  - A link to `page.html#<item-id>` opens that item and scrolls to it. The home services pills use this to link to `come-lavoro.html`.
  - Keep `overflow: clip` on items and `body`, never `hidden`: `hidden` breaks `scroll-margin-top` and the sticky header.
- **`assets/js/contact-form.js`** — only on `contatti.html`. The form is sent to [PostTo](https://postto.dev/docs), a hosted form service; there is no backend in this repo.
  - **Endpoint:** the form's `action` (`https://postto.dev/api/v1/send/<token>`), so the form also works as a plain HTML POST without JS.
  - **Submit:** the script validates the fields and requires a Cloudflare Turnstile token. It then POSTs `FormData` with `Accept: application/json`, which makes PostTo answer in JSON instead of redirecting, and maps PostTo `error` codes to Italian messages.
  - **Field names** `name`, `email`, `message` and `subject` are PostTo's auto-mapped names; keep them.
  - **PostTo reserved fields:** `_hp` is the honeypot and must stay hidden and empty; `cf-turnstile-response` is added by the widget.
  - **Turnstile:** the site key is in `contatti.html`; the secret key lives in the PostTo endpoint settings (Anti-spam → Cloudflare Turnstile).
- **Images** live in `assets/img/` with descriptive kebab-case names (`<page>-<subject>.jpg`). Set explicit `width`/`height` and `loading="lazy"` below the fold, and write Italian `alt` text.
