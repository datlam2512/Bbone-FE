import { Minus, Plus } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useGuestCartStore } from '../stores/guest-cart.store'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Panel, Empty, Feedback } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { formatMoney } from '@/shared/lib/format'
import { refreshCartSummary } from '../services/cart-summary.service'
import { useCartSummaryStore } from '../stores/cart-summary.store'

export default function CartPage() {
  const user = useAuthStore((s) => s.user),
    guest = useGuestCartStore((s) => s.items),
    setQuantity = useGuestCartStore((s) => s.setQuantity)
  const signature = JSON.stringify(guest)
  const resource = useResource(
    useCallback(
      async (signal) => {
        const local = await Promise.all(
          JSON.parse(signature).map(async (item) => {
            try {
              const product = await api.get('/products/' + item.productId, { signal, auth: false })
              return { ...item, ...product, productId: item.productId, local: true }
            } catch (error) {
              if (error.name === 'AbortError') throw error
              if (error.status !== 404) throw error
              return {
                ...item,
                name: 'Sản phẩm không còn khả dụng',
                price: 0,
                local: true,
                unavailable: true,
              }
            }
          }),
        )
        const remote = user ? await api.get('/cart', { signal }) : []
        return { local, remote }
      },
      [signature, user],
    ),
  )
  const command = useCommand()
  const rows = [...(resource.data?.remote || []), ...(resource.data?.local || [])]
  async function merge() {
    const body = guest
    const ok = await command.run(
      (key) => api.post('/cart/merge', body, { idempotencyKey: key }),
      body,
      'Đã cập nhật giỏ hàng vào tài khoản.',
    )
    if (ok) {
      const changed = new Set(ok.items.map((item) => item.productId))
      useCartSummaryStore
        .getState()
        .update(
          [
            ...(resource.data?.remote || []).filter((item) => !changed.has(item.productId)),
            ...ok.items,
          ],
          useAuthStore.getState().sessionKey,
        )
      useGuestCartStore.getState().clear()
      resource.retry()
      await refreshCartSummary().catch(() => {})
    }
  }
  async function change(row, quantity) {
    if (row.local) {
      setQuantity(row.productId, quantity)
      return
    }
    const ok = await command.run(
      () =>
        quantity
          ? api.put('/cart/items', { productId: row.productId, quantity, version: row.version })
          : api.delete('/cart/items/' + row.id + '?version=' + row.version),
      { id: row.id, quantity, version: row.version },
    )
    if (ok) {
      useCartSummaryStore.getState().update(
        (resource.data?.remote || [])
          .map((item) => (item.id === row.id ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0),
        useAuthStore.getState().sessionKey,
      )
      resource.retry()
      await refreshCartSummary().catch(() => {})
    }
  }
  return (
    <Page
      title="Giỏ hàng"
      description="Kiểm tra sản phẩm và số lượng trước khi thanh toán."
      back="/san-pham"
    >
      <Feedback command={command} />
      <ResourceState {...resource} empty={false}>
        {!rows.length ? (
          <Empty text="Giỏ hàng của bạn đang trống." to="/san-pham" label="Chọn sản phẩm" />
        ) : (
          <section className="grid gap-6 lg:grid-cols-3">
            <VStack gap={4} className="lg:col-span-2">
              {rows.map((row) => (
                <Panel key={(row.local ? 'local' : 'remote') + row.productId}>
                  <HStack gap={4} wrap="wrap" hAlign="between">
                    <VStack gap={2}>
                      <Link
                        to={'/san-pham/' + row.productId}
                        className="font-semibold hover:text-brand-600"
                      >
                        {row.name}
                      </Link>
                      <p className="text-sm text-slate-500">
                        {formatMoney(row.price)}
                        {row.local && user ? ' · Chưa đồng bộ' : ''}
                      </p>
                    </VStack>
                    <HStack gap={3} vAlign="center">
                      <Button
                        aria-label="Giảm số lượng"
                        icon={<Minus size={16} />}
                        size="sm"
                        onClick={() => change(row, row.quantity - 1)}
                        isDisabled={command.pending || row.quantity <= 1}
                      />
                      <p className="text-sm" aria-label="Số lượng">
                        {row.quantity}
                      </p>
                      <Button
                        aria-label="Tăng số lượng"
                        icon={<Plus size={16} />}
                        size="sm"
                        onClick={() => change(row, row.quantity + 1)}
                        isDisabled={
                          command.pending ||
                          row.unavailable ||
                          row.quantity >= (row.available ?? row.sellableQuantity ?? 1000)
                        }
                      />
                      <Button
                        label="Xóa"
                        variant="ghost"
                        size="sm"
                        onClick={() => change(row, 0)}
                        isDisabled={command.pending}
                      />
                    </HStack>
                  </HStack>
                </Panel>
              ))}
            </VStack>
            <Panel title="Tóm tắt giỏ hàng">
              <p className="flex justify-between text-sm">
                Tạm tính{' '}
                <strong>
                  {formatMoney(rows.reduce((total, row) => total + row.price * row.quantity, 0))}
                </strong>
              </p>
              <p className="text-xs leading-6 text-slate-500">
                Phí giao hàng và ưu đãi sẽ được tính ở bước thanh toán. Giá và tồn kho được kiểm tra
                lại khi đặt hàng.
              </p>
              {!user ? (
                <Link
                  to="/dang-nhap"
                  state={{ from: '/gio-hang' }}
                  className="rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white"
                >
                  Đăng nhập để thanh toán
                </Link>
              ) : guest.length ? (
                <Button
                  label="Cập nhật giỏ hàng vào tài khoản"
                  variant="primary"
                  onClick={merge}
                  isLoading={command.pending}
                  isDisabled={rows.some((r) => r.unavailable)}
                />
              ) : (
                <Link
                  to="/thanh-toan"
                  className="rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white"
                >
                  Tiến hành thanh toán →
                </Link>
              )}
            </Panel>
          </section>
        )}
      </ResourceState>
    </Page>
  )
}
