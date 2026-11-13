"use client";
import { Select } from "./Dropdown";
import { useMemo } from "react";
import { FORMATIONS, ALL_POS } from "@/lib/formations";
import { detectFormation, effectiveSlots } from "@/lib/board";
import { positionStatus } from "@/lib/analysis";
import { bestFor } from "@/lib/fmroles";
import type { Pos } from "@/lib/types";
import type { Props } from "@/lib/client";
import { scoreClass } from "./Squad";
import { PitchLines, roleClass } from "./Pitch";

const GRID: (Pos | null)[][] = [
  [null, "ST", null],
  ["LW", "AM", "RW"],
  ["LM", "CM", "RM"],
  ["LWB", "DM", "RWB"],
  ["LB", "CB", "RB"],
  [null, "GK", null],
];

const LEVEL_LABEL = { gap: "Lacuna", thin: "Pouca profundidade", ok: "Coberta", optional: "Fora da formação" } as const;
const LEVEL_COLOR = { gap: "var(--bad)", thin: "var(--warn)", ok: "var(--accent2)", optional: "var(--line)" } as const;

export default function Planning({ state, setState, askAi }: Props & { askAi: (msg: string) => void }) {
  const squad = state.players.filter((p) => p.status === "squad");
  const slots = effectiveSlots(state);
  const det = detectFormation(state);
  const status = useMemo(() => positionStatus(squad, det.name, ALL_POS, slots), [state.players, state.formation, state.board]); // eslint-disable-line
  const byPos = Object.fromEntries(status.map((s) => [s.pos, s]));
  const issues = status.filter((s) => s.starters && (s.level === "gap" || s.level === "thin" || s.notes.length));
  const noPos = squad.filter((p) => p.positions.length === 0);

  const prompt = () => {
    const lines = issues.map((s) => `- ${s.pos}: ${LEVEL_LABEL[s.level]}${s.notes.length ? " (" + s.notes.join("; ") + ")" : ""}`);
    askAi(`Analise as lacunas do meu elenco para a formação ${det.name} e diga quais reforços priorizar (posição, perfil e características):\n${lines.join("\n")}`);
  };

  return (
    <div className="cols c21 fill">
      <div className="card fillcol">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: ".5rem" }}>
          <div>
            <h2 style={{ margin: 0 }}>Planejamento do elenco</h2>
            <span className="mute" style={{ fontSize: ".78rem" }}>Sua formação atual ({det.name}) · cada posição mostra o titular e as opções do elenco · contador = jogadores de origem / desejados</span>
          </div>
          <Select width={200} value={det.known ? det.name : "custom"} onChange={(v) => { if (v !== "custom") setState((s) => ({ ...s, formation: v, lineup: {}, board: undefined })); }} options={[...(det.known ? [] : [{ value: "custom", label: det.name }]), ...Object.keys(FORMATIONS).map((f) => ({ value: f, label: f }))]} />
        </div>
        {squad.length === 0 ? <p className="mute">Importe jogadores para ver o planejamento.</p> : (
          <div className="pitchwrap">
            <div className="pitch" style={{ aspectRatio: "auto", width: "100%" }}>
              <PitchLines />
              {(() => {
                const used = new Set<string>();
                const order = slots.map((sl, i) => ({ sl, i })).sort((a, b) => a.sl.x - b.sl.x);
                const seen = new Map<string, number>();
                return slots.map((sl, i) => {
                  const pos = sl.pos;
                  const s = byPos[pos];
                  const sc = (p: (typeof squad)[number]) => bestFor(p, pos, sl.wide)?.score ?? null;
                  const pool = [...s.natural].sort((a, b) => (sc(b) ?? 0) - (sc(a) ?? 0));
                  const starterId = state.lineup[String(i)];
                  const starter = starterId ? state.players.find((p) => p.id === starterId) : undefined;
                  const rank = order.filter((o) => o.sl.pos === pos).findIndex((o) => o.i === i); // posição entre os slots iguais, da esquerda p/ direita
                  const first = rank === 0;
                  const startersAll = new Set(Object.values(state.lineup));
                  const suggested = !starter ? pool.filter((p) => !startersAll.has(p.id))[rank] : undefined;
                  const main = starter ?? suggested;
                  const bench = first ? pool.filter((p) => p.id !== main?.id && !startersAll.has(p.id) && p.id !== suggested?.id).slice(0, 3) : [];
                  void used; void seen;
                  return (
                    <div key={i} className={"plan-cell pc " + (s.level === "gap" ? "gap" : s.level === "thin" ? "thin" : "")} style={{ left: sl.x + "%", top: sl.y + "%" }}>
                      <div className={"hd " + roleClass(pos)}><span>{pos}</span><span>{s.starters ? `${s.natural.length}/${s.need}` : s.natural.length}</span></div>
                      <div className="bd">
                        {!main && <div className="err">No player</div>}
                        {main && (
                          <div style={{ display: "flex", justifyContent: "space-between", gap: ".3rem", fontWeight: 700 }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{starter ? main.name : <i>{main.name}</i>}</span>
                            <span className={"score " + scoreClass(sc(main))} style={{ fontSize: ".62rem", minWidth: "1.5rem" }}>{sc(main) ?? "?"}</span>
                          </div>
                        )}
                        {bench.map((p) => (
                          <div key={p.id} className="mute" style={{ display: "flex", justifyContent: "space-between", gap: ".3rem" }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}{p.age ? ` ${p.age}` : ""}</span>
                            <span>{sc(p) ?? "?"}</span>
                          </div>
                        ))}
                        {!main && s.cover.length > 0 && <div className="mute" style={{ fontSize: ".62rem" }}>improvisa: {s.cover.slice(0, 2).map((p) => p.name).join(", ")}</div>}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="card fillcol">
        <h2>Lacunas e alertas</h2>
        <div className="scroll">
          {issues.length === 0 ? <p className="ok">Nenhuma lacuna na formação {det.name}.</p> : (
            <ul className="clean" style={{ marginLeft: 0, listStyle: "none" }}>
              {issues.map((s) => (
                <li key={s.pos} style={{ marginBottom: ".5rem" }}>
                  <span className={"tag " + (s.level === "gap" ? "alta" : s.level === "thin" ? "media" : "baixa")}>{s.pos}</span>
                  <b>{LEVEL_LABEL[s.level]}</b> <span className="mute">({s.natural.length} de {s.need} desejados)</span>
                  {s.notes.length > 0 && <div className="mute" style={{ fontSize: ".8rem" }}>{s.notes.join(" · ")}</div>}
                </li>
              ))}
            </ul>
          )}
          {noPos.length > 0 && <p className="mute" style={{ fontSize: ".8rem" }}>{noPos.length} jogador(es) sem posição não aparecem no campo: {noPos.slice(0, 5).map((p) => p.name).join(", ")}{noPos.length > 5 ? "…" : ""}</p>}
          <h3 style={{ marginTop: ".8rem" }}>Como ler</h3>
          <ul className="clean mute" style={{ fontSize: ".8rem" }}>
            <li>Borda <span className="err">vermelha</span>: menos jogadores de origem que titulares.</li>
            <li>Borda <span style={{ color: "var(--warn)" }}>amarela</span>: titulares ok, mas sem reserva.</li>
            <li>Nome em itálico: sugestão (titular ainda não definido no Starting XI). Os nomes cinza são reservas de origem. O número é o encaixe (0–100).</li>
          </ul>
        </div>
        {issues.length > 0 && <button className="btn" style={{ marginTop: ".6rem" }} onClick={prompt}>Perguntar à IA o que priorizar</button>}
      </div>
    </div>
  );
}
