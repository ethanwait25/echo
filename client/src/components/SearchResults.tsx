import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  createEmbedding,
  getClosestEmbeddings,
  OwnerType,
} from "@/service/analyzeService";
import { getEntryById, getParagraphById } from "@/service/entryService";

type SearchDisplayItem =
  | {
      kind: "entry";
      id: number;
      date: string; // ISO date
      title?: string;
      text: string;
    }
  | {
      kind: "paragraph";
      id: number;
      text: string;
    };

function formatEntryDate(isoDate: string) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type ResultFilter = "both" | "entries" | "paragraphs";

function nextFilter(f: ResultFilter): ResultFilter {
  if (f === "both") return "entries";
  if (f === "entries") return "paragraphs";
  return "both";
}

function filterLabel(f: ResultFilter) {
  if (f === "both") return "Both";
  if (f === "entries") return "Entries";
  return "Paragraphs";
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

  const [filter, setFilter] = useState<ResultFilter>("both");

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
    if (filter === "both") return results;
    if (filter === "entries") return results.filter((r) => r.kind === "entry");
    return results.filter((r) => r.kind === "paragraph");
  }, [results, filter]);

  return (
    <Card className={`min-h-0 overflow-hidden p-4 ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between">
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
          >
            Show: {filterLabel(filter)}
          </Button>

          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">Searching…</div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="space-y-2">
          {filteredResults.length === 0 ? (
            <div className="text-sm text-muted-foreground">No results.</div>
          ) : (
            filteredResults.map((r) => (
              <div key={`${r.kind}-${r.id}`} className="rounded-lg border p-3">
                {r.kind === "paragraph" ? (
                  <>
                    <div className="text-xs font-medium text-muted-foreground">
                      Paragraph
                    </div>
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
            ))
          )}
        </div>
      )}
    </Card>
  );
}
