/* ==========================================================================
   Poytaxt Taxi - site behaviour
   Replaces jQuery, bootstrap.js and Owl Carousel. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- sticky header state ---------------------------------------------
     IntersectionObserver on a sentinel instead of a scroll listener, so the
     main thread stays free while scrolling. */
  function initHeader() {
    var header = document.querySelector('.header');
    var sentinel = document.querySelector('.header-sentinel');
    if (!header || !sentinel) return;

    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* --- mobile navigation ------------------------------------------------ */
  function initNav() {
    var burger = document.querySelector('.burger');
    var nav = document.querySelector('.nav');
    if (!burger || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }

    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      nav.classList.toggle('is-open', !open);
      burger.setAttribute('aria-expanded', String(!open));
      document.body.classList.toggle('nav-open', !open);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    // a resize past the breakpoint must not leave the sheet stuck open
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
      if (e.matches) close();
    });
  }

  /* --- scroll reveal ----------------------------------------------------
     Communicates hierarchy: content settles as the section is read.
     Skipped wholesale under reduced motion. */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* --- fleet carousel ---------------------------------------------------
     Transform-driven, keyboard operable, pauses on hover and when the tab
     is hidden. Autoplay is off entirely under reduced motion. */
  function initFleet() {
    var root = document.querySelector('[data-carousel]');
    if (!root) return;

    var track = root.querySelector('.fleet__track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.fleet__slide'));
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.fleet__tab'));
    var prev = root.querySelector('[data-carousel-prev]');
    var next = root.querySelector('[data-carousel-next]');
    if (!track || slides.length < 2) return;

    var index = 0;
    var timer = null;
    var DELAY = 5000;

    function render() {
      track.style.transform = 'translate3d(' + (-index * 100) + '%, 0, 0)';
      slides.forEach(function (slide, i) {
        slide.setAttribute('aria-hidden', String(i !== index));
      });
      tabs.forEach(function (tab, i) {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
    }

    function go(to) {
      index = (to + slides.length) % slides.length;
      render();
    }

    function start() {
      if (reduceMotion || timer) return;
      timer = window.setInterval(function () { go(index + 1); }, DELAY);
    }

    function stop() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    function restart() { stop(); start(); }

    if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(index + 1); restart(); });

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { go(i); restart(); });
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1); restart(); }
      if (e.key === 'ArrowRight') { go(index + 1); restart(); }
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    // touch swipe
    var startX = 0;
    var startY = 0;
    root.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      stop();
    }, { passive: true });

    root.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
      start();
    }, { passive: true });

    render();
    start();
  }

  /* --- route board ------------------------------------------------------
     Districts are rendered from the same i18n data the booking form uses,
     so the two can never disagree. Re-renders on language change. */
  function initRoutes() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-region]'));
    if (!panels.length || !window.i18n) return;

    function render() {
      panels.forEach(function (panel) {
        var region = panel.getAttribute('data-region');
        var keys = window.i18n.districtKeys[region] || [];
        var nameEl = panel.querySelector('[data-region-name]');
        var countEl = panel.querySelector('[data-region-count]');
        var chipsEl = panel.querySelector('[data-region-chips]');

        if (nameEl) nameEl.textContent = window.i18n.t('region.' + region);
        if (countEl) countEl.textContent = keys.length;
        if (!chipsEl) return;

        chipsEl.textContent = '';
        keys.forEach(function (key) {
          var chip = document.createElement('span');
          chip.className = 'chip';
          chip.textContent = window.i18n.t('district.' + key);
          chipsEl.appendChild(chip);
        });
      });
    }

    render();
    window.addEventListener('languageChanged', render);
  }

  /* --- current year in the footer --------------------------------------- */
  function initYear() {
    var el = document.querySelector('[data-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  function init() {
    initHeader();
    initNav();
    initReveal();
    initFleet();
    initRoutes();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
