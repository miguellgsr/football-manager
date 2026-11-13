import { roleScore, ROLES } from "./roles";
import type { Player, Pos } from "./types";

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

/** Função-base (pesos de atributos em lib/roles.ts) que melhor aproxima cada função nova. */
function baseFor(pos: Pos, name: string): string {
  const n = name.toLowerCase();
  const k = roleKey(pos, true);
  if (k === "GK") return /ball-playing|sweeper/.test(n) ? "sk" : "gk";
  if (k === "CB" || k === "CBW") return /ball-playing|advanced/.test(n) ? "bpd" : "cd";
  if (k === "FB") return /wing-back|inside/.test(n) ? "wb" : "fb";
  if (k === "WB") return "wb";
  if (k === "DM") return /deep-lying/.test(n) ? "dlp" : /box-to-box/.test(n) ? "b2b" : /pressing/.test(n) ? "bwm" : "anchor";
  if (k === "CM") return /playmaker/.test(n) && /advanced/.test(n) ? "ap" : /midfield playmaker/.test(n) ? "dlp" : /attacking/.test(n) ? "am" : /pressing|screening|covering/.test(n) ? "bwm" : "b2b";
  if (k === "WM") return /inside/.test(n) ? "if" : /playmaking/.test(n) ? "ap" : "w";
  if (k === "AM") return /advanced playmaker/.test(n) ? "ap" : /second striker/.test(n) ? "cf" : "am";
  if (k === "W") return /inside|forward/.test(n) ? "if" : /playmaking/.test(n) ? "ap" : "w";
  return /target/.test(n) ? "tm" : /poacher/.test(n) ? "poacher" : /tracking/.test(n) ? "pf" : "cf";
}

/** Encaixe (0–100) do jogador nas funções escolhidas: média entre a função com e sem a bola. */
export function roleFit(p: Player, pos: Pos, ip?: string, oop?: string): number | null {
  const scores = [ip, oop].filter(Boolean).map((r) => {
    const base = ROLES.find((x) => x.id === baseFor(pos, r!));
    return base ? roleScore(base, p.attrs) : null;
  }).filter((x): x is number => x != null);
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
}

export const POS_LABEL: Record<Pos, string> = {
  GK: "GK · Goalkeeper", RB: "D (R) · Right Back", CB: "D (C) · Centre Back", LB: "D (L) · Left Back",
  RWB: "WB (R) · Right Wing-Back", LWB: "WB (L) · Left Wing-Back", DM: "DM · Defensive Midfielder",
  RM: "M (R) · Right Midfielder", CM: "M (C) · Central Midfielder", LM: "M (L) · Left Midfielder",
  RW: "AM (R) · Right Winger", AM: "AM (C) · Attacking Midfielder", LW: "AM (L) · Left Winger", ST: "ST · Striker",
};
