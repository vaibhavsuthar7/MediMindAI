"""
Report Simplifier Agent
------------------------
Takes raw text extracted from a medical report PDF and turns it into a
plain-language summary plus a glossary of jargon terms, for patients.
"""
import json

from app.agents.base import BaseAgent
from app.utils.llm_client import chat_completion

SYSTEM_PROMPT = """You are a medical report translator for patients with no medical background.
Given raw text from a lab/diagnostic report, produce:
1. A plain-language summary (5-8 sentences) explaining what the report says, what stands out
   (abnormal values), and what it generally means -- without alarming the patient unnecessarily.
2. A glossary of up to 8 medical/jargon terms found in the report, each explained in one
   simple sentence.

Respond ONLY as JSON:
{
  "simplified_summary": "...",
  "key_terms": {"term": "plain-language explanation", ...}
}"""


class ReportAgent(BaseAgent):
    name = "report_agent"
    description = "Simplifies medical report PDFs into plain language."

    def run(self, report_text: str) -> dict:
        raw = chat_completion(SYSTEM_PROMPT, report_text, json_mode=True)
        try:
            data = json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            data = {
                "simplified_summary": raw if isinstance(raw, str) else "Could not parse report.",
                "key_terms": {},
            }
        data.setdefault("simplified_summary", "")
        data.setdefault("key_terms", {})
        data["disclaimer"] = (
            "This is an AI-generated simplification for understanding purposes only. "
            "Always discuss the original report with your doctor."
        )
        return data
