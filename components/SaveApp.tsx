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

export const SAVE_VIEWS = [
  ["squad", "Starting XI"],
  ["planning", "Planning"],
  ["import", "Import"],
  ["transfers", "Transfers AI"],
  ["tactics", "Tactics AI"],
  ["extras", "Extras & Club"],
] as const;
export type SaveView = (typeof SAVE_VIEWS)[number][0];

/** Content (central area) of a save. Navigation lives in the sidebar. */
export default function SaveApp({ id, view, setView }: { id: string; view: SaveView; setView: (v: SaveView) => void }) {
  const { state, setState } = useSaveState(id);
  const [accessCode, setAccessCode] = useAccess();
  const [prefill, setPrefill] = useState("");
  const meta = listSaves().find((s) => s.id === id);
  useEffect(() => { applyTheme(meta?.colors); return () => applyTheme(null); }, [meta?.colors?.p, meta?.colors?.s]); // eslint-disable-line
  const props = { state, setState, accessCode, setAccessCode };

  return (
    <>
      {view === "squad" && <Squad {...props} goImport={() => setView("import")} />}
      {view === "planning" && <Planning {...props} askAi={(m) => { setPrefill(m); setView("transfers"); }} />}
      {view === "import" && <ImportTab {...props} />}
      {view === "transfers" && <Transfers {...props} prefill={prefill} clearPrefill={() => setPrefill("")} />}
      {view === "tactics" && <Tactics {...props} />}
      {view === "extras" && <Extras {...props} saveName={meta?.name ?? "save"} saveId={id} meta={meta} />}
    </>
  );
}
