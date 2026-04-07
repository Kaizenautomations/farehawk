"use client";

import { useEffect, useState } from "react";
import type { TripPlan } from "@/lib/trip-builder";
import { useCurrency } from "@/hooks/useCurrency";
import { getAirlineName } from "@/lib/airlines";

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Props {
  trip: TripPlan;
  totalPrice: number;
  bookingUrl: string;
  onClear: () => void;
}

export function TripSummary({ trip, totalPrice, bookingUrl, onClear }: Props) {
  const { format, currency } = useCurrency();
  const [visible, setVisible] = useState(false);

  const hasSelection = trip.outbound !== null;

  useEffect(() => {
    if (hasSelection) {
      // Small delay for slide-up animation
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [hasSelection]);

  if (!hasSelection) return null;

  const outbound = trip.outbound!;
  const returnFlight = trip.return_flight;

  // Build via text for a flight
  function getViaText(flight: typeof outbound) {
    if (flight.stops === 0) return "Nonstop";
    const viaAirports = flight.legs
      .slice(0, -1)
      .map((leg) => leg.arrival_airport);
    return `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${viaAirports.length > 0 ? ` via ${viaAirports.join(", ")}` : ""}`;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:bottom-0 transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* Spacer for mobile tab bar — push above the 44px BottomTabBar on small screens */}
      <div className="lg:hidden h-[60px]" />

      <div className="mx-auto max-w-4xl px-3 pb-2 lg:pb-4">
        <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-blue-400"
              >
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
              Your Trip
            </h3>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center justify-center h-8 w-8 min-h-[44px] min-w-[44px] rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Clear trip"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Flight rows */}
          <div className="space-y-2">
            {/* Outbound */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-500/20 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-blue-400 rotate-45"
                >
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-white font-medium">
                  {outbound.origin} &rarr; {outbound.destination}
                </span>
                <span className="text-slate-400 ml-2">
                  {formatDate(outbound.date)}
                </span>
                <span className="text-slate-500 ml-2 hidden sm:inline">
                  {getAirlineName(outbound.airline_code || outbound.airline)}
                </span>
                <span className="text-slate-500 ml-2 hidden sm:inline">
                  {formatTime(outbound.departure_time)} &rarr; {formatTime(outbound.arrival_time)}
                </span>
                <span className="text-slate-600 ml-2 hidden sm:inline text-xs">
                  {getViaText(outbound)}
                </span>
              </div>
              <span className="text-white font-semibold shrink-0">
                {format(outbound.price)}
              </span>
            </div>

            {/* Return */}
            {returnFlight && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-500/20 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-indigo-400 -rotate-[135deg]"
                  >
                    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium">
                    {returnFlight.origin} &rarr; {returnFlight.destination}
                  </span>
                  <span className="text-slate-400 ml-2">
                    {formatDate(returnFlight.date)}
                  </span>
                  <span className="text-slate-500 ml-2 hidden sm:inline">
                    {getAirlineName(returnFlight.airline_code || returnFlight.airline)}
                  </span>
                  <span className="text-slate-500 ml-2 hidden sm:inline">
                    {formatTime(returnFlight.departure_time)} &rarr; {formatTime(returnFlight.arrival_time)}
                  </span>
                  <span className="text-slate-600 ml-2 hidden sm:inline text-xs">
                    {getViaText(returnFlight)}
                  </span>
                </div>
                <span className="text-white font-semibold shrink-0">
                  {format(returnFlight.price)}
                </span>
              </div>
            )}

            {/* Not yet selected return prompt */}
            {!returnFlight && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-700/50 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-500"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="text-slate-500 text-sm italic">
                  Select a return flight below...
                </span>
              </div>
            )}
          </div>

          {/* Total + Book button */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">
                  {format(totalPrice)}
                </span>
                <span className="text-xs text-slate-500 uppercase">{currency}</span>
                {!returnFlight && (
                  <span className="text-xs text-slate-600 ml-1">(outbound only)</span>
                )}
              </div>
            </div>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold transition-all shadow-lg ${
                returnFlight
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-300"
              }`}
            >
              {returnFlight ? "Book on Google" : "Book Outbound"}
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
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
