// Elenia Bozzato — scale.js
// The design is drawn at 1025px. Between 1025px and 1440px the whole page is
// zoomed so it stays identical to the mockup; above 1440px the zoom stops and
// body is centred at the design width (see .body max-width in style.css).
// Loaded synchronously in <head> to avoid a flash of the unscaled layout.
(function () {
  "use strict";

  var DESIGN_WIDTH = 1025;
  var MAX_WIDTH = 1440;
  var root = document.documentElement;

  function applyScale() {
    // Measure unzoomed: clientWidth excludes the scrollbar, innerWidth does not.
    root.style.zoom = "";
    var vw = root.clientWidth || window.innerWidth;
    var zoom = vw > DESIGN_WIDTH ? Math.min(vw, MAX_WIDTH) / DESIGN_WIDTH : 1;
    root.style.zoom = zoom === 1 ? "" : String(zoom);
  }

  applyScale();
  window.addEventListener("resize", applyScale);
})();
