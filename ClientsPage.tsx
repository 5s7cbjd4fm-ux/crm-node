import * as React from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageShell } from "@/components/PageShell";
import { DataTableShell } from "@/components/DataTableShell";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/use-clients";
import type { Client, CreateClientRequest } from "@shared/schema";
import { z } from "zod";
import { Users, Archive, ArchiveRestore, Pencil, Plus, Trash2, StickyNote } from "lucide-react";
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
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  phone: z.string().optional().or(z.literal("")),
  profession: z.string().optional().or(z.literal("")),
  recommendedBy: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

function ClientForm({
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
  initial?: Client | null;
  onSubmit: (payload: CreateClientRequest) => void;
  isPending: boolean;
}) {
  const [firstName, setFirstName] = React.useState(initial?.firstName ?? "");
  const [lastName, setLastName] = React.useState(initial?.lastName ?? "");
  const [phone, setPhone] = React.useState(initial?.phone ?? "");
  const [profession, setProfession] = React.useState(initial?.profession ?? "");
  const [recommendedBy, setRecommendedBy] = React.useState(initial?.recommendedBy ?? "");
  const [notes, setNotes] = React.useState(initial?.notes ?? "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setFirstName(initial?.firstName ?? "");
      setLastName(initial?.lastName ?? "");
      setPhone(initial?.phone ?? "");
      setProfession(initial?.profession ?? "");
      setRecommendedBy(initial?.recommendedBy ?? "");
      setNotes(initial?.notes ?? "");
      setErrors({});
    }
  }, [open, initial]);

  const submit = () => {
    const parsed = createSchema.safeParse({
      firstName,
      lastName,
      phone,
      profession,
      recommendedBy,
      notes,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (next[String(i.path[0])] = i.message));
      setErrors(next);
      return;
    }
    onSubmit({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || undefined,
      profession: parsed.data.profession || undefined,
      recommendedBy: parsed.data.recommendedBy || undefined,
      notes: parsed.data.notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl border-border/70 bg-card/85 p-0 backdrop-blur-xl">
        <div className="p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {mode === "create" ? "Nouveau client" : "Modifier le client"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Ajoutez des notes et une recommandation pour garder du contexte.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Prénom *</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={cn("mt-2 h-11 rounded-2xl", errors.firstName ? "border-destructive" : "")}
                data-testid="client-firstName"
              />
              {errors.firstName ? <div className="mt-1 text-xs text-destructive">{errors.firstName}</div> : null}
            </div>

            <div>
              <Label>Nom *</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={cn("mt-2 h-11 rounded-2xl", errors.lastName ? "border-destructive" : "")}
                data-testid="client-lastName"
              />
              {errors.lastName ? <div className="mt-1 text-xs text-destructive">{errors.lastName}</div> : null}
            </div>

            <div>
              <Label>Téléphone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 h-11 rounded-2xl"
                placeholder="Optionnel"
                data-testid="client-phone"
              />
            </div>

            <div>
              <Label>Profession</Label>
              <Input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="mt-2 h-11 rounded-2xl"
                placeholder="Optionnel"
                data-testid="client-profession"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Recommandé par</Label>
              <Input
                value={recommendedBy}
                onChange={(e) => setRecommendedBy(e.target.value)}
                className="mt-2 h-11 rounded-2xl"
                placeholder="Source / personne"
                data-testid="client-recommendedBy"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 min-h-[120px] rounded-2xl"
                placeholder="Contexte, besoins, prochaines étapes…"
                data-testid="client-notes"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => onOpenChange(false)}
              data-testid="client-cancel"
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
              onClick={submit}
              disabled={isPending}
              data-testid="client-submit"
            >
              {isPending ? "Enregistrement…" : mode === "create" ? "Créer" : "Mettre à jour"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientsPage() {
  const { toast } = useToast();
  const [q, setQ] = React.useState("");
  const [showArchived, setShowArchived] = React.useState(false);

  const list = useClients({ q: q || undefined, archived: showArchived });
  const create = useCreateClient();
  const update = useUpdateClient();
  const del = useDeleteClient();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<Client | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const openEdit = (c: Client) => {
    setEditItem(c);
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
      toast({ title: "Supprimé", description: "Le client a été supprimé." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Suppression impossible", variant: "destructive" });
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const toggleArchive = async (c: Client) => {
    try {
      await update.mutateAsync({ id: c.id, updates: { isArchived: !c.isArchived } });
      toast({
        title: c.isArchived ? "Restauré" : "Archivé",
        description: c.isArchived ? "Le client est de nouveau actif." : "Le client a été archivé.",
      });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Action impossible", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <PageShell
        title="Clients"
        subtitle="Votre portefeuille client: coordonnées, profession, recommandation et notes. L’archivage permet de garder une base propre."
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
            data-testid="clients-add"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        }
        data-testid="page-clients"
      >
        <DataTableShell
          query={q}
          onQueryChange={setQ}
          placeholder="Rechercher (nom, téléphone, notes)…"
          filters={
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={showArchived}
                  onCheckedChange={(v) => setShowArchived(Boolean(v))}
                  data-testid="clients-filter-archived"
                />
                <div>
                  <div className="text-sm font-semibold">Afficher archivés</div>
                  <div className="text-xs text-muted-foreground">Inclure les clients archivés</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {list.data ? `${list.data.length} élément(s)` : "—"}
              </div>
            </div>
          }
          toolbarLeft={
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              Portefeuille
            </div>
          }
          toolbarRight={
            <Button
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => list.refetch()}
              data-testid="clients-refresh"
            >
              Actualiser
            </Button>
          }
          data-testid="clients-table-shell"
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
          ) : (list.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Aucun client"
              description="Ajoutez vos premiers clients pour lier ensuite les ventes et analyser le CA."
              actionLabel="Ajouter un client"
              onAction={() => setCreateOpen(true)}
              data-testid="clients-empty"
            />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-border/60 bg-background/30">
              <Table data-testid="clients-table" className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[260px]">Nom</TableHead>
                    <TableHead className="hidden md:table-cell">Téléphone</TableHead>
                    <TableHead className="hidden lg:table-cell">Profession</TableHead>
                    <TableHead className="hidden xl:table-cell">Notes</TableHead>
                    <TableHead className="w-[170px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.data!.map((c) => (
                    <TableRow key={c.id} className="transition-colors hover:bg-muted/40">
                      <TableCell>
                        <div className="font-semibold" data-testid={`client-name-${c.id}`}>
                          {c.firstName} {c.lastName}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Ajouté {new Date(c.createdAt as any).toLocaleDateString("fr-FR")}
                          {c.isArchived ? " • Archivé" : ""}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm text-muted-foreground" data-testid={`client-phone-${c.id}`}>
                          {c.phone || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm text-muted-foreground" data-testid={`client-profession-${c.id}`}>
                          {c.profession || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <StickyNote className="h-4 w-4" />
                          <span className="line-clamp-1" data-testid={`client-notes-${c.id}`}>
                            {c.notes || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl"
                            onClick={() => openEdit(c)}
                            data-testid={`client-edit-${c.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl"
                            onClick={() => toggleArchive(c)}
                            data-testid={`client-archive-${c.id}`}
                          >
                            {c.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => askDelete(c.id)}
                            data-testid={`client-delete-${c.id}`}
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

        <ClientForm
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={async (payload) => {
            try {
              await create.mutateAsync(payload);
              toast({ title: "Créé", description: "Client ajouté." });
              setCreateOpen(false);
            } catch (e: any) {
              toast({ title: "Erreur", description: e?.message ?? "Création impossible", variant: "destructive" });
            }
          }}
          isPending={create.isPending}
        />

        <ClientForm
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={editItem}
          onSubmit={async (payload) => {
            if (!editItem) return;
            try {
              await update.mutateAsync({ id: editItem.id, updates: payload });
              toast({ title: "Mis à jour", description: "Client modifié." });
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
          title="Supprimer ce client ?"
          description="Cette action est définitive. Les ventes liées (si existantes) pourront provoquer une erreur côté serveur."
          confirmLabel={del.isPending ? "Suppression…" : "Supprimer"}
          destructive
          onConfirm={doDelete}
          data-testid="client-delete-confirm"
        />
      </PageShell>
    </AppLayout>
  );
}
