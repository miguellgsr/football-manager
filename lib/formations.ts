import type { Pos } from "./types";

export interface Slot {
  pos: Pos;
  x: number; // 0-100 esquerda -> direita
  y: number; // 0-100 topo (ataque) -> base (gol)
}

const gk: Slot = { pos: "GK", x: 50, y: 90 };

export const FORMATIONS: Record<string, Slot[]> = {
  "4-3-3": [
    gk,
    { pos: "LB", x: 15, y: 72 }, { pos: "CB", x: 38, y: 74 }, { pos: "CB", x: 62, y: 74 }, { pos: "RB", x: 85, y: 72 },
    { pos: "CM", x: 30, y: 52 }, { pos: "DM", x: 50, y: 58 }, { pos: "CM", x: 70, y: 52 },
    { pos: "LW", x: 18, y: 26 }, { pos: "ST", x: 50, y: 18 }, { pos: "RW", x: 82, y: 26 },
  ],
  "4-4-2": [
    gk,
    { pos: "LB", x: 15, y: 72 }, { pos: "CB", x: 38, y: 74 }, { pos: "CB", x: 62, y: 74 }, { pos: "RB", x: 85, y: 72 },
    { pos: "LM", x: 15, y: 48 }, { pos: "CM", x: 38, y: 52 }, { pos: "CM", x: 62, y: 52 }, { pos: "RM", x: 85, y: 48 },
    { pos: "ST", x: 38, y: 20 }, { pos: "ST", x: 62, y: 20 },
  ],
  "4-2-3-1": [
    gk,
    { pos: "LB", x: 15, y: 72 }, { pos: "CB", x: 38, y: 74 }, { pos: "CB", x: 62, y: 74 }, { pos: "RB", x: 85, y: 72 },
    { pos: "DM", x: 38, y: 56 }, { pos: "DM", x: 62, y: 56 },
    { pos: "LW", x: 18, y: 34 }, { pos: "AM", x: 50, y: 36 }, { pos: "RW", x: 82, y: 34 },
    { pos: "ST", x: 50, y: 16 },
  ],
  "4-1-4-1": [
    gk,
    { pos: "LB", x: 15, y: 72 }, { pos: "CB", x: 38, y: 74 }, { pos: "CB", x: 62, y: 74 }, { pos: "RB", x: 85, y: 72 },
    { pos: "DM", x: 50, y: 60 },
    { pos: "LM", x: 15, y: 40 }, { pos: "CM", x: 38, y: 44 }, { pos: "CM", x: 62, y: 44 }, { pos: "RM", x: 85, y: 40 },
    { pos: "ST", x: 50, y: 16 },
  ],
  "3-5-2": [
    gk,
    { pos: "CB", x: 28, y: 74 }, { pos: "CB", x: 50, y: 76 }, { pos: "CB", x: 72, y: 74 },
    { pos: "LWB", x: 10, y: 48 }, { pos: "CM", x: 33, y: 52 }, { pos: "DM", x: 50, y: 58 }, { pos: "CM", x: 67, y: 52 }, { pos: "RWB", x: 90, y: 48 },
    { pos: "ST", x: 38, y: 20 }, { pos: "ST", x: 62, y: 20 },
  ],
  "3-4-3": [
    gk,
    { pos: "CB", x: 28, y: 74 }, { pos: "CB", x: 50, y: 76 }, { pos: "CB", x: 72, y: 74 },
    { pos: "LWB", x: 10, y: 50 }, { pos: "CM", x: 38, y: 54 }, { pos: "CM", x: 62, y: 54 }, { pos: "RWB", x: 90, y: 50 },
    { pos: "LW", x: 20, y: 24 }, { pos: "ST", x: 50, y: 18 }, { pos: "RW", x: 80, y: 24 },
  ],
  "5-3-2": [
    gk,
    { pos: "LWB", x: 10, y: 62 }, { pos: "CB", x: 30, y: 74 }, { pos: "CB", x: 50, y: 76 }, { pos: "CB", x: 70, y: 74 }, { pos: "RWB", x: 90, y: 62 },
    { pos: "CM", x: 30, y: 50 }, { pos: "DM", x: 50, y: 56 }, { pos: "CM", x: 70, y: 50 },
    { pos: "ST", x: 38, y: 20 }, { pos: "ST", x: 62, y: 20 },
  ],
};

/** Posições "vizinhas" que um jogador consegue cobrir com perda pequena. */
export const NEIGHBORS: Record<Pos, Pos[]> = {
  GK: [],
  RB: ["RWB", "CB"], LB: ["LWB", "CB"], CB: ["DM"],
  RWB: ["RB", "RM", "RW"], LWB: ["LB", "LM", "LW"],
  DM: ["CM", "CB"], CM: ["DM", "AM", "RM", "LM"],
  RM: ["RW", "RWB", "CM"], LM: ["LW", "LWB", "CM"],
  RW: ["RM", "AM", "ST"], LW: ["LM", "AM", "ST"],
  AM: ["CM", "RW", "LW", "ST"], ST: ["AM", "RW", "LW"],
};

export const ALL_POS: Pos[] = ["GK", "RB", "CB", "LB", "RWB", "LWB", "DM", "RM", "CM", "LM", "RW", "AM", "LW", "ST"];
