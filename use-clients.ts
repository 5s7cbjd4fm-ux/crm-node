import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateClientRequest, UpdateClientRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export type ClientsListQuery = z.infer<typeof api.clients.list.input>;

export function useClients(query?: ClientsListQuery) {
  return useQuery({
    queryKey: [api.clients.list.path, query ?? {}],
    queryFn: async () => {
      const validated = api.clients.list.input.optional().parse(query);
      const qs = new URLSearchParams();
      if (validated?.q) qs.set("q", validated.q);
      if (validated?.archived != null) qs.set("archived", String(validated.archived));
      const url = qs.toString() ? `${api.clients.list.path}?${qs.toString()}` : api.clients.list.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les clients");
      return parseWithLogging(api.clients.list.responses[200], await res.json(), "clients.list");
    },
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateClientRequest) => {
      const validated = api.clients.create.input.parse(payload);
      const res = await fetch(api.clients.create.path, {
        method: api.clients.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.clients.create.responses[400], await res.json(), "clients.create.400");
          throw new Error(err.message);
        }
        throw new Error("Création impossible");
      }
      return parseWithLogging(api.clients.create.responses[201], await res.json(), "clients.create.201");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.clients.list.path] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateClientRequest }) => {
      const validated = api.clients.update.input.parse(updates);
      const url = buildUrl(api.clients.update.path, { id });
      const res = await fetch(url, {
        method: api.clients.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.clients.update.responses[400], await res.json(), "clients.update.400");
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(api.clients.update.responses[404], await res.json(), "clients.update.404");
          throw new Error(err.message);
        }
        throw new Error("Mise à jour impossible");
      }
      return parseWithLogging(api.clients.update.responses[200], await res.json(), "clients.update.200");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.clients.list.path] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.clients.delete.path, { id });
      const res = await fetch(url, { method: api.clients.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.clients.delete.responses[404], await res.json(), "clients.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Suppression impossible");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [api.clients.list.path] }),
  });
}
