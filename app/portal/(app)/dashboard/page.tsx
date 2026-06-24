import { redirect } from "next/navigation";
import { requirePortalAdmin } from "@/lib/portal/auth";
import { getDashboardInitialData } from "@/lib/portal/dashboard-data";
import { DashboardMetrics } from "@/components/portal/DashboardMetrics";
import { DashboardQueue } from "@/components/portal/DashboardQueue";

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
    <div className="space-y-8">
      <DashboardMetrics initialMetrics={metrics} />
      <DashboardQueue initialBacklog={backlog} initialTickets={tickets} />
    </div>
  );
}
