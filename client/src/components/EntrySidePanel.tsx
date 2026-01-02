import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";

type Attachment = {
  id: string;
  name: string;
  size: string;
  file: File;
  caption: string | undefined;
};

export function EntrySidePanel({
  title,
  setTitle,
  wordCount,
  attachments,
  setAttachments,
  onSubmit,
  isSubmitting,
}: {
  title: string;
  setTitle: (v: string) => void;
  wordCount: number;
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}) {
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFilesSelected(files: FileList | null) {
    if (!files) return;

    const accepted: File[] = [];
    for (const file of Array.from(files)) {
      if (isAllowedFile(file)) {
        accepted.push(file);
      }
    }

    const newAttachments: Attachment[] = Array.from(accepted).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: formatFileSize(file.size),
      file: file,
      caption: undefined,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function isAllowedFile(file: File) {
    return ["application/pdf", "image/", "audio/"].some((type) =>
      type.endsWith("/") ? file.type.startsWith(type) : file.type === type
    );
  }

  function updateCaption(id: string, caption: string) {
    setAttachments((prev) =>
      prev.map((x) => (x.id === id ? { ...x, caption } : x))
    );
  }

  return (
    <Card className="flex min-h-0 flex-col p-4">
      {/* Top content */}
      <div className="flex min-h-0 flex-1 flex-col space-y-4">
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
        <div className="flex min-h-0 flex-1 flex-col space-y-2">
          <div className="text-sm font-medium">Attachments</div>
          <div className="text-xs text-muted-foreground">
            Attach PDFs, images, or audio
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {attachments.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                No attachments yet
              </div>
            ) : (
              <ul className="space-y-2">
                {attachments.map((a) => (
                  <li key={a.id} className="rounded-md border p-2">
                    <div
                      className="
                        group flex items-center gap-2 rounded-md border px-3 py-2 text-sm
                        transition-colors
                        hover:bg-destructive/10 hover:border-destructive/30
                        cursor-pointer
                      "
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((x) => x.id !== a.id)
                        )
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <span className="relative h-4 w-4">
                        <Paperclip className="absolute h-4 w-4 text-muted-foreground transition-opacity group-hover:opacity-0" />
                        <X className="absolute h-4 w-4 text-destructive opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>

                      <span className="truncate transition-colors group-hover:text-destructive group-hover:line-through">
                        {a.name}
                      </span>

                      <span className="ml-auto text-xs text-muted-foreground transition-colors group-hover:text-destructive/80">
                        {a.size}
                      </span>
                    </div>

                    <div className="pt-1">
                      <Input
                        className="
                          w-full
                          h-6 !text-[12px] placeholder:text-[10px]
                          border-muted-foreground/20
                          bg-muted/60
                          px-2
                          focus:bg-background
                          focus:border-ring
                        "
                        placeholder="Caption (optional)"
                        value={a.caption}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        onChange={(e) => updateCaption(a.id, e.target.value)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto space-y-2 pt-4">
        <Button
          variant="outline"
          className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload attachment
        </Button>
        <Button
          className={`
            w-full transition-colors cursor-pointer
            ${saved ? "bg-green-600 hover:bg-green-600 text-white" : ""}
            disabled:cursor-not-allowed disabled:opacity-60
          `}
          disabled={isSubmitting || saved || wordCount == 0}
          onClick={async () => {
            await onSubmit();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          {isSubmitting ? "Saving..." : saved ? "Saved" : "Save"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="application/pdf,image/*,audio/*"
        className="hidden"
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </Card>
  );
}
