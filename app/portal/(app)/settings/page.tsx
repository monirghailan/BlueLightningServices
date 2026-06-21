import { redirect } from "next/navigation";
import { getPortalSession, requirePortalAdmin } from "@/lib/portal/auth";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/components/portal/Profile";
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

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", session.userId)
    .maybeSingle();

  const org = session.organization;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Your profile, team access, and integrations.
        </p>
      </div>

      <Profile
        organizationName={org.name}
        userName={profile?.full_name ?? null}
        userEmail={session.email}
        userRole={session.role}
      />

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
