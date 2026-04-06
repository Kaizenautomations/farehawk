from fli.models import (
    Airport,
    FlightSearchFilters,
    DateSearchFilters,
    FlightSegment,
    PassengerInfo,
    SeatType,
    MaxStops,
    SortBy,
    TripType,
)
from fli.search import SearchFlights, SearchDates
from models.requests import FlightSearchRequest, DateSearchRequest
from models.responses import FlightResultResponse, FlightLegResponse, DatePriceResponse


CABIN_MAP = {
    "economy": SeatType.ECONOMY,
    "premium_economy": SeatType.PREMIUM_ECONOMY,
    "business": SeatType.BUSINESS,
    "first": SeatType.FIRST,
}

STOPS_MAP = {
    None: MaxStops.ANY,
    0: MaxStops.NON_STOP,
    1: MaxStops.ONE_STOP_OR_FEWER,
    2: MaxStops.TWO_OR_FEWER_STOPS,
}

SORT_MAP = {
    "cheapest": SortBy.CHEAPEST,
    "duration": SortBy.DURATION,
    "departure_time": SortBy.DEPARTURE_TIME,
    "arrival_time": SortBy.ARRIVAL_TIME,
    "best": SortBy.BEST,
}


def build_google_flights_url(
    origin: str, dest: str, depart: str, return_date: str | None = None
) -> str:
    base = "https://www.google.com/travel/flights"
    if return_date:
        return f"{base}?q=Flights+from+{origin}+to+{dest}+on+{depart}+through+{return_date}"
    return f"{base}?q=Flights+from+{origin}+to+{dest}+on+{depart}"


def search_flights(req: FlightSearchRequest) -> list[FlightResultResponse]:
    origin = Airport[req.origin.upper()]
    destination = Airport[req.destination.upper()]

    segments = [
        FlightSegment(
            departure_airport=[[origin, 0]],
            arrival_airport=[[destination, 0]],
            travel_date=req.departure_date,
        )
    ]

    trip_type = TripType.ONE_WAY
    if req.return_date:
        trip_type = TripType.ROUND_TRIP
        segments.append(
            FlightSegment(
                departure_airport=[[destination, 0]],
                arrival_airport=[[origin, 0]],
                travel_date=req.return_date,
            )
        )

    filters = FlightSearchFilters(
        trip_type=trip_type,
        passenger_info=PassengerInfo(adults=req.adults),
        flight_segments=segments,
        seat_type=CABIN_MAP.get(req.cabin_class, SeatType.ECONOMY),
        stops=STOPS_MAP.get(req.max_stops, MaxStops.ANY),
        sort_by=SORT_MAP.get(req.sort_by, SortBy.CHEAPEST),
    )

    searcher = SearchFlights()
    results = searcher.search(filters, top_n=req.top_n)

    if not results:
        return []

    output = []
    for result in results:
        # Handle both single FlightResult and tuples (round trip)
        flights = result if isinstance(result, tuple) else (result,)
        first = flights[0]

        legs = []
        for flight in flights:
            for leg in flight.legs:
                legs.append(
                    FlightLegResponse(
                        airline=leg.airline.name if hasattr(leg.airline, "name") else str(leg.airline),
                        airline_code=leg.airline.value if hasattr(leg.airline, "value") else str(leg.airline),
                        flight_number=leg.flight_number or "",
                        departure_airport=leg.departure_airport.name if hasattr(leg.departure_airport, "name") else str(leg.departure_airport),
                        arrival_airport=leg.arrival_airport.name if hasattr(leg.arrival_airport, "name") else str(leg.arrival_airport),
                        departure_time=leg.departure_datetime.isoformat() if leg.departure_datetime else "",
                        arrival_time=leg.arrival_datetime.isoformat() if leg.arrival_datetime else "",
                        duration_minutes=leg.duration or 0,
                    )
                )

        total_price = sum(f.price for f in flights if f.price)
        total_duration = sum(f.duration for f in flights if f.duration)
        total_stops = sum(f.stops for f in flights if f.stops is not None)

        output.append(
            FlightResultResponse(
                price=total_price,
                currency=first.currency or "USD",
                duration_minutes=total_duration,
                stops=total_stops,
                legs=legs,
                booking_url=build_google_flights_url(
                    req.origin.upper(),
                    req.destination.upper(),
                    req.departure_date,
                    req.return_date,
                ),
            )
        )

    return output


def search_dates(req: DateSearchRequest) -> list[DatePriceResponse]:
    origin = Airport[req.origin.upper()]
    destination = Airport[req.destination.upper()]

    is_round_trip = req.trip_type == "round_trip"

    segments = [
        FlightSegment(
            departure_airport=[[origin, 0]],
            arrival_airport=[[destination, 0]],
            travel_date=req.from_date,
        )
    ]

    # Round trip requires two segments
    if is_round_trip:
        segments.append(
            FlightSegment(
                departure_airport=[[destination, 0]],
                arrival_airport=[[origin, 0]],
                travel_date=req.to_date,
            )
        )

    filters = DateSearchFilters(
        trip_type=TripType.ROUND_TRIP if is_round_trip else TripType.ONE_WAY,
        passenger_info=PassengerInfo(adults=1),
        flight_segments=segments,
        seat_type=CABIN_MAP.get(req.cabin_class, SeatType.ECONOMY),
        stops=STOPS_MAP.get(req.max_stops, MaxStops.ANY),
        from_date=req.from_date,
        to_date=req.to_date,
        duration=req.duration if is_round_trip else None,
    )

    searcher = SearchDates()
    results = searcher.search(filters)

    if not results:
        return []

    output = []
    for dp in results:
        dates = dp.date
        depart_date = dates[0].strftime("%Y-%m-%d") if dates else ""
        ret_date = dates[1].strftime("%Y-%m-%d") if len(dates) > 1 else None

        output.append(
            DatePriceResponse(
                date=depart_date,
                return_date=ret_date,
                price=dp.price,
                currency=dp.currency or "USD",
            )
        )

    return output
