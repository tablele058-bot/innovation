import { db } from "@/lib/db";
import { diagrams } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await db
    .select()
    .from(diagrams)
    .where(and(eq(diagrams.projectId, id), eq(diagrams.createdBy, userId)))
    .limit(1);

  if (result.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, elements, appState } = await req.json();

  await db
    .update(diagrams)
    .set({
      name,
      elements,
      appState,
      updatedAt: new Date(),
    })
    .where(and(eq(diagrams.projectId, id), eq(diagrams.createdBy, userId)));

  return Response.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db
    .delete(diagrams)
    .where(and(eq(diagrams.projectId, id), eq(diagrams.createdBy, userId)));

  return Response.json({ success: true });
}
