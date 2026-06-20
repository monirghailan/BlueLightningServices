import { computeMetrics } from "@/lib/portal/metrics";
import { getPortalSession } from "@/lib/portal/auth";
import { StatCard, PortalCard } from "@/components/portal/PortalCard";
import { DashboardQueue } from "@/components/portal/DashboardQueue";

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
    };
  }

  const statusEntries = Object.entries(metrics.byStatus);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Health snapshot for {session.organization.name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Open tickets" value={metrics.openTickets} unit="tickets" />
        <StatCard
          label="Oldest open ticket"
          value={metrics.oldestOpen ? metrics.oldestOpen.ageDays : "—"}
          unit={metrics.oldestOpen ? "days" : undefined}
          hint={metrics.oldestOpen ? `${metrics.oldestOpen.key}: ${metrics.oldestOpen.summary}` : undefined}
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

      <DashboardQueue />
    </div>
  );
}
