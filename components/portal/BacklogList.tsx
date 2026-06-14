"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/portal/PortalCard";

export interface BacklogItem {
  key: string;
  summary: string;
  status: string;
  type: string;
  priority: string | null;
}

interface BacklogListProps {
  title: string;
  description: string;
  items: BacklogItem[];
  mode: "backlog" | "ready";
  onRefresh: () => Promise<void>;
}

export function BacklogList({
  title,
  description,
  items,
  mode,
  onRefresh,
}: BacklogListProps) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function move(key: string) {
    setBusyKey(key);
    setError(null);
    const endpoint =
      mode === "backlog"
        ? "/api/portal/backlog/move-to-board"
        : "/api/portal/backlog/move-to-backlog";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueKeys: [key] }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Action failed.");
    } else {
      await onRefresh();
    }
    setBusyKey(null);
  }

  async function reorder(key: string, direction: "up" | "down") {
    const index = items.findIndex((i) => i.key === key);
    if (index < 0) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const target = items[targetIndex];
    setBusyKey(key);
    setError(null);

    const body =
      direction === "up"
        ? { issueKey: key, rankBeforeIssue: target.key }
        : { issueKey: key, rankAfterIssue: target.key };

    const res = await fetch("/api/portal/backlog/rank", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Reorder failed.");
    } else {
      await onRefresh();
    }
    setBusyKey(null);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted">No items.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={item.key}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/portal/tickets/${item.key}`}
                    className="font-mono text-sm text-bolt-outline hover:underline"
                  >
                    {item.key}
                  </Link>
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-muted">{item.type}</span>
                </div>
                <p className="mt-1 truncate text-sm">{item.summary}</p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {mode === "backlog" && (
                  <>
                    <button
                      type="button"
                      disabled={busyKey === item.key || index === 0}
                      onClick={() => reorder(item.key, "up")}
                      className="rounded-lg border border-border p-2 text-muted hover:text-foreground disabled:opacity-40"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busyKey === item.key || index === items.length - 1}
                      onClick={() => reorder(item.key, "down")}
                      className="rounded-lg border border-border p-2 text-muted hover:text-foreground disabled:opacity-40"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={busyKey === item.key}
                  onClick={() => move(item.key)}
                  className="inline-flex items-center gap-1 rounded-lg bg-bolt-fill px-3 py-2 text-sm font-medium text-white hover:bg-bolt-fill/90 disabled:opacity-50"
                >
                  {mode === "backlog" ? "Move to board" : "Return to backlog"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
