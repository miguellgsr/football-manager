import type { Attrs, Pos, Player } from "./types";

export interface Role {
  id: string;
  name: string;
  positions: Pos[];
  /** atributo -> peso (1 = secundário, 2 = importante, 3 = chave) */
  w: Record<string, number>;
}

export const ROLES: Role[] = [
  { id: "gk", name: "Goalkeeper", positions: ["GK"], w: { reflexes: 3, handling: 2, oneOnOnes: 2, commandOfArea: 2, aerialReach: 1, communication: 1, concentration: 2, positioning: 2, agility: 2 } },
  { id: "sk", name: "Sweeper Keeper", positions: ["GK"], w: { reflexes: 3, rushingOut: 3, oneOnOnes: 2, kicking: 2, passing: 2, anticipation: 2, decisions: 2, composure: 2, firstTouch: 1, agility: 2 } },
  { id: "cd", name: "Central Defender", positions: ["CB"], w: { heading: 2, marking: 3, tackling: 3, positioning: 3, anticipation: 2, bravery: 1, strength: 2, jumpingReach: 2, concentration: 1 } },
  { id: "bpd", name: "Ball Playing Defender", positions: ["CB"], w: { passing: 3, composure: 3, technique: 2, firstTouch: 2, vision: 1, marking: 2, tackling: 2, positioning: 2, anticipation: 2, decisions: 2, strength: 1 } },
  { id: "fb", name: "Full-Back", positions: ["RB", "LB"], w: { tackling: 2, marking: 2, positioning: 2, crossing: 2, workRate: 2, stamina: 3, pace: 2, acceleration: 2, teamwork: 1 } },
  { id: "wb", name: "Wing-Back", positions: ["RWB", "LWB", "RB", "LB"], w: { crossing: 3, dribbling: 2, technique: 1, offTheBall: 2, workRate: 2, stamina: 3, pace: 3, acceleration: 3, tackling: 1 } },
  { id: "anchor", name: "Anchor", positions: ["DM"], w: { tackling: 3, marking: 2, positioning: 3, anticipation: 3, concentration: 2, decisions: 2, teamwork: 1, strength: 1 } },
  { id: "dlp", name: "Deep Lying Playmaker", positions: ["DM", "CM"], w: { passing: 3, vision: 3, composure: 3, technique: 2, decisions: 2, firstTouch: 2, teamwork: 1, positioning: 1 } },
  { id: "bwm", name: "Ball Winning Midfielder", positions: ["DM", "CM"], w: { tackling: 3, aggression: 2, workRate: 3, stamina: 2, teamwork: 2, anticipation: 1, bravery: 1, strength: 1 } },
  { id: "b2b", name: "Box To Box Midfielder", positions: ["CM"], w: { stamina: 3, workRate: 3, passing: 2, tackling: 1, offTheBall: 2, longShots: 1, teamwork: 2, decisions: 1, strength: 1, pace: 1 } },
  { id: "ap", name: "Advanced Playmaker", positions: ["CM", "AM"], w: { passing: 3, vision: 3, technique: 3, firstTouch: 2, decisions: 2, composure: 2, offTheBall: 2, flair: 1, dribbling: 1 } },
  { id: "w", name: "Winger", positions: ["RW", "LW", "RM", "LM"], w: { crossing: 3, dribbling: 3, technique: 2, pace: 3, acceleration: 3, agility: 1, workRate: 1, stamina: 1 } },
  { id: "if", name: "Inside Forward", positions: ["RW", "LW"], w: { dribbling: 3, finishing: 2, offTheBall: 3, acceleration: 3, pace: 2, technique: 2, composure: 1, longShots: 1, flair: 1, agility: 1 } },
  { id: "am", name: "Attacking Midfielder", positions: ["AM"], w: { technique: 3, passing: 2, vision: 2, dribbling: 2, offTheBall: 2, composure: 2, firstTouch: 2, flair: 1, finishing: 1, longShots: 1 } },
  { id: "tm", name: "Target Forward", positions: ["ST"], w: { heading: 3, strength: 3, jumpingReach: 3, bravery: 2, finishing: 2, composure: 1, balance: 2, teamwork: 1, offTheBall: 1 } },
  { id: "poacher", name: "Poacher", positions: ["ST"], w: { finishing: 3, offTheBall: 3, composure: 3, anticipation: 2, acceleration: 2, concentration: 1, decisions: 1, firstTouch: 1 } },
  { id: "cf", name: "Complete Forward", positions: ["ST"], w: { finishing: 3, dribbling: 2, firstTouch: 2, technique: 2, passing: 1, offTheBall: 2, pace: 2, acceleration: 2, strength: 1, composure: 2, heading: 1 } },
  { id: "pf", name: "Pressing Forward", positions: ["ST"], w: { workRate: 3, stamina: 3, aggression: 2, teamwork: 2, anticipation: 2, finishing: 1, acceleration: 2, pace: 1, bravery: 1 } },
];

export function roleScore(role: Role, attrs: Attrs): number | null {
  let sum = 0;
  let tot = 0;
  let known = 0;
  for (const [k, w] of Object.entries(role.w)) {
    tot += w * 20;
    if (typeof attrs[k] === "number") {
      sum += attrs[k] * w;
      known++;
    }
  }
  if (known < Math.ceil(Object.keys(role.w).length * 0.5)) return null; // dados insuficientes
  // normaliza só pelo que é conhecido
  let knownTot = 0;
  for (const [k, w] of Object.entries(role.w)) if (typeof attrs[k] === "number") knownTot += w * 20;
  return Math.round((sum / knownTot) * 100);
}

export function rolesForPos(pos: Pos): Role[] {
  return ROLES.filter((r) => r.positions.includes(pos));
}

export function bestRoleFor(p: Player, pos: Pos): { role: Role; score: number } | null {
  let best: { role: Role; score: number } | null = null;
  for (const r of rolesForPos(pos)) {
    const s = roleScore(r, p.attrs);
    if (s !== null && (!best || s > best.score)) best = { role: r, score: s };
  }
  return best;
}

export function bestOverall(p: Player): { role: Role; score: number } | null {
  let best: { role: Role; score: number } | null = null;
  for (const r of ROLES) {
    if (!r.positions.some((x) => p.positions.includes(x))) continue;
    const s = roleScore(r, p.attrs);
    if (s !== null && (!best || s > best.score)) best = { role: r, score: s };
  }
  return best;
}
