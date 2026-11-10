import { useCallback } from 'react'
import { api } from '@/shared/api/client'
import { useResource } from '@/shared/hooks/use-resource'
import { useCommand } from '@/shared/hooks/use-command'
import { Panel, Field, Feedback, Status, Submit } from '@/shared/components/ui/Workflow'
import { formatMoney } from '@/shared/lib/format'
import { dateTime } from '@/shared/lib/workflows'
export default function OrderRefundPanel({ refund, payment, refresh }) {
  const command = useCommand()
  const manual = payment?.provider === 'VietQrManual'
  const destination = useResource(
    useCallback(
      (signal) =>
        manual
          ? api.get('/refunds/' + refund.id + '/destination', { signal })
          : Promise.resolve(null),
      [manual, refund.id],
    ),
  )
  async function save(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = {
      version: refund.version,
      bankCode: form.get('bankCode'),
      accountNumber: form.get('accountNumber'),
      accountName: form.get('accountName'),
    }
    const saved = await command.run(
      () => api.put('/refunds/' + refund.id + '/destination', body),
      body,
      'Đã gửi thông tin nhận hoàn tiền.',
    )
    if (saved) {
      destination.retry()
      refresh()
    }
  }
  return (
    <Panel title="Tiến trình hoàn tiền">
      <Feedback command={command} />
      <Status value={refund.status} />
      <p className="text-xl font-semibold">{formatMoney(refund.amount)}</p>
      <p className="text-sm leading-7 text-slate-600">{refund.reason}</p>
      {payment?.isSimulation && (
        <p className="text-sm text-slate-500">Hoàn tiền mô phỏng, không chuyển tiền thật.</p>
      )}
      {refund.status === 'Requested' && (
        <p className="text-sm">Yêu cầu đã tạo, đang chờ tài chính xử lý.</p>
      )}
      {refund.status === 'Processing' && (
        <p className="text-sm">
          Đang xử lý. Thông tin nhận hoàn đã khóa để tránh thay đổi trong lúc chuyển khoản.
        </p>
      )}
      {refund.succeededAt && (
        <p className="text-sm">
          Đã ghi nhận hoàn tất lúc {dateTime(refund.succeededAt)}. Mã đối soát:{' '}
          {refund.providerReference}
        </p>
      )}
      {manual && refund.status === 'Requested' && (
        <form key={refund.version} onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <p className="text-sm leading-7 text-slate-600 sm:col-span-2">
            Cung cấp tài khoản của bạn để nhận tiền hoàn. Kiểm tra đúng số tài khoản và tên chủ tài
            khoản trước khi gửi.
          </p>
          <Field
            label="Mã ngân hàng (VCB, TCB, ACB...)"
            name="bankCode"
            required
            maxLength={12}
            pattern="[A-Za-z0-9]{3,12}"
            defaultValue={destination.data?.bankCode || ''}
          />
          <Field
            label="Số tài khoản, không phải số thẻ"
            name="accountNumber"
            required
            maxLength={19}
            pattern="[A-Za-z0-9]{3,19}"
            defaultValue={destination.data?.accountNumber || ''}
          />
          <Field
            label="Tên chủ tài khoản"
            name="accountName"
            required
            maxLength={100}
            defaultValue={destination.data?.accountName || ''}
          />
          <label className="flex gap-2 text-sm leading-6">
            <input type="checkbox" required />
            Tôi xác nhận thông tin tài khoản nhận hoàn là chính xác.
          </label>
          <Submit command={command} label="Gửi thông tin nhận hoàn" />
        </form>
      )}
      {destination.error && (
        <p role="alert" className="text-sm text-red-700">
          {destination.error.message}
        </p>
      )}
    </Panel>
  )
}
