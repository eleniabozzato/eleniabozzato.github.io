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

  /* ---------- Active nav link ---------- */
  function initActiveLink() {
    const current = (window.location.pathname.split("/").pop() || "index.html");
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

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initActiveLink();
    initAccordions();
    initCarousels();
  });
})();
