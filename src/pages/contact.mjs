// Contact page. The form posts to PostTo (see assets/js/contact-form.js); field names are PostTo's, keep them.

export const layout = ({ t }) => ({
  title: t.contact.meta.title,
  description: t.contact.meta.description,
  css: 'contatti',
  extra: ['<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>'],
  scripts: ['<script src="assets/js/contact-form.js"></script>'],
  footerCta: false,
});

export default function contact({ t }) {
  const c = t.contact;
  return `  <main>
    <section class="contact-layout">
      <div class="contact-layout__media">
        <img src="assets/img/contatti-elenia-borraccia-1600.webp" srcset="assets/img/contatti-elenia-borraccia-800.webp 800w, assets/img/contatti-elenia-borraccia-1600.webp 1600w" sizes="(min-width: 768px) 50vw, 100vw" alt="${c.imgAlt}" width="1600" height="2400" />
      </div>
      <div class="contact-layout__form-wrap">
        <h1>${c.title}</h1>
        <p class="lead">${c.lead}</p>

        <form id="contact-form" action="https://postto.dev/api/v1/send/ep_tbREgrjT2wVeVuEz" method="POST" novalidate>
          <input type="hidden" name="subject" value="${c.subject}" />
          <!-- PostTo honeypot: bots fill it, people never see it -->
          <div hidden>
            <label for="hp">${c.honeypot}</label>
            <input type="text" id="hp" name="_hp" tabindex="-1" autocomplete="off" />
          </div>
          <div class="contact-form__row">
            <div class="form-field">
              <input type="text" id="name" name="name" placeholder=" " autocomplete="name" required />
              <label for="name" class="form-field__label">${c.name}</label>
            </div>
            <div class="form-field">
              <input type="email" id="email" name="email" placeholder=" " autocomplete="email" required />
              <label for="email" class="form-field__label">${c.email}</label>
            </div>
          </div>
          <div class="form-field">
            <textarea id="message" name="message" placeholder=" " required></textarea>
            <label for="message" class="form-field__label">${c.message}</label>
          </div>

          <div class="cf-turnstile" data-sitekey="0x4AAAAAAEXuN4r8L4k5cfyu" data-action="contact" data-appearance="interaction-only"></div>

          <button type="submit" class="btn">${c.submit}</button>
          <p class="form-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>
  </main>
`;
}
