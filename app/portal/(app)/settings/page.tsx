import { redirect } from "next/navigation";
import { getPortalSession, requirePortalAdmin } from "@/lib/portal/auth";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/components/portal/Profile";
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

      <TeamManagement currentUserId={session.userId} />
    </div>
  );
}
