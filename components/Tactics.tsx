"use client";
import { useMemo, useState } from "react";
import { callApi, Props } from "@/lib/client";
import { compactPlayer } from "@/lib/import";
import { evaluateAll, summarizeEval } from "@/lib/analysis";
import { FORMATIONS } from "@/lib/formations";
import { scoreClass } from "./Squad";

interface Result {
  candidates?: { formation: string; style: string; fit: number; why: string; risk: string }[];
  best?: string;
  formation: string; mentality: string; reasoning: string;
  inPossession: string[]; outOfPossession: string[]; transition: string[];
  lineup: { slot: string; playerId: string; role: string; duty: string; why: string }[];
  weaknesses: { issue: string; fix: string }[];
  setPieces: string; alternativePlan: string;
}

export default function Tactics({ state, accessCode }: Props) {
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const squad = state.players.filter((p) => p.status === "squad");
  const name = (id: string) => state.players.find((p) => p.id === id)?.name ?? id;
  const slots = FORMATIONS[state.formation] ?? [];
  const lineup = Object.entries(state.lineup).map(([i, id]) => ({ slot: slots[+i]?.pos, playerId: id }));
  const evals = useMemo(() => evaluateAll(squad), [state.players]); // eslint-disable-line
  const withAttrs = squad.filter((p) => Object.keys(p.attrs).length >= 8).length;

  const run = async () => {
    setBusy(true); setErr(""); setRes(null);
    try {
      setRes(await callApi<Result>("/api/tactics", {
        club: state.club, formation: state.formation, currentLineup: lineup,
        squad: squad.map(compactPlayer),
        localFit: evals.slice(0, 5).map((e) => summarizeEval(e, squad)),
        extraInstructions: extra,
      }, accessCode));
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  const List = ({ title, items }: { title: string; items?: string[] }) => (
    <div><h3>{title}</h3><ul className="clean">{items?.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
  );

  return (
    <div className="cols c2 fill">
      <div className="fillcol" style={{ gap: 12 }}>
      <div className="card">
        <h2>Táticas com IA</h2>
        <p className="mute">A IA lê o seu elenco completo ({squad.length} jogadores, {withAttrs} com atributos), compara formações e estilos de jogo e recomenda o que melhor encaixa, com a função de cada titular.</p>
        {squad.length > 0 && withAttrs < squad.length && <p className="err" style={{ fontSize: ".85rem" }}>{squad.length - withAttrs} jogador(es) sem atributos suficientes: a análise fica menos precisa. Importe os atributos pelos prints.</p>}
        <div className="field">
          <label>Instruções extras (opcional)</label>
          <textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Ex.: quero pressão alta e posse; jogo contra time mais forte, preciso de contra-ataque…" />
        </div>
        <button className="btn" disabled={busy || squad.length < 11} onClick={run}>{busy ? "Analisando o elenco…" : "Analisar tática e estilo ideais"}</button>
        {squad.length < 11 && <span className="mute"> Importe pelo menos 11 jogadores.</span>}
        {err && <p className="err">{err}</p>}
      </div>

      {squad.length >= 11 && (
        <div className="card fillcol" style={{ flex: 1 }}>
          <h2>Encaixe por formação (cálculo local)</h2>
          <p className="mute" style={{ fontSize: ".85rem" }}>Melhor 11 possível em cada formação, pelo encaixe dos atributos na função de cada posição (0–100). Jogador fora de posição perde 10 pontos.</p>
          <div className="scroll"><table>
            <thead><tr><th>Formação</th><th>Encaixe médio</th><th>Posições sem jogador</th><th>Fora de posição</th></tr></thead>
            <tbody>
              {evals.map((e) => (
                <tr key={e.formation}>
                  <td><b>{e.formation}</b></td>
                  <td><span className={"score " + scoreClass(e.avg)}>{e.avg}</span></td>
                  <td>{e.assigns.filter((a) => !a.playerId).map((a) => a.pos).join(", ") || "—"}</td>
                  <td>{e.assigns.filter((a) => a.playerId && !a.natural).length}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
      </div>

      <div className="card fillcol"><div className="scroll">
      {!res && <p className="mute">O resultado da análise da IA aparece aqui: formações avaliadas, tática recomendada, função de cada titular, pontos fracos e bola parada.</p>}
      {res && (
        <>
          {!!res.candidates?.length && (
            <div className="card">
              <h2>Combinações avaliadas pela IA</h2>
              <table>
                <thead><tr><th>Formação e estilo</th><th>Encaixe</th><th>Por quê</th><th>Risco</th></tr></thead>
                <tbody>
                  {[...res.candidates].sort((a, b) => b.fit - a.fit).map((c, i) => (
                    <tr key={i}><td><b>{c.formation}</b><div className="mute" style={{ fontSize: ".85rem" }}>{c.style}</div></td><td><span className={"score " + scoreClass(c.fit)}>{c.fit}</span></td><td>{c.why}</td><td>{c.risk}</td></tr>
                  ))}
                </tbody>
              </table>
              {res.best && <p><b>Recomendada:</b> {res.best}</p>}
            </div>
          )}
          <div className="card">
            <div className="row"><h2 style={{ margin: 0 }}>{res.formation}</h2><span className="tag">{res.mentality}</span></div>
            <p className="pre">{res.reasoning}</p>
            <div className="grid2">
              <List title="Com a bola" items={res.inPossession} />
              <List title="Sem a bola" items={res.outOfPossession} />
            </div>
            <List title="Transição" items={res.transition} />
          </div>

          <div className="card">
            <h2>Funções por jogador</h2>
            <table>
              <thead><tr><th>Posição</th><th>Jogador</th><th>Função</th><th>Dever</th><th>Por quê</th></tr></thead>
              <tbody>{res.lineup?.map((l, i) => <tr key={i}><td>{l.slot}</td><td>{name(l.playerId)}</td><td>{l.role}</td><td>{l.duty}</td><td>{l.why}</td></tr>)}</tbody>
            </table>
          </div>

          <div className="grid2">
            <div className="card">
              <h2>Pontos fracos e correções</h2>
              <ul className="clean">{res.weaknesses?.map((w, i) => <li key={i}><b>{w.issue}</b> — {w.fix}</li>)}</ul>
            </div>
            <div className="card">
              <h2>Bola parada e plano B</h2>
              <p className="pre">{res.setPieces}</p>
              <p className="pre">{res.alternativePlan}</p>
            </div>
          </div>
        </>
      )}
      </div></div>
    </div>
  );
}
