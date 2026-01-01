import { supabase } from "./supabaseClient";

export const OwnerType = {
  Entry: "entry",
  Paragraph: "paragraph",
  Caption: "caption",
} as const;
export type OwnerType = (typeof OwnerType)[keyof typeof OwnerType];

export type Sentiment = {
  anger: number;
  disgust: number;
  fear: number;
  joy: number;
  neutral: number;
  sadness: number;
  surprise: number;
};

export async function insertEmbedding(
  ownerType: OwnerType,
  ownerId: number,
  vector: number[]
) {
  const { error } = await supabase.from("embedding").insert({
    owner_type: ownerType,
    owner_id: ownerId,
    dim: vector.length,
    vector: vector,
  });

  if (error) {
    console.error(`Error inserting embedding: ${error}`);
  }
}

async function getEmbedding(embId: number) {
  const { data, error } = await supabase
    .from("embedding")
    .select()
    .eq("emb_id", embId);

  if (error) {
    console.error(`Error retrieving embedding: ${error}`);
  }

  return data;
}

type ClosestEmbeddingRow = {
  emb_id: number;
  owner_id: number;
  owner_type: string;
  similarity: number;
};

export async function getClosestEmbeddings(
  emb: number[],
  n: number = 25
): Promise<ClosestEmbeddingRow[]> {
  const { data, error } = await supabase.rpc("get_closest_embeddings", {
    query_embedding: emb,
    match_count: n,
  });

  if (error) throw error;
  return (data ?? []) as ClosestEmbeddingRow[];
}

async function updateEmbedding(embId: number, vector: number[]) {
  const { error } = await supabase
    .from("embedding")
    .update({ vector: vector })
    .eq("emb_id", embId);

  if (error) {
    console.error(`Error updating embedding: ${error}`);
  }
}

export async function insertEntrySentiment(
  entryId: number,
  sentiment: Sentiment
) {
  const { error } = await supabase.from("entry_sentiment").insert({
    entry_id: entryId,
    anger: sentiment.anger,
    disgust: sentiment.disgust,
    fear: sentiment.fear,
    joy: sentiment.joy,
    neutral: sentiment.neutral,
    sadness: sentiment.sadness,
    surprise: sentiment.surprise,
  });

  if (error) {
    console.error(`Error inserting entry sentiment: ${error}`);
  }
}

export async function insertParagraphSentiment(
  pgId: number,
  sentiment: Sentiment
) {
  const { error } = await supabase.from("paragraph_sentiment").insert({
    pg_id: pgId,
    anger: sentiment.anger,
    disgust: sentiment.disgust,
    fear: sentiment.fear,
    joy: sentiment.joy,
    neutral: sentiment.neutral,
    sadness: sentiment.sadness,
    surprise: sentiment.surprise,
  });

  if (error) {
    console.error(`Error inserting paragraph sentiment: ${error}`);
  }
}

async function updateEntrySentiment(entryId: number, sentiment: Sentiment) {
  const { error } = await supabase
    .from("entry_sentiment")
    .update({
      anger: sentiment.anger,
      disgust: sentiment.disgust,
      fear: sentiment.fear,
      joy: sentiment.joy,
      neutral: sentiment.neutral,
      sadness: sentiment.sadness,
      surprise: sentiment.surprise,
    })
    .eq("entry_id", entryId);

  if (error) {
    console.error(`Error updating entry sentiment: ${error}`);
  }
}

async function updateParagraphSentimentById(
  pgId: number,
  sentiment: Sentiment
) {
  const { error } = await supabase
    .from("paragraph_sentiment")
    .update({
      anger: sentiment.anger,
      disgust: sentiment.disgust,
      fear: sentiment.fear,
      joy: sentiment.joy,
      neutral: sentiment.neutral,
      sadness: sentiment.sadness,
      surprise: sentiment.surprise,
    })
    .eq("pg_id", pgId);

  if (error) {
    console.error(`Error updating paragraph sentiment by id: ${error}`);
  }
}

export async function createEmbedding(text: string[], doPgs: boolean = true) {
  const { data, error } = await supabase.functions.invoke("embeddings", {
    body: {
      paragraphs: text,
      analyzePgs: doPgs,
    },
  });

  if (error) {
    console.error(`Error creating text embedding: ${error}`);
  }

  return data;
}

export async function analyzeSentiment(text: string[], doPgs: boolean = true) {
  const { data, error } = await supabase.functions.invoke("sentiment", {
    body: {
      paragraphs: text,
      analyzePgs: doPgs,
    },
  });

  if (error) {
    console.error(`Error analyzing text sentiment: ${error}`);
  }

  return data;
}
