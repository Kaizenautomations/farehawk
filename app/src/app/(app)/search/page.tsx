"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/search/SearchForm";
import { FlightResultsList } from "@/components/search/FlightResultsList";
import { NearbyAirportComparison } from "@/components/search/NearbyAirportComparison";
import { LoadingBar } from "@/components/ui/loading-bar";
import { useSubscription } from "@/hooks/useSubscription";
import type { FlightResult } from "@/types/flight";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-8 w-48 animate-pulse rounded bg-slate-800" /><div className="h-40 animate-pulse rounded-2xl bg-slate-900/60" /></div>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();

  // Read URL params from explore page handoff
  const initialValues = useMemo(() => {
    const origin = searchParams.get("origin") || undefined;
    const destination = searchParams.get("destination") || undefined;
    const departure_date = searchParams.get("date") || undefined;
    const return_date = searchParams.get("return_date") || undefined;
    if (!origin && !destination && !departure_date) return undefined;
    return { origin, destination, departure_date, return_date };
  }, [searchParams]);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [retryable, setRetryable] = useState(false);
  const [lastParams, setLastParams] = useState<Record<string, unknown> | null>(null);
  const [toast, setToast] = useState<{type: "success"|"error", message: string} | null>(null);
  const sub = useSubscription();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSearch = useCallback(async (params: {
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    cabin_class: string;
    max_stops: number | null;
  }) => {
    setLoading(true);
    setError("");
    setRetryable(false);
    setSearched(true);
    setLastParams(params);

    try {
      const res = await fetch("/api/search/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (res.status === 429) {
        if (data.retryable) {
          setError("Flight data is temporarily busy. This usually resolves in a few seconds.");
          setRetryable(true);
        } else {
          setError("Daily search limit reached. Upgrade your plan for more searches.");
        }
        setResults([]);
        return;
      }

      if (res.status === 403) {
        setError(data.error);
        setResults([]);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Search failed. Please try again.");
        setRetryable(true);
        setResults([]);
        return;
      }

      setResults(data);
    } catch {
      setError("Something went wrong. Please try again.");
      setRetryable(true);
    } finally {
      setLoading(false);
      sub.refresh();
    }
  }, [sub]);

  async function handleWatch(flight: FlightResult) {
    const firstLeg = flight.legs[0];
    const lastLeg = flight.legs[flight.legs.length - 1];
    if (!firstLeg || !lastLeg) return;

    const res = await fetch("/api/watches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: firstLeg.departure_airport,
        destination: lastLeg.arrival_airport,
        departure_date: firstLeg.departure_time.split("T")[0],
        target_price: flight.price,
        current_price: flight.price,
        lowest_price: flight.price,
      }),
    });

    if (res.ok) {
      setToast({ type: "success", message: "Watch created! You'll be notified when the price drops." });
    } else {
      const data = await res.json();
      setToast({ type: "error", message: data.error || "Failed to create watch" });
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
        }`}>
          {toast.message}
        </div>
      )}
      <LoadingBar visible={loading} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Search Flights</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Find the best deals across airlines
          </p>
        </div>
        {sub.tier && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-sm">
            <div className="flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full ${
                  (sub.searches_used ?? 0) >= (sub.searches_limit ?? 3)
                    ? "bg-red-400"
                    : (sub.searches_used ?? 0) >= (sub.searches_limit ?? 3) * 0.8
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                }`}
              />
              <span className="text-slate-300">
                <span className="font-semibold text-white">
                  {sub.searches_used}
                </span>
                <span className="text-slate-500">
                  /{sub.searches_limit}
                </span>
              </span>
            </div>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 capitalize">{sub.tier}</span>
            <span className="text-slate-600 text-xs ml-1">(resets daily)</span>
          </div>
        )}
      </div>

      {/* Search Form */}
      <SearchForm onSearch={handleSearch} loading={loading} initialValues={initialValues} />

      {/* Pre-search guidance */}
      {!searched && !loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20">
              <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Search for flights between any two airports</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Try: YEG to Cancun, or use Explore to find cheap destinations within your budget.
          </p>
          <a
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-300 hover:text-white hover:border-blue-500/40 hover:bg-slate-800 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            Explore Destinations
          </a>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={`rounded-xl border backdrop-blur-sm p-4 flex items-start gap-3 ${retryable ? "border-amber-500/30 bg-amber-500/10" : "border-red-500/30 bg-red-500/10"}`}>
          <div className="shrink-0 mt-0.5">
            {retryable ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm ${retryable ? "text-amber-300" : "text-red-300"}`}>{error}</p>
            {retryable && lastParams && (
              <button
                type="button"
                onClick={() => handleSearch(lastParams as Parameters<typeof handleSearch>[0])}
                disabled={loading}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                </svg>
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <FlightResultsList
          results={results}
          loading={loading}
          onWatch={handleWatch}
        />
      )}

      {/* Nearby airport comparison */}
      {!loading && results.length > 0 && lastParams && (
        <NearbyAirportComparison
          origin={lastParams.origin as string}
          destination={lastParams.destination as string}
          departure_date={lastParams.departure_date as string}
          return_date={lastParams.return_date as string | undefined}
          cabin_class={lastParams.cabin_class as string | undefined}
          max_stops={lastParams.max_stops as number | null | undefined}
          currentPrice={results[0].price}
        />
      )}
    </div>
  );
}
