import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "glow-border rounded-2xl border border-border bg-surface-elevated/80 p-6 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
