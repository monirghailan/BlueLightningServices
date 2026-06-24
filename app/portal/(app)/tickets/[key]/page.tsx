import { notFound } from "next/navigation";
import { requirePortalAdmin } from "@/lib/portal/auth";
import { getTicketDetail } from "@/lib/portal/jira-db";
import { TicketDetailView } from "@/components/portal/TicketDetailView";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const session = await requirePortalAdmin();
  const { key } = await params;
  const ticket = await getTicketDetail(session.organization, key);

  if (!ticket) {
    notFound();
  }

  return <TicketDetailView initialTicket={ticket} ticketKey={key} />;
}
