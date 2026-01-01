import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  LineChart,
  Plus,
  Search,
  LogOut,
  Calendar,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Editor } from "./Editor";
import { Entries } from "./Entries";
import { useState } from "react";
import { SearchResults } from "./SearchResults";

export function AppShell() {
  type View =
    | "create"
    | "journal"
    | "calendar"
    | "insights"
    | "account"
    | "search";

  const [view, setView] = useState<View>("create");
  const [searchText, setSearchText] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const { signOut } = useAuth();

  function submitSearch() {
    const q = searchText.trim();
    if (!q) return;
    setActiveQuery(q);
    setView("search");
  }

  return (
    <div className="h-screen w-screen bg-muted/40 text-foreground">
      <div className="flex h-full flex-col p-4">
        {/* Top bar */}
        <div className="mb-4 flex items-center gap-3">
          <img
            src="/echo.png"
            alt="echo"
            className="pl-2 h-9 w-auto select-none"
          />

          <div className="mx-auto w-full max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="h-10 w-full rounded-xl pl-9"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitSearch();
                }}
                placeholder="Remind me of a time when I..."
              />
            </div>
          </div>

          {/* Logout */}
          <Button
            size="sm"
            className="gap-2 bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Main grid */}
        <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_360px] gap-4">
          {/* Sidebar */}
          <Card className="min-h-0 overflow-hidden p-2 pt-6">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 cursor-pointer"
              onClick={() => setView("create")}
            >
              <Plus className="h-4 w-4" /> Create
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 cursor-pointer"
              onClick={() => setView("journal")}
            >
              <BookOpen className="h-4 w-4" /> Journal
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 cursor-pointer"
              onClick={() => setView("calendar")}
            >
              <Calendar className="h-4 w-4" /> Calendar
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 cursor-pointer"
              onClick={() => setView("insights")}
            >
              <LineChart className="h-4 w-4" /> Insights
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 cursor-pointer"
              onClick={() => setView("account")}
            >
              <UserCircle className="h-4 w-4" /> Account
            </Button>
          </Card>

          {view === "create" && <Editor className="col-span-2" />}
          {view === "journal" && <Entries />}

          {view === "search" && (
            <SearchResults
              className="col-span-2"
              query={activeQuery}
              onBack={() => setView("create")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
