"use client";

import { useEffect, useState } from "react";

interface MemberRow {
  id: string;
  role: string;
  joined_at: string;
  profiles: { id: string; email: string; full_name: string | null } | null;
}

interface InviteRow {
  id: string;
  email: string;
  role: string;
  expires_at: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invitations, setInvitations] = useState<InviteRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"standard" | "administrator">("standard");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/portal/team");
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members ?? []);
      setInvitations(data.invitations ?? []);
    }
  }

  useEffect(() => {
    let active = true;
    async function fetchTeam() {
      const res = await fetch("/api/portal/team");
      if (!active || !res.ok) return;
      const data = await res.json();
      setMembers(data.members ?? []);
      setInvitations(data.invitations ?? []);
    }
    void fetchTeam();
    return () => {
      active = false;
    };
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const res = await fetch("/api/portal/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Invite failed.");
      return;
    }

    setMessage(`Invitation sent to ${email}.`);
    setEmail("");
    await load();
  }

  async function updateRole(userId: string, newRole: "standard" | "administrator") {
    await fetch("/api/portal/team/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    await load();
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/portal/team/members?userId=${userId}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-muted">Invite users and manage roles.</p>
      </div>

      <form onSubmit={invite} className="grid gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[1fr_auto_auto]">
        {message && <p className="sm:col-span-3 text-sm text-emerald-300">{message}</p>}
        {error && <p className="sm:col-span-3 text-sm text-red-200">{error}</p>}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@company.com"
          className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "standard" | "administrator")}
          className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
        >
          <option value="standard">Standard</option>
          <option value="administrator">Administrator</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-bolt-fill px-4 py-2 text-sm font-medium text-white"
        >
          Send invite
        </button>
      </form>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-semibold">Members</h2>
        <ul className="mt-4 divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{m.profiles?.full_name ?? m.profiles?.email}</p>
                <p className="text-xs text-muted">{m.profiles?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  onChange={(e) =>
                    updateRole(m.profiles!.id, e.target.value as "standard" | "administrator")
                  }
                  className="rounded-lg border border-border bg-surface-elevated px-2 py-1 text-sm"
                >
                  <option value="standard">Standard</option>
                  <option value="administrator">Administrator</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeMember(m.profiles!.id)}
                  className="rounded-lg border border-border px-2 py-1 text-sm text-muted hover:text-red-200"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {invitations.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold">Pending invitations</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex justify-between text-muted">
                <span>{inv.email}</span>
                <span>
                  {inv.role} · expires {new Date(inv.expires_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
