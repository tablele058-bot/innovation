import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { startupPins } from "@/lib/schema";
import { eq, desc, and, like } from "drizzle-orm";
import { getAuth } from "@clerk/nextjs/server";

const CATEGORIES = [
  "Startup Ideas",
  "Tools & Resources",
  "Funding & Investors",
  "Learning",
  "News & Articles",
  "Templates",
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    let query = db.select().from(startupPins).where(eq(startupPins.clerkId, userId));

    if (category && CATEGORIES.includes(category)) {
      query = query.where(eq(startupPins.category, category)) as any;
    }

    const pins = await query.orderBy(desc(startupPins.createdAt));

    let filtered = pins;
    if (search) {
      const q = search.toLowerCase();
      filtered = pins.filter(
        (p: any) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.tags && p.tags.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ pins: filtered, categories: CATEGORIES });
  } catch (err: any) {
    console.error("Error in GET /api/startup-board:", err);
    return NextResponse.json({ pins: [], categories: CATEGORIES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, url, imageUrl, category, tags, isAiGenerated } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    }

    const [pin] = await db
      .insert(startupPins)
      .values({
        clerkId: userId,
        title,
        description: description || null,
        url: url || null,
        imageUrl: imageUrl || null,
        category,
        tags: tags || null,
        isAiGenerated: isAiGenerated ? "true" : "false",
      })
      .returning();

    return NextResponse.json(pin, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/startup-board:", err);
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
      return NextResponse.json({ error: "Pin ID is required" }, { status: 400 });
    }

    const [pin] = await db
      .delete(startupPins)
      .where(and(eq(startupPins.id, parseInt(id)), eq(startupPins.clerkId, userId)))
      .returning();

    if (!pin) {
      return NextResponse.json({ error: "Pin not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/startup-board:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
