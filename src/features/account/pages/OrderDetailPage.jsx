import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { ArrowLeft, QrCode, Clock3 } from 'lucide-react'
import OrderSummary from '../components/OrderSummary'
import OrderRefundPanel from '../components/OrderRefundPanel'
import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import OrderPaymentPanel from '../components/OrderPaymentPanel'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { Panel, Feedback, Field, Submit, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'

export default function OrderDetailPage() {
  const { id } = useParams(),
    [cancel, setCancel] = useState(false)
  const resource = useResource(useCallback((signal) => api.get('/orders/' + id, { signal }), [id])),
    command = useCommand(),
    data = resource.data,
    order = data?.order
  async function cancelOrder(e) {
    e.preventDefault()
    const body = { version: order.version, reason: new FormData(e.currentTarget).get('reason') }
    const ok = await command.run(
      (key) => api.post('/orders/' + id + '/cancel', body, { idempotencyKey: key }),
      body,
      order.status === 'PendingPayment'
        ? 'Đã hủy đơn chưa thanh toán.'
        : 'Đã gửi yêu cầu hủy. Vui lòng chờ người bán duyệt.',
    )
    if (ok) {
      setCancel(false)
      resource.retry()
    }
  }
  async function pay() {
    const ok = await command.run(
      (key) => api.post('/orders/' + id + '/payments', undefined, { idempotencyKey: key }),
      { id },
      'Đã tạo yêu cầu thanh toán.',
    )
    if (ok) resource.retry()
  }
  const payments = data?.payments || []
  const activePayment =
    payments.find((payment) =>
      ['Paid', 'Refunded', 'PartiallyRefunded'].includes(payment.status),
    ) || payments.find((payment) => payment.status === 'Pending')
  const pastPayments = payments.filter((payment) => payment.id !== activePayment?.id)
  const canCancel =
    order &&
    !order.cancellationPending &&
    ['PendingPayment', 'PendingConfirmation'].includes(order.status)
  return (
    <section className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 lg:px-8">
      <VStack gap={6} className="mx-auto w-full max-w-7xl">
        <Link
          to="/tai-khoan/don-hang"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-700"
        >
          <ArrowLeft size={16} />
          Đơn hàng của tôi
        </Link>
        <ResourceState {...resource} empty={!data}>
          {data && (
            <>
              <header className="flex flex-wrap items-center justify-between gap-4">
                <VStack gap={2}>
                  <p className="text-xs font-semibold tracking-widest text-brand-700">
                    BBONE · ĐƠN HÀNG
                  </p>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {order.status === 'PendingPayment'
                      ? 'Hoàn tất thanh toán'
                      : 'Chi tiết đơn hàng'}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {order.code} · {dateTime(order.createdAt)}
                  </p>
                </VStack>
                <VStack gap={2} className="items-start sm:items-end">
                  <Status value={order.cancellationPending ? 'Chờ duyệt hủy' : order.status} />
                  <p className="text-xs text-slate-500">
                    {order.method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản VietQR'}
                  </p>
                </VStack>
              </header>
              <Feedback command={command} />
              <section className="grid items-start gap-6 lg:grid-cols-3">
                <VStack gap={5} className="min-w-0 lg:col-span-2">
                  {activePayment ? (
                    <OrderPaymentPanel
                      key={activePayment.id}
                      payment={activePayment}
                      refresh={resource.retry}
                      beneficiary={data.beneficiary}
                      canPay={order.status === 'PendingPayment' && !order.cancellationPending}
                    />
                  ) : (
                    <Panel
                      title={
                        order.method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán đơn hàng'
                      }
                    >
                      <p className="text-sm leading-7 text-slate-600">
                        {order.method === 'COD'
                          ? 'Bạn thanh toán cho đơn vị giao hàng khi nhận được đơn. Theo dõi xác nhận của người bán trong tài khoản.'
                          : 'Tạo mã QR riêng cho đơn này để chuyển đúng số tiền và nội dung.'}
                      </p>
                      {order.status === 'PendingPayment' && (
                        <Button
                          label="Tạo mã QR thanh toán"
                          icon={<QrCode size={18} />}
                          variant="primary"
                          isLoading={command.pending}
                          onClick={pay}
                        />
                      )}
                    </Panel>
                  )}

                  {order.status === 'PendingConfirmation' && (
                    <section className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
                      <Clock3 size={21} className="shrink-0 text-brand-700" />
                      <p className="text-sm leading-7 text-slate-700">
                        Đơn đang chờ người bán xác nhận. Thanh toán và xác nhận đơn là hai bước
                        riêng.
                      </p>
                    </section>
                  )}
                  {order.cancellationRequestedAt && (
                    <Panel
                      title={
                        order.cancellationPending
                          ? 'Yêu cầu hủy đang chờ duyệt'
                          : 'Thông tin yêu cầu hủy'
                      }
                    >
                      <p className="text-sm leading-7">Lý do: {order.cancellationReason}</p>
                      {order.cancellationDecisionReason && (
                        <p className="text-sm leading-7">
                          Phản hồi: {order.cancellationDecisionReason}
                        </p>
                      )}
                    </Panel>
                  )}
                  {order.status === 'Cancelled' &&
                    ['Paid', 'PartiallyRefunded'].includes(order.paymentStatus) && (
                      <section className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-7 text-orange-900">
                        Đơn đã hủy, nhưng tiền chưa được hoàn tất. Theo dõi yêu cầu hoàn tiền bên
                        dưới; trạng thái hủy không đồng nghĩa đã hoàn tiền.
                      </section>
                    )}
                  {(data.refunds || []).map((refund) => (
                    <OrderRefundPanel
                      key={refund.id}
                      refund={refund}
                      payment={payments.find((payment) => payment.id === refund.paymentId)}
                      refresh={resource.retry}
                    />
                  ))}
                  {data.shipments.length > 0 && (
                    <Panel title="Theo dõi giao hàng">
                      {data.shipments.map((shipment) => (
                        <section
                          key={shipment.id}
                          className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0"
                        >
                          <VStack gap={2}>
                            <Status value={shipment.status} />
                            <p className="text-sm text-slate-500">
                              {shipment.carrier} · {shipment.trackingCode}
                            </p>
                          </VStack>
                          <Link
                            to={'/tai-khoan/giao-hang/' + shipment.id}
                            className="text-sm font-semibold text-brand-700"
                          >
                            Xem hành trình →
                          </Link>
                        </section>
                      ))}
                    </Panel>
                  )}
                  {pastPayments.length > 0 && (
                    <details className="rounded-xl border border-slate-200 bg-white p-5">
                      <summary className="cursor-pointer text-sm font-semibold">
                        Lịch sử giao dịch trước ({pastPayments.length})
                      </summary>
                      <VStack gap={4} className="mt-4">
                        {pastPayments.map((payment) => (
                          <section
                            key={payment.id}
                            className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3"
                          >
                            <p className="text-sm text-slate-500">{dateTime(payment.createdAt)}</p>
                            <strong className="text-sm">{formatMoney(payment.amount)}</strong>
                            <Status value={payment.status} />
                          </section>
                        ))}
                      </VStack>
                    </details>
                  )}
                  {canCancel && (
                    <section className="space-y-4 border-t border-slate-200 pt-5">
                      <HStack gap={3} hAlign="between" wrap="wrap">
                        <p className="text-xs leading-6 text-slate-500">Cần hỗ trợ với đơn này?</p>
                        <HStack gap={4}>
                          <Link to="/lien-he" className="text-sm font-semibold text-brand-700 mt-1.5">
                            Liên hệ
                          </Link>
                          <Button
                            label={cancel ? 'Đóng yêu cầu' : 'Yêu cầu hủy đơn'}
                            variant="ghost"
                            onClick={() => setCancel(!cancel)}
                          />
                        </HStack>
                      </HStack>
                      {cancel && (
                        <Panel title="Gửi yêu cầu hủy">
                          <form onSubmit={cancelOrder} className="space-y-4">
                            <p className="text-sm leading-7 text-slate-600">
                              Chỉ áp dụng trước khi người bán xác nhận. Nếu đã thanh toán, yêu cầu
                              hủy và hoàn tiền được xử lý riêng.
                            </p>
                            <Field
                              label="Lý do hủy"
                              name="reason"
                              type="textarea"
                              required
                              maxLength={1000}
                            />
                            <label className="flex gap-2 text-sm leading-6">
                              <input type="checkbox" required />
                              Tôi đã kiểm tra thông tin và muốn gửi yêu cầu hủy.
                            </label>
                            <Submit command={command} label="Gửi yêu cầu hủy" />
                          </form>
                        </Panel>
                      )}
                    </section>
                  )}
                </VStack>
                <OrderSummary order={order} lines={data.lines} />
              </section>
            </>
          )}
        </ResourceState>
      </VStack>
    </section>
  )
}
