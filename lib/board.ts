import { FORMATIONS, Slot } from "./formations";
import { cellXY, COLS, snapCell } from "./grid";
import type { Pos, State } from "./types";

export interface EffSlot extends Slot { role?: string; duty?: string; c: number; r: number }

/** Slots efetivos na grade do campo tático: formação base + ajustes do usuário (célula, posição, função, dever). */
export function effectiveSlots(state: Pick<State, "formation" | "board">): EffSlot[] {
  const base = FORMATIONS[state.formation] ?? FORMATIONS["4-3-3"];
  const used = new Set<string>();
  return base.map((s, i) => {
    const o = state.board?.slots?.[String(i)];
    const ro = state.board?.roles?.[String(i)];
    let { c, r } = snapCell(o?.x ?? s.x, o?.y ?? s.y);
    // resolve colisão: vai para a célula livre mais próxima na mesma linha
    if (used.has(c + "," + r)) {
      const order = Array.from({ length: COLS }, (_, k) => k).sort((a, b) => Math.abs(a - c) - Math.abs(b - c));
      c = order.find((k) => !used.has(k + "," + r)) ?? c;
    }
    used.add(c + "," + r);
    const { x, y } = cellXY(c, r);
    return { pos: (o?.pos ?? s.pos) as Pos, x, y, c, r, role: ro?.role, duty: ro?.duty };
  });
}
