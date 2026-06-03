import { db } from "@/lib/db";
import { webProjects, webFrames, webChats } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, frameId, messages } = await req.json();

  await db.insert(webProjects).values({
    projectId,
    createdBy: userId,
  });

  await db.insert(webFrames).values({
    frameId,
    projectId,
  });

  await db.insert(webChats).values({
    chatMessage: messages,
    frameId,
    createdBy: userId,
  });

  return NextResponse.json({ projectId, frameId, messages });
}
