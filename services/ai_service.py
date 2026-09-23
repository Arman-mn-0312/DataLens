"""
services/ai_service.py
======================
Centralized Gemini AI integration for DataLens.

Responsibility:
- Receive compact, structured data-quality findings already calculated by DataLens.
- Construct a controlled prompt.
- Call Gemini to generate a dataset-specific Business Impact and Recommendation.
- Validate the response structure.
- Return (business_impact, recommendation) on success.
- Return (None, None) on ANY failure so the caller can use the rule-based fallback.

This module NEVER:
- Receives or sends the raw CSV / DataFrame.
- Calculates data-quality metrics.
- Exposes the API key.
- Crashes the report endpoint.
"""

import json
import logging
import os
import time

from typing import Any, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Gemini client — lazy-initialised once, reused across requests
# ---------------------------------------------------------------------------

_gemini_client: Optional[Any] = None


def _get_client():
    """Return a cached Gemini client, or None if the key is absent."""
    global _gemini_client

    if _gemini_client is not None:
        return _gemini_client

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("[AI] GEMINI_API_KEY not set — AI layer disabled.")
        return None

    try:
        from google import genai
        from google.genai import types
        _gemini_client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=5000,
                retry_options=types.HttpRetryOptions(attempts=1)
            ),
        )
        logger.info("[AI] Gemini client initialised successfully.")
    except Exception as exc:
        logger.error("[AI] Failed to initialise Gemini client: %s", exc)
        _gemini_client = None

    return _gemini_client


# ---------------------------------------------------------------------------
# Prompt construction
# ---------------------------------------------------------------------------

_SYSTEM_INSTRUCTION = (
    "You are the Business Impact and Data Quality Recommendation engine for DataLens, "
    "a professional data-quality investigation platform.\n\n"
    "STRICT RULES:\n"
    "1. DataLens is the SOLE source of truth for all numerical and data-quality facts.\n"
    "2. You MUST NOT invent, fabricate, or estimate any statistics.\n"
    "3. You MUST NOT change the severity provided.\n"
    "4. You MUST NOT calculate new data-quality metrics.\n"
    "5. Use ONLY the findings supplied in the user message to make the explanation specific.\n"
    "6. Do NOT claim that an issue definitely caused a business loss unless the supplied "
    "   information explicitly supports that conclusion.\n\n"
    "Generate exactly two outputs:\n\n"
    "BUSINESS IMPACT:\n"
    "  Explain how the detected data-quality issue can affect:\n"
    "  - data reliability and reporting accuracy\n"
    "  - analytical and operational decisions\n"
    "  - downstream systems and data pipelines\n"
    "  - machine-learning workflows if applicable\n"
    "  Make the explanation specific to the supplied findings.\n\n"
    "RECOMMENDATION:\n"
    "  Provide one concise, practical, actionable recommendation appropriate to the "
    "  issue type and severity.\n\n"
    "Both outputs must be concise (2–4 sentences each), professional, and free of "
    "generic filler.\n\n"
    "Respond with valid JSON only, in this exact structure:\n"
    '{"business_impact": "...", "recommendation": "..."}'
)


def _build_prompt(context: dict) -> str:
    """
    Serialise the DataLens findings into a compact JSON block for the prompt.
    The context dict contains ONLY pre-calculated DataLens findings — no raw data.
    """
    try:
        findings_json = json.dumps(context, indent=2, default=str)
    except Exception:
        findings_json = str(context)

    return (
        "The following data-quality findings have been calculated by DataLens. "
        "Use ONLY these findings.\n\n"
        f"```json\n{findings_json}\n```\n\n"
        "Generate the Business Impact and Recommendation JSON."
    )


# ---------------------------------------------------------------------------
# Core function — called by api.py after DataLens calculations
# ---------------------------------------------------------------------------

def get_ai_business_impact_and_recommendation(context: dict):
    """
    Call Gemini with a compact DataLens findings context.

    Parameters
    ----------
    context : dict
        Pre-calculated DataLens findings (no raw CSV data).

    Returns
    -------
    (business_impact: str, recommendation: str)
        Both are non-empty strings on success.
    (None, None)
        On ANY failure — the caller must fall back to rule-based logic.
    """
    client = _get_client()
    if client is None:
        return None, None

    _MAX_RETRIES = 2
    _RETRY_DELAY_S = 2.0  # seconds between retries for transient errors

    for attempt in range(1, _MAX_RETRIES + 2):  # attempts: 1, 2, 3
        try:
            from google.genai import types

            prompt = _build_prompt(context)

            response = client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=_SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    temperature=0.3,
                    max_output_tokens=1024,  # raised to prevent truncated JSON
                ),
            )

            raw_text = None
            try:
                raw_text = response.text
            except Exception as text_exc:
                logger.warning(
                    "[AI] Could not read response.text for issue_type='%s': %s",
                    context.get("issue_type", "unknown"), str(text_exc)[:120],
                )
            if not raw_text:
                logger.warning(
                    "[AI] Gemini returned an empty response for issue_type='%s'.",
                    context.get("issue_type", "unknown"),
                )
                return None, None

            return _parse_and_validate(raw_text, context)

        except Exception as exc:
            exc_str = str(exc)
            # Detect transient / recoverable errors and retry
            is_transient = any(
                marker in exc_str
                for marker in (
                    "503", "UNAVAILABLE",
                    "model output", "output text",   # empty-output SDK error
                )
            )
            if is_transient and attempt <= _MAX_RETRIES:
                logger.warning(
                    "[AI] Transient error on attempt %d for issue_type='%s': %s — retrying in %.1fs",
                    attempt, context.get("issue_type", "unknown"), exc_str[:120], _RETRY_DELAY_S,
                )
                time.sleep(_RETRY_DELAY_S)
                continue

            logger.error(
                "[AI] Gemini call failed (attempt %d) for issue_type='%s': %s",
                attempt, context.get("issue_type", "unknown"), exc_str[:200],
            )
            return None, None

    return None, None


# ---------------------------------------------------------------------------
# Response validation
# ---------------------------------------------------------------------------

def _parse_and_validate(raw_text: str, context: dict):
    """
    Parse Gemini's JSON response and validate required keys.

    Returns (impact, recommendation) if valid, (None, None) otherwise.
    """
    try:
        # Strip markdown fences if present (defensive)
        text = raw_text.strip()
        if text.startswith("```"):
            lines = text.splitlines()
            text = "\n".join(
                line for line in lines
                if not line.strip().startswith("```")
            ).strip()

        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        logger.error(
            "[AI] JSON parse error for issue_type='%s': %s | raw=%r",
            context.get("issue_type", "unknown"),
            exc,
            raw_text[:200],
        )
        return None, None

    business_impact = parsed.get("business_impact", "")
    recommendation = parsed.get("recommendation", "")

    if not isinstance(business_impact, str) or not business_impact.strip():
        logger.warning("[AI] 'business_impact' missing or empty in response.")
        return None, None

    if not isinstance(recommendation, str) or not recommendation.strip():
        logger.warning("[AI] 'recommendation' missing or empty in response.")
        return None, None

    return business_impact.strip(), recommendation.strip()
