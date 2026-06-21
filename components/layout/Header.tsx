"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleDot, Menu, X } from "lucide-react";
import { LogoMark } from "@/components/logo/LogoMark";
import { Button } from "@/components/ui/Button";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { navLinks } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <header
        className={cn(
          "site-header fixed inset-x-0 top-0 z-50 border-b transition-shadow duration-300",
          scrolled
            ? "border-white/10 shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
            : "border-white/8"
        )}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center px-3 sm:px-5">
          <div
            className={cn(
              "mx-auto flex h-[var(--header-bar-height)] w-full max-w-6xl items-center gap-2 overflow-hidden rounded-xl border px-2 transition-all duration-300 sm:gap-3 sm:px-2.5",
              scrolled
                ? "border-white/10 bg-white/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                : "border-white/8 bg-white/[0.03]"
            )}
          >
          <LogoMark
            showText={false}
            className="shrink-0"
            logoClassName="h-7 w-6 sm:h-8 sm:w-7"
          />

          <nav
            className="hidden flex-1 items-center justify-center lg:flex"
            aria-label="Main"
          >
            <div className="flex h-8 items-center gap-0.5 rounded-lg border border-white/8 bg-white/[0.04] px-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[12px] font-medium leading-none transition-all duration-200",
                      active
                        ? "bg-white/10 text-foreground"
                        : "text-muted hover:bg-white/[0.06] hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden items-center gap-1.5 sm:flex">
              <CurrencySwitcher />
              <Button
                href="/contact"
                size="sm"
                className="!px-3 !py-1.5 !text-xs whitespace-nowrap"
              >
                Get started
              </Button>
            </div>
            <Button
              href="/portal"
              variant="portal"
              size="sm"
              className="!px-2.5 !py-1.5 !text-xs whitespace-nowrap sm:!px-3"
            >
              <CircleDot size={13} strokeWidth={2.5} aria-hidden />
              Portal
            </Button>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-foreground transition-colors hover:bg-white/[0.08] lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-x-3 top-[var(--header-offset)] z-40 sm:inset-x-5 lg:hidden">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-background/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <nav className="flex flex-col gap-0.5">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-white/10 text-foreground"
                        : "text-muted hover:bg-white/[0.05] hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/portal"
                onClick={closeMenu}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === "/portal"
                    ? "bg-white/10 text-foreground"
                    : "text-muted hover:bg-white/[0.05] hover:text-foreground"
                )}
              >
                Portal
              </Link>
              <div className="px-3 py-2">
                <CurrencySwitcher />
              </div>
              <Link
                href="/contact"
                onClick={closeMenu}
                className="mt-1 rounded-lg bg-bolt-fill px-3 py-2 text-center text-sm font-medium text-white"
              >
                Get started
              </Link>
            </nav>
          </div>
        </div>
      )}

      <div className="h-[var(--header-offset)] shrink-0" aria-hidden />
    </>
  );
}
