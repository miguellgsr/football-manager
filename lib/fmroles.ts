import { ROLE_ATTRS } from "./roleattrs";
import { ATTR_GROUPS, Player, Pos } from "./types";

/** Sistema de funções do FM novo: cada jogador tem uma função COM a bola e outra SEM a bola. */
export interface RoleSet { ip: string[]; oop: string[] }
export type RoleKey = "GK" | "CB" | "CBW" | "FB" | "WB" | "DM" | "CM" | "WM" | "AM" | "W" | "ST";

export const ROLE_SETS: Record<RoleKey, RoleSet> = {
  GK: {
    ip: ["Goalkeeper", "Ball-Playing Goalkeeper", "No-Nonsense Goalkeeper"],
    oop: ["Goalkeeper", "Sweeper Keeper", "Line-Holding Goalkeeper"],
  },
  CB: {
    ip: ["Centre-Back", "Ball-Playing Centre-Back", "No-Nonsense Centre-Back", "Advanced Centre-Back"],
    oop: ["Centre-Back", "Stopping Centre-Back", "Covering Centre-Back"],
  },
  CBW: {
    ip: ["Centre-Back", "Ball-Playing Centre-Back", "No-Nonsense Centre-Back", "Advanced Centre-Back", "Wide Centre-Back", "Overlapping Centre-Back"],
    oop: ["Centre-Back", "Stopping Centre-Back", "Covering Centre-Back", "Wide Centre-Back", "Stopping Wide Centre-Back", "Covering Wide Centre-Back"],
  },
  FB: {
    ip: ["Full-Back", "Inside Full-Back", "Wing-Back", "Inside Wing-Back", "Playmaking Wing-Back"],
    oop: ["Full-Back", "Wing-Back", "Pressing Full-Back", "Holding Full-Back"],
  },
  WB: {
    ip: ["Wing-Back", "Advanced Wing-Back", "Inside Wing-Back", "Playmaking Wing-Back"],
    oop: ["Wing-Back", "Pressing Wing-Back", "Holding Wing-Back"],
  },
  DM: {
    ip: ["Defensive Midfielder", "Deep-Lying Playmaker", "Half Back", "Box-To-Box Midfielder", "Box-To-Box Playmaker"],
    oop: ["Defensive Midfielder", "Pressing Defensive Midfielder", "Screening Defensive Midfielder", "Dropping Defensive Midfielder", "Wide Covering Defensive Midfielder"],
  },
  CM: {
    ip: ["Central Midfielder", "Midfield Playmaker", "Wide Central Midfielder", "Attacking Midfielder", "Advanced Playmaker", "Channel Midfielder"],
    oop: ["Central Midfielder", "Pressing Central Midfielder", "Screening Central Midfielder", "Wide Covering Central Midfielder"],
  },
  WM: {
    ip: ["Wide Midfielder", "Winger", "Inside Winger", "Playmaking Winger"],
    oop: ["Wide Midfielder", "Tracking Wide Midfielder", "Wide Outlet Wide Midfielder"],
  },
  AM: {
    ip: ["Attacking Midfielder", "Advanced Playmaker", "Channel Midfielder", "Free Role", "Second Striker"],
    oop: ["Attacking Midfielder", "Tracking Attacking Midfielder", "Central Outlet Attacking Midfielder", "Splitting Outlet Attacking Midfielder"],
  },
  W: {
    ip: ["Winger", "Inside Winger", "Playmaking Winger", "Inside Forward", "Wide Forward"],
    oop: ["Winger", "Tracking Winger", "Wide Outlet Winger", "Inside Outlet Winger"],
  },
  ST: {
    ip: ["Centre Forward", "Target Forward", "Poacher", "Deep-Lying Forward", "False Nine", "Channel Forward"],
    oop: ["Centre Forward", "Tracking Centre Forward", "Central Outlet Centre Forward", "Splitting Outlet Centre Forward"],
  },
};

