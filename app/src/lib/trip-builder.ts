export interface SelectedFlight {
  origin: string;
  destination: string;
  date: string;
  airline: string;
  airline_code: string;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  stops: number;
  price: number;
  currency: string;
  booking_url: string;
  legs: Array<{
    departure_airport: string;
    arrival_airport: string;
    departure_time: string;
    arrival_time: string;
    airline: string;
  }>;
}

export interface TripPlan {
  outbound: SelectedFlight | null;
  return_flight: SelectedFlight | null;
}
