import type { Pos } from "./types";

/** Grade tática estilo FM: 5 colunas × 6 linhas (ataque → goleiro). */
export const COLS = 5;
export const ROWS = 6;
export const COL_X = [10, 30, 50, 70, 90];
export const ROW_Y = [12, 28, 46, 62, 78, 91];

export const cellXY = (c: number, r: number) => ({ x: COL_X[c], y: ROW_Y[r] });

export function snapCell(x: number, y: number): { c: number; r: number } {
  const c = Math.max(0, Math.min(COLS - 1, Math.round((x - 10) / 20)));
  let r = 0, best = 1e9;
  ROW_Y.forEach((ry, i) => { const d = Math.abs(ry - y); if (d < best) { best = d; r = i; } });
  return { c, r };
}

export function posFromCell(c: number, r: number, current: Pos): Pos {
  const wide = c === 0 ? "L" : c === COLS - 1 ? "R" : "";
  const flip = (l: Pos, rr: Pos): Pos => (c === 0 ? l : rr);
  switch (r) {
    case 0: return wide ? flip("LW", "RW") : "ST";
    case 1: return wide ? flip("LW", "RW") : "AM";
    case 2: return wide ? flip("LM", "RM") : "CM";
    case 3: return wide ? flip("LWB", "RWB") : "DM";
    case 4: return wide ? flip("LB", "RB") : "CB";
    default: return "GK";
  }
}
