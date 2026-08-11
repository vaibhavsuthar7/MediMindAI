# MediMind AI — Frontend

React + Vite + Tailwind + Framer Motion dashboard for the MediMind AI
multi-agent healthcare platform.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173** and proxies `/api/*` requests to the
backend at `http://localhost:8000` (see `vite.config.js`). Make sure the
backend is running first (see `../backend/README.md`).

## Structure

```
src/
  api/client.js          # axios instance, auto-attaches JWT token
  context/AuthContext.jsx # login/signup/logout state
  components/
    Navbar.jsx            # top nav + signature animated pulse line
    PulseLine.jsx          # signature ECG-style SVG animation
    Layout.jsx              # protected route wrapper
    ui.jsx                    # Card, Button, Badge, Loader, etc.
  pages/
    Login.jsx / Signup.jsx
    Dashboard.jsx           # aggregate stats across all 5 agents
    Imaging.jsx             # Agent 1: X-ray upload + screening
    Symptoms.jsx            # Agent 2: symptom triage
    Reports.jsx             # Agent 3: report simplifier
    Medications.jsx         # Agent 4: medication interaction checker
    Chat.jsx                # Agent 5: RAG Q&A over patient history
```

## Design system

- **Palette**: deep teal/ink background (`#0D1B1E`), panel (`#142A2E`),
  vital teal accent (`#3FBF9F`), alert coral (`#FF6B5E`), amber for
  moderate warnings.
- **Type**: Fraunces (display/headings) + Inter (body) + IBM Plex Mono
  (data/numbers).
- **Signature element**: an animated ECG-style "pulse line" (`PulseLine.jsx`)
  running through the navbar — a visual metaphor for the multi-agent
  system being continuously "alive" and monitoring.

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — deploy to Vercel/Netlify, or serve via
FastAPI's `StaticFiles` from the backend for a single-deployment setup.
