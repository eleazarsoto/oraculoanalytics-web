/* Oráculo Analytics · medición de conversiones (Google Analytics 4 + píxel de Meta) */
(function () {
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }
  function meta(name, custom) {
    if (typeof window.fbq === 'function') window.fbq(custom ? 'trackCustom' : 'track', name);
  }
  var lang = document.documentElement.lang || 'es';

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('a,button') : null;
    if (!el) return;
    var href = el.getAttribute('href') || '';
    if (/wa\.me|whatsapp\.com/i.test(href)) {
      meta('Contact'); track('whatsapp_click', { idioma: lang, ubicacion: el.closest('section,header,footer,nav') ? (el.closest('section,header,footer,nav').id || el.closest('section,header,footer,nav').tagName.toLowerCase()) : 'otro' });
    } else if (/^mailto:/i.test(href)) {
      meta('Contact'); track('email_click', { idioma: lang });
    } else if (el.classList.contains('oa-launch') || el.hasAttribute('data-open-chat')) {
      if (el.classList.contains('oa-launch') && el.getAttribute('aria-expanded') === 'true') return; // ya estaba abierto
      meta('ChatAbierto', true); track('chat_abierto', { idioma: lang });
    }
  }, true);

  document.addEventListener('submit', function (ev) {
    var f = ev.target;
    if (!f || !f.getAttribute) return;
    if (f.id === 'dg-form') {
      var giro = f.querySelector('select');
      meta('MiniDiagnostico', true); track('mini_diagnostico', { idioma: lang, giro: giro ? giro.value : '' });
    } else if ((f.getAttribute('action') || '').indexOf('/api/contacto') === 0) {
      track('formulario_enviado', { idioma: lang });
    }
  }, true);
})();
