import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/shared/api/client'
import { Page, Panel, Field, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { formatMoney } from '@/shared/lib/format'
import { dateTime, utcDayRange } from '@/shared/lib/workflows'

export default function AdminDashboardPage() {
  const role = useAuthStore((s) => s.user?.role)
  const [from, setFrom] = useState(() =>
      new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    ),
    [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const query = utcDayRange(from, to)
  const resource = useResource(
    useCallback(
      (signal) =>
        query && ['Admin', 'Finance'].includes(role)
          ? api.get('/admin/dashboard?' + query, { signal })
          : Promise.resolve(null),
      [query, role],
    ),
  )
  const data = resource.data
  if (!['Admin', 'Finance'].includes(role))
    return (
      <Page title="Không gian quản trị" description="Chọn khu vực phụ trách để bắt đầu công việc.">
        <Panel title={role === 'Commerce' ? 'Vận hành kinh doanh' : 'Biên tập và duyệt nội dung'}>
          <Link
            to={role === 'Commerce' ? '/quan-tri/don-hang' : '/quan-tri/noi-dung'}
            className="font-semibold text-brand-600"
          >
            Mở danh sách công việc →
          </Link>
        </Panel>
      </Page>
    )
  return (
    <Page
      title="Tổng quan quản trị"
      description="Số liệu thực tế từ hệ thống trong khoảng thời gian đã chọn."
    >
      <section className="grid max-w-xl gap-4 sm:grid-cols-2">
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
      </section>
      <ResourceState {...resource} empty={!data}>
        {data && (
          <>
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Khách hàng', data.users],
                ['Đơn hàng', data.orders],
                ['Đã thu', data.collected != null ? formatMoney(data.collected) : null],
                ['Hoàn tiền', data.refunded != null ? formatMoney(data.refunded) : null],
              ]
                .filter(([, value]) => value != null)
                .map(([label, value]) => (
                  <Panel key={label} title={label}>
                    <p className="text-3xl font-semibold tracking-tight">{value}</p>
                  </Panel>
                ))}
            </section>
            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="Lịch khám theo trạng thái">
                {data.appointments.map((row) => (
                  <section
                    key={row.status}
                    className="flex items-center justify-between border-b border-slate-100 py-3"
                  >
                    <Status value={row.status} />
                    <strong>{row.count}</strong>
                  </section>
                ))}
              </Panel>
              <Panel title="Tình trạng giao hàng">
                {data.shipments?.map((row) => (
                  <section
                    key={row.status}
                    className="flex items-center justify-between border-b border-slate-100 py-3"
                  >
                    <Status value={row.status} />
                    <strong>{row.count}</strong>
                  </section>
                ))}
              </Panel>
            </section>
            <p className="text-xs text-slate-500">Cập nhật: {dateTime(data.asOf)}</p>
          </>
        )}
      </ResourceState>
    </Page>
  )
}
