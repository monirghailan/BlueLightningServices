"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/portal/PortalCard";

interface TicketRow {
  key: string;
  summary: string;
  status: string;
  type: string;
  updated: string | null;
}

export default function TicketsPage() {
  const [issues, setIssues] = useState<TicketRow[]>([]);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (q) params.set("q", q);

    fetch(`/api/portal/tickets?${params}`)
      .then((r) => r.json())
      .then((data) => setIssues(data.issues ?? []));
  }, [status, type, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
          <p className="mt-1 text-sm text-muted">All tickets for your organization.</p>
        </div>
        <Link
          href="/portal/tickets/new"
          className="inline-flex rounded-xl bg-bolt-fill px-4 py-2 text-sm font-medium text-white"
        >
          New ticket
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search summary…"
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option>To Do</option>
          <option>In Progress</option>
          <option>In Review</option>
          <option>Done</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option>Feature</option>
          <option>Bug</option>
          <option>Request</option>
          <option>Task</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-elevated text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Summary</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No tickets found.
                </td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue.key} className="border-t border-border">
                  <td className="px-4 py-3 font-mono">
                    <Link
                      href={`/portal/tickets/${issue.key}`}
                      className="text-bolt-outline hover:underline"
                    >
                      {issue.key}
                    </Link>
                  </td>
                  <td className="max-w-md truncate px-4 py-3">{issue.summary}</td>
                  <td className="px-4 py-3 text-muted">{issue.type}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={issue.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
