import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Loader2 } from "lucide-react";
import { EntrySidePanel } from "./EntrySidePanel";
import {
  createEmbedding,
  analyzeSentiment,
  insertEmbedding,
  insertEntrySentiment,
  insertParagraphSentiment,
  OwnerType,
  type Sentiment,
} from "@/service/analyzeService";
import {
  insertEntry,
  insertParagraph,
  insertTags,
} from "@/service/entryService";
import {
  FileType,
  insertAttachment,
  uploadFile,
} from "@/service/uploadService";
import { useAuth } from "@/auth/AuthProvider";
import { Input } from "./ui/input";

function countWords(text: string) {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function getEntryDate() {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Editor({ className = "" }: { className?: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [attachments, setAttachments] = useState<
    {
      id: string;
      name: string;
      size: string;
      file: File;
      caption: string | undefined;
    }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const wordCount = useMemo(() => countWords(body), [body]);

  async function submit() {
    if (isSubmitting || !body) return;
    setIsSubmitting(true);

    try {
      const paragraphs = body.split("\n").filter((e) => e);
      const uid = user?.id;

      var entryRes = await insertEntry(
        uid!,
        new Date(),
        title,
        body,
        wordCount
      );
      const entryId = entryRes![0].entry_id;
      const pgIds = new Map<number, number>();

      if (entryRes) {
        paragraphs.forEach(async (p, i) => {
          var pgRes = await insertParagraph(entryId, i, p);
          if (pgRes) pgIds.set(i, pgRes[0].pg_id);
        });
      }

      await insertTags(entryId, tags);

      var embRes = await createEmbedding(paragraphs);
      await insertEmbedding(
        OwnerType.Entry,
        entryId,
        embRes.fullText.embedding
      );
      embRes.paragraphs.forEach(
        async (e: { index: number; embedding: number[] }) => {
          const pgId = pgIds.get(e.index);
          await insertEmbedding(OwnerType.Paragraph, pgId!, e.embedding);
        }
      );

      var sentRes = await analyzeSentiment(paragraphs);
      const fullSentiment = toSentiment(sentRes.fullText.emotion);
      const paragraphSentiments = sentRes.paragraphs.map(
        (p: {
          index: any;
          emotion: { label: string; score: number }[] | null | undefined;
        }) => ({
          index: p.index,
          sentiment: toSentiment(p.emotion),
        })
      );

      await insertEntrySentiment(entryId, fullSentiment);
      paragraphSentiments.forEach(
        async (p: { index: number; sentiment: Sentiment }) => {
          const pgId = pgIds.get(p.index);
          await insertParagraphSentiment(pgId!, p.sentiment);
        }
      );

      await submitAttachments(entryId);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitAttachments(entryId: number) {
    attachments.forEach(async (a) => {
      const filePath = await uploadFile(entryId, a.file, user!.id);
      if (filePath) {
        var attachmentRes = await insertAttachment(
          entryId,
          a.name,
          filePath,
          getFileType(a.file),
          a.caption
        );

        if (a.caption) {
          var embRes = await createEmbedding([a.caption], false);
          await insertEmbedding(
            OwnerType.Caption,
            attachmentRes![0].att_id,
            embRes.fullText.embedding
          );
        }
      }
    });
  }

  function getFileType(file: File): FileType {
    const mime = file.type;

    if (mime.startsWith("audio/")) {
      return FileType.Audio;
    }

    if (mime.startsWith("image/")) {
      return FileType.Image;
    }

    if (mime === "application/pdf") {
      return FileType.Document;
    }

    throw new Error(`Unsupported file type: ${mime}`);
  }

  type EmotionItem = { label: string; score: number };

  function toSentiment(emotion: EmotionItem[] | null | undefined): Sentiment {
    type SentimentLabel =
      | "anger"
      | "disgust"
      | "fear"
      | "joy"
      | "neutral"
      | "sadness"
      | "surprise";

    const out: Sentiment = {
      anger: 0,
      disgust: 0,
      fear: 0,
      joy: 0,
      neutral: 0,
      sadness: 0,
      surprise: 0,
    };

    if (!emotion) return out;

    for (const { label, score } of emotion) {
      if (label in out) {
        out[label as SentimentLabel] = score;
      }
    }
    return out;
  }

  function commitTag() {
    var t = newTag.trim();
    if (!t || tags.length == 5) {
      setIsAddingTag(false);
      setNewTag("");
      return;
    }

    t = t.toLowerCase();
    setTags((prev) => (prev.includes(t) ? prev : [...prev, t]));

    setIsAddingTag(false);
    setNewTag("");
  }

  function cancelTag() {
    setIsAddingTag(false);
    setNewTag("");
  }

  return (
    <div className={`grid min-h-0 grid-cols-[1fr_360px] gap-4 ${className}`}>
      {/* Main editor */}
      <Card className="min-h-0 overflow-hidden">
        <div className="flex h-14 items-center px-6">
          <div className="mr-auto">
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString(undefined, { weekday: "long" })}
            </div>
            <div className="font-semibold">{getEntryDate()}</div>
          </div>

          <div className="flex max-w-[60%] flex-wrap justify-end gap-2 items-center">
            {tags.map((t) => (
              <Button
                key={t}
                size="sm"
                variant="ghost"
                className="h-6 px-2 gap-1 text-xs font-normal bg-muted-foreground/15 text-muted-foreground hover:bg-muted-foreground/25 cursor-pointer"
                onClick={() => setTags(tags.filter((tag) => tag !== t))}
              >
                <X className="h-3 w-3" />
                {t}
              </Button>
            ))}

            {isAddingTag ? (
              <Input
                autoFocus
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onBlur={commitTag}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " " || e.key === ",") {
                    e.preventDefault();
                    commitTag();
                    setIsAddingTag(true);
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    cancelTag();
                  }
                }}
                placeholder="New tag..."
                className="h-6 w-22 px-2 text-xs placeholder:text-[0.8rem]"
              />
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => setIsAddingTag(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Tags
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-[calc(100vh-4rem-3.5rem-1rem)]">
          <div className="mx-auto max-w-3xl px-6 py-8 relative">
            {/* Overlay */}
            {isSubmitting && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                  <div className="text-med text-muted-foreground">
                    Saving entry, please wait…
                  </div>
                </div>
              </div>
            )}

            {/* Textbox */}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isSubmitting}
              className={`min-h-[60vh] w-full resize-none bg-transparent text-base leading-7 outline-none placeholder:text-muted-foreground transition-opacity"
                ${isSubmitting ? "opacity-75" : "opacity-100"}
              `}
              placeholder="Start writing…"
            />
          </div>
        </ScrollArea>
      </Card>

      {/* Right panel */}
      <EntrySidePanel
        title={title}
        setTitle={setTitle}
        wordCount={wordCount}
        attachments={attachments}
        setAttachments={setAttachments}
        onSubmit={submit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
