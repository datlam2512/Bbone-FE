import test from 'node:test'
import assert from 'node:assert/strict'
import { useAuthStore } from '../src/features/auth/stores/auth.store.js'
import { loginDestination } from '../src/features/auth/lib/login-destination.js'
import { cropRectangle, cropOutputSize } from '../src/features/admin/lib/image-crop.js'

test('restoration gates routing until user privileges are revalidated and late responses cannot revive logout', () => {
  const key = useAuthStore.getState().beginRestore()
  assert.equal(useAuthStore.getState().status, 'restoring')
  useAuthStore.getState().updateTokens({ accessToken: 'access', cookieSession: true }, key)
  assert.equal(useAuthStore.getState().status, 'restoring')
  useAuthStore.getState().setUser({ id: 'admin', role: 'Admin' }, key)
  assert.equal(useAuthStore.getState().status, 'ready')
  useAuthStore.getState().clearSession(key)
  assert.equal(useAuthStore.getState().updateTokens({ accessToken: 'stale' }, key), false)
  useAuthStore.getState().setUser({ id: 'admin' }, key)
  assert.equal(useAuthStore.getState().user, null)
})
test('login restores an internal destination and rejects external or backslash redirects', () => {
  assert.equal(
    loginDestination('Admin', '/quan-tri/don-hang?status=PendingPayment'),
    '/quan-tri/don-hang?status=PendingPayment',
  )
  for (const path of ['//evil.example', '/\\evil.example', 'https://evil.example'])
    assert.equal(loginDestination('Admin', path), '/quan-tri')
  assert.equal(loginDestination('Doctor'), '/nhan-vien')
  assert.equal(loginDestination('Customer'), '/tai-khoan')
})
test('crop stays within the original image and portrait exports also obey the longest-side limit', () => {
  const crop = cropRectangle(4000, 3000, 1, 2, 1, 1)
  assert.deepEqual(crop, { x: 2500, y: 1500, width: 1500, height: 1500 })
  assert.deepEqual(cropOutputSize(1000, 8000, 1 / 8), { width: 320, height: 2560 })
  assert.deepEqual(cropOutputSize(4000, 3000, 1, 2), { width: 1500, height: 1500 })
})
