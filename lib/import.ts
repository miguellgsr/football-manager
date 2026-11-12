import { ALL_ATTR_KEYS, Attrs, Player, Pos, uid } from "./types";

/* ---------- Posições ---------- */

export function parsePositions(raw: string): Pos[] {
  const out = new Set<Pos>();
  const valid = new Set(["GK", "RB", "CB", "LB", "RWB", "LWB", "DM", "RM", "CM", "LM", "RW", "AM", "LW", "ST"]);
  for (const tokenRaw of raw.split(/[,/]/)) {
    const t = tokenRaw.trim().toUpperCase();
    if (!t) continue;
    if (valid.has(t)) { out.add(t as Pos); continue; }
    const m = t.match(/^(GK|D|WB|DM|M|AM|ST)\s*(?:\(([RLC]+)\))?$/);
    if (!m) continue;
    const [, g, sides0] = m;
    const sides = sides0 || (g === "WB" ? "" : "C");
    if (g === "GK") out.add("GK");
    else if (g === "DM") out.add("DM");
    else if (g === "ST") out.add("ST");
    else if (g === "D") {
      if (sides.includes("R")) out.add("RB");
      if (sides.includes("L")) out.add("LB");
      if (sides.includes("C")) out.add("CB");
    } else if (g === "WB") {
      if (sides.includes("R")) out.add("RWB");
      if (sides.includes("L")) out.add("LWB");
    } else if (g === "M") {
      if (sides.includes("R")) out.add("RM");
      if (sides.includes("L")) out.add("LM");
      if (sides.includes("C")) out.add("CM");
    } else if (g === "AM") {
      if (sides.includes("R")) out.add("RW");
      if (sides.includes("L")) out.add("LW");
      if (sides.includes("C")) out.add("AM");
    }
  }
  return Array.from(out);
}

/* ---------- CSV / HTML ---------- */

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

const ABBR: Record<string, string> = {
  cor: "corners", cro: "crossing", dri: "dribbling", fin: "finishing", fir: "firstTouch", fre: "freeKicks",
  hea: "heading", lon: "longShots", lth: "longThrows", mar: "marking", pas: "passing", pen: "penaltyTaking",
  tck: "tackling", tec: "technique", agg: "aggression", ant: "anticipation", bra: "bravery", cmp: "composure",
  cnt: "concentration", dec: "decisions", det: "determination", fla: "flair", ldr: "leadership", otb: "offTheBall",
  pos: "positioning", tea: "teamwork", vis: "vision", wor: "workRate", acc: "acceleration", agi: "agility",
  bal: "balance", jum: "jumpingReach", pac: "pace", sta: "stamina", str: "strength",
  aer: "aerialReach", cmd: "commandOfArea", com: "communication", ecc: "eccentricity", han: "handling",
  kic: "kicking", "1v1": "oneOnOnes", ref: "reflexes", tro: "rushingOut", pun: "punching", thr: "throwing",
};

const FIELD_ALIASES: Record<string, string[]> = {
  name: ["name", "nome", "player", "jogador"],
  age: ["age", "idade"],
  position: ["position", "posicao", "pos", "positions", "posicoes"],
  nationality: ["nationality", "nacionalidade"],
  club: ["club", "clube", "team", "time"],
  contractExpiry: ["expires", "expiry", "contractexpires", "contractexpiry", "contrato", "contract", "expira", "vencimento"],
  wage: ["wage", "salary", "salario", "salarios"],
  value: ["value", "transfervalue", "valor", "valordetransferencia"],
  ca: ["ca", "currentability"],
  pa: ["pa", "potentialability"],
};

const ATTR_LOOKUP: Record<string, string> = {};
for (const k of ALL_ATTR_KEYS) ATTR_LOOKUP[norm(k)] = k;
for (const [a, k] of Object.entries(ABBR)) ATTR_LOOKUP[norm(a)] = k;

