/* Oráculo Analytics · asistente de chat y mini diagnóstico con IA
   Las llamadas van a /api/chat y /api/diagnostico (funciones de Cloudflare Pages).
   La clave de API nunca está en el navegador. */
(function () {
  var EN = (document.documentElement.lang || 'es').slice(0, 2) === 'en';
  var WA = 'https://wa.me/523320267301?text=' + encodeURIComponent(EN ? "Hi Eleazar, I chatted with your assistant and I'm interested in a free call." : 'Hola Eleazar, hablé con su asistente y me interesa una conversación gratuita.');
  var CONTACT = EN ? '#contact' : '#contacto';
  var T = EN ? {
    launch: 'Ask Oráculo', title: 'Oráculo assistant', status: 'AI · replies instantly', close: 'Close chat',
    hello: "Hi! I'm Oráculo Analytics' virtual assistant. Ask me anything about the services, how the 7-Day Data Diagnostic works, prices or team training.",
    chips: ['How does the diagnostic work?', 'How much does it cost?', 'What data do I need?', 'Do you train teams?'],
    ph: 'Type your question…', send: 'Send', note: 'AI assistant. It can make mistakes; confirm details with Eleazar.',
    book: 'Book a free call', wa: 'WhatsApp', err: "I couldn't connect right now. You can write to Eleazar directly and he'll reply within 24 hours.",
    rate: "You've sent many messages in a short time. Please wait a few minutes, or write to Eleazar directly.",
    dLoad: ['Reading your business…', 'Finding the right questions…', 'Preparing your first step…'],
    dTag: 'Preliminary mini diagnostic', dData: 'Data to gather', dStep: 'First step this week', dRec: 'Recommended service',
    dBook: 'Take it to a free call', dChat: 'Keep asking the assistant', dAgain: 'Try another', dShort: 'Describe your business in a few more words.',
    dErr: "The AI diagnostic isn't available right now. Write to me and we'll review it together.", dErrA: 'Message on WhatsApp',
    prefill: 'My mini diagnostic said:', ctxChat: 'I just got my mini diagnostic: '
  } : {
    launch: 'Pregúntele a Oráculo', title: 'Asistente Oráculo', status: 'IA · responde al instante', close: 'Cerrar chat',
    hello: '¡Hola! Soy el asistente virtual de Oráculo Analytics. Pregúnteme lo que quiera sobre los servicios, cómo funciona el Diagnóstico de Datos en 7 Días, precios o capacitación para su equipo.',
    chips: ['¿Cómo funciona el diagnóstico?', '¿Cuánto cuesta?', '¿Qué datos necesito?', '¿Capacitan a mi equipo?'],
    ph: 'Escriba su pregunta…', send: 'Enviar', note: 'Asistente con IA. Puede equivocarse; confirme los detalles con Eleazar.',
    book: 'Agendar conversación gratis', wa: 'WhatsApp', err: 'No pude conectarme en este momento. Puede escribirle directo a Eleazar y le responde en menos de 24 horas.',
    rate: 'Ha enviado muchos mensajes en poco tiempo. Espere unos minutos o escríbale directo a Eleazar.',
    dLoad: ['Leyendo su negocio…', 'Buscando las preguntas correctas…', 'Preparando su primer paso…'],
    dTag: 'Mini diagnóstico preliminar', dData: 'Dato a reunir', dStep: 'Primer paso esta semana', dRec: 'Servicio recomendado',
    dBook: 'Llevarlo a una conversación gratuita', dChat: 'Seguir preguntando al asistente', dAgain: 'Hacer otro', dShort: 'Describa su negocio con unas palabras más.',
    dErr: 'El diagnóstico con IA no está disponible en este momento. Escríbame y lo revisamos juntos.', dErrA: 'Escribir por WhatsApp',
    prefill: 'Mi mini diagnóstico dijo:', ctxChat: 'Acabo de recibir mi mini diagnóstico: '
  };
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg>';
  var SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  // Permite que una vista previa sustituya el transporte (p. ej. sin servidor)
  function api(path, payload) {
    if (window.ORACULO_AI_ADAPTER) return window.ORACULO_AI_ADAPTER(path, payload);
    return fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var e = new Error(d.error || 'http'); e.code = d.error || r.status; throw e; } return d; }); });
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function md(s) {
    var lines = esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').split(/\n/), out = '', list = false;
    lines.forEach(function (l) {
      var m = l.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)$/);
      if (m) { if (!list) { out += '<ul>'; list = true; } out += '<li>' + m[1] + '</li>'; return; }
      if (list) { out += '</ul>'; list = false; }
      if (l.trim()) out += '<p>' + l + '</p>';
    });
    return out + (list ? '</ul>' : '');
  }
  function store(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || 'null'); sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ---------- Chat ---------- */
  var launch = document.createElement('button');
  launch.className = 'oa-launch'; launch.type = 'button'; launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-controls', 'oa-panel');
  launch.innerHTML = '<span class="orb">' + ICON + '</span><span class="lbl">' + T.launch + '</span>';
  launch.setAttribute('aria-label', T.launch);
  var panel = document.createElement('section');
  panel.className = 'oa-panel'; panel.id = 'oa-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', T.title);
  panel.innerHTML = '<div class="oa-head"><span class="orb">' + ICON + '</span><div><b>' + T.title + '</b><small>' + T.status + '</small></div><button type="button" aria-label="' + T.close + '">&times;</button></div>' +
    '<div class="oa-msgs" aria-live="polite"></div><div class="oa-chips"></div>' +
    '<form class="oa-form"><textarea id="oa-in" aria-label="' + T.ph + '" rows="1" maxlength="1000" placeholder="' + T.ph + '"></textarea><button type="submit" aria-label="' + T.send + '">' + SEND + '</button></form>' +
    '<p class="oa-note">' + T.note + '</p>';
  document.body.appendChild(launch); document.body.appendChild(panel);
  var box = panel.querySelector('.oa-msgs'), chips = panel.querySelector('.oa-chips'), form = panel.querySelector('.oa-form'), input = panel.querySelector('textarea'), sendBtn = form.querySelector('button');
  var msgs = store('oa-chat') || [], busy = false, ctaShown = false;

  function bubble(role, text, html) {
    var d = document.createElement('div'); d.className = 'oa-m ' + (role === 'user' ? 'me' : 'bot');
    d.innerHTML = html ? text : (role === 'user' ? '<p>' + esc(text) + '</p>' : md(text));
    box.appendChild(d); box.scrollTop = box.scrollHeight; return d;
  }
  function cta() {
    if (ctaShown) return; ctaShown = true;
    var d = document.createElement('div'); d.className = 'oa-cta';
    d.innerHTML = '<a class="g" href="' + CONTACT + '">' + T.book + '</a><a class="w" href="' + WA + '" target="_blank" rel="noopener">' + T.wa + '</a>';
    d.querySelector('.g').addEventListener('click', close);
    box.appendChild(d); box.scrollTop = box.scrollHeight;
  }
  function renderAll() {
    box.innerHTML = ''; ctaShown = false; bubble('assistant', T.hello);
    msgs.forEach(function (m) { bubble(m.role, m.content); });
    if (msgs.filter(function (m) { return m.role === 'assistant'; }).length >= 2) cta();
    chips.innerHTML = '';
    if (!msgs.length) T.chips.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = c;
      b.addEventListener('click', function () { send(c); }); chips.appendChild(b);
    });
  }
  function send(text) {
    text = (text || '').trim(); if (!text || busy) return;
    busy = true; sendBtn.disabled = true; chips.innerHTML = '';
    msgs.push({ role: 'user', content: text }); store('oa-chat', msgs); bubble('user', text);
    input.value = ''; grow();
    var typing = bubble('assistant', '<span class="oa-typing"><span></span><span></span><span></span></span>', true);
    typing.style.padding = '0';
    api('/api/chat', { messages: msgs.slice(-12), lang: EN ? 'en' : 'es' }).then(function (d) {
      typing.remove(); var reply = d.reply || T.err;
      msgs.push({ role: 'assistant', content: reply }); store('oa-chat', msgs); bubble('assistant', reply);
      if (msgs.filter(function (m) { return m.role === 'assistant'; }).length >= 2) cta();
    }).catch(function (e) {
      typing.remove(); msgs.pop(); store('oa-chat', msgs);
      bubble('assistant', e && e.code === 'rate' ? T.rate : T.err); cta();
    }).then(function () { busy = false; sendBtn.disabled = false; input.focus(); });
  }
  function grow() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; }
  function open(prefill) {
    panel.hidden = false; launch.setAttribute('aria-expanded', 'true');
    if (!box.children.length) renderAll();
    if (prefill) { input.value = prefill; grow(); }
    setTimeout(function () { input.focus(); }, 60);
  }
  function close() { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); launch.focus(); }
  launch.addEventListener('click', function () { open(); });
  panel.querySelector('.oa-head button').addEventListener('click', close);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });
  input.addEventListener('input', grow);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  document.querySelectorAll('[data-open-chat]').forEach(function (b) { b.addEventListener('click', function () { open(b.getAttribute('data-open-chat') || ''); }); });
  window.OraculoChat = { open: open, send: function (t) { open(); send(t); } };

  /* ---------- Mini diagnóstico ---------- */
  var dg = document.getElementById('dg-form'); if (!dg) return;
  var out = document.getElementById('dg-out'), last = null;
  dg.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(dg), negocio = String(f.get('negocio') || '').trim();
    if (negocio.length < 8) { out.innerHTML = '<p class="dg-err">' + T.dShort + '</p>'; dg.querySelector('[name=negocio]').focus(); return; }
    var payload = { negocio: negocio, giro: f.get('giro') || '', fuentes: f.getAll('fuentes'), pregunta: f.get('pregunta') || '', lang: EN ? 'en' : 'es' };
    var btn = dg.querySelector('button[type=submit]'); btn.disabled = true;
    var k = 0; out.innerHTML = '<div class="dg-load" role="status"><p>' + T.dLoad[0] + '</p><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>';
    var tick = setInterval(function () { var p = out.querySelector('.dg-load p'); if (p) p.textContent = T.dLoad[++k % T.dLoad.length]; }, 1700);
    api('/api/diagnostico', payload).then(function (d) {
      last = { d: d, payload: payload }; render(d);
    }).catch(function () {
      out.innerHTML = '<p class="dg-err">' + T.dErr + ' <a href="' + WA + '" target="_blank" rel="noopener">' + T.dErrA + ' →</a></p>';
    }).then(function () { clearInterval(tick); btn.disabled = false; });
  });
  function render(d) {
    var qs = (d.preguntas || []).map(function (q) { return '<li><div><b>' + esc(q.pregunta) + '</b><span>' + esc(q.por_que) + '</span></div></li>'; }).join('');
    out.innerHTML = '<div class="dres" tabindex="-1"><p class="tagline">' + T.dTag + '</p><p class="resumen">' + esc(d.resumen) + '</p><ol>' + qs + '</ol>' +
      '<div class="two"><div><small>' + T.dData + '</small><p>' + esc(d.dato_a_reunir) + '</p></div><div><small>' + T.dStep + '</small><p>' + esc(d.primer_paso) + '</p></div></div>' +
      '<div class="rec"><small>' + T.dRec + '</small><b>' + esc(d.servicio) + '</b><p>' + esc(d.por_que_servicio) + '</p></div>' +
      '<div class="acts"><a class="btn btn-gold" href="' + CONTACT + '" data-act="book">' + T.dBook + ' <span class="arrow" aria-hidden="true">→</span></a><button type="button" class="lnk" data-act="chat">' + T.dChat + '</button><button type="button" class="lnk" data-act="again">' + T.dAgain + '</button></div></div>';
    var res = out.querySelector('.dres'); res.focus({ preventScroll: true });
    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    out.querySelector('[data-act=book]').addEventListener('click', function () {
      var ta = document.querySelector('.form textarea'); if (!ta) return;
      ta.value = T.prefill + ' ' + d.resumen + '\n' + (d.preguntas || []).map(function (q, i) { return (i + 1) + '. ' + q.pregunta; }).join('\n');
    });
    out.querySelector('[data-act=chat]').addEventListener('click', function () { open(T.ctxChat + d.resumen + ' '); });
    out.querySelector('[data-act=again]').addEventListener('click', function () { out.innerHTML = ''; dg.reset(); dg.querySelector('[name=negocio]').focus(); });
  }
})();
