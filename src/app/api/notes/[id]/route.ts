import { db } from "@/lib/db";
import { notes } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db
    .delete(notes)
    .where(and(eq(notes.id, parseInt(id)), eq(notes.clerkId, userId)));

  return Response.json({ success: true });
}
