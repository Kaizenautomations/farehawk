"use client";

import { useState } from "react";
import type { FlightResult } from "@/types/flight";
import type { SelectedFlight } from "@/lib/trip-builder";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DealScoreBadge } from "@/components/search/DealScoreBadge";
import { getAirlineName } from "@/lib/airlines";
import { useCurrency } from "@/hooks/useCurrency";

interface Props {
  flight: FlightResult;
  onWatch?: () => void;
  onSelect?: (flight: SelectedFlight) => void;
  isSelected?: boolean;
  style?: React.CSSProperties;
  showCompareCheckbox?: boolean;
  isInCompare?: boolean;
  onToggleCompare?: () => void;
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

function isRedEye(time: string): boolean {
  if (!time) return false;
  const h = new Date(time).getHours();
  return h >= 0 && h < 5;
}

function getOvernightDays(dep: string, arr: string): number {
  if (!dep || !arr) return 0;
  const d1 = new Date(dep);
  const d2 = new Date(arr);
  return Math.floor((d2.getTime() - d1.getTime()) / 86400000);
}

function calculateLayover(currentArrival: string, nextDeparture: string): number {
  return Math.round(
    (new Date(nextDeparture).getTime() - new Date(currentArrival).getTime()) /
      60000
  );
}

export function FlightCard({ flight, onWatch, onSelect, isSelected, style, showCompareCheckbox, isInCompare, onToggleCompare }: Props) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { format, currency } = useCurrency();
  const firstLeg = flight.legs[0];
  const lastLeg = flight.legs[flight.legs.length - 1];

  const overnightDays = getOvernightDays(
    firstLeg?.departure_time,
    lastLeg?.arrival_time
  );
  const redEye = isRedEye(firstLeg?.departure_time);

  // Calculate total flying vs layover time for expanded view
  const totalFlyingMinutes = flight.legs.reduce(
    (sum, leg) => sum + (leg.duration_minutes || 0),
    0
  );
  const totalLayoverMinutes = flight.duration_minutes - totalFlyingMinutes;

  function handleSelect() {
    if (!onSelect) return;
    const firstLeg = flight.legs[0];
    const lastLeg = flight.legs[flight.legs.length - 1];
    const selected: SelectedFlight = {
      origin: firstLeg?.departure_airport || "",
      destination: lastLeg?.arrival_airport || "",
      date: firstLeg?.departure_time ? firstLeg.departure_time.split("T")[0] : "",
      airline: getAirlineName(firstLeg?.airline_code || firstLeg?.airline || ""),
      airline_code: firstLeg?.airline_code || firstLeg?.airline || "",
      departure_time: firstLeg?.departure_time || "",
      arrival_time: lastLeg?.arrival_time || "",
      duration_minutes: flight.duration_minutes,
      stops: flight.stops,
      price: flight.price,
      currency: flight.currency,
      booking_url: flight.booking_url,
      legs: flight.legs.map((leg) => ({
        departure_airport: leg.departure_airport,
        arrival_airport: leg.arrival_airport,
        departure_time: leg.departure_time,
        arrival_time: leg.arrival_time,
        airline: leg.airline,
      })),
    };
    onSelect(selected);
  }

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

  function handleCardClick(e: React.MouseEvent) {
    // Don't toggle if clicking a button, link, or inside the actions area
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    setExpanded((prev) => !prev);
  }

