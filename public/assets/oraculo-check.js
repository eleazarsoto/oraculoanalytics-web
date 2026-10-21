// Autodiagnóstico v2 de Oráculo Analytics.
// Calcula el puntaje al marcar casillas y, al final, ofrece enviar un reporte por correo.
// El formulario se envía a /api/reporte, que lo reenvía a n8n (variable REPORTE_WEBHOOK_URL).
(function () {
  var box = document.getElementById('chk');
  var out = document.getElementById('chk-out');
  if (!box || !out) return;
  var EN = document.documentElement.lang === 'en';
  var PRIV = EN ? '/en/privacy/' : '/aviso-de-privacidad/';
  var T = EN ? {
    names: { presencia: 'Websites and connected channels', auto: 'Task automation', datos: 'Databases and automated reports', mkt: 'Measurable digital marketing', diseno: 'Brand and social media design' },
    msg: ['Your business is on the right track. A diagnostic can still uncover opportunities you can\'t see yet.', 'There are a few leaks, and they can be fixed quickly.', 'Your business is losing customers and hours every week on several fronts.', 'Almost everything depends on you and your memory. A system would give you back time and control from the first month.'],
    diag: 'Data Diagnostic in 7 Days', diagThen: ', starting with the Data Diagnostic in 7 Days',
    title: 'Get your report by email', lead: 'Your three main leaks and what to do about each one, written for your type of business. It arrives in your inbox in a few minutes.',
    nombre: 'Your name', negocio: 'Business name', giro: 'Type of business', correo: 'Email', wa: 'WhatsApp (optional)',
    giros: [['turismo', 'Tourism, lodging or experiences'], ['restaurante', 'Restaurant or café'], ['salud', 'Health, wellness or beauty'], ['comercio', 'Retail or shop'], ['servicios', 'Professional services'], ['otro', 'Other']],
    otaQ: 'What share of your bookings comes through Booking, Airbnb or Expedia?', otaOpts: ['Less than 25%', '25% to 50%', '50% to 75%', 'More than 75%'],
    resQ: 'Bookings per month (approx.)', ticketQ: 'Average booking value (MXN)',
    est: function (v) { return 'Estimate: about $' + v + ' MXN a month in platform commissions (using a 15% reference commission).'; },
    consent: 'I accept the <a href="' + PRIV + '" target="_blank" rel="noopener">privacy notice</a> and agree to receive my report by email.',
    send: 'Send me my report', sending: 'Sending…',
    ok: function (m) { return 'Done. Your report is on its way to ' + m + '. If you don\'t see it in 10 minutes, check your spam folder.'; },
    err: 'We could not send it. Please try again in a minute, or write to me on WhatsApp.',
    need: 'Please fill in your name, business, type of business and email, and accept the privacy notice.'
  } : {
    names: { presencia: 'Sitios web y canales conectados', auto: 'Automatización de tareas', datos: 'Bases de datos y reportes automáticos', mkt: 'Marketing digital medible', diseno: 'Diseño de marca y redes' },
    msg: ['Su negocio va bien encaminado. Aun así, un diagnóstico puede encontrar oportunidades que hoy no se ven.', 'Hay algunas fugas, y se pueden cerrar rápido.', 'Su negocio está perdiendo clientes y horas cada semana en varios frentes.', 'Casi todo depende de usted y de su memoria. Un sistema le devolvería tiempo y control desde el primer mes.'],
    diag: 'Diagnóstico de Datos en 7 Días', diagThen: ', empezando por el Diagnóstico de Datos en 7 Días',
    title: 'Reciba su reporte por correo', lead: 'Sus 3 fugas principales y qué hacer con cada una, escrito para su tipo de negocio. Le llega a su correo en unos minutos.',
    nombre: 'Su nombre', negocio: 'Nombre del negocio', giro: 'Giro', correo: 'Correo', wa: 'WhatsApp (opcional)',
    giros: [['turismo', 'Turismo, hospedaje o experiencias'], ['restaurante', 'Restaurante o café'], ['salud', 'Salud, bienestar o belleza'], ['comercio', 'Comercio o tienda'], ['servicios', 'Servicios profesionales'], ['otro', 'Otro']],
    otaQ: '¿Qué parte de sus reservas llega por Booking, Airbnb o Expedia?', otaOpts: ['Menos de 25%', 'De 25% a 50%', 'De 50% a 75%', 'Más de 75%'],
    resQ: 'Reservas al mes (aprox.)', ticketQ: 'Valor promedio por reserva (MXN)',
    est: function (v) { return 'Estimado: unos $' + v + ' MXN al mes en comisiones de plataformas (con una comisión de referencia del 15%).'; },
    consent: 'Acepto el <a href="' + PRIV + '" target="_blank" rel="noopener">aviso de privacidad</a> y recibir mi reporte por correo.',
    send: 'Enviarme mi reporte', sending: 'Enviando…',
    ok: function (m) { return 'Listo. Su reporte va en camino a ' + m + '. Si no lo ve en 10 minutos, revise la carpeta de spam.'; },
    err: 'No pudimos enviarlo. Intente de nuevo en un minuto o escríbame por WhatsApp.',
    need: 'Llene su nombre, negocio, giro y correo, y acepte el aviso de privacidad.'
  };
  var MID = [0.15, 0.375, 0.625, 0.85];
  var ORDER = ['presencia', 'auto', 'datos', 'mkt', 'diseno'];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var preGiro = box.getAttribute('data-giro') || '';

  function track(extra) {
    var d = { puntos: Number(out.dataset.n || 0), servicio: out.dataset.s || '', idioma: EN ? 'en' : 'es' };
    for (var k in extra) d[k] = extra[k];
    if (typeof gtag === 'function') gtag('event', 'autodiagnostico_cta', d);
  }

  function upd() {
    var c = {}, n = 0;
    box.querySelectorAll('input').forEach(function (i) { if (i.checked) { n++; c[i.dataset.s] = (c[i.dataset.s] || 0) + 1; } });
    out.hidden = false;
    document.getElementById('chk-n').textContent = n;
    document.getElementById('chk-msg').textContent = T.msg[n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : 3];
    var best = null;
    ORDER.forEach(function (k) { if ((c[k] || 0) > (best ? c[best] : 0)) best = k; });
    var rec = best ? T.names[best] : T.diag;
    if (best && n >= 4) rec += T.diagThen;
    document.getElementById('chk-svc').textContent = rec;
    out.dataset.n = n; out.dataset.s = best || 'diagnostico';
  }
  box.addEventListener('change', upd);

  var cta = document.getElementById('chk-cta');
  if (cta) cta.addEventListener('click', function () { track({ tipo: 'conversacion' }); if (typeof fbq === 'function') fbq('trackCustom', 'Autodiagnostico'); });

  // ---- formulario del reporte ----
  var f = document.createElement('form');
  f.className = 'rep';
  f.noValidate = true;
  f.innerHTML =
    '<p class="rep-title">' + T.title + '</p><p class="rep-lead">' + T.lead + '</p>' +
    '<div class="rep-grid">' +
    '<label>' + T.nombre + '<input name="nombre" autocomplete="name" required maxlength="80"></label>' +
    '<label>' + T.negocio + '<input name="negocio" autocomplete="organization" required maxlength="100"></label>' +
    '<label>' + T.correo + '<input name="correo" type="email" autocomplete="email" required maxlength="120"></label>' +
    '<label>' + T.wa + '<input name="whatsapp" type="tel" autocomplete="tel" maxlength="30"></label>' +
    '<label class="rep-wide">' + T.giro + '<select name="giro" required><option value=""></option>' + T.giros.map(function (g) { return '<option value="' + g[0] + '"' + (g[0] === preGiro ? ' selected' : '') + '>' + esc(g[1]) + '</option>'; }).join('') + '</select></label>' +
    '</div>' +
    '<fieldset class="rep-ota" hidden><label class="rep-wide">' + T.otaQ + '<select name="ota"><option value=""></option>' + T.otaOpts.map(function (o, i) { return '<option value="' + i + '">' + esc(o) + '</option>'; }).join('') + '</select></label>' +
    '<label>' + T.resQ + '<input name="reservas" type="number" min="0" max="100000" inputmode="numeric"></label>' +
    '<label>' + T.ticketQ + '<input name="ticket" type="number" min="0" max="10000000" inputmode="numeric"></label>' +
    '<p class="rep-est" aria-live="polite"></p></fieldset>' +
    '<label class="rep-consent"><input type="checkbox" name="consent" required><span>' + T.consent + '</span></label>' +
    '<input class="rep-hp" name="empresa_web" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<button class="btn btn-gold" type="submit">' + T.send + ' <span class="arrow" aria-hidden="true">→</span></button>' +
    '<p class="rep-status" role="status" aria-live="polite"></p>';
  out.appendChild(f);

  var ota = f.querySelector('.rep-ota'), est = f.querySelector('.rep-est'), st = f.querySelector('.rep-status');
  function estimado() {
    var p = f.ota.value === '' ? null : MID[Number(f.ota.value)];
    var r = Number(f.reservas.value), t = Number(f.ticket.value);
    if (p === null || !(r > 0) || !(t > 0)) { est.textContent = ''; return 0; }
    var v = r * t * p * 0.15;
    est.textContent = T.est(fmt(v));
    return Math.round(v);
  }
  function showOta() { ota.hidden = f.giro.value !== 'turismo'; }
  f.giro.addEventListener('change', showOta); showOta();
  ['ota', 'reservas', 'ticket'].forEach(function (k) { f[k].addEventListener('input', estimado); f[k].addEventListener('change', estimado); });

  function utm(k) { try { return sessionStorage.getItem(k) || new URLSearchParams(location.search).get(k) || ''; } catch (e) { return ''; } }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var correo = f.correo.value.trim();
    if (!f.nombre.value.trim() || !f.negocio.value.trim() || !f.giro.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || !f.consent.checked) { st.textContent = T.need; return; }
    var marcadas = [];
    box.querySelectorAll('input').forEach(function (i) { if (i.checked) { var s = i.parentNode.querySelector('span'); marcadas.push(s ? s.textContent : ''); } });
    var data = {
      idioma: EN ? 'en' : 'es', pagina: location.pathname,
      nombre: f.nombre.value.trim(), negocio: f.negocio.value.trim(), giro: f.giro.value, correo: correo, whatsapp: f.whatsapp.value.trim(),
      puntos: Number(out.dataset.n || 0), total: box.querySelectorAll('input').length, servicio: out.dataset.s || '', marcadas: marcadas,
      ota: f.giro.value === 'turismo' && f.ota.value !== '' ? T.otaOpts[Number(f.ota.value)] : '',
      reservas: Number(f.reservas.value) || 0, ticket: Number(f.ticket.value) || 0, comision_estimada: f.giro.value === 'turismo' ? estimado() : 0,
      utm_source: utm('utm_source'), utm_medium: utm('utm_medium'), utm_campaign: utm('utm_campaign'),
      empresa_web: f.empresa_web.value
    };
    var btn = f.querySelector('button'); btn.disabled = true; btn.firstChild.textContent = T.sending + ' ';
    fetch('/api/reporte', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function () {
        f.querySelector('.rep-grid').hidden = true; ota.hidden = true; f.querySelector('.rep-consent').hidden = true; btn.hidden = true;
        st.textContent = T.ok(correo);
        track({ tipo: 'reporte', giro: data.giro });
        if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: 'autodiagnostico', content_category: data.giro });
      })
      .catch(function () { st.textContent = T.err; btn.disabled = false; btn.firstChild.textContent = T.send + ' '; });
  });
})();
