"use client";
import { useMemo, useState } from "react";
import { Select } from "./Dropdown";
import { ATTR_GROUPS, Player, Pos } from "@/lib/types";
import { ATTR_NAME, bestFor, POS_LABEL, priorityAttrs, rolesFor } from "@/lib/fmroles";
import { scoreClass } from "./Squad";

const POS_LIST: Pos[] = ["GK", "CB", "RB", "LB", "RWB", "LWB", "DM", "CM", "RM", "LM", "AM", "RW", "LW", "ST"];
const COL_A = "var(--accent)";
const COL_B = "#6aa7ff";

/** Atributos que mais importam numa posição: os mais frequentes entre os atributos-chave de todas as funções dela. */
function keyAttrs(pos: Pos): string[] {
  const count = new Map<string, number>();
  for (const wide of pos === "CB" ? [false, true] : [false]) {
    const rs = rolesFor(pos, wide);
    (["ip", "oop"] as const).forEach((ph) => rs[ph].forEach((r) => priorityAttrs(pos, wide, ph, r).forEach((k, i) => count.set(k, (count.get(k) ?? 0) + (4 - i)))));
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k]) => k);
}

function posScore(p: Player, pos: Pos) {
  const ip = bestFor(p, pos, false, "ip"), oop = bestFor(p, pos, false, "oop");
  const sc = [ip?.score, oop?.score].filter((x): x is number => x != null);
  return { ip, oop, total: sc.length ? Math.round(sc.reduce((a, b) => a + b, 0) / sc.length) : null };
}

