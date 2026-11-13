import { ClubColors, initialState, SaveMeta, State, uid } from "./types";

const IDX = "fm-saves-index";
const OLD = "fm-planner-v1";
export const ACCESS_KEY = "fm-access";
const key = (id: string) => `fm-save-${id}`;

function writeIndex(m: SaveMeta[]) {
  try { localStorage.setItem(IDX, JSON.stringify(m)); } catch {}
}

export function listSaves(): SaveMeta[] {
  try {
    const raw = localStorage.getItem(IDX);
    if (raw) return JSON.parse(raw) as SaveMeta[];
  } catch {}
  // migração dos dados da versão anterior (um único save)
  try {
    const old = localStorage.getItem(OLD);
    if (old) {
      const o = JSON.parse(old);
      const { accessCode, ...rest } = o;
      const id = uid();
      localStorage.setItem(key(id), JSON.stringify({ ...initialState, ...rest }));
      if (accessCode) localStorage.setItem(ACCESS_KEY, accessCode);
      const meta: SaveMeta[] = [{ id, name: "Meu save", club: o.club?.name || "", createdAt: Date.now(), updatedAt: Date.now() }];
      writeIndex(meta);
      return meta;
    }
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
  try { localStorage.setItem(key(id), JSON.stringify(state)); } catch {}
  const idx = listSaves();
  const i = idx.findIndex((s) => s.id === id);
  if (i >= 0) {
    idx[i] = { ...idx[i], club: state.club.name || idx[i].club, updatedAt: Date.now() };
    writeIndex(idx);
  }
}

export interface Identity { country?: string; league?: string; colors?: ClubColors }

export function createSave(name: string, club = "", state?: State, identity?: Identity): SaveMeta {
  const meta: SaveMeta = { id: uid(), name: name.trim() || "Novo save", club, ...identity, createdAt: Date.now(), updatedAt: Date.now() };
  const base = state ?? { ...initialState, club: { ...initialState.club, name: club } };
  try { localStorage.setItem(key(meta.id), JSON.stringify(base)); } catch {}
  writeIndex([...listSaves(), meta]);
  return meta;
}

export function renameSave(id: string, name: string) {
  writeIndex(listSaves().map((s) => (s.id === id ? { ...s, name: name.trim() || s.name } : s)));
}

export function deleteSave(id: string) {
  try { localStorage.removeItem(key(id)); } catch {}
  writeIndex(listSaves().filter((s) => s.id !== id));
}

export function setIdentity(id: string, club: string, identity: Identity) {
  writeIndex(listSaves().map((s) => (s.id === id ? { ...s, club, ...identity } : s)));
}
