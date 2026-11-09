import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { Badge } from '@astryxdesign/core/Badge'
import { VStack } from '@astryxdesign/core/VStack'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useGuestCartStore } from '../stores/guest-cart.store'
import { useCartSummaryStore } from '../stores/cart-summary.store'
import { cartQuantity } from '../lib/cart-count'

export default function CartLink() {
  const userId = useAuthStore((s) => s.user?.id),
    key = useAuthStore((s) => s.sessionKey)
  const local = useGuestCartStore((s) => cartQuantity(s.items))
  const remote = useCartSummaryStore((s) => (s.sessionKey === key ? s.quantity : 0))
  useEffect(() => {
    if (!userId || !key) return
    const controller = new AbortController()
    api
      .get('/cart', { signal: controller.signal })
      .then((items) => {
        if (useAuthStore.getState().sessionKey === key)
          useCartSummaryStore.getState().update(items, key)
      })
      .catch(() => {
        /* Keep the last known total; the basket itself exposes request errors. */
      })
    return () => controller.abort()
  }, [userId, key])
  const total = local + remote
  return (
    <Link
      to="/gio-hang"
      aria-label={total ? 'Giỏ hàng, ' + total + ' sản phẩm' : 'Giỏ hàng'}
      className="relative rounded-lg p-2.5 text-ink hover:bg-brand-50"
    >
      <ShoppingBag size={21} />
      {total > 0 && (
        <VStack className="absolute -top-1 -right-1" aria-hidden="true">
          <Badge variant="info" label={total > 99 ? '99+' : total} />
        </VStack>
      )}
    </Link>
  )
}
