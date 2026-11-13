"use client";
import type { Pos } from "@/lib/types";

export const roleClass = (pos: Pos) =>
  pos === "GK" ? "r-gk" : ["CB", "RB", "LB"].includes(pos) ? "r-def" : ["RWB", "LWB"].includes(pos) ? "r-wb"
  : ["DM", "CM", "RM", "LM"].includes(pos) ? "r-mid" : pos === "AM" ? "r-am" : "r-att";

/** Pitch markings (translucent white lines), in the style of the FM tactics screen. */
export function PitchLines() {
  const st = { stroke: "rgba(255,255,255,.55)", strokeWidth: 0.5, fill: "none" } as const;
  return (
    <svg className="lines" viewBox="0 0 100 117" preserveAspectRatio="none">
      <rect x="3" y="3" width="94" height="111" {...st} />
      <line x1="3" y1="58.5" x2="97" y2="58.5" {...st} />
      <circle cx="50" cy="58.5" r="10" {...st} />
      <circle cx="50" cy="58.5" r="0.9" fill="rgba(255,255,255,.6)" />
      <rect x="22" y="3" width="56" height="17" {...st} />
      <rect x="36" y="3" width="28" height="7" {...st} />
      <rect x="22" y="97" width="56" height="17" {...st} />
      <rect x="36" y="107" width="28" height="7" {...st} />
      <path d="M40 20 A10 10 0 0 0 60 20" {...st} />
      <path d="M40 97 A10 10 0 0 1 60 97" {...st} />
    </svg>
  );
}

export function Stars({ score }: { score: number | null | undefined }) {
  const v = score == null ? 0 : Math.round((score / 20) * 2) / 2;
  return (
    <div className="stars">
      {[0, 1, 2, 3, 4].map((i) => {
        const full = v >= i + 1, half = !full && v >= i + 0.5;
        return half
          ? <span key={i} style={{ background: "linear-gradient(90deg,#f6c744 50%,rgba(255,255,255,.28) 50%)", WebkitBackgroundClip: "text", color: "transparent" }}>★</span>
          : full ? <span key={i}>★</span> : <i key={i}>★</i>;
      })}
    </div>
  );
}

export function Shirt({ n }: { n: number }) {
  return (
    <svg className="shirt" viewBox="0 0 40 34">
      <path d="M13 2 L4 7 L1 15 L7 18 L10 14 L10 32 L30 32 L30 14 L33 18 L39 15 L36 7 L27 2 C25 6 15 6 13 2Z" style={{ fill: "var(--club-p)", stroke: "var(--club-s)" }} strokeWidth="1.6" strokeLinejoin="round" />
      <text x="20" y="23" textAnchor="middle" fontSize="13" fontWeight="800" style={{ fill: "var(--shirt-ink)" }}>{n}</text>
    </svg>
  );
}
