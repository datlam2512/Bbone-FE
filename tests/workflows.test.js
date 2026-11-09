import test from 'node:test'
import assert from 'node:assert/strict'
import { visibleQuestions, itemsOf, utcDayRange } from '../src/shared/lib/workflows.js'
test('hidden answers cannot make a dependent screening question visible', () => {
  const questions = [
    { id: 'a' },
    { id: 'b', visibleWhen: { a: 'yes' } },
    { id: 'c', visibleWhen: { b: 'yes' } },
  ]
  assert.deepEqual(
    visibleQuestions(questions, { a: 'no', b: 'yes' }).map((q) => q.id),
    ['a'],
  )
  assert.deepEqual(
    visibleQuestions(questions, { a: 'yes', b: 'yes' }).map((q) => q.id),
    ['a', 'b', 'c'],
  )
})
test('list adapters handle paginated and array endpoint responses', () => {
  assert.deepEqual(itemsOf({ items: [{ id: 1 }], total: 1 }), [{ id: 1 }])
  assert.deepEqual(itemsOf([{ id: 2 }]), [{ id: 2 }])
  assert.deepEqual(itemsOf(null), [])
})

test('report range includes the whole final Vietnamese day and handles cleared date controls', () => {
  const query = new URLSearchParams(utcDayRange('2026-11-09', '2026-11-09'))
  assert.equal(query.get('from'), '2026-11-08T17:00:00.000Z')
  assert.equal(query.get('to'), '2026-11-09T17:00:00.000Z')
  assert.equal(utcDayRange('', '2026-11-09'), null)
  assert.equal(utcDayRange('2026-11-10', '2026-11-09'), null)
})
