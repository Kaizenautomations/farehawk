import asyncio
import time
from fastapi import APIRouter, HTTPException
from models.requests import FlightSearchRequest, DateSearchRequest, MultiCitySearchRequest
from models.responses import FlightResultResponse, DatePriceResponse
from services.flight_search import search_flights, search_dates, search_multi_city

router = APIRouter()

MAX_RETRIES = 4
INITIAL_BACKOFF = 3  # seconds


def retry_with_backoff(fn, *args):
    """Retry a function with exponential backoff on 429/rate limit errors."""
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            return fn(*args)
        except Exception as e:
            error_str = str(e)
            last_error = e
            if "429" in error_str or "rate" in error_str.lower():
                wait = INITIAL_BACKOFF * (2 ** attempt)  # 3s, 6s, 12s, 24s
                time.sleep(wait)
                continue
            raise  # Non-rate-limit error, don't retry
    raise last_error


@router.post("/flights", response_model=list[FlightResultResponse])
async def search_flights_endpoint(req: FlightSearchRequest):
    try:
        return await asyncio.to_thread(retry_with_backoff, search_flights, req)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid airport code: {e}")
    except Exception as e:
        error_str = str(e)
        if "429" in error_str:
            raise HTTPException(
                status_code=429,
                detail="Google Flights is temporarily rate limiting requests. Please wait a moment and try again."
            )
        raise HTTPException(status_code=500, detail=error_str)


@router.post("/multi-city", response_model=list[list[FlightResultResponse]])
async def search_multi_city_endpoint(req: MultiCitySearchRequest):
    if len(req.segments) < 2 or len(req.segments) > 4:
        raise HTTPException(status_code=400, detail="Multi-city requires 2-4 segments")
    try:
        return await asyncio.to_thread(retry_with_backoff, search_multi_city, req)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid airport code: {e}")
    except Exception as e:
        error_str = str(e)
        if "429" in error_str:
            raise HTTPException(
                status_code=429,
                detail="Google Flights is temporarily rate limiting requests. Please wait a moment and try again."
            )
        raise HTTPException(status_code=500, detail=error_str)


@router.post("/dates", response_model=list[DatePriceResponse])
async def search_dates_endpoint(req: DateSearchRequest):
    try:
        return await asyncio.to_thread(retry_with_backoff, search_dates, req)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid airport code: {e}")
    except Exception as e:
        error_str = str(e)
        if "429" in error_str:
            raise HTTPException(
                status_code=429,
                detail="Google Flights is temporarily rate limiting requests. Please wait a moment and try again."
            )
        raise HTTPException(status_code=500, detail=error_str)
