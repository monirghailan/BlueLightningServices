"use client";

import { useState } from "react";
import type { PortalMetrics } from "@/lib/portal/metrics";
import { DashboardMetrics } from "@/components/portal/DashboardMetrics";
import {
  DashboardQueue,
  type DashboardQueueProps,
} from "@/components/portal/DashboardQueue";

interface DashboardViewProps extends DashboardQueueProps {
  initialMetrics: PortalMetrics & { computedAt?: string };
}

export function DashboardView({
  initialMetrics,
  initialBacklog,
  initialTickets,
}: DashboardViewProps) {
  const [metricsRefreshToken, setMetricsRefreshToken] = useState(0);

  return (
    <div className="space-y-8">
      <DashboardMetrics
        initialMetrics={initialMetrics}
        refreshToken={metricsRefreshToken}
      />
      <DashboardQueue
        initialBacklog={initialBacklog}
        initialTickets={initialTickets}
        onTicketSynced={() => setMetricsRefreshToken((token) => token + 1)}
      />
    </div>
  );
}
