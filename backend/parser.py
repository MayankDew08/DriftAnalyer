import re
from models import ParsedStrategy, ParsedImplementation


def parse_strategy(raw_text: str) -> ParsedStrategy:
    """
    Parses a raw strategy text block into structured fields.

    Expects these labels (case-insensitive):
        Intent:
        Scope:
        Priorities:   (followed by numbered lines like "1. ..." or "- ...")
        Constraints:  (followed by bullet lines like "- ...")
    """

    # ── Intent ──────────────────────────────
    intent_match = re.search(
        r'Intent\s*:\s*(.+?)(?=\n[A-Z]|\Z)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    intent = intent_match.group(1).strip() if intent_match else ""

    # ── Scope ───────────────────────────────
    scope_match = re.search(
        r'Scope\s*:\s*(.+?)(?=\n[A-Z]|\Z)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    scope = scope_match.group(1).strip() if scope_match else ""

    # ── Priorities ──────────────────────────
    priorities_match = re.search(
        r'Priorities\s*:\s*\n(.*?)(?=\n[A-Z]|\Z)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    priorities = []
    if priorities_match:
        block = priorities_match.group(1)
        # Match lines like "1. something" or "- something"
        priorities = re.findall(r'(?:^\s*[\d\-\*]+[\.\)]\s*)(.+)', block, re.MULTILINE)
        priorities = [p.strip() for p in priorities if p.strip()]

    # ── Constraints ─────────────────────────
    constraints_match = re.search(
        r'Constraints\s*:\s*\n(.*?)(?=\n[A-Z]|\Z)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    constraints = []
    if constraints_match:
        block = constraints_match.group(1)
        constraints = re.findall(r'(?:^\s*[\-\*\d]+[\.\)]?\s*)(.+)', block, re.MULTILINE)
        constraints = [c.strip() for c in constraints if c.strip()]

    return ParsedStrategy(
        intent=intent,
        scope=scope,
        priorities=priorities,
        constraints=constraints
    )


def parse_implementation(raw_text: str) -> ParsedImplementation:
    """
    Parses a raw implementation text block into content and explanation.

    Expects these labels (case-insensitive):
        Content:
        Explanation:
    """

    # ── Content ─────────────────────────────
    content_match = re.search(
        r'Content\s*:\s*(.+?)(?=\nExplanation\s*:|\Z)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    content = content_match.group(1).strip() if content_match else ""

    # ── Explanation ─────────────────────────
    explanation_match = re.search(
        r'Explanation\s*:\s*(.+?)(?=\n[A-Z]|\Z)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    explanation = explanation_match.group(1).strip() if explanation_match else ""

    return ParsedImplementation(
        content=content,
        explanation=explanation
    )