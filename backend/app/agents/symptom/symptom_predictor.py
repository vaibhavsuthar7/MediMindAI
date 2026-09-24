import os
import re
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

_structured_model = None
_structured_le = None
_structured_cols = None

_freetext_model = None
_freetext_vectorizer = None

EMERGENCY_DISEASES = {
    "heart attack", "paralysis (brain hemorrhage)", "pneumonia", "tuberculosis",
    "dengue", "malaria", "stroke", "appendicitis", "severe allergic reaction"
}

CONSULT_DOCTOR_DISEASES = {
    "hypertension", "diabetes", "hepatitis b", "hepatitis c", "hepatitis d",
    "hepatitis e", "typhoid", "jaundice", "bronchial asthma", "chicken pox",
    "gastroenteritis", "hypoglycemia", "migraine", "urinary tract infection"
}

def _init_structured_model():
    global _structured_model, _structured_le, _structured_cols
    if _structured_model is not None:
        return
    sm_path = os.path.join(BASE_DIR, "structured_symptom_model.pkl")
    le_path = os.path.join(BASE_DIR, "structured_label_encoder.pkl")
    cols_path = os.path.join(BASE_DIR, "structured_symptom_columns.pkl")
    if os.path.exists(sm_path) and os.path.exists(le_path) and os.path.exists(cols_path):
        _structured_model = joblib.load(sm_path)
        _structured_le = joblib.load(le_path)
        _structured_cols = joblib.load(cols_path)

def _init_freetext_model():
    global _freetext_model, _freetext_vectorizer
    if _freetext_model is not None:
        return
    ftm_path = os.path.join(BASE_DIR, "freetext_symptom_model.pkl")
    vec_path = os.path.join(BASE_DIR, "freetext_vectorizer.pkl")
    if os.path.exists(ftm_path) and os.path.exists(vec_path):
        _freetext_model = joblib.load(ftm_path)
        _freetext_vectorizer = joblib.load(vec_path)

def get_urgency(disease_name: str) -> str:
    d_lower = disease_name.lower()
    if any(e in d_lower for e in EMERGENCY_DISEASES):
        return "emergency"
    if any(c in d_lower for c in CONSULT_DOCTOR_DISEASES):
        return "consult_doctor"
    return "self_care"

def predict_from_checklist(symptom_list: list) -> dict:
    _init_structured_model()
    if _structured_model is None:
        raise FileNotFoundError("Structured symptom model files not found.")

    clean_input = [s.strip().lower().replace(" ", "_") for s in symptom_list]
    vector = [1 if col in clean_input else 0 for col in _structured_cols]
    import pandas as pd
    df_vector = pd.DataFrame([vector], columns=_structured_cols)

    probs = _structured_model.predict_proba(df_vector)[0]
    idx = np.argmax(probs)
    top_disease = _structured_le.inverse_transform([idx])[0]
    top_conf = round(float(probs[idx]), 4)

    top_3_indices = np.argsort(probs)[-3:][::-1]
    top_3 = [
        {
            "condition": _structured_le.inverse_transform([i])[0],
            "likelihood": "high" if float(probs[i]) > 0.6 else "medium" if float(probs[i]) > 0.25 else "low",
            "reason": f"Structured ML checklist model probability: {probs[i]*100:.1f}%",
            "confidence": round(float(probs[i]), 4)
        }
        for i in top_3_indices
    ]

    return {
        "disease": top_disease,
        "confidence": top_conf,
        "urgency": get_urgency(top_disease),
        "possible_conditions": top_3,
        "source": "trained_structured_ml_model"
    }

def predict_from_text(free_text: str) -> dict:
    _init_freetext_model()
    if _freetext_model is None:
        raise FileNotFoundError("Free-text symptom model files not found.")

    clean = re.sub(r"[^a-z\s]", " ", free_text.lower())
    clean = re.sub(r"\s+", " ", clean).strip()

    vector = _freetext_vectorizer.transform([clean])
    probs = _freetext_model.predict_proba(vector)[0]
    idx = np.argmax(probs)

    classes = _freetext_model.classes_
    top_disease = classes[idx]
    top_conf = round(float(probs[idx]), 4)

    top_3_indices = np.argsort(probs)[-3:][::-1]
    top_3 = [
        {
            "condition": classes[i],
            "likelihood": "high" if float(probs[i]) > 0.6 else "medium" if float(probs[i]) > 0.25 else "low",
            "reason": f"TF-IDF Calibrated SVM ML model probability: {probs[i]*100:.1f}%",
            "confidence": round(float(probs[i]), 4)
        }
        for i in top_3_indices
    ]

    return {
        "disease": top_disease,
        "confidence": top_conf,
        "urgency": get_urgency(top_disease),
        "possible_conditions": top_3,
        "source": "trained_freetext_ml_model"
    }
