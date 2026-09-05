/* ==========================================================================
   Poytaxt Taxi - preview behaviour. No dependencies.
   Everything degrades to a static, readable page.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * Chequer field                                                      *
   *                                                                    *
   * The logo's mark - a 4 x 3 cluster of squares - laid out so each     *
   * cluster is empty on all four sides and meets its neighbours only    *
   * at the corners. The chequer runs at two scales: squares within a    *
   * cluster, clusters within the field.                                *
   *                                                                    *
   * Only the dark squares are painted; the light ones are the page      *
   * showing through, so the board sits on the real background.          *
   *                                                                    *
   * The changeover is a slow crossfade across the whole field at once:  *
   * the dark clusters fade out while the empty blocks fade in, over a    *
   * couple of seconds. The two boards never share a cell, so the ink     *
   * one loses is exactly the ink the other gains and nothing doubles up. *
   *                                                                    *
   * It is only visible where it is lit: a pool over the hero copy and   *
   * one under the pointer. Two prebuilt tiles, one fillRect a frame.    *
   * ------------------------------------------------------------------ */
  function initChecker() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-checker]'), makeChecker);
  }

  function makeChecker(canvas) {
    var host = canvas.parentElement;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    // where the pool sits is the canvas's own business: in the hero it is the
    // copy column, because the car already carries the other side
    var anchor = document.querySelector(canvas.dataset.checker || '.hero__copy');
    // a second element may listen in on the light's position - the section
    // above the footer continues its glow across the seam
    var echo = canvas.dataset.checkerEcho ? document.querySelector(canvas.dataset.checkerEcho) : null;

    var COLS = 4, ROWS = 3;   // the cluster, as measured off the logo
    var PEAK = 0.97;          // strength of the pool around the carousel
    var CYCLE = 8;            // seconds from one changeover to the next
    var FADE = 1.5;           // seconds the changeover takes

    // read off the stylesheet rather than written here, so the board turns
    // with the theme instead of needing its own pair of values
    // read once per build, not per frame: getComputedStyle in paint() would
    // cost a style resolve sixty times a second
    var WIDE = 1.3, RAD = 0.7, FLOOR = 0, DRIFT = 0;

    // where the ball has wandered to, as an offset from where the anchor
    // puts it, plus the direction it is going
    var ox = 0, oy = 0, vx = 0, vy = 0;
    var litX = -1, litY = -1;
    function num(name, dflt) {
      var v = parseFloat(getComputedStyle(canvas).getPropertyValue(name));
      return isNaN(v) ? dflt : v;
    }

    function ink() {
      // off this canvas, not off the root: custom properties inherit, so a
      // section can set --checker on itself and its board follows
      var v = getComputedStyle(canvas).getPropertyValue('--checker');
      return v.trim() || '#cee1f5';
    }
    var DARK = ink();

    var sq = 8;
    var tileW = 0, tileH = 0;
    var tiles = [null, null];
    var mask = null, mctx = null;
    var mw = 0, mh = 0;
    var dpr = 1;
    var w = 0, h = 0;
    var raf = null;
    var prev = 0;

    function ease(x) {
      x = x < 0 ? 0 : (x > 1 ? 1 : x);
      return 0.5 - 0.5 * Math.cos(Math.PI * x);
    }

    var pool = null;

    // one board: clusters on one diagonal, nothing on the other
    function buildTile(alt) {
      var t = document.createElement('canvas');
      t.width = Math.round(tileW * dpr);
      t.height = Math.round(tileH * dpr);
      var c = t.getContext('2d');
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.fillStyle = DARK;

      for (var br = 0; br < 2; br++) {
        for (var bc = 0; bc < 2; bc++) {
          if ((br + bc) % 2 !== (alt ? 1 : 0)) continue;

          for (var row = 0; row < ROWS; row++) {
            for (var col = 0; col < COLS; col++) {
              if ((row + col) % 2 !== 1) continue;   // light squares are the page
              c.fillRect((bc * COLS + col) * sq, (br * ROWS + row) * sq, sq, sq);
            }
          }
        }
      }
      return t;
    }

    function measurePool() {
      if (!anchor) { pool = null; return; }
      var hr = host.getBoundingClientRect();
      var ar = anchor.getBoundingClientRect();
      if (!ar.width) { pool = null; return; }
      pool = {
        x: ar.left - hr.left + ar.width / 2,
        // biased well below centre: the copy column carries a lot of top
        // padding, so its box centre sits high above the text the pool is
        // meant to sit behind
        y: ar.top - hr.top + ar.height * 0.67,
        r: Math.max(ar.width, ar.height) * RAD
      };
    }

    function build() {
      var rect = host.getBoundingClientRect();
      w = Math.round(rect.width);
      h = Math.round(rect.height);
      if (!w || !h) return;

      WIDE = num('--checker-w', 1.3);
      RAD = num('--checker-r', 0.7);
      FLOOR = num('--checker-floor', 0);
      DRIFT = num('--checker-drift', 0);

      if (DRIFT > 0 && !vx && !vy) {
        // a shallow angle, so it crosses the width more often than the
        // height - on a band this shape a steep one just bounces
        var ang = (Math.random() * 0.6 + 0.2) * (Math.random() < 0.5 ? 1 : -1);
        var dir = Math.random() < 0.5 ? 1 : -1;
        vx = Math.cos(ang) * DRIFT * dir;
        vy = Math.sin(ang) * DRIFT;
      }

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      sq = Math.max(3, Math.round(num('--checker-sq', w < 700 ? 7 : 9)));
      tileW = COLS * 2 * sq;
      tileH = ROWS * 2 * sq;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      tiles[0] = ctx.createPattern(buildTile(false), 'repeat');
      tiles[1] = ctx.createPattern(buildTile(true), 'repeat');

      // half resolution is plenty for a mask made of soft gradients
      mw = Math.max(1, Math.ceil(w / 2));
      mh = Math.max(1, Math.ceil(h / 2));
      if (!mask) { mask = document.createElement('canvas'); mctx = mask.getContext('2d'); }
      mask.width = mw;
      mask.height = mh;

      measurePool();
      tellLit();
    }

    function blob(x, y, r, a) {
      if (a <= 0.004 || r <= 0) return;
      mctx.save();
      mctx.translate(x, y);
      mctx.scale(WIDE, 1);

      var g = mctx.createRadialGradient(
        -r * 0.2, -r * 0.22, r * 0.02,
        0, 0, r
      );
      g.addColorStop(0, 'rgba(0,0,0,' + a + ')');
      g.addColorStop(0.2, 'rgba(0,0,0,' + a * 0.78 + ')');
      g.addColorStop(0.4, 'rgba(0,0,0,' + a * 0.55 + ')');
      g.addColorStop(0.6, 'rgba(0,0,0,' + a * 0.34 + ')');
      g.addColorStop(0.8, 'rgba(0,0,0,' + a * 0.15 + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      mctx.fillStyle = g;
      mctx.fillRect(-r, -r, r * 2, r * 2);
      mctx.restore();
    }

    /* Written only when it has actually changed, so a board that never moves
       costs one style write in its whole life and a moving one costs about
       twenty a second rather than sixty. */
    function tellLit() {
      if (!pool || !w || !h) return;
      var px = (pool.x + ox) / w * 100;
      var py = (pool.y + oy) / h * 100;
      if (Math.abs(px - litX) < 0.18 && Math.abs(py - litY) < 0.18) return;
      litX = px; litY = py;
      host.style.setProperty('--ballx', px.toFixed(2) + '%');
      host.style.setProperty('--bally', py.toFixed(2) + '%');
      if (echo) {
        echo.style.setProperty('--ballx', px.toFixed(2) + '%');
        echo.style.setProperty('--bally', py.toFixed(2) + '%');
      }
    }

    function paint(t) {
      if (!tiles[0]) return;
      var W = canvas.width;
      var H = canvas.height;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // The two boards sit on opposite blocks, so no cell is ever painted by
      // both. Complementary alphas therefore give a clean crossfade: the dark
      // clusters lose exactly the ink the empty blocks gain, and nothing
      // doubles up in the middle.
      //
      // The whole field changes together, on purpose. Staggering it was what
      // made the changeover read as a mess: different parts of the board in
      // different states throw up shapes that were never designed.
      var k = t / CYCLE;
      var idx = Math.floor(k);
      var p = ease((k - idx) * CYCLE / FADE);
      var to = idx % 2;

      if (p < 0.998) {
        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = tiles[1 - to];
        ctx.fillRect(0, 0, W, H);
      }
      if (p > 0.002) {
        ctx.globalAlpha = p;
        ctx.fillStyle = tiles[to];
        ctx.fillRect(0, 0, W, H);
      }
      ctx.globalAlpha = 1;

      // reveal: build the lit areas, then punch the board through them
      mctx.setTransform(1, 0, 0, 1, 0, 0);
      mctx.clearRect(0, 0, mw, mh);
      if (FLOOR > 0.002) {
        mctx.fillStyle = 'rgba(0,0,0,' + FLOOR + ')';
        mctx.fillRect(0, 0, mw, mh);
      }
      if (pool) blob((pool.x + ox) / 2, (pool.y + oy) / 2, pool.r / 2, PEAK);

      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }

    function frame(now) {
      var t = now / 1000;
      var dt = prev ? Math.min(0.05, t - prev) : 0.016;
      prev = t;

      if (DRIFT > 0 && pool) {
        ox += vx * dt;
        oy += vy * dt;

        // the centre is what bounces, not the ball: it is wider than the
        // band, so keeping the whole of it inside would leave it nowhere
        // to go. It overhangs, the way it does when it is standing still.
        var minX = w * 0.2 - pool.x, maxX = w * 0.8 - pool.x;
        var minY = h * 0.22 - pool.y, maxY = h * 0.78 - pool.y;

        if (ox < minX) { ox = minX; vx = Math.abs(vx); }
        if (ox > maxX) { ox = maxX; vx = -Math.abs(vx); }
        if (oy < minY) { oy = minY; vy = Math.abs(vy); }
        if (oy > maxY) { oy = maxY; vy = -Math.abs(vy); }

      }
      // published whether it moves or not: a still ball still has to be lit
      // from somewhere, and the lighting reads it off these
      tellLit();

      paint(t);
      raf = window.requestAnimationFrame(frame);
    }

    function start() {
      if (raf || reduce) return;
      prev = 0;
      raf = window.requestAnimationFrame(frame);
    }
    function stop() {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = null;
    }

    build();
    // one settled board, no cutting, when motion is unwelcome
    if (reduce) paint(0); else start();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) start(); else stop();
      }, { threshold: 0 }).observe(host);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    // the tiles are baked into patterns at build time, so a change of theme
    // has to rebuild them - nothing else would pick the new colour up
    document.addEventListener('theme:change', function () {
      DARK = ink();
      build();
      if (reduce) paint(0);
    });

    var resizeTimer = null;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        build();
        if (reduce) paint(0);
      }, 180);
    }
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(onResize);
      ro.observe(host);
      if (anchor) ro.observe(anchor);
    } else {
      window.addEventListener('resize', onResize);
    }

    // fonts landing can reflow the copy, and the pool follows it
    window.addEventListener('load', measurePool);
  }

  /* ------------------------------------------------------------------ *
   * Fleet picker                                                       *
   * The carousel is a form control, not decoration: browsing it sets   *
   * the car on the order, and the bar's car field drives it back.      *
   * It idles through the fleet until the first interaction, then stops *
   * so an autoplay can never quietly change a chosen value.            *
   * ------------------------------------------------------------------ */
  function initFleet() {
    var root = document.querySelector('[data-carousel]');
    if (!root) return;

    var track = root.querySelector('.fleet__track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.fleet__slide'));
    // the name and the indicator sit on the form, not in the card
    var steps = Array.prototype.slice.call(document.querySelectorAll('[data-step]'));
    var carrow = document.querySelector('.carrow');
    var namer = document.querySelector('[data-namer]');
    var namerTrack = namer && namer.querySelector('.namer__track');
    var names = namer ? Array.prototype.slice.call(namer.querySelectorAll('.namer__i')) : [];
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var field = document.getElementById('carType');
    var choose = document.querySelector('[data-choose]');
    if (!track || slides.length < 2) return;

    var timer = null;
    var locked = false;

    var cars = makeLoop(track, slides, 2);
    var strip = namerTrack ? makeLoop(namerTrack, names, 2) : null;

    function render() {
      var i = cars.index();
      // a different car is a different choice, so the mark comes off - but
      // past the gate there is no unchosen state left to fall back to
      root.classList.toggle('is-chosen', document.body.classList.contains('is-booking'));
      slides.forEach(function (s, n) { s.setAttribute('aria-hidden', String(n !== i)); });
      // the dots stay put; only the car each one points at changes, and it
      // wraps, so there is no first and no last
      steps.forEach(function (b) {
        var n = (i + parseInt(b.dataset.step, 10) + slides.length) % slides.length;
        b.dataset.target = n;
        b.setAttribute('aria-label', slides[n].dataset.name || '');
      });

      names.forEach(function (el, n) { el.classList.toggle('is-on', n === i); });
      // the listbox listens for change, so setting .value silently would
      // leave the bar showing the wrong car
      if (field && field.value !== slides[i].dataset.value) {
        field.value = slides[i].dataset.value || '';
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // which way the dial turned, so the dots can be thrown that way
    function turn(dir) {
      if (!carrow || reduce || !dir) return;
      carrow.classList.remove('is-next', 'is-prev');
      void carrow.offsetWidth;            // restart the animation
      carrow.classList.add(dir > 0 ? 'is-next' : 'is-prev');
    }

    // the shortest way round to a car, which with five of them is never
    // more than two slots
    function stepTo(target) {
      var n = slides.length;
      var d = (((target - cars.index()) % n) + n) % n;
      return d > n / 2 ? d - n : d;
    }

    function go(step, dir) {
      if (!step) return;
      turn(dir || (step > 0 ? 1 : -1));
      cars.move(step);
      if (strip) strip.move(step);
      render();
    }

    function idle() {
      if (reduce || locked || timer) return;
      timer = window.setInterval(function () {
        if (!document.hidden) go(1, 1);
      }, 4200);
    }
    function halt() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    function pick(step, dir) {
      locked = true;
      halt();
      go(step, dir);
    }

    if (prev) prev.addEventListener('click', function () { pick(-1, -1); });
    if (next) next.addEventListener('click', function () { pick(1, 1); });
    steps.forEach(function (b) {
      b.addEventListener('click', function () {
        var st = parseInt(b.dataset.step, 10);
        pick(st, st > 0 ? 1 : -1);
      });
    });

    root.addEventListener('keydown', function (e) {
      // the car field lives inside the carousel now; its list owns the arrows
      if (e.target.closest && e.target.closest('.sel')) return;
      if (e.key === 'ArrowLeft') pick(-1, -1);
      if (e.key === 'ArrowRight') pick(1, 1);
    });

    if (field) {
      field.addEventListener('change', function () {
        var n = slides.findIndex(function (s) { return s.dataset.value === field.value; });
        // guard against the round trip: render() fires change too
        if (n < 0 || n === cars.index()) return;
        var st = stepTo(n);
        pick(st, st > 0 ? 1 : -1);
      });
    }

    // the booking gate asks for a car: hold this one still until it is taken
    root.addEventListener('fleet:halt', function () { locked = true; halt(); });

    root.addEventListener('mouseenter', halt);
    root.addEventListener('mouseleave', idle);
    root.addEventListener('focusin', halt);
    root.addEventListener('focusout', idle);

    var x0 = 0, y0 = 0;
    root.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; halt();
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        var d = dx < 0 ? 1 : -1;
        pick(d, d);
      }
    }, { passive: true });

    if (choose) {
      choose.addEventListener('click', function () {
        // the point of choosing is that the car stays put, so this also
        // ends the idle rotation for good
        locked = true;
        halt();
        root.classList.add('is-chosen');
      });
    }

    render();
    idle();
  }

  /* --- swap the two legs of the route ----------------------------------- */
  function initSwap() {
    var btn = document.querySelector('[data-swap]');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var from = document.getElementById('fromRegion');
      var to = document.getElementById('toRegion');
      if (!from || !to) return;
      var a = from.value; from.value = to.value; to.value = a;
      from.dispatchEvent(new Event('change', { bubbles: true }));
      to.dispatchEvent(new Event('change', { bubbles: true }));
      btn.classList.toggle('is-flipped');
    });
  }

  /* ------------------------------------------------------------------ *
   * Listbox                                                            *
   *                                                                    *
   * A native select can be styled down to its box and no further, and  *
   * datetime-local hands you whatever picker the browser feels like.    *
   * So every [data-fancy] select keeps its real element - hidden, still *
   * the single source of truth, still firing change - and gets a        *
   * listbox we own drawn over the top of it.                            *
   * ------------------------------------------------------------------ */
  function upgradeSelect(select) {
    var wrap = document.createElement('div');
    wrap.className = 'sel' + (select.getAttribute('data-drop') === 'down' ? ' sel--down' : '');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sel__btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    if (select.getAttribute('aria-labelledby')) {
      btn.setAttribute('aria-labelledby', select.getAttribute('aria-labelledby'));
    }

    var thumb = null;
    if (select.hasAttribute('data-thumbs')) {
      thumb = document.createElement('img');
      thumb.className = 'sel__thumb';
      thumb.alt = '';
      btn.appendChild(thumb);
    }

    var val = document.createElement('span');
    val.className = 'sel__val';
    var txt = document.createElement('span');
    txt.className = 'sel__txt';
    val.appendChild(txt);
    btn.appendChild(val);

    var caret = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    caret.setAttribute('viewBox', '0 0 24 24');
    caret.setAttribute('fill', 'none');
    caret.setAttribute('stroke', 'currentColor');
    caret.setAttribute('stroke-width', '2.2');
    caret.setAttribute('stroke-linecap', 'round');
    caret.setAttribute('stroke-linejoin', 'round');
    caret.setAttribute('aria-hidden', 'true');
    var cp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    cp.setAttribute('d', 'm6 9 6 6 6-6');
    caret.appendChild(cp);
    btn.appendChild(caret);

    var pop = document.createElement('div');
    pop.className = 'sel__pop';
    pop.setAttribute('role', 'listbox');
    pop.hidden = true;

    var opts = [];

    function build() {
      pop.textContent = '';
      opts = [];
      var lastGroup = null;

      Array.prototype.forEach.call(select.options, function (o, i) {
        var group = o.getAttribute('data-group');
        if (group && group !== lastGroup) {
          var g = document.createElement('p');
          g.className = 'sel__group';
          g.textContent = group;
          pop.appendChild(g);
          lastGroup = group;
        }

        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sel__opt';
        b.setAttribute('role', 'option');
        b.dataset.index = i;

        var src = o.getAttribute('data-thumb');
        if (src) {
          var im = document.createElement('img');
          im.src = src;
          im.alt = '';
          im.loading = 'lazy';
          b.appendChild(im);
        }
        b.appendChild(document.createTextNode(o.textContent));

        b.addEventListener('click', function () {
          select.selectedIndex = i;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          close();
          btn.focus();
        });

        pop.appendChild(b);
        opts.push(b);
      });
    }

    function sync() {
      var o = select.options[select.selectedIndex];
      var label = o ? o.textContent : '';

      // the value rolls up into place rather than being swapped, so a change
      // of destination is something you see happen
      if (txt.textContent !== label) {
        txt.textContent = label;
        if (!reduce) {
          txt.classList.remove('is-rolled');
          void txt.offsetWidth;
          txt.classList.add('is-rolled');
        }
      }
      opts.forEach(function (b, i) {
        b.setAttribute('aria-selected', String(i === select.selectedIndex));
      });

      if (!thumb || !o) return;
      var src = o.getAttribute('data-thumb');
      if (!src || thumb.getAttribute('src') === src) return;
      // crossfade, so changing the car up in the carousel visibly lands here
      thumb.classList.add('is-swapping');
      window.setTimeout(function () {
        thumb.src = src;
        thumb.classList.remove('is-swapping');
      }, 140);
    }

    var active = -1;

    function move(step) {
      if (!opts.length) return;
      active = (active + step + opts.length) % opts.length;
      opts.forEach(function (b, i) { b.classList.toggle('is-active', i === active); });
      opts[active].scrollIntoView({ block: 'nearest' });
    }

    function open() {
      if (!pop.hidden) return;
      pop.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      active = select.selectedIndex;
      opts.forEach(function (b, i) { b.classList.toggle('is-active', i === active); });
      if (opts[active]) opts[active].scrollIntoView({ block: 'nearest' });
      document.addEventListener('pointerdown', outside, true);
    }

    function close() {
      if (pop.hidden) return;
      pop.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('pointerdown', outside, true);
    }

    function outside(e) { if (!wrap.contains(e.target)) close(); }

    btn.addEventListener('click', function () { pop.hidden ? open() : close(); });

    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); btn.focus(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (pop.hidden) { open(); return; }
        move(e.key === 'ArrowDown' ? 1 : -1);
        return;
      }
      if ((e.key === 'Enter' || e.key === ' ') && !pop.hidden) {
        e.preventDefault();
        if (opts[active]) opts[active].click();
      }
    });

    select.addEventListener('change', sync);
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(btn);
    wrap.appendChild(pop);
    wrap.appendChild(select);

    build();
    sync();

    // the options list can be rebuilt from outside (departure times, say)
    select.addEventListener('optionschanged', function () { build(); sync(); });
  }

  function initSelects() {
    Array.prototype.forEach.call(
      document.querySelectorAll('select[data-fancy]'),
      upgradeSelect
    );
  }

  /* --- departure times ---------------------------------------------------
     Real slots counted forward from now, which is friendlier than a
     datetime picker and removes the browser's own widget entirely. */
  function initDepartures() {
    var sel = document.getElementById('departAt');
    if (!sel) return;

    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    var days = ['Bugun', 'Ertaga', 'Indinga'];
    var now = new Date();

    sel.textContent = '';
    var count = 0;

    for (var d = 0; d < 3 && count < 21; d++) {
      for (var hour = 5; hour <= 23 && count < 21; hour++) {
        var when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hour, 0, 0);
        if (when.getTime() <= now.getTime() + 45 * 60000) continue;

        var o = document.createElement('option');
        o.value = String(when.getTime());
        o.textContent = days[d] + ', ' + pad(hour) + ':00';
        o.setAttribute('data-group', days[d]);
        sel.appendChild(o);
        count++;
      }
    }

    sel.selectedIndex = 0;
    sel.dispatchEvent(new Event('optionschanged'));
  }

  /* A track that never rewinds.
     Items are re-ordered in the DOM after every move so the current one
     always sits in the middle with buf either side. A step then only ever
     animates in the direction you asked for, and the last item carries on
     forwards into the first instead of scrolling all the way back. */
  function makeLoop(el, items, buf) {
    var n = items.length;
    var BUF = Math.min(buf, Math.floor((n - 1) / 2));
    var cur = 0;
    var busy = false;

    function place() {
      for (var k = 0; k < n; k++) el.appendChild(items[(cur - BUF + k + n) % n]);
      el.style.transition = 'none';
      el.style.transform = 'translate3d(' + (-BUF * 100) + '%,0,0)';
      void el.offsetWidth;                 // commit before re-enabling motion
      el.style.transition = '';
    }

    function settle() {
      if (!busy) return;
      busy = false;
      place();
    }

    el.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform') settle();
    });

    place();

    return {
      index: function () { return cur; },
      move: function (step) {
        settle();                          // finish anything still running
        cur = (cur + step + n) % n;
        busy = true;
        el.style.transform = 'translate3d(' + (-(BUF + step) * 100) + '%,0,0)';
      }
    };
  }

  /* ------------------------------------------------------------------ *
   * Hero story                                                         *
   * The copy column is three panels, not one: what the company does,   *
   * what it charges, and how to reach it. They rotate on their own but *
   * stop for good the moment someone picks a panel deliberately.       *
   * ------------------------------------------------------------------ */
  function initStory() {
    var root = document.querySelector('[data-story]');
    if (!root) return;

    var track = root.querySelector('.story__track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.story__slide'));
    var jumps = Array.prototype.slice.call(root.querySelectorAll('[data-jump]'));
    if (!track || slides.length < 2) return;

    var nav = root.querySelector('.story__nav');
    var vp = root.querySelector('.story__vp');
    var nextBtn = root.querySelector('[data-story-next]');
    var nextName = root.querySelector('[data-next-name]');
    var prevBtn = root.querySelector('[data-story-prev]');
    var prevName = root.querySelector('[data-prev-name]');
    var loop = makeLoop(track, slides, 1);
    var timer = null;

    // must match --story-dur on .story__nav, or the ring and the clock drift
    var DUR = 5000;

    // A pause has to leave the clock where it stopped, so the panel cannot
    // be scheduled on a fixed interval any more: we track how much of this
    // panel's time has already run and queue only the remainder. The ring is
    // paused rather than reset, so it picks up from the same place.
    var startedAt = 0;
    var elapsed = 0;

    // which way the dial turned, so the dots can be thrown that way
    function turn(dir) {
      if (!nav || reduce || !dir) return;
      nav.classList.remove('is-next', 'is-prev');
      void nav.offsetWidth;              // restart the animation
      nav.classList.add(dir > 0 ? 'is-next' : 'is-prev');
    }

    // a css animation only restarts if it is taken off the element and put
    // back, and the ring lives on a dot that never changes. Only ever called
    // when the panel actually changes - a pause must not rewind it.
    function resetRing() {
      var ring = nav && nav.querySelector('.story__ring-f');
      if (!ring) return;
      ring.style.animation = 'none';
      void ring.getBoundingClientRect();
      ring.style.animation = '';
    }

    function render() {
      var i = loop.index();
      var len = slides.length;
      elapsed = 0;
      resetRing();
      slides.forEach(function (sl, n) { sl.setAttribute('aria-hidden', String(n !== i)); });

      if (nextName) nextName.textContent = slides[(i + 1) % len].dataset.name || '';
      if (prevName) prevName.textContent = slides[(i - 1 + len) % len].dataset.name || '';

      // the dots stay put; what changes is the panel each one addresses
      jumps.forEach(function (bt) {
        var st = parseInt(bt.dataset.jump, 10);
        var n = (i + st + len) % len;
        bt.setAttribute('aria-label', slides[n].dataset.name || '');
        bt.setAttribute('aria-selected', String(st === 0));
      });
    }

    function go(step) {
      if (!step) return;
      turn(step > 0 ? 1 : -1);
      loop.move(step);
      render();
    }

    function start() {
      if (nav) nav.classList.remove('is-held');
      if (reduce || timer) return;
      startedAt = Date.now();
      timer = window.setTimeout(function () {
        timer = null;
        go(1);          // render() clears elapsed and restarts the ring
        start();
      }, Math.max(0, DUR - elapsed));
    }

    function stop() {
      if (nav) nav.classList.add('is-held');
      if (!timer) return;
      window.clearTimeout(timer);
      timer = null;
      elapsed += Date.now() - startedAt;
    }

    // every manual route in: dots, the link, the keyboard, a swipe.
    // Moving by hand does not end the rotation, it only restarts its clock:
    // render() clears the elapsed time and rewinds the ring, then start()
    // re-arms from a full turn.
    function jumpBy(step) {
      if (!step) return;
      stop();
      go(step);
      start();
    }

    jumps.forEach(function (bt) {
      var st = parseInt(bt.dataset.jump, 10);
      if (!st) return;                     // the middle dot is where you are
      bt.addEventListener('click', function () { jumpBy(st); });
    });

    if (nextBtn) nextBtn.addEventListener('click', function () { jumpBy(1); });
    if (prevBtn) prevBtn.addEventListener('click', function () { jumpBy(-1); });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') jumpBy(-1);
      if (e.key === 'ArrowRight') jumpBy(1);
    });

    if (vp) {
      var x0 = 0, y0 = 0;
      vp.addEventListener('touchstart', function (e) {
        x0 = e.touches[0].clientX;
        y0 = e.touches[0].clientY;
        stop();
      }, { passive: true });

      vp.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - x0;
        var dy = e.changedTouches[0].clientY - y0;
        // only a clearly sideways drag counts, or it fights the page scroll
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) jumpBy(dx < 0 ? 1 : -1);
        else start();
      }, { passive: true });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    render();
    start();
  }

  /* --- phone -------------------------------------------------------------
     The mask is always on screen: +998 followed by blanks that fill in as
     digits arrive. The caret is parked at the first blank, so there is no
     way to type into the middle of the number or to delete the code. */
  function initPhone() {
    var input = document.getElementById('phone');
    if (!input) return;

    var TPL = '+998 __ ___ __ __';
    var MAX = 9;
    var digits = '';

    function paint() {
      var out = '';
      var d = 0;
      for (var k = 0; k < TPL.length; k++) {
        out += TPL[k] === '_' ? (d < digits.length ? digits.charAt(d++) : '_') : TPL[k];
      }
      input.value = out;
      var at = out.indexOf('_');
      at = at === -1 ? out.length : at;
      try { input.setSelectionRange(at, at); } catch (e) {}
    }

    function read() {
      var raw = input.value.replace(/\D/g, '');
      if (raw.indexOf('998') === 0) raw = raw.slice(3);
      digits = raw.slice(0, MAX);
    }

    input.addEventListener('input', function () { read(); paint(); });
    input.addEventListener('focus', function () { window.setTimeout(paint, 0); });
    input.addEventListener('click', paint);

    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return;
      e.preventDefault();
      digits = digits.slice(0, -1);
      paint();
    });

    paint();
  }

  /* ------------------------------------------------------------------ *
   * Seat plan                                                          *
   * The plan and the two rates are one control: picking a seat lights   *
   * its rate, picking a rate selects the first seat of that row. The    *
   * choice rides along with the booking bar through a hidden input, so  *
   * the seat reaches the order without taking a cell in the bar.        *
   * ------------------------------------------------------------------ */
  var PRICE = { front: 180000, back: 140000 };
  var LABEL = { front: "Oldingi o'rindiq", back: "Orqa o'rindiq" };

  function money(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* Two jobs on one plan. Before the details are in, the plan explains what
     each seat costs and only one is lit, because the point is the tariff.
     Once the trip is known it becomes the thing being bought, and any
     number of seats can be on at once. */
  /* The plan inside the fleet card. Same drawing, cloned rather than written
     out twice, so the two can never drift apart - but its own state, because
     here any number of seats can be on at once. */
  function initPick() {
    var host = document.querySelector('[data-pick-cabin]');
    var source = document.querySelector('[data-seatmap] .cabin');
    if (!host || !source) return;

    var cabin = source.cloneNode(true);
    cabin.setAttribute('aria-label', "O'rindiqlarni tanlang");
    host.appendChild(cabin);

    var seats = Array.prototype.slice.call(cabin.querySelectorAll('[data-seat]'));
    var whole = document.querySelector('[data-whole]');
    var listEl = document.querySelector('[data-sum-list]');
    var totalEl = document.querySelector('[data-sum-total]');
    var hintEl = document.querySelector('[data-book-hint]');
    var bookEl = document.querySelector('[data-book]');
    var fSeats = document.getElementById('seatSeats');
    var fTotal = document.getElementById('seatTotal');
    if (!seats.length) return;

    var on = {};

    function sync() {
      var picked = seats.filter(function (s) { return on[s.dataset.id]; });
      var total = 0;
      var count = { front: 0, back: 0 };
      picked.forEach(function (s) {
        count[s.dataset.seat]++;
        total += PRICE[s.dataset.seat];
      });

      seats.forEach(function (s) {
        s.setAttribute('aria-pressed', String(!!on[s.dataset.id]));
      });
      if (whole) whole.setAttribute('aria-pressed', String(picked.length === seats.length));

      if (listEl) {
        listEl.textContent = '';
        ['front', 'back'].forEach(function (k) {
          if (!count[k]) return;
          var li = document.createElement('li');
          var name = document.createElement('span');
          name.textContent = LABEL[k] + (count[k] > 1 ? ' \u00d7 ' + count[k] : '');
          var sum = document.createElement('b');
          sum.textContent = money(PRICE[k] * count[k]);
          li.appendChild(name);
          li.appendChild(sum);
          listEl.appendChild(li);
        });
      }

      if (totalEl) totalEl.textContent = money(total);
      if (hintEl) hintEl.hidden = picked.length > 0;
      if (bookEl) bookEl.hidden = picked.length === 0;
      if (fSeats) fSeats.value = picked.map(function (s) { return s.dataset.id; }).join(',');
      if (fTotal) fTotal.value = String(total);
    }

    seats.forEach(function (s) {
      s.addEventListener('click', function () {
        var id = s.dataset.id;
        if (on[id]) delete on[id]; else on[id] = true;
        sync();
      });
    });

    if (whole) {
      whole.addEventListener('click', function () {
        var all = seats.every(function (s) { return on[s.dataset.id]; });
        on = {};
        if (!all) seats.forEach(function (s) { on[s.dataset.id] = true; });
        sync();
      });
    }

    // stepping back out clears the car, because the next car is a new choice
    document.addEventListener('booking:reset', function () { on = {}; sync(); });

    sync();
  }

  /* --- the two steps ------------------------------------------------------
     Step one is the trip: where, when, who to call, which car. Step two is
     the seats, and it cannot be reached until step one is answered, because
     a seat is meaningless without a car to put it in. */
  function initBooking() {
    var form = document.getElementById('qbar');
    var fleet = document.querySelector('[data-carousel]');
    var goBtn = document.querySelector('[data-go-seats]');
    var backBtn = document.querySelector('[data-back-step]');
    var msg = document.querySelector('[data-qmsg]');
    var phone = document.getElementById('phone');
    var from = document.getElementById('fromRegion');
    var to = document.getElementById('toRegion');
    var when = document.getElementById('departAt');
    if (!form || !goBtn || !fleet) return;

    var sumCar = document.querySelector('[data-sum-car]');
    var sumRoute = document.querySelector('[data-sum-route]');
    var sumWhen = document.querySelector('[data-sum-when]');
    var dlg = document.querySelector('[data-done]');
    var bookEl = document.querySelector('[data-book]');
    var car = document.getElementById('carType');

    function cellOf(el) { return el && el.closest ? el.closest('.qcell') : null; }

    function clearMarks() {
      Array.prototype.forEach.call(document.querySelectorAll('.qcell.is-bad'), function (c) {
        c.classList.remove('is-bad');
      });
      if (msg) { msg.textContent = ''; msg.classList.remove('is-on'); }
    }

    function fail(text, el) {
      if (msg) { msg.textContent = text; msg.classList.add('is-on'); }
      var cell = cellOf(el);
      if (cell) cell.classList.add('is-bad');
      if (el && el.focus) {
        // the upgraded selects hide the native control, so the button that
        // replaced it is what can actually take focus
        var target = (cell && cell.querySelector('.sel__btn')) || el;
        try { target.focus({ preventScroll: true }); } catch (err) { target.focus(); }
      }
      return false;
    }

    function check() {
      clearMarks();
      if (from && to && from.value === to.value) {
        return fail("Yo'nalishni tanlang: shaharlar bir xil.", from);
      }
      if (when && !when.value) {
        return fail("Jo'nash vaqtini tanlang.", when);
      }
      if (phone && phone.value.replace(/\D/g, '').length < 12) {
        return fail("Telefon raqamini to'liq kiriting.", phone);
      }
      if (!fleet.classList.contains('is-chosen')) {
        if (msg) { msg.textContent = 'Avtomobilni tanlang.'; msg.classList.add('is-on'); }
        fleet.dispatchEvent(new Event('fleet:halt'));
        fleet.classList.remove('is-nudge');
        void fleet.offsetWidth;
        fleet.classList.add('is-nudge');
        return false;
      }
      return true;
    }

    function optText(sel) {
      if (!sel || sel.selectedIndex < 0) return '';
      return sel.options[sel.selectedIndex].textContent.trim();
    }

    function summarise() {
      if (sumCar) sumCar.textContent = optText(car);
      if (sumRoute) sumRoute.textContent = optText(from) + ' \u2013 ' + optText(to);
      if (sumWhen) sumWhen.textContent = optText(when);
    }

    function enter() {
      document.body.classList.add('is-booking');
      summarise();
      // the story panel goes on explaining the fares; the choosing happens
      // in the fleet card, which is where the car was chosen a moment ago
    }

    function leave() {
      document.body.classList.remove('is-booking');
      document.dispatchEvent(new Event('booking:reset'));
    }

    goBtn.addEventListener('click', function () { if (check()) enter(); });
    if (backBtn) backBtn.addEventListener('click', leave);

    // a red field that stays red after it has been fixed is just noise
    form.addEventListener('input', clearMarks);
    form.addEventListener('change', function () { clearMarks(); summarise(); });

    function fill(sel, text) {
      var el = document.querySelector(sel);
      if (el) el.textContent = text;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // TODO: /api/form currently discards what it is given; nothing leaves
      // the page until that endpoint forwards to the dispatcher

      // read the order off the panel that took it, so the dialog cannot
      // disagree with what was on screen a moment ago
      var lines = Array.prototype.map.call(
        document.querySelectorAll('[data-sum-list] li span'),
        function (n) { return n.textContent; }
      ).join(', ');
      var total = document.querySelector('[data-sum-total]');

      fill('[data-done-car]', optText(car));
      fill('[data-done-trip]', optText(from) + ' \u2013 ' + optText(to) + ' \u00b7 ' + optText(when));
      fill('[data-done-seats]', lines);
      fill('[data-done-total]', (total ? total.textContent : '0') + " so'm");

      if (dlg && dlg.showModal) dlg.showModal();
    });

    // closing an order that has been placed puts the card back to the car it
    // started from, because the next order is a new one
    var closeBtn = document.querySelector('[data-done-close]');
    if (closeBtn && dlg) closeBtn.addEventListener('click', function () { dlg.close(); });
    if (dlg) dlg.addEventListener('close', leave);
  }

  /* No scroll listener: the marker above the bar is either in view or it is
     not, and the observer only fires on the crossing. */
  function initHeader() {
    var hd = document.querySelector('.hd');
    var mark = document.querySelector('[data-hd-top]');
    if (!hd || !mark || !('IntersectionObserver' in window)) return;

    new IntersectionObserver(function (e) {
      hd.classList.toggle('is-stuck', !e[0].isIntersecting);
    }, { threshold: 0 }).observe(mark);
  }

  /* The ends of the drawing are whatever the direction field says, so
     swapping the route or picking another town relabels it. Listening on the
     form rather than the two selects catches the swap button as well, which
     changes both at once. */
  function initPass() {
    var from = document.getElementById('fromRegion');
    var to = document.getElementById('toRegion');
    var a = document.querySelector('[data-pass-from]');
    var b = document.querySelector('[data-pass-to]');
    var form = document.getElementById('qbar');
    if (!from || !to || !a || !b) return;

    function text(sel) {
      return sel.selectedIndex < 0 ? '' : sel.options[sel.selectedIndex].textContent.trim();
    }
    function sync() {
      a.textContent = text(from);
      b.textContent = text(to);
    }

    if (form) form.addEventListener('change', sync);
    sync();
  }

  /* theme.js has already applied any stored choice; this only handles the
     switch, and tells the canvas when to repaint itself. */
  function initTheme() {
    var btn = document.querySelector('[data-theme-toggle]');
    var root = document.documentElement;
    if (!btn) return;

    btn.addEventListener('click', function () {
      var set = root.getAttribute('data-theme');
      var dark = set === 'dark' ||
        (!set && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = dark ? 'light' : 'dark';

      root.setAttribute('data-theme', next);
      try { localStorage.setItem('poytaxt-theme', next); } catch (e) {}
      document.dispatchEvent(new Event('theme:change'));
    });

    // no stored choice means the system is in charge, so follow it if it moves
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystem = function () {
      if (!root.getAttribute('data-theme')) document.dispatchEvent(new Event('theme:change'));
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystem);
    else if (mq.addListener) mq.addListener(onSystem);
  }

  /* The second form on the page. Same treatment as the booking bar: it does
     not navigate, because there is nowhere for it to go until /api/form
     actually forwards what it is given. */
  function initSay() {
    var form = document.getElementById('say');
    if (!form) return;
    var done = form.querySelector('[data-say-done]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // TODO: no endpoint yet - this acknowledges, it does not send
      if (done) done.hidden = false;
      form.reset();
    });
  }

  /* Two rails, going opposite ways at different speeds. Each is repeated
     until it is longer than the screen plus one set, so the position wraps
     by subtracting a set width and the seam never comes round. Either can be
     taken hold of and thrown; on release the speed decays back into the
     drift rather than stopping dead. */
  function initVoices() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-voices-vp]'), makeRail);
  }

  function makeRail(vp) {
    var track = vp.querySelector('.voices__track');
    if (!track) return;

    var seed = Array.prototype.slice.call(track.children);
    if (!seed.length) return;

    var dir = parseFloat(vp.dataset.dir) < 0 ? -1 : 1;
    var DRIFT = parseFloat(vp.dataset.speed) || 28;
    var x = 0, setW = 0, raf = null, prev = 0;
    var v = DRIFT, held = null, over = false;

    function measure() {
      while (track.children.length > seed.length) track.removeChild(track.lastChild);

      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      setW = seed.reduce(function (t, n) {
        return t + n.getBoundingClientRect().width + gap;
      }, 0);

      var guard = 0;
      while (track.scrollWidth < vp.clientWidth + setW && guard++ < 16) {
        seed.forEach(function (n) {
          var c = n.cloneNode(true);
          c.setAttribute('aria-hidden', 'true');   // the same words twice is noise
          track.appendChild(c);
        });
      }
      draw();
    }

    function draw() {
      // one direction counts up from zero, the other counts down from a set
      var off = dir > 0 ? -x : -(setW - x);
      track.style.transform = 'translate3d(' + off + 'px,0,0)';
    }

    function frame(now) {
      var t = now / 1000;
      var dt = prev ? Math.min(0.05, t - prev) : 0.016;
      prev = t;

      if (!held) {
        v += ((over ? 0 : DRIFT) - v) * Math.min(1, dt * 3);
        x += v * dt;
      }
      if (setW) x = ((x % setW) + setW) % setW;
      draw();
      raf = window.requestAnimationFrame(frame);
    }

    vp.addEventListener('pointerdown', function (e) {
      held = { x: e.clientX, at: x };
      v = 0;
      vp.classList.add('is-held');
      vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener('pointermove', function (e) {
      if (!held) return;
      var dx = (e.clientX - held.x) * dir;
      v = -dx * 6;
      x = held.at - dx;
      held.x = e.clientX;
      held.at = x;
      if (setW) x = ((x % setW) + setW) % setW;
      draw();
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) {
      vp.addEventListener(ev, function () {
        held = null;
        vp.classList.remove('is-held');
      });
    });

    vp.addEventListener('mouseenter', function () { over = true; });
    vp.addEventListener('mouseleave', function () { over = false; });
    vp.addEventListener('focusin', function () { over = true; });
    vp.addEventListener('focusout', function () { over = false; });

    measure();
    var rt = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(rt);
      rt = window.setTimeout(measure, 180);
    });

    if (reduce) return;
    raf = window.requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      else if (!raf) { prev = 0; raf = window.requestAnimationFrame(frame); }
    });
  }

  function init() {
    initDepartures();
    initSelects();
    initPhone();
    initSay();
    initVoices();
    initStory();
    initPick();
    initHeader();
    initTheme();
    initPass();
    initBooking();
    initChecker();
    initFleet();
    initSwap();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
