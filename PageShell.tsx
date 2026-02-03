import * as React from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  title,
  subtitle,
  actions,
  children,
  "data-testid": testId,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  "data-testid"?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" data-testid={testId}>
      <div className="pb-5 pt-6 md:pb-7 md:pt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl">{title}</h1>
            {subtitle ? (
              <div className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
                {subtitle}
              </div>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>

      <div className="pb-10 md:pb-14">{children}</div>
    </div>
  );
}

export function SectionCard({
  children,
  className,
  "data-testid": testId,
}: {
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div
      className={cn(
        "glass grain animate-float-in rounded-3xl border border-border/60 bg-card/60 shadow-soft",
        className,
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
