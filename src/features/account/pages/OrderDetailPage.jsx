import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import OrderPaymentPanel from '../components/OrderPaymentPanel'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { Page, Panel, Feedback, Field, Submit, Status } from '@/shared/components/ui/Workflow'
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
  return (
    <Page title={order?.code || 'Chi tiết đơn hàng'} back="/tai-khoan/don-hang">
      <Feedback command={command} />
      <ResourceState {...resource} empty={!data}>
        {data && (
          <>
            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="Thông tin đơn hàng">
                <Status value={order.status} />
                <p className="text-sm text-slate-500">Đặt ngày {dateTime(order.createdAt)}</p>
                {data.lines.map((line) => (
                  <p
                    key={line.id}
                    className="flex justify-between gap-5 border-b border-slate-100 py-3 text-sm"
                  >
                    {line.name} × {line.quantity}
                    <strong className="shrink-0">
                      {formatMoney(line.unitPrice * line.quantity)}
                    </strong>
                  </p>
                ))}
                <p className="flex justify-between font-semibold">
                  Tổng thanh toán<strong>{formatMoney(order.total)}</strong>
                </p>
                <p className="text-sm">
                  {order.method} · <Status value={order.paymentStatus} />
                </p>
              </Panel>
              <Panel title="Địa chỉ nhận hàng">
                <h3 className="font-semibold">{order.recipient}</h3>
                <p className="text-sm">{order.phone}</p>
                <p className="text-sm leading-7 text-slate-500">{order.address}</p>
                {data.shipments.map((s) => (
                  <section key={s.id} className="space-y-2 border-t border-slate-200 pt-4">
                    <Status value={s.status} />
                    <p className="text-sm">
                      {s.carrier} · {s.trackingCode}
                    </p>
                    <Link
                      to={'/tai-khoan/giao-hang/' + s.id}
                      className="text-sm font-semibold text-brand-600"
                    >
                      Theo dõi giao hàng →
                    </Link>
                  </section>
                ))}
              </Panel>
            </section>
            {order.status === 'PendingPayment' && (
              <Button
                label="Tạo / kiểm tra mã thanh toán"
                variant="primary"
                isLoading={command.pending}
                onClick={pay}
              />
            )}{' '}
            {order.status === 'Cancelled' &&
              ['Paid', 'PartiallyRefunded'].includes(order.paymentStatus) &&
              !order.cancellationRequestedAt && (
                <Panel title="Cần đối soát hoàn tiền">
                  <p className="text-sm leading-7">
                    Đơn này đã hủy nhưng giao dịch vẫn ghi nhận tiền đã thu. Trạng thái hủy không
                    đồng nghĩa đã hoàn tiền. Bộ phận phụ trách cần kiểm tra giao dịch và yêu cầu
                    hoàn tiền.
                  </p>
                </Panel>
              )}
            {order.cancellationRequestedAt && (
              <Panel
                title={
                  order.cancellationPending
                    ? 'Yêu cầu hủy đang chờ người bán duyệt'
                    : 'Thông tin yêu cầu hủy'
                }
              >
                <p className="text-sm">Lý do: {order.cancellationReason}</p>
                {order.cancellationDecisionReason && (
                  <p className="text-sm">Phản hồi người bán: {order.cancellationDecisionReason}</p>
                )}
                {order.status === 'Cancelled' &&
                  ['Paid', 'PartiallyRefunded'].includes(order.paymentStatus) && (
                    <p className="text-sm">
                      Đã hủy đơn. Tiền chưa được hoàn xong; theo dõi trạng thái hoàn tiền bên dưới.
                    </p>
                  )}
              </Panel>
            )}
            {(data.refunds || []).map((refund) => (
              <Panel key={refund.id} title="Hoàn tiền">
                <Status value={refund.status} />
                <p>{formatMoney(refund.amount)}</p>
              </Panel>
            ))}
            {data.payments.map((p) => (
              <OrderPaymentPanel key={p.id} payment={p} refresh={resource.retry} />
            ))}
            {!order.cancellationPending &&
              ['PendingPayment', 'Confirmed', 'Processing'].includes(order.status) && (
                <Button label="Yêu cầu hủy đơn" onClick={() => setCancel(!cancel)} />
              )}{' '}
            {cancel && (
              <Panel title="Hủy đơn hàng">
                <form onSubmit={cancelOrder} className="space-y-4">
                  <Field
                    label="Lý do hủy"
                    name="reason"
                    type="textarea"
                    maxLength={1000}
                    required
                  />
                  <Submit command={command} label="Gửi yêu cầu hủy" />
                </form>
              </Panel>
            )}
          </>
        )}
      </ResourceState>
    </Page>
  )
}
