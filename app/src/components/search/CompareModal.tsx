"use client";

import type { FlightResult } from "@/types/flight";
import { useCurrency } from "@/hooks/useCurrency";
import { getAirlineName } from "@/lib/airlines";

interface Props {
  flights: FlightResult[];
  open: boolean;
  onClose: () => void;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type RowKey = "price" | "airline" | "flight_number" | "departs" | "arrives" | "duration" | "stops" | "deal_score";

interface RowDef {
  key: RowKey;
  label: string;
}

const ROWS: RowDef[] = [
  { key: "price", label: "Price" },
  { key: "airline", label: "Airline" },
  { key: "flight_number", label: "Flight #" },
  { key: "departs", label: "Departs" },
  { key: "arrives", label: "Arrives" },
  { key: "duration", label: "Duration" },
  { key: "stops", label: "Stops" },
];

function getCellValue(flight: FlightResult, key: RowKey, format: (price: number) => string): string {
  const firstLeg = flight.legs[0];
  const lastLeg = flight.legs[flight.legs.length - 1];
  switch (key) {
    case "price":
      return format(flight.price);
    case "airline":
      return getAirlineName(firstLeg?.airline_code || firstLeg?.airline || "");
    case "flight_number":
      return firstLeg?.flight_number || firstLeg?.airline_code || "";
    case "departs":
      return formatTime(firstLeg?.departure_time);
    case "arrives":
      return formatTime(lastLeg?.arrival_time);
    case "duration":
      return formatDuration(flight.duration_minutes);
    case "stops":
      return flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`;
    case "deal_score":
      return "";
    default:
      return "";
  }
}

function getNumericValue(flight: FlightResult, key: RowKey): number {
  switch (key) {
    case "price":
      return flight.price;
    case "duration":
      return flight.duration_minutes;
    case "stops":
      return flight.stops;
    case "departs": {
      const dep = flight.legs[0]?.departure_time;
      if (!dep) return Infinity;
      return new Date(dep).getTime();
    }
    case "arrives": {
      const arr = flight.legs[flight.legs.length - 1]?.arrival_time;
      if (!arr) return Infinity;
      return new Date(arr).getTime();
    }
    default:
      return 0;
  }
}

function isBestValue(key: RowKey): boolean {
  return ["price", "duration", "stops"].includes(key);
}

export function CompareModal({ flights, open, onClose }: Props) {
  const { format } = useCurrency();

  if (!open || flights.length === 0) return null;

  function getBestIdx(key: RowKey): number | null {
    if (!isBestValue(key)) return null;
    let bestIdx = 0;
    let bestVal = getNumericValue(flights[0], key);
    for (let i = 1; i < flights.length; i++) {
      const val = getNumericValue(flights[i], key);
      if (val < bestVal) {
        bestVal = val;
        bestIdx = i;
      }
    }
    return bestIdx;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Compare Flights</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-lg border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            aria-label="Close comparison"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-500 bg-slate-800/50 rounded-tl-lg" />
                {flights.map((flight, i) => {
                  const firstLeg = flight.legs[0];
                  return (
                    <th key={i} className="py-3 px-3 text-center bg-slate-800/50 last:rounded-tr-lg">
                      <div className="text-base font-bold text-white">{format(flight.price)}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {getAirlineName(firstLeg?.airline_code || firstLeg?.airline || "")}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const bestIdx = getBestIdx(row.key);
                return (
                  <tr key={row.key} className="border-t border-slate-800/50">
                    <td className="py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {row.label}
                    </td>
                    {flights.map((flight, i) => {
                      const isBest = bestIdx === i;
                      return (
                        <td
                          key={i}
                          className={`py-2.5 px-3 text-center text-sm font-medium ${
                            isBest
                              ? "text-emerald-400 bg-emerald-500/10"
                              : "text-slate-300"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1">
                            {getCellValue(flight, row.key, format)}
                            {isBest && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400 shrink-0">
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                              </svg>
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Book buttons */}
          <div className="flex gap-2 mt-4">
            {flights.map((flight, i) => {
              const firstLeg = flight.legs[0];
              return (
                <a
                  key={i}
                  href={flight.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[44px] rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/15"
                >
                  Book {getAirlineName(firstLeg?.airline_code || firstLeg?.airline || "")}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>

        {/* Mobile stacked card view */}
        <div className="sm:hidden space-y-3">
          {/* Flight cards header */}
          <div className="space-y-2">
            {flights.map((flight, i) => {
              const firstLeg = flight.legs[0];
              const isPriceBest = getBestIdx("price") === i;
              return (
                <div
                  key={i}
                  className={`rounded-lg border p-3 flex items-center justify-between ${
                    isPriceBest
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-slate-800 bg-slate-800/30"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-slate-300">
                      {getAirlineName(firstLeg?.airline_code || firstLeg?.airline || "")}
                    </div>
                    <div className="text-xs text-slate-500">
                      {firstLeg?.flight_number || firstLeg?.airline_code || ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${isPriceBest ? "text-emerald-400" : "text-white"}`}>
                      {format(flight.price)}
                    </div>
                    {isPriceBest && (
                      <div className="text-[10px] font-medium text-emerald-400">Cheapest</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison rows */}
          <div className="space-y-2">
            {ROWS.filter((r) => r.key !== "price" && r.key !== "airline" && r.key !== "flight_number").map((row) => {
              const bestIdx = getBestIdx(row.key);
              return (
                <div key={row.key} className="rounded-lg border border-slate-800 bg-slate-800/20 p-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                    {row.label}
                  </div>
                  <div className="flex items-center gap-2">
                    {flights.map((flight, i) => {
                      const isBest = bestIdx === i;
                      return (
                        <div key={i} className="flex-1 text-center">
                          <span className={`text-sm font-medium ${isBest ? "text-emerald-400" : "text-slate-300"}`}>
                            {getCellValue(flight, row.key, format)}
                          </span>
                          {isBest && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-400 inline-block ml-0.5">
                              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Book buttons */}
          <div className="space-y-2 pt-1">
            {flights.map((flight, i) => {
              const firstLeg = flight.legs[0];
              return (
                <a
                  key={i}
                  href={flight.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/15"
                >
                  Book {getAirlineName(firstLeg?.airline_code || firstLeg?.airline || "")} - {format(flight.price)}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
