import { create } from 'zustand'

const emptySession = {
  accessToken: null,
  refreshToken: null,
  refreshExpiresAt: null,
  sessionKey: null,
  user: null,
}

// Tokens are intentionally kept in memory. Persist only harmless UI/guest-cart state.
export const useAuthStore = create((set, get) => ({
  ...emptySession,
  startSession: (tokens) => {
    const sessionKey = crypto.randomUUID()
    set({
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
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      refreshExpiresAt: tokens.refreshExpiresAt,
    })
    return true
  },
  setUser: (user, expectedKey) => {
    if (get().sessionKey === expectedKey) set({ user })
  },
  clearSession: (expectedKey) => {
    if (expectedKey === undefined || get().sessionKey === expectedKey) set(emptySession)
  },
}))
