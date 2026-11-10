import test from 'node:test'
import assert from 'node:assert/strict'
import {
  bookingRange,
  vietnamDate,
  timeLabel,
} from '../src/features/appointments/lib/booking-time.js'

test('booking day follows Vietnam midnight regardless of device timezone', () => {
  assert.equal(vietnamDate(new Date('2026-11-10T18:00:00Z')), '2026-11-11')
  const range = new URLSearchParams(bookingRange('2026-11-11'))
  assert.equal(range.get('from'), '2026-11-10T17:00:00.000Z')
  assert.equal(range.get('to'), '2026-11-11T17:00:00.000Z')
  assert.equal(timeLabel('2026-11-11T01:00:00Z'), '08:00')
})
test('cleared and impossible booking dates never issue availability requests', () => {
  for (const value of ['', 'bad', '2026-02-31', '2026-13-01'])
    assert.equal(bookingRange(value), null)
  assert.equal(bookingRange('2026-11-11', 32), null)
  assert.equal(bookingRange('2026-11-11', 0), null)
})
