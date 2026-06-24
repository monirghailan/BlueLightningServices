import { PortalContentLoadingLayout } from "@/components/portal/PortalLoadingScreen";

function PortalLoadingHeader() {
  return (
    <header className="relative z-20 border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Client Portal</p>
          <div className="mt-1.5 h-6 w-36 animate-pulse rounded-md bg-surface-elevated" />
        </div>
        <div className="hidden h-9 w-48 animate-pulse rounded-lg bg-surface-elevated sm:block" />
        <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-elevated" />
      </div>
      <div className="border-t border-border px-4 py-2 sm:hidden">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-surface-elevated" />
      </div>
    </header>
  );
}

export function PortalAppLoadingFallback() {
  return <PortalContentLoadingLayout header={<PortalLoadingHeader />} />;
}
