const test = require('node:test');
const assert = require('node:assert/strict');
const { formatDateTimeLocal, isDateTimeAllowed } = require('../js/booking-datetime');

test('formatDateTimeLocal formats a local datetime for the input element', () => {
  const date = new Date(2026, 7, 3, 14, 5);
  assert.equal(formatDateTimeLocal(date), '2026-08-03T14:05');
});

test('rejects past datetimes on the same day', () => {
  const now = new Date(2026, 7, 3, 14, 30);
  assert.equal(isDateTimeAllowed('2026-08-03T14:00', now), false);
  assert.equal(isDateTimeAllowed('2026-08-03T14:30', now), true);
});

test('rejects any datetime before the current moment', () => {
  const now = new Date(2026, 7, 3, 14, 30);
  assert.equal(isDateTimeAllowed('2026-08-02T14:30', now), false);
  assert.equal(isDateTimeAllowed('2026-08-04T09:00', now), true);
});
