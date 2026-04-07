"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AirportAutocomplete } from "@/components/search/AirportAutocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingBar } from "@/components/ui/loading-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CABIN_OPTIONS, STOPS_OPTIONS } from "@/lib/constants";
import { Globe } from "lucide-react";
import type { ExploreAnywhereResponse, ExploreDestination } from "@/lib/sidecar";

const COUNTRY_FLAGS: Record<string, string> = {
  CA: "\u{1F1E8}\u{1F1E6}", US: "\u{1F1FA}\u{1F1F8}", GB: "\u{1F1EC}\u{1F1E7}",
  MX: "\u{1F1F2}\u{1F1FD}", FR: "\u{1F1EB}\u{1F1F7}", DE: "\u{1F1E9}\u{1F1EA}",
  JP: "\u{1F1EF}\u{1F1F5}", AU: "\u{1F1E6}\u{1F1FA}", AE: "\u{1F1E6}\u{1F1EA}",
  NL: "\u{1F1F3}\u{1F1F1}", ES: "\u{1F1EA}\u{1F1F8}", IT: "\u{1F1EE}\u{1F1F9}",
  BR: "\u{1F1E7}\u{1F1F7}", KR: "\u{1F1F0}\u{1F1F7}", TH: "\u{1F1F9}\u{1F1ED}",
  PT: "\u{1F1F5}\u{1F1F9}", TR: "\u{1F1F9}\u{1F1F7}", GR: "\u{1F1EC}\u{1F1F7}",
  CO: "\u{1F1E8}\u{1F1F4}", CU: "\u{1F1E8}\u{1F1FA}", DO: "\u{1F1E9}\u{1F1F4}",
  JM: "\u{1F1EF}\u{1F1F2}", PE: "\u{1F1F5}\u{1F1EA}", CL: "\u{1F1E8}\u{1F1F1}",
  AR: "\u{1F1E6}\u{1F1F7}", IN: "\u{1F1EE}\u{1F1F3}", CN: "\u{1F1E8}\u{1F1F3}",
  SG: "\u{1F1F8}\u{1F1EC}", HK: "\u{1F1ED}\u{1F1F0}", PH: "\u{1F1F5}\u{1F1ED}",
  IE: "\u{1F1EE}\u{1F1EA}", CH: "\u{1F1E8}\u{1F1ED}", SE: "\u{1F1F8}\u{1F1EA}",
  NO: "\u{1F1F3}\u{1F1F4}", DK: "\u{1F1E9}\u{1F1F0}", NZ: "\u{1F1F3}\u{1F1FF}",
  IL: "\u{1F1EE}\u{1F1F1}", EG: "\u{1F1EA}\u{1F1EC}", ZA: "\u{1F1FF}\u{1F1E6}",
  FI: "\u{1F1EB}\u{1F1EE}", PL: "\u{1F1F5}\u{1F1F1}", HR: "\u{1F1ED}\u{1F1F7}",
  TW: "\u{1F1F9}\u{1F1FC}", AT: "\u{1F1E6}\u{1F1F9}",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "\u{2708}\u{FE0F}";
}

function getDefaultFromDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

function getDefaultToDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 2);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getPriceColor(price: number, allPrices: number[]): string {
  if (allPrices.length === 0) return "text-white";
  const sorted = [...allPrices].sort((a, b) => a - b);
  const idx = sorted.indexOf(price);
  const pct = idx / Math.max(sorted.length - 1, 1);
  if (pct <= 0.33) return "text-emerald-400";
  if (pct <= 0.66) return "text-amber-400";
  return "text-red-400";
}

