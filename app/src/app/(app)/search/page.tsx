"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/search/SearchForm";
import { FlightResultsList } from "@/components/search/FlightResultsList";
import { NearbyAirportComparison } from "@/components/search/NearbyAirportComparison";
import { TripSummary } from "@/components/search/TripSummary";
import { LoadingBar } from "@/components/ui/loading-bar";
import { useSubscription } from "@/hooks/useSubscription";
import { useTripBuilder } from "@/hooks/useTripBuilder";
import type { FlightResult } from "@/types/flight";
import type { SelectedFlight } from "@/lib/trip-builder";
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  getSavedSearches,
  toggleSaveSearch,
  type SearchHistoryEntry,
} from "@/lib/search-history";

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
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);
  const [savedSearches, setSavedSearches] = useState<SearchHistoryEntry[]>([]);
  const [historyTab, setHistoryTab] = useState<"recent" | "saved">("recent");
  const [flexibleInfo, setFlexibleInfo] = useState<string | null>(null);
  const sub = useSubscription();
  const tripBuilder = useTripBuilder();

  // Trip builder state
  const [tripPhase, setTripPhase] = useState<"idle" | "select-outbound" | "select-return">("idle");
  const [returnResults, setReturnResults] = useState<FlightResult[]>([]);
  const [returnLoading, setReturnLoading] = useState(false);
  // Track whether current search is a round-trip (has return date)
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(getSearchHistory());
    setSavedSearches(getSavedSearches());
  }, []);

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
    flexible_dates?: boolean;
  }) => {
    setLoading(true);
    setError("");
    setRetryable(false);
    setSearched(true);
    setFlexibleInfo(null);
    // Reset trip builder on new search
    tripBuilder.clearTrip();
    setReturnResults([]);
    setReturnLoading(false);
    setIsRoundTrip(!!params.return_date);
    setTripPhase(params.return_date ? "select-outbound" : "idle");

    let searchDate = params.departure_date;

    // Flexible dates: find cheapest date in +/- 3 day range first
    if (params.flexible_dates) {
      try {
        const depDate = new Date(params.departure_date + "T12:00:00");
        const fromDate = new Date(depDate);
        fromDate.setDate(fromDate.getDate() - 3);
        const toDate = new Date(depDate);
        toDate.setDate(toDate.getDate() + 3);

        // Ensure from_date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (fromDate < today) fromDate.setTime(today.getTime());

        const fromStr = fromDate.toISOString().split("T")[0];
        const toStr = toDate.toISOString().split("T")[0];

        const datesRes = await fetch("/api/search/dates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: params.origin,
            destination: params.destination,
            from_date: fromStr,
            to_date: toStr,
            cabin_class: params.cabin_class,
            trip_type: "one_way",
          }),
        });

        if (datesRes.ok) {
          const datesData = await datesRes.json();
          if (Array.isArray(datesData) && datesData.length > 0) {
            const cheapest = datesData.reduce((min: { price: number; date: string }, d: { price: number; date: string }) =>
              d.price < min.price ? d : min, datesData[0]);
            searchDate = cheapest.date;

            const origLabel = new Date(params.departure_date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const cheapLabel = new Date(cheapest.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

            if (cheapest.date !== params.departure_date) {
              setFlexibleInfo(`Flexible dates found ${cheapLabel} as cheapest ($${cheapest.price}) near your date: ${origLabel}. Showing flights for ${cheapLabel}.`);
            } else {
              setFlexibleInfo(`Your date (${origLabel}) is already the cheapest in the +/- 3 day range.`);
            }
          }
        }
      } catch {
        // If dates endpoint fails, just proceed with original date
      }
    }

    const searchParams = { ...params, departure_date: searchDate };
    delete (searchParams as Record<string, unknown>).flexible_dates;
    setLastParams(searchParams);

    try {
      const res = await fetch("/api/search/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
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
      // Save to search history
      addSearchHistory({
        origin: params.origin,
        destination: params.destination,
        departure_date: searchDate,
        return_date: params.return_date,
        cabin_class: params.cabin_class,
      });
      setSearchHistory(getSearchHistory());
      setSavedSearches(getSavedSearches());
    } catch {
      setError("Something went wrong. Please try again.");
      setRetryable(true);
    } finally {
      setLoading(false);
      sub.refresh();
    }
  }, [sub, tripBuilder]);

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

  // Handle selecting an outbound flight in trip builder mode
  const handleSelectOutbound = useCallback(async (flight: SelectedFlight) => {
    tripBuilder.selectOutbound(flight);
    setTripPhase("select-return");

    // Auto-search return flights (swap origin/destination, use return date)
    if (!lastParams) return;
    const returnDate = (lastParams as Record<string, unknown>).return_date as string | undefined;
    if (!returnDate) return;

    setReturnLoading(true);
    const returnParams = {
      origin: flight.destination,
      destination: flight.origin,
      departure_date: returnDate,
      cabin_class: (lastParams as Record<string, unknown>).cabin_class as string,
      max_stops: (lastParams as Record<string, unknown>).max_stops as number | null,
    };
    try {
      const res = await fetch("/api/search/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(returnParams),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setReturnResults(data);
      } else {
        setReturnResults([]);
      }
    } catch {
      setReturnResults([]);
    } finally {
      setReturnLoading(false);
      sub.refresh();
    }
  }, [lastParams, tripBuilder, sub]);

  const handleSelectReturn = useCallback((flight: SelectedFlight) => {
    tripBuilder.selectReturn(flight);
  }, [tripBuilder]);

  // Build a key to identify selected flights
  function getFlightKey(flight: SelectedFlight | null): string | null {
    if (!flight) return null;
    return `${flight.origin}-${flight.destination}-${flight.departure_time}-${flight.price}`;
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

      {/* Recent / Saved Searches */}
      {!searched && !loading && (searchHistory.length > 0 || savedSearches.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 rounded-lg bg-slate-800/60 p-0.5">
              <button
                type="button"
                onClick={() => setHistoryTab("recent")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[44px] ${
                  historyTab === "recent"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Recent
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab("saved")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center gap-1.5 ${
                  historyTab === "saved"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={historyTab === "saved" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                Saved
                {savedSearches.length > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-blue-500/20 px-1.5 text-xs font-medium text-blue-400">
                    {savedSearches.length}
                  </span>
                )}
              </button>
            </div>
            {historyTab === "recent" && (
              <button
                type="button"
                onClick={() => {
                  clearSearchHistory();
                  setSearchHistory([]);
                  setSavedSearches(getSavedSearches());
                }}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors min-h-[44px] px-2"
              >
                Clear history
              </button>
            )}
          </div>

          {historyTab === "recent" && searchHistory.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {searchHistory.slice(0, 6).map((entry, i) => (
                <div
                  key={`${entry.origin}-${entry.destination}-${entry.departure_date}-${i}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 min-h-[44px] text-left hover:border-slate-700 hover:bg-slate-900/80 transition-all group"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleSearch({
                        origin: entry.origin,
                        destination: entry.destination,
                        departure_date: entry.departure_date,
                        return_date: entry.return_date,
                        cabin_class: entry.cabin_class,
                        max_stops: null,
                      })
                    }
                    className="flex-1 flex items-center gap-3 px-4 py-3 min-h-[44px]"
                  >
                    <svg
                      className="h-4 w-4 text-slate-500 group-hover:text-blue-400 transition-colors shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                      />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {entry.origin}{" "}
                        <span className="text-slate-500">&rarr;</span>{" "}
                        {entry.destination}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {new Date(entry.departure_date + "T12:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {entry.return_date && (
                          <>
                            {" "}&mdash;{" "}
                            {new Date(entry.return_date + "T12:00:00").toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </>
                        )}
                        {"  "}
                        <span className="capitalize">{entry.cabin_class.replace("_", " ")}</span>
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleSaveSearch(entry);
                      setSearchHistory(getSearchHistory());
                      setSavedSearches(getSavedSearches());
                    }}
                    className="shrink-0 p-2 mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-amber-400 transition-colors"
                    title={entry.saved ? "Unsave search" : "Save search"}
                    aria-label={entry.saved ? "Unsave search" : "Save search"}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={entry.saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={entry.saved ? "text-amber-400" : ""}>
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {historyTab === "saved" && (
            <>
              {savedSearches.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-600 mb-3">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                  </svg>
                  <p className="text-sm text-slate-500">No saved searches yet. Click the bookmark icon on any search to save it.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {savedSearches.map((entry, i) => (
                    <div
                      key={`saved-${entry.origin}-${entry.destination}-${entry.departure_date}-${i}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 min-h-[44px] text-left hover:border-slate-700 hover:bg-slate-900/80 transition-all group"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleSearch({
                            origin: entry.origin,
                            destination: entry.destination,
                            departure_date: entry.departure_date,
                            return_date: entry.return_date,
                            cabin_class: entry.cabin_class,
                            max_stops: null,
                          })
                        }
                        className="flex-1 flex items-center gap-3 px-4 py-3 min-h-[44px]"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {entry.origin}{" "}
                            <span className="text-slate-500">&rarr;</span>{" "}
                            {entry.destination}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {new Date(entry.departure_date + "T12:00:00").toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                            {entry.return_date && (
                              <>
                                {" "}&mdash;{" "}
                                {new Date(entry.return_date + "T12:00:00").toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </>
                            )}
                            {"  "}
                            <span className="capitalize">{entry.cabin_class.replace("_", " ")}</span>
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toggleSaveSearch(entry);
                          setSearchHistory(getSearchHistory());
                          setSavedSearches(getSavedSearches());
                        }}
                        className="shrink-0 p-2 mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-amber-400 hover:text-slate-400 transition-colors"
                        title="Unsave search"
                        aria-label="Unsave search"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

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

      {/* Flexible dates info */}
      {flexibleInfo && !error && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm p-4 flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <p className="text-sm text-blue-300">{flexibleInfo}</p>
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

      {/* Results — Outbound flights */}
      {searched && (
        <>
          {isRoundTrip && tripPhase === "select-outbound" && !loading && results.length > 0 && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm p-4 flex items-center gap-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/20 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 rotate-45">
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-300">Select your outbound flight</p>
                <p className="text-xs text-blue-400/70 mt-0.5">Click &quot;Select&quot; on a flight to add it to your trip, then choose a return flight.</p>
              </div>
            </div>
          )}
          <FlightResultsList
            results={results}
            loading={loading}
            onWatch={handleWatch}
            onSelectFlight={isRoundTrip ? handleSelectOutbound : undefined}
            selectedFlightKey={isRoundTrip ? getFlightKey(tripBuilder.trip.outbound) : null}
          />
        </>
      )}

      {/* Return flights section */}
      {tripPhase === "select-return" && (
        <>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm p-4 flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-500/20 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-400 -rotate-[135deg]">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-300">Now select your return flight</p>
              <p className="text-xs text-indigo-400/70 mt-0.5">
                {tripBuilder.trip.outbound?.destination} &rarr; {tripBuilder.trip.outbound?.origin} on {
                  lastParams?.return_date
                    ? new Date((lastParams.return_date as string) + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : ""
                }
              </p>
            </div>
          </div>
          <FlightResultsList
            results={returnResults}
            loading={returnLoading}
            onWatch={handleWatch}
            onSelectFlight={handleSelectReturn}
            selectedFlightKey={getFlightKey(tripBuilder.trip.return_flight)}
          />
        </>
      )}

      {/* Pricing tip */}
      {!loading && results.length > 0 && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400">About these prices</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Prices shown are estimated base fares from Google Flights. Final prices including taxes and fees may be higher. Click &quot;Book&quot; to see the exact all-in price on Google Flights. Prices may also vary by your location — using a US-based VPN when booking can sometimes unlock lower rates.
              </p>
            </div>
          </div>
        </div>
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

      {/* Bottom spacer when trip summary is visible */}
      {tripBuilder.trip.outbound && <div className="h-[180px]" />}

      {/* Trip Summary sticky bar */}
      <TripSummary
        trip={tripBuilder.trip}
        totalPrice={tripBuilder.totalPrice}
        bookingUrl={tripBuilder.bookingUrl}
        onClear={() => {
          tripBuilder.clearTrip();
          setTripPhase(isRoundTrip ? "select-outbound" : "idle");
          setReturnResults([]);
        }}
      />
    </div>
  );
}
