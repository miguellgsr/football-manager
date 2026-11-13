"use client";
import { useEffect, useState } from "react";
import { authenticate, cloudAvailable, Session } from "@/lib/auth";

export default function AuthGate({ onDone }: { onDone: (s: Session) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState("");
  const [pw, setPw] = useState("");
  const [cloud, setCloud] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { cloudAvailable().then(setCloud); }, []);

  const go = async () => {
    setBusy(true); setErr("");
    try { onDone(await authenticate(mode, user, pw, !!cloud)); }
    catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <h1 style={{ fontSize: "1.8rem", textAlign: "center" }}>FM <span style={{ color: "var(--accent)" }}>Mate</span></h1>
        <p className="mute" style={{ textAlign: "center", marginTop: 0 }}>Your squad, transfers and tactics companion.</p>
        <div className="seg">
          <button className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>Log in</button>
          <button className={mode === "register" ? "on" : ""} onClick={() => setMode("register")}>Create account</button>
        </div>
        <div className="field"><label>Username</label><input value={user} onChange={(e) => setUser(e.target.value)} autoFocus autoCapitalize="none" /></div>
        <div className="field"><label>Password</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} /></div>
        {err && <p className="err" style={{ margin: ".3rem 0" }}>{err}</p>}
        <button className="btn" style={{ width: "100%", marginTop: ".4rem" }} disabled={busy || !user || !pw || cloud === null} onClick={go}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
        {cloud === false && (
          <p className="mute" style={{ fontSize: ".78rem", marginTop: ".8rem" }}>
            Local mode: your account and saves stay in this browser only. To sync across devices, the admin must connect an Upstash Redis database to the project on Vercel.
          </p>
        )}
        {cloud && <p className="mute" style={{ fontSize: ".78rem", marginTop: ".8rem" }}>Your saves are stored in the cloud and follow you on any device.</p>}
      </div>
    </div>
  );
}