  return (
    <Card
      className={`group border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5 gradient-border-hover cursor-pointer ${
        isSelected ? "ring-2 ring-blue-500 border-blue-500/50 bg-blue-500/5" : ""
      }`}
      style={style}
      onClick={handleCardClick}
    >
      <CardContent className="relative z-10 p-4 md:p-5">
        {/* Compare checkbox */}
        {showCompareCheckbox && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare?.();
            }}
            className="absolute top-3 left-3 z-20 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{
              borderColor: isInCompare ? "rgb(59 130 246)" : "rgb(100 116 139)",
              backgroundColor: isInCompare ? "rgb(59 130 246)" : "transparent",
            }}
            aria-label={isInCompare ? "Remove from compare" : "Add to compare"}
          >
            {isInCompare && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        )}
        <div className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 ${showCompareCheckbox ? "pl-8" : ""}`}>
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
                <div className="text-base md:text-lg font-bold text-white flex items-center justify-center gap-1">
                  {formatTime(lastLeg?.arrival_time)}
                  {overnightDays > 0 && (
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/15 rounded px-1 py-0.5 leading-none">
                      +{overnightDays}
                    </span>
                  )}
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
                {firstLeg?.flight_number && ` ${firstLeg.flight_number}`}
              </span>
            </span>
            <span className="text-xs text-slate-500">
              {formatDuration(flight.duration_minutes)}
            </span>
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1">
              {flight.stops === 0 ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 text-[11px] font-medium">
                  Nonstop
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 text-[11px] font-medium">
                  {flight.stops} stop{flight.stops > 1 ? "s" : ""}
                </Badge>
              )}
              {redEye && (
                <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-[11px] font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-0.5"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Red-eye
                </Badge>
              )}
            </div>
            {flight.stops > 0 && flight.legs.length > 1 && (
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
              {onSelect && (
                <Button
                  size="sm"
                  onClick={handleSelect}
                  className={`text-xs h-9 min-h-[44px] min-w-[44px] shadow-md ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-blue-500/20 cursor-default"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/15"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Selected
                    </>
                  ) : (
                    "Select"
                  )}
                </Button>
              )}
              <a
                href={flight.booking_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className={`text-xs h-9 min-h-[44px] min-w-[44px] shadow-md ${
                    onSelect
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 bg-transparent border shadow-none"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/15"
                  }`}
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

        {/* Expanded leg details */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="space-y-3">
              {flight.legs.map((leg, i) => {
                const legAirlineName = getAirlineName(
                  leg.airline_code || leg.airline || ""
                );
                const firstAirlineName = getAirlineName(
                  firstLeg?.airline_code || firstLeg?.airline || ""
                );
                const isDifferentAirline =
                  i > 0 && legAirlineName !== firstAirlineName;

                return (
                  <div key={i}>
                    {/* Layover info between legs */}
                    {i > 0 && (
                      <div className="flex items-center gap-2 mb-3 ml-2">
                        <div className="h-px flex-1 bg-slate-800" />
                        {(() => {
                          const prevLeg = flight.legs[i - 1];
                          const layoverMins = calculateLayover(
                            prevLeg.arrival_time,
                            leg.departure_time
                          );
                          const isLong = layoverMins > 240;
                          return (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                                isLong
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {formatDuration(layoverMins)} layover in{" "}
                              {prevLeg.arrival_airport}
                              {isLong && " -- Long layover"}
                            </span>
                          );
                        })()}
                        <div className="h-px flex-1 bg-slate-800" />
                      </div>
                    )}

                    {/* Leg detail */}
                    <div className="flex items-start gap-3 text-xs">
                      {/* Leg indicator */}
                      <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <div className="w-px h-6 bg-slate-700" />
                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                      </div>

                      {/* Leg info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-300 font-medium">
                            {leg.airline_code || leg.airline}{" "}
                            {leg.flight_number}
                          </span>
                          <span className="text-slate-500">
                            {legAirlineName}
                          </span>
                          {isDifferentAirline && (
                            <span className="text-amber-400/80 text-[10px]">
                              Operated by {legAirlineName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <span>
                            {formatTime(leg.departure_time)}{" "}
                            <span className="text-slate-500">
                              {leg.departure_airport}
                            </span>
                          </span>
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
                            className="text-slate-600 shrink-0"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                          <span>
                            {formatTime(leg.arrival_time)}{" "}
                            <span className="text-slate-500">
                              {leg.arrival_airport}
                            </span>
                          </span>
                          {leg.duration_minutes > 0 && (
                            <span className="text-slate-600">
                              ({formatDuration(leg.duration_minutes)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total summary */}
            {flight.legs.length > 1 && (
              <div className="mt-3 pt-2 border-t border-slate-800/50 text-xs text-slate-500">
                Total: {formatDuration(flight.duration_minutes)}
                {totalFlyingMinutes > 0 && totalLayoverMinutes > 0 && (
                  <span>
                    {" "}
                    ({formatDuration(totalFlyingMinutes)} flying,{" "}
                    {formatDuration(totalLayoverMinutes)} layover)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chevron indicator */}
        <div className="flex justify-end mt-1">
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
            className={`text-slate-600 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
