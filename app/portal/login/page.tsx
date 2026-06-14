import { Suspense } from "react";
import PortalLoginPage from "./PortalLoginClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>}>
      <PortalLoginPage />
    </Suspense>
  );
}
