"use client";
import { useState } from "react";
import { callApi, Props } from "@/lib/client";
import { compactPlayer } from "@/lib/import";

interface Result {
  summary: string;
  needs: { position: string; priority: "alta" | "media" | "baixa"; reason: string; idealProfile: { role: string; keyAttributes: string[]; ageRange: string; notes: string }; searchFilters: string }[];
  shortlistPicks?: { playerId: string; needPosition: string; score: number; why: string; risks: string }[];
  sellOrRenew?: { playerId: string; action: string; why: string }[];
}

export default function Transfers({ state, setState }: Props) {
  const [extra, setExtra] = useState("");
  const [useShort, setUseShort] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Result | null>(null);

  const squad = state.players.filter((p) => p.status === "squad");
  const short = state.players.filter((p) => p.status === "shortlist");
  const name = (id: string) => state.players.find((p) => p.id === id)?.name ?? id;

  const run = async () => {
    setBusy(true); setErr(""); setRes(null);
    try {
      const out = await callApi<Result>("/api/transfers", {
        club: state.club,
        formation: state.formation,
        squad: squad.map(compactPlayer),
        shortlist: useShort ? short.map(compactPlayer) : [],
        extraInstructions: extra,
      }, state.accessCode);
      setRes(out);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <div className="card">
        <h2>Sugestões de transferência com IA</h2>
        <p className="mute">A IA analisa seu elenco (atributos, idade, contratos), a formação {state.formation}, o estilo e o orçamento do clube, aponta carências, descreve o perfil ideal e filtros para a busca do FM. Se você tiver alvos na shortlist, ela ranqueia quem melhor encaixa.</p>
        {!state.club.transferBudget && <p className="mute">Dica: preencha orçamento e estilo na aba “Extras & Clube” para sugestões mais realistas.</p>}
        <div className="field">
          <label>Instruções extras (opcional)</label>
          <textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Ex.: preciso de um zagueiro canhoto até 24 anos; não quero gastar mais de 15M; prefiro jogadores que falem português…" />
        </div>
        <div className="row">
          <label style={{ display: "flex", gap: ".4rem", alignItems: "center", margin: 0 }}>
            <input type="checkbox" style={{ width: "auto" }} checked={useShort} onChange={(e) => setUseShort(e.target.checked)} />
            Considerar shortlist ({short.length})
          </label>
          <button className="btn" disabled={busy || squad.length < 5} onClick={run}>{busy ? "Analisando…" : "Analisar elenco"}</button>
          {squad.length < 5 && <span className="mute">Importe pelo menos 5 jogadores.</span>}
        </div>
        {err && <p className="err">{err}</p>}
      </div>

      {res && (
        <>
          <div className="card"><h2>Diagnóstico</h2><p className="pre">{res.summary}</p></div>

          <div className="card">
            <h2>Carências e perfis ideais</h2>
            {res.needs?.map((n, i) => (
              <div key={i} style={{ borderTop: i ? "1px solid var(--line)" : "none", paddingTop: i ? ".8rem" : 0, marginTop: i ? ".8rem" : 0 }}>
                <div className="row"><b>{n.position}</b><span className={"tag " + n.priority}>prioridade {n.priority}</span></div>
                <p>{n.reason}</p>
                <div className="kv">
                  <span className="mute">Função</span><span>{n.idealProfile?.role}</span>
                  <span className="mute">Atributos-chave</span><span>{n.idealProfile?.keyAttributes?.join(", ")}</span>
                  <span className="mute">Idade</span><span>{n.idealProfile?.ageRange}</span>
                  <span className="mute">Notas</span><span>{n.idealProfile?.notes}</span>
                  <span className="mute">Filtros no FM</span><span>{n.searchFilters}</span>
                </div>
              </div>
            ))}
          </div>

          {!!res.shortlistPicks?.length && (
            <div className="card">
              <h2>Melhores alvos da sua shortlist</h2>
              <table>
                <thead><tr><th>Jogador</th><th>Para</th><th>Encaixe</th><th>Por quê</th><th>Riscos</th></tr></thead>
                <tbody>
                  {[...res.shortlistPicks].sort((a, b) => b.score - a.score).map((p, i) => (
                    <tr key={i}><td>{name(p.playerId)}</td><td>{p.needPosition}</td><td><b>{p.score}</b></td><td>{p.why}</td><td>{p.risks}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!!res.sellOrRenew?.length && (
            <div className="card">
              <h2>Vender, renovar ou manter</h2>
              <table>
                <thead><tr><th>Jogador</th><th>Ação</th><th>Motivo</th></tr></thead>
                <tbody>{res.sellOrRenew.map((s, i) => <tr key={i}><td>{name(s.playerId)}</td><td><span className="tag">{s.action}</span></td><td>{s.why}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
