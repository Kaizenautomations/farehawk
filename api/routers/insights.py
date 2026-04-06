"""Insights router — deal scoring and weekend getaway endpoints."""

import asyncio
import time
from fastapi import APIRouter, HTTPException

from models.requests import DealScoreRequest, WeekendGetawayRequest
from models.responses import FlightDealScore, WeekendGetaway, WeekendGetawayResponse
from services.deal_score import score_flight
from services.weekends import find_weekend_getaways

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


@router.post("/score", response_model=list[FlightDealScore])
async def score_deals(req: DealScoreRequest):
    """Score a list of flights and return deal ratings."""
    try:
        scores = []
        for flight in req.flights:
            price = flight.get("price", 0)
            origin = flight.get("origin", "")
            destination = flight.get("destination", "")
            departure_date = flight.get("departure_date", "")

            if not price or not origin or not destination:
                scores.append(FlightDealScore(
                    score=0,
                    label="Unknown",
                    insight="Insufficient data to score this flight.",
                ))
                continue

            result = score_flight(price, origin, destination, departure_date)
            scores.append(FlightDealScore(
                score=result["score"],
                label=result["label"],
                insight=result["insight"],
            ))

        return scores
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/weekends", response_model=WeekendGetawayResponse)
async def weekend_getaways(req: WeekendGetawayRequest):
    """Find cheap weekend getaways from an origin airport."""
    try:
        results = await asyncio.to_thread(
            retry_with_backoff,
            find_weekend_getaways,
            req.origin,
            None,  # destinations (use defaults)
            req.weeks_ahead,
            req.max_budget,
            req.cabin_class,
        )

        getaways = [
            WeekendGetaway(
                destination_code=r["destination_code"],
                destination_city=r["destination_city"],
                destination_country=r["destination_country"],
                departure_date=r["departure_date"],
                return_date=r["return_date"],
                price=r["price"],
                currency=r["currency"],
                deal_score=r["deal_score"],
                deal_label=r["deal_label"],
            )
            for r in results
        ]

        return WeekendGetawayResponse(
            origin=req.origin.upper(),
            getaways=getaways,
            weeks_searched=req.weeks_ahead,
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
