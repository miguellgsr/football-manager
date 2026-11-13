"use client";

export interface SubItem { id: string; label: string; disabled?: boolean }

/** Vertical menu with a "↩" title and items, in the reference style. */
export default function SubMenu({ title, onBack, items, active, onSelect, className }: {
  title: string; onBack?: () => void; items: SubItem[]; active: string; onSelect: (id: string) => void; className?: string;
}) {
  return (
    <div className={"sub " + (className ?? "")}>
      <button className="sub-title" onClick={onBack} style={{ cursor: onBack ? "pointer" : "default" }}>
        <span style={{ fontSize: "1.1rem" }}>↩</span> {title}
      </button>
      {items.map((it) => (
        <button key={it.id} disabled={it.disabled} className={"sub-item" + (active === it.id ? " on" : "")} onClick={() => onSelect(it.id)} style={it.disabled ? { opacity: .4, cursor: "not-allowed" } : undefined}>
          {it.label}
        </button>
      ))}
    </div>
  );
}
