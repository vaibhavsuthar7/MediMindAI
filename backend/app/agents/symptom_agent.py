import json
from app.agents.base import BaseAgent
from app.utils.llm_client import chat_completion
from app.agents.symptom.symptom_predictor import predict_from_text

SYSTEM_PROMPT = """You are MediMind AI Clinical Triage Specialist.
Your task is to analyze patient-reported symptoms using evidence-based clinical reasoning combined with trained machine-learning diagnostic models.

INSTRUCTIONS:
1. Analyze the symptoms provided by the patient and review the initial ML classifier prediction.
2. Provide 2-4 short, specific follow-up questions a triage nurse would ask.
3. Identify 2-4 possible medical conditions ranked from most likely to least likely, with likelihood ("high", "medium", "low") and a clear 1-sentence medical reason for each.
4. Assign an urgency level: exactly one of "self_care", "consult_doctor", or "emergency".
   (Use "emergency" for red-flag symptoms like severe shortness of breath, chest pressure/pain, acute confusion, stroke signs, unmanageable high fever).

Respond ONLY as valid JSON with this exact schema:
{
  "follow_up_questions": ["Question 1?", "Question 2?"],
  "possible_conditions": [
    {"condition": "Viral Infection", "likelihood": "high", "reason": "Common cause of acute fever and body malaise."},
    {"condition": "Influenza (Flu)", "likelihood": "medium", "reason": "Fits short duration fever and systemic symptoms."}
  ],
  "urgency": "consult_doctor"
}"""


class SymptomAgent(BaseAgent):
    name = "symptom_agent"
    description = "Hybrid ML model + conversational LLM symptom triage specialist."

    def run(self, symptoms_text: str, previous_answers: dict = None) -> dict:
        if isinstance(symptoms_text, list):
            symptoms_str = ", ".join(symptoms_text)
        else:
            symptoms_str = str(symptoms_text).strip()

        # Step 1: Run real trained ML classifier model on the input text
        ml_prediction = None
        try:
            ml_prediction = predict_from_text(symptoms_str)
        except Exception as e:
            print(f"[SymptomAgent] ML model predictor error: {e}")

        context = f"Patient-reported symptoms: {symptoms_str}\n"
        if ml_prediction and ml_prediction.get("disease"):
            context += (
                f"\nTrained ML Classifier Assessment:\n"
                f"- Top Predicted Condition: {ml_prediction['disease']}\n"
                f"- Model Confidence: {ml_prediction.get('confidence', 0.5):.1%}\n"
                f"- Machine Urgency Rating: {ml_prediction.get('urgency', 'consult_doctor')}\n"
            )

        if previous_answers:
            qa_lines = "\n".join(f"- {q}: {a}" for q, a in previous_answers.items())
            context += f"\nPreviously answered follow-up questions:\n{qa_lines}\n"

        raw = chat_completion(SYSTEM_PROMPT, context, json_mode=True)
        
        try:
            data = json.loads(raw)
            if not isinstance(data, dict):
                data = {}
        except (json.JSONDecodeError, TypeError):
            data = {}

        if not data.get("follow_up_questions") or not isinstance(data["follow_up_questions"], list):
            data["follow_up_questions"] = [
                "How long have you been experiencing these symptoms?",
                "Are your symptoms getting better, worse, or staying the same?",
                "Do you have any associated symptoms like body ache, chills, or nausea?"
            ]

        if not data.get("possible_conditions") or not isinstance(data["possible_conditions"], list):
            if ml_prediction and ml_prediction.get("possible_conditions"):
                data["possible_conditions"] = ml_prediction["possible_conditions"]
            else:
                data["possible_conditions"] = [
                    {"condition": "Acute Viral Illness", "likelihood": "high", "reason": "Fits acute symptom onset reported."},
                    {"condition": "Seasonal Infection", "likelihood": "medium", "reason": "Common clinical presentation for reported symptoms."}
                ]

        urgency_val = str(data.get("urgency", "consult_doctor")).lower()
        if urgency_val not in ["self_care", "consult_doctor", "emergency"]:
            urgency_val = "consult_doctor"
        data["urgency"] = urgency_val

        data["disclaimer"] = (
            "This is an AI screening aid powered by LLM clinical models, not a formal medical diagnosis. "
            "If symptoms are severe or worsening, seek immediate medical care."
        )
        return data
