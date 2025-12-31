import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabaseClient"

export const FileType = {
    Image: "image",
    Audio: "audio",
    Document: "document"
} as const;
export type FileType = typeof FileType[keyof typeof FileType];

async function insertAttachment(
    entryId: number, 
    captionId: number | undefined,
    name: string,
    path: string,
    type: FileType
) {
    const { error } = await supabase
        .from("attachment")
        .insert({
            entry_id: entryId,
            caption_id: captionId,
            file_name: name,
            storage_path: path,
            file_type: type
        });

    if (error) {
        console.error(`Error inserting attachment: ${error}`);
    }
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

async function deleteAttachment(attId: number) {
    const { error } = await supabase
        .from("attachment")
        .delete()
        .eq("att_id", attId);

    if (error) {
        console.error(`Error deleting attachment: ${error}`);
    }
}

async function insertCaption(text: string) {
    const { error } = await supabase
        .from("caption")
        .insert({ text: text });

    if (error) {
        console.error(`Error inserting caption: ${error}`);
    }
}

async function getCaption(captionId: number) {
    const { data, error } = await supabase
        .from("caption")
        .select("text")
        .eq("caption_id", captionId);

    if (error) {
        console.error(`Error retrieving caption: ${error}`);
    }

    return data;
}

async function updateCaption(captionId: number, text: string) {
    const { error } = await supabase
        .from("caption")
        .update({ text: text })
        .eq("caption_id", captionId);

    if (error) {
        console.error(`Error updating caption: ${error}`);
    }
}

async function deleteCaption(captionId: number) {
    const { error } = await supabase
        .from("caption")
        .delete()
        .eq("caption_id", captionId);

    if (error) {
        console.error(`Error deleting caption: ${error}`);
    }
}

async function uploadFile(entryId: number, file: File, userId: string) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${entryId}/${uuidv4()}.${ext}`;

    const { data, error } = await supabase.storage
        .from("attachments")
        .upload(path, file, {
            contentType: file.type,
            upsert: false
        });

    if (error) {
        console.error(`Error uploading file to bucket: ${error}`);
    }

    return data?.path;
}

async function retrieveFileUrl(path: string) {
    const { data, error } = await supabase.storage
        .from("attachments")
        .createSignedUrl(path, 60);

    if (error) {
        console.error(`Error retrieving file URL from bucket: ${error}`);
    }

    return data?.signedUrl;
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