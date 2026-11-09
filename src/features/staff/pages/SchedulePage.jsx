import { useCallback, useState } from 'react'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Panel, Field, Feedback, Submit } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf } from '@/shared/lib/workflows'
export default function SchedulePage() {
  const [clinicId, setClinicId] = useState(''),
    command = useCommand()
  const clinics = useResource(
    useCallback((signal) => api.get('/clinics?size=100', { signal, auth: false }), []),
  )
  const detail = useResource(
    useCallback(
      (signal) =>
        clinicId ? api.get('/clinics/' + clinicId, { signal, auth: false }) : Promise.resolve(null),
      [clinicId],
    ),
  )
  async function save(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      body = {
        serviceId: f.get('serviceId'),
        doctorId: f.get('doctorId'),
        startsAt: new Date(f.get('startsAt')).toISOString(),
        capacity: Number(f.get('capacity')),
      }
    await command.run(() => api.post('/staff/slots', body), body, 'Đã tạo khung giờ khám.')
  }
  return (
    <Page
      title="Quản lý khung giờ khám"
      description="Tạo lịch cho bác sĩ đã được phân công tại cơ sở. Thời gian nhập theo giờ trên thiết bị."
    >
      <Feedback command={command} />
      <ResourceState {...clinics} empty={!itemsOf(clinics.data).length}>
        <Panel>
          <Field
            label="Phòng khám"
            type="select"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
          >
            <option value="">Chọn cơ sở</option>
            {itemsOf(clinics.data).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Field>
          {clinicId && (
            <ResourceState {...detail} empty={!detail.data}>
              <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
                <Field label="Dịch vụ" name="serviceId" type="select" required>
                  <option value="">Chọn dịch vụ</option>
                  {detail.data?.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Field>
                <Field
                  label="Mã bác sĩ được phân công"
                  name="doctorId"
                  required
                  pattern="[0-9a-fA-F-]{36}"
                />
                <Field label="Bắt đầu" name="startsAt" type="datetime-local" required />
                <Field
                  label="Sức chứa"
                  name="capacity"
                  type="number"
                  required
                  min={1}
                  max={100}
                  defaultValue={1}
                />
                <Submit command={command} label="Tạo khung giờ" />
              </form>
            </ResourceState>
          )}
        </Panel>
      </ResourceState>
    </Page>
  )
}
