"""
FastAPI backend for AI Career platform.

Wraps analyzer and job_auto_apply modules with JWT auth and REST endpoints.
"""

import sys
import os
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add project root to path so we can import analyzer and job_auto_apply
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from jose import JWTError, jwt
from passlib.context import CryptContext

# ---------------------------------------------------------------------------
# Try to import analyzer modules (graceful degradation if deps missing)
# ---------------------------------------------------------------------------
try:
    from analyzer.parser import extract_text_from_bytes
    from analyzer.skills import extract_skills
    from analyzer.scorer import calculate_score
    from analyzer.gap import detect_skill_gaps
    from analyzer.similarity import calculate_similarity
    from analyzer.suggestions import generate_suggestions

    _ANALYZER_AVAILABLE = True
except Exception as _analyzer_err:
    logging.warning(f"Analyzer modules unavailable: {_analyzer_err}")
    _ANALYZER_AVAILABLE = False

try:
    from job_auto_apply.service import (
        get_filters,
        update_filters,
        scrape_jobs_for_cv,
        get_matched_jobs,
        trigger_auto_apply,
        get_application_logs,
        save_uploaded_cv,
    )

    _JOBS_AVAILABLE = True
except Exception as _jobs_err:
    logging.warning(f"Job auto-apply modules unavailable: {_jobs_err}")
    _JOBS_AVAILABLE = False

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "CHANGE-ME-in-production-please")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-memory user store  {username: {email, hashed_password}}
# ---------------------------------------------------------------------------
_users: Dict[str, Dict[str, str]] = {}

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="AI Career API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    username: str
    email: str


class FilterRequest(BaseModel):
    role: Optional[str] = ""
    location: Optional[str] = ""
    salary_min: Optional[int] = 0
    salary_max: Optional[int] = 0
    job_type: Optional[str] = "Any"
    blacklist: Optional[List[str]] = []


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------


def _hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def _get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Dict[str, str]:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        if not username or username not in _users:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = _users[username]
        return {"username": username, "email": user["email"]}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------


@app.post("/auth/signup", response_model=TokenResponse)
def signup(body: SignupRequest):
    if body.username in _users:
        raise HTTPException(status_code=400, detail="Username already registered")
    # Check duplicate email
    for u in _users.values():
        if u["email"] == body.email:
            raise HTTPException(status_code=400, detail="Email already registered")

    _users[body.username] = {
        "email": body.email,
        "hashed_password": _hash_password(body.password),
    }
    token = _create_token({"sub": body.username})
    return TokenResponse(access_token=token)


@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginRequest):
    # Find user by email
    found_username: Optional[str] = None
    for username, data in _users.items():
        if data["email"] == body.email:
            found_username = username
            break

    if not found_username or not _verify_password(
        body.password, _users[found_username]["hashed_password"]
    ):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = _create_token({"sub": found_username})
    return TokenResponse(access_token=token)


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: Dict = Depends(_get_current_user)):
    return UserResponse(**current_user)


# ---------------------------------------------------------------------------
# CV Analysis endpoint
# ---------------------------------------------------------------------------


@app.post("/api/analyze")
async def analyze_cv(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    current_user: Dict = Depends(_get_current_user),
):
    if not _ANALYZER_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Analyzer modules are not available. Please check backend dependencies.",
        )

    # Validate file type
    filename = file.filename or "upload"
    ext = Path(filename).suffix.lower()
    if ext not in {".pdf", ".docx", ".txt"}:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported")
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

    try:
        cv_text = extract_text_from_bytes(file_bytes, filename)
    except Exception as e:
        logger.error(f"Text extraction failed: {e}")
        raise HTTPException(status_code=422, detail=f"Could not extract text from file: {e}")

    if not cv_text or not cv_text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in the uploaded file")

    try:
        skills = extract_skills(cv_text)
    except Exception as e:
        logger.warning(f"Skill extraction failed: {e}")
        skills = {"technical": [], "soft": []}

    try:
        score_data = calculate_score(cv_text, skills)
    except Exception as e:
        logger.warning(f"CV scoring failed: {e}")
        score_data = {"overall_score": 0, "breakdown": {}}

    try:
        gaps = detect_skill_gaps(skills)
    except Exception as e:
        logger.warning(f"Gap detection failed: {e}")
        gaps = {"missing_skills": [], "coverage_percentage": 0}

    try:
        similarity = calculate_similarity(cv_text, job_description)
    except Exception as e:
        logger.warning(f"Similarity calculation failed: {e}")
        similarity = 0.0

    try:
        suggestions = generate_suggestions(score_data, skills, gaps)
    except Exception as e:
        logger.warning(f"Suggestion generation failed: {e}")
        suggestions = []

    return {
        "filename": filename,
        "cv_text_length": len(cv_text),
        "skills": skills,
        "score": score_data,
        "gap_analysis": gaps,
        "similarity_score": similarity,
        "suggestions": suggestions,
    }


# ---------------------------------------------------------------------------
# Job auto-apply endpoints
# ---------------------------------------------------------------------------


@app.get("/api/jobs/filters")
def get_job_filters(current_user: Dict = Depends(_get_current_user)):
    if not _JOBS_AVAILABLE:
        return {
            "role": "",
            "location": "",
            "salary_min": 0,
            "salary_max": 0,
            "job_type": "Any",
            "blacklist": [],
        }
    try:
        return get_filters()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/jobs/filters")
def set_job_filters(
    body: FilterRequest, current_user: Dict = Depends(_get_current_user)
):
    if not _JOBS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Job modules unavailable")
    try:
        update_filters(body.model_dump())
        return {"status": "updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/jobs/scrape")
async def scrape_jobs_endpoint(
    file: Optional[UploadFile] = File(None),
    cv_text: Optional[str] = Form(None),
    current_user: Dict = Depends(_get_current_user),
):
    if not _JOBS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Job modules unavailable")

    text = cv_text or ""
    if file and not text:
        try:
            file_bytes = await file.read()
            filename_str = file.filename or "upload"
            if _ANALYZER_AVAILABLE:
                text = extract_text_from_bytes(file_bytes, filename_str) or ""
        except Exception as e:
            logger.warning(f"Could not extract text for scraping: {e}")

    try:
        jobs = scrape_jobs_for_cv(text)
        return {"jobs_found": len(jobs), "jobs": jobs}
    except Exception as e:
        logger.error(f"Job scraping failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs/matched")
def get_matched_jobs_endpoint(current_user: Dict = Depends(_get_current_user)):
    if not _JOBS_AVAILABLE:
        return {"jobs": []}
    try:
        return {"jobs": get_matched_jobs()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/jobs/apply")
def apply_jobs(current_user: Dict = Depends(_get_current_user)):
    if not _JOBS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Job modules unavailable")
    try:
        result = trigger_auto_apply()
        return result
    except Exception as e:
        logger.error(f"Auto-apply failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jobs/logs")
def get_logs(current_user: Dict = Depends(_get_current_user)):
    if not _JOBS_AVAILABLE:
        return {"logs": []}
    try:
        return {"logs": get_application_logs()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health")
def health():
    return {
        "status": "ok",
        "analyzer_available": _ANALYZER_AVAILABLE,
        "jobs_available": _JOBS_AVAILABLE,
    }
