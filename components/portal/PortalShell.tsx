"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cog } from "lucide-react";
import { PortalLoadingScreen } from "@/components/portal/PortalLoadingScreen";
import {
  PortalNavigationProvider,
  usePortalNavigation,
} from "@/components/portal/PortalNavigationProvider";
import { cn } from "@/lib/utils";
import type { MemberRole } from "@/lib/supabase/database.types";

const nav = [
  { href: "/portal/dashboard", label: "Dashboard", exact: true },
  { href: "/portal/assistant", label: "Assistant" },
];

interface PortalShellProps {
  children: React.ReactNode;
  orgName: string;
  role: MemberRole;
}

export function PortalShell({ children, orgName, role }: PortalShellProps) {
  return (
    <PortalNavigationProvider>
      <PortalShellInner orgName={orgName} role={role}>
        {children}
      </PortalShellInner>
    </PortalNavigationProvider>
  );
}

function PortalShellInner({ children, orgName, role }: PortalShellProps) {
  const pathname = usePathname();
  const { isNavigating, push, refresh } = usePortalNavigation();
  const [signingOut, setSigningOut] = useState(false);

  const visibleNav = nav.filter(
    (item) => item.href !== "/portal/dashboard" || role === "administrator"
  );

  async function signOut() {
    setSigningOut(true);

    try {
      const res = await fetch("/api/portal/auth", { method: "DELETE" });
      if (!res.ok) {
        setSigningOut(false);
        return;
      }

      push("/portal/login");
      refresh();
    } catch {
      setSigningOut(false);
    }
  }

  const showNavLoader = isNavigating && !signingOut;
  const [loaderKey, setLoaderKey] = useState(0);
  const wasShowingNavLoader = useRef(false);

  useEffect(() => {
    if (showNavLoader && !wasShowingNavLoader.current) {
      setLoaderKey((key) => key + 1);
    }
    wasShowingNavLoader.current = showNavLoader;
  }, [showNavLoader]);

  return (
    <div className="portal-shell grid h-dvh grid-rows-[auto_minmax(0,1fr)] bg-background text-foreground">
      <header className="relative z-20 border-b border-border bg-surface/80 backdrop-blur">
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
              disabled={signingOut}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
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
      <main data-portal-main className="relative min-h-0 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 z-10 bg-background",
            showNavLoader ? "visible" : "invisible pointer-events-none"
          )}
          aria-busy={showNavLoader}
          aria-hidden={!showNavLoader}
        >
          <PortalLoadingScreen key={loaderKey} />
        </div>
        <div
          className={cn(
            "mx-auto h-full max-w-6xl overflow-y-auto px-4 py-8 sm:px-6",
            showNavLoader && "invisible"
          )}
        >
          {children}
        </div>
      </main>

      {signingOut && (
        <div className="fixed inset-0 z-50 bg-background">
          <PortalLoadingScreen fullScreen />
        </div>
      )}
    </div>
  );
}
