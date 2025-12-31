/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std/http/server.ts";

/*
  {
    "paragraphs": [
      "Today was a great day. I felt productive and calm.",
      "Later in the evening I started to feel anxious about tomorrow."
    ],
    "analyzePgs": true
  }
*/

const HF_API_TOKEN = Deno.env.get("HF_API_TOKEN");
if (!HF_API_TOKEN) throw new Error("Missing HF_API_TOKEN");

const EMOTION_MODEL = "j-hartmann/emotion-english-distilroberta-base";
const HF_ENDPOINT = `https://router.huggingface.co/hf-inference/models/${EMOTION_MODEL}`;

type EmotionResult = {
  label: string;
  score: number;
};

type RequestBody = {
  paragraphs: string[];
  analyzePgs?: boolean;
};

type ResponseBody = {
  fullText: {
    emotion: EmotionResult[];
    text: string;
  };
  paragraphs?: Array<{
    index: number;
    text: string;
    emotion: EmotionResult[];
  }>;
};

async function analyzeEmotion(text: string): Promise<EmotionResult[]> {
  const response = await fetch(HF_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HF API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return Array.isArray(data?.[0]) ? data[0] : data;
}

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers":
        "authorization, x-client-info, apikey, content-type",
      "access-control-allow-methods": "POST, OPTIONS",
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 204 });
  if (req.method !== "POST") return jsonResponse({ error: "Use POST" }, 405);

  try {
    const body = (await req.json()) as Partial<RequestBody>;

    if (!isStringArray(body.paragraphs)) {
      return jsonResponse({ error: "Missing `paragraphs` (string[])" }, 400);
    }

    const paragraphs = body.paragraphs;
    const analyzePgs = body.analyzePgs !== false;

    const fullText = paragraphs.join(" ").trim();

    const [fullEmotion, pgEmotions] = await Promise.all([
      analyzeEmotion(fullText),
      analyzePgs
        ? Promise.all(paragraphs.map((p) => analyzeEmotion(p)))
        : Promise.resolve(null),
    ]);

    const response: ResponseBody = {
      fullText: {
        text: fullText,
        emotion: fullEmotion,
      },
    };

    response.paragraphs = pgEmotions!.map((emotion, index) => ({
      index,
      text: paragraphs[index]!,
      emotion,
    }));

    return jsonResponse(response);
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500
    );
  }
});