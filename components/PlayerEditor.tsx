"use client";
import { Select } from "./Dropdown";
import { useState } from "react";
import { ALL_POS } from "@/lib/formations";
import { ATTR_GROUPS, Player, Pos } from "@/lib/types";
import { ROLES, roleScore } from "@/lib/roles";

export default function PlayerEditor({
  player, onSave, onDelete, onClose,
}: {
  player: Player;
  onSave: (p: Player) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [p, setP] = useState<Player>(player);
  const set = (patch: Partial<Player>) => setP((x) => ({ ...x, ...patch }));
  const togglePos = (pos: Pos) =>
    set({ positions: p.positions.includes(pos) ? p.positions.filter((x) => x !== pos) : [...p.positions, pos] });

  const roleScores = ROLES.map((r) => ({ r, s: roleScore(r, p.attrs) }))
    .filter((x) => x.s !== null)
    .sort((a, b) => (b.s as number) - (a.s as number))
    .slice(0, 5);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2>{player.name ? "Editar jogador" : "Novo jogador"}</h2>
          <button className="btn ghost sm" onClick={onClose}>Fechar</button>
        </div>
        <div className="grid2">
          <div className="field"><label>Nome</label><input value={p.name} onChange={(e) => set({ name: e.target.value })} /></div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Idade</label><input type="number" value={p.age ?? ""} onChange={(e) => set({ age: e.target.value ? +e.target.value : undefined })} /></div>
            <div className="field" style={{ flex: 2 }}><label>Nacionalidade</label><input value={p.nationality ?? ""} onChange={(e) => set({ nationality: e.target.value })} /></div>
          </div>
          <div className="field"><label>Contrato até</label><input placeholder="ex.: 30/06/2028" value={p.contractExpiry ?? ""} onChange={(e) => set({ contractExpiry: e.target.value })} /></div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Salário</label><input value={p.wage ?? ""} onChange={(e) => set({ wage: e.target.value })} /></div>
            <div className="field" style={{ flex: 1 }}><label>Valor</label><input value={p.value ?? ""} onChange={(e) => set({ value: e.target.value })} /></div>
          </div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>CA (opcional)</label><input type="number" value={p.ca ?? ""} onChange={(e) => set({ ca: e.target.value ? +e.target.value : undefined })} /></div>
            <div className="field" style={{ flex: 1 }}><label>PA (opcional)</label><input type="number" value={p.pa ?? ""} onChange={(e) => set({ pa: e.target.value ? +e.target.value : undefined })} /></div>
            <div className="field" style={{ flex: 1 }}><label>Lista</label>
              <Select value={p.status} onChange={(v) => set({ status: v as Player["status"] })} options={[{ value: "squad", label: "Elenco" }, { value: "shortlist", label: "Shortlist" }]} />
            </div>
          </div>
        </div>
        <div className="field">
          <label>Posições</label>
          <div className="row">
            {ALL_POS.map((pos) => (
              <button key={pos} className={"btn sm " + (p.positions.includes(pos) ? "" : "ghost")} onClick={() => togglePos(pos)}>{pos}</button>
            ))}
          </div>
        </div>
        {ATTR_GROUPS.map((g) => (
          <div key={g.title} className="field">
            <h3>{g.title}</h3>
            <div className="attrs">
              {g.keys.map(([k, label]) => (
                <div key={k} className="row" style={{ flexWrap: "nowrap" }}>
                  <span className="mute" style={{ flex: 1, fontSize: ".8rem" }}>{label}</span>
                  <input
                    style={{ width: 56 }} type="number" min={1} max={20}
                    value={p.attrs[k] ?? ""}
                    onChange={(e) => {
                      const attrs = { ...p.attrs };
                      if (e.target.value === "") delete attrs[k]; else attrs[k] = Math.max(1, Math.min(20, +e.target.value));
                      set({ attrs });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="field"><label>Notas</label><textarea value={p.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} /></div>
        {roleScores.length > 0 && (
          <div className="field">
            <h3>Melhores funções (pelos atributos)</h3>
            <div className="row">{roleScores.map(({ r, s }) => <span key={r.id} className="tag">{r.name}: {s}</span>)}</div>
          </div>
        )}
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>{onDelete && <button className="btn danger" onClick={onDelete}>Excluir</button>}</div>
          <button className="btn" disabled={!p.name.trim()} onClick={() => onSave(p)}>Salvar</button>
        </div>
      </div>
    </div>
  );
}
