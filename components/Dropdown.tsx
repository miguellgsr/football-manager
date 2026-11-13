"use client";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Button that opens a "liquid glass" panel (rendered outside cards so it is not clipped). */
export function Dropdown({ label, disabled, width, children }: {
  label: ReactNode; disabled?: boolean; width?: number | string; children: (close: () => void) => ReactNode;
}) {
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number; w: number; maxH: number; up: boolean }>({ left: 0, top: 0, w: 200, maxH: 300, up: false });

  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 12;
    const up = below < 220 && r.top > below;
    setPos({ left: r.left, top: up ? r.top - 6 : r.bottom + 6, w: Math.max(r.width, 220), maxH: Math.max(160, Math.min(380, (up ? r.top : below) - 12)), up });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (!pop.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  return (
    <>
      <button ref={btn} type="button" disabled={disabled} className={"sel-btn" + (open ? " open" : "")} style={{ width: width ?? "100%" }} onClick={() => setOpen((o) => !o)}>
        <span className="sel-label">{label}</span><span className="sel-chev">⌄</span>
      </button>
      {open && createPortal(
        <div ref={pop} className="sel-pop" style={{ left: pos.left, top: pos.top, width: pos.w, maxHeight: pos.maxH, transform: pos.up ? "translateY(-100%)" : undefined }}>
          {children(() => setOpen(false))}
        </div>, document.body)}
    </>
  );
}

export interface Opt { value: string; label: string }

export function Select({ value, onChange, options, placeholder = "Choose...", disabled, width }: {
  value: string; onChange: (v: string) => void; options: Opt[]; placeholder?: string; disabled?: boolean; width?: number | string;
}) {
  const cur = options.find((o) => o.value === value);
  return (
    <Dropdown disabled={disabled} width={width} label={cur ? cur.label : <span className="mute">{placeholder}</span>}>
      {(close) => options.map((o) => (
        <button key={o.value} type="button" className={"sel-opt" + (o.value === value ? " on" : "")} onClick={() => { onChange(o.value); close(); }}>{o.label}</button>
      ))}
    </Dropdown>
  );
}
