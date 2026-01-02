import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseClient";

export const FileType = {
  Image: "image",
  Audio: "audio",
  Document: "document",
} as const;
export type FileType = (typeof FileType)[keyof typeof FileType];

export async function insertAttachment(
  entryId: number,
  name: string,
  path: string,
  type: FileType,
  caption: string | undefined
) {
  const { data, error } = await supabase
    .from("attachment")
    .insert({
      entry_id: entryId,
      file_name: name,
      storage_path: path,
      file_type: type,
      caption: caption,
    })
    .select();

  if (error) {
    console.error(`Error inserting attachment: ${error}`);
  }

  return data;
}

async function getAttachments(entryId: number) {
  const { data, error } = await supabase
    .from("attachment")
    .select()
    .eq("entry_id", entryId);

  if (error) {
    console.error(`Error retrieving attachments: ${error}`);
  }

  return data;
}

export async function getAttachmentById(attId: number) {
  const { data, error } = await supabase
    .from("attachment")
    .select()
    .eq("att_id", attId);

  if (error) {
    console.error(`Error retrieving attachment by ID: ${error}`);
  }

  return data;
}

async function deleteAttachment(attId: number) {
  const { error } = await supabase
    .from("attachment")
    .delete()
    .eq("att_id", attId);

  if (error) {
    console.error(`Error deleting attachment: ${error}`);
  }
}

export async function uploadFile(entryId: number, file: File, userId: string) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${entryId}/${uuidv4()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("attachments")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error(`Error uploading file to bucket: ${error}`);
  }

  return data?.path;
}

export async function retrieveFileUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("attachments")
    .createSignedUrl(path, 60);

  if (error) {
    console.error(`Error retrieving file URL from bucket: ${error}`);
  }

  return data!.signedUrl;
}

async function deleteFile(path: string) {
  const { data, error } = await supabase.storage
    .from("attachments")
    .remove([path]);

  if (error) {
    console.error(`Error deleting file from bucket: ${error}`);
  }

  return data;
}
