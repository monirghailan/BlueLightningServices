import Link from "next/link";
import { computeMetrics } from "@/lib/portal/metrics";
import { getPortalSession } from "@/lib/portal/auth";
import { StatCard, PortalCard } from "@/components/portal/PortalCard";
import { StatusBadge } from "@/components/portal/PortalCard";
import { Button } from "@/components/ui/Button";

export default async function PortalDashboardPage() {
  const session = await getPortalSession();
  if (!session) return null;

  let metrics;
  try {
    metrics = await computeMetrics(session.organization);
  } catch {
    metrics = {
      openTickets: 0,
      closedThisMonth: 0,
      avgTimeToCloseDays: 0,
      oldestOpen: null,
      byType: {},
      byStatus: {},
      throughput: [],
      recentActivity: [],
    };
  }

  const statusEntries = Object.entries(metrics.byStatus);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Health snapshot for {session.organization.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Button href="/portal/backlog" variant="secondary" size="sm">
            Manage backlog
          </Button>
          <Button href="/portal/tickets/new" size="sm">
            New ticket
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open tickets" value={metrics.openTickets} />
        <StatCard
          label="Oldest open ticket"
          value={metrics.oldestOpen ? metrics.oldestOpen.ageDays : "—"}
          unit={metrics.oldestOpen ? "days" : undefined}
          hint={metrics.oldestOpen ? `${metrics.oldestOpen.key}: ${metrics.oldestOpen.summary}` : undefined}
        />
        <StatCard label="Closed this month" value={metrics.closedThisMonth} />
        <StatCard
          label="Avg time to close"
          value={
            metrics.closedThisMonth > 0 ? metrics.avgTimeToCloseDays.toFixed(1) : "—"
          }
          unit={metrics.closedThisMonth > 0 ? "days" : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PortalCard title="By status" description="Where your tickets sit in the workflow">
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

        <PortalCard title="By type" description="Feature / Bug / Request mix">
          {Object.keys(metrics.byType).length === 0 ? (
            <p className="text-sm text-muted">No ticket data yet.</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(metrics.byType).map(([type, count]) => (
                <li key={type} className="flex justify-between text-sm">
                  <span>{type}</span>
                  <span className="text-muted">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>
      </div>

      <PortalCard title="Recent activity" description="Latest updates across your tickets">
        {metrics.recentActivity.length === 0 ? (
          <p className="text-sm text-muted">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-border">
            {metrics.recentActivity.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/portal/tickets/${item.key}`}
                    className="font-mono text-sm text-bolt-outline hover:underline"
                  >
                    {item.key}
                  </Link>
                  <p className="truncate text-sm">{item.summary}</p>
                </div>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
