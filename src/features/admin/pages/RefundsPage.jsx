import { useCallback, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import DataTable from '@/shared/components/ui/DataTable'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'
export default function RefundsPage() {
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const command = useCommand()
  const refunds = useResource(
    useCallback(
      (signal) => api.get('/admin/refunds?page=' + page + '&size=20', { signal }),
      [page],
    ),
  )
  const detail = useResource(
    useCallback(
      (signal) =>
        selectedId ? api.get('/admin/refunds/' + selectedId, { signal }) : Promise.resolve(null),
      [selectedId],
    ),
  )
  const data = detail.data
  async function start() {
    const body = { version: data.refund.version }
    const saved = await command.run(
      () => api.post('/admin/refunds/' + selectedId + '/manual-start', body),
      { id: selectedId, ...body },
      'Đã khóa tài khoản nhận hoàn. Chưa có tiền được chuyển bởi ứng dụng.',
    )
    if (saved) {
      refunds.retry()
      detail.retry()
    }
  }
  async function finish(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const simulation = data.payment.isSimulation
    const body = simulation
      ? { version: data.refund.version, approve: true, reason: form.get('evidence') }
      : { version: data.refund.version, evidenceReference: form.get('evidence') }
    const saved = await command.run(
      (key) =>
        api.post(
          '/admin/refunds/' + selectedId + (simulation ? '/decision' : '/bank-evidence'),
          body,
          { idempotencyKey: key },
        ),
      { id: selectedId, ...body },
      simulation
        ? 'Đã duyệt xử lý hoàn tiền mô phỏng.'
        : 'Đã ghi nhận chứng từ thực chi. Trạng thái khách hàng đã được cập nhật.',
    )
    if (saved) {
      refunds.retry()
      detail.retry()
    }
  }
  return (
    <Page
      title="Quản lý hoàn tiền"
      description="Đối soát yêu cầu, tài khoản nhận và chứng từ thực chi."
    >
      <Feedback command={command} />
      {selectedId && (
        <Panel title="Chi tiết hoàn tiền">
          <Button label="Đóng chi tiết" variant="ghost" onClick={() => setSelectedId(null)} />
          <ResourceState {...detail} empty={!data}>
            {data && (
              <>
                <h2 className="font-semibold">
                  {data.orderCode} · {formatMoney(data.refund.amount)}
                </h2>
                <Status value={data.refund.status} />
                <p className="text-sm">{data.refund.reason}</p>
                {data.destination ? (
                  <section className="space-y-2 rounded-xl bg-brand-50 p-4">
                    <h3 className="font-semibold">Tài khoản khách cung cấp</h3>
                    <p>
                      {data.destination.bankCode} · {data.destination.accountNumber}
                    </p>
                    <p className="font-semibold">{data.destination.accountName}</p>
                  </section>
                ) : (
                  <p className="text-sm">Chưa có tài khoản nhận hoàn.</p>
                )}
                {data.payment.provider === 'VietQrManual' && data.refund.status === 'Requested' && (
                  <Button
                    label="Bắt đầu xử lý và khóa thông tin nhận"
                    onClick={start}
                    isDisabled={!data.destination}
                    isLoading={command.pending}
                  />
                )}
                {((data.payment.provider === 'VietQrManual' &&
                  data.refund.status === 'Processing') ||
                  (data.payment.provider === 'COD' && data.refund.status === 'Requested') ||
                  (data.payment.isSimulation && data.refund.status === 'Requested')) && (
                  <form onSubmit={finish} className="space-y-4">
                    <p className="text-sm leading-7">
                      {data.payment.isSimulation
                        ? 'Đây là hoàn tiền mô phỏng.'
                        : 'Ứng dụng chưa tích hợp API chi tiền. Nhân viên cần chuyển tiền thực tế qua ngân hàng theo đúng tài khoản và số tiền trước khi ghi nhận chứng từ dưới đây.'}
                    </p>
                    <Field
                      label={
                        data.payment.isSimulation
                          ? 'Lý do duyệt mô phỏng'
                          : 'Mã giao dịch/biên nhận thực chi'
                      }
                      name="evidence"
                      required
                      maxLength={100}
                    />
                    <label className="flex gap-2 text-sm">
                      <input type="checkbox" required />
                      {data.payment.isSimulation
                        ? 'Tôi xác nhận xử lý mô phỏng.'
                        : 'Tôi đã thực hiện hoàn tiền và đối chiếu đúng người nhận, số tiền.'}
                    </label>
                    <Submit
                      command={command}
                      label={
                        data.payment.isSimulation
                          ? 'Duyệt hoàn mô phỏng'
                          : 'Ghi nhận đã hoàn tiền thực tế'
                      }
                    />
                  </form>
                )}
                {data.refund.succeededAt && (
                  <p className="text-sm">
                    Hoàn tất: {dateTime(data.refund.succeededAt)} · {data.refund.providerReference}
                  </p>
                )}
              </>
            )}
          </ResourceState>
        </Panel>
      )}
      <ResourceState {...refunds} empty={!itemsOf(refunds.data).length}>
        <DataTable
          rows={itemsOf(refunds.data)}
          total={refunds.data?.total}
          page={page}
          onPage={setPage}
          columns={[
            {
              label: 'Yêu cầu',
              render: (row) => (
                <Button
                  label={row.id.slice(0, 8)}
                  variant="ghost"
                  onClick={() => setSelectedId(row.id)}
                />
              ),
            },
            { label: 'Số tiền', render: (row) => formatMoney(row.amount) },
            { label: 'Trạng thái', render: (row) => <Status value={row.status} /> },
            { label: 'Ngày tạo', render: (row) => dateTime(row.createdAt) },
          ]}
        />
      </ResourceState>
    </Page>
  )
}
