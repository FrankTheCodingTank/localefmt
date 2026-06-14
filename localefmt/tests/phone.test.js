import { formatPhone, parsePhone } from '../src/phone.js';

// Passing tests
console.assert(formatPhone('+14165550137', 'en-CA') === '(416) 555-0137', 'CA format');
console.assert(formatPhone('+442071234567', 'en-GB') === '020 7123 4567', 'GB format');
console.assert(formatPhone('+61412345678', 'en-AU') === '0412 345 678', 'AU format');

// Failing test — demonstrates bug #14
// Country code is dropped, so round-trip loses region info
const formatted = formatPhone('+14165550137', 'en-CA');
const parsed = parsePhone(formatted, 'en-CA');
console.assert(parsed === '+14165550137', `Round-trip failed: got ${parsed}`);

// Edge case: Caribbean +1 number misidentified as US/CA
const bahamas = formatPhone('+12425550199', 'en-US');
console.log('Bahamas +1242:', bahamas);  // Shows as US format — wrong

console.log('All phone tests passed (except known #14 edge cases)');
