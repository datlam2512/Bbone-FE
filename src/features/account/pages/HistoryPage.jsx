import { bodyRegions, outcomeLabels } from '@/features/screening/lib/screening-content'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { Page, Panel, Field, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { itemsOf, dateTime, statusLabels } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'

export default function HistoryPage({ kind = 'appointments' }) {
  const [page, setPage] = useState(1),
    [status, setStatus] = useState(''),
    [screeningSource, setScreeningSource] = useState('symptoms')
  const resource = useResource(
    useCallback(
      (signal) =>
        api.get(
          '/' +
            (kind === 'screening/results' && screeningSource === 'symptoms'
              ? 'screening/check/results'
              : kind) +
            '?page=' +
            page +
            '&size=10' +
            (status ? '&status=' + status : ''),
          {
            signal,
          },
        ),
      [kind, page, status, screeningSource],
    ),
  )
  const appointments = kind === 'appointments',
    screening = kind === 'screening/results'
  const title = appointments
    ? 'Lịch hẹn của tôi'
    : screening
      ? 'Lịch sử kiểm tra sức khỏe'
      : 'Đơn hàng của tôi'
  return (
    <Page
      title={title}
      description="Theo dõi các yêu cầu và thông tin cập nhật của bạn."
      back="/tai-khoan"
    >
      {screening && (
        <Field
          label="Loại bản ghi"
          type="select"
          value={screeningSource}
          onChange={(e) => {
            setScreeningSource(e.target.value)
            setPage(1)
          }}
        >
          <option value="symptoms">Ghi nhận triệu chứng</option>
          <option value="clinical">Kết quả bộ câu hỏi chuyên môn trước đây</option>
        </Field>
      )}
      {!screening && (
        <Field
          label="Lọc trạng thái"
          type="select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            setPage(1)
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {(appointments
            ? ['Confirmed', 'CheckedIn', 'InProgress', 'Completed', 'Cancelled', 'NoShow']
            : [
                'PendingPayment',
                'PendingConfirmation',
                'Confirmed',
                'Processing',
                'Shipped',
                'Delivered',
                'Completed',
                'Cancelled',
              ]
          ).map((s) => (
            <option key={s} value={s}>
              {statusLabels[s] || s}
            </option>
          ))}
        </Field>
      )}
      <ResourceState {...resource} empty={!itemsOf(resource.data).length}>
        <VStack gap={4}>
          {itemsOf(resource.data).map((row) => (
            <Panel key={row.id}>
              <HStack gap={4} hAlign="between" wrap="wrap">
                <VStack gap={2}>
                  <Status
                    value={
                      row.cancellationPending
                        ? 'Chờ duyệt hủy'
                        : row.status || outcomeLabels[row.outcome] || row.level
                    }
                  />
                  <h2 className="font-semibold">
                    {row.code ||
                      bodyRegions.find((region) => region.id === row.region)?.label ||
                      row.region}
                  </h2>
                  <p className="text-sm">{row.serviceName || row.advice || row.adviceSnapshot}</p>
                  <p className="text-sm text-slate-500">
                    {dateTime(row.startsAt || row.createdAt)}
                  </p>
                  {row.total != null && <strong>{formatMoney(row.total)}</strong>}
                </VStack>
                {!screening && (
                  <Link
                    to={'/tai-khoan/' + (appointments ? 'lich-hen/' : 'don-hang/') + row.id}
                    className="text-sm font-semibold text-brand-600"
                  >
                    Xem chi tiết →
                  </Link>
                )}
              </HStack>
            </Panel>
          ))}
        </VStack>
      </ResourceState>
      <HStack gap={3} hAlign="end">
        <Button label="Trang trước" isDisabled={page === 1} onClick={() => setPage(page - 1)} />
        <p className="self-center text-sm">Trang {page}</p>
        <Button
          label="Trang sau"
          isDisabled={page * 10 >= (resource.data?.total || 0)}
          onClick={() => setPage(page + 1)}
        />
      </HStack>
    </Page>
  )
}