export default function ExplorePage() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [fromDate, setFromDate] = useState(getDefaultFromDate());
  const [toDate, setToDate] = useState(getDefaultToDate());
  const [budget, setBudget] = useState("");
  const [tripType, setTripType] = useState<"one_way" | "round_trip">("round_trip");
  const [duration, setDuration] = useState("7");
  const [cabinClass, setCabinClass] = useState("economy");
  const [maxStops, setMaxStops] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [results, setResults] = useState<ExploreDestination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [retryable, setRetryable] = useState(false);

  async function handleExplore(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !fromDate || !toDate) return;

    setLoading(true);
    setError("");
    setRetryable(false);
    setSearched(true);

    try {
      const res = await fetch("/api/explore/anywhere", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          from_date: fromDate,
          to_date: toDate,
          max_budget: budget ? parseFloat(budget) : null,
          cabin_class: cabinClass,
          max_stops: maxStops ? parseInt(maxStops) : null,
          trip_type: tripType,
          duration: tripType === "round_trip" && duration ? parseInt(duration) : null,
        }),
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

      if (!res.ok) {
        setError(data.error || "Explore failed. Please try again.");
        setRetryable(true);
        setResults([]);
        return;
      }

      const response = data as ExploreAnywhereResponse;
      setResults(response.destinations || []);
    } catch {
      setError("Something went wrong. Please try again.");
      setRetryable(true);
    } finally {
      setLoading(false);
    }
  }

  function handleViewFlights(dest: ExploreDestination) {
    const params = new URLSearchParams({
      origin,
      destination: dest.destination_code,
      date: dest.cheapest_date,
    });
    // No return_date in one-way explore results
    router.push(`/search?${params.toString()}`);
  }

  const allPrices = results.map((r) => r.cheapest_price);

  return (
    <div className="space-y-6">
      <LoadingBar visible={loading} />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <Globe className="size-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Fly Anywhere</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Discover the cheapest destinations from your airport
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleExplore}
        className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 md:p-6 space-y-4"
      >
        {/* Origin + Dates */}
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              From
            </Label>
            <AirportAutocomplete
              value={origin}
              onChange={setOrigin}
              placeholder="Departure airport"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label
              htmlFor="from-date"
              className="text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              Earliest Date
            </Label>
            <Input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
              className="bg-slate-900/50 border-slate-700 text-white h-11 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label
              htmlFor="to-date"
              className="text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              Latest Date
            </Label>
            <Input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate || new Date().toISOString().split("T")[0]}
              required
              className="bg-slate-900/50 border-slate-700 text-white h-11 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Budget + Trip type row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label
              htmlFor="budget"
              className="text-xs font-medium text-slate-400 uppercase tracking-wider"
            >
              Budget Cap
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                $
              </span>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="No limit"
                min="0"
                step="50"
                className="bg-slate-900/50 border-slate-700 text-white h-11 pl-7 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Trip type toggle */}
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Trip Type
            </Label>
            <div className="flex rounded-lg border border-slate-700 overflow-hidden h-11">
              <button
                type="button"
                onClick={() => setTripType("one_way")}
                className={`flex-1 min-h-[44px] text-sm font-medium transition-colors ${
                  tripType === "one_way"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
                }`}
              >
                One-way
              </button>
              <button
                type="button"
                onClick={() => setTripType("round_trip")}
                className={`flex-1 min-h-[44px] text-sm font-medium transition-colors ${
                  tripType === "round_trip"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
                }`}
              >
                Round-trip
              </button>
            </div>
          </div>

          {/* Duration (only for round trip) */}
          {tripType === "round_trip" && (
            <div className="flex-1 space-y-1.5">
              <Label
                htmlFor="duration"
                className="text-xs font-medium text-slate-400 uppercase tracking-wider"
              >
                Trip Length (days)
              </Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                max="30"
                className="bg-slate-900/50 border-slate-700 text-white h-11 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          )}
        </div>

        {/* Collapsible Filters */}
        <div>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 transition-colors min-h-[44px] py-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${filtersOpen ? "rotate-90" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Filters
          </button>

          {filtersOpen && (
            <div className="mt-3 flex flex-col sm:flex-row gap-3 pl-5">
              <div className="space-y-1.5 sm:w-48">
                <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Cabin
                </Label>
                <Select
                  value={cabinClass}
                  onValueChange={(v) => v && setCabinClass(v)}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-10 hover:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {CABIN_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:w-48">
                <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Stops
                </Label>
                <Select
                  value={maxStops}
                  onValueChange={(v) => setMaxStops(v ?? "")}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white h-10 hover:border-slate-600">
                    <SelectValue placeholder="Any stops" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {STOPS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !origin}
          className="w-full h-12 min-h-[44px] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
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
              Exploring...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Globe className="size-5" />
              Explore Destinations
            </span>
          )}
        </button>
      </form>

      {/* Loading message */}
      {loading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6 text-center space-y-4">
          <p className="text-slate-300 text-sm">
            Searching ~35 destinations... this may take up to a minute
          </p>
          <div className="mx-auto max-w-md h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-full animate-explore-progress" />
          </div>
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3 animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-slate-700" />
                  <div className="h-5 w-24 rounded bg-slate-700" />
                  <div className="h-4 w-10 rounded bg-slate-800 ml-auto" />
                </div>
                <div className="h-7 w-20 rounded bg-slate-700" />
                <div className="h-4 w-16 rounded bg-slate-800" />
              </div>
            ))}
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes explore-progress {
                  0% { width: 5%; }
                  50% { width: 70%; }
                  90% { width: 90%; }
                  100% { width: 95%; }
                }
                .animate-explore-progress {
                  animation: explore-progress 50s ease-out forwards;
                }
              `,
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className={`rounded-xl border backdrop-blur-sm p-4 flex items-start gap-3 ${
            retryable
              ? "border-amber-500/30 bg-amber-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {retryable ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-400"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ) : (
              <svg
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
            )}
          </div>
          <p className={`text-sm ${retryable ? "text-amber-300" : "text-red-300"}`}>
            {error}
          </p>
        </div>
      )}

      {/* Results */}
      {searched && !loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Showing {results.length} destination{results.length !== 1 ? "s" : ""}
            {budget ? ` under $${budget}` : ""} from {origin}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((dest) => (
              <div
                key={dest.destination_code}
                className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-4 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0">
                      {getFlag(dest.country)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">
                        {dest.city}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {dest.destination_code}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-xl font-bold ${getPriceColor(
                        dest.cheapest_price,
                        allPrices
                      )}`}
                    >
                      ${Math.round(dest.cheapest_price)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {dest.currency}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {formatDate(dest.cheapest_date)}
                    {""}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleViewFlights(dest)}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors min-h-[44px] flex items-center gap-1 px-2"
                  >
                    View Flights
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {searched && !loading && results.length === 0 && !error && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-10 text-center">
          <Globe className="size-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold mb-1">No destinations found</h3>
          <p className="text-sm text-slate-400">
            Try widening your date range or increasing your budget
          </p>
        </div>
      )}
    </div>
  );
}
