import { db } from "@/lib/db";
import { canvaDesigns } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(canvaDesigns)
      .where(and(eq(canvaDesigns.projectId, id), eq(canvaDesigns.createdBy, userId)))
      .limit(1);

    if (result.length === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch {
    return Response.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await db
      .delete(canvaDesigns)
      .where(and(eq(canvaDesigns.projectId, id), eq(canvaDesigns.createdBy, userId)));

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "Database unavailable" }, { status: 503 });
  }
}
