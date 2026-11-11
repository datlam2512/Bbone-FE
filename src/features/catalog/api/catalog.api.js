import { api } from '@/shared/api/client'
import { queryString } from '@/shared/api/query-string'

export const catalogApi = {
  products: (filters, options) =>
    api.get('/products' + queryString(filters), { ...options, auth: false }),
  product: (id, options) =>
    api.get('/products/' + encodeURIComponent(id), { ...options, auth: false }),
  directory: ({ search, bodyArea, page, size }, options) =>
    api.get('/directory/products' + queryString({ search, bodyArea, page, size }), {
      ...options,
      auth: false,
    }),
  directoryProduct: (slug, options) =>
    api.get('/directory/products/' + encodeURIComponent(slug), { ...options, auth: false }),
}
