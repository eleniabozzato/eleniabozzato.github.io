// Elenia Bozzato — main.js
// Nav mobile toggle, active nav link, accordion, reviews carousel.
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  function initNav() {
    const toggle = document.querySelector(".nav__toggle");
    const menu = document.querySelector(".nav__menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      const isOpen = menu.getAttribute("data-open") === "true";
      menu.setAttribute("data-open", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(!isOpen));
      document.body.style.overflow = !isOpen ? "hidden" : "";
    });

    // Close menu when a link is clicked (mobile)
    menu.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Esperienze drop-down ----------
     Desktop: opens on hover and on the chevron, closes on mouse leave (short delay),
     Escape, outside click and when focus leaves. Mobile: chevron toggles the sub-list. */
  function initSubmenu() {
    const item = document.querySelector(".nav__item--has-sub");
    if (!item) return;
    const toggle = item.querySelector(".nav__sub-toggle");
    const desktop = window.matchMedia("(min-width: 768px)");
    let timer;

    function setOpen(open) {
      clearTimeout(timer);
      item.setAttribute("data-open", String(open));
      toggle.setAttribute("aria-expanded", String(open));
    }

    // Current project in the list, from the URL filename
    const current = window.location.pathname.split("/").pop() || "index.html";
    let onProject = false;
    item.querySelectorAll(".nav__sublink").forEach(function (link) {
      if (link.getAttribute("href") === current) {
        link.setAttribute("aria-current", "page");
        onProject = true;
      }
    });
    // On a project page the mobile list starts open: sibling projects are one tap away.
    if (onProject && !desktop.matches) setOpen(true);

    toggle.addEventListener("click", function () {
      setOpen(item.getAttribute("data-open") !== "true");
    });
    item.addEventListener("pointerenter", function (e) {
      if (desktop.matches && e.pointerType === "mouse") setOpen(true);
    });
    item.addEventListener("pointerleave", function (e) {
      if (!desktop.matches || e.pointerType !== "mouse") return;
      clearTimeout(timer);
      timer = setTimeout(function () { setOpen(false); }, 200);
    });
    item.addEventListener("focusout", function (e) {
      if (desktop.matches && !item.contains(e.relatedTarget)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || item.getAttribute("data-open") !== "true") return;
      const hadFocus = item.contains(document.activeElement);
      setOpen(false);
      if (hadFocus) toggle.focus();
    });
    document.addEventListener("click", function (e) {
      if (desktop.matches && !item.contains(e.target)) setOpen(false);
    });
    desktop.addEventListener("change", function () { setOpen(false); });
  }

  /* ---------- Active nav link ---------- */
  function initActiveLink() {
    // Project pages set <body data-nav-current="esperienze.html"> to highlight their section.
    const current = document.body.dataset.navCurrent || (window.location.pathname.split("/").pop() || "index.html");
    document.querySelectorAll(".nav__link").forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === current || (current === "" && href === "index.html")) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* ---------- Accordion ----------
     Items start closed and toggle independently (not single-open).
     A link to page.html#<item-id> opens that item and scrolls to it,
     e.g. the home services pills linking into come-lavoro.html. */
  function setAccordionItem(item, open) {
    const trigger = item.querySelector(".accordion__trigger");
    const icon = item.querySelector(".accordion__icon");
    item.setAttribute("data-open", String(open));
    if (trigger) trigger.setAttribute("aria-expanded", String(open));
    if (icon) icon.textContent = open ? "↑" : "↓";
  }

  function openAccordionFromHash() {
    if (!window.location.hash) return;
    const item = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!item || !item.classList.contains("accordion__item")) return;
    setAccordionItem(item, true);
    item.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function initAccordions() {
    document.querySelectorAll(".accordion__item").forEach(function (item) {
      const trigger = item.querySelector(".accordion__trigger");
      if (!trigger) return;
      trigger.addEventListener("click", function () {
        setAccordionItem(item, item.getAttribute("data-open") !== "true");
      });
    });
    openAccordionFromHash();
    window.addEventListener("hashchange", openAccordionFromHash);
  }

  /* ---------- Reviews / gallery carousel ---------- */
  function initCarousels() {
    document.querySelectorAll(".carousel").forEach(function (carousel) {
      const track = carousel.querySelector(".carousel__track");
      const slides = carousel.querySelectorAll(".carousel__slide");
      const prevBtn = carousel.querySelector(".carousel__btn--prev");
      const nextBtn = carousel.querySelector(".carousel__btn--next");
      const dotsWrap = carousel.querySelector(".carousel__dots");
      if (!track || slides.length === 0) return;

      let index = 0;

      // Build dots
      let dots = [];
      if (dotsWrap) {
        dotsWrap.innerHTML = "";
        slides.forEach(function (_, i) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "carousel__dot";
          dot.setAttribute("aria-label", "Vai alla recensione " + (i + 1));
          dot.addEventListener("click", function () {
            goTo(i);
          });
          dotsWrap.appendChild(dot);
        });
        dots = dotsWrap.querySelectorAll(".carousel__dot");
      }

      function update() {
        track.style.transform = "translateX(-" + index * 100 + "%)";
        // Opt-in: size the viewport to the active slide (slides have different lengths)
        if (carousel.classList.contains("carousel--auto-height")) {
          const viewport = carousel.querySelector(".carousel__viewport");
          const card = slides[index].firstElementChild;
          if (viewport && card) viewport.style.height = card.offsetHeight + "px";
        }
        dots.forEach(function (dot, i) {
          dot.setAttribute("aria-current", String(i === index));
        });
      }

      function goTo(i) {
        index = (i + slides.length) % slides.length;
        update();
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          goTo(index - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          goTo(index + 1);
        });
      }

      update();
      window.addEventListener("resize", update);
    });
  }

  // Back-to-top: markup is injected so it stays identical on every page.
  function initToTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.setAttribute("aria-label", "Torna su");
    btn.innerHTML =
      '<svg viewBox="0 0 34 40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 39V3M3 17L17 2l14 15"/></svg>';
    document.body.appendChild(btn);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    function toggle() {
      btn.classList.toggle("is-visible", window.scrollY > window.innerHeight);
    }
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
    });
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initToTop();
    initNav();
    initActiveLink();
    initSubmenu();
    initAccordions();
    initCarousels();
  });
})();
