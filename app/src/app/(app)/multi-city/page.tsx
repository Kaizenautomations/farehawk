"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlightCard } from "@/components/search/FlightCard";
import { LoadingBar } from "@/components/ui/loading-bar";
import { useCurrency } from "@/hooks/useCurrency";
import { Route, Plus, Trash2, Search } from "lucide-react";
import type { FlightResult } from "@/types/flight";

interface Segment {
  origin: string;
  destination: string;
  date: string;
}

const emptySegment = (): Segment => ({ origin: "", destination: "", date: "" });

export default function MultiCityPage() {
  const [segments, setSegments] = useState<Segment[]>([
    emptySegment(),
    emptySegment(),
  ]);
  const [results, setResults] = useState<FlightResult[][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { format } = useCurrency();

  function updateSegment(index: number, field: keyof Segment, value: string) {
    setSegments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addSegment() {
    if (segments.length >= 4) return;
    setSegments((prev) => [...prev, emptySegment()]);
  }

  function removeSegment(index: number) {
    if (segments.length <= 2) return;
    setSegments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSearch() {
    // Validate
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!seg.origin || !seg.destination || !seg.date) {
        setError(`Please fill in all fields for Leg ${i + 1}`);
        return;
      }
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("/api/search/multi-city", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: segments.map((s) => ({
            origin: s.origin.toUpperCase(),
            destination: s.destination.toUpperCase(),
            date: s.date,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Search failed");
      }

      const data: FlightResult[][] = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  // Calculate total cheapest price across all legs
  const totalCheapest =
    results && results.length > 0
      ? results.reduce((sum, legResults) => {
          if (legResults.length === 0) return sum;
          const cheapest = Math.min(...legResults.map((r) => r.price));
          return sum + cheapest;
        }, 0)
      : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Route className="size-6 text-blue-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Multi-City Search
          </h1>
        </div>
        <p className="text-zinc-400 mt-1">
          Search multiple flight legs independently and find the best price for
          each.
        </p>
      </div>

      {/* Segment Form */}
      <Card className="border-zinc-800 bg-zinc-900/80">
        <CardHeader className="border-b border-zinc-800 pb-4">
          <CardTitle className="text-base font-semibold text-white">
            Flight Legs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-400">
                  Leg {i + 1}
                </span>
                {segments.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeSegment(i)}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors min-h-[44px] px-2"
                    aria-label={`Remove leg ${i + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">From</Label>
                  <Input
                    placeholder="YEG"
                    value={seg.origin}
                    onChange={(e) =>
                      updateSegment(i, "origin", e.target.value.toUpperCase())
                    }
                    maxLength={3}
                    className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-600 uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">To</Label>
                  <Input
                    placeholder="LHR"
                    value={seg.destination}
                    onChange={(e) =>
                      updateSegment(
                        i,
                        "destination",
                        e.target.value.toUpperCase()
                      )
                    }
                    maxLength={3}
                    className="border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-600 uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Date</Label>
                  <Input
                    type="date"
                    value={seg.date}
                    onChange={(e) => updateSegment(i, "date", e.target.value)}
                    className="border-zinc-700 bg-zinc-800 text-white [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-3">
            {segments.length < 4 && (
              <Button
                type="button"
                variant="outline"
                onClick={addSegment}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white min-h-[44px]"
              >
                <Plus className="size-4 mr-2" />
                Add Leg
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 min-h-[44px] flex-1 sm:flex-initial"
            >
              <Search className="size-4 mr-2" />
              {loading ? "Searching..." : "Search All Legs"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      <LoadingBar visible={loading} />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="space-y-6">
          {/* Total price summary */}
          {totalCheapest !== null && totalCheapest > 0 && (
            <Card className="border-blue-500/30 bg-blue-500/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">
                    Estimated total (cheapest per leg)
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Sum of the lowest price from each leg
                  </p>
                </div>
                <span className="text-2xl font-bold text-white">
                  {format(totalCheapest)}
                </span>
              </CardContent>
            </Card>
          )}

          {/* Per-leg results */}
          {results.map((legResults, i) => {
            const seg = segments[i];
            if (!seg) return null;
            const dateStr = seg.date
              ? new Date(seg.date + "T12:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "";
            return (
              <div key={i} className="space-y-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center size-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                    {i + 1}
                  </span>
                  {seg.origin} &rarr; {seg.destination}
                  {dateStr && (
                    <span className="text-sm text-zinc-400 font-normal">
                      ({dateStr})
                    </span>
                  )}
                </h2>
                {legResults.length === 0 ? (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-6 text-center">
                    <p className="text-zinc-400">
                      No flights found for this leg.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {legResults.map((flight, j) => (
                      <FlightCard key={j} flight={flight} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
