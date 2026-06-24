"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarkdownContent } from "@/components/portal/MarkdownContent";
import { StatusBadge, PortalCard } from "@/components/portal/PortalCard";
import type { SerializedTicketDetail } from "@/lib/portal/jira-db";

interface TicketDetailViewProps {
  initialTicket: SerializedTicketDetail;
  ticketKey: string;
}

export function TicketDetailView({ initialTicket, ticketKey }: TicketDetailViewProps) {
  const router = useRouter();
  const [key, setKey] = useState(ticketKey);
  const [ticket, setTicket] = useState<SerializedTicketDetail>(initialTicket);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTicket = useCallback(
    async (ticketKey: string, options?: { silent?: boolean }) => {
      const res = await fetch(`/api/portal/tickets/${ticketKey}`);
      const data = await res.json();

      if (data.error) {
        if (!options?.silent) setError(data.error);
        return null;
      }

      setTicket(data);
      setError(null);
      return data as SerializedTicketDetail;
    },
    []
  );

  useEffect(() => {
    setKey(ticketKey);
    setTicket(initialTicket);
  }, [ticketKey, initialTicket]);

  const isPendingSync =
    ticket.syncStatus === "pending_create" || (ticket != null && !ticket.key);

  useEffect(() => {
    if (!key || !isPendingSync) return;

    let attempts = 0;
    const maxAttempts = 40;

    const interval = setInterval(() => {
      attempts += 1;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        return;
      }

      void loadTicket(key, { silent: true }).then((data) => {
        if (data?.key && data.key !== key) {
          router.replace(`/portal/tickets/${data.key}`, { scroll: false });
          setKey(data.key);
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [key, isPendingSync, loadTicket, router]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!key || !comment.trim() || posting) return;

    setPosting(true);
    try {
      const res = await fetch(`/api/portal/tickets/${key}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to post comment.");
        return;
      }

      setComment("");
      await loadTicket(key);
    } finally {
      setPosting(false);
    }
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-red-200">{error}</p>
        <Link href="/portal/dashboard" className="text-sm text-bolt-outline hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/portal/dashboard" className="text-sm text-muted hover:text-foreground">
          ← Back to dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-lg text-bolt-outline">
            {ticket.key ?? "Pending sync"}
          </h1>
          <StatusBadge status={ticket.status} />
          <span className="text-sm text-muted">{ticket.type}</span>
          {ticket.syncStatus === "pending_create" && (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-200">
              Syncing to Jira…
            </span>
          )}
        </div>
        <p className="mt-2 text-xl font-semibold">{ticket.summary}</p>
      </div>

      <PortalCard title="Description">
        {ticket.description ? (
          <MarkdownContent
            content={ticket.description}
            className="text-sm leading-relaxed text-foreground/90"
          />
        ) : (
          <p className="text-sm text-muted">No description.</p>
        )}
      </PortalCard>

      <PortalCard title="Comments">
        <ul className="space-y-4">
          {ticket.comments.length === 0 ? (
            <li className="text-sm text-muted">No comments yet.</li>
          ) : (
            ticket.comments.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-surface-elevated p-3">
                <p className="text-xs text-muted">
                  {c.author} · {new Date(c.created).toLocaleString()}
                </p>
                <MarkdownContent content={c.body} className="mt-2 text-sm" />
              </li>
            ))
          )}
        </ul>

        <form onSubmit={submitComment} className="mt-4 space-y-3 border-t border-border pt-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Add a comment…"
            disabled={posting}
            className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={posting || !comment.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-bolt-fill px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {posting && (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {posting ? "Posting…" : "Post comment"}
          </button>
        </form>
      </PortalCard>
    </div>
  );
}
