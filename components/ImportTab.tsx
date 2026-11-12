"use client";
import { useState } from "react";
import { callApi, Props } from "@/lib/client";
import { fileToJpegBase64, importFile, mergePlayers, parsePositions } from "@/lib/import";
import { Player, uid } from "@/lib/types";
import PlayerEditor from "@/components/PlayerEditor";

export default function ImportTab({ state, setState }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; text: string } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [preview, setPreview] = useState<(Player & { keep: boolean })[]>([]);
  const [target, setTarget] = useState<Player["status"]>("squad");
  const [editing, setEditing] = useState<Player | null>(null);

  const extract = async () => {
    setBusy(true); setMsg(null); setWarnings([]);
    try {
      const all: Player[] = [];
      const warns: string[] = [];
      for (let i = 0; i < files.length; i += 3) {
        const batch = await Promise.all(files.slice(i, i + 3).map((f) => fileToJpegBase64(f)));
        const out = await callApi<{ players: any[]; warnings?: string[] }>("/api/extract", { images: batch }, state.accessCode);
        for (const p of out.players ?? []) {
          all.push({
            id: uid(),
            name: String(p.name ?? "").trim(),
            age: typeof p.age === "number" ? p.age : undefined,
            positions: Array.isArray(p.positions) ? parsePositions(p.positions.join(",")) : [],
            nationality: p.nationality, club: p.club, contractExpiry: p.contractExpiry,
            wage: p.wage, value: p.value, ca: p.ca, pa: p.pa, notes: p.notes,
            attrs: Object.fromEntries(Object.entries(p.attrs ?? {}).filter(([, v]) => typeof v === "number")) as Record<string, number>,
            status: target,
          });
        }
        warns.push(...(out.warnings ?? []));
      }
      const merged = mergePlayers([], all.filter((p) => p.name));
      setPreview(merged.map((p) => ({ ...p, keep: true })));
      setWarnings(warns);
      setMsg({ t: "ok", text: `${merged.length} jogador(es) lidos. Confira abaixo antes de adicionar.` });
    } catch (e: any) {
      setMsg({ t: "err", text: e.message });
    } finally { setBusy(false); }
  };

  const commit = () => {
    const chosen = preview.filter((p) => p.keep).map(({ keep, ...p }) => ({ ...p, status: target }));
    setState((s) => ({ ...s, players: mergePlayers(s.players, chosen) }));
    setMsg({ t: "ok", text: `${chosen.length} jogador(es) adicionados.` });
    setPreview([]); setFiles([]);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    try {
      const ps = await importFile(f);
      if (!ps.length) { setMsg({ t: "err", text: "Não encontrei jogadores no arquivo. Confira se há cabeçalho com a coluna de nome." }); return; }
      setPreview(ps.map((p) => ({ ...p, status: target, keep: true })));
      setMsg({ t: "ok", text: `${ps.length} jogador(es) lidos do arquivo.` });
    } catch (e: any) { setMsg({ t: "err", text: e.message }); }
  };

  return (
    <>
      <div className="card">
        <h2>1. Importar por print (recomendado para save online)</h2>
        <p className="mute">
          Tire prints direto do jogo e envie aqui. A IA lê nomes, posições, idade, contrato e atributos. Dicas para o melhor resultado:
        </p>
        <ul className="clean mute">
          <li><b>Elenco:</b> tela Elenco com uma visão que mostre <i>Atributos</i> (técnicos, mentais, físicos). Se não couber tudo, tire 2–3 prints rolando as colunas.</li>
          <li><b>Contrato/salário/valor:</b> uma visão de Contratos (fim do contrato, salário, valor) em outro print.</li>
          <li><b>Alvos de transferência:</b> prints da Busca de Jogadores ou do perfil individual (aba Atributos) — escolha “Shortlist” abaixo.</li>
          <li>Use o jogo em resolução alta e sem sobreposição de janelas. Até 3 prints por chamada; o site divide automaticamente.</li>
        </ul>
        <div className="row" style={{ marginBottom: ".6rem" }}>
          <div style={{ width: 220 }}>
            <label>Adicionar como</label>
            <select value={target} onChange={(e) => setTarget(e.target.value as Player["status"])}>
              <option value="squad">Meu elenco</option>
              <option value="shortlist">Shortlist (alvos)</option>
            </select>
          </div>
        </div>
        <div className="drop">
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
          <div style={{ marginTop: ".5rem" }}>{files.length ? `${files.length} imagem(ns) selecionada(s)` : "Selecione ou arraste os prints"}</div>
        </div>
        <div className="row" style={{ marginTop: ".6rem" }}>
          <button className="btn" disabled={!files.length || busy} onClick={extract}>{busy ? "Lendo prints…" : "Ler prints com IA"}</button>
        </div>
      </div>

      <div className="card">
        <h2>2. Arquivo CSV / HTML</h2>
        <p className="mute">Se algum dia você conseguir exportar (ou usar um save offline com o plugin de exportação), envie o CSV/HTML aqui. Reconhece colunas em inglês, abreviações do FM (Fin, Pas, Tck…) e posições como “D (RLC)”.</p>
        <input type="file" accept=".csv,.html,.htm,.txt" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      <div className="card">
        <h2>3. Cadastro manual</h2>
        <button className="btn ghost" onClick={() => setEditing({ id: uid(), name: "", positions: [], attrs: {}, status: target })}>Cadastrar jogador</button>
      </div>

      {msg && <p className={msg.t === "ok" ? "ok" : "err"}>{msg.text}</p>}
      {warnings.length > 0 && <div className="card"><h3>Avisos da leitura</h3><ul className="clean">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div>}

      {preview.length > 0 && (
        <div className="card">
          <h2>Conferir antes de adicionar</h2>
          <table>
            <thead><tr><th></th><th>Nome</th><th>Pos</th><th>Idade</th><th>Atributos lidos</th><th>Contrato</th></tr></thead>
            <tbody>
              {preview.map((p, i) => (
                <tr key={p.id}>
                  <td><input type="checkbox" style={{ width: "auto" }} checked={p.keep} onChange={(e) => setPreview((x) => x.map((y, j) => (j === i ? { ...y, keep: e.target.checked } : y)))} /></td>
                  <td>{p.name}</td>
                  <td>{p.positions.join(", ")}</td>
                  <td>{p.age ?? "—"}</td>
                  <td>{Object.keys(p.attrs).length}</td>
                  <td>{p.contractExpiry ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mute" style={{ fontSize: ".85rem" }}>Jogadores com o mesmo nome são combinados com os já existentes (os campos novos completam os antigos). Revise valores duvidosos depois clicando no jogador.</p>
          <div className="row">
            <button className="btn" onClick={commit}>Adicionar {preview.filter((p) => p.keep).length} jogador(es)</button>
            <button className="btn ghost" onClick={() => setPreview([])}>Descartar</button>
          </div>
        </div>
      )}

      {editing && (
        <PlayerEditor
          player={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => { setState((s) => ({ ...s, players: mergePlayers(s.players, [p]) })); setEditing(null); setMsg({ t: "ok", text: `${p.name} adicionado.` }); }}
        />
      )}
    </>
  );
}
