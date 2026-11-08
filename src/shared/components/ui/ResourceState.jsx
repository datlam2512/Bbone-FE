import { Inbox, RotateCcw } from 'lucide-react'
import Button from './Button'

export default function ResourceState({ loading, error, retry, empty, children }) {
  if (loading)
    return (
      <div className="grid gap-5 sm:grid-cols-3" role="status" aria-label="Đang tải">
        {[1, 2, 3].map((id) => (
          <div
            key={id}
            className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-white motion-reduce:animate-none"
          />
        ))}
      </div>
    )
  if (error)
    return (
      <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <p className="font-semibold">Chưa tải được nội dung</p>
        <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        {error.correlationId && (
          <p className="mt-2 text-xs text-slate-500">Mã hỗ trợ: {error.correlationId}</p>
        )}
        <Button variant="secondary" onClick={retry} className="mt-4">
          <RotateCcw size={16} />
          Thử lại
        </Button>
      </div>
    )
  if (empty)
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <Inbox className="mx-auto mb-4 text-brand-500" size={32} />
        <p className="font-semibold">Chưa có nội dung được công bố</p>
        <p className="mt-2 text-sm text-slate-500">
          Nội dung sẽ xuất hiện tại đây khi được cập nhật.
        </p>
      </div>
    )
  return children
}
