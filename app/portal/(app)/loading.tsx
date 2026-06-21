export default function PortalAppLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-48 rounded-lg bg-surface-elevated" />
        <div className="mt-2 h-4 w-72 max-w-full rounded bg-surface-elevated" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
      <div className="h-64 rounded-2xl border border-border bg-surface" />
    </div>
  );
}
