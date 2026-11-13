import { FORMATIONS, Slot } from "./formations";
import { cellXY, COLS, ROWS, snapCell } from "./grid";
import type { Pos, State } from "./types";

export interface EffSlot extends Slot { ip?: string; oop?: string; c: number; r: number; wide: boolean }

/** Slots efetivos na grade do campo tático: formação base + ajustes do usuário (célula, posição, funções com/sem a bola). */
export function effectiveSlots(state: Pick<State, "formation" | "board">): EffSlot[] {
  const base = FORMATIONS[state.formation] ?? FORMATIONS["4-3-3"];
  const used = new Set<string>();
  const out = base.map((s, i) => {
    const o = state.board?.slots?.[String(i)];
    const ro = state.board?.roles?.[String(i)] as { ip?: string; oop?: string } | undefined;
    let { c, r } = snapCell(o?.x ?? s.x, o?.y ?? s.y);
    // resolve colisão: vai para a célula livre mais próxima na mesma linha
    if (used.has(c + "," + r)) {
      const order = Array.from({ length: COLS }, (_, k) => k).sort((a, b) => Math.abs(a - c) - Math.abs(b - c));
      c = order.find((k) => !used.has(k + "," + r)) ?? c;
    }
    used.add(c + "," + r);
    const { x, y } = cellXY(c, r);
    return { pos: (o?.pos ?? s.pos) as Pos, x, y, c, r, wide: false, ip: ro?.ip, oop: ro?.oop };
  });
  // zagueiro "pelos lados": nas pontas de uma linha com 3+ zagueiros
  const cbs = out.filter((s) => s.pos === "CB");
  if (cbs.length >= 3) {
    const cs = cbs.map((s) => s.c);
    const lo = Math.min(...cs), hi = Math.max(...cs);
    cbs.forEach((s) => { if (s.c === lo || s.c === hi) s.wide = true; });
  }
  return out;
}

/** Assinatura da formação: quantos jogadores de linha em cada fileira da grade (ataque → defesa). */
const sig = (slots: { r: number; pos: Pos }[]) =>
  Array.from({ length: ROWS - 1 }, (_, r) => slots.filter((s) => s.r === r && s.pos !== "GK").length).join(",");

const KNOWN: Record<string, string> = {};
for (const name of Object.keys(FORMATIONS)) KNOWN[sig(effectiveSlots({ formation: name }))] ??= name;

/** Nome da formação conforme o desenho atual no campo: uma formação conhecida ou "Custom 4-2-3-1". */
export function detectFormation(state: Pick<State, "formation" | "board">): { name: string; known: boolean } {
  const slots = effectiveSlots(state);
  const s = sig(slots);
  if (sig(effectiveSlots({ formation: state.formation })) === s) return { name: state.formation, known: true };
  if (KNOWN[s]) return { name: KNOWN[s], known: true };
  const parts = s.split(",").map(Number).reverse().filter((n) => n > 0);
  return { name: "Custom " + parts.join("-"), known: false };
}
