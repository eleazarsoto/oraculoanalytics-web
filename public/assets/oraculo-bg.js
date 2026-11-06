/* Oráculo Analytics · fondos animados por sección (varía en cada sección).
   Solo anima lo que está en pantalla, respeta "reducir movimiento" y deja el texto legible. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var MAP = {
    'agentes': 'net', 'agents': 'net', 'marketing': 'waves', 'sitios': 'grid', 'websites': 'grid',
    'sectores': 'dots', 'ecosistema': 'flow', 'ecosystem': 'flow', 'hallazgo': 'bars', 'finding': 'bars',
    'problema': 'orbits', 'problem': 'orbits', 'autodiagnostico': 'dots', 'self-check': 'dots',
    'servicios': 'grid', 'services': 'grid', 'como-trabajo': 'flow', 'how-i-work': 'flow',
    'sobre-mi': 'orbits', 'about': 'orbits', 'casos': 'bars', 'cases': 'bars', 'preguntas': 'dots', 'faq': 'dots',
    'sistema': 'net', 'que-construyo': 'net', 'what-i-build': 'net', 'ejemplos': 'flow', 'examples': 'flow',
    'paquetes': 'grid', 'como-funciona': 'flow', 'how-it-works': 'flow', 'por-que': 'orbits', 'seguridad': 'orbits',
    'ground-rules': 'orbits', 'para-quien': 'dots'
  };
  var ORDER = ['waves', 'dots', 'grid', 'flow', 'orbits', 'bars', 'net'];

  function isDark(el) {
    var c = getComputedStyle(el).backgroundColor, img = getComputedStyle(el).backgroundImage;
    var m = c.match(/\d+(\.\d+)?/g);
    if ((!m || +m[3] === 0) && img && img !== 'none') return /rgb\((1\d|\d),/.test(img) || img.indexOf('10, 29, 29') > -1 || img.indexOf('15, 39, 39') > -1;
    if (!m) return false;
    return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) < 110;
  }

  var targets = [].slice.call(document.querySelectorAll('section.section, section.lp-hero, section.lp-end, section.proofband, section.legal'));
  var k = 0;
  targets.forEach(function (sec) {
    if (sec.querySelector('canvas.bgfx, .hero-canvas, .cta-art')) return;
    var kind = MAP[sec.id] || ORDER[k++ % ORDER.length];
    if (sec.classList.contains('lp-hero')) kind = 'net';
    if (sec.classList.contains('lp-end')) kind = 'waves';
    if (sec.classList.contains('proofband')) kind = 'bars';
    var cv = document.createElement('canvas');
    cv.className = 'bgfx bgfx-' + kind; cv.setAttribute('aria-hidden', 'true');
    sec.insertBefore(cv, sec.firstChild);
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    sec.classList.add('has-bgfx');
  });

  function setup(s) {
    var r = s.sec.getBoundingClientRect();
    s.w = Math.max(1, r.width); s.h = Math.max(1, r.height);
    s.cv.width = s.w * DPR; s.cv.height = s.h * DPR;
    s.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    s.col = s.dark ? '220,232,228' : '18,52,52';
    s.gold = '206,154,69';
    s.a = s.dark ? 1.35 : 1.9;
    if (s.kind === 'net' || s.kind === 'flow') {
      var n = Math.round(Math.min(70, s.w * s.h / 22000));
      s.p = []; for (var i = 0; i < n; i++) s.p.push({ x: Math.random() * s.w, y: Math.random() * s.h, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25 });
    }
    if (s.kind === 'bars') { s.b = []; var nb = Math.ceil(s.w / 34); for (var j = 0; j < nb; j++) s.b.push({ h: Math.random(), ph: Math.random() * 6.28 }); }
  }
  var instances = [];
  [].slice.call(document.querySelectorAll('canvas.bgfx')).forEach(function (cv) {
    var sec = cv.parentNode, kind = cv.className.replace(/.*bgfx-/, '');
    var st = { sec: sec, cv: cv, ctx: cv.getContext('2d'), kind: kind, dark: isDark(sec), t: Math.random() * 100, on: false, seed: Math.random() };
    setup(st); instances.push(st);
  });

  function draw(s) {
    var c = s.ctx, w = s.w, h = s.h, t = s.t, col = s.col, A = s.a;
    c.clearRect(0, 0, w, h);
    if (s.kind === 'waves') {
      for (var i = 0; i < 7; i++) {
        c.beginPath();
        var y0 = h * (0.25 + i * 0.09), amp = 18 + i * 4, f = 0.004 + i * 0.0006;
        for (var x = 0; x <= w; x += 12) c.lineTo(x, y0 + Math.sin(x * f + t * (0.4 + i * 0.05) + i) * amp + Math.sin(x * f * 2.3 - t * 0.3) * amp * 0.35);
        c.strokeStyle = 'rgba(' + (i === 3 ? s.gold : col) + ',' + (i === 3 ? 0.35 : 0.07) * A + ')'; c.lineWidth = i === 3 ? 1.4 : 1; c.stroke();
      }
    } else if (s.kind === 'dots') {
      var g = 28, cx = w * (0.75 + 0.1 * Math.sin(t * 0.15)), cy = h * (0.4 + 0.15 * Math.cos(t * 0.12));
      for (var yy = g / 2; yy < h; yy += g) for (var xx = g / 2; xx < w; xx += g) {
        var d = Math.hypot(xx - cx, yy - cy), wv = Math.sin(d * 0.03 - t * 1.6);
        var al = Math.max(0, wv) * Math.max(0, 1 - d / (w * 0.6));
        c.fillStyle = 'rgba(' + (al > 0.6 ? s.gold : col) + ',' + (0.05 + al * 0.3) * A + ')';
        c.fillRect(xx - 1.2, yy - 1.2, 2.4, 2.4);
      }
    } else if (s.kind === 'grid') {
      var gs = 64;
      c.strokeStyle = 'rgba(' + col + ',' + 0.05 * A + ')'; c.lineWidth = 1;
      for (var gx = 0; gx < w; gx += gs) { c.beginPath(); c.moveTo(gx + .5, 0); c.lineTo(gx + .5, h); c.stroke(); }
      for (var gy = 0; gy < h; gy += gs) { c.beginPath(); c.moveTo(0, gy + .5); c.lineTo(w, gy + .5); c.stroke(); }
      for (var q = 0; q < 5; q++) {
        var lane = Math.floor((s.seed * 97 + q * 37) % Math.max(1, Math.floor(h / gs))) * gs;
        var px = ((t * (60 + q * 18) + q * 300) % (w + 200)) - 100;
        var gr = c.createLinearGradient(px - 120, 0, px, 0);
        gr.addColorStop(0, 'rgba(' + s.gold + ',0)'); gr.addColorStop(1, 'rgba(' + s.gold + ',' + 0.55 * A + ')');
        c.strokeStyle = gr; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px - 120, lane + .5); c.lineTo(px, lane + .5); c.stroke();
        c.fillStyle = 'rgba(' + s.gold + ',' + 0.7 * A + ')'; c.fillRect(px - 2, lane - 1.5, 4, 4);
      }
    } else if (s.kind === 'orbits') {
      var ox = w * 0.82, oy = h * 0.35;
      for (var r = 1; r <= 6; r++) {
        var R = r * 70;
        c.beginPath(); c.arc(ox, oy, R, 0, 6.283); c.strokeStyle = 'rgba(' + col + ',' + 0.06 * A + ')'; c.lineWidth = 1; c.stroke();
        var an = t * (0.25 / r) * (r % 2 ? 1 : -1) + r;
        c.beginPath(); c.arc(ox + Math.cos(an) * R, oy + Math.sin(an) * R, r === 3 ? 4 : 2.5, 0, 6.283);
        c.fillStyle = 'rgba(' + (r === 3 ? s.gold : col) + ',' + (r === 3 ? 0.8 : 0.3) * A + ')'; c.fill();
      }
    } else if (s.kind === 'bars') {
      var bw = 34, base = h;
      for (var b = 0; b < s.b.length; b++) {
        var bh = (0.12 + 0.18 * (0.5 + 0.5 * Math.sin(t * 0.6 + s.b[b].ph))) * h * (0.4 + s.b[b].h * 0.6);
        c.fillStyle = 'rgba(' + col + ',' + 0.045 * A + ')'; c.fillRect(b * bw + 6, base - bh, bw - 12, bh);
      }
      c.beginPath();
      for (var b2 = 0; b2 < s.b.length; b2++) {
        var bh2 = (0.12 + 0.18 * (0.5 + 0.5 * Math.sin(t * 0.6 + s.b[b2].ph))) * h * (0.4 + s.b[b2].h * 0.6);
        c.lineTo(b2 * bw + bw / 2, base - bh2 - 14);
      }
      c.strokeStyle = 'rgba(' + s.gold + ',' + 0.4 * A + ')'; c.lineWidth = 1.4; c.stroke();
    } else if (s.kind === 'net' || s.kind === 'flow') {
      var P = s.p, L = 150;
      for (var i2 = 0; i2 < P.length; i2++) {
        var p = P[i2];
        if (s.kind === 'flow') { p.x += 0.35 + (i2 % 5) * 0.08; p.y += Math.sin(t + i2) * 0.15; if (p.x > w + 10) { p.x = -10; p.y = Math.random() * h; } }
        else { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; }
      }
      for (var a = 0; a < P.length; a++) for (var b3 = a + 1; b3 < P.length; b3++) {
        var dx = P[a].x - P[b3].x, dy = P[a].y - P[b3].y, dd = dx * dx + dy * dy;
        if (dd < L * L) { c.strokeStyle = 'rgba(' + col + ',' + (1 - Math.sqrt(dd) / L) * 0.12 * A + ')'; c.lineWidth = 1; c.beginPath(); c.moveTo(P[a].x, P[a].y); c.lineTo(P[b3].x, P[b3].y); c.stroke(); }
      }
      for (var z = 0; z < P.length; z++) { c.beginPath(); c.arc(P[z].x, P[z].y, z % 9 === 0 ? 2.6 : 1.6, 0, 6.283); c.fillStyle = 'rgba(' + (z % 9 === 0 ? s.gold : col) + ',' + (z % 9 === 0 ? 0.7 : 0.25) * A + ')'; c.fill(); }
    }
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { instances.forEach(function (s) { if (s.sec === e.target) s.on = e.isIntersecting; }); });
  }, { rootMargin: '100px' }) : null;
  instances.forEach(function (s) { if (io) io.observe(s.sec); else s.on = true; draw(s); });

  var last = 0;
  function loop(now) {
    var dt = Math.min(50, now - (last || now)) / 1000; last = now;
    instances.forEach(function (s) { if (s.on) { s.t += dt; draw(s); } });
    requestAnimationFrame(loop);
  }
  if (!reduce) requestAnimationFrame(loop);

  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { instances.forEach(function (s) { setup(s); draw(s); }); }, 200); });
})();
