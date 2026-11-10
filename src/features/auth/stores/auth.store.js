import { create } from 'zustand'

const emptySession = {
  accessToken: null,
  refreshToken: null,
  refreshExpiresAt: null,
  sessionKey: null,
  user: null,
  cookieSession: false,
  status: 'initializing',
  restoreError: null,
}

// Access tokens remain in memory; the backend restores browser sessions with an HttpOnly refresh cookie.
export const useAuthStore = create((set, get) => ({
  ...emptySession,
  beginRestore: () => {
    const sessionKey = crypto.randomUUID()
    set({ ...emptySession, sessionKey, status: 'restoring' })
    return sessionKey
  },
  restoreFailed: (error, key) => {
    if (get().sessionKey === key) set({ status: 'error', restoreError: error })
  },
  startSession: (tokens) => {
    const sessionKey = crypto.randomUUID()
    set({
      cookieSession: !!tokens.cookieSession,
      status: 'ready',
      restoreError: null,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      refreshExpiresAt: tokens.refreshExpiresAt,
      sessionKey,
      user: null,
    })
    return sessionKey
  },
  updateTokens: (tokens, expectedKey) => {
    if (get().sessionKey !== expectedKey) return false
    set({
      cookieSession: !!tokens.cookieSession,
      status: get().status === 'restoring' ? 'restoring' : 'ready',
      restoreError: null,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      refreshExpiresAt: tokens.refreshExpiresAt,
    })
    return true
  },
  setUser: (user, expectedKey) => {
    if (get().sessionKey === expectedKey) set({ user, status: 'ready', restoreError: null })
  },
  clearSession: (expectedKey) => {
    if (expectedKey === undefined || get().sessionKey === expectedKey)
      set({ ...emptySession, status: 'ready' })
  },
}))
