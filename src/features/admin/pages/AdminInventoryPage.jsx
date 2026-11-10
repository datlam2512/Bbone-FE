// Uses the shared blank-page frame; stock operations are kept separate from catalog editing.
import { useCallback, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { HStack } from '@astryxdesign/core/HStack'
import { api } from '@/shared/api/client'
import { Page, Panel, Field, Feedback, Submit } from '@/shared/components/ui/Workflow'
import DataTable from '@/shared/components/ui/DataTable'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { itemsOf } from '@/shared/lib/workflows'

export default function AdminInventoryPage() {
  const [tomorrow] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10))
  const [page, setPage] = useState(1),
    [product, setProduct] = useState(null),
    [batch, setBatch] = useState(null)
  const products = useResource(
    useCallback(
      (signal) => api.get('/admin/products?page=' + page + '&size=20', { signal }),
      [page],
    ),
  )
  const lots = useResource(
    useCallback(
      (signal) =>
        product ? api.get('/admin/stock-batches/' + product.id, { signal }) : Promise.resolve(null),
      [product],
    ),
  )
  const command = useCommand()
  async function receive(event) {
    event.preventDefault()
    const form = event.currentTarget,
      fields = new FormData(form)
    const body = {
      productId: product.id,
      lotNumber: fields.get('lotNumber').trim(),
      expiresOn: fields.get('expiresOn'),
      quantity: Number(fields.get('quantity')),
    }
    const ok = await command.run(
      (key) => api.post('/admin/stock-batches', body, { idempotencyKey: key }),
      body,
      'Đã nhập lô hàng và cập nhật tồn kho.',
    )
    if (ok) {
      form.reset()
      lots.retry()
      products.retry()
    }
  }
  async function quarantine(event) {
    event.preventDefault()
    const body = {
      version: batch.version,
      quarantined: !batch.quarantined,
      reason: new FormData(event.currentTarget).get('reason').trim(),
    }
    const ok = await command.run(
      () => api.post('/admin/stock-batches/' + batch.id + '/quarantine', body),
      body,
      'Đã cập nhật trạng thái lô.',
    )
    if (ok) {
      setBatch(null)
      lots.retry()
    }
  }
  return (
    <Page
      title="Kho theo lô"
      description="Theo dõi hạn dùng, nhập kho và cách ly lô hàng. Số lượng giữ chỗ được quản lý bởi luồng đơn hàng."
    >
      <Feedback command={command} />
      <ResourceState {...products} empty={!itemsOf(products.data).length}>
        <DataTable
          rows={itemsOf(products.data)}
          page={page}
          total={products.data?.total || 0}
          onPage={setPage}
          columns={[
            { label: 'Sản phẩm', key: 'name' },
            { label: 'Tồn kho', key: 'onHand' },
            { label: 'Giữ chỗ', key: 'reserved' },
            {
              label: 'Thao tác',
              render: (row) => (
                <Button
                  label={product?.id === row.id ? 'Đang chọn' : 'Quản lý lô'}
                  size="sm"
                  onClick={() => {
                    setProduct(row)
                    setBatch(null)
                  }}
                />
              ),
            },
          ]}
        />
      </ResourceState>
      {product && (
        <Panel title={'Các lô · ' + product.name}>
          <ResourceState
            emptyTitle="Chưa có lô hàng"
            emptyDescription="Nhập lô mới ở biểu mẫu bên dưới sau khi đối soát tồn kho."
            {...lots}
            empty={!itemsOf(lots.data).length}
          >
            <DataTable
              rows={itemsOf(lots.data)}
              columns={[
                { label: 'Mã lô', key: 'lotNumber' },
                { label: 'Hạn dùng', key: 'expiresOn' },
                { label: 'Số lượng', key: 'quantity' },
                { label: 'Giữ chỗ', key: 'reserved' },
                {
                  label: 'Trạng thái',
                  render: (row) => (
                    <p className={row.quarantined ? 'font-medium text-red-700' : 'text-slate-600'}>
                      {row.quarantined
                        ? 'Cách ly'
                        : row.expiresOn <= new Date().toISOString().slice(0, 10)
                          ? 'Hết hạn'
                          : 'Đang lưu kho'}
                    </p>
                  ),
                },
                {
                  label: 'Thao tác',
                  render: (row) => (
                    <Button
                      label={row.quarantined ? 'Gỡ cách ly' : 'Cách ly'}
                      size="sm"
                      onClick={() => setBatch(row)}
                    />
                  ),
                },
              ]}
            />
          </ResourceState>
          {batch && (
            <form
              onSubmit={quarantine}
              className="space-y-4 rounded-xl border border-orange-200 bg-orange-50 p-4"
            >
              <h3 className="font-semibold">
                {batch.quarantined ? 'Gỡ cách ly' : 'Cách ly'} lô {batch.lotNumber}
              </h3>
              <p className="text-sm leading-6 text-slate-600">
                Lô đang có hàng giữ chỗ không thể cách ly. Kiểm tra thực tế và ghi rõ lý do trước
                khi thay đổi.
              </p>
              <Field
                label="Lý do"
                name="reason"
                type="textarea"
                required
                minLength={3}
                maxLength={1000}
              />
              <HStack gap={3}>
                <Submit command={command} label="Xác nhận thay đổi" />
                <Button label="Đóng" onClick={() => setBatch(null)} />
              </HStack>
            </form>
          )}
          <form onSubmit={receive} className="space-y-4 border-t border-slate-100 pt-5">
            <h3 className="font-semibold">Nhập lô mới</h3>
            <p className="text-sm leading-7 text-slate-500">
              Nếu sản phẩm đang có tồn kho chưa phân lô, cần đối soát số dư trước khi khởi tạo lô
              đầu tiên. Hệ thống sẽ chặn khi số dư không phù hợp.
            </p>
            <section className="grid gap-4 sm:grid-cols-3">
              <Field label="Mã lô" name="lotNumber" required maxLength={100} />
              <Field label="Hạn dùng" name="expiresOn" type="date" required min={tomorrow} />
              <Field
                label="Số lượng nhập"
                name="quantity"
                type="number"
                required
                min="1"
                max="1000000"
                step="1"
              />
            </section>
            <Submit command={command} label="Nhập kho" />
          </form>
        </Panel>
      )}
    </Page>
  )
}
