# Job Scraping + Auto-Apply Module

## Repository Analysis

### Current architecture
- **Framework/UI**: Streamlit app (`app.py`) with analyzer modules in `analyzer/`.
- **Main entry point**: `app.py` (run with `streamlit run app.py`).
- **Core CV flow**:
  1. User uploads CV in `app.py::_upload_section`.
  2. Text extraction via `analyzer/parser.py`.
  3. Skill extraction via `analyzer/skills.py`.
  4. Scoring/gap/suggestions/similarity via analyzer modules.
  5. Results shown in Streamlit sections.

### New integration location
- Added new package: `job_auto_apply/`.
- Integrated into `app.py` via `_job_auto_apply_section()`.
- CV upload now also stores CV in secure local storage for auto-apply usage.

## End-to-end Workflow

1. **Upload CV**
   - Existing uploader in `app.py` processes PDF/DOCX and now calls secure CV storage.
2. **Set filters**
   - Role, location, salary min/max, job type, blacklist.
3. **Scrape jobs**
   - Current implementation uses deterministic mock scraping (`job_auto_apply/scraper.py`) for blocked/no-source environments.
4. **Normalize + store**
   - Every job normalized to:
     - `title`, `company`, `location`, `link`, `description`, `salary`, `source`
5. **CV-based match**
   - Keywords extracted from CV text + extracted skills.
   - Combined with user filters and blacklist.
   - Jobs marked `eligible` with `match_score` and `match_reasons`.
6. **Permission gate**
   - Auto-apply only runs when permission is enabled.
7. **Auto-apply**
   - Selenium automation attempts application.
   - Captcha/unknown forms are stopped safely and logged.
   - Retry policy: at most one retry.
8. **Logs**
   - Every attempt logged with timestamp, status, reason, attempts, job metadata.

## Streamlit Actions (UI Endpoints)

Implemented in `app.py::_job_auto_apply_section()`:

- **Upload CV**: existing upload component (now also saved securely)
- **Set filters**: `💾 Save Filters`
- **Grant/revoke permission**: `🔐 Update Permission` with checkbox `Allow Auto-Apply`
- **List matched jobs**: `✅ Matched / Eligible Jobs` table
- **Trigger auto-apply**: `🤖 Trigger Auto-Apply`
- **View logs**: `📝 Auto-Apply Logs` table

## Data Models / Storage

Storage file: `data/job_auto_apply_store.json`  
Secure CV folder: `data/secure_cv/`

Schema:

```json
{
  "jobs": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "link": "string",
      "description": "string",
      "salary": "string",
      "source": "string",
      "eligible": "bool",
      "match_score": "number",
      "match_reasons": ["string"]
    }
  ],
  "filters": {
    "role": "string",
    "location": "string",
    "salary_min": "int",
    "salary_max": "int",
    "job_type": "string",
    "blacklist": ["string"]
  },
  "permissions": {
    "auto_apply_enabled": "bool",
    "updated_at": "ISO timestamp"
  },
  "auto_apply_rules": {
    "min_match_score": "int",
    "require_salary": "bool",
    "max_retries_per_job": "int"
  },
  "cv": {
    "id": "sha256",
    "file_name": "string",
    "path": "string",
    "uploaded_at": "ISO timestamp"
  },
  "application_logs": [
    {
      "timestamp": "ISO timestamp",
      "job_title": "string",
      "company": "string",
      "job_link": "string",
      "status": "success|failed|stopped",
      "reason": "string",
      "attempts": "int"
    }
  ]
}
```

## Security + Logging

- CV bytes are stored in `data/secure_cv/` using SHA-256 filename hashes.
- POSIX permissions are tightened where supported (`0700` dirs, `0600` files).
- Auto-apply is hard-gated by explicit permission flag.
- Captcha detection and unknown apply forms cause safe stop (not forced automation).
- Every attempt is logged with reason and timestamp for transparency/auditability.

## Setup Notes

- Core app still runs with:
  - `pip install -r requirements.txt`
  - `streamlit run app.py`
- Auto-apply automation uses Selenium if available at runtime.
  - If Selenium/browser driver is missing, attempts are logged as failed with setup reason.
- **TODO (future hardening)**:
  - Replace local JSON store with a real DB for multi-user concurrency.
  - Add real auth/authorization per user before enabling auto-apply.
  - Integrate real job providers/APIs and per-source adapters.

