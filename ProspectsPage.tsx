import * as React from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageShell } from "@/components/PageShell";
import { DataTableShell } from "@/components/DataTableShell";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useProspects, useCreateProspect, useUpdateProspect, useDeleteProspect } from "@/hooks/use-prospects";
import type { CreateProspectRequest, Prospect } from "@shared/schema";
import { z } from "zod";
import { Users2, Archive, ArchiveRestore, Pencil, Plus, Trash2 } from "lucide-react";
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
  phone: z.string().min(1, "Téléphone requis"),
  profession: z.string().optional().or(z.literal("")),
  recommendedBy: z.string().optional().or(z.literal("")),
});

function ProspectForm({
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
  initial?: Prospect | null;
  onSubmit: (payload: CreateProspectRequest) => void;
  isPending: boolean;
}) {
  const [firstName, setFirstName] = React.useState(initial?.firstName ?? "");
  const [lastName, setLastName] = React.useState(initial?.lastName ?? "");
  const [phone, setPhone] = React.useState(initial?.phone ?? "");
  const [profession, setProfession] = React.useState(initial?.profession ?? "");
  const [recommendedBy, setRecommendedBy] = React.useState(initial?.recommendedBy ?? "");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setFirstName(initial?.firstName ?? "");
      setLastName(initial?.lastName ?? "");
      setPhone(initial?.phone ?? "");
      setProfession(initial?.profession ?? "");
      setRecommendedBy(initial?.recommendedBy ?? "");
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
      phone: parsed.data.phone,
      profession: parsed.data.profession || undefined,
      recommendedBy: parsed.data.recommendedBy || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl border-border/70 bg-card/85 p-0 backdrop-blur-xl">
        <div className="p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {mode === "create" ? "Nouveau prospect" : "Modifier le prospect"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Renseignez les informations essentielles. Le téléphone est requis pour le suivi.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <Label>Prénom *</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={cn("mt-2 h-11 rounded-2xl", errors.firstName ? "border-destructive" : "")}
                data-testid="prospect-firstName"
              />
              {errors.firstName ? <div className="mt-1 text-xs text-destructive">{errors.firstName}</div> : null}
            </div>
            <div className="sm:col-span-1">
              <Label>Nom *</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={cn("mt-2 h-11 rounded-2xl", errors.lastName ? "border-destructive" : "")}
                data-testid="prospect-lastName"
              />
              {errors.lastName ? <div className="mt-1 text-xs text-destructive">{errors.lastName}</div> : null}
            </div>

            <div className="sm:col-span-1">
              <Label>Téléphone *</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={cn("mt-2 h-11 rounded-2xl", errors.phone ? "border-destructive" : "")}
                placeholder="06 00 00 00 00"
                data-testid="prospect-phone"
              />
              {errors.phone ? <div className="mt-1 text-xs text-destructive">{errors.phone}</div> : null}
            </div>

            <div className="sm:col-span-1">
              <Label>Profession</Label>
              <Input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="mt-2 h-11 rounded-2xl"
                placeholder="Ex: Artisan, Salarié…"
                data-testid="prospect-profession"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Recommandé par</Label>
              <Textarea
                value={recommendedBy}
                onChange={(e) => setRecommendedBy(e.target.value)}
                className="mt-2 min-h-[90px] rounded-2xl"
                placeholder="Nom / source de recommandation"
                data-testid="prospect-recommendedBy"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => onOpenChange(false)}
              data-testid="prospect-cancel"
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
              onClick={submit}
              disabled={isPending}
              data-testid="prospect-submit"
            >
              {isPending ? "Enregistrement…" : mode === "create" ? "Créer" : "Mettre à jour"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProspectsPage() {
  const { toast } = useToast();
  const [q, setQ] = React.useState("");
  const [showArchived, setShowArchived] = React.useState(false);

  const list = useProspects({ q: q || undefined, archived: showArchived });
  const create = useCreateProspect();
  const update = useUpdateProspect();
  const del = useDeleteProspect();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<Prospect | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const openEdit = (p: Prospect) => {
    setEditItem(p);
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
      toast({ title: "Supprimé", description: "Le prospect a été supprimé." });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Suppression impossible", variant: "destructive" });
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const toggleArchive = async (p: Prospect) => {
    try {
      await update.mutateAsync({ id: p.id, updates: { isArchived: !p.isArchived } });
      toast({
        title: p.isArchived ? "Restauré" : "Archivé",
        description: p.isArchived ? "Le prospect est de nouveau actif." : "Le prospect a été archivé.",
      });
    } catch (e: any) {
      toast({ title: "Erreur", description: e?.message ?? "Action impossible", variant: "destructive" });
    }
  };

  return (
    <AppLayout>
      <PageShell
        title="Prospects"
        subtitle="Centralisez vos prospects (nom, téléphone, profession, recommandation) et gardez une trace propre avec l’archivage."
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-200"
            data-testid="prospects-add"
          >
            <Plus className="h-4 w-4" />
            Nouveau
          </Button>
        }
        data-testid="page-prospects"
      >
        <DataTableShell
          query={q}
          onQueryChange={setQ}
          placeholder="Rechercher (nom, téléphone, profession)…"
          filters={
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  checked={showArchived}
                  onCheckedChange={(v) => setShowArchived(Boolean(v))}
                  data-testid="prospects-filter-archived"
                />
                <div>
                  <div className="text-sm font-semibold">Afficher archivés</div>
                  <div className="text-xs text-muted-foreground">Inclure les prospects archivés dans la liste</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {list.data ? `${list.data.length} élément(s)` : "—"}
              </div>
            </div>
          }
          toolbarLeft={
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <Users2 className="h-4 w-4 text-primary" />
              Base prospects
            </div>
          }
          toolbarRight={
            <Button
              variant="outline"
              className="h-11 rounded-2xl"
              onClick={() => list.refetch()}
              data-testid="prospects-refresh"
            >
              Actualiser
            </Button>
          }
          data-testid="prospects-table-shell"
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
              icon={<Users2 className="h-6 w-6 text-primary" />}
              title="Aucun prospect"
              description="Créez votre premier prospect pour démarrer votre pipeline."
              actionLabel="Ajouter un prospect"
              onAction={() => setCreateOpen(true)}
              data-testid="prospects-empty"
            />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-border/60 bg-background/30">
              <Table data-testid="prospects-table" className="min-w-[500px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[240px]">Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead className="hidden md:table-cell">Profession</TableHead>
                    <TableHead className="hidden lg:table-cell">Recommandé par</TableHead>
                    <TableHead className="w-[170px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.data!.map((p) => (
                    <TableRow key={p.id} className="transition-colors hover:bg-muted/40">
                      <TableCell>
                        <div className="font-semibold" data-testid={`prospect-name-${p.id}`}>
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Ajouté {new Date(p.createdAt as any).toLocaleDateString("fr-FR")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium" data-testid={`prospect-phone-${p.id}`}>
                          {p.phone}
                        </div>
                        {p.isArchived ? (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                            <Archive className="h-3 w-3" />
                            Archivé
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm text-muted-foreground" data-testid={`prospect-profession-${p.id}`}>
                          {p.profession || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm text-muted-foreground" data-testid={`prospect-recommendedBy-${p.id}`}>
                          {p.recommendedBy || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl"
                            onClick={() => openEdit(p)}
                            data-testid={`prospect-edit-${p.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl"
                            onClick={() => toggleArchive(p)}
                            data-testid={`prospect-archive-${p.id}`}
                          >
                            {p.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => askDelete(p.id)}
                            data-testid={`prospect-delete-${p.id}`}
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

        <ProspectForm
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSubmit={async (payload) => {
            try {
              await create.mutateAsync(payload);
              toast({ title: "Créé", description: "Prospect ajouté à la base." });
              setCreateOpen(false);
            } catch (e: any) {
              toast({ title: "Erreur", description: e?.message ?? "Création impossible", variant: "destructive" });
            }
          }}
          isPending={create.isPending}
        />

        <ProspectForm
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={editItem}
          onSubmit={async (payload) => {
            if (!editItem) return;
            try {
              await update.mutateAsync({ id: editItem.id, updates: payload });
              toast({ title: "Mis à jour", description: "Le prospect a été modifié." });
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
          title="Supprimer ce prospect ?"
          description="Cette action est définitive."
          confirmLabel={del.isPending ? "Suppression…" : "Supprimer"}
          destructive
          onConfirm={doDelete}
          data-testid="prospect-delete-confirm"
        />
      </PageShell>
    </AppLayout>
  );
}
