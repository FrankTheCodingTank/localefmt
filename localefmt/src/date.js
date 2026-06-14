/**
 * Date formatter with locale-aware ordering and month names.
 */

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DATE_FORMATS = {
  'en-US': { order: 'MDY', sep: '/', long: '{month} {day}, {year}' },
  'en-CA': { order: 'YMD', sep: '-', long: '{month} {day}, {year}' },
  'en-GB': { order: 'DMY', sep: '/', long: '{day} {month} {year}' },
  'en-AU': { order: 'DMY', sep: '/', long: '{day} {month} {year}' },
  'fr-CA': { order: 'YMD', sep: '-', long: '{day} {month} {year}' },
  'de-DE': { order: 'DMY', sep: '.', long: '{day}. {month} {year}' },
  'ja-JP': { order: 'YMD', sep: '/', long: '{year}年{month}月{day}日' },
};

function parseDateParts(dateStr) {
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) throw new Error(`Cannot parse date: ${dateStr}`);
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
}

/**
 * Format a date string (YYYY-MM-DD) for display in the given locale.
 *
 * @param {string} dateStr — ISO 8601 date string
 * @param {string} locale  — BCP-47 locale tag
 * @param {boolean} long   — use long format with month names
 * @returns {string}
 */
export function formatDate(dateStr, locale = 'en-US', long = true) {
  const fmt = DATE_FORMATS[locale] || DATE_FORMATS['en-US'];
  const { year, month, day } = parseDateParts(dateStr);

  if (long) {
    return fmt.long
      .replace('{year}', year)
      .replace('{month}', MONTHS_EN[month - 1])
      .replace('{day}', day);
  }

  const parts = { Y: year, M: String(month).padStart(2, '0'), D: String(day).padStart(2, '0') };
  return fmt.order.split('').map(k => parts[k]).join(fmt.sep);
}
