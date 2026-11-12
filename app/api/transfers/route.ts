import { askJSON, guard, errorResponse } from "@/lib/ai";

export const maxDuration = 60;

const SYSTEM = `Você é um diretor de futebol / head of recruitment especialista em Football Manager.
Você recebe o elenco do usuário (atributos de 1 a 20 do FM, idade, contrato, posições), o orçamento, o estilo desejado e opcionalmente uma shortlist de candidatos já coletados.
Você NÃO tem acesso à base completa do jogo: então (1) diagnostique carências do elenco e descreva o PERFIL ideal de contratação, e (2) se houver candidatos, ranqueie os que melhor se encaixam.
Considere: cobertura e profundidade por posição, idade e curva de envelhecimento, contratos vencendo, encaixe no estilo/formação, atributos-chave por função, orçamento de transferência e de salários.
Seja concreto e use os atributos reais do elenco para justificar. Escreva em português do Brasil.
Formato de saída:
{
 "summary": string,
 "needs": [{"position": string, "priority": "alta"|"media"|"baixa", "reason": string, "idealProfile": {"role": string, "keyAttributes": string[], "ageRange": string, "notes": string}, "searchFilters": string}],
 "shortlistPicks": [{"playerId": string, "needPosition": string, "score": number, "why": string, "risks": string}],
 "sellOrRenew": [{"playerId": string, "action": "vender"|"renovar"|"emprestar"|"manter", "why": string}]
}
"searchFilters" deve ser um texto curto com os filtros sugeridos para a Busca de Jogadores do FM (posição, idade, atributos mínimos, contrato, valor).
"score" vai de 0 a 100. Só inclua em shortlistPicks jogadores cujo "id" exista na shortlist enviada.`;

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = await req.json();
    const text = `DADOS (JSON):\n${JSON.stringify(body)}\n\nAnalise e devolva o JSON no formato pedido.`;
    const out = await askJSON({ system: SYSTEM, text, maxTokens: 6000 });
    return Response.json(out);
  } catch (e) {
    return errorResponse(e);
  }
}
