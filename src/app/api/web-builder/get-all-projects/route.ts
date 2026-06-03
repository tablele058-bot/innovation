import { db } from "@/lib/db";
import { webChats, webFrames, webProjects } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select({
      projectId: webProjects.projectId,
      id: webProjects.id,
      createdOn: webProjects.createdOn,
      createdBy: webProjects.createdBy,
      frameId: webFrames.frameId,
      message: webChats.chatMessage,
    })
    .from(webProjects)
    .leftJoin(webFrames, eq(webProjects.projectId, webFrames.projectId))
    .leftJoin(webChats, eq(webFrames.frameId, webChats.frameId))
    .where(eq(webProjects.createdBy, userId))
    .orderBy(desc(webProjects.id));

  return NextResponse.json(result);
}
