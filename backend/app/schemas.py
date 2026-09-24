import re
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: Optional[int] = None
    sex: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Name is required")
        if len(v.strip()) > 30:
            raise ValueError("Name cannot be longer than 30 characters")
        return v.strip()

    @field_validator("age")
    @classmethod
    def validate_age(cls, v):
        if v is not None:
            if v < 1 or v > 100:
                raise ValueError("Age must be between 1 and 100")
        return v

    @field_validator("sex")
    @classmethod
    def validate_sex(cls, v):
        if v is not None and str(v).strip():
            clean = str(v).strip().upper()
            allowed = ["F", "M", "OTHER", "FEMALE", "MALE"]
            if clean not in allowed:
                raise ValueError("Sex must be F, M, or Other")
            if clean == "FEMALE":
                return "F"
            if clean == "MALE":
                return "M"
            if clean == "OTHER":
                return "Other"
            return clean
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least 1 uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least 1 lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least 1 number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least 1 special character (!@#$%^&*)")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    age: Optional[int]
    sex: Optional[str]

    class Config:
        from_attributes = True


class OTPRequest(BaseModel):
    email: EmailStr


class OTPVerify(BaseModel):
    email: EmailStr
    code: str


class PasswordResetRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least 1 uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least 1 lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least 1 number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least 1 special character (!@#$%^&*)")
        return v


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class GoogleAuthRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    google_id: Optional[str] = None


class SymptomRequest(BaseModel):
    symptoms_text: str
    previous_answers: Optional[Dict[str, str]] = None  # answers to prior follow-up questions
    check_id: Optional[int] = None  # Existing check ID to prevent duplicate database rows


class SymptomResponse(BaseModel):
    check_id: Optional[int] = None
    follow_up_questions: List[str]
    possible_conditions: List[Dict[str, Any]]
    urgency: str
    disclaimer: str


class MedicationRequest(BaseModel):
    current_medications: List[str]
    new_medication: str


class MedicationResponse(BaseModel):
    interactions_found: List[Dict[str, str]]
    risk_level: str
    advice: str
    disclaimer: str


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    sources_used: List[str] = []


class ImagingResponse(BaseModel):
    top_finding: str
    top_finding_hi: Optional[str] = ""
    body_part: Optional[str] = "Medical Radiograph"
    body_part_hi: Optional[str] = ""
    confidence: float
    findings: Dict[str, float]
    severity: str
    key_observations: Optional[List[str]] = []
    key_observations_hi: Optional[List[str]] = []
    recommendations: Optional[List[str]] = []
    recommendations_hi: Optional[List[str]] = []
    summary: str
    summary_hi: Optional[str] = ""
    disclaimer: str



class ReportSummaryResponse(BaseModel):
    simplified_summary: str
    key_terms: Dict[str, str]
    disclaimer: str


class DashboardStats(BaseModel):
    total_imaging_scans: int
    total_symptom_checks: int
    total_reports_simplified: int
    total_medication_checks: int
    recent_activity: List[Dict[str, Any]]
    urgency_alerts: List[Dict[str, Any]]
