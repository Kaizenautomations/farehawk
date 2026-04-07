"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getCurrencyPreference,
  setCurrencyPreference,
  getExchangeRates,
  convertPrice,
  formatPrice,
  type CurrencyCode,
} from "@/lib/currency";

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrency(getCurrencyPreference());
    getExchangeRates().then((r) => {
      setRates(r);
      setLoading(false);
    });
  }, []);

  const changeCurrency = useCallback((code: CurrencyCode) => {
    setCurrency(code);
    setCurrencyPreference(code);
  }, []);

  const convert = useCallback(
    (priceUSD: number) => {
      if (currency === "USD") return priceUSD;
      return convertPrice(priceUSD, rates[currency] || 1);
    },
    [currency, rates]
  );

  const format = useCallback(
    (priceUSD: number) => {
      const converted =
        currency === "USD"
          ? priceUSD
          : convertPrice(priceUSD, rates[currency] || 1);
      return formatPrice(converted, currency);
    },
    [currency, rates]
  );

  return { currency, changeCurrency, convert, format, loading, rates };
}
