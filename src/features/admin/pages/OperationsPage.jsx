import RuntimePolicyForm from '../components/RuntimePolicyForm'
import { useCallback, useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Feedback, Status } from '@/shared/components/ui/Workflow'
import DataTable from '@/shared/components/ui/DataTable'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, dateTime } from '@/shared/lib/workflows'
export default function OperationsPage({ mode = 'audit' }) {
  const [page, setPage] = useState(1),
    command = useCommand()
  const resource = useResource(
    useCallback(
      (signal) =>
        api.get(
          '/admin/' + mode + (mode === 'runtime-policy' ? '' : '?page=' + page + '&size=20'),
          { signal },
        ),
      [mode, page],
    ),
  )
  async function retry(row) {
    const body = { version: row.version }
    const ok = await command.run(
      () => api.post('/admin/outbox/' + row.id + '/retry', body),
      { id: row.id, ...body },
      'Đã đưa tác vụ vào hàng đợi thử lại.',
    )
    if (ok) resource.retry()
  }
  return (
    <Page
      title={
        {
          audit: 'Nhật ký hệ thống',
          outbox: 'Hàng đợi tác vụ',
          'runtime-policy': 'Chính sách vận hành',
        }[mode]
      }
      description="Thông tin vận hành lấy trực tiếp từ hệ thống."
    >
      <Feedback command={command} />
      <ResourceState
        {...resource}
        empty={mode === 'runtime-policy' ? !resource.data : !itemsOf(resource.data).length}
      >
        {mode === 'runtime-policy' ? (
          resource.data && <RuntimePolicyForm policy={resource.data} onSaved={resource.retry} />
        ) : (
          <DataTable
            rows={itemsOf(resource.data)}
            page={page}
            total={resource.data?.total}
            onPage={setPage}
            columns={
              mode === 'audit'
                ? [
                    { label: 'Thời gian', render: (r) => dateTime(r.createdAt) },
                    { label: 'Hoạt động', key: 'action' },
                    { label: 'Đối tượng', key: 'entityType' },
                    { label: 'Mã hỗ trợ', key: 'correlationId' },
                  ]
                : [
                    { label: 'Loại tác vụ', key: 'kind' },
                    { label: 'Trạng thái', render: (r) => <Status value={r.status} /> },
                    { label: 'Số lần thử', key: 'attempts' },
                    { label: 'Cập nhật', render: (r) => dateTime(r.updatedAt) },
                    {
                      label: 'Xử lý',
                      render: (r) => (
                        <Button
                          label="Thử lại"
                          size="sm"
                          isDisabled={
                            command.pending ||
                            !['Failed', 'NeedsReview', 'DeadLetter'].includes(r.status)
                          }
                          onClick={() => retry(r)}
                        />
                      ),
                    },
                  ]
            }
          />
        )}
      </ResourceState>
    </Page>
  )
}
