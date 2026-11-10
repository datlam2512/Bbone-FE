// Returns are approved first; warehouse inspection and financial refunds are separate operations.
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@astryxdesign/core/Button'
import { HStack } from '@astryxdesign/core/HStack'
import { api } from '@/shared/api/client'
import { Page, Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import DataTable from '@/shared/components/ui/DataTable'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { itemsOf, dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'

const labels = {
  Requested: 'Chờ duyệt',
  Approved: 'Chờ nhận hàng',
  Rejected: 'Đã từ chối',
  Received: 'Đã kiểm nhận',
}
export default function AdminReturnsPage() {
  const [page, setPage] = useState(1),
    [selected, setSelected] = useState(null)
  const list = useResource(
    useCallback(
      (signal) => api.get('/admin/returns?page=' + page + '&size=20', { signal }),
      [page],
    ),
  )
  const detail = useResource(
    useCallback(
      async (signal) => {
        if (!selected) return null
        const data = await api.get('/returns/' + selected, { signal })
        const order = await api.get('/orders/' + data.request.orderId, { signal })
        const batches = await Promise.all(
          data.lines.map(async (line) => {
            const sold = order.lines.find((item) => item.id === line.orderLineId)
            return sold ? api.get('/admin/stock-batches/' + sold.productId, { signal }) : []
          }),
        )
        return { ...data, order, batches }
      },
      [selected],
    ),
  )
  const command = useCommand(),
    data = detail.data,
    request = data?.request
  async function decide(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget),
      body = {
        version: request.version,
        approve: fields.get('decision') === 'approve',
        reason: fields.get('reason').trim(),
      }
    const ok = await command.run(
      () => api.post('/admin/returns/' + selected + '/decision', body),
      body,
      'Đã lưu quyết định trả hàng.',
    )
    if (ok) {
      detail.retry()
      list.retry()
    }
  }
  async function receive(event) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const body = {
      version: request.version,
      evidence: fields.get('evidence').trim(),
      lines: data.lines.map((line) => ({
        orderLineId: line.orderLineId,
        restockQuantity: Number(fields.get('quantity-' + line.id)),
        stockBatchId: fields.get('batch-' + line.id) || null,
      })),
    }
    const ok = await command.run(
      (key) => api.post('/admin/returns/' + selected + '/receive', body, { idempotencyKey: key }),
      body,
      'Đã kiểm nhận. Yêu cầu hoàn tiền được xử lý riêng nếu đơn đã thu tiền.',
    )
    if (ok) {
      detail.retry()
      list.retry()
    }
  }
  return (
    <Page
      title="Trả hàng"
      description="Duyệt yêu cầu, kiểm nhận hàng về và chuyển hồ sơ hoàn tiền. Không tự nhập lại hàng chưa kiểm tra."
    >
      <Feedback command={command} />
      <ResourceState {...list} empty={!itemsOf(list.data).length}>
        <DataTable
          rows={itemsOf(list.data)}
          page={page}
          total={list.data?.total || 0}
          onPage={setPage}
          columns={[
            { label: 'Yêu cầu', render: (row) => row.id.slice(0, 8).toUpperCase() },
            { label: 'Ngày tạo', render: (row) => dateTime(row.createdAt) },
            { label: 'Lý do', key: 'reason' },
            {
              label: 'Trạng thái',
              render: (row) => <Status value={labels[row.status] || row.status} />,
            },
            {
              label: 'Thao tác',
              render: (row) => (
                <Button size="sm" label="Chi tiết" onClick={() => setSelected(row.id)} />
              ),
            },
          ]}
        />
      </ResourceState>
      {selected && (
        <ResourceState {...detail} empty={!data}>
          {data && (
            <Panel title={'Yêu cầu trả · ' + data.order.order.code}>
              <p className="text-sm leading-7">Lý do: {request.reason}</p>
              <Status value={labels[request.status] || request.status} />
              {request.decisionReason && (
                <p className="text-sm leading-7">Phản hồi: {request.decisionReason}</p>
              )}
              <ul className="divide-y divide-slate-100">
                {data.lines.map((line) => (
                  <li key={line.id} className="py-3 text-sm">
                    {data.order.lines.find((sale) => sale.id === line.orderLineId)?.name ||
                      line.orderLineId}{' '}
                    · Trả {line.quantity} sản phẩm
                  </li>
                ))}
              </ul>
              {request.status === 'Requested' && (
                <form onSubmit={decide} className="space-y-4">
                  <Field label="Quyết định" name="decision" type="select">
                    <option value="approve">Duyệt trả hàng</option>
                    <option value="reject">Từ chối</option>
                  </Field>
                  <Field
                    name="reason"
                    label="Lý do / hướng dẫn gửi trả"
                    type="textarea"
                    required
                    minLength={3}
                    maxLength={1000}
                  />
                  <Submit command={command} label="Lưu quyết định" />
                </form>
              )}
              {request.status === 'Approved' && (
                <form onSubmit={receive} className="space-y-5">
                  <h3 className="font-semibold">Kiểm nhận tại kho</h3>
                  <p className="text-sm leading-7 text-slate-600">
                    Chỉ xác nhận sau khi hàng đã về. Số nhập lại mặc định bằng 0; chỉ tăng nếu hàng
                    đạt điều kiện bán lại. Tiền hoàn được tính theo giá đã mua và giảm giá, không
                    gồm phí giao hàng.
                  </p>
                  {data.lines.map((line, index) => (
                    <section
                      key={line.id}
                      className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2"
                    >
                      <Field
                        label={
                          'Số nhập lại · ' +
                          (data.order.lines.find((sale) => sale.id === line.orderLineId)?.name ||
                            'Sản phẩm')
                        }
                        name={'quantity-' + line.id}
                        type="number"
                        required
                        min="0"
                        max={line.quantity}
                        step="1"
                        defaultValue="0"
                      />
                      {data.batches[index].length > 0 && (
                        <Field
                          label="Lô nhập lại (khi số lượng > 0)"
                          name={'batch-' + line.id}
                          type="select"
                          defaultValue=""
                        >
                          <option value="">Chọn lô phù hợp</option>
                          {data.batches[index]
                            .filter(
                              (batch) =>
                                !batch.quarantined &&
                                batch.expiresOn > new Date().toISOString().slice(0, 10),
                            )
                            .map((batch) => (
                              <option key={batch.id} value={batch.id}>
                                {batch.lotNumber} · {batch.expiresOn}
                              </option>
                            ))}
                        </Field>
                      )}
                    </section>
                  ))}
                  <Field
                    name="evidence"
                    label="Chứng từ / kết quả kiểm kho"
                    type="textarea"
                    required
                    minLength={3}
                    maxLength={1000}
                  />
                  <label className="flex items-start gap-2 text-sm leading-6">
                    <input type="checkbox" required />
                    Tôi đã kiểm tra thực tế toàn bộ hàng trả và số lượng nhập lại.
                  </label>
                  <Submit command={command} label="Xác nhận kiểm nhận hàng" />
                </form>
              )}
              {request.status === 'Received' && (
                <section className="space-y-3 rounded-xl bg-emerald-50 p-4">
                  <p className="text-sm leading-7">Chứng từ: {request.receiptEvidence}</p>
                  <p className="font-semibold">
                    Số tiền đề nghị hoàn: {formatMoney(request.refundAmount)}
                  </p>
                  {request.refundId && (
                    <Link to="/quan-tri/hoan-tien" className="text-sm font-semibold text-brand-700">
                      Chuyển đến quản lý hoàn tiền →
                    </Link>
                  )}
                </section>
              )}
              <HStack hAlign="end">
                <Button label="Đóng chi tiết" onClick={() => setSelected(null)} />
              </HStack>
            </Panel>
          )}
        </ResourceState>
      )}
    </Page>
  )
}
