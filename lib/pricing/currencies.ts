import type { CurrencyCode, CurrencyConfig } from "./types";

export const STORAGE_KEY = "bls-currency";

export const currencies: Record<CurrencyCode, CurrencyConfig> = {
  gbp: {
    code: "gbp",
    iso: "GBP",
    locale: "en-GB",
    label: "UK (£)",
    prices: {
      monthly: 3999,
      annualEquivalent: 3499,
      annualUpfront: 41988,
      annualSavings: 6000,
      inHouseMin: 100_000,
      inHouseMax: 200_000,
    },
  },
  eur: {
    code: "eur",
    iso: "EUR",
    locale: "de-DE",
    label: "EU (€)",
    prices: {
      monthly: 4599,
      annualEquivalent: 4099,
      annualUpfront: 49188,
      annualSavings: 6000,
      inHouseMin: 100_000,
      inHouseMax: 200_000,
    },
  },
  usd: {
    code: "usd",
    iso: "USD",
    locale: "en-US",
    label: "US ($)",
    prices: {
      monthly: 5199,
      annualEquivalent: 4699,
      annualUpfront: 56388,
      annualSavings: 6000,
      inHouseMin: 100_000,
      inHouseMax: 200_000,
    },
  },
};

export const currencyOrder: CurrencyCode[] = ["gbp", "eur", "usd"];

export function isCurrencyCode(value: string): value is CurrencyCode {
  return value === "gbp" || value === "eur" || value === "usd";
}

export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig {
  return currencies[code];
}
