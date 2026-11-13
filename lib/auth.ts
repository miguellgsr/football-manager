import { adoptLegacy, setNamespace } from "./saves";
import { startSync, stopSync } from "./cloud";

export interface Session { user: string; token: string | null }
const SESSION_KEY = "fm-session";
const USERS_KEY = "fm-local-users";

export const loadSession = (): Session | null => {
  try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
};
const saveSession = (s: Session | null) => {
  try { s ? localStorage.setItem(SESSION_KEY, JSON.stringify(s)) : localStorage.removeItem(SESSION_KEY); } catch {}
};

export async function cloudAvailable(): Promise<boolean> {
  try { const r = await fetch("/api/auth", { cache: "no-store" }); return !!(await r.json()).cloud; } catch { return false; }
}

async function sha(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const localUsers = (): Record<string, { salt: string; hash: string }> => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); } catch { return {}; }
};

/** Entra ou cria a conta. Com nuvem: valida no servidor e sincroniza os saves. Sem nuvem: conta local deste navegador. */
export async function authenticate(mode: "login" | "register", username: string, password: string, cloud: boolean): Promise<Session> {
  const u = username.trim().toLowerCase();
  if (!/^[a-z0-9_.-]{3,24}$/.test(u)) throw new Error("Usuário: 3 a 24 caracteres (letras, números, . _ -).");
  if (password.length < 6) throw new Error("A senha precisa ter ao menos 6 caracteres.");
  let session: Session;
  if (cloud) {
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, username: u, password }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `Erro ${r.status}`);
    session = { user: d.user, token: d.token };
  } else {
    const users = localUsers();
    const rec = users[u];
    if (mode === "register") {
      if (rec) throw new Error("Esse usuário já existe neste navegador.");
      const salt = crypto.randomUUID();
      users[u] = { salt, hash: await sha(salt + password) };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } else if (!rec || rec.hash !== (await sha(rec.salt + password))) throw new Error("Usuário ou senha incorretos.");
    session = { user: u, token: null };
  }
  saveSession(session);
  return session;
}

/** Prepara o armazenamento do usuário (e inicia a sincronização, se houver nuvem). */
export async function enter(s: Session) {
  setNamespace(s.user);
  adoptLegacy();
  if (s.token) await startSync(s.token);
}

export function logout() {
  stopSync();
  saveSession(null);
  setNamespace("guest");
}
