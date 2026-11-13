import { askJSON, guard, errorResponse } from "@/lib/ai";
import { ALL_ATTR_KEYS } from "@/lib/types";

export const maxDuration = 60;

const BASE = `Você lê prints de telas do jogo Football Manager e extrai dados de jogadores.
Regras:
- Extraia APENAS o que está visível. Nunca invente ou estime valores ausentes; omita o campo.
- Atributos no FM vão de 1 a 20. Use exatamente estas chaves para os atributos: ${ALL_ATTR_KEYS.join(", ")}.
- Traduza nomes de atributos de qualquer idioma para essas chaves (ex.: "Finalização"/"Finishing" -> finishing, "Um contra um"/"One on Ones" -> oneOnOnes).
- Posições: use somente estes códigos: GK, RB, CB, LB, RWB, LWB, DM, RM, CM, LM, RW, AM, LW, ST. Converta o formato do FM (ex.: "D (CD)", "M (C)", "MA (E)", "AM (RLC)", "ST (C)") para os códigos, listando todas as posições em que o jogador aparece. Se o perfil mostra mapa de posições/estrelas por posição, use as posições em que o jogador é considerado natural ou competente.
- Valores como salário, valor de mercado e fim de contrato devem ser mantidos como texto exatamente como aparecem.
Formato de saída:
{"players":[{"name":string,"age":number?,"positions":string[],"nationality":string?,"club":string?,"contractExpiry":string?,"wage":string?,"value":string?,"ca":number?,"pa":number?,"attrs":{chave:number},"notes":string?}],"warnings":string[]}
Em "warnings" avise sobre prints ilegíveis, cortados, ou atributos ocultos (ex.: "?" ou intervalos como 10-12; nesses casos omita o atributo).`;

const LIST = `${BASE}
- Se o print mostra uma lista (vários jogadores), devolva todos. Se for o perfil de um jogador, devolva só ele.
- Se vários prints mostram o mesmo jogador, junte tudo em um único registro.`;

const SINGLE = `${BASE}
- TODOS os prints enviados pertencem a UM ÚNICO jogador (por exemplo: visão geral, atributos, contrato). Combine tudo em EXATAMENTE UM registro em "players".
- Se o print mostrar uma lista com vários jogadores, ignore os outros e avise em "warnings"; devolva apenas o jogador que é o foco do print (perfil aberto/destacado).`;

export async function POST(req: Request) {
  const g = guard(req);
  if (g) return g;
  try {
    const { images, mode } = (await req.json()) as { images: string[]; mode?: "list" | "single" };
    if (!images?.length) return Response.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
    const out = await askJSON({
      system: mode === "single" ? SINGLE : LIST,
      text: mode === "single" ? "Extraia o jogador destes prints." : "Extraia os jogadores destes prints.",
      images,
      maxTokens: 8000,
    });
    return Response.json(out);
  } catch (e) {
    return errorResponse(e);
  }
}
