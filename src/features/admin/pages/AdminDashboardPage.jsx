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
