import type { SelectedFlight } from "@/lib/trip-builder";

export interface SavedTrip {
  id: string;
  name: string;
  outbound: SelectedFlight;
  return_flight: SelectedFlight | null;
  total_price: number;
  currency: string;
  created_at: number;
}

const STORAGE_KEY = "fareflight_saved_trips";
const MAX_TRIPS = 20;

export function getSavedTrips(): SavedTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTrip(
  trip: Omit<SavedTrip, "id" | "created_at">
): SavedTrip {
  const trips = getSavedTrips();
  const newTrip: SavedTrip = {
    ...trip,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: Date.now(),
  };
  trips.unshift(newTrip);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips.slice(0, MAX_TRIPS)));
  return newTrip;
}

export function deleteTrip(id: string): void {
  const trips = getSavedTrips().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function getSavedTripCount(): number {
  return getSavedTrips().length;
}

export function isTripSaved(
  outbound: SelectedFlight,
  returnFlight: SelectedFlight | null
): boolean {
  const trips = getSavedTrips();
  return trips.some(
    (t) =>
      t.outbound.departure_time === outbound.departure_time &&
      t.outbound.arrival_time === outbound.arrival_time &&
      t.outbound.origin === outbound.origin &&
      t.outbound.destination === outbound.destination &&
      (returnFlight === null
        ? t.return_flight === null
        : t.return_flight !== null &&
          t.return_flight.departure_time === returnFlight.departure_time &&
          t.return_flight.arrival_time === returnFlight.arrival_time)
  );
}
