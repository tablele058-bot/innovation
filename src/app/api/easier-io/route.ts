import { db } from "@/lib/db";
import { diagrams } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json([]);

  const result = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.createdBy, userId))
    .orderBy(desc(diagrams.updatedAt));

  return Response.json(result);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, name, elements, appState } = await req.json();

  const existing = await db
    .select()
    .from(diagrams)
    .where(eq(diagrams.projectId, projectId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(diagrams)
      .set({ name, elements, appState, updatedAt: new Date() })
      .where(eq(diagrams.projectId, projectId));
  } else {
    await db.insert(diagrams).values({
      projectId,
      name: name || "Untitled Diagram",
      elements,
      appState,
      createdBy: userId,
    });
  }

  return Response.json({ success: true });
}
