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

ALLOWED_ORIGINS = [
    "https://drift-analyer.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# ─────────────────────────────────────────
# CORS
# Allow frontend (React) to call the backend
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    # Origin values must be exact and should not include a trailing slash.
    allow_origins=ALLOWED_ORIGINS,
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