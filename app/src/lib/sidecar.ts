const SIDECAR_URL = process.env.SIDECAR_URL || "http://localhost:8000";
const SIDECAR_API_KEY = process.env.SIDECAR_API_KEY || "dev-secret";

async function sidecarFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${SIDECAR_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": SIDECAR_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Sidecar request failed");
  }

  return res.json();
}

export interface FlightLeg {
  airline: string;
  airline_code: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
}

export interface FlightResult {
  price: number;
  currency: string;
  duration_minutes: number;
  stops: number;
  legs: FlightLeg[];
  booking_url: string;
}

export interface DatePrice {
  date: string;
  return_date: string | null;
  price: number;
  currency: string;
}

export interface SearchFlightsParams {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  cabin_class?: string;
  max_stops?: number | null;
  adults?: number;
  sort_by?: string;
  top_n?: number;
}

export interface SearchDatesParams {
  origin: string;
  destination: string;
  from_date: string;
  to_date: string;
  cabin_class?: string;
  max_stops?: number | null;
  trip_type?: string;
  duration?: number | null;
}

export function searchFlights(params: SearchFlightsParams) {
  return sidecarFetch<FlightResult[]>("/search/flights", params);
}

export function searchDates(params: SearchDatesParams) {
  return sidecarFetch<DatePrice[]>("/search/dates", params);
}
