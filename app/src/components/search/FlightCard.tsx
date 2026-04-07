"use client";

import { useState } from "react";
import type { FlightResult } from "@/types/flight";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DealScoreBadge } from "@/components/search/DealScoreBadge";
import { getAirlineName } from "@/lib/airlines";
import { useCurrency } from "@/hooks/useCurrency";

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
  const [copied, setCopied] = useState(false);
  const { format, currency } = useCurrency();
  const firstLeg = flight.legs[0];
  const lastLeg = flight.legs[flight.legs.length - 1];

  async function handleShare() {
    const depDate = firstLeg?.departure_time
      ? new Date(firstLeg.departure_time).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "";
    const shareText = `Found a flight from ${firstLeg?.departure_airport} to ${lastLeg?.arrival_airport} for ${format(flight.price)} on ${depDate}! Check it out on FareFlight`;
    const shareUrl = flight.booking_url;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failed silently
    }
  }

  return (
    <Card
      className="group border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 gradient-border-hover"
      style={style}
    >
      <CardContent className="relative z-10 p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          {/* Left: Times & airports */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Departure */}
              <div className="text-center min-w-[60px] md:min-w-[70px] shrink-0">
                <div className="text-base md:text-lg font-bold text-white">
                  {formatTime(firstLeg?.departure_time)}
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {firstLeg?.departure_airport}
                </div>
              </div>

              {/* Flight path visualization */}
              <div className="flex-1 flex items-center gap-1 px-1 min-w-0">
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-500 shrink-0" />
                <div className="flex-1 relative min-w-[30px]">
                  <div className="h-px bg-gradient-to-r from-blue-500 via-slate-600 to-indigo-500 w-full" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-slate-500 rotate-90 md:w-[14px] md:h-[14px]"
                    >
                      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-indigo-500 shrink-0" />
              </div>

              {/* Arrival */}
              <div className="text-center min-w-[60px] md:min-w-[70px] shrink-0">
                <div className="text-base md:text-lg font-bold text-white">
                  {formatTime(lastLeg?.arrival_time)}
                </div>
                <div className="text-xs font-medium text-slate-400">
                  {lastLeg?.arrival_airport}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Airline, duration, stops */}
          <div className="flex flex-row flex-wrap md:flex-col items-center gap-1.5 md:gap-1.5 md:min-w-[140px] md:px-4 md:border-l md:border-r md:border-slate-800 border-t md:border-t-0 border-slate-800/50 pt-2 md:pt-0 text-xs md:text-sm">
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
              <>
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-[11px] font-medium">
                  {flight.stops} stop{flight.stops > 1 ? "s" : ""}
                </Badge>
                {flight.legs.length > 1 && (
                  <span className="text-[11px] text-slate-500">
                    via{" "}
                    {flight.legs.slice(0, -1).map((leg, i) => {
                      const nextLeg = flight.legs[i + 1];
                      const layoverMs = nextLeg
                        ? new Date(nextLeg.departure_time).getTime() - new Date(leg.arrival_time).getTime()
                        : 0;
                      const layoverH = Math.floor(layoverMs / 3600000);
                      const layoverM = Math.floor((layoverMs % 3600000) / 60000);
                      return (
                        <span key={i}>
                          {i > 0 && ", "}
                          {leg.arrival_airport}
                          {layoverMs > 0 && (
                            <span className="text-slate-600">
                              {" "}({layoverH}h {layoverM}m)
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Right: Price & actions */}
          <div className="flex flex-row items-center justify-between md:flex-col md:items-end gap-3 md:gap-2 md:min-w-[150px] w-full md:w-auto border-t md:border-t-0 border-slate-800/50 pt-2 md:pt-0">
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  {format(flight.price)}
                </span>
                <span className="text-xs text-slate-500 uppercase">
                  {currency}
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 text-xs h-9 min-h-[44px] min-w-[44px] relative"
                title="Share deal"
                aria-label="Share deal"
              >
                {copied ? (
                  <span className="text-emerald-400 text-xs font-medium">Copied!</span>
                ) : (
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
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                )}
              </Button>
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
