import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BookOpen, LineChart, Settings, Plus, Search } from "lucide-react"

export function AppShell() {
  return (
    <div className="h-screen w-screen bg-muted/40 text-foreground">
      <div className="flex h-full flex-col p-4">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <div className="text-xl font-semibold tracking-tight">echo</div>
            <div className="text-sm text-muted-foreground">Journal</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary">Analyze</Button>
            <Button>Save</Button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid min-h-0 flex-1 grid-cols-[260px_360px_1fr] gap-4">
          {/* Sidebar */}
          <Card className="min-h-0 overflow-hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="text-sm font-medium text-muted-foreground">
                Navigation
              </div>
              <Button size="icon" variant="secondary" title="New entry">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <BookOpen className="h-4 w-4" /> Journal
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LineChart className="h-4 w-4" /> Insights
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Button>
            </div>
          </Card>

          {/* Entry list */}
          <Card className="min-h-0 overflow-hidden">
            <div className="flex h-14 items-center px-4">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Search entries..." />
              </div>
            </div>
            <Separator />
            <ScrollArea className="h-[calc(100vh-4rem-3.5rem-1rem)]">
              <div className="p-2">
                {Array.from({ length: 18 }).map((_, i) => (
                  <button
                    key={i}
                    className="w-full rounded-lg border border-transparent p-3 text-left transition hover:border-border hover:bg-muted"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Entry title {i + 1}</div>
                      <div className="text-xs text-muted-foreground">Dec 31</div>
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      A short preview of the entry content goes here…
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Editor */}
          <Card className="min-h-0 overflow-hidden">
            <div className="flex h-14 items-center justify-between px-6">
              <div>
                <div className="text-sm text-muted-foreground">Wednesday</div>
                <div className="font-semibold">December 31, 2025</div>
              </div>
              <Button size="sm" variant="secondary">
                Tags
              </Button>
            </div>
            <Separator />
            <ScrollArea className="h-[calc(100vh-4rem-3.5rem-1rem)]">
              <div className="mx-auto max-w-3xl px-6 py-8">
                <textarea
                  className="min-h-[60vh] w-full resize-none bg-transparent text-base leading-7 outline-none placeholder:text-muted-foreground"
                  placeholder="Start writing…"
                />
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  )
}
