"use client";
import { useEffect, useState } from "react";
import { createSave, deleteSave, listSaves, loadState, renameSave } from "@/lib/saves";
import { initialState, SaveMeta } from "@/lib/types";
import { applyTheme } from "@/lib/theme";
import ClubPicker, { ClubChoice } from "./ClubPicker";

export default function Home({ onOpen }: { onOpen: (id: string) => void }) {
  const [saves, setSaves] = useState<SaveMeta[]>([]);
  const [name, setName] = useState("");
  const [choice, setChoice] = useState<ClubChoice>({ club: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const reload = () => setSaves(listSaves().sort((a, b) => b.updatedAt - a.updatedAt));
  useEffect(reload, []);
  useEffect(() => { applyTheme(choice.colors); return () => applyTheme(null); }, [choice.colors]);

  const create = () => {
    if (!name.trim()) return;
    const m = createSave(name, choice.club, undefined, { country: choice.country, league: choice.league, colors: choice.colors });
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
    <div className="cols c2 fill">
      <div className="card fillcol">
        <h2>Seus saves</h2>
        <p className="mute" style={{ margin: "0 0 .6rem", fontSize: ".82rem" }}>Cada save tem elenco, shortlist, táticas e conversas próprios.</p>
        <div className="scroll">
          {saves.length === 0 && <p className="mute">Nenhum save ainda. Crie o primeiro ao lado.</p>}
          {saves.map((s) => {
            const count = loadState(s.id).players.filter((p) => p.status === "squad").length;
            return (
              <div key={s.id} className="glass" style={{ padding: ".7rem .9rem", marginBottom: ".6rem", borderRadius: 16, borderLeft: `4px solid ${s.colors?.p ?? "var(--accent)"}` }}>
                {editing === s.id ? (
                  <div className="row">
                    <input style={{ width: 200 }} value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                    <button className="btn sm" onClick={() => { renameSave(s.id, editName); setEditing(null); reload(); }}>Salvar</button>
                    <button className="btn ghost sm" onClick={() => setEditing(null)}>Cancelar</button>
                  </div>
                ) : (
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div>
                      <b>{s.name}</b>
                      <div className="mute" style={{ fontSize: ".8rem" }}>
                        {s.colors && <><span className="swatch" style={{ background: s.colors.p }} /> <span className="swatch" style={{ background: s.colors.s }} /> </>}
                        {s.club ? `${s.club} · ` : ""}{count} jogadores · {fmt(s.updatedAt)}
                      </div>
                    </div>
                    <button className="btn" onClick={() => onOpen(s.id)}>Abrir</button>
                  </div>
                )}
                {editing !== s.id && (
                  <div className="row" style={{ marginTop: ".4rem" }}>
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card fillcol">
        <h2>Novo save</h2>
        <div className="scroll">
          <div className="field"><label>Nome do save</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Carreira Flamengo 2027" onKeyDown={(e) => e.key === "Enter" && create()} /></div>
          <h3>Clube do save (define as cores da interface)</h3>
          <ClubPicker value={choice} onChange={(c) => { setChoice(c); if (!name.trim() && c.club && c.league) setName(`Carreira ${c.club}`); }} />
        </div>
        <div className="row" style={{ marginTop: ".6rem" }}>
          <button className="btn" disabled={!name.trim()} onClick={create}>Criar e abrir</button>
          <label className="btn ghost" style={{ margin: 0, cursor: "pointer", color: "var(--text)", fontSize: ".9rem" }}>
            Importar backup (.json)
            <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => importSave(e.target.files?.[0])} />
          </label>
        </div>
        {err && <p className="err">{err}</p>}
      </div>
    </div>
  );
}
