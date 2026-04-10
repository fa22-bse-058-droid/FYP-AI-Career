"""
Job scraping and permission-gated auto-apply module.
"""

from .service import (
    save_uploaded_cv,
    scrape_jobs_for_cv,
    get_matched_jobs,
    update_filters,
    get_filters,
    set_auto_apply_permission,
    get_auto_apply_permission,
    trigger_auto_apply,
    get_application_logs,
)

