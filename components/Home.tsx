"use client";
import { useEffect, useState } from "react";
import { createSave, deleteSave, listSaves, loadState, renameSave } from "@/lib/saves";
import { initialState, SaveMeta } from "@/lib/types";

export default function Home({ onOpen }: { onOpen: (id: string) => void }) {
  const [saves, setSaves] = useState<SaveMeta[]>([]);
  const [name, setName] = useState("");
  const [club, setClub] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const reload = () => setSaves(listSaves().sort((a, b) => b.updatedAt - a.updatedAt));
  useEffect(reload, []);

  const create = () => {
    if (!name.trim()) return;
    const m = createSave(name, club);
    onOpen(m.id);
  };

  const exportSave = (id: string, n: string) => {
    const blob = new Blob([JSON.stringify(loadState(id), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fm-planner-${n.replace(/\W+/g, "-").toLowerCase()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importSave = async (f?: File) => {
    if (!f) return;
    setErr("");
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.players)) throw new Error();
      const m = createSave(f.name.replace(/\.json$/i, "").replace(/^fm-planner-/, "") || "Save importado", data.club?.name || "", { ...initialState, ...data });
      onOpen(m.id);
    } catch { setErr("Arquivo de backup inválido."); }
  };

  const fmt = (t: number) => new Date(t).toLocaleDateString("pt-BR");

  return (
    <main style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: "1.8rem", marginTop: "2rem" }}>FM <span style={{ color: "var(--accent)" }}>Planner</span></h1>
      <p className="mute">Escolha o save que você quer trabalhar. Cada save tem elenco, shortlist, táticas e conversas próprios, sem interferir nos outros.</p>

      <div className="card">
        <h2>Seus saves</h2>
        {saves.length === 0 && <p className="mute">Nenhum save ainda. Crie o primeiro abaixo.</p>}
        {saves.map((s) => {
          const count = loadState(s.id).players.filter((p) => p.status === "squad").length;
          return (
            <div key={s.id} className="row" style={{ justifyContent: "space-between", padding: ".7rem 0", borderTop: "1px solid var(--line)" }}>
              <div style={{ minWidth: 220 }}>
                {editing === s.id ? (
                  <div className="row">
                    <input style={{ width: 220 }} value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                    <button className="btn sm" onClick={() => { renameSave(s.id, editName); setEditing(null); reload(); }}>Salvar</button>
                    <button className="btn ghost sm" onClick={() => setEditing(null)}>Cancelar</button>
                  </div>
                ) : (
                  <>
                    <b>{s.name}</b>
                    <div className="mute" style={{ fontSize: ".85rem" }}>{s.club ? `${s.club} · ` : ""}{count} jogadores · atualizado em {fmt(s.updatedAt)}</div>
                  </>
                )}
              </div>
              <div className="row">
                <button className="btn" onClick={() => onOpen(s.id)}>Abrir</button>
                <button className="btn ghost sm" onClick={() => { setEditing(s.id); setEditName(s.name); }}>Renomear</button>
                <button className="btn ghost sm" onClick={() => exportSave(s.id, s.name)}>Backup</button>
                {confirmDel === s.id ? (
                  <>
                    <button className="btn danger sm" onClick={() => { deleteSave(s.id); setConfirmDel(null); reload(); }}>Confirmar exclusão</button>
                    <button className="btn ghost sm" onClick={() => setConfirmDel(null)}>Cancelar</button>
                  </>
                ) : (
                  <button className="btn danger sm" onClick={() => setConfirmDel(s.id)}>Excluir</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2>Novo save</h2>
        <div className="grid2">
          <div className="field"><label>Nome do save</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Carreira Flamengo 2027" onKeyDown={(e) => e.key === "Enter" && create()} /></div>
          <div className="field"><label>Clube (opcional)</label><input value={club} onChange={(e) => setClub(e.target.value)} placeholder="Ex.: Flamengo" onKeyDown={(e) => e.key === "Enter" && create()} /></div>
        </div>
        <div className="row">
          <button className="btn" disabled={!name.trim()} onClick={create}>Criar e abrir</button>
          <label className="btn ghost" style={{ margin: 0, cursor: "pointer", color: "var(--text)", fontSize: "1rem" }}>
            Importar backup (.json)
            <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => importSave(e.target.files?.[0])} />
          </label>
        </div>
        {err && <p className="err">{err}</p>}
      </div>

      <p className="mute" style={{ fontSize: ".85rem" }}>Os saves ficam guardados neste navegador. Para usar em outro aparelho, exporte o backup e importe lá.</p>
    </main>
  );
}
