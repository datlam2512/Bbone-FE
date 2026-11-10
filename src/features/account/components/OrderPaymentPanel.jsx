import { useCallback } from 'react'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { Panel, Feedback, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'

export default function OrderPaymentPanel({ payment, refresh }) {
  const command = useCommand()
  const qr = useResource(
    useCallback(
      (signal) =>
        payment.isSimulation && payment.status === 'Pending'
          ? api.get('/simulation/payments/' + payment.id + '/qr.svg', {
              signal,
              responseType: 'text',
            })
          : Promise.resolve(null),
      [payment.id, payment.isSimulation, payment.status],
    ),
  )
  async function settle(success) {
    const body = { success }
    const ok = await command.run(
      () => api.post('/simulation/payments/' + payment.id + '/settle', body),
      { id: payment.id, ...body },
      success ? 'Đã ghi nhận thanh toán mô phỏng.' : 'Đã ghi nhận giao dịch mô phỏng thất bại.',
    )
    if (ok) refresh()
  }
  return (
    <Panel title="Giao dịch VietQR">
      <p className="text-xs text-slate-500">
        Tạo lúc {dateTime(payment.createdAt)} · {payment.id.slice(0, 8)}
      </p>
      <Feedback command={command} />
      <Status value={payment.status} />
      <p className="font-semibold">{formatMoney(payment.amount)}</p>
      {payment.isSimulation && (
        <>
          <p className="text-sm text-slate-500">
            Đây là giao dịch mô phỏng, không chuyển tiền thật.
          </p>
          {payment.status === 'Pending' && (
            <>
              <ResourceState {...qr} empty={false}>
                {typeof qr.data === 'string' && (
                  <img
                    src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qr.data)}
                    alt="Mã QR thanh toán mô phỏng"
                    width="240"
                    height="240"
                    className="max-w-full self-center"
                  />
                )}
              </ResourceState>
              <HStack gap={3} wrap="wrap">
                <Button
                  label="Mô phỏng thanh toán thành công"
                  variant="primary"
                  isLoading={command.pending}
                  onClick={() => settle(true)}
                />
                <Button
                  label="Mô phỏng thất bại"
                  isDisabled={command.pending}
                  onClick={() => settle(false)}
                />
              </HStack>
            </>
          )}
        </>
      )}
    </Panel>
  )
}
