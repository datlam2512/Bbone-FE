import { api } from '@/shared/api/client'
import { queryString } from '@/shared/api/query-string'

export const appointmentsApi = {
  mine: (filters, options) => api.get('/appointments' + queryString(filters), options),
  slots: (serviceId, filters, options) =>
    api.get('/services/' + encodeURIComponent(serviceId) + '/slots' + queryString(filters), {
      ...options,
      auth: false,
    }),
  hold: (slotId, idempotencyKey) =>
    api.post('/appointments/holds/' + encodeURIComponent(slotId), undefined, { idempotencyKey }),
}
