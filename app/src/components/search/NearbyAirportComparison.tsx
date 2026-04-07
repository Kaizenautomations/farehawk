"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NEARBY_AIRPORTS } from "@/lib/nearby-airports";
import type { NearbyCompareResponse, AirportComparison } from "@/lib/sidecar";
import { Car } from "lucide-react";

interface Props {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  cabin_class?: string;
  max_stops?: number | null;
  currentPrice: number;
}

export function NearbyAirportComparison({
  origin,
  destination,
  departure_date,
  return_date,
  cabin_class,
  max_stops,
  currentPrice,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState<AirportComparison[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const nearby = NEARBY_AIRPORTS[origin];
  const hasNearby = nearby && nearby.length > 0;

  // Build a lookup for city names from the nearby airports data
  const cityLookup: Record<string, string> = {};
  if (nearby) {
    nearby.forEach((n) => {
      cityLookup[n.code] = n.city;
    });
  }
  cityLookup[origin] = "Your airport";

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setExpanded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasNearby) return;
    let cancelled = false;
    async function fetchComparison() {
      setLoading(true);
      setFetchError(false);
      try {
        const res = await fetch("/api/compare/nearby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin,
            destination,
            departure_date,
            return_date,
            cabin_class,
            max_stops,
          }),
        });
        if (res.ok && !cancelled) {
          const json = (await res.json()) as NearbyCompareResponse;
          // Filter out the home airport — only show alternatives
          const alternatives = json.comparisons.filter(
            (c) => !c.is_home_airport
          );
          setData(alternatives);
        } else if (!cancelled) {
          setFetchError(true);
        }
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchComparison();
    return () => {
      cancelled = true;
    };
  }, [origin, destination, departure_date, return_date, cabin_class, max_stops, hasNearby]);

  if (!hasNearby) return null;

  function formatDrive(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}hr`;
    return `${hours}hr ${mins}min`;
  }

  function handleSearchFrom(code: string) {
    const params = new URLSearchParams({
      origin: code,
      destination,
      date: departure_date,
    });
    if (return_date) params.set("return_date", return_date);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 min-h-[44px] text-left hover:bg-slate-800/50 transition-colors"
      >
        <Car className="size-4 text-slate-400 shrink-0" />
        <span className="text-sm font-medium text-slate-300">
          Compare nearby airports
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-auto text-slate-500 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-slate-800 px-4 py-3 space-y-2">
          {loading && (
            <div className="space-y-2">
              {nearby.map((n) => (
                <div key={n.code} className="flex items-center gap-3 animate-pulse">
                  <div className="h-4 w-24 rounded bg-slate-700" />
                  <div className="h-4 w-32 rounded bg-slate-700 ml-auto" />
                </div>
              ))}
            </div>
          )}

          {!loading && data && data.length > 0 && (
            <div className="space-y-2">
              {data.map((comp) => {
                const savings = currentPrice - comp.price;
                const isCheaper = savings > 0;
                const isMoreExpensive = savings < 0;
                const cityName =
                  cityLookup[comp.origin_code] || comp.origin_code;

                return (
                  <div
                    key={comp.origin_code}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 shrink-0">
                        {formatDrive(comp.drive_time_minutes)} to
                      </span>
                      <span className="text-white font-medium">
                        {cityName} ({comp.origin_code})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isCheaper ? (
                        <span className="text-emerald-400 font-medium">
                          Save ${Math.round(savings)}
                        </span>
                      ) : isMoreExpensive ? (
                        <span className="text-red-400 font-medium">
                          ${Math.round(Math.abs(savings))} more
                        </span>
                      ) : (
                        <span className="text-slate-400">Same price</span>
                      )}
                      {isCheaper && (
                        <button
                          type="button"
                          onClick={() => handleSearchFrom(comp.origin_code)}
                          className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors min-h-[44px] flex items-center gap-1 px-1"
                        >
                          Search →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && fetchError && (
            <p className="text-sm text-slate-500">
              Couldn&apos;t load nearby airport prices
            </p>
          )}

          {!loading && !fetchError && data && data.length === 0 && (
            <p className="text-sm text-slate-500">
              No nearby airport prices available right now
            </p>
          )}
        </div>
      )}
    </div>
  );
}
