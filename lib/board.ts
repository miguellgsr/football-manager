import { FORMATIONS, Slot } from "./formations";
import type { Pos, State } from "./types";

export interface EffSlot extends Slot { role?: string; duty?: string }

/** Slots efetivos: formação base + ajustes do campo tático (posição livre, posição do slot, função e dever). */
export function effectiveSlots(state: Pick<State, "formation" | "board">): EffSlot[] {
  const base = FORMATIONS[state.formation] ?? FORMATIONS["4-3-3"];
  return base.map((s, i) => {
    const o = state.board?.slots?.[String(i)];
    const ro = state.board?.roles?.[String(i)];
    return { pos: (o?.pos ?? s.pos) as Pos, x: o?.x ?? s.x, y: o?.y ?? s.y, role: ro?.role, duty: ro?.duty };
  });
}
