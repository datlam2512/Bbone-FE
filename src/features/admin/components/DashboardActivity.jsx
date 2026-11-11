import { Panel } from '@/shared/components/ui/Workflow'

const dayMs = 86_400_000
const series = [
  { key: 'orders', label: 'Đơn hàng', color: 'fill-brand-600' },
  { key: 'appointments', label: 'Lịch khám', color: 'fill-teal-500' },
]

function activityPeriods(from, to, data) {
  const start = Date.parse(from)
  const days = Math.round((Date.parse(to) - start) / dayMs) + 1
  const step = days <= 14 ? 1 : days <= 98 ? 7 : 28
  const counts = (rows) =>
    new Map((rows ?? []).map(({ date, count }) => [date.slice(0, 10), count]))
  const orders = counts(data.orderDays)
  const appointments = counts(data.appointmentDays)
  const dateAt = (index) => new Date(start + index * dayMs).toISOString().slice(0, 10)
  return Array.from({ length: Math.ceil(days / step) }, (_, index) => {
    const first = index * step
    const last = Math.min(first + step, days) - 1
    const period = { from: dateAt(first), to: dateAt(last), orders: 0, appointments: 0 }
    for (let day = first; day <= last; day++) {
      period.orders += orders.get(dateAt(day)) ?? 0
      period.appointments += appointments.get(dateAt(day)) ?? 0
    }
    return period
  })
}

const shortDate = (date) => date.slice(5).split('-').reverse().join('/')

export default function DashboardActivity({ from, to, data }) {
  const periods = activityPeriods(from, to, data)
  const maximum = Math.max(0, ...periods.flatMap((period) => [period.orders, period.appointments]))
  const axisMax = Math.ceil(maximum / 4) * 4
  const chartWidth = 640
  const chartHeight = 132
  const groupWidth = chartWidth / periods.length
  const barWidth = Math.min(22, groupWidth / 3)

  return (
    <Panel title="Đơn hàng và lịch khám">
      <p className="text-sm text-slate-600">
        Số lượt tạo mới theo giờ Việt Nam.{' '}
        {periods.some((period) => period.from !== period.to) &&
          'Mỗi cột gộp nhiều ngày. Mở bảng bên dưới để xem khoảng ngày và số lượt.'}
      </p>
      {maximum === 0 ? (
        <p className="rounded-xl bg-slate-50 p-6 text-sm text-slate-600">
          Khoảng này chưa có đơn hàng hoặc lịch khám mới.
        </p>
      ) : (
        <>
          <ul className="flex flex-wrap gap-5 text-sm text-slate-700">
            {series.map(({ key, label, color }) => (
              <li key={key} className="flex items-center gap-2">
                <svg aria-hidden="true" width="12" height="12">
                  <rect width="12" height="12" rx="3" className={color} />
                </svg>
                {label}
              </li>
            ))}
          </ul>
          <svg
            aria-hidden="true"
            viewBox={`-28 -9 ${chartWidth + 34} ${chartHeight + 36}`}
            className="w-full"
          >
            {[0, 1, 2, 3, 4].map((tick) => {
              const y = chartHeight - (tick * chartHeight) / 4
              return (
                <g key={tick}>
                  <line x1="0" x2={chartWidth} y1={y} y2={y} className="stroke-slate-200" />
                  <text x="-7" y={y + 4} textAnchor="end" className="fill-slate-600 text-xs">
                    {(tick * axisMax) / 4}
                  </text>
                </g>
              )
            })}
            {periods.map((period, index) => {
              const center = (index + 0.5) * groupWidth
              return (
                <g key={period.from}>
                  {series.map(({ key, label, color }, column) => {
                    const height = (period[key] / axisMax) * chartHeight
                    return (
                      <rect
                        key={key}
                        x={center + (column - 1) * (barWidth + 2)}
                        y={chartHeight - height}
                        width={barWidth}
                        height={height}
                        rx="2"
                        className={color}
                      >
                        <title>
                          {shortDate(period.from)} · {label} · {period[key]}
                        </title>
                      </rect>
                    )
                  })}
                  {(periods.length <= 7 || index % 2 === 0) && (
                    <text
                      x={center}
                      y={chartHeight + 18}
                      textAnchor="middle"
                      className="fill-slate-600 text-xs"
                    >
                      {shortDate(period.from)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
          <details className="rounded-xl border border-slate-200 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-brand-700">
              Xem số liệu từng mốc
            </summary>
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr>
                  <th scope="col">Thời gian</th>
                  <th scope="col">Đơn hàng</th>
                  <th scope="col">Lịch khám</th>
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.from} className="border-t border-slate-100">
                    <th scope="row" className="py-2 font-normal">
                      {shortDate(period.from)}
                      {period.from !== period.to && ` – ${shortDate(period.to)}`}
                    </th>
                    <td>{period.orders}</td>
                    <td>{period.appointments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </Panel>
  )
}
