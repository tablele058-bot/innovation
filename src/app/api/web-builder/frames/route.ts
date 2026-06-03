import { db } from "@/lib/db";
import { webFrames, webChats } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const frameId = searchParams.get("frameId");

  if (!frameId) {
    return NextResponse.json({ error: "Frame ID is required" }, { status: 400 });
  }

  const frameResult = await db.select().from(webFrames).where(eq(webFrames.frameId, frameId));
  const chatResult = await db.select().from(webChats).where(eq(webChats.frameId, frameId));

  if (frameResult.length === 0 || chatResult.length === 0) {
    return NextResponse.json({ error: "Frame or chat not found" }, { status: 404 });
  }

  const finalResult = {
    ...frameResult[0],
    chatMessages: chatResult[0].chatMessage,
  };

  return NextResponse.json(finalResult);
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { designCode, frameId, projectId } = await req.json();
  await db.update(webFrames).set({ designCode }).where(and(eq(webFrames.frameId, frameId), eq(webFrames.projectId, projectId)));

  return NextResponse.json({ result: "Updated!" });
}
