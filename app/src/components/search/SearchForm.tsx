"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { CABIN_OPTIONS, STOPS_OPTIONS } from "@/lib/constants";
import { useSubscription } from "@/hooks/useSubscription";

interface SearchParams {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  cabin_class: string;
  max_stops: number | null;
  flexible_dates?: boolean;
}

interface InitialValues {
  origin?: string;
  destination?: string;
  departure_date?: string;
  return_date?: string;
  cabin_class?: string;
  max_stops?: string;
}

interface Props {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
  initialValues?: InitialValues;
}

export function SearchForm({ onSearch, loading, initialValues }: Props) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cabinClass, setCabinClass] = useState("economy");
  const [maxStops, setMaxStops] = useState("");
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const autoSubmitRef = useRef(false);
  const sub = useSubscription();

  // Filter cabin options based on subscription tier
  const allowedCabinOptions = useMemo(() => {
    const tier = sub.tier || "free";
    if (tier === "premium" || tier === "admin") return CABIN_OPTIONS;
    if (tier === "pro") return CABIN_OPTIONS.filter((o) => o.value === "economy" || o.value === "premium_economy");
    return CABIN_OPTIONS.filter((o) => o.value === "economy");
  }, [sub.tier]);

  // Reset cabin class if current selection is not allowed
  useEffect(() => {
    const allowed = allowedCabinOptions.map((o) => o.value as string);
    if (!allowed.includes(cabinClass)) {
      setCabinClass("economy");
    }
  }, [allowedCabinOptions, cabinClass]);

  // Populate form from initialValues (e.g. URL params from explore page)
  useEffect(() => {
    if (!initialValues) return;
    if (initialValues.origin) setOrigin(initialValues.origin);
    if (initialValues.destination) setDestination(initialValues.destination);
    if (initialValues.departure_date) setDepartureDate(initialValues.departure_date);
    if (initialValues.return_date) setReturnDate(initialValues.return_date);
    if (initialValues.cabin_class) setCabinClass(initialValues.cabin_class);
    if (initialValues.max_stops) setMaxStops(initialValues.max_stops);
  }, [initialValues]);

  // Auto-submit when initialValues provide enough data
  useEffect(() => {
    if (autoSubmitRef.current) return;
    if (
      initialValues?.origin &&
      initialValues?.destination &&
      initialValues?.departure_date
    ) {
      autoSubmitRef.current = true;
      const timer = setTimeout(() => {
        onSearch({
          origin: initialValues.origin!,
          destination: initialValues.destination!,
          departure_date: initialValues.departure_date!,
          return_date: initialValues.return_date || undefined,
          cabin_class: initialValues.cabin_class || "economy",
          max_stops: initialValues.max_stops ? parseInt(initialValues.max_stops) : null,
          flexible_dates: undefined,
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialValues, onSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination || !departureDate) return;
    onSearch({
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate || undefined,
      cabin_class: cabinClass,
      max_stops: maxStops ? parseInt(maxStops) : null,
      flexible_dates: flexibleDates || undefined,
    });
  }

  function swapAirports() {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-5 md:p-6 space-y-4"
    >
      {/* Airport row */}
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

        {/* Swap button */}
        <div className="flex justify-center md:pb-0.5">
          <button
            type="button"
            onClick={swapAirports}
            className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-blue-500/50 transition-all duration-200 flex items-center justify-center text-slate-400 hover:text-blue-400 shrink-0"
            aria-label="Swap origin and destination"
          >
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
            >
              <path d="M7 16V4m0 0L3 8m4-4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-1.5">
          <Label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            To
          </Label>
          <AirportAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder="Arrival airport"
          />
        </div>
      </div>

      {/* Date row + search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label
            htmlFor="departure"
            className="text-xs font-medium text-slate-400 uppercase tracking-wider"
          >
            Depart
          </Label>
          <Input
            id="departure"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
            className="bg-slate-900/50 border-slate-700 text-white h-11 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label
            htmlFor="return"
            className="text-xs font-medium text-slate-400 uppercase tracking-wider"
          >
            Return (optional)
          </Label>
          <Input
            id="return"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={departureDate || new Date().toISOString().split("T")[0]}
            className="bg-slate-900/50 border-slate-700 text-white h-11 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={flexibleDates}
              onChange={(e) => setFlexibleDates(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/20 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm text-slate-400 whitespace-nowrap select-none">
              Flexible
              {flexibleDates && (
                <span className="ml-1 text-blue-400 text-xs font-medium">+/- 3 days</span>
              )}
            </span>
          </label>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 min-h-[44px] px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 md:min-w-[160px]"
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
              Searching...
            </span>
          ) : (
            <span className="flex items-center gap-2">
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
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search Flights
            </span>
          )}
        </Button>
      </div>

      {/* Filters + Clear */}
      <div>
        <div className="flex items-center gap-3">
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
        <button
          type="button"
          onClick={() => {
            setOrigin("");
            setDestination("");
            setDepartureDate("");
            setReturnDate("");
            setCabinClass("economy");
            setMaxStops("");
            setFlexibleDates(false);
            setFiltersOpen(false);
          }}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors min-h-[44px] py-2"
        >
          Clear
        </button>
        </div>

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
                  {allowedCabinOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                  {allowedCabinOptions.length < CABIN_OPTIONS.length && (
                    <div className="px-3 py-2 text-xs text-slate-500 border-t border-slate-800 mt-1">
                      <svg className="inline-block mr-1 h-3 w-3 align-middle" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Upgrade for more cabin classes
                    </div>
                  )}
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
    </form>
  );
}
