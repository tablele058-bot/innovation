import { db } from "@/lib/db";
import { notes } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json([]);

  const result = await db
    .select()
    .from(notes)
    .where(eq(notes.clerkId, userId))
    .orderBy(desc(notes.updatedAt));

  return Response.json(result);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, videoUrl, videoTitle, content } = await req.json();

  if (id) {
    await db
      .update(notes)
      .set({ content, videoTitle, updatedAt: new Date() })
      .where(and(eq(notes.id, id), eq(notes.clerkId, userId)));
  } else {
    await db.insert(notes).values({
      clerkId: userId,
      videoUrl,
      videoTitle: videoTitle || "Untitled",
      content: content || "",
    });
  }

  return Response.json({ success: true });
}
