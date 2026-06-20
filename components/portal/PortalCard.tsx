import { cn } from "@/lib/utils";

interface PortalCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function PortalCard({
  children,
  className,
  title,
  description,
  action,
}: PortalCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-sm",
        className
      )}
    >
      {(title || description || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
}) {
  return (
    <PortalCard>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">
        {value}
        {unit ? (
          <>
            {" "}
            <span className="text-sm font-normal text-muted">{unit}</span>
          </>
        ) : null}
      </p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </PortalCard>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Done"
      ? "bg-emerald-500/15 text-emerald-300"
      : status === "In Progress" || status === "In Review"
        ? "bg-amber-500/15 text-amber-200"
        : "bg-bolt-fill/20 text-bolt-outline";

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", tone)}>
      {status}
    </span>
  );
}
