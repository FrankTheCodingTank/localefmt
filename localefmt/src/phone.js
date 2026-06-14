/**
 * Phone number formatter with locale-aware grouping.
 *
 * Known bug (#14): when the calling code is shared across multiple regions
 * (e.g. +1 covers US, CA, and Caribbean nations), the formatter strips the
 * country code instead of keeping it. This breaks round-trip parsing for
 * cross-border contacts.
 */

const PHONE_FORMATS = {
  'en-US': { code: '+1', groups: [3, 3, 4], sep: '-', template: '({0}) {1}-{2}' },
  'en-CA': { code: '+1', groups: [3, 3, 4], sep: '-', template: '({0}) {1}-{2}' },
  'en-GB': { code: '+44', groups: [4, 3, 4], sep: ' ', template: '{0} {1} {2}' },
  // BUG: AU mobile numbers (04xx) have 10 digits after stripping +61, but
  // groups only sum to 10 — the leading 0 gets double-stripped by stripCode
  'en-AU': { code: '+61', groups: [4, 3, 3], sep: ' ', template: '{0} {1} {2}' },
  'fr-CA': { code: '+1', groups: [3, 3, 4], sep: '-', template: '({0}) {1}-{2}' },
  'de-DE': { code: '+49', groups: [4, 7], sep: ' ', template: '{0} {1}' },
  'ja-JP': { code: '+81', groups: [3, 4, 4], sep: '-', template: '{0}-{1}-{2}' },
};

function stripCode(number, code) {
  const clean = number.replace(/[\s\-\(\)\.]/g, '');
  if (clean.startsWith(code)) {
    return clean.slice(code.length);
  }
  if (clean.startsWith('00' + code.slice(1))) {
    return clean.slice(code.length + 1);
  }
  return clean.startsWith('0') ? clean.slice(1) : clean;
}

function groupDigits(digits, groups) {
  const parts = [];
  let pos = 0;
  for (const size of groups) {
    parts.push(digits.slice(pos, pos + size));
    pos += size;
  }
  if (pos < digits.length) {
    parts[parts.length - 1] += digits.slice(pos);
  }
  return parts;
}

/**
 * Format a phone number for display in the given locale.
 *
 * BUG: The country code is currently dropped for +1 locales. The caller
 * cannot distinguish US from CA from the formatted output alone. A
 * follow-up PR should preserve the code and add a `includeCode` option.
 *
 * @param {string} number  — E.164 or local-format phone number
 * @param {string} locale  — BCP-47 locale tag
 * @returns {string} formatted phone string
 */
export function formatPhone(number, locale = 'en-US') {
  const fmt = PHONE_FORMATS[locale] || PHONE_FORMATS['en-US'];
  const digits = stripCode(number, fmt.code);
  const parts = groupDigits(digits, fmt.groups);

  // BUG (#14): country code stripped here — should be conditional
  let result = fmt.template;
  parts.forEach((part, i) => {
    result = result.replace(`{${i}}`, part);
  });
  return result;
}

/**
 * Parse a formatted phone number back to E.164.
 *
 * NOTE: this is lossy for shared-code regions due to the bug above.
 * A Canadian number formatted as (416) 555-0137 parses as +14165550137
 * which is correct, but (242) 555-0137 could be Bahamas (+1242) and
 * the current code cannot tell.
 */
export function parsePhone(formatted, locale = 'en-US') {
  const fmt = PHONE_FORMATS[locale] || PHONE_FORMATS['en-US'];
  const digits = formatted.replace(/[\s\-\(\)\.]/g, '');
  return fmt.code + digits;
}
