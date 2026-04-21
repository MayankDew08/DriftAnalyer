# backend/router.py

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models import (
    AnalyzeRequest,
    DriftAnalysisResponse,
    FeedbackRequest,
    FeedbackResponse
)
from parser import parse_strategy, parse_implementation
from drift_engine import run_drift_analysis
from storage import append_analysis, append_feedback, get_all_entries, get_disagreements

router = APIRouter()


# ─────────────────────────────────────────
# POST /analyze
# ─────────────────────────────────────────

@router.post("/analyze", response_model=DriftAnalysisResponse)
def analyze(request: AnalyzeRequest):
    """
    Takes raw strategy and implementation text.
    Parses both, runs drift analysis, stores result, returns analysis.
    """

    # Step 1 — Parse raw inputs
    try:
        strategy = parse_strategy(request.strategy_raw)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse Strategy input: {str(e)}"
        )

    try:
        implementation = parse_implementation(request.implementation_raw)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse Implementation input: {str(e)}"
        )

    # Step 2 — Run drift analysis
    try:
        analysis = run_drift_analysis(strategy, implementation)
    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Drift engine error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during analysis: {str(e)}"
        )

    # Step 3 — Build storage entry
    entry_id = str(uuid.uuid4())

    entry = {
        "id": entry_id,
        "timestamp": datetime.utcnow().isoformat(),
        "strategy_raw": request.strategy_raw,
        "implementation_raw": request.implementation_raw,
        "parsed_strategy": {
            "intent": strategy.intent,
            "scope": strategy.scope,
            "priorities": strategy.priorities,
            "constraints": strategy.constraints
        },
        "analysis": analysis.model_dump(),
        "feedback": None
    }

    # Step 4 — Append to JSON log
    append_analysis(entry)

    # Step 5 — Return analysis with ID injected into summary
    # We attach the ID so the frontend can send it back with feedback
    analysis.human_readable_summary = (
        f"[Analysis ID: {entry_id}] " + analysis.human_readable_summary
    )

    return analysis


# ─────────────────────────────────────────
# POST /feedback
# ─────────────────────────────────────────

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(request: FeedbackRequest):
    """
    Human submits their verdict on the machine's analysis.
    Finds the original entry by analysis_id and attaches feedback to it.
    """

    feedback_data = {
        "human_verdict": request.human_verdict,
        "human_notes": request.human_notes,
        "disagreement_type": request.disagreement_type,
        "submitted_at": datetime.utcnow().isoformat()
    }

    found = append_feedback(request.analysis_id, feedback_data)

    if not found:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis ID '{request.analysis_id}' not found in log."
        )

    return FeedbackResponse(
        logged=True,
        message=f"Feedback recorded for analysis {request.analysis_id}."
    )


# ─────────────────────────────────────────
# GET /history
# ─────────────────────────────────────────

@router.get("/history")
def get_history():
    """
    Returns all stored analyses with their feedback (if any).
    Useful for reviewing past runs.
    """
    entries = get_all_entries()
    return {
        "total": len(entries),
        "entries": entries
    }


# ─────────────────────────────────────────
# GET /feedback/disagreements
# ─────────────────────────────────────────

@router.get("/feedback/disagreements")
def get_disagreement_cases():
    """
    Returns only cases where human said No or Partially.
    These are the cases where the machine was wrong.
    Phase 0 observation data for future improvement.
    """
    cases = get_disagreements()
    return {
        "total": len(cases),
        "disagreements": cases
    }


# ─────────────────────────────────────────
# GET /health
# ─────────────────────────────────────────

@router.get("/health")
def health_check():
    """
    Simple health check.
    """
    return {
        "status": "ok",
        "service": "drift-analyzer"
    }

