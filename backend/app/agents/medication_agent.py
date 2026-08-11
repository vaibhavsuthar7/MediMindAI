"""
Medication & Interaction Checker Agent
---------------------------------------
Checks a proposed new medication against the patient's current medication
list for potential interactions, contraindications, and dosage warnings.

NOTE: uses the LLM's general knowledge as a *screening aid*. For a
production system, wire this to a real interaction database (e.g. the
free RxNorm/RxNav API from the NLM) -- see README for the swap-in point.
"""
import json

from app.agents.base import BaseAgent
from app.utils.llm_client import chat_completion

SYSTEM_PROMPT = """You are a pharmacology screening assistant. Given a patient's current
medications and one new medication they're considering, identify plausible drug-drug
interactions, contraindications, or notable warnings.

Respond ONLY as JSON:
{
  "interactions_found": [{"with": "drug name", "severity": "mild|moderate|severe",
                            "description": "..."}],
  "risk_level": "low|moderate|high",
  "advice": "1-3 sentence plain-language advice for the patient"
}

If you are not confident about a specific interaction, do not invent one -- say the
combination has no well-known major interaction, but a pharmacist should still confirm."""


class MedicationAgent(BaseAgent):
    name = "medication_agent"
    description = "Screens for potential drug interactions."

    def run(self, current_medications: list, new_medication: str) -> dict:
        prompt = (
            f"Current medications: {', '.join(current_medications) if current_medications else 'None'}\n"
            f"New medication being considered: {new_medication}"
        )
        raw = chat_completion(SYSTEM_PROMPT, prompt, json_mode=True)
        try:
            data = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            data = {
                "interactions_found": [],
                "risk_level": "unknown",
                "advice": raw if isinstance(raw, str) else "Could not parse response.",
            }
        data.setdefault("interactions_found", [])
        data.setdefault("risk_level", "unknown")
        data.setdefault("advice", "")
        data["disclaimer"] = (
            "This is an AI screening aid using general knowledge, not a certified drug "
            "interaction database. Always confirm with a pharmacist or doctor before combining medications."
        )
        return data
