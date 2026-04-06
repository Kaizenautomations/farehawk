"""Compare prices from nearby airports for the same destination."""

from concurrent.futures import ThreadPoolExecutor, as_completed

from fli.models import (
    Airport,
    FlightSearchFilters,
    FlightSegment,
    PassengerInfo,
    SeatType,
    MaxStops,
    SortBy,
    TripType,
)
from fli.search import SearchFlights

from models.requests import NearbyCompareRequest
from services.nearby_airports import get_nearby
from services.flight_search import CABIN_MAP, STOPS_MAP


def _search_origin_to_dest(
    origin_code: str,
    dest_code: str,
    departure_date: str,
    return_date: str | None,
    cabin_class: str,
    max_stops: int | None,
) -> dict | None:
    """Search cheapest flight from a single origin to destination. Returns dict or None."""
    try:
        origin = Airport[origin_code.upper()]
        destination = Airport[dest_code.upper()]
    except KeyError:
        return None

    segments = [
        FlightSegment(
            departure_airport=[[origin, 0]],
            arrival_airport=[[destination, 0]],
            travel_date=departure_date,
        )
    ]

    trip_type = TripType.ONE_WAY
    if return_date:
        trip_type = TripType.ROUND_TRIP
        segments.append(
            FlightSegment(
                departure_airport=[[destination, 0]],
                arrival_airport=[[origin, 0]],
                travel_date=return_date,
            )
        )

    filters = FlightSearchFilters(
        trip_type=trip_type,
        passenger_info=PassengerInfo(adults=1),
        flight_segments=segments,
        seat_type=CABIN_MAP.get(cabin_class, SeatType.ECONOMY),
        stops=STOPS_MAP.get(max_stops, MaxStops.ANY),
        sort_by=SortBy.CHEAPEST,
    )

    try:
        searcher = SearchFlights()
        results = searcher.search(filters, top_n=1)
    except Exception:
        return None

    if not results:
        return None

    first = results[0]
    # Handle both single FlightResult and tuples (round trip)
    flights = first if isinstance(first, tuple) else (first,)
    total_price = sum(f.price for f in flights if f.price)
    currency = flights[0].currency or "USD"

    return {
        "origin_code": origin_code,
        "price": total_price,
        "currency": currency,
    }


def compare_nearby(req: NearbyCompareRequest) -> dict:
    """Compare prices from the user's origin and all nearby airports to the same destination."""
    nearby = get_nearby(req.origin)
    all_origins = [req.origin.upper()] + [code for code, _ in nearby]
    drive_times = {req.origin.upper(): 0}
    drive_times.update({code: minutes for code, minutes in nearby})

    results: list[dict] = []

    with ThreadPoolExecutor(max_workers=max(len(all_origins), 1)) as executor:
        futures = {
            executor.submit(
                _search_origin_to_dest,
                origin,
                req.destination,
                req.departure_date,
                req.return_date,
                req.cabin_class,
                req.max_stops,
            ): origin
            for origin in all_origins
        }

        for future in as_completed(futures):
            result = future.result()
            if result is not None:
                origin = result["origin_code"]
                result["drive_time_minutes"] = drive_times.get(origin, 0)
                result["is_home_airport"] = origin == req.origin.upper()
                results.append(result)

    # Sort by price ascending
    results.sort(key=lambda r: r["price"])

    # Calculate savings relative to home airport
    home_price = None
    for r in results:
        if r["is_home_airport"]:
            home_price = r["price"]
            break

    for r in results:
        if home_price is not None and not r["is_home_airport"]:
            r["savings"] = round(home_price - r["price"], 2)
        else:
            r["savings"] = 0.0

    return {
        "destination": req.destination.upper(),
        "departure_date": req.departure_date,
        "return_date": req.return_date,
        "comparisons": results,
    }
