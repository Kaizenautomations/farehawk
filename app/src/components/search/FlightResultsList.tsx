"use client";

import { useState, useMemo } from "react";
import type { FlightResult } from "@/types/flight";
import { FlightCard } from "./FlightCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getDealScore } from "@/components/search/DealScoreBadge";

type SortOption = "price-asc" | "price-desc" | "duration" | "stops" | "deal-score";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price-asc", label: "Price: Low \u2192 High" },
  { value: "price-desc", label: "Price: High \u2192 Low" },
  { value: "duration", label: "Duration: Shortest" },
  { value: "stops", label: "Stops: Fewest" },
  { value: "deal-score", label: "Deal Score: Best" },
];

function sortFlights(flights: FlightResult[], sort: SortOption): FlightResult[] {
  const sorted = [...flights];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "duration":
      return sorted.sort((a, b) => a.duration_minutes - b.duration_minutes);
    case "stops":
      return sorted.sort((a, b) => a.stops - b.stops);
    case "deal-score":
      // Higher deal score = better deal, so sort descending
      return sorted.sort((a, b) => getDealScore(b.price).score - getDealScore(a.price).score || a.price - b.price);
    default:
      return sorted;
  }
}

interface Props {
  results: FlightResult[];
  loading?: boolean;
  onWatch?: (flight: FlightResult) => void;
}

export function FlightResultsList({ results, loading, onWatch }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const sortedResults = useMemo(() => sortFlights(results, sortBy), [results, sortBy]);
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:p-5"
            style={{
              animation: `fadeUp 0.5s ease-out ${i * 0.08}s both`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Left skeleton */}
              <div className="flex-1 flex items-center gap-4">
                <div className="text-center space-y-1.5">
                  <Skeleton className="h-5 w-14 bg-slate-800" />
                  <Skeleton className="h-3 w-10 bg-slate-800 mx-auto" />
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <Skeleton className="h-2 w-2 rounded-full bg-slate-800" />
                  <Skeleton className="h-px flex-1 bg-slate-800" />
                  <Skeleton className="h-2 w-2 rounded-full bg-slate-800" />
                </div>
                <div className="text-center space-y-1.5">
                  <Skeleton className="h-5 w-14 bg-slate-800" />
                  <Skeleton className="h-3 w-10 bg-slate-800 mx-auto" />
                </div>
              </div>
              {/* Center skeleton */}
              <div className="flex md:flex-col items-center gap-2 md:min-w-[140px] md:px-4">
                <Skeleton className="h-4 w-20 bg-slate-800" />
                <Skeleton className="h-3 w-12 bg-slate-800" />
                <Skeleton className="h-5 w-16 rounded-full bg-slate-800" />
              </div>
              {/* Right skeleton */}
              <div className="flex md:flex-col items-center md:items-end gap-2 md:min-w-[130px]">
                <Skeleton className="h-7 w-16 bg-slate-800" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16 rounded bg-slate-800" />
                  <Skeleton className="h-8 w-14 rounded bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500"
          >
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-1">
          No flights found
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Try different dates, airports, or adjust your filters to see more
          results.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          <span className="text-white font-semibold">{results.length}</span>{" "}
          flight{results.length !== 1 ? "s" : ""} found
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-slate-700 bg-slate-900/80 text-sm text-slate-300 px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 hover:border-slate-600 transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        {sortedResults.map((flight, i) => (
          <FlightCard
            key={i}
            flight={flight}
            onWatch={onWatch ? () => onWatch(flight) : undefined}
            style={{
              animation: `fadeUp 0.5s ease-out ${i * 0.06}s both`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
