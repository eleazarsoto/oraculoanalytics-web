// Autodiagnóstico v2: recibe las respuestas y los datos del visitante y los reenvía a n8n,
// que arma el reporte en PDF, lo manda por correo y guarda el lead en la hoja.
// Webhook: variable secreta REPORTE_WEBHOOK_URL (si falta, usa LEADS_WEBHOOK_URL).
import { clip, guard, json } from "../../lib/oraculo.js";

const GIROS = ["turismo", "restaurante", "salud", "comercio", "servicios", "otro"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequest({ request, env }) {
  const blocked = guard(request, { limit: 6 });
  if (blocked) return blocked;

  let d;
  try { d = await request.json(); } catch { return json({ error: "json" }, 400); }
  if (d.empresa_web) return json({ ok: true }); // robot: se ignora en silencio

  const num = (v, max) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
  const lead = {
    fecha: new Date().toISOString(),
    idioma: d.idioma === "en" ? "en" : "es",
    formulario: "autodiagnostico",
    pagina: clip(d.pagina, 80),
    nombre: clip(d.nombre, 80),
    negocio: clip(d.negocio, 100),
    giro: GIROS.includes(d.giro) ? d.giro : "otro",
    correo: clip(d.correo, 120).toLowerCase(),
    whatsapp: clip(d.whatsapp, 30),
    puntos: num(d.puntos, 20),
    total: num(d.total, 20),
    servicio: clip(d.servicio, 40),
    marcadas: (Array.isArray(d.marcadas) ? d.marcadas : []).slice(0, 12).map((m) => clip(m, 200)),
    ota: clip(d.ota, 40),
    reservas: num(d.reservas, 100000),
    ticket: num(d.ticket, 10000000),
    comision_estimada: num(d.comision_estimada, 100000000),
    utm_source: clip(d.utm_source, 80),
    utm_medium: clip(d.utm_medium, 80),
    utm_campaign: clip(d.utm_campaign, 120),
  };
  if (!lead.nombre || !lead.negocio || !EMAIL.test(lead.correo)) return json({ error: "campos" }, 400);

  const url = env.REPORTE_WEBHOOK_URL || env.LEADS_WEBHOOK_URL;
  if (!url) { console.error("Falta REPORTE_WEBHOOK_URL"); return json({ error: "config" }, 500); }
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(lead) });
    if (!r.ok) throw new Error(`webhook ${r.status}`);
  } catch (e) {
    console.error("reporte error", e.message);
    return json({ error: "webhook" }, 502);
  }
  return json({ ok: true });
}
