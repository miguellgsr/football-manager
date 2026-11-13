import { FORMATIONS, NEIGHBORS } from "./formations";
import { bestRoleFor } from "./roles";
import type { Player, Pos } from "./types";

export interface Assign {
  slot: number;
  pos: Pos;
  playerId?: string;
  score: number | null; // encaixe real (null = sem atributos)
  eff: number; // nota efetiva usada na média (penaliza fora de posição)
  natural: boolean;
  cover: boolean;
}

export interface FormationEval {
  formation: string;
  avg: number;
  filled: number;
  assigns: Assign[];
}

/** Monta o melhor 11 possível para a formação (guloso, preenchendo primeiro as posições mais escassas). */
export function evaluateFormation(players: Player[], name: string, slotsOverride?: { pos: Pos }[]): FormationEval {
  const slots = slotsOverride ?? FORMATIONS[name];
  const used = new Set<string>();
  const assigns: Assign[] = new Array(slots.length);
  const order = slots
    .map((s, i) => ({
      s, i,
      n: players.filter((p) => p.positions.includes(s.pos) || p.positions.some((x) => NEIGHBORS[s.pos].includes(x))).length,
    }))
    .sort((a, b) => a.n - b.n);
  for (const { s, i } of order) {
    let best: { p: Player; eff: number; score: number | null; natural: boolean; cover: boolean } | null = null;
    for (const p of players) {
      if (used.has(p.id)) continue;
      const natural = p.positions.includes(s.pos);
      const cover = !natural && p.positions.some((x) => NEIGHBORS[s.pos].includes(x));
      if (!natural && !cover) continue;
      const r = bestRoleFor(p, s.pos);
      const base = r ? r.score : 50;
      const eff = base - (natural ? 0 : 10);
      if (!best || eff > best.eff) best = { p, eff, score: r ? r.score : null, natural, cover };
    }
    if (best) {
      used.add(best.p.id);
      assigns[i] = { slot: i, pos: s.pos, playerId: best.p.id, score: best.score, eff: best.eff, natural: best.natural, cover: best.cover };
    } else {
      assigns[i] = { slot: i, pos: s.pos, score: null, eff: 0, natural: false, cover: false };
    }
  }
  const filled = assigns.filter((a) => a.playerId).length;
  const avg = Math.round(assigns.reduce((s, a) => s + a.eff, 0) / slots.length);
  return { formation: name, avg, filled, assigns };
}

export function evaluateAll(players: Player[]): FormationEval[] {
  return Object.keys(FORMATIONS).map((f) => evaluateFormation(players, f)).sort((a, b) => b.avg - a.avg);
}

/** Resumo enxuto para mandar à IA. */
export function summarizeEval(ev: FormationEval, players: Player[]) {
  return {
    formation: ev.formation,
    mediaEncaixe: ev.avg,
    posicoesSemJogador: ev.assigns.filter((a) => !a.playerId).map((a) => a.pos),
    melhor11: ev.assigns.map((a) => ({
      pos: a.pos,
      jogador: players.find((p) => p.id === a.playerId)?.name ?? null,
      encaixe: a.score,
      foraDePosicao: !!a.playerId && !a.natural,
    })),
  };
}

export const REQUIRED_DEPTH_EXTRA: Partial<Record<Pos, number>> = { CB: 2 };

export interface PosStatus {
  pos: Pos;
  starters: number;
  need: number;
  natural: Player[];
  cover: Player[];
  level: "gap" | "thin" | "ok" | "optional";
  bestScore: number | null;
  ageing: number;
  notes: string[];
}

/** Situação de cada posição para a formação de referência. */
export function positionStatus(players: Player[], formation: string, allPos: Pos[], slotsOverride?: { pos: Pos }[]): PosStatus[] {
  const slots = slotsOverride ?? FORMATIONS[formation] ?? [];
  return allPos.map((pos) => {
    const starters = slots.filter((s) => s.pos === pos).length;
    const need = starters ? starters + (REQUIRED_DEPTH_EXTRA[pos] ?? 1) : 0;
    const natural = players.filter((p) => p.positions.includes(pos));
    const cover = players.filter((p) => !p.positions.includes(pos) && p.positions.some((x) => NEIGHBORS[pos].includes(x)));
    let bestScore: number | null = null;
    for (const p of natural) {
      const r = bestRoleFor(p, pos);
      if (r && (bestScore === null || r.score > bestScore)) bestScore = r.score;
    }
    const ageing = natural.filter((p) => (p.age ?? 0) >= 31).length;
    let level: PosStatus["level"] = "optional";
    const notes: string[] = [];
    if (starters) {
      if (natural.length < starters) { level = "gap"; notes.push(`faltam ${starters - natural.length} titular(es) de origem`); }
      else if (natural.length < need) { level = "thin"; notes.push("sem reserva de origem"); }
      else level = "ok";
      if (bestScore !== null && bestScore < 60) notes.push("nível técnico baixo");
      if (natural.length && ageing >= Math.ceil(natural.length / 2)) notes.push("elenco da posição envelhecendo");
      if (level !== "ok" && cover.length) notes.push(`${cover.length} jogador(es) podem improvisar`);
    }
    return { pos, starters, need, natural, cover, level, bestScore, ageing, notes };
  });
}
