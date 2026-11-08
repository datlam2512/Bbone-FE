import { api } from '@/shared/api/client'
import { queryString } from '@/shared/api/query-string'

export const knowledgeApi = {
  list: (filters, options) =>
    api.get('/articles' + queryString(filters), { ...options, auth: false }),
  detail: (slug, options) =>
    api.get('/articles/' + encodeURIComponent(slug), { ...options, auth: false }),
}
