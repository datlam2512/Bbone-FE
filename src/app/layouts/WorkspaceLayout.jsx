import { Link, NavLink, Outlet, useMatches } from 'react-router-dom'
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Users,
  CalendarDays,
  Package,
  Truck,
  BookOpen,
  Home,
} from 'lucide-react'
import Brand from '@/shared/components/Brand'
import RequireSession from '@/app/guards/RequireSession'
import { useUiStore } from '@/shared/stores/ui.store'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { adminRoutes } from '@/features/admin/admin.routes'

const adminLinks = [
  ['/quan-tri/hoan-tien', 'Hoàn tiền', Package],
  ['/quan-tri', 'Tổng quan', LayoutDashboard],
  ['/quan-tri/phong-kham', 'Phòng khám', Home],
  ['/quan-tri/dich-vu', 'Dịch vụ', CalendarDays],
  ['/quan-tri/bao-cao', 'Báo cáo', LayoutDashboard],
  ['/quan-tri/nhat-ky', 'Nhật ký', BookOpen],
  ['/quan-tri/tac-vu', 'Tác vụ', Package],
  ['/quan-tri/cau-hinh', 'Cấu hình', Home],
  ['/quan-tri/nguoi-dung', 'Người dùng', Users],
  ['/quan-tri/san-pham', 'Sản phẩm', Package],
  ['/quan-tri/don-hang', 'Đơn hàng', CalendarDays],
  ['/quan-tri/giao-hang', 'Giao hàng', Truck],
  ['/quan-tri/noi-dung', 'Nội dung', BookOpen],
]
const staffLinks = [
  ['/nhan-vien/noi-dung', 'Duyệt nội dung', BookOpen],
  ['/nhan-vien/khung-gio', 'Khung giờ', CalendarDays],
  ['/nhan-vien', 'Tổng quan', LayoutDashboard],
  ['/nhan-vien/lich-kham', 'Lịch khám', CalendarDays],
  ['/nhan-vien/ho-so', 'Hồ sơ khám', BookOpen],
  ['/nhan-vien/dat-tai-quay', 'Đặt tại quầy', CalendarDays],
  ['/nhan-vien/bao-cao', 'Báo cáo', LayoutDashboard],
  ['/nhan-vien/benh-nhan', 'Bệnh nhân', Users],
]

export default function WorkspaceLayout() {
  const matches = useMatches()
  const workspace = matches.find((match) => match.handle?.workspace)?.handle.workspace
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggle = useUiStore((state) => state.toggleSidebar)
  const userRole = useAuthStore((state) => state.user?.role)
  const links =
    workspace === 'admin'
      ? adminLinks.filter(([to]) => {
          const path = to.replace('/quan-tri', '').replace(/^\//, '')
          const route = adminRoutes.find((entry) => (path ? entry.path === path : entry.index))
          return route?.handle.roles.includes(userRole)
        })
      : staffLinks.filter(([to]) =>
          to.endsWith('/ho-so') || to.endsWith('/noi-dung')
            ? userRole === 'Doctor'
            : to.endsWith('/bao-cao') || to.endsWith('/khung-gio')
              ? ['Admin', 'ClinicManager'].includes(userRole)
              : true,
        )
  return (
    <RequireSession>
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex',
            collapsed ? 'w-20' : 'w-64',
          )}
        >
          <div className="mb-10 pt-2">
            <Brand compact={collapsed} />
          </div>
          <nav aria-label="Điều hướng không gian làm việc" className="space-y-2">
            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/quan-tri' || to === '/nhan-vien'}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-brand-50',
                  )
                }
              >
                <Icon size={19} />
                {!collapsed && label}
              </NavLink>
            ))}
          </nav>
          <Link to="/" className="mt-auto flex items-center gap-3 px-3 py-4 text-sm text-slate-500">
            <Home size={19} />
            {!collapsed && 'Về website'}
          </Link>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex min-h-20 flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-5">
            <button
              type="button"
              onClick={toggle}
              className="hidden rounded-lg p-2 text-slate-500 md:block"
              aria-label="Thu gọn hoặc mở rộng thanh bên"
            >
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <p className="font-semibold">
              {workspace === 'admin' ? 'BBONE Quản trị' : 'BBONE Nhân viên'}
            </p>
            <Link to="/" className="ml-auto text-sm text-brand-600 md:hidden">
              Website
            </Link>
            <nav
              className="flex w-full gap-4 overflow-x-auto pb-4 text-sm md:hidden"
              aria-label="Điều hướng di động"
            >
              {links.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/quan-tri' || to === '/nhan-vien'}
                  className="shrink-0 py-1 text-brand-600"
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </header>
          <Outlet />
        </div>
      </div>
    </RequireSession>
  )
}
