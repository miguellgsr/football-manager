import { ClubColors, initialState, SaveMeta, State, uid } from "./types";

// Os saves ficam em localStorage separados por usuário (namespace). Com a nuvem ativa,
// cada alteração também é enviada ao servidor (ver lib/cloud.ts).
let NS = "guest";
export const setNamespace = (ns: string) => { NS = ns; };
export const getNamespace = () => NS;

export const syncHooks: { push: (id: string) => void; del: (id: string) => void } = { push: () => {}, del: () => {} };

export const ACCESS_KEY = "fm-access";
const IDX = () => `fm:${NS}:index`;
const key = (id: string) => `fm:${NS}:save:${id}`;
const LEGACY_IDX = "fm-saves-index";
const LEGACY_OLD = "fm-planner-v1";

export function writeIndex(m: SaveMeta[]) {
  try { localStorage.setItem(IDX(), JSON.stringify(m)); } catch {}
}
export function writeSave(id: string, s: State) {
  try { localStorage.setItem(key(id), JSON.stringify(s)); } catch {}
}

/** Traz para o usuário os saves antigos deste navegador (versões anteriores, sem login). */
export function adoptLegacy() {
  try {
    if (localStorage.getItem(IDX())) return;
    const raw = localStorage.getItem(LEGACY_IDX);
    if (raw) {
      const idx = JSON.parse(raw) as SaveMeta[];
      idx.forEach((m) => { const s = localStorage.getItem(`fm-save-${m.id}`); if (s) localStorage.setItem(key(m.id), s); });
      writeIndex(idx);
      return;
    }
    const old = localStorage.getItem(LEGACY_OLD);
    if (old) {
      const { accessCode, ...rest } = JSON.parse(old);
      const id = uid();
      writeSave(id, { ...initialState, ...rest });
      if (accessCode) localStorage.setItem(ACCESS_KEY, accessCode);
      writeIndex([{ id, name: "Meu save", club: rest.club?.name || "", createdAt: Date.now(), updatedAt: Date.now() }]);
    }
  } catch {}
}

export function listSaves(): SaveMeta[] {
  try {
    const raw = localStorage.getItem(IDX());
    if (raw) return JSON.parse(raw) as SaveMeta[];
  } catch {}
  return [];
}

export function loadState(id: string): State {
  try {
    const raw = localStorage.getItem(key(id));
    if (raw) return { ...initialState, ...JSON.parse(raw) };
  } catch {}
  return initialState;
}

export function saveState(id: string, state: State) {
  writeSave(id, state);
  const idx = listSaves();
  const i = idx.findIndex((s) => s.id === id);
  if (i >= 0) {
    idx[i] = { ...idx[i], club: state.club.name || idx[i].club, updatedAt: Date.now() };
    writeIndex(idx);
  }
  syncHooks.push(id);
}

export interface Identity { country?: string; league?: string; colors?: ClubColors }

export function createSave(name: string, club = "", state?: State, identity?: Identity): SaveMeta {
  const meta: SaveMeta = { id: uid(), name: name.trim() || "Novo save", club, ...identity, createdAt: Date.now(), updatedAt: Date.now() };
  const base = state ?? { ...initialState, club: { ...initialState.club, name: club } };
  writeSave(meta.id, base);
  writeIndex([...listSaves(), meta]);
  syncHooks.push(meta.id);
  return meta;
}

export function renameSave(id: string, name: string) {
  writeIndex(listSaves().map((s) => (s.id === id ? { ...s, name: name.trim() || s.name } : s)));
  syncHooks.push(id);
}

export function setIdentity(id: string, club: string, identity: Identity) {
  writeIndex(listSaves().map((s) => (s.id === id ? { ...s, club, ...identity } : s)));
  syncHooks.push(id);
}

export function deleteSave(id: string) {
  try { localStorage.removeItem(key(id)); } catch {}
  writeIndex(listSaves().filter((s) => s.id !== id));
  syncHooks.del(id);
}
