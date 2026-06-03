import { db } from "@/lib/db";
import { attendance } from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clerkId = searchParams.get("clerkId");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!clerkId || clerkId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (year && month) {
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      const records = await db
        .select()
        .from(attendance)
        .where(and(eq(attendance.clerkId, clerkId), sql`${attendance.date} LIKE ${prefix + "%"}`))
        .orderBy(desc(attendance.date));
      return NextResponse.json(records);
    }
    const records = await db
      .select()
      .from(attendance)
      .where(eq(attendance.clerkId, clerkId))
      .orderBy(desc(attendance.date));
    return NextResponse.json(records);
  } catch (err) {
    console.error("DB read error in attendance GET:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { date, status } = await req.json();
    if (!date || !status) {
      return NextResponse.json({ error: "Date and status are required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.clerkId, userId), eq(attendance.date, date)));

    if (existing.length > 0) {
      await db
        .update(attendance)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(attendance.clerkId, userId), eq(attendance.date, date)));
    } else {
      await db.insert(attendance).values({
        clerkId: userId,
        date,
        status,
      });
    }

    revalidatePath("/attendance");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DB write error in attendance POST:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
