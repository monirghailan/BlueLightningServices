"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MarkdownContent } from "@/components/portal/MarkdownContent";
import { StatusBadge, PortalCard } from "@/components/portal/PortalCard";

interface TicketDetail {
  key: string;
  summary: string;
  description: string;
  status: string;
  type: string;
  priority: string | null;
  created: string | null;
  updated: string | null;
  comments: { id: string; author: string; body: string; created: string }[];
}

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const [key, setKey] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void params.then((p) => setKey(p.key));
  }, [params]);

  useEffect(() => {
    if (!key) return;
    fetch(`/api/portal/tickets/${key}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTicket(data);
      });
  }, [key]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!key || !comment.trim()) return;

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
    const refreshed = await fetch(`/api/portal/tickets/${key}`).then((r) => r.json());
    setTicket(refreshed);
  }

  if (!ticket && !error) {
    return <p className="text-sm text-muted">Loading ticket…</p>;
  }

  if (error && !ticket) {
    return (
      <div className="space-y-4">
        <p className="text-red-200">{error}</p>
        <Link href="/portal" className="text-sm text-bolt-outline hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/portal" className="text-sm text-muted hover:text-foreground">
          ← Back to dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-lg text-bolt-outline">{ticket.key}</h1>
          <StatusBadge status={ticket.status} />
          <span className="text-sm text-muted">{ticket.type}</span>
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
            className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-xl bg-bolt-fill px-4 py-2 text-sm font-medium text-white"
          >
            Post comment
          </button>
        </form>
      </PortalCard>
    </div>
  );
}
