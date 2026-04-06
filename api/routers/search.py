from fastapi import APIRouter, HTTPException
from models.requests import FlightSearchRequest, DateSearchRequest
from models.responses import FlightResultResponse, DatePriceResponse
from services.flight_search import search_flights, search_dates

router = APIRouter()


@router.post("/flights", response_model=list[FlightResultResponse])
async def search_flights_endpoint(req: FlightSearchRequest):
    try:
        return search_flights(req)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid airport code: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dates", response_model=list[DatePriceResponse])
async def search_dates_endpoint(req: DateSearchRequest):
    try:
        return search_dates(req)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Invalid airport code: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
