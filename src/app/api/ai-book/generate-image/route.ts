import { NextRequest, NextResponse } from "next/server";

const FALLBACK_COLORS: Record<string, [string, string, string]> = {
  Fantasy: ["#6366f1", "#a855f7", "🏰"],
  "Science Fiction": ["#06b6d4", "#3b82f6", "🚀"],
  Adventure: ["#f97316", "#eab308", "🗺️"],
  "Fairy Tale": ["#ec4899", "#f472b6", "🧚"],
  Educational: ["#22c55e", "#10b981", "📚"],
  Mythology: ["#8b5cf6", "#d946ef", "⚡"],
  "Animal Stories": ["#84cc16", "#22c55e", "🐾"],
  Comedy: ["#facc15", "#f97316", "😂"],
};

function buildPrompt(base: string, style: string): string {
  return `Children's book illustration: ${base}, ${style} style, high quality, vibrant colors, professional lighting, kid-friendly`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function generateFallbackSvg(prompt: string, genre: string): string {
  const [c1, c2, emoji] = FALLBACK_COLORS[genre] || ["#6366f1", "#a855f7", "🎨"];
  const lines = prompt.slice(0, 120).split(" ").reduce((acc: string[], word) => {
    const last = acc[acc.length - 1];
    if (!last || (last + " " + word).length > 30) acc.push(word);
    else acc[acc.length - 1] = last + " " + word;
    return acc;
  }, []).map(escapeXml);
  const textLines = lines.map((l, i) =>
    `<text x="512" y="${650 + i * 36}" text-anchor="middle" font-family="system-ui" font-size="22" fill="${c1}" fill-opacity="0.6">${l}</text>`
  ).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.094"/>
        <stop offset="100%" stop-color="${c2}" stop-opacity="0.094"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="35%" r="35%">
        <stop offset="0%" stop-color="${c1}" stop-opacity="0.082"/>
        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)" rx="24"/>
    <rect width="1024" height="1024" fill="url(#glow)" rx="24"/>
    <rect x="62" y="62" width="900" height="900" rx="20" fill="none" stroke="${c1}" stroke-opacity="0.082" stroke-width="2"/>
    <rect x="82" y="82" width="860" height="860" rx="16" fill="none" stroke="${c2}" stroke-opacity="0.063" stroke-width="1"/>
    <circle cx="512" cy="360" r="140" fill="${c1}" fill-opacity="0.071" stroke="${c1}" stroke-opacity="0.188" stroke-width="3"/>
    <circle cx="512" cy="360" r="90" fill="${c2}" fill-opacity="0.071" stroke="${c2}" stroke-opacity="0.145" stroke-width="2"/>
    <circle cx="512" cy="360" r="45" fill="${c1}" fill-opacity="0.031" stroke="${c1}" stroke-opacity="0.125" stroke-width="1.5"/>
    <text x="512" y="530" text-anchor="middle" font-family="system-ui" font-size="40" font-weight="bold" fill="${c1}" fill-opacity="0.6">Story Illustration</text>
    <text x="512" y="570" text-anchor="middle" font-family="system-ui" font-size="28" fill="${c2}" fill-opacity="0.5">${emoji} ${genre} ${emoji}</text>
    ${textLines}
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, artStyle, genre } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const enhanced = buildPrompt(prompt, artStyle || "Watercolor");
    const bodyStr = JSON.stringify({ inputs: enhanced });
    const token = process.env.HUGGINGFACE_API_KEY;

    // Quick attempt at HF router with token (only model that might work)
    if (token) {
      const models = ["black-forest-labs/FLUX.1-schnell", "stabilityai/stable-diffusion-xl-base-1.0", "runwayml/stable-diffusion-v1-5"];
      for (const model of models) {
        try {
          const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: bodyStr,
            signal: AbortSignal.timeout(8000),
          });
          if (!res.ok) continue;
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("image")) {
            const buf = await res.arrayBuffer();
            return NextResponse.json({ imageUrl: `data:${ct};base64,${Buffer.from(buf).toString("base64")}` });
          }
          if (ct.includes("json")) {
            const json = await res.json();
            const items = Array.isArray(json) ? json : [json];
            for (const item of items) {
              const img = item.image || item.generated_image;
              if (img) return NextResponse.json({ imageUrl: `data:image/png;base64,${img}` });
            }
          }
        } catch { /* timeout or network error, try next */ }
      }
    }

    // Quick Pollinations attempt
    try {
      const pres = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}?width=1024&height=1024&nologo=true`, {
        signal: AbortSignal.timeout(10000),
      });
      if (pres.ok) {
        const ct = pres.headers.get("content-type") || "image/jpeg";
        const buf = await pres.arrayBuffer();
        return NextResponse.json({ imageUrl: `data:${ct};base64,${Buffer.from(buf).toString("base64")}` });
      }
    } catch { /* ignore */ }

    // SVG fallback
    return NextResponse.json({ imageUrl: generateFallbackSvg(prompt, genre || "Fantasy") });
  } catch (err: any) {
    console.error("[gen-img] Error:", err.message);
    return NextResponse.json({ imageUrl: "" });
  }
}
