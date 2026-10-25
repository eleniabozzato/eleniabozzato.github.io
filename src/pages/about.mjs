// "Chi sono" page.
import { accordionItem } from '../partials/accordion.mjs';

export const layout = ({ t }) => ({
  title: t.about.meta.title,
  description: t.about.meta.description,
  css: 'chi-sono',
});

export default function about({ t }) {
  const c = t.about;
  const items = c.values.items
    .map((v) => accordionItem({ title: v.title, body: `                <p>${v.text}</p>`, pad: 8 }))
    .join('\n');

  return `  <main class="cs">
    <!-- HERO full-bleed photo -->
    <section class="cs-hero">
      <img src="assets/img/chi-sono-elenia-bambina-1600.webp" srcset="assets/img/chi-sono-elenia-bambina-800.webp 800w, assets/img/chi-sono-elenia-bambina-1600.webp 1600w" sizes="100vw" alt="${c.hero.imgAlt}" width="1600" height="899" />
    </section>

    <!-- MI RACCONTO -->
    <section class="cs-story">
      <span class="badge badge--block cs-badge">${c.story.badge}</span>
      <h2 class="cs-h2">${c.story.title}</h2>
      <p>${c.story.p1}</p>
      <p>${c.story.p2}</p>
      <h3 class="cs-h3">${c.story.subtitle}</h3>
      <p class="cs-story__tight">${c.story.tight}</p>
      <p>${c.story.p3}</p>
    </section>

    <!-- CREATIVITÀ E STRATEGIA -->
    <section class="cs-split">
      <div class="cs-split__media">
        <img src="assets/img/chi-sono-elenia-laptop-1600.webp" srcset="assets/img/chi-sono-elenia-laptop-800.webp 800w, assets/img/chi-sono-elenia-laptop-1600.webp 1600w" sizes="(min-width: 768px) 50vw, 100vw" alt="${c.split.imgAlt}" width="1600" height="2400" loading="lazy" />
      </div>
      <div class="cs-split__text">
        <h2 class="badge badge--acqua badge--block cs-eyebrow">${c.split.eyebrow}</h2>
        <p>${c.split.p1}</p>
        <p>${c.split.p2}</p>
        <p class="cs-split__lead">${c.split.lead}</p>
        <p class="cs-split__closing">${c.split.closing}</p>
      </div>
    </section>

    <!-- VALORI -->
    <section class="cs-values">
      <span class="badge badge--block cs-badge">${c.values.badge}</span>
      <div class="accordion cs-accordion">
${items}
      </div>

      <div class="cs-vm">
        <div class="cs-card">
          <h3 class="cs-card__title">${c.values.vision.title}</h3>
          <p>${c.values.vision.text}</p>
        </div>
        <div class="cs-card">
          <h3 class="cs-card__title">${c.values.mission.title}</h3>
          <p>${c.values.mission.text}</p>
        </div>
      </div>
    </section>
  </main>
`;
}
