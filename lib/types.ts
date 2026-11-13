export type Attrs = Record<string, number>;

export type Pos =
  | "GK" | "RB" | "CB" | "LB" | "RWB" | "LWB" | "DM"
  | "RM" | "CM" | "LM" | "RW" | "AM" | "LW" | "ST";

export interface Player {
  id: string;
  name: string;
  age?: number;
  positions: Pos[];
  nationality?: string;
  club?: string;
  contractExpiry?: string; // texto livre, ex.: "30/06/2028" ou "2028"
  wage?: string;
  value?: string;
  ca?: number; // habilidade atual (se você souber, ex.: via estrelas x 40)
  pa?: number; // potencial
  attrs: Attrs;
  notes?: string;
  status: "squad" | "shortlist";
}

export interface Club {
  name: string;
  transferBudget: string;
  wageBudget: string;
  style: string; // filosofia/estilo desejado
}

export interface ChatMsg {
  role: "user" | "assistant";
  text: string;
  ts: number;
  images?: number; // quantos prints foram anexados (as imagens não são guardadas)
  data?: any; // dados estruturados da resposta da IA
}

export interface ClubColors { p: string; s: string }

export interface SaveMeta {
  id: string;
  name: string;
  club?: string;
  country?: string;
  league?: string;
  colors?: ClubColors;
  createdAt: number;
  updatedAt: number;
}

export interface Board {
  slots: Record<string, { x: number; y: number; pos: Pos }>;
  roles: Record<string, { role: string; duty: string }>;
}

export interface State {
  club: Club;
  players: Player[];
  formation: string;
  lineup: Record<string, string>; // índice do slot -> id do jogador
  board?: Board; // campo tático: posições livres e funções por slot
  chat: ChatMsg[];
}

export const initialState: State = {
  club: { name: "", transferBudget: "", wageBudget: "", style: "" },
  players: [],
  formation: "4-3-3",
  lineup: {},
  chat: [],
};

export const ATTR_GROUPS: { title: string; keys: [string, string][] }[] = [
  {
    title: "Técnicos",
    keys: [
      ["corners", "Escanteios"], ["crossing", "Cruzamentos"], ["dribbling", "Drible"],
      ["finishing", "Finalização"], ["firstTouch", "Primeiro toque"], ["freeKicks", "Faltas"],
      ["heading", "Cabeceio"], ["longShots", "Chutes de longe"], ["longThrows", "Laterais longos"],
      ["marking", "Marcação"], ["passing", "Passe"], ["penaltyTaking", "Pênaltis"],
      ["tackling", "Desarme"], ["technique", "Técnica"],
    ],
  },
  {
    title: "Mentais",
    keys: [
      ["aggression", "Agressividade"], ["anticipation", "Antecipação"], ["bravery", "Bravura"],
      ["composure", "Compostura"], ["concentration", "Concentração"], ["decisions", "Decisões"],
      ["determination", "Determinação"], ["flair", "Improviso"], ["leadership", "Liderança"],
      ["offTheBall", "Sem a bola"], ["positioning", "Posicionamento"], ["teamwork", "Trabalho em equipe"],
      ["vision", "Visão"], ["workRate", "Dedicação"],
    ],
  },
  {
    title: "Físicos",
    keys: [
      ["acceleration", "Aceleração"], ["agility", "Agilidade"], ["balance", "Equilíbrio"],
      ["jumpingReach", "Impulsão"], ["naturalFitness", "Condição natural"], ["pace", "Velocidade"],
      ["stamina", "Resistência"], ["strength", "Força"],
    ],
  },
  {
    title: "Goleiro",
    keys: [
      ["aerialReach", "Alcance aéreo"], ["commandOfArea", "Comando da área"], ["communication", "Comunicação"],
      ["eccentricity", "Excentricidade"], ["handling", "Manuseio"], ["kicking", "Chute"],
      ["oneOnOnes", "Um contra um"], ["punching", "Socos"], ["reflexes", "Reflexos"],
      ["rushingOut", "Saídas do gol"], ["throwing", "Lançamentos"],
    ],
  },
];

export const ALL_ATTR_KEYS = ATTR_GROUPS.flatMap((g) => g.keys.map((k) => k[0]));

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
