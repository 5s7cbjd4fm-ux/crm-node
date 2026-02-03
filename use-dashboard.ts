import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { DashboardSummaryResponse } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export type DashboardQuery = z.infer<typeof api.dashboard.summary.input>;

export function useDashboardSummary(query?: DashboardQuery) {
  return useQuery<DashboardSummaryResponse>({
    queryKey: [api.dashboard.summary.path, query ?? {}],
    queryFn: async () => {
      const validated = api.dashboard.summary.input.optional().parse(query);
      const qs = new URLSearchParams();
      if (validated?.view) qs.set("view", validated.view);
      if (validated?.year != null) qs.set("year", String(validated.year));
      if (validated?.month != null) qs.set("month", String(validated.month));
      if (validated?.serviceId) qs.set("serviceId", validated.serviceId);
      if (validated?.clientId) qs.set("clientId", validated.clientId);

      const url = qs.toString()
        ? `${api.dashboard.summary.path}?${qs.toString()}`
        : api.dashboard.summary.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger le dashboard");
      const json = await res.json();
      return parseWithLogging(api.dashboard.summary.responses[200], json, "dashboard.summary");
    },
  });
}
