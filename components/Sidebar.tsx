"use client";
import SubMenu from "./SubMenu";
import { SAVE_VIEWS } from "./SaveApp";
import type { SaveMeta } from "@/lib/types";

export type View = "home" | (typeof SAVE_VIEWS)[number][0];

export default function Sidebar({ user, save, view, onView, onLogout }: {
  user: string; save: SaveMeta | null; view: View; onView: (v: View) => void; onLogout: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="logo">FM <span>Mate</span></div>
      <div className="stripe" />
      <SubMenu title="Menu" items={[{ id: "home", label: "Home" }]} active={view} onSelect={(id) => onView(id as View)} />
      {save ? (
        <>
          <div className="sub-sep" />
          <SubMenu
            title={save.club || save.name}
            onBack={() => onView("home")}
            active={view}
            onSelect={(id) => onView(id as View)}
            items={SAVE_VIEWS.map(([id, label]) => ({ id, label }))}
          />
        </>
      ) : (
        <p className="mute" style={{ fontSize: ".8rem", padding: ".8rem .5rem" }}>Open a save from Home to see planning, import, transfers and tactics.</p>
      )}
      <div className="sub-foot">
        <div className="sub-sep" />
        <div className="userchip">
          <span className="avatar">{user[0]?.toUpperCase()}</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{user}</span>
          <button className="btn ghost sm" onClick={onLogout}>Log out</button>
        </div>
      </div>
    </aside>
  );
}
