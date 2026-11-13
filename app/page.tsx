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
    (s ? start(s) : Promise.resolve()).finally(() => setReady(true));
  }, []);

  // brilho especular do liquid glass acompanha o ponteiro
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".card, .sidebar, .modal, .auth-card") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
      el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

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
