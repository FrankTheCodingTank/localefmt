import assert from 'node:assert/strict';
import { formatDate } from '../src/date.js';

assert.equal(formatDate('1990-04-17', 'en-US'), 'April 17, 1990');
assert.equal(formatDate('1990-04-17', 'en-CA', false), '1990-04-17');
assert.equal(formatDate('1990-04-17', 'en-GB'), '17 April 1990');
assert.equal(formatDate('1990-04-17', 'en-AU', false), '17/04/1990');

console.log('Date tests passed');
