import { api } from '@/shared/api/client'

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials, { auth: false }),
  me: () => api.get('/me'),
  logout: () => api.post('/auth/logout'),
}
