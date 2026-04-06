"use client";

import type { FlightResult } from "@/types/flight";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  flight: FlightResult;
  onWatch?: () => void;
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

export function FlightCard({ flight, onWatch }: Props) {
  const firstLeg = flight.legs[0];
  const lastLeg = flight.legs[flight.legs.length - 1];

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              {firstLeg?.airline || "Unknown"}
            </span>
            {flight.stops === 0 ? (
              <Badge variant="secondary">Nonstop</Badge>
            ) : (
              <Badge variant="outline">
                {flight.stops} stop{flight.stops > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-lg">
            <span className="font-semibold">
              {formatTime(firstLeg?.departure_time)}
            </span>
            <span className="text-muted-foreground">
              {firstLeg?.departure_airport}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold">
              {formatTime(lastLeg?.arrival_time)}
            </span>
            <span className="text-muted-foreground">
              {lastLeg?.arrival_airport}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDuration(flight.duration_minutes)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-2xl font-bold">
            ${flight.price.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground">
            {flight.currency}
          </span>
          <div className="flex gap-2">
            {onWatch && (
              <Button variant="outline" size="sm" onClick={onWatch}>
                Watch
              </Button>
            )}
            <a href={flight.booking_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm">Book</Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
