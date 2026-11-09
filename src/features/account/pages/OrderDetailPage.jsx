import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { Page, Panel, Feedback, Field, Submit, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'

function Payment({ payment, refresh }) {
  const command = useCommand()
  const qr = useResource(
    useCallback(
      (signal) =>
        payment.isSimulation
          ? api.get('/simulation/payments/' + payment.id + '/qr.svg', {
              signal,
              responseType: 'text',
            })
          : Promise.resolve(null),
      [payment.id, payment.isSimulation],
    ),
  )
  async function settle(success) {
    const body = { success }
    const ok = await command.run(
      () => api.post('/simulation/payments/' + payment.id + '/settle', body),
      { id: payment.id, ...body },
      success ? 'Đã ghi nhận thanh toán mô phỏng.' : 'Đã ghi nhận giao dịch mô phỏng thất bại.',
    )
    if (ok) refresh()
  }
  return (
    <Panel title="Thanh toán VietQR">
      <Feedback command={command} />
      <Status value={payment.status} />
      <p className="font-semibold">{formatMoney(payment.amount)}</p>
      {payment.isSimulation && (
        <>
          <p className="text-sm text-slate-500">
            Đây là giao dịch mô phỏng, không chuyển tiền thật.
          </p>
          {payment.status === 'Pending' && (
            <>
              <ResourceState {...qr} empty={false}>
                {typeof qr.data === 'string' && (
                  <img
                    src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qr.data)}
                    alt="Mã QR thanh toán mô phỏng"
                    width="240"
                    height="240"
                    className="max-w-full self-center"
                  />
                )}
              </ResourceState>
              <HStack gap={3} wrap="wrap">
                <Button
                  label="Mô phỏng thanh toán thành công"
                  variant="primary"
                  isLoading={command.pending}
                  onClick={() => settle(true)}
                />
                <Button
                  label="Mô phỏng thất bại"
                  isDisabled={command.pending}
                  onClick={() => settle(false)}
                />
              </HStack>
            </>
          )}
        </>
      )}
    </Panel>
  )
}
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
      order.status === 'PendingPayment' ? 'Đã hủy đơn chưa thanh toán.' : 'Đã gửi yêu cầu hủy. Vui lòng chờ người bán duyệt.',
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
            {order.cancellationRequestedAt && (
              <Panel title={order.cancellationPending ? 'Yêu cầu hủy đang chờ người bán duyệt' : 'Thông tin yêu cầu hủy'}>
                <p className="text-sm">Lý do: {order.cancellationReason}</p>
                {order.cancellationDecisionReason && <p className="text-sm">Phản hồi người bán: {order.cancellationDecisionReason}</p>}
                {order.status === 'Cancelled' && ['Paid', 'PartiallyRefunded'].includes(order.paymentStatus) && <p className="text-sm">Đã hủy đơn. Tiền chưa được hoàn xong; theo dõi trạng thái hoàn tiền bên dưới.</p>}
              </Panel>
            )}
            {(data.refunds || []).map((refund) => <Panel key={refund.id} title="Hoàn tiền"><Status value={refund.status} /><p>{formatMoney(refund.amount)}</p></Panel>)}
            {data.payments.map((p) => (
              <Payment key={p.id} payment={p} refresh={resource.retry} />
            ))}
            {!order.cancellationPending && ['PendingPayment', 'Confirmed', 'Processing'].includes(order.status) && (
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
