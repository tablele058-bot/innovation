import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function getPageCount(length: string): number {
  switch (length) {
    case "short": return 3;
    case "medium": return 5;
    case "long": return 8;
    default: return 5;
  }
}

function buildPrompt(subject: string, ageGroup: string, genre: string, characterName: string, pageCount: number): string {
  return `Create a children's story with the following details:
- Subject/Theme: ${subject}
- Target Age Group: ${ageGroup}
- Genre: ${genre}
${characterName ? `- Main Character: ${characterName}` : ""}
- Number of pages/sections: ${pageCount}

For each page, provide:
1. A short paragraph of story text (2-4 sentences, appropriate for the age group)
2. A detailed image generation prompt that describes what should be illustrated on that page

Format the response as a JSON array of objects, each with "text" and "imagePrompt" fields.
Example format:
[
  {
    "text": "Once upon a time, in a magical forest...",
    "imagePrompt": "A cute cartoon style magical forest with colorful trees and friendly animals, bright daylight"
  }
]

Make the story engaging, age-appropriate, and consistent throughout.`;
}

function generateFallbackStory(subject: string, ageGroup: string, genre: string, characterName: string, pageCount: number) {
  const name = characterName || "Luna";
  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    pages.push({
      text: `Page ${i + 1}: ${name} continued their amazing ${genre.toLowerCase()} adventure through ${subject}. Every moment was filled with wonder and discovery, perfect for ${ageGroup === "toddler" ? "our youngest" : ageGroup === "kids" ? "young" : ageGroup === "preteens" ? "growing" : "teen"} readers.`,
      imagePrompt: `A beautiful ${genre.toLowerCase()} scene showing ${name} on an adventure, colorful and engaging illustration style`,
    });
  }
  return {
    title: `${name}'s ${genre} Adventure`,
    pages,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject, ageGroup, genre, artStyle, characterName, storyLength } = body;

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    const pageCount = getPageCount(storyLength || "medium");
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      const fallback = generateFallbackStory(subject, ageGroup, genre, characterName, pageCount);
      const pages = fallback.pages.map((p: { text: string; imagePrompt: string }) => ({
        content: p.text,
        imageUrl: "",
        imagePrompt: p.imagePrompt,
      }));
      return NextResponse.json({
        title: fallback.title,
        pages,
      });
    }

    const prompt = buildPrompt(subject, ageGroup, genre, characterName, pageCount);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a creative children's story writer. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 4096,
      top_p: 0.95,
    });

    const text = completion.choices[0]?.message?.content || "";

    let storyData: { text: string; imagePrompt: string }[];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        storyData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch {
      const fallback = generateFallbackStory(subject, ageGroup, genre, characterName, pageCount);
      storyData = fallback.pages;
    }

    const pages = storyData.map((p: { text: string; imagePrompt: string }) => ({
      content: p.text,
      imageUrl: "",
      imagePrompt: p.imagePrompt,
    }));

    const title = `${characterName || "The"} ${genre} Adventure`;

    return NextResponse.json({
      title,
      pages,
    });
  } catch (err: any) {
    console.error("Error in generate-story:", err);
    return NextResponse.json({ error: err.message || "Failed to generate story" }, { status: 500 });
  }
}
