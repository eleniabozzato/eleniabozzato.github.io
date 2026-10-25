// Home page.
import { services } from '../data/projects.mjs';
import { ARROW_RIGHT, projectName } from '../partials/util.mjs';

export const layout = ({ t }) => ({
  title: t.home.meta.title,
  description: t.home.meta.description,
  css: 'index',
  bodyAttrs: ' class="page-home"',
});

// The marquee repeats the keyword list four times; only the first copy is read by assistive tech.
const strip = (words) =>
  [0, 1, 2, 3]
    .flatMap((copy) =>
      words.map((w) => `        <span${copy ? ' aria-hidden="true"' : ''}>${w}</span><span class="strip__dot" aria-hidden="true">•</span>`),
    )
    .join('\n');

export default function home({ t, href, projects }) {
  const c = t.home;
  const pills = services
    .map(
      (s) => `          <a class="pill-card" href="${href.page('how')}#${s.anchor}">
            <span>${t.services[s.key].title}</span>
            <svg class="pill-card__arrow arrow arrow--right" viewBox="0 0 40 24" aria-hidden="true"><path d="M1 12h37M27 1l11 11-11 11"/></svg>
          </a>`,
    )
    .join('\n');
  const cells = projects
    .map(
      (p) => `          <div class="exp-grid__cell">
            <span class="badge badge--acqua">${t.experienceLabel}</span>
            <h3 class="project-name exp-grid__title">${projectName(p)}</h3>
            <p class="exp-grid__desc">${t.services[p.service].title}</p>
            <a class="btn" href="${href.project(p)}">${t.goToProject}</a>
          </div>`,
    )
    .join('\n');
  const reviews = c.reviews.items
    .map(
      (r) => `              <div class="carousel__slide">
                <div class="quote-card">
                  <p class="quote-card__quote">${r.quote}</p>
                  <p class="quote-card__author">${r.author}</p>${r.role ? `\n                  <p class="quote-card__role">${r.role}</p>` : ''}
                </div>
              </div>`,
    )
    .join('\n');

  return `  <main>
    <!-- HERO -->
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__content">
          <span class="badge">${c.hero.badge}</span>
          <h1>${c.hero.title}</h1>
          <p>${c.hero.text}</p>
        </div>
        <div class="hero__media">
          <img src="/assets/img/home-hero-elenia.webp" srcset="/assets/img/home-hero-elenia-600.webp 612w, /assets/img/home-hero-elenia.webp 960w" sizes="(max-width: 767px) 327px, 516px" alt="${c.hero.imgAlt}" width="960" height="952" />
        </div>
      </div>
    </section>

    <!-- STRIP (marquee orizzontale) -->
    <div class="strip">
      <div class="strip__track">
${strip(c.strip)}
      </div>
    </div>

    <!-- QUESTION -->
    <section class="question container">
      <h2>${c.question.title}</h2>
      <p>${c.question.text}</p>
    </section>

    <!-- MI RACCONTO -->
    <section class="split-section">
      <div class="split">
        <div class="split__media">
          <img src="/assets/img/home-elenia-libro-1600.webp" srcset="/assets/img/home-elenia-libro-800.webp 800w, /assets/img/home-elenia-libro-1600.webp 1600w" sizes="(min-width: 768px) 50vw, 100vw" alt="${c.about.imgAlt}" width="1600" height="2400" loading="lazy" />
        </div>
        <div class="split__text">
          <span class="badge badge--acqua">${c.about.badge}</span>
          <h2>${c.about.title}</h2>
          <p>${c.about.p1}</p>
          <p>${c.about.p2}</p>
          <p>${c.about.p3}</p>
          <a href="${href.page('about')}" class="btn">${c.about.button}</a>
        </div>
      </div>
    </section>

    <!-- SERVIZI -->
    <section class="section section--servizi">
      <div class="container">
        <div class="section__head">
          <span class="badge">${c.services.badge}</span>
          <h2 class="section-title">${c.services.title}</h2>
        </div>
        <div class="pill-grid">
${pills}
        </div>
      </div>
    </section>

    <!-- ESPERIENZE -->
    <section class="exp-section">
      <div class="exp-grid">
${cells}
      </div>
    </section>

    <!-- RECENSIONI -->
    <section class="section section--reviews">
      <div class="container">
        <div class="section__head">
          <span class="badge">${c.reviews.badge}</span>
          <h2 class="section-title section-title--lg">${c.reviews.title}</h2>
        </div>
        <div class="carousel carousel--auto-height">
          <button class="carousel__btn carousel__btn--prev" aria-label="${c.reviews.prev}">${ARROW_RIGHT}</button>
          <div class="carousel__viewport">
            <div class="carousel__track">
${reviews}
            </div>
          </div>
          <button class="carousel__btn carousel__btn--next" aria-label="${c.reviews.next}">${ARROW_RIGHT}</button>
          <div class="carousel__dots"></div>
        </div>
        <div class="section-cta-center">
          <a href="https://share.google/PEHOc0yjuxqGu4sWu" class="btn" target="_blank" rel="noopener">${c.reviews.button}</a>
        </div>
      </div>
    </section>
  </main>
`;
}
