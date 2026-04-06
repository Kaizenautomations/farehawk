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
