import { redirect } from "next/navigation";
import { requirePortalAdmin } from "@/lib/portal/auth";
import { getDashboardInitialData } from "@/lib/portal/dashboard-data";
import { DashboardView } from "@/components/portal/DashboardView";

export default async function PortalDashboardPage() {
  let session;
  try {
    session = await requirePortalAdmin();
  } catch {
    redirect("/portal/assistant");
  }

  const { metrics, backlog, tickets } = await getDashboardInitialData(
    session.organization
  );

  return (
    <DashboardView
      initialMetrics={metrics}
      initialBacklog={backlog}
      initialTickets={tickets}
    />
  );
}
