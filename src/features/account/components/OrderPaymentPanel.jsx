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

export default function OrderPaymentPanel({ payment, refresh, beneficiary, canPay }) {
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
      {!payment.isSimulation && payment.provider === 'VietQrManual' && (
        <>
          {beneficiary && (
            <section className="space-y-2 rounded-xl bg-brand-50 p-4 text-sm">
              <p>Ngân hàng: {beneficiary.bankCode}</p>
              <p className="font-semibold">
                {beneficiary.accountNumber} · {beneficiary.accountName}
              </p>
              <p className="break-all">Nội dung chuyển khoản: {payment.providerReference}</p>
            </section>
          )}
          {payment.status === 'Pending' && canPay && (
            <>
              <img
                src={payment.checkoutUrl}
                alt="Mã VietQR chuyển khoản thật"
                width="280"
                height="280"
                referrerPolicy="no-referrer"
                className="max-w-full self-center"
              />
              <p className="text-sm leading-7">
                Kiểm tra đúng tên người nhận, số tiền và nội dung trong ứng dụng ngân hàng. Chuyển
                khoản thật sẽ được tài chính đối soát trước khi cập nhật thanh toán.
              </p>
              <Button label="Kiểm tra cập nhật thanh toán" onClick={refresh} />
            </>
          )}
        </>
      )}
      {payment.receiptEmailStatus && (
        <p className="text-xs text-slate-600">
          Email xác nhận:{' '}
          {payment.receiptEmailStatus === 'Completed'
            ? 'Đã gửi qua nhà cung cấp'
            : ['NeedsReview', 'Failed', 'DeadLetter'].includes(payment.receiptEmailStatus)
              ? 'Cần kiểm tra việc gửi thư'
              : 'Đang chờ gửi'}
        </p>
      )}
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
