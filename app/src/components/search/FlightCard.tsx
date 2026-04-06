"use client";

import type { FlightResult } from "@/types/flight";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DealScoreBadge } from "@/components/search/DealScoreBadge";
import { getAirlineName } from "@/lib/airlines";

interface Props {
  flight: FlightResult;
  onWatch?: () => void;
  style?: React.CSSProperties;
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

export function FlightCard({ flight, onWatch, style }: Props) {
  const firstLeg = flight.legs[0];
  const lastLeg = flight.legs[flight.legs.length - 1];

  return (
    <Card
      className="group border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 gradient-border-hover"
      style={style}
    >
      <CardContent className="relative z-10 p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Left: Times & airports */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Departure */}
              <div className="text-center min-w-[70px]">
                <div className="text-lg font-bold text-white">
                  {formatTime(firstLeg?.departure_time)}
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {firstLeg?.departure_airport}
                </div>
              </div>

              {/* Flight path visualization */}
              <div className="flex-1 flex items-center gap-1 px-1">
                <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <div className="flex-1 relative">
                  <div className="h-px bg-gradient-to-r from-blue-500 via-slate-600 to-indigo-500 w-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-slate-500 rotate-90"
                    >
                      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
              </div>

              {/* Arrival */}
              <div className="text-center min-w-[70px]">
                <div className="text-lg font-bold text-white">
                  {formatTime(lastLeg?.arrival_time)}
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {lastLeg?.arrival_airport}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Airline, duration, stops */}
          <div className="flex flex-wrap md:flex-col items-center md:items-center gap-2 md:gap-1.5 md:min-w-[140px] md:px-4 md:border-l md:border-r md:border-slate-800 border-t md:border-t-0 border-slate-800/50 pt-3 md:pt-0">
            <span className="text-sm font-medium text-slate-300">
              {getAirlineName(firstLeg?.airline_code || firstLeg?.airline || "")}
              <span className="ml-1.5 text-xs text-slate-500">
                {firstLeg?.airline_code || firstLeg?.airline || ""}
              </span>
            </span>
            <span className="text-xs text-slate-500">
              {formatDuration(flight.duration_minutes)}
            </span>
            {flight.stops === 0 ? (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 text-[11px] font-medium">
                Nonstop
              </Badge>
            ) : (
              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-[11px] font-medium">
                {flight.stops} stop{flight.stops > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Right: Price & actions */}
          <div className="flex md:flex-col items-center justify-between md:items-end gap-3 md:gap-2 md:min-w-[150px] w-full md:w-auto border-t md:border-t-0 border-slate-800/50 pt-3 md:pt-0">
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  ${flight.price.toFixed(0)}
                </span>
                <span className="text-xs text-slate-500 uppercase">
                  {flight.currency}
                </span>
              </div>
              <DealScoreBadge price={flight.price} />
            </div>
            <div className="flex gap-2">
              {onWatch && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onWatch}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 text-xs h-9 min-h-[44px] min-w-[44px]"
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
                    className="mr-1"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Watch
                </Button>
              )}
              <a
                href={flight.booking_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs h-9 min-h-[44px] min-w-[44px] shadow-md shadow-blue-500/15"
                >
                  Book
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
                    className="ml-1"
                  >
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
