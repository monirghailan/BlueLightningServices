"use client";

import { useEffect, useState } from "react";
import type { PortalMetrics } from "@/lib/portal/metrics";
import { PortalCard, StatCard } from "@/components/portal/PortalCard";
import { TypePieChart } from "@/components/portal/TypePieChart";

const emptyMetrics: PortalMetrics = {
  openTickets: 0,
  closedThisMonth: 0,
  avgTimeToCloseDays: 0,
  oldestOpen: null,
  byType: {},
  byStatus: {},
  throughput: [],
};

function MetricsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<PortalMetrics | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/portal/metrics");
        if (!active) return;
        if (res.ok) {
          setMetrics((await res.json()) as PortalMetrics);
        } else {
          setMetrics(emptyMetrics);
        }
      } catch {
        if (active) setMetrics(emptyMetrics);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (!metrics) {
    return <MetricsSkeleton />;
  }

  const statusEntries = Object.entries(metrics.byStatus);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Open tickets" value={metrics.openTickets} unit="tickets" />
        <StatCard
          label="Oldest open ticket"
          value={metrics.oldestOpen ? metrics.oldestOpen.ageDays : "—"}
          unit={metrics.oldestOpen ? "days" : undefined}
          hint={
            metrics.oldestOpen
              ? `${metrics.oldestOpen.key}: ${metrics.oldestOpen.summary}`
              : undefined
          }
        />
        <StatCard label="Closed this month" value={metrics.closedThisMonth} unit="tickets" />
        <StatCard
          label="Avg time to close this month"
          value={
            metrics.closedThisMonth > 0 ? metrics.avgTimeToCloseDays.toFixed(1) : "—"
          }
          unit={metrics.closedThisMonth > 0 ? "business days" : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PortalCard
          title="By status"
          description="All tickets, all time — where they sit in the workflow"
        >
          {statusEntries.length === 0 ? (
            <p className="text-sm text-muted">No ticket data yet.</p>
          ) : (
            <ul className="space-y-3">
              {statusEntries.map(([status, count]) => {
                const total = statusEntries.reduce((s, [, c]) => s + c, 0);
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <li key={status}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{status}</span>
                      <span className="text-muted">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                      <div
                        className="h-full rounded-full bg-bolt-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PortalCard>

        <PortalCard
          title="By type"
          description="All tickets, all time — Feature / Bug / Request mix"
        >
          {Object.keys(metrics.byType).length === 0 ? (
            <p className="text-sm text-muted">No ticket data yet.</p>
          ) : (
            <TypePieChart data={metrics.byType} />
          )}
        </PortalCard>
      </div>
    </div>
  );
}
