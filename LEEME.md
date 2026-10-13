# Oráculo Analytics · sitio con IA

## Estructura
- `public/` → el sitio (español en la raíz, inglés en `en/`, páginas de gracias, `assets/`).
- `netlify/functions/` → el asistente (`/api/chat`) y el mini diagnóstico (`/api/diagnostico`).
- `netlify.toml` → le dice a Netlify qué publicar.

## Publicarlo (las funciones de IA NO funcionan arrastrando la carpeta)
1. Crea un repositorio nuevo en GitHub (por ejemplo `oraculoanalytics-web`) y sube TODO el contenido de esta carpeta.
2. En Netlify, entra a tu proyecto → Project configuration → Build & deploy → Link repository, y elige ese repositorio.
3. Deja vacío el build command. Netlify lee `netlify.toml` solo.
4. En console.anthropic.com crea una clave de API y pon un límite de gasto mensual (por ejemplo USD 10).
5. En Netlify → Project configuration → Environment variables, agrega `ANTHROPIC_API_KEY` con tu clave.
6. Vuelve a publicar (Deploys → Trigger deploy).

## Cambiar el número de WhatsApp
Busca `523319780196` en `public/` y en `netlify/functions/_shared.mjs` y reemplázalo.
