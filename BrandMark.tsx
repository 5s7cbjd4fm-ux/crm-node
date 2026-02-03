import * as React from "react";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  title = "Cap Finance Desk",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)} data-testid="brand-mark">
      <div
        className="relative grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-primary/90 to-accent/80 shadow-lg shadow-primary/20"
        aria-hidden="true"
      >
        <div className="absolute inset-0 rounded-2xl grain opacity-50" />
        <div className="relative h-5 w-5 rotate-12 rounded-xl bg-white/90 shadow-sm" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">{title}</div>
        <div className="text-xs text-muted-foreground">CRM mandataire</div>
      </div>
    </div>
  );
}
