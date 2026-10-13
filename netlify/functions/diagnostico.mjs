import { DIAG_SYSTEM, callClaude, clip, guard, json } from "./_shared.mjs";

export function parseDiag(text) {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("sin JSON");
  const d = JSON.parse(text.slice(start, end + 1));
  const s = (v, n = 400) => clip(v, n);
  const preguntas = (Array.isArray(d.preguntas) ? d.preguntas : []).slice(0, 3).map((p) => ({ pregunta: s(p?.pregunta, 220), por_que: s(p?.por_que, 260) }));
  if (preguntas.length < 3 || !d.resumen) throw new Error("JSON incompleto");
  return { resumen: s(d.resumen), preguntas, dato_a_reunir: s(d.dato_a_reunir), primer_paso: s(d.primer_paso), servicio: s(d.servicio, 80), por_que_servicio: s(d.por_que_servicio) };
}

export default async (req) => {
  const blocked = guard(req, { limit: 8 });
  if (blocked) return blocked;
  let b;
  try { b = await req.json(); } catch { return json({ error: "body" }, 400); }
  const idioma = b?.lang === "en" ? "inglés" : "español";
  const negocio = clip(b?.negocio, 300), giro = clip(b?.giro, 60), pregunta = clip(b?.pregunta, 400);
  const fuentes = (Array.isArray(b?.fuentes) ? b.fuentes : []).slice(0, 8).map((x) => clip(x, 40)).join(", ");
  if (negocio.length < 8) return json({ error: "short" }, 400);

  const user = `idioma: ${idioma}\ngiro: ${giro || "no indicado"}\nnegocio: ${negocio}\ndónde registra hoy ventas o clientes: ${fuentes || "no indicado"}\nlo que quiere saber: ${pregunta || "no indicado"}`;
  try {
    let text = await callClaude({ system: DIAG_SYSTEM, messages: [{ role: "user", content: user }], max_tokens: 900 });
    let data;
    try { data = parseDiag(text); }
    catch {
      text = await callClaude({ system: DIAG_SYSTEM, messages: [{ role: "user", content: user }, { role: "assistant", content: text }, { role: "user", content: "Devuelve solo el objeto JSON válido con la forma pedida." }], max_tokens: 900 });
      data = parseDiag(text);
    }
    return json(data);
  } catch (e) {
    console.error("diag error", e.code, e.status, e.message);
    return json({ error: e.code || "api" }, 502);
  }
};

export const config = { path: "/api/diagnostico" };
