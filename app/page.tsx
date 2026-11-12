"use client";
import { useState } from "react";
import { useStore } from "@/lib/client";
import Squad from "@/components/Squad";
import ImportTab from "@/components/ImportTab";
import Transfers from "@/components/Transfers";
import Tactics from "@/components/Tactics";
import Extras from "@/components/Extras";

const TABS = [
  ["squad", "Elenco"],
  ["import", "Importar"],
  ["transfers", "Transferências IA"],
  ["tactics", "Táticas IA"],
  ["extras", "Extras & Clube"],
] as const;

export default function Home() {
  const { state, setState, ready } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("squad");
  if (!ready) return null;
  const props = { state, setState };
  return (
    <>
      <header className="top">
        <div className="brand">FM <span>Planner</span>{state.club.name ? <span className="mute"> · {state.club.name}</span> : null}</div>
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={"tab" + (tab === id ? " on" : "")} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        <div className="mute" style={{ marginLeft: "auto" }}>{state.players.filter((p) => p.status === "squad").length} jogadores no elenco</div>
      </header>
      <main>
        {tab === "squad" && <Squad {...props} goImport={() => setTab("import")} />}
        {tab === "import" && <ImportTab {...props} />}
        {tab === "transfers" && <Transfers {...props} />}
        {tab === "tactics" && <Tactics {...props} />}
        {tab === "extras" && <Extras {...props} />}
      </main>
    </>
  );
}
