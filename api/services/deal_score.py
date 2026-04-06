"""Deal scoring — rate flight deals 1-10 based on route type and price."""

from services.explore import CITY_NAMES

# Country code lookup from CITY_NAMES
AIRPORT_COUNTRIES: dict[str, str] = {code: info[1] for code, info in CITY_NAMES.items()}

# Additional airports not in CITY_NAMES
AIRPORT_COUNTRIES.update({
    "EWR": "US", "LGA": "US", "BUR": "US", "SNA": "US", "ONT": "US",
    "LGB": "US", "OAK": "US", "SJC": "US", "DCA": "US", "BWI": "US",
    "MDW": "US", "DAL": "US", "FLL": "US", "HND": "JP", "PVD": "US",
    "MHT": "US", "TUS": "US", "COS": "US", "BUF": "US", "SLC": "US",
    "PDX": "US", "SJU": "US", "YTZ": "CA", "YQR": "CA", "YXE": "CA",
    "YQB": "CA", "YYJ": "CA", "YLW": "CA", "YXX": "CA", "NAS": "BS",
})

# Nearby international: US<->CA, US/CA<->MX, US/CA<->Caribbean
NEARBY_COUNTRIES = {"US", "CA"}
CARIBBEAN_MEXICO = {"MX", "DO", "JM", "BS", "AW", "PR", "CU", "TT", "BB", "KY"}

# Long-haul regions
LONG_HAUL_COUNTRIES = {
    "GB", "FR", "NL", "DE", "ES", "IT", "PT", "IE", "CH", "DK",  # Europe
    "JP", "HK", "TH", "SG", "KR", "TW", "PH", "CN", "IN", "AU", "NZ",  # Asia-Pacific
    "BR", "CO", "PE", "CL", "AR",  # South America
}

# Price thresholds: (amazing, great, fair, average) — anything above average = expensive
ROUTE_THRESHOLDS = {
    "domestic_short": (100, 150, 200, 300),
    "domestic_long": (150, 250, 350, 500),
    "international_short": (200, 300, 400, 600),
    "international_long": (400, 600, 800, 1200),
}

# Typical price ranges for insight text
ROUTE_TYPICAL_RANGES = {
    "domestic_short": (100, 250),
    "domestic_long": (200, 500),
    "international_short": (250, 600),
    "international_long": (500, 1500),
}

SCORE_LABELS = {
    10: "Amazing Deal",
    9: "Amazing Deal",
    8: "Great Price",
    7: "Great Price",
    6: "Fair Price",
    5: "Fair Price",
    4: "Average",
    3: "Average",
    2: "Expensive",
    1: "Expensive",
}


def _classify_route(origin: str, destination: str) -> str:
    """Classify a route into one of four categories."""
    origin_country = AIRPORT_COUNTRIES.get(origin.upper(), "")
    dest_country = AIRPORT_COUNTRIES.get(destination.upper(), "")

    # Same country = domestic
    if origin_country and dest_country and origin_country == dest_country:
        # US/CA domestic — use simple heuristic for short vs long
        # Short-haul: regional routes within same general area
        # We use a simple approach: certain pairs are known short-haul
        short_haul_pairs = _is_short_haul_domestic(origin.upper(), destination.upper())
        return "domestic_short" if short_haul_pairs else "domestic_long"

    # Cross-border nearby: US<->CA, or US/CA <-> Mexico/Caribbean
    both_nearby = (
        origin_country in NEARBY_COUNTRIES and dest_country in NEARBY_COUNTRIES
    )
    one_caribbean = (
        (origin_country in NEARBY_COUNTRIES and dest_country in CARIBBEAN_MEXICO)
        or (dest_country in NEARBY_COUNTRIES and origin_country in CARIBBEAN_MEXICO)
    )
    if both_nearby or one_caribbean:
        return "international_short"

    # Everything else = long-haul international
    return "international_long"


def _is_short_haul_domestic(origin: str, dest: str) -> bool:
    """Heuristic: is this a short-haul domestic route (<~1000mi)?"""
    # Group airports by rough geographic region
    WEST = {"LAX", "SFO", "SJC", "OAK", "BUR", "SNA", "ONT", "LGB", "LAS", "PHX",
            "SEA", "PDX", "SLC", "TUS", "COS"}
    MIDWEST = {"ORD", "MDW", "MSP", "DEN", "DFW", "DAL"}
    EAST = {"JFK", "EWR", "LGA", "BOS", "PVD", "MHT", "IAD", "DCA", "BWI", "BUF",
            "ATL", "MIA", "FLL", "MCO"}
    HAWAII = {"HNL"}
    WEST_CANADA = {"YVR", "YYC", "YEG", "YLW", "YXX", "YYJ"}
    EAST_CANADA = {"YYZ", "YTZ", "YUL", "YOW", "YHZ", "YQB"}
    CENTRAL_CANADA = {"YWG", "YQR", "YXE"}

    # Same region = short-haul
    for region in [WEST, MIDWEST, EAST, HAWAII, WEST_CANADA, EAST_CANADA, CENTRAL_CANADA]:
        if origin in region and dest in region:
            return True
    return False


def _compute_score(price: float, route_type: str) -> int:
    """Return score 1-10 based on price and route type."""
    thresholds = ROUTE_THRESHOLDS.get(route_type, ROUTE_THRESHOLDS["international_long"])
    amazing, great, fair, average = thresholds

    if price <= amazing:
        return 10
    elif price <= great:
        return 8
    elif price <= fair:
        return 6
    elif price <= average:
        return 4
    else:
        return 2


def score_flight(price: float, origin: str, destination: str, departure_date: str) -> dict:
    """
    Score a flight deal 1-10 based on route distance and price.
    Returns { score: int, label: str, insight: str }
    """
    origin = origin.upper()
    destination = destination.upper()
    route_type = _classify_route(origin, destination)
    score = _compute_score(price, route_type)
    label = SCORE_LABELS.get(score, "Average")

    # Build insight text
    origin_city = CITY_NAMES.get(origin, (origin, ""))[0]
    dest_city = CITY_NAMES.get(destination, (destination, ""))[0]
    typical_low, typical_high = ROUTE_TYPICAL_RANGES.get(
        route_type, ROUTE_TYPICAL_RANGES["international_long"]
    )

    price_str = f"${price:,.0f}"
    insight = (
        f"This {origin}\u2192{destination} flight at {price_str} is "
        f"{'an' if label.startswith(('A', 'E')) else 'a'} {label.lower()}. "
        f"Prices for this route typically range ${typical_low:,}-${typical_high:,}."
    )

    return {
        "score": score,
        "label": label,
        "insight": insight,
    }
