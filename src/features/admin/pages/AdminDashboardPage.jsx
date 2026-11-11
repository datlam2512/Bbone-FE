import { useCallback, useState } from 'react'
import { ShoppingBag, Users, Wallet, RotateCcw, ArrowUpRight, CalendarDays } from 'lucide-react'
import DashboardActivity from '../components/DashboardActivity'
import DataTable from '@/shared/components/ui/DataTable'
import { itemsOf } from '@/shared/lib/workflows'
import { Link } from 'react-router-dom'
import { api } from '@/shared/api/client'
import { Page, Panel, Field, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { formatMoney } from '@/shared/lib/format'
import { dateTime, utcDayRange } from '@/shared/lib/workflows'

const chartColors = ['fill-brand-600', 'fill-emerald-500', 'fill-rose-500', 'fill-amber-500']
const dayMs = 86_400_000
const vietnamDate = (daysAgo = 0) =>
  new Date(Date.now() + 7 * 3_600_000 - daysAgo * dayMs).toISOString().slice(0, 10)

function StatusChart({ title, rows = [] }) {
  const max = Math.max(0, ...rows.map((row) => row.count))
  return (
    <Panel title={title}>
      {rows.length ? (
        <section className="space-y-5">
          {rows
            .toSorted((a, b) => b.count - a.count)
            .map((row, index) => {
              const width = max > 0 ? (row.count / max) * 100 : 0
              return (
                <section key={row.status} className="space-y-2">
                  <section className="flex items-center justify-between gap-3">
                    <Status value={row.status} />
                    <strong className="text-sm tabular-nums">{row.count}</strong>
                  </section>
                  <svg
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                    className="h-2.5 w-full"
                    role="img"
                    aria-label={`${row.count} — ${row.status}`}
                  >
                    <rect width="100" height="8" rx="4" className="fill-slate-100" />
                    {width > 0 && (
                      <rect
                        width={width}
                        height="8"
                        rx="4"
                        className={chartColors[index % chartColors.length]}
                      />
                    )}
                  </svg>
                </section>
              )
            })}
        </section>
      ) : (
        <p className="text-sm text-slate-500">Chưa có dữ liệu trong khoảng thời gian này.</p>
      )}
    </Panel>
  )
}

export default function AdminDashboardPage() {
  const role = useAuthStore((s) => s.user?.role)
  const [from, setFrom] = useState(() => vietnamDate(6))
  const [to, setTo] = useState(() => vietnamDate())
  const query = utcDayRange(from, to)
  const resource = useResource(
    useCallback(
      async (signal) => {
        if (!query || !['Admin', 'Finance'].includes(role)) return null
        const dashboard = await api.get('/admin/dashboard?' + query, { signal })
        return { query, dashboard }
      },
      [query, role],
    ),
  )
  const work = useResource(
    useCallback(
      async (signal) => {
        if (!['Admin', 'Finance'].includes(role)) return null
        const [pending, cancellations, recent] = await Promise.all([
          api.get('/admin/orders?status=PendingConfirmation&size=1', { signal }),
          api.get('/admin/orders?cancellationPending=true&size=1', { signal }),
          api.get('/admin/orders?size=5', { signal }),
        ])
        return { pending, cancellations, recent }
      },
      [role],
    ),
  )
  const data = resource.data?.query === query ? resource.data?.dashboard : null
  function changeRange(nextFrom, nextTo) {
    setFrom(nextFrom)
    setTo(nextTo)
  }
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
      description="Theo dõi đơn hàng, lịch khám và các việc cần xử lý."
    >
      <section className="flex flex-wrap gap-2" aria-label="Khoảng thời gian">
        {[7, 30, 90].map((days) => {
          const selected = from === vietnamDate(days - 1) && to === vietnamDate()
          return (
            <button
              type="button"
              key={days}
              aria-pressed={selected}
              onClick={() => changeRange(vietnamDate(days - 1), vietnamDate())}
              className={
                'rounded-full border px-4 py-2 text-sm font-semibold ' +
                (selected
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300')
              }
            >
              {days} ngày
            </button>
          )
        })}
      </section>
      <section className="grid max-w-xl gap-4 sm:grid-cols-2">
        <Field
          label="Từ ngày"
          type="date"
          value={from}
          max={to}
          onChange={(e) => changeRange(e.target.value, to)}
        />
        <Field
          label="Đến ngày"
          type="date"
          value={to}
          min={from}
          onChange={(e) => changeRange(from, e.target.value)}
        />
      </section>
      {!query ? (
        <p role="status" className="text-sm text-slate-600">
          Chọn khoảng thời gian hợp lệ, tối đa 366 ngày.
        </p>
      ) : resource.error ? (
        <ResourceState {...resource} empty={false}>
          {null}
        </ResourceState>
      ) : data ? (
        <section className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ['Khách hàng đang hoạt động', data.users, Users],
              ['Đơn hàng', data.orders, ShoppingBag],
              [
                'Lịch khám',
                data.appointments?.reduce((total, row) => total + row.count, 0),
                CalendarDays,
              ],
              ['Đã thu', data.collected != null ? formatMoney(data.collected) : null, Wallet],
              ['Hoàn tiền', data.refunded != null ? formatMoney(data.refunded) : null, RotateCcw],
            ]
              .filter(([, value]) => value != null)
              .map(([label, value, Icon]) => (
                <Panel key={label} className="border-t-2 border-t-brand-300">
                  <section className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-medium text-slate-500">{label}</h2>
                    <Icon size={20} className="text-brand-600" />
                  </section>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
                </Panel>
              ))}
          </section>
          <DashboardActivity from={from} to={to} data={data} />
          <section className="grid gap-6 lg:grid-cols-2">
            <StatusChart title="Lịch khám theo trạng thái" rows={data.appointments} />
            <StatusChart title="Tình trạng giao hàng" rows={data.shipments} />
          </section>
          <ResourceState {...work} empty={!work.data}>
            {work.data && (
              <>
                <section className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['Đơn chờ xác nhận', work.data.pending.total, 'PendingConfirmation'],
                    ['Yêu cầu hủy cần xử lý', work.data.cancellations.total, 'CancellationPending'],
                  ].map(([label, count, status]) => (
                    <Link
                      key={status}
                      to={'/quan-tri/don-hang?status=' + status}
                      className="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 p-5 text-brand-900"
                    >
                      <section>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="mt-2 text-2xl font-bold">{count}</p>
                      </section>
                      <ArrowUpRight size={21} />
                    </Link>
                  ))}
                </section>
                <section className="space-y-4">
                  <header className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">Đơn hàng gần đây</h2>
                    <Link to="/quan-tri/don-hang" className="text-sm font-semibold text-brand-700">
                      Xem tất cả →
                    </Link>
                  </header>
                  <DataTable
                    rows={itemsOf(work.data.recent)}
                    columns={[
                      {
                        label: 'Mã đơn',
                        render: (row) => (
                          <Link
                            className="font-semibold text-brand-700"
                            to={'/quan-tri/don-hang?order=' + row.id}
                          >
                            {row.code}
                          </Link>
                        ),
                      },
                      { label: 'Khách hàng', key: 'recipient' },
                      { label: 'Đặt lúc', render: (row) => dateTime(row.createdAt) },
                      { label: 'Tổng tiền', render: (row) => formatMoney(row.total) },
                      {
                        label: 'Trạng thái',
                        render: (row) => (
                          <Status value={row.cancellationPending ? 'Chờ duyệt hủy' : row.status} />
                        ),
                      },
                    ]}
                  />
                </section>
              </>
            )}
          </ResourceState>
          <p className="text-xs text-slate-500">Cập nhật lúc {dateTime(data.asOf)}</p>
        </section>
      ) : (
        <ResourceState {...resource} empty={!data}>
          {null}
        </ResourceState>
      )}
    </Page>
  )
}
