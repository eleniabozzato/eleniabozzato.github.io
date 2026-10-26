// "Scopri le altre esperienze": a looping marquee with every project except the current one.
// The list is repeated three times; copies after the first are hidden from assistive tech.
import { projectName } from './util.mjs';

const COPIES = 3;

// The project card (also used by the blog articles): <a class="more-exp__card"> with photo, name and service.
export function projectCard({ t, href, p, hidden = false, pad = 14 }) {
  const c = p.card;
  const sp = ' '.repeat(pad);
  const style = c.style ? ` style="${c.style}"` : '';
  return `${sp}<a class="more-exp__card" href="${href.project(p)}"${hidden ? ' tabindex="-1"' : ''}>
${sp}  <span class="more-exp__media"><img src="${c.src}" srcset="${c.srcset}" sizes="340px" alt="" width="${c.width}" height="${c.height}"${style} loading="lazy" /></span>
${sp}  <span class="more-exp__body">
${sp}    <span class="project-name more-exp__name">${projectName(p)}</span>
${sp}    <span class="more-exp__desc">${t.services[p.service].title}</span>
${sp}  </span>
${sp}</a>`;
}

function card({ t, href, p, hidden }) {
  return `            <li class="more-exp__item"${hidden ? ' aria-hidden="true"' : ''}>
${projectCard({ t, href, p, hidden })}
            </li>`;
}

export function moreExp({ t, href, projects, current }) {
  const others = projects.filter((p) => p.key !== current.key);
  const items = [];
  for (let i = 0; i < COPIES; i++) for (const p of others) items.push(card({ t, href, p, hidden: i > 0 }));
  return `    <!-- ALTRE ESPERIENZE -->
    <section class="section more-exp" aria-labelledby="more-exp-title">
      <div class="section__head more-exp__head">
        <span class="badge badge--acqua">${t.moreExp.eyebrow}</span>
        <h2 class="section-title" id="more-exp-title">${t.moreExp.title}</h2>
      </div>
      <div class="more-exp__marquee">
        <ul class="more-exp__track">
${items.join('\n')}
        </ul>
      </div>
    </section>
`;
}
