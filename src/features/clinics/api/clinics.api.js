import { api } from '@/shared/api/client'
import { queryString } from '@/shared/api/query-string'

export const clinicsApi = {
  list: (filters, options) =>
    api.get('/clinics/search' + queryString(filters), { ...options, auth: false }),
  detail: (id, options) =>
    api.get('/clinics/' + encodeURIComponent(id), { ...options, auth: false }),
  directory: ({ search, area, page, size }, options) =>
    api.get('/directory/clinics' + queryString({ search, area, page, size }), {
      ...options,
      auth: false,
    }),
}
