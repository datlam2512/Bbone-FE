import { useCallback, useState } from 'react'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { Page, Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import DataTable from '@/shared/components/ui/DataTable'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, dateTime, statusLabels } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'

const transitions = {
  NotReady: ['Ready', 'Cancelled'],
  Ready: ['NotReady', 'HandedOver', 'Cancelled'],
  HandedOver: ['InTransit', 'DeliveryFailed', 'Returning'],
  InTransit: ['OutForDelivery', 'DeliveryFailed', 'Returning'],
  OutForDelivery: ['Delivered', 'DeliveryFailed', 'Returning'],
  DeliveryFailed: ['OutForDelivery', 'InTransit', 'Returning'],
  Returning: ['Returned'],
}
export default function AdminOrdersPage({ shipments = false }) {
  const [page, setPage] = useState(1),
    [status, setStatus] = useState(''),
    [selected, setSelected] = useState(null),
    [creating, setCreating] = useState(false)
  const role = useAuthStore((s) => s.user?.role),
    base = shipments ? 'shipments' : 'orders',
    command = useCommand()
  const resource = useResource(
    useCallback(
      (signal) =>
        api.get(
          '/admin/' + base + '?page=' + page + '&size=20' + (status ? '&status=' + status : ''),
          { signal },
        ),
      [base, page, status],
    ),
  )
  const detail = useResource(
    useCallback(
      (signal) =>
        selected
          ? api.get('/' + (shipments ? 'admin/shipments/' : 'orders/') + selected, { signal })
          : Promise.resolve(null),
      [selected, shipments],
    ),
  )
  const candidates = useResource(
    useCallback(
      (signal) =>
        creating
          ? api.get('/admin/orders?status=Processing&size=100', { signal })
          : Promise.resolve(null),
      [creating],
    ),
  )
  async function create(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      body = {
        orderId: f.get('orderId'),
        carrier: f.get('carrier'),
        trackingCode: f.get('trackingCode'),
        eta: f.get('eta') ? new Date(f.get('eta')).toISOString() : null,
        replacesShipmentId: null,
      }
    const ok = await command.run(
      (key) => api.post('/admin/shipments', body, { idempotencyKey: key }),
      body,
      'Đã tạo vận đơn.',
    )
    if (ok) {
      setCreating(false)
      resource.retry()
    }
  }
  async function decideCancellation(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const body = { version: detail.data.order.version, approve: f.get('decision') === 'approve', reason: f.get('reason') }
    const ok = await command.run((key) => api.post('/admin/orders/' + selected + '/cancellation-decision', body, { idempotencyKey: key }), { id: selected, ...body }, 'Đã xử lý yêu cầu hủy.')
    if (ok) { resource.retry(); detail.retry() }
  }
  async function update(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      row = shipments ? detail.data.shipment : detail.data.order,
      action = f.get('action')
    const body = shipments
      ? {
          version: row.version,
          status: action,
          reason: f.get('reason'),
          occurredAt: new Date().toISOString(),
        }
      : { version: row.version, ...(action === 'cod' ? { evidence: f.get('reason') } : {}) }
    const path = shipments
      ? '/simulation/shipments/' + row.id + '/advance'
      : '/admin/orders/' + row.id + '/' + action
    const ok = await command.run(
      (key) => api.post(path, body, { idempotencyKey: key }),
      { id: row.id, ...body },
      'Đã cập nhật trạng thái.',
    )
    if (ok) {
      resource.retry()
      detail.retry()
    }
  }
  const row = shipments ? detail.data?.shipment : detail.data?.order
  const actions = shipments
    ? transitions[row?.status] || []
    : !row?.cancellationPending && row?.status === 'Confirmed' && ['Admin', 'Commerce'].includes(role)
      ? ['process']
      : row?.status === 'Delivered' && ['Admin', 'Commerce'].includes(role)
        ? ['complete']
        : []
  return (
    <Page
      title={shipments ? 'Quản lý giao hàng' : 'Quản lý đơn hàng'}
      description={
        shipments
          ? 'Theo dõi và cập nhật mốc vận chuyển mô phỏng. Không gọi hãng vận chuyển thật.'
          : 'Theo dõi đơn hàng, tình trạng thanh toán và xử lý đơn.'
      }
      actions={
        shipments && (
          <Button label="Tạo vận đơn" variant="primary" onClick={() => setCreating(!creating)} />
        )
      }
    >
      <Feedback command={command} />
      <Field
        label="Lọc trạng thái"
        type="select"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value)
          setPage(1)
        }}
      >
        <option value="">Tất cả</option>
        {(shipments
          ? [
              'NotReady',
              'Ready',
              'HandedOver',
              'InTransit',
              'OutForDelivery',
              'Delivered',
              'DeliveryFailed',
              'Returning',
              'Returned',
              'Cancelled',
            ]
          : [
              'PendingPayment',
              'Confirmed',
              'Processing',
              'Shipped',
              'Delivered',
              'Completed',
              'Cancelled',
            ]
        ).map((s) => (
          <option key={s} value={s}>
            {statusLabels[s] || s}
          </option>
        ))}
      </Field>
      {creating && (
        <Panel title="Vận đơn mới">
          <ResourceState {...candidates} empty={!itemsOf(candidates.data).length}>
            <form onSubmit={create} className="grid gap-5 sm:grid-cols-2">
              <Field label="Đơn đang xử lý" name="orderId" type="select" required>
                <option value="">Chọn đơn hàng</option>
                {itemsOf(candidates.data).map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.code} · {o.recipient}
                  </option>
                ))}
              </Field>
              <Field
                label="Đơn vị vận chuyển"
                name="carrier"
                defaultValue="BBONE Simulation"
                required
                maxLength={100}
              />
              <Field label="Mã vận đơn" name="trackingCode" required maxLength={100} />
              <Field label="Dự kiến giao" name="eta" type="datetime-local" />
              <Submit command={command} label="Tạo vận đơn" />
            </form>
          </ResourceState>
        </Panel>
      )}
      {selected && (
        <Panel title="Chi tiết xử lý">
          <Button
            label="Đóng chi tiết"
            size="sm"
            variant="ghost"
            onClick={() => setSelected(null)}
          />
          <ResourceState {...detail} empty={!row}>
            {row && (
              <>
                <HStack gap={4} wrap="wrap">
                  <h2 className="font-semibold">{row.code || row.trackingCode}</h2>
                  <Status value={row.status} />
                </HStack>
                {shipments ? (
                  <ol className="space-y-3">
                    {detail.data.events.map((event) => (
                      <li key={event.id} className="border-l border-brand-200 pl-4 text-sm">
                        <Status value={event.after} />
                        <p className="mt-1 text-xs text-slate-500">{dateTime(event.occurredAt)}</p>
                        <p className="mt-1">{event.reason}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <>
                    <p className="text-sm leading-7">
                      {row.recipient} · {row.phone}
                      <br />
                      {row.address}
                    </p>
                    {detail.data.lines.map((line) => (
                      <p key={line.id} className="text-sm">
                        {line.name} × {line.quantity} ·{' '}
                        {formatMoney(line.unitPrice * line.quantity)}
                      </p>
                    ))}
                    <p className="font-semibold">
                      Tổng: {formatMoney(row.total)} · {row.paymentStatus}
                    </p>
                  </>
                )}
                {!shipments && row.cancellationPending && (
                  <Panel title="Yêu cầu hủy chờ duyệt">
                    <p className="text-sm">Lý do khách hàng: {row.cancellationReason}</p>
                    <p className="text-sm">Duyệt hủy sẽ dừng giao hàng. Đơn đã thanh toán sẽ tạo yêu cầu hoàn tiền riêng cho tài chính.</p>
                    {['Admin', 'Commerce'].includes(role) && <form onSubmit={decideCancellation} className="space-y-4">
                      <Field label="Quyết định" name="decision" type="select" required><option value="">Chọn quyết định</option><option value="approve">Duyệt hủy</option><option value="reject">Từ chối hủy</option></Field>
                      <Field label="Lý do phản hồi" name="reason" type="textarea" required maxLength={1000} />
                      <Submit command={command} label="Xác nhận quyết định" />
                    </form>}
                  </Panel>
                )}
                {(actions.length > 0 ||
                  (!shipments &&
                    row.method === 'COD' &&
                    ['Admin', 'Finance'].includes(role) &&
                    row.paymentStatus === 'Unpaid')) && (
                  <form onSubmit={update} className="space-y-4 border-t border-slate-200 pt-4">
                    <Field
                      label={shipments ? 'Trạng thái tiếp theo' : 'Thao tác xử lý'}
                      name="action"
                      type="select"
                      required
                    >
                      {actions.map((a) => (
                        <option key={a} value={a}>
                          {statusLabels[a] ||
                            { process: 'Bắt đầu xử lý đơn', complete: 'Hoàn tất đơn hàng' }[a] ||
                            a}
                        </option>
                      ))}
                      {!shipments &&
                        row.method === 'COD' &&
                        ['Admin', 'Finance'].includes(role) &&
                        row.paymentStatus === 'Unpaid' && (
                          <option value="cod">Ghi nhận đã thu COD</option>
                        )}
                    </Field>
                    <Field
                      label={
                        shipments ? 'Lý do / ghi chú vận chuyển' : 'Chứng từ đối soát (khi thu COD)'
                      }
                      name="reason"
                      type="textarea"
                      required
                      maxLength={1000}
                    />
                    <label className="flex gap-3 text-sm">
                      <input type="checkbox" required />
                      Tôi xác nhận cập nhật thông tin này.
                    </label>
                    <Submit command={command} label="Xác nhận cập nhật" />
                  </form>
                )}
              </>
            )}
          </ResourceState>
        </Panel>
      )}
      <ResourceState {...resource} empty={!itemsOf(resource.data).length}>
        <DataTable
          page={page}
          total={resource.data?.total}
          onPage={setPage}
          rows={itemsOf(resource.data)}
          columns={[
            {
              label: shipments ? 'Vận đơn' : 'Mã đơn',
              render: (r) => (
                <Button
                  label={r.trackingCode || r.code || r.shipment?.trackingCode || 'Chi tiết'}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(r.id || r.shipment.id)}
                />
              ),
            },
            {
              label: shipments ? 'Đơn vị' : 'Người nhận',
              render: (r) => (shipments ? r.carrier || r.shipment?.carrier : r.recipient),
            },
            {
              label: 'Trạng thái',
              render: (r) => <Status value={r.status || r.shipment?.status} />,
            },
            {
              label: shipments ? 'Dự kiến giao' : 'Tổng tiền',
              render: (r) =>
                shipments ? dateTime(r.eta || r.shipment?.eta) : formatMoney(r.total),
            },
            { label: 'Ngày tạo', render: (r) => dateTime(r.createdAt || r.shipment?.createdAt) },
          ]}
        />
      </ResourceState>
    </Page>
  )
}
