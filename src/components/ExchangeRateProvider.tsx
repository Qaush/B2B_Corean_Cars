"use client";

import { createContext, useContext } from "react";
import { DEFAULT_EUR_KRW } from "@/lib/encar";
import type { EurKrwRate } from "@/lib/exchange-rate";

const ExchangeRateContext = createContext<EurKrwRate>({ rate: DEFAULT_EUR_KRW, date: null });

// The rate is read on the server (root layout, refreshed daily) and handed
// to client components that price cars.
export function ExchangeRateProvider({ value, children }: { value: EurKrwRate; children: React.ReactNode }) {
  return <ExchangeRateContext.Provider value={value}>{children}</ExchangeRateContext.Provider>;
}

export function useExchangeRate(): EurKrwRate {
  return useContext(ExchangeRateContext);
}
