import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiStories, aiCredits } from "@/lib/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const url = new URL(req.url);
      const isPublic = url.searchParams.get("public");

      if (isPublic === "true") {
        const stories = await db
          .select()
          .from(aiStories)
          .where(eq(aiStories.isPublic, "true"))
          .orderBy(desc(aiStories.createdAt));
        return NextResponse.json({ stories });
      }

      const stories = await db
        .select()
        .from(aiStories)
        .where(eq(aiStories.clerkId, userId))
        .orderBy(desc(aiStories.createdAt));

      const creditRecord = await db
        .select()
        .from(aiCredits)
        .where(eq(aiCredits.clerkId, userId))
        .limit(1);

      const credits = creditRecord.length > 0 ? creditRecord[0].credits : 10;

      return NextResponse.json({ stories, credits });
    } catch (dbErr: any) {
      console.error("DB query error in GET /api/ai-book:", dbErr.message);
      return NextResponse.json({ stories: [], credits: 10 });
    }
  } catch (err: any) {
    console.error("Error in GET /api/ai-book:", err);
    return NextResponse.json({ error: "Internal server error", stories: [], credits: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, ageGroup, genre, artStyle, characterName, coverImageUrl, audioUrl, isPublic } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [story] = await db
      .insert(aiStories)
      .values({
        clerkId: userId,
        title,
        content: content || [],
        ageGroup: ageGroup || null,
        genre: genre || null,
        artStyle: artStyle || null,
        characterName: characterName || null,
        coverImageUrl: coverImageUrl || null,
        audioUrl: audioUrl || null,
        isPublic: isPublic ? "true" : "false",
        creditsUsed: 1,
      })
      .returning();

    await db
      .insert(aiCredits)
      .values({ clerkId: userId, credits: 9 })
      .onConflictDoUpdate({
        target: aiCredits.clerkId,
        set: { credits: sql`GREATEST(0, ${aiCredits.credits} - 1)`, updatedAt: new Date() },
      });

    return NextResponse.json(story, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/ai-book:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 });
    }

    const [story] = await db
      .delete(aiStories)
      .where(and(eq(aiStories.id, parseInt(id)), eq(aiStories.clerkId, userId)))
      .returning();

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/ai-book:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