export default function Compare({ players }: { players: Player[] }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [posSel, setPosSel] = useState<Pos | "">("");
  const pa = players.find((p) => p.id === a), pb = players.find((p) => p.id === b);
  const pos: Pos = posSel || pa?.positions.find((x) => pb?.positions.includes(x)) || pa?.positions[0] || pb?.positions[0] || "CM";
  const keys = useMemo(() => keyAttrs(pos), [pos]);

  const ready = pa && pb;
  const sa = ready ? posScore(pa, pos) : null, sb = ready ? posScore(pb, pos) : null;

  // placar por atributo (só atributos-chave da posição valem para o vencedor)
  const tally = useMemo(() => {
    if (!ready) return null;
    let wa = 0, wb = 0, tie = 0, n = 0;
    for (const k of keys) {
      const x = pa.attrs[k], y = pb.attrs[k];
      if (x === undefined || y === undefined) continue;
      n++;
      if (x > y) wa++; else if (y > x) wb++; else tie++;
    }
    return { wa, wb, tie, n };
  }, [pa, pb, keys]); // eslint-disable-line

  const winner = useMemo(() => {
    if (!ready || !sa || !sb || sa.total == null || sb.total == null) return null;
    if (sa.total === sb.total) return { who: "tie" as const, margin: 0 };
    return { who: sa.total > sb.total ? ("a" as const) : ("b" as const), margin: Math.abs(sa.total - sb.total) };
  }, [pa, pb, pos]); // eslint-disable-line

  const rowsFor = (list: [string, string][]) => list.filter(([k]) => pa?.attrs[k] !== undefined || pb?.attrs[k] !== undefined);
  const bar = (k: string, label: string) => {
    const x = pa?.attrs[k], y = pb?.attrs[k];
    const win = x !== undefined && y !== undefined ? (x > y ? "a" : y > x ? "b" : "t") : "";
    return (
      <div key={k} className="cmp-row">
        <span className={"cmp-val " + (win === "a" ? "w" : "")}>{x ?? "—"}</span>
        <div className="cmp-half l"><i style={{ width: ((x ?? 0) / 20) * 100 + "%", background: COL_A, opacity: win === "b" ? 0.4 : 1 }} /></div>
        <span className="cmp-lab">{keys.includes(k) && <b title="Key attribute for this position" style={{ color: "var(--accent2)" }}>★ </b>}{label}</span>
        <div className="cmp-half r"><i style={{ width: ((y ?? 0) / 20) * 100 + "%", background: COL_B, opacity: win === "a" ? 0.4 : 1 }} /></div>
        <span className={"cmp-val " + (win === "b" ? "w" : "")}>{y ?? "—"}</span>
      </div>
    );
  };

  const opts = players.map((p) => ({ value: p.id, label: p.name + (p.status === "shortlist" ? " (shortlist)" : "") }));
  const keyList: [string, string][] = keys.map((k) => [k, ATTR_NAME[k]]);

  return (
    <div>
      <h2>Compare players</h2>
      <div className="row" style={{ marginBottom: ".7rem", flexWrap: "wrap" }}>
        <Select width={220} value={a} onChange={setA} placeholder="Player A" options={opts} />
        <span className="mute">vs</span>
        <Select width={220} value={b} onChange={setB} placeholder="Player B" options={opts} />
        <Select width={250} value={pos} onChange={(v) => setPosSel(v as Pos)} options={POS_LIST.map((x) => ({ value: x, label: POS_LABEL[x] }))} />
      </div>

      {!ready && <p className="mute">Pick two players and the position you want to compare them in.</p>}

      {ready && sa && sb && (
        <>
          <div className="cmp-win">
            <div className={"cmp-side " + (winner?.who === "a" ? "win" : "")} style={{ borderColor: winner?.who === "a" ? COL_A : undefined }}>
              <div className="mute" style={{ fontSize: ".75rem" }}>{winner?.who === "a" ? "🏆 Winner" : "Player A"}</div>
              <h3 style={{ margin: ".1rem 0", color: COL_A }}>{pa.name}</h3>
              <span className={"score " + scoreClass(sa.total)}>{sa.total ?? "?"}</span>
              <div className="mute" style={{ fontSize: ".78rem", marginTop: ".3rem" }}>
                With ball: {sa.ip ? `${sa.ip.role} (${sa.ip.score})` : "—"}<br />Without ball: {sa.oop ? `${sa.oop.role} (${sa.oop.score})` : "—"}
              </div>
            </div>
            <div className="cmp-mid">
              <div style={{ fontSize: ".75rem" }} className="mute">{pos}</div>
              {winner?.who === "tie" && <b>Draw</b>}
              {winner && winner.who !== "tie" && <b>+{winner.margin}</b>}
              {!winner && <span className="mute" style={{ fontSize: ".75rem" }}>needs attributes</span>}
              {tally && tally.n > 0 && <div className="mute" style={{ fontSize: ".72rem", marginTop: ".3rem" }}>Key attributes<br /><b style={{ color: COL_A }}>{tally.wa}</b> · {tally.tie} · <b style={{ color: COL_B }}>{tally.wb}</b></div>}
            </div>
            <div className={"cmp-side " + (winner?.who === "b" ? "win" : "")} style={{ borderColor: winner?.who === "b" ? COL_B : undefined }}>
              <div className="mute" style={{ fontSize: ".75rem" }}>{winner?.who === "b" ? "🏆 Winner" : "Player B"}</div>
              <h3 style={{ margin: ".1rem 0", color: COL_B }}>{pb.name}</h3>
              <span className={"score " + scoreClass(sb.total)}>{sb.total ?? "?"}</span>
              <div className="mute" style={{ fontSize: ".78rem", marginTop: ".3rem" }}>
                With ball: {sb.ip ? `${sb.ip.role} (${sb.ip.score})` : "—"}<br />Without ball: {sb.oop ? `${sb.oop.role} (${sb.oop.score})` : "—"}
              </div>
            </div>
          </div>
          <p className="mute" style={{ fontSize: ".78rem" }}>
            Score at {POS_LABEL[pos]}: average of each player's best role with and without the ball (weighted by that role's key attributes). {pa.positions.includes(pos) ? "" : `${pa.name} is not a natural ${pos}. `}{pb.positions.includes(pos) ? "" : `${pb.name} is not a natural ${pos}.`}
          </p>

          <h3>Key attributes for {pos}</h3>
          <div className="cmp-chart">{rowsFor(keyList).map(([k, l]) => bar(k, l))}</div>
          {ATTR_GROUPS.map((g) => {
            const rows = rowsFor(g.keys.filter(([k]) => !keys.includes(k)));
            if (!rows.length || (g.title === "Goalkeeping" && pos !== "GK" && !rows.some(([k]) => (pa.attrs[k] ?? 0) > 5 || (pb.attrs[k] ?? 0) > 5))) return null;
            return <div key={g.title}><h3>{g.title}</h3><div className="cmp-chart">{rows.map(([k, l]) => bar(k, l))}</div></div>;
          })}
        </>
      )}
    </div>
  );
}
