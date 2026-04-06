"""Curated destination mappings for Explore Anywhere searches."""

# Airports grouped by same-city / same-metro to avoid self-search
CITY_GROUPS = {
    "YYZ": {"YTZ"},
    "YTZ": {"YYZ"},
    "JFK": {"EWR", "LGA"},
    "EWR": {"JFK", "LGA"},
    "LGA": {"JFK", "EWR"},
    "LAX": {"BUR", "SNA", "ONT", "LGB"},
    "BUR": {"LAX", "SNA", "ONT", "LGB"},
    "SNA": {"LAX", "BUR", "ONT", "LGB"},
    "ONT": {"LAX", "BUR", "SNA", "LGB"},
    "SFO": {"OAK", "SJC"},
    "OAK": {"SFO", "SJC"},
    "SJC": {"SFO", "OAK"},
    "DCA": {"IAD", "BWI"},
    "IAD": {"DCA", "BWI"},
    "BWI": {"DCA", "IAD"},
    "ORD": {"MDW"},
    "MDW": {"ORD"},
    "DFW": {"DAL"},
    "DAL": {"DFW"},
    "MIA": {"FLL"},
    "FLL": {"MIA"},
    "NRT": {"HND"},
    "HND": {"NRT"},
}

# Region pools
US_MAJOR = [
    "LAX", "SFO", "JFK", "MIA", "LAS", "SEA", "DEN", "ORD",
    "ATL", "BOS", "HNL", "DFW", "IAD", "MSP", "PHX", "MCO",
]

CANADA_MAJOR = ["YVR", "YYC", "YYZ", "YUL", "YOW", "YEG", "YWG", "YHZ"]

MEXICO_CARIBBEAN = ["CUN", "PVR", "SJD", "MEX", "PUJ", "MBJ", "NAS", "AUA"]

EUROPE = ["LHR", "CDG", "AMS", "FRA", "BCN", "FCO", "LIS", "DUB", "ZRH", "CPH"]

ASIA_PACIFIC = ["NRT", "HKG", "BKK", "SIN", "ICN", "TPE", "MNL"]

SOUTH_AMERICA = ["GRU", "BOG", "LIM", "SCL"]

# Canadian origin codes (all Y-prefixed IATA codes we know about)
CANADIAN_ORIGINS = {
    "YVR", "YYC", "YEG", "YYZ", "YUL", "YOW", "YWG", "YHZ",
    "YQR", "YXE", "YQB", "YYJ", "YLW", "YXX", "YTZ",
}

# US origin codes (non-exhaustive, covers major hubs)
US_ORIGINS = {
    "LAX", "SFO", "JFK", "EWR", "LGA", "MIA", "FLL", "LAS", "SEA",
    "DEN", "ORD", "MDW", "ATL", "BOS", "HNL", "DFW", "DAL", "IAD",
    "DCA", "BWI", "MSP", "PHX", "MCO", "SNA", "BUR", "ONT", "OAK",
    "SJC", "PVD", "MHT", "TUS", "COS", "BUF",
}


def get_destinations_for(origin_code: str) -> list[str]:
    """Return a curated list of ~30-40 destination codes for the given origin."""
    origin = origin_code.upper()
    same_city = CITY_GROUPS.get(origin, set())

    if origin in CANADIAN_ORIGINS:
        pool = US_MAJOR + MEXICO_CARIBBEAN + EUROPE + ASIA_PACIFIC
    elif origin in US_ORIGINS:
        pool = CANADA_MAJOR + US_MAJOR + MEXICO_CARIBBEAN + EUROPE + ASIA_PACIFIC
    else:
        # Global fallback
        pool = (
            US_MAJOR + CANADA_MAJOR + MEXICO_CARIBBEAN
            + EUROPE + ASIA_PACIFIC + SOUTH_AMERICA
        )

    # Exclude origin itself and same-city airports
    destinations = [
        code for code in pool
        if code != origin and code not in same_city
    ]

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for code in destinations:
        if code not in seen:
            seen.add(code)
            unique.append(code)

    return unique
