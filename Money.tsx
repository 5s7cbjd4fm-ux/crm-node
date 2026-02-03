import * as React from "react";

export function formatEurFromCents(cents: number) {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function Money({
  cents,
  className,
  "data-testid": testId,
}: {
  cents: number;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <span className={className} data-testid={testId}>
      {formatEurFromCents(cents)}
    </span>
  );
}
