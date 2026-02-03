import * as React from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageShell } from "@/components/PageShell";
import { DataTableShell } from "@/components/DataTableShell";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/use-services";
import type { CreateServiceRequest, Service } from "@shared/schema";
import { z } from "zod";
import { Package, Plus, Power, PowerOff, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional().or(z.literal("")),
});

function ServiceForm({
  mode,
  open,
  onOpenChange,
  initial,
  onSubmit,
  isPending,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Service | null;
  onSubmit: (payload: CreateServiceRequest) => void;
  isPending: boolean;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setErrors({});
    }
  }, [open, initial]);

  const submit = () => {
    const parsed = createSchema.safeParse({ name, description });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (next[String(i.path[0])] = i.message));
      setErrors(next);
      return;
    }
    onSubmit({
      name: parsed.data.name,
      description: parsed.data.description || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl border-border/70 bg-card/85 p-0 backdrop-blur-xl">
        <div className="p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {mode === "create" ? "Nouveau service" : "Modifier le service"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Les services structurent vos ventes et vos analyses de CA.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-4">
            <div>
              <Label>Nom *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn("mt-2 h-11 rounded-2xl", errors.name ? "border-destructive" : "")}
                data-testid="service-name"
              />
              {errors.name ? <div className="mt-1 text-xs text-destructive">{errors.name}</div> : null}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 min-h-[110px] rounded-2xl"
                placeholder="Optionnel: détail du service, offre, etc."
                data-testid="service-description"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => onOpenChange(false)}
              data-testid="service-cancel"
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
              onClick={submit}
              disabled={isPending}
              data-testid="service-submit"
            >
              {isPending ? "Enregistrement…" : mode === "create" ? "Créer" : "Mettre à jour"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ServicesPage() {
  const { toast } = useToast();
  const [q, setQ] = React.useState("");
  const [onlyActive, setOnlyActive] = React.useState(true);

  // Backend supports active boolean filter only. We'll keep q client-side for now (visual search).
  const list = useServices({ active: onlyActive });
  const create = useCreateService();
  const update = useUpdateService();
  const del = useDeleteService();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<Service | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const items = React.useMemo(() => {
    const data = list.data ?? [];
    const qq = q.trim().toLowerCase();
    if (!qq) return data;
    return data.filter((s) => (s.name ?? "").toLowerCase().includes(qq) || (s.description ?? "").toLowerCase().includes(qq));
  }, [list.data, q]);

  const openEdit = (s: Service) => {
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
      toast({ title: "Supprimé", description: "Le service a été supprimé." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Suppression impossible", variant: "destructive" });
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const toggleActive = async (s: Service) => {
    try {
      await update.mutateAsync({ id: s.id, updates: { isActive: !s.isActive } });
      toast({
        title: s.isActive ? "Désactivé" : "Activé",
        description: s.isActive ? "Le service n’apparaîtra plus dans les sélections actives." : "Le service est actif.",
      });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Action impossible", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <PageShell
        title="Services"
        subtitle="Créez vos services (offres) puis associez-les à des ventes pour analyser votre CA par activité."
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
            data-testid="services-add"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        }
        data-testid="page-services"
      >
        <DataTableShell
          query={q}
          onQueryChange={setQ}
          placeholder="Recherche (nom, description)…"
          filters={
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={onlyActive}
                  onCheckedChange={(v) => setOnlyActive(Boolean(v))}
                  data-testid="services-filter-active"
                />
                <div>
                  <div className="text-sm font-semibold">Uniquement actifs</div>
                  <div className="text-xs text-muted-foreground">Masque les services désactivés</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {items ? `${items.length} élément(s)` : "—"}
              </div>
            </div>
          }
          toolbarLeft={
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <Package className="h-4 w-4 text-primary" />
              Catalogue
            </div>
          }
          toolbarRight={
            <Button
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => list.refetch()}
              data-testid="services-refresh"
            >
              Actualiser
            </Button>
          }
          data-testid="services-table-shell"
        >
          {list.isLoading ? (
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
              icon={<Package className="h-6 w-6 text-primary" />}
              title="Aucun service"
              description="Créez vos offres pour pouvoir les associer à des ventes."
              actionLabel="Créer un service"
              onAction={() => setCreateOpen(true)}
              data-testid="services-empty"
            />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-border/60 bg-background/30">
              <Table data-testid="services-table" className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Service</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="w-[150px]">Statut</TableHead>
                    <TableHead className="w-[170px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items!.map((s) => (
                    <TableRow key={s.id} className="transition-colors hover:bg-muted/40">
                      <TableCell>
                        <div className="font-semibold" data-testid={`service-name-${s.id}`}>
                          {s.name}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">ID: {s.id}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="line-clamp-2 text-sm text-muted-foreground" data-testid={`service-desc-${s.id}`}>
                          {s.description || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold",
                              s.isActive
                                ? "border-accent/25 bg-accent/10 text-accent"
                                : "border-border/60 bg-muted/40 text-muted-foreground",
                            )}
                            data-testid={`service-active-${s.id}`}
                          >
                            {s.isActive ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                            {s.isActive ? "Actif" : "Inactif"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl"
                            onClick={() => openEdit(s)}
                            data-testid={`service-edit-${s.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl"
                            onClick={() => toggleActive(s)}
                            data-testid={`service-toggle-${s.id}`}
                          >
                            {s.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => askDelete(s.id)}
                            data-testid={`service-delete-${s.id}`}
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

        <ServiceForm
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={async (payload) => {
            try {
              await create.mutateAsync(payload);
              toast({ title: "Créé", description: "Service ajouté." });
              setCreateOpen(false);
            } catch (e: any) {
              toast({ title: "Erreur", description: e?.message ?? "Création impossible", variant: "destructive" });
            }
          }}
          isPending={create.isPending}
        />

        <ServiceForm
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={editItem}
          onSubmit={async (payload) => {
            if (!editItem) return;
            try {
              await update.mutateAsync({ id: editItem.id, updates: payload });
              toast({ title: "Mis à jour", description: "Service modifié." });
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
          title="Supprimer ce service ?"
          description="Cette action est définitive. Si des ventes existent, le serveur peut refuser."
          confirmLabel={del.isPending ? "Suppression…" : "Supprimer"}
          destructive
          onConfirm={doDelete}
          data-testid="service-delete-confirm"
        />
      </PageShell>
    </AppLayout>
  );
}
