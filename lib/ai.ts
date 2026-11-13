import Anthropic from "@anthropic-ai/sdk";

export type Provider = "anthropic" | "gemini";

export function provider(): Provider {
  const p = (process.env.AI_PROVIDER || "").toLowerCase();
  if (p === "gemini" || p === "anthropic") return p;
  return process.env.ANTHROPIC_API_KEY ? "anthropic" : "gemini";
}

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export function guard(req: Request): Response | null {
  const code = process.env.ACCESS_CODE;
  if (code && req.headers.get("x-access-code") !== code) {
    return Response.json({ error: "Código de acesso inválido. Informe-o na aba Extras & Clube." }, { status: 401 });
  }
  const p = provider();
  if (p === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY não configurada no servidor." }, { status: 500 });
  }
  if (p === "gemini" && !process.env.GEMINI_API_KEY) {
    return Response.json({ error: "GEMINI_API_KEY não configurada no servidor." }, { status: 500 });
  }
  return null;
}

/** Entrada simples e independente de provedor: texto + imagens JPEG em base64. */
export interface HistoryItem { role: "user" | "assistant"; text: string }

export async function askJSON(opts: {
  system: string;
  text: string;
  images?: string[];
  history?: HistoryItem[];
  maxTokens?: number;
}): Promise<any> {
  const system = opts.system + "\n\nResponda SOMENTE com um objeto JSON válido, sem markdown e sem texto fora do JSON.";
  const raw = provider() === "gemini" ? await callGemini(system, opts) : await callAnthropic(system, opts);
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("A IA não devolveu JSON válido.");
  return JSON.parse(raw.slice(start, end + 1));
}

/** Mantém só mensagens não vazias, começando por uma do usuário e alternando papéis. */
function cleanHistory(h?: HistoryItem[]): HistoryItem[] {
  const out: HistoryItem[] = [];
  for (const m of h ?? []) {
    if (!m.text?.trim()) continue;
    if (out.length === 0 && m.role !== "user") continue;
    if (out.length && out[out.length - 1].role === m.role) { out[out.length - 1] = m; continue; }
    out.push(m);
  }
  if (out.length && out[out.length - 1].role === "user") out.pop(); // a próxima mensagem já é do usuário
  return out;
}

async function callAnthropic(system: string, opts: { text: string; images?: string[]; history?: HistoryItem[]; maxTokens?: number }) {
  const client = new Anthropic();
  const content: Anthropic.MessageParam["content"] = [
    ...(opts.images ?? []).map(
      (data) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } }) as const
    ),
    { type: "text", text: opts.text },
  ];
  const res = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: opts.maxTokens ?? 4000,
    system,
    messages: [
      ...cleanHistory(opts.history).map((h) => ({ role: h.role, content: h.text }) as Anthropic.MessageParam),
      { role: "user", content },
    ],
  });
  return res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
}

const GEMINI_FALLBACKS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.7-flash,gemini-3.5-flash-lite").split(",").map((m) => m.trim()).filter(Boolean);

async function callGemini(system: string, opts: { text: string; images?: string[]; history?: HistoryItem[]; maxTokens?: number }) {
  const parts: any[] = [
    ...(opts.images ?? []).map((data) => ({ inlineData: { mimeType: "image/jpeg", data } })),
    { text: opts.text },
  ];
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [
      ...cleanHistory(opts.history).map((h) => ({ role: h.role === "assistant" ? "model" : "user", parts: [{ text: h.text }] })),
      { role: "user", parts },
    ],
    generationConfig: { responseMimeType: "application/json", maxOutputTokens: opts.maxTokens ?? 4000 },
  });
  const call = (model: string) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
      body,
    });

  // modelo principal e, se estiver sobrecarregado/indisponível, os reservas (GEMINI_FALLBACK_MODELS)
  const models = [GEMINI_MODEL, ...GEMINI_FALLBACKS.filter((m) => m !== GEMINI_MODEL)];
  let res!: Response;
  for (let mi = 0; mi < models.length; mi++) {
    for (let attempt = 0; attempt < 2; attempt++) {
      res = await call(models[mi]);
      if (![500, 502, 503].includes(res.status)) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
    if (res.ok || ![500, 502, 503, 404, 429].includes(res.status)) break;
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error?.message || `Erro ${res.status} na API do Gemini`;
    throw new Error(res.status === 503 ? "O Gemini está sobrecarregado agora (erro do Google, não do site). Tente de novo em um minuto." : res.status === 429 ? "Limite gratuito do Gemini atingido. Espere um pouco e tente de novo." : msg);
  }
  const out = (data?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("");
  if (!out) throw new Error("O Gemini não devolveu conteúdo (pode ter sido bloqueado). Tente de novo.");
  return out;
}

export function errorResponse(e: unknown) {
  const msg = e instanceof Error ? e.message : "Erro desconhecido";
  return Response.json({ error: msg }, { status: 500 });
}
