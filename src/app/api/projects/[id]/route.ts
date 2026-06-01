import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_USER = process.env.GITHUB_USER || "";

async function pushFilesToRepo(repoName: string, files: any[]) {
  if (!GITHUB_TOKEN) return;
  const owner = GITHUB_USER;

  for (const file of files) {
    if (file.type === "folder") continue;
    const content = Buffer.from(file.content || "").toString("base64");
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Update ${file.path}`,
          content,
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error(`GitHub push error for ${file.path}:`, err);
    }
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, parseInt(id)), eq(projects.clerkId, userId)));

  if (result.length === 0)
    return Response.json({ error: "Not found" }, { status: 404 });

  const project = result[0];
  let files = typeof project.files === "string" ? JSON.parse(project.files) : project.files;

  // Try to fetch latest from GitHub
  if (GITHUB_TOKEN && project.repoName) {
    const fetched = await fetchFilesFromRepo(project.repoName);
    if (fetched.length > 0) files = fetched;
  }

  return Response.json({ ...project, files });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { files } = await req.json();

  const result = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, parseInt(id)), eq(projects.clerkId, userId)));

  if (result.length === 0)
    return Response.json({ error: "Not found" }, { status: 404 });

  const project = result[0];

  // Push to GitHub
  if (GITHUB_TOKEN && project.repoName) {
    const flattenFiles = (nodes: any[]): any[] => {
      const result: any[] = [];
      for (const node of nodes) {
        if (node.type === "file") result.push(node);
        if (node.children) result.push(...flattenFiles(node.children));
      }
      return result;
    };
    await pushFilesToRepo(project.repoName, flattenFiles(files));
  }

  await db
    .update(projects)
    .set({ files: JSON.stringify(files), updatedAt: new Date() })
    .where(and(eq(projects.id, parseInt(id)), eq(projects.clerkId, userId)));

  return Response.json({ success: true });
}

async function fetchFilesFromRepo(repoName: string): Promise<any[]> {
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
        result.push({ name: item.name, path: item.path, type: "folder", children });
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
