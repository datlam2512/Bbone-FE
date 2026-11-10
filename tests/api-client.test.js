import test from 'node:test'
import assert from 'node:assert/strict'
import { createApiClient, ApiError } from '../src/shared/api/create-api-client.js'

function fixture(fetcher, timeoutMs) {
  let session = { accessToken: 'old-access', refreshToken: 'old-refresh', sessionKey: 'session-a' }
  const client = createApiClient({
    baseUrl: '/api/v1',
    fetcher,
    timeoutMs,
    getSession: () => session,
    updateTokens: (pair, expectedKey) => {
      if (session.sessionKey !== expectedKey) return false
      session = { ...session, ...pair }
      return true
    },
    clearSession: (expectedKey) => {
      if (session.sessionKey === expectedKey) session = { sessionKey: null }
    },
  })
  return {
    client,
    session: () => session,
    replaceSession: (next) => {
      session = next
    },
  }
}

const json = (value, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

test('explicit text responses support authenticated QR and CSV endpoints without leaking responseType to fetch', async () => {
  const { client } = fixture(async (url, options) => {
    assert.equal(options.headers.get('Authorization'), 'Bearer old-access')
    assert.equal('responseType' in options, false)
    return new Response('<svg></svg>', { headers: { 'Content-Type': 'image/svg+xml' } })
  })
  assert.equal(await client.get('/simulation/qr', { responseType: 'text' }), '<svg></svg>')
})

test('JSON errors still retain their business message for text downloads', async () => {
  const { client } = fixture(async () =>
    json({ detail: 'Không có quyền xuất báo cáo.', code: 'EXPORT_FORBIDDEN' }, 403),
  )
  await assert.rejects(
    client.get('/report.csv', { responseType: 'text' }),
    (error) => error.status === 403 && error.code === 'EXPORT_FORBIDDEN',
  )
})

test('concurrent unauthorized requests share one refresh', async () => {
  let refreshCount = 0
  const { client } = fixture(async (url, options) => {
    if (url.endsWith('/auth/refresh')) {
      refreshCount++
      await new Promise((resolve) => setTimeout(resolve, 10))
      return json({ accessToken: 'new-access', refreshToken: 'new-refresh' })
    }
    return options.headers.get('Authorization') === 'Bearer new-access'
      ? json({ ok: true })
      : json({}, 401)
  })
  const results = await Promise.all([client.get('/orders'), client.get('/appointments')])
  assert.equal(refreshCount, 1)
  assert.ok(results.every((result) => result.ok))
})

test('a refresh cannot restore a logged-out session or adopt a different account', async () => {
  let release
  const pending = new Promise((resolve) => {
    release = resolve
  })
  const state = fixture(async (url) => {
    if (url.endsWith('/auth/refresh')) return pending
    return json({}, 401)
  })
  const request = state.client.get('/orders')
  await new Promise((resolve) => setTimeout(resolve, 0))
  state.replaceSession({
    accessToken: 'other-access',
    refreshToken: 'other-refresh',
    sessionKey: 'session-b',
  })
  release(json({ accessToken: 'stale-access', refreshToken: 'stale-refresh' }))
  await assert.rejects(request, (error) => error instanceof ApiError && error.status === 401)
  assert.equal(state.session().accessToken, 'other-access')
})

test('mutation retry preserves the idempotency key and exact request body', async () => {
  const attempts = []
  const { client } = fixture(async (url, options) => {
    if (url.endsWith('/auth/refresh'))
      return json({ accessToken: 'new-access', refreshToken: 'new-refresh' })
    attempts.push({ body: options.body, key: options.headers.get('Idempotency-Key') })
    return attempts.length === 1 ? json({}, 401) : json({ id: 'one-order' })
  })
  const result = await client.post('/orders', { quantity: 1 }, { idempotencyKey: 'same-operation' })
  assert.equal(result.id, 'one-order')
  assert.equal(attempts.length, 2)
  assert.deepEqual(attempts[0], attempts[1])
})

test('timeout is visible as an API error rather than an endless loading state', async () => {
  const { client } = fixture(
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      }),
    10,
  )
  await assert.rejects(
    client.get('/products'),
    (error) => error instanceof ApiError && error.status === 408,
  )
})

test('a successful response from an old account cannot enter the new account view', async () => {
  let release
  const state = fixture(
    () =>
      new Promise((resolve) => {
        release = resolve
      }),
  )
  const pending = state.client.get('/orders')
  state.replaceSession({
    accessToken: 'other-access',
    refreshToken: 'other-refresh',
    sessionKey: 'session-b',
  })
  release(json({ privateData: 'old-account' }))
  await assert.rejects(pending, (error) => error instanceof ApiError && error.status === 401)
})

test('multipart image upload retains the file and browser boundary when refreshing an expired access token', async () => {
  const form = new FormData()
  form.append('file', new Blob(['image-bytes'], { type: 'image/png' }), 'photo.png')
  let uploads = 0
  const { client } = fixture(async (url, options) => {
    if (url.endsWith('/auth/refresh'))
      return json({ accessToken: 'new-access', refreshToken: 'new-refresh' })
    uploads++
    assert.equal(options.body, form)
    assert.equal(options.headers.has('Content-Type'), false)
    assert.equal(await options.body.get('file').text(), 'image-bytes')
    return uploads === 1 ? json({}, 401) : json({ url: '/media/uploads/test.webp' })
  })
  assert.equal((await client.post('/admin/media/products', form)).url, '/media/uploads/test.webp')
  assert.equal(uploads, 2)
})

test('cookie sessions refresh without a JS refresh token and survive transient connection errors', async () => {
  let calls = 0
  const f = fixture(async (url, options) => {
    if (url.endsWith('/auth/browser/refresh')) {
      assert.equal(options.credentials, 'include')
      assert.equal(options.body, undefined)
      return json({ accessToken: 'restored', cookieSession: true })
    }
    calls++
    return calls === 1 ? json({}, 401) : json({ ok: true })
  })
  f.replaceSession({ accessToken: 'old', cookieSession: true, sessionKey: 'browser' })
  assert.deepEqual(await f.client.get('/me'), { ok: true })
  const offline = fixture(async (url) => {
    if (url.endsWith('/auth/browser/refresh')) throw new Error('offline')
    return json({}, 401)
  })
  offline.replaceSession({ accessToken: 'old', cookieSession: true, sessionKey: 'browser' })
  await assert.rejects(offline.client.get('/me'))
  assert.equal(offline.session().sessionKey, 'browser')
})
