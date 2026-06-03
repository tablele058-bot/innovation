import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StartupBoard/1.0)",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 });
    }

    const html = await res.text();

    const title =
      extractMeta(html, "og:title") ||
      extractMeta(html, "twitter:title") ||
      extractTag(html, "title");

    const description =
      extractMeta(html, "og:description") ||
      extractMeta(html, "twitter:description") ||
      extractMeta(html, "description");

    const image =
      extractMeta(html, "og:image") ||
      extractMeta(html, "twitter:image");

    const favicon = extractTagAttr(html, "link[rel='icon']", "href") ||
      extractTagAttr(html, "link[rel='shortcut icon']", "href");

    const images = extractImages(html, url);

    return NextResponse.json({
      title: title || "",
      description: description || "",
      image: image || "",
      favicon: favicon || "",
      images: images.slice(0, 12),
    });
  } catch (err: any) {
    console.error("Error in scrape:", err.message);
    return NextResponse.json({ error: err.message || "Failed to scrape" }, { status: 500 });
  }
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return decodeEntities(m[1]);
  }
  return null;
}

function extractTag(html: string, tag: string): string | null {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"));
  return m ? decodeEntities(m[1].trim()) : null;
}

function extractTagAttr(html: string, selector: string, attr: string): string | null {
  const m = html.match(new RegExp(`<link[^>]*rel=["'](icon|shortcut icon)["'][^>]*href=["']([^"']+)["']`, "i"));
  return m ? m[2] : null;
}

function extractImages(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (
      src.startsWith("http") &&
      !src.includes("logo") &&
      !src.includes("icon") &&
      !src.includes("avatar") &&
      !src.includes("banner") &&
      !src.includes("pixel") &&
      !src.includes("spacer") &&
      (src.endsWith(".jpg") || src.endsWith(".jpeg") || src.endsWith(".png") || src.endsWith(".webp") || !src.includes("."))
    ) {
      urls.push(src);
    }
  }
  return [...new Set(urls)];
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}
