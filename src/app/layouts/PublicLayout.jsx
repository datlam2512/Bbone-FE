import { Menu, X, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import Brand from '@/shared/components/Brand'
import { cn } from '@/shared/lib/cn'
import { useUiStore } from '@/shared/stores/ui.store'
import { useAuthStore } from '@/features/auth/stores/auth.store'

const links = [
  ['/', 'Trang chủ'],
  ['/kiem-tra-suc-khoe', 'Kiểm tra sức khỏe'],
  ['/phong-kham', 'Phòng khám'],
  ['/san-pham', 'Sản phẩm'],
  ['/kien-thuc', 'Kiến thức'],
]

export default function PublicLayout() {
  const open = useUiStore((state) => state.mobileMenuOpen)
  const setOpen = useUiStore((state) => state.setMobileMenuOpen)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  // Selecting a link in the expanded navigation closes that navigation.
  const closeMenu = () => setOpen(false)
  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-brand-600 p-3 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Bỏ qua điều hướng
      </a>
      <div className="border-b border-brand-100 bg-brand-50 px-5 py-2 text-center text-xs text-brand-700">
        Đồng hành cùng bạn trên hành trình chăm sóc xương khớp
      </div>
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-lg">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
          <Brand />
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-6 xl:flex">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'py-2 text-sm font-medium transition hover:text-brand-600',
                    isActive ? 'text-brand-600' : 'text-slate-600',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to={user ? '/tai-khoan' : '/dang-nhap'}
              className="hidden text-sm font-semibold text-ink sm:block"
            >
              {user ? user.name : 'Đăng nhập'}
            </Link>
            <Link
              to="/dat-lich"
              className="hidden items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 sm:inline-flex"
            >
              Đặt lịch <ArrowUpRight size={16} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className="rounded-xl p-2.5 text-ink xl:hidden"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            aria-label="Điều hướng di động"
            className="border-t border-slate-100 bg-white px-5 py-4 xl:hidden"
          >
            {[...links, [user ? '/tai-khoan' : '/dang-nhap', user ? 'Tài khoản' : 'Đăng nhập']].map(
              ([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-4 py-3 text-sm',
                      isActive ? 'bg-brand-50 font-semibold text-brand-600' : 'text-slate-600',
                    )
                  }
                >
                  {label}
                </NavLink>
              ),
            )}
          </nav>
        )}
      </header>
      <main id="main-content" key={location.pathname}>
        <Outlet />
      </main>
      <footer className="mt-20 border-t border-slate-200/70 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-9 sm:flex-row lg:px-8">
          <div>
            <Brand />
            <p className="mt-3 text-sm text-slate-500">Chăm sóc xương khớp, đồng hành mỗi ngày.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={18} className="text-brand-600" />
            Thông tin sức khỏe cần được chuyên môn xác nhận.
          </div>
        </div>
      </footer>
    </div>
  )
}
