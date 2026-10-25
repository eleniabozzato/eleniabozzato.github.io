// Site header with the main nav. The "Esperienze" entry has a drop-down listing every project.

export function header({ t, href, projects }) {
  const n = t.nav;
  const subs = projects
    .map((p) => `            <li><a class="nav__sublink" href="${href.project(p)}">${p.navName}</a></li>`)
    .join('\n');
  return `  <header class="site-header">
    <nav class="nav container" aria-label="${n.label}">
      <a href="${href.page('home')}" class="nav__brand">
        <img src="assets/img/logo-elenia.png" alt="${n.brandAlt}" width="38" height="38" />
        <span>${n.brand}</span>
      </a>
      <button class="nav__toggle" aria-label="${n.openMenu}" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav__menu" data-open="false">
        <li><a class="nav__link" href="${href.page('home')}">${n.home}</a></li>
        <li><a class="nav__link" href="${href.page('about')}">${n.about}</a></li>
        <li><a class="nav__link" href="${href.page('how')}">${n.how}</a></li>
        <li class="nav__item nav__item--has-sub" data-open="false">
          <a class="nav__link" href="${href.page('experience')}">${n.experience}</a>
          <button class="nav__sub-toggle" type="button" aria-label="${n.showProjects}" aria-expanded="false" aria-controls="nav-progetti"></button>
          <ul class="nav__sub" id="nav-progetti">
${subs}
          </ul>
        </li>
        <li><a class="nav__link" href="${href.page('contact')}">${n.contact}</a></li>
      </ul>
    </nav>
  </header>
`;
}
