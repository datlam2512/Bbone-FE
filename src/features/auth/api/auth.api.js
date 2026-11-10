import { api } from '@/shared/api/client'

export const authApi = {
  login: (credentials) =>
    api.post('/auth/browser/login', credentials, { auth: false, credentials: 'include' }),
  me: () => api.get('/me'),
  restore: () =>
    api.post('/auth/browser/refresh', undefined, { auth: false, credentials: 'include' }),
  logout: () =>
    api.post('/auth/browser/logout', undefined, { auth: false, credentials: 'include' }),
}
