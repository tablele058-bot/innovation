import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { generateRandomName } from "@/lib/random-name";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_USER = process.env.GITHUB_USER || "";

async function createPrivateRepo(repoName: string) {
  if (!GITHUB_TOKEN) return null;
  const res = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: repoName,
      private: true,
      auto_init: true,
      description: "Auto-generated workspace project",
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

async function pushFilesToRepo(repoName: string, files: any[]) {
  if (!GITHUB_TOKEN) return;
  const owner = GITHUB_USER;

  const getSha = async (path: string): Promise<string | null> => {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha || null;
  };

  for (const file of files) {
    if (file.type === "folder") continue;
    const content = Buffer.from(file.content || "").toString("base64");
    const existingSha = await getSha(file.path);

    await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: existingSha ? `Update ${file.path}` : `Create ${file.path}`,
          content,
          sha: existingSha || undefined,
        }),
      }
    );
  }
}

async function fetchFilesFromRepo(repoName: string): Promise<any[]> {
  if (!GITHUB_TOKEN) return [];
  const owner = GITHUB_USER;

  const fetchTree = async (path = ""): Promise<any[]> => {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
    );
    if (!res.ok) return [];
    const items = await res.json();
    const result: any[] = [];

    for (const item of items) {
      if (item.type === "dir") {
        const children = await fetchTree(item.path);
        result.push({
          name: item.name,
          path: item.path,
          type: "folder",
          children,
        });
      } else {
        const fileRes = await fetch(item.git_url, {
          headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
        });
        const fileData = await fileRes.json();
        const content = fileData.content
          ? Buffer.from(fileData.content, "base64").toString("utf-8")
          : "";
        result.push({
          name: item.name,
          path: item.path,
          type: "file",
          content,
          language: item.name.split(".").pop() || "",
        });
      }
    }
    return result;
  };

  return fetchTree();
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json([]);

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.clerkId, userId))
    .orderBy(desc(projects.updatedAt));

  return Response.json(result);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  const repoName = `ws_${generateRandomName().toLowerCase()}`;

  let repoUrl = "";
  const repo = await createPrivateRepo(repoName);
  if (repo) repoUrl = repo.html_url;

  const defaultFiles = [
    { name: "src", path: "src", type: "folder", children: [] },
    { name: "index.js", path: "index.js", type: "file", content: "// Start coding here\n", language: "javascript" },
    { name: "README.md", path: "README.md", type: "file", content: `# ${name}\n\n`, language: "markdown" },
  ];

  await pushFilesToRepo(repoName, defaultFiles);

  const result = await db
    .insert(projects)
    .values({
      clerkId: userId,
      name,
      repoName,
      repoUrl,
      files: JSON.stringify(defaultFiles),
    })
    .returning();

  return Response.json({ ...result[0], files: defaultFiles });
}
