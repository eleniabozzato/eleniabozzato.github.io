(function () {
  var section = document.getElementById('slider6-3f');
  if (!section) return;

  var container = section.querySelector('.embla__container');
  if (!container) return;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  fetch('recensioni.txt')
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      var parts = text.split(/\n[ \t]*\n/);
      parts = parts.filter(function (p) {
        return p.trim() !== '';
      });

      if (parts.length % 2 !== 0) {
        section.style.display = 'none';
        console.error(
          'Recensioni: dati non validi, numero di blocchi dispari (' +
            parts.length +
            '). Controllare il file recensioni.txt.'
        );
        return;
      }

      container.innerHTML = '';

      for (var i = 0; i < parts.length; i += 2) {
        var author = parts[i].trim();
        var content = parts[i + 1].trim();

        var slide = document.createElement('div');
        slide.className = 'embla__slide slider-image item';
        slide.style.marginLeft = '1rem';
        slide.style.marginRight = '1rem';
        slide.innerHTML =
          '<div class="slide-content">' +
          '<div class="item-content">' +
          '<h6 class="item-subtitle mbr-fonts-style mt-1 display-7">' +
          '<strong>' +
          escapeHtml(author) +
          '</strong>' +
          '</h6>' +
          '<p class="mbr-text mbr-fonts-style mt-3 display-7">' +
          escapeHtml(content) +
          '</p>' +
          '</div>' +
          '</div>';

        container.appendChild(slide);
      }

      // Initialize Embla carousel
      var viewport = section.querySelector('.embla__viewport');
      var embla = EmblaCarousel(viewport, {
        align: 'center',
        skipSnaps: true,
        containScroll: 'trimSnaps',
        loop: true,
        draggable: true,
      });

      var prevBtn = section.querySelector('.embla__button--prev');
      var nextBtn = section.querySelector('.embla__button--next');

      function updateButtons() {
        if (embla.canScrollPrev()) {
          prevBtn.removeAttribute('disabled');
        } else {
          prevBtn.setAttribute('disabled', 'disabled');
        }
        if (embla.canScrollNext()) {
          nextBtn.removeAttribute('disabled');
        } else {
          nextBtn.setAttribute('disabled', 'disabled');
        }
      }

      prevBtn.addEventListener('click', embla.scrollPrev, false);
      nextBtn.addEventListener('click', embla.scrollNext, false);
      embla.on('select', updateButtons);
      embla.on('init', updateButtons);

      // Auto play every 5 seconds
      setInterval(function () {
        if (!document.hidden) {
          if (embla.scrollProgress() !== 1) {
            embla.scrollNext();
          } else {
            embla.scrollTo(0);
          }
        }
      }, 5000);
    });
})();
