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
