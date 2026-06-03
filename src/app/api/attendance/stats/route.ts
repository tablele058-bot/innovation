import { db } from "@/lib/db";
import { attendance } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clerkId = searchParams.get("clerkId");

  if (!clerkId || clerkId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const records = await db
      .select()
      .from(attendance)
      .where(eq(attendance.clerkId, clerkId))
      .orderBy(desc(attendance.date));

    const stats = {
      total: records.length,
      present: records.filter((r: any) => r.status === "present").length,
      absent: records.filter((r: any) => r.status === "absent").length,
      late: records.filter((r: any) => r.status === "late").length,
      leave: records.filter((r: any) => r.status === "leave").length,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("DB read error in attendance stats:", err);
    return NextResponse.json({ total: 0, present: 0, absent: 0, late: 0, leave: 0 });
  }
}
