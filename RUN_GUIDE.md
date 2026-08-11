# 🚀 MediMind AI — How to Run & Setup Guide

This document provides complete instructions for setting up and running **MediMind AI** (Backend & Frontend) on **Windows**, **macOS**, and **Linux**.

---

## 📌 Prerequisites

Before running the project, ensure you have the following installed:

1. **Python 3.10+** (Verify with `python --version` or `python3 --version`)
2. **Node.js 18+ & npm** (Verify with `node -v` and `npm -v`)
3. **Git** (Optional, for version control)

---

## 🛠️ Project Structure

```
medimind/
├── backend/          # FastAPI Backend (Python, SQLAlchemy, ChromaDB, Groq/NVIDIA LLM)
├── frontend/         # React Dashboard (Vite, Tailwind CSS, Lucide Icons)
├── README.md         # Project Overview
└── RUN_GUIDE.md      # Setup & Execution Steps
```

---

## ⚡ Quick Start (Windows)

### 1️⃣ Backend Setup & Execution

Open **Terminal 1** (PowerShell or Command Prompt):

```powershell
# Navigate to the backend directory
cd C:\Users\vaibh\Desktop\medical\medimind-ai\medimind\backend

# Activate the virtual environment
# For PowerShell:
.\venv\Scripts\Activate.ps1

# For Command Prompt (CMD):
venv\Scripts\activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

> **Backend URL:** `http://localhost:8000`  
> **Interactive API Docs (Swagger):** `http://localhost:8000/docs`

---

### 2️⃣ Frontend Setup & Execution

Open **Terminal 2** (PowerShell or Command Prompt):

```powershell
# Navigate to the frontend directory
cd C:\Users\vaibh\Desktop\medical\medimind-ai\medimind\frontend

# Install dependencies (if node_modules is missing)
npm install

# Start React Dev Server
npm run dev
```

> **Frontend Application URL:** `http://localhost:5173`

---

## 🐧 Quick Start (Linux / macOS)

### 1️⃣ Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Configuration (.env)

Both `backend` and `frontend` use `.env` files for configuration.

### Backend `.env` (`backend/.env`)
Ensure `backend/.env` exists with the necessary keys:

```env
# LLM / NVIDIA NIM API Key
LLM_API_KEY=your_nvidia_api_key
LLM_MODEL=meta/llama-3.1-8b-instruct
LLM_BASE_URL=https://integrate.api.nvidia.com/v1

# Supabase Credentials
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# JWT Auth Secret
JWT_SECRET=your_jwt_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
SQLITE_FALLBACK_URL=sqlite:///./medimind.db

# Storage Directories
UPLOAD_DIR=./uploads
CHROMA_DIR=./chroma_store
```

### Frontend `.env` (`frontend/.env`)
Ensure `frontend/.env` has:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## ❓ Troubleshooting & FAQs

| Issue | Cause | Solution |
|---|---|---|
| `Execution Policy Error` in PowerShell | PowerShell restriction | Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `Port 8000 in use` | Backend already running | Use `--port 8001` or stop existing process |
| `ModuleNotFoundError` in Backend | Virtualenv not active | Make sure `(venv)` appears in terminal before running uvicorn |
| `Failed to fetch` in Frontend | Backend not running | Ensure FastAPI is running on `http://localhost:8000` |

---

## 🎯 Verification Checklist

- [x] Backend running on `http://localhost:8000`
- [x] Swagger docs accessible at `http://localhost:8000/docs`
- [x] Frontend running on `http://localhost:5173`
- [x] User Sign up / Sign in functional
