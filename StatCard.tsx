import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  hint,
  icon,
  tone = "primary",
  className,
  "data-testid": testId,
}: {
  title: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "primary" | "accent" | "neutral";
  className?: string;
  "data-testid"?: string;
}) {
  const toneClasses =
    tone === "primary"
      ? "from-primary/14 via-primary/8 to-transparent border-primary/20"
      : tone === "accent"
        ? "from-accent/14 via-accent/8 to-transparent border-accent/20"
        : "from-muted/70 via-muted/30 to-transparent border-border/60";

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card/70 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
        "glass",
        className,
      )}
      data-testid={testId}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", toneClasses)} />
      <div className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-2xl dark:from-white/10" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{value}</div>
          {hint ? <div className="mt-1 text-sm text-muted-foreground">{hint}</div> : null}
        </div>
        {icon ? (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border/60 bg-background/60 shadow-sm">
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
