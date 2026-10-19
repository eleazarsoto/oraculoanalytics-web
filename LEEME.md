# Oráculo Analytics · sitio con IA (Cloudflare Pages)

## Estructura
- `public/` → el sitio (español en la raíz, inglés en `en/`, páginas de gracias, `assets/`, `social/`).
- `functions/api/` → asistente (`/api/chat`), mini diagnóstico (`/api/diagnostico`) y formulario de contacto (`/api/contacto`).
- `lib/oraculo.js` → textos y reglas compartidas de la IA (base de conocimiento, número de WhatsApp).
- `public/_headers` → caché de `assets/`.
- `netlify/` y `netlify.toml` → ya no se usan; se pueden borrar.

## Configuración en Cloudflare Pages
- Build command: vacío · Build output directory: `public`
- Variables (Settings → Variables and Secrets):
  - `ANTHROPIC_API_KEY` (tipo Secret) → clave de console.anthropic.com
  - `LEADS_WEBHOOK_URL` → Production URL del webhook de n8n "Leads del sitio · Oráculo"
- Después de cambiar variables: Deployments → Retry deployment.

## Cambiar el número de WhatsApp
Busca `523319780196` en `public/`, `functions/` y `33 1978 0196` en `lib/oraculo.js` y reemplázalo.
