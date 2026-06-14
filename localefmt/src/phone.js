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

const NANP_AREA_CODES = {
  CA: new Set([
    '204', '226', '236', '249', '250', '263', '289', '306', '343', '354',
    '365', '367', '368', '382', '387', '403', '416', '418', '428', '431',
    '437', '438', '450', '468', '474', '506', '514', '519', '548', '579',
    '581', '584', '587', '604', '613', '639', '647', '672', '683', '705',
    '709', '742', '753', '778', '780', '782', '807', '819', '825', '867',
    '873', '879', '902', '905',
  ]),
  Caribbean: new Set([
    '242', '246', '264', '268', '284', '340', '345', '441', '473', '649',
    '658', '664', '670', '671', '684', '721', '758', '767', '784', '787',
    '809', '829', '849', '868', '869', '876', '939',
  ]),
};

const NANP_CODES_BY_REGION = {
  US: '+1',
  CA: '+1',
  Caribbean: '+1',
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

function stripNationalPrefix(digits, fmt) {
  if (fmt.nationalPrefix && digits.startsWith(fmt.nationalPrefix)) {
    return digits.slice(fmt.nationalPrefix.length);
  }
  return digits;
}

function classifyNanpArea(areaCode) {
  if (NANP_AREA_CODES.CA.has(areaCode)) return 'CA';
  if (NANP_AREA_CODES.Caribbean.has(areaCode)) return 'Caribbean';
  return 'US';
}

function parseOptions(options) {
  if (typeof options === 'boolean') {
    return { includeCode: options };
  }
  return options || {};
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
    const digits = clean.slice(1);
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

  if (fmt.code === '+1') {
    if (digits.length === 11 && digits.startsWith('1')) {
      digits = digits.slice(1);
    }

    const areaCode = digits.slice(0, 3);
    const region = classifyNanpArea(areaCode);
    return `${NANP_CODES_BY_REGION[region]}${digits}`;
  }

  return `${fmt.code}${digits}`;
}
