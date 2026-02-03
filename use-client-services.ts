import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateClientServiceRequest, UpdateClientServiceRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export type ClientServicesListQuery = z.infer<typeof api.clientServices.list.input>;

export function useClientServices(query?: ClientServicesListQuery) {
  return useQuery({
    queryKey: [api.clientServices.list.path, query ?? {}],
    queryFn: async () => {
      const validated = api.clientServices.list.input.optional().parse(query);
      const qs = new URLSearchParams();
      if (validated?.clientId) qs.set("clientId", validated.clientId);
      if (validated?.serviceId) qs.set("serviceId", validated.serviceId);
      if (validated?.from) qs.set("from", validated.from);
      if (validated?.to) qs.set("to", validated.to);

      const url = qs.toString()
        ? `${api.clientServices.list.path}?${qs.toString()}`
        : api.clientServices.list.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les ventes");
      return parseWithLogging(api.clientServices.list.responses[200], await res.json(), "clientServices.list");
    },
  });
}

export function useCreateClientService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateClientServiceRequest) => {
      const validated = api.clientServices.create.input.parse(payload);
      const res = await fetch(api.clientServices.create.path, {
        method: api.clientServices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(
            api.clientServices.create.responses[400],
            await res.json(),
            "clientServices.create.400",
          );
          throw new Error(err.message);
        }
        throw new Error("Création impossible");
      }
      return parseWithLogging(api.clientServices.create.responses[201], await res.json(), "clientServices.create.201");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.clientServices.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
    },
  });
}

export function useUpdateClientService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateClientServiceRequest }) => {
      const validated = api.clientServices.update.input.parse(updates);
      const url = buildUrl(api.clientServices.update.path, { id });
      const res = await fetch(url, {
        method: api.clientServices.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(
            api.clientServices.update.responses[400],
            await res.json(),
            "clientServices.update.400",
          );
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(
            api.clientServices.update.responses[404],
            await res.json(),
            "clientServices.update.404",
          );
          throw new Error(err.message);
        }
        throw new Error("Mise à jour impossible");
      }
      return parseWithLogging(api.clientServices.update.responses[200], await res.json(), "clientServices.update.200");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.clientServices.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
    },
  });
}

export function useDeleteClientService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.clientServices.delete.path, { id });
      const res = await fetch(url, { method: api.clientServices.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(
          api.clientServices.delete.responses[404],
          await res.json(),
          "clientServices.delete.404",
        );
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Suppression impossible");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.clientServices.list.path] });
      qc.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
    },
  });
}
