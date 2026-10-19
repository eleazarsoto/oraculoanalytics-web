# Oráculo Analytics · sitio con IA (Cloudflare Workers)

## Estructura
- `public/` → el sitio (español en la raíz, inglés en `en/`, páginas de gracias, `assets/`, `social/`).
- `functions/api/` → asistente (`/api/chat`), mini diagnóstico (`/api/diagnostico`) y formulario de contacto (`/api/contacto`).
- `lib/oraculo.js` → textos y reglas compartidas de la IA (base de conocimiento, número de WhatsApp).
- `public/_headers` → caché de `assets/`.
- `netlify/` y `netlify.toml` → ya no se usan; se pueden borrar.

## Configuración en Cloudflare
- `wrangler.jsonc` + `worker.js` → Cloudflare publica `public/` y dirige `/api/*` a las funciones.
- Variables (Workers & Pages → oraculoanalytics-web → Settings → Variables and Secrets), ambas tipo Secret:
  - `ANTHROPIC_API_KEY` (tipo Secret) → clave de console.anthropic.com
  - `LEADS_WEBHOOK_URL` → Production URL del webhook de n8n "Leads del sitio · Oráculo"
- Los secretos se guardan solos; no hace falta volver a publicar.

## Cambiar el número de WhatsApp
Busca `523319780196` en `public/`, `functions/` y `33 1978 0196` en `lib/oraculo.js` y reemplázalo.
