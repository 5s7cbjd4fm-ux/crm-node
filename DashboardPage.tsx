import * as React from "react";
import { AppLayout } from "@/components/AppLayout";
import { PageShell, SectionCard } from "@/components/PageShell";
import { StatCard } from "@/components/StatCard";
import { Money, formatEurFromCents } from "@/components/Money";
import { LoadingBlock } from "@/components/LoadingBlock";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { useServices } from "@/hooks/use-services";
import { useClients } from "@/hooks/use-clients";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Calendar, Filter, LineChart, RefreshCcw, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { cn } from "@/lib/utils";

function YearMonthNow() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const cents = payload?.[0]?.value ?? 0;
  return (
    <div className="rounded-2xl border border-border/70 bg-popover/90 px-3 py-2 text-sm shadow-soft backdrop-blur-xl">
      <div className="font-semibold">{label}</div>
      <div className="text-muted-foreground">{formatEurFromCents(Number(cents))}</div>
    </div>
  );
}

export default function DashboardPage() {
  const now = React.useMemo(() => YearMonthNow(), []);
  const [view, setView] = React.useState<"monthly" | "yearly">("monthly");
  const [year, setYear] = React.useState<number>(now.year);
  const [month, setMonth] = React.useState<number>(now.month);
  const [serviceId, setServiceId] = React.useState<string>("all");
  const [clientId, setClientId] = React.useState<string>("all");

  const summaryQuery = React.useMemo(() => {
    return {
      view,
      year: year,
      month: view === "monthly" ? month : undefined,
      serviceId: serviceId !== "all" ? serviceId : undefined,
      clientId: clientId !== "all" ? clientId : undefined,
    } as const;
  }, [view, year, month, serviceId, clientId]);

  const summary = useDashboardSummary(summaryQuery);
  const services = useServices({ active: true });
  const clients = useClients({ archived: false });

  const points = summary.data?.points ?? [];
  const breakdownByService = summary.data?.breakdownByService ?? [];
  const breakdownByClient = summary.data?.breakdownByClient ?? [];

  const years = React.useMemo(() => {
    const list: number[] = [];
    for (let y = now.year - 3; y <= now.year + 1; y++) list.push(y);
    return list;
  }, [now.year]);

  const months = React.useMemo(
    () => [
      { v: 1, label: "Janvier" },
      { v: 2, label: "Février" },
      { v: 3, label: "Mars" },
      { v: 4, label: "Avril" },
      { v: 5, label: "Mai" },
      { v: 6, label: "Juin" },
      { v: 7, label: "Juillet" },
      { v: 8, label: "Août" },
      { v: 9, label: "Septembre" },
      { v: 10, label: "Octobre" },
      { v: 11, label: "Novembre" },
      { v: 12, label: "Décembre" },
    ],
    [],
  );

  return (
    <AppLayout>
      <PageShell
        title="Dashboard"
        subtitle={
          <span>
            Suivez votre <span className="font-semibold text-foreground">chiffre d’affaires</span> par période et
            par service. Filtrez pour répondre vite aux questions: “Quel service performe le mieux ?”.
          </span>
        }
        actions={
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => summary.refetch()}
            data-testid="dashboard-refresh"
          >
            <RefreshCcw className="h-4 w-4" />
            Actualiser
          </Button>
        }
        data-testid="page-dashboard"
      >
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:gap-7">
          <SectionCard className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  <LineChart className="h-4 w-4 text-primary" />
                  Vue CA
                </div>
                <h2 className="mt-3 text-xl md:text-2xl">Évolution du chiffre d’affaires</h2>
                <div className="mt-1 text-sm text-muted-foreground">
                  {view === "monthly" ? "Par jour / période du mois (selon backend)" : "Par mois sur l’année"}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Tabs
                  value={view}
                  onValueChange={(v) => setView(v as any)}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="h-11 rounded-2xl bg-muted/70">
                    <TabsTrigger value="monthly" className="rounded-xl" data-testid="dashboard-tab-monthly">
                      Mensuel
                    </TabsTrigger>
                    <TabsTrigger value="yearly" className="rounded-xl" data-testid="dashboard-tab-yearly">
                      Annuel
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="h-11 w-full rounded-2xl sm:w-[140px]" data-testid="dashboard-year">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {years.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {view === "monthly" ? (
                  <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                    <SelectTrigger className="h-11 w-full rounded-2xl sm:w-[170px]" data-testid="dashboard-month">
                      <SelectValue placeholder="Mois" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {months.map((m) => (
                        <SelectItem key={m.v} value={String(m.v)}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            </div>

            <Separator className="my-5 bg-border/60" />

            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                title="CA Total"
                value={
                  summary.isLoading ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Money cents={summary.data?.totalCents ?? 0} data-testid="dashboard-total" />
                  )
                }
                hint={view === "monthly" ? "Période mensuelle" : "Sur l’année"}
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
                tone="primary"
                data-testid="dashboard-stat-total"
              />
              <StatCard
                title="Mes commissions"
                value={
                  summary.isLoading ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <Money cents={summary.data?.totalCommissionCents ?? 0} data-testid="dashboard-commission" />
                  )
                }
                hint="Après partage éventuel"
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                tone="accent"
                data-testid="dashboard-stat-commission"
              />
              <StatCard
                title="Filtre service"
                value={
                  <span className="text-base font-semibold text-foreground">
                    {serviceId === "all"
                      ? "Tous"
                      : services.data?.find((s) => s.id === serviceId)?.name ?? "—"}
                  </span>
                }
                hint={<span className="text-xs">Affinez la performance</span>}
                icon={<Filter className="h-5 w-5 text-muted-foreground" />}
                tone="neutral"
                data-testid="dashboard-stat-service"
              />
              <StatCard
                title="Filtre client"
                value={
                  <span className="text-base font-semibold text-foreground">
                    {clientId === "all"
                      ? "Tous"
                      : clients.data?.find((c) => c.id === clientId)
                          ? `${clients.data?.find((c) => c.id === clientId)?.firstName ?? ""} ${
                              clients.data?.find((c) => c.id === clientId)?.lastName ?? ""
                            }`.trim()
                          : "—"}
                  </span>
                }
                hint={<span className="text-xs">Analyse par portefeuille</span>}
                icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
                tone="neutral"
                data-testid="dashboard-stat-client"
              />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger className="h-11 rounded-2xl" data-testid="dashboard-filter-service">
                  <SelectValue placeholder="Service" />
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

              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="h-11 rounded-2xl" data-testid="dashboard-filter-client">
                  <SelectValue placeholder="Client" />
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

            <div className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-background/40 p-3 sm:p-4">
              {summary.isLoading ? (
                <div className="h-[280px]">
                  <LoadingBlock label="Chargement du graphique…" data-testid="dashboard-loading-chart" />
                </div>
              ) : summary.isError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {(summary.error as Error)?.message || "Erreur inattendue."}
                </div>
              ) : (
                <div className="h-[280px] w-full" data-testid="dashboard-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={points} margin={{ top: 10, right: 14, left: -6, bottom: 0 }}>
                      <defs>
                        <linearGradient id="caFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="hsl(var(--border) / 0.6)" strokeDasharray="4 6" />
                      <XAxis dataKey="period" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickFormatter={(v) => `${Math.round(Number(v) / 100) / 10}k`}
                      />
                      <RTooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="totalCents"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#caFill)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--accent))" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </SectionCard>

          <div className="grid gap-5">
            <SectionCard className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Répartition
                  </div>
                  <h3 className="mt-2 text-lg">Par service</h3>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  Top {Math.min(5, breakdownByService.length)}
                </div>
              </div>

              <Separator className="my-4 bg-border/60" />

              <div className="space-y-3" data-testid="dashboard-breakdown-service">
                {summary.isLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 rounded-2xl bg-muted/70 shimmer" />
                    <div className="h-12 rounded-2xl bg-muted/70 shimmer" />
                    <div className="h-12 rounded-2xl bg-muted/70 shimmer" />
                  </div>
                ) : breakdownByService.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucune donnée sur la période.</div>
                ) : (
                  breakdownByService.slice(0, 6).map((b, idx) => {
                    const pct =
                      (b.totalCents / Math.max(1, summary.data?.totalCents ?? 1)) * 100;
                    return (
                      <div
                        key={b.serviceId}
                        className="rounded-2xl border border-border/60 bg-background/40 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{b.serviceName}</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">{pct.toFixed(1)}%</span> du total
                            </div>
                          </div>
                          <div className="text-sm font-bold">
                            <Money cents={b.totalCents} />
                          </div>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-muted/70">
                          <div
                            className={cn(
                              "h-2 rounded-full bg-gradient-to-r",
                              idx % 2 === 0 ? "from-primary to-accent" : "from-accent to-primary",
                            )}
                            style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SectionCard>

            <SectionCard className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Répartition
                  </div>
                  <h3 className="mt-2 text-lg">Par client</h3>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/50 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  Portefeuille
                </div>
              </div>

              <Separator className="my-4 bg-border/60" />

              <div className="space-y-3" data-testid="dashboard-breakdown-client">
                {summary.isLoading ? (
                  <div className="space-y-2">
                    <div className="h-12 rounded-2xl bg-muted/70 shimmer" />
                    <div className="h-12 rounded-2xl bg-muted/70 shimmer" />
                    <div className="h-12 rounded-2xl bg-muted/70 shimmer" />
                  </div>
                ) : breakdownByClient.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucune donnée sur la période.</div>
                ) : (
                  breakdownByClient.slice(0, 6).map((b) => (
                    <div
                      key={b.clientId}
                      className="rounded-2xl border border-border/60 bg-background/40 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{b.clientName}</div>
                          <div className="mt-1 text-xs text-muted-foreground">Total sur la période</div>
                        </div>
                        <div className="text-sm font-bold">
                          <Money cents={b.totalCents} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </PageShell>
    </AppLayout>
  );
}
