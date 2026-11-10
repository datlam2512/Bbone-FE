import { api } from '@/shared/api/client'
import { useCommand } from '@/shared/hooks/use-command'
import { Panel, Field, Feedback, Submit } from '@/shared/components/ui/Workflow'

const policyFields = [
  { name: 'holdMinutes', label: 'Giữ lịch (phút)', min: 1, max: 60 },
  { name: 'paymentMinutes', label: 'Thanh toán trong (phút)', min: 1, max: 1440 },
  { name: 'cancellationCutoffHours', label: 'Huỷ lịch trước giờ khám (giờ)', min: 0, max: 720 },
  { name: 'shippingFee', label: 'Phí giao hàng (VND)', min: 0, max: 1000000000 },
]
export default function RuntimePolicyForm({ policy, onSaved }) {
  const command = useCommand()
  async function save(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = {
      ...Object.fromEntries(
        policyFields.map((field) => [field.name, Number(form.get(field.name))]),
      ),
      reason: form.get('reason'),
      version: policy.concurrencyVersion,
    }
    const saved = await command.run(
      () => api.put('/admin/runtime-policy', body),
      body,
      'Đã cập nhật chính sách cho các giao dịch mới.',
    )
    if (saved) onSaved()
  }
  return (
    <Panel title="Chính sách vận hành">
      <Feedback command={command} />
      <p className="text-sm leading-7 text-slate-600">
        Đơn hàng và lịch đã tạo giữ chính sách đã ghi nhận. Thay đổi dưới đây áp dụng cho giao dịch
        mới.
      </p>
      <form
        key={policy.concurrencyVersion || 'defaults'}
        onSubmit={save}
        className="grid gap-5 sm:grid-cols-2"
      >
        {policyFields.map((field) => (
          <Field
            key={field.name}
            {...field}
            type="number"
            step={1}
            required
            defaultValue={policy[field.name]}
          />
        ))}
        <Field name="reason" label="Lý do thay đổi" type="textarea" required maxLength={1000} />
        <section className="space-y-4">
          <label className="flex gap-2 text-sm leading-6">
            <input type="checkbox" required />
            Tôi đã kiểm tra ảnh hưởng của thay đổi này.
          </label>
          <Submit command={command} label="Lưu chính sách" />
        </section>
      </form>
    </Panel>
  )
}
