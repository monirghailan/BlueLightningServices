import { redirect } from "next/navigation";
import { getPortalSession, requirePortalAdmin } from "@/lib/portal/auth";
import { PortalCard } from "@/components/portal/PortalCard";
import { ReindexAssistantButton } from "@/components/portal/ReindexAssistantButton";
import { TeamManagement } from "@/components/portal/TeamManagement";

export default async function SettingsPage() {
  try {
    await requirePortalAdmin();
  } catch {
    redirect("/portal/assistant");
  }

  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const org = session.organization;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Organization profile, team access, and integrations.
        </p>
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
            <dt className="text-muted">Client label</dt>
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
          <div>
            <dt className="text-muted">Assistant</dt>
            <dd>{org.assistant_enabled ? "Enabled" : "Not configured"}</dd>
          </div>
          <div>
            <dt className="text-muted">Guide repo</dt>
            <dd className="font-mono text-xs break-all">{org.github_repo_url ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Last indexed</dt>
            <dd>
              {org.assistant_last_indexed_at
                ? new Date(org.assistant_last_indexed_at).toLocaleString()
                : "—"}
            </dd>
          </div>
        </dl>
      </PortalCard>

      {org.github_repo_url && (
        <PortalCard title="Org guide index">
          <p className="mb-4 text-sm text-muted">
            Re-index after updating the organization guide repository.
          </p>
          <ReindexAssistantButton />
        </PortalCard>
      )}

      <TeamManagement />
    </div>
  );
}
