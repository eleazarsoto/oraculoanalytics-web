// Formulario de contacto (sustituye a Netlify Forms).
// Recibe el formulario, lo reenvía al webhook de n8n (variable LEADS_WEBHOOK_URL)
// y lleva al visitante a la página de gracias.
import { clip } from "../../lib/oraculo.js";

const CAMPOS = ["nombre", "negocio", "whatsapp", "como_nos_encontro", "pregunta", "utm_source", "utm_medium", "utm_campaign"];

function fallo(en) {
  const t = en
    ? ["We could not send your message", "Please try again in a minute, or write to me directly on WhatsApp.", "Write on WhatsApp", "Back"]
    : ["No pudimos enviar su mensaje", "Intente de nuevo en un minuto o escríbame directamente por WhatsApp.", "Escribir por WhatsApp", "Volver"];
  const html = `<!doctype html><html lang="${en ? "en" : "es"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t[0]}</title>
<style>body{font-family:system-ui,sans-serif;background:#F4EFE6;color:#16343A;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}main{max-width:440px;text-align:center}a{display:inline-block;margin:8px;padding:12px 18px;border-radius:999px;background:#16343A;color:#fff;text-decoration:none}a.s{background:transparent;color:#16343A;border:1px solid #16343A}</style></head>
<body><main><h1>${t[0]}</h1><p>${t[1]}</p><a href="https://wa.me/523320267301">${t[2]}</a><a class="s" href="${en ? "/en/" : "/"}#contacto">${t[3]}</a></main></body></html>`;
  return new Response(html, { status: 502, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function onRequestPost({ request, env }) {
  let form;
  try { form = await request.formData(); } catch { return new Response("Solicitud inválida", { status: 400 }); }
  const en = String(form.get("form-name") || "").endsWith("-en");
  const gracias = new URL(en ? "/en/thanks/" : "/gracias/", request.url).toString();

  if (form.get("bot-field")) return Response.redirect(gracias, 303); // robot: se ignora en silencio

  const lead = { fecha: new Date().toISOString(), idioma: en ? "en" : "es", formulario: clip(form.get("form-name"), 40) };
  for (const c of CAMPOS) lead[c] = clip(form.get(c), c === "pregunta" ? 1000 : 120);
  if (!lead.nombre || !lead.whatsapp) return fallo(en);

  if (!env.LEADS_WEBHOOK_URL) { console.error("Falta LEADS_WEBHOOK_URL"); return fallo(en); }
  try {
    const r = await fetch(env.LEADS_WEBHOOK_URL, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(lead) });
    if (!r.ok) throw new Error(`webhook ${r.status}`);
  } catch (e) {
    console.error("lead error", e.message);
    return fallo(en);
  }
  return Response.redirect(gracias, 303);
}
