"use client";
import { useState } from "react";
import { callApi, Props } from "@/lib/client";
import { compactPlayer } from "@/lib/import";
import { FORMATIONS } from "@/lib/formations";

interface Result {
  formation: string; mentality: string; reasoning: string;
  inPossession: string[]; outOfPossession: string[]; transition: string[];
  lineup: { slot: string; playerId: string; role: string; duty: string; why: string }[];
  weaknesses: { issue: string; fix: string }[];
  setPieces: string; alternativePlan: string;
}

export default function Tactics({ state }: Props) {
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const squad = state.players.filter((p) => p.status === "squad");
  const name = (id: string) => state.players.find((p) => p.id === id)?.name ?? id;
  const slots = FORMATIONS[state.formation] ?? [];
  const lineup = Object.entries(state.lineup).map(([i, id]) => ({ slot: slots[+i]?.pos, playerId: id }));

  const run = async () => {
    setBusy(true); setErr(""); setRes(null);
    try {
      setRes(await callApi<Result>("/api/tactics", {
        club: state.club, formation: state.formation, currentLineup: lineup,
        squad: squad.map(compactPlayer), extraInstructions: extra,
      }, state.accessCode));
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  const List = ({ title, items }: { title: string; items?: string[] }) => (
    <div><h3>{title}</h3><ul className="clean">{items?.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
  );

  return (
    <>
      <div className="card">
        <h2>Sugestões táticas com IA</h2>
        <p className="mute">A IA monta a abordagem para o seu elenco real: mentalidade, instruções, função de cada titular pelos atributos e como esconder os pontos fracos. Formação atual: {state.formation} ({lineup.length}/11 titulares definidos na aba Elenco).</p>
        <div className="field">
          <label>Instruções extras (opcional)</label>
          <textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Ex.: quero pressão alta e posse; jogo contra time mais forte, preciso de contra-ataque…" />
        </div>
        <button className="btn" disabled={busy || squad.length < 11} onClick={run}>{busy ? "Analisando…" : "Sugerir tática"}</button>
        {squad.length < 11 && <span className="mute"> Importe pelo menos 11 jogadores.</span>}
        {err && <p className="err">{err}</p>}
      </div>

      {res && (
        <>
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
    </>
  );
}
