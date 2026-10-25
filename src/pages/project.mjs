// Template for every project page (one markup, content from src/data/projects.mjs + the i18n file).
import { accordionItem } from '../partials/accordion.mjs';
import { gallery } from '../partials/gallery.mjs';
import { moreExp } from '../partials/more-exp.mjs';
import { attr, projectName } from '../partials/util.mjs';

export const layout = ({ t, project: p, pageFiles }) => ({
  title: t.projects[p.key].meta.title,
  description: t.projects[p.key].meta.description,
  css: 'progetto',
  bodyAttrs: ` class="page-project" data-nav-current="${pageFiles.experience}"`,
});

const paragraphs = (list) => list.map((x) => `                  <p>${x}</p>`).join('\n');

export default function project({ t, href, projects, project: p }) {
  const c = t.projects[p.key];
  const pp = t.projectPage;
  const h = p.hero;
  const names = pp.accordion;

  const logo = p.logo
    ? `    <!-- LOGO CLIENTE -->
    <div class="client-logo${p.logo.mod ? ` ${p.logo.mod}` : ''}">
      <img src="${p.logo.src}" alt="${c.logoAlt}" width="${p.logo.width}" height="${p.logo.height}" loading="lazy" />
    </div>

`
    : '';

  const inlineGallery =
    p.gallery?.where === 'inline'
      ? `\n\n${gallery({ t, slides: p.gallery.slides, alts: c.slides, pad: 18 })}`
      : '';
  const standaloneGallery =
    p.gallery?.where === 'standalone'
      ? `\n\n        <!-- GALLERIA FOTOGRAFICA -->\n${gallery({ t, slides: p.gallery.slides, alts: c.slides, mod: 'gallery-carousel--standalone', pad: 8 })}`
      : '';

  const activities = `                  <ul>\n${c.activities.map((x) => `                    <li>${x}</li>`).join('\n')}\n                  </ul>${inlineGallery}`;
  const items = [
    [names.context, paragraphs(c.context)],
    [names.needs, paragraphs(c.needs)],
    [names.role, paragraphs(c.role)],
    [names.activities, activities],
    [names.results, paragraphs(c.results)],
  ]
    .map(([title, body]) => accordionItem({ title, body, pad: 10 }))
    .join('\n');

  return `  <main>
    <!-- HERO -->
    <section class="hero-split hero-split--glow">
      <div class="hero-split__text">
        <span class="badge badge--acqua hero-split__eyebrow">${t.experienceLabel}</span>
        <h1 class="project-name hero-split__project-name">${projectName(p)}</h1>
        <p class="hero-split__tagline">${c.tagline}</p>
      </div>
      <div class="hero-split__media">
        <img src="${h.src}" srcset="${h.srcset}" sizes="(min-width: 768px) 50vw, 100vw" alt="${c.heroAlt}" width="${h.width}" height="${h.height}"${attr('style', h.style)} />
      </div>
    </section>

${logo}    <!-- ACCORDION BLOCCHI -->
    <section class="section">
      <div class="container">
        <div class="accordion">
${items}
        </div>

        <!-- TESTIMONIAL -->
        <div class="quote-card testimonial-card">
          <p class="quote-card__quote">${c.testimonial.quote}</p>
          <p class="quote-card__author">${c.testimonial.author}</p>
          <p class="quote-card__role">${c.testimonial.role}</p>
        </div>${standaloneGallery}
      </div>
    </section>
${moreExp({ t, href, projects, current: p })}  </main>
`;
}
