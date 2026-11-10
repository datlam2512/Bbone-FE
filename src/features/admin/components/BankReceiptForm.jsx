import { api } from '@/shared/api/client'
import { useCommand } from '@/shared/hooks/use-command'
import { Field, Feedback, Submit, Panel } from '@/shared/components/ui/Workflow'
import { formatMoney } from '@/shared/lib/format'
export default function BankReceiptForm({ payment, refresh }) {
  const command = useCommand()
  async function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = {
      version: payment.version,
      amount: Number(form.get('amount')),
      bankTransactionId: form.get('evidence'),
      receivedAt: new Date(form.get('receivedAt')).toISOString(),
    }
    const saved = await command.run(
      (key) =>
        api.post('/admin/payments/' + payment.id + '/bank-receipt', body, { idempotencyKey: key }),
      { id: payment.id, ...body },
      'Đã ghi nhận tiền vào và xếp hàng gửi email cho khách.',
    )
    if (saved) refresh()
  }
  return (
    <Panel title="Đối soát chuyển khoản">
      <Feedback command={command} />
      <p className="text-sm leading-7">
        Chỉ xác nhận sau khi kiểm tra tiền thực nhận trong ngân hàng. QR và ảnh chụp chuyển khoản
        không tự xác minh giao dịch.
      </p>
      <p className="font-semibold">Cần nhận: {formatMoney(payment.amount)}</p>
      <p className="break-all text-sm">Nội dung: {payment.providerReference}</p>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Số tiền thực nhận (VND)"
          name="amount"
          type="number"
          step={1}
          min={1}
          required
          defaultValue={payment.amount}
        />
        <Field label="Mã giao dịch ngân hàng thực nhận" name="evidence" required maxLength={100} />
        <Field label="Thời điểm nhận tiền" name="receivedAt" type="datetime-local" required />
        <label className="flex gap-2 text-sm leading-7">
          <input type="checkbox" required />
          Tôi đã đối chiếu số tiền, tài khoản nhận, nội dung và mã giao dịch trong ngân hàng.
        </label>
        <Submit command={command} label="Xác nhận đã nhận tiền" />
      </form>
    </Panel>
  )
}
