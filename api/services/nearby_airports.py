"""Static mapping of airports to nearby alternatives with drive times."""

# Maps airport code -> list of (nearby_code, drive_time_minutes)
NEARBY_AIRPORTS: dict[str, list[tuple[str, int]]] = {
    "YEG": [("YYC", 180)],
    "YYC": [("YEG", 180)],
    "YVR": [("SEA", 180), ("BLI", 150)],
    "YYZ": [("BUF", 120), ("YHM", 60)],
    "YUL": [("YOW", 120)],
    "YOW": [("YUL", 120), ("YYZ", 270)],
    "JFK": [("EWR", 40), ("LGA", 30)],
    "EWR": [("JFK", 40), ("LGA", 30)],
    "LGA": [("JFK", 30), ("EWR", 40)],
    "SFO": [("OAK", 30), ("SJC", 45)],
    "LAX": [("BUR", 30), ("SNA", 45), ("ONT", 50)],
    "IAD": [("DCA", 45), ("BWI", 60)],
    "DCA": [("IAD", 45), ("BWI", 40)],
    "ORD": [("MDW", 40)],
    "DFW": [("DAL", 30)],
    "MIA": [("FLL", 40)],
    "BOS": [("PVD", 60), ("MHT", 60)],
    "SEA": [("YVR", 180)],
    "DEN": [("COS", 80)],
    "PHX": [("TUS", 100)],
}


def get_nearby(code: str) -> list[tuple[str, int]]:
    """Return list of (airport_code, drive_time_minutes) for nearby airports."""
    return NEARBY_AIRPORTS.get(code.upper(), [])
