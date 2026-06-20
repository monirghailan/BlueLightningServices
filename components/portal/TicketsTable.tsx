"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/portal/PortalCard";
import { Button } from "@/components/ui/Button";

interface TicketRow {
  key: string;
  summary: string;
  status: string;
  type: string;
  updated: string | null;
}

const PAGE_SIZES = [5, 10, 25, 50] as const;

export function TicketsTable() {
  const [issues, setIssues] = useState<TicketRow[]>([]);
  const [status, setStatus] = useState("In Progress");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (q) params.set("q", q);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    setLoading(true);
    fetch(`/api/portal/tickets?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setIssues(data.issues ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 0);
      })
      .finally(() => setLoading(false));
  }, [status, type, q, page, pageSize]);

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search summary…"
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
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
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option>Feature</option>
          <option>Bug</option>
          <option>Request</option>
          <option>Task</option>
        </select>
        </div>
        <Button href="/portal/backlog" variant="secondary" size="sm" className="shrink-0">
          Manage backlog
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
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
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Loading tickets…
                </td>
              </tr>
            ) : issues.length === 0 ? (
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

        <div className="flex flex-col gap-3 border-t border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted">
            <label htmlFor="page-size">Show</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-sm text-foreground"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">
              {total === 0 ? "No tickets" : `${rangeStart}–${rangeEnd} of ${total}`}
            </span>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
