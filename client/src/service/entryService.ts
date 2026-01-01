import { supabase } from "./supabaseClient";

type EntryUpdate = {
  date?: Date;
  title?: string;
  text?: string;
  wordCount?: number;
};

export async function insertEntry(
  userId: string,
  date: Date,
  title: string,
  text: string,
  wordCount: number
) {
  const { data, error } = await supabase
    .from("entry")
    .insert({
      user_id: userId,
      entry_date: date,
      title: title,
      full_text: text,
      word_count: wordCount,
    })
    .select();

  if (error) {
    console.error(`Error inserting entry: ${error}`);
  }

  return data;
}

export async function getEntries(includeSentiment: boolean = false) {
  const select = includeSentiment ? "*, entry_sentiment (*)" : "";
  const { data, error } = await supabase
    .from("entry")
    .select(select)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error retrieving entries: ${error}`);
  }

  return data;
}

export async function getEntryById(entryId: number) {
  const { data, error } = await supabase
    .from("entry")
    .select()
    .eq("entry_id", entryId);

  if (error) {
    console.error(`Error retrieving entry: ${error}`);
  }

  return data;
}

async function updateEntry(entryId: number, updates: EntryUpdate) {
  const payload: Record<string, any> = {};

  if (updates.date !== undefined) payload.entry_date = updates.date;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.text !== undefined) payload.full_text = updates.text;
  if (updates.wordCount !== undefined) payload.word_count = updates.wordCount;

  if (Object.keys(payload).length === 0) return;

  const { data, error } = await supabase
    .from("entry")
    .update(payload)
    .eq("entry_id", entryId);

  if (error) {
    console.error(`Error updating entry: ${error}`);
  }

  return data;
}

async function deleteEntry(entryId: number) {
  const { error } = await supabase
    .from("entry")
    .delete()
    .eq("entry_id", entryId);

  if (error) {
    console.error(`Error deleting entry: ${error}`);
  }
}

export async function insertParagraph(
  entryId: number,
  index: number,
  text: string
) {
  const { data, error } = await supabase
    .from("paragraph")
    .insert({
      entry_id: entryId,
      pg_index: index,
      text: text,
    })
    .select();

  if (error) {
    console.error(`Error inserting paragraph: ${error}`);
  }

  return data;
}

export async function getParagraphById(pgId: number) {
  const { data, error } = await supabase
    .from("paragraph")
    .select()
    .eq("pg_id", pgId);

  if (error) {
    console.error(`Error retrieving paragraph by id: ${error}`);
  }

  return data;
}

async function getParagraphByIndex(entryId: number, index: number) {
  const { data, error } = await supabase
    .from("paragraph")
    .select()
    .eq("entry_id", entryId)
    .eq("pg_index", index);

  if (error) {
    console.error(`Error retrieving paragraph by index: ${error}`);
  }

  return data;
}

async function updateParagraphById(pgId: number, text: string) {
  const { error } = await supabase
    .from("paragraph")
    .update({ text: text })
    .eq("pg_id", pgId);

  if (error) {
    console.error(`Error updating paragraph by id: ${error}`);
  }
}

async function updateParagraphByIndex(
  entryId: number,
  index: number,
  text: string
) {
  const { error } = await supabase
    .from("paragraph")
    .update({ text: text })
    .eq("entry_id", entryId)
    .eq("pg_index", index);

  if (error) {
    console.error(`Error updating paragraph by index: ${error}`);
  }
}

async function insertTags(entryId: number, tags: string[]) {
  const rows = tags.map((name) => ({
    entry_id: entryId,
    name: name,
  }));

  const { error } = await supabase.from("tag").insert(rows);

  if (error) {
    console.error(`Error inserting tags: ${error}`);
  }
}

async function getTags(entryId: number) {
  const { data, error } = await supabase
    .from("tag")
    .select("name")
    .eq("entry_id", entryId);

  if (error) {
    console.error(`Error retrieving tags: ${error}`);
  }

  return data;
}
