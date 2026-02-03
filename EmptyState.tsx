import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  "data-testid": testId,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-3xl border border-dashed border-border/70 bg-card/40 p-10 text-center",
        className,
      )}
      data-testid={testId}
    >
      {icon ? (
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border/60 bg-background/60 shadow-sm">
          {icon}
        </div>
      ) : null}
      <div className="mt-4 text-lg font-bold">{title}</div>
      {description ? <div className="mt-1 max-w-md text-sm text-muted-foreground">{description}</div> : null}
      {actionLabel && onAction ? (
        <Button
          onClick={onAction}
          className="mt-5 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
          data-testid={testId ? `${testId}-action` : undefined}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
