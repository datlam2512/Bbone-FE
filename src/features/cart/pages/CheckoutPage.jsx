import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { Page, Panel, Field, Feedback, Submit, Empty } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { formatMoney } from '@/shared/lib/format'
import { refreshCartSummary } from '../services/cart-summary.service'

export default function CheckoutPage() {
  const user = useAuthStore((s) => s.user),
    navigate = useNavigate(),
    [coupon, setCoupon] = useState(''),
    [input, setInput] = useState('')
  const resource = useResource(
    useCallback(
      async (signal) => {
        const cart = await api.get('/cart', { signal })
        if (!cart.length) return { cart, quote: null, addresses: [] }
        const [quote, addresses] = await Promise.all([
          api.get('/cart/quote?coupon=' + encodeURIComponent(coupon), { signal }),
          api.get('/me/addresses', { signal }),
        ])
        return { cart, quote, addresses }
      },
      [coupon],
    ),
  )
  const command = useCommand(),
    data = resource.data
  async function submit(e) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const body = {
      recipient: form.get('recipient'),
      phone: form.get('phone'),
      address: form.get('address'),
      method: form.get('method'),
      coupon: coupon || null,
      acceptedTotal: data.quote.total,
    }
    const order = await command.run(
      (key) => api.post('/orders', body, { idempotencyKey: key }),
      body,
      'Đã tạo đơn hàng.',
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
      {coupon && (
        <Button
          label={'Bỏ mã ưu đãi: ' + coupon}
          variant="ghost"
          onClick={() => {
            setCoupon('')
            setInput('')
          }}
        />
      )}
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
                    <input type="radio" name="method" value="VietQR" />
                    VietQR mô phỏng — không chuyển tiền thật
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
                  maxLength={50}
                />
                <Button label="Áp dụng ưu đãi" onClick={() => setCoupon(input.trim())} />
                {[
                  ['Tạm tính', data.quote.subtotal],
                  ['Giảm giá', -data.quote.discount],
                  ['Phí giao hàng', data.quote.shippingFee],
                  ['Tổng thanh toán', data.quote.total],
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
                <Submit command={command} label="Xác nhận đặt hàng" />
              </Panel>
            </form>
          ) : (
            <Empty text="Giỏ hàng trống, hãy chọn sản phẩm trước khi thanh toán." to="/san-pham" />
          ))}
      </ResourceState>
    </Page>
  )
}
