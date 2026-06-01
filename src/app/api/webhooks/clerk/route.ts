import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { generateRandomName } from "@/lib/random-name";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === "user.created" || type === "user.updated") {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, data.id));

      const githubAccount = data.external_accounts?.find(
        (acc: any) => acc.provider === "github"
      );

      if (existing.length > 0) {
        await db
          .update(users)
          .set({
            githubUsername: githubAccount?.username || data.username || "",
            githubAvatar: githubAccount?.avatar_url || data.image_url || "",
            email: data.email_addresses?.[0]?.email_address || "",
          })
          .where(eq(users.clerkId, data.id));
      } else {
        await db.insert(users).values({
          clerkId: data.id,
          githubUsername: githubAccount?.username || data.username || "",
          githubAvatar: githubAccount?.avatar_url || data.image_url || "",
          displayName: generateRandomName(),
          email: data.email_addresses?.[0]?.email_address || "",
        });
      }
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
