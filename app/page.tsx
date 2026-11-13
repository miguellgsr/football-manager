"use client";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import Home from "@/components/Home";
import SaveApp from "@/components/SaveApp";
import Sidebar, { View } from "@/components/Sidebar";
import { enter, loadSession, logout, Session } from "@/lib/auth";
import { listSaves } from "@/lib/saves";
import { applyTheme } from "@/lib/theme";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [saveId, setSaveId] = useState<string | null>(null);
  const [view, setView] = useState<View>("home");

  const start = async (s: Session) => { await enter(s); setSession(s); };

  useEffect(() => {
    const s = loadSession();
    (s ? start(s) : Promise.resolve()).then(() => {
      if (!s) return;
      try {
        let n = JSON.parse(localStorage.getItem("fm-nav") || "null");
        const h = location.hash.slice(1).split("/");
        if (h.length === 2 && h[0]) n = { saveId: h[0], view: h[1] };
        const known = listSaves();
        if (n?.saveId && (known.length === 0 || known.some((x) => x.id === n.saveId))) { setSaveId(n.saveId); setView(n.view || "squad"); }
      } catch {}
    }).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !session) return;
    try { localStorage.setItem("fm-nav", JSON.stringify(view === "home" ? {} : { saveId, view })); } catch {}
    try { history.replaceState(null, "", view === "home" || !saveId ? location.pathname : `#${saveId}/${view}`); } catch {}
  }, [ready, session, saveId, view]);

  if (!ready) return null;
  if (!session) return <AuthGate onDone={start} />;

  const save = saveId ? listSaves().find((s) => s.id === saveId) ?? null : null;
  const open = (id: string) => { setSaveId(id); setView("squad"); };
  const goHome = () => { setView("home"); applyTheme(null); };

  return (
    <div className="shell">
      <Sidebar
        user={session.user}
        save={save}
        view={view}
        onView={(v) => (v === "home" ? goHome() : setView(v))}
        onLogout={() => { logout(); applyTheme(null); setSession(null); setSaveId(null); setView("home"); }}
      />
      <div className="view">
        {view === "home" || !saveId
          ? <Home onOpen={open} />
          : <SaveApp key={saveId} id={saveId} view={view} setView={setView} />}
      </div>
    </div>
  );
}
