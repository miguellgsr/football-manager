import { roleScore, ROLES } from "./roles";
import type { Player, Pos } from "./types";

export const DUTY_SHORT: Record<string, string> = { Defend: "De", Support: "Su", Attack: "At", Cover: "Co", Stopper: "St" };

export interface FmRole { id: string; name: string; duties: string[]; base: string }
const D = ["Defend"], S = ["Support"], A = ["Attack"];
const DSA = ["Defend", "Support", "Attack"], SA = ["Support", "Attack"], DS = ["Defend", "Support"];
const CB3 = ["Defend", "Cover", "Stopper"];
const r = (id: string, name: string, duties: string[], base: string): FmRole => ({ id, name, duties, base });

const FB = [r("fb", "Full-Back", DSA, "fb"), r("wb", "Wing-Back", DSA, "wb"), r("iwb", "Inverted Wing-Back", DSA, "fb"), r("ifb", "Inverted Full-Back", D, "fb"), r("nnfb", "No-Nonsense Full-Back", D, "fb"), r("cwb", "Complete Wing-Back", SA, "wb")];
const W = [r("wg", "Winger", SA, "w"), r("ifw", "Inside Forward", SA, "if"), r("iw", "Inverted Winger", SA, "if"), r("wp", "Wide Playmaker", SA, "ap"), r("rd", "Raumdeuter", A, "if"), r("dw", "Defensive Winger", DS, "w")];

export const FM_ROLES: Record<Pos, FmRole[]> = {
  GK: [r("gk", "Goalkeeper", D, "gk"), r("sk", "Sweeper Keeper", DSA, "sk")],
  CB: [r("cd", "Central Defender", CB3, "cd"), r("bpd", "Ball Playing Defender", CB3, "bpd"), r("wcb", "Wide Centre-Back", DSA, "cd"), r("lib", "Libero", DS, "bpd"), r("nncb", "No-Nonsense Centre-Back", CB3, "cd")],
  RB: FB, LB: FB,
  RWB: [r("wb", "Wing-Back", DSA, "wb"), r("iwb", "Inverted Wing-Back", DSA, "fb"), r("cwb", "Complete Wing-Back", SA, "wb")],
  LWB: [r("wb", "Wing-Back", DSA, "wb"), r("iwb", "Inverted Wing-Back", DSA, "fb"), r("cwb", "Complete Wing-Back", SA, "wb")],
  DM: [r("anc", "Anchor", D, "anchor"), r("hb", "Half Back", D, "anchor"), r("dlp", "Deep Lying Playmaker", DS, "dlp"), r("dm", "Defensive Midfielder", DS, "anchor"), r("reg", "Regista", S, "dlp"), r("bwm", "Ball Winning Midfielder", DS, "bwm"), r("sv", "Segundo Volante", SA, "b2b")],
  CM: [r("cm", "Central Midfielder", DSA, "b2b"), r("b2b", "Box To Box Midfielder", S, "b2b"), r("ap", "Advanced Playmaker", SA, "ap"), r("bwm", "Ball Winning Midfielder", DS, "bwm"), r("mz", "Mezzala", SA, "ap"), r("car", "Carrilero", DS, "b2b"), r("dlp", "Deep Lying Playmaker", DS, "dlp"), r("rpm", "Roaming Playmaker", S, "ap")],
  RM: [r("wm", "Wide Midfielder", DSA, "w"), r("wg", "Winger", SA, "w"), r("wp", "Wide Playmaker", SA, "ap"), r("dw", "Defensive Winger", DS, "w")],
  LM: [r("wm", "Wide Midfielder", DSA, "w"), r("wg", "Winger", SA, "w"), r("wp", "Wide Playmaker", SA, "ap"), r("dw", "Defensive Winger", DS, "w")],
  RW: W, LW: W,
  AM: [r("am", "Attacking Midfielder", SA, "am"), r("ap", "Advanced Playmaker", SA, "ap"), r("eng", "Enganche", S, "ap"), r("ss", "Shadow Striker", A, "am"), r("tq", "Trequartista", A, "am")],
  ST: [r("af", "Advanced Forward", A, "cf"), r("cf", "Complete Forward", SA, "cf"), r("dlf", "Deep Lying Forward", SA, "cf"), r("pf", "Pressing Forward", DSA, "pf"), r("tf", "Target Forward", SA, "tm"), r("poa", "Poacher", A, "poacher"), r("f9", "False Nine", S, "cf")],
};

export const findRole = (pos: Pos, id?: string) => (id ? FM_ROLES[pos].find((x) => x.id === id) : undefined);

/** Encaixe (0–100) do jogador numa função específica do FM (aproximada pelos pesos de atributos da função-base). */
export function roleFit(p: Player, pos: Pos, roleId?: string): number | null {
  const fr = findRole(pos, roleId);
  const base = fr && ROLES.find((x) => x.id === fr.base);
  return base ? roleScore(base, p.attrs) : null;
}

/** Posição sugerida pela zona do campo; mantém a original quando a nova zona é do mesmo grupo (ex.: ala x meia aberto). */
export function posFromXY(x: number, y: number, current: Pos): Pos {
  const left = x < 24, right = x > 76;
  if (y >= 85 && !left && !right) return "GK";
  if (y >= 64) return left ? "LB" : right ? "RB" : "CB";
  if (y >= 40 && (left || right)) {
    if (["LM", "RM", "LWB", "RWB"].includes(current)) return left ? (current === "LWB" || current === "RWB" ? "LWB" : "LM") : (current === "LWB" || current === "RWB" ? "RWB" : "RM");
    return left ? (y >= 55 ? "LWB" : "LM") : (y >= 55 ? "RWB" : "RM");
  }
  if (y >= 55) return "DM";
  if (y >= 40) return "CM";
  if (y >= 22) return left ? "LW" : right ? "RW" : "AM";
  return left ? "LW" : right ? "RW" : "ST";
}

export const POS_LABEL: Record<Pos, string> = {
  GK: "GK · Goalkeeper", RB: "D (R) · Right Back", CB: "D (C) · Centre Back", LB: "D (L) · Left Back",
  RWB: "WB (R) · Right Wing-Back", LWB: "WB (L) · Left Wing-Back", DM: "DM · Defensive Midfielder",
  RM: "M (R) · Right Midfielder", CM: "M (C) · Central Midfielder", LM: "M (L) · Left Midfielder",
  RW: "AM (R) · Right Winger", AM: "AM (C) · Attacking Midfielder", LW: "AM (L) · Left Winger", ST: "ST · Striker",
};
