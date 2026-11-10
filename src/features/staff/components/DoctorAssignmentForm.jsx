import { useCallback } from 'react'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Field, Feedback, Submit } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
export default function DoctorAssignmentForm({ appointment, onSaved }) {
  const doctors = useResource(
    useCallback(
      (signal) => api.get('/staff/clinics/' + appointment.clinicId + '/doctors', { signal }),
      [appointment.clinicId],
    ),
  )
  const command = useCommand()
  async function submit(event) {
    event.preventDefault()
    const f = new FormData(event.currentTarget),
      body = {
        doctorId: f.get('doctorId'),
        version: appointment.version,
        reason: f.get('reason').trim(),
      }
    const result = await command.run(
      () => api.post('/staff/scheduling/appointments/' + appointment.id + '/doctor', body),
      { id: appointment.id, ...body },
      'Đã phân công bác sĩ.',
    )
    if (result) onSaved(result)
  }
  return (
    <details className="border-t border-slate-200 pt-4">
      <summary className="cursor-pointer text-sm font-semibold text-brand-700">
        Phân công lại bác sĩ
      </summary>
      <section className="mt-4 space-y-4">
        <Feedback command={command} />
        <ResourceState {...doctors} empty={false}>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Bác sĩ mới" name="doctorId" type="select" defaultValue="" required>
              <option value="">Chọn bác sĩ được phân công tại cơ sở</option>
              {doctors.data
                ?.filter((doctor) => doctor.id !== appointment.doctorId)
                .map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
            </Field>
            <Field
              name="reason"
              label="Lý do phân công lại"
              type="textarea"
              required
              minLength={3}
              maxLength={1000}
            />
            <p className="text-xs leading-6 text-slate-500">
              Hệ thống kiểm tra lịch trùng, giờ khám dùng chung và hồ sơ đã ghi nhận trước khi thay
              đổi.
            </p>
            <Submit command={command} label="Xác nhận phân công" />
          </form>
        </ResourceState>
      </section>
    </details>
  )
}
