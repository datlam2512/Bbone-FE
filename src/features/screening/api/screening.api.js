import { api } from '@/shared/api/client'
const base = '/screening/check'
export const screeningApi = {
  definition: (region, signal) => api.get(`${base}/definitions/${region}`, { signal, auth: false }),
  assess: (body) => api.post(`${base}/assess`, body, { auth: false }),
  save: (body, key) => api.post(`${base}/results`, body, { idempotencyKey: key }),
  history: (signal) => api.get(`${base}/results?size=10`, { signal }),
}
