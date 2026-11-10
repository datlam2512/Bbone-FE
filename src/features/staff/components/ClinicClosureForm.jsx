import { useState } from 'react'
import { api } from '@/shared/api/client'
import { useCommand } from '@/shared/hooks/use-command'
import { Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import { Button } from '@astryxdesign/core/Button'
import DataTable from '@/shared/components/ui/DataTable'
import { dateTime } from '@/shared/lib/workflows'
export default function ClinicClosureForm({ clinicId, onSaved }) {
  const [preview, setPreview] = useState(null),
    command = useCommand()
  function range(form) {
    const f = new FormData(form)
    return {
      startsAt: new Date(f.get('from') + ':00+07:00').toISOString(),
      endsAt: new Date(f.get('to') + ':00+07:00').toISOString(),
    }
  }
  async function inspect(event) {
    const form = event.currentTarget.form
    if (!form.reportValidity()) return
    const value = range(form)
    const result = await command.run(
      () =>
        api.get(
          '/staff/scheduling/closures/preview?' +
            new URLSearchParams({ clinicId, from: value.startsAt, to: value.endsAt }),
        ),
      value,
      'Đã kiểm tra các lịch bị ảnh hưởng.',
    )
    if (result) setPreview({ range: value, rows: result })
  }
  async function submit(event) {
    event.preventDefault()
    const f = new FormData(event.currentTarget),
      value = range(event.currentTarget)
    if (!preview || JSON.stringify(value) !== JSON.stringify(preview.range)) return
    const body = {
      clinicId,
      ...value,
      reason: f.get('reason').trim(),
      cancelAffected: f.get('cancelAffected') === 'on',
    }
    const saved = await command.run(
      (key) => api.post('/staff/scheduling/closures', body, { idempotencyKey: key }),
      body,
      'Đã đóng ca và thông báo các lịch bị ảnh hưởng.',
    )
    if (saved) {
      setPreview(null)
      onSaved()
    }
  }
  return (
    <Panel title="Đóng ca / cơ sở tạm nghỉ">
      <Feedback command={command} />
      <form onSubmit={submit} className="space-y-4" onChange={() => setPreview(null)}>
        <section className="grid gap-4 sm:grid-cols-2">
          <Field name="from" label="Đóng từ (giờ Việt Nam)" type="datetime-local" required />
          <Field name="to" label="Đến (giờ Việt Nam)" type="datetime-local" required />
        </section>
        <Field
          name="reason"
          label="Lý do và hướng dẫn cho khách"
          type="textarea"
          required
          minLength={3}
          maxLength={1000}
        />
        <Button label="Kiểm tra lịch bị ảnh hưởng" onClick={inspect} isLoading={command.pending} />
        {preview && (
          <section className="space-y-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-semibold">
              {preview.rows.length} lịch đang hoạt động trong khoảng đóng ca.
            </p>
            {preview.rows.length > 0 && (
              <DataTable
                rows={preview.rows}
                columns={[
                  { label: 'Mã', key: 'code' },
                  { label: 'Khách', key: 'patientName' },
                  { label: 'Giờ khám', render: (row) => dateTime(row.startsAt) },
                  { label: 'Trạng thái', render: (row) => <Status value={row.status} /> },
                ]}
              />
            )}
            <label className="flex gap-2 text-sm leading-7">
              <input
                type="checkbox"
                name="cancelAffected"
                required={preview.rows.length > 0}
                onChange={(event) => event.stopPropagation()}
              />
              Tôi xác nhận đóng ca và hủy các lịch chờ khám được liệt kê. Khách sẽ nhận thông báo.
            </label>
            <p className="text-xs leading-6 text-slate-600">
              Không thể đóng khi có lịch đang tiếp đón hoặc đang khám. Backend kiểm tra lại tại thời
              điểm lưu.
            </p>
            <Submit command={command} label="Xác nhận đóng ca" />
          </section>
        )}
      </form>
    </Panel>
  )
}
