import * as React from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageShell } from "@/components/PageShell";
import { DataTableShell } from "@/components/DataTableShell";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Money, formatEurFromCents } from "@/components/Money";
import {
  useClientServices,
  useCreateClientService,
  useUpdateClientService,
  useDeleteClientService,
} from "@/hooks/use-client-services";
import { useClients } from "@/hooks/use-clients";
import { useServices } from "@/hooks/use-services";
import type { Client, ClientService, CreateClientServiceRequest, Service } from "@shared/schema";
import { z } from "zod";
import { Receipt, Plus, Pencil, Trash2, CalendarDays, Filter, Euro, Users, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  serviceId: z.string().min(1, "Service requis"),
  amountCents: z.coerce.number().int().min(0, "Montant requis"),
  currency: z.string().min(1).default("EUR"),
  occurredAt: z.string().min(1, "Date requise"),
  notes: z.string().optional().or(z.literal("")),
  commissionRatePercent: z.coerce.number().min(0).max(100).default(3.5),
  commissionAmountCentsOverride: z.coerce.number().int().min(0).optional().nullable(),
  isSplit: z.boolean().default(false),
  splitRatio: z.coerce.number().min(0).max(1).default(1.0),
  partnerName: z.string().optional().nullable(),
});

function toDateInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function SaleForm({
  mode,
  open,
  onOpenChange,
  initial,
  clients,
  services,
  onSubmit,
  isPending,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ClientService | null;
  clients: Client[];
  services: Service[];
  onSubmit: (payload: CreateClientServiceRequest) => void;
  isPending: boolean;
}) {
  const [clientId, setClientId] = React.useState(initial?.clientId ?? "");
  const [serviceId, setServiceId] = React.useState(initial?.serviceId ?? "");
  const [amountCents, setAmountCents] = React.useState<number>(initial?.amountCents ?? 0);
  const [currency, setCurrency] = React.useState(initial?.currency ?? "EUR");
  const [occurredAt, setOccurredAt] = React.useState<string>(() => {
    const v = initial?.occurredAt ? new Date(initial.occurredAt as any) : new Date();
    return toDateInputValue(v);
  });
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [commissionRatePercent, setCommissionRatePercent] = React.useState<number>(
    Number((initial as any)?.commissionRatePercent ?? 3.5)
  );
  const [commissionAmountCentsOverride, setCommissionAmountCentsOverride] = React.useState<number | null>(
    (initial as any)?.commissionAmountCentsOverride ?? null
  );
  const [useFixedCommission, setUseFixedCommission] = React.useState<boolean>(
    (initial as any)?.commissionAmountCentsOverride != null
  );
  const [isSplit, setIsSplit] = React.useState<boolean>((initial as any)?.isSplit ?? false);
  const [splitRatio, setSplitRatio] = React.useState<number>(
    Number((initial as any)?.splitRatio ?? 1.0)
  );
  const [partnerName, setPartnerName] = React.useState<string>((initial as any)?.partnerName ?? "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setClientId(initial?.clientId ?? "");
      setServiceId(initial?.serviceId ?? "");
      setAmountCents(initial?.amountCents ?? 0);
      setCurrency(initial?.currency ?? "EUR");
      const v = initial?.occurredAt ? new Date(initial.occurredAt as any) : new Date();
      setOccurredAt(toDateInputValue(v));
      setNotes(initial?.notes ?? "");
      setCommissionRatePercent(Number((initial as any)?.commissionRatePercent ?? 3.5));
      setCommissionAmountCentsOverride((initial as any)?.commissionAmountCentsOverride ?? null);
      setUseFixedCommission((initial as any)?.commissionAmountCentsOverride != null);
      setIsSplit((initial as any)?.isSplit ?? false);
      setSplitRatio(Number((initial as any)?.splitRatio ?? 1.0));
      setPartnerName((initial as any)?.partnerName ?? "");
      setErrors({});
    }
  }, [open, initial]);

  const computedCommission = React.useMemo(() => {
    if (useFixedCommission && commissionAmountCentsOverride != null) {
      return Math.round(commissionAmountCentsOverride * splitRatio);
    }
    return Math.round(amountCents * (commissionRatePercent / 100) * splitRatio);
  }, [amountCents, commissionRatePercent, commissionAmountCentsOverride, useFixedCommission, splitRatio]);

  const submit = () => {
    const parsed = formSchema.safeParse({
      clientId,
      serviceId,
      amountCents,
      currency,
      occurredAt,
      notes,
      commissionRatePercent,
      commissionAmountCentsOverride: useFixedCommission ? commissionAmountCentsOverride : null,
      isSplit,
      splitRatio: isSplit ? splitRatio : 1.0,
      partnerName: isSplit ? partnerName : null,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (next[String(i.path[0])] = i.message));
      setErrors(next);
      return;
    }

    onSubmit({
      clientId: parsed.data.clientId,
      serviceId: parsed.data.serviceId,
      amountCents: parsed.data.amountCents,
      currency: parsed.data.currency,
      occurredAt: new Date(parsed.data.occurredAt).toISOString() as any,
      notes: parsed.data.notes || undefined,
      commissionRatePercent: parsed.data.commissionRatePercent,
      commissionAmountCentsOverride: parsed.data.commissionAmountCentsOverride,
      isSplit: parsed.data.isSplit,
      splitRatio: parsed.data.splitRatio,
      partnerName: parsed.data.partnerName,
    } as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl border-border/70 bg-card/85 p-0 backdrop-blur-xl">
        <div className="p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {mode === "create" ? "Nouvelle vente" : "Modifier la vente"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Une vente = un client + un service + un montant + une date. Elle alimente le dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger
                  className={cn("mt-2 h-11 rounded-2xl", errors.clientId ? "border-destructive" : "")}
                  data-testid="sale-clientId"
                >
                  <SelectValue placeholder="Choisir un client" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId ? <div className="mt-1 text-xs text-destructive">{errors.clientId}</div> : null}
            </div>

            <div className="sm:col-span-1">
              <Label>Service *</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger
                  className={cn("mt-2 h-11 rounded-2xl", errors.serviceId ? "border-destructive" : "")}
                  data-testid="sale-serviceId"
                >
                  <SelectValue placeholder="Choisir un service" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceId ? <div className="mt-1 text-xs text-destructive">{errors.serviceId}</div> : null}
            </div>

            <div className="sm:col-span-1">
              <Label>Montant (EUR) *</Label>
              <div className="relative mt-2">
                <Euro className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  value={amountCents / 100}
                  onChange={(e) => setAmountCents(Math.round(Number(e.target.value) * 100))}
                  className={cn("h-11 rounded-2xl pl-10", errors.amountCents ? "border-destructive" : "")}
                  min={0}
                  data-testid="sale-amountCents"
                />
              </div>
              {errors.amountCents ? <div className="mt-1 text-xs text-destructive">{errors.amountCents}</div> : null}
            </div>

            <div className="sm:col-span-1">
              <Label>Date *</Label>
              <div className="relative mt-2">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className={cn("h-11 rounded-2xl pl-10", errors.occurredAt ? "border-destructive" : "")}
                  data-testid="sale-occurredAt"
                />
              </div>
              {errors.occurredAt ? <div className="mt-1 text-xs text-destructive">{errors.occurredAt}</div> : null}
            </div>

            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 min-h-[80px] rounded-2xl"
                placeholder="Optionnel: contexte, pièces, rappel, etc."
                data-testid="sale-notes"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border/60 bg-background/30 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Percent className="h-4 w-4 text-primary" />
              Commission
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <Label>Taux de commission (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={commissionRatePercent}
                  onChange={(e) => setCommissionRatePercent(Number(e.target.value))}
                  className="mt-2 h-11 rounded-2xl"
                  disabled={useFixedCommission}
                  data-testid="sale-commissionRate"
                />
                <div className="mt-1 text-xs text-muted-foreground">Par défaut: 3,5%</div>
              </div>

              <div className="sm:col-span-1">
                <div className="flex items-center justify-between">
                  <Label>Montant fixe de commission (EUR)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Utiliser montant fixe</span>
                    <Switch
                      checked={useFixedCommission}
                      onCheckedChange={setUseFixedCommission}
                      data-testid="sale-useFixedCommission"
                    />
                  </div>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={commissionAmountCentsOverride != null ? commissionAmountCentsOverride / 100 : ""}
                  onChange={(e) =>
                    setCommissionAmountCentsOverride(e.target.value ? Math.round(Number(e.target.value) * 100) : null)
                  }
                  className="mt-2 h-11 rounded-2xl"
                  disabled={!useFixedCommission}
                  placeholder="Ex: 50.00"
                  data-testid="sale-commissionAmountOverride"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Vente à deux (partage)</Label>
                </div>
                <Switch
                  checked={isSplit}
                  onCheckedChange={(v) => {
                    setIsSplit(v);
                    if (v && splitRatio === 1.0) setSplitRatio(0.5);
                  }}
                  data-testid="sale-isSplit"
                />
              </div>

              {isSplit && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Ta part (ratio)</Label>
                    <Select
                      value={String(splitRatio)}
                      onValueChange={(v) => setSplitRatio(Number(v))}
                    >
                      <SelectTrigger className="mt-1 h-10 rounded-xl" data-testid="sale-splitRatio">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="0.5">50% (moitié)</SelectItem>
                        <SelectItem value="0.6">60%</SelectItem>
                        <SelectItem value="0.7">70%</SelectItem>
                        <SelectItem value="0.4">40%</SelectItem>
                        <SelectItem value="0.3">30%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Nom du partenaire</Label>
                    <Input
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      className="mt-1 h-10 rounded-xl"
                      placeholder="Ex: Marc Dupont"
                      data-testid="sale-partnerName"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-primary/10 p-3">
              <span className="text-sm font-semibold">Ta commission estimée</span>
              <span className="text-lg font-bold text-primary" data-testid="sale-computedCommission">
                {formatEurFromCents(computedCommission)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => onOpenChange(false)}
              data-testid="sale-cancel"
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
              onClick={submit}
              disabled={isPending}
              data-testid="sale-submit"
            >
              {isPending ? "Enregistrement…" : mode === "create" ? "Créer" : "Mettre à jour"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SalesPage() {
  const { toast } = useToast();

  const clients = useClients({ archived: false });
  const services = useServices({ active: true });

  const [q, setQ] = React.useState("");
  const [filterClientId, setFilterClientId] = React.useState<string>("all");
  const [filterServiceId, setFilterServiceId] = React.useState<string>("all");

  const list = useClientServices({
    clientId: filterClientId !== "all" ? filterClientId : undefined,
    serviceId: filterServiceId !== "all" ? filterServiceId : undefined,
  });

  const create = useCreateClientService();
  const update = useUpdateClientService();
  const del = useDeleteClientService();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<ClientService | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const openEdit = (s: ClientService) => {
    setEditItem(s);
    setEditOpen(true);
  };

  const askDelete = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!deleteId) return;
    try {
      await del.mutateAsync(deleteId);
      toast({ title: "Supprimé", description: "La vente a été supprimée." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Suppression impossible", variant: "destructive" });
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const items = React.useMemo(() => {
    const data = list.data ?? [];
    const qq = q.trim().toLowerCase();
    if (!qq) return data;

    const clientMap = new Map((clients.data ?? []).map((c) => [c.id, `${c.firstName} ${c.lastName}`]));
    const serviceMap = new Map((services.data ?? []).map((s) => [s.id, s.name]));

    return data.filter((x) => {
      const clientName = (clientMap.get(x.clientId) ?? "").toLowerCase();
      const serviceName = (serviceMap.get(x.serviceId) ?? "").toLowerCase();
      const notes = (x.notes ?? "").toLowerCase();
      return clientName.includes(qq) || serviceName.includes(qq) || notes.includes(qq);
    });
  }, [list.data, q, clients.data, services.data]);

  const totalCents = React.useMemo(() => items.reduce((acc, it) => acc + (it.amountCents ?? 0), 0), [items]);

  const clientName = (id: string) => {
    const c = (clients.data ?? []).find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : id;
  };

  const serviceName = (id: string) => {
    const s = (services.data ?? []).find((x) => x.id === id);
    return s ? s.name : id;
  };

  return (
    <AppLayout>
      <PageShell
        title="Ventes"
        subtitle="Enregistrez vos prestations (ventes) pour alimenter le dashboard et analyser votre CA par client et par service."
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
            data-testid="sales-add"
            disabled={clients.isLoading || services.isLoading}
          >
            <Plus className="h-4 w-4" />
            Nouvelle vente
          </Button>
        }
        data-testid="page-sales"
      >
        <DataTableShell
          query={q}
          onQueryChange={setQ}
          placeholder="Rechercher (client, service, notes)…"
          filters={
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  Client
                </div>
                <Select value={filterClientId} onValueChange={setFilterClientId}>
                  <SelectTrigger className="h-11 rounded-2xl" data-testid="sales-filter-client">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Tous les clients</SelectItem>
                    {(clients.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  Service
                </div>
                <Select value={filterServiceId} onValueChange={setFilterServiceId}>
                  <SelectTrigger className="h-11 rounded-2xl" data-testid="sales-filter-service">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">Tous les services</SelectItem>
                    {(services.data ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total filtré</div>
                <div className="mt-2 text-2xl font-bold" data-testid="sales-total">
                  <Money cents={totalCents} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Basé sur la recherche + filtres</div>
              </div>
            </div>
          }
          toolbarLeft={
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <Receipt className="h-4 w-4 text-primary" />
              Prestations
            </div>
          }
          toolbarRight={
            <Button
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => list.refetch()}
              data-testid="sales-refresh"
            >
              Actualiser
            </Button>
          }
          data-testid="sales-table-shell"
        >
          {list.isLoading || clients.isLoading || services.isLoading ? (
            <div className="rounded-3xl border border-border/60 bg-card/50 p-8 shadow-soft">
              <div className="h-10 w-full shimmer rounded-2xl bg-muted/70" />
              <div className="mt-3 h-10 w-[92%] shimmer rounded-2xl bg-muted/70" />
              <div className="mt-3 h-10 w-[84%] shimmer rounded-2xl bg-muted/70" />
            </div>
          ) : list.isError ? (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              {(list.error as Error)?.message || "Erreur de chargement."}
            </div>
          ) : (items?.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Receipt className="h-6 w-6 text-primary" />}
              title="Aucune vente"
              description="Ajoutez une vente pour alimenter votre chiffre d’affaires."
              actionLabel="Créer une vente"
              onAction={() => setCreateOpen(true)}
              data-testid="sales-empty"
            />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-border/60 bg-background/30">
              <Table data-testid="sales-table" className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Notes</TableHead>
                    <TableHead className="w-[170px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items!.map((s) => (
                    <TableRow key={s.id} className="transition-colors hover:bg-muted/40">
                      <TableCell>
                        <div className="font-semibold" data-testid={`sale-client-${s.id}`}>
                          {clientName(s.clientId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold" data-testid={`sale-service-${s.id}`}>
                          {serviceName(s.serviceId)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-bold" data-testid={`sale-amount-${s.id}`}>
                          <Money cents={s.amountCents} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{s.currency}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm text-muted-foreground" data-testid={`sale-date-${s.id}`}>
                          {new Date(s.occurredAt as any).toLocaleDateString("fr-FR")}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="line-clamp-1 text-sm text-muted-foreground" data-testid={`sale-notes-${s.id}`}>
                          {s.notes || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl"
                            onClick={() => openEdit(s)}
                            data-testid={`sale-edit-${s.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => askDelete(s.id)}
                            data-testid={`sale-delete-${s.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DataTableShell>

        <SaleForm
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          clients={clients.data ?? []}
          services={services.data ?? []}
          onSubmit={async (payload) => {
            try {
              await create.mutateAsync(payload);
              toast({ title: "Créé", description: "Vente enregistrée." });
              setCreateOpen(false);
            } catch (e: any) {
              toast({ title: "Erreur", description: e?.message ?? "Création impossible", variant: "destructive" });
            }
          }}
          isPending={create.isPending}
        />

        <SaleForm
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={editItem}
          clients={clients.data ?? []}
          services={services.data ?? []}
          onSubmit={async (payload) => {
            if (!editItem) return;
            try {
              await update.mutateAsync({ id: editItem.id, updates: payload });
              toast({ title: "Mis à jour", description: "Vente modifiée." });
              setEditOpen(false);
              setEditItem(null);
            } catch (e: any) {
              toast({ title: "Erreur", description: e?.message ?? "Mise à jour impossible", variant: "destructive" });
            }
          }}
          isPending={update.isPending}
        />

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Supprimer cette vente ?"
          description="Cette action est définitive."
          confirmLabel={del.isPending ? "Suppression…" : "Supprimer"}
          destructive
          onConfirm={doDelete}
          data-testid="sale-delete-confirm"
        />
      </PageShell>
    </AppLayout>
  );
}
