/**
 * Phone number formatter with locale-aware grouping.
 *
 * Supports locale-aware national display plus optional country-code display
 * for lossy shared calling-code regions such as NANP (+1).
 */

const PHONE_FORMATS = {
  'en-US': { code: '+1', groups: [3, 3, 4], template: '({0}) {1}-{2}' },
  'en-CA': { code: '+1', groups: [3, 3, 4], template: '({0}) {1}-{2}' },
  'en-GB': { code: '+44', nationalPrefix: '0', groups: [3, 4, 4], template: '{0} {1} {2}' },
  'en-AU': { code: '+61', nationalPrefix: '0', groups: [4, 3, 3], template: '{0} {1} {2}' },
  'fr-CA': { code: '+1', groups: [3, 3, 4], template: '({0}) {1}-{2}' },
  'de-DE': { code: '+49', nationalPrefix: '0', groups: [4, 7], template: '{0} {1}' },
  'ja-JP': { code: '+81', nationalPrefix: '0', groups: [3, 4, 4], template: '{0}-{1}-{2}' },
};

function cleanNumber(number) {
  return String(number).replace(/[^\d+]/g, '');
}

function stripCode(number, fmt) {
  const clean = cleanNumber(number);
  const internationalPrefix = `00${fmt.code.slice(1)}`;
  let digits = clean;

  if (digits.startsWith(fmt.code)) {
    digits = digits.slice(fmt.code.length);
  } else if (digits.startsWith(internationalPrefix)) {
    digits = digits.slice(internationalPrefix.length);
  } else {
    return digits;
  }

  if (fmt.nationalPrefix && !digits.startsWith(fmt.nationalPrefix)) {
    return `${fmt.nationalPrefix}${digits}`;
  }

  return digits;
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

function applyTemplate(parts, template) {
  return parts.reduce(
    (result, part, index) => result.replace(`{${index}}`, part),
    template,
  );
}

function parseOptions(options) {
  if (typeof options === 'boolean') {
    return { includeCode: options };
  }
  return options || {};
}

function stripNationalPrefix(digits, fmt) {
  if (fmt.nationalPrefix && digits.startsWith(fmt.nationalPrefix)) {
    return digits.slice(fmt.nationalPrefix.length);
  }
  return digits;
}

/**
 * Format a phone number for display in the given locale.
 *
 * @param {string} number - E.164 or local-format phone number
 * @param {string} locale - BCP-47 locale tag
 * @param {object|boolean} options - pass { includeCode: true } or true to keep the country code
 * @returns {string} formatted phone string
 */
export function formatPhone(number, locale = 'en-US', options = {}) {
  const fmt = PHONE_FORMATS[locale] || PHONE_FORMATS['en-US'];
  const { includeCode = false } = parseOptions(options);
  const digits = stripCode(number, fmt);
  const parts = groupDigits(digits, fmt.groups);
  const result = applyTemplate(parts, fmt.template);

  return includeCode ? `${fmt.code} ${result}` : result;
}

/**
 * Parse a formatted phone number back to E.164.
 */
export function parsePhone(formatted, locale = 'en-US') {
  const fmt = PHONE_FORMATS[locale] || PHONE_FORMATS['en-US'];
  const clean = cleanNumber(formatted);

  if (clean.startsWith('+')) {
    const digits = clean.slice(1).replace(/\D/g, '');
    const countryCode = fmt.code.slice(1);

    if (fmt.nationalPrefix && digits.startsWith(countryCode)) {
      const nationalDigits = stripNationalPrefix(digits.slice(countryCode.length), fmt);
      return `${fmt.code}${nationalDigits}`;
    }

    return `+${digits}`;
  }

  if (clean.startsWith('00')) {
    return `+${clean.slice(2)}`;
  }

  let digits = stripNationalPrefix(clean, fmt);

  if (fmt.code === '+1' && digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }

  return `${fmt.code}${digits}`;
}
