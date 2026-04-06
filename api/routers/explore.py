import asyncio
import time
from fastapi import APIRouter, HTTPException
from models.requests import ExploreAnywhereRequest
from models.responses import ExploreDestination, ExploreAnywhereResponse
from services.explore import search_anywhere

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


@router.post("/anywhere", response_model=ExploreAnywhereResponse)
async def explore_anywhere(req: ExploreAnywhereRequest):
    try:
        results = await asyncio.to_thread(retry_with_backoff, search_anywhere, req)
        destinations = [
            ExploreDestination(
                destination_code=r["destination_code"],
                city=r["city"],
                country=r["country"],
                cheapest_price=r["cheapest_price"],
                cheapest_date=r["cheapest_date"],
                currency=r["currency"],
            )
            for r in results
        ]
        return ExploreAnywhereResponse(
            origin=req.origin.upper(),
            from_date=req.from_date,
            to_date=req.to_date,
            destinations=destinations,
            total_searched=len(destinations),
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
