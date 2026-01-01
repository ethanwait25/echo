import { useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
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
import { insertEntry, insertParagraph } from "@/service/entryService";
import { useAuth } from "@/auth/AuthProvider";

function countWords(text: string) {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function Editor({ className = "" }: { className?: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { user } = useAuth();

  const wordCount = useMemo(() => countWords(body), [body]);

  const attachments: { id: string; name: string; size: string }[] = [];

  async function submit() {
    const paragraphs = body.split("\n").filter((e) => e);
    const uid = user?.id;

    var entryRes = await insertEntry(uid!, new Date(), title, body, wordCount);
    const entryId = entryRes![0].entry_id;
    const pgIds = new Map<number, number>();

    if (entryRes) {
      paragraphs.forEach(async (p, i) => {
        var pgRes = await insertParagraph(entryId, i, p);
        if (pgRes) pgIds.set(i, pgRes[0].pg_id);
      });
    }

    var embRes = await createEmbedding(paragraphs);
    await insertEmbedding(OwnerType.Entry, entryId, embRes.fullText.embedding);
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

  return (
    <div className={`grid min-h-0 grid-cols-[1fr_360px] gap-4 ${className}`}>
      {/* Main editor (stays same width as before: 1fr) */}
      <Card className="min-h-0 overflow-hidden">
        <div className="flex h-14 items-center justify-between px-6">
          <div>
            <div className="text-sm text-muted-foreground">Wednesday</div>
            <div className="font-semibold">December 31, 2025</div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Tags
          </Button>
        </div>

        <Separator />

        <ScrollArea className="h-[calc(100vh-4rem-3.5rem-1rem)]">
          <div className="mx-auto max-w-3xl px-6 py-8">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[60vh] w-full resize-none bg-transparent text-base leading-7 outline-none placeholder:text-muted-foreground"
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
        onSubmit={submit}
      />
    </div>
  );
}
