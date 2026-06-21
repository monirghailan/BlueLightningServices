import type { CurrencyConfig } from "./types";

export type Formatters = ReturnType<typeof createFormatters>;

function formatCompactAmount(amount: number, config: CurrencyConfig): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const formatted =
      millions % 1 === 0
        ? `${millions}M`
        : `${millions.toFixed(1).replace(/\.0$/, "")}M`;
    return `${getCurrencySymbol(config)}${formatted}`;
  }

  if (amount >= 1_000) {
    const thousands = amount / 1_000;
    const formatted =
      thousands % 1 === 0
        ? `${thousands}K`
        : `${thousands.toFixed(1).replace(/\.0$/, "")}K`;
    return `${getCurrencySymbol(config)}${formatted}`;
  }

  return formatMoney(amount, config);
}

function getCurrencySymbol(config: CurrencyConfig): string {
  const parts = new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.iso,
    maximumFractionDigits: 0,
  }).formatToParts(0);
  return parts.find((part) => part.type === "currency")?.value ?? config.iso;
}

export function formatMoney(amount: number, config: CurrencyConfig): string {
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.iso,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createFormatters(config: CurrencyConfig) {
  return {
    formatMoney: (amount: number) => formatMoney(amount, config),
    formatMoneyPerMonth: (amount: number) =>
      `${formatMoney(amount, config)}/mo`,
    formatCompactRange: (min: number, max: number) =>
      `${formatCompactAmount(min, config)}–${formatCompactAmount(max, config)}+`,
    formatAnnualBilling: (upfront: number) =>
      `${formatMoney(upfront, config)} billed once per year · 12-month commitment`,
    formatAnnualSavings: (savings: number) =>
      `Save ${formatMoney(savings, config)}/year`,
  };
}
