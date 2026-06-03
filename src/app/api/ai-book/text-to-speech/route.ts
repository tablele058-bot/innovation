import { NextRequest, NextResponse } from "next/server";

const HF_TTS_URL = "https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits";

export async function GET() {
  return NextResponse.json({
    available: true,
    method: "Web Speech API",
    note: "Use browser's built-in SpeechSynthesis API for zero-cost text-to-speech. POST to this endpoint for Hugging Face TTS fallback.",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const hfToken = process.env.HUGGINGFACE_API_KEY;

    if (!hfToken) {
      return NextResponse.json({
        useWebSpeech: true,
        text,
        note: "No Hugging Face API key configured. Use browser Web Speech API.",
      });
    }

    const hfRes = await fetch(HF_TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!hfRes.ok) {
      console.error("Hugging Face TTS error:", hfRes.status);
      return NextResponse.json({
        useWebSpeech: true,
        text,
        note: "Hugging Face TTS unavailable. Use browser Web Speech API.",
      });
    }

    const contentType = hfRes.headers.get("content-type") || "";

    if (contentType.includes("audio")) {
      const audioBuffer = await hfRes.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": audioBuffer.byteLength.toString(),
        },
      });
    }

    const json = await hfRes.json();
    if (json.audio) {
      const audioBuffer = Buffer.from(json.audio, "base64");
      return new NextResponse(audioBuffer, {
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": audioBuffer.length.toString(),
        },
      });
    }

    return NextResponse.json({
      useWebSpeech: true,
      text,
      note: "Could not generate audio from Hugging Face. Use browser Web Speech API.",
    });
  } catch (err: any) {
    console.error("Error in text-to-speech:", err);
    return NextResponse.json({
      useWebSpeech: true,
      text: "",
      note: "TTS error. Use browser Web Speech API.",
    });
  }
}
