import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal/auth";
import { PortalShell } from "@/components/portal/PortalShell";

export default async function PortalAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPortalSession();
  if (!session) {
    redirect("/portal/login");
  }

  return (
    <PortalShell
      orgName={session.organization.name}
      role={session.role}
      email={session.email}
    >
      {children}
    </PortalShell>
  );
}
