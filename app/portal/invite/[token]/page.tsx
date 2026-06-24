"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PortalAuthShell,
  PortalBackToWebsiteLink,
} from "@/components/portal/PortalAuthShell";
import { PortalLoadingScreen } from "@/components/portal/PortalLoadingScreen";
import { site } from "@/lib/content";

export default function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [invite, setInvite] = useState<{ email: string; orgName: string; role: string } | null>(
    null
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    void params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/portal/invite?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setInvite(data);
      });
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    const res = await fetch("/api/portal/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to accept invitation.");
      setLoading(false);
      return;
    }

    await fetch("/api/portal/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password }),
    })
      .then((r) => r.json())
      .then((authData) => {
        const home =
          authData.home ??
          (invite?.role === "administrator" ? "/portal/dashboard" : "/portal/assistant");
        setRedirecting(true);
        window.location.assign(home);
      });
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
        <h1 className="mt-2 text-2xl font-semibold">Accept invitation</h1>

        {invite ? (
          <p className="mt-2 text-sm text-muted">
            Join <strong>{invite.orgName}</strong> as {invite.role} ({invite.email})
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Loading invitation…</p>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <label className="block space-y-1">
            <span className="text-sm text-muted">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={loading || !invite}
            className="w-full rounded-xl bg-bolt-fill py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <PortalBackToWebsiteLink />

        <p className="mt-2 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/portal/login" className="text-bolt-outline hover:underline">
            Sign in
          </Link>
        </p>
    </PortalAuthShell>
  );
}
