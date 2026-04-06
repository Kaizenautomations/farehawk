"use client";

import type { FlightResult } from "@/types/flight";
import { FlightCard } from "./FlightCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  results: FlightResult[];
  loading?: boolean;
  onWatch?: (flight: FlightResult) => void;
}

export function FlightResultsList({ results, loading, onWatch }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No flights found. Try different dates or airports.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((flight, i) => (
        <FlightCard
          key={i}
          flight={flight}
          onWatch={onWatch ? () => onWatch(flight) : undefined}
        />
      ))}
    </div>
  );
}
