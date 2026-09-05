/* Runs in the head, before the stylesheet paints anything: a choice stored
   from a previous visit has to be on the root element by the time the first
   frame is drawn, or the page flashes the other theme first.
   No choice stored means no attribute, which leaves it to the system. */
(function () {
  try {
    var t = localStorage.getItem('poytaxt-theme');
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {
    /* private mode, or storage refused: the system preference still applies */
  }
})();
