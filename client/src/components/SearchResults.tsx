import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  createEmbedding,
  getClosestEmbeddings,
  OwnerType,
} from "@/service/analyzeService";
import { getEntryById, getParagraphById } from "@/service/entryService";
import { getAttachmentById, retrieveFileUrl } from "@/service/uploadService";
import { FileText, Volume2 } from "lucide-react";

type SearchDisplayItem =
  | {
      kind: "entry";
      id: number;
      date: string;
      title?: string;
      text: string;
    }
  | {
      kind: "paragraph";
      id: number;
      text: string;
    }
  | {
      kind: "attachment";
      id: number;
      text: string;
      path: string;
      src: string;
      name: string;
      type: string;
    };

function formatEntryDate(isoDate: string) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type ResultFilter = "all" | "entries" | "paragraphs" | "attachments";

function nextFilter(f: ResultFilter): ResultFilter {
  if (f === "all") return "entries";
  if (f === "entries") return "paragraphs";
  if (f === "paragraphs") return "attachments";
  return "all";
}

function filterLabel(f: ResultFilter) {
  if (f === "all") return "All";
  if (f === "entries") return "Entries";
  if (f === "paragraphs") return "Paragraphs";
  return "Attachments";
}

function AttachmentTile({ type }: { type: "document" | "audio" }) {
  const Icon = type === "document" ? FileText : Volume2;

  return (
    <div
      role="button"
      tabIndex={0}
      className="
        mt-2 relative
        flex h-32 w-32 items-center justify-center
        rounded-lg border border-dashed
        bg-background
        bg-muted/100
        text-muted-foreground

        cursor-pointer select-none
        transition

        hover:bg-muted/50 hover:border-muted-foreground/40 hover:text-foreground
        active:scale-[0.98]

        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring
        focus-visible:ring-offset-2 focus-visible:ring-offset-background
      "
    >
      <Icon className="h-10 w-10" />
    </div>
  );
}

export function SearchResults({
  query,
  onBack,
  className,
}: {
  query: string;
  onBack: () => void;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchDisplayItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<ResultFilter>("all");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const embRes = await createEmbedding([query], false);
        const closest = await getClosestEmbeddings(embRes!.fullText.embedding);

        const data = await Promise.all(
          closest.map(async (e) => {
            if (e.owner_type === OwnerType.Entry) {
              const res = await getEntryById(e.owner_id);
              const entry = Array.isArray(res) ? res[0] : res;
              if (!entry) return null;

              const title = (entry.title ?? "").trim();
              return {
                kind: "entry",
                id: entry.entry_id,
                date: entry.entry_date,
                title: title.length ? title : undefined,
                text: entry.full_text ?? "",
              } satisfies SearchDisplayItem;
            }

            if (e.owner_type === OwnerType.Paragraph) {
              const res = await getParagraphById(e.owner_id);
              const pg = Array.isArray(res) ? res[0] : res;
              if (!pg) return null;

              return {
                kind: "paragraph",
                id: pg.pg_id,
                text: pg.text ?? "",
              } satisfies SearchDisplayItem;
            }

            if (e.owner_type === OwnerType.Caption) {
              const res = await getAttachmentById(e.owner_id);
              const att = Array.isArray(res) ? res[0] : res;
              if (!att) return null;

              const fileUrl = await retrieveFileUrl(att.storage_path);

              return {
                kind: "attachment",
                id: att.att_id,
                text: att.caption ?? "",
                path: att.storage_path,
                src: fileUrl,
                name: att.file_name,
                type: att.file_type,
              } satisfies SearchDisplayItem;
            }

            return null;
          })
        );

        if (!cancelled) setResults(data.filter(Boolean) as SearchDisplayItem[]);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Search failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const filteredResults = useMemo(() => {
    if (filter === "all") return results;
    if (filter === "entries") return results.filter((r) => r.kind === "entry");
    if (filter === "paragraphs")
      return results.filter((r) => r.kind === "paragraph");
    return results.filter((r) => r.kind === "attachment");
  }, [results, filter]);

  return (
    <Card
      className={`min-h-0 overflow-hidden p-4 flex flex-col ${className ?? ""}`}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Search</div>
          <div className="text-lg font-semibold">{query}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter((f) => nextFilter(f))}
            disabled={loading || !!error || results.length === 0}
            title="Filter results"
            className="cursor-pointer"
          >
            Show: {filterLabel(filter)}
          </Button>

          <Button variant="ghost" className="cursor-pointer" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">Searching…</div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {filteredResults.length === 0 ? (
            <div className="text-sm text-muted-foreground">No results.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredResults.map((r) => (
                <div
                  key={`${r.kind}-${r.id}`}
                  className="
                    aspect-square overflow-hidden
                    rounded-xl border bg-background p-3
                    transition hover:bg-muted/40
                  "
                >
                  {r.kind === "paragraph" ? (
                    <>
                      <div className="text-xs font-medium text-muted-foreground">
                        Paragraph
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-sm">
                        {r.text}
                      </div>
                    </>
                  ) : r.kind === "attachment" ? (
                    <>
                      <div className="text-xs font-medium text-muted-foreground">
                        Attachment
                      </div>

                      <div className="text-sm font-semibold">{r.name}</div>

                      {r.type === "image" ? (
                        <img
                          src={r.src}
                          className="mt-1 max-h-64 max-w-full rounded-md object-contain"
                          alt=""
                        />
                      ) : r.type === "document" || r.type === "audio" ? (
                        <AttachmentTile type={r.type} />
                      ) : null}

                      <div className="mt-1 whitespace-pre-wrap text-sm">
                        {r.text}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="text-sm font-semibold">
                          {r.title ?? "Untitled"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatEntryDate(r.date)}
                        </div>
                      </div>
                      <div className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-foreground/90">
                        {r.text}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
