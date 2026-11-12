import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

export function guard(req: Request): Response | null {
  const code = process.env.ACCESS_CODE;
  if (code && req.headers.get("x-access-code") !== code) {
    return Response.json({ error: "Código de acesso inválido. Informe-o na aba Clube." }, { status: 401 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY não configurada no servidor." }, { status: 500 });
  }
  return null;
}

export async function askJSON(opts: {
  system: string;
  content: Anthropic.MessageParam["content"];
  maxTokens?: number;
}): Promise<any> {
  const client = new Anthropic();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 4000,
    system: opts.system + "\n\nResponda SOMENTE com um objeto JSON válido, sem markdown e sem texto fora do JSON.",
    messages: [{ role: "user", content: opts.content }],
  });
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("A IA não devolveu JSON válido.");
  return JSON.parse(text.slice(start, end + 1));
}

export function errorResponse(e: unknown) {
  const msg = e instanceof Error ? e.message : "Erro desconhecido";
  return Response.json({ error: msg }, { status: 500 });
}
