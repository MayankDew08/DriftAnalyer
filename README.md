# Drift Analyzer Prototype (UtenaOS)

A human-directed reliability prototype that checks whether an Implementation output drifts from a Strategy output.

## Live Deployment

- Frontend: https://drift-analyer.vercel.app/
- Backend: https://driftanalyer.onrender.com/

## What This Project Does

The system compares two labeled text blocks:
- Strategy: intent, scope, priorities, constraints
- Implementation: content and explanation

The backend analyzes these against exactly five categories:
1. Scope Violation
2. Constraint Violation
3. Priority Misalignment
4. Intent Drift
5. Internal Inconsistency

It returns:
- structured category-level findings
- overall drift score (0.0 to 1.0)
- suggested routing
- human-readable summary

Humans then confirm or correct the analysis, and feedback is logged for review.

## Architecture

- `backend/`: FastAPI API, parsing, drift engine, storage, Docker runtime
- `frontend/`: React + Vite dashboard for analysis, feedback, history, charts

## LLM Decision Transparency

The LLM is used as a constrained reasoning component, not as an autonomous decision-maker.

- The decision structure is fixed by code and schema.
- The prompt enforces five predefined categories.
- The response is validated before scoring/routing.
- The model can still be wrong or overly lenient/strict on edge cases.
- Human feedback is the final control layer and should be treated as authoritative for quality monitoring.

In short: this prototype is human-directed. The LLM supports drift classification, but operational trust is based on human review.

## Current API (Implemented)

Backend base URL (local): `http://localhost:8000`

- `POST /analyze`
- `POST /feedback`
- `GET /history`
- `GET /feedback/disagreements`
- `GET /health`

Note: `/translate` is not currently implemented in the backend code.

## Quick Start (Local)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api/*` to backend `http://localhost:8000`.

## Quick Start (Backend Docker)

The backend container definition uses the standard `Dockerfile` name:

```bash
cd backend
docker build -t drift-analyzer .
docker run --env-file .env -p 8000:8000 drift-analyzer
```

## Repository Notes

- `backend/feedback_log.json` stores analysis and human feedback history.
- Keep `.env` and sensitive data out of version control.
- Tighten CORS allowlist before production deployment.
