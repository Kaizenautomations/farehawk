"""Weekend getaway search — find cheap Friday-Sunday trips."""

import time
from datetime import date, timedelta
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

from services.flight_search import CABIN_MAP, STOPS_MAP
from services.explore import CITY_NAMES
from services.deal_score import score_flight

# Curated weekend destination lists by origin region
WEEKEND_DESTINATIONS_CANADA = [
    "LAS", "LAX", "SFO", "SEA", "PHX", "CUN", "PVR", "SJD",
    "MIA", "FLL", "MCO", "HNL", "JFK", "ORD", "DEN",
]

WEEKEND_DESTINATIONS_US_EAST = [
    "MIA", "FLL", "CUN", "NAS", "SJU", "BOS", "ORD", "ATL",
    "LAS", "MCO",
]

WEEKEND_DESTINATIONS_US_WEST = [
    "LAS", "PHX", "SFO", "LAX", "SEA", "HNL", "CUN", "PDX",
    "SLC", "DEN",
]

# Origin region mapping
from services.destinations import CANADIAN_ORIGINS, US_ORIGINS

US_EAST_ORIGINS = {
    "JFK", "EWR", "LGA", "BOS", "PVD", "MHT", "IAD", "DCA", "BWI",
    "BUF", "ATL", "MIA", "FLL", "MCO",
}

BATCH_SIZE = 5
BATCH_DELAY = 0.3


def _get_upcoming_fridays(weeks_ahead: int) -> list[tuple[str, str]]:
    """Return list of (friday_date, sunday_date) strings for upcoming weekends."""
    today = date.today()
    # Find next Friday
    days_until_friday = (4 - today.weekday()) % 7
    if days_until_friday == 0 and today.weekday() == 4:
        # Today is Friday — include this weekend only if it's still morning-ish
        next_friday = today
    else:
        next_friday = today + timedelta(days=days_until_friday if days_until_friday > 0 else 7)

    weekends = []
    for i in range(weeks_ahead):
        friday = next_friday + timedelta(weeks=i)
        sunday = friday + timedelta(days=2)
        weekends.append((friday.strftime("%Y-%m-%d"), sunday.strftime("%Y-%m-%d")))

    return weekends


def _get_weekend_destinations(origin: str) -> list[str]:
    """Get curated weekend destination list based on origin region."""
    origin = origin.upper()
    if origin in CANADIAN_ORIGINS:
        pool = WEEKEND_DESTINATIONS_CANADA
    elif origin in US_EAST_ORIGINS:
        pool = WEEKEND_DESTINATIONS_US_EAST
    else:
        pool = WEEKEND_DESTINATIONS_US_WEST

    # Exclude origin from destinations
    return [d for d in pool if d != origin]


def _search_weekend_flight(
    origin_code: str,
    dest_code: str,
    friday: str,
    sunday: str,
    cabin_class: str,
) -> dict | None:
    """Search a single round-trip weekend flight. Returns result dict or None."""
    try:
        origin = Airport[origin_code.upper()]
        destination = Airport[dest_code.upper()]
    except KeyError:
        return None

    segments = [
        FlightSegment(
            departure_airport=[[origin, 0]],
            arrival_airport=[[destination, 0]],
            travel_date=friday,
        ),
        FlightSegment(
            departure_airport=[[destination, 0]],
            arrival_airport=[[origin, 0]],
            travel_date=sunday,
        ),
    ]

    filters = FlightSearchFilters(
        trip_type=TripType.ROUND_TRIP,
        passenger_info=PassengerInfo(adults=1),
        flight_segments=segments,
        seat_type=CABIN_MAP.get(cabin_class, SeatType.ECONOMY),
        stops=MaxStops.ANY,
        sort_by=SortBy.CHEAPEST,
    )

    try:
        searcher = SearchFlights()
        results = searcher.search(filters, top_n=1)
    except Exception:
        return None

    if not results:
        return None

    result = results[0]
    # Handle both single FlightResult and tuples (round trip)
    flights = result if isinstance(result, tuple) else (result,)
    total_price = sum(f.price for f in flights if f.price)
    currency = flights[0].currency or "USD"

    city, country = CITY_NAMES.get(dest_code, (dest_code, ""))

    deal = score_flight(total_price, origin_code, dest_code, friday)

    return {
        "destination_code": dest_code,
        "destination_city": city,
        "destination_country": country,
        "departure_date": friday,
        "return_date": sunday,
        "price": total_price,
        "currency": currency,
        "deal_score": deal["score"],
        "deal_label": deal["label"],
    }


def find_weekend_getaways(
    origin: str,
    destinations: list[str] | None = None,
    weeks_ahead: int = 8,
    max_budget: float | None = None,
    cabin_class: str = "economy",
) -> list[dict]:
    """
    For each upcoming Friday-Sunday in the next N weeks,
    search round-trip prices from origin to each destination.
    Returns list sorted by price.
    """
    origin = origin.upper()
    if destinations is None:
        destinations = _get_weekend_destinations(origin)

    weekends = _get_upcoming_fridays(weeks_ahead)
    results: list[dict] = []

    # Build all (destination, weekend) pairs
    search_pairs = [
        (dest, friday, sunday)
        for friday, sunday in weekends
        for dest in destinations
    ]

    # Process in batches
    for batch_start in range(0, len(search_pairs), BATCH_SIZE):
        batch = search_pairs[batch_start : batch_start + BATCH_SIZE]

        if batch_start > 0:
            time.sleep(BATCH_DELAY)

        with ThreadPoolExecutor(max_workers=BATCH_SIZE) as executor:
            futures = {
                executor.submit(
                    _search_weekend_flight,
                    origin,
                    dest,
                    friday,
                    sunday,
                    cabin_class,
                ): (dest, friday)
                for dest, friday, sunday in batch
            }

            for future in as_completed(futures):
                try:
                    result = future.result()
                    if result is not None:
                        results.append(result)
                except Exception:
                    # Skip failed searches
                    continue

    # Sort by price ascending
    results.sort(key=lambda r: r["price"])

    # Filter by budget if provided
    if max_budget is not None:
        results = [r for r in results if r["price"] <= max_budget]

    return results
