"""
Orchestrator
------------
Central place that owns one instance of every agent, and provides a
single hook (`index_for_rag`) that every router calls after producing a
result, so the RAG agent's memory always stays in sync with the other
four agents automatically.
"""
import datetime as dt

from app.agents.imaging.imaging_agent import ImagingAgent
from app.agents.symptom_agent import SymptomAgent
from app.agents.report_agent import ReportAgent
from app.agents.medication_agent import MedicationAgent
from app.agents.rag_agent import RAGAgent


class Orchestrator:
    def __init__(self):
        self.imaging = ImagingAgent()
        self.symptom = SymptomAgent()
        self.report = ReportAgent()
        self.medication = MedicationAgent()
        self.rag = RAGAgent()

    def index_for_rag(self, user_id: int, record_type: str, record_id: str, text: str):
        """Push a new record from any agent into the patient's RAG memory."""
        self.rag.add_record(
            user_id=user_id,
            record_id=f"{record_type}_{record_id}",
            text=text,
            metadata={"type": record_type, "date": dt.datetime.utcnow().isoformat()},
        )


# Single shared instance used across the whole app.
orchestrator = Orchestrator()
