from pydantic import BaseModel, Field
from typing import List
from enum import Enum


# ─────────────────────────────────────────
# ENUMS
# ─────────────────────────────────────────

class Severity(str, Enum):
    HIGH   = "High"
    MEDIUM = "Medium"
    LOW    = "Low"
    NONE   = "None"


class RoutingSuggestion(str, Enum):
    ACCEPT          = "Accept"
    REVISE_IMPL     = "Revise → Implementation"
    REVISE_STRATEGY = "Revise → Strategy"


class HumanVerdict(str, Enum):
    YES       = "Yes"
    NO        = "No"
    PARTIALLY = "Partially"


class DisagreementType(str, Enum):
    FALSE_POSITIVE = "False Positive"
    FALSE_NEGATIVE = "False Negative"
    WRONG_CATEGORY = "Wrong Category"


# ─────────────────────────────────────────
# RAW INPUT SCHEMAS
# These are what the user actually pastes
# ─────────────────────────────────────────

class RawStrategyInput(BaseModel):
    """
    User pastes the full strategy output as one block of text.
    The parser will extract intent, scope, priorities, constraints from it.

    Expected format (labels must be present):
    
    Intent: ...
    Scope: ...
    Priorities:
      1. ...
      2. ...
    Constraints:
      - ...
      - ...
    """
    raw_text: str = Field(
        ...,
        description="Full strategy output pasted as one text block.",
        example=(
            "Intent: Help the user decide which market to enter first.\n"
            "Scope: 2-week horizon only. No long-term forecasting.\n"
            "Priorities:\n"
            "  1. Identify top 3 markets\n"
            "  2. Estimate entry cost\n"
            "  3. Flag risks\n"
            "Constraints:\n"
            "  - Use only provided data\n"
            "  - No theoretical frameworks\n"
            "  - Be concise"
        )
    )


class RawImplementationInput(BaseModel):
    """
    User pastes the full implementation output as one block of text.
    The parser will extract content and explanation from it.

    Expected format (labels must be present):

    Content: ...
    Explanation: ...
    """
    raw_text: str = Field(
        ...,
        description="Full implementation output pasted as one text block.",
        example=(
            "Content: Here is a 5-year market entry roadmap across 7 regions...\n"
            "Explanation: I expanded the scope to provide a more complete picture."
        )
    )


class AnalyzeRequest(BaseModel):
    """
    The full request body for /analyze.
    Both inputs are raw text — parsing happens inside the backend.
    """
    strategy_raw: str = Field(
        ...,
        description="Raw strategy output text with labels."
    )
    implementation_raw: str = Field(
        ...,
        description="Raw implementation output text with labels."
    )


# ─────────────────────────────────────────
# PARSED INTERNAL SCHEMAS
# These are used inside the backend after parsing
# Never exposed directly to the user
# ─────────────────────────────────────────

class ParsedStrategy(BaseModel):
    """
    Result of parsing the raw strategy text.
    Used internally by the drift engine.
    """
    intent: str
    scope: str
    priorities: List[str]
    constraints: List[str]


class ParsedImplementation(BaseModel):
    """
    Result of parsing the raw implementation text.
    Used internally by the drift engine.
    """
    content: str
    explanation: str


# ─────────────────────────────────────────
# OUTPUT SCHEMAS
# ─────────────────────────────────────────

class DriftCategory(BaseModel):
    category: str
    detected: bool
    severity: Severity
    reason: str
    evidence: str


class DriftAnalysisResponse(BaseModel):
    drift_detected: bool
    overall_drift_score: float = Field(..., ge=0.0, le=1.0)
    drift_categories: List[DriftCategory]
    human_readable_summary: str
    suggested_routing: RoutingSuggestion


# ─────────────────────────────────────────
# FEEDBACK SCHEMAS
# ─────────────────────────────────────────

# Add this to models.py — replace the old FeedbackRequest

class FeedbackRequest(BaseModel):
    """
    Human submits verdict referencing the stored analysis by ID.
    The ID comes from the analysis response summary line.
    """
    analysis_id: str = Field(
        ...,
        description="The UUID returned in the analysis response. Links feedback to the right entry."
    )
    human_verdict: HumanVerdict = Field(
        ...,
        description="Human's overall judgment — Yes, No, or Partially."
    )
    human_notes: str = Field(
        default="",
        description="What the human thinks the machine missed or got wrong."
    )
    disagreement_type: DisagreementType | None = Field(
        default=None,
        description="Required if verdict is No or Partially."
    )

class FeedbackResponse(BaseModel):
    logged: bool
    message: str