import { useRef, useState } from 'react'
import { Link, NavLink, Outlet, useMatches, useNavigate } from 'react-router-dom'
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
  Menu,
  X,
  LogOut,
  RotateCcw,
  Wallet,
  Boxes,
} from 'lucide-react'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { IconButton } from '@astryxdesign/core/IconButton'
import Brand from '@/shared/components/Brand'
import RequireSession from '@/app/guards/RequireSession'
import { useUiStore } from '@/shared/stores/ui.store'
import { cn } from '@/shared/lib/cn'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import { signOut } from '@/features/auth/services/session.service'
import { adminRoutes } from '@/features/admin/admin.routes'
const adminLinks = [
  ['/quan-tri', 'Tổng quan', LayoutDashboard],
  ['/quan-tri/phong-kham', 'Phòng khám', Home],
  ['/quan-tri/dich-vu', 'Dịch vụ', CalendarDays],
  ['/quan-tri/bao-cao', 'Báo cáo', LayoutDashboard],
  ['/quan-tri/nhat-ky', 'Nhật ký', BookOpen],
  ['/quan-tri/tac-vu', 'Tác vụ', Package],
  ['/quan-tri/cau-hinh', 'Cấu hình', Home],
  ['/quan-tri/nguoi-dung', 'Người dùng', Users],
  ['/quan-tri/san-pham', 'Sản phẩm', Package],
  ['/quan-tri/khuyen-mai', 'Mã giảm giá', Package],
  ['/quan-tri/don-hang', 'Đơn hàng', CalendarDays],
  ['/quan-tri/giao-hang', 'Giao hàng', Truck],
  ['/quan-tri/tra-hang', 'Trả hàng', RotateCcw],
  ['/quan-tri/hoan-tien', 'Hoàn tiền', Wallet],
  ['/quan-tri/kho-hang', 'Kho theo lô', Boxes],
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
  const matches = useMatches(),
    navigate = useNavigate(),
    drawer = useRef(null)
  const [leaving, setLeaving] = useState(false)
  const workspace = matches.find((match) => match.handle?.workspace)?.handle.workspace
  const collapsed = useUiStore((state) => state.sidebarCollapsed),
    toggle = useUiStore((state) => state.toggleSidebar)
  const user = useAuthStore((state) => state.user),
    role = user?.role
  const title = [...matches].reverse().find((match) => match.handle?.title)?.handle.title
  const links =
    workspace === 'admin'
      ? adminLinks.filter(([to]) => {
          const path = to.replace('/quan-tri', '').replace(/^\//, '')
          return adminRoutes
            .find((entry) => (path ? entry.path === path : entry.index))
            ?.handle.roles.includes(role)
        })
      : staffLinks.filter(([to]) =>
          to.endsWith('/ho-so') || to.endsWith('/noi-dung')
            ? role === 'Doctor'
            : to.endsWith('/bao-cao') || to.endsWith('/khung-gio')
              ? ['Admin', 'ClinicManager'].includes(role)
              : true,
        )
  async function logout() {
    setLeaving(true)
    try {
      await signOut()
    } catch {
      /* Local session is cleared even if the server is unavailable. */
    } finally {
      navigate('/dang-nhap', { replace: true })
      setLeaving(false)
    }
  }
  function navigation(compact = false) {
    return (
      <nav
        aria-label="Điều hướng quản trị"
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto py-3"
      >
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/quan-tri' || to === '/nhan-vien'}
            onClick={() => drawer.current?.close()}
            title={compact ? label : undefined}
            aria-label={compact ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <Icon size={19} className="shrink-0" />
            {!compact && label}
          </NavLink>
        ))}
      </nav>
    )
  }
  return (
    <RequireSession>
      <HStack gap={0} className="min-h-screen bg-slate-50 text-slate-900">
        <VStack
          as="aside"
          gap={0}
          className={cn(
            'sticky top-0 hidden h-screen shrink-0 border-r border-slate-200 bg-white px-4 md:flex',
            collapsed ? 'w-20' : 'w-64',
          )}
        >
          <section className="flex h-20 shrink-0 items-center border-b border-slate-100">
            <Brand compact={collapsed} />
          </section>
          {!collapsed && (
            <p className="pt-5 pb-1 text-xs font-semibold tracking-widest text-slate-400">
              {workspace === 'admin' ? 'QUẢN TRỊ & VẬN HÀNH' : 'KHÔNG GIAN NHÂN VIÊN'}
            </p>
          )}
          {navigation(collapsed)}
          <Link
            to="/"
            aria-label="Về website"
            className="flex shrink-0 items-center gap-3 border-t border-slate-100 py-5 text-sm font-medium text-slate-500"
          >
            <Home size={19} />
            {!collapsed && 'Về website'}
          </Link>
        </VStack>
        <VStack gap={0} className="min-w-0 flex-1">
          <header className="flex min-h-20 items-center gap-3 border-b border-slate-200 bg-white px-5 lg:px-8">
            <section className="hidden md:block">
              <IconButton
                icon={collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                label="Thu gọn hoặc mở rộng menu"
                tooltip="Thu gọn hoặc mở rộng menu"
                onClick={toggle}
              />
            </section>
            <section className="md:hidden">
              <IconButton
                icon={<Menu size={20} />}
                label="Mở menu quản trị"
                tooltip="Mở menu quản trị"
                onClick={() => drawer.current?.showModal()}
              />
            </section>
            <VStack gap={1} className="min-w-0">
              <p className="text-xs text-slate-500">
                {workspace === 'admin' ? 'BBONE / Quản trị' : 'BBONE / Nhân viên'}
              </p>
              <p className="truncate text-sm font-semibold">{title}</p>
            </VStack>
            <HStack gap={3} vAlign="center" className="ml-auto">
              <section className="hidden text-right sm:block">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </section>
              <p
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700"
                aria-hidden="true"
              >
                {(user?.name || 'B').slice(0, 1).toUpperCase()}
              </p>
              <IconButton
                label="Đăng xuất"
                tooltip="Đăng xuất"
                icon={<LogOut size={18} />}
                isDisabled={leaving}
                onClick={logout}
              />
            </HStack>
          </header>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </VStack>
        <dialog
          ref={drawer}
          aria-labelledby="workspace-menu-title"
          className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-80 max-w-full border-r border-slate-200 bg-white p-5 text-slate-900 backdrop:bg-slate-900/40"
        >
          <VStack gap={0} className="h-full">
            <HStack gap={3} hAlign="between" vAlign="center">
              <h2 id="workspace-menu-title" className="font-bold">
                BBONE · Menu
              </h2>
              <IconButton
                label="Đóng menu"
                tooltip="Đóng menu"
                icon={<X size={20} />}
                onClick={() => drawer.current?.close()}
              />
            </HStack>
            {navigation()}
            <Link
              to="/"
              className="border-t border-slate-100 py-4 text-sm font-semibold text-brand-700"
            >
              Về website →
            </Link>
          </VStack>
        </dialog>
      </HStack>
    </RequireSession>
  )
}
