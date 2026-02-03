import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateServiceRequest, UpdateServiceRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export type ServicesListQuery = z.infer<typeof api.services.list.input>;

export function useServices(query?: ServicesListQuery) {
  return useQuery({
    queryKey: [api.services.list.path, query ?? {}],
    queryFn: async () => {
      const validated = api.services.list.input.optional().parse(query);
      const qs = new URLSearchParams();
      if (validated?.active != null) qs.set("active", String(validated.active));
      const url = qs.toString() ? `${api.services.list.path}?${qs.toString()}` : api.services.list.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les services");
      return parseWithLogging(api.services.list.responses[200], await res.json(), "services.list");
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateServiceRequest) => {
      const validated = api.services.create.input.parse(payload);
      const res = await fetch(api.services.create.path, {
        method: api.services.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.services.create.responses[400], await res.json(), "services.create.400");
          throw new Error(err.message);
        }
        throw new Error("Création impossible");
      }
      return parseWithLogging(api.services.create.responses[201], await res.json(), "services.create.201");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.services.list.path] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateServiceRequest }) => {
      const validated = api.services.update.input.parse(updates);
      const url = buildUrl(api.services.update.path, { id });
      const res = await fetch(url, {
        method: api.services.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.services.update.responses[400], await res.json(), "services.update.400");
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(api.services.update.responses[404], await res.json(), "services.update.404");
          throw new Error(err.message);
        }
        throw new Error("Mise à jour impossible");
      }
      return parseWithLogging(api.services.update.responses[200], await res.json(), "services.update.200");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.services.list.path] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.services.delete.path, { id });
      const res = await fetch(url, { method: api.services.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.services.delete.responses[404], await res.json(), "services.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Suppression impossible");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.services.list.path] }),
  });
}