function toNum(v: string): number | undefined {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function rowsToPlayers(headers: string[], rows: string[][]): Player[] {
  const players: Player[] = [];
  const hn = headers.map(norm);
  const fieldIdx: Record<string, number> = {};
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const i = hn.findIndex((h) => aliases.includes(h));
    if (i >= 0) fieldIdx[field] = i;
  }
  // "Nat" é ambíguo: nacionalidade ou condição natural. Decide por valor.
  const natIdx = hn.indexOf("nat");
  for (const row of rows) {
    const name = fieldIdx.name !== undefined ? row[fieldIdx.name]?.trim() : "";
    if (!name) continue;
    const attrs: Attrs = {};
    hn.forEach((h, i) => {
      const key = ATTR_LOOKUP[h];
      if (!key || i === natIdx) return;
      const n = toNum(row[i] ?? "");
      if (n !== undefined && n >= 1 && n <= 20) attrs[key] = n;
    });
    let nationality = fieldIdx.nationality !== undefined ? row[fieldIdx.nationality] : undefined;
    if (natIdx >= 0) {
      const v = row[natIdx] ?? "";
      const n = toNum(v);
      if (n !== undefined && /^\d+$/.test(v.trim())) attrs.naturalFitness = n;
      else if (!nationality) nationality = v;
    }
    players.push({
      id: uid(),
      name,
      age: fieldIdx.age !== undefined ? toNum(row[fieldIdx.age] ?? "") : undefined,
      positions: fieldIdx.position !== undefined ? parsePositions(row[fieldIdx.position] ?? "") : [],
      nationality: nationality?.trim() || undefined,
      club: fieldIdx.club !== undefined ? row[fieldIdx.club]?.trim() : undefined,
      contractExpiry: fieldIdx.contractExpiry !== undefined ? row[fieldIdx.contractExpiry]?.trim() : undefined,
      wage: fieldIdx.wage !== undefined ? row[fieldIdx.wage]?.trim() : undefined,
      value: fieldIdx.value !== undefined ? row[fieldIdx.value]?.trim() : undefined,
      ca: fieldIdx.ca !== undefined ? toNum(row[fieldIdx.ca] ?? "") : undefined,
      pa: fieldIdx.pa !== undefined ? toNum(row[fieldIdx.pa] ?? "") : undefined,
      attrs,
      status: "squad",
    });
  }
  return players;
}

export function parseCSV(text: string): Player[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const first = lines[0];
  const delim = [";", "\t", ","].map((d) => [d, first.split(d).length] as const).sort((a, b) => b[1] - a[1])[0][0];
  const split = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
      else if (c === delim && !q) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  };
  const headers = split(lines[0]);
  return rowsToPlayers(headers, lines.slice(1).map(split));
}

export function parseHTMLTable(html: string): Player[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const table = doc.querySelector("table");
  if (!table) return [];
  const trs = Array.from(table.querySelectorAll("tr"));
  if (trs.length < 2) return [];
  const cells = (tr: Element) => Array.from(tr.querySelectorAll("th,td")).map((c) => (c.textContent || "").trim());
  return rowsToPlayers(cells(trs[0]), trs.slice(1).map(cells));
}

export async function importFile(file: File): Promise<Player[]> {
  const text = await file.text();
  return /\.html?$/i.test(file.name) ? parseHTMLTable(text) : parseCSV(text);
}

/* ---------- Prints (imagens) ---------- */

export async function fileToJpegBase64(file: File, max = 1600): Promise<string> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82).split(",")[1];
}

/** Junta jogadores duplicados (mesmo nome), preservando o que já existe e completando com o novo. */
export function mergePlayers(existing: Player[], incoming: Player[]): Player[] {
  const result = [...existing];
  for (const inc of incoming) {
    const i = result.findIndex((p) => norm(p.name) === norm(inc.name));
    if (i < 0) { result.push(inc); continue; }
    const cur = result[i];
    result[i] = {
      ...cur,
      ...Object.fromEntries(Object.entries(inc).filter(([k, v]) => v !== undefined && v !== "" && k !== "id" && k !== "attrs" && k !== "positions" && k !== "status")),
      positions: inc.positions.length ? inc.positions : cur.positions,
      attrs: { ...cur.attrs, ...inc.attrs },
    } as Player;
  }
  return result;
}

export function contractYear(p: Player): number | undefined {
  const m = p.contractExpiry?.match(/(20\d{2})/);
  return m ? parseInt(m[1], 10) : undefined;
}

export function moneyNum(s?: string): number {
  if (!s) return 0;
  const m = s.replace(/\s/g, "").match(/([\d.,]+)\s*([KkMm]?)/);
  if (!m) return 0;
  let n = parseFloat(m[1].replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
  if (!Number.isFinite(n)) return 0;
  if (/k/i.test(m[2])) n *= 1e3;
  if (/m/i.test(m[2])) n *= 1e6;
  return n;
}

export function compactPlayer(p: Player) {
  return {
    id: p.id, name: p.name, age: p.age, positions: p.positions, contract: p.contractExpiry,
    wage: p.wage, value: p.value, ca: p.ca, pa: p.pa, attrs: p.attrs, notes: p.notes,
  };
}
