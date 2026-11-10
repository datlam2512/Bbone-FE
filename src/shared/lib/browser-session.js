// Only cross-tab event names/flags are stored here. Credentials never enter Web Storage.
const eventKey = 'bbone.session.event',
  signedOutKey = 'bbone.session.signed-out'
export const withBrowserSessionLock = (action) =>
  globalThis.navigator?.locks ? navigator.locks.request('bbone.browser-session', action) : action()
export function wasSignedOut() {
  try {
    return localStorage.getItem(signedOutKey) === 'true'
  } catch {
    return false
  }
}
export function markSignedOut(value) {
  try {
    if (value) localStorage.setItem(signedOutKey, 'true')
    else localStorage.removeItem(signedOutKey)
  } catch {
    /* Storage may be disabled. */
  }
}
export function broadcastSession(type) {
  try {
    localStorage.setItem(eventKey, JSON.stringify({ type, nonce: crypto.randomUUID() }))
  } catch {
    /* Same-tab sessions still work. */
  }
}
export function listenForSessionChanges(callback) {
  const listener = (event) => {
    if (event.key !== eventKey || !event.newValue) return
    try {
      const { type } = JSON.parse(event.newValue)
      if (['login', 'logout'].includes(type)) callback(type)
    } catch {
      /* Ignore malformed storage events. */
    }
  }
  window.addEventListener('storage', listener)
  return () => window.removeEventListener('storage', listener)
}
