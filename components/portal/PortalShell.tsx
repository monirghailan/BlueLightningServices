"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cog } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberRole } from "@/lib/supabase/database.types";

const nav = [
  { href: "/portal", label: "Dashboard", exact: true },
  { href: "/portal/assistant", label: "Assistant" },
];

interface PortalShellProps {
  children: React.ReactNode;
  orgName: string;
  role: MemberRole;
}

export function PortalShell({ children, orgName, role }: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const visibleNav = nav.filter(
    (item) => item.href !== "/portal" || role === "administrator"
  );

  async function signOut() {
    await fetch("/api/portal/auth", { method: "DELETE" });
    router.push("/portal/login");
    router.refresh();
  }

  return (
    <div className="portal-shell min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Client Portal</p>
            <h1 className="text-lg font-semibold">{orgName}</h1>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            {visibleNav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-elevated text-foreground"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {role === "administrator" && (
              <Link
                href="/portal/settings"
                aria-label="Settings"
                className={cn(
                  "rounded-lg border border-border p-1.5 transition-colors",
                  pathname.startsWith("/portal/settings")
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted hover:text-foreground"
                )}
              >
                <Cog className="size-4" aria-hidden />
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 sm:hidden">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
