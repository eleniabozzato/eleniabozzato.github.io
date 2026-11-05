// "Scopri le altre esperienze": a looping marquee with every project except the current one.
// The list is repeated three times; copies after the first are hidden from assistive tech.
import { projectName } from './util.mjs';

const COPIES = 3;

function card({ t, href, p, hidden }) {
  const c = p.card;
  const style = c.style ? ` style="${c.style}"` : '';
  return `            <li class="more-exp__item"${hidden ? ' aria-hidden="true"' : ''}>
              <a class="more-exp__card" href="${href.project(p)}"${hidden ? ' tabindex="-1"' : ''}>
                <span class="more-exp__media"><img src="${c.src}" srcset="${c.srcset}" sizes="340px" alt="" width="${c.width}" height="${c.height}"${style} loading="lazy" /></span>
                <span class="more-exp__body">
                  <span class="project-name more-exp__name">${projectName(p)}</span>
                  <span class="more-exp__desc">${t.services[p.service].title}</span>
                </span>
              </a>
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
