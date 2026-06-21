"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  currencies,
  getCurrencyConfig,
  isCurrencyCode,
  STORAGE_KEY,
} from "@/lib/pricing/currencies";
import { detectCurrencyFromLocales } from "@/lib/pricing/detect";
import { createFormatters, type Formatters } from "@/lib/pricing/format";
import type { CurrencyCode, CurrencyConfig, PriceSet } from "@/lib/pricing/types";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  config: CurrencyConfig;
  prices: PriceSet;
  format: Formatters;
  isReady: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readStoredCurrency(): CurrencyCode | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isCurrencyCode(stored)) return stored;
  } catch {
    // localStorage unavailable
  }
  return null;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("usd");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = readStoredCurrency();
    const detected = detectCurrencyFromLocales(navigator.languages);
    setCurrencyState(stored ?? detected);
    setIsReady(true);
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const config = getCurrencyConfig(currency);
  const format = useMemo(() => createFormatters(config), [config]);
  const prices = config.prices;

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      config,
      prices,
      format,
      isReady,
    }),
    [currency, setCurrency, config, prices, format, isReady],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
