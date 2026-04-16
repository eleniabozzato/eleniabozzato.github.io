(function () {
  var TRUNCATE_LENGTH = 330;

  var section = document.getElementById("slider6-3f");
  if (!section) return;

  var container = section.querySelector(".embla__container");
  if (!container) return;

  var autoPlayTimer = null;
  var embla = null;

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(function () {
      if (!document.hidden && embla) {
        if (embla.scrollProgress() !== 1) {
          embla.scrollNext();
        } else {
          embla.scrollTo(0);
        }
      }
    }, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function collapseAllReviews() {
    var expanded = container.querySelectorAll(".review-text.is-expanded");
    for (var i = 0; i < expanded.length; i++) {
      var p = expanded[i];
      p.querySelector(".review-full").style.display = "none";
      p.querySelector(".review-truncated").style.display = "";
      p.querySelector(".review-toggle-btn").style.display = "block";
      p.querySelector(".review-collapse-btn").style.display = "none";
      p.classList.remove("is-expanded");
    }
  }

  fetch("recensioni.txt")
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      var parts = text.split(/\n[ \t]*\n/);
      parts = parts.filter(function (p) {
        return p.trim() !== "";
      });

      if (parts.length % 2 !== 0) {
        section.style.display = "none";
        console.error(
          "Recensioni: dati non validi, numero di blocchi dispari (" +
            parts.length +
            "). Controllare il file recensioni.txt.",
        );
        return;
      }

      container.innerHTML = "";
      container.style.alignItems = "flex-start";

      for (var i = 0; i < parts.length; i += 2) {
        var author = parts[i].trim();
        var content = parts[i + 1].trim();
        var isLong = content.length > TRUNCATE_LENGTH;

        var slide = document.createElement("div");
        slide.className = "embla__slide slider-image item";
        slide.style.marginLeft = "1rem";
        slide.style.marginRight = "1rem";

        var slideContent = document.createElement("div");
        slideContent.className = "slide-content";

        var itemContent = document.createElement("div");
        itemContent.className = "item-content";

        var authorEl = document.createElement("h6");
        authorEl.className = "item-subtitle mbr-fonts-style mt-1 display-7";
        authorEl.innerHTML = "<strong>" + escapeHtml(author) + "</strong>";

        var textEl = document.createElement("p");
        textEl.className =
          "mbr-text mbr-fonts-style mt-3 display-7 review-text";

        if (isLong) {
          var truncatedSpan = document.createElement("span");
          truncatedSpan.className = "review-truncated";
          truncatedSpan.textContent =
            content.slice(0, TRUNCATE_LENGTH) + "\u2026";

          var fullSpan = document.createElement("span");
          fullSpan.className = "review-full";
          fullSpan.textContent = content;
          fullSpan.style.display = "none";

          var toggleBtn = document.createElement("button");
          toggleBtn.className = "review-toggle-btn";
          toggleBtn.type = "button";
          toggleBtn.textContent = "mostra di pi\u00f9";
          toggleBtn.style.cssText =
            "display:block;background:none;border:none;padding:0;margin-top:0.5rem;" +
            "cursor:pointer;font:inherit;font-weight:600;text-decoration:underline;" +
            "width:100%;text-align:center;";

          var collapseBtn = document.createElement("button");
          collapseBtn.className = "review-collapse-btn";
          collapseBtn.type = "button";
          collapseBtn.textContent = "mostra meno";
          collapseBtn.style.cssText =
            "display:none;background:none;border:none;padding:0;margin-top:0.5rem;" +
            "cursor:pointer;font:inherit;font-weight:600;text-decoration:underline;" +
            "width:100%;text-align:center;";

          toggleBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            var p = this.parentNode;
            p.querySelector(".review-truncated").style.display = "none";
            p.querySelector(".review-full").style.display = "";
            p.querySelector(".review-toggle-btn").style.display = "none";
            p.querySelector(".review-collapse-btn").style.display = "block";
            p.classList.add("is-expanded");
            stopAutoPlay();
          });

          collapseBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            var p = this.parentNode;
            p.querySelector(".review-truncated").style.display = "";
            p.querySelector(".review-full").style.display = "none";
            p.querySelector(".review-toggle-btn").style.display = "block";
            p.querySelector(".review-collapse-btn").style.display = "none";
            p.classList.remove("is-expanded");
            startAutoPlay();
          });

          textEl.appendChild(truncatedSpan);
          textEl.appendChild(fullSpan);
          textEl.appendChild(toggleBtn);
          textEl.appendChild(collapseBtn);
        } else {
          textEl.textContent = content;
        }

        itemContent.appendChild(authorEl);
        itemContent.appendChild(textEl);
        slideContent.appendChild(itemContent);
        slide.appendChild(slideContent);
        container.appendChild(slide);
      }

      // Initialize Embla carousel
      var viewport = section.querySelector(".embla__viewport");
      embla = EmblaCarousel(viewport, {
        align: "center",
        skipSnaps: true,
        containScroll: "trimSnaps",
        loop: true,
        draggable: true,
      });

      var prevBtn = section.querySelector(".embla__button--prev");
      var nextBtn = section.querySelector(".embla__button--next");

      function updateButtons() {
        if (embla.canScrollPrev()) {
          prevBtn.removeAttribute("disabled");
        } else {
          prevBtn.setAttribute("disabled", "disabled");
        }
        if (embla.canScrollNext()) {
          nextBtn.removeAttribute("disabled");
        } else {
          nextBtn.setAttribute("disabled", "disabled");
        }
      }

      function resumeCarousel() {
        collapseAllReviews();
        startAutoPlay();
      }

      prevBtn.addEventListener(
        "click",
        function () {
          collapseAllReviews();
          embla.scrollPrev();
          startAutoPlay();
        },
        false,
      );

      nextBtn.addEventListener(
        "click",
        function () {
          collapseAllReviews();
          embla.scrollNext();
          startAutoPlay();
        },
        false,
      );

      embla.on("select", function () {
        updateButtons();
      });
      embla.on("init", updateButtons);

      startAutoPlay();
    });
})();
