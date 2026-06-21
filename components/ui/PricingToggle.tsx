"use client";

import { cn } from "@/lib/utils";

interface PricingToggleProps {
  annual: boolean;
  onChange: (annual: boolean) => void;
  savingsLabel?: string;
}

export function PricingToggle({ annual, onChange, savingsLabel }: PricingToggleProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface p-1">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium transition-all",
          !annual
            ? "bg-bolt-fill text-white"
            : "text-muted hover:text-foreground"
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
          annual
            ? "bg-bolt-fill text-white"
            : "text-muted hover:text-foreground"
        )}
      >
        Annual
        {savingsLabel && (
          <span className="rounded-full bg-bolt-glow/20 px-2 py-0.5 text-xs text-bolt-outline">
            {savingsLabel}
          </span>
        )}
      </button>
    </div>
  );
}
