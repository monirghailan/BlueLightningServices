"use client";

import { CurrencyProvider } from "@/components/providers/CurrencyProvider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
