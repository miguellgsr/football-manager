import { askJSON, guard, errorResponse } from "@/lib/ai";

export const maxDuration = 60;

const SYSTEM = `Você é um analista tático especialista em Football Manager.
Você recebe o elenco do usuário (atributos de 1 a 20), a formação e o time titular atual (por slot), e o estilo desejado.
Sugira a melhor abordagem tática para ESTE elenco: formação (pode manter ou sugerir outra se claramente melhor), mentalidade, instruções com e sem a bola, transição, e a função/dever de cada titular com base nos atributos reais.
Aponte pontos fracos e como esconder ou corrigir via tática. Use nomes das funções como aparecem no FM em português do Brasil quando possível. Seja concreto e cite atributos.
Formato de saída:
{
 "formation": string,
 "mentality": string,
 "reasoning": string,
 "inPossession": string[],
 "outOfPossession": string[],
 "transition": string[],
 "lineup": [{"slot": string, "playerId": string, "role": string, "duty": "Defender"|"Apoiar"|"Atacar", "why": string}],
 "weaknesses": [{"issue": string, "fix": string}],
 "setPieces": string,
 "alternativePlan": string
}
Só use "playerId" de jogadores existentes no elenco enviado.`;

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = await req.json();
    const text = `DADOS (JSON):\n${JSON.stringify(body)}\n\nAnalise e devolva o JSON no formato pedido.`;
    const out = await askJSON({ system: SYSTEM, content: text, maxTokens: 6000 });
    return Response.json(out);
  } catch (e) {
    return errorResponse(e);
  }
}
