import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Paperclip } from "lucide-react";
import { useState } from "react";

type Attachment = {
  id: string;
  name: string;
  size: string;
};

export function EntrySidePanel({
  title,
  setTitle,
  wordCount,
  attachments,
  onSubmit,
}: {
  title: string;
  setTitle: (v: string) => void;
  wordCount: number;
  attachments: Attachment[];
  onSubmit: () => void;
}) {
  const [loading, setIsLoading] = useState(false);

  return (
    <Card className="flex min-h-0 flex-col p-4">
      {/* Top content */}
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-3">
          <div className="text-base font-semibold tracking-tight">
            Title (optional)
          </div>
          <Input
            placeholder="Untitled entry"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Word count */}
        <div className="text-sm text-muted-foreground">
          {wordCount.toLocaleString()} words
        </div>

        <Separator />

        {/* Attachments */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Attachments</div>
          <div className="text-xs text-muted-foreground">
            Attach PDFs, images, or audio
          </div>

          {attachments.length === 0 ? (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              No attachments yet
            </div>
          ) : (
            <ul className="space-y-2">
              {attachments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{a.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {a.size}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto space-y-2 pt-4">
        <Button variant="outline" className="w-full cursor-pointer">
          Upload attachment
        </Button>
        <Button className="w-full cursor-pointer" onClick={(e) => onSubmit()}>
          Save
        </Button>
      </div>
    </Card>
  );
}
