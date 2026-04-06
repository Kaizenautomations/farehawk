"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search/SearchForm";
import { FlightResultsList } from "@/components/search/FlightResultsList";
import { useSubscription } from "@/hooks/useSubscription";
import type { FlightResult } from "@/types/flight";
import { Badge } from "@/components/ui/badge";

export default function SearchPage() {
  const [results, setResults] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const sub = useSubscription();

  async function handleSearch(params: {
    origin: string;
    destination: string;
    departure_date: string;
    return_date?: string;
    cabin_class: string;
    max_stops: number | null;
  }) {
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch("/api/search/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (res.status === 429) {
        setError("Daily search limit reached. Upgrade your plan for more searches.");
        setResults([]);
        return;
      }

      if (res.status === 403) {
        const data = await res.json();
        setError(data.error);
        setResults([]);
        return;
      }

      if (!res.ok) {
        setError("Search failed. Please try again.");
        setResults([]);
        return;
      }

      const data = await res.json();
      setResults(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      sub.refresh();
    }
  }

  async function handleWatch(flight: FlightResult) {
    const firstLeg = flight.legs[0];
    const lastLeg = flight.legs[flight.legs.length - 1];
    if (!firstLeg || !lastLeg) return;

    const res = await fetch("/api/watches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: firstLeg.departure_airport,
        destination: lastLeg.arrival_airport,
        departure_date: firstLeg.departure_time.split("T")[0],
        target_price: flight.price,
        current_price: flight.price,
        lowest_price: flight.price,
      }),
    });

    if (res.ok) {
      alert("Watch created! You'll be notified when the price drops.");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create watch");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Search Flights</h1>
        {sub.tier && (
          <Badge variant="outline">
            {sub.searches_used}/{sub.searches_limit} searches today
          </Badge>
        )}
      </div>
      <SearchForm onSearch={handleSearch} loading={loading} />
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
      {searched && <FlightResultsList results={results} loading={loading} onWatch={handleWatch} />}
    </div>
  );
}
