import { useCallback, useState } from 'react'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Page, Panel, Field, Feedback, Submit } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'
export default function DeskBookingPage() {
  const [clinicId, setClinicId] = useState(''),
    [serviceId, setServiceId] = useState(''),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10)),
    command = useCommand()
  const directory = useResource(
    useCallback(async (signal) => {
      const [clinics, patients] = await Promise.all([
        api.get('/clinics?size=100', { signal, auth: false }),
        api.get('/staff/patients?size=100', { signal }),
      ])
      return { clinics, patients }
    }, []),
  )
  const clinic = useResource(
    useCallback(
      (signal) =>
        clinicId ? api.get('/clinics/' + clinicId, { signal, auth: false }) : Promise.resolve(null),
      [clinicId],
    ),
  )
  const slots = useResource(
    useCallback(
      (signal) =>
        serviceId && date
          ? api.get(
              '/services/' +
                serviceId +
                '/slots?size=100&from=' +
                encodeURIComponent(new Date(date + 'T00:00:00+07:00').toISOString()) +
                '&to=' +
                encodeURIComponent(
                  new Date(new Date(date + 'T00:00:00+07:00').getTime() + 86400000).toISOString(),
                ),
              { signal, auth: false },
            )
          : Promise.resolve([]),
      [date, serviceId],
    ),
  )
  async function save(e) {
    e.preventDefault()
    const f = new FormData(e.currentTarget),
      patient = itemsOf(directory.data.patients).find((p) => p.id === f.get('patientId'))
    const body = {
      patientId: patient.id,
      slotId: f.get('slotId'),
      acceptedPrice: clinic.data.services.find((s) => s.id === serviceId).price,
      patientName: patient.name,
      phone: patient.phone,
      note: f.get('note'),
    }
    const ok = await command.run(
      (key) => api.post('/staff/appointments/desk', body, { idempotencyKey: key }),
      body,
      'Đã đặt lịch tại quầy.',
    )
    if (ok) slots.retry()
  }
  return (
    <Page
      title="Đặt lịch tại quầy"
      description="Đặt cho bệnh nhân đã có trong danh bạ thuộc phạm vi cơ sở."
      back="/nhan-vien/lich-kham"
    >
      <Feedback command={command} />
      <ResourceState {...directory} empty={!directory.data}>
        {directory.data && (
          <Panel>
            <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
              <Field label="Bệnh nhân" name="patientId" type="select" required>
                <option value="">Chọn bệnh nhân</option>
                {itemsOf(directory.data.patients).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.phone}
                  </option>
                ))}
              </Field>
              <Field
                label="Phòng khám"
                type="select"
                value={clinicId}
                required
                onChange={(e) => {
                  setClinicId(e.target.value)
                  setServiceId('')
                }}
              >
                <option value="">Chọn cơ sở</option>
                {itemsOf(directory.data.clinics).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Field>
              <Field
                label="Dịch vụ"
                type="select"
                value={serviceId}
                required
                onChange={(e) => setServiceId(e.target.value)}
              >
                <option value="">Chọn dịch vụ</option>
                {clinic.data?.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {formatMoney(s.price)}
                  </option>
                ))}
              </Field>
              <Field
                label="Ngày khám"
                type="date"
                value={date}
                required
                onChange={(e) => setDate(e.target.value)}
              />
              <ResourceState {...slots} empty={false}>
                <Field label="Khung giờ" name="slotId" type="select" required>
                  <option value="">Chọn khung giờ còn trống</option>
                  {itemsOf(slots.data).map((s) => (
                    <option key={s.id} value={s.id}>
                      {dateTime(s.startsAt)}
                    </option>
                  ))}
                </Field>
              </ResourceState>
              <Field label="Ghi chú tiếp nhận" name="note" type="textarea" maxLength={1000} />
              <Submit command={command} label="Xác nhận đặt lịch tại quầy" />
            </form>
          </Panel>
        )}
      </ResourceState>
    </Page>
  )
}
