"use client";
import { useEffect, useState } from "react";
import { initialState, State } from "./types";

const KEY = "fm-planner-v1";

export function useStore() {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    }
  }, [state, ready]);
  return { state, setState, ready };
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
}
