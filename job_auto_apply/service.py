from datetime import datetime, timezone
from typing import Any, Dict, List

from analyzer.skills import extract_skills

from .auto_apply import attempt_apply_once
from .matching import extract_cv_keywords, mark_eligible_jobs
from .scraper import scrape_jobs
from .storage import (
    get_application_logs as _get_application_logs,
    get_auto_apply_rules,
    get_cv_record,
    get_filters as _get_filters,
    get_jobs,
    get_permission,
    log_application,
    save_cv_bytes,
    save_jobs,
    set_filters as _set_filters,
    set_permission as _set_permission,
)


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def save_uploaded_cv(file_bytes: bytes, filename: str) -> Dict[str, str]:
    return save_cv_bytes(file_bytes, filename)


def update_filters(filters: Dict[str, Any]) -> None:
    normalized = {
        "role": (filters.get("role") or "").strip(),
        "location": (filters.get("location") or "").strip(),
        "salary_min": int(filters.get("salary_min") or 0),
        "salary_max": int(filters.get("salary_max") or 0),
        "job_type": (filters.get("job_type") or "Any").strip(),
        "blacklist": [b.strip() for b in filters.get("blacklist", []) if b and b.strip()],
    }
    _set_filters(normalized)


def get_filters() -> Dict[str, Any]:
    return _get_filters()


def set_auto_apply_permission(enabled: bool) -> None:
    _set_permission(bool(enabled))


def get_auto_apply_permission() -> bool:
    return get_permission()


def scrape_jobs_for_cv(cv_text: str) -> List[Dict[str, Any]]:
    filters = _get_filters()
    role = filters.get("role", "")
    location = filters.get("location", "")
    scraped = scrape_jobs(role=role, location=location)
    skills = extract_skills(cv_text or "")
    keywords = extract_cv_keywords(cv_text or "", skills)
    rules = get_auto_apply_rules()
    min_match_score = int(rules.get("min_match_score", 20))
    matched = mark_eligible_jobs(scraped, keywords, filters, min_match_score=min_match_score)
    save_jobs(matched)
    return matched


def get_matched_jobs() -> List[Dict[str, Any]]:
    return [job for job in get_jobs() if job.get("eligible")]


def trigger_auto_apply() -> Dict[str, Any]:
    if not get_permission():
        return {
            "triggered": False,
            "reason": "Auto-apply permission is disabled",
            "applied_count": 0,
            "attempted_count": 0,
        }

    cv = get_cv_record()
    if not cv:
        return {
            "triggered": False,
            "reason": "No CV uploaded in secure storage",
            "applied_count": 0,
            "attempted_count": 0,
        }

    rules = get_auto_apply_rules()
    max_retries = int(rules.get("max_retries_per_job", 1))
    # Total attempts = initial attempt + configured retry count.
    total_attempts = max(1, max_retries + 1)
    eligible_jobs = [job for job in get_jobs() if job.get("eligible")]
    applied_count = 0

    for job in eligible_jobs:
        attempts = 0
        final_result = None
        while attempts < total_attempts:
            attempts += 1
            result = attempt_apply_once(job, cv["path"])
            final_result = result
            if result["status"] == "success":
                break
            if result["status"] == "stopped":
                break

        if final_result and final_result["status"] == "success":
            applied_count += 1

        log_application(
            {
                "timestamp": _utc_now(),
                "job_title": job.get("title", ""),
                "company": job.get("company", ""),
                "job_link": job.get("link", ""),
                "status": final_result["status"] if final_result else "failed",
                "reason": final_result["reason"] if final_result else "Unknown apply error",
                "attempts": attempts,
            }
        )

    return {
        "triggered": True,
        "reason": "Auto-apply run finished",
        "applied_count": applied_count,
        "attempted_count": len(eligible_jobs),
    }


def get_application_logs() -> List[Dict[str, Any]]:
    return list(reversed(_get_application_logs()))
