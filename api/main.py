import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import search, health, explore, compare

app = FastAPI(title="FareHawk API", version="0.1.0")

API_SECRET_KEY = os.environ.get("API_SECRET_KEY", "dev-secret")

# Optional proxy support — set PROXY_URL env var to enable
# e.g. PROXY_URL=http://user:pass@proxy.brightdata.com:22225
PROXY_URL = os.environ.get("PROXY_URL", "")
if PROXY_URL:
    import fli.search.client as fli_client
    # Patch the fli library's session to use the proxy
    try:
        original_init = fli_client.FlightClient.__init__
        def patched_init(self, *args, **kwargs):
            original_init(self, *args, **kwargs)
            if hasattr(self, 'session'):
                self.session.proxies = {"https": PROXY_URL, "http": PROXY_URL}
        fli_client.FlightClient.__init__ = patched_init
        print(f"[FareHawk] Proxy enabled: {PROXY_URL.split('@')[-1] if '@' in PROXY_URL else 'configured'}")
    except Exception as e:
        print(f"[FareHawk] Proxy setup failed: {e}")
else:
    print("[FareHawk] No proxy configured (set PROXY_URL env var to enable)")

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
app.include_router(explore.router, prefix="/explore")
app.include_router(compare.router, prefix="/compare")
