from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from router import router

app = FastAPI(
    title="Drift Analyzer",
    description=(
        "A human-directed drift detection prototype. "
        "Detects and explains drift between Strategy and Implementation outputs."
    ),
    version="1.0.0"
)

# ─────────────────────────────────────────
# CORS
# Allow frontend (React) to call the backend
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten this after deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ─────────────────────────────────────────
# INCLUDE ROUTER
# ─────────────────────────────────────────

app.include_router(router)


# ─────────────────────────────────────────
# RUN
# ─────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)