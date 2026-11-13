import { roleScore, ROLES } from "./roles";
import type { Player, Pos } from "./types";

export const DUTY_SHORT: Record<string, string> = { Defender: "Def", Apoiar: "Apo", Atacar: "Ata", Cobertura: "Cob", Stopper: "Stp" };

export interface FmRole { id: string; name: string; duties: string[]; base: string }
const D = ["Defender"], S = ["Apoiar"], A = ["Atacar"];
const DSA = ["Defender", "Apoiar", "Atacar"], SA = ["Apoiar", "Atacar"], DS = ["Defender", "Apoiar"];
const CB3 = ["Defender", "Cobertura", "Stopper"];
const r = (id: string, name: string, duties: string[], base: string): FmRole => ({ id, name, duties, base });

const FB = [r("fb", "Lateral", DSA, "fb"), r("wb", "Ala", DSA, "wb"), r("iwb", "Ala invertido", DSA, "fb"), r("ifb", "Lateral invertido", D, "fb"), r("nnfb", "Lateral sem frescura", D, "fb"), r("cwb", "Ala completo", SA, "wb")];
const W = [r("wg", "Ponta", SA, "w"), r("ifw", "Atacante interior", SA, "if"), r("iw", "Ponta invertido", SA, "if"), r("wp", "Armador aberto", SA, "ap"), r("rd", "Raumdeuter", A, "if"), r("dw", "Ponta defensivo", DS, "w")];

export const FM_ROLES: Record<Pos, FmRole[]> = {
  GK: [r("gk", "Goleiro", D, "gk"), r("sk", "Goleiro-líbero", DSA, "sk")],
  CB: [r("cd", "Zagueiro", CB3, "cd"), r("bpd", "Zagueiro construtor", CB3, "bpd"), r("wcb", "Zagueiro aberto", DSA, "cd"), r("lib", "Líbero", DS, "bpd"), r("nncb", "Zagueiro sem frescura", CB3, "cd")],
  RB: FB, LB: FB,
  RWB: [r("wb", "Ala", DSA, "wb"), r("iwb", "Ala invertido", DSA, "fb"), r("cwb", "Ala completo", SA, "wb")],
  LWB: [r("wb", "Ala", DSA, "wb"), r("iwb", "Ala invertido", DSA, "fb"), r("cwb", "Ala completo", SA, "wb")],
  DM: [r("anc", "Volante âncora", D, "anchor"), r("hb", "Meio-campista recuado", D, "anchor"), r("dlp", "Armador recuado", DS, "dlp"), r("dm", "Volante defensivo", DS, "anchor"), r("reg", "Regista", S, "dlp"), r("bwm", "Volante desarmador", DS, "bwm"), r("sv", "Segundo volante", SA, "b2b")],
  CM: [r("cm", "Meia central", DSA, "b2b"), r("b2b", "Box-to-box", S, "b2b"), r("ap", "Armador avançado", SA, "ap"), r("bwm", "Volante desarmador", DS, "bwm"), r("mz", "Mezzala", SA, "ap"), r("car", "Carrilero", DS, "b2b"), r("dlp", "Armador recuado", DS, "dlp"), r("rpm", "Armador móvel", S, "ap")],
  RM: [r("wm", "Meia aberto", DSA, "w"), r("wg", "Ponta", SA, "w"), r("wp", "Armador aberto", SA, "ap"), r("dw", "Ponta defensivo", DS, "w")],
  LM: [r("wm", "Meia aberto", DSA, "w"), r("wg", "Ponta", SA, "w"), r("wp", "Armador aberto", SA, "ap"), r("dw", "Ponta defensivo", DS, "w")],
  RW: W, LW: W,
  AM: [r("am", "Meia-atacante", SA, "am"), r("ap", "Armador avançado", SA, "ap"), r("eng", "Enganche", S, "ap"), r("ss", "Atacante de sombra", A, "am"), r("tq", "Trequartista", A, "am")],
  ST: [r("af", "Centroavante avançado", A, "cf"), r("cf", "Atacante completo", SA, "cf"), r("dlf", "Atacante recuado", SA, "cf"), r("pf", "Atacante pressionador", DSA, "pf"), r("tf", "Pivô", SA, "tm"), r("poa", "Matador", A, "poacher"), r("f9", "Falso nove", S, "cf")],
};

export const findRole = (pos: Pos, id?: string) => (id ? FM_ROLES[pos].find((x) => x.id === id) : undefined);

/** Encaixe (0–100) do jogador numa função específica do FM (aproximada pelos pesos de atributos da função-base). */
export function roleFit(p: Player, pos: Pos, roleId?: string): number | null {
  const fr = findRole(pos, roleId);
  const base = fr && ROLES.find((x) => x.id === fr.base);
  return base ? roleScore(base, p.attrs) : null;
}

/** Posição sugerida pela zona do campo; mantém a original quando a nova zona é do mesmo grupo (ex.: ala x meia aberto). */
export function posFromXY(x: number, y: number, current: Pos): Pos {
  const left = x < 24, right = x > 76;
  if (y >= 85 && !left && !right) return "GK";
  if (y >= 64) return left ? "LB" : right ? "RB" : "CB";
  if (y >= 40 && (left || right)) {
    if (["LM", "RM", "LWB", "RWB"].includes(current)) return left ? (current === "LWB" || current === "RWB" ? "LWB" : "LM") : (current === "LWB" || current === "RWB" ? "RWB" : "RM");
    return left ? (y >= 55 ? "LWB" : "LM") : (y >= 55 ? "RWB" : "RM");
  }
  if (y >= 55) return "DM";
  if (y >= 40) return "CM";
  if (y >= 22) return left ? "LW" : right ? "RW" : "AM";
  return left ? "LW" : right ? "RW" : "ST";
}
