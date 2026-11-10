import { authApi } from '../api/auth.api'
import { useAuthStore } from '../stores/auth.store'
import {
  broadcastSession,
  markSignedOut,
  wasSignedOut,
  withBrowserSessionLock,
} from '@/shared/lib/browser-session'

let restoration = null
export function restoreSession(force = false) {
  if (restoration) return force ? restoration.then(() => restoreSession(true)) : restoration
  const state = useAuthStore.getState()
  if (!force && state.status === 'ready') return Promise.resolve(state.user)
  if (wasSignedOut()) {
    state.clearSession()
    return Promise.resolve(null)
  }
  const key = state.beginRestore()
  restoration = (async () => {
    try {
      const pair = await withBrowserSessionLock(() => authApi.restore())
      if (!useAuthStore.getState().updateTokens(pair, key)) return null
      const user = await authApi.me()
      useAuthStore.getState().setUser(user, key)
      return user
    } catch (error) {
      if ([401, 403].includes(error.status)) useAuthStore.getState().clearSession(key)
      else useAuthStore.getState().restoreFailed(error, key)
      return null
    } finally {
      restoration = null
    }
  })()
  return restoration
}

export async function signIn(credentials) {
  const key = useAuthStore.getState().beginRestore()
  // The login page stays mounted while its own submit is in progress.
  useAuthStore.setState({ status: 'ready' })
  try {
    const pair = await withBrowserSessionLock(() => authApi.login(credentials))
    if (!useAuthStore.getState().updateTokens(pair, key))
      throw new Error('Phiên đăng nhập đã thay đổi.')
    const user = await authApi.me()
    if (useAuthStore.getState().sessionKey !== key) throw new Error('Phiên đăng nhập đã thay đổi.')
    markSignedOut(false)
    useAuthStore.getState().setUser(user, key)
    broadcastSession('login')
    return user
  } catch (error) {
    useAuthStore.getState().clearSession(key)
    throw error
  }
}

export async function signOut() {
  const key = useAuthStore.getState().sessionKey
  // An offline logout must not silently restore the account on the next page reload.
  markSignedOut(true)
  broadcastSession('logout')
  try {
    await withBrowserSessionLock(() => authApi.logout())
  } finally {
    useAuthStore.getState().clearSession(key)
  }
}
