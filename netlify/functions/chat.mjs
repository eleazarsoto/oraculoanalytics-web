import { CHAT_SYSTEM, callClaude, guard, json } from "./_shared.mjs";

export default async (req) => {
  const blocked = guard(req, { limit: 30 });
  if (blocked) return blocked;
  let body;
  try { body = await req.json(); } catch { return json({ error: "body" }, 400); }

  // Últimos 12 turnos, texto recortado, roles válidos y alternados empezando por el visitante.
  const raw = Array.isArray(body?.messages) ? body.messages.slice(-12) : [];
  const messages = [];
  for (const m of raw) {
    const role = m?.role === "assistant" ? "assistant" : "user";
    const content = String(m?.content ?? "").trim().slice(0, 1200);
    if (!content) continue;
    if (messages.length && messages[messages.length - 1].role === role) messages[messages.length - 1].content += "\n" + content;
    else messages.push({ role, content });
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "empty" }, 400);

  try {
    const reply = await callClaude({ system: CHAT_SYSTEM, messages, max_tokens: 450 });
    return json({ reply });
  } catch (e) {
    console.error("chat error", e.code, e.status, e.message);
    return json({ error: e.code || "api" }, 502);
  }
};

export const config = { path: "/api/chat" };
