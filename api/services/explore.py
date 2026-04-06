"""Explore Anywhere — search many destinations in parallel and rank by price."""

import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from fli.models import (
    Airport,
    DateSearchFilters,
    FlightSegment,
    PassengerInfo,
    SeatType,
    MaxStops,
    TripType,
)
from fli.search import SearchDates

from models.requests import ExploreAnywhereRequest
from services.destinations import get_destinations_for
from services.flight_search import CABIN_MAP, STOPS_MAP

# City names for display (best-effort mapping)
CITY_NAMES: dict[str, tuple[str, str]] = {
    "LAX": ("Los Angeles", "US"),
    "SFO": ("San Francisco", "US"),
    "JFK": ("New York", "US"),
    "MIA": ("Miami", "US"),
    "LAS": ("Las Vegas", "US"),
    "SEA": ("Seattle", "US"),
    "DEN": ("Denver", "US"),
    "ORD": ("Chicago", "US"),
    "ATL": ("Atlanta", "US"),
    "BOS": ("Boston", "US"),
    "HNL": ("Honolulu", "US"),
    "DFW": ("Dallas", "US"),
    "IAD": ("Washington DC", "US"),
    "MSP": ("Minneapolis", "US"),
    "PHX": ("Phoenix", "US"),
    "MCO": ("Orlando", "US"),
    "CUN": ("Cancun", "MX"),
    "PVR": ("Puerto Vallarta", "MX"),
    "SJD": ("Los Cabos", "MX"),
    "MEX": ("Mexico City", "MX"),
    "PUJ": ("Punta Cana", "DO"),
    "MBJ": ("Montego Bay", "JM"),
    "NAS": ("Nassau", "BS"),
    "AUA": ("Aruba", "AW"),
    "LHR": ("London", "GB"),
    "CDG": ("Paris", "FR"),
    "AMS": ("Amsterdam", "NL"),
    "FRA": ("Frankfurt", "DE"),
    "BCN": ("Barcelona", "ES"),
    "FCO": ("Rome", "IT"),
    "LIS": ("Lisbon", "PT"),
    "DUB": ("Dublin", "IE"),
    "ZRH": ("Zurich", "CH"),
    "CPH": ("Copenhagen", "DK"),
    "NRT": ("Tokyo", "JP"),
    "HKG": ("Hong Kong", "HK"),
    "BKK": ("Bangkok", "TH"),
    "SIN": ("Singapore", "SG"),
    "ICN": ("Seoul", "KR"),
    "TPE": ("Taipei", "TW"),
    "MNL": ("Manila", "PH"),
    "GRU": ("Sao Paulo", "BR"),
    "BOG": ("Bogota", "CO"),
    "LIM": ("Lima", "PE"),
    "SCL": ("Santiago", "CL"),
    "YVR": ("Vancouver", "CA"),
    "YYC": ("Calgary", "CA"),
    "YEG": ("Edmonton", "CA"),
    "YYZ": ("Toronto", "CA"),
    "YUL": ("Montreal", "CA"),
    "YOW": ("Ottawa", "CA"),
    "YWG": ("Winnipeg", "CA"),
    "YHZ": ("Halifax", "CA"),
}

BATCH_SIZE = 5
BATCH_DELAY = 0.3  # 300ms between batches


def _search_single_destination(
    origin_code: str,
    dest_code: str,
    from_date: str,
    to_date: str,
    cabin_class: str,
    max_stops: int | None,
    trip_type: str,
    duration: int | None,
) -> dict | None:
    """Search dates for a single origin->destination pair. Returns result dict or None."""
    try:
        origin = Airport[origin_code.upper()]
        destination = Airport[dest_code.upper()]
    except KeyError:
        return None

    is_round_trip = trip_type == "round_trip"

    filters = DateSearchFilters(
        trip_type=TripType.ROUND_TRIP if is_round_trip else TripType.ONE_WAY,
        passenger_info=PassengerInfo(adults=1),
        flight_segments=[
            FlightSegment(
                departure_airport=[[origin, 0]],
                arrival_airport=[[destination, 0]],
                travel_date=from_date,
            )
        ],
        seat_type=CABIN_MAP.get(cabin_class, SeatType.ECONOMY),
        stops=STOPS_MAP.get(max_stops, MaxStops.ANY),
        from_date=from_date,
        to_date=to_date,
        duration=duration,
    )

    try:
        searcher = SearchDates()
        results = searcher.search(filters)
    except Exception:
        return None

    if not results:
        return None

    # Find cheapest result
    cheapest = min(results, key=lambda dp: dp.price)
    dates = cheapest.date
    depart_date = dates[0].strftime("%Y-%m-%d") if dates else from_date

    city, country = CITY_NAMES.get(dest_code, (dest_code, ""))

    return {
        "destination_code": dest_code,
        "city": city,
        "country": country,
        "cheapest_price": cheapest.price,
        "cheapest_date": depart_date,
        "currency": cheapest.currency or "USD",
    }


def search_anywhere(req: ExploreAnywhereRequest) -> list[dict]:
    """Search all curated destinations from an origin and return sorted by price."""
    destinations = get_destinations_for(req.origin)

    results: list[dict] = []

    # Process in batches of BATCH_SIZE with delay between batches
    for batch_start in range(0, len(destinations), BATCH_SIZE):
        batch = destinations[batch_start : batch_start + BATCH_SIZE]

        if batch_start > 0:
            time.sleep(BATCH_DELAY)

        with ThreadPoolExecutor(max_workers=BATCH_SIZE) as executor:
            futures = {
                executor.submit(
                    _search_single_destination,
                    req.origin,
                    dest,
                    req.from_date,
                    req.to_date,
                    req.cabin_class,
                    req.max_stops,
                    req.trip_type,
                    req.duration,
                ): dest
                for dest in batch
            }

            for future in as_completed(futures):
                result = future.result()
                if result is not None:
                    results.append(result)

    # Sort by price ascending
    results.sort(key=lambda r: r["cheapest_price"])

    # Filter by budget if provided
    if req.max_budget is not None:
        results = [r for r in results if r["cheapest_price"] <= req.max_budget]

    return results
