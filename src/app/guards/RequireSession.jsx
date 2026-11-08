import { Navigate, Outlet, useLocation, useMatches, Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/features/auth/stores/auth.store'

export default function RequireSession({ children }) {
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const matches = useMatches()
  if (!user)
    return (
      <Navigate to="/dang-nhap" state={{ from: location.pathname + location.search }} replace />
    )
  const required = [...matches].reverse().find((match) => match.handle?.roles)?.handle.roles
  if (required && !required.includes(user.role))
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <ShieldAlert className="mx-auto mb-5 text-brand-600" size={40} />
        <h1 className="text-2xl font-bold">Bạn chưa có quyền truy cập</h1>
        <p className="mt-4 text-slate-500">Vui lòng dùng tài khoản có vai trò phù hợp.</p>
        <Link to="/" className="mt-7 inline-block font-semibold text-brand-600">
          Về trang chủ
        </Link>
      </main>
    )
  return children || <Outlet />
}
