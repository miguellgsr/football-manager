"use client";
import { useEffect, useRef, useState } from "react";
import { callApi, Props } from "@/lib/client";
import { compactPlayer, fileToJpegBase64 } from "@/lib/import";
import type { ChatMsg } from "@/lib/types";

const QUICK = [
  "O que falta no meu elenco? Indique posições e características.",
  "Quais jogadores eu deveria vender, renovar ou emprestar?",
  "Qual o melhor alvo da minha shortlist para o meu elenco?",
];

function Structured({ data, name }: { data: any; name: (id: string) => string }) {
  if (!data) return null;
  return (
    <>
      {!!data.needs?.length && (
        <div style={{ marginTop: ".6rem" }}>
          <h3>Carências e perfis ideais</h3>
          {data.needs.map((n: any, i: number) => (
            <div key={i} style={{ borderTop: i ? "1px solid var(--line)" : "none", paddingTop: i ? ".6rem" : 0, marginTop: i ? ".6rem" : 0 }}>
              <div className="row"><b>{n.position}</b><span className={"tag " + n.priority}>prioridade {n.priority}</span></div>
              <p style={{ margin: ".3rem 0" }}>{n.reason}</p>
              <div className="kv">
                <span className="mute">Função</span><span>{n.idealProfile?.role}</span>
                <span className="mute">Atributos-chave</span><span>{n.idealProfile?.keyAttributes?.join(", ")}</span>
                <span className="mute">Idade</span><span>{n.idealProfile?.ageRange}</span>
                {n.idealProfile?.notes && <><span className="mute">Notas</span><span>{n.idealProfile.notes}</span></>}
                <span className="mute">Filtros no FM</span><span>{n.searchFilters}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {!!data.similarPlayers?.length && (
        <div style={{ marginTop: ".6rem" }}>
          <h3>Jogadores parecidos (sugestões da memória da IA)</h3>
          <p className="mute" style={{ fontSize: ".8rem", margin: "0 0 .3rem" }}>Confira na Busca de Jogadores do FM: clube, idade e atributos podem ser diferentes no seu save.</p>
          <table>
            <thead><tr><th>Jogador</th><th>Pos</th><th>Por quê</th><th>Atenção</th></tr></thead>
            <tbody>{data.similarPlayers.map((p: any, i: number) => <tr key={i}><td><b>{p.name}</b><div className="mute" style={{ fontSize: ".8rem" }}>{p.approxClub}</div></td><td>{p.position}</td><td>{p.why}</td><td>{p.caution}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {!!data.shortlistPicks?.length && (
        <div style={{ marginTop: ".6rem" }}>
          <h3>Melhores alvos da shortlist</h3>
          <table>
            <thead><tr><th>Jogador</th><th>Para</th><th>Encaixe</th><th>Por quê</th><th>Riscos</th></tr></thead>
            <tbody>{[...data.shortlistPicks].sort((a: any, b: any) => b.score - a.score).map((p: any, i: number) => <tr key={i}><td>{name(p.playerId)}</td><td>{p.needPosition}</td><td><b>{p.score}</b></td><td>{p.why}</td><td>{p.risks}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {!!data.sellOrRenew?.length && (
        <div style={{ marginTop: ".6rem" }}>
          <h3>Vender, renovar ou manter</h3>
          <table>
            <tbody>{data.sellOrRenew.map((s: any, i: number) => <tr key={i}><td>{name(s.playerId)}</td><td><span className="tag">{s.action}</span></td><td>{s.why}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function Transfers({ state, setState, accessCode, prefill, clearPrefill }: Props & { prefill: string; clearPrefill: () => void }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const squad = state.players.filter((p) => p.status === "squad");
  const short = state.players.filter((p) => p.status === "shortlist");
  const name = (id: string) => state.players.find((p) => p.id === id)?.name ?? id;

  useEffect(() => { if (prefill) { setText(prefill); clearPrefill(); } }, [prefill]); // eslint-disable-line
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [state.chat.length, busy]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const imgs = Array.from(e.clipboardData?.items ?? []).filter((i) => i.type.startsWith("image/")).map((i) => i.getAsFile()).filter(Boolean) as File[];
      if (imgs.length) { e.preventDefault(); setFiles((f) => [...f, ...imgs].slice(0, 3)); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const send = async (override?: string) => {
    const message = (override ?? text).trim();
    if (!message && files.length === 0) return;
    setBusy(true); setErr("");
    const userMsg: ChatMsg = { role: "user", text: message || "(print enviado)", ts: Date.now(), images: files.length || undefined };
    const history = state.chat.slice(-10).map((m) => ({ role: m.role, text: m.text }));
    setState((s) => ({ ...s, chat: [...s.chat, userMsg] }));
    setText("");
    const images = await Promise.all(files.map((f) => fileToJpegBase64(f, 1400)));
    setFiles([]);
    try {
      const out = await callApi<any>("/api/transfers", {
        club: state.club,
        formation: state.formation,
        squad: squad.map(compactPlayer),
        shortlist: short.map(compactPlayer),
        history,
        message: message || "Analise o jogador do print em relação ao meu elenco e sugira jogadores parecidos.",
        images,
      }, accessCode);
      const { reply, ...data } = out;
      setState((s) => ({ ...s, chat: [...s.chat, { role: "assistant", text: String(reply ?? ""), ts: Date.now(), data }] }));
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="fillcol fill" style={{ gap: 12 }}>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0 }}>Transferências com IA</h2>
            <p className="mute" style={{ margin: ".3rem 0 0" }}>
              A IA lê os {squad.length} jogadores do seu elenco{short.length ? ` e ${short.length} da shortlist` : ""}. Pergunte o que falta, peça indicações por posição e característica, ou envie o print de um jogador para achar parecidos.
            </p>
          </div>
          {state.chat.length > 0 && <button className="btn ghost sm" onClick={() => { if (confirm("Limpar a conversa deste save?")) setState((s) => ({ ...s, chat: [] })); }}>Limpar conversa</button>}
        </div>
        {squad.length < 5 && <p className="err">Importe pelo menos 5 jogadores para a IA analisar o elenco.</p>}
        {!state.club.transferBudget && <p className="mute" style={{ fontSize: ".85rem" }}>Dica: preencha orçamento e estilo em “Extras & Clube” para sugestões mais realistas.</p>}
      </div>

      <div className="card fillcol" style={{ flex: 1 }}>
        <div className="scroll">
        {state.chat.length === 0 && (
          <div>
            <p className="mute">Comece por uma pergunta rápida:</p>
            <div className="row">{QUICK.map((q) => <button key={q} className="btn ghost sm" disabled={busy || squad.length < 5} onClick={() => send(q)}>{q}</button>)}</div>
          </div>
        )}
        {state.chat.map((m, i) => (
          <div key={i} style={{ margin: ".8rem 0", padding: ".7rem .9rem", borderRadius: 10, background: m.role === "user" ? "var(--panel2)" : "transparent", border: m.role === "user" ? "1px solid var(--line)" : "1px solid transparent", borderLeft: m.role === "assistant" ? "3px solid var(--accent2)" : undefined }}>
            <div className="mute" style={{ fontSize: ".75rem", marginBottom: ".2rem" }}>{m.role === "user" ? `Você${m.images ? ` · ${m.images} print(s)` : ""}` : "Diretor de futebol IA"}</div>
            <div className="pre">{m.text}</div>
            {m.role === "assistant" && <Structured data={m.data} name={name} />}
          </div>
        ))}
        {busy && <p className="mute">Analisando…</p>}
        {err && <p className="err">{err}</p>}
        <div ref={endRef} />
        </div>

        {state.chat.length > 0 && !busy && (
          <div className="row" style={{ marginBottom: ".6rem" }}>{QUICK.map((q) => <button key={q} className="btn ghost sm" disabled={squad.length < 5} onClick={() => send(q)}>{q}</button>)}</div>
        )}

        <div className="field" style={{ marginTop: ".6rem" }}>
          {files.length > 0 && (
            <div className="thumbs">
              {files.map((f, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={URL.createObjectURL(f)} alt={f.name} />
                  <button className="btn danger sm" style={{ position: "absolute", top: 2, right: 2, padding: "0 .3rem" }} onClick={() => setFiles((x) => x.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !busy) { e.preventDefault(); send(); } }}
            placeholder="Ex.: Preciso de um zagueiro canhoto até 24 anos • Quero um meia parecido com este jogador do print • O que falta no meio-campo?"
          />
        </div>
        <div className="row">
          <button className="btn" disabled={busy || squad.length < 5 || (!text.trim() && files.length === 0)} onClick={() => send()}>Enviar</button>
          <button className="btn ghost" disabled={files.length >= 3} onClick={() => fileRef.current?.click()}>Anexar print ({files.length}/3)</button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => { setFiles((f) => [...f, ...Array.from(e.target.files ?? [])].slice(0, 3)); e.target.value = ""; }} />
          <span className="mute" style={{ fontSize: ".8rem" }}>Enter envia · Shift+Enter quebra linha · Ctrl+V cola um print</span>
        </div>
      </div>
    </div>
  );
}
