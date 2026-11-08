import { Link, useRouteError } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'

export default function RouteErrorPage() {
  const error = useRouteError()
  const notFound = error?.status === 404
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <TriangleAlert size={40} className="mb-5 text-brand-600" />
      <h1 className="text-3xl font-bold">
        {notFound ? 'Không tìm thấy trang' : 'Trang chưa tải được'}
      </h1>
      <p className="mt-4 leading-7 text-slate-500">Bạn có thể trở về trang chủ và thử lại.</p>
      <Link to="/" className="mt-8 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white">
        Về trang chủ
      </Link>
    </main>
  )
}
