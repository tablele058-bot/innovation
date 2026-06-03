import { db } from "@/lib/db";
import { webChats } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages, frameId } = await req.json();
  await db.update(webChats).set({ chatMessage: messages }).where(eq(webChats.frameId, frameId));

  return NextResponse.json({ result: "updated" });
}
