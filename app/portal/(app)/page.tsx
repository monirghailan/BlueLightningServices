import { redirect } from "next/navigation";
import { requirePortalAdmin } from "@/lib/portal/auth";
import { DashboardMetrics } from "@/components/portal/DashboardMetrics";
import { DashboardQueue } from "@/components/portal/DashboardQueue";

export default async function PortalDashboardPage() {
  let session;
  try {
    session = await requirePortalAdmin();
  } catch {
    redirect("/portal/assistant");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Health snapshot for {session.organization.name}
        </p>
      </div>

      <DashboardMetrics />
      <DashboardQueue />
    </div>
  );
}
