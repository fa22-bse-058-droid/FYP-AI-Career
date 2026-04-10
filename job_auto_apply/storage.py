import json
import os
import tempfile
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Any, Dict, List, Optional


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
CV_DIR = DATA_DIR / "secure_cv"
STORE_PATH = DATA_DIR / "job_auto_apply_store.json"
MAX_APPLICATION_LOGS = 500


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_mkdir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)
    if os.name == "posix":
        os.chmod(path, 0o700)


def _ensure_store() -> None:
    _safe_mkdir(DATA_DIR)
    _safe_mkdir(CV_DIR)
    if not STORE_PATH.exists():
        initial = {
            "jobs": [],
            "filters": {
                "role": "",
                "location": "",
                "salary_min": 0,
                "salary_max": 0,
                "job_type": "Any",
                "blacklist": [],
            },
            "permissions": {"auto_apply_enabled": False, "updated_at": _utc_now()},
            "auto_apply_rules": {
                "min_match_score": 20,
                "require_salary": False,
                "max_retries_per_job": 1,
            },
            "cv": None,
            "application_logs": [],
        }
        _write_store(initial)


def _read_store() -> Dict[str, Any]:
    _ensure_store()
    with open(STORE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_store(data: Dict[str, Any]) -> None:
    _ensure_store()
    with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8", dir=str(DATA_DIR)) as tmp:
        json.dump(data, tmp, indent=2)
        tmp.flush()
        os.fsync(tmp.fileno())
        tmp_path = tmp.name
    os.replace(tmp_path, STORE_PATH)
    if os.name == "posix":
        os.chmod(STORE_PATH, 0o600)


def save_cv_bytes(file_bytes: bytes, filename: str) -> Dict[str, str]:
    _ensure_store()
    digest = sha256(file_bytes).hexdigest()
    ext = Path(filename).suffix.lower() or ".bin"
    cv_path = CV_DIR / f"{digest}{ext}"
    if not cv_path.exists():
        with open(cv_path, "wb") as f:
            f.write(file_bytes)
        if os.name == "posix":
            os.chmod(cv_path, 0o600)

    store = _read_store()
    store["cv"] = {
        "id": digest,
        "file_name": Path(filename).name,
        "path": str(cv_path),
        "uploaded_at": _utc_now(),
    }
    _write_store(store)
    return store["cv"]


def get_cv_record() -> Optional[Dict[str, str]]:
    return _read_store().get("cv")


def save_jobs(jobs: List[Dict[str, Any]]) -> None:
    store = _read_store()
    store["jobs"] = jobs
    _write_store(store)


def get_jobs() -> List[Dict[str, Any]]:
    return _read_store().get("jobs", [])


def set_filters(filters: Dict[str, Any]) -> None:
    store = _read_store()
    store["filters"] = filters
    _write_store(store)


def get_filters() -> Dict[str, Any]:
    return _read_store().get("filters", {})


def set_permission(enabled: bool) -> None:
    store = _read_store()
    store["permissions"] = {"auto_apply_enabled": bool(enabled), "updated_at": _utc_now()}
    _write_store(store)


def get_permission() -> bool:
    return bool(_read_store().get("permissions", {}).get("auto_apply_enabled", False))


def get_auto_apply_rules() -> Dict[str, Any]:
    return _read_store().get("auto_apply_rules", {})


def set_auto_apply_rules(rules: Dict[str, Any]) -> None:
    store = _read_store()
    store["auto_apply_rules"] = rules
    _write_store(store)


def log_application(entry: Dict[str, Any]) -> None:
    store = _read_store()
    logs = store.get("application_logs", [])
    logs.append(entry)
    store["application_logs"] = logs[-MAX_APPLICATION_LOGS:]
    _write_store(store)


def get_application_logs() -> List[Dict[str, Any]]:
    return _read_store().get("application_logs", [])
