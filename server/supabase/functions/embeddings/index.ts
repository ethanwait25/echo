/// <reference types="jsr:@supabase/functions-js/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std/http/server.ts";
import OpenAI from "npm:openai";

/*
  {
    "paragraphs": [
      "Today was a great day. I felt productive and calm.",
      "Later in the evening I started to feel anxious about tomorrow."
    ],
    "analyzePgs": true
  }
*/

type RequestBody = {
  paragraphs: string[];
  analyzePgs?: boolean;
};

type ResponseBody = {
  fullText: {
    text: string;
    embedding: number[];
  };
  paragraphs?: Array<{
    index: number;
    text: string;
    embedding: number[];
  }>;
};

const openai = new OpenAI();

async function generateEmbeddings(
  input: string | string[],
): Promise<number[] | number[][] | null> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input,
      encoding_format: "float",
    });

    if (!response.data?.length) return null;

    const sorted = [...response.data].sort((a, b) => a.index - b.index);
    const embeddings = sorted.map((d) => d.embedding);

    return Array.isArray(input) ? embeddings : embeddings[0];
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return null;
  }
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

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 204 });
  if (req.method !== "POST") return jsonResponse({ error: "Use POST" }, 405);

  try {
    const body = (await req.json()) as Partial<RequestBody>;

    if (!isStringArray(body.paragraphs)) {
      return jsonResponse({ error: "Missing `paragraphs` (string[])" }, 400);
    }

    const paragraphs = body.paragraphs.map((p) => p.trim());
    if (paragraphs.length === 0) {
      return jsonResponse({ error: "Missing `paragraphs` (string[])" }, 400);
    }
    if (paragraphs.some((p) => !p)) {
      return jsonResponse({ error: "One or more paragraphs are empty" }, 400);
    }

    const analyzePgs = body.analyzePgs !== false;

    const fullText = paragraphs.join("\n\n").trim();
    if (!fullText) return jsonResponse({ error: "Empty text" }, 400);

    const [fullEmbedding, pgEmbeddings] = await Promise.all([
      generateEmbeddings(fullText),
      analyzePgs ? generateEmbeddings(paragraphs) : Promise.resolve(null),
    ]);

    if (!fullEmbedding || Array.isArray(fullEmbedding[0])) {
      return jsonResponse({ error: "Embedding failed" }, 502);
    }

    const response: ResponseBody = {
      fullText: {
        text: fullText,
        embedding: fullEmbedding as number[],
      },
    };

    if (pgEmbeddings) {
      if (!Array.isArray(pgEmbeddings) || !Array.isArray(pgEmbeddings[0])) {
        return jsonResponse({ error: "Embedding failed" }, 502);
      }

      const arr = pgEmbeddings as number[][];
      response.paragraphs = paragraphs.map((text, index) => ({
        index,
        text,
        embedding: arr[index]!,
      }));
    }

    return jsonResponse(response);
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});