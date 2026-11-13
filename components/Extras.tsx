"use client";
import { useMemo, useState } from "react";
import type { Props } from "@/lib/client";
import { bestOverall } from "@/lib/roles";
import { contractYear, moneyNum } from "@/lib/import";
import { ATTR_GROUPS, initialState, Player, State } from "@/lib/types";
import PlayerEditor from "./PlayerEditor";
import ClubPicker from "./ClubPicker";
import SubMenu from "./SubMenu";
import { setIdentity } from "@/lib/saves";
import { scoreClass } from "./Squad";

export default function Extras({ state, setState, accessCode, setAccessCode, saveName, saveId, meta }: Props & { saveName: string; saveId: string; meta?: { country?: string; league?: string; colors?: { p: string; s: string } } }) {
  const [editing, setEditing] = useState<Player | null>(null);
  const [sec, setSec] = useState("clube");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const squad = state.players.filter((p) => p.status === "squad");
  const short = state.players.filter((p) => p.status === "shortlist");

  const expiring = useMemo(
    () => squad.filter((p) => contractYear(p)).sort((x, y) => contractYear(x)! - contractYear(y)!).slice(0, 12),
    [state.players] // eslint-disable-line
  );
  const young = useMemo(
    () => squad.filter((p) => (p.age ?? 99) <= 21).sort((x, y) => (y.pa ?? bestOverall(y)?.score ?? 0) - (x.pa ?? bestOverall(x)?.score ?? 0)),
    [state.players] // eslint-disable-line
  );
  const wageTotal = squad.reduce((s, p) => s + moneyNum(p.wage), 0);
  const avgAge = squad.length ? (squad.reduce((s, p) => s + (p.age ?? 0), 0) / squad.filter((p) => p.age).length || 0).toFixed(1) : "—";

  const pa = squad.concat(short).find((p) => p.id === a);
  const pb = squad.concat(short).find((p) => p.id === b);

  const setClub = (patch: Partial<State["club"]>) => setState((s) => ({ ...s, club: { ...s.club, ...patch } }));

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url; el.download = `fm-planner-${saveName.replace(/\W+/g, "-").toLowerCase()}.json`; el.click();
    URL.revokeObjectURL(url);
  };
  const importJson = async (f?: File) => {
    if (!f) return;
    try { setState({ ...initialState, ...JSON.parse(await f.text()) }); } catch { alert("Arquivo inválido."); }
  };

  return (
    <>
      <div className="cols side fill">
      <div className="card">
        <SubMenu title="Extras & Clube" active={sec} onSelect={setSec} items={[
          { id: "clube", label: "Clube e acesso" },
          { id: "contratos", label: "Contratos e folha" },
          { id: "jovens", label: "Jovens promessas" },
          { id: "shortlist", label: "Shortlist" },
          { id: "comparador", label: "Comparador" },
          { id: "backup", label: "Backup do save" },
        ]} />
      </div>
      <div className="card fillcol"><div className="scroll">
      {sec === "clube" && <div>
        <h2>Clube — {saveName}</h2>
        <details style={{ marginBottom: ".8rem" }}>
          <summary className="mute" style={{ cursor: "pointer" }}>Trocar clube / cores do save</summary>
          <ClubPicker
            value={{ club: state.club.name, country: meta?.country, league: meta?.league, colors: meta?.colors }}
            onChange={(c) => { setIdentity(saveId, c.club, { country: c.country, league: c.league, colors: c.colors }); setClub({ name: c.club }); }}
          />
        </details>
        <div className="grid2">
          <div className="field"><label>Nome do clube</label><input value={state.club.name} onChange={(e) => setClub({ name: e.target.value })} /></div>
          <div className="field"><label>Estilo / filosofia desejada</label><input value={state.club.style} onChange={(e) => setClub({ style: e.target.value })} placeholder="Ex.: posse e pressão alta, jovens do clube…" /></div>
          <div className="field"><label>Orçamento de transferências</label><input value={state.club.transferBudget} onChange={(e) => setClub({ transferBudget: e.target.value })} placeholder="Ex.: €25M" /></div>
          <div className="field"><label>Orçamento de salários (folga)</label><input value={state.club.wageBudget} onChange={(e) => setClub({ wageBudget: e.target.value })} placeholder="Ex.: €400K/sem" /></div>
        </div>
        <div className="field" style={{ maxWidth: 340 }}>
          <label>Código de acesso (se você configurou ACCESS_CODE no Vercel)</label>
          <input type="password" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} />
          <div className="mute" style={{ fontSize: ".75rem", marginTop: ".2rem" }}>Vale para todos os saves deste navegador.</div>
        </div>
      </div>}

      {sec === "contratos" && <div className="grid2">
        <div className="card">
          <h2>Contratos mais próximos do fim</h2>
          {expiring.length === 0 ? <p className="mute">Sem dados de contrato.</p> : (
            <table><tbody>{expiring.map((p) => <tr key={p.id} className="click" onClick={() => setEditing(p)}><td>{p.name}</td><td>{p.age ?? ""}</td><td>{p.contractExpiry}</td></tr>)}</tbody></table>
          )}
        </div>
        <div className="card">
          <h2>Resumo financeiro e idade</h2>
          <div className="kv">
            <span className="mute">Folha (soma lida)</span><span>{wageTotal ? wageTotal.toLocaleString("pt-BR") : "—"}</span>
            <span className="mute">Idade média</span><span>{avgAge}</span>
            <span className="mute">Jogadores ≤ 21</span><span>{young.length}</span>
            <span className="mute">Shortlist</span><span>{short.length}</span>
          </div>
          <p className="mute" style={{ fontSize: ".8rem" }}>A folha soma os salários como estão no texto; use o mesmo período (semana/mês) em todos.</p>
        </div>
      </div>}

      {sec === "jovens" && <div>
        <h2>Jovens promessas do elenco (≤ 21 anos)</h2>
        {young.length === 0 ? <p className="mute">Nenhum jogador até 21 anos.</p> : (
          <table>
            <thead><tr><th>Nome</th><th>Idade</th><th>Pos</th><th>Melhor função</th><th>PA</th></tr></thead>
            <tbody>{young.map((p) => { const bo = bestOverall(p); return (
              <tr key={p.id} className="click" onClick={() => setEditing(p)}>
                <td>{p.name}</td><td>{p.age}</td><td>{p.positions.join(", ")}</td>
                <td>{bo ? <><span className={"score " + scoreClass(bo.score)}>{bo.score}</span> {bo.role.name}</> : "—"}</td>
                <td>{p.pa ?? "—"}</td>
              </tr>); })}</tbody>
          </table>
        )}
      </div>}

      {sec === "shortlist" && <div>
        <h2>Shortlist</h2>
        {short.length === 0 ? <p className="mute">Importe prints de alvos escolhendo “Shortlist” na aba Importar.</p> : (
          <table>
            <thead><tr><th>Nome</th><th>Idade</th><th>Pos</th><th>Melhor função</th><th>Valor</th><th></th></tr></thead>
            <tbody>{short.map((p) => { const bo = bestOverall(p); return (
              <tr key={p.id}>
                <td className="click" onClick={() => setEditing(p)} style={{ cursor: "pointer" }}>{p.name}</td><td>{p.age}</td><td>{p.positions.join(", ")}</td>
                <td>{bo ? <><span className={"score " + scoreClass(bo.score)}>{bo.score}</span> {bo.role.name}</> : "—"}</td>
                <td>{p.value ?? "—"}</td>
                <td><button className="btn ghost sm" onClick={() => setState((s) => ({ ...s, players: s.players.map((x) => (x.id === p.id ? { ...x, status: "squad" } : x)) }))}>Contratado → elenco</button></td>
              </tr>); })}</tbody>
          </table>
        )}
      </div>}

      {sec === "comparador" && <div>
        <h2>Comparador</h2>
        <div className="row" style={{ marginBottom: ".6rem" }}>
          <select value={a} onChange={(e) => setA(e.target.value)} style={{ maxWidth: 260 }}><option value="">Jogador A</option>{state.players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          <select value={b} onChange={(e) => setB(e.target.value)} style={{ maxWidth: 260 }}><option value="">Jogador B</option>{state.players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        </div>
        {pa && pb && (
          <table>
            <thead><tr><th>Atributo</th><th>{pa.name}</th><th>{pb.name}</th></tr></thead>
            <tbody>
              {ATTR_GROUPS.flatMap((g) => g.keys).filter(([k]) => pa.attrs[k] !== undefined || pb.attrs[k] !== undefined).map(([k, label]) => {
                const x = pa.attrs[k], y = pb.attrs[k];
                return (
                  <tr key={k}><td>{label}</td>
                    <td className={x !== undefined && y !== undefined && x > y ? "ok" : ""}>{x ?? "—"}</td>
                    <td className={x !== undefined && y !== undefined && y > x ? "ok" : ""}>{y ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>}

      {sec === "backup" && <div>
        <h2>Backup deste save</h2>
        <p className="mute">Os dados ficam salvos neste navegador. Exporte um backup para levar este save a outro aparelho (na tela inicial há “Importar backup”).</p>
        <div className="row">
          <button className="btn ghost" onClick={exportJson}>Exportar backup (.json)</button>
          <label className="btn ghost" style={{ margin: 0, cursor: "pointer", color: "var(--text)", fontSize: "1rem" }}>
            Restaurar backup
            <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => importJson(e.target.files?.[0])} />
          </label>
          <button className="btn danger" onClick={() => { if (confirm("Apagar todos os jogadores e a conversa deste save?")) setState(initialState); }}>Esvaziar este save</button>
        </div>
      </div>}
      </div></div></div>

      {editing && (
        <PlayerEditor
          player={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => { setState((s) => ({ ...s, players: s.players.map((x) => (x.id === p.id ? p : x)) })); setEditing(null); }}
          onDelete={() => { const id = editing.id; setState((s) => ({ ...s, players: s.players.filter((x) => x.id !== id) })); setEditing(null); }}
        />
      )}
    </>
  );
}
