# MediMind AI — Backend

FastAPI backend powering 5 healthcare agents + an orchestrator:

1. **Imaging Agent** — chest X-ray screening (TorchXRayVision, free/open-source model)
2. **Symptom Triage Agent** — conversational triage, ranked conditions + urgency
3. **Report Simplifier Agent** — turns medical PDF reports into plain language
4. **Medication Checker Agent** — screens new medication against current list
5. **Health Record Q&A Agent (RAG)** — ChromaDB-backed Q&A over a patient's own history

All LLM calls go through **Groq's free API** (fast inference on open models like Llama 3.1).
No local GPU or paid key needed.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

> `torch` / `torchxrayvision` are heavy (~1GB). If you just want to demo the other
> 4 agents quickly, comment those three lines out of `requirements.txt` — the
> Imaging Agent will automatically fall back to clearly-labeled demo data instead
> of crashing.

### Get a free Groq API key
1. Go to https://console.groq.com/keys
2. Sign up (free), create a key
3. Copy `.env.example` to `.env` and paste the key in:

```bash
cp .env.example .env
# edit .env -> GROQ_API_KEY=gsk_xxxxxxxx
```

### Run

```bash
uvicorn app.main:app --reload --port 8000
```

API docs auto-generated at: **http://localhost:8000/docs**

## Notes for your project report / viva

- **Orchestrator pattern**: `app/agents/orchestrator.py` holds one instance of every
  agent and is the single place that keeps the RAG agent's memory in sync — every
  router calls `orchestrator.index_for_rag(...)` after producing a result, so the
  Q&A agent automatically "remembers" every imaging scan, symptom check, report,
  and medication check for that patient.
- **Swap-in points to extend for a stronger submission**:
  - Medication Agent currently uses LLM general knowledge — wire it to the free
    [RxNav/RxNorm API](https://lhncbc.nlm.nih.gov/RxNav/APIs/RxNormAPIs.html) for a
    real interaction database.
  - Imaging Agent can be swapped for a fine-tuned model on a specific dataset
    (e.g. Kaggle chest X-ray pneumonia dataset) to show your own training work.
  - Add Grad-CAM visualization on top of TorchXRayVision predictions for visual
    explainability (`torchxrayvision` exposes intermediate activations for this).
