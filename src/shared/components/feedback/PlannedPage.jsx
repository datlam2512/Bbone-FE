import { Link, useMatches } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import PageHeading from '@/shared/components/ui/PageHeading'

export default function PlannedPage() {
  const matches = useMatches()
  const metadata = [...matches].reverse().find((match) => match.handle?.title)?.handle
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <PageHeading
        eyebrow="BBONE"
        title={metadata?.title || 'Trang đang được chuẩn bị'}
        description={metadata?.description}
      />
      <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-card sm:p-16">
        <Sparkles size={36} className="mx-auto text-brand-500" />
        <h2 className="mt-5 text-xl font-semibold">Trang đang được chuẩn bị</h2>
        <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
          Chức năng này sẽ được cập nhật trong giai đoạn tiếp theo.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-600"
        >
          <ArrowLeft size={16} />
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
