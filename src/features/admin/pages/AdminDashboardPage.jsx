import { useCallback, useState } from 'react'
import { ShoppingBag, Users, Wallet, RotateCcw, ArrowUpRight } from 'lucide-react'
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

function StatusChart({ title, rows = [] }) {
  const max = Math.max(0, ...rows.map((row) => row.count))
  return (
    <Panel title={title}>
      {rows.length ? (
        <section className="space-y-5">
          {rows.map((row, index) => {
            const width = max > 0 && row.count > 0 ? Math.max(4, (row.count / max) * 100) : 0
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
  const [from, setFrom] = useState(() =>
      new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    ),
    [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const [previousData, setPreviousData] = useState(null)
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
  const data =
    resource.data ?? (resource.loading && previousData?.query === query ? previousData.data : null)
  function changeRange(nextFrom, nextTo) {
    const nextQuery = utcDayRange(nextFrom, nextTo)
    setPreviousData(nextQuery && data ? { query: nextQuery, data } : null)
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
      description="Số liệu thực tế từ hệ thống trong khoảng thời gian đã chọn."
    >
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
      {resource.error ? (
        <ResourceState {...resource} empty={false}>
          {null}
        </ResourceState>
      ) : data ? (
        <section className="relative space-y-6" aria-busy={resource.loading}>
          {resource.loading && (
            <p
              role="status"
              className="absolute right-0 -top-5 z-10 text-xs font-medium text-brand-700"
            >
              Đang cập nhật số liệu...
            </p>
          )}
          <section className={resource.loading ? 'pointer-events-none opacity-60' : ''}>
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Khách hàng', data.users, Users],
                ['Đơn hàng', data.orders, ShoppingBag],
                ['Đã thu', data.collected != null ? formatMoney(data.collected) : null, Wallet],
                ['Hoàn tiền', data.refunded != null ? formatMoney(data.refunded) : null, RotateCcw],
              ]
                .filter(([, value]) => value != null)
                .map(([label, value, Icon]) => (
                  <Panel key={label}>
                    <section className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-medium text-slate-500">{label}</h2>
                      <Icon size={20} className="text-brand-600" />
                    </section>
                    <p className="text-3xl font-semibold tracking-tight">{value}</p>
                  </Panel>
                ))}
            </section>
            <ResourceState {...work} empty={!work.data}>
              {work.data && (
                <>
                  <section className="grid gap-4 sm:grid-cols-2">
                    {[
                      ['Đơn chờ xác nhận', work.data.pending.total, 'PendingConfirmation'],
                      [
                        'Yêu cầu hủy cần xử lý',
                        work.data.cancellations.total,
                        'CancellationPending',
                      ],
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
                      <Link
                        to="/quan-tri/don-hang"
                        className="text-sm font-semibold text-brand-700"
                      >
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
                            <Status
                              value={row.cancellationPending ? 'Chờ duyệt hủy' : row.status}
                            />
                          ),
                        },
                      ]}
                    />
                  </section>
                </>
              )}
            </ResourceState>
            <section className="grid gap-6 lg:grid-cols-2">
              <StatusChart title="Lịch khám theo trạng thái" rows={data.appointments} />
              <StatusChart title="Tình trạng giao hàng" rows={data.shipments} />
            </section>
            <p className="text-xs text-slate-500">Cập nhật: {dateTime(data.asOf)}</p>
          </section>
        </section>
      ) : (
        <ResourceState {...resource} empty={!data}>
          {null}
        </ResourceState>
      )}
    </Page>
  )
}
