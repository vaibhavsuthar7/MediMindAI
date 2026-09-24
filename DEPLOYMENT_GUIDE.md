# 🚀 MediMind AI — Full Production Deployment Guide

Yeh guide **MediMind AI** platform ko internet par live deploy karne ke liye step-by-step instructions provide karta hai.

---

## 🏗️ Deployment Architecture Overview

MediMind AI ke 2 main components hain:
1. **Frontend**: React + Vite + Tailwind CSS (SPA)
2. **Backend**: FastAPI (Python) + ChromaDB + PyTorch + SQLite/PostgreSQL

Aapke paas **2 best deployment methods** hain:
- **Method 1 (Recommended & Easiest / Free)**: **Vercel** (Frontend) + **Render / Railway** (Backend)
- **Method 2 (Single Server / VPS)**: **Docker Compose** (AWS EC2 / DigitalOcean / Hostinger VPS)

---

## 🌟 Method 1: Cloud Deployment (Vercel + Render) [RECOMMENDED]

### 1️⃣ Code ko GitHub par Push karein
Agar aapka project abhi GitHub par nahi hai:
```bash
git init
git add .
git commit -m "MediMind AI production ready"
# GitHub par new repository create karein aur connect karein:
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ Backend Deploy karein (Render.com ya Railway.app)

#### Option A: Render.com (Free Web Service)
1. [Render.com](https://render.com) par sign in karein.
2. **New +** > **Web Service** click karein.
3. Apna GitHub repo connect karein.
4. Settings enter karein:
   - **Name**: `medimind-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables** add karein:
   ```env
   LLM_API_KEY=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
   LLM_MODEL=meta/llama-3.1-8b-instruct
   LLM_BASE_URL=https://integrate.api.nvidia.com/v1
   JWT_SECRET=your_super_strong_secret_key_here
   DATABASE_URL=sqlite:///./medimind.db
   ALLOW_ALL_CORS=true
   ```
6. **Deploy Web Service** click karein.
7. Deployment complete hone ke baad aapko backend URL milega (e.g. `https://medimind-backend.onrender.com`).
8. URL verify karein: `https://medimind-backend.onrender.com/api/health` -> `{"status":"ok"}`.

---

### 3️⃣ Frontend Deploy karein (Vercel.com)

1. [Vercel.com](https://vercel.com) par login karein.
2. **Add New...** > **Project** select karein.
3. Apna GitHub repository import karein.
4. Settings configure karein:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* aur select karein `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables** section open karein aur add karein:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: Apna Render backend URL (e.g. `https://medimind-backend.onrender.com`)
6. **Deploy** button click karein.
7. 1 minute mein aapki website live ho jayegi (e.g. `https://medimind-ai.vercel.app`)! 🎉

---

## 🐳 Method 2: Single Server / VPS Deployment (Docker Compose)

Agar aapke paas **AWS EC2, DigitalOcean Droplet, ya Hostinger VPS** hai:

1. Server par Git aur Docker install karein:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose git
   ```
2. Repository clone karein:
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/medimind.git
   cd medimind
   ```
3. Backend `.env` check karein:
   ```bash
   cp backend/.env.example backend/.env
   nano backend/.env
   ```
4. Ek single command se pura stack start karein:
   ```bash
   docker compose up -d --build
   ```
5. Status check karein:
   ```bash
   docker compose ps
   ```
6. Aapka application server ke public IP par live ho jayega:
   - **Frontend**: `http://<YOUR_SERVER_IP>`
   - **Backend API**: `http://<YOUR_SERVER_IP>:8000`

---

## 🔐 Environment Variables Summary

| Variable Name | Kahan Use Hota Hai | Example Value |
|---|---|---|
| `LLM_API_KEY` | Backend | NVIDIA NIM / Groq API key |
| `LLM_MODEL` | Backend | `meta/llama-3.1-8b-instruct` |
| `LLM_BASE_URL` | Backend | `https://integrate.api.nvidia.com/v1` |
| `JWT_SECRET` | Backend | Random 64-character secret string |
| `DATABASE_URL` | Backend | `sqlite:///./medimind.db` ya PostgreSQL URL |
| `VITE_API_BASE_URL` | Frontend | Deployed backend URL (e.g. `https://api.yourdomain.com`) |

---

## ✅ Deployment Checklist

- [x] Backend CORS configured for Vercel & custom domains
- [x] Frontend dynamic API Base URL support added
- [x] `vercel.json` SPA rewrite configured
- [x] Dockerfile & Docker Compose configured
- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render / Railway / VPS
- [ ] Frontend deployed on Vercel with `VITE_API_BASE_URL`
