"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PortalAuthShell,
  PortalBackToWebsiteLink,
} from "@/components/portal/PortalAuthShell";
import { PortalLoadingScreen } from "@/components/portal/PortalLoadingScreen";
import { site, portalLanding } from "@/lib/content";

export default function PortalLoginPage() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const errorParam = searchParams.get("error");
  const [error, setError] = useState<string | null>(() => {
    if (errorParam === "no_access") {
      return "Your account does not have portal access. Contact support if you believe this is a mistake.";
    }
    if (errorParam) {
      return "Authentication failed. Please try again.";
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/portal/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Login failed.");
      setLoading(false);
      return;
    }

    const destination =
      nextParam && nextParam !== "/portal" ? nextParam : (data.home ?? "/portal/assistant");
    setRedirecting(true);
    window.location.assign(destination);
  }

  if (redirecting) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <PortalLoadingScreen fullScreen />
      </div>
    );
  }

  return (
    <PortalAuthShell>
        <p className="text-xs uppercase tracking-wider text-muted">{site.name}</p>
        <h1 className="mt-2 text-2xl font-semibold">Client portal</h1>
        <p className="mt-2 text-sm text-muted">{portalLanding.loginReminder}</p>
        <p className="mt-1 text-sm text-muted">
          <Link href="/portal" className="text-bolt-outline hover:underline">
            Learn what&apos;s included
          </Link>
          {" · "}
          Sign in with your invited account.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <label className="block space-y-1">
            <span className="text-sm text-muted">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm text-muted">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-bolt-fill py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <PortalBackToWebsiteLink />

        <p className="mt-2 text-center text-xs text-muted">
          Need access?{" "}
          <Link href="/contact" className="text-bolt-outline hover:underline">
            Contact {site.name}
          </Link>
        </p>
    </PortalAuthShell>
  );
}
