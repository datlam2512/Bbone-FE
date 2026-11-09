import test from 'node:test'
import assert from 'node:assert/strict'
import { cartQuantity } from '../src/features/cart/lib/cart-count.js'
import { publicPhone } from '../src/shared/lib/contact.js'
test('cart badge counts units rather than distinct product lines', () => {
  assert.equal(cartQuantity([{ quantity: 2 }, { quantity: 3 }]), 5)
  assert.equal(cartQuantity([{ quantity: 4 }]), 4)
  assert.equal(cartQuantity([{ quantity: 0 }, { quantity: -1 }, { quantity: '3' }, null]), 0)
})
test('empty and placeholder telephone numbers are hidden, real formatted numbers remain', () => {
  assert.equal(publicPhone('0000000000'), null)
  assert.equal(publicPhone('00 000 000'), null)
  assert.equal(publicPhone(''), null)
  assert.equal(publicPhone('0912 345 678'), '0912 345 678')
})
