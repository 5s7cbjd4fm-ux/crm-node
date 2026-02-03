import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { PageShell, SectionCard } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <AppLayout>
      <PageShell
        title="Page introuvable"
        subtitle="Le lien demandé n’existe pas ou a été déplacé."
        data-testid="page-not-found"
        actions={
          <Link href="/" className="inline-flex">
            <Button className="rounded-2xl" data-testid="notfound-back">
              Retour au dashboard
            </Button>
          </Link>
        }
      >
        <SectionCard className="p-8">
          <div className="grid place-items-center gap-4 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border/60 bg-background/60 shadow-sm">
              <FileQuestion className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-lg font-bold">404</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Vérifiez l’URL ou utilisez la navigation à gauche.
              </div>
            </div>
          </div>
        </SectionCard>
      </PageShell>
    </AppLayout>
  );
}
