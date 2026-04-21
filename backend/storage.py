# backend/storage.py

import json
import os
from datetime import datetime

FEEDBACK_LOG_PATH = os.path.join(os.path.dirname(__file__), "feedback_log.json")


def _read_log() -> list:
    """
    Reads the full feedback log from JSON file.
    Returns empty list if file is empty or malformed.
    """
    try:
        with open(FEEDBACK_LOG_PATH, "r") as f:
            content = f.read().strip()
            if not content:
                return []
            return json.loads(content)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def _write_log(data: list) -> None:
    """
    Writes the full list back to JSON file.
    Pretty printed for human readability.
    """
    with open(FEEDBACK_LOG_PATH, "w") as f:
        json.dump(data, f, indent=2)


def append_analysis(entry: dict) -> None:
    """
    Appends a new analysis entry to the log.
    Called after every /analyze request.

    Entry structure:
    {
        "id": "...",
        "timestamp": "...",
        "strategy_raw": "...",
        "implementation_raw": "...",
        "analysis": { ...DriftAnalysisResponse... },
        "feedback": null       ← filled later when human submits feedback
    }
    """
    log = _read_log()
    log.append(entry)
    _write_log(log)


def append_feedback(analysis_id: str, feedback: dict) -> bool:
    """
    Finds an existing analysis entry by ID and attaches feedback to it.
    Returns True if found and updated, False if ID not found.
    """
    log = _read_log()

    for entry in log:
        if entry.get("id") == analysis_id:
            entry["feedback"] = feedback
            _write_log(log)
            return True

    return False


def get_all_entries() -> list:
    """
    Returns all entries in the log.
    Used by /history endpoint.
    """
    return _read_log()


def get_disagreements() -> list:
    """
    Returns only entries where human disagreed with the machine.
    Verdict is No or Partially = disagreement.
    """
    log = _read_log()
    return [
        entry for entry in log
        if entry.get("feedback") is not None
        and entry["feedback"].get("human_verdict") in ("No", "Partially")
    ]