import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { Page, Panel, Field, Feedback, Submit, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'

export default function AppointmentDetailPage() {
  const { id } = useParams(),
    [cancel, setCancel] = useState(false)
  const resource = useResource(
      useCallback((signal) => api.get('/appointments/' + id, { signal }), [id]),
    ),
    command = useCommand(),
    a = resource.data
  async function submit(e) {
    e.preventDefault()
    const body = { version: a.version, reason: new FormData(e.currentTarget).get('reason') }
    const ok = await command.run(
      (key) => api.post('/appointments/' + id + '/cancel', body, { idempotencyKey: key }),
      body,
      'Đã hủy lịch hẹn.',
    )
    if (ok) {
      setCancel(false)
      resource.retry()
    }
  }
  const canChange = a?.status === 'Confirmed' && new Date(a.cancellationDeadline) > new Date()
  return (
    <Page title={a?.code || 'Chi tiết lịch hẹn'} back="/tai-khoan/lich-hen">
      <Feedback command={command} />
      <ResourceState {...resource} empty={!a}>
        {a && (
          <Panel title={a.serviceName}>
            <Status value={a.status} />
            <dl className="grid gap-5 text-sm sm:grid-cols-2">
              {[
                ['Người khám', a.patientName],
                ['Thời gian', dateTime(a.startsAt)],
                ['Địa chỉ', a.clinicAddress],
                ['Điện thoại', a.phone],
                ['Chi phí', formatMoney(a.price)],
                ['Hạn thay đổi lịch', dateTime(a.cancellationDeadline)],
              ].map(([label, value]) => (
                <section key={label}>
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="mt-2 font-medium">{value}</dd>
                </section>
              ))}
            </dl>
            {a.note && <p className="text-sm leading-7">Ghi chú: {a.note}</p>}
            {canChange && (
              <>
                <Link
                  to={'/dat-lich?clinicId=' + a.clinicId + '&rescheduleId=' + id}
                  className="text-sm font-semibold text-brand-600"
                >
                  Đổi lịch khám →
                </Link>
                <Button
                  label="Hủy lịch hẹn"
                  variant="secondary"
                  onClick={() => setCancel(!cancel)}
                />
              </>
            )}
            {cancel && (
              <form onSubmit={submit} className="space-y-4 border-t border-slate-200 pt-4">
                <Field label="Lý do hủy" name="reason" type="textarea" required maxLength={1000} />
                <Submit command={command} label="Xác nhận hủy lịch" />
              </form>
            )}
          </Panel>
        )}
      </ResourceState>
    </Page>
  )
}
