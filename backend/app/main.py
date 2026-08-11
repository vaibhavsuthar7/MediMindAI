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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
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
