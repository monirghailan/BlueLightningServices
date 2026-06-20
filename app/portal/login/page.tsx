import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPortalSession, getPortalHomePath } from "@/lib/portal/auth";
import PortalLoginPage from "./PortalLoginClient";

export default async function Page() {
  const session = await getPortalSession();
  if (session) {
    redirect(getPortalHomePath(session.role));
  }

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>}>
      <PortalLoginPage />
    </Suspense>
  );
}
