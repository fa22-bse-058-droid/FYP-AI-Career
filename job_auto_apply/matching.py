import re
from typing import Any, Dict, List, Set

MAX_MATCH_REASONS = 15

def extract_cv_keywords(cv_text: str, skills: Dict[str, List[str]]) -> Set[str]:
    raw_tokens = re.findall(r"[A-Za-z][A-Za-z0-9+#.\-]{1,30}", cv_text or "")
    token_counts: Dict[str, int] = {}
    for token in raw_tokens:
        lower = token.lower()
        token_counts[lower] = token_counts.get(lower, 0) + 1

    frequent = {t for t, c in token_counts.items() if c >= 2 and len(t) > 2}
    skill_tokens = {
        s.lower() for s in (skills.get("technical", []) + skills.get("soft", [])) if s
    }
    return frequent | skill_tokens


def _parse_salary_range(salary_str: str) -> tuple:
    nums = [int(n) for n in re.findall(r"\d+", salary_str or "")]
    if not nums:
        return 0, 0
    if len(nums) == 1:
        return nums[0], nums[0]
    return min(nums), max(nums)


def _job_matches_filters(job: Dict[str, Any], filters: Dict[str, Any]) -> bool:
    role = (filters.get("role") or "").lower().strip()
    location = (filters.get("location") or "").lower().strip()
    job_type = (filters.get("job_type") or "Any").lower().strip()
    blacklist = [b.lower().strip() for b in filters.get("blacklist", []) if b]

    combined = " ".join(
        [str(job.get("title", "")), str(job.get("company", "")), str(job.get("description", ""))]
    ).lower()

    if role and role not in (job.get("title", "").lower()):
        return False
    if location and location not in (job.get("location", "").lower()):
        return False
    if job_type and job_type != "any" and job_type not in combined:
        return False
    if any(term in combined for term in blacklist):
        return False

    min_salary = int(filters.get("salary_min") or 0)
    max_salary = int(filters.get("salary_max") or 0)
    low, high = _parse_salary_range(str(job.get("salary", "")))
    if min_salary and high and high < min_salary:
        return False
    if max_salary and low and low > max_salary:
        return False
    return True


def mark_eligible_jobs(
    jobs: List[Dict[str, Any]],
    cv_keywords: Set[str],
    filters: Dict[str, Any],
    min_match_score: int = 20,
) -> List[Dict[str, Any]]:
    scored_jobs: List[Dict[str, Any]] = []
    for job in jobs:
        description = f"{job.get('title', '')} {job.get('description', '')}".lower()
        hits = sorted({kw for kw in cv_keywords if kw and kw in description})
        denominator = max(len(cv_keywords), 1)
        score = round((len(hits) / denominator) * 100, 2)

        allowed_by_filters = _job_matches_filters(job, filters)
        eligible = allowed_by_filters and score >= min_match_score

        normalized = dict(job)
        normalized["match_score"] = score
        normalized["match_reasons"] = hits[:MAX_MATCH_REASONS]
        normalized["eligible"] = eligible
        scored_jobs.append(normalized)

    return sorted(scored_jobs, key=lambda x: x.get("match_score", 0), reverse=True)
