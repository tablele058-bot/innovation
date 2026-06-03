import { db } from "@/lib/db";
import { canvaDesigns } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json([]);

  try {
    const result = await db
      .select()
      .from(canvaDesigns)
      .where(eq(canvaDesigns.createdBy, userId))
      .orderBy(desc(canvaDesigns.updatedAt));
    return Response.json(result);
  } catch {
    return Response.json([]);
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { projectId, name, canvasJson } = await req.json();

    const existing = await db
      .select()
      .from(canvaDesigns)
      .where(eq(canvaDesigns.projectId, projectId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(canvaDesigns)
        .set({ name, canvasJson, updatedAt: new Date() })
        .where(eq(canvaDesigns.projectId, projectId));
    } else {
      await db.insert(canvaDesigns).values({
        projectId,
        name: name || "Untitled Design",
        canvasJson,
        createdBy: userId,
      });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "Database unavailable" }, { status: 503 });
  }
}
