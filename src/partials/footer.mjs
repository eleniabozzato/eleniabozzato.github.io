// Site footer. `cta` adds the "Conosciamoci meglio" band above the contact row (not on the contact page).
import * as icons from './icons.mjs';

export function footer({ t, href, cta = true }) {
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
      <p class="footer-legal">${f.legal}</p>
    </div>
  </footer>
`;
}
