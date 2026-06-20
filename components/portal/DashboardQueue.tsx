"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PortalCard } from "@/components/portal/PortalCard";
import { BacklogTable } from "@/components/portal/BacklogTable";
import { TicketsTable } from "@/components/portal/TicketsTable";

const NewTicketModal = dynamic(
  () =>
    import("@/components/portal/NewTicketModal").then((m) => ({
      default: m.NewTicketModal,
    })),
  { ssr: false }
);

export function DashboardQueue() {
  const [ticketsRefreshKey, setTicketsRefreshKey] = useState(0);
  const [backlogReloadToken, setBacklogReloadToken] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  function handleTicketCreated(_key: string) {
    setBacklogReloadToken((token) => token + 1);
  }

  return (
    <div className="space-y-8">
      <PortalCard
        title="Backlog"
        description="Prioritize items here, then mark them ready to move onto the delivery board."
        action={
          <Button
            variant="portal"
            size="sm"
            className="!inline-flex !items-center !gap-1.5 !px-3 !py-1.5 !text-xs"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={13} strokeWidth={2.5} aria-hidden />
            New ticket
          </Button>
        }
      >
        <BacklogTable
          reloadToken={backlogReloadToken}
          onTicketReady={() => setTicketsRefreshKey((key) => key + 1)}
        />
      </PortalCard>

      <PortalCard title="Tickets" description="Browse and filter your organization's tickets">
        <TicketsTable refreshKey={ticketsRefreshKey} />
      </PortalCard>

      {modalOpen && (
        <NewTicketModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreated={handleTicketCreated}
        />
      )}
    </div>
  );
}
