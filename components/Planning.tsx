"use client";
import { useMemo } from "react";
import { FORMATIONS, ALL_POS } from "@/lib/formations";
import { positionStatus } from "@/lib/analysis";
import { bestRoleFor } from "@/lib/roles";
import type { Pos } from "@/lib/types";
import type { Props } from "@/lib/client";
import { scoreClass } from "./Squad";

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
  const status = useMemo(() => positionStatus(squad, state.formation, ALL_POS), [state.players, state.formation]); // eslint-disable-line
  const byPos = Object.fromEntries(status.map((s) => [s.pos, s]));
  const issues = status.filter((s) => s.starters && (s.level === "gap" || s.level === "thin" || s.notes.length));
  const noPos = squad.filter((p) => p.positions.length === 0);

  const prompt = () => {
    const lines = issues.map((s) => `- ${s.pos}: ${LEVEL_LABEL[s.level]}${s.notes.length ? " (" + s.notes.join("; ") + ")" : ""}`);
    askAi(`Analise as lacunas do meu elenco para a formação ${state.formation} e diga quais reforços priorizar (posição, perfil e características):\n${lines.join("\n")}`);
  };

  return (
    <>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0 }}>Planejamento do elenco</h2>
            <p className="mute" style={{ margin: ".3rem 0 0" }}>Todos os jogadores nas suas posições. Contagem de titulares e reservas calculada para a formação de referência.</p>
          </div>
          <div className="row">
            <label style={{ margin: 0 }}>Formação de referência</label>
            <select style={{ width: "auto" }} value={state.formation} onChange={(e) => setState((s) => ({ ...s, formation: e.target.value, lineup: {} }))}>
              {Object.keys(FORMATIONS).map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
        {squad.length === 0 && <p className="mute">Importe jogadores para ver o planejamento.</p>}
      </div>

      {squad.length > 0 && (
        <div className="grid2" style={{ gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)" }}>
          <div className="pitch" style={{ aspectRatio: "auto", padding: ".7rem", display: "grid", gap: ".6rem" }}>
            {GRID.map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: ".6rem", position: "relative", zIndex: 1 }}>
                {row.map((pos, ci) => {
                  if (!pos) return <div key={ci} />;
                  const s = byPos[pos];
                  const list = [...s.natural].sort((a, b) => (bestRoleFor(b, pos)?.score ?? 0) - (bestRoleFor(a, pos)?.score ?? 0));
                  return (
                    <div key={pos} style={{ background: "rgba(10,14,18,.82)", border: `2px solid ${LEVEL_COLOR[s.level]}`, borderRadius: 10, padding: ".35rem .45rem", opacity: s.level === "optional" && list.length === 0 ? 0.45 : 1 }}>
                      <div className="row" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
                        <b style={{ color: "var(--accent)" }}>{pos}</b>
                        <span className="mute" style={{ fontSize: ".72rem" }}>{s.starters ? `${list.length}/${s.need}` : list.length}</span>
                      </div>
                      {list.length === 0 && <div className="err" style={{ fontSize: ".75rem" }}>{s.starters ? "Sem jogador" : "—"}</div>}
                      {list.map((p) => {
                        const sc = bestRoleFor(p, pos)?.score ?? null;
                        return (
                          <div key={p.id} style={{ fontSize: ".75rem", display: "flex", justifyContent: "space-between", gap: ".3rem" }}>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.positions[0] === pos ? p.name : <i className="mute">{p.name}</i>}
                              {p.age ? <span className="mute"> {p.age}</span> : null}
                            </span>
                            <span className={"score " + scoreClass(sc)} style={{ fontSize: ".68rem", minWidth: "1.8rem" }}>{sc ?? "?"}</span>
                          </div>
                        );
                      })}
                      {s.cover.length > 0 && s.level !== "ok" && (
                        <div className="mute" style={{ fontSize: ".68rem", marginTop: ".2rem" }}>
                          improvisa: {s.cover.slice(0, 3).map((p) => p.name).join(", ")}{s.cover.length > 3 ? "…" : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div>
            <div className="card">
              <h2>Lacunas e alertas</h2>
              {issues.length === 0 ? <p className="ok">Nenhuma lacuna na formação {state.formation}.</p> : (
                <ul className="clean" style={{ marginLeft: 0, listStyle: "none" }}>
                  {issues.map((s) => (
                    <li key={s.pos} style={{ marginBottom: ".5rem" }}>
                      <span className={"tag " + (s.level === "gap" ? "alta" : s.level === "thin" ? "media" : "baixa")}>{s.pos}</span>
                      <b>{LEVEL_LABEL[s.level]}</b> <span className="mute">({s.natural.length} de {s.need} desejados)</span>
                      {s.notes.length > 0 && <div className="mute" style={{ fontSize: ".85rem" }}>{s.notes.join(" · ")}</div>}
                    </li>
                  ))}
                </ul>
              )}
              {noPos.length > 0 && <p className="mute" style={{ fontSize: ".85rem" }}>{noPos.length} jogador(es) sem posição cadastrada não aparecem no campo: {noPos.slice(0, 5).map((p) => p.name).join(", ")}{noPos.length > 5 ? "…" : ""}</p>}
              {issues.length > 0 && <button className="btn" onClick={prompt}>Perguntar à IA o que priorizar</button>}
            </div>
            <div className="card">
              <h3>Como ler</h3>
              <ul className="clean mute" style={{ fontSize: ".85rem" }}>
                <li>Borda <span className="err">vermelha</span>: menos jogadores de origem que titulares na formação.</li>
                <li>Borda <span style={{ color: "var(--warn)" }}>amarela</span>: titulares ok, mas sem reserva da posição.</li>
                <li>Contador “2/3”: jogadores de origem / desejados (titulares + reservas).</li>
                <li>Nome em itálico: a posição é secundária do jogador. O número é o encaixe (0–100) pelos atributos.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
