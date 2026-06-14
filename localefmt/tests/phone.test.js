import assert from 'node:assert/strict';
import { formatPhone, parsePhone } from '../src/phone.js';

assert.equal(formatPhone('+14165550137', 'en-CA'), '(416) 555-0137');
assert.equal(formatPhone('+442071234567', 'en-GB'), '020 7123 4567');
assert.equal(formatPhone('+61412345678', 'en-AU'), '0412 345 678');
assert.equal(formatPhone('0412345678', 'en-AU'), '0412 345 678');

assert.equal(formatPhone('+14165550137', 'en-CA', { includeCode: true }), '+1 (416) 555-0137');
assert.equal(formatPhone('+12425550199', 'en-US', { includeCode: true }), '+1 (242) 555-0199');
assert.equal(formatPhone('+442071234567', 'en-GB', { includeCode: true }), '+44 020 7123 4567');
assert.equal(formatPhone('+61412345678', 'en-AU', { includeCode: true }), '+61 0412 345 678');

assert.equal(parsePhone(formatPhone('+14165550137', 'en-CA', { includeCode: true }), 'en-CA'), '+14165550137');
assert.equal(parsePhone(formatPhone('+12425550199', 'en-US', { includeCode: true }), 'en-US'), '+12425550199');
assert.equal(parsePhone(formatPhone('+442071234567', 'en-GB', { includeCode: true }), 'en-GB'), '+442071234567');
assert.equal(parsePhone(formatPhone('+61412345678', 'en-AU', { includeCode: true }), 'en-AU'), '+61412345678');
assert.equal(parsePhone('(242) 555-0199', 'en-US'), '+12425550199');
assert.equal(parsePhone('0412 345 678', 'en-AU'), '+61412345678');
assert.equal(parsePhone('020 7123 4567', 'en-GB'), '+442071234567');

console.log('Phone tests passed');
