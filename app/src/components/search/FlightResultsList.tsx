"use client";

import { useState, useMemo } from "react";
import type { FlightResult } from "@/types/flight";
import type { SelectedFlight } from "@/lib/trip-builder";
import { FlightCard } from "./FlightCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getDealScore } from "@/components/search/DealScoreBadge";
import { getAirlineName } from "@/lib/airlines";

type SortOption = "price-asc" | "price-desc" | "duration" | "stops" | "deal-score";
type StopsFilter = "nonstop" | "1stop" | "2plus";
type TimeOfDayFilter = "morning" | "afternoon" | "evening" | "redeye";

const TIME_OF_DAY_OPTIONS: { key: TimeOfDayFilter; label: string }[] = [
  { key: "morning", label: "Morning (6a-12p)" },
  { key: "afternoon", label: "Afternoon (12p-6p)" },
  { key: "evening", label: "Evening (6p-12a)" },
  { key: "redeye", label: "Red-eye (12a-6a)" },
];

function getDepartureHour(flight: FlightResult): number | null {
  const dep = flight.legs[0]?.departure_time;
  if (!dep) return null;
  // Try parsing "HH:MM" or full datetime strings
  const match = dep.match(/(\d{1,2}):(\d{2})/);
  if (match) return parseInt(match[1], 10);
  const d = new Date(dep);
  if (!isNaN(d.getTime())) return d.getHours();
  return null;
}

function matchesTimeOfDay(hour: number, filter: TimeOfDayFilter): boolean {
  switch (filter) {
    case "morning": return hour >= 6 && hour < 12;
    case "afternoon": return hour >= 12 && hour < 18;
    case "evening": return hour >= 18 && hour < 24;
    case "redeye": return hour >= 0 && hour < 6;
  }
}

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
  onSelectFlight?: (flight: SelectedFlight) => void;
  selectedFlightKey?: string | null;
}

export function FlightResultsList({ results, loading, onWatch, onSelectFlight, selectedFlightKey }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeAirlines, setActiveAirlines] = useState<Set<string>>(new Set());
  const [activeStops, setActiveStops] = useState<Set<StopsFilter>>(new Set());
  const [activeTimeOfDay, setActiveTimeOfDay] = useState<Set<TimeOfDayFilter>>(new Set());

  // Extract unique airlines from results
  const uniqueAirlines = useMemo(() => {
    const codes = new Set<string>();
    results.forEach((f) => {
      const code = f.legs[0]?.airline_code || f.legs[0]?.airline || "";
      if (code) codes.add(code);
    });
    return Array.from(codes).sort((a, b) => getAirlineName(a).localeCompare(getAirlineName(b)));
  }, [results]);

  function toggleAirline(code: string) {
    setActiveAirlines((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleStops(filter: StopsFilter) {
    setActiveStops((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  }

  function toggleTimeOfDay(filter: TimeOfDayFilter) {
    setActiveTimeOfDay((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  }

  // Apply filters then sort
  const filteredResults = useMemo(() => {
    let filtered = results;

    // Airline filter
    if (activeAirlines.size > 0) {
      filtered = filtered.filter((f) => {
        const code = f.legs[0]?.airline_code || f.legs[0]?.airline || "";
        return activeAirlines.has(code);
      });
    }

    // Stops filter
    if (activeStops.size > 0) {
      filtered = filtered.filter((f) => {
        if (f.stops === 0 && activeStops.has("nonstop")) return true;
        if (f.stops === 1 && activeStops.has("1stop")) return true;
        if (f.stops >= 2 && activeStops.has("2plus")) return true;
        return false;
      });
    }

    // Time-of-day filter
    if (activeTimeOfDay.size > 0) {
      filtered = filtered.filter((f) => {
        const hour = getDepartureHour(f);
        if (hour === null) return true; // Don't filter out flights with unknown times
        return Array.from(activeTimeOfDay).some((tod) => matchesTimeOfDay(hour, tod));
      });
    }

    return filtered;
  }, [results, activeAirlines, activeStops, activeTimeOfDay]);

  const sortedResults = useMemo(() => sortFlights(filteredResults, sortBy), [filteredResults, sortBy]);

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
      {/* Filters */}
      {results.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex w-full items-center justify-between px-4 py-3 min-h-[44px] text-sm font-medium text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle filters"
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>Filters</span>
              {(activeAirlines.size > 0 || activeStops.size > 0 || activeTimeOfDay.size > 0) && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-blue-500/20 px-1.5 text-xs font-medium text-blue-400">
                  {activeAirlines.size + activeStops.size + activeTimeOfDay.size}
                </span>
              )}
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-slate-500 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {filtersOpen && (
            <div className="border-t border-slate-800 px-4 py-4 space-y-4">
              {/* Stops filter */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Stops</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: "nonstop" as StopsFilter, label: "Nonstop" },
                    { key: "1stop" as StopsFilter, label: "1 stop" },
                    { key: "2plus" as StopsFilter, label: "2+ stops" },
                  ]).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleStops(key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                        activeStops.has(key)
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                          : "bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Airline filter */}
              {uniqueAirlines.length > 1 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Airlines</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueAirlines.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => toggleAirline(code)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                          activeAirlines.has(code)
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                            : "bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300"
                        }`}
                      >
                        {getAirlineName(code)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time of day filter */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">Departure Time</p>
                <div className="flex flex-wrap gap-2">
                  {TIME_OF_DAY_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleTimeOfDay(key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                        activeTimeOfDay.has(key)
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                          : "bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {(activeAirlines.size > 0 || activeStops.size > 0 || activeTimeOfDay.size > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveAirlines(new Set());
                    setActiveStops(new Set());
                    setActiveTimeOfDay(new Set());
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          <span className="text-white font-semibold">{filteredResults.length}</span>
          {filteredResults.length !== results.length && (
            <span className="text-slate-500"> of {results.length}</span>
          )}{" "}
          flight{filteredResults.length !== 1 ? "s" : ""} found
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
        {sortedResults.map((flight, i) => {
          const flightKey = `${flight.legs[0]?.departure_airport}-${flight.legs[flight.legs.length - 1]?.arrival_airport}-${flight.legs[0]?.departure_time}-${flight.price}`;
          return (
            <FlightCard
              key={i}
              flight={flight}
              onWatch={onWatch ? () => onWatch(flight) : undefined}
              onSelect={onSelectFlight}
              isSelected={selectedFlightKey === flightKey}
              style={{
                animation: `fadeUp 0.5s ease-out ${i * 0.06}s both`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
