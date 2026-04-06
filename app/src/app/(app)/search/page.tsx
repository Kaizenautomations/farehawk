"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search/SearchForm";
import { FlightResultsList } from "@/components/search/FlightResultsList";
import { LoadingBar } from "@/components/ui/loading-bar";
import { useSubscription } from "@/hooks/useSubscription";
import type { FlightResult } from "@/types/flight";

export default function SearchPage() {
  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const sub = useSubscription();

  async function handleSearch(params: {
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    cabin_class: string;
    max_stops: number | null;
  }) {
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch("/api/search/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (res.status === 429) {
        setError(
          "Daily search limit reached. Upgrade your plan for more searches."
        );
        setResults([]);
        return;
      }

      if (res.status === 403) {
        const data = await res.json();
        setError(data.error);
        setResults([]);
        return;
      }

      if (!res.ok) {
        setError("Search failed. Please try again.");
        setResults([]);
        return;
      }

      const data = await res.json();
      setResults(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      sub.refresh();
    }
  }

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
      alert("Watch created! You'll be notified when the price drops.");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create watch");
    }
  }

  return (
    <div className="space-y-6">
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
          </div>
        )}
      </div>

      {/* Search Form */}
      <SearchForm onSearch={handleSearch} loading={loading} />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-4 flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-400"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-red-300">{error}</p>
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
    </div>
  );
}
