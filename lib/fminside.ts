import Anthropic from "@anthropic-ai/sdk";
import { ANTHROPIC_MODEL, GEMINI_MODEL, provider } from "./ai";

/** A mensagem pede indicação/busca de contratação? */
export function wantsRecommendations(message: string): boolean {
  return /contrat|indica|refor[cç]o|sugest|recomend|procur|busc|encontr|substitut|parecid|similar|alvo|target|signing|negoci|comprar|jogadores? (para|pra)/i.test(message || "");
}

const PROMPT = (message: string, ctx: string) => `Você é um pesquisador de scouting de Football Manager. Use SOMENTE o site fminside.net (https://fminside.net/players e as páginas de jogadores dele) para encontrar jogadores que atendam ao pedido abaixo.

PEDIDO DO USUÁRIO:
${message}

CONTEXTO DO CLUBE (resumo):
${ctx}

Regras:
- Liste até 8 candidatos reais encontrados no fminside.net, ordenados do mais ao menos adequado.
- Para cada um informe, apenas se aparecer no site: nome, posições, idade, clube, contrato (fim), salário, valor, CA/PA ou nota, atributos/funções em destaque e a URL da página no fminside.net.
- NÃO invente nada. Se um dado não aparece no site, escreva "n/d". Se não conseguir acessar o site ou não achar jogadores, diga isso claramente em vez de usar a memória.
- Responda em texto simples, um jogador por bloco, em português, mantendo termos do FM em inglês.`;

async function viaGemini(prompt: string): Promise<string> {
  const call = (tools: any[]) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], tools, generationConfig: { maxOutputTokens: 3500 } }),
      signal: AbortSignal.timeout(20000),
    });
  let res = await call([{ url_context: {} }, { google_search: {} }]);
  if (res.status === 400) res = await call([{ google_search: {} }]); // combinação de ferramentas não aceita: só a busca
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message || `Erro ${res.status}`);
  const text = (data?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("").trim();
  const links: string[] = (data?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []).map((c: any) => c.web?.uri).filter(Boolean);
  return text + (links.length ? "\nFontes: " + [...new Set(links)].slice(0, 8).join(" ") : "");
}

async function viaAnthropic(prompt: string): Promise<string> {
  const client = new Anthropic();
  const res: any = await client.messages.create(
    {
      model: ANTHROPIC_MODEL,
      max_tokens: 3500,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5, allowed_domains: ["fminside.net"] }] as any,
      messages: [{ role: "user", content: prompt }],
    },
    { timeout: 22000 }
  );
  return res.content.map((b: any) => (b.type === "text" ? b.text : "")).join("").trim();
}

/** Pesquisa ao vivo no FMInside. Devolve null se falhar (a IA segue sem os dados e avisa). */
export async function researchFmInside(message: string, ctx: string): Promise<{ text: string | null; error?: string }> {
  try {
    const prompt = PROMPT(message, ctx);
    const text = provider() === "gemini" ? await viaGemini(prompt) : await viaAnthropic(prompt);
    return { text: text || null };
  } catch (e: any) {
    return { text: null, error: e?.message || "falha" };
  }
}
