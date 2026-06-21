import type { CurrencyCode } from "./types";

export const EU_MEMBER_STATES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
]);

function regionFromLocale(locale: string): string | undefined {
  try {
    return new Intl.Locale(locale).region;
  } catch {
    const match = locale.match(/[-_]([A-Za-z]{2})$/);
    return match?.[1]?.toUpperCase();
  }
}

function currencyFromRegion(region: string | undefined): CurrencyCode {
  if (region === "GB") return "gbp";
  if (region && EU_MEMBER_STATES.has(region)) return "eur";
  return "usd";
}

export function detectCurrencyFromLocales(locales: readonly string[]): CurrencyCode {
  for (const locale of locales) {
    const region = regionFromLocale(locale);
    if (region) return currencyFromRegion(region);
  }
  return "usd";
}
