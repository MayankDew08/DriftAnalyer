# Backend README (FastAPI + Groq + Docker)

## Purpose

The backend parses Strategy and Implementation text, runs constrained drift analysis, validates structured output, computes a score, suggests routing, and logs human feedback.

## Live URL

- Backend: https://driftanalyer.onrender.com/

## Stack

- FastAPI
- Pydantic
- Groq Python SDK
- python-dotenv
- Uvicorn

## Files

- `main.py`: app setup, CORS, router registration
- `router.py`: API endpoints
- `parser.py`: raw text parsing
- `drift_engine.py`: prompt build, LLM call, validation, scoring, routing
- `drift_engine_prompt.txt`: constrained analysis instructions
- `storage.py`: JSON log read/write helpers
- `feedback_log.json`: local storage file
- `requirements.txt`: dependencies
- `Dockerfile`: container build definition

## LLM Decision Transparency

This backend does not delegate full decision authority to the LLM.

- Category taxonomy is fixed in code (five categories only).
- Output must match strict JSON structure and is schema-validated.
- Scoring and routing are deterministic code paths after validation.
- LLM output can still be imperfect and should be reviewed by humans.
- `/feedback` exists specifically to capture machine mistakes and disagreements.

## Environment

Create `backend/.env`:

```env
GROQ_API_KEY=your_key_here
```

## Run Locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Health:

```bash
curl http://localhost:8000/health
```

## Docker

This repository uses the standard `Dockerfile` name.

Build and run:

```bash
cd backend
docker build -t drift-analyzer-backend .
docker run --env-file .env -p 8000:8000 drift-analyzer-backend
```

## API Endpoints

- `POST /analyze`
  - Body: `strategy_raw`, `implementation_raw`
  - Returns structured drift analysis

- `POST /feedback`
  - Body: `analysis_id`, `human_verdict`, `human_notes`, optional `disagreement_type`
  - Attaches feedback to an existing analysis entry

- `GET /history`
  - Returns all entries

- `GET /feedback/disagreements`
  - Returns entries where verdict is `No` or `Partially`

- `GET /health`
  - Service health

## Notes

- If using Python 3.14, you may hit build/runtime incompatibilities with pinned packages.
- Python 3.12 is the recommended runtime for this repo.
- CORS is currently open (`*`) for development and should be restricted in production.
