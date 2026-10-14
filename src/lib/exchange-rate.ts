import { DEFAULT_EUR_KRW } from "./encar";

export interface EurKrwRate {
  rate: number; // KRW per 1 EUR
  date: string | null; // ECB reference date, null when the fallback is used
}

// ECB reference rate through frankfurter.dev, cached for a day.
export async function getEurKrw(): Promise<EurKrwRate> {
  try {
    const res = await fetch("https://api.frankfurter.dev/v1/latest?from=EUR&to=KRW", {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rate = Number(data?.rates?.KRW);
    // Guard against a broken response turning every price upside down.
    if (!(rate > 500 && rate < 5000)) throw new Error(`bad rate ${data?.rates?.KRW}`);
    return { rate, date: data.date ?? null };
  } catch (error) {
    console.error("[exchange-rate] ECB rate unavailable, using fallback", error);
    return { rate: DEFAULT_EUR_KRW, date: null };
  }
}
