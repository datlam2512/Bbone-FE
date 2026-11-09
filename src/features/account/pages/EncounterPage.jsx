import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/shared/api/client'
import { Page, Panel } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { dateTime } from '@/shared/lib/workflows'
export default function EncounterPage() {
  const { id } = useParams()
  const r = useResource(useCallback((signal) => api.get('/me/encounters/' + id, { signal }), [id]))
  return (
    <Page
      title="Hồ sơ lần khám"
      description="Chỉ hiển thị thông tin đã được bác sĩ ký và chia sẻ với bạn."
      back="/tai-khoan/ho-so"
    >
      <ResourceState {...r} empty={!r.data?.records?.length}>
        {r.data?.records.map((record) => (
          <Panel key={record.id} title={'Cập nhật ' + dateTime(record.signedAt)}>
            <h2 className="font-semibold">Chẩn đoán</h2>
            <p className="text-sm leading-7 whitespace-pre-line">{record.diagnosis}</p>
            <h2 className="font-semibold">Ghi chú</h2>
            <p className="text-sm leading-7 whitespace-pre-line">{record.notes}</p>
          </Panel>
        ))}
      </ResourceState>
    </Page>
  )
}
