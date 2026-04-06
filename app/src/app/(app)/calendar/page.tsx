"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AirportAutocomplete } from "@/components/search/AirportAutocomplete";
import { FlightCard } from "@/components/search/FlightCard";
import { LoadingBar } from "@/components/ui/loading-bar";
import type { DatePrice, FlightResult } from "@/types/flight";

type PriceTier = "cheap" | "mid" | "expensive";

function getPriceTier(price: number, min: number, max: number): PriceTier {
  if (max === min) return "cheap";
  const ratio = (price - min) / (max - min);
  if (ratio < 0.33) return "cheap";
  if (ratio < 0.66) return "mid";
  return "expensive";
}

const tierStyles: Record<PriceTier, { cell: string; text: string }> = {
  cheap: {
    cell: "bg-emerald-500/15 border-emerald-500/20 hover:bg-emerald-500/25",
    text: "text-emerald-400",
  },
  mid: {
    cell: "bg-amber-500/15 border-amber-500/20 hover:bg-amber-500/25",
    text: "text-amber-400",
  },
  expensive: {
    cell: "bg-red-500/15 border-red-500/20 hover:bg-red-500/25",
    text: "text-red-400",
  },
};

function getMonthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(y, m - 1 + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export default function CalendarPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState(getCurrentMonth());
  const [results, setResults] = useState<DatePrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Flight detail state
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightsError, setFlightsError] = useState("");

  const today = getTodayStr();
  const currentMonth = getCurrentMonth();
  const canGoPrev = month > currentMonth;

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!origin || !destination || !month) return;

    setLoading(true);
    setError("");
    setSelectedDate(null);
    setFlights([]);

    let fromDate = `${month}-01`;
    if (fromDate < today) {
      fromDate = today;
    }

    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(y, m, 0);
    const toDate = lastDay.toISOString().split("T")[0];

    if (toDate < today) {
      setError("This month is in the past. Please select a future month.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/search/dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          from_date: fromDate,
          to_date: toDate,
          trip_type: "one_way",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Search failed");
        return;
      }

      setResults(await res.json());
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDateClick(dateStr: string) {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      setFlights([]);
      return;
    }

    setSelectedDate(dateStr);
    setFlights([]);
    setFlightsError("");
    setFlightsLoading(true);

    try {
      const res = await fetch("/api/search/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          departure_date: dateStr,
          cabin_class: "economy",
          adults: 1,
          sort_by: "cheapest",
          top_n: 5,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFlightsError(data.error || "Could not load flights");
        return;
      }

      setFlights(await res.json());
    } catch {
      setFlightsError("Failed to load flight details");
    } finally {
      setFlightsLoading(false);
    }
  }

  function handleMonthChange(delta: number) {
    const newMonth = shiftMonth(month, delta);
    if (newMonth < currentMonth) return;
    setMonth(newMonth);
    setResults([]);
    setSelectedDate(null);
    setFlights([]);
  }

  const prices = results.map((r) => r.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const cheapestResult = results.length
    ? results.reduce((a, b) => (a.price < b.price ? a : b))
    : null;
  const mostExpensiveResult = results.length
    ? results.reduce((a, b) => (a.price > b.price ? a : b))
    : null;

  const dateMap = new Map(results.map((r) => [r.date, r]));
  const firstDate = new Date(`${month}-01`);
  const startDay = firstDate.getDay();
  const [yearNum, monthNum] = month.split("-").map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

  const selectedDp = selectedDate ? dateMap.get(selectedDate) : null;

  return (
    <div className="space-y-6">
      <LoadingBar visible={loading || flightsLoading} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Price Calendar</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Find the cheapest dates to fly — click any date to see flights
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 md:p-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">From</Label>
            <AirportAutocomplete value={origin} onChange={setOrigin} placeholder="Origin" />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">To</Label>
            <AirportAutocomplete value={destination} onChange={setDestination} placeholder="Destination" />
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Month</Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              disabled={!canGoPrev}
              className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span className="text-sm font-semibold text-white min-w-[160px] text-center">
              {getMonthLabel(month)}
            </span>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="h-9 w-9 rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !origin || !destination}
          className="w-full h-11 min-h-[44px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Searching prices...
            </span>
          ) : (
            "Show Prices"
          )}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm p-4 flex items-start gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Calendar */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {cheapestResult && (
              <div className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-emerald-400/70 font-medium">Cheapest</div>
                  <div className="text-lg font-bold text-emerald-400">${cheapestResult.price.toFixed(0)}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(cheapestResult.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
            )}
            {mostExpensiveResult && (
              <div className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-red-400/70 font-medium">Most Expensive</div>
                  <div className="text-lg font-bold text-red-400">${mostExpensiveResult.price.toFixed(0)}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(mostExpensiveResult.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Cheap</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Mid-range</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Expensive</span>
            <span className="ml-auto text-slate-500 text-[11px]">Click a date to see flights</span>
          </div>

          {/* Calendar grid */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-2 sm:p-3 md:p-4">
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{d}</div>
              ))}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${month}-${String(day).padStart(2, "0")}`;
                const dp = dateMap.get(dateStr);
                const isPast = dateStr < today;
                const isSelected = selectedDate === dateStr;
                const tier = dp ? getPriceTier(dp.price, minPrice, maxPrice) : null;
                const styles = tier ? tierStyles[tier] : null;

                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => dp && handleDateClick(dateStr)}
                    disabled={!dp}
                    className={`
                      aspect-square min-h-[44px] rounded-lg border text-center flex flex-col items-center justify-center gap-0.5 transition-all duration-200
                      ${dp ? `${styles?.cell} cursor-pointer active:scale-95` : isPast ? "border-transparent bg-slate-800/20 opacity-40" : "border-transparent bg-slate-800/30 cursor-default"}
                      ${isSelected ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-950 scale-105" : ""}
                    `}
                  >
                    <span className={`text-[10px] sm:text-xs ${dp ? "text-slate-300" : "text-slate-600"}`}>{day}</span>
                    {dp && (
                      <span className={`text-xs sm:text-sm font-bold ${styles?.text}`}>${dp.price.toFixed(0)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected date detail + flights */}
          {selectedDate && (
            <div className="space-y-4 animate-fade-up">
              {/* Date header */}
              {selectedDp && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-blue-400/70 font-medium">Flights on</div>
                    <div className="text-lg font-bold text-white">
                      {new Date(selectedDp.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </div>
                    <div className="text-sm text-slate-400 mt-0.5">
                      {origin} → {destination}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-400/70 font-medium">From</div>
                    <div className="text-2xl font-bold text-white">${selectedDp.price.toFixed(0)}</div>
                    <div className="text-xs text-slate-400 uppercase">{selectedDp.currency}</div>
                  </div>
                </div>
              )}

              {/* Flight results */}
              {flightsLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-xl border border-slate-800 bg-slate-900/60 animate-pulse" />
                  ))}
                </div>
              )}

              {flightsError && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <p className="text-sm text-amber-300">{flightsError}</p>
                    <button
                      type="button"
                      onClick={() => handleDateClick(selectedDate)}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/30 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                      </svg>
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {!flightsLoading && !flightsError && flights.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      <span className="text-white font-semibold">{flights.length}</span> flight{flights.length !== 1 ? "s" : ""} found
                    </p>
                    <p className="text-xs text-slate-500">Sorted by price</p>
                  </div>
                  {flights.map((flight, i) => (
                    <div key={i} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-up">
                      <FlightCard flight={flight} />
                    </div>
                  ))}
                </div>
              )}

              {!flightsLoading && !flightsError && flights.length === 0 && selectedDp && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 py-12 text-center">
                  <p className="text-slate-400">No detailed flight data available for this date.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
