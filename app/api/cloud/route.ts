import { NextRequest, NextResponse } from "next/server";
import { cloudEnabled, kvDel, kvGet, kvSet, verifyToken } from "@/lib/server-store";

export const runtime = "nodejs";

const who = (req: NextRequest) => verifyToken(req.headers.get("authorization")?.replace(/^Bearer /, ""));
const IDX = (u: string) => `fm:data:${u}:index`;
const SAVE = (u: string, id: string) => `fm:data:${u}:save:${id}`;
const okId = (id: unknown): id is string => typeof id === "string" && /^[\w-]{1,64}$/.test(id);

// GET: todos os saves do usuário
export async function GET(req: NextRequest) {
  const u = who(req);
  if (!u || !cloudEnabled()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  try {
    const index: any[] = (await kvGet(IDX(u))) ?? [];
    const saves = await Promise.all(index.map(async (m) => ({ meta: m, state: await kvGet(SAVE(u, m.id)) })));
    return NextResponse.json({ saves: saves.filter((s) => s.state) });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

// PUT { meta, state }: grava/atualiza um save
export async function PUT(req: NextRequest) {
  const u = who(req);
  if (!u || !cloudEnabled()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { meta, state } = await req.json().catch(() => ({}));
  if (!meta || !okId(meta.id) || !state) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  try {
    await kvSet(SAVE(u, meta.id), state);
    const index: any[] = (await kvGet(IDX(u))) ?? [];
    const i = index.findIndex((m) => m.id === meta.id);
    if (i >= 0) index[i] = meta; else index.push(meta);
    await kvSet(IDX(u), index);
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

// DELETE { id }
export async function DELETE(req: NextRequest) {
  const u = who(req);
  if (!u || !cloudEnabled()) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!okId(id)) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  try {
    await kvDel(SAVE(u, id));
    const index: any[] = ((await kvGet(IDX(u))) ?? []).filter((m: any) => m.id !== id);
    await kvSet(IDX(u), index);
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
