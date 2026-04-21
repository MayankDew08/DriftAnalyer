# backend/drift_engine.py

import os
import json
from string import Template
from groq import Groq
from dotenv import load_dotenv
from models import (
    ParsedStrategy,
    ParsedImplementation,
    DriftCategory,
    DriftAnalysisResponse,
    Severity,
    RoutingSuggestion
)

load_dotenv()

# ─────────────────────────────────────────
# LOAD PROMPT TEMPLATE ONCE AT STARTUP
# ─────────────────────────────────────────

PROMPT_PATH = os.path.join(os.path.dirname(__file__), "drift_engine_prompt.txt")

with open(PROMPT_PATH, "r") as f:
    PROMPT_TEMPLATE = f.read()


# ─────────────────────────────────────────
# GROQ CLIENT
# ─────────────────────────────────────────

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ─────────────────────────────────────────
# PROMPT BUILDER
# ─────────────────────────────────────────

def build_prompt(strategy: ParsedStrategy, implementation: ParsedImplementation) -> str:
    """
    Fills the prompt template with actual parsed values.
    Priorities and constraints are formatted as numbered/bulleted lists
    so the LLM reads them clearly.
    """

    priorities_formatted = "\n".join(
        f"  {i+1}. {p}" for i, p in enumerate(strategy.priorities)
    )

    constraints_formatted = "\n".join(
        f"  - {c}" for c in strategy.constraints
    )

    filled = Template(PROMPT_TEMPLATE).substitute(
        intent=strategy.intent,
        scope=strategy.scope,
        priorities=priorities_formatted if priorities_formatted else "  (none provided)",
        constraints=constraints_formatted if constraints_formatted else "  (none provided)",
        content=implementation.content,
        explanation=implementation.explanation
    )

    return filled


# ─────────────────────────────────────────
# GROQ CALL
# ─────────────────────────────────────────

