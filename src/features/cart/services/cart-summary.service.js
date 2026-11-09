import { api } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useCartSummaryStore } from '../stores/cart-summary.store'

export async function refreshCartSummary() {
  const key = useAuthStore.getState().sessionKey
  if (!key) return
  const items = await api.get('/cart')
  if (useAuthStore.getState().sessionKey === key) useCartSummaryStore.getState().update(items, key)
}
