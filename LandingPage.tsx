import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BrandMark } from "@/components/BrandMark";
import { BarChart3, Users, Receipt, Shield, TrendingUp, Briefcase, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function LandingPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password, firstName, lastName });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoggingIn || isRegistering;

  return (
    <div className="min-h-screen mesh-bg">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_300px_at_30%_0%,hsl(var(--primary)/0.10),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_360px_at_90%_20%,hsl(var(--accent)/0.08),transparent_55%)]" />

      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <BrandMark title="Cap Finance Desk" />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
          <div className="mx-auto w-full max-w-md">
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">
                  {mode === "login" ? "Connexion" : "Inscription"}
                </CardTitle>
                <CardDescription>
                  {mode === "login"
                    ? "Connectez-vous à votre compte"
                    : "Créez votre compte pour commencer"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {mode === "register" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Jean"
                          data-testid="input-firstname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Dupont"
                          data-testid="input-lastname"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      data-testid="input-password"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    data-testid={mode === "login" ? "button-login" : "button-register"}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "login" ? "Se connecter" : "S'inscrire"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-sm"
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login");
                      setEmail("");
                      setPassword("");
                      setFirstName("");
                      setLastName("");
                    }}
                    data-testid="button-switch-mode"
                  >
                    {mode === "login"
                      ? "Pas encore de compte ? S'inscrire"
                      : "Déjà un compte ? Se connecter"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Dashboard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Suivez votre CA mensuel et annuel avec des graphiques clairs et détaillés.
              </p>
            </div>

            <div className="group rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Clients & Prospects</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Gérez vos contacts avec un suivi complet de leur parcours.
              </p>
            </div>

            <div className="group rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-soft sm:col-span-2 lg:col-span-1">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Commissions</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Calculez automatiquement vos commissions avec partage entre partenaires.
              </p>
            </div>
          </div>
        </main>

        <footer className="border-t border-border/60 bg-background/60 px-4 py-6 text-center text-sm text-muted-foreground backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Cap Finance Desk - Mandataire Cap Finance</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
