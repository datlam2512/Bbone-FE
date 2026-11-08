import { authApi } from '../api/auth.api'
import { useAuthStore } from '../stores/auth.store'

export async function signIn(credentials) {
  const pair = await authApi.login(credentials)
  const key = useAuthStore.getState().startSession(pair)
  try {
    const user = await authApi.me()
    if (useAuthStore.getState().sessionKey !== key) throw new Error('Phiên đăng nhập đã thay đổi.')
    useAuthStore.getState().setUser(user, key)
    return user
  } catch (error) {
    useAuthStore.getState().clearSession(key)
    throw error
  }
}

export async function signOut() {
  const key = useAuthStore.getState().sessionKey
  try {
    await authApi.logout()
  } finally {
    useAuthStore.getState().clearSession(key)
  }
}
