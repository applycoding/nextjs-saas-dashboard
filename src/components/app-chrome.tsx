"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Activity, FolderKanban, LayoutDashboard, Menu, Users } from "lucide-react";

import { signOutAction, switchOrganizationAction } from "@/lib/actions";
import type { MembershipSummary } from "@/lib/context";
import type { Role } from "@/lib/rbac";
import { RoleBadge } from "@/components/role-badge";
import { ThemeControl } from "@/components/theme-control";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/events", label: "Events", icon: Activity },
  { href: "/team", label: "Team", icon: Users },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1" aria-label="Workspace">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppChrome({
  organizationName,
  role,
  email,
  memberships,
  children,
}: {
  organizationName: string;
  role: Role;
  email: string | null;
  memberships: MembershipSummary[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2">
        Skip to content
      </a>
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "icon" }), "md:hidden")} aria-label="Open menu">
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Signalboard</SheetTitle>
              </SheetHeader>
              <div className="px-4">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <p className="text-sm font-medium">Signalboard</p>
            <p className="text-xs text-muted-foreground">{organizationName}</p>
          </div>
          <RoleBadge role={role} />
        </div>
        <div className="flex items-center gap-2">
          <ThemeControl />
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-6xl md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r px-3 py-4 md:block">
          <NavLinks />
          <p className="mt-6 px-2 text-xs text-muted-foreground">{email}</p>
          {memberships.length > 1 ? (
            <form action={switchOrganizationAction} className="mt-4 grid gap-2 px-2">
              <label className="text-xs text-muted-foreground" htmlFor="organizationId">
                Organisation
              </label>
              <select
                id="organizationId"
                name="organizationId"
                defaultValue={memberships.find((item) => item.organizationName === organizationName)?.organizationId}
                className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
              >
                {memberships.map((item) => (
                  <option key={item.organizationId} value={item.organizationId}>
                    {item.organizationName}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary" size="sm">
                Switch
              </Button>
            </form>
          ) : null}
        </aside>
        <main id="main" className="px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
