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

function hsl(hex: string): [number, number, number] {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const sat = d / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return [h, sat, l];
}
function fromHsl(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return "#" + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
}
/** Cor de fundo: mantém o matiz do clube, mas escurece para o texto claro ficar legível. */
function bgTone(hex: string, l: number, fallbackHue?: number) {
  const [h, s] = hsl(hex);
  if (s < 0.08) return fallbackHue == null ? fromHsl(0, 0, Math.min(l, 0.2)) : fromHsl(fallbackHue, 0.4, Math.min(l, 0.22));
  return fromHsl(h, Math.max(0.55, Math.min(s, 0.95)), l);
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
    "--bg-a": bgTone(c.p, 0.42, hsl(c.s)[0]),
    "--bg-b": bgTone(c.s, 0.4, hsl(c.p)[0]),
    "--glass-tint": bgTone(accent, 0.6),
    "--shirt-ink": lum(c.p) > 0.45 ? "#111111" : "#ffffff",
  };
}

const KEYS = ["--accent", "--accent2", "--on-accent", "--club-p", "--club-s", "--bg-a", "--bg-b", "--glass-tint", "--shirt-ink"];

export function applyTheme(c?: ClubColors | null) {
  const el = document.documentElement;
  KEYS.forEach((k) => el.style.removeProperty(k));
  if (!c) return;
  const v = themeVars(c);
  Object.entries(v).forEach(([k, val]) => el.style.setProperty(k, val));
}
