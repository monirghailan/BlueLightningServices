import { redirect } from "next/navigation";
import { getPortalSession, getPortalHomePath } from "@/lib/portal/auth";
import { PortalLandingPage } from "@/components/portal/PortalLandingPage";

export default async function PortalEntryPage() {
  const session = await getPortalSession();
  if (session) {
    redirect(getPortalHomePath(session.role));
  }

  return <PortalLandingPage />;
}
