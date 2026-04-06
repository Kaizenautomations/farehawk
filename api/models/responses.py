from pydantic import BaseModel


class FlightLegResponse(BaseModel):
    airline: str
    airline_code: str
    flight_number: str
    departure_airport: str
    arrival_airport: str
    departure_time: str
    arrival_time: str
    duration_minutes: int


class FlightResultResponse(BaseModel):
    price: float
    currency: str
    duration_minutes: int
    stops: int
    legs: list[FlightLegResponse]
    booking_url: str


class DatePriceResponse(BaseModel):
    date: str
    return_date: str | None = None
    price: float
    currency: str


class ExploreDestination(BaseModel):
    destination_code: str
    city: str
    country: str
    cheapest_price: float
    cheapest_date: str
    currency: str


class ExploreAnywhereResponse(BaseModel):
    origin: str
    from_date: str
    to_date: str
    destinations: list[ExploreDestination]
    total_searched: int


class NearbyComparison(BaseModel):
    origin_code: str
    price: float
    currency: str
    drive_time_minutes: int
    is_home_airport: bool
    savings: float


class NearbyCompareResponse(BaseModel):
    destination: str
    departure_date: str
    return_date: str | None = None
    comparisons: list[NearbyComparison]
