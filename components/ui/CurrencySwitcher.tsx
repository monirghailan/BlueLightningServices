"use client";

import { currencyOrder } from "@/lib/pricing/currencies";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/providers/CurrencyProvider";

export function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency, isReady } = useCurrency();

  if (!isReady) {
    return (
      <div
        className={cn(
          "inline-flex h-7 items-center rounded-md border border-white/10 bg-white/[0.04] px-2",
          className,
        )}
        aria-hidden
      >
        <span className="h-3 w-12 animate-pulse rounded bg-white/10" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.04] p-0.5",
        className,
      )}
      role="group"
      aria-label="Pricing currency"
    >
      {currencyOrder.map((code) => {
        const active = currency === code;
        const label =
          code === "gbp" ? "UK" : code === "eur" ? "EU" : "US";
        const symbol = code === "gbp" ? "£" : code === "eur" ? "€" : "$";

        return (
          <button
            key={code}
            type="button"
            onClick={() => setCurrency(code)}
            aria-pressed={active}
            className={cn(
              "rounded px-2 py-1 text-[11px] font-medium leading-none transition-all",
              active
                ? "bg-white/10 text-foreground"
                : "text-muted hover:bg-white/[0.06] hover:text-foreground",
            )}
          >
            {label} ({symbol})
          </button>
        );
      })}
    </div>
  );
}