export function roleKey(pos: Pos, wide = false): RoleKey {
  switch (pos) {
    case "GK": return "GK";
    case "CB": return wide ? "CBW" : "CB";
    case "RB": case "LB": return "FB";
    case "RWB": case "LWB": return "WB";
    case "DM": return "DM";
    case "CM": return "CM";
    case "RM": case "LM": return "WM";
    case "AM": return "AM";
    case "RW": case "LW": return "W";
    default: return "ST";
  }
}
export const rolesFor = (pos: Pos, wide = false): RoleSet => ROLE_SETS[roleKey(pos, wide)];

export type Phase = "ip" | "oop";
const WEIGHTS = [4, 3, 2, 1]; // prioridade: o 1º atributo da função pesa mais

export const ATTR_NAME: Record<string, string> = Object.fromEntries(ATTR_GROUPS.flatMap((g) => g.keys));

/** Atributos-chave da função, em ordem de prioridade. */
export function priorityAttrs(pos: Pos, wide: boolean, phase: Phase, role?: string): string[] {
  if (!role) return [];
  const a = ROLE_ATTRS[roleKey(pos, wide)][phase][role] ?? ROLE_ATTRS.CBW[phase][role];
  return a ?? [];
}

/** Nota 0–100 do jogador numa função (média ponderada pela prioridade dos 4 atributos-chave). */
export function roleScoreOf(p: Player, pos: Pos, wide: boolean, phase: Phase, role?: string): number | null {
  const attrs = priorityAttrs(pos, wide, phase, role);
  let sum = 0, tot = 0, known = 0;
  attrs.forEach((k, i) => {
    const v = p.attrs[k];
    if (typeof v === "number") { sum += v * WEIGHTS[i]; tot += 20 * WEIGHTS[i]; known++; }
  });
  return known >= 2 ? Math.round((sum / tot) * 100) : null;
}

/** Encaixe nas funções escolhidas: média entre a função com e sem a bola. */
export function roleFit(p: Player, pos: Pos, ip?: string, oop?: string, wide = false): number | null {
  const sc = [roleScoreOf(p, pos, wide, "ip", ip), roleScoreOf(p, pos, wide, "oop", oop)].filter((x): x is number => x != null);
  return sc.length ? Math.round(sc.reduce((a, b) => a + b, 0) / sc.length) : null;
}

/** Melhor função (com a bola) do jogador numa posição, entre as funções disponíveis. */
export function bestFor(p: Player, pos: Pos, wide = false, phase: Phase = "ip"): { role: string; score: number } | null {
  let best: { role: string; score: number } | null = null;
  for (const r of rolesFor(pos, wide)[phase]) {
    const sc = roleScoreOf(p, pos, wide, phase, r);
    if (sc != null && (!best || sc > best.score)) best = { role: r, score: sc };
  }
  return best;
}

/** Melhor função do jogador considerando as posições em que ele joga. */
export function bestNew(p: Player): { role: string; score: number; pos: Pos } | null {
  let best: { role: string; score: number; pos: Pos } | null = null;
  for (const pos of p.positions) {
    const b = bestFor(p, pos);
    if (b && (!best || b.score > best.score)) best = { ...b, pos };
  }
  return best;
}

export const POS_LABEL: Record<Pos, string> = {
  GK: "GK · Goalkeeper", RB: "D (R) · Right Back", CB: "D (C) · Centre Back", LB: "D (L) · Left Back",
  RWB: "WB (R) · Right Wing-Back", LWB: "WB (L) · Left Wing-Back", DM: "DM · Defensive Midfielder",
  RM: "M (R) · Right Midfielder", CM: "M (C) · Central Midfielder", LM: "M (L) · Left Midfielder",
  RW: "AM (R) · Right Winger", AM: "AM (C) · Attacking Midfielder", LW: "AM (L) · Left Winger", ST: "ST · Striker",
};
