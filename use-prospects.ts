import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateProspectRequest, UpdateProspectRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export type ProspectsListQuery = z.infer<typeof api.prospects.list.input>;

export function useProspects(query?: ProspectsListQuery) {
  return useQuery({
    queryKey: [api.prospects.list.path, query ?? {}],
    queryFn: async () => {
      const validated = api.prospects.list.input.optional().parse(query);
      const qs = new URLSearchParams();
      if (validated?.q) qs.set("q", validated.q);
      if (validated?.archived != null) qs.set("archived", String(validated.archived));
      const url = qs.toString() ? `${api.prospects.list.path}?${qs.toString()}` : api.prospects.list.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les prospects");
      return parseWithLogging(api.prospects.list.responses[200], await res.json(), "prospects.list");
    },
  });
}

export function useCreateProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProspectRequest) => {
      const validated = api.prospects.create.input.parse(payload);
      const res = await fetch(api.prospects.create.path, {
        method: api.prospects.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.prospects.create.responses[400], await res.json(), "prospects.create.400");
          throw new Error(err.message);
        }
        throw new Error("Création impossible");
      }
      return parseWithLogging(api.prospects.create.responses[201], await res.json(), "prospects.create.201");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.prospects.list.path] }),
  });
}

export function useUpdateProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateProspectRequest }) => {
      const validated = api.prospects.update.input.parse(updates);
      const url = buildUrl(api.prospects.update.path, { id });
      const res = await fetch(url, {
        method: api.prospects.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.prospects.update.responses[400], await res.json(), "prospects.update.400");
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(api.prospects.update.responses[404], await res.json(), "prospects.update.404");
          throw new Error(err.message);
        }
        throw new Error("Mise à jour impossible");
      }
      return parseWithLogging(api.prospects.update.responses[200], await res.json(), "prospects.update.200");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.prospects.list.path] }),
  });
}

export function useDeleteProspect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.prospects.delete.path, { id });
      const res = await fetch(url, { method: api.prospects.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.prospects.delete.responses[404], await res.json(), "prospects.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Suppression impossible");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.prospects.list.path] }),
  });
}
