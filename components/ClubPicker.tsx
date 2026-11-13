"use client";
import { useMemo, useState } from "react";
import { CATALOG } from "@/lib/clubs";
import { ClubColors } from "@/lib/types";
import { Dropdown, Select } from "./Dropdown";

export interface ClubChoice { club: string; country?: string; league?: string; colors?: ClubColors }

export default function ClubPicker({ value, onChange }: { value: ClubChoice; onChange: (c: ClubChoice) => void }) {
  const [country, setCountry] = useState("");
  const [league, setLeague] = useState("");
  const [q, setQ] = useState("");
  const [openCt, setOpenCt] = useState("");

  const cObj = CATALOG.find((c) => c.name === country);
  const lObj = cObj?.leagues.find((l) => l.name === league);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const out: { name: string; p: string; s: string; country: string; league: string }[] = [];
    for (const c of CATALOG) for (const l of c.leagues) for (const k of l.clubs)
      if (k.name.toLowerCase().includes(t)) out.push({ ...k, country: c.name, league: l.name });
    return out.slice(0, 24);
  }, [q]);

  const pick = (k: { name: string; p: string; s: string }, c: string, l: string) =>
    onChange({ club: k.name, country: c, league: l, colors: { p: k.p, s: k.s } });

  const continents = [...new Set(CATALOG.map((c) => c.continent))];
  const sw = (p: string, s: string) => (
    <><span className="swatch" style={{ background: p }} /><span className="swatch" style={{ background: s }} /></>
  );
  const Chip = ({ k, c, l }: { k: { name: string; p: string; s: string }; c: string; l: string }) => (
    <span className={"club-pick" + (value.club === k.name && value.league === l ? " on" : "")} onClick={() => pick(k, c, l)}>
      {sw(k.p, k.s)} {k.name}
    </span>
  );

  return (
    <div>
      <div className="grid2">
        <div className="field">
          <label>País</label>
          <Dropdown label={country ? `${country}` : <span className="mute">Escolha o continente e o país</span>}>
            {(close) => continents.map((ct) => (
              <div key={ct}>
                <button type="button" className={"sel-grp" + (openCt === ct ? " open" : "")} onClick={() => setOpenCt(openCt === ct ? "" : ct)}>
                  <span>{ct}</span><span className="arrow">›</span>
                </button>
                {openCt === ct && (
                  <div className="sel-sub">
                    {CATALOG.filter((c) => c.continent === ct).map((c) => (
                      <button key={c.name} type="button" className={"sel-opt" + (country === c.name ? " on" : "")} onClick={() => { setCountry(c.name); setLeague(""); close(); }}>{c.name}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Dropdown>
        </div>
        <div className="field">
          <label>Liga</label>
          <Select disabled={!cObj} value={league} onChange={setLeague} options={(cObj?.leagues ?? []).map((l) => ({ value: l.name, label: l.name }))} />
        </div>
      </div>
      <div className="field"><label>Ou busque o clube pelo nome</label><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: Flamengo, Chelsea, Boca..." /></div>

      <div className="scroll" style={{ marginBottom: ".6rem", maxHeight: 170 }}>
        {results.map((k) => <Chip key={k.country + k.league + k.name} k={k} c={k.country} l={k.league} />)}
        {!q && lObj?.clubs.map((k) => <Chip key={k.name} k={k} c={country} l={league} />)}
        {q && results.length === 0 && <span className="mute">Nenhum clube encontrado. Use o campo manual abaixo.</span>}
      </div>

      <div className="row" style={{ alignItems: "flex-end" }}>
        <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 180 }}>
          <label>Clube (digite se não estiver na lista)</label>
          <input value={value.club} onChange={(e) => onChange({ ...value, club: e.target.value })} placeholder="Nome do clube" />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Cor principal</label>
          <input type="color" value={value.colors?.p ?? "#3ddc84"} onChange={(e) => onChange({ ...value, colors: { p: e.target.value, s: value.colors?.s ?? "#ffffff" } })} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Cor secundária</label>
          <input type="color" value={value.colors?.s ?? "#ffffff"} onChange={(e) => onChange({ ...value, colors: { p: value.colors?.p ?? "#3ddc84", s: e.target.value } })} />
        </div>
        {value.colors && <button className="btn ghost sm" onClick={() => onChange({ club: "" })}>Limpar</button>}
      </div>
      {value.colors && value.league && <p className="mute" style={{ fontSize: ".85rem" }}>{value.country} · {value.league}. Você pode ajustar as cores acima se quiser.</p>}
    </div>
  );
}
