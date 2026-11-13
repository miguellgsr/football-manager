import { listSaves, loadState, syncHooks, writeIndex, writeSave } from "./saves";
import type { SaveMeta, State } from "./types";

let token: string | null = null;
const timers: Record<string, ReturnType<typeof setTimeout>> = {};
export const syncStatus = { error: "" };

const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

async function push(id: string) {
  if (!token) return;
  const meta = listSaves().find((m) => m.id === id);
  if (!meta) return;
  try {
    const r = await fetch("/api/cloud", { method: "PUT", headers: headers(), body: JSON.stringify({ meta, state: loadState(id) }) });
    syncStatus.error = r.ok ? "" : (await r.json().catch(() => ({}))).error || `Erro ${r.status}`;
  } catch (e: any) { syncStatus.error = e.message; }
}

/** Baixa os saves da nuvem (a nuvem vale quando é mais nova) e envia os que só existem aqui. */
export async function startSync(t: string) {
  token = t;
  syncHooks.push = (id) => {
    clearTimeout(timers[id]);
    timers[id] = setTimeout(() => push(id), 1200);
  };
  syncHooks.del = (id) => {
    clearTimeout(timers[id]);
    fetch("/api/cloud", { method: "DELETE", headers: headers(), body: JSON.stringify({ id }) }).catch(() => {});
  };
  try {
    const r = await fetch("/api/cloud", { headers: headers(), cache: "no-store" });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `Erro ${r.status}`);
    const remote: { meta: SaveMeta; state: State }[] = (await r.json()).saves ?? [];
    const local = listSaves();
    const merged = [...local];
    for (const { meta, state } of remote) {
      const i = merged.findIndex((m) => m.id === meta.id);
      if (i < 0) { merged.push(meta); writeSave(meta.id, state); }
      else if (meta.updatedAt > merged[i].updatedAt) { merged[i] = meta; writeSave(meta.id, state); }
      else if (meta.updatedAt < merged[i].updatedAt) push(meta.id);
    }
    writeIndex(merged);
    for (const m of local) if (!remote.some((x) => x.meta.id === m.id)) push(m.id);
    syncStatus.error = "";
  } catch (e: any) { syncStatus.error = "Sem sincronização: " + e.message; }
}

export function stopSync() {
  token = null;
  syncHooks.push = () => {};
  syncHooks.del = () => {};
}
