import { Package, MapPin, Phone, ReceiptText } from 'lucide-react'
import { VStack } from '@astryxdesign/core/VStack'
import { formatMoney } from '@/shared/lib/format'
export default function OrderSummary({ order, lines }) {
  return (
    <VStack
      as="aside"
      gap={5}
      className="h-fit rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm sm:p-6 lg:sticky lg:top-24"
    >
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <ReceiptText size={20} className="text-brand-600" />
        Tóm tắt đơn hàng
      </h2>
      <ul className="divide-y divide-slate-100">
        {lines.map((line) => (
          <li key={line.id} className="flex items-start gap-3 py-4 first:pt-0">
            <Package size={36} className="shrink-0 rounded-lg bg-slate-50 p-2 text-slate-400" />
            <section className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold leading-6">{line.name}</h3>
              <p className="mt-1 text-xs text-slate-500">Số lượng: {line.quantity}</p>
            </section>
            <strong className="shrink-0 pt-1 text-sm">
              {formatMoney(line.unitPrice * line.quantity)}
            </strong>
          </li>
        ))}
      </ul>
      <dl className="space-y-3 border-t border-slate-100 pt-4 text-sm">
        {[
          ['Tạm tính', order.subtotal],
          ['Phí giao hàng', order.shippingFee],
          ...(order.discount > 0 ? [['Giảm giá', -order.discount]] : []),
        ].map(([label, value]) => (
          <section key={label} className="flex justify-between gap-3">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-medium">{formatMoney(value)}</dd>
          </section>
        ))}
        <section className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <dt className="font-semibold">Tổng thanh toán</dt>
          <dd className="text-xl font-bold text-brand-700">{formatMoney(order.total)}</dd>
        </section>
      </dl>
      <section className="space-y-3 border-t border-slate-100 pt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <MapPin size={17} className="text-slate-400" />
          Địa chỉ nhận hàng
        </h3>
        <p className="text-sm font-semibold">{order.recipient}</p>
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Phone size={14} />
          {order.phone}
        </p>
        <p className="text-sm leading-7 text-slate-500">{order.address}</p>
      </section>
    </VStack>
  )
}
