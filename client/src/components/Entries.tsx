import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { getEntries } from "@/service/entryService";
import { emotionRowToColor } from "@/lib/colorConverter";

type Entry = {
  entry_id: number;
  user_id: string;
  entry_date: string;
  title: string;
  full_text: string;
  word_count: number;
  created_at: string;
  updated_at: string;
};

export function Entries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function retrieve() {
      try {
        setLoading(true);
        setError(null);

        const entriesRes = await getEntries(true);
        if (!cancelled) setEntries(entriesRes ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load entries");
          setEntries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    retrieve();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="min-h-0 overflow-hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="text-base font-semibold tracking-tight">Entries</div>
      </div>

      <Separator />

      <ScrollArea className="h-[calc(100vh-4rem-3.5rem-1rem)]">
        <div className="p-2">
          {loading && (
            <div className="p-3 text-sm text-muted-foreground">Loading…</div>
          )}

          {!loading && error && (
            <div className="p-3 text-sm text-destructive">{error}</div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              No entries yet.
            </div>
          )}

          {!loading &&
            !error &&
            entries.map((entry) => {
              const color = entry.entry_sentiment
                ? emotionRowToColor(entry.entry_sentiment).hex
                : "transparent";

              return (
                <button
                  key={entry.entry_id}
                  className="relative w-full rounded-lg border border-transparent p-3 pl-5 text-left transition hover:border-border hover:bg-muted"
                >
                  {/* Left color stripe */}
                  <span
                    className="absolute left-0 top-1 bottom-1 w-1.5 rounded-l-lg"
                    style={{ backgroundColor: color }}
                  />

                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {entry.title?.trim() ? entry.title : entry.entry_date}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.entry_date}
                    </div>
                  </div>

                  <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {entry.full_text}
                  </div>
                </button>
              );
            })}
        </div>
      </ScrollArea>
    </Card>
  );
}
