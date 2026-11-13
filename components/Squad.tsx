"use client";
import { Select } from "./Dropdown";
import { useMemo, useRef, useState } from "react";
import { effectiveSlots } from "@/lib/board";
import { cellXY, COLS, ROWS, snapCell, posFromCell } from "@/lib/grid";
import { rolesFor, POS_LABEL } from "@/lib/fmroles";
import { detectFormation } from "@/lib/board";
import { FORMATIONS, NEIGHBORS } from "@/lib/formations";
import { bestOverall, bestRoleFor } from "@/lib/roles";
import { Player, Pos, uid } from "@/lib/types";
import { contractYear } from "@/lib/import";
import { evaluateFormation } from "@/lib/analysis";
import type { Props } from "@/lib/client";
import PlayerEditor from "./PlayerEditor";
import { PitchLines, roleClass, Shirt, Stars } from "./Pitch";

export const scoreClass = (s: number | null | undefined) =>
  s == null ? "s-na" : s >= 70 ? "s-hi" : s >= 58 ? "s-mid" : "s-lo";

const POS_ORDER: Pos[] = ["GK", "CB", "RB", "LB", "RWB", "LWB", "DM", "CM", "RM", "LM", "AM", "RW", "LW", "ST"];

export default function Squad({ state, setState, goImport }: Props & { goImport: () => void }) {
  const [editing, setEditing] = useState<Player | null>(null);
  const [picking, setPicking] = useState<number | null>(null);
  const squad = state.players.filter((p) => p.status === "squad");
  const slots = effectiveSlots(state);
  const det = detectFormation(state);
  const pitchRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ i: number; sx: number; sy: number; moved: boolean; el: HTMLElement; raf: number } | null>(null);

  const patchSlot = (i: number, patch: { x?: number; y?: number; pos?: Pos }) =>
    setState((st) => {
      const all = effectiveSlots(st);
      const cur = all[i];
      const b = st.board ?? { slots: {}, roles: {} };
      const pos = patch.pos ?? cur.pos;
      const roles = { ...b.roles };
      const r = roles[String(i)];
      if (r) {
        // ao mudar de posição, mantém só as funções que existem na nova posição
        const rs = rolesFor(pos, pos === "CB" && cur.wide);
        const keep = { ip: r.ip && rs.ip.includes(r.ip) ? r.ip : undefined, oop: r.oop && rs.oop.includes(r.oop) ? r.oop : undefined };
        if (keep.ip || keep.oop) roles[String(i)] = keep; else delete roles[String(i)];
      }
      return { ...st, board: { slots: { ...b.slots, [String(i)]: { x: patch.x ?? cur.x, y: patch.y ?? cur.y, pos } }, roles } };
    });
  const setRole = (i: number, which: "ip" | "oop", name?: string) =>
    setState((st) => {
      const b = st.board ?? { slots: {}, roles: {} };
      const roles = { ...b.roles };
      const cur = { ...(roles[String(i)] ?? {}), [which]: name || undefined };
      if (cur.ip || cur.oop) roles[String(i)] = cur; else delete roles[String(i)];
      return { ...st, board: { slots: b.slots, roles } };
    });
  const onDown = (e: React.PointerEvent, i: number) => {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    drag.current = { i, sx: e.clientX, sy: e.clientY, moved: false, el, raf: 0 };
  };
  const cellAt = (e: React.PointerEvent) => {
    const el = pitchRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return snapCell(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  };
  const [target, setTarget] = useState<{ c: number; r: number } | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 5) return;
    if (!d.moved) { d.moved = true; d.el.classList.add("drag"); setDragging(d.i); }
    const cx = e.clientX, cy = e.clientY;
    cancelAnimationFrame(d.raf);
    d.raf = requestAnimationFrame(() => {
      // o cartão segue o cursor direto no DOM (sem re-render); só a célula-alvo passa pelo React
      d.el.style.setProperty("--dx", cx - d.sx + "px");
      d.el.style.setProperty("--dy", cy - d.sy + "px");
    });
    const t = cellAt(e);
    setTarget((o) => (o && t && o.c === t.c && o.r === t.r ? o : t));
  };
  const onUp = (e: React.PointerEvent, i: number) => {
    const d = drag.current; drag.current = null;
    if (d) { cancelAnimationFrame(d.raf); d.el.classList.remove("drag"); d.el.style.removeProperty("--dx"); d.el.style.removeProperty("--dy"); }
    setTarget(null); setDragging(null);
    if (!d) return;
    if (!d.moved) { setPicking(i); return; }
    const t = cellAt(e);
    if (!t) return;
    const other = slots.findIndex((x, k) => k !== i && x.c === t.c && x.r === t.r);
    const me = slots[i];
    if (other >= 0) {
      // troca de células entre os dois jogadores
      const o = slots[other];
      patchSlot(i, { ...cellXY(t.c, t.r), pos: posFromCell(t.c, t.r, me.pos) });
      patchSlot(other, { ...cellXY(me.c, me.r), pos: posFromCell(me.c, me.r, o.pos) });
    } else patchSlot(i, { ...cellXY(t.c, t.r), pos: posFromCell(t.c, t.r, me.pos) });
  };

  const save = (p: Player) =>
    setState((s) => ({
      ...s,
      players: s.players.some((x) => x.id === p.id) ? s.players.map((x) => (x.id === p.id ? p : x)) : [...s.players, p],
    }));
  const remove = (id: string) =>
    setState((s) => ({
      ...s,
      players: s.players.filter((p) => p.id !== id),
      lineup: Object.fromEntries(Object.entries(s.lineup).filter(([, v]) => v !== id)),
    }));

  const fitFor = (p: Player, pos: Pos): { score: number | null; natural: boolean; cover: boolean } => {
    const natural = p.positions.includes(pos);
    const cover = !natural && p.positions.some((x) => NEIGHBORS[pos].includes(x));
    const b = bestRoleFor(p, pos);
    return { score: b ? b.score : null, natural, cover };
  };

  const candidates = useMemo(() => {
    if (picking === null) return [];
    const pos = slots[picking].pos;
    return squad
      .map((p) => ({ p, ...fitFor(p, pos) }))
      .sort((a, b) => Number(b.natural) - Number(a.natural) || Number(b.cover) - Number(a.cover) || (b.score ?? 0) - (a.score ?? 0));
  }, [picking, state.players, state.formation]); // eslint-disable-line

  const byPos = useMemo(() => {
    const sorted = [...squad].sort((a, b) => {
      const ia = Math.min(...(a.positions.length ? a.positions.map((x) => POS_ORDER.indexOf(x)) : [99]));
      const ib = Math.min(...(b.positions.length ? b.positions.map((x) => POS_ORDER.indexOf(x)) : [99]));
      return ia - ib || a.name.localeCompare(b.name);
    });
    return sorted;
  }, [state.players]); // eslint-disable-line

  const autoPick = () => {
    const ev = evaluateFormation(squad, state.formation, slots);
    const lineup: Record<string, string> = {};
    ev.assigns.forEach((a) => { if (a.playerId) lineup[String(a.slot)] = a.playerId; });
    setState((s) => ({ ...s, lineup }));
  };

  const startersCount = Object.keys(state.lineup).length;

  return (
    <>
      <div className="cols c21 fill">
        <div className="card fillcol">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: ".5rem" }}>
            <div>
              <h2 style={{ margin: 0 }}>Time titular</h2>
              <span className="mute" style={{ fontSize: ".78rem" }}>Titulares definidos: {startersCount}/11 · arraste para mover · clique para jogador e função</span>
            </div>
            <div className="row">
              <Select width={200} value={det.known ? det.name : "custom"} onChange={(v) => { if (v !== "custom") setState((s) => ({ ...s, formation: v, lineup: {}, board: undefined })); }}
                options={[...(det.known ? [] : [{ value: "custom", label: det.name }]), ...Object.keys(FORMATIONS).map((f) => ({ value: f, label: f }))]} />
              <button className="btn sm" disabled={squad.length === 0} onClick={autoPick}>Melhor 11</button>
              <button className="btn ghost sm" onClick={() => setState((s) => ({ ...s, lineup: {} }))}>Limpar</button>
              <button className="btn ghost sm" title="Voltar posições e funções da formação" onClick={() => setState((s) => ({ ...s, board: undefined }))}>Resetar campo</button>
            </div>
          </div>
          <div className="pitchwrap">
            <div className="pitch" ref={pitchRef}>
              <PitchLines />
              {dragging !== null && Array.from({ length: ROWS * COLS }, (_, k) => {
                const c = k % COLS, r = Math.floor(k / COLS);
                if (slots.some((x, j) => j !== dragging && x.c === c && x.r === r)) return null;
                const { x, y } = cellXY(c, r);
                const hot = target && target.c === c && target.r === r;
                return <div key={"g" + k} className={"gcell" + (hot ? " hot" : "")} style={{ left: x + "%", top: y + "%" }}>+</div>;
              })}
              {target && dragging !== null && slots.some((x, k) => k !== dragging && x.c === target.c && x.r === target.r) && (
                <div className="gcell hot swap" style={{ left: cellXY(target.c, target.r).x + "%", top: cellXY(target.c, target.r).y + "%" }}>⇄</div>
              )}
              {slots.map((sl, i) => {
                const pid = state.lineup[String(i)];
                const pl = pid ? state.players.find((p) => p.id === pid) : undefined;
                const fit = pl ? fitFor(pl, sl.pos) : null;
                return (
                  <div key={i} className="fmc" style={{ left: sl.x + "%", top: sl.y + "%", touchAction: "none", cursor: "grab" }}
                    onPointerDown={(e) => onDown(e, i)} onPointerMove={onMove} onPointerUp={(e) => onUp(e, i)}
                    title={fit ? `Encaixe ${fit.score ?? "?"}${fit.natural ? "" : fit.cover ? " · posição próxima" : " · fora de posição"}` : "Escolher jogador"}>
                    <Shirt n={i + 1} />
                    <div className="card-fm">
                      <div className={"role " + roleClass(sl.pos)}>{sl.pos}</div>
                      <Stars score={fit?.score} />
                      {(sl.ip || sl.oop) && <div className="rl" title={`With ball: ${sl.ip ?? "—"}\nWithout ball: ${sl.oop ?? "—"}`}>{sl.ip ?? "—"}</div>}
                      <div className={"pn" + (pl ? (fit && !fit.natural && !fit.cover ? " warn" : "") : " empty")}>{pl ? pl.name.split(" ").slice(-1)[0] : "—"}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card fillcol">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: ".5rem" }}>
            <h2 style={{ margin: 0 }}>Elenco ({squad.length})</h2>
            <button className="btn sm" onClick={() => setEditing({ id: uid(), name: "", positions: [], attrs: {}, status: "squad" })}>+ Jogador</button>
          </div>
          {squad.length === 0 && (
            <p className="mute">Seu elenco está vazio. Tire prints da tela de Elenco do jogo e importe, ou cadastre à mão.
              <br /><button className="btn sm" style={{ marginTop: ".5rem" }} onClick={goImport}>Importar por print</button></p>
          )}
          <div className="scroll">
            <table>
              <thead><tr><th>Nome</th><th>Pos</th><th>Id.</th><th>Best role</th><th>Contrato</th></tr></thead>
              <tbody>
                {byPos.map((p) => {
                  const b = bestOverall(p);
                  const y = contractYear(p);
                  return (
                    <tr key={p.id} className="click" onClick={() => setEditing(p)}>
                      <td>{p.name}</td>
                      <td>{p.positions.join(", ") || <span className="mute">—</span>}</td>
                      <td>{p.age ?? "—"}</td>
                      <td>{b ? <><span className={"score " + scoreClass(b.score)}>{b.score}</span> <span className="mute">{b.role.name}</span></> : <span className="mute">sem atributos</span>}</td>
                      <td className={y && y <= 2027 ? "err" : ""}>{p.contractExpiry ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {picking !== null && (
        <div className="modal-bg" onClick={() => setPicking(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h2>Escolher para {slots[picking].pos}</h2>
              <button className="btn ghost sm" onClick={() => setPicking(null)}>Fechar</button>
            </div>
            <div className="row" style={{ gap: ".5rem", margin: ".4rem 0 .6rem", flexWrap: "wrap" }}>
              <Select width={230} value={slots[picking].pos} onChange={(v) => patchSlot(picking, { pos: v as Pos })} options={POS_ORDER.map((x) => ({ value: x, label: POS_LABEL[x] }))} />
            </div>
            <div className="row" style={{ gap: ".5rem", margin: "0 0 .6rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="mute" style={{ fontSize: ".75rem" }}>In possession</div>
                <Select width={250} value={slots[picking].ip ?? ""} onChange={(v) => setRole(picking, "ip", v)}
                  options={[{ value: "", label: "No role" }, ...rolesFor(slots[picking].pos, slots[picking].wide).ip.map((r) => ({ value: r, label: r }))]} />
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="mute" style={{ fontSize: ".75rem" }}>Out of possession</div>
                <Select width={250} value={slots[picking].oop ?? ""} onChange={(v) => setRole(picking, "oop", v)}
                  options={[{ value: "", label: "No role" }, ...rolesFor(slots[picking].pos, slots[picking].wide).oop.map((r) => ({ value: r, label: r }))]} />
              </div>
            </div>
            <table>
              <tbody>
                {state.lineup[String(picking)] && (
                  <tr className="click" onClick={() => { setState((s) => { const l = { ...s.lineup }; delete l[String(picking)]; return { ...s, lineup: l }; }); setPicking(null); }}>
                    <td colSpan={3} className="err">Remover jogador deste slot</td>
                  </tr>
                )}
                {candidates.map(({ p, score, natural, cover }) => {
                  const usedElsewhere = Object.entries(state.lineup).find(([k, v]) => v === p.id && k !== String(picking));
                  return (
                    <tr key={p.id} className="click" onClick={() => {
                      setState((s) => {
                        const l = { ...s.lineup };
                        if (usedElsewhere) delete l[usedElsewhere[0]];
                        l[String(picking)] = p.id;
                        return { ...s, lineup: l };
                      });
                      setPicking(null);
                    }}>
                      <td>{p.name} {usedElsewhere && <span className="tag">já titular</span>}</td>
                      <td className="mute">{p.positions.join(", ")}</td>
                      <td><span className={"score " + scoreClass(score)}>{score ?? "?"}</span> {natural ? "" : cover ? "~" : "!"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <PlayerEditor
          player={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => { save(p); setEditing(null); }}
          onDelete={state.players.some((x) => x.id === editing.id) ? () => { remove(editing.id); setEditing(null); } : undefined}
        />
      )}
    </>
  );
}
