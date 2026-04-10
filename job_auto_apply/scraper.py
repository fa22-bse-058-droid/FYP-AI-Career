from typing import Any, Dict, List


def _normalize_job(job: Dict[str, Any], source: str) -> Dict[str, Any]:
    return {
        "title": str(job.get("title", "")).strip(),
        "company": str(job.get("company", "")).strip(),
        "location": str(job.get("location", "")).strip(),
        "link": str(job.get("link", "")).strip(),
        "description": str(job.get("description", "")).strip(),
        "salary": str(job.get("salary", "")).strip(),
        "source": source,
        "eligible": False,
        "match_score": 0.0,
        "match_reasons": [],
    }


def _mock_jobs(role: str, location: str) -> List[Dict[str, Any]]:
    target_role = role or "Software Engineer"
    target_location = location or "Remote"
    base = [
        {
            "title": f"{target_role}",
            "company": "TechNova Labs",
            "location": target_location,
            "link": "https://example.com/jobs/tn-001",
            "description": "Python, SQL, APIs, teamwork, problem solving, backend systems.",
            "salary": "90000-120000",
        },
        {
            "title": f"Junior {target_role}",
            "company": "DataSphere",
            "location": target_location,
            "link": "https://example.com/jobs/ds-002",
            "description": "Machine learning, Python, pandas, feature engineering, communication.",
            "salary": "70000-95000",
        },
        {
            "title": f"{target_role} (Automation)",
            "company": "CloudBridge",
            "location": "Hybrid",
            "link": "https://example.com/jobs/cb-003",
            "description": "Selenium, Playwright, CI/CD, testing, Git, Linux.",
            "salary": "85000-110000",
        },
        {
            "title": "Data Analyst",
            "company": "InsightWorks",
            "location": target_location,
            "link": "https://example.com/jobs/iw-004",
            "description": "SQL, dashboards, Tableau, Python, statistics.",
            "salary": "65000-85000",
        },
        {
            "title": "AI Engineer",
            "company": "NeuronStack",
            "location": "Remote",
            "link": "https://example.com/jobs/ns-005",
            "description": "NLP, transformers, PyTorch, deployment, MLOps.",
            "salary": "110000-150000",
        },
    ]
    return base


def scrape_jobs(role: str, location: str) -> List[Dict[str, Any]]:
    jobs = _mock_jobs(role=role, location=location)
    return [_normalize_job(job, source="mock_source") for job in jobs]

