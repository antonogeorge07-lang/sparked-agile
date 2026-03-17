import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Loader2, FolderKanban, ListChecks, Zap, IterationCcw, Lightbulb } from "lucide-react";
import { useGlobalSearch, SearchResult } from "@/hooks/useGlobalSearch";

const TYPE_META: Record<SearchResult["type"], { icon: typeof FolderKanban; label: string }> = {
  project: { icon: FolderKanban, label: "Project" },
  backlog_item: { icon: ListChecks, label: "Backlog" },
  sprint: { icon: IterationCcw, label: "Sprint" },
  epic: { icon: Zap, label: "Epic" },
  task: { icon: ListChecks, label: "Task" },
};

export function GlobalSearchDialog() {
  const [open, setOpen] = useState(false);
  const { results, isSearching, search } = useGlobalSearch();
  const navigate = useNavigate();

  // Keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setOpen(false);
      navigate(result.route);
    },
    [navigate]
  );

  const handleValueChange = useCallback(
    (value: string) => {
      search(value);
    },
    [search]
  );

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const key = TYPE_META[r.type]?.label ?? r.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search projects, tasks, epics, sprints…"
        onValueChange={handleValueChange}
      />
      <CommandList>
        {isSearching ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Searching…
          </div>
        ) : (
          <>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
                <Lightbulb className="h-5 w-5" />
                <p className="text-sm">No results found. Try a different keyword.</p>
              </div>
            </CommandEmpty>

            {Object.entries(grouped).map(([groupLabel, items]) => {
              const Icon = TYPE_META[items[0].type]?.icon ?? ListChecks;
              return (
                <CommandGroup key={groupLabel} heading={groupLabel}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${item.type}-${item.id}-${item.title}`}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[360px]">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.status && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {item.status}
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </>
        )}
      </CommandList>

      <div className="border-t px-3 py-2 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>{" "}
          to toggle
        </span>
        <span>{results.length} result{results.length !== 1 ? "s" : ""}</span>
      </div>
    </CommandDialog>
  );
}
