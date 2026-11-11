// Shared blank-page frame with a paginated table and a separate creation form.
import { useCallback, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { Page, Panel, Field, Feedback, Submit } from '@/shared/components/ui/Workflow'
import DataTable from '@/shared/components/ui/DataTable'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { itemsOf, dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'
import AdminDialog from '../components/AdminDialog'

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1),
    [creating, setCreating] = useState(false),
    [selected, setSelected] = useState(null)
  const resource = useResource(
    useCallback(
      (signal) => api.get('/admin/coupons?page=' + page + '&size=20', { signal }),
      [page],
    ),
  )
  const command = useCommand()
  async function create(event) {
    event.preventDefault()
    const f = new FormData(event.currentTarget)
    const body = {
      code: f.get('code').trim().toUpperCase(),
      discount: Number(f.get('discount')),
      minimumSubtotal: Number(f.get('minimumSubtotal')),
      limit: Number(f.get('limit')),
      expiresAt: new Date(f.get('expiresAt')).toISOString(),
    }
    const ok = await command.run(
      () => api.post('/admin/coupons', body),
      body,
      'Đã tạo mã giảm giá.',
    )
    if (ok) {
      setCreating(false)
      setPage(1)
      resource.retry()
    }
  }
  async function toggle(event) {
    event.preventDefault()
    const body = { version: selected.version, active: !selected.active }
    const ok = await command.run(
      () => api.put('/admin/coupons/' + selected.id + '/state', body),
      { id: selected.id, ...body },
      'Đã cập nhật mã giảm giá.',
    )
    if (ok) {
      setSelected(null)
      resource.retry()
    }
  }
  return (
    <Page
      title="Mã giảm giá"
      description="Mã áp dụng cho đơn mới theo thời hạn và hạn mức. Tắt mã không thay đổi giá trị các đơn đã đặt."
      actions={
        <Button
          label="Tạo mã giảm giá"
          variant="primary"
          onClick={() => setCreating(true)}
        />
      }
    >
      <Feedback command={command} />
      {creating && (
        <AdminDialog open={creating} onClose={() => setCreating(false)} title="Tạo mã giảm giá" size="max-w-2xl">
          <Feedback command={command} />
          <form onSubmit={create} className="space-y-4">
            <section className="grid gap-4 sm:grid-cols-2">
              <Field name="code" label="Mã" required maxLength={80} pattern="[A-Za-z0-9_-]+" />
              <Field
                name="discount"
                label="Số tiền giảm (đ)"
                type="number"
                min="1"
                step="1"
                required
              />
              <Field
                name="minimumSubtotal"
                label="Giá trị hàng tối thiểu (đ)"
                type="number"
                min="0"
                step="1"
                required
              />
              <Field
                name="limit"
                label="Tổng lượt sử dụng"
                type="number"
                min="1"
                max="2147483647"
                step="1"
                required
              />
              <Field
                name="expiresAt"
                label="Hết hạn lúc (giờ địa phương)"
                type="datetime-local"
                required
              />
            </section>
            <Submit command={command} label="Tạo mã" />
          </form>
        </AdminDialog>
      )}
      {selected && (
        <AdminDialog open={!!selected} onClose={() => setSelected(null)} title={selected.active ? 'Tắt mã ' + selected.code : 'Bật mã ' + selected.code} size="max-w-xl">
          <Feedback command={command} />
          <form onSubmit={toggle} className="space-y-4">
            <p className="text-sm leading-7">
              Mã hết hạn hoặc hết lượt vẫn không áp dụng được dù được bật.
            </p>
            <label className="flex gap-2 text-sm">
              <input type="checkbox" required />
              Tôi xác nhận thay đổi trạng thái mã này.
            </label>
            <Submit command={command} label="Xác nhận" />
            <Button label="Đóng" onClick={() => setSelected(null)} />
          </form>
        </AdminDialog>
      )}
      <ResourceState
        emptyTitle="Chưa có mã giảm giá"
        emptyDescription="Chọn Tạo mã giảm giá để thêm chương trình cho các đơn mới."
        {...resource}
        empty={!itemsOf(resource.data).length}
      >
        <DataTable
          rows={itemsOf(resource.data)}
          page={page}
          total={resource.data?.total || 0}
          onPage={setPage}
          columns={[
            { label: 'Mã', key: 'code' },
            { label: 'Giảm', render: (row) => formatMoney(row.discount) },
            { label: 'Đơn tối thiểu', render: (row) => formatMoney(row.minimumSubtotal) },
            { label: 'Đã dùng / hạn mức', render: (row) => row.used + ' / ' + row.limit },
            { label: 'Hết hạn', render: (row) => dateTime(row.expiresAt) },
            { label: 'Trạng thái', render: (row) => (row.active ? 'Đang bật' : 'Đã tắt') },
            {
              label: 'Thao tác',
              render: (row) => (
                <Button
                  size="sm"
                  label={row.active ? 'Tắt mã' : 'Bật mã'}
                  onClick={() => setSelected(row)}
                />
              ),
            },
          ]}
        />
      </ResourceState>
    </Page>
  )
}
