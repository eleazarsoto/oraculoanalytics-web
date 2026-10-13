/* Oráculo Analytics · efectos visuales */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.add('fx');

  // Titular palabra por palabra (no toca el subrayado dibujado)
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduce) {
    var i = 0;
    Array.prototype.slice.call(h1.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('span'); s.className = 'w'; s.textContent = part;
          s.style.animationDelay = (0.08 + i++ * 0.07) + 's'; frag.appendChild(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.classList.contains('hl')) {
        n.classList.add('w'); n.style.animationDelay = (0.08 + i++ * 0.07) + 's';
      }
    });
  }

  // Revelado al hacer scroll
  var sel = '.section .label,.section h2,.section .sub,.pains li,.turn,.layer,.svc,.step,.offer,.mono,.about-txt > *,.case,.faq details,.finding .ftxt,.calc,.ia .label,.ia h2,.ia .ia-sub,.ia-feats li,.dg,.cta .wrap > *';
  var els = document.querySelectorAll(sel);
  els.forEach(function (el) {
    el.classList.add('rv');
    var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--d', Math.min(sib, 6) * 0.08 + 's');
  });
  var charts = document.querySelectorAll('.chart');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
    charts.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
    charts.forEach(function (el) { el.classList.add('in'); });
  }

  // Contadores de cifras
  function countUp(el) {
    var txt = el.textContent.trim(), m = txt.match(/^(\d[\d,]*)(.*)$/);
    if (!m || reduce) return;
    var end = parseInt(m[1].replace(/,/g, ''), 10), suf = m[2], t0 = null, dur = 1400;
    if (end >= 1900 && end <= 2100) return; // años: no se animan
    function step(t) {
      if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e).toLocaleString('en-US') + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('.facts b').forEach(function (b) { co.observe(b); });
  }

  // Luz que sigue al cursor
  if (fine) {
    document.querySelectorAll('.svc,.layer,.step,.case,.ia-feats li,.pains li').forEach(function (el) {
      el.classList.add('spot');
      el.addEventListener('pointermove', function (ev) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        el.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    });
    // Botones magnéticos
    if (!reduce) document.querySelectorAll('.btn-gold').forEach(function (b) {
      b.addEventListener('pointermove', function (ev) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((ev.clientX - r.left - r.width / 2) * 0.12) + 'px,' + ((ev.clientY - r.top - r.height / 2) * 0.22) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  // Hero: inclinación del panel con el cursor
  var hero = document.querySelector('.hero'), hv = document.querySelector('.hero-visual');
  if (fine && !reduce && hero && hv) {
    hero.addEventListener('pointermove', function (ev) {
      var r = hero.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
      hv.style.transform = 'perspective(1100px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 6) + 'deg)';
    });
    hero.addEventListener('pointerleave', function () { hv.style.transform = ''; });
  }

  // Hero: lienzo de datos en movimiento
  var cv = document.querySelector('.hero-canvas');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pts = [], mouse = { x: -999, y: -999 }, running = true, raf;
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, Math.max(36, W * H / 16000)));
      pts = []; for (var k = 0; k < n; k++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: 0.15 + Math.random() * 0.35, ph: Math.random() * 6.28, r: 0.8 + Math.random() * 1.6, g: Math.random() < 0.18 });
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (var a = 0; a < pts.length; a++) {
        var p = pts[a];
        if (!reduce) { p.x += p.vx; p.y += Math.sin(t / 1400 + p.ph) * 0.18; if (p.x > W + 10) { p.x = -10; p.y = Math.random() * H; } }
        for (var b = a + 1; b < pts.length; b++) {
          var q = pts[b], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 12000) { ctx.strokeStyle = 'rgba(206,154,69,' + (0.16 * (1 - d / 12000)) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        var md = Math.hypot(p.x - mouse.x, p.y - mouse.y), boost = md < 140 ? (1 - md / 140) : 0;
        ctx.fillStyle = p.g ? 'rgba(206,154,69,' + (0.55 + boost * 0.45) + ')' : 'rgba(220,232,228,' + (0.28 + boost * 0.5) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + boost * 2, 0, 6.283); ctx.fill();
      }
      if (running && !reduce) raf = requestAnimationFrame(draw);
    }
    size(); draw(0);
    window.addEventListener('resize', function () { size(); if (reduce) draw(0); });
    hero.addEventListener('pointermove', function (ev) { var r = cv.getBoundingClientRect(); mouse.x = ev.clientX - r.left; mouse.y = ev.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(function (es) {
        var vis = es[0].isIntersecting;
        if (vis && !running) { running = true; raf = requestAnimationFrame(draw); }
        if (!vis) { running = false; cancelAnimationFrame(raf); }
      }).observe(hero);
    }
  }
})();
