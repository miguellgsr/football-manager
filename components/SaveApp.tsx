"use client";
import { useEffect, useState } from "react";
import { applyTheme } from "@/lib/theme";
import { useAccess, useSaveState } from "@/lib/client";
import { listSaves } from "@/lib/saves";
import Squad from "./Squad";
import Planning from "./Planning";
import ImportTab from "./ImportTab";
import Transfers from "./Transfers";
import Tactics from "./Tactics";
import Extras from "./Extras";

const TABS = [
  ["squad", "Time titular"],
  ["planning", "Planejamento"],
  ["import", "Importar"],
  ["transfers", "Transferências IA"],
  ["tactics", "Táticas IA"],
  ["extras", "Extras & Clube"],
] as const;
type Tab = (typeof TABS)[number][0];

export default function SaveApp({ id, onExit }: { id: string; onExit: () => void }) {
  const { state, setState } = useSaveState(id);
  const [accessCode, setAccessCode] = useAccess();
  const [tab, setTab] = useState<Tab>("squad");
  const [prefill, setPrefill] = useState("");
  const meta = listSaves().find((s) => s.id === id);
  useEffect(() => { applyTheme(meta?.colors); return () => applyTheme(null); }, [meta?.colors?.p, meta?.colors?.s]);
  const props = { state, setState, accessCode, setAccessCode };

  return (
    <>
      <header className="top">
        <div className="brand">FM <span>Mate</span></div>
        <button className="btn ghost sm" onClick={onExit} title="Voltar para a lista de saves">⇄ {meta?.name ?? "Save"}{state.club.name ? ` · ${state.club.name}` : ""}</button>
        <nav className="tabs">
          {TABS.map(([tid, label]) => (
            <button key={tid} className={"tab" + (tab === tid ? " on" : "")} onClick={() => setTab(tid)}>{label}</button>
          ))}
        </nav>
        <div className="mute" style={{ marginLeft: "auto" }}>{state.players.filter((p) => p.status === "squad").length} jogadores</div>
      </header>
      <main>
        {tab === "squad" && <Squad {...props} goImport={() => setTab("import")} />}
        {tab === "planning" && <Planning {...props} askAi={(m) => { setPrefill(m); setTab("transfers"); }} />}
        {tab === "import" && <ImportTab {...props} />}
        {tab === "transfers" && <Transfers {...props} prefill={prefill} clearPrefill={() => setPrefill("")} />}
        {tab === "tactics" && <Tactics {...props} />}
        {tab === "extras" && <Extras {...props} saveName={meta?.name ?? "save"} saveId={id} meta={meta} />}
      </main>
    </>
  );
}
