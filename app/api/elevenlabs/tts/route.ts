import { NextResponse } from "next/server";
import { elevenlabs, VOICE_ID, MODEL_TTS } from "@/lib/elevenlabs-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voiceId } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    const response = await elevenlabs.textToSpeech.convert(
      voiceId || VOICE_ID,
      {
        text,
        modelId: MODEL_TTS,
        outputFormat: "mp3_44100_128",
      }
    );

    return new Response(response as unknown as ReadableStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[TTS] Error:", error);
    return NextResponse.json(
      { error: "TTS generation failed" },
      { status: 500 }
    );
  }
}
