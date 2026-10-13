/* Oráculo Analytics · medición de conversiones (Google Analytics 4) */
(function () {
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }
  var lang = document.documentElement.lang || 'es';

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('a,button') : null;
    if (!el) return;
    var href = el.getAttribute('href') || '';
    if (/wa\.me|whatsapp\.com/i.test(href)) {
      track('whatsapp_click', { idioma: lang, ubicacion: el.closest('section,header,footer,nav') ? (el.closest('section,header,footer,nav').id || el.closest('section,header,footer,nav').tagName.toLowerCase()) : 'otro' });
    } else if (/^mailto:/i.test(href)) {
      track('email_click', { idioma: lang });
    } else if (el.classList.contains('oa-launch') || el.hasAttribute('data-open-chat')) {
      if (el.classList.contains('oa-launch') && el.getAttribute('aria-expanded') === 'true') return; // ya estaba abierto
      track('chat_abierto', { idioma: lang });
    }
  }, true);

  document.addEventListener('submit', function (ev) {
    var f = ev.target;
    if (!f || !f.getAttribute) return;
    if (f.id === 'dg-form') {
      var giro = f.querySelector('select');
      track('mini_diagnostico', { idioma: lang, giro: giro ? giro.value : '' });
    } else if (f.hasAttribute('data-netlify')) {
      track('formulario_enviado', { idioma: lang });
    }
  }, true);
})();
