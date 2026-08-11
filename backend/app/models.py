import datetime as dt

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    sex = Column(String, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    imaging_results = relationship("ImagingResult", back_populates="user", cascade="all, delete-orphan")
    symptom_checks = relationship("SymptomCheck", back_populates="user", cascade="all, delete-orphan")
    report_summaries = relationship("ReportSummary", back_populates="user", cascade="all, delete-orphan")
    medication_checks = relationship("MedicationCheck", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")


class ImagingResult(Base):
    __tablename__ = "imaging_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    findings = Column(Text)          # JSON string of {label: probability}
    top_finding = Column(String)
    confidence = Column(Float)
    severity = Column(String)        # low / moderate / high / urgent
    summary = Column(Text)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="imaging_results")


class SymptomCheck(Base):
    __tablename__ = "symptom_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symptoms_text = Column(Text)
    follow_up_qa = Column(Text)       # JSON string of Q&A pairs
    possible_conditions = Column(Text)  # JSON string of ranked conditions
    urgency = Column(String)          # self_care / consult_doctor / emergency
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="symptom_checks")


class ReportSummary(Base):
    __tablename__ = "report_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    original_text_excerpt = Column(Text)
    simplified_summary = Column(Text)
    key_terms = Column(Text)          # JSON string of {term: explanation}
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="report_summaries")


class MedicationCheck(Base):
    __tablename__ = "medication_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    current_medications = Column(Text)  # JSON list
    new_medication = Column(String)
    interactions_found = Column(Text)   # JSON string
    risk_level = Column(String)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="medication_checks")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String)   # user / assistant
    content = Column(Text)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="chat_messages")
