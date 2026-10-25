// "Come lavoro" page. The three service accordions come from the shared services list.
import { services } from '../data/projects.mjs';
import { accordionItem } from '../partials/accordion.mjs';

export const layout = ({ t }) => ({
  title: t.how.meta.title,
  description: t.how.meta.description,
  css: 'come-lavoro',
});

export default function how({ t }) {
  const c = t.how;
  const items = services
    .map((s) => {
      const item = c.services.items[s.key];
      const paragraphs = item.paragraphs.map((x) => `                  <p>${x}</p>`);
      const list = item.list
        ? [`                  <ul>`, ...item.list.map((x) => `                    <li>${x}</li>`), `                  </ul>`]
        : [];
      return accordionItem({ title: t.services[s.key].title, id: s.anchor, body: [...paragraphs, ...list].join('\n'), pad: 10 });
    })
    .join('\n');

  return `  <main>
    <!-- HERO -->
    <section class="hero-split cl-hero">
      <div class="hero-split__media">
        <img src="assets/img/come-lavoro-elenia-1600.webp" srcset="assets/img/come-lavoro-elenia-800.webp 800w, assets/img/come-lavoro-elenia-1600.webp 1600w" sizes="(min-width: 768px) 50vw, 100vw" alt="${c.hero.imgAlt}" width="1600" height="2400" />
      </div>
      <div class="hero-split__text">
        <h1>${c.hero.title}</h1>
        <p class="cl-hero__lead">${c.hero.lead}</p>
        <p>${c.hero.p1}</p>
        <h2>${c.hero.roleTitle}</h2>
        <p>${c.hero.p2}</p>
        <p>${c.hero.p3}</p>
      </div>
    </section>

    <!-- SERVIZI -->
    <section class="section cl-services">
      <div class="container">
        <div class="section__head">
          <span class="badge badge--acqua">${c.services.badge}</span>
          <h2 class="section-title">${c.services.title}</h2>
        </div>
        <div class="accordion cl-accordion">
${items}
        </div>
      </div>
    </section>

    <!-- MODALITÀ DI LAVORO -->
    <section class="cl-method">
      <div class="container">
        <span class="badge">${c.method.badge}</span>
        <h2>${c.method.title}</h2>
        <p>${c.method.text}</p>
      </div>
    </section>
  </main>
`;
}
