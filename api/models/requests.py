from pydantic import BaseModel


class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: str | None = None
    cabin_class: str = "economy"
    max_stops: int | None = None
    adults: int = 1
    sort_by: str = "cheapest"
    top_n: int = 10


class DateSearchRequest(BaseModel):
    origin: str
    destination: str
    from_date: str
    to_date: str
    cabin_class: str = "economy"
    max_stops: int | None = None
    trip_type: str = "one_way"
    duration: int | None = None


class ExploreAnywhereRequest(BaseModel):
    origin: str
    from_date: str
    to_date: str
    max_budget: float | None = None
    cabin_class: str = "economy"
    max_stops: int | None = None
    trip_type: str = "one_way"
    duration: int | None = None


class NearbyCompareRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: str | None = None
    cabin_class: str = "economy"
    max_stops: int | None = None


class DealScoreRequest(BaseModel):
    flights: list[dict]  # each dict: { price, origin, destination, departure_date }


class WeekendGetawayRequest(BaseModel):
    origin: str
    max_budget: float | None = None
    weeks_ahead: int = 8
    cabin_class: str = "economy"
