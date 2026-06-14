import { redirect } from "next/navigation";
import { getPortalSession, requirePortalAdmin } from "@/lib/portal/auth";
import { PortalCard } from "@/components/portal/PortalCard";

export default async function SettingsPage() {
  try {
    await requirePortalAdmin();
  } catch {
    redirect("/portal");
  }

  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const org = session.organization;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">Organization profile and Jira linkage.</p>
      </div>

      <PortalCard title="Organization">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-medium">{org.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Slug</dt>
            <dd className="font-mono">{org.slug}</dd>
          </div>
          <div>
            <dt className="text-muted">Jira project</dt>
            <dd className="font-mono">{org.jira_project_key}</dd>
          </div>
          <div>
            <dt className="text-muted">Component</dt>
            <dd className="font-mono">{org.jira_component_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Board ID</dt>
            <dd className="font-mono">{org.jira_board_id ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="capitalize">{org.status}</dd>
          </div>
        </dl>
      </PortalCard>
    </div>
  );
}
