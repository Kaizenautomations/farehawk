"use client";
import { useState, useCallback } from "react";
import type { SelectedFlight, TripPlan } from "@/lib/trip-builder";

export function useTripBuilder() {
  const [trip, setTrip] = useState<TripPlan>({ outbound: null, return_flight: null });

  const selectOutbound = useCallback((flight: SelectedFlight) => {
    setTrip(prev => ({ ...prev, outbound: flight }));
  }, []);

  const selectReturn = useCallback((flight: SelectedFlight) => {
    setTrip(prev => ({ ...prev, return_flight: flight }));
  }, []);

  const clearOutbound = useCallback(() => {
    setTrip(prev => ({ ...prev, outbound: null }));
  }, []);

  const clearReturn = useCallback(() => {
    setTrip(prev => ({ ...prev, return_flight: null }));
  }, []);

  const clearTrip = useCallback(() => {
    setTrip({ outbound: null, return_flight: null });
  }, []);

  const totalPrice = (trip.outbound?.price || 0) + (trip.return_flight?.price || 0);

  const bookingUrl = trip.outbound
    ? `https://www.google.com/travel/flights?q=Flights+from+${trip.outbound.origin}+to+${trip.outbound.destination}+on+${trip.outbound.date}${trip.return_flight ? `+through+${trip.return_flight.date}` : ""}`
    : "";

  return { trip, selectOutbound, selectReturn, clearOutbound, clearReturn, clearTrip, totalPrice, bookingUrl };
}
