import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { Page, Panel, Field, Feedback, Empty } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { formatMoney } from '@/shared/lib/format'
import { refreshCartSummary } from '../services/cart-summary.service'

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user),
    navigate = useNavigate(),
    [applied, setApplied] = useState(null),
    [input, setInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const couponDialog = useRef(null)
  const resource = useResource(
    useCallback(async (signal) => {
      const cart = await api.get('/cart', { signal })
      if (!cart.length) return { cart, quote: null, addresses: [] }
      const [quote, addresses, paymentConfig] = await Promise.all([
        api.get('/cart/quote', { signal }),
        api.get('/me/addresses', { signal }),
        api.get('/payments/config', { signal, auth: false }),
      ])
      return { cart, quote, addresses, paymentConfig }
    }, []),
  )
  const command = useCommand(),
    couponCommand = useCommand(),
    data = resource.data,
    coupon = applied?.code ?? '',
    quote = applied?.quote ?? data?.quote

  useEffect(() => {
    if (couponError && !couponDialog.current?.open) couponDialog.current?.showModal()
  }, [couponError])

  async function changeCoupon(code) {
    if (command.pending || couponCommand.pending || code === coupon) return
    const nextQuote = await couponCommand.run(
      async () => {
        try {
          const query = code ? '?' + new URLSearchParams({ coupon: code }) : ''
          return await api.get('/cart/quote' + query)
        } catch (error) {
          setCouponError(error.message)
          return false
        }
      },
      { code },
      '',
    )
    if (nextQuote) {
      setApplied({ code, quote: nextQuote })
      setInput(code)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (couponCommand.pending || !quote) return
    const form = new FormData(e.currentTarget)
    const body = {
      recipient: form.get('recipient'),
      phone: form.get('phone'),
      address: form.get('address'),
      method: form.get('method'),
      coupon: coupon || null,
      acceptedTotal: quote.total,
    }
    const order = await command.run(
      async (key) => {
        try {
          return await api.post('/orders', body, { idempotencyKey: key })
        } catch (error) {
          if (error.code !== 'INVALID_COUPON') throw error
          setCouponError(error.message)
          return false
        }
      },
      body,
      '',
    )
    if (order) {
      await refreshCartSummary().catch(() => {})
      navigate('/tai-khoan/don-hang/' + order.id, { replace: true })
    }
  }
  return (
    <Page
      title="Thanh toán"
      description="Kiểm tra địa chỉ nhận hàng và chọn phương thức thanh toán."
      back="/gio-hang"
    >
      <Feedback command={command} />
      <dialog
        ref={couponDialog}
        onClose={() => setCouponError('')}
        aria-labelledby="coupon-error-title"
        aria-describedby="coupon-error-description"
        className="m-auto w-11/12 max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-xl backdrop:bg-slate-950/40"
      >
        <form method="dialog" className="space-y-4">
          <h2 id="coupon-error-title" className="text-lg font-semibold">
            Chưa thể cập nhật mã ưu đãi
          </h2>
          <p id="coupon-error-description" className="text-sm leading-6 text-slate-700">
            {couponError}
          </p>
          <Button type="submit" label="Quay lại thanh toán" variant="primary" />
        </form>
      </dialog>
      <ResourceState {...resource} empty={false}>
        {data &&
          (data.cart.length ? (
            <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
              <VStack gap={5} className="lg:col-span-2">
                <Panel title="Thông tin nhận hàng">
                  <Field
                    label="Người nhận"
                    name="recipient"
                    required
                    defaultValue={data.addresses.find((a) => a.isDefault)?.recipient || user.name}
                    maxLength={100}
                  />
                  <Field
                    label="Điện thoại"
                    name="phone"
                    type="tel"
                    required
                    defaultValue={data.addresses.find((a) => a.isDefault)?.phone || user.phone}
                    maxLength={30}
                  />
                  <Field
                    label="Địa chỉ đầy đủ"
                    name="address"
                    type="textarea"
                    required
                    defaultValue={data.addresses.find((a) => a.isDefault)?.fullAddress || ''}
                    maxLength={500}
                  />
                </Panel>
                <Panel title="Phương thức thanh toán">
                  <label className="flex gap-3 rounded-lg border border-slate-200 p-4 text-sm">
                    <input type="radio" name="method" value="COD" defaultChecked />
                    Thanh toán khi nhận hàng (COD)
                  </label>
                  <label className="flex gap-3 rounded-lg border border-slate-200 p-4 text-sm">
                    <input
                      type="radio"
                      name="method"
                      value="VietQR"
                      disabled={!data.paymentConfig?.available}
                    />
                    {data.paymentConfig?.isSimulation
                      ? 'VietQR mô phỏng — không chuyển tiền thật'
                      : 'Chuyển khoản VietQR — đối soát thủ công'}
                  </label>
                </Panel>
              </VStack>
              <Panel title="Đơn hàng của bạn">
                {data.cart.map((row) => (
                  <p
                    key={row.id}
                    className="flex justify-between gap-4 border-b border-slate-100 pb-3 text-sm"
                  >
                    <label>
                      {row.name} × {row.quantity}
                    </label>
                    <strong className="shrink-0">{formatMoney(row.price * row.quantity)}</strong>
                  </p>
                ))}
                <Field
                  label="Mã ưu đãi"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
                    event.preventDefault()
                    if (input.trim()) changeCoupon(input.trim().toUpperCase())
                  }}
                  disabled={couponCommand.pending || command.pending}
                  maxLength={50}
                />
                <Button
                  type="button"
                  label="Áp dụng ưu đãi"
                  onClick={() => changeCoupon(input.trim().toUpperCase())}
                  isDisabled={
                    !input.trim() ||
                    input.trim().toUpperCase() === coupon ||
                    command.pending ||
                    couponCommand.pending
                  }
                  isLoading={couponCommand.pending}
                />
                {coupon && (
                  <Button
                    type="button"
                    label={'Bỏ mã ' + coupon}
                    variant="ghost"
                    isDisabled={couponCommand.pending || command.pending}
                    onClick={() => changeCoupon('')}
                  />
                )}
                {[
                  ['Tạm tính', quote.subtotal],
                  ['Giảm giá', -quote.discount],
                  ['Phí giao hàng', quote.shippingFee],
                  ['Tổng thanh toán', quote.total],
                ].map(([label, value]) => (
                  <p key={label} className="flex justify-between gap-3 text-sm">
                    {label}
                    <strong>{formatMoney(value)}</strong>
                  </p>
                ))}
                <label className="flex gap-2 text-xs leading-6 text-slate-500">
                  <input type="checkbox" required />
                  Tôi đã kiểm tra thông tin, số tiền và đồng ý gửi yêu cầu đặt hàng.
                </label>
                <Button
                  type="submit"
                  variant="primary"
                  label="Xác nhận đặt hàng"
                  isDisabled={couponCommand.pending || command.pending}
                  isLoading={command.pending}
                />
              </Panel>
            </form>
          ) : (
            <Empty text="Giỏ hàng trống, hãy chọn sản phẩm trước khi thanh toán." to="/san-pham" />
          ))}
      </ResourceState>
    </Page>
  )
}
