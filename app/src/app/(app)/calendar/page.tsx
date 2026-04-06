"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AirportAutocomplete } from "@/components/search/AirportAutocomplete";
import type { DatePrice } from "@/types/flight";

function getPriceColor(price: number, min: number, max: number): string {
  if (max === min) return "bg-green-100 text-green-800";
  const ratio = (price - min) / (max - min);
  if (ratio < 0.33) return "bg-green-100 text-green-800";
  if (ratio < 0.66) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export default function CalendarPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [results, setResults] = useState<DatePrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination || !month) return;

    setLoading(true);
    setError("");

    const fromDate = `${month}-01`;
    const date = new Date(fromDate);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const toDate = lastDay.toISOString().split("T")[0];

    try {
      const res = await fetch("/api/search/dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          from_date: fromDate,
          to_date: toDate,
          trip_type: "one_way",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Search failed");
        return;
      }

      setResults(await res.json());
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const prices = results.map((r) => r.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Build calendar grid
  const dateMap = new Map(results.map((r) => [r.date, r]));
  const firstDate = new Date(`${month}-01`);
  const startDay = firstDate.getDay();
  const daysInMonth = new Date(
    firstDate.getFullYear(),
    firstDate.getMonth() + 1,
    0
  ).getDate();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Price Calendar</h1>
      <p className="text-muted-foreground">
        Find the cheapest dates to fly.
      </p>
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label>From</Label>
          <AirportAutocomplete value={origin} onChange={setOrigin} placeholder="Origin" />
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <AirportAutocomplete value={destination} onChange={setDestination} placeholder="Destination" />
        </div>
        <div className="space-y-2">
          <Label>Month</Label>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            min={new Date().toISOString().slice(0, 7)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Show Prices"}
        </Button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div className="mb-2 flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-green-100" /> Cheap
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-yellow-100" /> Mid
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded bg-red-100" /> Expensive
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${month}-${String(day).padStart(2, "0")}`;
              const dp = dateMap.get(dateStr);
              return (
                <div
                  key={day}
                  className={`rounded p-2 text-center ${
                    dp
                      ? getPriceColor(dp.price, minPrice, maxPrice)
                      : "bg-muted/30"
                  }`}
                >
                  <div className="text-xs text-muted-foreground">{day}</div>
                  {dp && (
                    <div className="text-sm font-semibold">
                      ${dp.price.toFixed(0)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
