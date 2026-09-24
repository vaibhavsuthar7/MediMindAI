@echo off
title MediMind AI - Launcher
echo ===================================================
echo           Starting MediMind AI Platform
echo ===================================================

cd /d "%~dp0"

echo [1/2] Starting Backend (FastAPI on Port 8000)...
start "MediMind AI - Backend" cmd /k "cd /d "%~dp0backend" && .\venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (Vite on Port 5173)...
start "MediMind AI - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo MediMind AI is running!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
echo ===================================================
pause
