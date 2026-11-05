// "Esperienze" page: photo grid of every project.
import { attr, projectName } from '../partials/util.mjs';

export const layout = ({ t }) => ({
  title: t.experience.meta.title,
  description: t.experience.meta.description,
  css: 'esperienze',
});

export default function experience({ t, href, projects }) {
  const cells = projects
    .map((p) => {
      const i = p.listImg;
      return `        <div class="exp-photo-grid__cell">
          <div class="exp-photo-grid__media">
            <img src="${i.src}" srcset="${i.srcset}" sizes="(min-width: 768px) 50vw, 100vw" alt="${t.projects[p.key].listAlt}" width="${i.width}" height="${i.height}"${attr('loading', i.loading)} />
          </div>
          <div class="exp-photo-grid__body">
            <span class="badge badge--acqua">${t.experienceLabel}</span>
            <h3 class="project-name exp-photo-grid__title">${projectName(p)}</h3>
            <p class="exp-photo-grid__desc">${t.services[p.service].title}</p>
            <a class="btn" href="${href.project(p)}">${t.goToProject}</a>
          </div>
        </div>`;
    })
    .join('\n');
  return `  <main class="page-esperienze">
    <section class="exp-page-grid">
      <div class="exp-photo-grid">
${cells}
      </div>
    </section>

  </main>
`;
}
