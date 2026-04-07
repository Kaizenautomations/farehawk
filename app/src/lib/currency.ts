export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "EUR", symbol: "\u20ac", name: "Euro" },
  { code: "GBP", symbol: "\u00a3", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "\u00a5", name: "Japanese Yen" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]["code"];

// Cache exchange rates for 1 hour
let rateCache: { rates: Record<string, number>; expires: number } | null = null;

export async function getExchangeRates(): Promise<Record<string, number>> {
  if (rateCache && rateCache.expires > Date.now()) {
    return rateCache.rates;
  }

  try {
    // Free API, no key needed, returns rates relative to USD
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await res.json();
    if (data.rates) {
      rateCache = { rates: data.rates, expires: Date.now() + 3600000 };
      return data.rates;
    }
  } catch {
    // Fallback approximate rates if API fails
  }

  return { USD: 1, CAD: 1.38, EUR: 0.92, GBP: 0.79, AUD: 1.55, JPY: 155, MXN: 17.2 };
}

export function convertPrice(priceUSD: number, rate: number): number {
  return Math.round(priceUSD * rate);
}

export function formatPrice(price: number, currencyCode: string): string {
  const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  if (currencyCode === "JPY") return `${currency?.symbol || ""}${Math.round(price).toLocaleString()}`;
  return `${currency?.symbol || "$"}${price.toFixed(0)}`;
}

export function getCurrencyPreference(): CurrencyCode {
  if (typeof window === "undefined") return "USD";
  return (localStorage.getItem("fareflight_currency") as CurrencyCode) || "USD";
}

export function setCurrencyPreference(code: CurrencyCode) {
  localStorage.setItem("fareflight_currency", code);
}
