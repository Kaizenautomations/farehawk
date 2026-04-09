import time
import logging
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

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
from models.requests import FlightSearchRequest, DateSearchRequest, MultiCitySearchRequest, DateMatrixRequest
from models.responses import FlightResultResponse, FlightLegResponse, DatePriceResponse, DateMatrixCell, DateMatrixResponse

logger = logging.getLogger(__name__)


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

        # For round-trip tuples, fli returns the total round-trip price on each element.
        # Use the first element's price (the total), don't sum them (that would double it).
        if isinstance(result, tuple) and len(flights) > 1:
            total_price = first.price or 0
        else:
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


def search_multi_city(req: MultiCitySearchRequest) -> list[list[FlightResultResponse]]:
    """Search each segment independently and return grouped results."""
    all_results = []
    for seg in req.segments:
        single_req = FlightSearchRequest(
            origin=seg.origin,
            destination=seg.destination,
            departure_date=seg.date,
            cabin_class=req.cabin_class,
            max_stops=req.max_stops,
            adults=req.adults,
            top_n=req.top_n,
        )
        results = search_flights(single_req)
        all_results.append(results)
    return all_results


def search_date_matrix(req: DateMatrixRequest) -> DateMatrixResponse:
    """Search a matrix of departure x return dates and return cheapest price per cell."""
    dep_start = datetime.strptime(req.departure_from, "%Y-%m-%d")
    dep_end = datetime.strptime(req.departure_to, "%Y-%m-%d")
    ret_start = datetime.strptime(req.return_from, "%Y-%m-%d")
    ret_end = datetime.strptime(req.return_to, "%Y-%m-%d")

    # Limit departure dates to max 7
    dep_dates: list[str] = []
    current = dep_start
    while current <= dep_end and len(dep_dates) < 7:
        dep_dates.append(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)

    # Build return dates list
    ret_dates: list[str] = []
    current = ret_start
    while current <= ret_end and len(ret_dates) < 7:
        ret_dates.append(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)

    cells: list[DateMatrixCell] = []

    def search_single_dep(dep_date: str) -> list[DateMatrixCell]:
        """Search round-trip date prices for a single departure date across the return window."""
        try:
            date_req = DateSearchRequest(
                origin=req.origin,
                destination=req.destination,
                from_date=dep_date,
                to_date=dep_date,
                cabin_class=req.cabin_class,
                max_stops=req.max_stops,
                trip_type="round_trip",
                duration=None,
            )
            results = search_dates(date_req)
            found: list[DateMatrixCell] = []
            for dp in results:
                if dp.return_date and dp.return_date in ret_dates:
                    found.append(
                        DateMatrixCell(
                            departure_date=dp.date,
                            return_date=dp.return_date,
                            price=dp.price,
                            currency=dp.currency,
                        )
                    )
            return found
        except Exception as e:
            logger.warning(f"Date matrix search failed for {dep_date}: {e}")
            return []

    # Use ThreadPoolExecutor with max 3 workers and stagger requests
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {}
        for i, dep_date in enumerate(dep_dates):
            if i > 0 and i % 3 == 0:
                time.sleep(0.3)  # 300ms delay between batches
            futures[executor.submit(search_single_dep, dep_date)] = dep_date

        for future in as_completed(futures):
            try:
                result = future.result()
                cells.extend(result)
            except Exception as e:
                logger.warning(f"Date matrix future failed: {e}")

    return DateMatrixResponse(
        origin=req.origin.upper(),
        destination=req.destination.upper(),
        cells=cells,
    )


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
