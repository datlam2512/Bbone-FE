import { useCallback, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import DataTable from '@/shared/components/ui/DataTable'
import { itemsOf, dateTime, parseList } from '@/shared/lib/workflows'
import AdminDialog from './AdminDialog'

export default function RevisionInbox({ onPublished }) {
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [status, setStatus] = useState('Draft')
  const user = useAuthStore((state) => state.user)
  const command = useCommand()
  const revisions = useResource(
    useCallback(
      (signal) =>
        api.get(
          '/admin/article-revisions?page=' +
            page +
            '&size=10' +
            (status ? '&status=' + status : ''),
          { signal },
        ),
      [page, status],
    ),
  )
  const detail = useResource(
    useCallback(
      (signal) =>
        selectedId
          ? api.get('/admin/article-revisions/' + selectedId, { signal })
          : Promise.resolve(null),
      [selectedId],
    ),
  )
  const revision = detail.data?.revision
  const canReview =
    revision &&
    revision.authorId !== user.id &&
    (user.role === 'Doctor' || (!detail.data.requiresMedicalReview && user.role === 'Reviewer'))
  async function decide(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const action = form.get('decision')
    const body =
      action === 'approve'
        ? {
            version: revision.version,
            publishAt: form.get('publishAt') ? new Date(form.get('publishAt')).toISOString() : null,
          }
        : { version: revision.version, reason: form.get('reason') }
    const saved = await command.run(
      () => api.post('/admin/article-revisions/' + selectedId + '/' + action, body),
      { id: selectedId, action, ...body },
      'Đã ghi nhận quyết định duyệt.',
    )
    if (saved) {
      detail.retry()
      revisions.retry()
      onPublished()
    }
  }
  return (
    <Panel title="Bản sửa bài viết">
      <Feedback command={command} />
      <Field
        label="Trạng thái bản sửa"
        type="select"
        value={status}
        onChange={(event) => {
          setStatus(event.target.value)
          setPage(1)
        }}
      >
        <option value="">Tất cả</option>
        {['Draft', 'Approved', 'Published', 'Rejected', 'NeedsReview', 'Superseded'].map(
          (value) => (
            <option key={value} value={value}>
              {
                {
                  Draft: 'Chờ duyệt',
                  Approved: 'Đã duyệt / chờ lịch xuất bản',
                  Published: 'Đã xuất bản',
                  Rejected: 'Đã từ chối',
                  NeedsReview: 'Cần soạn lại',
                  Superseded: 'Đã thay thế',
                }[value]
              }
            </option>
          ),
        )}
      </Field>
      <ResourceState {...revisions} empty={!itemsOf(revisions.data).length}>
        <DataTable
          rows={itemsOf(revisions.data)}
          page={page}
          total={revisions.data?.total}
          pageSize={10}
          onPage={setPage}
          columns={[
            {
              label: 'Tiêu đề',
              render: (row) => (
                <Button label={row.title} variant="ghost" onClick={() => setSelectedId(row.id)} />
              ),
            },
            { label: 'Trạng thái', render: (row) => <Status value={row.status} /> },
            { label: 'Tạo lúc', render: (row) => dateTime(row.createdAt) },
          ]}
        />
      </ResourceState>
      {selectedId && (
        <AdminDialog open={!!selectedId} onClose={() => setSelectedId(null)} title="Nội dung bản sửa" size="max-w-4xl">
          <Feedback command={command} />
          <ResourceState {...detail} empty={!revision}>
            {revision && (
              <>
                <h3 className="text-xl font-semibold">{revision.title}</h3>
                <Status value={revision.status} />
                <p className="max-h-96 overflow-auto text-sm leading-8 whitespace-pre-wrap">
                  {revision.content}
                </p>
                {parseList(revision.referencesJson).map((reference, index) => {
                  const url = reference.Url || reference.url
                  return typeof url === 'string' && url.startsWith('https://') ? (
                    <a
                      key={url + index}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-brand-700 underline"
                    >
                      {reference.Title || reference.title || 'Nguồn tham khảo'}
                    </a>
                  ) : null
                })}
                {revision.baseVersion !== detail.data.currentArticleVersion &&
                  revision.status === 'Draft' && (
                    <p role="alert" className="text-sm text-orange-800">
                      Bài gốc đã thay đổi. Cần tạo bản sửa mới trên phiên bản hiện hành.
                    </p>
                  )}
                {canReview && ['Draft', 'Approved'].includes(revision.status) && (
                  <form onSubmit={decide} className="space-y-4 border-t border-slate-200 pt-4">
                    <Field label="Quyết định" name="decision" type="select" required>
                      <option value="">Chọn quyết định</option>
                      {revision.status === 'Draft' &&
                        revision.baseVersion === detail.data.currentArticleVersion && (
                          <option value="approve">Duyệt xuất bản</option>
                        )}
                      <option value="reject">Từ chối / dừng xuất bản</option>
                    </Field>
                    <Field
                      label="Lịch xuất bản (để trống nếu xuất bản ngay)"
                      type="datetime-local"
                      name="publishAt"
                    />
                    <Field
                      label="Lý do khi từ chối"
                      name="reason"
                      type="textarea"
                      maxLength={1000}
                    />
                    <label className="flex gap-2 text-sm leading-6">
                      <input type="checkbox" required />
                      Tôi đã đọc nội dung và kiểm tra tài liệu tham khảo.
                    </label>
                    <Submit command={command} label="Xác nhận quyết định" />
                  </form>
                )}
                {detail.data.requiresMedicalReview && user.role !== 'Doctor' && (
                  <p className="text-sm text-slate-600">
                    Nội dung này cần bác sĩ độc lập phê duyệt.
                  </p>
                )}
              </>
            )}
          </ResourceState>
        </AdminDialog>
      )}
    </Panel>
  )
}
