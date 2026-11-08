import SiteFooter from '@/shared/components/SiteFooter'
import { Menu, X, ArrowUpRight } from 'lucide-react'
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
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-brand-600 p-3 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Bỏ qua điều hướng
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 w-full max-w-[90rem] items-center justify-between gap-6 px-5 lg:px-8 2xl:px-10">
          <Brand />
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-6 xl:flex">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'border-b-2 py-2 text-sm font-medium transition-colors hover:text-brand-700',
                    isActive
                      ? 'border-brand-700 text-brand-700'
                      : 'border-transparent text-slate-600',
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
              className="hidden items-center gap-2 rounded-md bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 sm:inline-flex"
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
      <main id="main-content" key={location.pathname} className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
