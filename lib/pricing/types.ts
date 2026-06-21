export type CurrencyCode = "gbp" | "eur" | "usd";

export type PriceSet = {
  monthly: number;
  annualEquivalent: number;
  annualUpfront: number;
  annualSavings: number;
  inHouseMin: number;
  inHouseMax: number;
};

export type CurrencyConfig = {
  code: CurrencyCode;
  iso: "GBP" | "EUR" | "USD";
  locale: string;
  label: string;
  prices: PriceSet;
};

export type Faq = {
  question: string;
  answer: string;
};
