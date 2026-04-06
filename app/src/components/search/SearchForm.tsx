"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { CABIN_OPTIONS, STOPS_OPTIONS } from "@/lib/constants";

interface SearchParams {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  cabin_class: string;
  max_stops: number | null;
}

interface Props {
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
}

export function SearchForm({ onSearch, loading }: Props) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cabinClass, setCabinClass] = useState("economy");
  const [maxStops, setMaxStops] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination || !departureDate) return;
    onSearch({
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate || undefined,
      cabin_class: cabinClass,
      max_stops: maxStops ? parseInt(maxStops) : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>From</Label>
          <AirportAutocomplete
            value={origin}
            onChange={setOrigin}
            placeholder="Departure airport"
          />
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <AirportAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder="Arrival airport"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="departure">Depart</Label>
          <Input
            id="departure"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="return">Return (optional)</Label>
          <Input
            id="return"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={departureDate || new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className="space-y-2">
          <Label>Cabin</Label>
          <Select value={cabinClass} onValueChange={(v) => v && setCabinClass(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CABIN_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Stops</Label>
          <Select value={maxStops} onValueChange={(v) => setMaxStops(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Any stops" />
            </SelectTrigger>
            <SelectContent>
              {STOPS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full md:w-auto" disabled={loading}>
        {loading ? "Searching..." : "Search Flights"}
      </Button>
    </form>
  );
}
