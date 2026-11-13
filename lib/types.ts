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
  roles: Record<string, { ip?: string; oop?: string }>; // função com a bola / sem a bola
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
    title: "Technical",
    keys: [
      ["corners", "Corners"], ["crossing", "Crossing"], ["dribbling", "Dribbling"],
      ["finishing", "Finishing"], ["firstTouch", "First Touch"], ["freeKicks", "Free Kick Taking"],
      ["heading", "Heading"], ["longShots", "Long Shots"], ["longThrows", "Long Throws"],
      ["marking", "Marking"], ["passing", "Passing"], ["penaltyTaking", "Penalty Taking"],
      ["tackling", "Tackling"], ["technique", "Technique"],
    ],
  },
  {
    title: "Mental",
    keys: [
      ["aggression", "Aggression"], ["anticipation", "Anticipation"], ["bravery", "Bravery"],
      ["composure", "Composure"], ["concentration", "Concentration"], ["decisions", "Decisions"],
      ["determination", "Determination"], ["flair", "Flair"], ["leadership", "Leadership"],
      ["offTheBall", "Off The Ball"], ["positioning", "Positioning"], ["teamwork", "Teamwork"],
      ["vision", "Vision"], ["workRate", "Work Rate"],
    ],
  },
  {
    title: "Physical",
    keys: [
      ["acceleration", "Acceleration"], ["agility", "Agility"], ["balance", "Balance"],
      ["jumpingReach", "Jumping Reach"], ["naturalFitness", "Natural Fitness"], ["pace", "Pace"],
      ["stamina", "Stamina"], ["strength", "Strength"],
    ],
  },
  {
    title: "Goalkeeping",
    keys: [
      ["aerialReach", "Aerial Reach"], ["commandOfArea", "Command Of Area"], ["communication", "Communication"],
      ["eccentricity", "Eccentricity"], ["handling", "Handling"], ["kicking", "Kicking"],
      ["oneOnOnes", "One On Ones"], ["punching", "Punching"], ["reflexes", "Reflexes"],
      ["rushingOut", "Rushing Out"], ["throwing", "Throwing"],
    ],
  },
];

export const ALL_ATTR_KEYS = ATTR_GROUPS.flatMap((g) => g.keys.map((k) => k[0]));

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
