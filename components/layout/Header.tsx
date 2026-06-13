"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoMark } from "@/components/logo/LogoMark";
import { Button } from "@/components/ui/Button";
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
              "mx-auto flex h-[var(--header-bar-height)] w-full max-w-6xl items-center gap-2 rounded-xl border px-2 transition-all duration-300 sm:gap-3 sm:px-2.5",
              scrolled
                ? "border-white/10 bg-white/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                : "border-white/8 bg-white/[0.03]"
            )}
          >
          <LogoMark
            showText={false}
            className="shrink-0"
            logoClassName="h-7 w-auto sm:h-8"
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
            <Button
              href="/contact"
              size="sm"
              className="hidden !px-3 !py-1.5 !text-xs sm:inline-flex"
            >
              Get started
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
            </nav>
            <Button href="/contact" size="sm" className="mt-2 w-full sm:hidden">
              Get started
            </Button>
          </div>
        </div>
      )}

      <div className="h-[var(--header-offset)] shrink-0" aria-hidden />
    </>
  );
}