def call_groq(prompt: str) -> dict:
    """
    Sends the filled prompt to Groq with JSON mode enabled.
    Temperature 0 for determinism.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0,
        response_format={"type": "json_object"},  # <-- Forces valid JSON
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a suspicious, meticulous drift detection auditor. "
                    "You assume drift exists until proven otherwise. "
                    "You return only valid JSON. No markdown. No explanation. "
                    "Just the JSON object as specified."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    raw_output = response.choices[0].message.content.strip()

    # JSON mode guarantees valid JSON, but we still guard against edge cases
    try:
        return json.loads(raw_output)
    except json.JSONDecodeError as e:
        raise ValueError(f"Groq returned invalid JSON: {e}\n\nRaw output:\n{raw_output}")

# ─────────────────────────────────────────
# SCORE CALCULATOR
# ─────────────────────────────────────────

SEVERITY_WEIGHTS = {
    "High":   1.0,
    "Medium": 0.5,
    "Low":    0.2,
    "None":   0.0
}

def calculate_drift_score(categories: list[DriftCategory]) -> float:
    """
    Calculates overall drift score from 0.0 to 1.0.

    Logic:
    - Each category contributes based on its severity weight
    - Max possible score = 5 categories × 1.0 (all High)
    - We normalize to 0.0–1.0

    Score bands (used by frontend):
    - 0.0–0.2  → Green  (Aligned)
    - 0.3–0.5  → Amber  (Minor drift)
    - 0.6–1.0  → Red    (Significant drift)
    """

    total = sum(SEVERITY_WEIGHTS.get(cat.severity, 0.0) for cat in categories)
    max_possible = len(categories) * 1.0  # 5 × 1.0 = 5.0
    score = round(total / max_possible, 2)
    return score


# ─────────────────────────────────────────
# ROUTING LOGIC
# ─────────────────────────────────────────

def determine_routing(
    score: float,
    categories: list[DriftCategory]
) -> RoutingSuggestion:
    """
    Decides what should happen next based on drift findings.

    Rules:
    - Score < 0.2
        → Accept. No significant drift.

    - Revise → Strategy only when:
        Intent Drift is High AND Scope Violation is NOT detected
        Meaning: Strategy's intent was so unclear that Implementation
        could not follow it. The problem is upstream.

    - Everything else with drift
        → Revise Implementation. Implementation broke clear Strategy rules.
    """

    if score < 0.2:
        return RoutingSuggestion.ACCEPT

    # Build a quick lookup by category name
    category_map = {cat.category: cat for cat in categories}

    intent_drift     = category_map.get("Intent Drift")
    scope_violation  = category_map.get("Scope Violation")

    # Only blame Strategy if Intent was unclear AND scope was respected
    # If scope was also violated, the Implementation is clearly at fault
    if (
        intent_drift
        and intent_drift.detected
        and intent_drift.severity == Severity.HIGH
        and scope_violation
        and not scope_violation.detected
    ):
        return RoutingSuggestion.REVISE_STRATEGY

    # Default — Implementation drifted from a clear Strategy
    return RoutingSuggestion.REVISE_IMPL

# ─────────────────────────────────────────
# SUMMARY GENERATOR
# ─────────────────────────────────────────

def generate_summary(
    score: float,
    categories: list[DriftCategory],
    routing: RoutingSuggestion
) -> str:
    """
    Produces a plain English summary for the human reviewer.
    Built from structured data — not generated by LLM.
    This keeps the summary deterministic and auditable.
    """

    detected = [cat for cat in categories if cat.detected]

    if not detected:
        return (
            "No drift detected. The Implementation appears aligned with the Strategy "
            "across all five categories. Suggested action: Accept."
        )

    category_names = ", ".join(cat.category for cat in detected)
    high_severity = [cat for cat in detected if cat.severity == "High"]

    summary = f"Drift detected in {len(detected)} of 5 categories: {category_names}. "

    if high_severity:
        high_names = ", ".join(cat.category for cat in high_severity)
        summary += f"High severity drift found in: {high_names}. "

    summary += f"Overall drift score: {score}. "
    summary += f"Suggested action: {routing.value}."

    return summary


# ─────────────────────────────────────────
# SCHEMA VALIDATOR
# ─────────────────────────────────────────

def validate_and_parse_categories(raw_categories: list) -> list[DriftCategory]:
    """
    Validates the LLM output against our Pydantic schema.
    If the model returns anything unexpected, this catches it.

    Also enforces the rule:
    - detected=False must have severity=None
    - detected=True must not have severity=None
    """

    VALID_CATEGORIES = [
        "Scope Violation",
        "Constraint Violation",
        "Priority Misalignment",
        "Intent Drift",
        "Internal Inconsistency"
    ]

    if len(raw_categories) != 5:
        raise ValueError(
            f"Expected 5 drift categories, got {len(raw_categories)}"
        )

    parsed = []
    for item in raw_categories:

        # Enforce category name is valid
        if item.get("category") not in VALID_CATEGORIES:
            raise ValueError(f"Unexpected category name: {item.get('category')}")

        # Enforce severity/detected consistency
        detected = item.get("detected", False)
        severity_raw = item.get("severity", "None")

        if not detected:
            severity_raw = "None"  # Force None if not detected

        if detected and severity_raw == "None":
            severity_raw = "Low"   # Fallback if model forgot to set severity

        parsed.append(DriftCategory(
            category=item["category"],
            detected=detected,
            severity=Severity(severity_raw),
            reason=item.get("reason", "No reason provided."),
            evidence=item.get("evidence", "No evidence provided.")
        ))

    return parsed


# ─────────────────────────────────────────
# MAIN ENTRY POINT
# ─────────────────────────────────────────

def run_drift_analysis(
    strategy: ParsedStrategy,
    implementation: ParsedImplementation
) -> DriftAnalysisResponse:
    """
    Full pipeline:
    1. Build prompt from parsed inputs
    2. Call Groq
    3. Validate JSON response against schema
    4. Calculate score
    5. Determine routing
    6. Generate summary
    7. Return DriftAnalysisResponse
    """

    # Step 1 — Build prompt
    prompt = build_prompt(strategy, implementation)

    # Step 2 — Call Groq
    raw_response = call_groq(prompt)

    # Step 3 — Validate and parse categories
    categories = validate_and_parse_categories(
        raw_response.get("drift_categories", [])
    )

    # Step 4 — Calculate score
    score = calculate_drift_score(categories)

    # Step 5 — Determine routing
    routing = determine_routing(score, categories)

    # Step 6 — Generate summary
    summary = generate_summary(score, categories, routing)

    # Step 7 — Return full response
    return DriftAnalysisResponse(
        drift_detected=any(cat.detected for cat in categories),
        overall_drift_score=score,
        drift_categories=categories,
        human_readable_summary=summary,
        suggested_routing=routing
    )