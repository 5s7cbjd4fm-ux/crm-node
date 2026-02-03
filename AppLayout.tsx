import * as React from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Users,
  UserRoundSearch,
  Package,
  Receipt,
  PanelLeft,
  SunMoon,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const nav = [
  { href: "/", label: "Dashboard", icon: BarChart3, testId: "nav-dashboard" },
  { href: "/prospects", label: "Prospects", icon: UserRoundSearch, testId: "nav-prospects" },
  { href: "/clients", label: "Clients", icon: Users, testId: "nav-clients" },
  { href: "/services", label: "Services", icon: Package, testId: "nav-services" },
  { href: "/ventes", label: "Ventes", icon: Receipt, testId: "nav-sales" },
];

function useTheme() {
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return { theme, setTheme };
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [loc] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useAuth();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [loc]);

  const userInitials = user
    ? `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() || "U"
    : "U";

  return (
    <div className="min-h-screen mesh-bg">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_300px_at_30%_0%,hsl(var(--primary)/0.10),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_360px_at_90%_20%,hsl(var(--accent)/0.08),transparent_55%)]" />

      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
            data-testid="mobile-menu-toggle"
          >
            <PanelLeft className="h-4 w-4" />
            Menu
          </button>

          <BrandMark className="select-none" />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl"
              data-testid="toggle-theme"
            >
              <SunMoon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl"
              data-testid="button-logout-mobile"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-0 md:grid-cols-[280px_1fr] md:gap-8 md:px-4 md:py-8 lg:px-8">
        {/* Sidebar */}
        <aside
          className={cn(
            "md:sticky md:top-8 md:h-[calc(100vh-4rem)]",
            mobileOpen ? "block" : "hidden md:block",
          )}
        >
          <div className="relative h-full overflow-hidden rounded-none border-b border-border/60 bg-sidebar text-sidebar-foreground md:rounded-3xl md:border md:shadow-soft">
            <div className="absolute inset-0 opacity-80 [background:radial-gradient(900px_380px_at_20%_0%,hsl(var(--sidebar-primary)/0.35),transparent_60%),radial-gradient(700px_340px_at_90%_30%,hsl(var(--accent)/0.18),transparent_55%)]" />
            <div className="relative flex h-full flex-col p-5">
              <div className="flex items-center justify-between gap-3">
                <BrandMark title="Cap Finance Desk" />
                <Button
                  variant="outline"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="hidden rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white md:inline-flex"
                  data-testid="toggle-theme-desktop"
                >
                  <SunMoon className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="my-5 bg-white/10" />

              <nav className="flex flex-col gap-1">
                {nav.map((item) => {
                  const active = item.href === "/" ? loc === "/" : loc.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                        "focus:outline-none focus-visible:ring-4 focus-visible:ring-sidebar-ring/30",
                        active
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-white/80 hover:bg-white/8 hover:text-white",
                      )}
                      data-testid={item.testId}
                    >
                      <span
                        className={cn(
                          "grid h-9 w-9 place-items-center rounded-xl border transition-all duration-200",
                          active
                            ? "border-white/15 bg-white/10"
                            : "border-white/10 bg-white/5 group-hover:bg-white/8",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate">{item.label}</span>

                      {active ? (
                        <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b from-sidebar-primary to-accent" />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto pt-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/20">
                      <AvatarFallback className="bg-white/10 text-white text-sm font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="truncate text-xs text-white/70">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    data-testid="button-logout"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Se deconnecter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 px-0 pb-10 md:px-0 md:pb-0">{children}</main>
      </div>
    </div>
  );
}
