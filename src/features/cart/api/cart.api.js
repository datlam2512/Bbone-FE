import { api } from '@/shared/api/client'

export const cartApi = {
  get: () => api.get('/cart'),
  setQuantity: ({ productId, quantity, version }) =>
    api.put('/cart/items', { productId, quantity, version }),
  // Keep this key for all retries of this same merge operation.
  merge: (items, idempotencyKey) => api.post('/cart/merge', items, { idempotencyKey }),
}
