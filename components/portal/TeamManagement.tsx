"use client";

import { useEffect, useState } from "react";
import type { AssistantPersona } from "@/lib/supabase/database.types";
import {
  ASSISTANT_PERSONA_LABELS,
  ASSISTANT_PERSONAS,
} from "@/lib/assistant/personas";
import { PortalCard } from "@/components/portal/PortalCard";

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

interface TeamManagementProps {
  currentUserId: string;
}

export function TeamManagement({ currentUserId }: TeamManagementProps) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invitations, setInvitations] = useState<InviteRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"standard" | "administrator">("standard");
  const [assistantPersona, setAssistantPersona] = useState<AssistantPersona>("general");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/portal/team");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoadError(data.error ?? "Failed to load team.");
      return;
    }
    setLoadError(null);
    const data = await res.json();
    setMembers(data.members ?? []);
    setInvitations(data.invitations ?? []);
  }

  useEffect(() => {
    let active = true;
    async function fetchTeam() {
      const res = await fetch("/api/portal/team");
      if (!active) return;
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoadError(data.error ?? "Failed to load team.");
        return;
      }
      setLoadError(null);
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
      body: JSON.stringify({ email, role, assistantPersona }),
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
    <div className="space-y-6">
      <PortalCard title="Team" description="Invite users and manage roles.">
        <form
          onSubmit={invite}
          className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]"
        >
          {message && <p className="sm:col-span-4 text-sm text-emerald-300">{message}</p>}
          {error && <p className="sm:col-span-4 text-sm text-red-200">{error}</p>}
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
          <select
            value={assistantPersona}
            onChange={(e) => setAssistantPersona(e.target.value as AssistantPersona)}
            className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
          >
            {ASSISTANT_PERSONAS.map((persona) => (
              <option key={persona} value={persona}>
                {ASSISTANT_PERSONA_LABELS[persona]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-bolt-fill px-4 py-2 text-sm font-medium text-white"
          >
            Send invite
          </button>
        </form>
      </PortalCard>

      <PortalCard title="Members">
        {loadError && <p className="mb-3 text-sm text-red-200">{loadError}</p>}
        {members.length === 0 && !loadError ? (
          <p className="text-sm text-muted">No team members yet.</p>
        ) : (
        <ul className="divide-y divide-border">
          {members.map((m) => {
            const isCurrentUser = m.profiles?.id === currentUserId;
            return (
            <li
              key={m.id}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium">
                  {m.profiles?.full_name ?? m.profiles?.email ?? "Unknown member"}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs font-normal text-muted">(you)</span>
                  )}
                </p>
                {m.profiles?.email && (
                  <p className="text-xs text-muted">{m.profiles.email}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isCurrentUser ? (
                  <span className="rounded-lg border border-border bg-surface-elevated px-2 py-1 text-sm capitalize text-muted">
                    {m.role}
                  </span>
                ) : (
                  <select
                    value={m.role}
                    disabled={!m.profiles}
                    onChange={(e) =>
                      m.profiles &&
                      updateRole(m.profiles.id, e.target.value as "standard" | "administrator")
                    }
                    className="rounded-lg border border-border bg-surface-elevated px-2 py-1 text-sm"
                  >
                    <option value="standard">Standard</option>
                    <option value="administrator">Administrator</option>
                  </select>
                )}
                {!isCurrentUser && (
                  <button
                    type="button"
                    disabled={!m.profiles}
                    onClick={() => m.profiles && removeMember(m.profiles.id)}
                    className="rounded-lg border border-border px-2 py-1 text-sm text-muted hover:text-red-200 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
            );
          })}
        </ul>
        )}
      </PortalCard>

      {invitations.length > 0 && (
        <PortalCard title="Pending invitations">
          <ul className="space-y-2 text-sm">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex justify-between text-muted">
                <span>{inv.email}</span>
                <span>
                  {inv.role} · expires {new Date(inv.expires_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </PortalCard>
      )}
    </div>
  );
}
