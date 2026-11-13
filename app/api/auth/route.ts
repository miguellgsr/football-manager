import { NextRequest, NextResponse } from "next/server";
import { checkPassword, cloudEnabled, hashPassword, kvGet, kvSetNX, signToken, validUser } from "@/lib/server-store";

export const runtime = "nodejs";

// GET: informa se o armazenamento em nuvem está configurado
export async function GET() {
  return NextResponse.json({ cloud: cloudEnabled() });
}

// POST { action: "register" | "login", username, password }
export async function POST(req: NextRequest) {
  if (!cloudEnabled()) return NextResponse.json({ error: "Nuvem não configurada." }, { status: 501 });
  const { action, username, password } = await req.json().catch(() => ({}));
  const u = String(username ?? "").trim().toLowerCase();
  if (!validUser(u)) return NextResponse.json({ error: "Usuário: 3 a 24 caracteres (letras, números, . _ -)." }, { status: 400 });
  if (typeof password !== "string" || password.length < 6) return NextResponse.json({ error: "A senha precisa ter ao menos 6 caracteres." }, { status: 400 });
  try {
    if (action === "register") {
      const ok = await kvSetNX(`fm:user:${u}`, hashPassword(password));
      if (!ok) return NextResponse.json({ error: "Esse usuário já existe." }, { status: 409 });
      return NextResponse.json({ token: signToken(u), user: u });
    }
    const rec = await kvGet(`fm:user:${u}`);
    if (!rec || !checkPassword(password, rec.salt, rec.hash)) return NextResponse.json({ error: "Usuário ou senha incorretos." }, { status: 401 });
    return NextResponse.json({ token: signToken(u), user: u });
  } catch (e: any) {
    return NextResponse.json({ error: "Falha no armazenamento: " + e.message }, { status: 500 });
  }
}
