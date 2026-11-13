import { ClubColors } from "./types";

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lum(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function mix(a: string, b: string, t: number) {
  const x = rgb(a), y = rgb(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

/** Gera as variáveis de CSS do tema a partir das cores do clube (garante contraste no fundo escuro). */
export function themeVars(c: ClubColors): Record<string, string> {
  let accent = c.p;
  if (lum(accent) < 0.12) accent = lum(c.s) >= 0.12 && lum(c.s) < 0.95 ? c.s : mix(c.p, "#ffffff", 0.55);
  if (lum(accent) < 0.12) accent = mix(accent, "#ffffff", 0.5);
  const accent2 = mix(accent, "#000000", 0.18);
  return {
    "--accent": accent,
    "--accent2": accent2,
    "--on-accent": lum(accent2) > 0.4 ? "#10141a" : "#ffffff",
    "--club-p": c.p,
    "--club-s": c.s,
  };
}

const KEYS = ["--accent", "--accent2", "--on-accent", "--club-p", "--club-s"];

export function applyTheme(c?: ClubColors | null) {
  const el = document.documentElement;
  KEYS.forEach((k) => el.style.removeProperty(k));
  if (!c) return;
  const v = themeVars(c);
  Object.entries(v).forEach(([k, val]) => el.style.setProperty(k, val));
}
