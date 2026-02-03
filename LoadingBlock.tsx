import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingBlock({
  label = "Chargement…",
  "data-testid": testId,
}: {
  label?: string;
  "data-testid"?: string;
}) {
  return (
    <div className="animate-float-in rounded-3xl border border-border/60 bg-card/60 p-6 shadow-soft" data-testid={testId}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{label}</div>
          <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-[70%]" />
            <Skeleton className="h-4 w-[55%]" />
          </div>
        </div>
        <div className="shimmer h-12 w-12 rounded-2xl bg-muted" />
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </div>
  );
}
