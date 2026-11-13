"use client";
import { Select } from "@/components/Dropdown";
import { useEffect, useRef, useState } from "react";
import { callApi, Props } from "@/lib/client";
import { fileToJpegBase64, importFile, mergePlayers, parsePositions } from "@/lib/import";
import { Player, uid } from "@/lib/types";
import PlayerEditor from "@/components/PlayerEditor";
import SubMenu from "@/components/SubMenu";

type Mode = "each" | "same" | "list";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function toPlayer(p: any, status: Player["status"]): Player {
  return {
    id: uid(),
    name: String(p.name ?? "").trim(),
    age: typeof p.age === "number" ? p.age : undefined,
    positions: Array.isArray(p.positions) ? parsePositions(p.positions.join(",")) : [],
    nationality: p.nationality, club: p.club, contractExpiry: p.contractExpiry,
    wage: p.wage, value: p.value, ca: p.ca, pa: p.pa, notes: p.notes,
    attrs: Object.fromEntries(Object.entries(p.attrs ?? {}).filter(([, v]) => typeof v === "number")) as Record<string, number>,
    status,
  };
}

export default function ImportTab({ state, setState, accessCode }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<Mode>("each");
  const [sec, setSec] = useState<Mode | "file" | "manual">("each");
  const pick = (id: string) => { setSec(id as any); if (id === "each" || id === "same" || id === "list") setMode(id); };
  const printSec = sec === "each" || sec === "same" || sec === "list";
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [msg, setMsg] = useState<{ t: "ok" | "err"; text: string } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [preview, setPreview] = useState<(Player & { keep: boolean })[]>([]);
  const [target, setTarget] = useState<Player["status"]>("squad");
  const [editing, setEditing] = useState<Player | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((f) => [...f, ...Array.from(list)]);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Ctrl+V com um print na área de transferência adiciona à fila
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const imgs = Array.from(e.clipboardData?.items ?? []).filter((i) => i.type.startsWith("image/")).map((i) => i.getAsFile()).filter(Boolean) as File[];
      if (imgs.length) { e.preventDefault(); setFiles((f) => [...f, ...imgs]); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const call = async (images: string[], m: "single" | "list") => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callApi<{ players: any[]; warnings?: string[] }>("/api/extract", { images, mode: m }, accessCode);
      } catch (e: any) {
        if (attempt < 2 && /limite|429|quota|demanda|overload|sobrecarreg/i.test(e.message)) { await sleep(7000); continue; }
        throw e;
      }
    }
    throw new Error("Falha ao ler o print.");
  };

  const extract = async () => {
    setBusy(true); setMsg(null); setWarnings([]); setProgress("");
    try {
      const found: Player[] = [];
      const warns: string[] = [];
      const errors: string[] = [];
      if (mode === "each") {
        for (let i = 0; i < files.length; i++) {
          setProgress(`Lendo print ${i + 1} de ${files.length}…`);
          try {
            const img = await fileToJpegBase64(files[i]);
            const out = await call([img], "single");
            const p = (out.players ?? [])[0];
            if (p?.name) found.push(toPlayer(p, target)); else errors.push(`Print ${i + 1} (${files[i].name}): não consegui identificar o jogador.`);
            warns.push(...(out.warnings ?? []).map((w) => `Print ${i + 1}: ${w}`));
          } catch (e: any) { errors.push(`Print ${i + 1} (${files[i].name}): ${e.message}`); }
          if (i < files.length - 1) await sleep(800);
        }
      } else if (mode === "same") {
        setProgress("Lendo prints do jogador…");
        const imgs = await Promise.all(files.slice(0, 6).map((f) => fileToJpegBase64(f)));
        const out = await call(imgs, "single");
        const p = (out.players ?? [])[0];
        if (p?.name) found.push(toPlayer(p, target)); else errors.push("Não consegui identificar o jogador.");
        warns.push(...(out.warnings ?? []));
        if (files.length > 6) warns.push("Só os 6 primeiros prints foram usados.");
      } else {
        for (let i = 0; i < files.length; i += 3) {
          setProgress(`Lendo prints ${i + 1}–${Math.min(i + 3, files.length)} de ${files.length}…`);
          const batch = await Promise.all(files.slice(i, i + 3).map((f) => fileToJpegBase64(f)));
          const out = await call(batch, "list");
          for (const p of out.players ?? []) if (p?.name) found.push(toPlayer(p, target));
          warns.push(...(out.warnings ?? []));
        }
      }
      const merged = mergePlayers([], found);
      setPreview(merged.map((p) => ({ ...p, keep: true })));
      setWarnings([...warns, ...errors]);
      setMsg(merged.length
        ? { t: "ok", text: `${merged.length} jogador(es) lidos. Confira abaixo antes de adicionar.` }
        : { t: "err", text: "Nenhum jogador foi lido." });
    } catch (e: any) {
      setMsg({ t: "err", text: e.message });
    } finally { setBusy(false); setProgress(""); }
  };

  const commit = () => {
    const chosen = preview.filter((p) => p.keep).map(({ keep, ...p }) => ({ ...p, status: target }));
    setState((s) => ({ ...s, players: mergePlayers(s.players, chosen) }));
    setMsg({ t: "ok", text: `${chosen.length} jogador(es) adicionados.` });
    setPreview([]); setFiles([]); setWarnings([]);
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

  const modeHelp: Record<Mode, string> = {
    each: "Cada print é um jogador diferente (perfil aberto com atributos). Ideal para cadastrar um por um: o site lê cada imagem separadamente.",
    same: "Todos os prints (até 6) são do MESMO jogador, por exemplo visão geral + atributos + contrato. A IA junta tudo em um registro.",
    list: "Cada print mostra uma lista com vários jogadores (tela de elenco ou busca). A IA lê todos os que aparecem.",
  };

  return (
    <>
      <div className="cols side fill">
      <div className="card">
        <SubMenu title="Importar" active={sec} onSelect={pick} items={[
          { id: "each", label: "Um print por jogador" },
          { id: "same", label: "Prints do mesmo jogador" },
          { id: "list", label: "Listas de jogadores" },
          { id: "file", label: "Arquivo CSV / HTML" },
          { id: "manual", label: "Cadastro manual" },
        ]} />
      </div>
      <div className="card fillcol"><div className="scroll">
      {printSec && <div>
        <h2>{sec === "each" ? "Um print por jogador" : sec === "same" ? "Vários prints do mesmo jogador" : "Prints de listas"}</h2>
        <div className="grid2">
          <div className="field">
            <label>Adicionar como</label>
            <Select value={target} onChange={(v) => setTarget(v as Player["status"])} options={[{ value: "squad", label: "Meu elenco" }, { value: "shortlist", label: "Shortlist (alvos)" }]} />
          </div>
        </div>
        <p className="mute" style={{ marginTop: 0 }}>{modeHelp[mode]}</p>
        <div className="drop">
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
          <div style={{ marginTop: ".5rem" }}>{files.length ? `${files.length} imagem(ns) na fila` : "Selecione os prints (pode adicionar mais depois)"}</div>
          <div className="mute" style={{ fontSize: ".8rem" }}>Dica: no Windows, Win+Shift+S recorta só o perfil do jogador; depois cole com Ctrl+V nesta página.</div>
        </div>
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
        <div className="row" style={{ marginTop: ".6rem" }}>
          <button className="btn" disabled={!files.length || busy} onClick={extract}>{busy ? "Lendo…" : mode === "each" ? `Ler ${files.length || ""} print(s) com IA` : "Ler prints com IA"}</button>
          {files.length > 0 && !busy && <button className="btn ghost" onClick={() => setFiles([])}>Limpar fila</button>}
          {progress && <span className="mute">{progress}</span>}
        </div>
        <ul className="clean mute" style={{ fontSize: ".85rem" }}>
          <li>Para os atributos aparecerem, abra o perfil do jogador na aba <b>Atributos</b> (ou use a visão de atributos no elenco).</li>
          <li>Contratos, salário e valor aparecem na visão geral do jogador ou em uma visão de Contratos.</li>
          <li>Jogadores com o mesmo nome são combinados com os já cadastrados (dá para completar dados em prints diferentes).</li>
        </ul>
      </div>}

      {sec === "file" && <div>
        <h2>Arquivo CSV / HTML</h2>
        <p className="mute">Se conseguir exportar (save offline com plugin de exportação), envie aqui. Reconhece colunas em inglês, abreviações do FM (Fin, Pas, Tck…) e posições como “D (RLC)”.</p>
        <input type="file" accept=".csv,.html,.htm,.txt" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>}

      {sec === "manual" && <div>
        <h2>Cadastro manual</h2>
        <button className="btn ghost" onClick={() => setEditing({ id: uid(), name: "", positions: [], attrs: {}, status: target })}>Cadastrar jogador</button>
      </div>}

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
                  <td>{p.positions.join(", ") || <span className="err">sem posição</span>}</td>
                  <td>{p.age ?? "—"}</td>
                  <td>{Object.keys(p.attrs).length}</td>
                  <td>{p.contractExpiry ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mute" style={{ fontSize: ".85rem" }}>Revise valores duvidosos depois, clicando no jogador. Jogadores sem posição não aparecem no Planejamento.</p>
          <div className="row">
            <button className="btn" onClick={commit}>Adicionar {preview.filter((p) => p.keep).length} jogador(es)</button>
            <button className="btn ghost" onClick={() => setPreview([])}>Descartar</button>
          </div>
        </div>
      )}

      </div></div></div>

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
