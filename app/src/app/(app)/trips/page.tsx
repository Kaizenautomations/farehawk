"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSavedTrips, deleteTrip, type SavedTrip } from "@/lib/saved-trips";
import { getAirlineName } from "@/lib/airlines";
import { useCurrency } from "@/hooks/useCurrency";

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getAirlines(trip: SavedTrip): string {
  const airlines = new Set<string>();
  airlines.add(
    getAirlineName(
      trip.outbound.airline_code || trip.outbound.airline
    )
  );
  if (trip.return_flight) {
    airlines.add(
      getAirlineName(
        trip.return_flight.airline_code || trip.return_flight.airline
      )
    );
  }
  return Array.from(airlines).join(" / ");
}

export default function TripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const { format, currency } = useCurrency();

  useEffect(() => {
    setTrips(getSavedTrips());
  }, []);

  function handleDelete(id: string) {
    deleteTrip(id);
    setTrips(getSavedTrips());
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-white">Saved Trips</h1>
        {trips.length > 0 && (
          <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-xs">
            {trips.length}
          </Badge>
        )}
      </div>

      {/* Empty state */}
      {trips.length === 0 && (
        <Card className="border-slate-800 bg-slate-900/60">
          <CardContent className="p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-slate-600"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h10" />
              <path d="M7 12h10" />
              <path d="M7 17h10" />
            </svg>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              No saved trips yet. Search for flights, select outbound and
              return, then save your trip.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trip cards */}
      <div className="space-y-4">
        {trips.map((trip) => (
          <Card
            key={trip.id}
            className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors"
          >
            <CardContent className="p-4 md:p-5">
              {/* Top row: name + price */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {trip.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Saved{" "}
                    {new Date(trip.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-white">
                    {format(trip.total_price)}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase">
                    {currency}
                  </span>
                </div>
              </div>

              {/* Route + dates */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-3">
                <span className="text-white font-medium flex items-center gap-1.5">
                  {trip.outbound.origin}
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
                    className="text-slate-500"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  {trip.outbound.destination}
                  {trip.return_flight && (
                    <>
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
                        className="text-slate-500"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                      {trip.return_flight.destination}
                    </>
                  )}
                </span>
                <span className="text-slate-400 text-xs">
                  {formatDateShort(trip.outbound.date)}
                  {trip.return_flight &&
                    ` - ${formatDateShort(trip.return_flight.date)}`}
                  {trip.outbound.date && (
                    <>, {new Date(trip.outbound.date + "T12:00:00").getFullYear()}</>
                  )}
                </span>
                <span className="text-slate-500 text-xs">
                  {getAirlines(trip)}
                </span>
              </div>

              {/* Compact flight summaries */}
              <div className="space-y-1.5 mb-4">
                {/* Outbound */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-blue-400 rotate-45"
                    >
                      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                  </div>
                  <span className="text-slate-300">
                    {formatTime(trip.outbound.departure_time)} &rarr;{" "}
                    {formatTime(trip.outbound.arrival_time)}
                  </span>
                  <span className="text-slate-500">
                    {trip.outbound.stops === 0
                      ? "Nonstop"
                      : `${trip.outbound.stops} stop${trip.outbound.stops > 1 ? "s" : ""}`}
                  </span>
                  <span className="text-slate-600">
                    {format(trip.outbound.price)}
                  </span>
                </div>

                {/* Return */}
                {trip.return_flight && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500/20 shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-indigo-400 -rotate-[135deg]"
                      >
                        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                      </svg>
                    </div>
                    <span className="text-slate-300">
                      {formatTime(trip.return_flight.departure_time)} &rarr;{" "}
                      {formatTime(trip.return_flight.arrival_time)}
                    </span>
                    <span className="text-slate-500">
                      {trip.return_flight.stops === 0
                        ? "Nonstop"
                        : `${trip.return_flight.stops} stop${trip.return_flight.stops > 1 ? "s" : ""}`}
                    </span>
                    <span className="text-slate-600">
                      {format(trip.return_flight.price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <a
                  href={trip.outbound.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs min-h-[44px] shadow-md shadow-blue-500/15"
                  >
                    Book on Google
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(trip.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 text-xs min-h-[44px]"
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
