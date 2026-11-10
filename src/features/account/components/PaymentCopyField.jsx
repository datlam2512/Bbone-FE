import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { IconButton } from '@astryxdesign/core/IconButton'
export default function PaymentCopyField({ label, value }) {
  const [notice, setNotice] = useState('')
  async function copy() {
    try {
      await navigator.clipboard.writeText(String(value))
      setNotice('Đã sao chép')
    } catch {
      setNotice('Không sao chép được. Bạn có thể chọn và sao chép nội dung bên dưới.')
    }
  }
  return (
    <section className="min-w-0 space-y-1 border-b border-slate-100 py-3 last:border-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <section className="flex items-start justify-between gap-3">
        <p className="min-w-0 break-all text-sm font-semibold leading-6 text-slate-900">{value}</p>
        <IconButton
          label={'Sao chép ' + label.toLowerCase()}
          tooltip={'Sao chép ' + label.toLowerCase()}
          icon={notice === 'Đã sao chép' ? <Check size={16} /> : <Copy size={16} />}
          variant="ghost"
          size="sm"
          onClick={copy}
        />
      </section>
      <p role="status" className="text-xs text-brand-700">
        {notice}
      </p>
    </section>
  )
}
