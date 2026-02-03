import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/PageShell";
import { Separator } from "@/components/ui/separator";

export function DataTableShell({
  toolbarLeft,
  toolbarRight,
  query,
  onQueryChange,
  placeholder = "Rechercher…",
  filters,
  children,
  "data-testid": testId,
}: {
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  query: string;
  onQueryChange: (v: string) => void;
  placeholder?: string;
  filters?: React.ReactNode;
  children: React.ReactNode;
  "data-testid"?: string;
}) {
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  return (
    <SectionCard className="overflow-hidden" data-testid={testId}>
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {toolbarLeft}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={placeholder}
                className="h-11 rounded-2xl pl-10"
                data-testid={testId ? `${testId}-search` : "table-search"}
              />
            </div>

            {filters ? (
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-11 rounded-2xl border-border/70 bg-card/60",
                  filtersOpen ? "shadow-soft" : "",
                )}
                onClick={() => setFiltersOpen((v) => !v)}
                data-testid={testId ? `${testId}-filters-toggle` : "table-filters-toggle"}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtres
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">{toolbarRight}</div>
        </div>

        {filters ? (
          <div
            className={cn(
              "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
              filtersOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0">
              <Separator className="my-4" />
              <div className="rounded-2xl border border-border/60 bg-background/50 p-3 sm:p-4">
                {filters}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <Separator className="bg-border/60" />

      <div className="p-2 sm:p-3">{children}</div>
    </SectionCard>
  );
}
