import { useCallback, useState } from 'react'
import { QrCode, RefreshCw, ShieldCheck, CheckCircle2, Mail, AlertCircle } from 'lucide-react'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Button } from '@astryxdesign/core/Button'
import { api } from '@/shared/api/client'
import { Feedback, Status } from '@/shared/components/ui/Workflow'
import ResourceState from '@/shared/components/ui/ResourceState'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { dateTime } from '@/shared/lib/workflows'
import { formatMoney } from '@/shared/lib/format'
import PaymentCopyField from './PaymentCopyField'

export default function OrderPaymentPanel({ payment, refresh, beneficiary, canPay }) {
  const command = useCommand()
  const [imageFailed, setImageFailed] = useState(false)
  const isPaid = ['Paid', 'PartiallyRefunded', 'Refunded'].includes(payment.status)
  const qr = useResource(
    useCallback(
      (signal) =>
        payment.isSimulation && payment.status === 'Pending' && canPay
          ? api.get('/simulation/payments/' + payment.id + '/qr.svg', {
              signal,
              responseType: 'text',
            })
          : Promise.resolve(null),
      [payment.id, payment.isSimulation, payment.status, canPay],
    ),
  )
  async function settle(success) {
    const saved = await command.run(
      () => api.post('/simulation/payments/' + payment.id + '/settle', { success }),
      { id: payment.id, success },
      'Đã cập nhật giao dịch mô phỏng.',
    )
    if (saved) refresh()
  }
  return (
    <VStack
      as="section"
      gap={0}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm"
    >
      <HStack
        gap={3}
        vAlign="center"
        hAlign="between"
        wrap="wrap"
        className="border-b border-slate-100 px-5 py-5 sm:px-6"
      >
        <HStack gap={3} vAlign="center">
          <QrCode size={23} className="text-brand-600" />
          <VStack gap={1}>
            <h2 className="text-lg font-bold">
              {isPaid ? 'Thông tin thanh toán' : 'Thanh toán bằng VietQR'}
            </h2>
            <p className="text-xs text-slate-500">
              {isPaid ? 'Giao dịch đã được ghi nhận' : 'Quét mã bằng ứng dụng ngân hàng của bạn'}
            </p>
          </VStack>
        </HStack>
        <Status value={payment.status} />
      </HStack>
      <VStack gap={5} className="p-5 sm:p-6">
        <Feedback command={command} />
        {isPaid ? (
          <section className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-900">
            <CheckCircle2 size={23} className="shrink-0" />
            <VStack gap={1}>
              <h3 className="font-bold">Đã ghi nhận {formatMoney(payment.amount)}</h3>
              <p className="text-sm leading-6">
                Theo dõi xác nhận của người bán và tiến trình giao hàng trong đơn này.
              </p>
            </VStack>
          </section>
        ) : payment.status === 'Pending' && canPay ? (
          <>
            <section className="grid items-start gap-6 sm:grid-cols-2">
              <VStack
                gap={3}
                className="items-center rounded-2xl border border-brand-100 bg-brand-50 p-4"
              >
                <p className="text-xs font-medium text-slate-600">Số tiền cần chuyển</p>
                <strong className="text-2xl font-bold tracking-tight text-ink">
                  {formatMoney(payment.amount)}
                </strong>
                <section className="flex min-h-64 w-full items-center justify-center rounded-xl border border-slate-100 bg-white p-3">
                  {payment.isSimulation ? (
                    <ResourceState {...qr} empty={false}>
                      {typeof qr.data === 'string' && (
                        <img
                          src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qr.data)}
                          alt="QR mô phỏng, không chuyển tiền thật"
                          width="240"
                          height="290"
                          className="max-w-full"
                        />
                      )}
                    </ResourceState>
                  ) : imageFailed ? (
                    <VStack gap={3} className="items-center py-8 text-center">
                      <AlertCircle size={28} className="text-orange-600" />
                      <p className="text-sm leading-6 text-slate-600">
                        Chưa tải được QR. Bạn có thể chuyển khoản theo thông tin bên cạnh.
                      </p>
                    </VStack>
                  ) : (
                    <img
                      src={payment.checkoutUrl}
                      alt="QR chuyển khoản cho đơn hàng"
                      width="240"
                      height="240"
                      referrerPolicy="no-referrer"
                      onError={() => setImageFailed(true)}
                      className="aspect-square w-60 max-w-full"
                    />
                  )}
                </section>
                <p className="text-center text-xs leading-5 text-slate-500">
                  {payment.isSimulation
                    ? 'Mã thử nghiệm · không thanh toán thật'
                    : 'Kiểm tra tên người nhận trong ứng dụng ngân hàng trước khi chuyển.'}
                </p>
              </VStack>
              <VStack gap={1} className="min-w-0">
                <h3 className="mb-1 text-sm font-bold">Thông tin chuyển khoản</h3>
                {beneficiary && !payment.isSimulation && (
                  <>
                    <PaymentCopyField
                      label="Ngân hàng"
                      value={
                        beneficiary.bankCode === 'VCB' ? 'Vietcombank (VCB)' : beneficiary.bankCode
                      }
                    />
                    <PaymentCopyField label="Số tài khoản" value={beneficiary.accountNumber} />
                    <PaymentCopyField label="Người thụ hưởng" value={beneficiary.accountName} />
                  </>
                )}
                <PaymentCopyField label="Nội dung chuyển khoản" value={payment.providerReference} />
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Giữ nguyên nội dung và chuyển đúng số tiền để đối soát đơn hàng.
                </p>
              </VStack>
            </section>
            <section className="flex gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <ShieldCheck className="shrink-0 text-brand-700" size={21} />
              <p className="text-sm leading-7 text-slate-700">
                {payment.isSimulation
                  ? 'Giao dịch này dùng mô phỏng, không thu tiền thật.'
                  : 'Sau khi chuyển khoản, bộ phận tài chính sẽ đối chiếu tiền vào. Hệ thống gửi email xác nhận sau khi ghi nhận thanh toán.'}
              </p>
            </section>
            {payment.isSimulation ? (
              <HStack gap={3} wrap="wrap">
                <Button
                  label="Mô phỏng thành công"
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
            ) : (
              <Button
                label="Tôi đã chuyển khoản · Kiểm tra trạng thái"
                icon={<RefreshCw size={16} />}
                onClick={refresh}
              />
            )}
          </>
        ) : (
          <p className="text-sm leading-7 text-slate-600">
            {payment.status === 'Pending'
              ? 'Đơn hàng hiện không nhận thanh toán mới.'
              : 'Giao dịch không còn chờ thanh toán. Xem trạng thái đơn trước khi tạo mã mới.'}
          </p>
        )}
        {payment.receiptEmailStatus && (
          <section className="flex items-start gap-2 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
            <Mail size={16} className="mt-1 shrink-0" />
            <p>
              Email xác nhận:{' '}
              {payment.receiptEmailStatus === 'Completed'
                ? 'Đã gửi qua nhà cung cấp email.'
                : ['NeedsReview', 'Failed', 'DeadLetter'].includes(payment.receiptEmailStatus)
                  ? 'Cần bộ phận hỗ trợ kiểm tra việc gửi thư.'
                  : 'Đang chờ gửi.'}
            </p>
          </section>
        )}
        <p className="text-xs text-slate-400">
          Tạo lúc {dateTime(payment.createdAt)} · Mã {payment.id.slice(0, 8).toUpperCase()}
        </p>
      </VStack>
    </VStack>
  )
}
