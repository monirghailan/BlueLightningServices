"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

interface BacklogItem {
  id: string;
  key: string | null;
  summary: string;
  status: string;
  type: string;
  priority: string | null;
  syncStatus?: string;
}

interface BacklogTableProps {
  onTicketReady?: () => void;
  reloadToken?: number;
}

const PAGE_SIZES = [5, 10, 25, 50] as const;

export function BacklogTable({ onTicketReady, reloadToken = 0 }: BacklogTableProps) {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [leadingKey, setLeadingKey] = useState<string | null>(null);
  const [trailingKey, setTrailingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
      setError(null);
    }
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    const res = await fetch(`/api/portal/backlog?${params}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.backlog ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
      setLeadingKey(data.leadingKey ?? null);
      setTrailingKey(data.trailingKey ?? null);
    } else if (!options?.silent) {
      const data = await res.json();
      setError(data.error ?? "Failed to load backlog.");
    }
    if (!options?.silent) {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (reloadToken === 0) return;
    void load();
  }, [reloadToken, load]);

  const hasPendingSync = items.some(
    (item) => !item.key || item.syncStatus === "pending_create"
  );

  useEffect(() => {
    if (!hasPendingSync || loading) return;

    let attempts = 0;
    const maxAttempts = 40;

    const interval = setInterval(() => {
      attempts += 1;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        return;
      }
      void load({ silent: true });
    }, 3000);

    return () => clearInterval(interval);
  }, [hasPendingSync, loading, load]);

  async function markReady(key: string) {
    setBusyKey(key);
    setError(null);

    const res = await fetch("/api/portal/backlog/move-to-board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueKeys: [key] }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Action failed.");
    } else {
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await load();
      }
      onTicketReady?.();
    }
    setBusyKey(null);
  }

  async function reorder(key: string, direction: "up" | "down", index: number) {
    const targetKey =
      direction === "up"
        ? index > 0
          ? items[index - 1].key
          : leadingKey
        : index < items.length - 1
          ? items[index + 1].key
          : trailingKey;

    if (!targetKey) return;

    setBusyKey(key);
    setError(null);

    const body =
      direction === "up"
        ? { issueKey: key, rankBeforeIssue: targetKey }
        : { issueKey: key, rankAfterIssue: targetKey };

    const res = await fetch("/api/portal/backlog/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Reorder failed.");
    } else {
      await load();
    }
    setBusyKey(null);
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-elevated text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Summary</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Loading backlog…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No backlog items.
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const globalIndex = (page - 1) * pageSize + index;
                const canMoveUp = globalIndex > 0 && !!item.key;
                const canMoveDown = globalIndex < total - 1 && !!item.key;
                const ticketRef = item.key ?? item.id;
                const isPending = !item.key || item.syncStatus === "pending_create";

                return (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono">
                      <Link
                        href={`/portal/tickets/${ticketRef}`}
                        className="text-bolt-outline hover:underline"
                      >
                        {item.key ?? "Pending…"}
                      </Link>
                    </td>
                    <td className="max-w-md truncate px-4 py-3">{item.summary}</td>
                    <td className="px-4 py-3 text-muted">{item.type}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={busyKey === ticketRef || !canMoveUp}
                          onClick={() => item.key && reorder(item.key, "up", index)}
                          className="rounded-lg border border-border p-1.5 text-muted hover:text-foreground disabled:opacity-40"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={busyKey === ticketRef || !canMoveDown}
                          onClick={() => item.key && reorder(item.key, "down", index)}
                          className="rounded-lg border border-border p-1.5 text-muted hover:text-foreground disabled:opacity-40"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={busyKey === ticketRef || isPending}
                          onClick={() => item.key && markReady(item.key)}
                          className="rounded-lg bg-bolt-fill px-3 py-1.5 text-sm font-medium text-white hover:bg-bolt-fill/90 disabled:opacity-50"
                        >
                          {isPending ? "Syncing…" : "Ready"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="flex flex-col gap-3 border-t border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted">
            <label htmlFor="backlog-page-size">Show</label>
            <select
              id="backlog-page-size"
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
              {total === 0 ? "No items" : `${rangeStart}–${rangeEnd} of ${total}`}
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
