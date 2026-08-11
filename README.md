# MediMind AI — Multi-Agent Healthcare Assistant Platform

A full-stack semester project: 5 specialized AI agents + an orchestrator
+ shared RAG memory, wrapped in a FastAPI backend and a React dashboard.

```
┌─────────────────────────────────────────────────────────┐
│                      Orchestrator                        │
│   (owns every agent, syncs results into RAG memory)      │
└─────────────────────────────────────────────────────────┘
      │           │            │             │           │
 ┌────────┐  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌───────┐
 │Imaging │  │ Symptom  │ │  Report  │ │ Medication │ │  RAG  │
 │ Agent  │  │  Triage  │ │Simplifier│ │  Checker   │ │ Q&A   │
 └────────┘  └──────────┘ └──────────┘ └────────────┘ └───────┘
```

## What makes this a "major project" and not just 5 separate agents

- **Orchestrator pattern**: one class owns every agent and is the single
  integration point — routers never call agents directly, they go through it.
- **Shared memory across agents**: every result (a scan, a symptom check, a
  simplified report, a medication check) is automatically embedded into a
  per-patient ChromaDB collection, so the RAG Q&A agent can answer questions
  across the patient's *entire* history, not just one interaction.
- **Real auth + real DB**: JWT-based accounts, SQLAlchemy models, per-user data.
- **Dashboard aggregation**: cross-agent stats and an urgency-alerts feed that
  pulls from all 4 clinical agents at once.

## Quick start

> 📖 **Detailed Step-by-Step Setup Guide:** See [RUN_GUIDE.md](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/RUN_GUIDE.md) for complete instructions for Windows, macOS, and Linux.

**Terminal 1 — backend**
```bash
cd backend
# Windows: .\venv\Scripts\Activate.ps1
# Linux/Mac: python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**, sign up, and try each agent from the dashboard.

## Ideas to extend for extra marks

- Swap the Medication Agent's LLM-based check for the free RxNav/RxNorm API.
- Add Grad-CAM visual explainability on top of the imaging model's predictions.
- Fine-tune the imaging model on a specific Kaggle dataset to show original ML work.
- Add a doctor/clinician role and a shared-patient view.
- Add offline/local fallback (Ollama) as a backup LLM provider for the demo.

See `backend/README.md`, `frontend/README.md`, and [RUN_GUIDE.md](file:///c:/Users/vaibh/Desktop/medical/medimind-ai/medimind/RUN_GUIDE.md) for more details.
