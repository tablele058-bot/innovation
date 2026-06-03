"use server";

import { db } from "./db";
import { users, startups, startupViews, attendance } from "./schema";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { generateRandomName } from "./random-name";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getStartups(search?: string) {
  try {
    if (search) {
      return await db
        .select()
        .from(startups)
        .where(ilike(startups.title, `%${search}%`))
        .orderBy(desc(startups.createdAt));
    }
    return await db
      .select()
      .from(startups)
      .orderBy(desc(startups.createdAt));
  } catch (err) {
    console.error("DB read error in getStartups:", err);
    return [];
  }
}

export async function getStartupById(id: number) {
  try {
    const result = await db
      .select()
      .from(startups)
      .where(eq(startups.id, id));
    return result[0] || null;
  } catch (err) {
    console.error("DB read error in getStartupById:", err);
    return null;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));
    return result[0] || null;
  } catch (err) {
    console.error("DB read error in getUserByClerkId:", err);
    return null;
  }
}

export async function getStartupsByAuthor(authorId: string) {
  try {
    return await db
      .select()
      .from(startups)
      .where(eq(startups.authorId, authorId))
      .orderBy(desc(startups.createdAt));
  } catch (err) {
    console.error("DB read error in getStartupsByAuthor:", err);
    return [];
  }
}

export async function syncUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await getUserByClerkId(userId);
  if (existing) return existing;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  const githubAccount = clerkUser.externalAccounts.find(
    (acc) => acc.provider === "github"
  );

  const newUser = await db
    .insert(users)
    .values({
      clerkId: userId,
      githubUsername: githubAccount?.username || clerkUser.username || "",
      githubAvatar: githubAccount?.imageUrl || clerkUser.imageUrl || "",
      displayName: generateRandomName(),
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
    })
    .returning();

  return newUser[0];
}

export async function createStartup(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await syncUser();
  if (!user) throw new Error("User not found");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const pitch = formData.get("pitch") as string;

  if (!title || !description || !category) {
    throw new Error("Title, description, and category are required");
  }

  await db.insert(startups).values({
    title,
    description,
    category,
    imageUrl: imageUrl || null,
    pitch: pitch || null,
    authorId: userId,
  });

  revalidatePath("/");
}

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await syncUser();
  if (!user) throw new Error("User not found");

  const displayName = formData.get("displayName") as string;
  const bio = formData.get("bio") as string;
  const website = formData.get("website") as string;
  const twitterLink = formData.get("twitterLink") as string;
  const linkedinLink = formData.get("linkedinLink") as string;
  const profileImageUrl = formData.get("profileImageUrl") as string;

  await db
    .update(users)
    .set({
      displayName: displayName || user.displayName,
      bio: bio || null,
      website: website || null,
      twitterLink: twitterLink || null,
      linkedinLink: linkedinLink || null,
      profileImageUrl: profileImageUrl || null,
    })
    .where(eq(users.clerkId, userId));

  revalidatePath(`/user/${userId}`);
  revalidatePath("/edit-profile");
}

export async function deleteStartup(startupId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const startup = await getStartupById(startupId);
  if (!startup) throw new Error("Startup not found");
  if (startup.authorId !== userId) throw new Error("Not authorized");

  await db.delete(startupViews).where(eq(startupViews.startupId, startupId));
  await db.delete(startups).where(eq(startups.id, startupId));

  revalidatePath("/");
  revalidatePath(`/user/${userId}`);
  redirect("/");
}

export async function getAttendance(clerkId: string) {
  try {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.clerkId, clerkId))
      .orderBy(desc(attendance.date));
  } catch (err) {
    console.error("DB read error in getAttendance:", err);
    return [];
  }
}

export async function getAttendanceByMonth(clerkId: string, year: number, month: number) {
  try {
    const all = await getAttendance(clerkId);
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return all.filter((r: any) => r.date.startsWith(prefix));
  } catch (err) {
    console.error("DB read error in getAttendanceByMonth:", err);
    return [];
  }
}

export async function markAttendance(date: string, status: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

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
}

export async function getAttendanceStats(clerkId: string) {
  try {
    const records = await getAttendance(clerkId);
    return {
      total: records.length,
      present: records.filter((r: any) => r.status === "present").length,
      absent: records.filter((r: any) => r.status === "absent").length,
      late: records.filter((r: any) => r.status === "late").length,
      leave: records.filter((r: any) => r.status === "leave").length,
    };
  } catch (err) {
    console.error("DB read error in getAttendanceStats:", err);
    return { total: 0, present: 0, absent: 0, late: 0, leave: 0 };
  }
}

export async function incrementViews(id: number) {
  const { userId } = await auth();
  if (!userId) {
    try {
      await db
        .update(startups)
        .set({ views: sql`views + 1` })
        .where(eq(startups.id, id));
    } catch (err) {
      console.error("DB write error in incrementViews (anon):", err);
    }
    return;
  }

  const existing = await db
    .select()
    .from(startupViews)
    .where(
      and(eq(startupViews.clerkId, userId), eq(startupViews.startupId, id))
    );

  if (existing.length > 0) return;
  try {
    await db.insert(startupViews).values({ clerkId: userId, startupId: id });
    await db
      .update(startups)
      .set({ views: sql`views + 1` })
      .where(eq(startups.id, id));
  } catch (err) {
    console.error("DB write error in incrementViews:", err);
  }
}
