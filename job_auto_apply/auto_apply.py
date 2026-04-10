from datetime import datetime, timezone
from typing import Any, Dict


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def attempt_apply_once(job: Dict[str, Any], cv_path: str) -> Dict[str, Any]:
    link = str(job.get("link", "")).strip()
    if not link.startswith("http"):
        return {
            "status": "failed",
            "reason": "Invalid job link",
            "timestamp": _utc_now(),
        }

    if "captcha" in link.lower():
        return {
            "status": "stopped",
            "reason": "Captcha suspected from URL; stopped safely",
            "timestamp": _utc_now(),
        }

    try:
        from selenium import webdriver
        from selenium.common.exceptions import TimeoutException
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.chrome.options import Options as ChromeOptions
    except Exception:
        return {
            "status": "failed",
            "reason": "Selenium is not installed/configured; install selenium + browser driver",
            "timestamp": _utc_now(),
        }

    driver = None
    try:
        options = ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(20)
        driver.get(link)

        page = driver.page_source.lower()
        if "captcha" in page or "recaptcha" in page or "hcaptcha" in page:
            return {
                "status": "stopped",
                "reason": "Captcha detected; stopped safely",
                "timestamp": _utc_now(),
            }

        # Known apply buttons only; otherwise stop to avoid unsafe automation.
        apply_xpath = (
            "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply')]"
            "|//a[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'apply')]"
        )
        apply_buttons = driver.find_elements(By.XPATH, apply_xpath)
        if not apply_buttons:
            return {
                "status": "stopped",
                "reason": "Unknown form/page structure; no known Apply button",
                "timestamp": _utc_now(),
            }
        apply_buttons[0].click()

        upload_fields = driver.find_elements(By.CSS_SELECTOR, "input[type='file']")
        if not upload_fields:
            return {
                "status": "stopped",
                "reason": "Unknown apply form; CV upload input not found",
                "timestamp": _utc_now(),
            }
        upload_fields[0].send_keys(cv_path)

        submit_selectors = [
            "//button[@type='submit']",
            "//input[@type='submit']",
            "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'submit')]",
        ]
        submitted = False
        for sel in submit_selectors:
            nodes = driver.find_elements(By.XPATH, sel)
            if nodes:
                nodes[0].click()
                submitted = True
                break

        if not submitted:
            return {
                "status": "stopped",
                "reason": "Unknown apply form; submit control not found",
                "timestamp": _utc_now(),
            }

        WebDriverWait(driver, 8).until(
            EC.any_of(
                EC.url_changes(link),
                EC.presence_of_element_located((By.XPATH, "//*[contains(., 'thank you') or contains(., 'application submitted')]")),
            )
        )
        return {"status": "success", "reason": "Application submitted", "timestamp": _utc_now()}
    except TimeoutException:
        return {"status": "failed", "reason": "Timeout during apply workflow", "timestamp": _utc_now()}
    except Exception as e:
        return {"status": "failed", "reason": f"Automation error: {e}", "timestamp": _utc_now()}
    finally:
        if driver is not None:
            driver.quit()

