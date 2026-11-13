import { askJSON, guard, errorResponse } from "@/lib/ai";
import { ROLE_SETS } from "@/lib/fmroles";

const ROLE_LIST = Object.entries(ROLE_SETS).map(([k, v]) => `${k}: com a bola = ${v.ip.join(" | ")}; sem a bola = ${v.oop.join(" | ")}`).join("\n");

export const maxDuration = 60;

const SYSTEM = `Você é um analista tático especialista em Football Manager, falando português do Brasil.
Você recebe o ELENCO COMPLETO do usuário (atributos de 1 a 20, idade, posições), o orçamento/estilo desejado, a formação e o time titular atual, e uma avaliação local ("localFit") do melhor 11 possível em cada formação, calculada por encaixe de atributos por função (0 a 100).
Sua tarefa: ler o elenco inteiro e decidir qual tática e qual estilo de jogo melhor encaixam NESTE grupo.
1) Compare pelo menos 3 combinações candidatas (formação + estilo, ex.: "4-3-3 pressão alta e posse", "4-2-3-1 contra-ataque"), dê uma nota de encaixe 0-100 para cada e explique em uma frase, citando atributos coletivos reais (ex.: velocidade e aceleração dos pontas, passe e visão do meio, altura/força dos zagueiros, resistência).
2) Detalhe a melhor: mentalidade, instruções com e sem a bola, transição, função COM a bola e função SEM a bola de cada titular (use os jogadores reais e seus atributos) e como esconder pontos fracos.
3) Se a melhor formação deixa posições sem jogador adequado, diga quais e o que faria como solução interina (improvisar quem?) ou reforço.
Responda em português do Brasil, mas use SEMPRE os termos do Football Manager em inglês, como o jogo (versão em inglês) os exibe: nomes de funções (ex.: "Ball-Playing Centre-Back", "Inside Winger", "Deep-Lying Playmaker", "Target Forward"), atributos (ex.: "Off The Ball", "Work Rate", "Jumping Reach"), instruções e mentalidades (ex.: "Positive", "Counter", "Higher Defensive Line", "Work Ball Into Box"). Seja concreto.
Formato de saída (JSON):
{
 "candidates": [{"formation": string, "style": string, "fit": number, "why": string, "risk": string}],
 "best": "string com o nome da combinação recomendada",
 "formation": string,
 "mentality": string,
 "reasoning": string,
 "inPossession": string[],
 "outOfPossession": string[],
 "transition": string[],
 "lineup": [{"slot": string, "playerId": string, "inPossession": string, "outOfPossession": string, "why": string}],
 "weaknesses": [{"issue": string, "fix": string}],
 "setPieces": string,
 "alternativePlan": string
}
Se vier "customSetup", o usuário montou um campo tático próprio: cada item tem slot, posição (pos), coordenadas x (0 esquerda–100 direita) e y (0 ataque–100 gol), funções com/sem a bola escolhidas e o jogador. Avalie ESSE desenho (compressão de linhas, largura, buracos entre setores, equilíbrio defensivo, funções compatíveis entre si), diga o que funciona e o que melhorar, e no "lineup" mantenha as posições dele sugerindo ajustes de função (ou jogador) em vez de trocar a formação, a menos que seja claramente inviável.
No FM atual NÃO existem mais "deveres" (Defend/Support/Attack): cada jogador tem uma função COM a bola (inPossession) e uma função SEM a bola (outOfPossession), ambas escolhidas desta lista oficial por posição (chaves: GK, CB, CBW = zagueiro pelos lados, FB = lateral, WB = ala, DM, CM, WM = meia aberto, AM, W = ponta, ST). Use EXATAMENTE estes nomes:
${ROLE_LIST}
Se "customSetup" trouxer "inPossession"/"outOfPossession", avalie essas escolhas e a combinação entre elas.
Só use "playerId" de jogadores existentes no elenco enviado.`;

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const body = await req.json();
    const text = `DADOS (JSON):\n${JSON.stringify(body)}\n\nAnalise o elenco inteiro e devolva o JSON no formato pedido.`;
    const out = await askJSON({ system: SYSTEM, text, maxTokens: 8000 });
    return Response.json(out);
  } catch (e) {
    return errorResponse(e);
  }
}
