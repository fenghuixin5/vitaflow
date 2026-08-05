import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { records } from "../../../db/schema";

export async function GET() {
  try { return Response.json({ records: await getDb().select().from(records).orderBy(desc(records.id)).limit(200) }); }
  catch { return Response.json({ records: [] }); }
}

export async function POST(request: Request) {
  const body = await request.json() as { type?:string; title?:string; detail?:string; meta?:string; position?:number; done?:boolean };
  if (!body.type || !body.title?.trim()) return Response.json({ error: "missing fields" }, { status: 400 });
  const [record] = await getDb().insert(records).values({ type: body.type, title: body.title.trim(), detail: body.detail || "", meta: body.meta || "", position: body.position || 0, done: body.done || false, createdAt: Date.now() }).returning();
  return Response.json({ record }, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json() as { id?:number; type?:string; title?:string; detail?:string; meta?:string; position?:number; done?:boolean };
  if (!body.id || !body.title?.trim()) return Response.json({ error: "missing fields" }, { status: 400 });
  const [record] = await getDb().update(records).set({ type: body.type, title: body.title.trim(), detail: body.detail || "", meta: body.meta || "", position: body.position || 0, done: body.done || false }).where(eq(records.id, body.id)).returning();
  return Response.json({ record });
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  await getDb().delete(records).where(eq(records.id, id));
  return Response.json({ ok: true });
}
