// Site footer. `links` ({ articles, projects }, Italian pages only) adds the blog and project link lists above the legal line.
// `cta` adds the "Conosciamoci meglio" band above the contact row (not on the contact page).
import * as icons from './icons.mjs';
import { ARROW_RIGHT } from './util.mjs';

export function footer({ t, href, cta = true, links = null }) {
  const f = t.footer;
  const band = cta
    ? `    <div class="footer-cta">
      <div class="container">
        <p class="badge badge--acqua badge--block footer-cta__eyebrow">${f.eyebrow}</p>
        <h2 class="footer-cta__title">${f.title}</h2>
      </div>
    </div>
`
    : '';
  const linkBand = links
    ? `      <div class="footer-links">
        <nav aria-label="${f.links.blogLabel}">
          <p class="footer-links__title">${f.links.blog}</p>
          <ul class="footer-links__list">
${links.articles.map((a) => `            <li><a href="${href.article(a.slug)}">${a.short}</a></li>`).join('\n')}
            <li class="footer-links__all"><a href="${href.blog()}">${f.links.all} ${ARROW_RIGHT}</a></li>
          </ul>
        </nav>
        <nav aria-label="${f.links.projectsLabel}">
          <p class="footer-links__title">${f.links.projects}</p>
          <ul class="footer-links__list">
${links.projects.map((p) => `            <li><a href="${href.project(p)}">${p.navName}</a></li>`).join('\n')}
          </ul>
        </nav>
      </div>
`
    : '';
  return `  <footer class="site-footer">
${band}    <div class="footer-main container">
      <div class="footer-grid">
        <div class="footer-contact">
          <a class="footer-contact__item" href="mailto:hello@eleniabozzato.com">
            <span class="footer-contact__icon" aria-hidden="true">
              ${icons.mail}
            </span>
            <span>hello@eleniabozzato.com</span>
          </a>
          <span class="footer-contact__item">
            <span class="footer-contact__icon" aria-hidden="true">
              ${icons.pin}
            </span>
            <span>${f.city}</span>
          </span>
        </div>
        <div class="footer-social">
          <a class="footer-social__link" href="${href.page('contact')}" data-wa="KzM5MzQwODQyNzU1NA==" aria-label="WhatsApp">
            ${icons.whatsapp}
          </a>
          <a class="footer-social__link" href="https://www.instagram.com/bozzygram97/" target="_blank" rel="noopener" aria-label="Instagram">
            ${icons.instagram}
          </a>
          <a class="footer-social__link" href="https://www.linkedin.com/in/elenia-bozzato/" target="_blank" rel="noopener" aria-label="LinkedIn">
            ${icons.linkedin}
          </a>
        </div>
      </div>
${linkBand}      <p class="footer-legal">${f.legal} • <a href="${href.page('privacy')}">${f.privacy}</a> • ${f.copyright}</p>
    </div>
  </footer>
`;
}
