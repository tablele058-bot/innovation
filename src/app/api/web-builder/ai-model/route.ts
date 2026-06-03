import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are an expert Frontend Engineer. Your task is to generate complete, fully functional HTML/Tailwind CSS code that occupies the entire viewport.

CRITICAL DESIGN RULES:
1. FULL-WIDTH & HEIGHT: The root container MUST use \`w-full min-h-screen\` and span the entire width and height of the screen. Never cap the width at a small breakpoint (e.g., do not use \`max-w-md\` or \`max-w-xl\` on the main outer layout div).
2. FULL COVERAGE LAYOUT: The design must be a seamless, full-bleed screen experience. Use full horizontal sections (e.g., full-width headers, hero banners, and grids) that adapt beautifully to the canvas container.
3. STRUCTURE: Include a complete structure: A full-width navigation bar, a high-impact hero banner section, a detailed grid for features or featured products, and a full-width footer. Do not output snippet modules or isolated modal views unless explicitly asked.
4. NO MARKDOWN MARGINS: Ensure there are no wrapper body margins. The canvas must look like a professionally deployed live application.

OUTPUT FORMAT:
- Only include the <body> content (no <head> or <title>)
- Use Tailwind CSS for all styling (CDN loaded externally)
- Use a modern blue/indigo primary color theme
- Fully responsive across all screen sizes
- Use placeholder images: https://placehold.co/600x400/3b82f6/ffffff
- Include interactive hover effects and transitions
- Wrap the ENTIRE code in \`\`\`html ... \`\`\` block
- NO extra text before or after the code block

If the user sends a greeting, respond conversationally without code.
If the user requests modifications to existing code, update the existing code accordingly following the same rules.
`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { messages } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq API Error:", error);
      return NextResponse.json({ error: "Failed to fetch from AI" }, { status: response.status });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) { controller.close(); return; }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.trim() === "" || line.includes("[DONE]")) continue;
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  const content = data.choices[0]?.delta?.content;
                  if (content) controller.enqueue(encoder.encode(content));
                } catch (e) {}
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
