import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { CalendarDays, Package, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { signOut } from '@/features/auth/services/session.service'
import PageHeading from '@/shared/components/ui/PageHeading'
import Button from '@/shared/components/ui/Button'

export default function AccountPage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  async function logout() {
    setPending(true)
    let notice
    try {
      await signOut()
    } catch {
      notice = 'Đã thoát trên thiết bị này. Chưa xác nhận được việc thu hồi phiên ở máy chủ.'
    }
    navigate('/dang-nhap', { replace: true, state: { notice } })
  }
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <PageHeading
        eyebrow="Tài khoản của bạn"
        title={'Xin chào, ' + user.name}
        description="Thông tin tài khoản và không gian chăm sóc sức khỏe của bạn."
      >
        <Button variant="secondary" onClick={logout} disabled={pending}>
          <LogOut size={17} />
          Đăng xuất
        </Button>
      </PageHeading>
      <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-card">
        <p className="text-sm text-slate-500">Email</p>
        <p className="mt-2 font-semibold">{user.email}</p>
        <p className="mt-5 text-sm text-slate-500">Vai trò</p>
        <p className="mt-2 font-semibold">{user.role}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ['/tai-khoan/thong-tin', 'Thông tin cá nhân', CalendarDays],
          ['/tai-khoan/dia-chi', 'Địa chỉ nhận hàng', Package],
          ['/tai-khoan/yeu-thich', 'Yêu thích', Package],
          ['/tai-khoan/thong-bao', 'Thông báo', CalendarDays],
          ['/tai-khoan/ho-so', 'Hồ sơ khám bệnh', CalendarDays],
          ['/tai-khoan/kiem-tra', 'Lịch sử kiểm tra', CalendarDays],
          ['/tai-khoan/lich-hen', 'Lịch hẹn của tôi', CalendarDays],
          ['/tai-khoan/don-hang', 'Đơn hàng của tôi', Package],
          ...(user.role === 'Admin' ? [['/quan-tri', 'Không gian quản trị', LayoutDashboard]] : []),
          ...(['Admin', 'Doctor', 'ClinicManager', 'Receptionist'].includes(user.role)
            ? [['/nhan-vien', 'Không gian nhân viên', LayoutDashboard]]
            : []),
        ].map(([to, label, Icon]) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-6 font-semibold shadow-card"
          >
            <Icon size={22} className="text-brand-600" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
