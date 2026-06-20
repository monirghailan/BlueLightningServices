"use client";

import { useState } from "react";
import { PortalCard } from "@/components/portal/PortalCard";
import { BacklogTable } from "@/components/portal/BacklogTable";
import { TicketsTable } from "@/components/portal/TicketsTable";

export function DashboardQueue() {
  const [ticketsRefreshKey, setTicketsRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      <PortalCard
        title="Backlog"
        description="Prioritize items here, then mark them ready to move onto the delivery board."
      >
        <BacklogTable onTicketReady={() => setTicketsRefreshKey((key) => key + 1)} />
      </PortalCard>

      <PortalCard title="Tickets" description="Browse and filter your organization's tickets">
        <TicketsTable refreshKey={ticketsRefreshKey} />
      </PortalCard>
    </div>
  );
}
