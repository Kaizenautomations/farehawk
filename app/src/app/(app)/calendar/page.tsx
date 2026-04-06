"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AirportAutocomplete } from "@/components/search/AirportAutocomplete";
import type { DatePrice } from "@/types/flight";

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

export default function CalendarPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [results, setResults] = useState<DatePrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination || !month) return;

    setLoading(true);
    setError("");
    setSelectedDate(null);

    const fromDate = `${month}-01`;
    const date = new Date(fromDate);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const toDate = lastDay.toISOString().split("T")[0];

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
  const daysInMonth = new Date(
    firstDate.getFullYear(),
    firstDate.getMonth() + 1,
    0
  ).getDate();

  const selectedDp = selectedDate ? dateMap.get(selectedDate) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Price Calendar</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Find the cheapest dates to fly
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 md:p-6"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              From
            </Label>
            <AirportAutocomplete
              value={origin}
              onChange={setOrigin}
              placeholder="Origin"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              To
            </Label>
            <AirportAutocomplete
              value={destination}
              onChange={setDestination}
              placeholder="Destination"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Month
            </Label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              min={new Date().toISOString().slice(0, 7)}
              className="bg-slate-900/50 border-slate-700 text-white h-11 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading...
              </span>
            ) : (
              "Show Prices"
            )}
          </Button>
        </div>
      </form>

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

      {/* Calendar */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            {cheapestResult && (
              <div className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-400"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-emerald-400/70 font-medium">
                    Cheapest
                  </div>
                  <div className="text-lg font-bold text-emerald-400">
                    ${cheapestResult.price.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(cheapestResult.date + "T12:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            )}
            {mostExpensiveResult && (
              <div className="flex-1 rounded-xl border border-red-500/20 bg-red-500/10 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-400"
                  >
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                    <polyline points="17 18 23 18 23 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-red-400/70 font-medium">
                    Most Expensive
                  </div>
                  <div className="text-lg font-bold text-red-400">
                    ${mostExpensiveResult.price.toFixed(0)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(mostExpensiveResult.date + "T12:00:00").toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Cheap
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Mid-range
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Expensive
            </span>
          </div>

          {/* Calendar grid */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 md:p-4 overflow-x-auto">
            <div className="grid grid-cols-7 gap-1.5 min-w-[420px]">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}

              {/* Empty cells for offset */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${month}-${String(day).padStart(2, "0")}`;
                const dp = dateMap.get(dateStr);
                const isSelected = selectedDate === dateStr;
                const tier = dp
                  ? getPriceTier(dp.price, minPrice, maxPrice)
                  : null;
                const styles = tier ? tierStyles[tier] : null;

                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => dp && setSelectedDate(isSelected ? null : dateStr)}
                    className={`
                      aspect-square rounded-lg border text-center flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-default
                      ${
                        dp
                          ? `${styles?.cell} cursor-pointer`
                          : "border-transparent bg-slate-800/30"
                      }
                      ${isSelected ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-slate-950 scale-105" : ""}
                    `}
                  >
                    <span
                      className={`text-xs ${dp ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {day}
                    </span>
                    {dp && (
                      <span
                        className={`text-sm font-bold ${styles?.text}`}
                      >
                        ${dp.price.toFixed(0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected date detail */}
          {selectedDp && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-blue-400/70 font-medium">
                  Selected Date
                </div>
                <div className="text-lg font-bold text-white">
                  {new Date(selectedDp.date + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${selectedDp.price.toFixed(0)}
                </div>
                <div className="text-xs text-slate-400 uppercase">
                  {selectedDp.currency}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
