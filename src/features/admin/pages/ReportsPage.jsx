import { useCallback, useState } from 'react'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { Page, Panel, Field, Feedback } from '@/shared/components/ui/Workflow'
import { Button } from '@astryxdesign/core/Button'
import ResourceState from '@/shared/components/ui/ResourceState'
import { itemsOf, utcDayRange } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'
export default function ReportsPage() {
  const user = useAuthStore((s) => s.user),
    [from, setFrom] = useState(() =>
      new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    ),
    [to, setTo] = useState(new Date().toISOString().slice(0, 10)),
    [clinicId, setClinicId] = useState(''),
    command = useCommand()
  const clinics = useResource(
    useCallback((signal) => api.get('/clinics?size=100', { signal, auth: false }), []),
  )
  const range = utcDayRange(from, to)
  const query = range ? '?' + range + (clinicId ? '&clinicId=' + clinicId : '') : ''
  const resource = useResource(
    useCallback(
      (signal) =>
        !query || (user.role === 'ClinicManager' && !clinicId)
          ? Promise.resolve(null)
          : api.get('/admin/reports/period' + query, { signal }),
      [query, clinicId, user.role],
    ),
  )
  async function download() {
    const text = await command.run(
      () => api.get('/admin/reports/period.csv' + query, { responseType: 'text' }),
      { query },
      'Đã tải báo cáo.',
    )
    if (typeof text === 'string') {
      const url = URL.createObjectURL(
        new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' }),
      )
      const a = document.createElement('a')
      a.href = url
      a.download = 'BBONE-bao-cao-' + from + '.csv'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }
  const data = resource.data
  return (
    <Page
      title="Báo cáo hoạt động"
      description="Thống kê lịch khám và số liệu tài chính theo quyền truy cập."
    >
      <Feedback command={command} />
      <section className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Từ ngày"
          type="date"
          value={from}
          max={to}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Field
          label="Đến ngày"
          type="date"
          value={to}
          min={from}
          onChange={(e) => setTo(e.target.value)}
        />
        <Field
          label="Phòng khám"
          type="select"
          value={clinicId}
          onChange={(e) => setClinicId(e.target.value)}
        >
          <option value="">{user.role === 'ClinicManager' ? 'Chọn cơ sở' : 'Toàn hệ thống'}</option>
          {itemsOf(clinics.data).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Field>
      </section>
      <ResourceState {...resource} empty={!data}>
        {data && (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Đặt lịch', data.booked],
              ['Hoàn tất', data.completed],
              ['Đã hủy', data.cancelled],
              ['Vắng mặt', data.noShow],
              [
                'Chờ khám trung bình',
                data.averageWaitMinutes == null
                  ? 'Chưa có dữ liệu'
                  : data.averageWaitMinutes.toFixed(1) + ' phút',
              ],
              ['Đã thu', data.paid == null ? null : formatMoney(data.paid)],
              ['Đã hoàn', data.refunded == null ? null : formatMoney(data.refunded)],
              ['Thu ròng', data.netCollected == null ? null : formatMoney(data.netCollected)],
            ]
              .filter(([, value]) => value != null)
              .map(([label, value]) => (
                <Panel key={label} title={label}>
                  <p className="text-2xl font-semibold">{value}</p>
                </Panel>
              ))}
          </section>
        )}
      </ResourceState>
      {user.canExport && data && (
        <Button label="Tải báo cáo CSV" isLoading={command.pending} onClick={download} />
      )}
    </Page>
  )
}
