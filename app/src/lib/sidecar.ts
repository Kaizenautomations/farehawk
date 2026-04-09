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

// Explore Anywhere
export interface ExploreDestination {
  destination_code: string;
  city: string;
  country: string;
  cheapest_price: number;
  cheapest_date: string;
  currency: string;
}

export interface ExploreAnywhereResponse {
  origin: string;
  destinations: ExploreDestination[];
  total_searched: number;
  from_date: string;
  to_date: string;
}

export interface ExploreAnywhereParams {
  origin: string;
  from_date: string;
  to_date: string;
  max_budget?: number | null;
  cabin_class?: string;
  max_stops?: number | null;
  trip_type?: string;
  duration?: number | null;
}

export function exploreAnywhere(params: ExploreAnywhereParams) {
  return sidecarFetch<ExploreAnywhereResponse>("/explore/anywhere", params);
}

// Nearby comparison
export interface AirportComparison {
  origin_code: string;
  price: number;
  currency: string;
  drive_time_minutes: number;
  is_home_airport: boolean;
  savings: number;
}

export interface NearbyCompareResponse {
  comparisons: AirportComparison[];
  destination: string;
  departure_date: string;
}

export function compareNearby(params: {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  cabin_class?: string;
  max_stops?: number | null;
}) {
  return sidecarFetch<NearbyCompareResponse>("/compare/nearby", params);
}

// Weekend Getaways
export interface WeekendGetaway {
  destination_code: string;
  destination_city: string;
  destination_country: string;
  departure_date: string;
  return_date: string;
  price: number;
  currency: string;
  deal_score: number;
  deal_label: string;
}

export interface WeekendGetawayResponse {
  origin: string;
  getaways: WeekendGetaway[];
  weeks_searched: number;
}

export function searchWeekends(params: {
  origin: string;
  max_budget?: number | null;
  weeks_ahead?: number;
  cabin_class?: string;
}) {
  return sidecarFetch<WeekendGetawayResponse>("/insights/weekends", params);
}

// Multi-city search
export interface MultiCitySegment {
  origin: string;
  destination: string;
  date: string;
}

export interface MultiCitySearchParams {
  segments: MultiCitySegment[];
  cabin_class?: string;
  max_stops?: number | null;
  adults?: number;
  top_n?: number;
}

export function searchMultiCity(params: MultiCitySearchParams) {
  return sidecarFetch<FlightResult[][]>("/search/multi-city", params);
}

// Date Matrix
export interface DateMatrixCell {
  departure_date: string;
  return_date: string;
  price: number;
  currency: string;
}

export interface DateMatrixResponse {
  origin: string;
  destination: string;
  cells: DateMatrixCell[];
}

export interface DateMatrixParams {
  origin: string;
  destination: string;
  departure_from: string;
  departure_to: string;
  return_from: string;
  return_to: string;
  cabin_class?: string;
  max_stops?: number | null;
}

export function searchDateMatrix(params: DateMatrixParams) {
  return sidecarFetch<DateMatrixResponse>("/search/date-matrix", params);
}
