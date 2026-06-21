import Link from "next/link";
import { LogoMark } from "@/components/logo/LogoMark";
import { navLinks, site } from "@/lib/content";

export function Footer({ embedded = false }: { embedded?: boolean }) {
  return (
    <footer className={embedded ? "border-t border-border bg-surface" : "mt-auto border-t border-border bg-surface"}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <LogoMark />
            <p className="mt-4 text-sm text-muted">{site.tagline}</p>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold text-foreground">Pages</p>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/portal" className="text-sm text-muted hover:text-foreground">
                Client portal
              </Link>
            </nav>
          </div>
          <div>
            <p className="mb-4 text-sm font-semibold text-foreground">Contact</p>
            <a
              href={`mailto:${site.email}`}
              className="text-sm text-bolt-outline hover:text-bolt-glow"
            >
              {site.email}
            </a>
            <p className="mt-4 text-xs text-muted">
              <Link href="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
