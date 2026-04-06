import asyncio
import time
from fastapi import APIRouter, HTTPException
from models.requests import NearbyCompareRequest
from models.responses import NearbyComparison, NearbyCompareResponse
from services.compare import compare_nearby

router = APIRouter()

MAX_RETRIES = 4
INITIAL_BACKOFF = 3


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
                wait = INITIAL_BACKOFF * (2 ** attempt)
                time.sleep(wait)
                continue
            raise
    raise last_error


@router.post("/nearby", response_model=NearbyCompareResponse)
async def compare_nearby_endpoint(req: NearbyCompareRequest):
    try:
        result = await asyncio.to_thread(retry_with_backoff, compare_nearby, req)
        comparisons = [
            NearbyComparison(
                origin_code=c["origin_code"],
                price=c["price"],
                currency=c["currency"],
                drive_time_minutes=c["drive_time_minutes"],
                is_home_airport=c["is_home_airport"],
                savings=c["savings"],
            )
            for c in result["comparisons"]
        ]
        return NearbyCompareResponse(
            destination=result["destination"],
            departure_date=result["departure_date"],
            return_date=result["return_date"],
            comparisons=comparisons,
        )
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid airport code: {e}")
    except Exception as e:
        error_str = str(e)
        if "429" in error_str:
            raise HTTPException(
                status_code=429,
                detail="Google Flights is temporarily rate limiting requests. Please wait a moment and try again.",
            )
        raise HTTPException(status_code=500, detail=error_str)
