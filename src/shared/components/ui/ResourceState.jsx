import { useEffect, useState } from 'react'
import { Inbox, RotateCcw } from 'lucide-react'
import Button from './Button'

function LoadingState() {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section role="status" aria-live="polite" aria-label="Đang tải nội dung">
      <p className="mb-4 text-sm text-slate-600">
        {slow ? 'Máy chủ đang khởi động. Trang sẽ hiện ngay khi tải xong.' : 'Đang tải dữ liệu...'}
      </p>
      <section className="grid gap-5 sm:grid-cols-3">
        {[1, 2, 3].map((id) => (
          <section
            key={id}
            className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-white motion-reduce:animate-none"
          />
        ))}
      </section>
    </section>
  )
}

export default function ResourceState({
  loading,
  error,
  retry,
  empty,
  emptyTitle = 'Chưa có nội dung được công bố',
  emptyDescription = 'Nội dung sẽ xuất hiện tại đây khi được cập nhật.',
  children,
}) {
  if (loading) return <LoadingState />
  if (error)
    return (
      <section role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
        <p className="font-semibold">Chưa tải được nội dung</p>
        <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        {error.correlationId && (
          <p className="mt-2 text-xs text-slate-500">Mã hỗ trợ: {error.correlationId}</p>
        )}
        <Button variant="secondary" onClick={retry} className="mt-4">
          <RotateCcw size={16} />
          Thử lại
        </Button>
      </section>
    )
  if (empty)
    return (
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <Inbox className="mx-auto mb-4 text-brand-500" size={32} />
        <p className="font-semibold">{emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
      </section>
    )
  return children
}
