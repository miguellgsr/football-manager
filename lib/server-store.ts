import crypto from "crypto";

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const TOKEN_ = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";

export const cloudEnabled = () => !!(URL_ && TOKEN_);

async function cmd(args: (string | number)[]): Promise<any> {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN_}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || `Redis ${r.status}`);
  return j.result;
}

export const kvGet = async (k: string): Promise<any | null> => {
  const v = await cmd(["GET", k]);
  if (v == null) return null;
  try { return JSON.parse(v); } catch { return null; }
};
export const kvSet = (k: string, v: unknown) => cmd(["SET", k, JSON.stringify(v)]);
export const kvDel = (k: string) => cmd(["DEL", k]);
export const kvSetNX = async (k: string, v: unknown) => (await cmd(["SET", k, JSON.stringify(v), "NX"])) === "OK";

// ---- senha e sessão ----
export function hashPassword(pw: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(pw, salt, 32).toString("hex");
  return { salt, hash };
}
export function checkPassword(pw: string, salt: string, hash: string) {
  const h = crypto.scryptSync(pw, salt, 32);
  const b = Buffer.from(hash, "hex");
  return b.length === h.length && crypto.timingSafeEqual(h, b);
}

const secret = () => process.env.AUTH_SECRET || TOKEN_ || "fm-mate-dev";
const b64 = (s: string) => Buffer.from(s).toString("base64url");

export function signToken(user: string, days = 60) {
  const body = b64(JSON.stringify({ u: user, e: Date.now() + days * 864e5 }));
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}
export function verifyToken(t: string | null | undefined): string | null {
  if (!t) return null;
  const [body, sig] = t.split(".");
  if (!body || !sig) return null;
  const exp = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  if (sig.length !== exp.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    return p.e > Date.now() ? String(p.u) : null;
  } catch { return null; }
}

export const validUser = (u: unknown): u is string => typeof u === "string" && /^[a-z0-9_.-]{3,24}$/.test(u);
