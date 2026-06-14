#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  bash tests/run_locale_check.sh \
    --tz "America/Toronto" \
    --region "Toronto" \
    --phone "+14165550137" \
    --date "1990-04-17" \
    --locale "en-CA" \
    --reporter "contributor-name"
USAGE
}

TZ_VAL=""
REGION=""
PHONE=""
DATE_VAL=""
LOCALE_TAG=""
REPORTER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tz) TZ_VAL="${2:-}"; shift 2 ;;
    --region) REGION="${2:-}"; shift 2 ;;
    --phone) PHONE="${2:-}"; shift 2 ;;
    --date) DATE_VAL="${2:-}"; shift 2 ;;
    --locale) LOCALE_TAG="${2:-}"; shift 2 ;;
    --reporter) REPORTER="${2:-}"; shift 2 ;;
    --help) usage; exit 0 ;;
    *) echo "Unknown arg: $1"; usage; exit 2 ;;
  esac
done

missing=()
[[ -z "$TZ_VAL" ]] && missing+=(--tz)
[[ -z "$REGION" ]] && missing+=(--region)
[[ -z "$PHONE" ]] && missing+=(--phone)
[[ -z "$DATE_VAL" ]] && missing+=(--date)
[[ -z "$LOCALE_TAG" ]] && missing+=(--locale)
[[ -z "$REPORTER" ]] && missing+=(--reporter)

if (( ${#missing[@]} > 0 )); then
  echo "Missing required arguments: ${missing[*]}"
  usage
  exit 2
fi

[[ "$TZ_VAL" == */* ]] || { echo "Expected IANA timezone, got: $TZ_VAL"; exit 1; }
[[ "$PHONE" =~ ^\+[0-9]{10,15}$ ]] || { echo "Expected E.164 phone, got: $PHONE"; exit 1; }
[[ "$DATE_VAL" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || { echo "Expected ISO date, got: $DATE_VAL"; exit 1; }
[[ "$LOCALE_TAG" =~ ^[a-z]{2}-[A-Z]{2}$ ]] || { echo "Expected BCP-47 locale, got: $LOCALE_TAG"; exit 1; }

echo "Running package tests..."
npm test

echo "Running locale sample check for $REGION ($LOCALE_TAG) by $REPORTER..."
PHONE="$PHONE" DATE_VAL="$DATE_VAL" LOCALE_TAG="$LOCALE_TAG" node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import { formatDate, formatPhone, parsePhone } from './src/index.js';

const { PHONE, DATE_VAL, LOCALE_TAG } = process.env;
const formattedPhone = formatPhone(PHONE, LOCALE_TAG, { includeCode: true });
const parsedPhone = parsePhone(formattedPhone, LOCALE_TAG);
const formattedDate = formatDate(DATE_VAL, LOCALE_TAG);

assert.equal(parsedPhone, PHONE, `Expected ${PHONE}, got ${parsedPhone}`);
assert.match(formattedPhone, /^\+\d+ /, `Expected country code in ${formattedPhone}`);
assert.equal(typeof formattedDate, 'string');
assert.ok(formattedDate.length > 0);

console.log(`Phone: ${formattedPhone}`);
console.log(`Date: ${formattedDate}`);
NODE

echo "Locale regression check passed"
