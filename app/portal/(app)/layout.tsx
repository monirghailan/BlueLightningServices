import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPortalSession } from "@/lib/portal/auth";
import { PortalShell } from "@/components/portal/PortalShell";

export default async function PortalAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPortalSession();
  if (!session) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    redirect(user ? "/portal/login?error=no_access" : "/portal/login");
  }

  return (
    <PortalShell orgName={session.organization.name} role={session.role}>
      {children}
    </PortalShell>
  );
}
