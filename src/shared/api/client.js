import { createApiClient } from './create-api-client'
import { env } from '@/shared/config/env'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export const api = createApiClient({
  baseUrl: env.apiBaseUrl,
  getSession: useAuthStore.getState,
  updateTokens: (tokens, key) => useAuthStore.getState().updateTokens(tokens, key),
  clearSession: (key) => useAuthStore.getState().clearSession(key),
})
