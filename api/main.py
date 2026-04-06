import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import search, health

app = FastAPI(title="FareHawk API", version="0.1.0")

API_SECRET_KEY = os.environ.get("API_SECRET_KEY", "dev-secret")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    if request.url.path == "/health":
        return await call_next(request)
    api_key = request.headers.get("X-API-Key")
    if api_key != API_SECRET_KEY:
        return JSONResponse(status_code=401, content={"error": "Unauthorized"})
    return await call_next(request)


app.include_router(health.router)
app.include_router(search.router, prefix="/search")
