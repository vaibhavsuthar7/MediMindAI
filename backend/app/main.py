from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, imaging, symptoms, reports, medications, chat, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediMind AI",
    description="Multi-agent healthcare assistant platform (imaging, triage, "
                "report simplification, medication checks, and RAG-based health Q&A).",
    version="1.0.0",
)

import os

cors_origins_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if cors_origins_env:
    allowed_origins.extend([o.strip() for o in cors_origins_env.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if not os.getenv("ALLOW_ALL_CORS") else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(imaging.router)
app.include_router(symptoms.router)
app.include_router(reports.router)
app.include_router(medications.router)
app.include_router(chat.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "MediMind AI backend"}
