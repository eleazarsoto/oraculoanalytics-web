import { DIAG_SYSTEM, callClaude, clip, guard, json } from "../../lib/oraculo.js";

const STR = { type: "string" };
const SCHEMA = {
  type: "object",
  properties: {
    resumen: STR,
    preguntas: { type: "array", items: { type: "object", properties: { pregunta: STR, por_que: STR }, required: ["pregunta", "por_que"], additionalProperties: false } },
    dato_a_reunir: STR, primer_paso: STR, servicio: STR, por_que_servicio: STR,
  },
  required: ["resumen", "preguntas", "dato_a_reunir", "primer_paso", "servicio", "por_que_servicio"],
  additionalProperties: false,
};

function looseParse(t) {
  try { return JSON.parse(t); } catch {}
  // Reparación básica: comillas tipográficas y comas sobrantes
  const fixed = t.replace(/[\u201C\u201D]/g, "'").replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(fixed);
}

function parseDiag(text) {
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("sin JSON");
  const d = looseParse(text.slice(start, end + 1));
  const s = (v, n = 400) => clip(v, n);
  const preguntas = (Array.isArray(d.preguntas) ? d.preguntas : []).slice(0, 3).map((p) => ({ pregunta: s(p?.pregunta, 220), por_que: s(p?.por_que, 260) }));
  if (preguntas.length < 3 || !d.resumen) throw new Error("JSON incompleto");
  return { resumen: s(d.resumen), preguntas, dato_a_reunir: s(d.dato_a_reunir), primer_paso: s(d.primer_paso), servicio: s(d.servicio, 80), por_que_servicio: s(d.por_que_servicio) };
}

export async function onRequest({ request: req, env }) {
  const blocked = guard(req, { limit: 8 });
  if (blocked) return blocked;
  let b;
  try { b = await req.json(); } catch { return json({ error: "body" }, 400); }
  const idioma = b?.lang === "en" ? "inglés" : "español";
  const negocio = clip(b?.negocio, 300), giro = clip(b?.giro, 60), pregunta = clip(b?.pregunta, 400);
  const fuentes = (Array.isArray(b?.fuentes) ? b.fuentes : []).slice(0, 8).map((x) => clip(x, 40)).join(", ");
  if (negocio.length < 8) return json({ error: "short" }, 400);

  const user = `idioma: ${idioma}\ngiro: ${giro || "no indicado"}\nnegocio: ${negocio}\ndónde registra hoy ventas o clientes: ${fuentes || "no indicado"}\nlo que quiere saber: ${pregunta || "no indicado"}`;
  const messages = [{ role: "user", content: user }];
  try {
    let text;
    try {
      // Salida estructurada: la API garantiza un JSON válido con esta forma.
      text = await callClaude({ key: env.ANTHROPIC_API_KEY, system: DIAG_SYSTEM, messages, max_tokens: 700, extra: { output_config: { format: { type: "json_schema", schema: SCHEMA } } } });
    } catch (e) {
      if (e.status !== 400) throw e;
      text = await callClaude({ key: env.ANTHROPIC_API_KEY, system: DIAG_SYSTEM, messages, max_tokens: 700 }); // respaldo sin formato estructurado
    }
    return json(parseDiag(text));
  } catch (e) {
    console.error("diag error", e.code, e.status, e.message);
    return json({ error: e.code || "api" }, 502);
  }
}
