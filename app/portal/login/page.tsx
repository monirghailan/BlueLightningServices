import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPortalSession, getPortalHomePath } from "@/lib/portal/auth";
import { PortalLoadingScreen } from "@/components/portal/PortalLoadingScreen";
import { noIndexMetadata } from "@/lib/seo";
import PortalLoginPage from "./PortalLoginClient";

export const metadata: Metadata = noIndexMetadata;

async function LoginGate() {
  const session = await getPortalSession();
  if (session) {
    redirect(getPortalHomePath(session.role));
  }

  return <PortalLoginPage />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 bg-background">
          <PortalLoadingScreen fullScreen />
        </div>
      }
    >
      <LoginGate />
    </Suspense>
  );
}
