export class ApiError extends Error {
  constructor(message, { status = 0, code, correlationId } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.correlationId = correlationId
  }
}

async function readBody(response, responseType = 'json') {
  if (response.status === 204) return null
  if (!response.headers.get('content-type')?.includes('json'))
    return responseType === 'text' ? response.text() : null
  return response.json()
}

function responseError(response, body) {
  return new ApiError(
    body?.detail || body?.title || 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.',
    {
      status: response.status,
      code: body?.code,
      correlationId: body?.correlationId || response.headers.get('x-correlation-id'),
    },
  )
}

/** A refresh is shared by concurrent requests and may never restore an obsolete user session. */
export function createApiClient({
  baseUrl,
  getSession,
  updateTokens,
  clearSession,
  fetcher = (...args) => fetch(...args),
  timeoutMs = 15000,
}) {
  let refreshFlight = null

  async function send(path, options = {}) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const onAbort = () => controller.abort(options.signal?.reason)
    if (options.signal?.aborted) onAbort()
    else options.signal?.addEventListener('abort', onAbort, { once: true })
    try {
      return await fetcher(baseUrl + path, { ...options, signal: controller.signal })
    } catch (error) {
      if (options.signal?.aborted) throw error
      if (controller.signal.aborted) {
        throw new ApiError('Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.', { status: 408 })
      }
      if (error.name === 'AbortError') throw error
      throw new ApiError('Chưa kết nối được máy chủ. Vui lòng thử lại.')
    } finally {
      clearTimeout(timeout)
      options.signal?.removeEventListener('abort', onAbort)
    }
  }

  async function refresh(expectedKey) {
    if (refreshFlight?.key === expectedKey) return refreshFlight.promise
    const current = getSession()
    if (current.sessionKey !== expectedKey || !current.refreshToken) return null
    const flight = { key: expectedKey }
    flight.promise = (async () => {
      try {
        const response = await send('/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ token: current.refreshToken }),
        })
        const pair = await readBody(response)
        if (!response.ok || !pair?.accessToken || !pair?.refreshToken) {
          throw responseError(response, pair)
        }
        if (getSession().sessionKey !== expectedKey) return null
        return updateTokens(pair, expectedKey) ? pair.accessToken : null
      } catch (error) {
        clearSession(expectedKey)
        throw error
      } finally {
        if (refreshFlight === flight) refreshFlight = null
      }
    })()
    refreshFlight = flight
    return flight.promise
  }

  async function request(
    path,
    { auth = true, idempotencyKey, responseType = 'json', ...options } = {},
  ) {
    const initial = getSession()
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    if (options.body != null && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
      options.body = JSON.stringify(options.body)
    }
    if (idempotencyKey) headers.set('Idempotency-Key', idempotencyKey)
    if (auth && initial.accessToken) headers.set('Authorization', 'Bearer ' + initial.accessToken)
    let response = await send(path, { ...options, headers })
    if (response.status === 401 && auth && initial.refreshToken) {
      if (getSession().sessionKey !== initial.sessionKey) {
        throw new ApiError('Phiên đăng nhập đã thay đổi.', { status: 401 })
      }
      const latest = getSession()
      const token =
        latest.accessToken !== initial.accessToken
          ? latest.accessToken
          : await refresh(initial.sessionKey)
      if (!token || getSession().sessionKey !== initial.sessionKey) {
        throw new ApiError('Vui lòng đăng nhập lại.', { status: 401 })
      }
      if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      headers.set('Authorization', 'Bearer ' + token)
      response = await send(path, { ...options, headers })
    }
    if (auth && initial.sessionKey && getSession().sessionKey !== initial.sessionKey) {
      throw new ApiError('Phiên đăng nhập đã thay đổi.', { status: 401 })
    }
    const body = await readBody(response, responseType)
    if (!response.ok) throw responseError(response, body)
    return body
  }

  return {
    request,
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, body, method: 'POST' }),
    put: (path, body, options) => request(path, { ...options, body, method: 'PUT' }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  }
}
