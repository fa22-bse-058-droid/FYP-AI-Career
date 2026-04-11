# AI Career — Setup & Run Guide

A modern AI-powered career platform with a dark cosmic React frontend and FastAPI backend.

---

## Project Structure

```
FYP-AI-Career/
├── backend/
│   ├── main.py               ← FastAPI entry point
│   └── requirements.txt      ← Backend Python deps
├── frontend/
│   ├── src/
│   │   ├── pages/            ← Landing, Login, Signup, Dashboard, Analyzer, Jobs
│   │   ├── components/       ← Navbar, ParticleBackground, ProtectedRoute
│   │   ├── contexts/         ← AuthContext (JWT)
│   │   └── api/              ← Axios client
│   ├── package.json
│   └── vite.config.ts
├── analyzer/                 ← Python AI analyzer modules
├── job_auto_apply/           ← Job scraping & auto-apply modules
└── models/                   ← skill_db.json, market_skills.json
```

---

## Quick Start

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
pip install -r ../requirements.txt   # Install analyzer deps
python -m spacy download en_core_web_sm

uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

### 2. Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Features

| Module | Description |
|--------|-------------|
| 🔐 Auth | JWT-based signup/login |
| 📄 CV Analyzer | AI-powered CV scoring, skill extraction, gap analysis |
| 🔍 Job Matching | Semantic similarity with job descriptions |
| 🚀 Auto Apply | Automated job application submission |

## Notes

- **spaCy** is optional but recommended — without it the app falls back to keyword-only skill extraction.
- **sentence-transformers** is optional — without it the similarity score shows 0%.
- The first run of sentence-transformers downloads the `all-MiniLM-L6-v2` model (~90 MB) automatically.
- The backend uses an in-memory user store. Data resets on server restart.

---

## Fixes applied vs original code

| # | Problem | Fixed in |
|---|---------|---------|
| 1 | `_init_.py` → `__init__.py` | `analyzer/__init__.py` |
| 2 | `suggerstions.py` typo | renamed to `suggestions.py` |
| 3 | `utilites.py` typo + wrong import in app.py | renamed to `utilities.py` |
| 4 | Score breakdown keys mismatched between scorer/suggestions/app | `scorer.py`, `suggestions.py`, `app.py` |
| 5 | Double analysis run on every page reload | `app.py` (cached in session_state) |
| 6 | Unsafe temp files (not cleaned on exception) | `parser.py` → `extract_text_from_bytes()` |
| 7 | `clean_text()` destroyed newlines, breaking section detection | `parser.py` |
| 8 | `sentence-transformers` missing from requirements | `requirements.txt` |
| 9 | spaCy NLP not integrated (SRS requirement) | `skills.py` |
| 10 | Hardcoded year 2026 in experience calculator | `utilities.py` |
| 11 | Duplicate entries in skill_db.json | `models/skill_db.json` |
| 12 | No job description input for user (SRS requirement) | sidebar in `app.py` |
| 13 | No gap visualization chart (SRS requirement) | `app.py` donut chart |
| 14 | `st.pyplot()` deprecation | replaced with `st.plotly_chart()` |
| 15 | `validate_file()` didn't return error message | `utilities.py` returns `(bool, str)` |