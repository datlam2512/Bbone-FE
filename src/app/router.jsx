import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import PublicLayout from './layouts/PublicLayout'
import WorkspaceLayout from './layouts/WorkspaceLayout'
import RequireSession from './guards/RequireSession'
import RouteErrorPage from '@/shared/components/feedback/RouteErrorPage'
import AppLoading from '@/shared/components/feedback/AppLoading'
import PlannedPage from '@/shared/components/feedback/PlannedPage'
import { appointmentRoutes } from '@/features/appointments/appointments.routes'
import { screeningRoutes } from '@/features/screening/screening.routes'
import { adminRoles, adminRoutes } from '@/features/admin/admin.routes'
import { staffRoles, staffRoutes } from '@/features/staff/staff.routes'

const lazyPage = (load) => async () => ({ Component: (await load()).default })
const planned = (routes) => routes.map((route) => ({ ...route, Component: PlannedPage }))

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    HydrateFallback: AppLoading,
    children: [
      {
        Component: PublicLayout,
        children: [
          { index: true, lazy: lazyPage(() => import('@/features/home/pages/HomePage')) },
          { path: 'dang-nhap', lazy: lazyPage(() => import('@/features/auth/pages/LoginPage')) },
          {
            path: 'san-pham',
            lazy: lazyPage(() => import('@/features/catalog/pages/ProductsPage')),
          },
          {
            path: 'phong-kham',
            lazy: lazyPage(() => import('@/features/clinics/pages/ClinicsPage')),
          },
          {
            path: 'kien-thuc',
            lazy: lazyPage(() => import('@/features/knowledge/pages/KnowledgePage')),
          },
          ...planned([...screeningRoutes, ...appointmentRoutes]),
          { path: 'gio-hang', Component: PlannedPage, handle: { title: 'Giỏ hàng của bạn' } },
          {
            path: 'tai-khoan',
            Component: RequireSession,
            children: [
              { index: true, lazy: lazyPage(() => import('@/features/account/pages/AccountPage')) },
              ...planned([
                { path: 'lich-hen', handle: { title: 'Lịch hẹn của tôi' } },
                { path: 'don-hang', handle: { title: 'Đơn hàng của tôi' } },
              ]),
            ],
          },
        ],
      },
      {
        path: 'quan-tri',
        Component: WorkspaceLayout,
        handle: { workspace: 'admin', roles: adminRoles },
        children: planned(adminRoutes),
      },
      {
        path: 'nhan-vien',
        Component: WorkspaceLayout,
        handle: { workspace: 'staff', roles: staffRoles },
        children: planned(staffRoutes),
      },
    ],
  },
])
