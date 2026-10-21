// Punto de entrada en Cloudflare Workers: las rutas /api/* van a las funciones;
// todo lo demás se sirve desde la carpeta public/.
import { onRequest as chat } from "./functions/api/chat.js";
import { onRequest as diagnostico } from "./functions/api/diagnostico.js";
import { onRequestPost as contacto } from "./functions/api/contacto.js";
import { onRequest as reporte } from "./functions/api/reporte.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const ctx = { request, env };
    if (pathname === "/api/chat") return chat(ctx);
    if (pathname === "/api/diagnostico") return diagnostico(ctx);
    if (pathname === "/api/reporte") return reporte(ctx);
    if (pathname === "/api/contacto") {
      if (request.method !== "POST") return new Response("Método no permitido", { status: 405 });
      return contacto(ctx);
    }
    return env.ASSETS.fetch(request);
  },
};
