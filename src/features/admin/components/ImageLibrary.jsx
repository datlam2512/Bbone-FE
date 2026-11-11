import { createPortal } from 'react-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import ResourceState from '@/shared/components/ui/ResourceState'
import DataTable from '@/shared/components/ui/DataTable'
import { Feedback, Field, Submit } from '@/shared/components/ui/Workflow'
import { itemsOf, dateTime } from '@/shared/lib/workflows'
import { mediaUrl } from '@/shared/lib/media'
import AdminDialog from './AdminDialog'

export default function ImageLibrary({ onSelect }) {
  const [page, setPage] = useState(1),
    [archived, setArchived] = useState(false),
    [selected, setSelected] = useState(null)
  const role = useAuthStore((state) => state.user?.role),
    command = useCommand()
  const resource = useResource(
    useCallback(
      (signal) =>
        api.get('/admin/media?page=' + page + '&size=12&archived=' + archived, { signal }),
      [page, archived],
    ),
  )
  async function change(event) {
    event.preventDefault()
    event.stopPropagation()
    const body = { archived: !selected.archived }
    const ok = await command.run(
      () => api.post('/admin/media/' + selected.id + '/archive', body),
      { id: selected.id, ...body },
      body.archived
        ? 'Đã lưu trữ ảnh chưa dùng. Có thể khôi phục ở mục Đã lưu trữ.'
        : 'Đã khôi phục ảnh.',
    )
    if (ok) {
      setSelected(null)
      resource.retry()
    }
  }
  return (
    <section className="space-y-5">
      <Feedback command={command} />
      <Field
        label="Khu vực"
        type="select"
        value={String(archived)}
        onChange={(event) => {
          setArchived(event.target.value === 'true')
          setPage(1)
          setSelected(null)
        }}
      >
        <option value="false">Ảnh có thể sử dụng</option>
        <option value="true">Đã lưu trữ</option>
      </Field>
      <p className="text-xs leading-6 text-slate-500">
        Ảnh đã lưu trữ được ẩn khỏi danh sách chọn. Tệp vẫn được giữ để có thể khôi phục và bảo toàn
        liên kết cũ.
      </p>
      {selected && (
        <AdminDialog open={!!selected} onClose={() => setSelected(null)} title={selected.archived ? 'Khôi phục ảnh' : 'Lưu trữ ảnh'} size="max-w-xl">
        <Feedback command={command} />
        <form onSubmit={change} className="space-y-4">
          <p className="text-sm font-semibold">
            {selected.archived ? 'Khôi phục ảnh này?' : 'Lưu trữ ảnh chưa được sử dụng?'}
          </p>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" required />
            Tôi đã kiểm tra và xác nhận thao tác.
          </label>
          <Submit command={command} label="Xác nhận" />
          <Button label="Đóng" onClick={() => setSelected(null)} />
        </form>
        </AdminDialog>
      )}
      <ResourceState
        {...resource}
        empty={!itemsOf(resource.data).length}
        emptyTitle="Chưa có ảnh trong khu vực này"
        emptyDescription="Ảnh upload từ các biểu mẫu sẽ xuất hiện tại đây."
      >
        <DataTable
          rows={itemsOf(resource.data)}
          page={page}
          total={resource.data?.total || 0}
          pageSize={12}
          onPage={setPage}
          columns={[
            {
              label: 'Ảnh',
              render: (row) => (
                <img
                  src={mediaUrl(row.url)}
                  alt={'Ảnh ' + row.id.slice(0, 8)}
                  className="h-20 w-28 rounded-lg bg-slate-50 object-contain"
                />
              ),
            },
            {
              label: 'Thông tin',
              render: (row) => (
                <section className="space-y-2">
                  <p className="font-medium">{row.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-slate-500">
                    {Math.ceil(row.size / 1024)} KB · {dateTime(row.createdAt)}
                  </p>
                </section>
              ),
            },
            {
              label: 'Sử dụng',
              render: (row) => (
                <p className="max-w-xs text-xs leading-6 text-slate-600">
                  {row.usageKinds.length
                    ? row.usageKinds.join(', ')
                    : 'Chưa được dùng trong danh mục'}
                </p>
              ),
            },
            {
              label: 'Thao tác',
              render: (row) => (
                <section className="flex flex-wrap gap-2">
                  {onSelect && !row.archived && (
                    <Button
                      label="Chọn ảnh"
                      size="sm"
                      variant="primary"
                      onClick={() => onSelect(row.url)}
                    />
                  )}
                  <a
                    href={mediaUrl(row.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="self-center text-xs font-semibold text-brand-700"
                  >
                    Xem ảnh
                  </a>
                  {role === 'Admin' && (
                    <Button
                      label={row.archived ? 'Khôi phục' : 'Lưu trữ'}
                      size="sm"
                      isDisabled={!row.archived && row.usageKinds.length > 0}
                      onClick={() => setSelected(row)}
                    />
                  )}
                </section>
              ),
            },
          ]}
        />
      </ResourceState>
    </section>
  )
}
export function ImageLibraryDialog({ onSelect, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    dialog.current.showModal()
  }, [])
  return createPortal(
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }}
      aria-labelledby="image-library-title"
      className="m-auto max-h-screen w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 backdrop:bg-slate-900/40 sm:p-6"
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 id="image-library-title" className="text-lg font-bold">
          Chọn ảnh đã upload
        </h2>
        <Button label="Đóng thư viện" onClick={onClose} />
      </header>
      <ImageLibrary onSelect={onSelect} />
    </dialog>,
    document.body,
  )
}
