import { redirect } from "next/navigation";
import { requirePortalAdmin } from "@/lib/portal/auth";
import { DashboardMetrics } from "@/components/portal/DashboardMetrics";
import { DashboardQueue } from "@/components/portal/DashboardQueue";

export default async function PortalDashboardPage() {
  try {
    await requirePortalAdmin();
  } catch {
    redirect("/portal/assistant");
  }

  return (
    <div className="space-y-8">
      <DashboardMetrics />
      <DashboardQueue />
    </div>
  );
}
