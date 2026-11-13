"use client";
import { useEffect, useState } from "react";
import { initialState, State } from "./types";
import { ACCESS_KEY, loadState, saveState } from "./saves";

/** Estado de UM save. O componente que usa isso deve ser remontado (key={id}) ao trocar de save. */
export function useSaveState(id: string) {
  const [state, setState] = useState<State>(() => loadState(id));
  useEffect(() => { saveState(id, state); }, [id, state]);
  return { state, setState };
}

/** Código de acesso das rotas de IA: único para todos os saves deste navegador. */
export function useAccess(): [string, (v: string) => void] {
  const [code, setCode] = useState("");
  useEffect(() => {
    try { setCode(localStorage.getItem(ACCESS_KEY) || ""); } catch {}
  }, []);
  const set = (v: string) => {
    setCode(v);
    try { localStorage.setItem(ACCESS_KEY, v); } catch {}
  };
  return [code, set];
}

export async function callApi<T = any>(path: string, body: unknown, accessCode: string): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-access-code": accessCode },
    body: JSON.stringify(body),
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.error || `Erro ${res.status}`);
  return data as T;
}

export interface Props {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  accessCode: string;
  setAccessCode: (v: string) => void;
}

export { initialState };
